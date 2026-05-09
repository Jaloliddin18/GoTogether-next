# /update-memory

Update MEMORY.md to reflect the exact current state of the project.
Do not guess. Only write what the filesystem and git confirm.

## Step 1 — Gather data

Run these commands:
git branch --show-current
git log --oneline -8
git status
ls pages/
ls apollo/
ls libs/types/library/
ls libs/enums/

## Step 2 — Rewrite MEMORY.md

Update every section with accurate data:
- Last Updated: today's date + latest commit hash
- Current Branch: result of git branch --show-current
- What Is Complete: only files that actually exist on disk
- What Is In Progress: anything stubbed or partially done
- What Is Next: next incomplete task
- Known Issues: any build errors or cleanup items
- Recent Commits: git log --oneline -8
- Agent Notes: one line about this session

## Step 3 — Show and confirm

Run git diff MEMORY.md and show the diff.
Propose commit message: feat: update session memory
Wait for confirmation before committing.
