export interface ParsedSegment {
  type: 'text' | 'reference';
  content: string;
  page?: number;
}

/**
 * Extrae menciones de numerales o páginas dentro de un texto para volverlas clicables (HU-F12)
 */
export function parseNumeralLinks(text: string): ParsedSegment[] {
  const regex = /\[Ver\s+([^\]]+?)\s*\(Pág\.\s*(\d+)\)\]/gi;
  const segments: ParsedSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: text.slice(lastIndex, match.index),
      });
    }
    segments.push({
      type: 'reference',
      content: match[1].trim(),
      page: Number(match[2]),
    });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  return segments.length > 0 ? segments : [{ type: 'text', content: text }];
}

