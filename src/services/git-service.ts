import { exec } from "child_process";
import { promisify } from "util";
import * as vscode from "vscode";
import { parseLocalBranches } from "../utils/git-utils";
import { getCommitMessage } from "../utils/ui-utils";

const execAsync = promisify(exec);

export async function runGitCommand(command: string): Promise<string> {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

  if (!workspaceFolder) {
    throw new Error("Workspace is not found");
  }
  try {
    const { stdout } = await execAsync(command, {
      cwd: workspaceFolder.uri.fsPath,
    });
    return stdout;
  } catch (err) {
    throw new Error("Failed to get current branch info");
  }
}

export async function deleteCurrentBranch(): Promise<void> {
  const protectedBranches = new Set(["main", "master", "develop"]);

  const currentBranch = (
    await runGitCommand("git branch --show-current")
  ).trim();

  if (protectedBranches.has(currentBranch)) {
    throw new Error(
      "Gitpanda doesn't delete main, master, or develop branches.",
    );
  }

  // 1) Switch away from current branch
  try {
    await runGitCommand("git checkout -");
  } catch {
    // 2) If checkout - fails, ask the user where to go
    const branchesRaw = await runGitCommand("git branch");
    const branches = parseLocalBranches(branchesRaw).filter(
      (b) => b !== currentBranch,
    );

    if (branches.length === 0) {
      throw new Error(
        "No other branches to checkout to. Cannot delete the current branch.",
      );
    }

    const target = await vscode.window.showQuickPick(branches, {
      title: "Select a branch to checkout before deleting the current branch",
      placeHolder: "Choose a branch",
    });

    // user cancelled
    if (!target) return;

    await runGitCommand(`git checkout ${target}`);
  }

  // 3) Try safe delete first
  try {
    await runGitCommand(`git branch -d ${currentBranch}`);
    vscode.window.showInformationMessage(`Deleted branch: ${currentBranch}`);
    return;
  } catch (e) {
    // 4) If not merged (or other failure), offer force delete
    const choice = await vscode.window.showWarningMessage(
      `Couldn't safely delete "${currentBranch}" (it may not be fully merged). Force delete?`,
      { modal: true },
      "Force delete",
    );

    if (choice === "Force delete") {
      await runGitCommand(`git branch -D ${currentBranch}`);
      vscode.window.showInformationMessage(
        `Force deleted branch: ${currentBranch}`,
      );
    }
  }
}

export async function deleteAllMergedBranches() {
  const choice = await vscode.window.showWarningMessage(
    `Delete all merged local branches (safe delete)?`,
    { modal: true },
    "Yes",
  );

  if (choice === "Yes") {
    const mergedBranchesRaw = await runGitCommand("git branch --merged");
    const mergedBranches = parseLocalBranches(mergedBranchesRaw);

    const protectedBranches = new Set(["main", "master", "develop"]);
    const branchesToDelete = mergedBranches.filter(
      (b) => !protectedBranches.has(b),
    );

    for (const branch of branchesToDelete) {
      try {
        await runGitCommand(`git branch -d ${branch}`);
        vscode.window.showInformationMessage(`Deleted branch: ${branch}`);
      } catch {}
    }
  }
}

export async function shipAll() {
  const commitMessage = await getCommitMessage();
  if (!commitMessage) {
    vscode.window.showErrorMessage(
      "Something went wrong while getting the commit message.",
    );
    return;
  }
  await runGitCommand("git add .");
  await runGitCommand(`git commit -m "${commitMessage}"`);
  vscode.window.showInformationMessage(
    "Changes committed and pushed successfully.",
  );
  await runGitCommand("git push -u origin HEAD");
}

export async function getBranchInfo() {
  const lastCommitInfo = await runGitCommand(
    'git log -1 --format="%h - %s (%cr)"',
  );
  const status = (await runGitCommand("git status")).trim();
  return { lastCommitInfo: lastCommitInfo.trim(), status };
}
