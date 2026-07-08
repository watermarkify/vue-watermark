# Security Policy

## Supported Versions

Security fixes are provided for the latest code on `develop`, and production releases from `main`.

| Version   | Supported |
| --------- | --------- |
| `main`    | Yes       |
| `develop` | Yes        |

## Reporting a Vulnerability

Please do **not** report security vulnerabilities in public issues.

Use one of these channels:

1. Open a private GitHub Security Advisory:
   - https://github.com/watermarkify/vue-watermark/security/advisories/new
2. If advisory flow is unavailable, open an issue with minimal details and ask for a private contact channel.

Please include:

- a clear description of the issue
- impact and affected components
- reproduction steps or proof of concept
- suggested mitigation (if available)

We aim to acknowledge reports within 7 days. Fix timelines depend on severity, exploitability, and affected package scope.

Security fixes should land in `develop` first, then be promoted to `main` for production release when publishing is required.

Reports will be reviewed as soon as possible. If the issue is confirmed, a fix will be prepared and released before public disclosure.
