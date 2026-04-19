# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Two-app monorepo (no workspace tooling — each app has its own `package.json` and `node_modules`):

- `backend/` — Express 5 + Mongoose 9 REST API on `/api/v1/*`, MongoDB Atlas.
- `mobile/` — Expo (SDK 54) / React Native 0.81 app in TypeScript, Redux Toolkit + redux-persist, React Navigation v7.

## Commands

Backend (run from `backend/`):
- `npm run dev` — start API with nodemon (requires `.env`, see `.env.example`).
- `npm start` — production start.
- `npm run seed` — run `seeds/index.js` (seed data lives in `seeds/data/`, currently empty).

Mobile (run from `mobile/`):
- `npm start` / `npm run android` / `npm run ios` / `npm run web` — Expo dev server.
- No test or lint scripts are configured in either app.

## Architecture — backend

Request pipeline in `app.js`: helmet → cors → `generalLimiter` → morgan (dev only) → json/urlencoded → compression → `/uploads` static → versioned routers → 404 handler → `errorHandler`.

Every controller is wrapped in `utils/catchAsync.js` and throws `utils/ApiError` (factory statics: `badRequest`, `unauthorized`, `forbidden`, `notFound`, `conflict`, `internal`). Responses always go through `utils/ApiResponse` (`success` / `created` / `paginated` / `noContent`) — the envelope shape is `{ success, message, data }` (paginated adds `count`, `pagination`). Keep this shape; the mobile API client and Redux thunks read `response.data.data`.

`middleware/error.middleware.js` normalizes Mongoose `CastError` / duplicate-key (11000) / `ValidationError`, JWT `JsonWebTokenError` / `TokenExpiredError`, and Multer `MulterError` into `ApiError`s before responding. Stack traces leak only in `NODE_ENV=development`.

**Phase status:** only `auth.routes.js` and `user.routes.js` are implemented. `places`, `categories`, `reviews`, `itineraries`, `currency`, `cultural`, `safety`, `favorites`, `admin`, `sync` are stub routers with a `// Routes will be added in Phase 2+` comment. When extending, follow the existing pattern: `routes/<feature>.routes.js` → `middleware/validate.middleware.js` with a Joi schema from `validators/` → `controllers/<feature>.controller.js` wrapped in `catchAsync` → `ApiResponse`.

Auth model: JWT access + refresh. `generateAccessToken` / `generateRefreshToken` in `utils/tokenUtils.js` sign with `JWT_SECRET` / `JWT_REFRESH_SECRET`; expiries come from `JWT_ACCESS_EXPIRY` (15m) / `JWT_REFRESH_EXPIRY` (7d). The refresh token is stored on the `User` doc (`refreshToken` field, `select: false`) and rotated on login; `refresh-token` endpoint verifies the submitted token matches the stored one. Password is bcrypt-hashed via a Mongoose pre-save hook that uses the **Mongoose 9 async hook signature** (no `next()` call — see `models/User.js:102`). `protect` middleware in `auth.middleware.js` attaches `req.user` (sans password/refreshToken).

Rate limiting tiers live in `config/constants.js` and are applied via `middleware/rateLimiter.middleware.js` — `authLimiter` is applied per-route on auth endpoints, `generalLimiter` globally.

`config/constants.js` is the source of truth for domain enums (`ROLES`, `REGIONS`, `INTERESTS`, `BUDGET_LEVELS`, `LANGUAGES`, `SEVERITY_LEVELS`, `CULTURAL_TYPES`, `ITINERARY_STATUS`) — reuse these in Mongoose schema `enum` fields and Joi validators instead of redefining.

## Architecture — mobile

Entry flow: `App.tsx` → `GestureHandlerRootView` → Redux `Provider` → `PersistGate` → `ThemeContext` → `NavigationContainer` → `RootNavigator`. `RootNavigator` dispatches `loadUser()` on mount and switches between `Onboarding` / `Auth` / `Main` stacks based on `auth.hasOnboarded` and `auth.isAuthenticated`. `MainTabNavigator` contains bottom tabs, each delegating to its own stack (`HomeStackNavigator`, `ExploreStackNavigator`, `ItineraryStackNavigator`, `ProfileStackNavigator`).

**Token storage is split on purpose:**
- `accessToken` / `refreshToken` live in `expo-secure-store` (see `api/client.ts` and `store/slices/authSlice.ts`) — **never** put them in Redux state or AsyncStorage.
- Redux-persist is whitelisted narrowly (`store/index.ts`): root persists only `settings`; auth persists only `hasOnboarded`. The rest of auth state is rehydrated via `loadUser()` → `GET /auth/me`.

API client (`src/api/client.ts`):
- Request interceptor pulls `accessToken` from SecureStore and attaches `Authorization: Bearer`.
- Response interceptor does one-shot 401 refresh: posts `refreshToken` to `/auth/refresh-token`, stores the new `accessToken`, replays the original request. On refresh failure it clears both tokens.
- Base URL comes from `src/config/app.config.ts`: web uses `localhost:5000`, mobile uses `http://${LOCAL_IP}:5000`. **`LOCAL_IP` is hard-coded (`192.168.1.125`)** — update it when your dev machine's IP changes, otherwise devices/emulators can't reach the API.

`src/api/endpoints.ts` centralizes path constants (use these rather than string literals when adding screens/thunks).

i18n (`src/i18n/index.ts`): three locales (`fr` default, `en`, `ar`) with a custom `languageDetector` that reads/writes `user-language` in AsyncStorage and falls back to device locale then `fr`. Translation bundles in `src/i18n/locales/<lang>/common.json`.

Theme: `src/theme/` exports `palette`, `lightTheme`, `ThemeContext`, `spacing`, `typography`. Consume via the context, not by importing `palette` directly into screens, for future dark-mode support.

Screen folders under `src/screens/` are scaffolded for every feature area but most are empty — `auth/`, `home/`, `itinerary/` have initial screens; `places/`, `explore/`, `favorites/`, `admin/`, `cultural/`, `currency/`, `profile/`, `settings/` are placeholders that match the backend Phase-2+ stubs.

## Environment / secrets

Backend requires `.env` (template at `backend/.env.example`). Key vars: `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `PORT` (default 5000), `NODE_ENV`, `CLIENT_URL`. Optional: Cloudinary, SMTP, ExchangeRate API. Mobile has no `.env` — dev URL is baked into `app.config.ts`.
