export function extractJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Réponse IA invalide : JSON introuvable.");
    }
    return JSON.parse(match[0]);
  }
}