/**
 * CSV parsing utility
 */

export async function parseCSV(csvText: string): Promise<string[][]> {
  const lines = csvText.split('\n');
  const result: string[][] = [];
  
  for (const line of lines) {
    if (line.trim()) {
      const row = parseCSVLine(line);
      result.push(row);
    }
  }
  
  return result;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"' && inQuotes && nextChar === '"') {
      // Escaped quote
      current += '"';
      i++; // Skip next quote
    } else if (char === '"') {
      // Toggle quote state
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add last field
  result.push(current.trim());
  
  return result;
}

export function csvToJSON(csvData: string[][], headers?: string[]): Record<string, any>[] {
  if (csvData.length === 0) return [];
  
  const columnHeaders = headers || csvData[0];
  const dataStart = headers ? 0 : 1;
  const result: Record<string, any>[] = [];
  
  for (let i = dataStart; i < csvData.length; i++) {
    const row = csvData[i];
    const obj: Record<string, any> = {};
    
    for (let j = 0; j < columnHeaders.length; j++) {
      obj[columnHeaders[j]] = row[j] || '';
    }
    
    result.push(obj);
  }
  
  return result;
}