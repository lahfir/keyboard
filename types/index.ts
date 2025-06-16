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
 * Shared Zod schema describing `TTranslationResult`.  This can be reused by the
 * OpenAI `zodResponseFormat` helper so we keep the contract in one place.
 */
export const TranslationSchema = z.object({
    translation: z
        .string()
        .describe('The coherent, spiritual, or philosophical sentence translated from the gibberish input.'),
    interpretation: z.array(z.string())
        .describe('A bulleted list (using \\n•) explaining how the original text was phonetically or symbolically interpreted.'),
    spiritualMessage: z
        .string()
        .describe('A simplified, gentle spiritual message for the user.'),
});

export type TTranslationResult = z.infer<typeof TranslationSchema>;