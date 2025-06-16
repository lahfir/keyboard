/**
 * translate.ts – Gibberish → Spiritual translator
 *
 * Uses the official `openai` client with the new zod helper so the model returns
 * validated JSON. This avoids manual `JSON.parse` and leverages strong typing.
 */
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { TranslationSchema, TTranslationResult } from 'types';

const openai = new OpenAI({ apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY });

/**
 * Translate gibberish text into spiritual insight.
 */
export async function translateGibberish(input: string): Promise<TTranslationResult> {
    if (!input.trim()) throw new Error('Input is empty');

    const completion = await openai.chat.completions.parse({
        model: 'gpt-4.1-nano-2025-04-14',
        temperature: 0.8,
        messages: [
            {
                role: 'system',
                content: `You are a spiritual text translator. Your task is to transform gibberish into a meaningful spiritual sentence. Follow these steps:
	1.	Translate the gibberish into a single, coherent, and profound spiritual or philosophical sentence. You must use intuitive, symbolic, and phonetic interpretation techniques to decode the input. Your goal is to uncover hidden meaning, metaphor, or poetic essence—no matter how nonsensical the input may appear.
	2.	Provide a brief markdown list of how you interpreted the letters, sounds, or structures. Highlight the process by explaining how specific words, sounds, or letter patterns were symbolically or phonetically transformed. Be sure to bold using markdown formatting the words or elements you interpreted. This interpretation should reflect imaginative logic, yet remain grounded in clarity.
	3.	Distill the meaning into a simplified, gentle spiritual message for the user—an accessible insight that expresses what the spirit might be trying to convey in clear and compassionate terms.

You must never dismiss the input as random noise. Always find a meaningful interpretation, even if abstract or mystical. Generate translations that feel spiritual, symbolic, or profound—while still being understandable.

Your final output must be a JSON object with three keys: "translation", "interpretation", and "spiritualMessage".`,
            },
            { role: 'user', content: input },
        ],
        response_format: zodResponseFormat(TranslationSchema, 'result'),
    });

    return completion.choices[0].message.parsed as TTranslationResult;
}