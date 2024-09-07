import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
    throw new Error("Missing OpenAI API key. Please set it in the .env file.");
}

const baseURL = 'https://api.openai.com/v1/chat/completions';

interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface GPT4Response {
    id: string;
    object: string;
    created: number;
    model: string;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    choices: Array<{
        message: Message;
        finish_reason: string;
        index: number;
    }>;
}

export const sendMessageToGPT4 = async (messages: Message[]): Promise<GPT4Response> => {
    try {
        const response = await axios.post<GPT4Response>(
            baseURL,
            {
                model: 'gpt-4',
                messages: messages,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error with Axios request:', error.message);
        } else {
            console.error('Unexpected error:', error);
        }
        throw error;
    }
};
