import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/api/humanize', async (req, res) => {
    try {
        const { input, systemPrompt, provider, model, language } = req.body;

        if (!input) {
            return res.status(400).json({ error: 'Input is required' });
        }

        const selectedLanguage = language || 'English';
        const finalSystemPrompt = `${systemPrompt}\n\nIMPORTANT: Process the text and output the final result EXCLUSIVELY in ${selectedLanguage}.`;

        const selectedProvider = provider || 'anthropic';
        const selectedModel = model || (selectedProvider === 'gemini' ? 'gemini-2.5-flash' : 'claude-3-7-sonnet-20250219');

        if (selectedProvider === 'gemini') {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                return res.status(500).json({ error: 'Server configuration error: Missing Gemini API Key' });
            }

            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
                model: selectedModel,
                contents: `Humanize and chunk this text in ${selectedLanguage}:\n\n${input}`,
                config: {
                    systemInstruction: finalSystemPrompt
                }
            });

            // Return in same format as frontend expects (like Anthropic)
            return res.json({ content: [{ text: response.text }] });
        } else {
            const apiKey = process.env.ANTHROPIC_API_KEY;
            if (!apiKey) {
                return res.status(500).json({ error: 'Server configuration error: Missing Anthropic API Key' });
            }

            const response = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": apiKey,
                    "anthropic-version": "2023-06-01"
                },
                body: JSON.stringify({
                    model: selectedModel,
                    max_tokens: 4000,
                    system: finalSystemPrompt,
                    messages: [{ role: "user", content: `Humanize and chunk this text in ${selectedLanguage}:\n\n${input}` }],
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || "Something went wrong with the Anthropic API");
            }

            return res.json(data);
        }
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
