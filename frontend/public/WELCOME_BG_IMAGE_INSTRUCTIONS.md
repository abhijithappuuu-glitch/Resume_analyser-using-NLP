# Welcome Page Background Image

To use your local image as the Welcome page background, you must place it in the Vite `public` folder.

## Steps

1. Copy this file:
   - `C:\Users\User\OneDrive\Desktop\19a9e5c52b3689ed0741300aedc11ec1.jpg`

2. Paste it here:
   - `frontend/public/`

3. Rename it to exactly:
   - `welcome-bg.jpg`

4. Refresh the page (or restart the dev server).

## Why this is required
Web apps can’t read arbitrary `C:\...` paths in the browser. Vite only serves static files from `frontend/public` (or files imported from `src`).
