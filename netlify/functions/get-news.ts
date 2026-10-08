import "dotenv/config";
import type { Handler } from "@netlify/functions";
import axios from "axios";
import { GoogleGenAI } from "@google/genai";

const CATEGORY_MAP: Record<string, string> = {
  gaming: "technology",
  stocks: "business",
  technology: "technology",
  politics: "general",
  science: "science",
  business: "business",
  world: "general",
  sports: "sports",
  health: "health",
  entertainment: "entertainment",
};

// Models to try in order. If the first one 503s, we fall back to the next.
const MODEL_FALLBACKS = [
  "gemini-3.8-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
];

// Sleep helper
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Call Gemini with retries + model fallback
async function summarizeWithGemini(ai: GoogleGenAI, prompt: string): Promise<string> {
  let lastError: any = null;

  for (const model of MODEL_FALLBACKS) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        console.log(`Calling ${model} (attempt ${attempt + 1})...`);
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
        });
        return response.text ?? "[]";
      } catch (err: any) {
        lastError = err;
        const status = err?.status || err?.response?.status;

        // Only retry on transient errors
        if (status !== 503 && status !== 429 && status !== 500) {
          throw err;
        }

        // Exponential backoff: 1s, 2s, 4s + random jitter
        const baseDelay = Math.pow(2, attempt) * 1000;
        const jitter = Math.random() * 1000;
        const delay = baseDelay + jitter;

        console.warn(`${model} returned ${status}. Retrying in ${Math.round(delay)}ms...`);
        await sleep(delay);
      }
    }
    console.warn(`${model} exhausted retries. Falling back to next model...`);
  }

  throw lastError;
}

export const handler: Handler = async (event) => {
  const interests = event.queryStringParameters?.interests?.split(",") || ["general"];

  const newsApiCategories = [
    ...new Set(
      interests.map((i) => CATEGORY_MAP[i.trim().toLowerCase()] || "general")
    ),
  ];

  try {
    console.log("Fetching categories:", newsApiCategories);

    const newsPromises = newsApiCategories.map((category) =>
      axios.get("https://newsapi.org/v2/top-headlines", {
        params: {
          category,
          language: "en",
          pageSize: 4,
          apiKey: process.env.NEWSAPI_KEY,
        },
      })
    );

    const newsResponses = await Promise.all(newsPromises);
    const articles = newsResponses
      .flatMap((res) => res.data.articles)
      .filter((a: any) => a.title && a.description);

    console.log("Articles fetched:", articles.length);

    if (articles.length === 0) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articles: [] }),
      };
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    const prompt = `
You are a news summarization assistant. For each article below, return a JSON array where each item has:
- title: A concise, engaging headline (max 10 words)
- summary: A 2-3 sentence summary in simple language
- category: One of [Gaming, Stocks, Technology, Politics, Science, Business, World]
- url: The original article URL

Articles:
${JSON.stringify(
  articles.map((a: any) => ({ title: a.title, description: a.description, url: a.url }))
)}

Return ONLY a valid JSON array. No explanations, no markdown, no extra text.
`;

    const rawText = await summarizeWithGemini(ai, prompt);
    let text = rawText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    const summarizedNews = JSON.parse(text);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articles: summarizedNews }),
    };
  } catch (error: any) {
    console.error("Function error:", error.message);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to fetch news", details: error.message }),
    };
  }
};