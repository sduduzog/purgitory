#!/usr/bin/env node

import { dryRunStart, start } from "./app";
import yargs from "yargs";

const args = yargs.usage("Usage: $0 [options]").option("dry-run", {
  alias: "d",
  type: "boolean",
  default: false,
  description: "A rehearsal, no side effects",
}).argv;

if (args["dry-run"]) {
  dryRunStart(args).finally(() => process.exit(0));
} else {
  start(args).finally(() => process.exit(0));
}
