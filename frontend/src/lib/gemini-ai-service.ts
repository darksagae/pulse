// Gemini AI Service for Document Extraction
export interface ExtractedData {
  personalInfo: {
    fullName: string;
    idNumber: string;
    dateOfBirth: string;
    gender: string;
    address: {
      village: string;
      parish: string;
      subCounty: string;
      county: string;
      district: string;
    };
    email?: string;
  };
  documentInfo: {
    documentType: string;
    expiryDate: string;
    issuingAuthority: string;
    documentNumber: string;
  };
  confidence: {
    overall: number;
    fields: Record<string, number>;
  };
  aiRecommendations: string[];
  extractedText: string;
  processingTime: number;
}

export interface GeminiResponse {
  success: boolean;
  data?: ExtractedData;
  error?: string;
  processingTime: number;
}

class GeminiAIService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = 'AIzaSyBJyX-IGZofqB--mJ-eIsl8j9pt0x5dYHY';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
  }

  async extractDocumentData(imageBase64: string, documentType: string): Promise<GeminiResponse> {
    const startTime = Date.now();
    
    try {
      const prompt = this.generateExtractionPrompt(documentType);
      
      // Clean the base64 data
      const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
      
      const requestBody = {
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: cleanBase64
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 32,
          topP: 1,
          maxOutputTokens: 2048,
        }
      };

      console.log('Sending request to Gemini API...');
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error response:', errorText);
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Gemini API response received');
      
      const extractedText = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
      console.log('Extracted text length:', extractedText.length);
      
      const extractedData = this.parseGeminiResponse(extractedText, documentType);
      const processingTime = Date.now() - startTime;

      console.log('Document extraction completed successfully');
      return {
        success: true,
        data: {
          ...extractedData,
          processingTime
        },
        processingTime
      };

    } catch (error) {
      console.error('Gemini AI extraction error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        processingTime: Date.now() - startTime
      };
    }
  }

  private generateExtractionPrompt(documentType: string): string {
    // Specialized prompt for NIRA cards
    if (documentType.toLowerCase().includes('nira') || documentType.toLowerCase().includes('national id')) {
      return this.generateNIRAPrompt();
    }
    
    // Default prompt for other document types
    return this.generateDefaultPrompt(documentType);
  }

  private generateNIRAPrompt(): string {
    return `You are a specialized AI trained specifically for NIRA (National Identification and Registration Authority) card extraction in Uganda. You are analyzing a NIRA card which has TWO SIDES: FRONT and BACK.

CRITICAL: You MUST extract ALL fields. Do not leave any field empty. If you cannot find a field, look more carefully at the entire document.

NIRA CARD STRUCTURE:

FRONT SIDE (Main Information):
- Surname: Located at the top, below "Surname" label
- Given Name: Located below "Given Name" label  
- Nationality: Should show "UGA" (Uganda)
- NIN (National Identification Number): 14-digit number
- Date of Expiry: Format __.__.__ (day.month.year)
- Date of Birth: Format __.__.__ (day.month.year)
- Card Number: 9-digit number
- Sex: Either "M" (Male) or "F" (Female)

BACK SIDE (Address Information):
- Village: Information on the left side
- Parish: Information on the left side
- Sub-County: Information on the left side
- County: Information on the left side
- District: Information on the left side

MANDATORY EXTRACTION RULES:
1. FRONT SIDE: Extract personal information (name, NIN, dates, card number, sex)
2. BACK SIDE: Extract address components (village, parish, sub-county, county, district)
3. Convert "M" to "Male" and "F" to "Female"
4. Format dates as DD.MM.YYYY
5. NIN should be exactly 14 digits
6. Card number should be exactly 9 digits
7. COMBINE Surname + Given Name for fullName
8. Look for address information in ALL sections of the back side
9. If you find partial information, extract what you can find
10. NEVER leave a field empty - always provide a value

SEARCH INSTRUCTIONS:
- Look in headers, footers, margins, and all text areas
- Check both sides of the document thoroughly
- Look for numbers that might be NIN or card numbers
- Look for dates in any format and convert to DD.MM.YYYY
- Look for address components in any order
- If you see "M" or "F", convert to "Male" or "Female"
- If you see "UGA", that's the nationality

Return ONLY a valid JSON object in this exact format:
{
  "personalInfo": {
    "fullName": "Surname Given Name",
    "idNumber": "14-digit NIN number",
    "dateOfBirth": "DD.MM.YYYY",
    "gender": "Male/Female",
    "address": {
      "village": "extracted village name",
      "parish": "extracted parish name", 
      "subCounty": "extracted sub-county name",
      "county": "extracted county name",
      "district": "extracted district name"
    },
    "email": null
  },
  "documentInfo": {
    "documentType": "National ID Card",
    "expiryDate": "DD.MM.YYYY",
    "issuingAuthority": "NIRA",
    "documentNumber": "9-digit card number"
  },
  "confidence": {
    "overall": 85,
    "fields": {
      "fullName": 95,
      "idNumber": 90,
      "dateOfBirth": 85,
      "gender": 80,
      "village": 75,
      "parish": 75,
      "subCounty": 75,
      "county": 75,
      "district": 75,
      "email": 0,
      "documentType": 95,
      "expiryDate": 85,
      "issuingAuthority": 80,
      "documentNumber": 90
    }
  },
  "aiRecommendations": [
    "NIRA card appears to be in good condition",
    "All required fields are clearly visible",
    "No signs of tampering detected"
  ],
  "extractedText": "Raw text extracted from the NIRA card"
}

IMPORTANT: If you cannot find a specific field after thorough searching, use "Not Found" as the value and set confidence to 0. But try your best to find ALL fields first.`;
  }

  private generateDefaultPrompt(documentType: string): string {
    return `You are an advanced AI document processing system for a government portal. You are analyzing a document image to extract comprehensive information with high accuracy.

DOCUMENT TYPE: ${documentType}

CRITICAL INSTRUCTIONS:
1. Examine the ENTIRE document image carefully
2. Look for information in ALL sections, headers, footers, and margins
3. Extract information from BOTH front and back if visible
4. Pay attention to small print, stamps, and official markings
5. If information appears in multiple places, use the most complete/clear version
6. IMPORTANT: Address components (village, parish, sub-county, county, district) may be on different documents
7. If you find partial address information, extract what you can find
8. Gender may be indicated as "M" (convert to "Male") or "F" (convert to "Female")
9. MANDATORY: Extract ALL fields - do not leave any field empty
10. If you cannot find a field, look more carefully at the entire document
11. Combine first name and last name for fullName field
12. Look for numbers that might be ID numbers or card numbers
13. Look for dates in any format and convert to DD.MM.YYYY
14. Search thoroughly in all text areas, not just main content

EXTRACTION REQUIREMENTS:
1. Personal Information (extract from ANY part of the document):
   - Full Name: Look for "Name:", "Full Name:", or similar labels
   - ID Number: Look for "ID No:", "National ID:", "Identity Number:", or similar
   - Date of Birth: Look for "DOB:", "Date of Birth:", "Born:", or similar
   - Gender: Look for "Gender:", "Sex:", "M/F:", "M" or "F" indicators. Convert M to "Male" and F to "Female"
   - Address (split into Ugandan administrative divisions - these may be on different documents):
     * Village: Look for "Village:", "Village Name:", "Village of:", or similar
     * Parish: Look for "Parish:", "Parish Name:", "Parish of:", or similar
     * Sub-County: Look for "Sub-County:", "Sub County:", "Sub-County of:", or similar
     * County: Look for "County:", "County Name:", "County of:", or similar
     * District: Look for "District:", "District Name:", "District of:", or similar
     * Note: Address components may be spread across multiple documents or pages
   - Email: Look for "Email:", "E-mail:", or similar

2. Document Information (extract from document headers/footers):
   - Document Type: Identify the specific type of document
   - Expiry Date: Look for "Expires:", "Valid Until:", "Expiry:", or similar
   - Issuing Authority: Look for government department, ministry, or office name
   - Document Number: Look for "Doc No:", "Reference:", "Serial No:", or similar

3. Quality Assessment:
   - Document clarity and readability
   - Presence of official stamps or seals
   - Any signs of tampering or alteration
   - Completeness of information

IMPORTANT: If you cannot find a specific field, look more carefully. Check:
- Headers and footers
- Small print sections
- Official stamps or seals
- Back of document if visible
- Any text in different languages
- Numbers that might be IDs or dates

Return ONLY a valid JSON object in this exact format:
{
  "personalInfo": {
    "fullName": "extracted name or 'Not Found'",
    "idNumber": "extracted ID or 'Not Found'",
    "dateOfBirth": "YYYY-MM-DD or 'Not Found'",
    "gender": "Male/Female or 'Not Found'",
    "address": {
      "village": "extracted village or 'Not Found'",
      "parish": "extracted parish or 'Not Found'",
      "subCounty": "extracted sub-county or 'Not Found'",
      "county": "extracted county or 'Not Found'",
      "district": "extracted district or 'Not Found'"
    },
    "email": "extracted email or null"
  },
  "documentInfo": {
    "documentType": "extracted document type",
    "expiryDate": "YYYY-MM-DD or 'Not Found'",
    "issuingAuthority": "extracted authority or 'Not Found'",
    "documentNumber": "extracted document number or 'Not Found'"
  },
  "confidence": {
    "overall": 85,
    "fields": {
      "fullName": 95,
      "idNumber": 90,
      "dateOfBirth": 85,
      "gender": 80,
      "village": 75,
      "parish": 75,
      "subCounty": 75,
      "county": 75,
      "district": 75,
      "email": 0,
      "documentType": 95,
      "expiryDate": 85,
      "issuingAuthority": 80,
      "documentNumber": 90
    }
  },
  "aiRecommendations": [
    "Document appears to be in good condition",
    "All required fields are clearly visible",
    "No signs of tampering detected"
  ],
  "extractedText": "Raw text extracted from the document"
}

CONFIDENCE SCORING:
- 90-100%: Information is very clear and unambiguous
- 70-89%: Information is clear but might have minor issues
- 50-69%: Information is somewhat unclear or partially visible
- 0-49%: Information is unclear, missing, or questionable

Remember: Look carefully at the ENTIRE document, not just the main content area.`;
  }

  private parseGeminiResponse(responseText: string, documentType: string): ExtractedData {
    try {
      // Clean the response text to extract JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const jsonString = jsonMatch[0];
      const parsed = JSON.parse(jsonString);

      // Validate and clean the data with better fallbacks
      const personalInfo = {
        fullName: this.cleanExtractedValue(parsed.personalInfo?.fullName),
        idNumber: this.cleanExtractedValue(parsed.personalInfo?.idNumber),
        dateOfBirth: this.cleanExtractedValue(parsed.personalInfo?.dateOfBirth),
        gender: this.convertGender(this.cleanExtractedValue(parsed.personalInfo?.gender)),
        address: {
          village: this.cleanExtractedValue(parsed.personalInfo?.address?.village),
          parish: this.cleanExtractedValue(parsed.personalInfo?.address?.parish),
          subCounty: this.cleanExtractedValue(parsed.personalInfo?.address?.subCounty),
          county: this.cleanExtractedValue(parsed.personalInfo?.address?.county),
          district: this.cleanExtractedValue(parsed.personalInfo?.address?.district)
        },
        email: this.cleanExtractedValue(parsed.personalInfo?.email) || undefined
      };

      const documentInfo = {
        documentType: this.cleanExtractedValue(parsed.documentInfo?.documentType) || documentType,
        expiryDate: this.cleanExtractedValue(parsed.documentInfo?.expiryDate),
        issuingAuthority: this.cleanExtractedValue(parsed.documentInfo?.issuingAuthority),
        documentNumber: this.cleanExtractedValue(parsed.documentInfo?.documentNumber)
      };

      // Ensure confidence scores are valid
      const confidence = {
        overall: Math.max(0, Math.min(100, parsed.confidence?.overall || 0)),
        fields: this.cleanConfidenceFields(parsed.confidence?.fields || {})
      };

      const extractedData = {
        personalInfo,
        documentInfo,
        confidence,
        aiRecommendations: Array.isArray(parsed.aiRecommendations) ? parsed.aiRecommendations : [],
        extractedText: parsed.extractedText || responseText,
        processingTime: 0 // Will be set by the calling function
      };

      // Apply NIRA-specific validation if this is a NIRA document
      const finalData = documentType.toLowerCase().includes('nira') || documentType.toLowerCase().includes('national id')
        ? this.validateNIRAFields(extractedData)
        : extractedData;

      // Log extraction results for debugging
      console.log('AI Extraction Results:', {
        documentType,
        personalInfo: finalData.personalInfo,
        documentInfo: finalData.documentInfo,
        confidence: finalData.confidence,
        hasAllFields: this.checkAllFieldsPresent(finalData)
      });

      return finalData;

    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      
      // Return fallback data
      return {
        personalInfo: {
          fullName: 'Extraction Failed',
          idNumber: 'Extraction Failed',
          dateOfBirth: 'Extraction Failed',
          gender: 'Not Found',
          address: {
            village: 'Extraction Failed',
            parish: 'Extraction Failed',
            subCounty: 'Extraction Failed',
            county: 'Extraction Failed',
            district: 'Extraction Failed'
          },
          email: undefined
        },
        documentInfo: {
          documentType: documentType,
          expiryDate: 'Extraction Failed',
          issuingAuthority: 'Extraction Failed',
          documentNumber: 'Extraction Failed'
        },
        confidence: {
          overall: 0,
          fields: {}
        },
        aiRecommendations: ['AI extraction failed - manual review required'],
        extractedText: responseText,
        processingTime: 0
      };
    }
  }

  async extractMultipleDocuments(images: string[], documentType: string): Promise<GeminiResponse[]> {
    console.log(`Starting extraction for ${images.length} documents`);
    
    // Process documents sequentially to avoid API rate limits
    const results: GeminiResponse[] = [];
    
    for (let i = 0; i < images.length; i++) {
      console.log(`Processing document ${i + 1} of ${images.length}`);
      
      try {
        const result = await this.extractDocumentData(images[i], documentType);
        results.push(result);
        
        console.log(`Document ${i + 1} extraction:`, {
          success: result.success,
          hasData: !!result.data,
          processingTime: result.processingTime
        });
        
        // Add a small delay between requests to avoid rate limiting
        if (i < images.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Error processing document ${i + 1}:`, error);
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          processingTime: 0
        });
      }
    }
    
    console.log(`Completed extraction for ${results.length} documents`);
    console.log(`Successful extractions: ${results.filter(r => r.success).length} out of ${results.length}`);
    
    return results;
  }

  private mergeMultipleExtractions(results: GeminiResponse[], documentType: string): ExtractedData | null {
    const successfulResults = results.filter(result => result.success && result.data);
    
    if (successfulResults.length === 0) return null;
    
    // Merge data from all successful extractions
    const mergedPersonalInfo = {
      fullName: this.findBestValue(successfulResults, 'personalInfo.fullName'),
      idNumber: this.findBestValue(successfulResults, 'personalInfo.idNumber'),
      dateOfBirth: this.findBestValue(successfulResults, 'personalInfo.dateOfBirth'),
      gender: this.convertGender(this.findBestValue(successfulResults, 'personalInfo.gender')),
      address: {
        village: this.findBestValue(successfulResults, 'personalInfo.address.village'),
        parish: this.findBestValue(successfulResults, 'personalInfo.address.parish'),
        subCounty: this.findBestValue(successfulResults, 'personalInfo.address.subCounty'),
        county: this.findBestValue(successfulResults, 'personalInfo.address.county'),
        district: this.findBestValue(successfulResults, 'personalInfo.address.district')
      },
      email: this.findBestValue(successfulResults, 'personalInfo.email') || undefined
    };

    const mergedDocumentInfo = {
      documentType: this.findBestValue(successfulResults, 'documentInfo.documentType') || documentType,
      expiryDate: this.findBestValue(successfulResults, 'documentInfo.expiryDate'),
      issuingAuthority: this.findBestValue(successfulResults, 'documentInfo.issuingAuthority'),
      documentNumber: this.findBestValue(successfulResults, 'documentInfo.documentNumber')
    };

    // Calculate merged confidence scores
    const mergedConfidence = this.calculateMergedConfidence(successfulResults);
    
    // Combine all recommendations
    const allRecommendations = successfulResults.flatMap(result => 
      result.data?.aiRecommendations || []
    );

    // Combine all extracted text
    const allExtractedText = successfulResults.map(result => 
      result.data?.extractedText || ''
    ).join('\n\n---\n\n');

    return {
      personalInfo: mergedPersonalInfo,
      documentInfo: mergedDocumentInfo,
      confidence: mergedConfidence,
      aiRecommendations: Array.from(new Set(allRecommendations)), // Remove duplicates
      extractedText: allExtractedText,
      processingTime: successfulResults.reduce((total, result) => total + (result.data?.processingTime || 0), 0)
    };
  }

  private findBestValue(results: GeminiResponse[], fieldPath: string): string {
    const fieldParts = fieldPath.split('.');
    const values = results
      .map(result => {
        if (!result.data) return null;
        let value = result.data as any;
        for (const part of fieldParts) {
          value = value?.[part];
        }
        return value;
      })
      .filter(value => value && value !== 'Not Found' && value !== 'Extraction Failed');

    if (values.length === 0) return 'Not Found';
    
    // Return the value with highest confidence
    const bestResult = results.find(result => {
      if (!result.data) return false;
      let value = result.data as any;
      for (const part of fieldParts) {
        value = value?.[part];
      }
      return value && value !== 'Not Found' && value !== 'Extraction Failed';
    });

    if (bestResult?.data) {
      let value = bestResult.data as any;
      for (const part of fieldParts) {
        value = value?.[part];
      }
      return value;
    }

    return values[0] || 'Not Found';
  }

  private calculateMergedConfidence(results: GeminiResponse[]): { overall: number; fields: Record<string, number> } {
    const fields = [
      'fullName', 'idNumber', 'dateOfBirth', 'gender', 'village', 'parish', 'subCounty', 'county', 'district', 'email',
      'documentType', 'expiryDate', 'issuingAuthority', 'documentNumber'
    ];

    const mergedFields: Record<string, number> = {};
    
    fields.forEach(field => {
      const confidences = results
        .map(result => result.data?.confidence.fields[field])
        .filter((conf): conf is number => conf !== undefined && conf > 0);
      
      if (confidences.length > 0) {
        mergedFields[field] = Math.max(...confidences);
      } else {
        mergedFields[field] = 0;
      }
    });

    const overallConfidence = Object.values(mergedFields).reduce((sum, conf) => sum + conf, 0) / fields.length;

    return {
      overall: Math.round(overallConfidence),
      fields: mergedFields
    };
  }

  private cleanExtractedValue(value: any): string {
    if (!value || value === null || value === undefined) return 'Not Found';
    if (typeof value !== 'string') return String(value);
    if (value.trim() === '' || value.toLowerCase() === 'null' || value.toLowerCase() === 'undefined') return 'Not Found';
    return value.trim();
  }

  private convertGender(gender: string): string {
    if (!gender || gender === 'Not Found') return 'Not Found';
    const cleanGender = gender.trim().toUpperCase();
    if (cleanGender === 'M' || cleanGender === 'MALE') return 'Male';
    if (cleanGender === 'F' || cleanGender === 'FEMALE') return 'Female';
    return gender; // Return as-is if already in correct format
  }

  private validateNIRAFields(extractedData: ExtractedData): ExtractedData {
    // Validate NIN (should be 14 digits)
    if (extractedData.personalInfo.idNumber && extractedData.personalInfo.idNumber !== 'Not Found') {
      const nin = extractedData.personalInfo.idNumber.replace(/\D/g, ''); // Remove non-digits
      if (nin.length === 14) {
        extractedData.personalInfo.idNumber = nin;
        extractedData.confidence.fields.idNumber = Math.max(extractedData.confidence.fields.idNumber, 90);
      } else {
        extractedData.confidence.fields.idNumber = Math.min(extractedData.confidence.fields.idNumber, 50);
      }
    }

    // Validate Card Number (should be 9 digits)
    if (extractedData.documentInfo.documentNumber && extractedData.documentInfo.documentNumber !== 'Not Found') {
      const cardNum = extractedData.documentInfo.documentNumber.replace(/\D/g, ''); // Remove non-digits
      if (cardNum.length === 9) {
        extractedData.documentInfo.documentNumber = cardNum;
        extractedData.confidence.fields.documentNumber = Math.max(extractedData.confidence.fields.documentNumber, 90);
      } else {
        extractedData.confidence.fields.documentNumber = Math.min(extractedData.confidence.fields.documentNumber, 50);
      }
    }

    // Validate date format (should be DD.MM.YYYY)
    const validateDate = (dateStr: string): boolean => {
      if (!dateStr || dateStr === 'Not Found') return false;
      const datePattern = /^\d{2}\.\d{2}\.\d{4}$/;
      return datePattern.test(dateStr);
    };

    if (!validateDate(extractedData.personalInfo.dateOfBirth)) {
      extractedData.confidence.fields.dateOfBirth = Math.min(extractedData.confidence.fields.dateOfBirth, 50);
    }

    if (!validateDate(extractedData.documentInfo.expiryDate)) {
      extractedData.confidence.fields.expiryDate = Math.min(extractedData.confidence.fields.expiryDate, 50);
    }

    // Check for missing critical fields and provide fallbacks
    if (!extractedData.personalInfo.fullName || extractedData.personalInfo.fullName === 'Not Found') {
      extractedData.personalInfo.fullName = 'Name Not Found';
      extractedData.confidence.fields.fullName = 0;
    }

    if (!extractedData.personalInfo.idNumber || extractedData.personalInfo.idNumber === 'Not Found') {
      extractedData.personalInfo.idNumber = 'NIN Not Found';
      extractedData.confidence.fields.idNumber = 0;
    }

    if (!extractedData.personalInfo.dateOfBirth || extractedData.personalInfo.dateOfBirth === 'Not Found') {
      extractedData.personalInfo.dateOfBirth = 'DOB Not Found';
      extractedData.confidence.fields.dateOfBirth = 0;
    }

    if (!extractedData.personalInfo.gender || extractedData.personalInfo.gender === 'Not Found') {
      extractedData.personalInfo.gender = 'Gender Not Found';
      extractedData.confidence.fields.gender = 0;
    }

    // Address validation
    const addressFields = ['village', 'parish', 'subCounty', 'county', 'district'];
    addressFields.forEach(field => {
      if (!extractedData.personalInfo.address[field as keyof typeof extractedData.personalInfo.address] || 
          extractedData.personalInfo.address[field as keyof typeof extractedData.personalInfo.address] === 'Not Found') {
        extractedData.personalInfo.address[field as keyof typeof extractedData.personalInfo.address] = `${field.charAt(0).toUpperCase() + field.slice(1)} Not Found`;
        extractedData.confidence.fields[field] = 0;
      }
    });

    // Document info validation
    if (!extractedData.documentInfo.documentType || extractedData.documentInfo.documentType === 'Not Found') {
      extractedData.documentInfo.documentType = 'National ID Card';
      extractedData.confidence.fields.documentType = 95;
    }

    if (!extractedData.documentInfo.expiryDate || extractedData.documentInfo.expiryDate === 'Not Found') {
      extractedData.documentInfo.expiryDate = 'Expiry Not Found';
      extractedData.confidence.fields.expiryDate = 0;
    }

    if (!extractedData.documentInfo.issuingAuthority || extractedData.documentInfo.issuingAuthority === 'Not Found') {
      extractedData.documentInfo.issuingAuthority = 'NIRA';
      extractedData.confidence.fields.issuingAuthority = 80;
    }

    if (!extractedData.documentInfo.documentNumber || extractedData.documentInfo.documentNumber === 'Not Found') {
      extractedData.documentInfo.documentNumber = 'Card Number Not Found';
      extractedData.confidence.fields.documentNumber = 0;
    }

    return extractedData;
  }

  private checkAllFieldsPresent(extractedData: ExtractedData): boolean {
    const requiredFields = [
      extractedData.personalInfo.fullName,
      extractedData.personalInfo.idNumber,
      extractedData.personalInfo.dateOfBirth,
      extractedData.personalInfo.gender,
      extractedData.personalInfo.address.village,
      extractedData.personalInfo.address.parish,
      extractedData.personalInfo.address.subCounty,
      extractedData.personalInfo.address.county,
      extractedData.personalInfo.address.district,
      extractedData.documentInfo.documentType,
      extractedData.documentInfo.expiryDate,
      extractedData.documentInfo.issuingAuthority,
      extractedData.documentInfo.documentNumber
    ];

    return requiredFields.every(field => 
      field && 
      field !== 'Not Found' && 
      field !== 'Name Not Found' && 
      field !== 'NIN Not Found' && 
      field !== 'DOB Not Found' && 
      field !== 'Gender Not Found' &&
      !field.includes('Not Found')
    );
  }

  private cleanConfidenceFields(fields: any): Record<string, number> {
    const cleanedFields: Record<string, number> = {};
    const expectedFields = [
      'fullName', 'idNumber', 'dateOfBirth', 'gender', 'village', 'parish', 'subCounty', 'county', 'district', 'email',
      'documentType', 'expiryDate', 'issuingAuthority', 'documentNumber'
    ];

    expectedFields.forEach(field => {
      const value = fields[field];
      if (typeof value === 'number' && value >= 0 && value <= 100) {
        cleanedFields[field] = value;
      } else {
        cleanedFields[field] = 0;
      }
    });

    return cleanedFields;
  }
}

export const geminiAIService = new GeminiAIService();
export default geminiAIService;
