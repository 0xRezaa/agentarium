export type SnakeToCamelCase<S extends string> =
  S extends `${infer H}_${infer T}`
    ? `${H}${Capitalize<SnakeToCamelCase<T>>}`
    : S;

export type CamelCaseKeys<T> = {
  [K in keyof T as K extends string ? SnakeToCamelCase<K> : K]: T[K];
};

export type SerializeDate<T> = {
  [K in keyof T]: T[K] extends Date ? string : T[K];
};

export type ApiShape<T> = SerializeDate<CamelCaseKeys<T>>;
