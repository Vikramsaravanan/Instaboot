/**
 * Split a text string into overlapping chunks.
 *
 * @param {string} text        - The full text to chunk
 * @param {number} chunkSize   - Target number of characters per chunk (default 500)
 * @param {number} overlap     - Number of overlapping characters between adjacent chunks (default 50)
 * @returns {string[]}         Array of text chunks
 */
function chunkText(text, chunkSize = 500, overlap = 50) {
  if (!text || typeof text !== 'string') return [];

  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (normalized.length === 0) return [];

  // If the text fits in a single chunk, return it as-is
  if (normalized.length <= chunkSize) return [normalized];

  const chunks = [];
  let start = 0;

  while (start < normalized.length) {
    let end = start + chunkSize;

    // Try to break at a sentence boundary ('. ', '! ', '? ', '\n')
    if (end < normalized.length) {
      const breakChars = ['\n\n', '\n', '. ', '! ', '? ', ', ', ' '];
      let breakFound = false;
      for (const br of breakChars) {
        const idx = normalized.lastIndexOf(br, end);
        if (idx > start + Math.floor(chunkSize * 0.5)) {
          end = idx + br.length;
          breakFound = true;
          break;
        }
      }
      if (!breakFound) {
        // Hard cut at chunkSize
        end = start + chunkSize;
      }
    }

    const chunk = normalized.slice(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    // Advance with overlap
    start = end - overlap;
    if (start >= normalized.length) break;
  }

  return chunks;
}

module.exports = { chunkText };
