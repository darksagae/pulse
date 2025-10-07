# 🔍 Check AI Data in Browser

## Quick Diagnostic

### Step 1: Open Browser Console
1. Go to http://localhost:3000
2. Press **F12** (Developer Tools)
3. Click **Console** tab

### Step 2: Run This Command

Copy and paste this ENTIRE code into the console:

```javascript
// === AI DATA DIAGNOSTIC ===
console.clear();
console.log('🔍 AI DATA DIAGNOSTIC TOOL');
console.log('='.repeat(50));

const deptSubs = JSON.parse(localStorage.getItem('departmentSubmissions') || '{}');
let totalDocs = 0;
let docsWithAI = 0;
let docsWithoutAI = 0;

for (const dept in deptSubs) {
    console.log(`\n📁 Department: ${dept.toUpperCase()}`);
    const docs = deptSubs[dept];
    
    docs.forEach((doc, index) => {
        totalDocs++;
        const hasAI = !!(doc.aiExtractedData && doc.aiExtractedData.length > 0);
        
        if (hasAI) docsWithAI++;
        else docsWithoutAI++;
        
        console.log(`\n  📄 Document ${index + 1}:`);
        console.log(`     Card: ${doc.cardNumber}`);
        console.log(`     Type: ${doc.documentType}`);
        console.log(`     AI Data: ${hasAI ? '✅ YES' : '❌ NO'}`);
        
        if (hasAI) {
            console.log(`     → Name: ${doc.aiExtractedData[0].personalInfo.fullName}`);
            console.log(`     → ID: ${doc.aiExtractedData[0].personalInfo.idNumber}`);
            console.log(`     → Confidence: ${doc.aiExtractedData[0].confidence.overall}%`);
        }
    });
}

console.log('\n' + '='.repeat(50));
console.log('📊 SUMMARY:');
console.log(`   Total Documents: ${totalDocs}`);
console.log(`   With AI Data: ${docsWithAI} ✅`);
console.log(`   Without AI Data: ${docsWithoutAI} ❌`);
console.log('='.repeat(50));

if (docsWithoutAI === totalDocs && totalDocs > 0) {
    console.log('\n⚠️ PROBLEM: No documents have AI data!');
    console.log('   Solution: Submit a NEW document to test AI extraction');
}
```

### Step 3: Interpret Results

**If you see:**
- ✅ `With AI Data: 0` → AI extraction isn't working, need to fix
- ✅ `Total Documents: 0` → No documents yet, submit one to test

### Step 4: Clear Old Data (If Needed)

If all documents show "❌ NO" for AI Data, they were submitted before the fix. Clear them:

```javascript
localStorage.clear();
alert('Storage cleared! Now submit a NEW document to test.');
```

Then refresh the page and submit a NEW document.

---

## Expected Console Output When Submitting

When you submit a document with the NEW code, you should see:

```
🔄 STEP 1: Merging 2 images into a single image...
  - Original images count: 2
  - Original image sizes: ["Image 1: 2.45MB", "Image 2: 2.31MB"]
✅ Successfully merged images into one
  - Merged image size: 4.12 MB

⚙️ STEP 2: Optimizing images for AI processing...
  - Images to optimize: 1
  - Optimizing image 1/1...
✅ Image optimization completed
  - Optimized images count: 1
  - Optimized sizes: ["Image 1: 3.45MB"]

🤖 STEP 3: Starting AI extraction...
  - Images to process: 1
  - Document type: national_id
  - Image data being sent to AI: YES ✅

📊 AI Extraction Results:
  - Total results: 1
  - Results detail: [...]
✅ Successful extractions: 1 out of 1

📄 Extracted Data Preview:
  - Name: MUGALU ABRAHAM
  - ID Number: CM2044449350
  - Confidence: 85%
  - Village: [extracted village]
  - District: MUBENDE

💾 STEP 4: Creating submission data...
  - Card Number: NIR-NA-015287-940
  - AI Extractions to save: 1

📦 Submission Data Created:
  - Has aiExtractedData: true
  - aiExtractedData length: 1

💾 STEP 5: Storing to localStorage...
✅ Stored submission data successfully
  - AI Data Included: true
🔍 Verification - Document saved with AI data: true
  - Saved AI data length: 1
```

---

## If You DON'T See This Output

The AI extraction is failing. Possible reasons:
1. Gemini API key is invalid
2. Network issue connecting to Gemini
3. Image format not supported
4. Code error in extraction

Run the diagnostic above to check!

