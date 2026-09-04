"use client";
import React from 'react';
import { Sparkles, FolderSync, ArrowRight } from 'lucide-react';
import { TodoTask } from '../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SimulateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulate: (taskData: Omit<TodoTask, 'id' | 'createdAt' | 'updatedAt' | 'isCompleted'>) => void;
}

const PRESET_CLASSROOM_ASSIGNMENTS = [
  {
    courseName: 'Algoritma & Struktur Data (TI-2B)',
    title: 'Tugas Praktikum 5: Implementasi Binary Search Tree & Graph BFS/DFS',
    description: 'Implementasikan struktur data pohon biner pencarian (Binary Search Tree) dengan operasi insert, search, delete, serta penelusuran graf Breadth-First Search (BFS) dan Depth-First Search (DFS) menggunakan bahasa C++ atau Python. Buat analisis kompleksitas waktu Big-O.',
    dueDateStr: 'Besok, 23:59 WIB',
    dueTimestamp: Date.now() + 30 * 3600 * 1000,
    points: 100,
    priority: 'high' as const,
    syncSource: 'classroom' as const,
    classroomLink: 'https://classroom.google.com',
  },
  {
    courseName: 'Jaringan Komputer & Cyber Security',
    title: 'Analisis Paket Data Jaringan dengan Wireshark & Penjelasan TCP 3-Way Handshake',
    description: 'Rekam traffic lalu lintas HTTP dan HTTPS menggunakan Wireshark. Analisis proses koneksi TCP Three-Way Handshake (SYN, SYN-ACK, ACK), dan jelaskan perbedaan enkripsi TLS/SSL pada port 443 dibandingkan port 80.',
    dueDateStr: '4 Hari Lagi, 20:00 WIB',
    dueTimestamp: Date.now() + 96 * 3600 * 1000,
    points: 90,
    priority: 'medium' as const,
    syncSource: 'classroom' as const,
    classroomLink: 'https://classroom.google.com',
  },
  {
    courseName: 'Fisika Komputasi & Diferensial',
    title: 'Simulasi Gerak Peluru dengan Hambatan Udara menggunakan Metode Euler-Cromer',
    description: 'Tuliskan kode simulasi numerik untuk memodelkan lintasan proyektil meriam yang dipengaruhi gaya gesek udara kuadratik. Bandingkan hasil numerik metode Runge-Kutta Orde 4 dan Euler terhadap solusi analitik ideal.',
    dueDateStr: '5 Hari Lagi, 18:00 WIB',
    dueTimestamp: Date.now() + 120 * 3600 * 1000,
    points: 100,
    priority: 'medium' as const,
    syncSource: 'classroom' as const,
    classroomLink: 'https://classroom.google.com',
  },
  {
    courseName: 'Desain Pengalaman Pengguna (UI/UX)',
    title: 'Prototyping & Usability Testing Aplikasi E-Learning Berbasis Mobile',
    description: 'Buatlah High-Fidelity Prototype di Figma untuk sistem manajemen tugas mahasiswa. Lakukan usability testing dengan minimal 5 responden menggunakan System Usability Scale (SUS) dan laporkan hasilnya.',
    dueDateStr: 'Minggu Depan, 23:59 WIB',
    dueTimestamp: Date.now() + 168 * 3600 * 1000,
    points: 100,
    priority: 'low' as const,
    syncSource: 'classroom' as const,
    classroomLink: 'https://classroom.google.com',
  },
];

export const SimulateTaskModal: React.FC<SimulateTaskModalProps> = ({
  isOpen,
  onClose,
  onSimulate,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl p-0 overflow-hidden">
        <DialogHeader className="p-5 border-b border-slate-200 bg-amber-50/70 pr-12">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <FolderSync className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Simulasi Notifikasi Tugas Guru
              </DialogTitle>
              <DialogDescription className="text-xs text-amber-900/80 mt-0.5">
                Uji otomatisasi sinkronisasi Classroom & kurasi AI instan
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <p className="text-xs text-slate-600 leading-relaxed">
            Pilih salah satu contoh tugas Google Classroom di bawah ini untuk melihat bagaimana sistem langsung membuat item to-do list baru dan menghubungkannya dengan Gemini AI untuk mengirimkan sumber referensi web serta link video YouTube:
          </p>

          <div className="space-y-3">
            {PRESET_CLASSROOM_ASSIGNMENTS.map((preset, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200/90 hover:border-indigo-300 hover:bg-indigo-50/20 bg-slate-50/50 transition flex flex-col justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {preset.courseName}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
                      {preset.dueDateStr}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">
                    {preset.title}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                    {preset.description}
                  </p>
                </div>

                <Button
                  onClick={() => {
                    onSimulate(preset);
                    onClose();
                  }}
                  className="w-full"
                  size="sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Kirim Tugas Ini & Auto-Sync dengan AI</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
