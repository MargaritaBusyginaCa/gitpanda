import * as vscode from "vscode";
import {
  runGitCommand,
  deleteCurrentBranch,
  deleteAllMergedBranches,
  shipAll,
} from "./services/git-service";
import { copyBranchName } from "./utils/ui-utils";

const menuOptions = [
  "Copy Branch Name",
  "Delete Current Branch",
  "Delete All Merged Branches",
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
  myStatusBarItem.tooltip = "Click to view available git branch tools";
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
          await copyBranchName();
        },
        "Delete Current Branch": async () => {
          await deleteCurrentBranch();
        },
        "Delete All Merged Branches": async () => {
          await deleteAllMergedBranches();
        },
        "Git Ship All": async () => {
          await shipAll();
        },
        "Branch Info": async () => {
          const status = (await runGitCommand("git status")).trim();
          const branchAge = (
            await runGitCommand("git log --pretty=format:'%ar' -1")
          ).trim();
          vscode.window.showInformationMessage(
            `Branch info retrieved. Check output for details.`,
          );
          output.appendLine("Branch info:");
          output.appendLine(status);
          output.appendLine(`Branch created: ${branchAge}`);
          output.show(true);
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
