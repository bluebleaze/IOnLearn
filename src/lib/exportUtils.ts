"use client";

import { Document, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, Packer, BorderStyle, WidthType, AlignmentType } from "docx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import pptxgen from "pptxgenjs";
import * as XLSX from "xlsx";
import { CreatedDocument, CreatedSlides } from "@/types";

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
 * Clean markdown symbols for text runs
 */
function parseInlineFormatting(text: string): TextRun[] {
  // Parse bold **text** or *italic*
  const runs: TextRun[] = [];
  const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|([^*`]+))/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match[2]) {
      // Bold
      runs.push(new TextRun({ text: match[2], bold: true }));
    } else if (match[3]) {
      // Italic
      runs.push(new TextRun({ text: match[3], italics: true }));
    } else if (match[4]) {
      // Code
      runs.push(new TextRun({ text: match[4], font: "Courier New", shading: { fill: "F1F5F9" } }));
    } else if (match[5]) {
      runs.push(new TextRun({ text: match[5] }));
    }
  }

  if (runs.length === 0) {
    runs.push(new TextRun({ text }));
  }

  return runs;
}

/**
 * Generate Microsoft Word (.docx) file from title and markdown content
 */
export async function generateWordDocument(doc: {
  title: string;
  content: string;
  subject?: string;
  fileName?: string;
}): Promise<Blob> {
  const paragraphs: (Paragraph | Table)[] = [];

  // 1. Document Header / Title
  paragraphs.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: doc.title,
          bold: true,
          size: 36, // 18pt
          color: "2B3A67",
        }),
      ],
    })
  );

  if (doc.subject) {
    paragraphs.push(
      new Paragraph({
        spacing: { after: 240 },
        children: [
          new TextRun({
            text: `Topik / Mata Pelajaran: ${doc.subject}`,
            italics: true,
            size: 20, // 10pt
            color: "64748B",
          }),
        ],
      })
    );
  }

  // 2. Parse Markdown Lines into Word Elements
  const lines = doc.content.split("\n");
  let tableRows: string[][] = [];
  let inTable = false;

  const flushTable = () => {
    if (tableRows.length > 0) {
      const headerRow = tableRows[0];
      const dataRows = tableRows.slice(1).filter((r) => !r.every((c) => c.match(/^[:\-\s]+$/)));

      const wordTableRows: TableRow[] = [];

      // Header row
      wordTableRows.push(
        new TableRow({
          tableHeader: true,
          children: headerRow.map(
            (cell) =>
              new TableCell({
                width: { size: Math.floor(100 / headerRow.length), type: WidthType.PERCENTAGE },
                shading: { fill: "EEF2F6" },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: cell.trim(), bold: true, size: 18 })],
                  }),
                ],
              })
          ),
        })
      );

      // Data rows
      for (const row of dataRows) {
        wordTableRows.push(
          new TableRow({
            children: row.map(
              (cell) =>
                new TableCell({
                  width: { size: Math.floor(100 / headerRow.length), type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({
                      children: parseInlineFormatting(cell.trim()),
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
            top: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
            left: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
            right: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
            insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
          },
        })
      );

      // Add a spacer paragraph after table
      paragraphs.push(new Paragraph({ spacing: { after: 120 } }));
      tableRows = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trimEnd();
    const line = rawLine.trim();

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
          spacing: { before: 240, after: 120 },
          children: [new TextRun({ text: line.replace(/^#\s+/, ""), bold: true, size: 28, color: "1E293B" })],
        })
      );
    } else if (line.startsWith("## ")) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
          children: [new TextRun({ text: line.replace(/^##\s+/, ""), bold: true, size: 24, color: "334155" })],
        })
      );
    } else if (line.startsWith("### ")) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 160, after: 80 },
          children: [new TextRun({ text: line.replace(/^###\s+/, ""), bold: true, size: 20, color: "475569" })],
        })
      );
    } else if (line.startsWith("- ") || line.startsWith("* ") || line.startsWith("• ")) {
      const itemText = line.replace(/^[-*•]\s+/, "");
      paragraphs.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 60 },
          children: parseInlineFormatting(itemText),
        })
      );
    } else if (/^\d+[\.\)]\s+/.test(line)) {
      const itemText = line.replace(/^\d+[\.\)]\s+/, "");
      paragraphs.push(
        new Paragraph({
          numbering: { reference: "default-numbering", level: 0 },
          spacing: { after: 60 },
          children: parseInlineFormatting(itemText),
        })
      );
    } else if (line.startsWith("> ")) {
      const quoteText = line.replace(/^>\s*/, "");
      paragraphs.push(
        new Paragraph({
          indent: { left: 400 },
          spacing: { before: 80, after: 80 },
          children: [new TextRun({ text: quoteText, italics: true, color: "475569" })],
        })
      );
    } else {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 100 },
          children: parseInlineFormatting(rawLine),
        })
      );
    }
  }

  if (inTable) {
    flushTable();
  }

  // Footer text
  paragraphs.push(
    new Paragraph({
      spacing: { before: 300 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "— Dibuat dengan IOnLearn Study Copilot —",
          italics: true,
          size: 16,
          color: "94A3B8",
        }),
      ],
    })
  );

  const wordDoc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  return await Packer.toBlob(wordDoc);
}

/**
 * Generate PDF file from title and markdown content using jsPDF & autotable
 */
export async function generatePdfDocument(doc: {
  title: string;
  content: string;
  subject?: string;
  fileName?: string;
}): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = 22;

  // Header band
  pdf.setFillColor(79, 70, 229); // Indigo 600
  pdf.rect(0, 0, pageWidth, 5, "F");

  // Title
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.setTextColor(15, 23, 42); // Slate 900
  const titleLines = pdf.splitTextToSize(doc.title, contentWidth);
  pdf.text(titleLines, margin, cursorY);
  cursorY += titleLines.length * 7 + 2;

  // Subject / Metadata
  if (doc.subject) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(100, 116, 139); // Slate 500
    pdf.text(`Topik / Mata Pelajaran: ${doc.subject}`, margin, cursorY);
    cursorY += 5;
  }

  // Date & App mark
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(9);
  pdf.setTextColor(148, 163, 184); // Slate 400
  pdf.text(`IOnLearn Study Copilot • ${new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}`, margin, cursorY);
  cursorY += 7;

  // Divider Line
  pdf.setDrawColor(226, 232, 240); // Slate 200
  pdf.setLineWidth(0.4);
  pdf.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 8;

  // Parse lines & render
  const lines = doc.content.split("\n");
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
        styles: { fontSize: 8.5, cellPadding: 2.5, textColor: [30, 41, 59] },
        headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: "bold" },
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
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(30, 41, 59);
      const cleanHeading = line.replace(/^#\s+/, "");
      const split = pdf.splitTextToSize(cleanHeading, contentWidth);
      pdf.text(split, margin, cursorY);
      cursorY += split.length * 6 + 3;
    } else if (line.startsWith("## ")) {
      checkPageBreak(10);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.setTextColor(51, 65, 85);
      const cleanHeading = line.replace(/^##\s+/, "");
      const split = pdf.splitTextToSize(cleanHeading, contentWidth);
      pdf.text(split, margin, cursorY);
      cursorY += split.length * 5 + 2;
    } else if (line.startsWith("### ")) {
      checkPageBreak(8);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10.5);
      pdf.setTextColor(71, 85, 105);
      const cleanHeading = line.replace(/^###\s+/, "");
      const split = pdf.splitTextToSize(cleanHeading, contentWidth);
      pdf.text(split, margin, cursorY);
      cursorY += split.length * 4.5 + 2;
    } else if (line.startsWith("- ") || line.startsWith("* ") || line.startsWith("• ")) {
      checkPageBreak(6);
      const bulletText = line.replace(/^[-*•]\s+/, "").replace(/[*_`#]/g, "");
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9.5);
      pdf.setTextColor(30, 41, 59);
      pdf.text("•", margin + 2, cursorY);
      const split = pdf.splitTextToSize(bulletText, contentWidth - 8);
      pdf.text(split, margin + 7, cursorY);
      cursorY += split.length * 4.5 + 1.5;
    } else if (/^\d+[\.\)]\s+/.test(line)) {
      checkPageBreak(6);
      const numMatch = line.match(/^(\d+[\.\)])\s+(.*)/);
      const prefix = numMatch ? numMatch[1] : "1.";
      const body = (numMatch ? numMatch[2] : line).replace(/[*_`#]/g, "");
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9.5);
      pdf.setTextColor(30, 41, 59);
      pdf.text(prefix, margin + 2, cursorY);
      const split = pdf.splitTextToSize(body, contentWidth - 9);
      pdf.text(split, margin + 8, cursorY);
      cursorY += split.length * 4.5 + 1.5;
    } else {
      checkPageBreak(6);
      const cleanText = rawLine.replace(/[*_`#]/g, "");
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9.5);
      pdf.setTextColor(30, 41, 59);
      const split = pdf.splitTextToSize(cleanText, contentWidth);
      pdf.text(split, margin, cursorY);
      cursorY += split.length * 4.5 + 2;
    }
  }

  if (inTable) {
    flushPdfTable();
  }

  // Page numbering in footer
  const totalPages = pdf.internal.pages.length - 1;
  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    pdf.text(
      `Halaman ${p} dari ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" }
    );
  }

  return pdf.output("blob");
}

/**
 * Generate Microsoft PowerPoint (.pptx) presentation from CreatedSlides
 */
export async function generatePptxPresentation(presentation: {
  title: string;
  theme?: string;
  slides: Array<{
    title: string;
    bullets: string[];
    notes?: string;
  }>;
  fileName?: string;
  subject?: string;
}): Promise<Blob> {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_16x9";

  const themeKey = presentation.theme || "indigo";
  const themes = {
    indigo: {
      bg: "F8FAFC",
      titleColor: "1E293B",
      accentColor: "4F46E5",
      subColor: "64748B",
      cardBg: "FFFFFF",
      bulletColor: "4F46E5",
    },
    dark: {
      bg: "0F172A",
      titleColor: "F8FAFC",
      accentColor: "818CF8",
      subColor: "94A3B8",
      cardBg: "1E293B",
      bulletColor: "38BDF8",
    },
    emerald: {
      bg: "F0FDF4",
      titleColor: "064E3B",
      accentColor: "059669",
      subColor: "047857",
      cardBg: "FFFFFF",
      bulletColor: "10B981",
    },
    amber: {
      bg: "FFFBEB",
      titleColor: "78350F",
      accentColor: "D97706",
      subColor: "92400E",
      cardBg: "FFFFFF",
      bulletColor: "F59E0B",
    },
    slate: {
      bg: "F1F5F9",
      titleColor: "0F172A",
      accentColor: "334155",
      subColor: "475569",
      cardBg: "FFFFFF",
      bulletColor: "64748B",
    },
  };

  const currentTheme = themes[themeKey as keyof typeof themes] || themes.indigo;

  // 1. Title Slide
  const slide1 = pptx.addSlide();
  slide1.background = { color: currentTheme.bg };

  // Decorative header bar
  slide1.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: "100%",
    h: 0.15,
    fill: { color: currentTheme.accentColor },
  });

  // Title Slide Container Card
  slide1.addShape(pptx.ShapeType.roundRect, {
    x: 1.0,
    y: 1.2,
    w: 8.0,
    h: 4.8,
    rectRadius: 0.2,
    fill: { color: currentTheme.cardBg },
    line: { color: "E2E8F0", width: 1 },
  });

  slide1.addText(presentation.title, {
    x: 1.4,
    y: 2.0,
    w: 7.2,
    h: 1.8,
    fontSize: 32,
    fontFace: "Arial",
    bold: true,
    color: currentTheme.titleColor,
    align: "center",
    valign: "middle",
  });

  if (presentation.subject) {
    slide1.addText(presentation.subject, {
      x: 1.4,
      y: 3.8,
      w: 7.2,
      h: 0.6,
      fontSize: 16,
      fontFace: "Arial",
      color: currentTheme.accentColor,
      bold: true,
      align: "center",
    });
  }

  slide1.addText("Dibuat dengan IOnLearn Study Copilot", {
    x: 1.4,
    y: 4.8,
    w: 7.2,
    h: 0.5,
    fontSize: 11,
    fontFace: "Arial",
    italic: true,
    color: currentTheme.subColor,
    align: "center",
  });

  // 2. Content Slides
  presentation.slides.forEach((slideData, idx) => {
    const slide = pptx.addSlide();
    slide.background = { color: currentTheme.bg };

    // Decorative top strip
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: "100%",
      h: 0.1,
      fill: { color: currentTheme.accentColor },
    });

    // Header Slide Number Tag
    slide.addText(`Slide ${idx + 1} / ${presentation.slides.length}`, {
      x: 0.8,
      y: 0.35,
      w: 2.5,
      h: 0.4,
      fontSize: 10,
      fontFace: "Arial",
      bold: true,
      color: currentTheme.accentColor,
    });

    // Slide Title
    slide.addText(slideData.title, {
      x: 0.8,
      y: 0.7,
      w: 8.4,
      h: 0.8,
      fontSize: 24,
      fontFace: "Arial",
      bold: true,
      color: currentTheme.titleColor,
    });

    // Main Content Card
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 1.6,
      w: 8.4,
      h: 4.8,
      rectRadius: 0.15,
      fill: { color: currentTheme.cardBg },
      line: { color: "E2E8F0", width: 1 },
    });

    // Bullets
    const bulletsList = slideData.bullets && slideData.bullets.length > 0
      ? slideData.bullets
      : ["Poin bahasan utama slide ini"];

    const bulletItems = bulletsList.map((bullet) => ({
      text: bullet.replace(/^[-*•]\s*/, ""),
      options: {
        fontSize: 15,
        fontFace: "Arial",
        color: currentTheme.titleColor,
        bullet: { code: "25AA", color: currentTheme.bulletColor },
        breakLine: true,
        lineSpacing: 28,
      },
    }));

    slide.addText(bulletItems as any, {
      x: 1.2,
      y: 1.9,
      w: 7.6,
      h: 4.2,
      valign: "top",
    });

    // Speaker Notes
    if (slideData.notes) {
      slide.addNotes(slideData.notes);
    }
  });

  return (await pptx.write({ outputType: "blob" })) as Blob;
}

/**
 * Generate Excel (.xlsx) file from title and tabular/markdown content
 */
export async function generateXlsxDocument(doc: {
  title: string;
  content: string;
  subject?: string;
  fileName?: string;
}): Promise<Blob> {
  const lines = doc.content.split("\n");
  const rows: (string | number)[][] = [];

  // Header meta rows
  if (doc.title) {
    rows.push([doc.title]);
    if (doc.subject) {
      rows.push([`Mata Pelajaran / Topik: ${doc.subject}`]);
    }
    rows.push([]); // empty spacer row
  }

  let foundTable = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const cells = trimmed
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());

      // Skip markdown separator row like |:---|:---|
      if (cells.every((c) => /^[:\-\s]+$/.test(c))) {
        continue;
      }

      foundTable = true;
      rows.push(
        cells.map((cell) => {
          const clean = cell.replace(/[*_`]/g, "").trim();
          const num = Number(clean.replace(/,/g, ""));
          return !isNaN(num) && clean !== "" && /^-?\d+(\.\d+)?$/.test(clean) ? num : clean;
        })
      );
    } else if (trimmed.includes(",") || trimmed.includes("\t")) {
      const delim = trimmed.includes("\t") ? "\t" : ",";
      const cells = trimmed.split(delim).map((c) => c.trim().replace(/^["']|["']$/g, ""));
      if (cells.length > 1) {
        foundTable = true;
        rows.push(
          cells.map((c) => {
            const num = Number(c);
            return !isNaN(num) && c !== "" ? num : c;
          })
        );
      }
    } else if (!foundTable && trimmed.length > 0 && !trimmed.startsWith("#")) {
      const kv = trimmed.match(/^[-*•\d\.]*\s*([^:]+):\s*(.+)$/);
      if (kv) {
        rows.push([kv[1].trim(), kv[2].trim()]);
      } else {
        rows.push([trimmed.replace(/^[#\-*•\d\.]+\s*/, "")]);
      }
    }
  }

  if (rows.length === 0) {
    rows.push(["Konten"], [doc.content]);
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Auto-fit column widths
  const maxCols = Math.max(...rows.map((r) => r.length), 1);
  const colWidths: { wch: number }[] = [];
  for (let c = 0; c < maxCols; c++) {
    let maxLen = 12;
    for (const r of rows) {
      const val = r[c] != null ? String(r[c]) : "";
      if (val.length > maxLen) maxLen = Math.min(val.length + 3, 60);
    }
    colWidths.push({ wch: maxLen });
  }
  ws["!cols"] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

/**
 * Direct download helper for CreatedDocument (PDF, DOCX, XLSX)
 */
export async function downloadCreatedDocument(doc: CreatedDocument, fallbackContent?: string) {
  const ext = doc.type === "pdf" ? ".pdf" : doc.type === "xlsx" ? ".xlsx" : ".docx";
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
  const defaultName = ((resolvedTitle || "dokumen").toLowerCase().replace(/[^a-z0-9]+/g, "_")) + ext;
  const filename = doc.fileName || defaultName;

  if (doc.type === "pdf") {
    const blob = await generatePdfDocument({
      title: resolvedTitle,
      content: safeContent,
      subject: doc.subject,
      fileName: filename,
    });
    triggerFileDownload(blob, filename);
  } else if (doc.type === "xlsx") {
    const blob = await generateXlsxDocument({
      title: resolvedTitle,
      content: safeContent,
      subject: doc.subject,
      fileName: filename,
    });
    triggerFileDownload(blob, filename);
  } else {
    const blob = await generateWordDocument({
      title: resolvedTitle,
      content: safeContent,
      subject: doc.subject,
      fileName: filename,
    });
    triggerFileDownload(blob, filename);
  }
}

/**
 * Direct download helper for CreatedSlides
 */
export async function downloadCreatedSlides(slides: CreatedSlides) {
  const defaultName = (slides.title.toLowerCase().replace(/[^a-z0-9]+/g, "_") || "presentasi") + ".pptx";
  const filename = slides.fileName || defaultName;

  const blob = await generatePptxPresentation({
    title: slides.title,
    theme: slides.theme,
    slides: slides.slides,
    fileName: filename,
    subject: slides.subject,
  });

  triggerFileDownload(blob, filename);
}

