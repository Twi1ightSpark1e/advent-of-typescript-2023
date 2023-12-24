type Length<T extends object> = T extends { length: number } ? number & T["length"] : never;

// https://stackoverflow.com/a/73555039
type Arr<N, Element = unknown, T extends Element[] = []> = T['length'] extends N ? T : Arr<N, Element, [...T, Element]>
type Inc<T> = Length<[...Arr<T>, unknown]>;
type Dec<T> = Arr<T> extends [infer Head, ...infer Tail] ? Length<Tail> : never;

type Gifts = ['🛹', '🚲', '🛴', '🏄']
type GetGift<N extends number, GiftsLeft extends Array<string> = Gifts> =
	GiftsLeft extends [infer Head extends string, ...infer Tail extends Array<string>]
		? N extends 0
			? Head
			: GetGift<Dec<N>, Tail>
		: GetGift<N>;

type Rebuild<Sequence extends Array<number>, Index extends number = 0, Result extends Array<unknown> = []> =
	Sequence extends [infer Head extends number, ...infer Tail extends Array<number>]
		? Rebuild<Tail, Inc<Index>, [...Result, ...Arr<Head, GetGift<Index>>]>
		: Result;

// #region tests
import { Expect, Equal } from './type-testing';

type test_0_actual = Rebuild<[2, 1, 3, 3, 1, 1, 2]>;
type test_0_expected =  [
	'🛹', '🛹',
	'🚲',
	'🛴', '🛴', '🛴',
	'🏄', '🏄', '🏄',
	'🛹',
	'🚲',
	'🛴', '🛴',
];
type test_0 = Expect<Equal<test_0_expected, test_0_actual>>;

type test_1_actual = Rebuild<[3, 3, 2, 1, 2, 1, 2]>;
type test_1_expected = [
	'🛹', '🛹', '🛹',
	'🚲', '🚲', '🚲',
	'🛴', '🛴',
	'🏄',
	'🛹', '🛹',
	'🚲',
	'🛴', '🛴'
];
type test_1 = Expect<Equal<test_1_expected, test_1_actual>>;

type test_2_actual = Rebuild<[2, 3, 3, 5, 1, 1, 2]>;
type test_2_expected = [
	'🛹', '🛹',
	'🚲', '🚲', '🚲',
	'🛴', '🛴', '🛴',
	'🏄', '🏄', '🏄', '🏄', '🏄',
	'🛹',
	'🚲',
	'🛴', '🛴',
];
type test_2 = Expect<Equal<test_2_expected, test_2_actual>>;
// #endregion

