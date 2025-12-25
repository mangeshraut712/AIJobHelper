# 🔒 Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT** open a public GitHub issue
2. Email the maintainers directly or use GitHub's private vulnerability reporting
3. Include detailed steps to reproduce the issue
4. Allow reasonable time for a fix before public disclosure

## Security Measures Implemented

### Server-Side Request Forgery (SSRF) Protection

- **Strict URL Allowlisting**: Only requests to pre-approved job board domains are allowed
- **Canonical Origin Mapping**: User-supplied hostnames are mapped to trusted, server-defined origins
- **Path Traversal Prevention**: Validates paths don't contain `..` or backslash characters
- **Private IP Blocking**: Rejects requests to localhost, 127.x.x.x, 10.x.x.x, etc.
- **HTTPS Only**: All external requests must use HTTPS
- **Redirect Blocking**: HTTP redirects are disabled to prevent redirect-based SSRF

### Cross-Site Scripting (XSS) Protection

- **HTML Escaping**: All user input is escaped before rendering in HTML
- **Content Security Policy**: Restrictive CSP headers on generated documents
- **X-XSS-Protection**: Browser XSS filter enabled
- **X-Content-Type-Options**: Prevents MIME sniffing attacks

### Input Validation

- **Frontend**: TypeScript interfaces ensure type safety
- **Backend**: Pydantic models validate all incoming data
- **URL Validation**: Strict parsing and validation of user-supplied URLs

### Secure Storage

- **Client-Side**: Sensitive data is obfuscated before localStorage storage
- **No Plaintext Secrets**: API keys are stored in environment variables only

## Security Headers

The application sets the following security headers:

```
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
X-Frame-Options: DENY
```

## Dependency Management

- **Dependabot**: Automated dependency updates enabled
- **CodeQL**: Continuous security scanning via GitHub Actions
- **Daily Scans**: Security workflow runs daily at midnight UTC

## Best Practices for Contributors

1. Never commit secrets or API keys
2. Use environment variables for sensitive configuration
3. Validate all user inputs
4. Use parameterized queries for any database operations
5. Keep dependencies up to date
6. Review security advisories regularly

## Contact

For security concerns, contact the maintainers or use GitHub's security advisory feature.
