# Security Policy

## Reporting Security Vulnerabilities

**Do not** open public GitHub issues for security vulnerabilities.

Instead, please email: **security@zyflixa.com**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will acknowledge receipt within 48 hours and provide regular updates.

## Supported Versions

| Version | Status |
|---------|--------|
| 1.x     | ✅ Supported |
| < 1.0   | ❌ Not Supported |

## Security Practices

### Environment Variables
- Never commit `.env` files
- Use `.env.example` for templates
- All secrets stored securely in CI/CD

### Input Validation
- All user inputs validated with Zod
- Search queries limited to 256 characters
- Media IDs validated as positive integers
- API responses type-checked

### CORS & Headers
- API calls through TMDB official endpoints
- No sensitive data in request bodies
- Content Security Policy headers
- X-Frame-Options set to DENY

### Dependencies
- Regular security audits: `npm audit`
- Automated dependency updates
- Immediate patching of critical CVEs
- No eval() or dynamic code execution

### Error Handling
- No sensitive data in error messages
- Stack traces hidden in production
- Sentry for secure error tracking
- User-friendly error messages

### Authentication (Future)
When implementing user auth:
- Use OAuth 2.0 / OpenID Connect
- Never store plain-text passwords
- Implement rate limiting
- Use secure session handling
- Enable 2FA support

### Database (Future)
When adding database:
- Encrypt sensitive fields
- Use parameterized queries
- Regular backups
- Access control & logging
- SQL injection prevention

## Known Vulnerabilities

None currently reported.

## Dependency Security

### Regular Updates
```bash
npm audit              # Check for vulnerabilities
npm audit fix          # Auto-fix vulnerabilities
npm update             # Update dependencies
```

### Monitoring
- Dependabot for automated PRs
- npm security advisories
- GitHub security scanning
- Snyk integration (optional)

## HTTPS & Transport

- All external API calls use HTTPS
- Service Worker only on HTTPS
- Secure cookies for future auth
- HSTS headers recommended

## Sensitive Information Handling

### What's Safe
- Public API keys (if read-only)
- Aggregated analytics data
- Public user watchlists
- Published reviews/ratings

### What's Not Safe
- Private API keys
- User passwords/auth tokens
- Personal user data
- Payment information
- Device identifiers

## Compliance

### Privacy
- GDPR compliant
- CCPA considerations
- Data retention policies
- User consent for tracking

### Security Standards
- OWASP Top 10 compliance
- WCAG 2.1 accessibility
- TypeScript strict mode
- Regular security audits

## Incident Response

If a security issue is discovered:

1. **Patch**: Develop and test fix
2. **Release**: Deploy security update
3. **Notify**: Inform users (if necessary)
4. **Document**: Post-incident review
5. **Follow-up**: Monitor for similar issues

## Recommendations

### For Users
- Keep browser updated
- Use strong passwords (when auth available)
- Enable browser security features
- Report suspicious behavior

### For Developers
- Review security guidelines before contributing
- Use TypeScript strict mode
- Add security tests for sensitive features
- Follow OWASP guidelines

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [TypeScript Security](https://www.typescriptlang.org/docs/handbook/security.html)
- [NIST Cybersecurity](https://www.nist.gov/cybersecurity)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)

## Version & Changelog

- **Latest Version**: 1.0.0
- **Security Updates**: See [CHANGELOG.md](CHANGELOG.md)
- **Release Notes**: See [Releases](https://github.com/yourusername/zyflixa/releases)

---

**Last Updated**: April 2026
**Next Review**: July 2026
