export type Expect<T extends true> = (<T>() => T extends T ? 1 : 2) extends <T>() => T extends true ? 1 : 2 ? true : false;

export type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
