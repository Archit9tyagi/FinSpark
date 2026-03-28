import pdf from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Parse uploaded documents (PDF, DOCX, TXT) into structured chunks
 */
export async function parseDocument(buffer, mimeType, filename) {
  let rawText = '';

  if (mimeType === 'application/pdf' || filename?.endsWith('.pdf')) {
    const data = await pdf(buffer);
    rawText = data.text;
  } else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    filename?.endsWith('.docx')
  ) {
    const result = await mammoth.extractRawText({ buffer });
    rawText = result.value;
  } else {
    rawText = buffer.toString('utf-8');
  }

  return chunkDocument(rawText, filename);
}

/**
 * Hierarchical semantic chunking: split by sections, headers, paragraphs
 */
function chunkDocument(text, filename) {
  const sections = [];
  const lines = text.split('\n');
  let currentSection = { title: 'Document Header', content: [], hierarchy: [] };
  let sectionIndex = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Detect section headers (numbered sections like "4.1", "Section X:", all-caps lines)
    const sectionMatch = trimmed.match(/^(\d+\.?\d*\.?\d*)\s+(.+)/);
    const headerMatch = trimmed.match(/^(#{1,4})\s+(.+)/);
    const capsMatch = trimmed.match(/^[A-Z][A-Z\s]{4,}$/);
    const labeledSection = trimmed.match(/^(Section|Chapter|Part)\s+\d+/i);

    if (sectionMatch || headerMatch || capsMatch || labeledSection) {
      if (currentSection.content.length > 0) {
        sections.push({
          chunk_id: `chunk_${sectionIndex++}`,
          section_hierarchy: [...currentSection.hierarchy, currentSection.title],
          content: currentSection.content.join('\n'),
          content_type: detectContentType(currentSection.content.join('\n')),
          metadata: { source: filename, chunk_index: sectionIndex }
        });
      }
      currentSection = {
        title: sectionMatch ? sectionMatch[2] : headerMatch ? headerMatch[2] : trimmed,
        content: [],
        hierarchy: sectionMatch ? [sectionMatch[1]] : []
      };
    } else {
      currentSection.content.push(trimmed);
    }
  }

  // Push final section
  if (currentSection.content.length > 0) {
    sections.push({
      chunk_id: `chunk_${sectionIndex}`,
      section_hierarchy: [...currentSection.hierarchy, currentSection.title],
      content: currentSection.content.join('\n'),
      content_type: detectContentType(currentSection.content.join('\n')),
      metadata: { source: filename, chunk_index: sectionIndex }
    });
  }

  // If no sections were detected, return the whole document as one chunk
  if (sections.length === 0) {
    sections.push({
      chunk_id: 'chunk_0',
      section_hierarchy: ['Full Document'],
      content: text.trim(),
      content_type: 'paragraph',
      metadata: { source: filename, chunk_index: 0 }
    });
  }

  return {
    document_id: `doc_${Date.now()}`,
    filename,
    total_chunks: sections.length,
    raw_text_length: text.length,
    chunks: sections
  };
}

function detectContentType(content) {
  if (content.includes('|') && content.includes('-')) return 'table';
  if (content.match(/^[-*•]\s/m)) return 'list';
  if (content.match(/^\d+\.\s/m)) return 'ordered_list';
  return 'paragraph';
}

export function parseRawText(text) {
  return chunkDocument(text, 'raw_input.txt');
}
