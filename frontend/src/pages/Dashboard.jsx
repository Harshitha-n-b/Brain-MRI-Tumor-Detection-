import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  UploadCloud, 
  Clock, 
  Zap, 
  TrendingUp,
  FileText, 
  ArrowRight,
  Loader2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell 
} from 'recharts';
import MainLayout from '../layouts/MainLayout';
import api from '../utils/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/api/dashboard/stats');
        setStats(response.data);
      } catch (err) {
        setError('Failed to fetch dashboard metrics. Please reload.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="h-full flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            <p className="text-slate-500 font-semibold text-sm">Loading clinical stats...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-250 dark:border-rose-900/50 p-6 rounded-3xl text-rose-700 dark:text-rose-400 text-center">
          <p className="font-bold">{error}</p>
        </div>
      </MainLayout>
    );
  }

  // Pre-format chart data
  const chartColors = ['#0ea5e9', '#06b6d4', '#10b981', '#f43f5e'];
  const chartData = stats ? [
    { name: 'Glioma', value: stats.class_counts.Glioma },
    { name: 'Meningioma', value: stats.class_counts.Meningioma },
    { name: 'No Tumor', value: stats.class_counts['No Tumor'] },
    { name: 'Pituitary', value: stats.class_counts.Pituitary },
  ] : [];

  return (
    <MainLayout>
      <div className="flex flex-col gap-8 max-w-6xl mx-auto">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Welcome to your Clinical Workstation</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Review stats, check predictions, and perform real-time brain MRI scans.
            </p>
          </div>
          <Link 
            to="/detection" 
            className="bg-primary-500 text-white hover:bg-primary-600 px-6 py-3 rounded-xl font-semibold shadow-md shadow-primary-500/10 flex items-center justify-center gap-2 group shrink-0"
          >
            New Scan Evaluation 
            <UploadCloud className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-950/50 text-primary-650 dark:text-primary-400 flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Total Scans</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{stats?.total_scans}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-950/50 text-cyan-650 dark:text-cyan-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Avg Confidence</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{stats?.average_confidence}%</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-650 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Avg Inference</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{stats?.average_inference_time_ms} ms</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-650 dark:text-rose-450 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Tumors Found</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">
                {stats ? stats.total_scans - stats.class_counts['No Tumor'] : 0}
              </h3>
            </div>
          </div>
        </div>

        {/* Graphical Section */}
        <div className="grid md:grid-cols-5 gap-8 items-start">
          {/* Recharts chart */}
          <div className="md:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6">Diagnosis Distribution</h3>
            <div className="h-64">
              {stats?.total_scans > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} allowDecimals={false} />
                    <Tooltip cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  No scan distributions to display yet. Run a prediction scan!
                </div>
              )}
            </div>
          </div>

          {/* Recent Scans */}
          <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">Recent Evaluated Scans</h3>
              <Link to="/history" className="text-primary-500 hover:text-primary-650 text-xs font-bold flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-4">
              {stats?.recent_scans?.length > 0 ? (
                stats.recent_scans.map((scan) => (
                  <div key={scan.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/20 px-4 py-3 rounded-2xl border border-slate-100/50 dark:border-slate-800/40">
                    <div>
                      <h4 className="font-bold text-sm text-slate-850 dark:text-slate-200">{scan.predicted_class}</h4>
                      <p className="text-xxs text-slate-400 mt-0.5">
                        {new Date(scan.created_at).toLocaleDateString()} · {scan.confidence}% Confidence
                      </p>
                    </div>
                    <span className={`text-xxs px-2 py-0.5 rounded-full font-bold uppercase ${
                      scan.predicted_class === 'No Tumor' 
                        ? 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                        : 'bg-rose-100/80 text-rose-700 dark:bg-rose-950/40 dark:text-rose-450'
                    }`}>
                      {scan.predicted_class === 'No Tumor' ? 'Normal' : 'Tumor'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No scan logs recorded. Start by uploading an MRI image.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
