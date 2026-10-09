# Antigravity Workspace Guidelines & Permissions Policy

## 1. Scope & Workspace Permissions
- **Full Workspace Autonomy:** The agent has full permission to read, create, edit, refactor, and inspect any files, scripts, and assets located inside the workspace root (`c:\Users\Admin\Documents\GitHub\liliapotseluyko.github.io`).
- **Do Not Prompt for Internal Files:** Do not ask for user confirmation when inspecting, reading, or editing HTML, CSS, JavaScript, JSON, or images located within this repository.

## 2. External File Boundaries
- **Strict Boundary:** Never read, edit, overwrite, delete, or create files outside this workspace root (such as the User profile, Desktop, Downloads, Documents outside this repo, or System folders) without explicit prior user confirmation.
- **Artifacts & Temp Files:** If any temporary data or scripts are needed, keep them strictly within the conversation workspace or scratch directory.

## 3. Git & GitHub Syncing Restrictions
- **No Git Commits or Pushes:** The agent is strictly prohibited from executing `git commit`, `git push`, `git pull`, `git remote`, or any command that synchronizes with remote repositories.
- **Manual User Syncing:** All staging, committing, and GitHub syncing is handled manually by the user via GitHub Desktop.
- **Read-Only Git Status:** Commands such as `git status` or `git diff` for checking modified files are permitted, but no changes to the repository history or branches may be made.

## 4. Default Interactive Alignment (/grill-me)
- **Always Apply /grill-me by Default:** Treat every user feature, page design, architecture, or content change request as having an implicit `/grill-me` command prefixed.
- **Interview & Confirm Before Implementation:** Before generating extensive UI code, layout shifts, or copy text, proactively ask targeted clarifying questions, present candidate options or proposed drafts, and confirm user preferences to resolve ambiguities. Never make unsolicited assumptions about copy or UX layout without checking with the user first.

