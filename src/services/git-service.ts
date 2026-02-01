import { exec } from "child_process";
import { promisify } from "util";
import * as vscode from "vscode";

const execAsync = promisify(exec);

export async function getCurrentBranch(): Promise<string> {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

  if (!workspaceFolder) {
    throw new Error("No workspace folder found");
  }

  try {
    const { stdout } = await execAsync("git branch --show-current", {
      cwd: workspaceFolder.uri.fsPath,
    });

    return stdout.trim();
  } catch (error) {
    throw new Error("Failed to get current branch");
  }
}
