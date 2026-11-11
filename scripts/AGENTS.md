# scripts/AGENTS.md

These rules apply to `scripts/**`. Follow the repo-root `AGENTS.md` first, then use this file for automation and workflow helpers.

- Keep scripts non-interactive and idempotent. Print the command, URL, branch, or path being acted on so failures are diagnosable.
- Use repo-relative paths and environment variables instead of user-specific absolute paths.
- For dev-server helpers, default to `https://wetube.localhost`, but allow a branch-scoped `*.wetube.localhost` route when the launcher is avoiding a Portless name collision. Start the Portless HTTPS proxy on port 443 before registering routes so legacy `~/.portless` state on port 1355 is not reused. Respect the existing `PORTLESS=0` fallback instead of hard-coding alternate ports.
- Keep shell helpers thin. When logic becomes stateful or cross-platform, prefer a Node script.
- `scripts/pw-session.sh` owns the machine-wide Playwright resource lock shared by every worktree, checkout, and Bitsocial client repository, so its default lock path must stay repository-independent. Keep acquisition atomic, treat `playwright-cli list --all` as the only liveness oracle and leave the lock alone when it cannot be read, require exact-owner release, and close the named browser before normal release; never broaden cleanup to unrelated sessions.
- Git and worktree helpers must validate input and default to safe operations.
- If a helper deletes local branches automatically, document the exact eligibility checks and keep the behavior conservative.
