#!/usr/bin/env node
/**
 * PostToolUse hook: ensures timestamps in scratch.md and .claude/memory/** are UTC.
 *
 * Claude runs `date '+%Y-%m-%d %H:%M'` which outputs local time. This hook
 * intercepts Write/Edit operations on relevant files and replaces any timestamp
 * written within the last 5 minutes with its UTC equivalent.
 */

import fs from 'fs';

let input = '';
process.stdin.on('data', chunk => (input += chunk));
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const filePath = data.tool_input?.file_path;

    if (!filePath) process.exit(0);

    const norm = filePath.replace(/\\/g, '/');
    if (!norm.includes('.claude/scratch.md') && !norm.includes('.claude/memory/')) {
      process.exit(0);
    }

    if (!fs.existsSync(filePath)) process.exit(0);

    const now = new Date();

    const utcStr = [
      now.getUTCFullYear(),
      String(now.getUTCMonth() + 1).padStart(2, '0'),
      String(now.getUTCDate()).padStart(2, '0'),
    ].join('-') + ' ' + [
      String(now.getUTCHours()).padStart(2, '0'),
      String(now.getUTCMinutes()).padStart(2, '0'),
    ].join(':');

    let content = fs.readFileSync(filePath, 'utf8');

    // Matches: <!-- agent: <name> | <task> | YYYY-MM-DD HH:MM -->
    const re = /(<!--\s*agent:[^|]+\|[^|]+\|\s*)(\d{4}-\d{2}-\d{2} \d{2}:\d{2})(\s*-->)/g;

    let modified = false;
    const updated = content.replace(re, (match, prefix, timestamp, suffix) => {
      // Parse timestamp as local time explicitly
      const [datePart, timePart] = timestamp.trim().split(' ');
      const [y, mo, d] = datePart.split('-').map(Number);
      const [h, m] = timePart.split(':').map(Number);
      const tsLocal = new Date(y, mo - 1, d, h, m);

      // If within 5 minutes of now → was just written → replace with UTC
      if (Math.abs(now - tsLocal) < 5 * 60 * 1000) {
        modified = true;
        return `${prefix}${utcStr}${suffix}`;
      }
      return match;
    });

    if (modified) fs.writeFileSync(filePath, updated, 'utf8');

    process.exit(0);
  } catch (_) {
    // Never block Claude on hook errors
    process.exit(0);
  }
});
