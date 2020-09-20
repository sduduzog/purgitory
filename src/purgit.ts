#!/usr/bin/env node

import { start } from "./app";
import yargs from "yargs";

(async () => {
  try {
    const args = yargs.usage("Usage: $0 [options]").option("dry-run", {
      alias: "d",
      type: "boolean",
      default: false,
      description: "A rehearsal, no side effects",
    }).argv;

    await start(args.dryRun as boolean);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
