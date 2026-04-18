import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { splitAssistantChoiceBlock } from "@/lib/assistant-choice-block";
import { buildSystemPrompt } from "@/lib/system-prompt";

/** 1メッセージあたりの最大文字数（過大リクエスト防止） */
const MAX_CONTENT_LENGTH = 12_000;
/** 会話の最大往復数（user+assistant のペア換算でおおよそ制限） */
const MAX_MESSAGES = 40;

type ChatMessage = { role: "user" | "assistant"; content: string };

/**
 * リクエストボディの messages を検証し、不正なら null
 */
function parseMessages(raw: unknown): ChatMessage[] | null {
  if (!Array.isArray(raw)) return null;
  const out: ChatMessage[] = [];
  if (raw.length > MAX_MESSAGES) return null;
  for (const item of raw) {
    if (!item || typeof item !== "object") return null;
    const role = (item as { role?: unknown }).role;
    const content = (item as { content?: unknown }).content;
    if (role !== "user" && role !== "assistant") return null;
    if (typeof content !== "string") return null;
    if (content.length > MAX_CONTENT_LENGTH) return null;
    out.push({ role, content });
  }
  if (out.length === 0) return null;
  if (out[out.length - 1].role !== "user") return null;
  return out;
}

/**
 * Claude（Anthropic API）へ問い合わせ、テキスト応答を返す API
 */
export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "サーバーに ANTHROPIC_API_KEY が設定されていません。.env を確認してください。",
      },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "JSON の形式が正しくありません。" },
      { status: 400 },
    );
  }

  const messages = parseMessages(
    (body as { messages?: unknown }).messages,
  );
  if (!messages) {
    return NextResponse.json(
      { error: "messages の形式が正しくありません。" },
      { status: 400 },
    );
  }

  const model =
    process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-20250514";

  const maxTokensRaw = process.env.ANTHROPIC_MAX_TOKENS?.trim();
  const maxTokensParsed = maxTokensRaw ? Number.parseInt(maxTokensRaw, 10) : NaN;
  const max_tokens =
    Number.isFinite(maxTokensParsed) && maxTokensParsed > 200
      ? Math.min(maxTokensParsed, 4096)
      : 700;

  const anthropic = new Anthropic({ apiKey });

  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens,
      system: buildSystemPrompt(),
      messages,
    });

    const block = response.content.find((b) => b.type === "text");
    const raw =
      block && block.type === "text" ? block.text : "（空の応答でした）";
    const { displayText, choices } = splitAssistantChoiceBlock(raw);

    const payload: { text: string; choices?: string[] } = { text: displayText };
    if (choices?.length) payload.choices = choices;

    return NextResponse.json(payload);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[api/chat]", msg);
    return NextResponse.json(
      {
        error:
          "AI の応答取得中にエラーが発生しました。時間をおいて再度お試しください。",
        detail: process.env.NODE_ENV === "development" ? msg : undefined,
      },
      { status: 502 },
    );
  }
}
