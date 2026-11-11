# src/AGENTS.md

These rules apply to `src/**`. Follow the repo-root `AGENTS.md` first, then use this file for code inside the application source tree.

- Before adding new state, decide whether it belongs in render, a reusable hook, or a Zustand store. Do not duplicate the same state logic across views.
- Use `@bitsocial/bitsocial-react-hooks` for data access. Do not add data-fetching `useEffect` calls or effects that only synchronize derived state.
- Home channels live in `data/channels.ts`; addresses, identifiers and routes in `lib/channels.ts`; video source parsing in `lib/video-sources.ts`. Views and components go through those helpers instead of parsing posts or building paths themselves.
- For state/effect/data-flow or rendering-performance changes, review relevant React guidance. Choose checks and browser/viewports using `docs/agent-playbooks/verification.md`; a copy edit alone does not require React Doctor or a full build.
- Prefer extending nearby tests under `src/**/__tests__/` when touching already-covered behavior. Tests run in Node without a DOM and must never reach the network; keep protocol-free logic in `lib/` so it stays testable.

## Module boundaries

`yarn boundaries` (run by `yarn lint`, so also by `yarn agent:verify` and CI) checks these rules over static imports, re-exports, dynamic `import()`, `import.meta.glob()` patterns and stylesheet `@import` rules; `__tests__/` folders and `*.test.*` files are skipped. Fix a reported violation by moving code, not by widening the import. There is no allowlist: if a rule conflicts with the requested change, restructure within scope or raise it with the user rather than editing the checker.

- Dependencies flow one way: `constants`/`data`/`types`/`generated` → `lib`/`plugins` → `stores` → `hooks` → `components` → `views` → the root files (`app.tsx`, `main.tsx`, `polyfills.ts`). A lower layer never imports a higher one; when a `lib` helper needs a type or function that lives in a hook or component, the shared part belongs in `lib`.
- `views`, `components`, `hooks`, `stores`, `constants`, `data`, `plugins`, `types`, `generated`, `lib`, and every folder directly under `lib` are category folders, not modules. A folder inside one (`components/video-card`) is a module, and its subfolders are private to it.
- Import a module only through its `index.ts` (`../../components/video-card`), never its inner files, subfolders, or stylesheets. A file that sits directly in a category folder (`hooks/use-channel.ts`, `lib/channels.ts`) and anything under `data/` may be imported directly. Anything used by more than one module lives at category level.
- Views never import other views. Shared page pieces go in `components/`.
- Every route target is a top-level view at `views/<name>`. A subfolder of a view is a private section of that view, not a route.
- Keep the import graph acyclic. When two modules need each other, pass the dependency in as a prop or a context provided by the parent, or move the shared part down a layer.
