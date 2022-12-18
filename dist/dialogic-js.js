var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b ||= {})
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/util.ts
var wait = (m) => new Promise((r) => setTimeout(r, m));
var getPropertyValue = (style, props) => props.reduce((acc, prop) => {
  if (acc !== "0s") {
    return acc;
  }
  return style.getPropertyValue(prop);
}, "0s");
var getStyleValue = ({
  domElement,
  props
}) => {
  const defaultView = document.defaultView;
  if (defaultView) {
    const style = defaultView.getComputedStyle(domElement);
    if (style) {
      return getPropertyValue(style, props);
    }
  }
  return void 0;
};
var styleDurationToMs = (durationStr) => {
  const parsed = parseFloat(durationStr) * (durationStr.indexOf("ms") === -1 ? 1e3 : 1);
  return Number.isNaN(parsed) ? 0 : parsed;
};
var getDuration = (domElement) => {
  const durationStyleValue = getStyleValue({
    domElement,
    props: ["animation-duration", "transition-duration"]
  });
  const durationValue = durationStyleValue !== void 0 ? styleDurationToMs(durationStyleValue) : 0;
  const delayStyleValue = getStyleValue({
    domElement,
    props: ["animation-delay", "transition-delay"]
  });
  const delayValue = delayStyleValue !== void 0 ? styleDurationToMs(delayStyleValue) : 0;
  return durationValue + delayValue;
};
var repaint = (element) => element.scrollTop;
var isVisible = (element) => {
  const style = window.getComputedStyle(element);
  if (style.opacity === "0" || style.display === "none") {
    return false;
  }
  return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
};
var isFocusable = (el, interactiveOnly) => {
  return el instanceof HTMLAnchorElement && el.rel !== "ignore" || el instanceof HTMLAreaElement && el.href !== void 0 || [
    HTMLInputElement,
    HTMLSelectElement,
    HTMLTextAreaElement,
    HTMLButtonElement
  ].some((elClass) => el instanceof elClass) && !el.disabled || el instanceof HTMLIFrameElement || el.tabIndex > 0 || !interactiveOnly && el.tabIndex === 0 && el.getAttribute("tabindex") !== null && el.getAttribute("aria-hidden") !== "true";
};
var getFirstFocusable = (content) => {
  const focusable = [].slice.call(
    content.querySelectorAll(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
    )
  ).filter((el) => isFocusable(el, true)).sort((a, b) => a.tabIndex - b.tabIndex);
  return focusable[0];
};

