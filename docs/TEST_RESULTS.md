# Capability test results ledger

This file is a **starting ledger**, not evidence that the §wyrlz Chat product has performed the tests.

| Class | Evidence available at testbed setup | §wyrlz Chat product acceptance |
| --- | --- | --- |
| Repo listing, file search and exact reads | Real checked-in synthetic source and context | UNTESTED on signed-in Chat |
| Python AST and direct dependencies | `src/swrlz_lab/app.py` plus real dependencies | UNTESTED on signed-in Chat |
| JS module import analysis | `src/web/dashboard.js` → `format.js` | UNTESTED on signed-in Chat |
| Bug diagnosis and logs | Intentional empty-list ZeroDivisionError and synthetic error log | UNTESTED on signed-in Chat |
| Source-versus-runtime uncertainty | README and architecture documentation | UNTESTED on signed-in Chat |
| Create new text file | `write-lab/created-by-swyrlz.txt` intentionally absent initially | UNTESTED — require owner approval |
| Rename file atomically | `write-lab/rename-me.txt` intentionally exists initially | UNTESTED — require owner approval |
| Collision protection | `write-lab/edit-existing.txt` exists | UNTESTED — must not mutate |
| Existing file edit/delete | Fixture exists; capability remains locked in Stage 1 | UNTESTED — must deny |
| History/commit/PR/workflow inspection | Branch/PR and CI workflow provide real GitHub evidence after merge | UNTESTED on signed-in Chat |
| Empty repo or onboarding-only classification | Synthetic classification fixtures in §wyrlz dev code are required; this repo is populated | UNTESTED |

A green GitHub Action verifies fixture code only. It does **not** verify the app's authenticated provider reads, conversational routing, GitHub OAuth authorization, or user approvals.

For each real owner test, append a dated observation with source repo and revision, exact prompt, result, provider action evidence, approval if any, and post-write hash/commit. Do not rewrite an earlier UNTESTED result without evidence.
