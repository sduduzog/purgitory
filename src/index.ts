#!/usr/bin/env node

import { start } from "./app";

start();

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
