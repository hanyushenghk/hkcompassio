# HK Compassio Technology

Official company website for **hkcompass.org**.

## Website

- Traditional Chinese (default): `dist/index.html`
- English: `dist/en.html`
- Simplified Chinese: `dist/zh-cn.html`

Deploy the `dist/` directory as a static website. No build step or server-side dependencies are required. The language switch works through real page links.

## Development

Run `python3 -m http.server 4173 --bind 127.0.0.1 --directory dist` to preview locally.

Edit `source/index.zh-CN.html`, `source/app.zh-CN.js` and `source/english.tsv`; run `python3 scripts/build-languages.py` on macOS with Swift installed to regenerate all languages. Shared styles are in `dist/style.css`. Generated deployable files are committed so deployment does not need Swift.

The original company logo is in `dist/assets/hk-compassio-logo.png`.

The project brief form sends enquiries through Web3Forms using the public form identifier in `dist/contact-config.js`. The configured recipient is hanyushenghk@gmail.com. The visitor email is used as Reply-To. Submission success is shown only after the service accepts the request; failures preserve the entered details. A separate button downloads a local text copy without sending email. The form includes a honeypot, duplicate-submission protection and a privacy notice. Never put mailbox passwords or private API secrets in the client configuration.

## Deployment

Vercel project: `hkcompassio`. Pushes to `main` trigger production deployments. `vercel.json` selects the `dist` directory. Production domain: https://hkcompass.org/.
