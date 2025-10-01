# ChessApp Frontend: Copilot Instructions

## Project Overview
- This is a React + TypeScript frontend, scaffolded with Vite for fast development and HMR.
- All source code lives in `chess-frontend/src/`. Entry point: `main.tsx`. Main UI: `App.tsx`.
- Static assets are in `public/` and `src/assets/`.
- No backend integration is present in this codebase.

## Build, Run, and Lint Workflows
- **Start dev server:** `npm run dev` (or `yarn dev`) — launches Vite with HMR.
- **Build for production:** `npm run build` — runs TypeScript build and Vite bundling.
- **Preview production build:** `npm run preview` — serves the built app locally.
- **Lint:** `npm run lint` — uses ESLint with custom config in `eslint.config.js`.

## TypeScript & ESLint Conventions
- TypeScript config is split: `tsconfig.app.json` for app code, `tsconfig.node.json` for config files.
- TypeScript strictness is enforced (`strict`, `noUnusedLocals`, `noUnusedParameters`, etc.).
- ESLint config (`eslint.config.js`) uses recommended rules for JS, TypeScript, React Hooks, and Vite refresh.
- For production, consider expanding ESLint config to use type-aware rules (see `README.md`).

## React Patterns
- Components use function syntax and React hooks (`useState`, etc.).
- Asset imports use Vite's aliasing (e.g., `/vite.svg` for public assets, `./assets/react.svg` for local assets).
- Hot Module Replacement (HMR) is enabled by default.

## Project-Specific Notes
- No custom routing, state management, or API calls are present yet.
- All UI logic is currently in `App.tsx`.
- Vite config is minimal (`vite.config.ts`), only enabling React plugin.
- If adding new features, follow the pattern in `App.tsx` for component structure and state.

## Example: Adding a New Component
1. Create a new `.tsx` file in `src/`.
2. Use function component and hooks.
3. Import assets using Vite conventions.
4. Add to `App.tsx` or route as needed.

## References
- See `README.md` for advanced ESLint setup and plugin recommendations.
- Key files: `src/App.tsx`, `src/main.tsx`, `vite.config.ts`, `eslint.config.js`, `tsconfig.*.json`.

---
**Feedback:** If any section is unclear or missing, please specify what needs improvement or what additional context is required.
