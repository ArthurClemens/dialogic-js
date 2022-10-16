export const wait = (m: number) => new Promise((r) => setTimeout(r, m));

const getPropertyValue = (style: CSSStyleDeclaration, props: string[]) =>
  props.reduce((acc, prop) => {
    if (acc !== "0s") {
      return acc;
    }
    return style.getPropertyValue(prop);
  }, "0s");

const getStyleValue = ({
  domElement,
  props,
}: {
  domElement: HTMLElement;
  props: string[];
}) => {
  const defaultView = document.defaultView;
  if (defaultView) {
    const style = defaultView.getComputedStyle(domElement);
    if (style) {
      return getPropertyValue(style, props);
    }
  }
  return undefined;
};

const styleDurationToMs = (durationStr: string) => {
  const parsed =
    parseFloat(durationStr) * (durationStr.indexOf("ms") === -1 ? 1000 : 1);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const getDuration = (domElement: HTMLElement) => {
  const durationStyleValue = getStyleValue({
    domElement,
    props: ["animation-duration", "transition-duration"],
  });
  const durationValue =
    durationStyleValue !== undefined
      ? styleDurationToMs(durationStyleValue)
      : 0;
  const delayStyleValue = getStyleValue({
    domElement,
    props: ["animation-delay", "transition-delay"],
  });
  const delayValue =
    delayStyleValue !== undefined ? styleDurationToMs(delayStyleValue) : 0;
  return durationValue + delayValue;
};

export const repaint = (element: HTMLElement) => element.scrollTop;

export const isVisible = (element: HTMLElement) => {
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
