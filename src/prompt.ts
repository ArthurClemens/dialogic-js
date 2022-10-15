import { wait, getDuration } from "./util";

export type TPrompt = {
  el?: HTMLElement;
  inited?: boolean;
  mounted: () => void;
  init: (command: Command) => void;
  toggle: (command: Command) => void;
  show: (command: Command) => void;
  hide: (command: Command) => void;
};

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

const ROOT_SELECTOR = "[data-prompt]";
const PANE_SELECTOR = "[data-pane]";
const TOUCH_SELECTOR = "[data-touch]";
const TOGGLE_SELECTOR = "[data-toggle]";
const IS_MODAL_DATA = "ismodal";
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
  pane: HTMLElement;
  root: HTMLElement;
  isDetails: boolean;
  isModal: boolean;
  touchLayer?: MaybeHTMLElement;
  toggle?: MaybeHTMLElement;
};

enum MODE {
  SHOW,
  HIDE,
  TOGGLE,
}

function getElements(
  prompt: TPrompt,
  command?: Command
): PromptElements | undefined {
  let root: MaybeHTMLElement = null;

  if (!command && prompt.el) {
    root = prompt.el;
  } else if (typeof command === "string") {
    root = document.querySelector(command);
  } else if (command && !!command.tagName) {
    root = command.closest(ROOT_SELECTOR);
  }

  if (!root) {
    return undefined;
  }

  const toggle: MaybeHTMLElement =
    root.querySelector(TOGGLE_SELECTOR) || root.querySelector("summary");
  const pane: MaybeHTMLElement = root.querySelector(PANE_SELECTOR);
  const touchLayer: MaybeHTMLElement = root.querySelector(TOUCH_SELECTOR);
  const isDetails = root.tagName === "DETAILS";
  const isModal = root.dataset[IS_MODAL_DATA] !== undefined;

  if (root && pane) {
    return {
      root,
      isDetails,
      isModal,
      toggle,
      pane,
      touchLayer,
    };
  }
  return undefined;
}

async function init(prompt: TPrompt, command?: Command, mode?: MODE) {
  const elements = getElements(prompt, command);
  if (elements === undefined) {
    console.error("Prompt elements not found");
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

const repaint = (element: HTMLElement) => element.scrollTop;

const showView = async ({ pane, root, isDetails }: PromptElements) => {
  if (isDetails) {
    root.setAttribute("open", "");
  }
  root.dataset[IS_OPEN_DATA] = "";
  repaint(root);
  root.dataset[IS_SHOWING_DATA] = "";

  const duration = getDuration(pane);
  await wait(duration);
};

const hideView = async ({ pane, root, isDetails }: PromptElements) => {
  delete root.dataset[IS_SHOWING_DATA];
  root.dataset[IS_HIDING_DATA] = "";
  const duration = getDuration(pane);
  await wait(duration);
  if (isDetails) {
    root.removeAttribute("open");
  }
  delete root.dataset[IS_HIDING_DATA];
  delete root.dataset[IS_OPEN_DATA];
};

const isVisible = (element: HTMLElement) => {
  const style = window.getComputedStyle(element);
  if (style.opacity === "0" || style.display === "none") {
    return false;
  }
  return !!(
    element.offsetWidth ||
    element.offsetHeight ||
    element.getClientRects().length
  );
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
      if (isVisible(elements.pane)) {
        return await hideView(elements);
      } else {
        return await showView(elements);
      }
    }
  }
};

window.Prompt = Prompt;
