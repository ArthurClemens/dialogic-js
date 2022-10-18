export declare type TPrompt = {
    el?: HTMLElement;
    mounted: () => void;
    init: (command: Command) => void;
    toggle: (command: Command) => void;
    show: (command: Command) => void;
    hide: (command: Command) => void;
};
declare type Command = 
/**
 * HTML selector
 */
string
/**
 * HTML element
 */
 | HTMLElement;
export declare const Prompt: TPrompt;
declare global {
    interface Window {
        Prompt?: TPrompt;
    }
}
export {};
