import { z } from 'zod';

/**
 * Shared primitive and domain types for the project.
 *
 * All new type aliases should be exported from this barrel file so consumers
 * can simply `import { TKey } from 'types'`.
 */

/**
 * `TKey` represents a single uppercase Latin letter used by the custom keyboard.
 */
export type TKey = string;

/**
 * Structured result returned by the gibberish translator.
 */

/**
 * Shared Zod schema describing `TTranslationResult`.  This can be reused by the
 * OpenAI `zodResponseFormat` helper so we keep the contract in one place.
 */
export const TranslationSchema = z.object({
    translation: z.string().describe('The translated spiritual message'),
    explanation: z.string().describe('A brief explanation of the interpretive process'),
    wordInsights: z.array(z.object({
        word: z.string().describe('The word that was translated'),
        insight: z.string().describe('A brief explanation of the word'),
    })).describe('Word-by-word or fragment-by-fragment breakdown'),
    insight: z.string().describe('A distilled spiritual insight for the user'),
});

export type TTranslationResult = z.infer<typeof TranslationSchema>;