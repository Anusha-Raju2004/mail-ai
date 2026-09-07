export function expandToProfessionalEmail(shortText, context = {}) {
  if (!shortText) return "";
  
  return `Hi,\n\n${shortText.trim()}\n\nBest regards,\nHelix User`;
}