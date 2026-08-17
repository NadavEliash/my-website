import localFont from 'next/font/local'

// Self-hosted Open Sans — a single variable woff2 (wght 300–800) subset to latin + hebrew.
// Kept local rather than next/font/google so builds never depend on fetching from Google.
// Regenerate with the recipe in fonts/README.md. License: fonts/open-sans-OFL.txt
export const openSans = localFont({
  src: '../../fonts/open-sans-latin-hebrew.woff2',
  weight: '300 800',
  style: 'normal',
  display: 'swap',
  adjustFontFallback: 'Arial',
})
