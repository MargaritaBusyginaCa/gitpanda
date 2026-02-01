import { exec } from "child_process";
import { promisify } from "util";
import * as vscode from "vscode";

const execAsync = promisify(exec);

export async function getCurrentBranch(): Promise<string> {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  const command = "git branch --show-current";

  if (!workspaceFolder) {
    throw new Error("Workspace is not found");
  }
  try {
    const { stdout } = await execAsync(command, {
      cwd: workspaceFolder.uri.fsPath,
    });
    return stdout;
  } catch (err) {
    throw new Error("Failed to get current branch");
  }
}
