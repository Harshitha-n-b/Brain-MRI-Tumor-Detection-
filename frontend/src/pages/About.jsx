import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Cpu, Database, Award, Info, HeartPulse } from 'lucide-react';
import PublicLayout from '../layouts/PublicLayout';

export default function About() {
  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-6 sm:px-12 py-16 md:py-24">
        {/* Title Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16 flex flex-col gap-4"
        >
          <div className="inline-flex items-center gap-2 bg-cyan-100 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 px-4 py-1.5 rounded-full text-xs font-semibold border border-cyan-200 dark:border-cyan-800 w-fit mx-auto">
            <Brain className="w-3.5 h-3.5" /> Scientific Context
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white">
            MedVision AI Model Architecture
          </h1>
          <p className="text-slate-650 dark:text-slate-350 text-lg leading-relaxed">
            Detailed clinical and technical specifications of the fine-tuned deep neural network model used for computer-aided diagnosis.
          </p>
        </motion.div>

        {/* Core Specs Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col gap-6"
          >
            <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-950 dark:text-white">Neural Network</h3>
                <p className="text-xs text-slate-500">EfficientNetB0 Architecture</p>
              </div>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              EfficientNetB0 is a state-of-the-art convolutional neural network (CNN) that scales depth, width, and resolution 
              uniformly using a compound coefficient. It achieves high performance while being lightweight, 
              making it highly suited for clinical systems where speed and accuracy are crucial.
            </p>

            <ul className="space-y-3 text-sm text-slate-650 dark:text-slate-350">
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                <strong>Base Model:</strong> ImageNet Transfer Learning
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                <strong>Input Resolution:</strong> 224 x 224 x 3 (RGB format)
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                <strong>Model Weight File:</strong> Brain_MRI_EfficientNetB0.keras
              </li>
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col gap-6"
          >
            <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-950 dark:text-white">Validation Performance</h3>
                <p className="text-xs text-slate-500">Dataset Validation Metrics</p>
              </div>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Fine-tuned on standard clinical Brain tumor datasets (comprising thousands of high-resolution images). 
              The model has been optimized using Adam optimization and categorical cross-entropy loss.
            </p>

            <ul className="space-y-3 text-sm text-slate-650 dark:text-slate-350">
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                <strong>Validation Accuracy:</strong> 95.13%
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                <strong>Loss Metric:</strong> Categorical Cross-Entropy
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                <strong>Classes Evaluated:</strong> Glioma, Meningioma, Pituitary, No Tumor
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Detailed Preprocessing steps */}
        <section className="bg-slate-100 dark:bg-slate-900/50 rounded-3xl p-8 border border-slate-200/60 dark:border-slate-800/80 mb-16">
          <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-primary-500" /> Preprocessing Pipeline
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-450 leading-relaxed mb-6">
            To ensure the consistency of model predictions, all uploaded images undergo a standardized clinical image-processing pipeline 
            before being fed to the input layer of the EfficientNetB0 neural network:
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 flex flex-col gap-2">
              <div className="font-bold text-primary-500 text-sm">Step 1: Color Space Standard</div>
              <p className="text-xs text-slate-500">
                Uploaded images (e.g. PNG, JPEG) are parsed via OpenCV and normalized into the RGB color space. 
                Grayscale DICOM or MRI slices are automatically converted to three channels.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 flex flex-col gap-2">
              <div className="font-bold text-primary-500 text-sm">Step 2: Spatial Resizing</div>
              <p className="text-xs text-slate-500">
                The image is resized to exactly <strong>224 x 224 pixels</strong> using bilinear interpolation, 
                matching the spatial dimension expected by the model's input layers.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 flex flex-col gap-2">
              <div className="font-bold text-primary-500 text-sm">Step 3: Scaling & Range</div>
              <p className="text-xs text-slate-500">
                Pixel values are loaded as float32 tensors in the range <strong>[0, 255]</strong>. 
                Internal model scaling normalization is applied to scale pixel ranges for optimized weight activation.
              </p>
            </div>
          </div>
        </section>

        {/* Clinical Disclaimer Callout */}
        <div className="border border-rose-250 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 p-6 rounded-3xl flex gap-4 items-start">
          <Info className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-2">
            <h4 className="font-bold text-rose-800 dark:text-rose-450 text-sm">Important Medical & Educational Statement</h4>
            <p className="text-xs text-rose-700/80 dark:text-rose-300/80 leading-relaxed">
              MedVision AI is designed as a computer-aided screening support tool for educational and research demonstrations. 
              The validation accuracy of 95.13% does not replace the diagnostic accuracy of a clinical biopsy, high-resolution contrast scans, 
              or the expert eyes of a certified medical radiologist. The predictions generated by this model are not medical diagnostics. 
              Always review scan results in a certified medical setup with clinical professionals.
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
