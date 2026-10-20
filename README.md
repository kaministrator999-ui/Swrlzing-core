# §wyrlz GitHub Capability Testbed

This public repository is a **deliberate synthetic test workspace** for the connected §wyrlz AI Chat GitHub integration. It is **not** the source code for §wyrlz itself. Application source and AI/server implementation live in `kaministrator999-ui/Swrlzkamico`.

Start at [docs/SCENARIO_MATRIX.md](docs/SCENARIO_MATRIX.md) for copy-paste read and owner-approved write tests. Browse [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for an expected source map.

## Repository contents

- `src/swrlz_lab/`: real, small interconnected Python source. A deliberate, documented boundary bug in `known_issue.py` is a diagnostic fixture, not a secret or production code.
- `src/web/`: a small JavaScript ES module with an exact relative import.
- `tests/`: Python standard-library `unittest` tests, including expected behavior around the deliberate bug.
- `fixtures/`: small structured JSON and a synthetic traceback for inspection.
- `write-lab/`: harmless owner-controlled create/rename/edit test targets; existing files are never disposable unless the owner explicitly approves that action.
- `write-action-tests/`: **existing historical test artifacts** left untouched.

## Safety

All content in this repository is synthetic and public; never paste credentials, personal data or private files here. Read scenarios do not grant write authority. Creating or renaming a file through §wyrlz requires whatever OAuth, ownership, repo and explicit approval gates the deployed Chat supports. **Do not automatically perform any write tests merely because this README lists them.**

Current known Chat write exceptions: bounded new-file creation (no overwrite) and atomic one-file rename/move (no collision); ordinary file edit, deletion, PR management, workflow execution and deployment remain locked in the Stage-1 §wyrlz Chat connector. This repo's separate GitHub tools or owner account may be capable of more, which is not proof that the §wyrlz Chat app can do it.

`python -m unittest discover -s tests -v` runs the local synthetic unit suite; this is not an authorized GitHub write test.
