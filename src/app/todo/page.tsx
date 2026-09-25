"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ListTodo,
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  Tag,
  Trash2,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Clock,
  BookOpen,
  Loader2,
  Check,
  Flame,
  ArrowRight,
  Coffee,
  Search,
  X,
  Pencil,
} from "lucide-react";
import { Shell } from "@/components/Shell";
import { IonLearnAIIcon } from "@/components/IonLearnAIIcon";
import { PersonalTodo, TodoSubtask, TodoTask } from "@/types";
import {
  loadTodos,
  addTodo,
  updateTodo,
  deleteTodo,
  toggleTodoComplete,
  loadTasks,
  loadAIConfig,
  loadPreferences,
} from "@/lib/taskStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "@/components/ui/sonner";
import confetti from "canvas-confetti";
import { useLanguage } from "@/context/LanguageContext";

export default function TodoPage() {
  const router = useRouter();
  const { language, isEn, t } = useLanguage();
  const [todos, setTodos] = useState<PersonalTodo[]>([]);
  const [classroomTasks, setClassroomTasks] = useState<TodoTask[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Form State for Quick Add
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<"high" | "medium" | "low">("medium");
  const [newDueDate, setNewDueDate] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newSubtasks, setNewSubtasks] = useState<{ id: string; title: string }[]>([]);
  const [draftSubtaskInput, setDraftSubtaskInput] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Edit Modal State
  const [editingTodo, setEditingTodo] = useState<PersonalTodo | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPriority, setEditPriority] = useState<"high" | "medium" | "low">("medium");
  const [editDueDate, setEditDueDate] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSubtasks, setEditSubtasks] = useState<TodoSubtask[]>([]);
  const [editSubtaskInput, setEditSubtaskInput] = useState("");

  // Inline Quick Subtask per Card
  const [quickSubtaskInputs, setQuickSubtaskInputs] = useState<Record<string, string>>({});
  const [addingSubtaskForId, setAddingSubtaskForId] = useState<string | null>(null);

  // Filter State
  const [filterTab, setFilterTab] = useState<"all" | "active" | "completed" | "high">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Subtasks expanded map
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  // Classroom AI Breakdown Modal
  const [showClassroomModal, setShowClassroomModal] = useState(false);
  const [selectedClassroomId, setSelectedClassroomId] = useState("");
  const [breakdownCount, setBreakdownCount] = useState<number>(8);
  const [isGeneratingBreakdown, setIsGeneratingBreakdown] = useState(false);

  useEffect(() => {
    setTodos(loadTodos());
    setClassroomTasks(loadTasks());
    setIsLoaded(true);

    const handleStorage = () => {
      setTodos(loadTodos());
      setClassroomTasks(loadTasks());
    };
    window.addEventListener("taskStoreChange", handleStorage);
    return () => window.removeEventListener("taskStoreChange", handleStorage);
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddDraftSubtask = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (!draftSubtaskInput.trim()) return;
    setNewSubtasks((prev) => [
      ...prev,
      { id: `sub-${Date.now()}-${prev.length}`, title: draftSubtaskInput.trim() },
    ]);
    setDraftSubtaskInput("");
  };

  const handleRemoveDraftSubtask = (id: string) => {
    setNewSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddQuickTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const now = new Date().toISOString();
    const item: PersonalTodo = {
      id: `todo-${Date.now()}`,
      title: newTitle.trim(),
      isCompleted: false,
      priority: newPriority,
      dueDate: newDueDate || undefined,
      category: newSubject.trim() || undefined,
      subtasks:
        newSubtasks.length > 0
          ? newSubtasks.map((s) => ({ id: s.id, title: s.title, isCompleted: false }))
          : undefined,
      createdAt: now,
      updatedAt: now,
    };

    addTodo(item);
    setTodos(loadTodos());
    if (item.subtasks && item.subtasks.length > 0) {
      setExpandedMap((prev) => ({ ...prev, [item.id]: true }));
    }
    setNewTitle("");
    setNewDueDate("");
    setNewSubject("");
    setNewSubtasks([]);
    setDraftSubtaskInput("");
    setShowAddForm(false);
    toast.success(t.todo.toastAdded, { description: item.title });
  };

  const handleOpenEdit = (todo: PersonalTodo) => {
    setEditingTodo(todo);
    setEditTitle(todo.title);
    setEditPriority(todo.priority);
    setEditDueDate(todo.dueDate || "");
    setEditSubject(todo.category || todo.courseName || "");
    setEditDescription(todo.description || "");
    setEditSubtasks(todo.subtasks ? [...todo.subtasks] : []);
    setEditSubtaskInput("");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTodo || !editTitle.trim()) return;

    const allCompleted =
      editSubtasks.length > 0
        ? editSubtasks.every((s) => s.isCompleted)
        : editingTodo.isCompleted;

    updateTodo(editingTodo.id, {
      title: editTitle.trim(),
      priority: editPriority,
      dueDate: editDueDate || undefined,
      category: editSubject.trim() || undefined,
      description: editDescription.trim() || undefined,
      subtasks: editSubtasks.length > 0 ? editSubtasks : undefined,
      isCompleted: allCompleted,
    });

    setTodos(loadTodos());
    setEditingTodo(null);
    toast.success(t.todo.toastUpdated, { description: editTitle.trim() });
  };

  const handleAddEditSubtask = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (!editSubtaskInput.trim()) return;
    const newSt: TodoSubtask = {
      id: `sub-${Date.now()}-${editSubtasks.length}`,
      title: editSubtaskInput.trim(),
      isCompleted: false,
    };
    setEditSubtasks((prev) => [...prev, newSt]);
    setEditSubtaskInput("");
  };

  const handleRemoveEditSubtask = (subtaskId: string) => {
    setEditSubtasks((prev) => prev.filter((s) => s.id !== subtaskId));
  };

  const handleToggleEditSubtask = (subtaskId: string) => {
    setEditSubtasks((prev) =>
      prev.map((s) => (s.id === subtaskId ? { ...s, isCompleted: !s.isCompleted } : s))
    );
  };

  const handleUpdateEditSubtaskTitle = (subtaskId: string, title: string) => {
    setEditSubtasks((prev) =>
      prev.map((s) => (s.id === subtaskId ? { ...s, title } : s))
    );
  };

  const handleInlineAddSubtask = (todoId: string) => {
    const text = (quickSubtaskInputs[todoId] || "").trim();
    if (!text) return;

    const target = todos.find((t) => t.id === todoId);
    if (!target) return;

    const newSubtask: TodoSubtask = {
      id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: text,
      isCompleted: false,
    };

    const newSubtasksList = [...(target.subtasks || []), newSubtask];

    // If parent was completed, adding a new subtask should mark it as incomplete
    const newIsCompleted = target.isCompleted ? false : target.isCompleted;

    updateTodo(todoId, {
      subtasks: newSubtasksList,
      isCompleted: newIsCompleted,
    });

    setTodos(loadTodos());
    setQuickSubtaskInputs((prev) => ({ ...prev, [todoId]: "" }));
    setExpandedMap((prev) => ({ ...prev, [todoId]: true }));
    setAddingSubtaskForId(null);
    toast.success(isEn ? "Sub-step added" : "Sub-langkah ditambahkan", { description: text });
  };

  const handleDeleteCardSubtask = (todoId: string, subtaskId: string) => {
    const target = todos.find((t) => t.id === todoId);
    if (!target || !target.subtasks) return;

    const newSubtasksList = target.subtasks.filter((s) => s.id !== subtaskId);
    const allCompleted =
      newSubtasksList.length > 0
        ? newSubtasksList.every((s) => s.isCompleted)
        : target.isCompleted;

    updateTodo(todoId, {
      subtasks: newSubtasksList.length > 0 ? newSubtasksList : undefined,
      isCompleted: allCompleted,
    });

    setTodos(loadTodos());
  };

  const handleToggleTodo = (todoId: string) => {
    const res = toggleTodoComplete(todoId);
    setTodos(loadTodos());
    if (res.nowCompleted) {
      try {
        confetti({
          particleCount: 30,
          spread: 45,
          origin: { y: 0.8 },
          colors: ["#6366f1", "#10b981", "#f59e0b"],
        });
      } catch {}
      toast.success(isEn ? "Done!" : "Selesai!", { description: res.title });
    }
  };

  const handleToggleSubtask = (todoId: string, subtaskId: string) => {
    const target = todos.find((t) => t.id === todoId);
    if (!target || !target.subtasks) return;

    const newSubtasks = target.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
    );

    const allCompleted = newSubtasks.every((st) => st.isCompleted);

    // If there are subtasks, parent completion depends on all subtasks being done
    // If no subtasks, keep original state
    const newIsCompleted = newSubtasks.length > 0 ? allCompleted : target.isCompleted;

    updateTodo(todoId, {
      subtasks: newSubtasks,
      isCompleted: newIsCompleted,
    });
    setTodos(loadTodos());
  };

  const handleDeleteTodo = (todoId: string) => {
    deleteTodo(todoId);
    setTodos(loadTodos());
    toast.info(t.todo.toastDeleted);
  };

  const handleGenerateClassroomBreakdown = async () => {
    const target = classroomTasks.find((t) => t.id === selectedClassroomId);
    if (!target) return;

    setIsGeneratingBreakdown(true);
    try {
      const res = await fetch("/api/ai/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "breakdown_task",
          payload: target,
          task: target,
          count: breakdownCount,
          requestedCount: breakdownCount,
          preferences: loadPreferences(),
          aiConfig: loadAIConfig(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || (isEn ? "Failed to process AI breakdown" : "Gagal memproses AI breakdown"));
      }

      const { data } = await res.json();
      const now = new Date().toISOString();
      const newTodo: PersonalTodo = {
        id: `todo-${Date.now()}`,
        title: data.title || target.title,
        description: data.description || (isEn ? `Classroom task breakdown: ${target.title}` : `Pecahan tugas Classroom: ${target.title}`),
        isCompleted: false,
        priority: target.priority || "high",
        dueDate: target.dueDateStr,
        courseName: target.courseName,
        courseWorkId: target.courseWorkId || target.id,
        category: target.courseName || (isEn ? "Course" : "Kuliah"),
        subtasks: data.subtasks || [],
        createdAt: now,
        updatedAt: now,
      };

      addTodo(newTodo);
      setTodos(loadTodos());
      setShowClassroomModal(false);
      setSelectedClassroomId("");
      setExpandedMap((prev) => ({ ...prev, [newTodo.id]: true }));

      toast.success(isEn ? "Classroom To-Do Created!" : "To-Do dari Classroom Berhasil Dibuat!", {
        description: isEn
          ? `Task "${target.title}" broken down into ${newTodo.subtasks?.length || 0} sub-steps.`
          : `Tugas "${target.title}" telah dipecah menjadi ${newTodo.subtasks?.length || 0} sub-langkah.`,
      });
    } catch (err: any) {
      toast.error(isEn ? "Failed to Import Task" : "Gagal Mengimpor Tugas", {
        description: err.message || (isEn ? "Check your AI configuration." : "Periksa konfigurasi AI Anda."),
      });
    } finally {
      setIsGeneratingBreakdown(false);
    }
  };

  // Stats
  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.isCompleted).length;
  const activeCount = totalCount - completedCount;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filtered List
  const filteredTodos = useMemo(() => {
    return todos.filter((t) => {
      if (filterTab === "active" && t.isCompleted) return false;
      if (filterTab === "completed" && !t.isCompleted) return false;
      if (filterTab === "high" && t.priority !== "high") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mTitle = t.title.toLowerCase().includes(q);
        const mCategory = t.category?.toLowerCase().includes(q);
        const mCourse = t.courseName?.toLowerCase().includes(q);
        const mDesc = t.description?.toLowerCase().includes(q);
        const mSubtasks = t.subtasks?.some((st) => st.title.toLowerCase().includes(q));
        if (!mTitle && !mCategory && !mCourse && !mDesc && !mSubtasks) return false;
      }
      return true;
    });
  }, [todos, filterTab, searchQuery]);

  return (
    <Shell>
      <div className="space-y-6 max-w-4xl mx-auto pb-16">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-lexend)] tracking-tight text-slate-900 dark:text-[#f3f3f3]">
              {t.todo.pageTitle}
            </h1>
            <p className="text-sm text-slate-500 dark:text-[#a3a3a3] mt-1">
              {t.todo.pageSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowClassroomModal(true)}
              className="gap-2 rounded-xl text-xs font-medium border-slate-200 dark:border-[#2b2b2b] bg-white dark:bg-[#181818] hover:bg-slate-100 dark:hover:bg-[#222] text-slate-800 dark:text-[#f3f3f3] shadow-2xs"
            >
              <IonLearnAIIcon className="w-3.5 h-3.5 text-indigo-500" />
              <span>{t.todo.importClassroomBtn}</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setShowAddForm(!showAddForm)}
              className="gap-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.todo.addBtn}</span>
            </Button>
          </div>
        </div>

        {/* Progress Bar Card (Quiet, Balanced) */}
        <div className="bg-white dark:bg-[#161616] rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-[#262626] shadow-2xs">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-700 dark:text-[#d4d4d4] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              {t.todo.dailyProgress}
            </span>
            <span className="text-slate-500 dark:text-[#8e8e8e]">
              {isEn
                ? `${completedCount} of ${totalCount} ${t.todo.progressCompleted} (${progressPercent}%)`
                : `${completedCount} dari ${totalCount} ${t.todo.progressCompleted} (${progressPercent}%)`}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-[#202020] rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Modal: Tambah To-Do Form (Centered with Deep Backdrop Blur & Radix Portal) */}
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogContent
            hideCloseButton
            className="w-[calc(100%-1.5rem)] sm:w-full max-w-lg p-5 sm:p-6 space-y-4 rounded-2xl bg-white dark:bg-[#171717] border border-slate-100 dark:border-[#262626] shadow-2xl"
          >
            <DialogTitle className="sr-only">{t.todo.dialogAddTitle}</DialogTitle>
            <DialogDescription className="sr-only">{t.todo.dialogAddDesc}</DialogDescription>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <ListTodo className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-[#f3f3f3]">
                    {t.todo.dialogAddTitle}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#888]">
                    {t.todo.dialogAddDesc}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-[#ccc] hover:bg-slate-100 dark:hover:bg-[#222] transition cursor-pointer"
              >
                <span className="sr-only">{isEn ? "Close" : "Tutup"}</span>
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddQuickTodo} className="space-y-3.5">
              <div>
                <label htmlFor="todo-title-input" className="text-xs font-semibold text-slate-700 dark:text-[#ccc] block mb-1">
                  {isEn ? "To-Do Title" : "Judul To-Do"}
                </label>
                <input
                  id="todo-title-input"
                  type="text"
                  placeholder={isEn ? "What do you want to achieve? (e.g. Finish calculus chapter 3)" : "Apa yang ingin kamu selesaikan? (Contoh: Selesaikan bab 3 kalkulus)"}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  maxLength={80}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-[#1f1f1f] border border-slate-200/80 dark:border-[#2b2b2b] text-slate-900 dark:text-[#f3f3f3] placeholder:text-slate-400 dark:placeholder:text-[#666] focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-[#a3a3a3] block mb-1">
                    {t.todo.priorityLabel}
                  </label>
                  <Select
                    value={newPriority}
                    onValueChange={(val) => setNewPriority(val as "high" | "medium" | "low")}
                  >
                    <SelectTrigger
                      id="todo-priority-select"
                      className="w-full h-9 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#1f1f1f] border border-slate-200/80 dark:border-[#2b2b2b] text-slate-800 dark:text-[#e5e5e5] focus:ring-2 focus:ring-indigo-500/30"
                    >
                      <SelectValue placeholder={t.todo.priorityLabel} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>{t.todo.priorityLabel}</SelectLabel>
                        <SelectItem value="high">{t.todo.priorityHigh}</SelectItem>
                        <SelectItem value="medium">{t.todo.priorityMedium}</SelectItem>
                        <SelectItem value="low">{t.todo.priorityLow}</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="todo-due-date-input" className="text-xs font-medium text-slate-600 dark:text-[#a3a3a3] block mb-1">
                    {t.todo.dueDateLabel} {isEn ? "(Optional)" : "(Opsional)"}
                  </label>
                  <DatePicker
                    id="todo-due-date-input"
                    value={newDueDate}
                    onChange={(date) => setNewDueDate(date)}
                    placeholder={isEn ? "Pick a due date..." : "Pilih target tanggal..."}
                    isEn={isEn}
                  />
                </div>

                <div>
                  <label htmlFor="todo-category-input" className="text-xs font-medium text-slate-600 dark:text-[#a3a3a3] block mb-1">
                    {t.todo.categoryLabel}
                  </label>
                  <input
                    id="todo-category-input"
                    type="text"
                    placeholder={isEn ? "e.g. Algorithms" : "e.g. Algoritma"}
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#1f1f1f] border border-slate-200/80 dark:border-[#2b2b2b] text-slate-800 dark:text-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 placeholder:text-slate-400 dark:placeholder:text-[#666]"
                  />
                </div>
              </div>

              {/* Draft Subtasks Section */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-[#a3a3a3]">
                    {t.todo.subtasksOptional}
                  </label>
                  {newSubtasks.length > 0 && (
                    <span className="text-[11px] text-slate-400 dark:text-[#777]">
                      {newSubtasks.length} {isEn ? "steps added" : "langkah ditambahkan"}
                    </span>
                  )}
                </div>

                {newSubtasks.length > 0 && (
                  <div className="space-y-1.5 mb-2.5 max-h-36 overflow-y-auto pr-1">
                    {newSubtasks.map((st, idx) => (
                      <div
                        key={st.id}
                        className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200/60 dark:border-[#2a2a2a] text-xs"
                      >
                        <span className="text-slate-700 dark:text-[#ccc] truncate flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-medium text-slate-400 dark:text-[#666]">
                            {idx + 1}.
                          </span>
                          {st.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDraftSubtask(st.id)}
                          className="text-slate-400 hover:text-rose-500 transition-colors p-1 cursor-pointer"
                          aria-label={isEn ? "Remove sub-step" : "Hapus sub-langkah"}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={t.todo.subtaskPlaceholder}
                    value={draftSubtaskInput}
                    onChange={(e) => setDraftSubtaskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddDraftSubtask();
                      }
                    }}
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#1f1f1f] border border-slate-200/80 dark:border-[#2b2b2b] text-slate-800 dark:text-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 placeholder:text-slate-400 dark:placeholder:text-[#666]"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddDraftSubtask}
                    disabled={!draftSubtaskInput.trim()}
                    className="h-9 px-3 text-xs rounded-xl gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t.todo.addSubstepBtn}</span>
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#262626]">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-slate-600 dark:text-[#888] rounded-xl"
                >
                  {t.todo.cancelBtn}
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-2xs"
                >
                  {t.todo.saveBtn}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal: Edit To-Do & Subtasks */}
        <Dialog open={Boolean(editingTodo)} onOpenChange={(open) => { if (!open) setEditingTodo(null); }}>
          <DialogContent
            hideCloseButton
            className="w-[calc(100%-1.5rem)] sm:w-full max-w-lg p-5 sm:p-6 space-y-4 rounded-2xl bg-white dark:bg-[#171717] border border-slate-100 dark:border-[#262626] shadow-2xl"
          >
            <DialogTitle className="sr-only">{t.todo.dialogEditTitle}</DialogTitle>
            <DialogDescription className="sr-only">{t.todo.dialogEditDesc}</DialogDescription>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-[#f3f3f3]">
                    {t.todo.dialogEditTitle}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#888]">
                    {t.todo.dialogEditDesc}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingTodo(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-[#ccc] hover:bg-slate-100 dark:hover:bg-[#222] transition cursor-pointer"
              >
                <span className="sr-only">{isEn ? "Close" : "Tutup"}</span>
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label htmlFor="edit-todo-title" className="text-xs font-semibold text-slate-700 dark:text-[#ccc] block mb-1">
                  {isEn ? "To-Do Title" : "Judul To-Do"}
                </label>
                <input
                  id="edit-todo-title"
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  maxLength={80}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-[#1f1f1f] border border-slate-200/80 dark:border-[#2b2b2b] text-slate-900 dark:text-[#f3f3f3] placeholder:text-slate-400 dark:placeholder:text-[#666] focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-[#a3a3a3] block mb-1">
                    {t.todo.priorityLabel}
                  </label>
                  <Select
                    value={editPriority}
                    onValueChange={(val) => setEditPriority(val as "high" | "medium" | "low")}
                  >
                    <SelectTrigger
                      id="edit-todo-priority"
                      className="w-full h-9 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#1f1f1f] border border-slate-200/80 dark:border-[#2b2b2b] text-slate-800 dark:text-[#e5e5e5] focus:ring-2 focus:ring-indigo-500/30"
                    >
                      <SelectValue placeholder={t.todo.priorityLabel} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>{t.todo.priorityLabel}</SelectLabel>
                        <SelectItem value="high">{t.todo.priorityHigh}</SelectItem>
                        <SelectItem value="medium">{t.todo.priorityMedium}</SelectItem>
                        <SelectItem value="low">{t.todo.priorityLow}</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="edit-todo-due-date" className="text-xs font-medium text-slate-600 dark:text-[#a3a3a3] block mb-1">
                    {t.todo.dueDateLabel} {isEn ? "(Optional)" : "(Opsional)"}
                  </label>
                  <DatePicker
                    id="edit-todo-due-date"
                    value={editDueDate}
                    onChange={(date) => setEditDueDate(date)}
                    placeholder={isEn ? "Pick a due date..." : "Pilih target tanggal..."}
                    isEn={isEn}
                  />
                </div>

                <div>
                  <label htmlFor="edit-todo-category" className="text-xs font-medium text-slate-600 dark:text-[#a3a3a3] block mb-1">
                    {t.todo.categoryLabel}
                  </label>
                  <input
                    id="edit-todo-category"
                    type="text"
                    placeholder={isEn ? "e.g. Algorithms" : "e.g. Algoritma"}
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#1f1f1f] border border-slate-200/80 dark:border-[#2b2b2b] text-slate-800 dark:text-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 placeholder:text-slate-400 dark:placeholder:text-[#666]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="edit-todo-desc" className="text-xs font-medium text-slate-600 dark:text-[#a3a3a3] block mb-1">
                  {isEn ? "Description (Optional)" : "Deskripsi (Opsional)"}
                </label>
                <textarea
                  id="edit-todo-desc"
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder={isEn ? "Add more context or details..." : "Tambah catatan atau detail tambahan..."}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#1f1f1f] border border-slate-200/80 dark:border-[#2b2b2b] text-slate-800 dark:text-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 placeholder:text-slate-400 dark:placeholder:text-[#666] resize-none"
                />
              </div>

              {/* Edit Subtasks Section */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-[#a3a3a3]">
                    {t.todo.subtasksLabel} ({editSubtasks.filter((s) => s.isCompleted).length}/{editSubtasks.length})
                  </label>
                </div>

                {editSubtasks.length > 0 && (
                  <div className="space-y-1.5 mb-2.5 max-h-40 overflow-y-auto pr-1">
                    {editSubtasks.map((st) => (
                      <div
                        key={st.id}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200/60 dark:border-[#2a2a2a] text-xs"
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleEditSubtask(st.id)}
                          className="cursor-pointer shrink-0"
                          title={st.isCompleted ? (isEn ? "Mark uncompleted" : "Tandai belum selesai") : (isEn ? "Mark completed" : "Tandai selesai")}
                        >
                          <span
                            className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                              st.isCompleted
                                ? "bg-emerald-500 text-white"
                                : "border border-slate-300 dark:border-[#444]"
                            }`}
                          >
                            {st.isCompleted && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </span>
                        </button>
                        <input
                          type="text"
                          value={st.title}
                          onChange={(e) => handleUpdateEditSubtaskTitle(st.id, e.target.value)}
                          className={`flex-1 bg-transparent border-none focus:outline-none text-xs ${
                            st.isCompleted
                              ? "line-through text-slate-400 dark:text-[#666]"
                              : "text-slate-800 dark:text-[#e5e5e5]"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveEditSubtask(st.id)}
                          className="text-slate-400 hover:text-rose-500 transition-colors p-1 cursor-pointer shrink-0"
                          title={isEn ? "Delete sub-step" : "Hapus sub-langkah"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={t.todo.subtaskPlaceholder}
                    value={editSubtaskInput}
                    onChange={(e) => setEditSubtaskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddEditSubtask();
                      }
                    }}
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#1f1f1f] border border-slate-200/80 dark:border-[#2b2b2b] text-slate-800 dark:text-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 placeholder:text-slate-400 dark:placeholder:text-[#666]"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddEditSubtask}
                    disabled={!editSubtaskInput.trim()}
                    className="h-9 px-3 text-xs rounded-xl gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t.todo.addSubstepBtn}</span>
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#262626]">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingTodo(null)}
                  className="text-xs text-slate-600 dark:text-[#888] rounded-xl"
                >
                  {t.todo.cancelBtn}
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-2xs"
                >
                  {t.todo.saveChangesBtn}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Filters & Tabs (Clean, Quieter Segmented Design) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-slate-100/90 dark:bg-[#181818] p-1 rounded-xl border border-slate-200/70 dark:border-[#262626] text-xs overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilterTab("all")}
              className={`min-h-[40px] sm:min-h-0 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                filterTab === "all"
                  ? "bg-white dark:bg-[#262626] text-slate-900 dark:text-[#f3f3f3] shadow-xs font-semibold"
                  : "text-slate-500 dark:text-[#888] hover:text-slate-800 dark:hover:text-[#eee]"
              }`}
            >
              <span>{t.todo.tabAll}</span>
              <span className="opacity-60 text-xs">({totalCount})</span>
            </button>

            <button
              onClick={() => setFilterTab("active")}
              className={`min-h-[40px] sm:min-h-0 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                filterTab === "active"
                  ? "bg-white dark:bg-[#262626] text-slate-900 dark:text-[#f3f3f3] shadow-xs font-semibold"
                  : "text-slate-500 dark:text-[#888] hover:text-slate-800 dark:hover:text-[#eee]"
              }`}
            >
              <span>{t.todo.tabActive}</span>
              <span className="opacity-60 text-xs">({activeCount})</span>
            </button>

            <button
              onClick={() => setFilterTab("completed")}
              className={`min-h-[40px] sm:min-h-0 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                filterTab === "completed"
                  ? "bg-white dark:bg-[#262626] text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold"
                  : "text-slate-500 dark:text-[#888] hover:text-slate-800 dark:hover:text-[#eee]"
              }`}
            >
              <span>{t.todo.tabCompleted}</span>
              <span className="opacity-60 text-xs">({completedCount})</span>
            </button>

            <button
              onClick={() => setFilterTab("high")}
              className={`min-h-[40px] sm:min-h-0 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 ${
                filterTab === "high"
                  ? "bg-white dark:bg-[#262626] text-rose-600 dark:text-rose-400 shadow-xs font-semibold"
                  : "text-slate-500 dark:text-[#888] hover:text-slate-800 dark:hover:text-[#eee]"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              <span>{t.todo.tabHigh}</span>
            </button>
          </div>

          <div className="relative w-full sm:w-60 group">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-[#737373] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400" />
            <input
              type="text"
              placeholder={isEn ? "Search to-dos..." : "Cari to-do..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-8 py-1.5 text-xs rounded-xl bg-slate-100/90 hover:bg-slate-100 dark:bg-[#181818] dark:hover:bg-[#1c1c1c] border border-slate-200/80 dark:border-[#262626] text-slate-900 dark:text-[#f3f3f3] placeholder:text-slate-400 dark:placeholder:text-[#666] focus:outline-none focus:bg-white dark:focus:bg-[#1e1e1e] focus:border-indigo-500/50 dark:focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-[#ccc] rounded-md transition cursor-pointer"
                title={isEn ? "Clear search" : "Hapus pencarian"}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* To-Do Items List */}
        {filteredTodos.length === 0 ? (
          searchQuery.trim() ? (
            /* Search Empty State */
            <div className="text-center py-14 px-4 bg-white dark:bg-[#161616] rounded-2xl border border-slate-200/80 dark:border-[#262626] shadow-2xs space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-[#202020] flex items-center justify-center text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-[#f3f3f3]">
                {t.todo.searchEmptyTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#888] max-w-sm mx-auto">
                {isEn
                  ? `No to-do plans or subtasks match "${searchQuery}".`
                  : `Tidak ada rencana to-do atau sub-langkah yang cocok dengan kata kunci "${searchQuery}".`}
              </p>
              <div className="pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="min-h-[40px] sm:min-h-0 text-xs rounded-xl cursor-pointer"
                >
                  {t.todo.resetSearch}
                </Button>
              </div>
            </div>
          ) : filterTab === "active" && totalCount > 0 && activeCount === 0 ? (
            /* Celebratory Empty State */
            <div className="text-center py-16 px-6 bg-white dark:bg-[#161616] rounded-2xl border border-slate-200/80 dark:border-[#262626] shadow-2xs space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-2xs">
                <Coffee className="w-8 h-8 stroke-[1.8]" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-[#f3f3f3] font-heading">
                  {t.todo.celebrationTitle}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-[#888] leading-relaxed">
                  {t.todo.celebrationDesc}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilterTab("all")}
                  className="min-h-[44px] sm:min-h-0 text-xs rounded-xl"
                >
                  {t.todo.viewAllBtn} ({totalCount})
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowAddForm(true)}
                  className="min-h-[44px] sm:min-h-0 text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-[#f0f0f0] dark:hover:bg-white text-white dark:text-slate-900 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  {t.todo.newPlanBtn}
                </Button>
              </div>
            </div>
          ) : (
            /* Generic Empty State */
            <div className="text-center py-16 px-4 bg-white dark:bg-[#161616] rounded-2xl border border-slate-200/80 dark:border-[#262626] shadow-2xs space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-[#202020] flex items-center justify-center text-slate-400">
                <ListTodo className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-[#f3f3f3]">
                {t.todo.emptyTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#888] mt-1 max-w-sm mx-auto">
                {t.todo.emptyDesc}
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  onClick={() => setShowAddForm(true)}
                  className="min-h-[44px] sm:min-h-0 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  {t.todo.addBtn}
                </Button>
              </div>
            </div>
          )
        ) : (
          <div className="space-y-3">
            {filteredTodos.map((item) => {
              const hasSubtasks = item.subtasks && item.subtasks.length > 0;
              const completedSubtasks = item.subtasks?.filter((s) => s.isCompleted).length || 0;
              const isExpanded = Boolean(expandedMap[item.id]);

              return (
                <div
                  key={item.id}
                  className={`bg-white dark:bg-[#161616] rounded-2xl p-4 sm:p-5 transition-colors border border-slate-200/80 dark:border-[#262626] shadow-2xs ${
                    item.isCompleted ? "opacity-60 bg-slate-50/70 dark:bg-[#121212]" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => handleToggleTodo(item.id)}
                      className="min-w-[44px] min-h-[44px] -m-2.5 flex items-center justify-center cursor-pointer shrink-0 focus-visible:outline-none"
                      title={item.isCompleted ? (isEn ? "Mark as uncompleted" : "Tandai belum selesai") : (isEn ? "Mark as completed" : "Tandai selesai")}
                      aria-label={item.isCompleted ? (isEn ? `Mark "${item.title}" uncompleted` : `Tandai "${item.title}" belum selesai`) : (isEn ? `Mark "${item.title}" completed` : `Tandai "${item.title}" selesai`)}
                    >
                      <span
                        className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                          item.isCompleted
                            ? "bg-emerald-500 text-white"
                            : "border-2 border-slate-300 dark:border-[#383838] hover:border-indigo-500"
                        }`}
                      >
                        {item.isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </span>
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-sm font-semibold ${
                            item.isCompleted
                              ? "line-through text-slate-400 dark:text-[#666]"
                              : "text-slate-900 dark:text-[#f3f3f3]"
                          }`}
                        >
                          {item.title}
                        </span>

                        {/* Priority Badge */}
                        {item.priority === "high" && (
                          <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                            {isEn ? "High" : "Penting"}
                          </span>
                        )}
                        {item.priority === "medium" && (
                          <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                            {isEn ? "Medium" : "Sedang"}
                          </span>
                        )}

                        {/* Category / Course Tag */}
                        {(item.category || item.courseName) && (
                          <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-[#222] text-slate-600 dark:text-[#8e8e8e]">
                            {item.category || item.courseName}
                          </span>
                        )}

                        {/* Due Date */}
                        {item.dueDate && (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-[#888]">
                            <Clock className="w-3 h-3" />
                            {item.dueDate}
                          </span>
                        )}
                      </div>

                      {item.description && (
                        <p className="text-xs text-slate-500 dark:text-[#888] mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      )}

                      {/* Subtasks Progress / Trigger */}
                      {hasSubtasks ? (
                        <div className="mt-2.5">
                          <button
                            type="button"
                            onClick={() => toggleExpand(item.id)}
                            className="inline-flex items-center gap-1.5 min-h-[36px] sm:min-h-0 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                            aria-expanded={isExpanded}
                            aria-label={`${isExpanded ? (isEn ? "Collapse" : "Tutup") : (isEn ? "Expand" : "Buka")} ${isEn ? "sub-steps for" : "sub-langkah"} ${item.title}`}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                            <span>
                              {t.todo.subtasksLabel} ({completedSubtasks}/{item.subtasks?.length})
                            </span>
                          </button>

                          {/* Subtasks List */}
                          {isExpanded && (
                            <div className="mt-2 pl-2 space-y-2 border-l-2 border-slate-100 dark:border-[#222]">
                              {item.subtasks?.map((subtask) => (
                                <div
                                  key={subtask.id}
                                  className="group/sub flex items-center justify-between gap-2 text-xs py-0.5"
                                >
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleSubtask(item.id, subtask.id)}
                                      className="min-w-[28px] min-h-[28px] flex items-center justify-center cursor-pointer shrink-0 focus-visible:outline-none"
                                      title={subtask.isCompleted ? (isEn ? "Mark subtask uncompleted" : "Tandai subtask belum selesai") : (isEn ? "Mark subtask completed" : "Tandai subtask selesai")}
                                      aria-label={subtask.isCompleted ? (isEn ? `Mark subtask "${subtask.title}" uncompleted` : `Tandai subtask "${subtask.title}" belum selesai`) : (isEn ? `Mark subtask "${subtask.title}" completed` : `Tandai subtask "${subtask.title}" selesai`)}
                                    >
                                      <span
                                        className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-all focus-visible:ring-1 focus-visible:ring-emerald-500 ${
                                          subtask.isCompleted
                                            ? "bg-emerald-500 text-white"
                                            : "border border-slate-300 dark:border-[#444]"
                                        }`}
                                      >
                                        {subtask.isCompleted && (
                                          <Check className="w-2 h-2 stroke-[3]" />
                                        )}
                                      </span>
                                    </button>
                                    <span
                                      className={`truncate ${
                                        subtask.isCompleted
                                          ? "line-through text-slate-400 dark:text-[#666]"
                                          : "text-slate-700 dark:text-[#ccc]"
                                      }`}
                                    >
                                      {subtask.title}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCardSubtask(item.id, subtask.id)}
                                    className="opacity-0 group-hover/sub:opacity-100 transition-opacity p-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 cursor-pointer shrink-0"
                                    title={isEn ? "Delete sub-step" : "Hapus sub-langkah"}
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}

                              {/* Inline Quick Add Subtask inside expanded list */}
                              <div className="pt-1 flex items-center gap-1.5">
                                <input
                                  type="text"
                                  placeholder={t.todo.quickAddSubtaskPlaceholder}
                                  value={quickSubtaskInputs[item.id] || ""}
                                  onChange={(e) =>
                                    setQuickSubtaskInputs((prev) => ({
                                      ...prev,
                                      [item.id]: e.target.value,
                                    }))
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      handleInlineAddSubtask(item.id);
                                    }
                                  }}
                                  className="flex-1 px-2.5 py-1 text-xs rounded-lg bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200/80 dark:border-[#2a2a2a] text-slate-800 dark:text-[#e5e5e5] placeholder:text-slate-400 dark:placeholder:text-[#666] focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleInlineAddSubtask(item.id)}
                                  disabled={!(quickSubtaskInputs[item.id] || "").trim()}
                                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-[#222] dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400 text-slate-600 dark:text-[#a3a3a3] disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>{isEn ? "Add" : "Tambah"}</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* When no subtasks yet: Allow adding subtasks inline */
                        <div className="mt-2">
                          {addingSubtaskForId === item.id ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                autoFocus
                                type="text"
                                placeholder={t.todo.quickAddSubtaskPlaceholder}
                                value={quickSubtaskInputs[item.id] || ""}
                                onChange={(e) =>
                                  setQuickSubtaskInputs((prev) => ({
                                    ...prev,
                                    [item.id]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleInlineAddSubtask(item.id);
                                  } else if (e.key === "Escape") {
                                    setAddingSubtaskForId(null);
                                  }
                                }}
                                className="flex-1 px-2.5 py-1 text-xs rounded-lg bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200/80 dark:border-[#2a2a2a] text-slate-800 dark:text-[#e5e5e5] placeholder:text-slate-400 dark:placeholder:text-[#666] focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                              />
                              <button
                                type="button"
                                onClick={() => handleInlineAddSubtask(item.id)}
                                disabled={!(quickSubtaskInputs[item.id] || "").trim()}
                                className="px-2.5 py-1 text-xs rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                <span>{isEn ? "Add" : "Tambah"}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setAddingSubtaskForId(null)}
                                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-[#ccc] transition cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setAddingSubtaskForId(item.id)}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-indigo-600 dark:text-[#737373] dark:hover:text-indigo-400 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>{t.todo.addSubstepBtn}</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="min-w-[40px] min-h-[40px] -m-1 flex items-center justify-center rounded-xl text-slate-400 hover:text-indigo-600 dark:text-[#737373] dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-[#202020] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        title={t.todo.editBtn}
                        aria-label={`${t.todo.editBtn} "${item.title}"`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTodo(item.id)}
                        className="min-w-[40px] min-h-[40px] -m-1 flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 dark:text-[#737373] dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-[#202020] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                        title={isEn ? "Delete To-Do" : "Hapus To-Do"}
                        aria-label={isEn ? `Delete to-do "${item.title}"` : `Hapus to-do "${item.title}"`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Classroom Task Breakdown to To-Do with AI */}
        <Dialog open={showClassroomModal} onOpenChange={setShowClassroomModal}>
          <DialogContent
            hideCloseButton
            className="w-[calc(100%-1.5rem)] sm:w-full max-w-lg p-5 space-y-4 rounded-2xl bg-white dark:bg-[#171717] border border-slate-100 dark:border-[#262626] shadow-2xl"
          >
            <DialogTitle className="sr-only">{t.todo.modalClassroomTitle}</DialogTitle>
            <DialogDescription className="sr-only">{t.todo.modalClassroomDesc}</DialogDescription>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <IonLearnAIIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-[#f3f3f3]">
                    {t.todo.modalClassroomTitle}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#888]">
                    {t.todo.modalClassroomDesc}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowClassroomModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-[#ccc] hover:bg-slate-100 dark:hover:bg-[#222] transition cursor-pointer"
              >
                <span className="sr-only">{isEn ? "Close" : "Tutup"}</span>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-[#ccc] block">
                {t.todo.modalClassroomSelect}
              </label>
              {classroomTasks.filter((t) => !t.isCompleted).length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-[#888] italic py-2">
                  {t.todo.modalClassroomEmpty}
                </p>
              ) : (
                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                  {classroomTasks
                    .filter((t) => !t.isCompleted)
                    .map((task) => (
                      <div
                        key={task.id}
                        onClick={() => setSelectedClassroomId(task.id)}
                        className={`p-2.5 rounded-xl text-xs cursor-pointer transition-all border ${
                          selectedClassroomId === task.id
                            ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 font-medium"
                            : "border-slate-100 dark:border-[#222] bg-slate-50 dark:bg-[#1a1a1a] hover:bg-slate-100 dark:hover:bg-[#202020]"
                        }`}
                      >
                        <div className="font-semibold text-slate-900 dark:text-[#f3f3f3]">
                          {task.title}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#888] mt-1">
                          {task.courseName && <span>{task.courseName}</span>}
                          {task.dueDateStr && <span>• {task.dueDateStr}</span>}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Menu Pilihan Jumlah To-Do (5 - 15) */}
            <div className="space-y-2.5 pt-2.5 border-t border-slate-100 dark:border-[#262626]">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-800 dark:text-[#ddd] block">
                    {t.todo.modalClassroomCountLabel}
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-[#888]">
                    {t.todo.modalClassroomCountHelper}
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40 shrink-0">
                  {breakdownCount} {isEn ? "Items" : "To-Do"}
                </span>
              </div>

              {/* Slider 5 - 15 */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono font-medium text-slate-400 dark:text-[#666]">5</span>
                  <input
                    type="range"
                    min={5}
                    max={15}
                    step={1}
                    value={breakdownCount}
                    onChange={(e) => setBreakdownCount(Number(e.target.value))}
                    className="flex-1 accent-indigo-600 dark:accent-indigo-400 h-1.5 bg-slate-200 dark:bg-[#2b2b2b] rounded-lg cursor-pointer"
                  />
                  <span className="text-[11px] font-mono font-medium text-slate-400 dark:text-[#666]">15</span>
                </div>

                {/* Preset Chips */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[5, 7, 8, 10, 12, 15].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setBreakdownCount(cnt)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                        breakdownCount === cnt
                          ? "bg-indigo-600 text-white shadow-2xs font-semibold"
                          : "bg-slate-100 dark:bg-[#222] text-slate-600 dark:text-[#aaa] hover:bg-slate-200 dark:hover:bg-[#282828]"
                      }`}
                    >
                      {cnt} {isEn ? "items" : "to-do"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-[#222]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowClassroomModal(false)}
                disabled={isGeneratingBreakdown}
                className="text-xs text-slate-600 dark:text-[#888] rounded-xl"
              >
                {t.todo.cancelBtn}
              </Button>
              <Button
                size="sm"
                onClick={handleGenerateClassroomBreakdown}
                disabled={!selectedClassroomId || isGeneratingBreakdown}
                className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 shadow-2xs"
              >
                {isGeneratingBreakdown ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{t.todo.modalClassroomAnalyzing}</span>
                  </>
                ) : (
                  <>
                    <IonLearnAIIcon className="w-3.5 h-3.5" />
                    <span>{t.todo.modalClassroomBreakdownBtn} ({breakdownCount})</span>
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Shell>
  );
}
