/**
 * 画面に出してよい相談フォームURLかどうかを判定する（http / https のみ）
 */
export function getPublicFormHref(raw: string | undefined): string | null {
  const t = raw?.trim();
  if (!t) return null;
  try {
    const u = new URL(t);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}
