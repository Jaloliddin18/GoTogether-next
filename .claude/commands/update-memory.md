# /update-memory

Refresh MEMORY.md with the accurate current state of the frontend repo.

## Steps

1. Run:
   ```bash
   git branch --show-current
   git log --oneline -8
   git status
   ```

2. Inspect current file state:
   ```bash
   find pages/library -type f | sort
   find apollo/library -type f | sort
   find libs/types -maxdepth 1 | sort
   find libs/enums -type f | sort
   ```

3. Rewrite MEMORY.md with:
   - **Last Updated**: today's date + latest commit hash
   - **Current Branch**: from git branch
   - **What Is Complete**: only files that actually exist on disk
   - **What Is In Progress**: any partially implemented pages/features
   - **What Is Next**: next implementation step based on the order in CLAUDE.md
   - **Known Issues**: any outstanding problems (TypeScript errors, missing dependencies, etc.)
   - **Recent Commits**: git log --oneline -8

4. Show a `git diff MEMORY.md` before committing.

5. Propose commit message:
   ```
   fix: update memory with current frontend state
   ```
   Wait for confirmation before committing.
