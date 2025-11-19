'use server';

import { inferSkillsFromVoice } from '@/ai/flows/infer-skills-from-voice';

export async function getSkillsFromVoice(voiceDataUri: string) {
  try {
    if (!voiceDataUri) {
      throw new Error('Voice data is missing.');
    }
    const result = await inferSkillsFromVoice({ voiceDataUri });
    return { skills: result.skills ?? [] };
  } catch (error) {
    console.error('Error inferring skills:', error);
    return { error: 'Failed to process audio. Please try again.' };
  }
}
