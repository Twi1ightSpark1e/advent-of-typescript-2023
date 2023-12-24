// https://stackoverflow.com/a/73555039
type Arr<Element, N, T extends unknown[] = []> = T['length'] extends N ? T : Arr<Element, N, [...T, Element]>
type Min<Union> = (Arr<unknown, Union> & Array<unknown>)['length'];

type BoxToys<T, Amount, Result = never> = Amount extends never ? Result : Result | Arr<T, Amount> | BoxToys<T, Exclude<Amount, Min<Amount>>>;

// #region tests
import { Expect, Equal } from './type-testing';

type test_doll_actual = BoxToys<'doll', 1>;
type test_doll_expected = ['doll'];
type test_doll = Expect<Equal<test_doll_expected, test_doll_actual>>;

type test_nutcracker_actual = BoxToys<'nutcracker', 3 | 4>;
type test_nutcracker_expected =
  | ['nutcracker', 'nutcracker', 'nutcracker']
  | ['nutcracker', 'nutcracker', 'nutcracker', 'nutcracker'];
type test_nutcracker = Expect<Equal<test_nutcracker_expected, test_nutcracker_actual>>;
// #endregion

