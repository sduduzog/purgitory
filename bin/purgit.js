#!/usr/bin/env node
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const yargs_1 = __importDefault(require("yargs"));
(async () => {
    try {
        const args = yargs_1.default.usage("Usage: $0 [options]").option("dry-run", {
            alias: "d",
            type: "boolean",
            default: false,
            description: "A rehearsal, no side effects",
        }).argv;
        await app_1.start(args.dryRun);
        process.exit(0);
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
})();
