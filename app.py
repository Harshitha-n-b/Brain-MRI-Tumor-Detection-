import os
import time
import json
import datetime
import sqlite3
import jwt
from functools import wraps
from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import cv2
import numpy as np
import tensorflow as tf
from PIL import Image

# Import ReportLab modules for clinical PDF reports
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

# Configurations
DATABASE = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'database.db')
UPLOAD_FOLDER = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'uploads')
REPORTS_FOLDER = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'reports')
SECRET_KEY = 'medvision_ai_super_secret_jwt_key_clinical_assistant'

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['REPORTS_FOLDER'] = REPORTS_FOLDER

# Create folders if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(REPORTS_FOLDER, exist_ok=True)
os.makedirs('static', exist_ok=True)
os.makedirs('templates', exist_ok=True)

# ----------------- DB SETUP -----------------
def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    # Predictions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            image_path TEXT NOT NULL,
            predicted_class TEXT NOT NULL,
            confidence REAL NOT NULL,
            probabilities TEXT NOT NULL,
            inference_time REAL NOT NULL,
            explanation TEXT NOT NULL,
            report_path TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# ----------------- MODEL LOADER -----------------
print("Loading Brain MRI EfficientNetB0 Keras model...")
try:
    # Load model once on startup
    MODEL_PATH = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'Brain_MRI_EfficientNetB0.keras')
    model = tf.keras.models.load_model(MODEL_PATH)
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {str(e)}")
    model = None

# Class labels mapped alphabetically (common for figshare/Sartaj/Nickparvar datasets)
CLASS_LABELS = ['Glioma', 'Meningioma', 'No Tumor', 'Pituitary']

EXPLANATIONS = {
    'Glioma': (
        'A Glioma is a type of tumor that originates in the glial cells (astrocytes, oligodendrocytes, or ependymal cells) '
        'that surround and support neurons in the brain. Gliomas account for approximately 30% of all brain and central nervous '
        'system tumors, and 80% of all malignant brain tumors. Depending on their clinical behavior, they range from low-grade '
        '(Grade I/II, slow-growing) to high-grade (Grade III/IV, highly infiltrative and aggressive, such as Glioblastoma Multiforme). '
        'Common diagnostic assessments include contrast-enhanced MRI and stereotactic biopsy. Clinical management plans typically '
        'combine maximal safe surgical resection, radiation therapy, and chemotherapy (e.g., temozolomide).'
    ),
    'Meningioma': (
        'A Meningioma is a primary central nervous system tumor that arises from the meninges—the three layers of protective '
        'membranes covering the brain and spinal cord. It is the most frequently diagnosed primary brain tumor in adults, '
        'constituting about 37% of all primary brain tumors. The vast majority of meningiomas (around 80-90%) are classified '
        'as benign (WHO Grade I) and grow slowly. However, because of their slow development, they can reach significant size '
        'before presenting symptoms such as headaches, seizures, or focal neurological deficits due to mass effect. Treatment '
        'ranges from active monitoring ("watchful waiting") for small, asymptomatic tumors, to neurosurgical resection and radiation '
        'therapy for larger or progressive lesions.'
    ),
    'Pituitary': (
        'A Pituitary tumor is an abnormal growth that develops in the pituitary gland, a small endocrine organ located in the sella '
        'turcica at the base of the brain. The pituitary gland regulates vital hormonal processes throughout the body. Most '
        'pituitary tumors are benign adenomas (representing about 10-15% of all intracranial neoplasms) and do not spread. '
        'They are categorized into functioning (hormone-secreting, leading to conditions like Acromegaly or Cushing\'s disease) '
        'and non-functioning adenomas. Symptoms arise either from hormonal imbalances or from mechanical compression of adjacent '
        'neurological structures, such as the optic chiasm, which can cause bitemporal hemianopsia (loss of peripheral vision). '
        'Management often involves endocrinological medical therapy, transsphenoidal endoscopic surgery, or stereotactic radiosurgery.'
    ),
    'No Tumor': (
        'The neural network model detected no structural indicators of glioma, meningioma, or pituitary tumors in the uploaded '
        'magnetic resonance imaging (MRI) scan. Brain parenchymal structures, ventricular spaces, and extra-axial margins '
        'show patterns consistent with normal radiological appearances. While this AI prediction is highly confident, it is critical '
        'to recognize that this analysis is designed solely for educational screening support and preliminary triage. A comprehensive '
        'diagnostic review by a board-certified radiologist or neuroradiologist remains the standard of care to rule out subtle pathology, '
        'micro-lesions, or other neurological conditions.'
    )
}

