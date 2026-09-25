import { formatCsvToMarkdownTable } from './workspaceUtils';

export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  // 1. Primary: unpdf (works seamlessly in all JS environments, Edge, Node, Turbopack, no worker files needed)
  try {
    const { extractText } = await import('unpdf');
    const { totalPages, text } = await extractText(new Uint8Array(buffer), { mergePages: true });
    if (text && text.trim()) {
      return text.trim();
    }
  } catch (unpdfErr) {
    console.warn('unpdf extraction failed, falling back to pdf-parse:', unpdfErr);
  }

  // 2. Fallback: pdf-parse v2
  try {
    // @ts-ignore
    const pdfParseModule: any = await import('pdf-parse');
    const PDFParse = pdfParseModule.PDFParse || pdfParseModule.default?.PDFParse;
    if (PDFParse) {
      const parser = new PDFParse({ data: buffer });
      const res = await parser.getText();
      if (res?.text && res.text.trim()) {
        return res.text.trim();
      }
    }
  } catch (err) {
    console.error('All PDF extraction attempts failed:', err);
  }

  return '';
}

export async function parseDocxBuffer(buffer: Buffer): Promise<string> {
  try {
    const JSZip = (await import('jszip')).default || (await import('jszip'));
    const zip = await JSZip.loadAsync(buffer);
    const docFile = zip.file('word/document.xml');
    if (!docFile) return '';
    const xml = await docFile.async('text');
    return xml
      .replace(/<\/w:p>/g, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\n\s+/g, '\n')
      .trim();
  } catch (err) {
    console.error('DOCX parsing error:', err);
    return '';
  }
}

export async function parsePptxBuffer(buffer: Buffer): Promise<string> {
  try {
    const JSZip = (await import('jszip')).default || (await import('jszip'));
    const zip = await JSZip.loadAsync(buffer);
    const slideEntries = Object.keys(zip.files)
      .filter((name) => name.startsWith('ppt/slides/slide') && name.endsWith('.xml'))
      .sort((a, b) => {
        const numA = parseInt(a.replace(/[^0-9]/g, ''), 10) || 0;
        const numB = parseInt(b.replace(/[^0-9]/g, ''), 10) || 0;
        return numA - numB;
      });

    let fullSlidesText = '';
    for (let i = 0; i < slideEntries.length; i++) {
      const slideFile = zip.file(slideEntries[i]);
      if (slideFile) {
        const xml = await slideFile.async('text');
        const text = xml
          .replace(/<\/a:p>/g, '\n')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .replace(/\n\s+/g, '\n')
          .trim();
        if (text) {
          fullSlidesText += (fullSlidesText ? '\n\n' : '') + `[Slide ${i + 1}]\n${text}`;
        }
      }
    }
    return fullSlidesText;
  } catch (err) {
    console.error('PPTX parsing error:', err);
    return '';
  }
}

export async function parseSpreadsheetBuffer(buffer: Buffer): Promise<string> {
  try {
    const XLSX = (await import('xlsx')).default || (await import('xlsx'));
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return '';
    const sheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(sheet);
    return formatCsvToMarkdownTable(csv);
  } catch (err) {
    console.error('XLSX parsing error:', err);
    return '';
  }
}

export async function extractBufferContent(buf: Buffer, fileName: string): Promise<string> {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.pdf') || (buf.length > 4 && buf.subarray(0, 4).toString() === '%PDF')) {
    return await parsePdfBuffer(buf);
  }
  if (lower.endsWith('.docx') || lower.endsWith('.doc')) {
    return await parseDocxBuffer(buf);
  }
  if (lower.endsWith('.pptx') || lower.endsWith('.ppt')) {
    return await parsePptxBuffer(buf);
  }
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.csv')) {
    return await parseSpreadsheetBuffer(buf);
  }
  return buf.toString('utf-8').slice(0, 30000);
}
