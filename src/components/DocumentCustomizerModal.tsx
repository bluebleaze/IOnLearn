"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Download,
  Loader2,
  Sliders,
  Sparkles,
  Check,
  User,
  Building,
  GraduationCap,
  Type,
  Layout,
  AlignJustify,
  AlignLeft,
  AlignCenter,
  AlignRight,
  FileSpreadsheet,
  Presentation,
  Palette,
  BookOpen,
  FileText,
  Bookmark,
  Layers,
  Image as ImageIcon,
  Upload,
  Trash2,
  Building2,
} from "lucide-react";
import {
  DocumentStyleOptions,
  CreatedDocument,
  CreatedSlides,
} from "@/types";
import {
  loadSavedDocStyle,
  saveDocStyle,
  downloadCreatedDocument,
  downloadCreatedSlides,
  DEFAULT_DOCUMENT_STYLE,
  ACCENT_PALETTES,
} from "@/lib/exportUtils";

interface DocumentCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document?: CreatedDocument | null;
  slides?: CreatedSlides | null;
  fallbackContent?: string;
  onSuccess?: (msg: string) => void;
}

const EXCEL_THEMES = [
  { id: "emerald", label: "Emerald Excel", primary: "059669", bg: "bg-emerald-600", light: "bg-emerald-50 dark:bg-emerald-950/30", desc: "Klasik Excel Elegan" },
  { id: "teal", label: "Modern Teal", primary: "0d9488", bg: "bg-teal-600", light: "bg-teal-50 dark:bg-teal-950/30", desc: "Toska Segar & Modern" },
  { id: "indigo", label: "Royal Indigo", primary: "4f46e5", bg: "bg-indigo-600", light: "bg-indigo-50 dark:bg-indigo-950/30", desc: "Biru Ungu Profesional" },
  { id: "blue", label: "Cobalt Blue", primary: "2563eb", bg: "bg-blue-600", light: "bg-blue-50 dark:bg-blue-950/30", desc: "Biru Korporat Resmi" },
  { id: "slate", label: "Graphite Slate", primary: "475569", bg: "bg-slate-600", light: "bg-slate-50 dark:bg-slate-950/30", desc: "Abu Gelap Minimalis" },
  { id: "amber", label: "Warm Amber", primary: "d97706", bg: "bg-amber-600", light: "bg-amber-50 dark:bg-amber-950/30", desc: "Emas / Oranye Hangat" },
] as const;

