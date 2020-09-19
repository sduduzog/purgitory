#!/usr/bin/env node
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const yargs_1 = __importDefault(require("yargs"));
const args = yargs_1.default.usage("Usage: $0 [options]").option("dry-run", {
    alias: "d",
    type: "boolean",
    default: false,
    description: "A rehearsal, no side effects",
}).argv;
if (args["dry-run"]) {
    app_1.dryRunStart(args).finally(() => process.exit(0));
}
else {
    app_1.start(args).finally(() => process.exit(0));
}
