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
    <div className="flex min-h-0 flex-1 flex-col bg-gradient-to-b from-white via-cyan-50/40 to-white">
      <header className="border-b border-teal-100/80 bg-white/90 px-4 py-5 backdrop-blur sm:px-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex max-w-2xl flex-col gap-2">
            <p className="inline-flex w-fit rounded-full bg-lime-400 px-3 py-1 text-xs font-bold tracking-wide text-slate-900">
              PORTFOLIO DEMO
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              チャットボット導入支援
            </h1>
            <p className="text-sm leading-relaxed text-slate-600">
              相談内容に合わせて、導入計画・体制づくり・運用設計までを分かりやすく提案します。AI（Claude）によるデモ会話をそのまま体験できます。
            </p>
          </div>
          {contactFormHref ? (
            <a
              href={contactFormHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-teal-500 px-4 text-sm font-medium text-white shadow-md shadow-teal-600/25 transition hover:bg-teal-600"
            >
              相談フォームを開く
            </a>
          ) : (
            <p className="max-w-xs text-xs leading-relaxed text-amber-800">
              `.env` の CONTACT_FORM_URL に https のフォームURLを設定すると、ここにボタンが表示されます。
            </p>
          )}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-4 py-6 sm:px-8">
        <section className="grid gap-3 sm:grid-cols-3">
          <article className="rounded-2xl border border-teal-100 bg-white p-4 shadow-sm shadow-teal-900/5">
            <p className="text-xs font-semibold tracking-wide text-teal-600">
              強み 1
            </p>
            <h2 className="mt-1 text-sm font-semibold text-slate-900">
              要件整理が速い
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              目的と現場運用を先にそろえ、開発前の認識ズレを減らします。
            </p>
          </article>
          <article className="rounded-2xl border border-teal-100 bg-white p-4 shadow-sm shadow-teal-900/5">
            <p className="text-xs font-semibold tracking-wide text-teal-600">
              強み 2
            </p>
            <h2 className="mt-1 text-sm font-semibold text-slate-900">
              小さく導入して改善
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              MVP からはじめて、効果を見ながら段階的に機能を拡張します。
            </p>
          </article>
          <article className="rounded-2xl border border-teal-100 bg-white p-4 shadow-sm shadow-teal-900/5">
            <p className="text-xs font-semibold tracking-wide text-teal-600">
              強み 3
            </p>
            <h2 className="mt-1 text-sm font-semibold text-slate-900">
              非エンジニアにも説明
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              専門用語を噛み砕いて、社内説明や意思決定を進めやすくします。
            </p>
          </article>
        </section>
        <section className="rounded-2xl border border-teal-100 bg-white p-4 text-sm text-slate-600 shadow-sm">
          <span className="font-semibold text-teal-700">
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
