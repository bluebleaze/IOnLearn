/**
 * Google Workspace Link & Content Parsing Utilities
 */

export type WorkspaceDocType = "docs" | "sheets" | "slides" | "drive" | "generic";

export interface ParsedWorkspaceUrl {
  type: WorkspaceDocType;
  fileId: string | null;
  gid?: string | null;
  rawUrl: string;
  label: string;
}

/**
 * Check if a URL is from Google Workspace (Docs, Sheets, Slides, Drive)
 */
export function isGoogleWorkspaceUrl(urlStr: string): boolean {
  if (!urlStr || typeof urlStr !== "string") return false;
  return /(?:docs\.google\.com|drive\.google\.com)/i.test(urlStr);
}

/**
 * Extract file ID and doc type from a Google Workspace URL
 */
export function parseGoogleWorkspaceUrl(urlStr: string): ParsedWorkspaceUrl {
  const result: ParsedWorkspaceUrl = {
    type: "generic",
    fileId: null,
    rawUrl: urlStr,
    label: "Google Workspace",
  };

  if (!urlStr || typeof urlStr !== "string") return result;

  // 1. Detect Type
  if (urlStr.includes("/document/")) {
    result.type = "docs";
    result.label = "Google Docs";
  } else if (urlStr.includes("/spreadsheets/")) {
    result.type = "sheets";
    result.label = "Google Spreadsheet";
  } else if (urlStr.includes("/presentation/")) {
    result.type = "slides";
    result.label = "Google Slides";
  } else if (urlStr.includes("drive.google.com")) {
    result.type = "drive";
    result.label = "Google Drive";
  }

  // 2. Extract File ID
  const pathMatch = urlStr.match(/\/(?:d|file\/d|document\/d|spreadsheets\/d|presentation\/d|folders)\/([a-zA-Z0-9_-]+)/);
  if (pathMatch && pathMatch[1]) {
    result.fileId = pathMatch[1];
  } else {
    // Check query param ?id=... or &id=...
    const queryMatch = urlStr.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (queryMatch && queryMatch[1]) {
      result.fileId = queryMatch[1];
    }
  }

  // 3. Extract gid (Sheet tab ID for Google Sheets)
  const gidMatch = urlStr.match(/[#?&]gid=([0-9]+)/);
  if (gidMatch && gidMatch[1]) {
    result.gid = gidMatch[1];
  }

  return result;
}

/**
 * Format CSV content from Google Sheets into a clean Markdown Table
 */
export function formatCsvToMarkdownTable(csvText: string, maxRows: number = 60): string {
  if (!csvText || !csvText.trim()) return "";

  // Split lines
  const lines = csvText.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return "";

  // Simple CSV parser handling quotes
  const parseLine = (line: string): string[] => {
    const cells: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if ((char === "," || char === "\t" || (char === ";" && !inQuotes)) && !inQuotes) {
        cells.push(current.trim().replace(/^"|"$/g, ""));
        current = "";
      } else {
        current += char;
      }
    }
    cells.push(current.trim().replace(/^"|"$/g, ""));
    return cells;
  };

  const rows = lines.slice(0, maxRows).map(parseLine);
  if (rows.length === 0) return "";

  // Determine max columns
  const colCount = Math.max(...rows.map((r) => r.length));
  if (colCount === 0) return "";

  // Pad rows
  const paddedRows = rows.map((r) => {
    while (r.length < colCount) r.push("");
    return r.map((c) => c.replace(/\|/g, "\\|"));
  });

  const header = paddedRows[0];
  const divider = Array(colCount).fill("---");
  const dataRows = paddedRows.slice(1);

  const mdTable = [
    `| ${header.join(" | ")} |`,
    `| ${divider.join(" | ")} |`,
    ...dataRows.map((r) => `| ${r.join(" | ")} |`),
  ].join("\n");

  const truncatedNotice = lines.length > maxRows ? `\n\n*(Menampilkan ${maxRows} baris pertama dari ${lines.length} baris spreadsheet)*` : "";

  return mdTable + truncatedNotice;
}

/**
 * Format raw presentation slide text into structured slide format
 */
export function formatSlidesText(rawText: string): string {
  if (!rawText) return "";

  // Clean empty lines
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  let formatted = "";
  let slideNum = 1;
  let currentSlideText: string[] = [];

  const flushSlide = () => {
    if (currentSlideText.length > 0) {
      formatted += `\n\n[Slide ${slideNum}]\n${currentSlideText.join("\n")}`;
      slideNum++;
      currentSlideText = [];
    }
  };

  for (const line of lines) {
    // If line looks like a slide boundary (e.g. form feed or page marker)
    if (line.includes("\f") || /^---+$|^={3,}/.test(line)) {
      flushSlide();
    } else {
      currentSlideText.push(line);
      // Roughly segment long chunks if no natural delimiter
      if (currentSlideText.length >= 8) {
        flushSlide();
      }
    }
  }

  flushSlide();
  return formatted.trim() || rawText;
}

/**
 * Get visual branding badge attributes for Google Workspace types
 */
export function getWorkspaceBadge(type: WorkspaceDocType): {
  label: string;
  badgeClass: string;
  iconType: "doc" | "sheet" | "slide" | "drive";
} {
  switch (type) {
    case "docs":
      return {
        label: "Google Docs",
        badgeClass: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
        iconType: "doc",
      };
    case "sheets":
      return {
        label: "Google Sheets",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
        iconType: "sheet",
      };
    case "slides":
      return {
        label: "Google Slides",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
        iconType: "slide",
      };
    case "drive":
    default:
      return {
        label: "Google Drive",
        badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800",
        iconType: "drive",
      };
  }
}

