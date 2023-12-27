// #region initial types
type Alley = "  ";
type MazeItem = "🎄" | "🎅" | Alley;
type DELICIOUS_COOKIES = "🍪";
type MazeRow = MazeItem[];
type MazeMatrix = MazeRow[];
type Directions = "up" | "down" | "left" | "right";
// #endregion

// #region arithmetics
type Length<T extends object> = T extends { length: number } ? number & T["length"] : never;

// https://stackoverflow.com/a/69413070
type NonNegativeInteger<T extends number> = number extends T
	? never
	: `${T}` extends `-${string}` | `${string}.${string}`
		? never
		: T;

// https://stackoverflow.com/a/73555039
type Arr<
	N extends number,
	Element = unknown,
	T extends Element[] = [],
> = NonNegativeInteger<N> extends never
	? []
	: T["length"] extends N
		? T
		: Arr<N, Element, [...T, Element]>;
type Inc<T> = T extends number ? Length<[...Arr<T>, unknown]> : unknown;
type Dec<T> = T extends number
	? Arr<T> extends [infer Head, ...infer Tail]
		? Length<Tail>
		: unknown
	: unknown;
// #endregion

// #region find santa
type SantaInRow<
	Forest extends Array<MazeItem>,
	Depth extends Array<MazeItem> = [],
> = Forest extends [infer Head extends MazeItem, ...infer Tail extends MazeItem[]]
	? Head extends "🎅"
		? Length<Depth>
		: SantaInRow<Tail, [Head, ...Depth]>
	: never;

type FindSanta<
	Grid extends Array<Array<MazeItem>>,
	Depth extends Array<Array<MazeItem>> = [],
> = Grid extends [infer Row extends MazeItem[], ...infer Rows extends MazeItem[][]]
	? SantaInRow<Row> extends never
		? FindSanta<Rows, [Row, ...Depth]>
		: [Length<Depth>, SantaInRow<Row>] & [number, number]
	: never;
// #endregion

// #region XY setters
type SetItem<
	Row extends MazeRow,
	Index extends number | unknown,
	Value extends MazeItem,
	Result extends MazeRow = [],
> = Row extends [infer Head extends MazeItem, ...infer Tail extends Array<MazeItem>]
	? Index extends 0
		? SetItem<Tail, 999, Value, [...Result, Value]>
		: SetItem<Tail, Dec<Index>, Value, [...Result, Head]>
	: Result;

type SetRow<
	Grid extends MazeMatrix,
	Index extends number | unknown,
	Value extends MazeRow,
	Result extends MazeMatrix = [],
> = Grid extends [infer Head extends MazeRow, ...infer Tail extends MazeMatrix]
	? Index extends 0
		? SetRow<Tail, 999, Value, [...Result, Value]>
		: SetRow<Tail, Dec<Index>, Value, [...Result, Head]>
	: Result;

type PlaceItem<
	Grid extends MazeMatrix,
	Coordinates extends [number, number],
	Item extends MazeItem,
> = SetRow<Grid, Coordinates[0], SetItem<Grid[Coordinates[0]], Coordinates[1], Item>>;
// #endregion

type IsPlaceOccupied<
	Grid extends MazeMatrix,
	Coordinates extends [number, number],
> = Grid[Coordinates[0]][Coordinates[1]] extends Alley ? false : true;

type NewCoordinates<
	Coordinates extends [number, number],
	Direction extends Directions,
> = Direction extends "up"
	? [Dec<Coordinates[0]>, Coordinates[1]]
	: Direction extends "down"
		? [Inc<Coordinates[0]>, Coordinates[1]]
		: Direction extends "left"
			? [Coordinates[0], Dec<Coordinates[1]>]
			: Direction extends "right"
				? [Coordinates[0], Inc<Coordinates[1]>]
				: never;

type ReplaceGridWith<
	Grid extends MazeMatrix,
	Item extends string,
	Result extends string[][] = [],
> = Grid extends [infer Row extends MazeRow, ...infer Tail extends MazeMatrix]
	? ReplaceGridWith<Tail, Item, [...Result, Arr<Length<Row>, Item>]>
	: Result;

type Move<Grid extends MazeMatrix, Direction extends Directions> = NewCoordinates<
	FindSanta<Grid>,
	Direction
> extends [infer Y extends number, infer X extends number]
	? IsPlaceOccupied<Grid, [Y, X]> extends true
		? Grid
		: PlaceItem<PlaceItem<Grid, FindSanta<Grid>, Alley>, [Y, X], "🎅">
	: ReplaceGridWith<Grid, DELICIOUS_COOKIES>;

// #region tests
import { Equal, Expect } from './type-testing';

