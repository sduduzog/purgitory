var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = void 0;
const util_1 = require("util");
const child_process_1 = require("child_process");
const inquirer_1 = __importStar(require("inquirer"));
const execAsync = util_1.promisify(child_process_1.exec);
const loader = ["\\", "|", "/", "-"];
let loading = false;
let i = 4;
let loaderMessage = "";
const bottomBar = new inquirer_1.ui.BottomBar({ bottomBar: loader[1 % 4] });
function startLoader() {
    if (loading)
        return;
    loading = true;
    updateBottonBar();
}
function stopLoader() {
    loading = false;
}
function updateBottonBar(message) {
    if (message) {
        loaderMessage = message;
        bottomBar.updateBottomBar(message);
    }
    if (!loading)
        return;
    bottomBar.updateBottomBar(`${loader[i++ % 4]} ${loaderMessage}`);
    setTimeout(updateBottonBar, 100);
}
function exitForErrorGraciously(error) {
    console.error(error);
    process.exit(1);
}
async function safeRun(callback, useLoader, ...args) {
    if (useLoader) {
        startLoader();
    }
    const result = await callback(args);
    stopLoader();
    return result;
}
async function checkGitInstalled() {
    await execAsync("git --version", { encoding: "utf-8" });
}
async function checkDirectoryIsGitRepository() {
    const result = await execAsync("git rev-parse --is-inside-work-tree 2>/dev/null", {
        encoding: "utf-8",
    });
    const notAGitRepository = !result.stdout;
    if (notAGitRepository) {
        const path = process.cwd();
        const paths = path.split("/");
        const folder = paths[paths.length - 1];
        const issuesUrl = "https://github.com/sduduzog/purgitory/issues";
        console.log(`${folder} doesn't seem to be a git repository.`);
        console.log(`if this is false, report is as a bug ${issuesUrl}`);
        process.exit(0);
    }
}
async function fetchRemote() {
    await execAsync("git fetch -ap", { encoding: "utf-8" });
}
function getRemoteHead() {
    try {
        const result = child_process_1.execSync("git branch -r", { encoding: "utf-8" });
        const regex = /origin\/HEAD\s.*/;
        const line = result.match(regex)[0];
        const remoteBranch = line.match(/(?!origin\/HEAD\s\S\S\s)origin\/master/)[0];
        const branch = remoteBranch.replace(/^origin\//, "");
        return branch;
    }
    catch (error) {
        exitForErrorGraciously(error);
    }
}
async function listGitRemoteBranches() {
    const result = await execAsync("git branch -r", { encoding: "utf-8" });
    const listOfBranches = result.stdout.split("\n");
    const branches = [];
    listOfBranches.forEach(item => {
        const trimmed = item.trim();
        const matched = trimmed.match(/(?!origin\/HEAD\s.*)^origin\/.*/);
        if (matched) {
            branches.push(matched[0].replace(/^origin\//, ""));
        }
    });
    return branches;
}
async function listGitLocalBranches() {
    const result = await execAsync("git branch --merged", { encoding: "utf-8" });
    const listOfBranches = result.stdout.split("\n");
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
async function deleteBranch(branch) {
    await execAsync(`git branch -d ${branch}`, { encoding: "utf-8" });
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
async function start(args) {
    const dryRun = args["dry-run"];
    await safeRun(checkGitInstalled);
    await safeRun(checkDirectoryIsGitRepository);
    updateBottonBar("fetching femote branches");
    await safeRun(fetchRemote, true);
    updateBottonBar("done\n");
    updateBottonBar("getting default branch (origin/HEAD) from remote");
    const defaultBranch = await safeRun(getRemoteHead, true);
    updateBottonBar("done: getting default branch");
    const remoteBranches = await safeRun(listGitRemoteBranches);
    const { current, branches } = await safeRun(listGitLocalBranches);
    if (current !== defaultBranch) {
        console.log(`${current} is currently checked out and will not be included\n`);
    }
    const branchesToDelete = getMergedBranchestoDelete(defaultBranch, current, remoteBranches, branches);
    if (branchesToDelete.length === 0) {
        console.log("No branches to delete, exiting");
        process.exit();
    }
    console.log("The following branches will be purged\n\n");
    branchesToDelete.forEach(branch => {
        console.log(`  ${branch}`);
    });
    console.log("\n");
    const shouldContinue = await safeRun(promptForConfirmation);
    if (shouldContinue) {
        for (const branch of branchesToDelete) {
            if (!dryRun) {
                await safeRun(deleteBranch, null, branch);
            }
            console.log("deleted", branch);
        }
    }
    process.exit();
}
exports.start = start;
