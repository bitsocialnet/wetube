# AGENTS.md

## Purpose and priority

These are the shared instructions for agents working on WeTube. Explicit user instructions take precedence over repository workflow guidance. MUST rules are mandatory; SHOULD rules are defaults. Read linked playbooks only when the task needs them.

Use judgment for routine implementation choices and continue authorized work. Ask only when missing information materially changes the outcome or an action needs authorization that has not already been given. Do not turn a skill's suggested procedure into an extra approval gate.

## Product and source of truth

WeTube is a static, serverless, peer-to-peer video client built on the Bitsocial protocol: the YouTube alternative of Phase 5 of the Bitsocial master plan. Every channel is a Bitsocial community owned by its creator, and channel content comes from peers, not the app origin. A video post carries a list of sources (embeds, files, IPFS); Bitsocial hosts that list, never the video. Preserve hash routing and static deployment unless the user requests an architectural change. Product decisions and open questions live in the vision docs at the repository root: [README.md](README.md), [how-it-works.md](how-it-works.md), [video-sources.md](video-sources.md), [curation-and-discovery.md](curation-and-discovery.md), [monetization.md](monetization.md) and [open-questions.md](open-questions.md).

The repository is public and the client is an early, read-only preview. Do not deploy it or announce it without an explicit request.

Code, tests, manifests, source docs, and runtime evidence establish behavior. This file, skills, playbooks, and task logs are orientation and policy; verify their technical claims against source before editing. Check the installed dependency version before assuming a nearby repository supplies its code.

For an unexpected repo-specific issue, tell the contributor and continue independent work. After confirmation, record only recurring issues with a concrete mitigation in [known-surprises.md](docs/agent-playbooks/known-surprises.md).

## Working principles

- Define completion for non-trivial work. Continue through implementation, relevant verification, and fixes until the requested outcome is complete; stop at the user's requested boundary.
- Understand the flow before editing. Prefer skipping unnecessary work, reusing repository code, standard-library/native features, then installed dependencies, before writing new code.
- Keep diffs scoped. Preserve unrelated edits; do not reformat, rename, or refactor adjacent code without a task-related reason.
- Simplicity must preserve correctness, clarity, accessibility, validation, security, and useful tests.
- For a bug tied to a file or line, inspect `git log`/`git blame`, then relevant `git show`, before fixing it. See [bug-investigation.md](docs/agent-playbooks/bug-investigation.md).
- Never work around a `@bitsocial/bitsocial-react-hooks` bug in this repo. We maintain that library, so fix the root cause there, release it, and bump it here; without access to its repository, open an issue there with the evidence instead.
- Use existing evidence or a focused test before adding instrumentation. Remove task-owned instrumentation after verification.
- When a change finishes or reshapes an item in [roadmap.md](roadmap.md), or settles a decision in the vision docs or `open-questions.md`, update that document in the same change.

## Task router

| Task | Required guidance/check |
|---|---|
| Visual design, layout, CSS, or themes | Use the tokens in `src/index.css` and the logo rules in [design/logo/README.md](design/logo/README.md); match the mockups in `design/logo/showcase/` |
| Files under `src/` or `scripts/` | Read the directory's `AGENTS.md` |
| Video post format or playable sources | Read [video-sources.md](video-sources.md); keep `src/lib/video-sources.ts`, its tests and the README's post format in sync |
| Home channel list | Edit `src/data/channels.ts`; every entry is a community address, with its public key when known |
| Code or automation changed | Select affected checks using [verification.md](docs/agent-playbooks/verification.md); use `agent:verify` for integration/build changes or an explicitly requested full pass |
| React state, effects, data flow, or rendering performance changed | Review relevant React guidance; use advisory `yarn doctor` for newly introduced diagnostics |
| UI behavior/layout changed | Verify the affected flow; select browsers/viewports using [verification.md](docs/agent-playbooks/verification.md) |
| `package.json` changed | Run `corepack yarn install` to synchronize `yarn.lock`; keep `yarn deps:check-pinned` passing |
| Dependencies, moved files, or imports changed | `yarn boundaries` (part of `yarn lint`) must pass; see module boundaries in [src/AGENTS.md](src/AGENTS.md). Run advisory `yarn knip`; resolve relevant new findings |
| AI workflow files changed | Edit shared sources, run `yarn ai-workflow:sync`, then `yarn ai-workflow:check` and `yarn ai-workflow:test` |
| Open PR feedback or merge readiness | Use `review-and-merge-pr` within the user's requested scope |
| Work needs a durable handoff/resumption, or one run is long enough to hit context compaction | Use [long-running-agent-workflow.md](docs/agent-playbooks/long-running-agent-workflow.md) |

## Code and design

- Use Corepack-managed Yarn 4, never npm for project dependency changes. Pin exact versions and keep the lockfile synchronized. Yarn enforces a 3-day `npmMinimalAgeGate` and runs no install scripts; preapprove a package or enable scripts in `.yarnrc.yml` only with a stated reason.
- Stack: React 19, TypeScript, React Router 7, Vite, `@bitsocial/bitsocial-react-hooks` with pkc-js in the browser, CSS modules, oxlint, oxfmt, Vitest. It matches 5chan's stack; add Zustand when shared state is first needed, as 5chan does.
- Keep page composition in `src/views/`, reusable UI in `src/components/`, hooks in `src/hooks/`, shared state in `src/stores/`, helpers in `src/lib/`, static data in `src/data/`. Dependencies flow one way between those layers; see module boundaries in [src/AGENTS.md](src/AGENTS.md).
- Use Zustand for shared/global state; local component state may use `useState`.
- Use Bitsocial hooks for protocol data access. Do not fetch data in effects or synchronize derived state with effects; derive values during render.
- Use React Router for navigation, not manual history manipulation. Channels live at `/@<address>` and videos at `/@<address>/v/<cid>`; build both with the helpers in `src/lib/channels.ts`. Links use the community's exact address, never a directory code.
- The UI follows the WeTube website mockups in `design/logo/showcase/`: a YouTube-like layout, dark by default with a light theme from `prefers-color-scheme`, brand red `#ed004a`, rounded thumbnails. Colors come from the tokens in `src/index.css`.
- Add comments for non-obvious constraints or logic, not for obvious code.

