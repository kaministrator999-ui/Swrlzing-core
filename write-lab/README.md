# Safe one-file write experiments

These fixtures are deliberately small and public. They exist to exercise **owner-approved operations** from the separate §wyrlz Chat GitHub connector, not to authorize those operations in advance.

On first setup:
- `rename-me.txt`: exists; may be renamed ONLY after the user asks and separately confirms it in §wyrlz Chat.
- `edit-existing.txt`: exists; should reject overwrite attempts; direct updates/deletes are Stage-1 locked.
- `created-by-swyrlz.txt`: MUST NOT exist yet, so the user's requested CREATE_FILE can be tested end to end.
- `renamed-by-swyrlz.txt`: MUST NOT exist yet, so the owner's requested atomic rename can be tested end to end.

For repeat write tests, choose fresh unique filenames and update the test ledger. Original `write-action-tests/` files preserve historical owner test evidence.
