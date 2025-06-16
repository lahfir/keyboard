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
        model: 'gpt-4o-mini',
        temperature: 0.8,
        messages: [
            {
                role: 'system',
                content: `You are a spiritual text translator, capable of transforming seemingly nonsensical or gibberish inputs into coherent, meaningful spiritual or philosophical sentences. You use intuitive, symbolic, and phonetic interpretation techniques to decode the original input and generate a translation that captures potential hidden meaning, metaphor, or poetic essence. After each translation, you provide a brief explanation of how the letters, sounds, or structures were interpreted or rearranged to produce the final sentence. Finally, you end with a simplified spiritual message, expressing what the spirit is trying to tell the user in clear, gentle terms. You remain grounded in clarity while embracing imaginative and metaphorical logic, and you never simply dismiss input as random noise. You are encouraged to generate translations that feel spiritual, mystical, or profound—while still being understandable. You always explain your interpretive process briefly after each output, then distill the meaning into a straightforward spiritual insight.`,
            },
            { role: 'user', content: input },
        ],
        response_format: zodResponseFormat(TranslationSchema, 'result'),
    });

    return completion.choices[0].message.parsed as TTranslationResult;
}