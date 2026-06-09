const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

/**
 * Parse a CSV file and return an array of row objects.
 * @param {string} filePath - Absolute path to the CSV file
 * @returns {Promise<object[]>} Array of parsed row objects
 */
async function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const records = parse(content, {
    columns: true,          // Use first row as column names
    skip_empty_lines: true,
    trim: true,
    cast: true,             // Auto-cast numbers and booleans
  });
  return records;
}

/**
 * Parse a JSON file and return the parsed value.
 * @param {string} filePath - Absolute path to the JSON file
 * @returns {Promise<any>} Parsed JSON value (array or object)
 */
async function parseJSON(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content);
}

/**
 * Convert any parsed data structure to an array of plain text strings.
 * Handles arrays of objects, plain arrays, and single objects.
 * @param {any} data - Parsed data from parseCSV or parseJSON
 * @returns {string[]} Array of text strings
 */
function extractTextFromData(data) {
  if (!data) return [];

  // If it's a plain string already
  if (typeof data === 'string') return [data];

  // Array of items
  if (Array.isArray(data)) {
    return data.map((item) => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && item !== null) {
        // Convert object to "key: value" pairs joined by a pipe separator
        return Object.entries(item)
          .filter(([, v]) => v !== null && v !== undefined && v !== '')
          .map(([k, v]) => `${k}: ${v}`)
          .join(' | ');
      }
      return String(item);
    }).filter(Boolean);
  }

  // Single object
  if (typeof data === 'object') {
    return Object.entries(data)
      .filter(([, v]) => v !== null && v !== undefined)
      .map(([k, v]) => {
        if (typeof v === 'object') return `${k}: ${JSON.stringify(v)}`;
        return `${k}: ${v}`;
      });
  }

  return [String(data)];
}

module.exports = { parseCSV, parseJSON, extractTextFromData };
