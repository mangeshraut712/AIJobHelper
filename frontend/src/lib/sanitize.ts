/**
 * HTML Sanitization Utilities
 * Enterprise-grade XSS prevention with proper encoding
 */

/**
 * Sanitize HTML content to prevent XSS attacks
 * Uses DOMParser for safe HTML parsing (no regex vulnerabilities)
 */
export function sanitizeHTML(html: string): string {
    if (!html || typeof html !== 'string') return '';

    // Use browser's DOMParser for safe parsing (server-side safe check)
    if (typeof window === 'undefined') {
        return stripHTMLServer(html);
    }

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Get text content only (strips all HTML)
        return doc.body.textContent || '';
    } catch {
        return stripHTMLServer(html);
    }
}

/**
 * Server-side HTML stripping (no DOM available)
 */
function stripHTMLServer(html: string): string {
    // Remove script tags and their content
    let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    // Remove style tags and their content
    clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    // Remove all remaining HTML tags
    clean = clean.replace(/<[^>]+>/g, '');
    // Decode HTML entities safely
    clean = clean
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#0*39;/g, "'")
        .replace(/&amp;/g, '&');

    return clean.trim();
}

/**
 * Escape HTML to prevent XSS when inserting into HTML context
 * Uses proper character entity encoding
 */
export function escapeHTML(text: string): string {
    if (!text || typeof text !== 'string') return '';

    const escapeMap: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;'
    };

    return text.replace(/[&<>"'/]/g, (char) => escapeMap[char] || char);
}

/**
 * Sanitize URL to prevent JavaScript and data URI injection
 * Strict protocol validation with proper URL parsing
 */
export function sanitizeURL(url: string): string {
    if (!url || typeof url !== 'string') return '';

    // Trim whitespace
    url = url.trim();

    // Block dangerous protocols explicitly
    const dangerousProtocols = [
        'javascript:',
        'data:',
        'vbscript:',
        'file:',
        'about:',
        'blob:'
    ];

    const lowerURL = url.toLowerCase();
    for (const protocol of dangerousProtocols) {
        if (lowerURL.startsWith(protocol)) {
            return '';
        }
    }

    // Additional checks for encoded protocols
    if (lowerURL.includes('%6a%61%76%61%73%63%72%69%70%74%3a') || // javascript:
        lowerURL.includes('%64%61%74%61%3a')) { // data:
        return '';
    }

    // Validate URL structure
    try {
        const parsed = new URL(url, 'https://example.com');

        // Only allow http and https
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return '';
        }

        // Return the validated URL
        return parsed.href;
    } catch {
        // If URL parsing fails, check if it's a relative URL
        if (url.startsWith('/') && !url.startsWith('//')) {
            // Relative URL is safe
            return url;
        }
        return '';
    }
}

/**
 * Strip all HTML tags completely
 * Uses DOMParser when available, safe regex fallback otherwise
 */
export function stripHTML(html: string): string {
    if (!html || typeof html !== 'string') return '';

    if (typeof window !== 'undefined' && window.DOMParser) {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            return doc.body.textContent || doc.body.innerText || '';
        } catch {
            // Fallback to server-side stripping
        }
    }

    return stripHTMLServer(html);
}

/**
 * Allow only specific safe HTML tags with attribute filtering
 * Uses allowlist approach for maximum security
 */
export function sanitizeWithAllowlist(
    html: string,
    allowedTags: string[] = ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li']
): string {
    if (!html || typeof html !== 'string') return '';

    if (typeof window === 'undefined') {
        // Server-side: strip all HTML for safety
        return stripHTMLServer(html);
    }

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Remove all non-allowed tags
        const walker = doc.createTreeWalker(
            doc.body,
            NodeFilter.SHOW_ELEMENT,
            null
        );

        const nodesToRemove: Element[] = [];
        let currentNode = walker.currentNode as Element;

        while (currentNode) {
            if (currentNode.nodeType === Node.ELEMENT_NODE) {
                const tagName = currentNode.tagName.toLowerCase();

                if (!allowedTags.includes(tagName)) {
                    nodesToRemove.push(currentNode);
                } else {
                    // Remove all attributes from allowed tags (prevent event handlers)
                    while (currentNode.attributes.length > 0) {
                        currentNode.removeAttribute(currentNode.attributes[0].name);
                    }
                }
            }
            currentNode = walker.nextNode() as Element;
        }

        // Remove disallowed nodes
        for (const node of nodesToRemove) {
            // Move children before removing
            while (node.firstChild) {
                node.parentNode?.insertBefore(node.firstChild, node);
            }
            node.parentNode?.removeChild(node);
        }

        return doc.body.innerHTML;
    } catch {
        return stripHTMLServer(html);
    }
}

/**
 * Validate and sanitize email addresses
 */
export function sanitizeEmail(email: string): string {
    if (!email || typeof email !== 'string') return '';

    // RFC 5322 compliant email regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    const trimmed = email.trim().toLowerCase();

    if (emailRegex.test(trimmed)) {
        return trimmed;
    }

    return '';
}
