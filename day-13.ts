// https://github.com/microsoft/TypeScript/issues/27024#issuecomment-421529650
type Equals<X, Y> = 
	(<T>() => T extends X ? 1 : 2) extends
	(<T>() => T extends Y ? 1 : 2) ? true : false;

// https://stackoverflow.com/a/73555039
type Arr<N, T extends unknown[] = []> = Equals<T['length'], N> extends true ? T : Arr<N, [...T, unknown]>
type Increment<T> = [...Arr<T>, unknown]['length'];

type DayCounter<N1, N2> = Equals<N1, N2> extends true ? N1 : N1 | DayCounter<Increment<N1>, N2>;

// #region tests
import { Expect, Equal } from './type-testing';

type TwelveDaysOfChristmas = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
type test_0_actual = DayCounter<1, 12>;
type test_0_expected = TwelveDaysOfChristmas;
type test_0 = Expect<Equal<test_0_expected, test_0_actual>>;

type DaysUntilChristmas =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20
  | 21 | 22 | 23 | 24 | 25;
type test_1_actual = DayCounter<1, 25>;
type test_1_expected = DaysUntilChristmas;
type test_1 = Expect<Equal<test_1_expected, test_1_actual>>;
// #endregion

