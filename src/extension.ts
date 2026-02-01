import * as vscode from "vscode";
import { getCurrentBranch } from "./services/git-service";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "gitpanda" is now active!');

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
    () => {
      vscode.window
        .showQuickPick(
          [
            "Copy Branch",
            "Delete Current Branch",
            "Delete Merged Branches",
            "Git Ship",
          ],
          { placeHolder: "Select a branch tool" },
        )
        .then((selection) => {
          if (selection) {
            getCurrentBranch().then((branch) => {
              vscode.window.showInformationMessage(`Current branch: ${branch}`);
            });
            vscode.window.showInformationMessage(`You selected: ${selection}`);
          }
        });
    },
  );

  const disposable = vscode.commands.registerCommand(
    "gitpanda.helloWorld",
    () => {
      vscode.window.showInformationMessage("Hello World from gitpanda!");
    },
  );

  context.subscriptions.push(statusBarHandler);
  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
