const BLOCK_START = "<<<CHOICES>>>";
const BLOCK_END = "<<<END_CHOICES>>>";

const MAX_CHOICES = 8;
const MAX_LABEL_LEN = 120;

/**
 * Claude が末尾に付ける選択肢 JSON ブロックを取り除き、表示用テキストと配列に分ける
 */
export function splitAssistantChoiceBlock(raw: string): {
  displayText: string;
  choices: string[] | undefined;
} {
  const idx = raw.lastIndexOf(BLOCK_START);
  if (idx === -1) {
    return { displayText: raw.trimEnd(), choices: undefined };
  }

  const before = raw.slice(0, idx).trimEnd();
  const afterStart = raw.slice(idx + BLOCK_START.length);
  const endIdx = afterStart.indexOf(BLOCK_END);
  if (endIdx === -1) {
    return { displayText: raw.trimEnd(), choices: undefined };
  }

  const jsonStr = afterStart.slice(0, endIdx).trim();
  try {
    const parsed: unknown = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) {
      return { displayText: raw.trimEnd(), choices: undefined };
    }
    const choices = parsed
      .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
      .map((s) => s.trim().slice(0, MAX_LABEL_LEN))
      .slice(0, MAX_CHOICES);
    if (choices.length === 0) {
      return { displayText: raw.trimEnd(), choices: undefined };
    }
    return { displayText: before, choices };
  } catch {
    return { displayText: raw.trimEnd(), choices: undefined };
  }
}
