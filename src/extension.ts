import * as vscode from "vscode";
import {
  runGitCommand,
  deleteCurrentBranch,
  deleteAllMergedBranches,
  shipAll,
  getBranchInfo,
} from "./services/git-service";
import { copyBranchName } from "./utils/ui-utils";

const menuOptions: vscode.QuickPickItem[] = [
  {
    label: "Copy Branch Name",
    description: "Copy the current branch name to clipboard",
  },
  {
    label: "Delete Current Branch",
    description: "Delete the current branch (with safety checks)",
  },
  {
    label: "Delete All Merged Branches",
    description:
      "Delete all local branches that have been merged (except main/master/develop)",
  },
  {
    label: "Git Ship All",
    description:
      "Stage all changes, create a commit, and push to the current branch",
  },
  {
    label: "Branch Info",
    description: "Show current branch status and age in the output panel",
  },
];
export async function activate(context: vscode.ExtensionContext) {
  console.log("Gitpanda is now active!");

  const output = vscode.window.createOutputChannel("GitPanda");
  context.subscriptions.push(output);

  try {
    await runGitCommand("git status");
  } catch (err) {
    output.appendLine(`Error running git status: ${String(err)}`);
    vscode.window.showInformationMessage(
      "Gitpanda didn't find a git repository associated with this workspace.",
    );
    return;
  }

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
          const branchInfo = await getBranchInfo();
          output.appendLine("Branch info:");
          output.appendLine(`Status: ${branchInfo.status}`);
          output.appendLine(`Last commit: ${branchInfo.lastCommitInfo}`);
          output.show(true);
        },
      };

      const handler = handlers[selection.label];
      if (!handler) {
        vscode.window.showErrorMessage(`Unknown option: ${selection.label}`);
        return;
      }

      try {
        await handler();
      } catch (err) {
        vscode.window.showErrorMessage(String(err));
      }
    },
  );

  let copyBranchNameDisposable = vscode.commands.registerCommand(
    "gitpanda.copy",
    async () => {
      await copyBranchName();
    },
  );

  let deleteBranchNameDisposable = vscode.commands.registerCommand(
    "gitpanda.deleteCurrentBranch",
    async () => {
      await deleteCurrentBranch();
    },
  );
  let deleteMergedBranchesDisposable = vscode.commands.registerCommand(
    "gitpanda.deleteMergedBranches",
    async () => {
      await deleteAllMergedBranches();
    },
  );
  let shipAllDisposable = vscode.commands.registerCommand(
    "gitpanda.shipAll",
    async () => {
      await shipAll();
    },
  );
  let branchInfoDisposable = vscode.commands.registerCommand(
    "gitpanda.branchInfo",
    async () => {
      const branchInfo = await getBranchInfo();
      output.appendLine("Branch info:");
      output.appendLine(`Status: ${branchInfo.status}`);
      output.appendLine(`Last commit: ${branchInfo.lastCommitInfo}`);
      output.show(true);
    },
  );

  context.subscriptions.push(copyBranchNameDisposable);
  context.subscriptions.push(deleteBranchNameDisposable);
  context.subscriptions.push(deleteMergedBranchesDisposable);
  context.subscriptions.push(shipAllDisposable);
  context.subscriptions.push(branchInfoDisposable);
}

export function deactivate() {}