export const DocumentCustomizerModal: React.FC<DocumentCustomizerModalProps> = ({
  isOpen,
  onClose,
  document,
  slides,
  fallbackContent,
  onSuccess,
}) => {
  const [styleOptions, setStyleOptions] = useState<DocumentStyleOptions>(DEFAULT_DOCUMENT_STYLE);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "identity" | "kop" | "typography" | "layout" | "metadata" | "excel_sheet" | "excel_style" | "excel_columns"
  >("identity");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved preferences on modal open
  useEffect(() => {
    if (isOpen) {
      const saved = loadSavedDocStyle();
      setStyleOptions((prev) => ({
        ...prev,
        ...saved,
        author: saved.author || "IOnLearn",
        watermarkText: saved.watermarkText || "IOnLearn Study Copilot",
        pageSize: saved.pageSize || "A4",
        pageMargin: saved.pageMargin || "normal",
        headerStyle: saved.headerStyle || "modern",
        accentColor: saved.accentColor || "indigo",
        textAlign: saved.textAlign || "justify",
        logoBase64: saved.logoBase64,
        customHeaderText: saved.customHeaderText || "",
        logoPosition: saved.logoPosition || "left",
        sheetName: saved.sheetName || "Sheet1",
        tableTitle: saved.tableTitle || "",
        excelTheme: saved.excelTheme || "emerald",
        autoFitColumns: saved.autoFitColumns !== false,
        showGridLines: saved.showGridLines !== false,
      }));
      if (document?.type === "xlsx") {
        setActiveTab("identity");
      }
    }
  }, [isOpen, document?.type]);

  if (!isOpen) return null;

  const isSlide = !!slides;
  const isExcel = !isSlide && document?.type === "xlsx";
  const docTitle = slides?.title || document?.title || "Dokumen Tanpa Judul";
  const docType = isSlide
    ? "PPTX"
    : document?.type === "pdf"
    ? "PDF"
    : isExcel
    ? "XLSX"
    : "DOCX";

  const handleUpdate = (field: keyof DocumentStyleOptions, value: any) => {
    setStyleOptions((prev) => {
      const updated = { ...prev, [field]: value };
      saveDocStyle(updated);
      return updated;
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Silakan pilih berkas gambar yang valid (PNG, JPG, JPEG, WebP, SVG).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran berkas terlalu besar (maksimal 5 MB).");
      return;
    }

    setIsUploadingLogo(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (!result) {
        setIsUploadingLogo(false);
        return;
      }

      // If SVG or small raster image, store directly
      if (file.type === "image/svg+xml" || file.size < 120 * 1024) {
        handleUpdate("logoBase64", result);
        setIsUploadingLogo(false);
        return;
      }

      // Compress and resize raster images with canvas to keep doc sizes light
      const img = new Image();
      img.onload = () => {
        const maxDim = 600;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = window.document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/png", 0.92);
          handleUpdate("logoBase64", compressed);
        } else {
          handleUpdate("logoBase64", result);
        }
        setIsUploadingLogo(false);
      };
      img.onerror = () => {
        handleUpdate("logoBase64", result);
        setIsUploadingLogo(false);
      };
      img.src = result;
    };
    reader.onerror = () => {
      alert("Gagal membaca berkas gambar.");
      setIsUploadingLogo(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    handleUpdate("logoBase64", undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      saveDocStyle(styleOptions);

      if (isSlide && slides) {
        await downloadCreatedSlides(slides, styleOptions);
      } else if (document) {
        await downloadCreatedDocument(document, fallbackContent, styleOptions);
      }
      if (onSuccess) {
        onSuccess(`Berhasil mengunduh berkas ${docType} dengan kustomisasi profesional!`);
      }
      onClose();
    } catch (err) {
      console.error("Gagal mengunduh dokumen terkustomisasi:", err);
      alert("Terjadi kesalahan saat membuat dokumen: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsDownloading(false);
    }
  };

  const fontOptions: Array<{ id: DocumentStyleOptions["fontFamily"]; label: string; desc: string; sample: string }> = [
    {
      id: "Calibri",
      label: "Calibri",
      desc: "Standar Modern & Bersih",
      sample: "Tipografi jernih dan proporsional untuk laporan modern.",
    },
    {
      id: "Times New Roman",
      label: "Times New Roman",
      desc: "Standar Akademik & Formal",
      sample: "Format skripsi, jurnal, dan tugas ilmiah formal.",
    },
    {
      id: "Arial",
      label: "Arial",
      desc: "Minimalis & Tajam",
      sample: "Mudah dibaca dengan ketajaman sans-serif.",
    },
    {
      id: "Georgia",
      label: "Georgia",
      desc: "Elegan & Klasik",
      sample: "Tipografi anggun untuk esai dan kajian literatur.",
    },
    {
      id: "Courier New",
      label: "Courier New",
      desc: "Monospace & Teknis",
      sample: "Gaya ketikan mesin untuk coding & data eksperimen.",
    },
  ];

  const currentAccent = isExcel
    ? (EXCEL_THEMES.find((t) => t.id === (styleOptions.excelTheme || "emerald")) || EXCEL_THEMES[0])
    : (ACCENT_PALETTES[styleOptions.accentColor || "indigo"] || ACCENT_PALETTES.indigo);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-2xs font-bold"
              style={{ backgroundColor: `#${currentAccent.primary}` }}
            >
              {isSlide ? <Presentation className="w-5 h-5" /> : isExcel ? <FileSpreadsheet className="w-5 h-5" /> : <Sliders className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                {isExcel ? "Kustomisasi Spreadsheet Excel" : "Kustomisasi Generator Dokumen"}
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold uppercase">
                  {docType}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs sm:max-w-md">
                {docTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 bg-slate-50/50 dark:bg-slate-900/30 overflow-x-auto">
          {isExcel ? (
            <>
              <button
                type="button"
                onClick={() => setActiveTab("identity")}
                className={`flex items-center gap-1.5 py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition cursor-pointer ${
                  activeTab === "identity"
                    ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Identitas
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("excel_sheet")}
                className={`flex items-center gap-1.5 py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition cursor-pointer ${
                  activeTab === "excel_sheet"
                    ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Lembar Kerja (Sheet)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("excel_style")}
                className={`flex items-center gap-1.5 py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition cursor-pointer ${
                  activeTab === "excel_style"
                    ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                Tema Warna
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("excel_columns")}
                className={`flex items-center gap-1.5 py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition cursor-pointer ${
                  activeTab === "excel_columns"
                    ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                Format Kolom & Grid
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("metadata")}
                className={`flex items-center gap-1.5 py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition cursor-pointer ${
                  activeTab === "metadata"
                    ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Informasi Berkas
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setActiveTab("identity")}
                className={`flex items-center gap-1.5 py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition cursor-pointer ${
                  activeTab === "identity"
                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Identitas
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("kop")}
                className={`flex items-center gap-1.5 py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition cursor-pointer ${
                  activeTab === "kop"
                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Logo & Kop
                {styleOptions.logoBase64 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("typography")}
                className={`flex items-center gap-1.5 py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition cursor-pointer ${
                  activeTab === "typography"
                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                Font & Teks
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("layout")}
                className={`flex items-center gap-1.5 py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition cursor-pointer ${
                  activeTab === "layout"
                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                Format & Sampul
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("metadata")}
                className={`flex items-center gap-1.5 py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition cursor-pointer ${
                  activeTab === "metadata"
                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Watermark & Hak Cipta
              </button>
            </>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* TAB 1: IDENTITAS SISWA / PENULIS */}
          {activeTab === "identity" && (
            <div className="space-y-4">
              <div className="bg-indigo-50/70 dark:bg-indigo-950/30 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-3">
                <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
                  Informasi ini otomatis disematkan pada kop dokumen, halaman sampul, dan properti berkas sistem.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nama Lengkap Siswa / Penulis
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={styleOptions.userName || ""}
                    onChange={(e) => handleUpdate("userName", e.target.value)}
                    placeholder="Contoh: Muhammad Budi Santoso"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    NIM / NIS / ID Pelajar
                  </label>
                  <input
                    type="text"
                    value={styleOptions.studentId || ""}
                    onChange={(e) => handleUpdate("studentId", e.target.value)}
                    placeholder="Contoh: 2101020304"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Program Studi / Jurusan / Kelas
                  </label>
                  <input
                    type="text"
                    value={styleOptions.facultyOrClass || ""}
                    onChange={(e) => handleUpdate("facultyOrClass", e.target.value)}
                    placeholder="Contoh: Teknik Informatika / Kelas XII IPA 1"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Sekolah / Universitas / Lembaga
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={styleOptions.institution || ""}
                    onChange={(e) => handleUpdate("institution", e.target.value)}
                    placeholder="Contoh: Universitas Indonesia / SMA Negeri 1"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB EXCEL 1: LEMBAR KERJA (SHEET) */}
          {activeTab === "excel_sheet" && isExcel && (
            <div className="space-y-4">
              <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-900/50 flex items-start gap-3">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                  Konfigurasikan judul header dan label tab lembar kerja Excel (.xlsx). Nama tab akan muncul pada bilah bawah buku kerja (*workbook*).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nama Sheet / Tab Lembar Kerja (Maksimal 31 Karakter)
                </label>
                <input
                  type="text"
                  maxLength={31}
                  value={styleOptions.sheetName || ""}
                  onChange={(e) => handleUpdate("sheetName", e.target.value)}
                  placeholder="Sheet1 (contoh: Ringkasan, Komparasi, Data Nilai)"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Sesuai standar Microsoft Excel, nama sheet maksimal 31 karakter dan tidak boleh mengandung karakter <code>\ / ? * [ ] :</code>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Judul Utama Tabel Data
                </label>
                <input
                  type="text"
                  value={styleOptions.tableTitle ?? docTitle}
                  onChange={(e) => handleUpdate("tableTitle", e.target.value)}
                  placeholder={docTitle}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Judul ini ditempatkan di baris paling atas tabel sebagai kepala lembar kerja Excel Anda.
                </p>
              </div>
            </div>
          )}

          {/* TAB EXCEL 2: TEMA & WARNA */}
          {activeTab === "excel_style" && isExcel && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Pilih Tema Warna Header Excel
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {EXCEL_THEMES.map((th) => {
                    const isSelected = (styleOptions.excelTheme || "emerald") === th.id;
                    return (
                      <button
                        key={th.id}
                        type="button"
                        onClick={() => handleUpdate("excelTheme", th.id)}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col gap-1.5 ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20"
                            : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-4 h-4 rounded-full shadow-xs shrink-0"
                              style={{ backgroundColor: `#${th.primary}` }}
                            />
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                              {th.label}
                            </span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {th.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB EXCEL 3: FORMAT KOLOM & GRID */}
          {activeTab === "excel_columns" && isExcel && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                    Penyesuaian Lebar Kolom Otomatis (Auto-Fit Columns)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Menghitung dan melebarkan kolom sesuai panjang teks agar angka & data tidak terpotong (###).
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={styleOptions.autoFitColumns !== false}
                    onChange={(e) => handleUpdate("autoFitColumns", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                    Tampilkan Garis Kisi Sel (Gridlines)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Mengaktifkan batas garis pembatas sel bawaan Excel untuk memudahkan pembacaan lembar kerja.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={styleOptions.showGridLines !== false}
                    onChange={(e) => handleUpdate("showGridLines", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>
          )}

          {/* TAB: LOGO & KOP SURAT */}
          {activeTab === "kop" && (
            <div className="space-y-4">
              <div className="bg-indigo-50/70 dark:bg-indigo-950/30 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-3">
                <ImageIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
                  Unggah logo resmi institusi/sekolah dan atur kepala surat (Kop Surat). Logo akan disematkan secara presisi pada berkas Word (Kop & Sampul), PDF (Header Kop), dan PowerPoint (Slide 1 & Sudut Slide).
                </p>
              </div>

              {/* Logo Upload Card */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Logo Institusi / Sekolah
                    </label>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Mendukung PNG, JPG, WebP, dan SVG (transparan disarankan).
                    </span>
                  </div>
                  {styleOptions.logoBase64 && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 font-semibold cursor-pointer hover:underline"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus Logo
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                  onChange={handleLogoUpload}
                  className="hidden"
                />

                {styleOptions.logoBase64 ? (
                  <div className="flex items-center gap-4 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="w-16 h-16 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-1 overflow-hidden flex-shrink-0">
                      <img
                        src={styleOptions.logoBase64}
                        alt="Logo Preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        Logo Aktif Terpasang
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        Akan dicetak di DOCX, PDF, dan Slide PPTX.
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        <Upload className="w-3 h-3" />
                        Ganti Foto / Logo
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-xl p-6 text-center cursor-pointer transition-colors bg-white/50 dark:bg-slate-800/50 group"
                  >
                    {isUploadingLogo ? (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-600 dark:text-indigo-400" />
                        <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                          Memproses gambar...
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Upload className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-1">
                          Klik untuk Unggah Foto / Logo Institusi
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">
                          PNG, JPG, WebP, SVG • Maksimal 5 MB
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Logo Position */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Posisi Penempatan Logo di Kop Surat
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "left", label: "Kiri (Standar Kop)", icon: AlignLeft, desc: "Sisi kiri teks kop" },
                    { id: "center", label: "Tengah (Center)", icon: AlignCenter, desc: "Di atas teks kop" },
                    { id: "right", label: "Kanan (Modern)", icon: AlignRight, desc: "Sisi kanan teks kop" },
                  ].map((pos) => {
                    const isSelected = (styleOptions.logoPosition || "left") === pos.id;
                    const PosIcon = pos.icon;
                    return (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => handleUpdate("logoPosition", pos.id)}
                        className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/30 ring-2 ring-indigo-600/20"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <PosIcon className={`w-4 h-4 ${isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                          {isSelected && <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />}
                        </div>
                        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block truncate">
                          {pos.label}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {pos.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Kop Text */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Teks Kustom Kepala Surat (Kop Institusi)
                  </label>
                  <span className="text-[10px] text-slate-400">Multi-baris</span>
                </div>
                <textarea
                  rows={4}
                  value={styleOptions.customHeaderText || ""}
                  onChange={(e) => handleUpdate("customHeaderText", e.target.value)}
                  placeholder={`KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI\nUNIVERSITAS NEGERI INDONESIA\nFAKULTAS ILMU KOMPUTER\nJl. Kampus Raya No. 10, Gedung Kuliah Bersama`}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Jika diisi, baris 1 & 2 dicetak tebal dengan ukuran lebih besar, diikuti baris alamat/kontak dan garis ganda kop surat formal.
                </p>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] font-semibold text-slate-400 self-center mr-1">
                    Preset Cepat:
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdate(
                        "customHeaderText",
                        `KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI\n${(styleOptions.institution || "UNIVERSITAS NEGERI").toUpperCase()}\n${(styleOptions.facultyOrClass || "FAKULTAS TEKNIK").toUpperCase()}\nJl. Kampus Merdeka No. 1 • Telp: (021) 123456 • Website: univ.ac.id`
                      )
                    }
                    className="px-2 py-0.5 rounded-lg text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/50 transition cursor-pointer"
                  >
                    Format Kampus
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdate(
                        "customHeaderText",
                        `PEMERINTAH DAERAH PROVINSI\nDINAS PENDIDIKAN DAN KEBUDAYAAN\n${(styleOptions.institution || "SMA NEGERI 1").toUpperCase()}\nJl. Pendidikan Pelajar No. 25 • Email: info@sekolah.sch.id`
                      )
                    }
                    className="px-2 py-0.5 rounded-lg text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/50 transition cursor-pointer"
                  >
                    Format Sekolah
                  </button>
                  {styleOptions.customHeaderText && (
                    <button
                      type="button"
                      onClick={() => handleUpdate("customHeaderText", "")}
                      className="px-2 py-0.5 rounded-lg text-[10px] bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition cursor-pointer"
                    >
                      Reset Teks
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FONT & TEKS */}
          {activeTab === "typography" && (
            <div className="space-y-4">
              {/* Font Family Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Jenis Tipografi Dokumen
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {fontOptions.map((font) => {
                    const isSelected = (styleOptions.fontFamily || "Calibri") === font.id;
                    return (
                      <button
                        key={font.id}
                        type="button"
                        onClick={() => handleUpdate("fontFamily", font.id)}
                        className={`text-left p-2.5 rounded-xl border transition-all flex items-start justify-between cursor-pointer ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-600/20"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
                        }`}
                      >
                        <div>
                          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block" style={{ fontFamily: font.id }}>
                            {font.label}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {font.desc}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Font Size Scaling */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Skala Ukuran Teks
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "compact", label: "Ringkas (10pt)", desc: "Hemat kertas" },
                    { id: "normal", label: "Standar (11pt)", desc: "Akademik umum" },
                    { id: "large", label: "Besar (12pt)", desc: "Lebih lega" },
                  ].map((size) => {
                    const isSelected = (styleOptions.fontSize || "normal") === size.id;
                    return (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => handleUpdate("fontSize", size.id)}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-semibold"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300"
                        }`}
                      >
                        <div className="text-xs font-semibold">{size.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{size.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Line Spacing */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Jarak Spasi Baris Paragraf
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "single", label: "Spasi 1.0 (Rapat)" },
                    { id: "normal", label: "Spasi 1.15 (Standar)" },
                    { id: "relaxed", label: "Spasi 1.5 (Skripsi)" },
                  ].map((spacing) => {
                    const isSelected = (styleOptions.lineSpacing || "normal") === spacing.id;
                    return (
                      <button
                        key={spacing.id}
                        type="button"
                        onClick={() => handleUpdate("lineSpacing", spacing.id)}
                        className={`p-2 rounded-xl border text-center text-xs transition-all cursor-pointer ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-semibold"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300"
                        }`}
                      >
                        {spacing.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Text Alignment & First Line Indent */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Perataan Paragraf
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdate("textAlign", "justify")}
                      className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                        (styleOptions.textAlign || "justify") === "justify"
                          ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <AlignJustify className="w-3.5 h-3.5" />
                      Rata Kiri-Kanan
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdate("textAlign", "left")}
                      className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                        styleOptions.textAlign === "left"
                          ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                      Rata Kiri
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Alinea Pertama Paragraf
                  </label>
                  <button
                    type="button"
                    onClick={() => handleUpdate("firstLineIndent", !styleOptions.firstLineIndent)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      styleOptions.firstLineIndent
                        ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    <span>Menjorok 1 cm (Indent)</span>
                    <span className={`w-4 h-4 rounded flex items-center justify-center border ${styleOptions.firstLineIndent ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300"}`}>
                      {styleOptions.firstLineIndent && <Check className="w-3 h-3 stroke-[3]" />}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FORMAT HALAMAN, KOP & SAMPUL */}
          {activeTab === "layout" && (
            <div className="space-y-4">
              {/* Ukuran Kertas & Margin */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Ukuran Kertas
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "A4", label: "A4", desc: "Standar umum" },
                      { id: "Letter", label: "Letter", desc: "Internasional" },
                      { id: "F4", label: "F4 / Folio", desc: "Indonesia" },
                    ].map((paper) => {
                      const isSelected = (styleOptions.pageSize || "A4") === paper.id;
                      return (
                        <button
                          key={paper.id}
                          type="button"
                          onClick={() => handleUpdate("pageSize", paper.id)}
                          className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                            isSelected
                              ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-semibold"
                              : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          <div className="text-xs font-semibold">{paper.label}</div>
                          <div className="text-[9px] text-slate-400">{paper.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Margin Dokumen
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: "skripsi", label: "Skripsi (4-4-3-3 cm)", desc: "Kiri 4cm, Atas 4cm" },
                      { id: "normal", label: "Normal (2.54 cm)", desc: "1 inci semua sisi" },
                      { id: "narrow", label: "Sempit (1.27 cm)", desc: "Hemat ruang" },
                      { id: "wide", label: "Lebar (3.18 cm)", desc: "Lega & lapang" },
                    ].map((margin) => {
                      const isSelected = (styleOptions.pageMargin || "normal") === margin.id;
                      return (
                        <button
                          key={margin.id}
                          type="button"
                          onClick={() => handleUpdate("pageMargin", margin.id)}
                          className={`p-1.5 rounded-xl border text-center transition cursor-pointer ${
                            isSelected
                              ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-semibold"
                              : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          <div className="text-[11px] font-semibold">{margin.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Gaya Kop / Header */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Desain Kop Dokumen
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "modern", label: "Modern Card", desc: "Badge kategori & kotak info" },
                    { id: "formal_academic", label: "Kop Akademik", desc: "Garis ganda formal kampus" },
                    { id: "minimalist", label: "Minimalis", desc: "Langsung materi bersih" },
                  ].map((h) => {
                    const isSelected = (styleOptions.headerStyle || "modern") === h.id;
                    return (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => handleUpdate("headerStyle", h.id)}
                        className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-semibold"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        <div className="text-xs font-semibold">{h.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{h.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tema Warna Aksen */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Warna Aksen Heading & Tabel
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { id: "indigo", name: "Indigo", hex: "#4F46E5" },
                    { id: "navy", name: "Navy", hex: "#1E3A8A" },
                    { id: "emerald", name: "Emerald", hex: "#059669" },
                    { id: "maroon", name: "Maroon", hex: "#991B1B" },
                    { id: "slate", name: "Monokrom", hex: "#1E293B" },
                  ].map((color) => {
                    const isSelected = (styleOptions.accentColor || "indigo") === color.id;
                    return (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => handleUpdate("accentColor", color.id)}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20 ring-2 ring-indigo-500/20"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        }`}
                      >
                        <div className="w-5 h-5 rounded-full shadow-2xs" style={{ backgroundColor: color.hex }} />
                        <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300">{color.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Halaman Sampul & Daftar Isi Toggles */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                      Halaman Sampul Tersendiri (Cover Page)
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Membuat lembar sampul resmi depan untuk tugas makalah / laporan.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!styleOptions.includeCoverPage}
                      onChange={(e) => handleUpdate("includeCoverPage", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {styleOptions.includeCoverPage && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Subjudul Halaman Sampul
                    </label>
                    <input
                      type="text"
                      value={styleOptions.coverSubtitle || ""}
                      onChange={(e) => handleUpdate("coverSubtitle", e.target.value)}
                      placeholder="Contoh: Diajukan untuk Memenuhi Tugas Mata Kuliah ..."
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                      Sertakan Daftar Isi / Outline Materi
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Otomatis merangkum bab dan sub-bab materi di awal dokumen.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!styleOptions.includeToc}
                      onChange={(e) => handleUpdate("includeToc", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WATERMARK & HAK CIPTA */}
          {activeTab === "metadata" && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Metadata Pembuat Dokumen (Author / Creator)
                  </label>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Bukan "Un-named" lagi!
                  </span>
                </div>
                <input
                  type="text"
                  value={styleOptions.author || ""}
                  onChange={(e) => handleUpdate("author", e.target.value)}
                  placeholder="IOnLearn"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Nama ini tersimpan dalam properti sistem Word, PDF, PPTX, dan XLSX.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                      Sematkan Watermark IOnLearn
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Cap air diagonal di PDF & header berkas Word.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={styleOptions.watermark !== false}
                      onChange={(e) => handleUpdate("watermark", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {styleOptions.watermark !== false && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Teks Watermark
                    </label>
                    <input
                      type="text"
                      value={styleOptions.watermarkText || ""}
                      onChange={(e) => handleUpdate("watermarkText", e.target.value)}
                      placeholder="IOnLearn Study Copilot"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                    Nomor Halaman di Footer
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Menampilkan &quot;Halaman X dari Y&quot; pada setiap lembar.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={styleOptions.includePageNumbers !== false}
                    onChange={(e) => handleUpdate("includePageNumbers", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          )}

          {/* Live Preview Box */}
          <div className="p-3.5 rounded-xl border border-dashed border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/20 dark:bg-indigo-950/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {isExcel ? "Pratinjau Lembar Kerja Excel (.xlsx)" : "Pratinjau Format Dokumen"}
              </span>
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                {isExcel ? (
                  <>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold">
                      Tab: {styleOptions.sheetName || "Sheet1"}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                      Auto-fit: {styleOptions.autoFitColumns !== false ? "Aktif" : "Mati"}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold">{styleOptions.pageSize || "A4"}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">{styleOptions.pageMargin || "normal"}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">{styleOptions.fontFamily || "Calibri"}</span>
                  </>
                )}
              </div>
            </div>

            {isExcel ? (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden text-xs shadow-2xs">
                {/* Excel Table Title Bar */}
                <div
                  className="px-3 py-2 text-white font-bold flex items-center justify-between"
                  style={{ backgroundColor: `#${currentAccent.primary}` }}
                >
                  <span className="truncate">{styleOptions.tableTitle || docTitle}</span>
                  <span className="text-[10px] font-normal opacity-85 shrink-0">
                    Microsoft Excel (.xlsx)
                  </span>
                </div>
                {/* Student Meta Row */}
                {(styleOptions.userName || styleOptions.studentId || styleOptions.institution) && (
                  <div className="px-3 py-1 bg-slate-50 dark:bg-slate-800/80 text-[11px] text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 flex flex-wrap gap-x-2">
                    {styleOptions.userName && <span>Penyusun: <strong>{styleOptions.userName}</strong></span>}
                    {styleOptions.studentId && <span>NIM: <strong>{styleOptions.studentId}</strong></span>}
                    {styleOptions.institution && <span>{styleOptions.institution}</span>}
                  </div>
                )}
                {/* Simulated Table Data */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  <div className="grid grid-cols-4 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 font-semibold text-[11px] text-slate-700 dark:text-slate-300">
                    <div>No</div>
                    <div>Parameter / Kategori</div>
                    <div>Uraian Komparasi</div>
                    <div className="text-right">Nilai / Metrik</div>
                  </div>
                  <div className="grid grid-cols-4 px-3 py-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                    <div>1</div>
                    <div>Performa Sistem</div>
                    <div>Sangat Cepat & Efisien</div>
                    <div className="text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">98.5%</div>
                  </div>
                  <div className="grid grid-cols-4 px-3 py-1.5 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/30">
                    <div>2</div>
                    <div>Estimasi Anggaran</div>
                    <div>Kebutuhan Implementasi</div>
                    <div className="text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">Rp 2.500.000</div>
                  </div>
                </div>
                {/* Bottom Sheet Tab Bar */}
                <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800/90 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200">
                      📊 {styleOptions.sheetName || "Sheet1"}
                    </span>
                  </div>
                  <span>Garis Kisi: {styleOptions.showGridLines !== false ? "Aktif" : "Nonaktif"}</span>
                </div>
              </div>
            ) : (
              <div
                className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700/60 space-y-2 relative overflow-hidden text-left"
                style={{ fontFamily: styleOptions.fontFamily || "Calibri" }}
              >
                {styleOptions.watermark !== false && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-10 rotate-[-15deg] font-bold text-slate-900 dark:text-slate-100 text-base">
                    {styleOptions.watermarkText || "IOnLearn Study Copilot"}
                  </div>
                )}

                {/* Cover badge if enabled */}
                {styleOptions.includeCoverPage && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    <Bookmark className="w-3 h-3" />
                    Halaman Sampul Aktif
                  </div>
                )}

                {/* Miniature Kop Surat Preview with Logo */}
                {(styleOptions.logoBase64 || styleOptions.customHeaderText || styleOptions.headerStyle === "formal_academic") && (
                  <div className="p-2 bg-slate-50 dark:bg-slate-900/60 rounded-md border border-slate-200 dark:border-slate-700/80 mb-2">
                    <div
                      className={`flex items-center gap-2 mb-1.5 ${
                        styleOptions.logoPosition === "center"
                          ? "flex-col text-center"
                          : styleOptions.logoPosition === "right"
                          ? "flex-row-reverse text-right"
                          : "flex-row text-left"
                      }`}
                    >
                      {styleOptions.logoBase64 && (
                        <div className="w-8 h-8 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5 flex-shrink-0 flex items-center justify-center">
                          <img
                            src={styleOptions.logoBase64}
                            alt="Logo Preview"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 text-[10px] leading-tight">
                        {styleOptions.customHeaderText ? (
                          styleOptions.customHeaderText
                            .trim()
                            .split("\n")
                            .slice(0, 3)
                            .map((l, i) => (
                              <div
                                key={i}
                                className={i === 0 ? "font-bold text-slate-900 dark:text-slate-100" : "text-slate-600 dark:text-slate-400"}
                              >
                                {l.trim()}
                              </div>
                            ))
                        ) : (
                          <>
                            <div className="font-bold text-slate-900 dark:text-slate-100">
                              {(styleOptions.institution || "NAMA INSTANSI RESMI").toUpperCase()}
                            </div>
                            {styleOptions.facultyOrClass && (
                              <div className="text-slate-600 dark:text-slate-400">
                                {styleOptions.facultyOrClass.toUpperCase()}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    {/* Miniature Kop Surat double divider */}
                    <div className="border-b border-slate-800 dark:border-slate-200"></div>
                    <div className="border-b border-slate-800 dark:border-slate-200 mt-[1px]"></div>
                  </div>
                )}

                {/* Document title colored by accent */}
                <div
                  className="text-sm font-bold truncate"
                  style={{ color: `#${currentAccent.primary}` }}
                >
                  {docTitle}
                </div>

                {/* Student info tags */}
                <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-2.5 gap-y-1">
                  {styleOptions.userName && <span>Penyusun: <strong>{styleOptions.userName}</strong></span>}
                  {styleOptions.studentId && <span>NIM: <strong>{styleOptions.studentId}</strong></span>}
                  {styleOptions.facultyOrClass && <span>{styleOptions.facultyOrClass}</span>}
                  {styleOptions.institution && <span>{styleOptions.institution}</span>}
                  {!styleOptions.userName && !styleOptions.studentId && (
                    <span className="italic text-slate-400">Identitas penyusun kosong.</span>
                  )}
                </div>

                {/* Bottom footer metadata */}
                <div className="text-[10px] text-slate-400 dark:text-slate-500 pt-1.5 border-t border-slate-100 dark:border-slate-700/50 flex justify-between">
                  <span>Author: {styleOptions.author || "IOnLearn"}</span>
                  <span>{styleOptions.includePageNumbers !== false ? "Halaman 1 dari 1" : ""}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
            Preferensi tersimpan otomatis untuk dokumen berikutnya.
          </div>
          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isDownloading}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 text-xs font-semibold text-white rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
              style={{ backgroundColor: `#${currentAccent.primary}` }}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Merender {docType}...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Unduh Dokumen Sekarang
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentCustomizerModal;
