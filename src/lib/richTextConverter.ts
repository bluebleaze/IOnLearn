/**
 * Rich Text (HTML) <-> Markdown bidirectional converter for Note WYSIWYG Editor
 */

export function markdownToHtml(markdown: string): string {
  if (!markdown) return "";
  let html = markdown;

  // Code blocks ```...```
  html = html.replace(/```([a-zA-Z0-9]*)\n([\s\S]*?)```/g, (_match, _lang, code) => {
    return `<pre class="bg-slate-900 text-slate-100 p-3 rounded-xl overflow-x-auto my-2 text-xs font-mono"><code>${escapeHtml(code.trim())}</code></pre>`;
  });

  // Inline code `...`
  html = html.replace(/`([^`\n]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-mono text-xs">$1</code>');

  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-slate-900 dark:text-white mt-3 mb-1">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-slate-900 dark:text-white mt-4 mb-1.5">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold text-slate-900 dark:text-white mt-5 mb-2">$1</h1>');

  // Blockquotes
  html = html.replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-indigo-500 pl-3 my-2 italic text-slate-600 dark:text-slate-400">$1</blockquote>');

  // Bold & Italic & Strikethrough
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');
  html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');

  // Images ![alt](url)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-xl my-2 max-h-96 object-contain border border-slate-200 dark:border-zinc-800" />');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-600 underline">$1</a>');

  // Unordered lists
  html = html.replace(/^\s*[-*]\s+(.*$)/gim, '<li class="ml-4 list-disc">$1</li>');

  // Ordered lists
  html = html.replace(/^\s*\d+\.\s+(.*$)/gim, '<li class="ml-4 list-decimal">$1</li>');

  // Markdown Tables -> HTML Table
  html = parseMarkdownTablesToHtml(html);

  // Paragraphs / line breaks
  const lines = html.split("\n");
  const parsedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      parsedLines.push("<p><br></p>");
      continue;
    }
    if (
      line.startsWith("<h1") ||
      line.startsWith("<h2") ||
      line.startsWith("<h3") ||
      line.startsWith("<blockquote") ||
      line.startsWith("<pre") ||
      line.startsWith("<ul") ||
      line.startsWith("<ol") ||
      line.startsWith("<li") ||
      line.startsWith("<table") ||
      line.startsWith("<div") ||
      line.startsWith("<p")
    ) {
      parsedLines.push(line);
    } else {
      parsedLines.push(`<p>${line}</p>`);
    }
  }

  return parsedLines.join("");
}

function parseMarkdownTablesToHtml(text: string): string {
  const lines = text.split("\n");
  const output: string[] = [];
  let tableRows: string[] = [];

  const flushTable = () => {
    if (tableRows.length === 0) return;
    const cleanRows = tableRows.map((r) => {
      let trimmed = r.trim();
      if (trimmed.startsWith("|")) trimmed = trimmed.slice(1);
      if (trimmed.endsWith("|")) trimmed = trimmed.slice(0, -1);
      return trimmed.split("|").map((c) => c.trim());
    });

    if (cleanRows.length === 0) return;

    let headerRow = cleanRows[0];
    let startDataIdx = 1;
    if (cleanRows.length > 1 && cleanRows[1].every((c) => /^:?-+:?$/.test(c))) {
      startDataIdx = 2;
    }

    let tableHtml = `<div class="my-3.5 w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-800 shadow-xs"><table class="w-full text-xs sm:text-sm text-left border-collapse bg-white dark:bg-[#151515]"><thead><tr class="bg-slate-100/90 dark:bg-[#1f1f1f] text-slate-900 dark:text-[#f2f2f2] font-bold border-b border-slate-200 dark:border-zinc-800">`;
    headerRow.forEach((h) => {
      tableHtml += `<th class="px-3.5 py-2.5 font-bold border-r border-slate-200/60 dark:border-zinc-800 last:border-r-0">${h}</th>`;
    });
    tableHtml += `</tr></thead><tbody class="divide-y divide-slate-100 dark:divide-zinc-800">`;

    for (let i = startDataIdx; i < cleanRows.length; i++) {
      const row = cleanRows[i];
      tableHtml += `<tr class="hover:bg-slate-50/75 dark:hover:bg-[#1a1a1a] transition-colors">`;
      row.forEach((cell) => {
        tableHtml += `<td class="px-3.5 py-2.5 text-slate-700 dark:text-[#ccc] border-r border-slate-100 dark:border-zinc-800 last:border-r-0 leading-relaxed">${cell}</td>`;
      });
      tableHtml += `</tr>`;
    }

    tableHtml += `</tbody></table></div>`;
    output.push(tableHtml);
    tableRows = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const isTableRow =
      trimmed.length > 0 &&
      (/^\s*\|.+?\|\s*$/.test(trimmed) || (trimmed.includes("|") && trimmed.split("|").length >= 3));

    if (isTableRow) {
      tableRows.push(trimmed);
    } else {
      if (tableRows.length > 0) {
        flushTable();
      }
      output.push(line);
    }
  }

  if (tableRows.length > 0) {
    flushTable();
  }

  return output.join("\n");
}

