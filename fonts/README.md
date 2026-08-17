# Fonts

Self-hosted so builds never depend on a network fetch from Google's font API.

| File | Used by | Notes |
| --- | --- | --- |
| `ploni-*-aaa.woff` | `/food` | Licensed separately |
| `open-sans-latin-hebrew.woff2` | `/quest`, `/quest/dashboard` (via [`app/quest/fonts.ts`](../app/quest/fonts.ts)) | Variable `wght 300–800`, latin + hebrew, 65 KB. [OFL](./open-sans-OFL.txt) |

## Regenerating Open Sans

Needs `fonttools` and `brotli` (`pip install fonttools brotli`) — dev-only, not a project dependency.

```bash
# 1. upstream variable font (wght 300-800, wdth 75-100) + its license
curl -sSL -o OpenSans-var.ttf \
  "https://raw.githubusercontent.com/google/fonts/main/ofl/opensans/OpenSans%5Bwdth%2Cwght%5D.ttf"
curl -sSL -o open-sans-OFL.txt \
  "https://raw.githubusercontent.com/google/fonts/main/ofl/opensans/OFL.txt"

# 2. pin the wdth axis at 100 — the site never varies width, so drop that axis
python -m fontTools.varLib.instancer OpenSans-var.ttf wdth=100 -o OpenSans-wght.ttf

# 3. subset to Google's own latin + hebrew unicode ranges, compress to woff2
python -m fontTools.subset OpenSans-wght.ttf \
  --unicodes="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0307-0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD,U+0590-05FF,U+200C-2010,U+20AA,U+25CC,U+FB1D-FB4F" \
  --layout-features='*' \
  --flavor=woff2 \
  --output-file=open-sans-latin-hebrew.woff2
```

Italics are not included — the quest pages don't use them. Add the `Italic` upstream file and a
second `src` entry with `style: 'italic'` if that changes.
