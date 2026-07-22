import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, 
  FileText, 
  Zap, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle,
  RefreshCw,
  FileDown,
  Loader2
} from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import api from '../utils/api';

export default function AIDetection() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setError('');
    setResult(null);
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Unsupported format. Please upload an image file (PNG, JPG, or JPEG).');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Unsupported format. Please upload an image file.');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleTriggerUpload = () => {
    fileInputRef.current.click();
  };

  const handleScanSubmit = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await api.post('/api/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Inference execution failed. Please verify API server connectivity.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError('');
  };

  const downloadReport = async () => {
    if (!result) return;
    setPdfLoading(true);
    try {
      const response = await api.get(`/api/reports/${result.prediction_id}/pdf`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `MedVision_Report_${result.prediction_id}_${result.predicted_class}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download PDF report. Access token might have expired.');
    } finally {
      setPdfLoading(false);
    }
  };

  const classColors = {
    'Glioma': 'bg-rose-500',
    'Meningioma': 'bg-cyan-500',
    'Pituitary': 'bg-primary-500',
    'No Tumor': 'bg-emerald-500'
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">AI MRI Screening Workspace</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Upload high-resolution T1-weighted, T2-weighted, or FLAIR brain MRI slices to run deep learning classification.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left: Uploader / Preview */}
          <div className="flex flex-col gap-6">
            {!previewUrl ? (
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={handleTriggerUpload}
                className="border-2 border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/60 rounded-3xl p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary-500 transition-colors shadow-sm min-h-[350px]"
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950/40 text-primary-500 flex items-center justify-center mb-4">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1">Drag & Drop MRI Slice</h3>
                <p className="text-xs text-slate-500 dark:text-slate-450 max-w-xs mb-4">
                  Supports PNG, JPG, or JPEG scans. Resolution will be automatically resized to 224x224.
                </p>
                <button type="button" className="bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-950/50 dark:text-primary-400 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all">
                  Browse Files
                </button>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-sm text-slate-850 dark:text-slate-200">Loaded MRI Slice</h3>
                  <button 
                    onClick={handleReset}
                    className="text-slate-450 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                    title="Remove Image"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative aspect-square max-w-sm mx-auto w-full rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-950 flex items-center justify-center">
                  <img 
                    src={previewUrl} 
                    alt="MRI Preview" 
                    className="max-h-full max-w-full object-contain"
                  />
                  {loading && (
                    <>
                      {/* Scanning Lasers */}
                      <motion.div 
                        animate={{ top: ['0%', '98%', '0%'] }}
                        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                        className="absolute left-0 right-0 h-0.5 bg-cyan-400 shadow-md shadow-cyan-400/80 pointer-events-none z-10"
                      />
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-xxs flex items-center justify-center">
                        <div className="bg-slate-900/90 border border-slate-800 px-5 py-3 rounded-2xl flex items-center gap-3 shadow-lg">
                          <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                          <span className="text-xs font-semibold text-white">Running CAD Model...</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {error && (
                  <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-250 dark:border-rose-900/40 text-rose-700 dark:text-rose-450 rounded-2xl flex gap-3 items-start text-xs font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex gap-4">
                  <button 
                    onClick={handleReset}
                    disabled={loading}
                    className="flex-1 border border-slate-250 dark:border-slate-800 text-slate-700 dark:text-slate-350 font-semibold py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 text-sm"
                  >
                    Reset
                  </button>
                  <button 
                    onClick={handleScanSubmit}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-primary-500 to-cyan-500 text-white font-semibold py-3 rounded-xl hover:opacity-95 disabled:opacity-50 text-sm shadow-md"
                  >
                    Analyze MRI Scan
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Results / Info */}
          <div>
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-6"
                >
                  {/* Classification Summary */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
                    <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
                      <div>
                        <span className="text-xxs font-bold uppercase tracking-wider text-slate-400">Diagnosis Designation</span>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{result.predicted_class}</h2>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
                        result.predicted_class === 'No Tumor' 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-450'
                      }`}>
                        {result.predicted_class === 'No Tumor' ? 'Normal' : 'Tumor Detected'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 dark:bg-slate-800/20 p-4 rounded-2xl border border-slate-100/50 dark:border-slate-800/40 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary-500" />
                        <div>
                          <p className="text-xxs text-slate-450 font-bold uppercase">Confidence</p>
                          <p className="text-sm font-extrabold text-slate-800 dark:text-white">{result.confidence}%</p>
                        </div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/20 p-4 rounded-2xl border border-slate-100/50 dark:border-slate-800/40 flex items-center gap-3">
                        <Zap className="w-5 h-5 text-cyan-500" />
                        <div>
                          <p className="text-xxs text-slate-450 font-bold uppercase">Inference Time</p>
                          <p className="text-sm font-extrabold text-slate-800 dark:text-white">{result.inference_time_ms} ms</p>
                        </div>
                      </div>
                    </div>

                    {/* Probability Breakdown bars */}
                    <div className="flex flex-col gap-4">
                      <h4 className="font-bold text-xs text-slate-800 dark:text-white uppercase tracking-wider">Classification Probabilities</h4>
                      <div className="space-y-3">
                        {Object.entries(result.probabilities).map(([cls, val]) => (
                          <div key={cls} className="flex flex-col gap-1.5">
                            <div className="flex justify-between text-xs font-semibold text-slate-655 dark:text-slate-350">
                              <span>{cls}</span>
                              <span>{val}%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-850 h-2.5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${val}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                className={`h-full rounded-full ${classColors[cls] || 'bg-slate-400'}`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Report Download */}
                    <button 
                      onClick={downloadReport}
                      disabled={pdfLoading}
                      className="w-full border border-primary-500 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950/20 font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                    >
                      {pdfLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Compiling Clinical PDF...
                        </>
                      ) : (
                        <>
                          Download Clinical PDF Report <FileDown className="w-4.5 h-4.5" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Medical Explanation Card */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-primary-500" /> Clinical Interpretation
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {result.explanation}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm flex flex-col justify-center items-center text-center min-h-[350px] text-slate-400">
                  <div className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-4 text-slate-350 dark:text-slate-650">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-850 dark:text-slate-200 mb-1">Awaiting CAD Evaluation</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-450 max-w-xs">
                    Once you upload an MRI slice and submit it for analysis, the AI predictions and clinical interpretation will render here.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
