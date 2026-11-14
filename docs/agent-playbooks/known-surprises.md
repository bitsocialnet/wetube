# Known Surprises

This file tracks repository-specific confusion points that caused agent mistakes.

## Entry Criteria

Add an entry only if all are true:

- It is specific to this repository (not generic advice).
- It is likely to recur for future agents.
- It has a concrete mitigation that can be followed.

If uncertain, ask the developer before adding an entry.

## Entry Template

```md
### [Short title]

- **Date:** YYYY-MM-DD
- **Observed by:** agent name or contributor
- **Context:** where/when it happened
- **What was surprising:** concrete unexpected behavior
- **Impact:** what went wrong or could go wrong
- **Mitigation:** exact step future agents should take
- **Status:** confirmed | superseded
```

## Entries

The entries below were observed in the 5chan client, whose agent workflow, dev launcher, and tooling this repository inherits; their mitigations apply here unchanged.

### AI hook payloads need behavioral checks

- **Date:** 2026-09-11
- **Observed by:** contributor + Codex
- **Context:** Audit of the shared AI workflows (inherited from 5chan).
- **What was surprising:** Mirrored hook files passed parity checks while Codex supplied patch text in `tool_input.command`, not `file_path`. Stop hooks also mutated Git and repeated builds.
- **Impact:** Edit hooks could silently skip work; routine conversations could trigger unrelated work.
- **Mitigation:** Keep only the payload-tested formatter on edit events and use explicit `agent:verify`. Run `ai-workflow:test` as well as schema/generated-file checks after workflow changes.
- **Status:** confirmed

### Yarn Berry never runs `pre*`/`post*` hooks on user-defined scripts

- **Date:** 2026-09-02
- **Observed by:** Tommaso + Claude
- **Context:** A generated data step in 5chan went stale because `prebuild`/`prestart` entries never ran.
- **What was surprising:** Corepack-managed Yarn 4 (Berry) does not run npm-style `pre<script>`/`post<script>` hooks for user-defined scripts; it only honours `preinstall`/`install`/`postinstall`, `prepack`/`postpack`, and `prepublish`. The entries still work when invoked by name (`yarn run prebuild`), which makes them look alive.
- **Impact:** Any "automatic" step wired through a `pre*`/`post*` entry for a custom script silently never runs locally, in CI, or on deploy.
- **Mitigation:** Never add `pre*`/`post*` entries for custom scripts in this repo. Chain the step into the script itself (`corepack yarn <step> && ...`) or into the orchestrating Node script.
- **Status:** confirmed

### Agent verification can saturate contributor laptops

- **Date:** 2026-08-26
- **Observed by:** Tommaso + Codex
- **Context:** Verifying a fix in 5chan while multiple worktrees already had Vite servers running.
- **What was surprising:** The full Vitest suite started a coordinator plus four Node workers, and subsequent build and React Doctor work ran while existing dev servers remained active. Even sequential heavy commands can saturate several CPU cores when they stack on long-lived worktree servers.
- **Impact:** The contributor laptop became nearly unresponsive for a short period.
- **Mitigation:** Before heavy verification, inspect existing repo processes; remember that `create-task-worktree.sh` automatically installs dependencies; reuse or stop only agent-owned dev servers; cap agent-invoked Vitest at two workers; run worktree creation/installs, full tests, builds, React Doctor, and browser checks sequentially across all agents; and clean up every process/session the agent starts.
- **Status:** confirmed

### GitHub Projects are not used for repository workflow

- **Date:** 2026-07-23
- **Observed by:** Tommaso + Claude
- **Context:** Porting the `review-and-merge-pr` skill between Bitsocial repositories.
- **What was surprising:** Skills still referenced an organization project and project item even though Bitsocial repositories no longer use GitHub Projects.
- **Impact:** Agents can waste time querying a nonexistent project or report a successful merge as incomplete.
- **Mitigation:** Keep pull-request review and merge workflows independent of GitHub issues and Projects; only create or manage an issue when the user explicitly requests one.
- **Status:** confirmed

### react-doctor score reflects React Compiler coverage, not code health

- **Date:** 2026-06-05
- **Observed by:** Tommaso + Claude
- **Context:** Trying to raise the 5chan `yarn doctor` score.
- **What was surprising:** The score is overwhelmingly driven by React Compiler optimizability diagnostics (valid latest-ref idioms, `try/finally` the compiler cannot lower yet) and saturates on the fraction of files with zero diagnostics. Only suppressing essentially every rule moves it substantially.
- **Impact:** Agents can burn large effort, and risk real regressions, rewriting correct code into compiler-friendly but worse shapes or suppressing rules until the score is meaningless.
- **Mitigation:** Do not treat the aggregate score as a target. Use React Doctor as a diff reviewer (`yarn doctor --scope changed --base <base>`) to catch newly introduced issues, and fix only genuine bugs.
- **Status:** confirmed

### Toolchain model names and inheritance are not interchangeable

- **Date:** 2026-04-08
- **Updated:** 2026-07-10
- **Observed by:** contributor + Codex
- **Context:** Reviewing repo-managed agent configs under `.codex/agents` and `.claude/agents`.
- **What was surprising:** Model names remain harness-specific, while Codex custom-agent `model` and `model_reasoning_effort` settings are optional and inherit from the parent when omitted; Codex does not document a `latest` alias for these files.
- **Impact:** Hard-coded model or reasoning-effort settings can become stale or unsupported and prevent subagents from following the contributor's current parent configuration.
- **Mitigation:** Omit model and reasoning fields from `.agents/roles` and committed skills; `yarn ai-workflow:check` rejects them so generated agents keep inheriting parent settings.
- **Status:** confirmed

### Portless reuses legacy proxy state unless the launcher forces HTTPS

- **Date:** 2026-04-28
- **Observed by:** Tommaso + Codex
- **Context:** Moving 5chan's `yarn start` from the old `:1355` HTTP proxy URL to HTTPS.
- **What was surprising:** Even with a current Portless installed, it reused an existing `~/.portless/proxy.port = 1355` HTTP proxy and printed the legacy `:1355` URL.
- **Impact:** `yarn start` can advertise and use the old URL when a contributor has legacy Portless state running.
- **Mitigation:** Keep `scripts/start-dev.js` explicitly starting the Portless HTTPS proxy on port `443` before registering the app route.
- **Status:** confirmed

### Fixed Portless app names collide across worktrees

- **Date:** 2026-03-30
- **Observed by:** Codex
- **Context:** Starting `yarn start` in one 5chan worktree while another was already serving through Portless.
- **What was surprising:** Using one literal Portless app name in every worktree makes the route itself collide, even when the backing ports differ, so the second process fails with `already registered`.
- **Impact:** Parallel branches can block each other even though Portless is meant to let them coexist.
- **Mitigation:** Keep Portless startup behind `scripts/start-dev.js`, which uses a branch-scoped `*.wetube.localhost` route outside the canonical case and increments a `-2`, `-3`, ... suffix when that route is occupied. Pass the actual route to agents through `AGENT_APP_URL` when it differs from the canonical URL.
- **Status:** confirmed
