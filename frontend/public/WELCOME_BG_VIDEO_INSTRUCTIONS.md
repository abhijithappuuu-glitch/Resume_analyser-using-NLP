# Welcome Page Background Video

Place your MP4 here so the Welcome page can load it:

- Copy your file from:
  - `C:\Users\User\Downloads\snow-falling-windows-7-video-background-dreamscene-adobe-after-effects-1080-publer.io.mp4`
- Into this folder:
  - `frontend/public/`
- Rename it to exactly:
  - `welcome-bg.mp4`

Then restart the frontend dev server (`npm run dev`) or refresh the page.

Why: browsers cannot safely load arbitrary `C:\...` files from a website; Vite only serves files inside `frontend/public` (or imported from `src`).
