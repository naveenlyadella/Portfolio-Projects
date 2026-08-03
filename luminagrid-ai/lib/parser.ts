import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export async function parseFile(file: File): Promise<{
  fileName: string;
  rowCount: number;
  columns: string[];
  sampleRows: Record<string, unknown>[];
}> {
  const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

  return new Promise((resolve, reject) => {
    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[firstSheetName];
          const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

          if (rows.length === 0) {
            reject(new Error('No data found in the Excel file.'));
            return;
          }

          const columns = Object.keys(rows[0]);
          resolve({
            fileName: file.name,
            rowCount: rows.length,
            columns,
            sampleRows: rows.slice(0, 5),
          });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsArrayBuffer(file);
    } else {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          const rows = results.data as Record<string, unknown>[];
          if (rows.length === 0) {
            reject(new Error('No data found in the CSV file.'));
            return;
          }
          const columns = Object.keys(rows[0]);
          resolve({
            fileName: file.name,
            rowCount: rows.length,
            columns,
            sampleRows: rows.slice(0, 5),
          });
        },
        error: (err) => reject(err),
      });
    }
  });
}
