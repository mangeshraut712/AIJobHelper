/**
 * HTML Sanitization Utilities
 * Prevents XSS attacks when displaying user-generated or external content
 */

/**
 * Sanitize HTML content to prevent XSS attacks
 * Removes all HTML tags and dangerous characters
 */
export function sanitizeHTML(html: string): string {
    if (!html) return '';

    // Remove all HTML tags
    let sanitized = html.replace(/<[^>]*>/g, '');

    // Decode common HTML entities
    sanitized = sanitized
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&amp;/g, '&');

    // Remove any remaining script-like content
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=/gi, '');

    return sanitized.trim();
}

/**
 * Sanitize text to be safely used in HTML
 * Escapes special characters
 */
export function escapeHTML(text: string): string {
    if (!text) return '';

    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Sanitize URL to prevent JavaScript injection
 */
export function sanitizeURL(url: string): string {
    if (!url) return '';

    try {
        const parsed = new URL(url);

        // Only allow http and https protocols
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return '';
        }

        // Block dangerous patterns
        if (url.toLowerCase().includes('javascript:') ||
            url.toLowerCase().includes('data:') ||
            url.toLowerCase().includes('vbscript:')) {
            return '';
        }

        return url;
    } catch {
        // Invalid URL
        return '';
    }
}

/**
 * Strip HTML tags completely, leaving only text
 */
export function stripHTML(html: string): string {
    if (!html) return '';

    // Create a temporary element
    const tmp = document.createElement('div');
    tmp.innerHTML = html;

    // Get text content (this automatically strips all HTML)
    return tmp.textContent || tmp.innerText || '';
}

/**
 * Allow only specific whitelisted HTML tags
 */
export function sanitizeWithWhitelist(
    html: string,
    allowedTags: string[] = ['b', 'i', 'em', 'strong', 'p', 'br']
): string {
    if (!html) return '';

    const tmp = document.createElement('div');
    tmp.innerHTML = html;

    // Remove non-whitelisted tags
    const allElements = tmp.getElementsByTagName('*');
    for (let i = allElements.length - 1; i >= 0; i--) {
        const element = allElements[i];
        if (!allowedTags.includes(element.tagName.toLowerCase())) {
            // Replace tag with its children
            while (element.firstChild) {
                element.parentNode?.insertBefore(element.firstChild, element);
            }
            element.parentNode?.removeChild(element);
        }
    }

    return tmp.innerHTML;
}
