/**
 * Claude に渡すシステムプロンプトを組み立てる（サーバー側のみで使用）
 */
export function buildSystemPrompt(): string {
  const service =
    process.env.SERVICE_CONTEXT?.trim() || getDefaultServiceContext();
  const formUrl = process.env.CONTACT_FORM_URL?.trim();

  const formBlock = formUrl
    ? [
        "## 相談・お問い合わせ",
        `個別の見積もり・契約・スケジュールが必要な場合は、次のフォームを案内してください（URLをそのまま提示）:\n${formUrl}`,
        "フォーム以外の連絡手段をユーザーが求めた場合、フォームを優先しつつ、SERVICE_CONTEXT にメール等が書かれていればそれに従ってよい。",
      ].join("\n")
    : [
        "## 相談・お問い合わせ",
        "CONTACT_FORM_URL が未設定のため、具体的なフォームURLは案内できない。個別相談が必要な旨を伝え、ユーザーにサイト上の連絡先を確認してもらう。",
      ].join("\n");

  return [
    "あなたは、個人事業主・企業向けのチャットボット導入支援を行うコンサルタントのデモ用チャットボットです。",
    "ユーザーの質問の意図を汲み取り、分かりやすい日本語で答えてください。",
    "断定できない内容（費用の確定値、法的判断など）は推測せず、一般的な説明にとどめ、個別相談を促してください。",
    "",
    "## サービス情報（あなたの前提）",
    service,
    "",
    formBlock,
  ].join("\n");
}

/**
 * SERVICE_CONTEXT 未設定時に使うプレースホルダー文言
 */
function getDefaultServiceContext(): string {
  return [
    "（まだ詳細が設定されていません。`.env` の SERVICE_CONTEXT に、あなたの提供サービス・強み・対応範囲を書いてください。）",
    "想定する支援内容の例: 要件整理、ツール選定、プロンプト設計、運用設計、社内説明資料の下書き など。",
  ].join("\n");
}
