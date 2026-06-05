export const H2_PATTERN = /^## /;

export const ENTRY_PATTERN = /^### /;

// Time is grabbed straight after `### ` so a hand-edited separator still parses.
export const ENTRY_TIME_PATTERN = /^###\s+(\d{1,2}:\d{2})/;

export const ENTRY_HEADING_PATTERN = /^###\s+(\d{1,2}:\d{2})\s*—\s*(.*)$/u;

export const CLOCK_PATTERN = /^(\d{1,2}):(\d{2})$/;

// An Obsidian embed line: `![[Attachments/2026-05-26-1315-meal.jpg]]`.
export const EMBED_PATTERN = /^!\[\[(.+)\]\]$/;
