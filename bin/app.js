Object.defineProperty(exports, "__esModule", { value: true });
exports.start = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = util_1.promisify(child_process_1.exec);
async function start() {
    const result = await execAsync("git branch");
    console.log(result);
}
exports.start = start;
