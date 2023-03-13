export declare const wait: (m: number) => Promise<unknown>;
export declare const getDuration: (domElement: HTMLElement) => number;
export declare const repaint: (element: HTMLElement) => number;
export declare const isVisible: (element: HTMLElement) => boolean;
export declare const getFirstFocusable: (content: HTMLElement) => HTMLElement;
export type CachedDataset = Record<string, string>;
export declare const storeDataset: (cache: CachedDataset, id?: string, dataset?: DOMStringMap) => void;
export declare const readDataset: (cache: CachedDataset, id?: string) => any;
export declare const clearDataset: (cache: CachedDataset, id?: string) => void;
export declare const applyDataset: (dataset: DOMStringMap, el?: HTMLElement | null) => void;
