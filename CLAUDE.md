# GlucoWatch — Project Notes

A single-user Android app (React Native / Expo) that writes daily-note markdown and
meal photos into a user-configured Obsidian vault folder. The vault is the source of
truth; the app only captures and writes well-structured markdown. No backend, no
database, no analysis in-app. Full spec lives in `gluco-watch-plan.md` — read the
relevant section before starting a step.

## Stack

- Expo SDK 56, React Native 0.85, React 19, TypeScript (strict).
- Expo Router (file-based routing) for navigation.
- pnpm as the package manager.
- EAS for builds. Expo Go is **not** used — the app needs custom native modules
  (notifications, Storage Access Framework) past step 5, so a development build is
  required from the start.
- Android only. No iOS, no web (the `web` config exists only because the template
  ships it; it is not a target).

> Expo changes fast between SDKs. Before writing native or router code, check the
> versioned docs at https://docs.expo.dev/versions/v56.0.0/ (see `AGENTS.md`).

## Folder layout

`app/` is reserved by Expo Router for **routes only**. All other source code
(features, shared components, hooks, theme, utils, types) lives under `src/` and is
imported via the `@/*` alias (mapped to `./src/*` in `tsconfig.json`).

```
app/                 # Expo Router routes ONLY (thin files)
  _layout.tsx        # root Stack
  index.tsx          # entry screen
src/                 # all application code (created as features are built)
  features/
  components/         # shared components
  hooks/
  theme/
  types/
  utils/
  constants.ts
assets/
app.json
eas.json
```

This splits the user-global `CLAUDE.md` convention (`app/features/...`) because
Expo Router owns `app/`. The convention's intent — one root source tree with the
prescribed sub-folders — is preserved under `src/` instead.

## Conventions

Follow the user-global `CLAUDE.md` and the `/refactor` skill:

- Arrow functions only; explicit return types on exported functions/hooks.
- One component per folder with a co-located `styles.ts`; no inline styles in JSX.
  Use React Native `StyleSheet` (this is RN, not web — MUI does not apply).
- Constants in dedicated files, `SCREAMING_SNAKE_CASE` primitives / `as const`
  objects; no magic values in component files.
- Named exports everywhere **except route files** under `app/`, which must use a
  `default` export (the Expo Router equivalent of the Next.js-pages exception).
  Keep route files thin — real screen UI belongs in `src/features/...`.
- TypeScript strict, no `any`. ESLint + Prettier enforced.

## Commands

```bash
pnpm start                 # Metro dev server (needs a dev build installed)
pnpm android               # Metro + open on a connected Android device
pnpm typecheck             # tsc --noEmit
pnpm lint                  # expo lint (ESLint flat config)
pnpm format                # prettier --write
npx expo-doctor            # validate project / dependency health
```

## Building / installing on device (EAS)

The `development` profile in `eas.json` produces an internal-distribution APK with
the dev client. Requires an Expo account (`eas login`) the first time, which also
creates the EAS project and writes `extra.eas.projectId` into `app.json`.

```bash
eas login
eas build --profile development --platform android            # cloud build
# or, to build locally on this box (has Android SDK + JDK 17):
eas build --profile development --platform android --local
```

Install the resulting APK on the Pixel, then `pnpm start` and open the app — it
connects to Metro. Subsequent JS-only changes don't need a rebuild; native/config
changes do.

## Scope discipline

Build one step at a time per `gluco-watch-plan.md` §5. Do not pull work forward from
later steps. Non-goals in §6 are binding for v1.
