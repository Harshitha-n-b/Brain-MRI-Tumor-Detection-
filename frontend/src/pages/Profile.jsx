import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Calendar, 
  Activity, 
  Award,
  Loader2,
  Database
} from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import api from '../utils/api';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileAndStats = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        
        const response = await api.get('/api/dashboard/stats');
        setStats(response.data);
      } catch (err) {
        console.error('Failed to load profile dashboard details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfileAndStats();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="h-full flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            <p className="text-slate-500 font-semibold text-sm">Loading user profile...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const normalRatio = stats && stats.total_scans > 0 
    ? round((stats.class_counts['No Tumor'] / stats.total_scans) * 100, 1) 
    : 0.0;

  function round(value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">User Account & Credentials</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage your credentials, view clinical access nodes, and review workstation usage parameters.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {/* Left: User Avatar card */}
          <div className="md:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-500 flex items-center justify-center font-black text-3xl mb-4 border-2 border-primary-100 dark:border-primary-850">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">{user?.name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">Clinical Practitioner Node</p>
            
            <div className="w-full border-t border-slate-100 dark:border-slate-800 my-5" />
            
            <div className="flex flex-col gap-2 w-full text-left text-xs font-semibold text-slate-500 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Access Authority:</span>
                <span className="text-emerald-500 font-bold">Authorized</span>
              </div>
              <div className="flex justify-between">
                <span>Secure Session:</span>
                <span className="text-slate-800 dark:text-slate-200">SHA-256 JWT</span>
              </div>
              <div className="flex justify-between">
                <span>Database Node:</span>
                <span className="text-slate-800 dark:text-slate-200">SQLite v3</span>
              </div>
            </div>
          </div>

          {/* Right: Account credentials & stats details */}
          <div className="md:col-span-2 flex flex-col gap-6">
            {/* Credentials details */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
                Clinician Identity Settings
              </h3>

              <div className="flex items-start gap-4">
                <Mail className="w-5 h-5 text-slate-400 mt-1" />
                <div>
                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Email Address</h4>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-350 mt-0.5">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <User className="w-5 h-5 text-slate-400 mt-1" />
                <div>
                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Full Profile Name</h4>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-350 mt-0.5">{user?.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <ShieldCheck className="w-5 h-5 text-slate-400 mt-1" />
                <div>
                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Clinical Node License</h4>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-350 mt-0.5">MV-AUTH-9513-LICENSE-ACTIVE</p>
                </div>
              </div>
            </div>

            {/* Workstation statistics usage */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
                Workstation Activity Overview
              </h3>
              
              <div className="grid sm:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1.5 p-4 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-450 font-bold uppercase">
                    <Activity className="w-4 h-4 text-primary-500" /> Scans Run
                  </div>
                  <h4 className="text-xl font-black text-slate-900 dark:text-white mt-1">{stats?.total_scans}</h4>
                </div>
                
                <div className="flex flex-col gap-1.5 p-4 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-450 font-bold uppercase">
                    <Award className="w-4 h-4 text-cyan-500" /> Avg Accuracy
                  </div>
                  <h4 className="text-xl font-black text-slate-900 dark:text-white mt-1">{stats && stats.total_scans > 0 ? stats.average_confidence : 0.0}%</h4>
                </div>

                <div className="flex flex-col gap-1.5 p-4 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-450 font-bold uppercase">
                    <Database className="w-4 h-4 text-emerald-500" /> Normal Ratio
                  </div>
                  <h4 className="text-xl font-black text-slate-900 dark:text-white mt-1">{normalRatio}%</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
