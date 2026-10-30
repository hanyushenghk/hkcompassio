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

The project brief form creates a local text download. It does not send enquiries or upload visitor information.

## Deployment

Vercel project: `hkcompassio`. Pushes to `main` trigger production deployments. `vercel.json` selects the `dist` directory. Production domain: https://hkcompass.org/.
