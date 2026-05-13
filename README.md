# Victor Parra — GitHub Pages CV

Lightweight personal CV built with HTML, CSS, and vanilla JavaScript for GitHub Pages.

## Goals

- Present Victor Parra as a frontend-focused Fullstack Developer.
- Keep the site static, fast, and dependency-free.
- Manage CV content through JSON files instead of editing HTML.
- Support English and Spanish.
- Support light and dark themes.
- Provide static PDF and Markdown downloads.

## Structure

```text
.
├── index.html
├── styles.css
├── script.js
├── data/
│   ├── cv.en.json
│   └── cv.es.json
├── assets/
│   ├── favicon.svg
│   ├── portrait.jpeg
│   ├── victor-parra-cv.en.md
│   ├── victor-parra-cv.es.md
│   ├── victor-parra-cv.en.pdf
│   └── victor-parra-cv.es.pdf
└── specs/
```

## Local Preview

Because the CV content is loaded with `fetch()`, preview it with a local static server instead of opening `index.html` directly.

Example:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Updating CV Content

Edit the JSON files:

- English: `data/cv.en.json`
- Spanish: `data/cv.es.json`

Both files should keep the same top-level structure:

- `meta`
- `ui`
- `profile`
- `strengths`
- `experience`
- `skills`
- `education`
- `languages`
- `downloads`

Routine updates should not require changes to `index.html`.

## Profile Image

The current profile image is:

```text
assets/portrait.jpeg
```

To replace it later:

1. Add the final image to `assets/`.
2. Update the `src` used in `script.js` or replace the current optimized asset.
3. Keep the image lightweight for GitHub Pages performance.

## Updating Downloads

Current download links are language-specific:

- `assets/victor-parra-cv.en.pdf`
- `assets/victor-parra-cv.es.pdf`
- `assets/victor-parra-cv.en.md`
- `assets/victor-parra-cv.es.md`

If replacing the PDFs with final designed versions, keep the same filenames or update `downloads` in each JSON file.

## Privacy Note

The phone number is intentionally excluded from public UI, JSON, metadata, Markdown, and link actions. Public contact is limited to email, LinkedIn, and GitHub.

## Deployment

This repository is designed for GitHub Pages user hosting. With files at the repository root, GitHub Pages can serve the site directly without a build step.
