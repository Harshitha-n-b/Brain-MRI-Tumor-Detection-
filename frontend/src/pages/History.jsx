import React, { useState, useEffect } from 'react';
import { 
  FileDown, 
  Search, 
  ExternalLink,
  Loader2,
  Calendar,
  AlertCircle,
  Database
} from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import api from '../utils/api';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/api/history');
        setHistory(response.data.history);
      } catch (err) {
        setError('Failed to fetch clinical scan logs.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleDownloadPDF = async (predictionId, className) => {
    setDownloadingId(predictionId);
    try {
      const response = await api.get(`/api/reports/${predictionId}/pdf`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `MedVision_Report_${predictionId}_${className}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download report PDF. Authentication might have expired.');
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.id.toString().includes(searchTerm) || 
      item.predicted_class.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesFilter = filterClass === 'All' || 
      (filterClass === 'Tumor' && item.predicted_class !== 'No Tumor') ||
      (filterClass === 'Normal' && item.predicted_class === 'No Tumor') ||
      item.predicted_class === filterClass;

    return matchesSearch && matchesFilter;
  });

  const getBaseURL = () => {
    if (window.location.port === '5173') return 'http://localhost:5000';
    return '';
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="h-full flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            <p className="text-slate-500 font-semibold text-sm">Loading scan logs...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Scan Archival Registry</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Browse, search, and download PDF clinical reports of all past MRI evaluations.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-250 dark:border-rose-900/40 text-rose-700 dark:text-rose-450 rounded-2xl flex gap-3 items-start text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by Report ID or class label..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-primary-500 transition-all text-slate-950 dark:text-white"
            />
          </div>

          <div className="flex gap-3">
            {['All', 'Tumor', 'Normal', 'Glioma', 'Meningioma', 'Pituitary'].map((cls) => (
              <button
                key={cls}
                onClick={() => setFilterClass(cls)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  filterClass === cls
                    ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                    : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>

        {/* Table list */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          {filteredHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xxs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50 dark:bg-slate-900/50">
                    <th className="px-6 py-4">Report ID</th>
                    <th className="px-6 py-4">Scan Slices</th>
                    <th className="px-6 py-4">CAD Classification</th>
                    <th className="px-6 py-4">AI Confidence</th>
                    <th className="px-6 py-4">Latency</th>
                    <th className="px-6 py-4">Date Logged</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm text-slate-700 dark:text-slate-350">
                  {filteredHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                        MV-{item.id.toString().padStart(6, '0')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 flex items-center justify-center">
                          <img 
                            src={`${getBaseURL()}${item.image_url}`} 
                            alt="Scan slice"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xxs px-2 py-0.5 rounded-full font-bold uppercase ${
                          item.predicted_class === 'No Tumor'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-450'
                        }`}>
                          {item.predicted_class}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold">{item.confidence}%</td>
                      <td className="px-6 py-4 text-slate-450">{item.inference_time_ms} ms</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(item.created_at).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <a 
                            href={`${getBaseURL()}${item.image_url}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-primary-500 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="View Full Scan"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleDownloadPDF(item.id, item.predicted_class)}
                            disabled={downloadingId === item.id}
                            className="text-slate-400 hover:text-cyan-500 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                            title="Download Report"
                          >
                            {downloadingId === item.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
                            ) : (
                              <FileDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400 flex flex-col items-center gap-3">
              <Database className="w-10 h-10 text-slate-300 dark:text-slate-700" />
              <h4 className="font-bold text-slate-800 dark:text-slate-200">No logs found</h4>
              <p className="text-xs text-slate-500 max-w-xs">
                We couldn't find any scans matching your current search parameters.
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
