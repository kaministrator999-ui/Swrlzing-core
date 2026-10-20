# Testbed architecture and expected code relationships

This is a **synthetic application** created to test the §wyrlz Chat file intelligence and GitHub explorer. It is not §wyrlz's runtime.

## Python import relationships

`src/swrlz_lab/app.py` imports `.scoring.total_score` and `.formatting.describe_score`.

`src/swrlz_lab/scoring.py` imports `.constants.BONUS_POINTS`.

`src/swrlz_lab/formatting.py` imports `.constants.APP_LABEL`.

Expected direct file links:
- app.py → scoring.py
- app.py → formatting.py
- scoring.py → constants.py
- formatting.py → constants.py

This represents *two levels* of reachability. v288 currently analyzes the selected file plus direct verified imports; a full recursive traversal and call-graph inference are not yet implemented.

## JavaScript relationship

`src/web/dashboard.js` imports `./format.js`. Both files exist and contain ES module declarations.

## Known defect and scenario

`src/swrlz_lab/known_issue.py` divides by `len(values)` without handling an empty list. Inspect `fixtures/synthetic-error.log` for a synthetic traceback. A good analyzer identifies the empty-input condition as the cause rather than claiming it ran the application.

## Boundaries for accurate conclusions

Evidence of an import does not prove runtime behavior, correct execution, or comprehensive reachability. Missing/ambiguous matches should remain unresolved rather than invented. Tests under `tests/` are source artifacts; their presence alone does not mean §wyrlz has executed them.
