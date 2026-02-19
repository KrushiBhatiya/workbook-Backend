const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

/**
 * Validates a student's answer using Gemini AI.
 * Can evaluate text answers and/or images of handwritten work.
 * @param {string} question - The question text.
 * @param {string} studentAnswer - The answer provided by the student.
 * @param {string} languageName - The programming language context.
 * @param {string} imageUrl - (Optional) URL of the uploaded image of work.
 * @returns {Promise<{isValid: boolean, message: string}>}
 */
const validateAnswer = async (question, studentAnswer, languageName, imageUrl = null) => {
    try {
        if ((!studentAnswer || studentAnswer.trim() === '') && !imageUrl) {
            return { isValid: false, message: "Please provide an answer or upload an image before submitting." };
        }

        const languageContext = languageName
            ? `This question is specifically about the "${languageName}" programming language. Evaluate the answer strictly in the context of ${languageName} only.`
            : '';

        const prompt = `
You are a strict educational answer evaluator for a programming workbook.

${languageContext}

QUESTION: "${question}"
STUDENT'S TEXT ANSWER: "${studentAnswer || 'No text provided'}"

TASK:
Evaluate whether the student's answer is correct for the given question${languageName ? ` in the context of ${languageName}` : ''}.
${imageUrl ? 'An image of the student\'s work has been provided. If the student provided no text, evaluate based ENTIRELY on the image. The image might contain handwritten code or diagrams.' : 'Evaluate based on the provided text answer.'}

STRICT RULES:
1. If the solution is correct, respond with "CORRECT" as the very last word of your response. You may provide a brief explanation before it if helpful, but the LAST WORD must be "CORRECT".
2. If the solution is wrong, respond with a brief explanation (max 20 words) and do NOT end with the word "CORRECT".
3. Plain text only. No markdown.

YOUR RESPONSE:`;

        let result;
        if (imageUrl) {
            // Fetch the image and convert to base64 for Gemini
            const response = await fetch(imageUrl);
            const buffer = await response.arrayBuffer();
            const base64Data = Buffer.from(buffer).toString('base64');
            const mimeType = response.headers.get('content-type') || 'image/jpeg';

            result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: mimeType
                    }
                }
            ]);
        } else {
            result = await model.generateContent(prompt);
        }

        const responseText = await result.response;
        const text = responseText.text().trim();

        // Log for debugging
        console.log(`[Gemini] Lang: "${languageName}" | Q: "${question}" | A: "${studentAnswer}" | Image: ${imageUrl ? 'Yes' : 'No'} | Response: "${text}"`);

        // Check if the response indicates correctness. 
        // We look for the word "CORRECT" at the end, but ensure it's not "INCORRECT".
        const upperText = text.toUpperCase().replace(/[^A-Z ]/g, '');
        const words = upperText.split(/\s+/);
        const lastWord = words[words.length - 1];

        if (lastWord === 'CORRECT') {
            return { isValid: true, message: "Correct! Well done." };
        } else {
            return { isValid: false, message: text || "Incorrect... Try Again." };
        }
    } catch (error) {
        console.error("Gemini Validation Error:", error);
        throw new Error("AI Validation failed. Please try again later.");
    }
};

module.exports = { validateAnswer };