## Git and ownership

- Keep `master` releasable. Start new changes on short-lived `codex/feature/*`, `codex/fix/*`, `codex/docs/*`, or `codex/chore/*` branches unless the user requests otherwise.
- For an unrelated task while another branch is active, create a separate descriptive worktree from `master`. Prefer `./scripts/create-task-worktree.sh <type> <descriptive-slug>`; it installs dependencies.
- Related delegated slices may share the task worktree with non-overlapping file ownership. Never switch branches underneath another agent.
- Stage only task-owned changes, using a selective index patch when files contain mixed edits. Do not use `git add -A` as a default.
- Never commit secrets or generated build output. Preserve preexisting artifacts and unrelated changes during cleanup.
- Only commit, push, publish, or merge when authorized. Permission already given for the action persists through its necessary steps.
- When opening a requested PR, target `master` and make it ready for review so review bots run.
- After an authorized merge, clean up only the verified merged branch/worktree; preserve any later or unrelated work. Do not run Git cleanup from lifecycle hooks.
- Use `gh` for GitHub operations. Commit/issue formatting lives in [commit-issue-format.md](docs/agent-playbooks/commit-issue-format.md); provide suggestions when requested, not on every answer.

## Verification and resource ownership

- Verify the affected behavior with the narrowest reliable checks. Add regression tests for non-trivial, testable bugs; do not add tests that merely restate a reversible wording or formatting edit.
- Run applicable checks for the final change once. Repeat or broaden them only after relevant edits, failures, or unresolved concerns. Preserve explicit user, CI, and release requirements. Documentation-only changes need document/workflow checks.
- Before heavy work, inspect existing processes. Stop only stale processes owned by this task; never stop a process of unclear ownership.
- Serialize installs, builds, full tests, React Doctor, and browser work across the task. One agent owns heavy verification.
- Use `corepack yarn exec vitest run --maxWorkers=2 [paths]` for agent-run tests. Do not use watch mode or the package's default four-worker setting.
- React Doctor is guidance for newly introduced issues, not a score target. Knip and coverage are advisory; do not invent new repository-wide gates.
- Default to fresh isolated Playwright sessions. Reuse a contributor's current browser only when explicitly authorized.
- Use `./scripts/pw-session.sh open <session> ...` and `close <session>` for every browser session. One browser may be active machine-wide. Exit 75 means busy; defer or use the wrapper's bounded wait. Never use `close-all` or `kill-all`.
- Reuse a compatible dev server in the same worktree when safe. Otherwise record and clean up the server/process you start. Never start a server for a documentation-only task.
- Review the final task-owned diff. Use `code-quality-review` for non-trivial changes or an explicit review request; apply high-confidence findings within existing authorization.
- After a bug fix or substantive review correction exposes a preventable mistake, use [retro](.agents/skills/retro/SKILL.md) before finishing to consider the smallest useful prevention.

## Skills and delegation

- Shared skills live in `.agents/skills/`; shared roles in `.agents/roles/` (`browser-check`, `reviewer`). `.claude/skills/` and harness agent files are generated compatibility outputs. See [skills-and-tools.md](docs/agent-playbooks/skills-and-tools.md).
- Keep harness-specific hooks, permissions, and metadata explicit; byte-identical files do not establish equivalent runtime behavior.
- Keep model and reasoning choices out of committed skills and custom agents. Use the app's runtime defaults, parent inheritance, and supported invocation-time choices.
- Delegate substantial independent work when it improves speed, context isolation, or independent review. Give each child its scope, acceptance criteria, context, file ownership, and evidence to return; check that evidence before accepting a child's result. Use at most four active workers by default. Browser work always remains serialized.
- Use relevant React skill guidance for state/effect/data-flow or performance work. Load only rules that fit this Vite client; use `you-might-not-need-an-effect` for a focused effect review when the reason is unclear.
- Prefer existing tools and local CLIs. Do not search for or install additional skills merely because a normal coding task mentions their domain.

## Development tooling

Development builds load Agentation and `window.__ELEMENT_SOURCE__` (from `src/lib/dev-tools.ts`) for visual feedback and source inspection; production builds omit both. Use `inspect-elements` for source attribution.

## Local commands and playbooks

Canonical dev URL: `https://wetube.localhost`; other worktrees may use branch-scoped `*.wetube.localhost`. Preserve the launcher's HTTPS proxy on port 443. Direct Vite fallback: `PORTLESS=0 yarn start` (port 5180).

Common checks: `yarn agent:verify` (lint, type-check, tests, build, conditional workflow check, advisory Knip), `yarn doctor`, `yarn knip`, `yarn deps:check-pinned`, `yarn ai-workflow:sync`, `yarn ai-workflow:check`, `yarn ai-workflow:test`, `./scripts/pw-session.sh status`.

Load details on demand: [hooks](docs/agent-playbooks/hooks-setup.md), [verification](docs/agent-playbooks/verification.md), [skills/tools](docs/agent-playbooks/skills-and-tools.md), [long-running work](docs/agent-playbooks/long-running-agent-workflow.md), [known surprises](docs/agent-playbooks/known-surprises.md).
