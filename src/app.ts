import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);
export async function start() {
  await execAsync("ls -a");
  const result = await execAsync("git branch");
  console.log(result);
}
