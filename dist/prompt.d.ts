export declare type TPrompt = {
    el?: HTMLElement;
    inited?: boolean;
    mounted: () => void;
    init: (command: Command) => void;
    toggle: (command: Command) => void;
    show: (command: Command) => void;
    hide: (command: Command) => void;
};
export declare const Prompt: TPrompt;
declare type Command = 
/**
 * HTML selector
 */
string
/**
 * HTML element
 */
 | HTMLElement;
export {};
