"use client";

import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  Packer,
  BorderStyle,
  WidthType,
  AlignmentType,
  Header,
  Footer,
  PageNumber,
  PageBreak,
  ImageRun,
  convertMillimetersToTwip,
} from "docx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import pptxgen from "pptxgenjs";
import * as XLSX from "xlsx";
import { CreatedDocument, CreatedSlides, DocumentStyleOptions } from "@/types";
import { cleanLatexMath } from "./mathUtils";

export { cleanLatexMath };

export const ACCENT_PALETTES = {
  indigo: {
    primary: "4F46E5",
    primaryDark: "3730A3",
    lightBg: "EEF2FF",
    borderColor: "C7D2FE",
    textMuted: "6366F1",
    subtleFill: "F8FAFC",
    pdfRgb: [79, 70, 229] as [number, number, number],
  },
  navy: {
    primary: "1E3A8A",
    primaryDark: "172554",
    lightBg: "EFF6FF",
    borderColor: "BFDBFE",
    textMuted: "2563EB",
    subtleFill: "F8FAFC",
    pdfRgb: [30, 58, 138] as [number, number, number],
  },
  emerald: {
    primary: "059669",
    primaryDark: "064E3B",
    lightBg: "ECFDF5",
    borderColor: "A7F3D0",
    textMuted: "047857",
    subtleFill: "F0FDF4",
    pdfRgb: [5, 150, 105] as [number, number, number],
  },
  maroon: {
    primary: "991B1B",
    primaryDark: "7F1D1D",
    lightBg: "FEF2F2",
    borderColor: "FECACA",
    textMuted: "B91C1C",
    subtleFill: "FFF5F5",
    pdfRgb: [153, 27, 27] as [number, number, number],
  },
  slate: {
    primary: "1E293B",
    primaryDark: "0F172A",
    lightBg: "F1F5F9",
    borderColor: "CBD5E1",
    textMuted: "475569",
    subtleFill: "F8FAFC",
    pdfRgb: [30, 41, 59] as [number, number, number],
  },
};

export const DEFAULT_DOCUMENT_STYLE: DocumentStyleOptions = {
  author: "IOnLearn",
  fontFamily: "Calibri",
  fontSize: "normal",
  lineSpacing: "normal",
  pageSize: "A4",
  pageMargin: "normal",
  headerStyle: "modern",
  includeCoverPage: false,
  accentColor: "indigo",
  textAlign: "justify",
  firstLineIndent: false,
  includePageNumbers: true,
  includeToc: false,
  watermark: true,
  watermarkText: "IOnLearn Study Copilot",
  logoBase64: undefined,
  customHeaderText: "",
  logoPosition: "left",
  sheetName: "Sheet1",
  excelTheme: "emerald",
  autoFitColumns: true,
  showGridLines: true,
};

export const DOC_STYLE_STORAGE_KEY = "ionlearn_doc_style_prefs";

export function loadSavedDocStyle(): DocumentStyleOptions {
  if (typeof window === "undefined") return DEFAULT_DOCUMENT_STYLE;
  try {
    const raw = localStorage.getItem(DOC_STYLE_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_DOCUMENT_STYLE, ...JSON.parse(raw) };
    }
  } catch {}
  return DEFAULT_DOCUMENT_STYLE;
}

export function saveDocStyle(options: DocumentStyleOptions) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DOC_STYLE_STORAGE_KEY, JSON.stringify(options));
  } catch {}
}

/**
 * Trigger file download on client side
 */
export function triggerFileDownload(blob: Blob, filename: string) {
  if (typeof window === "undefined") return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 300);
}

/**
 * Convert base64 data URL to Uint8Array for docx ImageRun
 */
