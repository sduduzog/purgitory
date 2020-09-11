#!/usr/bin/env node
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
app_1.start();
/**
 * check if git installed
 * check if current directory is repository
 * fetch latest
 * get head branch
 * get merged branches
 *  if still remote, then ignore
 *  if current, then ignore
 *  else delete
 */
const regex = /(?!origin\/HEAD\s.*)^origin\/.*/gm; // excluding