export function htmlToMarkdown(html: string): string {
  if (!html) return "";
  if (typeof window === "undefined") return html;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const nodeToMd = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent || "";
      }

      if (node.nodeType !== Node.ELEMENT_NODE) {
        return "";
      }

      const el = node as HTMLElement;
      const tagName = el.tagName.toLowerCase();
      const childrenMd = Array.from(el.childNodes).map(nodeToMd).join("");

      switch (tagName) {
        case "table":
          return `\n\n${childrenMd.trim()}\n\n`;
        case "thead": {
          const firstLine = childrenMd.trim().split("\n")[0] || "";
          const cols = (firstLine.match(/\|/g) || []).length - 1;
          const colCount = cols > 0 ? cols : 1;
          const sep = `| ${Array(colCount).fill("---").join(" | ")} |`;
          return `\n${childrenMd.trim()}\n${sep}\n`;
        }
        case "tbody":
          return `\n${childrenMd.trim()}\n`;
        case "tr": {
          const cells = Array.from(el.children).filter((c) =>
            ["th", "td"].includes(c.tagName.toLowerCase())
          );
          if (cells.length === 0) return childrenMd;
          const cellTexts = cells.map((c) => nodeToMd(c).replace(/\|/g, "\\|").trim());
          return `| ${cellTexts.join(" | ")} |\n`;
        }
        case "th":
        case "td":
          return childrenMd.trim();
        case "strong":
        case "b":
          return childrenMd.trim() ? `**${childrenMd.trim()}**` : "";
        case "em":
        case "i":
          return childrenMd.trim() ? `*${childrenMd.trim()}*` : "";
        case "del":
        case "s":
        case "strike":
          return childrenMd.trim() ? `~~${childrenMd.trim()}~~` : "";
        case "u":
          return childrenMd.trim() ? `<u>${childrenMd.trim()}</u>` : "";
        case "h1":
          return `\n# ${childrenMd.trim()}\n\n`;
        case "h2":
          return `\n## ${childrenMd.trim()}\n\n`;
        case "h3":
          return `\n### ${childrenMd.trim()}\n\n`;
        case "blockquote":
          return `\n> ${childrenMd.trim()}\n\n`;
        case "code":
          if (el.parentElement?.tagName.toLowerCase() === "pre") {
            return childrenMd;
          }
          return `\`${childrenMd}\``;
        case "pre":
          return `\n\`\`\`\n${el.textContent || ""}\n\`\`\`\n\n`;
        case "ul":
          return `\n${childrenMd}\n`;
        case "ol":
          return `\n${childrenMd}\n`;
        case "li": {
          const isOrdered = el.parentElement?.tagName.toLowerCase() === "ol";
          const index = Array.from(el.parentElement?.children || []).indexOf(el) + 1;
          return isOrdered ? `${index}. ${childrenMd.trim()}\n` : `- ${childrenMd.trim()}\n`;
        }
        case "a":
          return `[${childrenMd}](${el.getAttribute("href") || ""})`;
        case "img": {
          const alt = el.getAttribute("alt") || "gambar";
          const src = el.getAttribute("src") || "";
          return `\n![${alt}](${src})\n\n`;
        }
        case "p":
        case "div":
          return childrenMd.trim() ? `${childrenMd}\n\n` : "\n";
        case "br":
          return "\n";
        default:
          return childrenMd;
      }
    };

    const rawMd = Array.from(doc.body.childNodes).map(nodeToMd).join("");
    return rawMd.replace(/\n{3,}/g, "\n\n").trim();
  } catch {
    return html;
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