export function base64ToUint8Array(base64: string): Uint8Array | null {
  try {
    const cleanBase64 = base64.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, "").trim();
    if (!cleanBase64) return null;
    const binaryString = atob(cleanBase64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (e) {
    console.error("Failed to parse base64 image:", e);
    return null;
  }
}

/**
 * Clean markdown symbols for text runs with configurable font and size
 */
function parseInlineFormatting(text: string, font?: string, baseSize?: number): TextRun[] {
  // Parse bold **text** or *italic*
  const runs: TextRun[] = [];
  const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|([^*`]+))/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match[2]) {
      // Bold
      runs.push(new TextRun({ text: match[2], bold: true, font, size: baseSize }));
    } else if (match[3]) {
      // Italic
      runs.push(new TextRun({ text: match[3], italics: true, font, size: baseSize }));
    } else if (match[4]) {
      // Code
      runs.push(new TextRun({ text: match[4], font: "Courier New", size: baseSize ? baseSize - 2 : undefined, shading: { fill: "F1F5F9" } }));
    } else if (match[5]) {
      runs.push(new TextRun({ text: match[5], font, size: baseSize }));
    }
  }

  if (runs.length === 0) {
    runs.push(new TextRun({ text, font, size: baseSize }));
  }

  return runs;
}

/**
 * Generate Microsoft Word (.docx) file from title and markdown content
 */
export async function generateWordDocument(
  doc: {
    title: string;
    content: string;
    subject?: string;
    fileName?: string;
  },
  options?: DocumentStyleOptions
): Promise<Blob> {
  const cleanTitle = cleanLatexMath(doc.title);
  const cleanSubject = doc.subject ? cleanLatexMath(doc.subject) : undefined;
  const cleanContent = cleanLatexMath(doc.content);

  const targetFont = options?.fontFamily || "Calibri";
  const authorName = options?.author?.trim() || "IOnLearn";
  const isCompact = options?.fontSize === "compact";
  const isLarge = options?.fontSize === "large";

  const accentKey = options?.accentColor || "indigo";
  const accent = ACCENT_PALETTES[accentKey] || ACCENT_PALETTES.indigo;

  // Sizes in half-points (24 = 12pt, 28 = 14pt, 36 = 18pt)
  const titleSize = isCompact ? 30 : isLarge ? 42 : 36;
  const subjectSize = isCompact ? 18 : isLarge ? 22 : 20;
  const h1Size = isCompact ? 24 : isLarge ? 32 : 28;
  const h2Size = isCompact ? 20 : isLarge ? 28 : 24;
  const h3Size = isCompact ? 18 : isLarge ? 24 : 20;
  const bodySize = isCompact ? 18 : isLarge ? 24 : 22;
  const tableSize = isCompact ? 16 : isLarge ? 20 : 18;

  // Line spacing in 240ths of a line (240 = single, 276 = 1.15, 360 = 1.5)
  const lineSpacingTwips =
    options?.lineSpacing === "single" ? 240 : options?.lineSpacing === "relaxed" ? 360 : 276;

  // Text alignment
  const paragraphAlignment =
    options?.textAlign === "left" ? AlignmentType.LEFT : AlignmentType.JUSTIFIED;

  // First line indent: 1 cm (567 twips)
  const firstLineIndentTwips = options?.firstLineIndent
    ? convertMillimetersToTwip(10)
    : undefined;

  const logoBytes = options?.logoBase64 ? base64ToUint8Array(options.logoBase64) : null;
  const logoImageType: "png" | "jpg" | "gif" | "bmp" =
    options?.logoBase64?.includes("image/jpeg") || options?.logoBase64?.includes("image/jpg")
      ? "jpg"
      : "png";
  const paragraphs: (Paragraph | Table)[] = [];

  // ==========================================
  // 1. Optional Academic Cover Page
  // ==========================================
  if (options?.includeCoverPage) {
    paragraphs.push(new Paragraph({ spacing: { before: 800 } }));

    if (options.institution) {
      paragraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 160 },
          children: [
            new TextRun({
              text: options.institution.toUpperCase(),
              bold: true,
              font: targetFont,
              size: isCompact ? 22 : 26,
              color: accent.primaryDark,
            }),
          ],
        })
      );
    }

    if (options.facultyOrClass) {
      paragraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 220 },
          children: [
            new TextRun({
              text: options.facultyOrClass.toUpperCase(),
              font: targetFont,
              size: isCompact ? 18 : 20,
              color: "475569",
            }),
          ],
        })
      );
    }

    // Cover Page Logo (Centered between Institution & Title)
    if (logoBytes) {
      paragraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 180, after: 260 },
          children: [
            new ImageRun({
              type: logoImageType,
              data: logoBytes,
              transformation: {
                width: isCompact ? 72 : 88,
                height: isCompact ? 72 : 88,
              },
            }),
          ],
        })
      );
    }

    // Cover Title
    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 600, after: 240 },
        children: [
          new TextRun({
            text: cleanTitle.toUpperCase(),
            bold: true,
            font: targetFont,
            size: isCompact ? 36 : isLarge ? 48 : 42,
            color: accent.primary,
          }),
        ],
      })
    );

    const coverSub =
      options.coverSubtitle ||
      (cleanSubject ? `Topik / Mata Pelajaran: ${cleanSubject}` : "Kajian & Laporan Akademik");
    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
        children: [
          new TextRun({
            text: coverSub,
            italics: true,
            font: targetFont,
            size: isCompact ? 20 : 24,
            color: "64748B",
          }),
        ],
      })
    );

    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 800 },
        children: [
          new TextRun({
            text: "— MAKALAH / TUGAS PEMBELAJARAN —",
            bold: true,
            font: targetFont,
            size: 18,
            color: accent.textMuted,
          }),
        ],
      })
    );

    // Disusun Oleh section
    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: "Disusun Oleh:",
            font: targetFont,
            size: 20,
            color: "64748B",
          }),
        ],
      })
    );

    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [
          new TextRun({
            text: options.userName || "Mahasiswa / Siswa",
            bold: true,
            font: targetFont,
            size: isCompact ? 24 : 28,
            color: "0F172A",
          }),
        ],
      })
    );

    if (options.studentId) {
      paragraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: `NIM / NIS: ${options.studentId}`,
              font: targetFont,
              size: 20,
              color: "334155",
            }),
          ],
        })
      );
    }

    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 800, after: 200 },
        children: [
          new TextRun({
            text: `${new Date().getFullYear()}`,
            bold: true,
            font: targetFont,
            size: 22,
            color: accent.primaryDark,
          }),
        ],
      })
    );

    paragraphs.push(
      new Paragraph({
        children: [new PageBreak()],
      })
    );
  }

  // ==========================================
  // 2. Main Document Header (Styles: modern / formal_academic / minimalist)
  // ==========================================
  if (options?.headerStyle === "formal_academic") {
    // Formal Academic Kop Surat Style (Support Logo + Custom Header / Institution)
    const headerLines: Paragraph[] = [];
    if (options?.customHeaderText && options.customHeaderText.trim().length > 0) {
      const lines = options.customHeaderText.trim().split("\n");
      lines.forEach((line, lIdx) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        headerLines.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 30 },
            children: [
              new TextRun({
                text: trimmed,
                bold: lIdx === 0 || lIdx === 1,
                font: targetFont,
                size: lIdx === 0 ? (isCompact ? 22 : 24) : (isCompact ? 18 : 20),
                color: lIdx === 0 ? "0F172A" : "334155",
              }),
            ],
          })
        );
      });
    } else {
      if (options?.institution) {
        headerLines.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 50 },
            children: [
              new TextRun({
                text: options.institution.toUpperCase(),
                bold: true,
                font: targetFont,
                size: isCompact ? 22 : 26,
                color: "0F172A",
              }),
            ],
          })
        );
      }
      if (options?.facultyOrClass) {
        headerLines.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 50 },
            children: [
              new TextRun({
                text: options.facultyOrClass.toUpperCase(),
                font: targetFont,
                size: isCompact ? 18 : 20,
                color: "334155",
              }),
            ],
          })
        );
      }
      if (cleanSubject) {
        headerLines.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 70 },
            children: [
              new TextRun({
                text: `Mata Pelajaran / Topik: ${cleanSubject}`,
                italics: true,
                font: targetFont,
                size: isCompact ? 18 : 20,
                color: "475569",
              }),
            ],
          })
        );
      }
    }

    if (logoBytes) {
      if (options?.logoPosition === "center") {
        paragraphs.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [
              new ImageRun({
                type: logoImageType,
                data: logoBytes,
                transformation: { width: isCompact ? 55 : 65, height: isCompact ? 55 : 65 },
              }),
            ],
          })
        );
        paragraphs.push(...headerLines);
      } else {
        // 2-column borderless table for Kop Surat (left or right)
        const logoCell = new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new ImageRun({
                  type: logoImageType,
                  data: logoBytes,
                  transformation: { width: isCompact ? 55 : 65, height: isCompact ? 55 : 65 },
                }),
              ],
            }),
          ],
        });
        const textCell = new TableCell({
          width: { size: 80, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: headerLines.length > 0 ? headerLines : [new Paragraph({})],
        });
        paragraphs.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: options?.logoPosition === "right" ? [textCell, logoCell] : [logoCell, textCell],
              }),
            ],
          })
        );
      }
    } else {
      paragraphs.push(...headerLines);
    }

    // Double-line border under academic kop
    paragraphs.push(
      new Paragraph({
        border: { bottom: { style: BorderStyle.DOUBLE, size: 12, color: "000000" } },
        spacing: { after: 200 },
      })
    );

    // Document Title
    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        heading: HeadingLevel.TITLE,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: cleanTitle.toUpperCase(),
            bold: true,
            font: targetFont,
            size: titleSize,
            color: "0F172A",
          }),
        ],
      })
    );

    // Student identity line
    const studentMetaParts: string[] = [];
    if (options?.userName) studentMetaParts.push(`Penyusun: ${options.userName}`);
    if (options?.studentId) studentMetaParts.push(`NIM/NIS: ${options.studentId}`);
    if (studentMetaParts.length > 0) {
      paragraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 160 },
          children: [
            new TextRun({
              text: studentMetaParts.join("   •   "),
              italics: true,
              font: targetFont,
              size: bodySize - 2,
              color: "475569",
            }),
          ],
        })
      );
    }
  } else if (options?.headerStyle === "minimalist") {
    // Minimalist Clean Header
    paragraphs.push(
      new Paragraph({
        heading: HeadingLevel.TITLE,
        spacing: { after: 80 },
        children: [
          new TextRun({
            text: cleanTitle,
            bold: true,
            font: targetFont,
            size: titleSize,
            color: "0F172A",
          }),
        ],
      })
    );

    if (cleanSubject) {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: cleanSubject,
              italics: true,
              font: targetFont,
              size: subjectSize,
              color: "64748B",
            }),
          ],
        })
      );
    }

    const inlineParts: string[] = [];
    if (options?.userName) inlineParts.push(`Penyusun: ${options.userName}`);
    if (options?.studentId) inlineParts.push(`NIM/NIS: ${options.studentId}`);
    if (options?.institution) inlineParts.push(options.institution);
    if (inlineParts.length > 0) {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 140 },
          children: [
            new TextRun({
              text: inlineParts.join("   •   "),
              font: targetFont,
              size: bodySize - 2,
              color: "475569",
            }),
          ],
        })
      );
    }

    paragraphs.push(
      new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" } },
        spacing: { after: 180 },
      })
    );
  } else {
    // Modern (Default): Logo, Custom Header / Category Pill, Title with accent color, and sleek metadata box
    if (logoBytes) {
      paragraphs.push(
        new Paragraph({
          alignment:
            options?.logoPosition === "center"
              ? AlignmentType.CENTER
              : options?.logoPosition === "right"
              ? AlignmentType.RIGHT
              : AlignmentType.LEFT,
          spacing: { after: 100 },
          children: [
            new ImageRun({
              type: logoImageType,
              data: logoBytes,
              transformation: {
                width: isCompact ? 50 : 62,
                height: isCompact ? 50 : 62,
              },
            }),
          ],
        })
      );
    }

    if (options?.customHeaderText && options.customHeaderText.trim().length > 0) {
      const cLines = options.customHeaderText.trim().split("\n");
      cLines.forEach((cl, cIdx) => {
        const tr = cl.trim();
        if (!tr) return;
        paragraphs.push(
          new Paragraph({
            alignment:
              options?.logoPosition === "center"
                ? AlignmentType.CENTER
                : options?.logoPosition === "right"
                ? AlignmentType.RIGHT
                : AlignmentType.LEFT,
            spacing: { after: 20 },
            children: [
              new TextRun({
                text: tr,
                bold: cIdx === 0,
                font: targetFont,
                size: cIdx === 0 ? (isCompact ? 18 : 20) : (isCompact ? 16 : 18),
                color: cIdx === 0 ? accent.primaryDark : "475569",
              }),
            ],
          })
        );
      });
      paragraphs.push(
        new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: accent.borderColor } },
          spacing: { after: 120 },
        })
      );
    }

    if (cleanSubject) {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: `  ${cleanSubject.toUpperCase()}  `,
              bold: true,
              font: targetFont,
              size: 16,
              color: accent.primary,
              shading: { fill: accent.lightBg },
            }),
          ],
        })
      );
    }

    paragraphs.push(
      new Paragraph({
        heading: HeadingLevel.TITLE,
        spacing: { after: 140 },
        children: [
          new TextRun({
            text: cleanTitle,
            bold: true,
            font: targetFont,
            size: titleSize,
            color: accent.primaryDark,
          }),
        ],
      })
    );

    // Modern Student Info Card (1 Row Table)
    const hasStudentMeta = options?.userName || options?.studentId || options?.institution || options?.facultyOrClass;
    if (hasStudentMeta) {
      const metaItems: Array<{ label: string; val?: string }> = [
        { label: "Penyusun", val: options?.userName },
        { label: "NIM / NIS", val: options?.studentId },
        { label: "Kelas / Jurusan", val: options?.facultyOrClass },
        { label: "Instansi", val: options?.institution },
      ].filter((item) => item.val);

      if (metaItems.length > 0) {
        paragraphs.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: metaItems.map(
                  (item) =>
                    new TableCell({
                      width: { size: Math.floor(100 / metaItems.length), type: WidthType.PERCENTAGE },
                      shading: { fill: accent.lightBg },
                      margins: { top: 80, bottom: 80, left: 120, right: 120 },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({ text: `${item.label}: `, bold: true, font: targetFont, size: bodySize - 4, color: accent.primary }),
                            new TextRun({ text: item.val || "", font: targetFont, size: bodySize - 4, color: "0F172A" }),
                          ],
                        }),
                      ],
                    })
                ),
              }),
            ],
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: accent.borderColor },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: accent.borderColor },
              left: { style: BorderStyle.SINGLE, size: 1, color: accent.borderColor },
              right: { style: BorderStyle.SINGLE, size: 1, color: accent.borderColor },
              insideVertical: { style: BorderStyle.SINGLE, size: 1, color: accent.borderColor },
            },
          })
        );
        paragraphs.push(new Paragraph({ spacing: { after: 160 } }));
      }
    }
  }

  // ==========================================
  // 3. Optional Table of Contents (Outline Materi)
  // ==========================================
  const lines = cleanContent.split("\n");
  if (options?.includeToc) {
    const headings = lines
      .filter((l) => /^#{1,3}\s+/.test(l.trim()))
      .map((l) => {
        const match = l.trim().match(/^(#{1,3})\s+(.*)$/);
        return {
          level: match ? match[1].length : 1,
          text: match ? match[2].replace(/[*_`]/g, "").trim() : "",
        };
      });

    if (headings.length > 1) {
      paragraphs.push(
        new Paragraph({
          spacing: { before: 120, after: 100 },
          children: [
            new TextRun({
              text: "DAFTAR ISI & STRUKTUR PEMBAHASAN",
              bold: true,
              font: targetFont,
              size: h2Size,
              color: accent.primaryDark,
            }),
          ],
        })
      );

      headings.forEach((h, idx) => {
        const indentTwips = (h.level - 1) * 360;
        paragraphs.push(
          new Paragraph({
            indent: { left: indentTwips },
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: `${h.level === 1 ? `${idx + 1}. ` : "• "}${h.text}`,
                bold: h.level === 1,
                font: targetFont,
                size: bodySize - (h.level > 1 ? 2 : 0),
                color: h.level === 1 ? "0F172A" : "334155",
              }),
            ],
          })
        );
      });

      paragraphs.push(
        new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: accent.borderColor } },
          spacing: { after: 200 },
        })
      );
    }
  }

  // ==========================================
  // 4. Parse Markdown Lines into Word Elements
  // ==========================================
  let tableRows: string[][] = [];
  let inTable = false;
  let inCodeBlock = false;

  const flushTable = () => {
    if (tableRows.length > 0) {
      const headerRow = tableRows[0];
      const dataRows = tableRows.slice(1).filter((r) => !r.every((c) => c.match(/^[:\-\s]+$/)));

      const wordTableRows: TableRow[] = [];

      // Header row with accent theme color
      wordTableRows.push(
        new TableRow({
          tableHeader: true,
          children: headerRow.map(
            (cell) =>
              new TableCell({
                width: { size: Math.floor(100 / headerRow.length), type: WidthType.PERCENTAGE },
                shading: { fill: accent.primary },
                margins: { top: 100, bottom: 100, left: 120, right: 120 },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: cell.trim(), bold: true, font: targetFont, size: tableSize, color: "FFFFFF" })],
                  }),
                ],
              })
          ),
        })
      );

      // Data rows
      for (let rIdx = 0; rIdx < dataRows.length; rIdx++) {
        const row = dataRows[rIdx];
        const isAlternate = rIdx % 2 === 1;
        wordTableRows.push(
          new TableRow({
            children: row.map(
              (cell) =>
                new TableCell({
                  width: { size: Math.floor(100 / headerRow.length), type: WidthType.PERCENTAGE },
                  shading: isAlternate ? { fill: accent.subtleFill } : undefined,
                  margins: { top: 80, bottom: 80, left: 120, right: 120 },
                  children: [
                    new Paragraph({
                      children: parseInlineFormatting(cell.trim(), targetFont, tableSize),
                    }),
                  ],
                })
            ),
          })
        );
      }

      paragraphs.push(
        new Table({
          rows: wordTableRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: accent.borderColor },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: accent.borderColor },
            left: { style: BorderStyle.SINGLE, size: 1, color: accent.borderColor },
            right: { style: BorderStyle.SINGLE, size: 1, color: accent.borderColor },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
            insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
          },
        })
      );

      paragraphs.push(new Paragraph({ spacing: { after: 120 } }));
      tableRows = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trimEnd();
    const line = rawLine.trim();

    // Check fenced code block
    if (line.startsWith("```")) {
      if (inTable) flushTable();
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 20 },
          shading: { fill: "F8FAFC" },
          border: { left: { style: BorderStyle.SINGLE, size: 12, color: accent.borderColor } },
          indent: { left: 240 },
          children: [
            new TextRun({
              text: rawLine || " ",
              font: "Courier New",
              size: isCompact ? 14 : 16,
              color: "1E293B",
            }),
          ],
        })
      );
      continue;
    }

    // Markdown Table check
    if (line.startsWith("|") && line.endsWith("|")) {
      const cells = line
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());
      tableRows.push(cells);
      inTable = true;
      continue;
    } else if (inTable) {
      flushTable();
    }

    if (!line) {
      paragraphs.push(new Paragraph({ spacing: { after: 80 } }));
      continue;
    }

    if (line.startsWith("# ")) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 260, after: 120, line: lineSpacingTwips },
          children: [
            new TextRun({
              text: line.replace(/^#\s+/, ""),
              bold: true,
              font: targetFont,
              size: h1Size,
              color: accent.primaryDark,
            }),
          ],
        })
      );
    } else if (line.startsWith("## ")) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100, line: lineSpacingTwips },
          children: [
            new TextRun({
              text: line.replace(/^##\s+/, ""),
              bold: true,
              font: targetFont,
              size: h2Size,
              color: accent.primary,
            }),
          ],
        })
      );
    } else if (line.startsWith("### ")) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 160, after: 80, line: lineSpacingTwips },
          children: [
            new TextRun({
              text: line.replace(/^###\s+/, ""),
              bold: true,
              font: targetFont,
              size: h3Size,
              color: accent.textMuted,
            }),
          ],
        })
      );
    } else if (line.startsWith("- ") || line.startsWith("* ") || line.startsWith("• ")) {
      const itemText = line.replace(/^[-*•]\s+/, "");
      paragraphs.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 60, line: lineSpacingTwips },
          alignment: paragraphAlignment,
          children: parseInlineFormatting(itemText, targetFont, bodySize),
        })
      );
    } else if (/^\d+[\.\)]\s+/.test(line)) {
      const itemText = line.replace(/^\d+[\.\)]\s+/, "");
      paragraphs.push(
        new Paragraph({
          numbering: { reference: "default-numbering", level: 0 },
          spacing: { after: 60, line: lineSpacingTwips },
          alignment: paragraphAlignment,
          children: parseInlineFormatting(itemText, targetFont, bodySize),
        })
      );
    } else if (line.startsWith("> ")) {
      const quoteText = line.replace(/^>\s*/, "");
      paragraphs.push(
        new Paragraph({
          indent: { left: 360 },
          border: { left: { style: BorderStyle.SINGLE, size: 16, color: accent.primary } },
          shading: { fill: accent.subtleFill },
          spacing: { before: 80, after: 80, line: lineSpacingTwips },
          alignment: paragraphAlignment,
          children: [
            new TextRun({
              text: ` "${quoteText}"`,
              italics: true,
              font: targetFont,
              size: bodySize,
              color: "475569",
            }),
          ],
        })
      );
    } else {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 100, line: lineSpacingTwips },
          alignment: paragraphAlignment,
          indent: firstLineIndentTwips ? { firstLine: firstLineIndentTwips } : undefined,
          children: parseInlineFormatting(rawLine, targetFont, bodySize),
        })
      );
    }
  }

  if (inTable) {
    flushTable();
  }

  // Subtle End-of-document separator
  paragraphs.push(
    new Paragraph({
      spacing: { before: 300, after: 100 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "— Dibuat dengan IOnLearn Study Copilot —",
          italics: true,
          font: targetFont,
          size: 16,
          color: "94A3B8",
        }),
      ],
    })
  );

  // Page Size Twips Calculation
  const pageSizeType = options?.pageSize || "A4";
  const pageSizeTwips =
    pageSizeType === "Letter"
      ? { width: convertMillimetersToTwip(215.9), height: convertMillimetersToTwip(279.4) }
      : pageSizeType === "F4"
      ? { width: convertMillimetersToTwip(215), height: convertMillimetersToTwip(330) }
      : { width: convertMillimetersToTwip(210), height: convertMillimetersToTwip(297) };

  // Page Margins Twips Calculation
  const marginType = options?.pageMargin || "normal";
  const pageMarginTwips =
    marginType === "skripsi"
      ? {
          top: convertMillimetersToTwip(40),
          left: convertMillimetersToTwip(40),
          right: convertMillimetersToTwip(30),
          bottom: convertMillimetersToTwip(30),
        }
      : marginType === "narrow"
      ? {
          top: convertMillimetersToTwip(12.7),
          left: convertMillimetersToTwip(12.7),
          right: convertMillimetersToTwip(12.7),
          bottom: convertMillimetersToTwip(12.7),
        }
      : marginType === "wide"
      ? {
          top: convertMillimetersToTwip(31.8),
          left: convertMillimetersToTwip(31.8),
          right: convertMillimetersToTwip(31.8),
          bottom: convertMillimetersToTwip(31.8),
        }
      : {
          top: convertMillimetersToTwip(25.4),
          left: convertMillimetersToTwip(25.4),
          right: convertMillimetersToTwip(25.4),
          bottom: convertMillimetersToTwip(25.4),
        };

  const wordDoc = new Document({
    creator: authorName,
    title: cleanTitle,
    description: "Dibuat dengan IOnLearn Study Copilot",
    sections: [
      {
        properties: {
          page: {
            size: pageSizeTwips,
            margin: pageMarginTwips,
          },
        },
        headers:
          options?.watermark !== false
            ? {
                default: new Header({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.RIGHT,
                      children: [
                        new TextRun({
                          text: options?.watermarkText || "IOnLearn Study Copilot",
                          italics: true,
                          size: 16,
                          color: "CBD5E1",
                          font: targetFont,
                        }),
                      ],
                    }),
                  ],
                }),
              }
            : undefined,
        footers:
          options?.includePageNumbers !== false
            ? {
                default: new Footer({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.RIGHT,
                      children: [
                        new TextRun({
                          children: ["Halaman ", PageNumber.CURRENT, " dari ", PageNumber.TOTAL_PAGES],
                          font: targetFont,
                          size: 16,
                          color: "94A3B8",
                        }),
                      ],
                    }),
                  ],
                }),
              }
            : undefined,
        children: paragraphs,
      },
    ],
  });

  return await Packer.toBlob(wordDoc);
}

