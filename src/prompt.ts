import {
  applyDataset,
  CachedDataset,
  clearDataset,
  getDuration,
  getFirstFocusable,
  isVisible,
  readDataset,
  repaint,
  storeDataset,
  wait,
} from './util';

type Command =
  /**
   * HTML selector
   */
  | string
  /**
   * HTML element
   */
  | HTMLElement;

enum MODE {
  SHOW,
  HIDE,
  TOGGLE,
}

type MaybeHTMLElement = HTMLElement | null;

type PromptElements = {
  backdropLayer?: MaybeHTMLElement;
  clickToggleListener: (e: Event) => void;
  clickTouchLayerListener: (e: MouseEvent) => void;
  content: HTMLElement;
  escapeListener: (e: KeyboardEvent) => void;
  firstFocusable?: HTMLElement;
  focusFirstSelector?: string;
  isDetails: boolean;
  isEscapable?: boolean;
  isFocusFirst?: boolean;
  isMenuContent: boolean;
  isModal: boolean;
  keyDownListenerElement: HTMLElement;
  prompt: TPrompt;
  root: HTMLElement;
  toggle?: MaybeHTMLElement;
  touchLayer?: MaybeHTMLElement;
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
  transitionDuration?: number;
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

// Element selectors
const ROOT_SELECTOR = '[data-prompt]';
const CONTENT_SELECTOR = '[data-content]';
const TOUCH_SELECTOR = '[data-touch]';
const BACKDROP_SELECTOR = '[data-backdrop]';
const TOGGLE_SELECTOR = '[data-toggle]';
// Modifier arguments
const IS_MODAL_DATA = 'ismodal';
const IS_ESCAPABLE_DATA = 'isescapable';
const IS_FOCUS_FIRST_DATA = 'isfocusfirst';
const FOCUS_FIRST_SELECTOR_DATA = 'focusfirst';
// Internal state and CSS
const IS_OPEN_DATA = 'isopen';
const IS_LOCKED_DATA = 'islocked';
// Other
const LOCK_DURATION = 300; // Prevent the item from being closed or re-opened when it has just been opened.

const INITIAL_STATUS: PromptStatus = {
  isOpen: false,
  willShow: false,
  didShow: false,
  willHide: false,
  didHide: false,
};

const hideView = async (
  elements: PromptElements,
  options: Options = {} as Options,
) => {
  const {
    content,
    escapeListener,
    isDetails,
    isEscapable,
    keyDownListenerElement,
    prompt,
    root,
  } = elements;

  if (
    root.dataset[IS_LOCKED_DATA] !== undefined &&
    !options.isIgnoreLockDuration
  ) {
    return;
  }

  prompt.status = {
    ...INITIAL_STATUS,
    isOpen: true, // still open while hiding
    willHide: true,
  };

  options.willHide?.(elements);
  options.getStatus?.(prompt.status);

  delete root.dataset[IS_OPEN_DATA];

  const duration = getDuration(content);
  await wait(duration);

  if (isDetails) {
    root.removeAttribute('open');
  }

  /* If dialog element: close */
  if (content.tagName == 'DIALOG') {
    const dialog = content as HTMLDialogElement;
    dialog.close();
    repaint(content);
  }

  prompt.status = {
    ...INITIAL_STATUS,
    didHide: true,
  };
  options.getStatus?.(prompt.status);
  options.didHide?.(elements);

  if (isEscapable) {
    keyDownListenerElement.removeEventListener('keydown', escapeListener);
  }
  // Focus on underlaying prompt
  focusNextPrompt();
};

const showView = async (
  elements: PromptElements,
  options: Options = {} as Options,
) => {
  const {
    content,
    escapeListener,
    focusFirstSelector,
    isDetails,
    isEscapable,
    isFocusFirst,
    keyDownListenerElement,
    prompt,
    root,
  } = elements;
  if (root.dataset[IS_LOCKED_DATA] !== undefined) {
    return;
  }
  root.dataset[IS_LOCKED_DATA] = '';
  setTimeout(() => {
    if (root) {
      delete root.dataset[IS_LOCKED_DATA];
    }
  }, LOCK_DURATION);

  if (isEscapable) {
    keyDownListenerElement.addEventListener('keydown', escapeListener);
  }
  if (isDetails) {
    root.setAttribute('open', '');
    repaint(root);
  }

  root.dataset[IS_OPEN_DATA] = '';
  repaint(root);

  prompt.status = {
    ...INITIAL_STATUS,
    willShow: true,
  };

  options.willShow?.(elements);
  options.getStatus?.(prompt.status);

  const duration = getDuration(content);
  await wait(duration);

  focusFirstElement(content, isFocusFirst, focusFirstSelector);

  prompt.status = {
    ...INITIAL_STATUS,
    didShow: true,
    isOpen: true,
  };

  options.didShow?.(elements);
  options.getStatus?.(prompt.status);
};

const toggleView = async (
  elements: PromptElements,
  mode: MODE = MODE.TOGGLE,
  options?: Options,
) => {
  switch (mode) {
    case MODE.SHOW:
      return await showView(elements, options);
    case MODE.HIDE:
      return await hideView(elements, options);
    default: {
      if (isVisible(elements.content)) {
        return await hideView(elements, options);
      } else {
        return await showView(elements, options);
      }
    }
  }
};

const getElements = (
  prompt: TPrompt,
  promptElement?: MaybeHTMLElement,
  command?: Command,
  options?: Options,
): PromptElements | undefined => {
  let root: MaybeHTMLElement = null;

  if (!command && promptElement) {
    root = promptElement;
  } else if (typeof command === 'string') {
    root = document.querySelector(command);
  } else if (command && !!command.tagName) {
    root = command.closest(ROOT_SELECTOR);
  }

  if (!root) {
    console.error("Prompt element 'data-prompt' not found");
    return undefined;
  }
  const content: MaybeHTMLElement = root.querySelector(CONTENT_SELECTOR);

  if (!content) {
    console.error("Prompt element 'data-content' not found");
    return undefined;
  }

  if (!content.getAttribute('tabIndex')) {
    content.setAttribute('tabIndex', '0');
  }

  const toggle: MaybeHTMLElement =
    root.querySelector(TOGGLE_SELECTOR) || root.querySelector('summary');
  const touchLayer: MaybeHTMLElement = root.querySelector(TOUCH_SELECTOR);
  const backdropLayer: MaybeHTMLElement = root.querySelector(BACKDROP_SELECTOR);
  const isDetails = root.tagName === 'DETAILS';
  const isModal = root.dataset[IS_MODAL_DATA] !== undefined;
  const isEscapable = root.dataset[IS_ESCAPABLE_DATA] !== 'false';
  const isMenuContent = content.getAttribute('aria-role') == 'menu';
  const isFocusFirst = isMenuContent
    ? !!(root.dataset[IS_FOCUS_FIRST_DATA] !== undefined)
    : true;
  const keyDownListenerElement = isMenuContent
    ? (window as unknown as HTMLElement)
    : content;

  const focusFirstSelector = root.dataset[FOCUS_FIRST_SELECTOR_DATA];

  const elements: PromptElements = {
    backdropLayer,
    content,
    focusFirstSelector,
    isDetails,
    isEscapable,
    isFocusFirst,
    isMenuContent,
    isModal,
    keyDownListenerElement,
    prompt,
    root,
    toggle,
    touchLayer,
    escapeListener: function (e: KeyboardEvent) {
      if (e.key === 'Escape') {
        // Only close the top element
        const prompts = [].slice.call(
          document.querySelectorAll(`${ROOT_SELECTOR}[data-${IS_OPEN_DATA}]`),
        );
        const topElement = prompts.reverse()[0];
        if (topElement === elements.root) {
          hideView(elements, { ...options, isIgnoreLockDuration: true });
        }
      }
    },
    clickTouchLayerListener: function (e: MouseEvent) {
      if (e.target !== touchLayer) {
        return;
      }
      if (!isModal) {
        toggleView(elements, MODE.HIDE, options);
      }
    },
    clickToggleListener: function (e: Event) {
      e.preventDefault();
      e.stopPropagation();
      toggleView(elements, undefined, options);
    },
  };
  return elements;
};

const initToggleEvents = (elements: PromptElements) => {
  const { toggle, clickToggleListener } = elements;

  if (toggle && toggle.dataset.registered !== '') {
    toggle.addEventListener('click', clickToggleListener);
    toggle.dataset.registered = '';
  }
};

const initTouchEvents = (elements: PromptElements) => {
  const { clickTouchLayerListener, touchLayer } = elements;

  if (touchLayer && touchLayer.dataset.registered !== '') {
    touchLayer.addEventListener('click', clickTouchLayerListener);
    touchLayer.dataset.registered = '';
  }
};

const focusFirstElement = (
  content: HTMLElement,
  isFocusFirst?: boolean,
  focusFirstSelector?: string,
) => {
  let firstFocusable: HTMLElement | null = null;
  if (focusFirstSelector) {
    firstFocusable = content.querySelector(focusFirstSelector);
  } else if (isFocusFirst) {
    firstFocusable = getFirstFocusable(content);
  }
  firstFocusable ||= content;
  firstFocusable.focus();
};

const focusNextPrompt = () => {
  const prompts: HTMLElement[] = [].slice.call(
    document.querySelectorAll(`${ROOT_SELECTOR}[data-${IS_OPEN_DATA}]`),
  );
  const topElement = prompts.reverse()[0];
  const content: MaybeHTMLElement = topElement?.querySelector(CONTENT_SELECTOR);
  const firstFocusable = content && getFirstFocusable(content);
  if (firstFocusable) {
    firstFocusable.focus();
  }
};

async function init(
  prompt: TPrompt,
  command?: Command,
  options?: Options,
  mode?: MODE,
) {
  prompt.options = {
    ...prompt.options,
    ...options,
  };
  const elements = getElements(prompt, prompt.el, command, prompt.options);
  if (elements === undefined) {
    return;
  }
  if (!prompt.el) {
    prompt.el = elements?.root;
  }
  const { root, content, isDetails, backdropLayer } = elements;

  /* Set transition duration override */
  if (Number.isInteger(options?.transitionDuration)) {
    const transitionDurationMs: string = `${options?.transitionDuration}ms`;
    content.style.setProperty(
      '--prompt-transition-duration-content',
      transitionDurationMs,
    );
    content.style.setProperty(
      '--prompt-fast-transition-duration-content',
      transitionDurationMs,
    );
    if (backdropLayer) {
      backdropLayer.style.setProperty(
        '--prompt-transition-duration-backdrop',
        transitionDurationMs,
      );
      backdropLayer.style.setProperty(
        '--prompt-fast-transition-duration-backdrop',
        transitionDurationMs,
      );
    }
  }

  /* If dialog element: open */
  if (content.tagName == 'DIALOG') {
    const dialog = content as HTMLDialogElement;
    dialog.show();
    repaint(content);
  }

  initToggleEvents(elements);
  initTouchEvents(elements);

  const isOpen = isDetails && root.getAttribute('open') !== null;
  if (isOpen && mode !== MODE.HIDE) {
    showView(elements, prompt.options);
  }

  if (mode !== undefined) {
    await toggleView(elements, mode, prompt.options);
  }
}

export const Prompt: TPrompt = {
  _cache: {},
  mounted() {},
  beforeUpdate() {
    storeDataset(this._cache, this.el?.id, this.el?.dataset);
  },
  updated() {
    const dataset = readDataset(this._cache, this.el?.id);
    applyDataset(dataset, this.el);
    clearDataset(this._cache, this.el?.id);
  },
  destroyed() {
    clearDataset(this._cache, this.el?.id);
  },
  status: INITIAL_STATUS,
  async init(command: Command, options?: Options) {
    await init(this, command, options);
  },
  async toggle(command: Command, options?: Options) {
    await init(this, command, options, MODE.TOGGLE);
  },
  async show(command: Command, options?: Options) {
    await init(this, command, options, MODE.SHOW);
  },
  async hide(command: Command, options?: Options) {
    await init(this, command, options, MODE.HIDE);
  },
};

declare global {
  interface Window {
    Prompt?: TPrompt;
  }
}

if (typeof window !== 'undefined') {
  window.Prompt = Prompt;
}
