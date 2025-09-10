// Gemini AI Service for Document Processing
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyDgv0kd_pY0heH0mxwpY1HuMgBrOwD0IhU';
const genAI = new GoogleGenerativeAI(API_KEY);

// Document processing interface
export interface DocumentProcessingResult {
  documentType: string;
  confidence: number;
  extractedFields: {
    name?: string;
    dateOfBirth?: string;
    address?: string;
    nationalId?: string;
    vehicleNumber?: string;
    passportNumber?: string;
    [key: string]: any;
  };
  qualityScore: number;
  fraudRisk: number;
  processingTime: string;
  recommendations?: string[];
  issues?: string[];
}

// Document classification prompt
const getDocumentClassificationPrompt = (imageData: string) => `
You are an AI document processing system for Uganda's government services. Analyze this document image and provide a comprehensive assessment.

Please analyze the document and return a JSON response with the following structure:
{
  "documentType": "National ID Application" | "Vehicle Registration" | "Passport Application" | "Tax Return" | "Health Certificate" | "Other",
  "confidence": 0.0-1.0,
  "extractedFields": {
    "name": "extracted name if found",
    "dateOfBirth": "YYYY-MM-DD format if found",
    "address": "extracted address if found",
    "nationalId": "extracted national ID if found",
    "vehicleNumber": "extracted vehicle number if found",
    "passportNumber": "extracted passport number if found"
  },
  "qualityScore": 0.0-1.0,
  "fraudRisk": 0.0-1.0,
  "recommendations": ["list of recommendations for improvement"],
  "issues": ["list of any issues found"]
}

Focus on:
1. Document type identification with high accuracy
2. Extracting personal information clearly visible
3. Assessing document quality (clarity, completeness, legibility)
4. Identifying potential fraud indicators
5. Providing actionable recommendations

Be thorough but concise. Return only valid JSON.
`;

// Image processing function
export const processDocumentWithGemini = async (imageData: string): Promise<DocumentProcessingResult> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Convert base64 to blob for Gemini
    const base64Data = imageData.split(',')[1];
    
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: "image/jpeg"
      }
    };

    const prompt = getDocumentClassificationPrompt(imageData);
    
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsedResult = JSON.parse(cleanedText);
    
    // Calculate processing time (mock for now)
    const processingTime = `${(Math.random() * 2 + 1).toFixed(1)}s`;
    
    // Ensure all required fields are present with defaults
    const processedResult: DocumentProcessingResult = {
      documentType: parsedResult.documentType || 'Unknown Document',
      confidence: Math.min(Math.max(parsedResult.confidence || 0.7, 0.1), 1.0),
      extractedFields: parsedResult.extractedFields || {},
      qualityScore: Math.min(Math.max(parsedResult.qualityScore || 0.8, 0.1), 1.0),
      fraudRisk: Math.min(Math.max(parsedResult.fraudRisk || 0.1, 0.0), 1.0),
      processingTime,
      recommendations: parsedResult.recommendations || [],
      issues: parsedResult.issues || []
    };
    
    return processedResult;
    
  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Fallback response in case of API failure
    return {
      documentType: 'Document Analysis Failed',
      confidence: 0.3,
      extractedFields: {},
      qualityScore: 0.5,
      fraudRisk: 0.5,
      processingTime: 'Error',
      recommendations: ['Please try uploading the document again', 'Ensure the image is clear and well-lit'],
      issues: ['API processing failed', 'Unable to analyze document']
    };
  }
};

// Text-based document analysis (for non-image documents)
export const analyzeDocumentText = async (text: string): Promise<DocumentProcessingResult> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
Analyze this document text and extract information for Uganda government services:

Text: "${text}"

Return a JSON response with:
{
  "documentType": "National ID Application" | "Vehicle Registration" | "Passport Application" | "Tax Return" | "Health Certificate" | "Other",
  "confidence": 0.0-1.0,
  "extractedFields": {
    "name": "extracted name if found",
    "dateOfBirth": "YYYY-MM-DD format if found",
    "address": "extracted address if found",
    "nationalId": "extracted national ID if found",
    "vehicleNumber": "extracted vehicle number if found",
    "passportNumber": "extracted passport number if found"
  },
  "qualityScore": 0.0-1.0,
  "fraudRisk": 0.0-1.0,
  "recommendations": ["list of recommendations"],
  "issues": ["list of any issues found"]
}

Return only valid JSON.
`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();
    
    const cleanedText = textResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsedResult = JSON.parse(cleanedText);
    
    const processingTime = `${(Math.random() * 1.5 + 0.5).toFixed(1)}s`;
    
    return {
      documentType: parsedResult.documentType || 'Text Document',
      confidence: Math.min(Math.max(parsedResult.confidence || 0.8, 0.1), 1.0),
      extractedFields: parsedResult.extractedFields || {},
      qualityScore: Math.min(Math.max(parsedResult.qualityScore || 0.9, 0.1), 1.0),
      fraudRisk: Math.min(Math.max(parsedResult.fraudRisk || 0.05, 0.0), 1.0),
      processingTime,
      recommendations: parsedResult.recommendations || [],
      issues: parsedResult.issues || []
    };
    
  } catch (error) {
    console.error('Gemini Text Analysis Error:', error);
    
    return {
      documentType: 'Text Analysis Failed',
      confidence: 0.4,
      extractedFields: {},
      qualityScore: 0.6,
      fraudRisk: 0.3,
      processingTime: 'Error',
      recommendations: ['Please check the document format', 'Try uploading as an image instead'],
      issues: ['Text analysis failed', 'Unable to process document content']
    };
  }
};

// Test connection function
export const testGeminiConnection = async (): Promise<boolean> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    await model.generateContent("Test connection");
    return true;
  } catch (error) {
    console.error('Gemini connection test failed:', error);
    return false;
  }
};
