/**
 * Document processing service
 * Handles OCR and parsing of financial documents
 */

import { DocumentType } from '@prisma/client';
import { parseCSV } from '@/lib/utils/csv-parser';
import { parsePDF } from '@/lib/utils/pdf-parser';

export interface ProcessingResult {
  success: boolean;
  error?: string;
  data?: any;
  confidence?: number;
  pageCount?: number;
  accounts?: any[];
  transactions?: ParsedTransaction[];
}

export interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  balance?: number;
  category?: string;
}

/**
 * Process document based on type
 */
export async function processDocument(
  fileUrl: string,
  documentType: DocumentType
): Promise<ProcessingResult> {
  try {
    switch (documentType) {
      case DocumentType.BANK_STATEMENT:
        return processBankStatement(fileUrl);
        
      case DocumentType.CREDIT_CARD_STATEMENT:
        return processCreditCardStatement(fileUrl);
        
      case DocumentType.INVESTMENT_STATEMENT:
        return processInvestmentStatement(fileUrl);
        
      case DocumentType.TAX_DOCUMENT:
        return processTaxDocument(fileUrl);
        
      case DocumentType.RECEIPT:
        return processReceipt(fileUrl);
        
      case DocumentType.INVOICE:
        return processInvoice(fileUrl);
        
      default:
        return processGenericDocument(fileUrl);
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Processing failed'
    };
  }
}

// ==================== DOCUMENT TYPE PROCESSORS ====================

async function processBankStatement(fileUrl: string): Promise<ProcessingResult> {
  const fileType = getFileTypeFromUrl(fileUrl);
  
  if (fileType === 'csv') {
    return processCSVBankStatement(fileUrl);
  } else if (fileType === 'pdf') {
    return processPDFBankStatement(fileUrl);
  }
  
  return {
    success: false,
    error: 'Unsupported file type for bank statement'
  };
}

async function processCSVBankStatement(fileUrl: string): Promise<ProcessingResult> {
  try {
    const csvData = await fetchFileContent(fileUrl);
    const parsed = await parseCSV(csvData);
    
    // Common CSV column mappings
    const columnMappings = [
      { date: ['Date', 'Transaction Date', 'Post Date'], 
        description: ['Description', 'Transaction', 'Details'],
        amount: ['Amount', 'Debit/Credit', 'Transaction Amount'],
        balance: ['Balance', 'Running Balance', 'Available Balance']
      }
    ];
    
    const transactions: ParsedTransaction[] = [];
    let confidence = 0.9; // High confidence for structured CSV
    
    // Detect columns
    const headers = parsed[0];
    const mapping = detectColumnMapping(headers, columnMappings[0]);
    
    if (!mapping.date || !mapping.description || !mapping.amount) {
      return {
        success: false,
        error: 'Could not detect required columns in CSV'
      };
    }
    
    // Parse transactions
    for (let i = 1; i < parsed.length; i++) {
      const row = parsed[i];
      const date = row[mapping.date];
      const description = row[mapping.description];
      const amount = parseAmount(row[mapping.amount]);
      const balance = mapping.balance ? parseAmount(row[mapping.balance]) : undefined;
      
      if (date && description && !isNaN(amount)) {
        transactions.push({
          date: normalizeDate(date),
          description: description.trim(),
          amount,
          balance
        });
      }
    }
    
    return {
      success: true,
      confidence,
      transactions,
      data: { rowCount: parsed.length, transactionCount: transactions.length }
    };
    
  } catch (error: any) {
    return {
      success: false,
      error: `CSV parsing failed: ${error.message}`
    };
  }
}

async function processPDFBankStatement(fileUrl: string): Promise<ProcessingResult> {
  try {
    // This would integrate with OCR service (Google Vision, AWS Textract, etc.)
    const ocrResult = await performOCR(fileUrl);
    
    if (!ocrResult.success) {
      return ocrResult;
    }
    
    // Extract transactions from OCR text
    const transactions = extractTransactionsFromText(ocrResult.text);
    const accounts = extractAccountsFromText(ocrResult.text);
    
    return {
      success: true,
      confidence: ocrResult.confidence,
      pageCount: ocrResult.pageCount,
      transactions,
      accounts,
      data: { 
        extractedText: ocrResult.text.substring(0, 1000) // Sample
      }
    };
    
  } catch (error: any) {
    return {
      success: false,
      error: `PDF processing failed: ${error.message}`
    };
  }
}

async function processCreditCardStatement(fileUrl: string): Promise<ProcessingResult> {
  // Similar to bank statement but with credit card specific parsing
  return processBankStatement(fileUrl);
}

async function processInvestmentStatement(fileUrl: string): Promise<ProcessingResult> {
  // Process investment statements with holdings and transactions
  return {
    success: false,
    error: 'Investment statement processing not yet implemented'
  };
}

async function processTaxDocument(fileUrl: string): Promise<ProcessingResult> {
  // Extract tax-relevant information
  return {
    success: false,
    error: 'Tax document processing not yet implemented'
  };
}

async function processReceipt(fileUrl: string): Promise<ProcessingResult> {
  // Simple receipt processing
  try {
    const ocrResult = await performOCR(fileUrl);
    
    if (!ocrResult.success) {
      return ocrResult;
    }
    
    // Extract receipt data
    const receiptData = extractReceiptData(ocrResult.text);
    
    return {
      success: true,
      confidence: ocrResult.confidence,
      data: receiptData,
      transactions: receiptData.total ? [{
        date: receiptData.date || new Date().toISOString(),
        description: receiptData.merchant || 'Receipt',
        amount: -Math.abs(receiptData.total) // Receipts are usually expenses
      }] : []
    };
    
  } catch (error: any) {
    return {
      success: false,
      error: `Receipt processing failed: ${error.message}`
    };
  }
}

