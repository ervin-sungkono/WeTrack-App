import "server-only";
import OpenAI from "openai";
import type { ChatCompletion } from "openai/resources/chat/completions";

function createOpenAIClient(): OpenAI {
  const apiKey = process.env.CHATGPT_SECRET_KEY;
  if (!apiKey) throw new Error("The AI service is not configured");
  return new OpenAI({ apiKey });
}

function normalizeMaxTokens(maxTokens: number): number {
  if (!Number.isFinite(maxTokens)) return 1024;
  return Math.min(Math.max(Math.floor(maxTokens), 1), 1024);
}

export async function generateTaskByPrompt(
  projectDescription: string,
  maxTokens = 1024,
): Promise<ChatCompletion.Choice | undefined> {
  const response = await createOpenAIClient().chat.completions.create({
    model: "gpt-3.5-turbo-0125",
    max_tokens: normalizeMaxTokens(maxTokens),
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: "You are a task generator. Analyze the project description and return a JSON object with a 'data' array. Each item must contain 'taskName', 'priority' (0 to 3), and 'description'. If the description is unclear, set 'data' to null. Write task names and descriptions in Indonesian.",
      },
      { role: "user", content: `Project Description: ${projectDescription}` },
    ],
  });

  return response.choices[0];
}

export async function generateChatResponse({
  taskDescription,
  summary = "",
  content,
}: {
  taskDescription?: string | null;
  summary?: string | string[];
  content: string;
}): Promise<ChatCompletion.Choice | undefined> {
  const response = await createOpenAIClient().chat.completions.create({
    model: "gpt-3.5-turbo-0125",
    max_tokens: 1024,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Last 8 message history: ${summary}. Use this only as reference and do not repeat it in your response.`,
      },
      {
        role: "system",
        content: `${taskDescription ? `Task description: ${taskDescription}. Analyze it when it helps answer the user's question.` : "Answer the user's question directly."} Return JSON with 'response_chat' (up to 800 words, Markdown allowed) and 'summarized_chat' (up to 60 words, no Markdown). Use Indonesian unless the user asks for another language.`,
      },
      { role: "user", content },
    ],
  });

  return response.choices[0];
}
