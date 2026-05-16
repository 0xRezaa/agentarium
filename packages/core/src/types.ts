declare const Brand: unique symbol;

export type Branded<T, Name extends string> = T & { readonly [Brand]: Name };
