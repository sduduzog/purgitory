var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = exports.directoryIsGitRepository = exports.gitReady = void 0;
const child_process_1 = require("child_process");
const inquirer_1 = __importDefault(require("inquirer"));
const constants_1 = __importDefault(require("./constants"));
function exitForErrorGraciously(error) {
    console.error(error);
    process.exit(1);
}
function safely(callback, ...args) {
    try {
        const result = callback(...args);
        return result;
    }
    catch (error) {
        exitForErrorGraciously(error);
    }
}
function run(command) {
    return child_process_1.execSync(command, { encoding: "utf-8" });
}
function gitReady() {
    const result = safely(run, "git --version");
    return !!(result === null || result === void 0 ? void 0 : result.match(/git version \d\.\d+\.\d/));
}
exports.gitReady = gitReady;
function directoryIsGitRepository() {
    const result = safely(run, "git rev-parse --is-inside-work-tree");
    return !!(result === null || result === void 0 ? void 0 : result.match(/true/));
}
exports.directoryIsGitRepository = directoryIsGitRepository;
function fetchRemote() {
    return safely(run, "git fetch -ap");
}
function getRemoteHeadRef() {
    const result = safely(run, "git branch -r");
    const regex = /origin\/HEAD\s.*/;
    const line = result === null || result === void 0 ? void 0 : result.match(regex)[0];
    const remoteBranch = line === null || line === void 0 ? void 0 : line.match(/(?!origin\/HEAD\s\S\S\s)origin\/master/)[0];
    const branch = remoteBranch === null || remoteBranch === void 0 ? void 0 : remoteBranch.replace(/^origin\//, "");
    return branch;
}
function listGitRemoteBranches() {
    const result = safely(run, "git branch -r");
    const listOfBranches = result === null || result === void 0 ? void 0 : result.split("\n");
    const branches = [];
    listOfBranches.forEach(item => {
        var _a;
        const trimmed = item.trim();
        const matched = trimmed.match(/(?!origin\/HEAD\s.*)^origin\/.*/);
        if (matched) {
            branches.push((_a = matched[0]) === null || _a === void 0 ? void 0 : _a.replace(/^origin\//, ""));
        }
    });
    return branches;
}
function listGitLocalBranches() {
    const result = safely(run, "git branch --merged");
    const listOfBranches = result === null || result === void 0 ? void 0 : result.split("\n");
    const branches = [];
    let current = "";
    listOfBranches.forEach(item => {
        const trimmed = item.trim();
        const split = trimmed.split(" ");
        if (split.length > 1) {
            current = split[1];
            branches.push(split[1]);
        }
        else {
            branches.push(trimmed);
        }
    });
    return { current, branches: branches.filter(item => item.length > 0) };
}
function getMergedBranchestoDelete(defaultBranch, currentBranch, remoteBranches, localBranches) {
    const remoteFiltered = remoteBranches.filter(item => item !== defaultBranch);
    const localFiltered = localBranches.filter(item => {
        return currentBranch !== item && defaultBranch !== item;
    });
    const unique = localFiltered.filter(item => remoteFiltered.indexOf(item) === -1);
    return unique;
}
function deleteBranch(branch) {
    safely(run, `git branch -d ${branch}`);
}
async function promptForConfirmation() {
    const response = await inquirer_1.default.prompt([
        {
            type: "confirm",
            name: "continue",
            message: "Continue with purge?",
            default: () => "Y",
        },
    ]);
    return response === null || response === void 0 ? void 0 : response.continue;
}
function prepareEnvironment() {
    if (!gitReady()) {
        console.log(constants_1.default.ERROR_MESSAGE_GIT_NOT_READY);
        return;
    }
    if (!directoryIsGitRepository()) {
        console.log(constants_1.default.ERROR_MESSAGE_DIR_NOT_REPO);
        return;
    }
    fetchRemote();
}
async function completePurge(branchesToDelete) {
    const shouldContinue = await safely(promptForConfirmation);
    if (!shouldContinue) {
        return;
    }
    for (const branch of branchesToDelete) {
        deleteBranch(branch);
        console.log(`deleted '${branch}'`);
    }
}
async function start(dryRun) {
    prepareEnvironment();
    const defaultBranch = getRemoteHeadRef();
    const remoteBranches = listGitRemoteBranches();
    const { current, branches } = listGitLocalBranches();
    const branchesToDelete = getMergedBranchestoDelete(defaultBranch, current, remoteBranches, branches);
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
exports.start = start;
