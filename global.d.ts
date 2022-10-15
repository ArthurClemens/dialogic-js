import type { TPrompt } from "./src";
export {};

declare global {
  interface Window {
    Prompt?: TPrompt;
  }
}
