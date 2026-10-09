import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, userPrompt, focusMode, summaryLength, temperature } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        status: 'fallback',
        message: 'No GEMINI_API_KEY detected in environment. Using on-device intelligence engine.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `You are a privacy-first, executive-level unread chat assistant.
Analyze the following multi-platform unread chat messages:
${JSON.stringify(messages, null, 2)}

User request / custom focus: ${userPrompt || 'Digest all unread items with high precision.'}
Focus Mode: ${focusMode || 'All-Round Digest'}
Length Detail: ${summaryLength || 'Balanced'}

Generate a structured analysis in strict JSON without markdown formatting:
{
  "executiveSummary": "A concise executive briefing (2-4 sentences) summarizing the state across all channels",
  "bulletHighlights": ["bullet 1", "bullet 2", "bullet 3", "bullet 4"],
  "actionItems": [
    {
      "id": "act-1",
      "task": "Specific actionable task",
      "assignee": "@name or @you",
      "deadline": "Extracted deadline or ASAP",
      "platform": "Slack | Telegram | WhatsApp | Discord",
      "priority": "High | Medium | Low",
      "done": false
    }
  ],
  "decisions": [
    {
      "id": "dec-1",
      "title": "Decided item headline",
      "detail": "Context and consensus explanation",
      "channel": "#channel-name or Group",
      "agreedBy": ["name1", "name2"]
    }
  ],
  "urgentAlerts": [
    {
      "id": "alert-1",
      "sender": "Sender name",
      "platform": "Slack | Telegram | WhatsApp | Discord",
      "channel": "#channel or Direct Message",
      "message": "The exact urgent question, request, or blocker",
      "timestamp": "Time string",
      "isDirectMention": true,
      "severity": "critical | warning | info"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: typeof temperature === 'number' ? temperature : 0.2,
        systemInstruction: 'You parse unread chat communications across Slack, Discord, Telegram, and WhatsApp into structured executive summaries, action items, consensus decisions, and urgent alerts. Respond only with valid JSON matching the requested schema.',
      },
    });

    const text = response.text || '{}';
    let parsedResult;
    try {
      parsedResult = JSON.parse(text);
    } catch {
      const clean = text.replace(/```json\n?|```/g, '').trim();
      parsedResult = JSON.parse(clean);
    }

    return res.status(200).json({
      status: 'success',
      result: parsedResult,
    });
  } catch (err: any) {
    console.error('Vercel serverless error:', err);
    return res.status(500).json({ status: 'error', error: err.message || 'Processing failed' });
  }
}
