# Welcome Page Background Video

Place your MP4 here so the Welcome page can load it:

- Copy your file from:
  - `C:\Users\User\OneDrive\Desktop\256b6bce493cffcf3221343ef0551df1.mp4`
- Into this folder:
  - `frontend/public/`
- Rename it to exactly:
  - `welcome-bg.mp4`

Then restart the frontend dev server (`npm run dev`) or refresh the page.

Why: browsers cannot safely load arbitrary `C:\...` files from a website; Vite only serves files inside `frontend/public` (or imported from `src`).
