"use client";
import React, { useState } from 'react';
import { UserPreferences } from '../types';
import { Brain, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface OnboardingModalProps {
  isOpen: boolean;
  onSave: (prefs: UserPreferences) => void;
  onSkip: () => void;
  isSettingsMode?: boolean; // If true, it means it's accessed from settings (not initial login)
}

export function OnboardingModal({ isOpen, onSave, onSkip, isSettingsMode = false }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [prefs, setPrefs] = useState<UserPreferences>({
    learningStyle: '',
    explanationDetail: '',
    aiTone: '',
  });

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else handleSave();
  };

  const handleSave = () => {
    onSave({
      learningStyle: prefs.learningStyle || 'Netral',
      explanationDetail: prefs.explanationDetail || 'Netral',
      aiTone: prefs.aiTone || 'Ramah',
    });
    // Reset step for next open
    setStep(1);
  };

  const handleClose = () => {
    setStep(1);
    onSkip();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden dark:bg-[#0B0F17] dark:border-slate-800">
        {/* Header */}
        <DialogHeader className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl flex items-center justify-center shrink-0">
              <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                {isSettingsMode ? 'Pengaturan Personalisasi AI' : 'Personalisasi AI Tutor'}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Langkah {step} dari 3
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 space-y-4 dark:bg-[#0B0F17]">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white text-lg">Bagaimana gaya belajar yang paling kamu sukai?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kami akan menyesuaikan jenis referensi yang diberikan kepadamu.</p>
              </div>
              
              <div className="space-y-2.5">
                {['Visual (Gambar, Video, Diagram)', 'Membaca / Menulis (Teks Ekstensif)', 'Praktik (Studi Kasus, Latihan)'].map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setPrefs(prev => ({ ...prev, learningStyle: option }))}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      prefs.learningStyle === option 
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 font-semibold' 
                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                    }`}
                  >
                    <span>{option}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white text-lg">Seberapa detail penjelasan yang kamu inginkan?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Mempengaruhi panjang rangkuman dan respon chatbot.</p>
              </div>
              
              <div className="space-y-2.5">
                {['Singkat & Padat (To the point)', 'Sangat Detail (Mendalam)', 'Bertahap (Step-by-step)'].map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setPrefs(prev => ({ ...prev, explanationDetail: option }))}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      prefs.explanationDetail === option 
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 font-semibold' 
                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                    }`}
                  >
                    <span>{option}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white text-lg">Gaya bahasa AI seperti apa yang memotivasi kamu?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Menentukan tone komunikasi asisten saat membantumu.</p>
              </div>
              
              <div className="space-y-2.5">
                {['Santai & Ramah', 'Profesional & Tegas', 'Socratic (Memicu Berpikir Kritis)'].map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setPrefs(prev => ({ ...prev, aiTone: option }))}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      prefs.aiTone === option 
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 font-semibold' 
                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                    }`}
                  >
                    <span>{option}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <DialogFooter className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between sm:justify-between">
          {!isSettingsMode ? (
            <Button 
              variant="ghost"
              onClick={handleClose} 
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-semibold text-sm"
            >
              Lewati (Skip)
            </Button>
          ) : (
            <div />
          )}
          
          <Button
            onClick={handleNext}
            className="inline-flex items-center gap-2"
          >
            <span>{step === 3 ? 'Simpan' : 'Lanjut'}</span>
            {step < 3 && <ArrowRight className="w-4 h-4" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