/**
 * Generate PDF file from title and markdown content using jsPDF & autotable
 */
export async function generatePdfDocument(
  doc: {
    title: string;
    content: string;
    subject?: string;
    fileName?: string;
  },
  options?: DocumentStyleOptions
): Promise<Blob> {
  const cleanTitle = cleanLatexMath(doc.title);
  const cleanSubject = doc.subject ? cleanLatexMath(doc.subject) : undefined;
  const cleanContent = cleanLatexMath(doc.content);

  const authorName = options?.author?.trim() || "IOnLearn";
  const isCompact = options?.fontSize === "compact";
  const isLarge = options?.fontSize === "large";

  const pdfFont = options?.fontFamily === "Times New Roman"
    ? "times"
    : options?.fontFamily === "Courier New"
    ? "courier"
    : "helvetica";

  const accentKey = options?.accentColor || "indigo";
  const accent = ACCENT_PALETTES[accentKey] || ACCENT_PALETTES.indigo;

  const titleSize = isCompact ? 15 : isLarge ? 21 : 18;
  const h1Size = isCompact ? 12 : isLarge ? 16 : 14;
  const h2Size = isCompact ? 10.5 : isLarge ? 14 : 12;
  const h3Size = isCompact ? 9.5 : isLarge ? 12 : 10.5;
  const bodySize = isCompact ? 8.5 : isLarge ? 11 : 9.5;
  const subjectSize = isCompact ? 9 : isLarge ? 11 : 10;

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: options?.pageSize === "Letter" ? "letter" : "a4",
  });

  pdf.setProperties({
    title: cleanTitle,
    subject: cleanSubject || "IOnLearn Study Copilot",
    author: authorName,
    creator: "IOnLearn Study Copilot",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = 12;

  // Header band with theme accent color
  pdf.setFillColor(accent.pdfRgb[0], accent.pdfRgb[1], accent.pdfRgb[2]);
  pdf.rect(0, 0, pageWidth, 4, "F");

  // Kop Surat / Logo Header (Formal Academic or Custom Header / Logo)
  const hasKopLogo = !!options?.logoBase64;
  const hasCustomKopText = !!(options?.customHeaderText && options.customHeaderText.trim().length > 0);
  const isFormalKop = options?.headerStyle === "formal_academic" || hasKopLogo || hasCustomKopText;

  if (isFormalKop && (hasKopLogo || hasCustomKopText || options?.institution)) {
    const kopStartY = cursorY;
    const logoSize = 16;
    const logoPos = options?.logoPosition || "left";

    // Draw logo if present
    if (hasKopLogo && options?.logoBase64) {
      try {
        let logoX = margin;
        if (logoPos === "center") {
          logoX = (pageWidth - logoSize) / 2;
        } else if (logoPos === "right") {
          logoX = pageWidth - margin - logoSize;
        }
        pdf.addImage(options.logoBase64, logoX, cursorY, logoSize, logoSize);
        if (logoPos === "center") {
          cursorY += logoSize + 2;
        }
      } catch (err) {
        console.warn("Gagal menyematkan logo di PDF:", err);
      }
    }

    // Draw Kop Text lines
    const textLines: Array<{ text: string; bold: boolean; size: number }> = [];
    if (hasCustomKopText && options?.customHeaderText) {
      const splitLines = options.customHeaderText.trim().split("\n");
      splitLines.forEach((sl, idx) => {
        const tr = sl.trim();
        if (tr) {
          textLines.push({
            text: tr,
            bold: idx === 0 || idx === 1,
            size: idx === 0 ? 11 : idx === 1 ? 9.5 : 8.5,
          });
        }
      });
    } else {
      if (options?.institution) {
        textLines.push({ text: options.institution.toUpperCase(), bold: true, size: 11 });
      }
      if (options?.facultyOrClass) {
        textLines.push({ text: options.facultyOrClass.toUpperCase(), bold: false, size: 9.5 });
      }
      if (cleanSubject && options?.headerStyle === "formal_academic") {
        textLines.push({ text: `Topik: ${cleanSubject}`, bold: false, size: 8.5 });
      }
    }

    if (textLines.length > 0) {
      let textCursorY = logoPos === "center" ? cursorY : kopStartY + 2;
      const textCenterX =
        logoPos === "left" && hasKopLogo
          ? (margin + logoSize + pageWidth - margin) / 2
          : logoPos === "right" && hasKopLogo
          ? (margin + pageWidth - margin - logoSize) / 2
          : pageWidth / 2;

      textLines.forEach((item) => {
        pdf.setFont(pdfFont, item.bold ? "bold" : "normal");
        pdf.setFontSize(item.size);
        pdf.setTextColor(15, 23, 42);
        pdf.text(item.text, textCenterX, textCursorY, { align: "center" });
        textCursorY += 4.2;
      });

      cursorY = Math.max(cursorY, textCursorY, hasKopLogo && logoPos !== "center" ? kopStartY + logoSize + 2 : 0);
    } else if (hasKopLogo && logoPos !== "center") {
      cursorY = kopStartY + logoSize + 2;
    }

    // Double-line border for Kop Surat
    cursorY += 1.5;
    pdf.setDrawColor(15, 23, 42);
    pdf.setLineWidth(0.5);
    pdf.line(margin, cursorY, pageWidth - margin, cursorY);
    pdf.setLineWidth(0.2);
    pdf.line(margin, cursorY + 0.7, pageWidth - margin, cursorY + 0.7);
    cursorY += 5;
  } else {
    cursorY = 16;
  }

  // Title
  pdf.setFont(pdfFont, "bold");
  pdf.setFontSize(titleSize);
  pdf.setTextColor(15, 23, 42); // Slate 900
  const titleLines = pdf.splitTextToSize(cleanTitle, contentWidth);
  pdf.text(titleLines, margin, cursorY);
  cursorY += titleLines.length * (isCompact ? 6 : 7.5) + 2;

  // Subject / Metadata
  if (cleanSubject) {
    pdf.setFont(pdfFont, "normal");
    pdf.setFontSize(subjectSize);
    pdf.setTextColor(100, 116, 139); // Slate 500
    pdf.text(`Topik / Mata Pelajaran: ${cleanSubject}`, margin, cursorY);
    cursorY += 5;
  }

  // Student info metadata block if present
  if (options?.userName || options?.studentId || options?.institution) {
    pdf.setFont(pdfFont, "bold");
    pdf.setFontSize(isCompact ? 8.5 : 9.5);
    pdf.setTextColor(51, 65, 85);
    const metaParts = [];
    if (options.userName) metaParts.push(`Penyusun: ${options.userName}`);
    if (options.studentId) metaParts.push(`NIM/NIS: ${options.studentId}`);
    if (options.institution) metaParts.push(`${options.institution}`);
    pdf.text(metaParts.join("  •  "), margin, cursorY);
    cursorY += 5.5;
  }

  // Date & App mark
  pdf.setFont(pdfFont, "italic");
  pdf.setFontSize(isCompact ? 8 : 9);
  pdf.setTextColor(148, 163, 184); // Slate 400
  pdf.text(`IOnLearn Study Copilot • ${new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}`, margin, cursorY);
  cursorY += 7;

  // Divider Line
  pdf.setDrawColor(226, 232, 240); // Slate 200
  pdf.setLineWidth(0.4);
  pdf.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 8;

  // Parse lines & render
  const lines = cleanContent.split("\n");
  let tableRows: string[][] = [];
  let inTable = false;

  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - 20) {
      pdf.addPage();
      pdf.setFillColor(79, 70, 229);
      pdf.rect(0, 0, pageWidth, 4, "F");
      cursorY = 20;
    }
  };

  const flushPdfTable = () => {
    if (tableRows.length > 0) {
      const headerRow = tableRows[0];
      const bodyRows = tableRows.slice(1).filter((r) => !r.every((c) => c.match(/^[:\-\s]+$/)));

      autoTable(pdf, {
        startY: cursorY,
        head: [headerRow],
        body: bodyRows,
        margin: { left: margin, right: margin },
        styles: { font: pdfFont as any, fontSize: isCompact ? 7.5 : 8.5, cellPadding: 2.5, textColor: [30, 41, 59] },
        headStyles: { fillColor: accent.pdfRgb, textColor: [255, 255, 255], fontStyle: "bold" },
        alternateRowStyles: { fillColor: [248, 250, 252] },
      });

      // @ts-ignore
      cursorY = (pdf as any).lastAutoTable.finalY + 8;
      tableRows = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trimEnd();
    const line = rawLine.trim();

    // Table
    if (line.startsWith("|") && line.endsWith("|")) {
      const cells = line
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());
      tableRows.push(cells);
      inTable = true;
      continue;
    } else if (inTable) {
      flushPdfTable();
    }

    if (!line) {
      cursorY += 3;
      continue;
    }

    if (line.startsWith("# ")) {
      checkPageBreak(12);
      pdf.setFont(pdfFont, "bold");
      pdf.setFontSize(h1Size);
      pdf.setTextColor(accent.pdfRgb[0], accent.pdfRgb[1], accent.pdfRgb[2]);
      const cleanHeading = line.replace(/^#\s+/, "");
      const split = pdf.splitTextToSize(cleanHeading, contentWidth);
      pdf.text(split, margin, cursorY);
      cursorY += split.length * (isCompact ? 5 : 6) + 3;
    } else if (line.startsWith("## ")) {
      checkPageBreak(10);
      pdf.setFont(pdfFont, "bold");
      pdf.setFontSize(h2Size);
      pdf.setTextColor(51, 65, 85);
      const cleanHeading = line.replace(/^##\s+/, "");
      const split = pdf.splitTextToSize(cleanHeading, contentWidth);
      pdf.text(split, margin, cursorY);
      cursorY += split.length * (isCompact ? 4.5 : 5) + 2;
    } else if (line.startsWith("### ")) {
      checkPageBreak(8);
      pdf.setFont(pdfFont, "bold");
      pdf.setFontSize(h3Size);
      pdf.setTextColor(71, 85, 105);
      const cleanHeading = line.replace(/^###\s+/, "");
      const split = pdf.splitTextToSize(cleanHeading, contentWidth);
      pdf.text(split, margin, cursorY);
      cursorY += split.length * (isCompact ? 4 : 4.5) + 2;
    } else if (line.startsWith("- ") || line.startsWith("* ") || line.startsWith("• ")) {
      checkPageBreak(6);
      const bulletText = line.replace(/^[-*•]\s+/, "").replace(/[*_`#]/g, "");
      pdf.setFont(pdfFont, "normal");
      pdf.setFontSize(bodySize);
      pdf.setTextColor(30, 41, 59);
      pdf.text("•", margin + 2, cursorY);
      const split = pdf.splitTextToSize(bulletText, contentWidth - 8);
      pdf.text(split, margin + 7, cursorY);
      cursorY += split.length * (isCompact ? 4 : 4.5) + 1.5;
    } else if (/^\d+[\.\)]\s+/.test(line)) {
      checkPageBreak(6);
      const numMatch = line.match(/^(\d+[\.\)])\s+(.*)/);
      const prefix = numMatch ? numMatch[1] : "1.";
      const body = (numMatch ? numMatch[2] : line).replace(/[*_`#]/g, "");
      pdf.setFont(pdfFont, "normal");
      pdf.setFontSize(bodySize);
      pdf.setTextColor(30, 41, 59);
      pdf.text(prefix, margin + 2, cursorY);
      const split = pdf.splitTextToSize(body, contentWidth - 9);
      pdf.text(split, margin + 8, cursorY);
      cursorY += split.length * (isCompact ? 4 : 4.5) + 1.5;
    } else {
      checkPageBreak(6);
      const cleanText = rawLine.replace(/[*_`#]/g, "");
      pdf.setFont(pdfFont, "normal");
      pdf.setFontSize(bodySize);
      pdf.setTextColor(30, 41, 59);
      const split = pdf.splitTextToSize(cleanText, contentWidth);
      pdf.text(split, margin, cursorY);
      cursorY += split.length * (isCompact ? 4 : 4.5) + 2;
    }
  }

  if (inTable) {
    flushPdfTable();
  }

  // Page numbering and watermark across every page
  const totalPages = pdf.internal.pages.length - 1;
  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);

    if (options?.watermark !== false) {
      pdf.saveGraphicsState();
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(isCompact ? 32 : 38);
      pdf.setTextColor(241, 245, 249); // subtle faint slate watermark
      pdf.text(
        options?.watermarkText || "IOnLearn Study Copilot",
        pageWidth / 2,
        pageHeight / 2,
        { align: "center", angle: 45 }
      );
      pdf.restoreGraphicsState();
    }

    pdf.setFont(pdfFont, "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    pdf.text(
      `IOnLearn Study Copilot • Halaman ${p} dari ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" }
    );
  }

  return pdf.output("blob");
}

/**
 * Parse a bullet point string into structured title and description
 */
export function parseBulletPoint(raw: string): { title: string; desc: string } {
  const clean = cleanLatexMath(raw)
    .replace(/^(\s*[-•]\s+|\s*\*(?!\*)\s*|\s*\d+[\.\)]\s*)/, "")
    .trim();

  const boldMatch = clean.match(/^\*\*([^*]+)\*\*[:\s\-–—]*(.*)$/);
  if (boldMatch) {
    return {
      title: boldMatch[1].replace(/\*\*/g, "").trim(),
      desc: boldMatch[2].replace(/^[:\s\-–—]+/, "").replace(/\*\*/g, "").trim(),
    };
  }

  const colonMatch = clean.match(/^([^:\n]{2,40}):\s+(.+)$/);
  if (colonMatch && !colonMatch[1].includes("http")) {
    return {
      title: colonMatch[1].replace(/\*\*/g, "").trim(),
      desc: colonMatch[2].replace(/\*\*/g, "").trim(),
    };
  }

  const dashMatch = clean.match(/^([^\-–—\n]{2,40})\s+[\-–—]\s+(.+)$/);
  if (dashMatch) {
    return {
      title: dashMatch[1].replace(/\*\*/g, "").trim(),
      desc: dashMatch[2].replace(/\*\*/g, "").trim(),
    };
  }

  const words = clean.split(/\s+/);
  if (words.length > 5) {
    return {
      title: words.slice(0, 4).join(" ").replace(/\*\*/g, ""),
      desc: words.slice(4).join(" ").replace(/\*\*/g, ""),
    };
  }

  return {
    title: clean.replace(/\*\*/g, ""),
    desc: "",
  };
}

export interface SlideThemeDefinition {
  id: "indigo" | "dark" | "emerald" | "amber" | "slate" | "rose" | "teal" | "violet";
  name: string;
  description: string;
  bg: string;
  cardBg: string;
  cardBorder: string;
  titleColor: string;
  bodyColor: string;
  subColor: string;
  accentColor: string;
  accentLight: string;
  accentBorder: string;
  badgeText: string;
  chipBg: string;
}

export const SLIDE_THEMES: SlideThemeDefinition[] = [
  {
    id: "indigo",
    name: "Indigo Modern",
    description: "Akademik, Kampus & Presentasi Umum",
    bg: "F8FAFC",
    cardBg: "FFFFFF",
    cardBorder: "E2E8F0",
    titleColor: "0F172A",
    bodyColor: "334155",
    subColor: "64748B",
    accentColor: "4F46E5",
    accentLight: "EEF2FF",
    accentBorder: "C7D2FE",
    badgeText: "4338CA",
    chipBg: "E0E7FF",
  },
  {
    id: "dark",
    name: "Cyber Dark",
    description: "Teknologi, Coding & Sains Komputer",
    bg: "0B0F19",
    cardBg: "161E2E",
    cardBorder: "2A374A",
    titleColor: "F8FAFC",
    bodyColor: "CBD5E1",
    subColor: "94A3B8",
    accentColor: "6366F1",
    accentLight: "1E1B4B",
    accentBorder: "4338CA",
    badgeText: "C7D2FE",
    chipBg: "2D2B55",
  },
  {
    id: "emerald",
    name: "Forest Emerald",
    description: "Biologi, Lingkungan & Medis",
    bg: "F0FDF4",
    cardBg: "FFFFFF",
    cardBorder: "D1FAE5",
    titleColor: "064E3B",
    bodyColor: "1F2937",
    subColor: "047857",
    accentColor: "059669",
    accentLight: "ECFDF5",
    accentBorder: "A7F3D0",
    badgeText: "065F46",
    chipBg: "D1FAE5",
  },
  {
    id: "amber",
    name: "Warm Amber",
    description: "Kreatif, Seni, Humaniora & Sejarah",
    bg: "FFFBEB",
    cardBg: "FFFFFF",
    cardBorder: "FDE68A",
    titleColor: "78350F",
    bodyColor: "451A03",
    subColor: "92400E",
    accentColor: "D97706",
    accentLight: "FEF3C7",
    accentBorder: "FCD34D",
    badgeText: "B45309",
    chipBg: "FDE68A",
  },
  {
    id: "slate",
    name: "Corporate Navy",
    description: "Eksekutif, Bisnis, Hukum & Formal",
    bg: "F8FAFC",
    cardBg: "FFFFFF",
    cardBorder: "CBD5E1",
    titleColor: "0F172A",
    bodyColor: "334155",
    subColor: "475569",
    accentColor: "2563EB",
    accentLight: "EFF6FF",
    accentBorder: "BFDBFE",
    badgeText: "1D4ED8",
    chipBg: "DBEAFE",
  },
  {
    id: "rose",
    name: "Crimson Rose",
    description: "Dinamis, Komunikasi & Desain",
    bg: "FFF1F2",
    cardBg: "FFFFFF",
    cardBorder: "FECDD3",
    titleColor: "881337",
    bodyColor: "4C0519",
    subColor: "BE123C",
    accentColor: "E11D48",
    accentLight: "FFE4E6",
    accentBorder: "FDA4AF",
    badgeText: "9F1239",
    chipBg: "FFE4E6",
  },
  {
    id: "teal",
    name: "Deep Teal",
    description: "Analitik, Riset & Kesehatan Terapan",
    bg: "F0FDFA",
    cardBg: "FFFFFF",
    cardBorder: "CCFBF1",
    titleColor: "134E4A",
    bodyColor: "1F2937",
    subColor: "0F766E",
    accentColor: "0D9488",
    accentLight: "CCFBF1",
    accentBorder: "99F6E4",
    badgeText: "115E59",
    chipBg: "CCFBF1",
  },
  {
    id: "violet",
    name: "Royal Violet",
    description: "Inovasi, AI, Filsafat & Inspirasi",
    bg: "FAF5FF",
    cardBg: "FFFFFF",
    cardBorder: "E9D5FF",
    titleColor: "3B0764",
    bodyColor: "334155",
    subColor: "6B21A8",
    accentColor: "7C3AED",
    accentLight: "F3E8FF",
    accentBorder: "D8B4FE",
    badgeText: "581C87",
    chipBg: "F3E8FF",
  },
];

/**
 * Generate Microsoft PowerPoint (.pptx) presentation from CreatedSlides
 */
export async function generatePptxPresentation(
  presentation: {
    title: string;
    subtitle?: string;
    theme?: string;
    slides: Array<{
      title: string;
      bullets: string[];
      notes?: string;
    }>;
    fileName?: string;
    subject?: string;
  },
  options?: DocumentStyleOptions
): Promise<Blob> {
  const cleanTitle = cleanLatexMath(presentation.title);
  const cleanSubject = presentation.subject ? cleanLatexMath(presentation.subject) : undefined;
  const authorName = options?.userName?.trim() || options?.author?.trim() || "IOnLearn";
  const institutionName = options?.institution?.trim() || "IOnLearn Study Copilot";
  const fontFace = options?.slideFont || options?.fontFamily || "Arial";

  const pptx = new pptxgen();
  const is4x3 = options?.slideAspectRatio === "4:3";
  pptx.layout = is4x3 ? "LAYOUT_4x3" : "LAYOUT_16x9";
  pptx.author = authorName;
  pptx.company = institutionName;
  pptx.title = cleanTitle;
  if (cleanSubject) {
    pptx.subject = cleanSubject;
  }

  const themeKey = options?.slideTheme || presentation.theme || "indigo";
  const currentTheme =
    SLIDE_THEMES.find((t) => t.id === themeKey) ||
    SLIDE_THEMES[0];

  const totalSlides = presentation.slides.length;
  const showSlideNumbers = options?.showSlideNumbers !== false;
  const showSpeakerNotes = options?.showSpeakerNotes !== false;

  // Coordinate math based on aspect ratio
  const heroCardY = is4x3 ? 0.8 : 0.6;
  const heroCardH = is4x3 ? 5.8 : 4.4;
  const heroDividerY = is4x3 ? 4.7 : 3.35;
  const heroFooterY = is4x3 ? 4.95 : 3.55;
  const heroFooterSubY = is4x3 ? 5.35 : 3.9;
  const heroBadgeY = is4x3 ? 5.05 : 3.65;

  const contentCardY = 1.45;
  const contentCardH = is4x3 ? 4.9 : 3.45;
  const footerLineY = is4x3 ? 6.85 : 5.1;
  const footerTextY = is4x3 ? 6.95 : 5.18;

  // 1. Title Slide (Cover Hero Card)
  const slide1 = pptx.addSlide();
  slide1.background = { color: currentTheme.bg };

  // Decorative top accent strip
  slide1.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: "100%",
    h: 0.12,
    fill: { color: currentTheme.accentColor },
  });

  // Hero Container Card
  slide1.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: heroCardY,
    w: 8.4,
    h: heroCardH,
    rectRadius: 0.15,
    fill: { color: currentTheme.cardBg },
    line: { color: currentTheme.cardBorder, width: 1.2 },
  });

  // Top accent bar inside hero card
  slide1.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: heroCardY,
    w: 8.4,
    h: 0.08,
    fill: { color: currentTheme.accentColor },
  });

  // Category Pill Badge
  slide1.addShape(pptx.ShapeType.roundRect, {
    x: 1.3,
    y: heroCardY + 0.45,
    w: 3.0,
    h: 0.35,
    rectRadius: 0.08,
    fill: { color: currentTheme.accentLight },
    line: { color: currentTheme.accentBorder, width: 0.8 },
  });

  slide1.addText((cleanSubject || "PRESENTASI MATERI AKADEMIK").toUpperCase(), {
    x: 1.3,
    y: heroCardY + 0.45,
    w: 3.0,
    h: 0.35,
    fontSize: 9,
    fontFace,
    bold: true,
    color: currentTheme.badgeText,
    align: "center",
    valign: "middle",
  });

  // Presentation Title
  const titleFontSize = cleanTitle.length > 60 ? 22 : cleanTitle.length > 35 ? 26 : 30;
  const titleW = options?.logoBase64 ? 6.0 : 7.2;
  const titleY = heroCardY + 0.95;

  slide1.addText(cleanTitle, {
    x: 1.3,
    y: titleY,
    w: titleW,
    h: is4x3 ? 1.8 : 1.35,
    fontSize: titleFontSize,
    fontFace,
    bold: true,
    color: currentTheme.titleColor,
    valign: "middle",
  });

  // Subtitle (if available)
  const cleanSubtitle = cleanLatexMath(
    presentation.subtitle || options?.slideSubtitle || ""
  );
  if (cleanSubtitle) {
    const subtitleY = titleY + (is4x3 ? 1.85 : 1.4);
    slide1.addText(cleanSubtitle, {
      x: 1.3,
      y: subtitleY,
      w: 7.2,
      h: 0.45,
      fontSize: 11,
      fontFace,
      italic: true,
      color: currentTheme.subColor,
      valign: "top",
    });
  }

  // Logo on Slide 1 Hero Card
  if (options?.logoBase64) {
    try {
      slide1.addImage({
        data: options.logoBase64,
        x: 7.7,
        y: heroCardY + 0.25,
        w: 1.1,
        h: 1.1,
      });
    } catch (err) {
      console.warn("Gagal menyematkan logo di slide 1 PPTX:", err);
    }
  }

  // Decorative divider
  slide1.addShape(pptx.ShapeType.line, {
    x: 1.3,
    y: heroDividerY,
    w: 7.4,
    h: 0,
    line: { color: currentTheme.cardBorder, width: 0.8 },
  });

  // Footer Metadata & Presenter Identity
  const presenterParts: string[] = [];
  if (options?.userName) presenterParts.push(`Penyusun: ${options.userName}`);
  if (options?.studentId) presenterParts.push(`NIM/NIS: ${options.studentId}`);
  if (options?.institution) presenterParts.push(options.institution);
  const presenterText = presenterParts.join("  •  ");

  slide1.addText(presenterText || `Penyusun: ${authorName}`, {
    x: 1.3,
    y: heroFooterY,
    w: 5.2,
    h: 0.35,
    fontSize: 10.5,
    fontFace,
    bold: true,
    color: currentTheme.titleColor,
  });

  slide1.addText(
    options?.institution
      ? `${institutionName}  •  ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`
      : "IOnLearn Study Copilot  •  Materi Pembelajaran Berbasis AI",
    {
      x: 1.3,
      y: heroFooterSubY,
      w: 5.2,
      h: 0.3,
      fontSize: 9,
      fontFace,
      color: currentTheme.subColor,
    }
  );

  slide1.addShape(pptx.ShapeType.roundRect, {
    x: 6.7,
    y: heroBadgeY,
    w: 2.0,
    h: 0.35,
    rectRadius: 0.08,
    fill: { color: currentTheme.accentLight },
    line: { color: currentTheme.accentBorder, width: 0.8 },
  });

  slide1.addText("DECK PRESENTASI", {
    x: 6.7,
    y: heroBadgeY,
    w: 2.0,
    h: 0.35,
    fontSize: 8.5,
    fontFace,
    bold: true,
    color: currentTheme.badgeText,
    align: "center",
    valign: "middle",
  });

  // 2. Content Slides with Adaptive Layouts
  presentation.slides.forEach((slideData, idx) => {
    const slide = pptx.addSlide();
    slide.background = { color: currentTheme.bg };

    // Corner logo on content slides
    if (options?.logoBase64) {
      try {
        slide.addImage({
          data: options.logoBase64,
          x: 8.8,
          y: 0.18,
          w: 0.5,
          h: 0.5,
        });
      } catch (err) {
        console.warn("Gagal menyematkan logo di content slide PPTX:", err);
      }
    }

    // Decorative top strip
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: "100%",
      h: 0.08,
      fill: { color: currentTheme.accentColor },
    });

    // Category Breadcrumb Badge
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 0.3,
      w: 2.4,
      h: 0.28,
      rectRadius: 0.06,
      fill: { color: currentTheme.accentLight },
      line: { color: currentTheme.accentBorder, width: 0.8 },
    });

    slide.addText(
      cleanSubject ? cleanSubject.slice(0, 24).toUpperCase() : "SLIDE PRESENTASI",
      {
        x: 0.8,
        y: 0.3,
        w: 2.4,
        h: 0.28,
        fontSize: 8.5,
        fontFace,
        bold: true,
        color: currentTheme.badgeText,
        align: "center",
        valign: "middle",
      }
    );

    // Slide Title
    slide.addText(cleanLatexMath(slideData.title), {
      x: 0.8,
      y: 0.65,
      w: options?.logoBase64 ? 7.8 : 8.4,
      h: 0.68,
      fontSize: 22,
      fontFace,
      bold: true,
      color: currentTheme.titleColor,
      valign: "middle",
    });

    // Bullets Parsing
    const rawBullets =
      slideData.bullets && slideData.bullets.length > 0
        ? slideData.bullets
        : ["Poin bahasan materi utama slide ini."];
    const parsedBullets = rawBullets.map(parseBulletPoint);
    const bulletCount = parsedBullets.length;
    const isLastSlide = idx === totalSlides - 1 && totalSlides > 2;
    const isAgendaSlide =
      idx === 0 ||
      (idx === 1 && /agenda|daftar isi|roadmap|outline|ikhtisar|peta konsep/i.test(slideData.title));

    // --- ADAPTIVE LAYOUTS ---

    // Layout A: Conclusion & Q&A Split (Final Slide)
    if (isLastSlide && bulletCount <= 4) {
      // Left: Summary takeaways card
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8,
        y: contentCardY,
        w: 4.8,
        h: contentCardH,
        rectRadius: 0.12,
        fill: { color: currentTheme.cardBg },
        line: { color: currentTheme.cardBorder, width: 1 },
      });

      slide.addShape(pptx.ShapeType.rect, {
        x: 0.95,
        y: contentCardY,
        w: 4.5,
        h: 0.06,
        fill: { color: currentTheme.accentColor },
      });

      slide.addShape(pptx.ShapeType.roundRect, {
        x: 1.1,
        y: contentCardY + 0.22,
        w: 2.4,
        h: 0.28,
        rectRadius: 0.06,
        fill: { color: currentTheme.accentLight },
        line: { color: currentTheme.accentBorder, width: 0.8 },
      });

      slide.addText("RINGKASAN UTAMA", {
        x: 1.1,
        y: contentCardY + 0.22,
        w: 2.4,
        h: 0.28,
        fontSize: 8.5,
        fontFace,
        bold: true,
        color: currentTheme.badgeText,
        align: "center",
        valign: "middle",
      });

      const itemGap = (contentCardH - 0.7) / Math.max(bulletCount, 1);
      parsedBullets.forEach((item, i) => {
        const itemY = contentCardY + 0.65 + i * itemGap;
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 1.1,
          y: itemY,
          w: 0.45,
          h: 0.26,
          rectRadius: 0.06,
          fill: { color: currentTheme.accentLight },
        });
        slide.addText(`0${i + 1}`, {
          x: 1.1,
          y: itemY,
          w: 0.45,
          h: 0.26,
          fontSize: 8.5,
          fontFace,
          bold: true,
          color: currentTheme.badgeText,
          align: "center",
          valign: "middle",
        });

        const titleText = item.desc ? item.title : item.title.slice(0, 30);
        const bodyText = item.desc ? item.desc : item.title;

        slide.addText(
          [
            { text: titleText ? `${titleText}\n` : "", options: { bold: true, fontSize: 10.5, fontFace, color: currentTheme.titleColor } },
            { text: bodyText, options: { bold: false, fontSize: 9.5, fontFace, color: currentTheme.bodyColor } },
          ],
          {
            x: 1.65,
            y: itemY - 0.04,
            w: 3.75,
            h: itemGap - 0.1,
            valign: "top",
          }
        );
      });

      // Right: Closing / Q&A Callout Card
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 5.8,
        y: contentCardY,
        w: 3.4,
        h: contentCardH,
        rectRadius: 0.12,
        fill: { color: currentTheme.accentLight },
        line: { color: currentTheme.accentBorder, width: 1.2 },
      });

      slide.addText("✨", {
        x: 6.0,
        y: contentCardY + (is4x3 ? 0.6 : 0.35),
        w: 3.0,
        h: 0.4,
        fontSize: 22,
        align: "center",
      });

      slide.addText("Terima Kasih!", {
        x: 6.0,
        y: contentCardY + (is4x3 ? 1.2 : 0.85),
        w: 3.0,
        h: 0.5,
        fontSize: 22,
        fontFace,
        bold: true,
        color: currentTheme.accentColor,
        align: "center",
      });

      slide.addText("Sesi Tanya Jawab & Diskusi", {
        x: 6.0,
        y: contentCardY + (is4x3 ? 1.85 : 1.4),
        w: 3.0,
        h: 0.4,
        fontSize: 11.5,
        fontFace,
        bold: true,
        color: currentTheme.titleColor,
        align: "center",
      });

      slide.addText("Pertanyaan, tanggapan, dan masukan dipersilakan.", {
        x: 6.0,
        y: contentCardY + (is4x3 ? 2.45 : 1.9),
        w: 3.0,
        h: 0.5,
        fontSize: 9.5,
        fontFace,
        italic: true,
        color: currentTheme.subColor,
        align: "center",
      });

      slide.addShape(pptx.ShapeType.roundRect, {
        x: 6.4,
        y: contentCardY + (is4x3 ? 3.4 : 2.7),
        w: 2.2,
        h: 0.35,
        rectRadius: 0.08,
        fill: { color: currentTheme.cardBg },
        line: { color: currentTheme.cardBorder, width: 0.8 },
      });

      slide.addText("IOnLearn Study Copilot", {
        x: 6.4,
        y: contentCardY + (is4x3 ? 3.4 : 2.7),
        w: 2.2,
        h: 0.35,
        fontSize: 8.5,
        fontFace,
        bold: true,
        color: currentTheme.accentColor,
        align: "center",
        valign: "middle",
      });
    }

    // Layout E: Dedicated Agenda / Roadmap Layout
    else if (isAgendaSlide && bulletCount >= 3 && bulletCount <= 6) {
      const stepGap = (contentCardH - 0.2) / bulletCount;

      parsedBullets.forEach((item, i) => {
        const itemY = contentCardY + i * stepGap;
        const itemH = stepGap - 0.12;

        // Container row card
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 0.8,
          y: itemY,
          w: 8.4,
          h: itemH,
          rectRadius: 0.08,
          fill: { color: currentTheme.cardBg },
          line: { color: currentTheme.cardBorder, width: 1 },
        });

        // Left accent block
        slide.addShape(pptx.ShapeType.rect, {
          x: 0.8,
          y: itemY,
          w: 0.08,
          h: itemH,
          fill: { color: currentTheme.accentColor },
        });

        // Step number badge
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 1.05,
          y: itemY + (itemH - 0.35) / 2,
          w: 0.55,
          h: 0.35,
          rectRadius: 0.08,
          fill: { color: currentTheme.accentLight },
          line: { color: currentTheme.accentBorder, width: 0.8 },
        });

        slide.addText(`0${i + 1}`, {
          x: 1.05,
          y: itemY + (itemH - 0.35) / 2,
          w: 0.55,
          h: 0.35,
          fontSize: 9.5,
          fontFace,
          bold: true,
          color: currentTheme.badgeText,
          align: "center",
          valign: "middle",
        });

        const titleText = item.desc ? item.title : item.title.slice(0, 45);
        const bodyText = item.desc ? item.desc : "";

        slide.addText(
          [
            { text: titleText, options: { bold: true, fontSize: 11.5, fontFace, color: currentTheme.titleColor } },
            ...(bodyText
              ? [{ text: `  —  ${bodyText}`, options: { bold: false, fontSize: 10, fontFace, color: currentTheme.bodyColor } }]
              : []),
          ],
          {
            x: 1.75,
            y: itemY,
            w: 7.2,
            h: itemH,
            valign: "middle",
          }
        );
      });
    }

    // Layout B: Column Cards (1 to 3 items)
    else if (bulletCount <= 3) {
      const gap = 0.25;
      const cardW = (8.4 - (bulletCount - 1) * gap) / bulletCount;
      const cardH = contentCardH;
      const cardY = contentCardY;

      parsedBullets.forEach((item, i) => {
        const cardX = 0.8 + i * (cardW + gap);

        // Card Container
        slide.addShape(pptx.ShapeType.roundRect, {
          x: cardX,
          y: cardY,
          w: cardW,
          h: cardH,
          rectRadius: 0.12,
          fill: { color: currentTheme.cardBg },
          line: { color: currentTheme.cardBorder, width: 1.2 },
        });

        // Top accent line inside card
        slide.addShape(pptx.ShapeType.rect, {
          x: cardX + 0.15,
          y: cardY,
          w: cardW - 0.3,
          h: 0.06,
          fill: { color: currentTheme.accentColor },
        });

        // Number Badge
        slide.addShape(pptx.ShapeType.roundRect, {
          x: cardX + 0.2,
          y: cardY + 0.22,
          w: 0.55,
          h: 0.32,
          rectRadius: 0.08,
          fill: { color: currentTheme.accentLight },
          line: { color: currentTheme.accentBorder, width: 0.8 },
        });

        slide.addText(`0${i + 1}`, {
          x: cardX + 0.2,
          y: cardY + 0.22,
          w: 0.55,
          h: 0.32,
          fontSize: 9.5,
          fontFace,
          bold: true,
          color: currentTheme.badgeText,
          align: "center",
          valign: "middle",
        });

        // Card Title
        const titleText = item.desc ? item.title : item.title.slice(0, 40);
        const bodyText = item.desc ? item.desc : item.title;

        slide.addText(titleText, {
          x: cardX + 0.2,
          y: cardY + 0.68,
          w: cardW - 0.4,
          h: 0.6,
          fontSize: 12.5,
          fontFace,
          bold: true,
          color: currentTheme.titleColor,
          valign: "top",
        });

        // Divider
        slide.addShape(pptx.ShapeType.line, {
          x: cardX + 0.2,
          y: cardY + 1.35,
          w: cardW - 0.4,
          h: 0,
          line: { color: currentTheme.cardBorder, width: 0.8 },
        });

        // Card Description
        slide.addText(bodyText, {
          x: cardX + 0.2,
          y: cardY + 1.48,
          w: cardW - 0.4,
          h: cardH - 1.6,
          fontSize: 10,
          fontFace,
          color: currentTheme.bodyColor,
          valign: "top",
        });
      });
    }

    // Layout C: 2x2 Grid Cards (4 items)
    else if (bulletCount === 4) {
      const cols = 2;
      const cardW = 4.05;
      const cardH = (contentCardH - 0.25) / 2;
      const gapX = 0.3;
      const gapY = 0.25;

      parsedBullets.forEach((item, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const cardX = 0.8 + col * (cardW + gapX);
        const cardY = contentCardY + row * (cardH + gapY);

        slide.addShape(pptx.ShapeType.roundRect, {
          x: cardX,
          y: cardY,
          w: cardW,
          h: cardH,
          rectRadius: 0.1,
          fill: { color: currentTheme.cardBg },
          line: { color: currentTheme.cardBorder, width: 1 },
        });

        // Left vertical accent stripe
        slide.addShape(pptx.ShapeType.rect, {
          x: cardX,
          y: cardY + 0.15,
          w: 0.08,
          h: cardH - 0.3,
          fill: { color: currentTheme.accentColor },
        });

        // Number pill
        slide.addShape(pptx.ShapeType.roundRect, {
          x: cardX + 0.2,
          y: cardY + 0.18,
          w: 0.5,
          h: 0.28,
          rectRadius: 0.06,
          fill: { color: currentTheme.accentLight },
          line: { color: currentTheme.accentBorder, width: 0.8 },
        });

        slide.addText(`0${i + 1}`, {
          x: cardX + 0.2,
          y: cardY + 0.18,
          w: 0.5,
          h: 0.28,
          fontSize: 9,
          fontFace,
          bold: true,
          color: currentTheme.badgeText,
          align: "center",
          valign: "middle",
        });

        const titleText = item.desc ? item.title : item.title.slice(0, 32);
        const bodyText = item.desc ? item.desc : item.title;

        slide.addText(titleText, {
          x: cardX + 0.8,
          y: cardY + 0.18,
          w: cardW - 0.95,
          h: 0.28,
          fontSize: 11.5,
          fontFace,
          bold: true,
          color: currentTheme.titleColor,
          valign: "middle",
        });

        slide.addText(bodyText, {
          x: cardX + 0.2,
          y: cardY + 0.55,
          w: cardW - 0.35,
          h: cardH - 0.65,
          fontSize: 9.5,
          fontFace,
          color: currentTheme.bodyColor,
          valign: "top",
        });
      });
    }

    // Layout D: Stacked Horizontal Cards (5+ items)
    else {
      const displayItems = parsedBullets.slice(0, 6);
      const cols = 2;
      const cardW = 4.05;
      const cardH = (contentCardH - 0.36) / 3;
      const gapX = 0.3;
      const gapY = 0.18;

      displayItems.forEach((item, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const cardX = 0.8 + col * (cardW + gapX);
        const cardY = contentCardY + row * (cardH + gapY);

        slide.addShape(pptx.ShapeType.roundRect, {
          x: cardX,
          y: cardY,
          w: cardW,
          h: cardH,
          rectRadius: 0.08,
          fill: { color: currentTheme.cardBg },
          line: { color: currentTheme.cardBorder, width: 1 },
        });

        slide.addShape(pptx.ShapeType.rect, {
          x: cardX,
          y: cardY + 0.1,
          w: 0.06,
          h: cardH - 0.2,
          fill: { color: currentTheme.accentColor },
        });

        slide.addShape(pptx.ShapeType.roundRect, {
          x: cardX + 0.15,
          y: cardY + 0.12,
          w: 0.45,
          h: 0.24,
          rectRadius: 0.05,
          fill: { color: currentTheme.accentLight },
        });

        slide.addText(`0${i + 1}`, {
          x: cardX + 0.15,
          y: cardY + 0.12,
          w: 0.45,
          h: 0.24,
          fontSize: 8.5,
          fontFace,
          bold: true,
          color: currentTheme.badgeText,
          align: "center",
          valign: "middle",
        });

        const titleText = item.desc ? item.title : item.title.slice(0, 30);
        const bodyText = item.desc ? item.desc : item.title;

        slide.addText(titleText, {
          x: cardX + 0.68,
          y: cardY + 0.12,
          w: cardW - 0.85,
          h: 0.24,
          fontSize: 10.5,
          fontFace,
          bold: true,
          color: currentTheme.titleColor,
          valign: "middle",
        });

        slide.addText(bodyText, {
          x: cardX + 0.15,
          y: cardY + 0.42,
          w: cardW - 0.3,
          h: cardH - 0.5,
          fontSize: 9,
          fontFace,
          color: currentTheme.bodyColor,
          valign: "top",
        });
      });
    }

    // Subtle Footer Divider & Slide Details
    slide.addShape(pptx.ShapeType.line, {
      x: 0.8,
      y: footerLineY,
      w: 8.4,
      h: 0,
      line: { color: currentTheme.cardBorder, width: 0.8 },
    });

    const slideWatermark =
      options?.watermark !== false ? options?.watermarkText || "IOnLearn Study Copilot" : "";
    if (slideWatermark) {
      slide.addText(slideWatermark, {
        x: 0.8,
        y: footerTextY,
        w: 4.0,
        h: 0.3,
        fontSize: 8.5,
        fontFace,
        italic: true,
        color: currentTheme.subColor,
      });
    }

    if (showSlideNumbers) {
      slide.addText(`Slide ${idx + 1} / ${totalSlides}`, {
        x: 5.2,
        y: footerTextY,
        w: 4.0,
        h: 0.3,
        fontSize: 8.5,
        fontFace,
        bold: true,
        color: currentTheme.subColor,
        align: "right",
      });
    }

    // Speaker Notes
    if (slideData.notes && showSpeakerNotes) {
      slide.addNotes(cleanLatexMath(slideData.notes));
    }
  });

  return (await pptx.write({ outputType: "blob" })) as Blob;
}

