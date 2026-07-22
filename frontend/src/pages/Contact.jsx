import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, AlertCircle } from 'lucide-react';
import PublicLayout from '../layouts/PublicLayout';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Clinical Integration Support',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API request
    setTimeout(() => {
      setSubmitted(true);
    }, 600);
  };

  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-6 sm:px-12 py-16 md:py-24">
        {/* Title Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-4 py-1.5 rounded-full text-xs font-semibold border border-emerald-200 dark:border-emerald-800 w-fit mx-auto">
            <MessageSquare className="w-3.5 h-3.5" /> Support Center
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white">
            Get in Touch with MedVision AI
          </h1>
          <p className="text-slate-650 dark:text-slate-350 text-lg leading-relaxed">
            Need support integrating MedVision AI into your research workstation? Contact our clinical systems engineering team.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-12 items-start">
          {/* Info Column */}
          <div className="md:col-span-2 flex flex-col gap-8">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col gap-6 shadow-sm">
              <h3 className="font-bold text-xl text-slate-900 dark:text-white">Contact Information</h3>
              
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-850 dark:text-slate-200">Email Inquiries</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">clinical-support@medvision.ai</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-850 dark:text-slate-200">Phone Support</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">+1 (800) 555-0198</p>
                  <p className="text-xxs text-slate-400">Mon - Fri: 8:00 AM - 5:00 PM EST</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-850 dark:text-slate-200">Headquarters</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    100 Innovation Way, Suite 400<br />
                    Boston, MA 02110
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-amber-250 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/15 p-6 rounded-3xl flex gap-3.5 items-start">
              <AlertCircle className="w-5.5 h-5.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1.5">
                <h4 className="font-bold text-amber-800 dark:text-amber-400 text-sm">Not for Medical Emergencies</h4>
                <p className="text-xs text-amber-700/80 dark:text-amber-300/70 leading-relaxed">
                  This contact form is strictly for administrative, technical support, and research inquiries. 
                  If you are experiencing a medical emergency, please contact your local emergency services immediately.
                </p>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="md:col-span-3">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
              {submitted ? (
                <div className="text-center py-12 flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                    <Send className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-2xl text-slate-900 dark:text-white">Message Sent Successfully!</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                    Thank you for reaching out. A systems engineer from our clinical workspace division will contact you within 24 hours.
                  </p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="mt-4 text-primary-500 hover:text-primary-600 font-semibold text-sm"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-2">Send Message</h3>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Full Name</label>
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Dr. Sarah Jenkins"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Email Address</label>
                      <input 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="s.jenkins@hospital.org"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Subject</label>
                    <select 
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 text-slate-700 dark:text-slate-350"
                    >
                      <option>Clinical Integration Support</option>
                      <option>Research Collaboration</option>
                      <option>API Documentation Inquiry</option>
                      <option>Report a System Bug</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Message Description</label>
                    <textarea 
                      rows={5}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="Write your inquiry details here..."
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="bg-primary-500 text-white font-semibold py-3.5 rounded-xl hover:bg-primary-600 transition-colors flex items-center justify-center gap-2 mt-2 shadow-md shadow-primary-500/10"
                  >
                    Send Inquiry <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
