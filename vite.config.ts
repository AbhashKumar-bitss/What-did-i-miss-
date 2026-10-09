import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import {GoogleGenAI} from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

function geminiServerPlugin(): Plugin {
  return {
    name: 'gemini-server-api',
    configureServer(server) {
      server.middlewares.use('/api/gemini/analyze', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const parsed = JSON.parse(body || '{}');
            const { messages, userPrompt, focusMode, summaryLength, temperature } = parsed;

            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({
                status: 'fallback',
                message: 'No GEMINI_API_KEY detected in environment. Using on-device intelligence engine.'
              }));
              return;
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

Generate a structured analysis in strict JSON without markdown formatting (no backticks):
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
              // fallback sanitize if backticks were added
              const clean = text.replace(/```json\n?|```/g, '').trim();
              parsedResult = JSON.parse(clean);
            }

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({
              status: 'success',
              result: parsedResult,
            }));
          } catch (err: any) {
            console.error('Error analyzing messages with Gemini:', err);
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({
              status: 'error',
              error: err.message || 'Gemini processing failed',
            }));
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), geminiServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

