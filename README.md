# Filmmaker portfolio

Static site: semantic HTML, modern CSS, vanilla ES modules. No build step. Only Google Fonts (Inter Tight, Instrument Serif) load externally.

## Local development
Modules and `fetch` need http, not `file://`:
```
python3 -m http.server 8000   # open http://localhost:8000
```

## Deploy to GitHub Pages
Push to a repo, then Settings > Pages > deploy from branch `main`, folder `/ (root)`. All paths are relative (`data/...`, `media/...`), so it works at `user.github.io/repo/` unchanged. Keep paths relative when you add more.

## Replace the placeholders
1. **Identity and contact:** edit `data/site.json`. Also update `<title>`, meta description, Open Graph tags and JSON-LD in `index.html`.
2. **Hero still:** replace `media/sample-images/s01.jpg` (best at 2.39:1) and its `alt` in `index.html`. Portrait: `portrait.jpg` (4:5).
3. **Work:** edit `data/portfolio.json`, then delete the sample images and `tools/`.

| Field | Notes |
|---|---|
| `id`, `thumbnail` | required; thumbnail path relative to site root |
| `title`, `caption`, `description`, `credit`, `alt` | optional; no title falls back to caption, then "Untitled" |
| `category`, `year` | optional; filters appear when 2+ categories exist |
| `media_type` | `IMAGE`, `VIDEO` (shows play marker) or `CAROUSEL_ALBUM` |
| `media_url` | playable video file (mp4); `null` shows the still and links to the post |
| `width`, `height` | thumbnail pixels; drives the crop and prevents layout shift |
| `featured` | landscape featured items get the full-width layout |
| `permalink` | original Instagram post |

Portrait items sit in narrower staggered columns; featured or very wide items span the row.

## Future sync
The frontend only reads local JSON and never calls Instagram. A later GitHub Actions job can write `data/portfolio.json` and `media/` in this shape. Instagram's API does not return category, year or credit, so those need a manual or caption-parsing step.

## Notes
`media/sample-images/` holds synthetic gradient frames from `tools/make_placeholders.py`: no copyrighted material, but stand-ins rather than photography.
