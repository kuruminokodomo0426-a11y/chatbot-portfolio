# chatbot-portfolio

チャットボット導入支援の**ポートフォリオ用デモ**。訪問者が Web 上で質問すると、サーバー経由で **Anthropic Claude** が日本語で応答する。個別相談は **Google フォームの URL** に誘導する。

## コマンド

```bash
npm install
npm run dev    # 開発: http://localhost:3000
npm run build  # 本番ビルド確認
npm run start  # 本番サーバー（build 後）
npm run lint
```

## 環境変数

`.env` に設定（`.env.example` を参照）。**API キーはクライアントに出さない**。

| 変数 | 必須 | 説明 |
|------|------|------|
| `ANTHROPIC_API_KEY` | はい | Anthropic の API キー |
| `CONTACT_FORM_URL` | 推奨 | 相談用フォームの URL |
| `SERVICE_CONTEXT` | 任意 | サービス説明（未設定時はプレースホルダー） |
| `ANTHROPIC_MODEL` | 任意 | 既定は `claude-sonnet-4-20250514` |
| `ANTHROPIC_MAX_TOKENS` | 任意 | 既定は `700`（返答が短い／長い場合に調整） |

## 構成

```
src/
  app/
    page.tsx           # トップ（レイアウト）
    chat-panel.tsx     # チャット UI（クライアント）
    api/chat/route.ts  # Claude 呼び出し API
  lib/
    system-prompt.ts   # システムプロンプト組み立て
```

## スキル

メインの運用ガイド: `.cursor/skills/portfolio-chat/SKILL.md`

## よくあるエラーと対処

- **「ANTHROPIC_API_KEY が設定されていません」**  
  プロジェクト直下に `.env` を作成し、キーを設定。開発サーバーを再起動。

- **モデル名エラー（404 / invalid model）**  
  `ANTHROPIC_MODEL` を、コンソールで利用可能なモデル ID に変更。

- **502 / AI の応答取得中にエラー**  
  開発時は API の JSON に `detail` が付くことがある。キー・課金・レート制限を確認。

## デプロイのヒント

Vercel 等に載せる場合、環境変数に同じキーを登録。リポジトリに `.env` をコミットしない。
