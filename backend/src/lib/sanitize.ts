import sanitizeHtml from 'sanitize-html';

/**
 * Strip HTML/script tags from user-provided text to prevent XSS.
 * Use for names, titles, and other free-text fields stored in DB.
 */
export function sanitizeText(input: string): string {
  return sanitizeHtml(input.trim(), {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
}
