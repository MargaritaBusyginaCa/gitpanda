import * as vscode from "vscode";
import {
  runGitCommand,
  deleteCurrentBranch,
  deleteAllMergedBranches,
} from "./services/git-service";

const menuOptions = [
  "Copy Branch Name",
  "Delete Current Branch",
  "Delete All Merged Branches",
  "Git Ship",
  "Git Ship All",
  "Branch Info",
];
export function activate(context: vscode.ExtensionContext) {
  console.log("Gitpanda is now active!");

  const output = vscode.window.createOutputChannel("GitPanda");
  context.subscriptions.push(output);

  // Create the status bar item
  const myStatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100,
  );

  // Set properties
  myStatusBarItem.text = `$(sparkle) Branch tools`;
  myStatusBarItem.tooltip = "Click to view available branch tools";
  myStatusBarItem.command = "gitpanda.statusBarHandler";

  // Add the status bar item to the extension's subscriptions to be disposed of correctly
  context.subscriptions.push(myStatusBarItem);

  myStatusBarItem.show();

  let statusBarHandler = vscode.commands.registerCommand(
    "gitpanda.statusBarHandler",
    async () => {
      const selection = await vscode.window.showQuickPick(menuOptions, {
        placeHolder: "Select a branch tool",
      });

      if (!selection) {
        return;
      }

      // Define handlers for each menu option
      // Created a dictionary to map options to their handlers
      // Record<K, V> is a TypeScript utility type that defines an object type with keys of type K and values of type V
      const handlers: Record<string, () => Promise<void>> = {
        "Copy Branch Name": async () => {
          const branch = (
            await runGitCommand("git branch --show-current")
          ).trim();
          await vscode.env.clipboard.writeText(branch);
          vscode.window.showInformationMessage(
            "Branch name was copied to clipboard",
          );
        },
        "Branch Info": async () => {
          const status = (await runGitCommand("git status")).trim();
          vscode.window.showInformationMessage(`Status: ${status}`);
          output.appendLine("git status:");
          output.appendLine(status);
          output.show(true);
        },
        "Delete Current Branch": async () => {
          await deleteCurrentBranch();
        },
        "Delete All Merged Branches": async () => {
          // const status = (await runGitCommand("git branch --merged")).trim();
          // vscode.window.showInformationMessage(`Status: ${status}`);
          // output.appendLine("git status:");
          // output.appendLine(status);
          // output.show(true);
          await deleteAllMergedBranches();
        },
        "Git Ship": async () => {
          vscode.window.showWarningMessage("Git Ship is not implemented yet.");
        },
        "Git Ship All": async () => {
          vscode.window.showWarningMessage(
            "Git Ship All is not implemented yet.",
          );
        },
      };

      const handler = handlers[selection];
      if (!handler) {
        vscode.window.showErrorMessage(`Unknown option: ${selection}`);
        return;
      }

      try {
        await handler();
      } catch (err) {
        vscode.window.showErrorMessage(String(err));
      }
    },
  );

  context.subscriptions.push(statusBarHandler);
}

// This method is called when your extension is deactivated
export function deactivate() {}
