#!/usr/bin/env node
import { type, platform } from "os";
import { start } from "./app";

console.log(type());
console.log(platform());
console.log(process.env);
