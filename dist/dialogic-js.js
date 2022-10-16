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

// src/prompt.ts
var ROOT_SELECTOR = "[data-prompt]";
var PANE_SELECTOR = "[data-pane]";
var TOUCH_SELECTOR = "[data-touch]";
var TOGGLE_SELECTOR = "[data-toggle]";
var IS_MODAL_DATA = "ismodal";
var IS_ESCAPABLE_DATA = "isescapable";
var IS_OPEN_DATA = "isopen";
var IS_SHOWING_DATA = "isshowing";
var IS_HIDING_DATA = "ishiding";
var hideView = (_0) => __async(void 0, [_0], function* ({
  pane,
  root,
  isDetails,
  isEscapable,
  escapeListener
}) {
  if (isEscapable) {
    window.addEventListener("keydown", escapeListener, { once: true });
  }
  delete root.dataset[IS_SHOWING_DATA];
  root.dataset[IS_HIDING_DATA] = "";
  const duration = getDuration(pane);
  yield wait(duration);
  if (isDetails) {
    root.removeAttribute("open");
  }
  delete root.dataset[IS_HIDING_DATA];
  delete root.dataset[IS_OPEN_DATA];
});
var showView = (_0) => __async(void 0, [_0], function* ({
  pane,
  root,
  isDetails,
  isEscapable,
  escapeListener
}) {
  if (isEscapable) {
    window.addEventListener("keydown", escapeListener, { once: true });
  }
  if (isDetails) {
    root.setAttribute("open", "");
  }
  root.dataset[IS_OPEN_DATA] = "";
  repaint(root);
  root.dataset[IS_SHOWING_DATA] = "";
  const duration = getDuration(pane);
  yield wait(duration);
});
var toggleView = (_0, ..._1) => __async(void 0, [_0, ..._1], function* (elements, mode = 2 /* TOGGLE */) {
  switch (mode) {
    case 0 /* SHOW */:
      return yield showView(elements);
    case 1 /* HIDE */:
      return yield hideView(elements);
    default: {
      if (isVisible(elements.pane)) {
        return yield hideView(elements);
      } else {
        return yield showView(elements);
      }
    }
  }
});
function getElements(prompt, command) {
  let root = null;
  if (!command && prompt.el) {
    root = prompt.el;
  } else if (typeof command === "string") {
    root = document.querySelector(command);
  } else if (command && !!command.tagName) {
    root = command.closest(ROOT_SELECTOR);
  }
  if (!root) {
    return void 0;
  }
  const toggle = root.querySelector(TOGGLE_SELECTOR) || root.querySelector("summary");
  const pane = root.querySelector(PANE_SELECTOR);
  const touchLayer = root.querySelector(TOUCH_SELECTOR);
  const isDetails = root.tagName === "DETAILS";
  const isModal = root.dataset[IS_MODAL_DATA] !== void 0;
  const isEscapable = root.dataset[IS_ESCAPABLE_DATA] !== void 0;
  if (root && pane) {
    const elements = {
      root,
      isDetails,
      isModal,
      isEscapable,
      toggle,
      pane,
      touchLayer,
      prompt,
      escapeListener: () => void 0
    };
    const escapeListener = function(e) {
      if (e.key === "Escape") {
        hideView(elements);
      }
    };
    elements.escapeListener = escapeListener;
    return elements;
  }
  return void 0;
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
      e.preventDefault();
      e.stopPropagation();
      if (!isModal) {
        toggleView(elements, 1 /* HIDE */);
      }
    }));
    touchLayer.dataset.registered = "";
  }
};
function init(prompt, command, mode) {
  return __async(this, null, function* () {
    const elements = getElements(prompt, command);
    if (elements === void 0) {
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
    if (mode !== void 0) {
      yield toggleView(elements, mode);
    }
  });
}
var Prompt = {
  mounted() {
    init(this);
  },
  init(command) {
    return __async(this, null, function* () {
      yield init(this, command);
    });
  },
  toggle(command) {
    return __async(this, null, function* () {
      yield init(this, command, 2 /* TOGGLE */);
    });
  },
  show(command) {
    return __async(this, null, function* () {
      yield init(this, command, 0 /* SHOW */);
    });
  },
  hide(command) {
    return __async(this, null, function* () {
      yield init(this, command, 1 /* HIDE */);
    });
  }
};
window.Prompt = Prompt;
export {
  Prompt
};
