import express, { Request, Response } from 'express';
import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const app = express();
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY || '',
});
const openai = new OpenAIApi(configuration);

app.use(cors());
app.use(express.json());

app.post('/api/summary', async (req: Request, res: Response) => {
    const { text, language } = req.body;
    console.log(text, language)

    if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Invalid text.' });
    }

    if (!language || typeof language !== 'string') {
        return res.status(400).json({ error: 'Invalid language.' });
    }

    const inputChunks = splitText(text);
    const result = await summarizeChunks(inputChunks, language);
    
    res.json({ summary: result });
});

function splitText(text: string): string[] {
    const maxChunkSize = 512;
    const chunks: string[] = [];
    let currentChunk = '';

    const sentences = text.split('.');
    for (const sentence of sentences) {
        if (currentChunk.length + sentence.length < maxChunkSize) {
            currentChunk += sentence + '.';
        } else {
            chunks.push(currentChunk.trim());
            currentChunk = sentence + '.';
        }
    }

    if (currentChunk) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
}

async function summarizeChunks(chunks: string[], language: string): Promise<string> {
    const messages = [];

    messages.push({
        role: 'system',
        content: `You are a translator. You receive texts in any language and you have to summarize them and translate them in ${language}.`,
    });

    messages.push({
        role: 'system',
        content: `You have to receive all of the messages first, then combine them, then summarize them and then translate them in ${language}.`,
    });

    messages.push({
        role: 'system',
        content: 'You have to return ONLY the translated summarized text, with no text from the original language.',
    });
    
     messages.push({
        role: 'system',
        content: 'The output HAS TO be AT LEAST 50% in length of the input.',
    });

    for (const chunk of chunks) {
        messages.push({role: 'user', content: chunk});
    }

    const result = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo-16k',
        messages,
        temperature: 0.5,
    });

    return result.data.choices[0].message.content;
}


const port = 3001;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})
