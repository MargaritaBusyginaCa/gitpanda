import * as vscode from "vscode";
import { runGitCommand } from "../services/git-service";
import { extractTicketId } from "./ticket-utils";

export async function copyBranchName(): Promise<void> {
  const branch = (await runGitCommand("git branch --show-current")).trim();
  await vscode.env.clipboard.writeText(branch);
  vscode.window.showInformationMessage("Branch name was copied to clipboard");
}

export async function getCommitMessage() {
  const ticketId = await extractTicketId();
  const result = await vscode.window.showInputBox({
    value: ticketId ?? "",
    placeHolder: "ex: Changed typescript version",
    prompt: "Enter your commit message",
    ignoreFocusOut: true,
  });

  if (result !== undefined) {
    if (result.trim() === "") {
      vscode.window.showErrorMessage("Commit message cannot be empty.");
      return;
    } else if (result.length > 72) {
      vscode.window.showErrorMessage(
        "Commit message is too long (max 72 characters).",
      );
      return;
    } else {
      return result;
    }
  } else {
    return null;
  }
}
