interface Moment {
    id: string;
    text: string;
    timestamp: string;
    emotion?: string;
    tags?: string[];
    location?: string;
    weather?: string;
    stravaActivity?: {
        type: string;
        distance: string;
        duration: string;
        calories: number;
    };
}

interface DailySummary {
    title: string;
    story: string;
    mood: number;
    weatherContext: string;
    highlights: Array<{ text: string; sourceMomentId?: string }>;
    actions: Array<{ id: string; text: string; completed: boolean }>;
    tags: string[];
}

class ClaudeService {
    private static instance: ClaudeService;
    private apiKey: string | null = null;

    private constructor() {
        this.apiKey = import.meta.env.VITE_CLAUDE_API_KEY || null;
        if (!this.apiKey) {
            console.warn('⚠️ Claude API key not found. Please set VITE_CLAUDE_API_KEY in your .env file.');
        }
    }

    static getInstance(): ClaudeService {
        if (!ClaudeService.instance) {
            ClaudeService.instance = new ClaudeService();
        }
        return ClaudeService.instance;
    }

    async generateSummary(moments: Moment[]): Promise<DailySummary> {
        if (!this.apiKey) {
            throw new Error('Claude API key not configured. Please set VITE_CLAUDE_API_KEY in your .env file.');
        }

        if (moments.length === 0) {
            throw new Error('No moments provided to generate summary');
        }

        // Format moments for the prompt
        const momentsText = moments.map((m, idx) => {
            let momentStr = `${idx + 1}. [${m.timestamp}] ${m.text}`;
            if (m.emotion) momentStr += ` (Emotion: ${m.emotion})`;
            if (m.location) momentStr += ` (Location: ${m.location})`;
            if (m.weather) momentStr += ` (Weather: ${m.weather})`;
            if (m.tags && m.tags.length > 0) momentStr += ` (Tags: ${m.tags.join(', ')})`;
            if (m.stravaActivity) {
                momentStr += ` (Activity: ${m.stravaActivity.type}, ${m.stravaActivity.distance}, ${m.stravaActivity.duration})`;
            }
            return momentStr;
        }).join('\n');

        const prompt = `You are Momo, a thoughtful AI assistant that helps people reflect on their daily moments. Based on the following moments from someone's day, create a meaningful daily summary.

Moments:
${momentsText}

Please generate a JSON response with the following structure:
{
  "title": "A short, poetic title for the day (max 5 words)",
  "story": "A thoughtful, narrative reflection on the day (2-3 sentences). Write in second person, be empathetic and insightful. Connect patterns and themes you notice.",
  "mood": <number between 1-10, where 1 is very low and 10 is very high>,
  "weatherContext": "A brief weather description based on the moments (e.g., 'Partly Cloudy, 22°C')",
  "highlights": [
    {
      "text": "A meaningful highlight from the day",
      "sourceMomentId": "<moment id>"
    }
  ],
  "actions": [
    {
      "id": "unique-id-1",
      "text": "A specific, actionable recommendation based on the day",
      "completed": false
    }
  ],
  "tags": ["Tag1", "Tag2", "Tag3"]
}

Guidelines:
- The story should be warm, reflective, and help the person understand their day better
- Choose 2-4 most meaningful highlights
- Provide 2-3 actionable recommendations that are specific and helpful
- Tags should capture the main themes (e.g., "Productivity", "Health", "Social", "Stress")
- Mood should reflect the overall emotional tone of the day
- Return ONLY valid JSON, no markdown formatting or code blocks`;

        try {
            const requestBody = {
                model: 'claude-sonnet-4-5',
                max_tokens: 2000,
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
            };

            // Use proxy in development to avoid CORS issues
            const apiUrl = import.meta.env.DEV 
                ? '/api/claude/messages'  // Vite proxy (see vite.config.ts)
                : 'https://api.anthropic.com/v1/messages';

            console.log('📤 Claude API Request:', {
                url: apiUrl,
                model: requestBody.model,
                promptLength: prompt.length,
                isDev: import.meta.env.DEV,
            });

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey,
            };

            // Add version header for production (proxy adds it in dev)
            if (!import.meta.env.DEV) {
                headers['anthropic-version'] = '2023-06-01';
            }

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody),
            });

            console.log('📥 Claude API Response Status:', response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Claude API Error Response:', errorText);
                throw new Error(`Claude API error (${response.status}): ${errorText}`);
            }

            const data = await response.json();
            console.log('📦 Claude API Raw Response:', data);
            
            // Extract the text content from the response
            const content = data.content[0];
            console.log('📄 Claude API Content:', content);
            
            if (content.type !== 'text') {
                throw new Error('Unexpected response type from Claude API');
            }

            let responseText = content.text.trim();
            console.log('📝 Claude API Response Text:', responseText);

            // Remove markdown code blocks if present
            if (responseText.startsWith('```json')) {
                responseText = responseText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
            } else if (responseText.startsWith('```')) {
                responseText = responseText.replace(/^```\n?/, '').replace(/\n?```$/, '');
            }

            // Parse the JSON response
            const summary = JSON.parse(responseText) as DailySummary;
            console.log('✅ Claude API Parsed Summary:', summary);

            // Validate and set defaults
            const finalSummary = {
                title: summary.title || 'A Day in Reflection',
                story: summary.story || 'Your day unfolded with various moments worth remembering.',
                mood: Math.max(1, Math.min(10, summary.mood || 5)),
                weatherContext: summary.weatherContext || 'Unknown',
                highlights: summary.highlights || [],
                actions: summary.actions || [],
                tags: summary.tags || [],
            };
            
            console.log('🎯 Claude API Final Summary:', finalSummary);
            return finalSummary;
        } catch (error) {
            console.error('Claude API error:', error);
            if (error instanceof Error) {
                throw new Error(`Failed to generate summary: ${error.message}`);
            }
            throw new Error('Failed to generate summary from Claude API');
        }
    }
}

export default ClaudeService;

