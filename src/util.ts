export const wait = (m: number) => new Promise(r => setTimeout(r, m));

const getPropertyValue = (style: CSSStyleDeclaration, props: string[]) =>
  props.reduce((acc, prop) => {
    if (acc !== '0s') {
      return acc;
    }
    return style.getPropertyValue(prop);
  }, '0s');

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
    parseFloat(durationStr) * (durationStr.indexOf('ms') === -1 ? 1000 : 1);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const getDuration = (domElement: HTMLElement) => {
  const durationStyleValue = getStyleValue({
    domElement,
    props: ['animation-duration', 'transition-duration'],
  });
  const durationValue =
    durationStyleValue !== undefined
      ? styleDurationToMs(durationStyleValue)
      : 0;
  const delayStyleValue = getStyleValue({
    domElement,
    props: ['animation-delay', 'transition-delay'],
  });
  const delayValue =
    delayStyleValue !== undefined ? styleDurationToMs(delayStyleValue) : 0;
  return durationValue + delayValue;
};

export const repaint = (element: HTMLElement) => element.scrollTop;

export const isVisible = (element: HTMLElement) => {
  const style =
    typeof window !== 'undefined'
      ? window.getComputedStyle(element)
      : ({} as CSSStyleDeclaration);
  if (style.opacity === '0' || style.display === 'none') {
    return false;
  }
  return !!(
    element.offsetWidth ||
    element.offsetHeight ||
    element.getClientRects().length
  );
};

const isFocusable = (el: HTMLElement, interactiveOnly?: boolean) => {
  return (
    (el instanceof HTMLAnchorElement && el.rel !== 'ignore') ||
    (el instanceof HTMLAreaElement && el.href !== undefined) ||
    ([
      HTMLInputElement,
      HTMLSelectElement,
      HTMLTextAreaElement,
      HTMLButtonElement,
    ].some(elClass => el instanceof elClass) &&
      !(
        el as
          | HTMLInputElement
          | HTMLSelectElement
          | HTMLTextAreaElement
          | HTMLButtonElement
      ).disabled) ||
    el instanceof HTMLIFrameElement ||
    el.tabIndex > 0 ||
    (!interactiveOnly &&
      el.tabIndex === 0 &&
      el.getAttribute('tabindex') !== null &&
      el.getAttribute('aria-hidden') !== 'true')
  );
};

export const getFirstFocusable = (content: HTMLElement) => {
  const focusable = (
    [].slice.call(
      content.querySelectorAll(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
      ),
    ) as HTMLElement[]
  )
    .filter(el => isFocusable(el, true))
    .sort((a, b) => a.tabIndex - b.tabIndex);
  return focusable[0];
};

export type CachedDataset = Record<string, string>;

export const storeDataset = (
  cache: CachedDataset,
  id?: string,
  dataset?: DOMStringMap,
) => {
  if (!id) return;
  if (!cache[id]) {
    cache[id] = JSON.stringify(dataset);
  }
};

export const readDataset = (cache: CachedDataset, id?: string) => {
  if (!id) return;
  return JSON.parse(cache[id]);
};

export const clearDataset = (cache: CachedDataset, id?: string) => {
  if (!id) return;
  delete cache[id];
};

export const applyDataset = (
  dataset: DOMStringMap,
  el?: HTMLElement | null,
) => {
  if (!el || !dataset) return;
  Object.keys(dataset).forEach(key => {
    el.dataset[key] = dataset[key];
  });
};
