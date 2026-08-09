'use server';
/**
 * @fileOverview An AI agent for generating context-aware guidance questions for milk procurement staff.
 *
 * - generateGuidance - A function that generates helpful questions based on form context.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GuidanceInputSchema = z.object({
  context: z.string().describe('The current content or type of information being entered by the user.'),
  formType: z.enum(['daily-report', 'task', 'breakdown', 'center']).describe('The type of form being filled.'),
});
export type GuidanceInput = z.infer<typeof GuidanceInputSchema>;

const GuidanceOutputSchema = z.object({
  questions: z.array(z.string()).describe('A list of 3-4 helpful, concise questions or prompts in Marathi.'),
});
export type GuidanceOutput = z.infer<typeof GuidanceOutputSchema>;

/**
 * Generates guidance questions. 
 * Includes a try-catch block to handle missing or invalid API keys gracefully.
 */
export async function generateGuidance(input: GuidanceInput): Promise<GuidanceOutput> {
  try {
    // If we're in a dev environment without a key, we might want to return defaults
    if (!process.env.GOOGLE_GENAI_API_KEY) {
      console.warn("AI Guidance: GOOGLE_GENAI_API_KEY is missing. Using fallback questions.");
      return getFallbackQuestions(input.formType);
    }
    const result = await generateGuidanceFlow(input);
    return result;
  } catch (error) {
    console.error("AI Guidance Flow failed:", error);
    return { questions: [] }; // Return empty list instead of crashing
  }
}

function getFallbackQuestions(formType: string): GuidanceOutput {
  const fallbacks: Record<string, string[]> = {
    'daily-report': ["आजच्या दुधाची प्रत (Quality) कशी होती?", "शेतकऱ्यांच्या काही विशेष तक्रारी आहेत का?", "गाडी वेळेवर पोहचली होती का?"],
    'task': ["हे काम पूर्ण करण्यासाठी कोणती साधने लागतील?", "कामात काही अडथळे येत आहेत का?", "हे काम कधीपर्यंत संपेल?"],
    'breakdown': ["दुरुस्तीसाठी किती वेळ लागेल?", "पर्यायी गाडीची सोय झाली आहे का?", "नुकसान टाळण्यासाठी काय उपाय केले?"],
    'center': ["केंद्रावरील स्वच्छता समाधानकारक आहे का?", "काटा आणि मशीन बरोबर काम करत आहेत का?", "बर्फाचा साठा पुरेसा आहे का?"]
  };
  return { questions: fallbacks[formType] || [] };
}

const guidancePrompt = ai.definePrompt({
  name: 'guidancePrompt',
  input: {schema: GuidanceInputSchema},
  output: {schema: GuidanceOutputSchema},
  prompt: `You are an expert AI assistant for a Milk Procurement Management app called "संकलन नोंदवही". 
Your goal is to help procurement officers enter more detailed and accurate data by suggesting 3-4 intelligent, concise questions or prompts.

Context: """{{{context}}}"""
Form Type: {{{formType}}}

Instructions:
1. Provide the output in Marathi.
2. The questions should help the user think about quality, logistics, supplier satisfaction, and operational efficiency.
3. Be professional yet supportive.
4. If the user has entered very little text, suggest broad starting questions.
5. If the user has entered detailed text, suggest specific follow-up or auditing questions.

Form Specifics:
- Daily Report: Focus on route timing, milk quality, and farmer feedback.
- Task: Focus on priority, required resources, and deadlines.
- Breakdown: Focus on salvage value, estimated repair time, and root cause.
`,
});

const generateGuidanceFlow = ai.defineFlow(
  {
    name: 'generateGuidanceFlow',
    inputSchema: GuidanceInputSchema,
    outputSchema: GuidanceOutputSchema,
  },
  async input => {
    const {output} = await guidancePrompt(input);
    return output!;
  }
);
