'use server';

/**
 * @fileOverview Infers skills from voice input using Genkit.
 *
 * - inferSkillsFromVoice - A function that infers skills from voice input.
 * - InferSkillsFromVoiceInput - The input type for the inferSkillsFromVoice function.
 * - InferSkillsFromVoiceOutput - The return type for the inferSkillsFromVoice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InferSkillsFromVoiceInputSchema = z.object({
  voiceDataUri: z
    .string()
    .describe(
      "A voice recording of the user describing their work experience, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type InferSkillsFromVoiceInput = z.infer<typeof InferSkillsFromVoiceInputSchema>;

const InferSkillsFromVoiceOutputSchema = z.object({
  skills: z.array(z.string()).describe('An array of skills inferred from the voice input.'),
});
export type InferSkillsFromVoiceOutput = z.infer<typeof InferSkillsFromVoiceOutputSchema>;

export async function inferSkillsFromVoice(input: InferSkillsFromVoiceInput): Promise<InferSkillsFromVoiceOutput> {
  return inferSkillsFromVoiceFlow(input);
}

const inferSkillsFromVoicePrompt = ai.definePrompt({
  name: 'inferSkillsFromVoicePrompt',
  input: {schema: InferSkillsFromVoiceInputSchema},
  output: {schema: InferSkillsFromVoiceOutputSchema},
  prompt: `You are an AI assistant that extracts skills from voice input transcripts.

  Analyze the following voice input transcript and extract a list of skills that the user possesses.  Return the skills as a JSON array of strings.

  Voice input: {{{voiceDataUri}}}
  Skills:`,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const inferSkillsFromVoiceFlow = ai.defineFlow(
  {
    name: 'inferSkillsFromVoiceFlow',
    inputSchema: InferSkillsFromVoiceInputSchema,
    outputSchema: InferSkillsFromVoiceOutputSchema,
  },
  async input => {
    const {output} = await inferSkillsFromVoicePrompt(input);
    return output!;
  }
);
