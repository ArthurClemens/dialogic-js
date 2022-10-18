import { wait, getDuration, repaint, isVisible } from "./util";

export type TPrompt = {
  el?: HTMLElement;
  mounted: () => void;
  init: (command: Command) => void;
  toggle: (command: Command) => void;
  show: (command: Command) => void;
  hide: (command: Command) => void;
};

// Elements
const ROOT_SELECTOR = "[data-prompt]";
const CONTENT_SELECTOR = "[data-content]";
const TOUCH_SELECTOR = "[data-touch]";
const TOGGLE_SELECTOR = "[data-toggle]";
// Modifier arguments
const IS_MODAL_DATA = "ismodal";
const IS_ESCAPABLE_DATA = "isescapable";
// Internal state and CSS
const IS_OPEN_DATA = "isopen";
const IS_SHOWING_DATA = "isshowing";
const IS_HIDING_DATA = "ishiding";

type Command =
  /**
   * HTML selector
   */
  | string
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
  touchLayer?: MaybeHTMLElement;
  toggle?: MaybeHTMLElement;
  escapeListener: (e: KeyboardEvent) => void;
};

enum MODE {
  SHOW,
  HIDE,
  TOGGLE,
}

const hideView = async ({
  content,
  root,
  isDetails,
  isEscapable,
  escapeListener,
}: PromptElements) => {
  if (isEscapable) {
    window.addEventListener("keydown", escapeListener, { once: true });
  }
  delete root.dataset[IS_SHOWING_DATA];
  root.dataset[IS_HIDING_DATA] = "";
  const duration = getDuration(content);
  await wait(duration);
  if (isDetails) {
    root.removeAttribute("open");
  }
  delete root.dataset[IS_HIDING_DATA];
  delete root.dataset[IS_OPEN_DATA];
};

const showView = async ({
  content,
  root,
  isDetails,
  isEscapable,
  escapeListener,
}: PromptElements) => {
  if (isEscapable) {
    window.addEventListener("keydown", escapeListener, { once: true });
  }
  if (isDetails) {
    root.setAttribute("open", "");
  }
  root.dataset[IS_OPEN_DATA] = "";
  repaint(root);
  root.dataset[IS_SHOWING_DATA] = "";

  const duration = getDuration(content);
  await wait(duration);
};

const toggleView = async (
  elements: PromptElements,
  mode: MODE = MODE.TOGGLE
) => {
  switch (mode) {
    case MODE.SHOW:
      return await showView(elements);
    case MODE.HIDE:
      return await hideView(elements);
    default: {
      if (isVisible(elements.content)) {
        return await hideView(elements);
      } else {
        return await showView(elements);
      }
    }
  }
};

function getElements(
  promptElement: HTMLElement | undefined,
  command?: Command
): PromptElements | undefined {
  let root: MaybeHTMLElement = null;

  if (!command && promptElement) {
    root = promptElement;
  } else if (typeof command === "string") {
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
    root.querySelector(TOGGLE_SELECTOR) || root.querySelector("summary");
  const touchLayer: MaybeHTMLElement = root.querySelector(TOUCH_SELECTOR);
  const isDetails = root.tagName === "DETAILS";
  const isModal = root.dataset[IS_MODAL_DATA] !== undefined;
  const isEscapable = root.dataset[IS_ESCAPABLE_DATA] !== undefined;

  const elements: PromptElements = {
    root,
    isDetails,
    isModal,
    isEscapable,
    toggle,
    content,
    touchLayer,
    escapeListener: function (e: KeyboardEvent) {
      if (e.key === "Escape") {
        hideView(elements);
      }
    },
  };
  return elements;
}

const initToggleEvents = (elements: PromptElements) => {
  const { toggle } = elements;

  if (toggle && toggle.dataset.registered === undefined) {
    toggle.addEventListener("click", async (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      toggleView(elements);
    });
    toggle.dataset.registered = "";
  }
};

const initTouchEvents = (elements: PromptElements) => {
  const { touchLayer, isModal } = elements;
  if (touchLayer && touchLayer.dataset.registered === undefined) {
    touchLayer.addEventListener("click", async (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isModal) {
        toggleView(elements, MODE.HIDE);
      }
    });
    touchLayer.dataset.registered = "";
  }
};

async function init(prompt: TPrompt, command?: Command, mode?: MODE) {
  const elements = getElements(prompt.el, command);
  if (elements === undefined) {
    return;
  }

  initToggleEvents(elements);
  initTouchEvents(elements);

  const { root, isDetails } = elements;

  const isOpen = isDetails && root.getAttribute("open") !== null;
  if (isOpen) {
    showView(elements);
  }

  if (mode !== undefined) {
    await toggleView(elements, mode);
  }
}

export const Prompt: TPrompt = {
  mounted() {
    init(this);
  },
  async init(command: Command) {
    await init(this, command);
  },
  async toggle(command: Command) {
    await init(this, command, MODE.TOGGLE);
  },
  async show(command: Command) {
    await init(this, command, MODE.SHOW);
  },
  async hide(command: Command) {
    await init(this, command, MODE.HIDE);
  },
};

declare global {
  interface Window {
    Prompt?: TPrompt;
  }
}

window.Prompt = Prompt;
