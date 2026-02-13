# Gitpanda

Gitpanda is a VS Code extension that enhances your Git branch workflow and helps keep repositories clean and easy to manage.

### Features

- **One-click branch name copy**
- **Delete the current branch with one click**
- **Safely delete all merged local branches**  
  Gitpanda never deletes `main`, `master`, or `develop`.  
  _(Pushing important work to origin before cleanup is recommended.)_
- **One-click “ship all”**  
  Stages all changes, commits them with your message, and pushes to origin.
- **Useful branch insights**  
  View branch status and last commit information.

### Commands

All commands are available via the **status bar button** or the **Command Palette**:

- `gitpanda.copy` — Copy the current branch name
- `gitpanda.deleteCurrentBranch` — Delete the current branch and switch to the previous one
- `gitpanda.deleteMergedBranches` — Safely delete all merged local branches (excluding protected branches)
- `gitpanda.shipAll` — Stage, commit, and push all changes
- `gitpanda.branchInfo` — Show current branch status and last commit info

Your workspace has to have a git repository initialized to use this extension.

### How to Install

1. Open **VS Code**
2. Go to the **Extensions** view (`Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Search for **Gitpanda**
4. Click **Install**

Once installed, the Gitpanda status bar button will appear when you open a Git repository.

## Release Notes

### 1.0.0

Initial release of gitpanda

---

**Enjoy!**
