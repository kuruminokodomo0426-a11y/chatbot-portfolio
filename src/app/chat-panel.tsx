"use client";

import { useCallback, useRef, useState } from "react";

type ChatMessage =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string; choices?: string[] };

function toApiMessages(
  list: ChatMessage[],
): { role: "user" | "assistant"; content: string }[] {
  return list.map((m) => {
    if (m.role === "assistant" && m.choices?.length) {
      return {
        role: "assistant",
        content:
          m.content +
          "\n\n（次の選択肢をユーザーにボタンで提示済み: " +
          m.choices.join(" / ") +
          "）",
      };
    }
    return { role: m.role, content: m.content };
  });
}

/** 「その他」「自由入力」系の選択肢 → テキスト入力へ誘導 */
function isFreeformChoice(label: string): boolean {
  return /その他|自由に(書く|入力)|フリー|自由記載/i.test(label);
}
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
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    const el = listRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  const runAssistantTurn = useCallback(
    async (baseWithUser: ChatMessage[]) => {
      setPending(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: toApiMessages(baseWithUser) }),
        });
        const data = (await res.json()) as {
          text?: string;
          choices?: string[];
          error?: string;
        };

        if (!res.ok) {
          const errText = data.error || "送信に失敗しました。";
          setError(errText);
          setMessages([
            ...baseWithUser,
            { role: "assistant", content: `エラー: ${errText}` },
          ]);
          return;
        }

        const reply = data.text ?? "（応答がありませんでした）";
        const choiceList =
          Array.isArray(data.choices) && data.choices.length > 0
            ? data.choices.filter((c): c is string => typeof c === "string")
            : undefined;
        setMessages([
          ...baseWithUser,
          {
            role: "assistant",
            content: reply,
            ...(choiceList?.length ? { choices: choiceList } : {}),
          },
        ]);
      } catch {
        setError("通信に失敗しました。ネットワークを確認してください。");
        setMessages([
          ...baseWithUser,
          {
            role: "assistant",
            content:
              "エラー: 通信に失敗しました。ネットワークを確認してください。",
          },
        ]);
      } finally {
        setPending(false);
        requestAnimationFrame(scrollToBottom);
      }
    },
    [scrollToBottom],
  );

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || pending) return;

    setError(null);
    setInput("");
    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessages(nextMessages);
    await runAssistantTurn(nextMessages);
  }, [input, messages, pending, runAssistantTurn]);

  const onChoiceClick = useCallback(
    (label: string) => {
      if (pending) return;
      if (isFreeformChoice(label)) {
        inputRef.current?.focus();
        return;
      }
      setError(null);
      const nextMessages: ChatMessage[] = [
        ...messages,
        { role: "user", content: label },
      ];
      setMessages(nextMessages);
      void runAssistantTurn(nextMessages);
    },
    [messages, pending, runAssistantTurn],
  );

  const applySuggestion = useCallback((text: string) => {
    setInput(text);
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col rounded-2xl border border-teal-100 bg-white shadow-md shadow-teal-900/5">
      {contactFormHref ? (
        <div className="border-b border-teal-100 px-4 py-2 text-center text-xs text-slate-600 sm:px-6">
          個別のご相談は{" "}
          <a
            href={contactFormHref}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-teal-600 underline-offset-2 hover:text-teal-700 hover:underline"
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
            <p className="text-sm leading-relaxed text-slate-600">
              チャットボット導入や運用について、自由に質問してください。個別のお見積もりはフォームからご相談ください。
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => applySuggestion(question)}
                  className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs text-teal-900 transition hover:border-teal-300 hover:bg-teal-100"
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
                ? "ml-8 rounded-2xl border border-teal-600/20 bg-teal-500 px-4 py-3 text-sm text-white shadow-sm shadow-teal-600/20"
                : "mr-8 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-800"
            }
          >
            <span className="mb-1 block text-xs font-medium opacity-70">
              {m.role === "user" ? "あなた" : "アシスタント"}
            </span>
            <div className="whitespace-pre-wrap">{m.content}</div>
            {m.role === "assistant" &&
              m.choices &&
              m.choices.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="続きの候補">
                  {m.choices.map((label, ci) => (
                    <button
                      key={`${i}-${ci}-${label}`}
                      type="button"
                      disabled={pending}
                      onClick={() => onChoiceClick(label)}
                      className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-left text-xs font-medium text-teal-900 transition hover:border-teal-300 hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
          </div>
        ))}
        {pending && (
          <div className="mr-8 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            返信中…
          </div>
        )}
      </div>

      <div className="border-t border-teal-100 p-3 sm:p-4">
        {error && (
          <p className="mb-2 text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="sr-only" htmlFor="chat-input">
            メッセージ
          </label>
          <textarea
            ref={inputRef}
            id="chat-input"
            rows={2}
            className="min-h-[3rem] flex-1 resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-teal-500/20 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500/40"
            placeholder="例: 小規模チーム向けに、まず試したい場合の進め方を教えて"
            value={input}
            disabled={pending}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== "Enter" && e.key !== "NumpadEnter") return;
              // 変換中の Enter は IME に任せる（誤送信防止）
              if (e.nativeEvent.isComposing) return;
              // 改行のみ（Shift+Enter はブラウザ既定で改行）
              if (e.shiftKey) return;
              e.preventDefault();
              void send();
            }}
          />
          <button
            type="button"
            onClick={() => void send()}
            disabled={pending || !input.trim()}
            className="h-10 shrink-0 rounded-xl bg-teal-500 px-4 text-sm font-medium text-white shadow-sm shadow-teal-600/25 transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            送信
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Enter で送信 / Shift+Enter で改行（変換中の Enter は送信しません）
          </p>
          <p className="text-xs text-slate-600">
            デモのため回答には数秒かかる場合があります
          </p>
        </div>
      </div>
    </div>
  );
}
