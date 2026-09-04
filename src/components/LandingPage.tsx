"use client";
import React from 'react';
import { GraduationCap, ArrowRight, Zap, Brain, CalendarSync, LayoutDashboard, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LandingPageProps {
  onConnectGoogle: () => void;
  onDemoMode: () => void;
  loginError?: string | null;
  isAuthenticating?: boolean;
}

export function LandingPage({ onConnectGoogle, onDemoMode, loginError, isAuthenticating }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-slate-100 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">LearnAI</span>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDemoMode}
            disabled={isAuthenticating}
            className="text-slate-600 hover:text-slate-900"
          >
            Mode Simulasi
          </Button>
          <Button
            variant="primarySubtle"
            size="sm"
            onClick={onConnectGoogle}
            disabled={isAuthenticating}
          >
            {isAuthenticating ? 'Menghubungkan...' : 'Masuk Google'}
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center max-w-4xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium mb-8">
          <Zap className="w-4 h-4" />
          <span>Asisten Belajar Pintar untuk Mahasiswa & Siswa</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight mb-6">
          Sinkronkan Tugas Kelas, <br className="hidden sm:block" />
          <span className="text-indigo-600">
            Taklukkan dengan AI.
          </span>
        </h1>
        
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mb-10 leading-relaxed">
          Platform produktivitas akademik yang terhubung langsung dengan Google Classroom Anda. Dapatkan kurasi sumber belajar, rekomendasi YouTube, dan tutor AI personal secara otomatis untuk setiap tugas.
        </p>

        {loginError && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm max-w-lg mx-auto w-full flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-left">
              <strong className="block font-semibold mb-1">Gagal Masuk Google</strong>
              {loginError}
            </div>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button
            onClick={onConnectGoogle}
            disabled={isAuthenticating}
            size="lg"
            className="w-full sm:w-auto text-base py-6 px-8 rounded-2xl shadow-xl shadow-indigo-200 gap-3 group"
          >
            <span>{isAuthenticating ? 'Menghubungkan...' : 'Masuk Google Classroom'}</span>
            {!isAuthenticating && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </Button>
          
          <Button
            variant="outline"
            onClick={onDemoMode}
            size="lg"
            className="w-full sm:w-auto text-base py-6 px-8 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border-slate-200 gap-3"
          >
            <LayoutDashboard className="w-5 h-5 text-slate-500" />
            <span>Coba Mode Simulasi</span>
          </Button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20 text-left w-full">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 text-indigo-500">
              <CalendarSync className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-2">Sinkronisasi Otomatis</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Semua tugas, materi, dan tenggat waktu ditarik otomatis dari Google Classroom.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 text-indigo-500">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-2">Tutor AI Terpersonalisasi</h3>
            <p className="text-slate-600 text-sm leading-relaxed">AI akan beradaptasi dengan gaya belajarmu, memberikan penjelasan sesuai kebutuhan.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 text-indigo-500">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-2">Kurasi Materi Instan</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Langsung dapatkan rekomendasi video YouTube dan artikel yang relevan untuk setiap tugas.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
