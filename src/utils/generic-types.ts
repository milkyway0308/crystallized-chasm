export type AttachedDocument<T> = Document & { __attached?: T };
export type ExpandedVoid = void | Promise<void>;

export type Runnable = () => void;
export type AsyncRunnable = () => ExpandedVoid;

export type Consumer<P> = (parameter: P) => void;
export type AsyncConsumer<P> = (parameter: P) => ExpandedVoid;

export type BiConsumer<F, S> = (first: F, second: S) => void;
export type AsyncBiConsumer<F, S> = (first: F, second: S) => ExpandedVoid;


export type TriConsumer<F, S, T> = (first: F, second: S, third: T) => void;
export type AsyncTriConsumer<F, S, T> = (first: F, second: S, third: T) => ExpandedVoid;

export type Processor<I, O> = (input: I) => O
export type AsyncProcessor<I, O> = (input: I) => Promise<O>

export type Nullable<T> = T | null;
export type Undeclarable<T> = T | null | undefined;
export type Skippable<T> = T | undefined | void;