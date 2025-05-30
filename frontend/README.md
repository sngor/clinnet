# Clinnet-EMR Frontend

This guide covers frontend-specific setup, scripts, and troubleshooting. For full-stack deployment, see `../docs/deployment.md`.

---

## Quickstart

1. **Node Version**: Use Node.js 18 (see `scripts/fix-node-version.sh` or use `nvm`)
2. **Install/Update Dependencies**
   ```bash
   ./scripts/update-dependencies.sh
   ```
3. **Run Dev Server**
   ```bash
   npm run dev
   ```
4. **Build for Production**
   ```bash
   npm run build
   ```

---

## Environment Setup

- Create a `.env` file in `frontend/`:
  ```env
  VITE_API_URL=<your-api-url>
  ```
- This URL should point to your deployed API Gateway or local backend.

---

## Key Scripts

- `scripts/update-dependencies.sh` — Update all dependencies
- `scripts/deploy-frontend.sh` — Deploy to static hosting (edit for your S3 bucket/region)

---

## Profile Image System Test

- See `test_profile_images.js` for end-to-end profile image tests
- Run in browser console, update `apiBaseUrl` as needed

---

## Troubleshooting

- See `../docs/troubleshooting.md` for common issues
- For CORS, S3, or build errors, check browser console and logs
- For dependency issues, run `./scripts/update-dependencies.sh`

---

For full project documentation, see the `../docs/` folder.