/**
 * Generate Excel (.xlsx) file from title and tabular/markdown content
 */
export async function generateXlsxDocument(
  doc: {
    title: string;
    content: string;
    subject?: string;
    fileName?: string;
  },
  options?: DocumentStyleOptions
): Promise<Blob> {
  const cleanTitle = cleanLatexMath(doc.title);
  const cleanSubject = doc.subject ? cleanLatexMath(doc.subject) : undefined;
  const cleanContent = cleanLatexMath(doc.content);
  const displayTitle = options?.tableTitle?.trim() || cleanTitle || "Lembar Kerja Data";
  const lines = cleanContent.split("\n");
  const rows: (string | number)[][] = [];

  // Header meta rows
  if (displayTitle) {
    rows.push([displayTitle]);
    if (cleanSubject) {
      rows.push([`Mata Pelajaran / Topik: ${cleanSubject}`]);
    }
    if (options?.userName || options?.studentId || options?.institution) {
      const studentParts: string[] = [];
      if (options.userName) studentParts.push(`Penyusun: ${options.userName}`);
      if (options.studentId) studentParts.push(`NIM/NIS: ${options.studentId}`);
      if (options.institution) studentParts.push(`Instansi: ${options.institution}`);
      if (studentParts.length > 0) {
        rows.push([studentParts.join("  |  ")]);
      }
    }
    rows.push([]); // empty spacer row
  }

  let tableStarted = false;
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed) {
      if (tableStarted && rows.length > 0 && rows[rows.length - 1].length > 0) {
        rows.push([]);
        tableStarted = false;
      }
      continue;
    }

    // Check for markdown headings e.g. ## Tabel Komparasi
    if (trimmed.startsWith("#")) {
      const headingText = trimmed.replace(/^[#\s*]+/, "").trim();
      if (headingText && headingText !== displayTitle) {
        if (rows.length > 0 && rows[rows.length - 1].length > 0) {
          rows.push([]);
        }
        rows.push([headingText]);
        tableStarted = false;
      }
      continue;
    }

    // Check for markdown table line
    if (trimmed.startsWith("|") && trimmed.includes("|")) {
      const inner = trimmed.startsWith("|") && trimmed.endsWith("|") ? trimmed.slice(1, -1) : trimmed.replace(/^\||\|$/g, "");
      const cells = inner.split("|").map((c) => c.trim());

      // Skip markdown separator row like |:---|:---|
      if (cells.every((c) => /^[:\-\s]+$/.test(c))) {
        continue;
      }

      tableStarted = true;
      rows.push(
        cells.map((cell) => {
          // Clean markdown bold, italic, inline code, links
          const clean = cell
            .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
            .replace(/[*_`]/g, "")
            .trim();

          // Check if it is a pure number
          const numCandidate = clean.replace(/,/g, "");
          const num = Number(numCandidate);
          if (!isNaN(num) && clean !== "" && /^-?\d+(\.\d+)?$/.test(numCandidate)) {
            return num;
          }
          return clean;
        })
      );
    } else if (trimmed.includes("\t") || (trimmed.includes(",") && !trimmed.includes(" "))) {
      // Tab or CSV delimited
      const delim = trimmed.includes("\t") ? "\t" : ",";
      const cells = trimmed.split(delim).map((c) => c.trim().replace(/^["']|["']$/g, ""));
      if (cells.length > 1) {
        tableStarted = true;
        rows.push(
          cells.map((c) => {
            const num = Number(c);
            return !isNaN(num) && c !== "" ? num : c;
          })
        );
      }
    } else if (trimmed.match(/^[-*•\d\.]*\s*([^:]+):\s*(.+)$/)) {
      // Key-value pairs
      const kv = trimmed.match(/^[-*•\d\.]*\s*([^:]+):\s*(.+)$/);
      if (kv) {
        rows.push([kv[1].trim().replace(/[*_`]/g, ""), kv[2].trim().replace(/[*_`]/g, "")]);
      }
    } else if (!tableStarted && trimmed.length > 0) {
      // Descriptive paragraph / notes
      rows.push([trimmed.replace(/^[#\-*•\d\.]+\s*/, "").replace(/[*_`]/g, "")]);
    }
  }

  if (rows.length === 0) {
    rows.push(["Konten"], [doc.content]);
  }

  const wb = XLSX.utils.book_new();
  wb.Props = {
    Title: displayTitle,
    Subject: cleanSubject || "IOnLearn Study Copilot",
    Author: options?.author?.trim() || options?.userName?.trim() || "IOnLearn",
    Company: options?.institution?.trim() || "IOnLearn",
    CreatedDate: new Date(),
  };

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Auto-fit column widths (if autoFitColumns !== false)
  if (options?.autoFitColumns !== false) {
    const maxCols = Math.max(...rows.map((r) => r.length), 1);
    const colWidths: { wch: number }[] = [];
    for (let c = 0; c < maxCols; c++) {
      let maxLen = 14;
      for (const r of rows) {
        const val = r[c] != null ? String(r[c]) : "";
        if (val.length > maxLen) maxLen = Math.min(val.length + 4, 65);
      }
      colWidths.push({ wch: maxLen });
    }
    ws["!cols"] = colWidths;
  }

  // Safe sheet name (Excel limits sheet names to 31 chars, no \ / ? * [ ] :)
  const rawSheet = options?.sheetName || cleanTitle || "Data";
  const safeSheetName = rawSheet
    .replace(/[\\/?*[\]:]/g, "")
    .trim()
    .slice(0, 31) || "Sheet1";

  XLSX.utils.book_append_sheet(wb, ws, safeSheetName);
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

/**
 * Direct download helper for CreatedDocument (PDF, DOCX, XLSX)
 */
export async function downloadCreatedDocument(
  doc: CreatedDocument,
  fallbackContent?: string,
  options?: DocumentStyleOptions
) {
  const ext = doc.type === "pdf" ? ".pdf" : doc.type === "xlsx" ? ".xlsx" : ".docx";
  const finalOptions = options || loadSavedDocStyle();

  const isFiller = (t?: string) => {
    if (!t || t.trim().length < 200) return true;
    const l = t.toLowerCase().trim();
    return (
      (l.startsWith("tentu saja") || l.startsWith("halo") || l.startsWith("hai") || l.startsWith("berikut adalah") || l.startsWith("saya telah") || l.startsWith("aku telah")) &&
      !t.includes("\n#") &&
      t.length < 400
    );
  };

  let safeContent = doc.content && doc.content.trim().length > 0 ? doc.content : "";
  if (isFiller(safeContent) && fallbackContent && !isFiller(fallbackContent)) {
    safeContent = fallbackContent;
  }
  if (!safeContent || safeContent.trim().length === 0) {
    safeContent = `# ${doc.title}\n\n${doc.description || "Dokumen ini dibuat oleh AI."}`;
  }

  const contentHeading = safeContent
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.startsWith("#"))
    ?.replace(/^[#\s*]+/, "")
    .trim()
    .slice(0, 90);

  const resolvedTitle = contentHeading || doc.title || "Dokumen";
  const cleanBase = (resolvedTitle || "dokumen")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .slice(0, 60);
  const defaultName = `${cleanBase || "dokumen"}${ext}`;
  const filename = doc.fileName ? doc.fileName.slice(0, 70) : defaultName;

  if (doc.type === "pdf") {
    const blob = await generatePdfDocument(
      {
        title: resolvedTitle,
        content: safeContent,
        subject: doc.subject,
        fileName: filename,
      },
      finalOptions
    );
    triggerFileDownload(blob, filename);
  } else if (doc.type === "xlsx") {
    const blob = await generateXlsxDocument(
      {
        title: resolvedTitle,
        content: safeContent,
        subject: doc.subject,
        fileName: filename,
      },
      finalOptions
    );
    triggerFileDownload(blob, filename);
  } else {
    const blob = await generateWordDocument(
      {
        title: resolvedTitle,
        content: safeContent,
        subject: doc.subject,
        fileName: filename,
      },
      finalOptions
    );
    triggerFileDownload(blob, filename);
  }
}

/**
 * Direct download helper for CreatedSlides
 */
export async function downloadCreatedSlides(
  slides: CreatedSlides,
  options?: DocumentStyleOptions
) {
  const cleanBase = (slides.title || "presentasi")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .slice(0, 60);
  const defaultName = `${cleanBase || "presentasi"}.pptx`;
  const filename = slides.fileName && slides.fileName.endsWith(".pptx")
    ? slides.fileName.slice(0, 70)
    : defaultName;
  const finalOptions = options || loadSavedDocStyle();

  const blob = await generatePptxPresentation(
    {
      title: slides.title,
      subtitle: slides.subtitle,
      theme: slides.theme,
      slides: slides.slides,
      fileName: filename,
      subject: slides.subject,
    },
    finalOptions
  );

  triggerFileDownload(blob, filename);
}

