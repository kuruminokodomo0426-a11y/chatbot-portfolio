import ChatPanel from "./chat-panel";
import { getPublicFormHref } from "@/lib/contact-url";

/** ビルド時に CONTACT_FORM_URL を固定しない（.env の変更をすぐ反映） */
export const dynamic = "force-dynamic";

/**
 * ポートフォリオ用チャットのトップページ（サーバーコンポーネント）
 */
export default function Home() {
  const contactFormHref = getPublicFormHref(process.env.CONTACT_FORM_URL);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-gradient-to-b from-violet-50 via-zinc-100 to-zinc-100 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-950">
      <header className="border-b border-zinc-200/80 bg-white/75 px-4 py-5 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70 sm:px-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex max-w-2xl flex-col gap-2">
            <p className="inline-flex w-fit rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold tracking-wide text-violet-700 dark:bg-violet-500/20 dark:text-violet-200">
              PORTFOLIO DEMO
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              チャットボット導入支援
            </h1>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              相談内容に合わせて、導入計画・体制づくり・運用設計までを分かりやすく提案します。AI（Claude）によるデモ会話をそのまま体験できます。
            </p>
          </div>
          {contactFormHref ? (
            <a
              href={contactFormHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 px-4 text-sm font-medium text-white transition hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-400"
            >
              相談フォームを開く
            </a>
          ) : (
            <p className="max-w-xs text-xs leading-relaxed text-amber-700 dark:text-amber-300">
              `.env` の CONTACT_FORM_URL に https のフォームURLを設定すると、ここにボタンが表示されます。
            </p>
          )}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-4 py-6 sm:px-8">
        <section className="grid gap-3 sm:grid-cols-3">
          <article className="rounded-2xl border border-zinc-200 bg-white/85 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70">
            <p className="text-xs font-semibold tracking-wide text-violet-700 dark:text-violet-300">
              強み 1
            </p>
            <h2 className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              要件整理が速い
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              目的と現場運用を先にそろえ、開発前の認識ズレを減らします。
            </p>
          </article>
          <article className="rounded-2xl border border-zinc-200 bg-white/85 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70">
            <p className="text-xs font-semibold tracking-wide text-violet-700 dark:text-violet-300">
              強み 2
            </p>
            <h2 className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              小さく導入して改善
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              MVP からはじめて、効果を見ながら段階的に機能を拡張します。
            </p>
          </article>
          <article className="rounded-2xl border border-zinc-200 bg-white/85 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70">
            <p className="text-xs font-semibold tracking-wide text-violet-700 dark:text-violet-300">
              強み 3
            </p>
            <h2 className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              非エンジニアにも説明
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              専門用語を噛み砕いて、社内説明や意思決定を進めやすくします。
            </p>
          </article>
        </section>
        <section className="rounded-2xl border border-zinc-200 bg-white/85 p-4 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-300">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            想定導入例:
          </span>{" "}
          問い合わせ一次対応、社内FAQの自動回答、サービス案内の24時間対応
        </section>
        <div className="min-h-0 flex-1">
          <ChatPanel contactFormHref={contactFormHref} />
        </div>
      </main>
    </div>
  );
}
