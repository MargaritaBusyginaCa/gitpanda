import { exec } from "child_process";
import { promisify } from "util";
import * as vscode from "vscode";

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

export async function deleteCurrentBranch() {
  //Check if the current branch is main or master
  const currentBranch = (
    await runGitCommand("git branch --show-current")
  ).trim();
  if (
    currentBranch === "main" ||
    currentBranch === "master" ||
    currentBranch === "develop"
  ) {
    throw new Error(
      "Gitpanda doesn't delete main, master or develop branches.",
    );
  } else {
    //Delete the current branch
    try {
      //if there is a main, master or develop branch, checkout to that branch first
      const branches = await runGitCommand("git branch");
      if (branches.includes("develop")) {
        await runGitCommand("git checkout develop");
      } else if (branches.includes("main")) {
        await runGitCommand("git checkout main");
      } else if (branches.includes("master")) {
        await runGitCommand("git checkout master");
      } else {
        //if none of the above branches exist, checkout to the first branch in the list that is not the current branch
        const branchList = branches
          .split("\n")
          .map((b) => b.replace("*", "").trim())
          .filter((b) => b !== currentBranch && b.length > 0);
        if (branchList.length === 0) {
          throw new Error(
            "No other branches to checkout to. Cannot delete the current branch.",
          );
        }
        await runGitCommand(`git checkout ${branchList[0]}`);
      }
      await runGitCommand(`git branch -D ${currentBranch}`);
    } catch (err) {
      throw new Error("Failed to delete the current branch");
    }
  }
}
