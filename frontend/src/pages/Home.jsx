import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Cpu, 
  Clock, 
  CheckCircle, 
  ArrowRight, 
  BrainCircuit, 
  FileText,
  Activity
} from 'lucide-react';
import PublicLayout from '../layouts/PublicLayout';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-primary-50/50 via-white to-transparent dark:from-primary-950/10 dark:via-slate-950 dark:to-transparent">
        {/* Floating background blobs */}
        <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none dark:bg-cyan-500/10" />
        <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl pointer-events-none dark:bg-primary-500/10" />

        <div className="max-w-7xl mx-auto px-6 sm:px-12 grid md:grid-cols-2 items-center gap-16 relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-6"
          >
            <div className="inline-flex items-center gap-2 bg-primary-100/80 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 px-4 py-1.5 rounded-full text-xs font-semibold border border-primary-200 dark:border-primary-800 w-fit">
              <Activity className="w-3.5 h-3.5 animate-pulse" /> Next-Gen AI Screening Assist
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-white">
              Advanced Brain Tumor Detection <span className="bg-gradient-to-r from-primary-500 to-cyan-400 bg-clip-text text-transparent">Powered by AI</span>
            </h1>
            
            <p className="text-lg text-slate-600 dark:text-slate-350 max-w-lg leading-relaxed">
              Instantly analyze MRI scans for Glioma, Meningioma, and Pituitary tumors. 
              Equip clinical teams with deep-learning screening support, probability analytics, and automated clinical reports.
            </p>
            
            <div className="flex flex-wrap gap-4 mt-2">
              <Link 
                to="/register" 
                className="bg-gradient-to-r from-primary-500 to-cyan-500 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-cyan-500/20 hover:opacity-95 flex items-center gap-2 group transition-all"
              >
                Access Workstation 
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/about" 
                className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold px-8 py-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
              >
                Review Science
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative flex justify-center items-center"
          >
            {/* Visual Glass Box Mockup */}
            <div className="relative w-full max-w-md aspect-square rounded-3xl glass-card p-6 flex flex-col justify-between overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-cyan-400/30 to-primary-500/30 rounded-full blur-2xl -z-10" />
              
              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/40 pb-4">
                <div className="flex items-center gap-3">
                  <BrainCircuit className="w-7 h-7 text-primary-500 animate-pulse" />
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white">AI Classification Engine</h3>
                    <p className="text-xxs text-slate-500 dark:text-slate-400">EfficientNetB0 · 95.13% Accuracy</p>
                  </div>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>

              {/* Graphical scanner visual representation */}
              <div className="my-8 flex flex-col items-center justify-center relative flex-1">
                <div className="w-40 h-40 rounded-2xl border-2 border-dashed border-cyan-400/50 dark:border-cyan-500/30 flex items-center justify-center relative overflow-hidden bg-slate-100/50 dark:bg-slate-950/40">
                  <Activity className="w-12 h-12 text-cyan-500/30 dark:text-cyan-400/20" />
                  {/* Glowing Scanning Line */}
                  <motion.div 
                    animate={{ top: ['0%', '90%', '0%'] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                    className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-lg shadow-cyan-400/80 pointer-events-none"
                  />
                </div>
              </div>

              <div className="bg-slate-50/80 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                  <span>Glioma Detection Probability</span>
                  <span className="text-primary-500">98.4%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-850 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-primary-500 to-cyan-500 h-full rounded-full w-[98.4%]" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-slate-900 border-y border-slate-200/50 dark:border-slate-800/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="flex flex-col gap-2">
            <h3 className="text-4xl sm:text-5xl font-black text-primary-500">95.13%</h3>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Validation Accuracy</p>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-4xl sm:text-5xl font-black text-cyan-500">4</h3>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Class Diagnoses</p>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-4xl sm:text-5xl font-black text-primary-500">&lt; 100ms</h3>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Inference Latency</p>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-4xl sm:text-5xl font-black text-cyan-500">100%</h3>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Automated PDF Reports</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 max-w-7xl mx-auto px-6 sm:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            Designed for Clinical Decision Support
          </h2>
          <p className="text-slate-600 dark:text-slate-350">
            A comprehensive workspace engineered to streamline MRI triage, document findings, and support educational clinical explanation.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid md:grid-cols-3 gap-8"
        >
          {/* Card 1 */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col gap-5 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">EfficientNetB0 Model</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Utilizes pre-trained weights fine-tuned on clinical brain datasets. Employs advanced spatial scaling to isolate tumor boundaries.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col gap-5 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Automated Clinical Reports</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Generate fully detailed clinical reports automatically inside a downloadable PDF, with visual diagnostic markers and detailed annotations.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col gap-5 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Educational Reference</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Features medical explanations of various tumors (Glioma, Meningioma, Pituitary) to serve as clinical assistant study references.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 bg-cover bg-center opacity-10 bg-[url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1920&q=80')]" />
        <div className="max-w-4xl mx-auto text-center px-6 relative z-10 flex flex-col gap-6 items-center">
          <h2 className="text-3xl sm:text-4xl font-bold">Ready to Start Scanning?</h2>
          <p className="text-slate-350 max-w-xl">
            Create an account in seconds, access our clinical workspace, and start uploading brain MRI scans to evaluate model predictions.
          </p>
          <Link 
            to="/register" 
            className="bg-gradient-to-r from-primary-500 to-cyan-500 text-white font-semibold px-8 py-3.5 rounded-xl hover:opacity-95 transition-all shadow-lg shadow-cyan-500/20"
          >
            Create Your Workstation Account
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
