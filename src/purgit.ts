#!/usr/bin/env node

import { dryRunStart, start } from "./app";
import yargs from "yargs";

(async () => {
  try {
    const args = yargs.usage("Usage: $0 [options]").option("dry-run", {
      alias: "d",
      type: "boolean",
      default: false,
      description: "A rehearsal, no side effects",
    }).argv;

    if (args["dry-run"]) {
      await dryRunStart(args);
      process.exit(0);
    } else {
      await start(args);
      process.exit(0);
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
