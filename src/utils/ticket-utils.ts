import { runGitCommand } from "../services/git-service";

export async function extractTicketId() {
  const currentBranch = (
    await runGitCommand("git branch --show-current")
  ).trim();

  const regex = /\b[A-Z]{2,10}-\d+\b/i;
  const ticketId = currentBranch.match(regex);
  return ticketId?.[0] ?? null;
}
