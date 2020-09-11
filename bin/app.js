Object.defineProperty(exports, "__esModule", { value: true });
exports.start = void 0;
const child_process_1 = require("child_process");
function isGitInstalled() {
    try {
        const result = child_process_1.execSync("git --version", { encoding: "utf-8" });
        return !!(result === null || result === void 0 ? void 0 : result.length);
    }
    catch (error) {
        return false;
    }
}
function isDirectoryAGitRepository() {
    try {
        const result = child_process_1.execSync("git rev-parse --is-inside-work-tree 2>/dev/null", {
            encoding: "utf-8",
        });
        return !!result;
    }
    catch (error) {
        return false;
    }
}
function fetchRemote() {
    try {
        const result = child_process_1.execSync("git fetch -ap", { encoding: "utf-8" });
    }
    catch (error) {
        return false;
    }
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
        console.log(error);
    }
}
function listGitRemoteBranches() {
    try {
        const result = child_process_1.execSync("git branch -r", { encoding: "utf-8" });
        const listOfBranches = result.split("\n");
        const branches = [];
        listOfBranches.forEach((item) => {
            const trimmed = item.trim();
            const matched = trimmed.match(/(?!origin\/HEAD\s.*)^origin\/.*/);
            if (matched) {
                branches.push(matched[0].replace(/^origin\//, ""));
            }
        });
        return branches;
    }
    catch (error) {
        console.log("error happened");
    }
}
function listGitLocalBranches() {
    try {
        const result = child_process_1.execSync("git branch --merged", { encoding: "utf-8" });
        const listOfBranches = result.split("\n");
        const branches = [];
        let current = "";
        listOfBranches.forEach((item) => {
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
        return { current, branches: branches.filter((item) => item.length > 0) };
    }
    catch (error) {
        return {};
    }
}
async function start() {
    const defaultBranch = getRemoteHead();
    const remoteBranches = listGitRemoteBranches();
    const { current, branches } = listGitLocalBranches();
    const remoteFiltered = remoteBranches.filter((item) => item !== defaultBranch);
    const localFiltered = branches.filter((item) => {
        return current !== item && defaultBranch !== item;
    });
    const unique = localFiltered.filter((item) => remoteFiltered.indexOf(item) === -1);
    console.log("Branches to delete");
    unique.forEach((item) => {
        console.log(`${item}`);
    });
}
exports.start = start;