type Maze0 = [
  ["🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎅", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "  ", "🎄", "  ", "  ", "  ", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "  ", "🎄", "  ", "🎄", "  ", "🎄"],
  ["🎄", "  ", "  ", "  ", "  ", "🎄", "  ", "🎄", "  ", "🎄"],
  ["  ", "  ", "🎄", "🎄", "  ", "  ", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "  ", "🎄", "🎄", "  ", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "  ", "🎄", "🎄", "  ", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "  ", "  ", "  ", "  ", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄"],
];

// can't move up!
type test_maze0_up_actual = Move<Maze0, 'up'>;
type test_maze0_up = Expect<Equal<test_maze0_up_actual, Maze0>>;


// but Santa can move down!
type test_maze0_down_actual = Move<Maze0, 'down'>;
type Maze1 = [
  ["🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "  ", "🎄", "🎅", "  ", "  ", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "  ", "🎄", "  ", "🎄", "  ", "🎄"],
  ["🎄", "  ", "  ", "  ", "  ", "🎄", "  ", "🎄", "  ", "🎄"],
  ["  ", "  ", "🎄", "🎄", "  ", "  ", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "  ", "🎄", "🎄", "  ", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "  ", "🎄", "🎄", "  ", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "  ", "  ", "  ", "  ", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄"],
];
type test_maze0_down = Expect<Equal<test_maze0_down_actual, Maze1>>;


// Santa can move down again!
type test_maze1_down_actual = Move<Maze1, 'down'>;
type Maze2 = [
  ["🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "  ", "🎄", "  ", "  ", "  ", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "  ", "🎄", "🎅", "🎄", "  ", "🎄"],
  ["🎄", "  ", "  ", "  ", "  ", "🎄", "  ", "🎄", "  ", "🎄"],
  ["  ", "  ", "🎄", "🎄", "  ", "  ", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "  ", "🎄", "🎄", "  ", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "  ", "🎄", "🎄", "  ", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "  ", "  ", "  ", "  ", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄"],
];
type test_maze1_down = Expect<Equal<test_maze1_down_actual, Maze2>>;


// can't move left!
type test_maze2_left_actual = Move<Maze2, 'left'>;
type test_maze2_left = Expect<Equal<test_maze2_left_actual, Maze2>>;


// if Santa moves up, it's back to Maze1!
type test_maze2_up_actual = Move<Maze2, 'up'>;
type test_maze2_up = Expect<Equal<test_maze2_up_actual, Maze1>>;


// can't move right!
type test_maze2_right_actual = Move<Maze2, 'right'>;
type test_maze2_right = Expect<Equal<test_maze2_right_actual, Maze2>>;


// we exhausted all other options! guess we gotta go down!
type test_maze2_down_actual = Move<Maze2, 'down'>;
type Maze3 = [
  ["🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "  ", "🎄", "  ", "  ", "  ", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "  ", "🎄", "  ", "🎄", "  ", "🎄"],
  ["🎄", "  ", "  ", "  ", "  ", "🎄", "🎅", "🎄", "  ", "🎄"],
  ["  ", "  ", "🎄", "🎄", "  ", "  ", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "  ", "🎄", "🎄", "  ", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "  ", "🎄", "🎄", "  ", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "  ", "  ", "  ", "  ", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄"],
];
type test_maze2_down = Expect<Equal<test_maze2_down_actual, Maze3>>;


// maybe we just gotta go down all the time?
type test_maze3_down_actual = Move<Maze3, 'down'>;
type Maze4 = [
  ["🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "  ", "🎄", "  ", "  ", "  ", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "  ", "🎄", "  ", "🎄", "  ", "🎄"],
  ["🎄", "  ", "  ", "  ", "  ", "🎄", "  ", "🎄", "  ", "🎄"],
  ["  ", "  ", "🎄", "🎄", "  ", "  ", "🎅", "🎄", "🎄", "🎄"],
  ["🎄", "  ", "🎄", "🎄", "  ", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "  ", "🎄", "🎄", "  ", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "  ", "  ", "  ", "  ", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄"],
];
type test_maze3_down = Expect<Equal<test_maze3_down_actual, Maze4>>;


// let's go left this time just to change it up?
type test_maze4_left_actual = Move<Maze4, 'left'>;
type Maze5 = [
  ["🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "  ", "🎄", "  ", "  ", "  ", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "  ", "🎄", "  ", "🎄", "  ", "🎄"],
  ["🎄", "  ", "  ", "  ", "  ", "🎄", "  ", "🎄", "  ", "🎄"],
  ["  ", "  ", "🎄", "🎄", "  ", "🎅", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "  ", "🎄", "🎄", "  ", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "  ", "🎄", "🎄", "  ", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "  ", "  ", "  ", "  ", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄"],
];
// it worked!
type test_maze4_left = Expect<Equal<test_maze4_left_actual, Maze5>>;


// couldn't hurt to try left again?
type test_maze5_left_actual = Move<Maze5, 'left'>;
type Maze6 = [
  ["🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "  ", "🎄", "  ", "  ", "  ", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "  ", "🎄", "  ", "🎄", "  ", "🎄"],
  ["🎄", "  ", "  ", "  ", "  ", "🎄", "  ", "🎄", "  ", "🎄"],
  ["  ", "  ", "🎄", "🎄", "🎅", "  ", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "  ", "🎄", "🎄", "  ", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "  ", "🎄", "🎄", "  ", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "  ", "  ", "  ", "  ", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄"],
];
type test_maze5_left = Expect<Equal<test_maze5_left_actual, Maze6>>;


// three time's a charm?
type test_maze6_left_actual = Move<Maze6, 'left'>;
// lol, nope.
type test_maze6_left = Expect<Equal<test_maze6_left_actual, Maze6>>;


// we haven't tried up yet (?)
type test_maze6_up_actual = Move<Maze6, 'up'>;
type Maze7 = [
  ["🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "  ", "🎄", "  ", "  ", "  ", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "  ", "🎄", "  ", "🎄", "  ", "🎄"],
  ["🎄", "  ", "  ", "  ", "🎅", "🎄", "  ", "🎄", "  ", "🎄"],
  ["  ", "  ", "🎄", "🎄", "  ", "  ", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "  ", "🎄", "🎄", "  ", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "  ", "🎄", "🎄", "  ", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "  ", "  ", "  ", "  ", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄"],
];
// NOICE.
type test_maze6_up = Expect<Equal<test_maze6_up_actual, Maze7>>;


// maybe another left??
type test_maze7_left_actual = Move<Maze7, 'left'>;
type Maze8 = [
  ["🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "  ", "🎄", "  ", "  ", "  ", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "  ", "🎄", "  ", "🎄", "  ", "🎄"],
  ["🎄", "  ", "  ", "🎅", "  ", "🎄", "  ", "🎄", "  ", "🎄"],
  ["  ", "  ", "🎄", "🎄", "  ", "  ", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "  ", "🎄", "🎄", "  ", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "  ", "🎄", "🎄", "  ", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "  ", "  ", "  ", "  ", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄"],
];
type test_maze7_left = Expect<Equal<test_maze7_left_actual, Maze8>>;


// haven't tried a right yet.. let's give it a go!
type test_maze7_right_actual = Move<Maze8, 'right'>;
// not this time...
type test_maze7_right = Expect<Equal<test_maze7_right_actual, Maze7>>;


// probably just need to stick with left then
type test_maze8_left_actual = Move<Maze8, 'left'>;
type Maze9 = [
  ["🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "  ", "🎄", "  ", "  ", "  ", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "  ", "🎄", "  ", "🎄", "  ", "🎄"],
  ["🎄", "  ", "🎅", "  ", "  ", "🎄", "  ", "🎄", "  ", "🎄"],
  ["  ", "  ", "🎄", "🎄", "  ", "  ", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "  ", "🎄", "🎄", "  ", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "  ", "🎄", "🎄", "  ", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "  ", "  ", "  ", "  ", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄"],
];
type test_maze8_left = Expect<Equal<test_maze8_left_actual, Maze9>>;


// why fix what's not broken?
type test_maze9_left_actual = Move<Maze9, 'left'>;
type Maze10 = [
  ["🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "  ", "🎄", "  ", "  ", "  ", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "  ", "🎄", "  ", "🎄", "  ", "🎄"],
  ["🎄", "🎅", "  ", "  ", "  ", "🎄", "  ", "🎄", "  ", "🎄"],
  ["  ", "  ", "🎄", "🎄", "  ", "  ", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "  ", "🎄", "🎄", "  ", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "  ", "🎄", "🎄", "  ", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "  ", "  ", "  ", "  ", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄"],
];
type test_maze9_left = Expect<Equal<test_maze9_left_actual, Maze10>>;


// do you smell cookies?? it's coming from down..
type test_maze10_down_actual = Move<Maze10, 'down'>;
type Maze11 = [
  ["🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "  ", "🎄", "  ", "  ", "  ", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "  ", "🎄", "  ", "🎄", "  ", "🎄"],
  ["🎄", "  ", "  ", "  ", "  ", "🎄", "  ", "🎄", "  ", "🎄"],
  ["  ", "🎅", "🎄", "🎄", "  ", "  ", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "  ", "🎄", "🎄", "  ", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "  ", "🎄", "🎄", "  ", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "  ", "  ", "  ", "  ", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄"],
];
type test_maze10_down = Expect<Equal<test_maze10_down_actual, Maze11>>;


// the cookies must be freshly baked.  I hope there's also the customary glass of milk!
type test_maze11_left_actual = Move<Maze11, 'left'>;
type Maze12 = [
  ["🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "  ", "🎄", "  ", "  ", "  ", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "  ", "🎄", "  ", "🎄", "  ", "🎄"],
  ["🎄", "  ", "  ", "  ", "  ", "🎄", "  ", "🎄", "  ", "🎄"],
  ["🎅", "  ", "🎄", "🎄", "  ", "  ", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "  ", "🎄", "🎄", "  ", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "  ", "🎄", "🎄", "  ", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "  ", "  ", "  ", "  ", "🎄", "  ", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄", "🎄"],
];
type test_maze11_left = Expect<Equal<test_maze11_left_actual, Maze12>>;


// COOKIES!!!!!
type test_maze12_left_actual = Move<Maze12, 'left'>;
type MazeWin = [
  ["🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪"],
  ["🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪"],
  ["🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪"],
  ["🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪"],
  ["🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪"],
  ["🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪"],
  ["🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪"],
  ["🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪"],
  ["🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪"],
  ["🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪", "🍪"],
];
type test_maze12_left = Expect<Equal<test_maze12_left_actual, MazeWin>>;
// #endregion

