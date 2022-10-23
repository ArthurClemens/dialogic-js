declare type Command = 
/**
 * HTML selector
 */
string
/**
 * HTML element
 */
 | HTMLElement;
declare type MaybeHTMLElement = HTMLElement | null;
declare type PromptElements = {
    content: HTMLElement;
    root: HTMLElement;
    isDetails: boolean;
    isModal: boolean;
    isEscapable?: boolean;
    isFocusFirst?: boolean;
    touchLayer?: MaybeHTMLElement;
    toggle?: MaybeHTMLElement;
    escapeListener: (e: KeyboardEvent) => void;
    firstFocusable?: HTMLElement;
};
export declare type Options = {
    willShow?: (elements?: PromptElements) => void;
    didShow?: (elements?: PromptElements) => void;
    willHide?: (elements?: PromptElements) => void;
    didHide?: (elements?: PromptElements) => void;
};
export declare type TPrompt = {
    el?: MaybeHTMLElement;
    mounted: () => void;
    init: (command: Command) => void;
    toggle: (command: Command, options?: Options) => void;
    show: (command: Command, options?: Options) => void;
    hide: (command: Command, options?: Options) => void;
};
export declare const Prompt: TPrompt;
declare global {
    interface Window {
        Prompt?: TPrompt;
    }
}
export {};