// src/prompt.ts
var ROOT_SELECTOR = "[data-prompt]";
var CONTENT_SELECTOR = "[data-content]";
var TOUCH_SELECTOR = "[data-touch]";
var TOGGLE_SELECTOR = "[data-toggle]";
var IS_MODAL_DATA = "ismodal";
var IS_ESCAPABLE_DATA = "isescapable";
var IS_FOCUS_FIRST_DATA = "isfocusfirst";
var FOCUS_FIRST_SELECTOR_DATA = "focusfirst";
var IS_OPEN_DATA = "isopen";
var IS_SHOWING_DATA = "isshowing";
var IS_HIDING_DATA = "ishiding";
var IS_LOCKED_DATA = "islocked";
var LOCK_DURATION = 300;
var hideView = (_0, ..._1) => __async(void 0, [_0, ..._1], function* (elements, options = {}) {
  const { content, root, isDetails, isEscapable, escapeListener } = elements;
  if (root.dataset[IS_LOCKED_DATA] !== void 0 && !options.isIgnoreLockDuration) {
    return;
  }
  if (options.willHide) {
    options.willHide(elements);
  }
  delete root.dataset[IS_SHOWING_DATA];
  root.dataset[IS_HIDING_DATA] = "";
  const duration = getDuration(content);
  yield wait(duration);
  if (isDetails) {
    root.removeAttribute("open");
  }
  delete root.dataset[IS_HIDING_DATA];
  delete root.dataset[IS_OPEN_DATA];
  if (options.didHide) {
    options.didHide(elements);
  }
  if (isEscapable) {
    window.removeEventListener("keydown", escapeListener);
  }
});
var showView = (_0, ..._1) => __async(void 0, [_0, ..._1], function* (elements, options = {}) {
  const {
    content,
    root,
    isDetails,
    isEscapable,
    isFocusFirst,
    focusFirstSelector,
    escapeListener
  } = elements;
  if (root.dataset[IS_LOCKED_DATA] !== void 0) {
    return;
  }
  if (options.willShow) {
    options.willShow(elements);
  }
  root.dataset[IS_LOCKED_DATA] = "";
  setTimeout(() => {
    if (root) {
      delete root.dataset[IS_LOCKED_DATA];
    }
  }, LOCK_DURATION);
  if (isEscapable) {
    window.addEventListener("keydown", escapeListener);
  }
  if (isDetails) {
    root.setAttribute("open", "");
  }
  root.dataset[IS_OPEN_DATA] = "";
  repaint(root);
  root.dataset[IS_SHOWING_DATA] = "";
  const duration = getDuration(content);
  yield wait(duration);
  if (isFocusFirst) {
    const firstFocusable = getFirstFocusable(content);
    if (firstFocusable) {
      firstFocusable.focus();
    }
  } else if (focusFirstSelector) {
    const firstFocusable = content.querySelector(focusFirstSelector);
    if (firstFocusable) {
      firstFocusable.focus();
    }
  }
  if (options.didShow) {
    options.didShow(elements);
  }
});
var toggleView = (_0, ..._1) => __async(void 0, [_0, ..._1], function* (elements, mode = 2 /* TOGGLE */, options) {
  switch (mode) {
    case 0 /* SHOW */:
      return yield showView(elements, options);
    case 1 /* HIDE */:
      return yield hideView(elements, options);
    default: {
      if (isVisible(elements.content)) {
        return yield hideView(elements, options);
      } else {
        return yield showView(elements, options);
      }
    }
  }
});
function getElements(promptElement, command, options) {
  let root = null;
  if (!command && promptElement) {
    root = promptElement;
  } else if (typeof command === "string") {
    root = document.querySelector(command);
  } else if (command && !!command.tagName) {
    root = command.closest(ROOT_SELECTOR);
  }
  if (!root) {
    console.error("Prompt element 'data-root' not found");
    return void 0;
  }
  const content = root.querySelector(CONTENT_SELECTOR);
  if (!content) {
    console.error("Prompt element 'data-content' not found");
    return void 0;
  }
  const toggle = root.querySelector(TOGGLE_SELECTOR) || root.querySelector("summary");
  const touchLayer = root.querySelector(TOUCH_SELECTOR);
  const isDetails = root.tagName === "DETAILS";
  const isModal = root.dataset[IS_MODAL_DATA] !== void 0;
  const isEscapable = root.dataset[IS_ESCAPABLE_DATA] !== void 0;
  const isFocusFirst = root.dataset[IS_FOCUS_FIRST_DATA] !== void 0;
  const focusFirstSelector = root.dataset[FOCUS_FIRST_SELECTOR_DATA];
  const elements = {
    root,
    isDetails,
    isModal,
    isEscapable,
    isFocusFirst,
    focusFirstSelector,
    toggle,
    content,
    touchLayer,
    escapeListener: function(e) {
      if (e.key === "Escape") {
        const prompts = [].slice.call(
          document.querySelectorAll("[data-prompt][data-isopen]")
        );
        const topElement = prompts.reverse()[0];
        if (topElement === elements.root) {
          hideView(elements, __spreadProps(__spreadValues({}, options), { isIgnoreLockDuration: true }));
        }
      }
    }
  };
  return elements;
}
var initToggleEvents = (elements) => {
  const { toggle } = elements;
  if (toggle && toggle.dataset.registered === void 0) {
    toggle.addEventListener("click", (e) => __async(void 0, null, function* () {
      e.preventDefault();
      e.stopPropagation();
      toggleView(elements);
    }));
    toggle.dataset.registered = "";
  }
};
var initTouchEvents = (elements) => {
  const { touchLayer, isModal } = elements;
  if (touchLayer && touchLayer.dataset.registered === void 0) {
    touchLayer.addEventListener("click", (e) => __async(void 0, null, function* () {
      e.stopPropagation();
      if (!isModal) {
        toggleView(elements, 1 /* HIDE */);
      }
    }));
    touchLayer.dataset.registered = "";
  }
};
var initContentEvents = (elements) => {
  const { content } = elements;
  if (content && content.dataset.registered === void 0) {
    content.addEventListener("click", (e) => __async(void 0, null, function* () {
      e.stopPropagation();
    }));
    content.dataset.registered = "";
  }
};
function init(prompt, command, options, mode) {
  return __async(this, null, function* () {
    const elements = getElements(prompt.el, command, options);
    if (elements === void 0) {
      return;
    }
    initToggleEvents(elements);
    initTouchEvents(elements);
    initContentEvents(elements);
    const { root, isDetails } = elements;
    const isOpen = isDetails && root.getAttribute("open") !== null;
    if (isOpen && mode !== 1 /* HIDE */) {
      showView(elements, options);
    }
    if (mode !== void 0) {
      yield toggleView(elements, mode, options);
    }
  });
}
var Prompt = {
  mounted() {
    init(this);
  },
  init(command, options) {
    return __async(this, null, function* () {
      yield init(this, command, options);
    });
  },
  toggle(command, options) {
    return __async(this, null, function* () {
      yield init(this, command, options, 2 /* TOGGLE */);
    });
  },
  show(command, options) {
    return __async(this, null, function* () {
      yield init(this, command, options, 0 /* SHOW */);
    });
  },
  hide(command, options) {
    return __async(this, null, function* () {
      yield init(this, command, options, 1 /* HIDE */);
    });
  }
};
window.Prompt = Prompt;
export {
  Prompt
};
