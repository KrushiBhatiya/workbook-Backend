const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

/**
 * Validates a student's answer using Gemini AI.
 * No stored correct answer is needed — Gemini evaluates based on general knowledge.
 * @param {string} question - The question text.
 * @param {string} studentAnswer - The answer provided by the student.
 * @param {string} languageName - The programming language context (e.g., "C", "C++", "Python").
 * @returns {Promise<{isValid: boolean, message: string}>}
 */
const validateAnswer = async (question, studentAnswer, languageName) => {
    try {
        if (!studentAnswer || studentAnswer.trim() === '') {
            return { isValid: false, message: "Please provide an answer before submitting." };
        }

        const languageContext = languageName
            ? `This question is specifically about the "${languageName}" programming language. Evaluate the answer strictly in the context of ${languageName} only.`
            : '';

        const prompt = `
You are a strict educational answer evaluator for a programming workbook.

${languageContext}

QUESTION: "${question}"
STUDENT'S ANSWER: "${studentAnswer}"

TASK:
Evaluate whether the student's answer is correct for the given question${languageName ? ` in the context of ${languageName}` : ''}.

STRICT RULES:
1. If the answer is correct or substantially correct for this specific language/context, respond with EXACTLY the single word: CORRECT
2. If the answer is wrong, incomplete, irrelevant, or written for a different language/context, respond with a brief explanation (max 20 words) of why it is wrong.
3. NEVER use the word "CORRECT" in your explanation if the answer is wrong.
4. Do NOT include any markdown, quotes, or formatting. Plain text only.

YOUR RESPONSE:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        // Log for debugging
        console.log(`[Gemini] Lang: "${languageName}" | Q: "${question}" | A: "${studentAnswer}" | Response: "${text}"`);

        // Strip punctuation and check for exact "CORRECT"
        const normalized = text.replace(/[^a-zA-Z]/g, '').toUpperCase();
        if (normalized === 'CORRECT') {
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