async function processInvoice(fileUrl: string): Promise<ProcessingResult> {
  // Process invoices
  return {
    success: false,
    error: 'Invoice processing not yet implemented'
  };
}

async function processGenericDocument(fileUrl: string): Promise<ProcessingResult> {
  // Generic document processing
  try {
    const ocrResult = await performOCR(fileUrl);
    
    return {
      success: ocrResult.success,
      confidence: ocrResult.confidence,
      pageCount: ocrResult.pageCount,
      data: { text: ocrResult.text }
    };
    
  } catch (error: any) {
    return {
      success: false,
      error: `Document processing failed: ${error.message}`
    };
  }
}

// ==================== OCR INTEGRATION ====================

async function performOCR(fileUrl: string): Promise<any> {
  // This would integrate with actual OCR service
  // For now, return mock result
  
  if (process.env.GOOGLE_CLOUD_PROJECT_ID) {
    return performGoogleVisionOCR(fileUrl);
  } else if (process.env.AWS_TEXTRACT_REGION) {
    return performAWSTextractOCR(fileUrl);
  } else if (process.env.AZURE_FORM_RECOGNIZER_ENDPOINT) {
    return performAzureFormRecognizerOCR(fileUrl);
  }
  
  // Mock OCR result for development
  return {
    success: true,
    confidence: 0.85,
    pageCount: 1,
    text: 'Mock OCR text extraction result'
  };
}

async function performGoogleVisionOCR(fileUrl: string): Promise<any> {
  // Google Cloud Vision API integration
  return {
    success: false,
    error: 'Google Vision OCR not implemented'
  };
}

async function performAWSTextractOCR(fileUrl: string): Promise<any> {
  // AWS Textract integration
  return {
    success: false,
    error: 'AWS Textract OCR not implemented'
  };
}

async function performAzureFormRecognizerOCR(fileUrl: string): Promise<any> {
  // Azure Form Recognizer integration
  return {
    success: false,
    error: 'Azure Form Recognizer not implemented'
  };
}

// ==================== EXTRACTION UTILITIES ====================

function extractTransactionsFromText(text: string): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  
  // Common transaction patterns
  const patterns = [
    // MM/DD/YYYY Description Amount
    /(\d{1,2}\/\d{1,2}\/\d{4})\s+(.+?)\s+\$?([\d,]+\.?\d*)/g,
    // DD MMM YYYY Description Amount
    /(\d{1,2}\s+\w{3}\s+\d{4})\s+(.+?)\s+\$?([\d,]+\.?\d*)/g
  ];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      transactions.push({
        date: normalizeDate(match[1]),
        description: match[2].trim(),
        amount: parseAmount(match[3])
      });
    }
  }
  
  return transactions;
}

function extractAccountsFromText(text: string): any[] {
  const accounts = [];
  
  // Look for account patterns
  const accountPattern = /Account\s*(?:Number|#)?\s*:?\s*(\*+\d{4})/gi;
  const balancePattern = /(?:Current|Available)\s+Balance\s*:?\s*\$?([\d,]+\.?\d*)/gi;
  
  let accountMatch;
  while ((accountMatch = accountPattern.exec(text)) !== null) {
    const accountNumber = accountMatch[1];
    
    // Look for nearby balance
    const balanceMatch = balancePattern.exec(text);
    const balance = balanceMatch ? parseAmount(balanceMatch[1]) : null;
    
    accounts.push({
      accountNumber,
      balance
    });
  }
  
  return accounts;
}

function extractReceiptData(text: string): any {
  const data: any = {};
  
  // Extract merchant name (usually at the top)
  const lines = text.split('\n');
  if (lines.length > 0) {
    data.merchant = lines[0].trim();
  }
  
  // Extract date
  const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/;
  const dateMatch = text.match(datePattern);
  if (dateMatch) {
    data.date = normalizeDate(dateMatch[1]);
  }
  
  // Extract total
  const totalPattern = /(?:Total|Amount|Due)\s*:?\s*\$?([\d,]+\.?\d*)/i;
  const totalMatch = text.match(totalPattern);
  if (totalMatch) {
    data.total = parseAmount(totalMatch[1]);
  }
  
  return data;
}

// ==================== UTILITY FUNCTIONS ====================

function getFileTypeFromUrl(url: string): string {
  const extension = url.split('.').pop()?.toLowerCase() || '';
  return extension;
}

async function fetchFileContent(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch file');
  }
  return response.text();
}

function detectColumnMapping(headers: string[], mappings: any): any {
  const result: any = {};
  
  for (const [key, patterns] of Object.entries(mappings)) {
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i].toLowerCase();
      const matched = (patterns as string[]).some(pattern => 
        header.includes(pattern.toLowerCase())
      );
      
      if (matched) {
        result[key] = i;
        break;
      }
    }
  }
  
  return result;
}

function parseAmount(value: string): number {
  // Remove currency symbols and commas
  const cleaned = value.replace(/[$,]/g, '').trim();
  
  // Handle negative amounts (parentheses or minus)
  const isNegative = cleaned.startsWith('(') || cleaned.startsWith('-');
  const amount = parseFloat(cleaned.replace(/[()]/g, ''));
  
  return isNegative ? -Math.abs(amount) : amount;
}

function normalizeDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  } catch (error) {
    // Try other date formats
  }
  
  // Return original if can't parse
  return dateStr;
}