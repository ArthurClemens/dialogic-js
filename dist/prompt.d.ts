import { CachedDataset } from './util';
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
    prompt: TPrompt;
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
    clickTouchLayerListener: (e: MouseEvent) => void;
    clickToggleListener: (e: Event) => void;
    firstFocusable?: HTMLElement;
};
export type PromptStatus = {
    isOpen: boolean;
    willShow: boolean;
    didShow: boolean;
    willHide: boolean;
    didHide: boolean;
};
export type Options = {
    willShow?: (elements?: PromptElements) => void;
    didShow?: (elements?: PromptElements) => void;
    willHide?: (elements?: PromptElements) => void;
    didHide?: (elements?: PromptElements) => void;
    getStatus?: (status: PromptStatus) => void;
    isIgnoreLockDuration?: boolean;
};
export type TPrompt = {
    el?: MaybeHTMLElement;
    init: (command: Command) => void;
    toggle: (command: Command, options?: Options) => void;
    show: (command: Command, options?: Options) => void;
    hide: (command: Command, options?: Options) => void;
    options?: Options;
    /**
     * Phoenix LiveView callback.
     */
    mounted: () => void;
    /**
     * Phoenix LiveView callback.
     */
    beforeUpdate: () => void;
    /**
     * Phoenix LiveView callback.
     */
    updated: () => void;
    /**
     * Phoenix LiveView callback.
     */
    destroyed: () => void;
    status: PromptStatus;
    /**
     * Phoenix LiveView specific.
     * Cached values of the dataset values of the root element, so that the state can be restored after an update.
     */
    _cache: CachedDataset;
};
export declare const Prompt: TPrompt;
declare global {
    interface Window {
        Prompt?: TPrompt;
    }
}
export {};
