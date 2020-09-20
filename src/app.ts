import { execSync } from "child_process";
import inquirer from "inquirer";
import constants from "./constants";

function exitForErrorGraciously(error) {
  console.error(error);
  process.exit(1);
}

function safely<T>(callback: (...args) => T, ...args) {
  try {
    const result = callback(...args);
    return result;
  } catch (error) {
    exitForErrorGraciously(error);
  }
}

function run(command: string): string {
  return execSync(command, { encoding: "utf-8" });
}

export function gitReady(): boolean {
  const result = safely(run, "git --version");
  return !!result?.match(/git version \d\.\d+\.\d/);
}

export function directoryIsGitRepository(): boolean {
  const result = safely(run, "git rev-parse --is-inside-work-tree");
  return !!result?.match(/true/);
}

function fetchRemote() {
  return safely(run, "git fetch -ap");
}

function getRemoteHeadRef() {
  const result = safely(run, "git branch -r");
  const regex = /origin\/HEAD\s.*/;
  const line = result?.match(regex)[0];
  const remoteBranch = line?.match(/(?!origin\/HEAD\s\S\S\s)origin\/master/)[0];
  const branch = remoteBranch?.replace(/^origin\//, "");
  return branch;
}

function listGitRemoteBranches() {
  const result = safely(run, "git branch -r");
  const listOfBranches = result?.split("\n");
  const branches: Array<string> = [];
  listOfBranches.forEach(item => {
    const trimmed = item.trim();
    const matched = trimmed.match(/(?!origin\/HEAD\s.*)^origin\/.*/);
    if (matched) {
      branches.push(matched[0]?.replace(/^origin\//, ""));
    }
  });
  return branches;
}

function listGitLocalBranches() {
  const result = safely(run, "git branch --merged");
  const listOfBranches = result?.split("\n");
  const branches: Array<string> = [];
  let current = "";
  listOfBranches.forEach(item => {
    const trimmed = item.trim();
    const split = trimmed.split(" ");
    if (split.length > 1) {
      current = split[1];
      branches.push(split[1]);
    } else {
      branches.push(trimmed);
    }
  });
  return { current, branches: branches.filter(item => item.length > 0) };
}

function getMergedBranchestoDelete(
  defaultBranch: string,
  currentBranch: string,
  remoteBranches: Array<string>,
  localBranches: Array<string>
) {
  const remoteFiltered = remoteBranches.filter(item => item !== defaultBranch);
  const localFiltered = localBranches.filter(item => {
    return currentBranch !== item && defaultBranch !== item;
  });

  const unique = localFiltered.filter(
    item => remoteFiltered.indexOf(item) === -1
  );
  return unique;
}

function deleteBranch(branch: string) {
  safely(run, `git branch -d ${branch}`);
}

async function promptForConfirmation() {
  const response = await inquirer.prompt([
    {
      type: "confirm",
      name: "continue",
      message: "Continue with purge?",
      default: () => "Y",
    },
  ]);
  return response?.continue;
}

function prepareEnvironment() {
  if (!gitReady()) {
    console.log(constants.ERROR_MESSAGE_GIT_NOT_READY);
    return;
  }
  if (!directoryIsGitRepository()) {
    console.log(constants.ERROR_MESSAGE_DIR_NOT_REPO);
    return;
  }
  fetchRemote();
}

async function completePurge(branchesToDelete: Array<string>) {
  const shouldContinue = await safely(promptForConfirmation);
  if (!shouldContinue) {
    return;
  }
  for (const branch of branchesToDelete) {
    deleteBranch(branch);
    console.log(`deleted '${branch}'`);
  }
}

export async function start(dryRun: boolean): Promise<void> {
  prepareEnvironment();
  const defaultBranch = getRemoteHeadRef();
  const remoteBranches = listGitRemoteBranches();
  const { current, branches } = listGitLocalBranches();

  const branchesToDelete = getMergedBranchestoDelete(
    defaultBranch,
    current,
    remoteBranches,
    branches
  );

  if (branchesToDelete.length === 0) {
    console.log("\nNo branches to purge\n");
    process.exit();
  }

  console.log("\nThe following branches will be purged\n");
  branchesToDelete.forEach(branch => {
    console.log(`- ${branch}`);
  });

  if (dryRun) {
    return;
  }

  await completePurge(branchesToDelete);
}
