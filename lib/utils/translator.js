export function getLanguageInfo(lang) {
  return { code: lang || 'en', name: lang || 'English' };
}

export async function translateText(text, targetLang) {
  if (!text) return '';
  return text; // Stub return; replace with translation API if needed
}
