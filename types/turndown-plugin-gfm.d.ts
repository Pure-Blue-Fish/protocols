// ABOUTME: Type declarations for turndown-plugin-gfm
// ABOUTME: Plugin adds GFM table/strikethrough support to Turndown

declare module "turndown-plugin-gfm" {
  import TurndownService from "turndown";
  export function gfm(turndownService: TurndownService): void;
  export function tables(turndownService: TurndownService): void;
  export function strikethrough(turndownService: TurndownService): void;
  export function taskListItems(turndownService: TurndownService): void;
}
