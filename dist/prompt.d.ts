type Command = 
/**
 * HTML selector
 */
string
/**
 * HTML element
 */
 | HTMLElement;
type MaybeHTMLElement = HTMLElement | null;
type PromptElements = {
    content: HTMLElement;
    root: HTMLElement;
    isDetails: boolean;
    isModal: boolean;
    isEscapable?: boolean;
    isFocusFirst?: boolean;
    focusFirstSelector?: string;
    touchLayer?: MaybeHTMLElement;
    toggle?: MaybeHTMLElement;
    escapeListener: (e: KeyboardEvent) => void;
    firstFocusable?: HTMLElement;
};
export type Options = {
    willShow?: (elements?: PromptElements) => void;
    didShow?: (elements?: PromptElements) => void;
    willHide?: (elements?: PromptElements) => void;
    didHide?: (elements?: PromptElements) => void;
    isIgnoreLockDuration?: boolean;
};
export type TPrompt = {
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
