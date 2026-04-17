"use client";

import { useCallback, useRef, useState } from "react";

type Role = "user" | "assistant";

type ChatMessage = { role: Role; content: string };
const SUGGESTED_QUESTIONS = [
  "小規模チーム向けに、チャットボット導入の手順を教えてください。",
  "導入前に決めるべき運用ルールを3つに絞って教えてください。",
  "個別相談したいです。問い合わせ方法を案内してください。",
];

type ChatPanelProps = {
  contactFormHref?: string | null;
};

/**
 * チャット入力・履歴表示・送信処理をまとめたクライアントコンポーネント
 */
export default function ChatPanel({ contactFormHref }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    const el = listRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || pending) return;

    setError(null);
    setInput("");
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setPending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = (await res.json()) as { text?: string; error?: string };

      if (!res.ok) {
        const errText = data.error || "送信に失敗しました。";
        setError(errText);
        setMessages([
          ...nextMessages,
          { role: "assistant", content: `エラー: ${errText}` },
        ]);
        return;
      }

      const reply = data.text ?? "（応答がありませんでした）";
      setMessages([...nextMessages, { role: "assistant", content: reply }]);
    } catch {
      setError("通信に失敗しました。ネットワークを確認してください。");
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: "エラー: 通信に失敗しました。ネットワークを確認してください。",
        },
      ]);
    } finally {
      setPending(false);
      requestAnimationFrame(scrollToBottom);
    }
  }, [input, messages, pending, scrollToBottom]);

  const applySuggestion = useCallback((text: string) => {
    setInput(text);
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      {contactFormHref ? (
        <div className="border-b border-zinc-200 px-4 py-2 text-center text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400 sm:px-6">
          個別のご相談は{" "}
          <a
            href={contactFormHref}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-violet-700 underline-offset-2 hover:underline dark:text-violet-300"
          >
            相談フォーム
          </a>
          からどうぞ
        </div>
      ) : null}
      <div
        ref={listRef}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6"
        aria-live="polite"
      >
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              チャットボット導入や運用について、自由に質問してください。個別のお見積もりはフォームからご相談ください。
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => applySuggestion(question)}
                  className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs text-violet-800 transition hover:bg-violet-100 dark:border-violet-900 dark:bg-violet-900/30 dark:text-violet-200 dark:hover:bg-violet-900/50"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={`${i}-${m.role}`}
            className={
              m.role === "user"
                ? "ml-8 rounded-2xl bg-zinc-900 px-4 py-3 text-sm text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
                : "mr-8 rounded-2xl bg-zinc-100 px-4 py-3 text-sm leading-relaxed text-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            }
          >
            <span className="mb-1 block text-xs font-medium opacity-70">
              {m.role === "user" ? "あなた" : "アシスタント"}
            </span>
            <div className="whitespace-pre-wrap">{m.content}</div>
          </div>
        ))}
        {pending && (
          <div className="mr-8 rounded-2xl bg-zinc-100 px-4 py-3 text-sm text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
            返信中…
          </div>
        )}
      </div>

      <div className="border-t border-zinc-200 p-3 dark:border-zinc-800 sm:p-4">
        {error && (
          <p className="mb-2 text-xs text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="sr-only" htmlFor="chat-input">
            メッセージ
          </label>
          <textarea
            id="chat-input"
            rows={2}
            className="min-h-[3rem] flex-1 resize-y rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-zinc-400 placeholder:text-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            placeholder="例: 小規模チーム向けに、まず試したい場合の進め方を教えて"
            value={input}
            disabled={pending}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <button
            type="button"
            onClick={() => void send()}
            disabled={pending || !input.trim()}
            className="h-10 shrink-0 rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            送信
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            Enter で送信 / Shift+Enter で改行
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-600">
            デモのため回答には数秒かかる場合があります
          </p>
        </div>
      </div>
    </div>
  );
}