# ----------------- JWT HELPERS -----------------
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # Check authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Token format is invalid!'}), 401
        
        if not token:
            return jsonify({'message': 'Authorization token is missing!'}), 401
        
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            conn = get_db_connection()
            user = conn.execute('SELECT * FROM users WHERE id = ?', (data['user_id'],)).fetchone()
            conn.close()
            if not user:
                return jsonify({'message': 'User not found!'}), 401
            current_user = dict(user)
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token!'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

# ----------------- AUTH ENDPOINTS -----------------
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({'message': 'Missing email, password, or name'}), 400
        
    email = data['email'].strip().lower()
    password = data['password']
    name = data['name'].strip()
    
    conn = get_db_connection()
    user_exists = conn.execute('SELECT id FROM users WHERE email = ?', (email,)).fetchone()
    if user_exists:
        conn.close()
        return jsonify({'message': 'User with this email already exists'}), 409
        
    password_hash = generate_password_hash(password)
    try:
        conn.execute('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
                     (email, password_hash, name))
        conn.commit()
    except Exception as e:
        conn.close()
        return jsonify({'message': f'Error creating user: {str(e)}'}), 500
        
    # Get user to create token
    user = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
    conn.close()
    
    token = jwt.encode({
        'user_id': user['id'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }, SECRET_KEY, algorithm="HS256")
    
    return jsonify({
        'token': token,
        'user': {
            'id': user['id'],
            'email': user['email'],
            'name': user['name']
        }
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing email or password'}), 400
        
    email = data['email'].strip().lower()
    password = data['password']
    
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
    conn.close()
    
    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'message': 'Invalid email or password'}), 401
        
    token = jwt.encode({
        'user_id': user['id'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }, SECRET_KEY, algorithm="HS256")
    
    return jsonify({
        'token': token,
        'user': {
            'id': user['id'],
            'email': user['email'],
            'name': user['name']
        }
    }), 200

@app.route('/api/auth/profile', methods=['GET'])
@token_required
def profile(current_user):
    return jsonify({
        'user': {
            'id': current_user['id'],
            'email': current_user['email'],
            'name': current_user['name']
        }
    }), 200

# ----------------- UTILS FOR PREPROCESSING -----------------
def preprocess_image(file_path):
    # Read the image
    img = cv2.imread(file_path)
    if img is None:
        raise ValueError("Failed to load image. Invalid image file.")
    
    # EfficientNetB0 expects RGB format (OpenCV reads in BGR)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # Resize to 224x224
    img_resized = cv2.resize(img, (224, 224))
    
    # Convert to float32. EfficientNet in Keras has built-in normalization
    # but we feed values in [0, 255] as verified during model summary checks.
    img_array = np.array(img_resized, dtype=np.float32)
    
    # Add batch dimension (1, 224, 224, 3)
    img_batch = np.expand_dims(img_array, axis=0)
    
    return img_batch

# ----------------- CLINICAL PREDICT ENDPOINT -----------------
@app.route('/api/predict', methods=['POST'])
@token_required
def predict(current_user):
    if 'image' not in request.files:
        return jsonify({'message': 'No image file uploaded'}), 400
        
    file = request.files['image']
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400
        
    if not model:
        return jsonify({'message': 'AI inference model is currently unavailable on server.'}), 503
        
    # Save file
    filename = secure_filename(f"user_{current_user['id']}_{int(time.time())}_{file.filename}")
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    
    try:
        # Preprocess
        preprocessed_img = preprocess_image(filepath)
        
        # Predict & Measure Inference Time
        start_time = time.time()
        preds = model.predict(preprocessed_img)
        end_time = time.time()
        inference_time_ms = round((end_time - start_time) * 1000, 2)
        
        # Extract results
        probabilities = preds[0].tolist() # List of 4 floats
        pred_idx = int(np.argmax(probabilities))
        predicted_class = CLASS_LABELS[pred_idx]
        confidence = round(probabilities[pred_idx] * 100, 2)
        
        explanation = EXPLANATIONS[predicted_class]
        
        # Format probabilities for response
        prob_dict = {CLASS_LABELS[i]: round(probabilities[i] * 100, 2) for i in range(len(CLASS_LABELS))}
        
        # Insert into SQLite Database
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO predictions 
            (user_id, image_path, predicted_class, confidence, probabilities, inference_time, explanation)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (current_user['id'], filename, predicted_class, confidence, json.dumps(prob_dict), inference_time_ms, explanation))
        prediction_id = cursor.lastrowid
        conn.commit()
        
        # Generate PDF report immediately
        pdf_filename = f"report_{prediction_id}.pdf"
        pdf_path = os.path.join(app.config['REPORTS_FOLDER'], pdf_filename)
        
        generate_pdf_report(pdf_path, prediction_id, current_user, filename, predicted_class, confidence, prob_dict, inference_time_ms, explanation)
        
        # Update prediction with report path
        cursor.execute('UPDATE predictions SET report_path = ? WHERE id = ?', (pdf_filename, prediction_id))
        conn.commit()
        conn.close()
        
        return jsonify({
            'prediction_id': prediction_id,
            'predicted_class': predicted_class,
            'confidence': confidence,
            'probabilities': prob_dict,
            'inference_time_ms': inference_time_ms,
            'explanation': explanation,
            'image_url': f'/api/uploads/{filename}',
            'report_url': f'/api/reports/{prediction_id}/pdf',
            'created_at': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }), 200
        
    except Exception as e:
        # Cleanup uploaded file if prediction fails
        if os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({'message': f'Prediction execution failed: {str(e)}'}), 500

# ----------------- STATIC SERVING -----------------
@app.route('/api/uploads/<path:filename>')
def serve_upload(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/reports/<int:prediction_id>/pdf')
@token_required
def serve_report(current_user, prediction_id):
    conn = get_db_connection()
    pred = conn.execute('SELECT * FROM predictions WHERE id = ? AND user_id = ?', (prediction_id, current_user['id'])).fetchone()
    conn.close()
    
    if not pred:
        return jsonify({'message': 'Report not found or access denied.'}), 404
        
    report_filename = pred['report_path']
    if not report_filename or not os.path.exists(os.path.join(app.config['REPORTS_FOLDER'], report_filename)):
        return jsonify({'message': 'PDF Report file does not exist on disk.'}), 404
        
    return send_from_directory(app.config['REPORTS_FOLDER'], report_filename, mimetype='application/pdf')

# ----------------- HISTORY ENDPOINTS -----------------
@app.route('/api/history', methods=['GET'])
@token_required
def get_history(current_user):
    conn = get_db_connection()
    rows = conn.execute('''
        SELECT id, image_path, predicted_class, confidence, probabilities, inference_time, created_at, report_path
        FROM predictions 
        WHERE user_id = ? 
        ORDER BY created_at DESC
    ''', (current_user['id'],)).fetchall()
    conn.close()
    
    history_list = []
    for row in rows:
        history_list.append({
            'id': row['id'],
            'image_url': f'/api/uploads/{row["image_path"]}',
            'predicted_class': row['predicted_class'],
            'confidence': row['confidence'],
            'probabilities': json.loads(row['probabilities']),
            'inference_time_ms': row['inference_time'],
            'created_at': row['created_at'],
            'report_url': f'/api/reports/{row["id"]}/pdf' if row['report_path'] else None
        })
        
    return jsonify({'history': history_list}), 200

# ----------------- DASHBOARD ENDPOINTS -----------------
@app.route('/api/dashboard/stats', methods=['GET'])
@token_required
def get_stats(current_user):
    conn = get_db_connection()
    
    # Total predictions
    total = conn.execute('SELECT COUNT(*) FROM predictions WHERE user_id = ?', (current_user['id'],)).fetchone()[0]
    
    # Class counts
    class_counts = {
        'Glioma': conn.execute('SELECT COUNT(*) FROM predictions WHERE user_id = ? AND predicted_class = "Glioma"', (current_user['id'],)).fetchone()[0],
        'Meningioma': conn.execute('SELECT COUNT(*) FROM predictions WHERE user_id = ? AND predicted_class = "Meningioma"', (current_user['id'],)).fetchone()[0],
        'Pituitary': conn.execute('SELECT COUNT(*) FROM predictions WHERE user_id = ? AND predicted_class = "Pituitary"', (current_user['id'],)).fetchone()[0],
        'No Tumor': conn.execute('SELECT COUNT(*) FROM predictions WHERE user_id = ? AND predicted_class = "No Tumor"', (current_user['id'],)).fetchone()[0],
    }
    
    # Average confidence
    avg_confidence = conn.execute('SELECT AVG(confidence) FROM predictions WHERE user_id = ?', (current_user['id'],)).fetchone()[0]
    avg_confidence = round(avg_confidence, 2) if avg_confidence else 0.0
    
    # Average inference time
    avg_time = conn.execute('SELECT AVG(inference_time) FROM predictions WHERE user_id = ?', (current_user['id'],)).fetchone()[0]
    avg_time = round(avg_time, 2) if avg_time else 0.0
    
    # Recent scans (limit 5)
    recent_rows = conn.execute('''
        SELECT id, predicted_class, confidence, created_at 
        FROM predictions 
        WHERE user_id = ? 
        ORDER BY created_at DESC LIMIT 5
    ''', (current_user['id'],)).fetchall()
    
    recent = []
    for r in recent_rows:
        recent.append({
            'id': r['id'],
            'predicted_class': r['predicted_class'],
            'confidence': r['confidence'],
            'created_at': r['created_at']
        })
        
    conn.close()
    
    return jsonify({
        'total_scans': total,
        'class_counts': class_counts,
        'average_confidence': avg_confidence,
        'average_inference_time_ms': avg_time,
        'recent_scans': recent
    }), 200

# ----------------- PDF REPORT GENERATOR -----------------
def generate_pdf_report(pdf_path, prediction_id, user, image_filename, predicted_class, confidence, prob_dict, inference_time, explanation):
    # Setup document
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        rightMargin=40, leftMargin=40,
        topMargin=40, bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    # Define custom medical theme color styles
    primary_color = colors.HexColor("#0f172a")   # Slate 900
    accent_color = colors.HexColor("#0284c7")    # Sky 600
    danger_color = colors.HexColor("#e11d48")    # Rose 600
    success_color = colors.HexColor("#059669")   # Emerald 600
    neutral_light = colors.HexColor("#f8fafc")   # Slate 50
    border_color = colors.HexColor("#cbd5e1")    # Slate 300
    
    # Custom Paragraph Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        textColor=accent_color,
        spaceAfter=15
    )
    
    section_title = ParagraphStyle(
        'SectionTitle',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        textColor=primary_color,
        spaceAfter=8,
        spaceBefore=15
    )
    
    body_style = ParagraphStyle(
        'ReportBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10.5,
        leading=15,
        textColor=colors.HexColor("#334155")
    )
    
    meta_label = ParagraphStyle(
        'MetaLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        textColor=primary_color
    )
    
    meta_val = ParagraphStyle(
        'MetaVal',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        textColor=colors.HexColor("#475569")
    )
    
    result_style = ParagraphStyle(
        'ResultVal',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        textColor=danger_color if predicted_class != 'No Tumor' else success_color
    )
    
    disclaimer_style = ParagraphStyle(
        'DisclaimerText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#64748b")
    )
    
    story = []
    
    # 1. Header Banner Table
    header_data = [
        [Paragraph("MEDVISION AI CLINICAL ASSISTANT", title_style), 
         Paragraph("<b>REPORT ID:</b> MV-{:06d}<br/><b>DATE:</b> {}".format(prediction_id, datetime.datetime.now().strftime('%Y-%m-%d %H:%M')), meta_val)]
    ]
    header_table = Table(header_data, colWidths=[4.0 * inch, 3.0 * inch])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 10))
    
    # Draw a line divider
    divider = Table([[""]], colWidths=[7.0 * inch], rowHeights=[2])
    divider.setStyle(TableStyle([
        ('LINEBELOW', (0, 0), (-1, -1), 2, accent_color),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(divider)
    story.append(Spacer(1, 15))
    
    # 2. Patient / Report Metadata Block
    meta_info_data = [
        [Paragraph("Patient Name:", meta_label), Paragraph(user['name'], meta_val), 
         Paragraph("Scanner Resolution:", meta_label), Paragraph("224 x 224 px (Resized)", meta_val)],
        [Paragraph("Patient Email:", meta_label), Paragraph(user['email'], meta_val), 
         Paragraph("Inference Engine:", meta_label), Paragraph("EfficientNetB0 (ImageNet)", meta_val)],
        [Paragraph("Clinical System:", meta_label), Paragraph("MedVision AI v1.0.0", meta_val), 
         Paragraph("Processing Speed:", meta_label), Paragraph(f"{inference_time} ms", meta_val)]
    ]
    meta_table = Table(meta_info_data, colWidths=[1.25 * inch, 2.25 * inch, 1.5 * inch, 2.0 * inch])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), neutral_light),
        ('BOX', (0, 0), (-1, -1), 0.5, border_color),
        ('INNERGRID', (0, 0), (-1, -1), 0.25, border_color),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 20))
    
    # 3. Diagnostic Results Block with Image
    story.append(Paragraph("SCAN ANALYSIS & COMPUTER-AIDED DETECTION (CAD)", section_title))
    
    # Verify image exists and size it
    img_full_path = os.path.join(app.config['UPLOAD_FOLDER'], image_filename)
    if os.path.exists(img_full_path):
        try:
            # We scale it to 1.8 x 1.8 inches
            scan_img = RLImage(img_full_path, width=1.8 * inch, height=1.8 * inch)
        except Exception:
            scan_img = Paragraph("[MRI Scan Image unavailable for render]", meta_label)
    else:
        scan_img = Paragraph("[MRI Scan Image File not found]", meta_label)
        
    # Compile class probabilities as list
    prob_lines = []
    for cls, val in prob_dict.items():
        # Draw a little text-based progress bar
        num_blocks = int(val / 10)
        bar_str = "█" * num_blocks + "░" * (10 - num_blocks)
        prob_lines.append(f"<b>{cls}:</b> {val}% &nbsp; <font face='Courier' size='8' color='{accent_color.hexval()}'>{bar_str}</font>")
        
    prob_html = "<br/>".join(prob_lines)
    
    diagnostic_details = [
        [Paragraph("<b>CLASSIFICATION RESULT:</b>", meta_label), Paragraph(predicted_class.upper(), result_style)],
        [Paragraph("<b>MODEL CONFIDENCE:</b>", meta_label), Paragraph(f"<b>{confidence}%</b>", meta_val)],
        [Paragraph("<b>PROBABILITIES BREAKDOWN:</b>", meta_label), Paragraph(prob_html, body_style)],
    ]
    diag_details_table = Table(diagnostic_details, colWidths=[2.0 * inch, 3.0 * inch])
    diag_details_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    
    analysis_block = Table([[scan_img, diag_details_table]], colWidths=[2.0 * inch, 5.0 * inch])
    analysis_block.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOX', (0, 0), (-1, -1), 1, border_color),
        ('BACKGROUND', (0, 0), (-1, -1), colors.white),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    
    story.append(analysis_block)
    story.append(Spacer(1, 20))
    
    # 4. Clinical Explanation Section
    story.append(Paragraph("CLINICAL INTERPRETATION & EXPLANATION (EDUCATIONAL)", section_title))
    explanation_table = Table([[Paragraph(explanation, body_style)]], colWidths=[7.0 * inch])
    explanation_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), neutral_light),
        ('BOX', (0, 0), (-1, -1), 0.5, border_color),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
    ]))
    story.append(explanation_table)
    story.append(Spacer(1, 25))
    
    # 5. Disclaimer Box
    story.append(Paragraph("<b>CRITICAL CLINICAL DISCLAIMER:</b>", meta_label))
    disclaimer_text = (
        "This report is automatically compiled by an artificial intelligence image processing system using Deep Learning "
        "(EfficientNetB0 Architecture). The diagnostic screening is meant strictly for research, educational support, and preliminary triage. "
        "It does NOT constitute formal medical advice, diagnostic confirmation, or treatment recommendation. "
        "All findings MUST be correlated with patient history, physical examination, and reviewed formally by a qualified neuro-radiologist "
        "or neurosurgeon before initiating clinical decisions."
    )
    disc_table = Table([[Paragraph(disclaimer_text, disclaimer_style)]], colWidths=[7.0 * inch])
    disc_table.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#fca5a5")), # Light red border
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#fef2f2")), # Light red bg
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(disc_table)
    story.append(Spacer(1, 25))
    
    # 6. Signature Block
    sig_data = [
        [Paragraph("<b>AI System Signature:</b><br/><i>MedVision AI Core Engine V1</i>", meta_val),
         Paragraph("<b>Clinical Verification Signature:</b><br/>__________________________________<br/>Dr. / MD Neuroradiologist", meta_val)]
    ]
    sig_table = Table(sig_data, colWidths=[3.5 * inch, 3.5 * inch])
    sig_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(sig_table)
    
    # Build Document
    doc.build(story)

# ----------------- PRODUCTION FRONTEND DEPLOYMENT -----------------
# Serve React Build assets
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    
    # Try templates/index.html first, then fall back to creating one or static/index.html
    index_path = os.path.join(app.template_folder, 'index.html')
    if os.path.exists(index_path):
        return render_template('index.html')
    
    # Fallback if react app is not compiled yet
    return jsonify({
        'status': 'MedVision AI API Server is running.',
        'info': 'React frontend not compiled yet. Build the React project in the frontend folder first!'
    }), 200

if __name__ == '__main__':
    # Start on port 5000
    app.run(host='0.0.0.0', port=5000, debug=True)
