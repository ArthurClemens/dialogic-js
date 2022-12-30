import {
  wait,
  getDuration,
  repaint,
  isVisible,
  getFirstFocusable,
  CachedDataset,
  applyDataset,
  clearDataset,
  readDataset,
  storeDataset,
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

export type Options = {
  willShow?: (elements?: PromptElements) => void;
  didShow?: (elements?: PromptElements) => void;
  willHide?: (elements?: PromptElements) => void;
  didHide?: (elements?: PromptElements) => void;
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
const TOGGLE_SELECTOR = '[data-toggle]';
// Modifier arguments
const IS_MODAL_DATA = 'ismodal';
const IS_ESCAPABLE_DATA = 'isescapable';
const IS_FOCUS_FIRST_DATA = 'isfocusfirst';
const FOCUS_FIRST_SELECTOR_DATA = 'focusfirst';
// Internal state and CSS
const IS_OPEN_DATA = 'isopen';
const IS_SHOWING_DATA = 'isshowing';
const IS_HIDING_DATA = 'ishiding';
const IS_LOCKED_DATA = 'islocked';
// Other
const LOCK_DURATION = 300; // Prevent the item from being closed or re-opened when it has just been opened.

const hideView = async (
  elements: PromptElements,
  options: Options = {} as Options
) => {
  const { content, root, isDetails, isEscapable, escapeListener } = elements;

  if (
    root.dataset[IS_LOCKED_DATA] !== undefined &&
    !options.isIgnoreLockDuration
  ) {
    return;
  }
  if (options.willHide) {
    options.willHide(elements);
  }
  delete root.dataset[IS_SHOWING_DATA];
  root.dataset[IS_HIDING_DATA] = '';
  const duration = getDuration(content);
  await wait(duration);
  if (isDetails) {
    root.removeAttribute('open');
  }
  delete root.dataset[IS_HIDING_DATA];
  delete root.dataset[IS_OPEN_DATA];
  if (options.didHide) {
    options.didHide(elements);
  }
  if (isEscapable) {
    window.removeEventListener('keydown', escapeListener);
  }
};

const showView = async (
  elements: PromptElements,
  options: Options = {} as Options
) => {
  const {
    content,
    root,
    isDetails,
    isEscapable,
    isFocusFirst,
    focusFirstSelector,
    escapeListener,
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
    window.addEventListener('keydown', escapeListener);
  }
  if (isDetails) {
    root.setAttribute('open', '');
  }

  root.dataset[IS_OPEN_DATA] = '';
  repaint(root);
  root.dataset[IS_SHOWING_DATA] = '';

  if (options.willShow) {
    options.willShow(elements);
  }

  const duration = getDuration(content);
  await wait(duration);
  if (isFocusFirst) {
    const firstFocusable = getFirstFocusable(content);
    if (firstFocusable) {
      firstFocusable.focus();
    }
  } else if (focusFirstSelector) {
    const firstFocusable: HTMLElement | null =
      content.querySelector(focusFirstSelector);
    if (firstFocusable) {
      firstFocusable.focus();
    }
  }
  if (options.didShow) {
    options.didShow(elements);
  }
};

const toggleView = async (
  elements: PromptElements,
  mode: MODE = MODE.TOGGLE,
  options?: Options
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
  promptElement?: MaybeHTMLElement,
  command?: Command,
  options?: Options
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
    console.error("Prompt element 'data-root' not found");
    return undefined;
  }
  const content: MaybeHTMLElement = root.querySelector(CONTENT_SELECTOR);

  if (!content) {
    console.error("Prompt element 'data-content' not found");
    return undefined;
  }

  const toggle: MaybeHTMLElement =
    root.querySelector(TOGGLE_SELECTOR) || root.querySelector('summary');
  const touchLayer: MaybeHTMLElement = root.querySelector(TOUCH_SELECTOR);
  const isDetails = root.tagName === 'DETAILS';
  const isModal = root.dataset[IS_MODAL_DATA] !== undefined;
  const isEscapable = root.dataset[IS_ESCAPABLE_DATA] !== undefined;
  const isFocusFirst = root.dataset[IS_FOCUS_FIRST_DATA] !== undefined;
  const focusFirstSelector = root.dataset[FOCUS_FIRST_SELECTOR_DATA];

  const elements: PromptElements = {
    root,
    isDetails,
    isModal,
    isEscapable,
    isFocusFirst,
    focusFirstSelector,
    toggle,
    content,
    touchLayer,
    escapeListener: function (e: KeyboardEvent) {
      if (e.key === 'Escape') {
        // Only close the top element
        const prompts = [].slice.call(
          document.querySelectorAll(`${ROOT_SELECTOR}[data-${IS_OPEN_DATA}]`)
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
      e.stopPropagation();
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

async function init(
  prompt: TPrompt,
  command?: Command,
  options?: Options,
  mode?: MODE
) {
  prompt.options = {
    ...prompt.options,
    ...options,
  };
  const elements = getElements(prompt.el, command, prompt.options);
  if (elements === undefined) {
    return;
  }
  if (!prompt.el) {
    prompt.el = elements?.root;
  }

  initToggleEvents(elements);
  initTouchEvents(elements);

  const { root, isDetails } = elements;

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

window.Prompt = Prompt;
