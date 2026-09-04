"use client";
import React, { useState } from 'react';
import { Plus, Calendar, BookOpen, AlertTriangle } from 'lucide-react';
import { TodoTask } from '../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface CreateManualTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Omit<TodoTask, 'id' | 'createdAt' | 'updatedAt' | 'isCompleted'>) => void;
  existingCourses: string[];
}

export const CreateManualTaskModal: React.FC<CreateManualTaskModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  existingCourses,
}) => {
  const [courseName, setCourseName] = useState(existingCourses[0] || 'Tugas Umum');
  const [customCourse, setCustomCourse] = useState('');
  const [isCustomCourse, setIsCustomCourse] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('23:59');
  const [points, setPoints] = useState('100');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalCourse = isCustomCourse ? (customCourse.trim() || 'Tugas Umum') : courseName;

    let formattedDueDate = 'Tidak ada tenggat';
    let dueTimestamp: number | null = null;

    if (dueDate) {
      const [year, month, day] = dueDate.split('-').map(Number);
      const [hours, minutes] = dueTime.split(':').map(Number);
      const dateObj = new Date(year, month - 1, day, hours, minutes);
      dueTimestamp = dateObj.getTime();

      const monthsIndo = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      formattedDueDate = `${day} ${monthsIndo[month - 1]} ${year}, ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} WIB`;
    }

    onAddTask({
      courseName: finalCourse,
      title: title.trim(),
      description: description.trim(),
      dueDateStr: formattedDueDate,
      dueTimestamp,
      points: points ? parseInt(points, 10) : undefined,
      priority,
      syncSource: 'manual',
    });

    onClose();
    // Reset form
    setTitle('');
    setDescription('');
    setDueDate('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-0 flex flex-col gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-5 border-b border-slate-200 bg-slate-50 text-left pr-12">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="font-bold text-slate-900 text-base">
                Tambah Tugas Manual
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Catat tugas atau kegiatan belajar di luar Google Classroom
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Course selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Mata Pelajaran / Kelas
            </label>
            {!isCustomCourse ? (
              <div className="space-y-1.5">
                <select
                  value={courseName}
                  onChange={(e) => {
                    if (e.target.value === '__NEW__') {
                      setIsCustomCourse(true);
                    } else {
                      setCourseName(e.target.value);
                    }
                  }}
                  className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                >
                  {existingCourses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="__NEW__">➕ Tambah Mata Kuliah Baru...</option>
                </select>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customCourse}
                  onChange={(e) => setCustomCourse(e.target.value)}
                  placeholder="Nama Mata Pelajaran / Kelas Baru"
                  className="flex-1 p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setIsCustomCourse(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
                >
                  Pilih Eksisting
                </button>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Judul Tugas <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Makalah Studi Kasus Hukum Bisnis Bab 4"
              className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Deskripsi & Instruksi Pengerjaan
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan detail soal atau instruksi dari dosen..."
              className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Due Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tanggal Tenggat
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Jam Tenggat
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Priority & Points */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Prioritas
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="high">🔴 Tinggi (Mendesak)</option>
                <option value="medium">🟡 Sedang</option>
                <option value="low">🟢 Rendah</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Bobot Nilai / Poin
              </label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                placeholder="100"
                className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="default"
              className="font-bold"
            >
              Simpan & Masukkan To-Do
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
