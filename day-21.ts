// #region initial types
type TicTacToeChip = "❌" | "⭕";
type TicTacToeEndState = "❌ Won" | "⭕ Won" | "Draw";
type TicTacToeState = TicTacToeChip | TicTacToeEndState;
type TicTacToeEmptyCell = "  ";
type TicTacToeCell = TicTacToeChip | TicTacToeEmptyCell;
type TicTacToeYPositions = "top" | "middle" | "bottom";
type TicTacToeXPositions = "left" | "center" | "right";
type TicTacToePositions = `${TicTacToeYPositions}-${TicTacToeXPositions}`;
type TicTacToeRow = [TicTacToeCell, TicTacToeCell, TicTacToeCell];
type TicTacToeBoard = [TicTacToeRow, TicTacToeRow, TicTacToeRow];
type TicTacToeGame = {
	board: TicTacToeBoard;
	state: TicTacToeState;
};

type EmptyBoard = [["  ", "  ", "  "], ["  ", "  ", "  "], ["  ", "  ", "  "]];

type NewGame = {
	board: EmptyBoard;
	state: "❌";
};
// #endregion

// #region control the board
// #region XY getters and setters
type GetY<Board extends TicTacToeRow | TicTacToeBoard, Y extends TicTacToeYPositions> = Y extends "top" ? Board[0] : Y extends "middle" ? Board[1] : Board[2];
type GetX<Board extends TicTacToeRow | TicTacToeBoard, X extends TicTacToeXPositions> = X extends "left" ? Board[0] : X extends "center" ? Board[1] : Board[2];

type SetY<Board extends TicTacToeBoard, Y extends TicTacToeYPositions, Value extends TicTacToeRow> =
	Board extends [infer First, infer Second, infer Third]
		? Y extends "top"
			? [Value, Second, Third]
			: Y extends "middle"
				? [First, Value, Third]
				: [First, Second, Value]
		: never;
type SetX<Row extends TicTacToeRow, X extends TicTacToeXPositions, Value extends TicTacToeChip> =
	Row extends [infer First, infer Second, infer Third]
		? X extends "left"
			? [Value, Second, Third]
			: X extends "center"
				? [First, Value, Third]
				: [First, Second, Value]
		: never;
// #endregion

// #region chip placement
type IsPlaceOccupied<
	Board extends TicTacToeBoard,
	Y extends TicTacToeYPositions,
	X extends TicTacToeXPositions,
> = GetX<GetY<Board, Y>, X> extends TicTacToeEmptyCell ? false : true;

type PlaceChip<
	Board extends TicTacToeBoard,
	Chip extends TicTacToeChip,
	Y extends TicTacToeYPositions,
	X extends TicTacToeXPositions,
> = SetY<Board, Y, SetX<GetY<Board, Y>, X, Chip>>;
// #endregion
// #endregion

// #region board state
// #region board has at least one empty place to continue?
type HasCell<Rows extends TicTacToeCell[] | TicTacToeCell[][], Cell extends TicTacToeCell> =
  Rows extends [infer Head extends TicTacToeCell[], ...infer Tail extends TicTacToeCell[][]]
	  ? HasCell<Head, Cell> extends true
			? true
			: HasCell<Tail, Cell>
		: Rows extends [infer Head extends TicTacToeCell, ...infer Tail extends TicTacToeCell[]]
			? Head extends TicTacToeEmptyCell
				? true
				: HasCell<Tail, Cell>
			: false;
// #endregion

// #region board has valid row of single chips?
type GetCheckLines<Board extends TicTacToeBoard> =
	Board extends [[infer C1, infer C2, infer C3], [infer C4, infer C5, infer C6], [infer C7, infer C8, infer C9]]
		? [
			[C1, C2, C3],
			[C4, C5, C6],
			[C7, C8, C9],
			[C1, C4, C7],
			[C2, C5, C8],
			[C3, C6, C9],
			[C1, C5, C9],
			[C3, C5, C7],
		]
		: never;
type CheckLine<Row extends TicTacToeCell[], Element extends TicTacToeCell> =
	Row extends [infer Head extends TicTacToeCell, ...infer Tail extends TicTacToeCell[]]
		? Head extends Element
			? CheckLine<Tail, Element>
			: false
		: true;
type CheckLines<Rows extends TicTacToeCell[][], Element extends TicTacToeCell> =
  Rows extends [infer Head extends TicTacToeCell[], ...infer Tail extends TicTacToeCell[][]]
		? CheckLine<Head, Element> extends true
		  ? true
			: CheckLines<Tail, Element>
		: false
// #endregion

type GetState<Board extends TicTacToeBoard, PrevState extends TicTacToeChip> =
  CheckLines<GetCheckLines<Board>, "❌"> extends true
	  ? "❌ Won"
		: CheckLines<GetCheckLines<Board>, "⭕"> extends true
			? "⭕ Won"
			: HasCell<Board, TicTacToeEmptyCell> extends true
				? PrevState extends "❌" ? "⭕" : "❌"
				: "Draw";
// #endregion

type TicTacToe<
	Game extends TicTacToeGame,
	Move extends TicTacToePositions,
> = Move extends `${infer Y extends TicTacToeYPositions}-${infer X extends TicTacToeXPositions}`
	? Game["state"] extends TicTacToeEndState
		? Game
		: IsPlaceOccupied<Game["board"], Y, X> extends true
			? Game
			: {
				board: PlaceChip<Game["board"], Game["state"] & TicTacToeChip, Y, X>,
				state: GetState<PlaceChip<Game["board"], Game["state"] & TicTacToeChip, Y, X>, Game["state"] & TicTacToeChip>
			}
	: never;

// #region tests
import { Equal, Expect } from './type-testing';

type test_move1_actual = TicTacToe<NewGame, 'top-center'>;
type test_move1_expected = {
  board: [
    [ '  ', '❌', '  ' ],
    [ '  ', '  ', '  ' ],
    [ '  ', '  ', '  ' ]
  ];
  state: '⭕';
};
type test_move1 = Expect<Equal<test_move1_actual, test_move1_expected>>;

type test_move2_actual = TicTacToe<test_move1_actual, 'top-left'>;
type test_move2_expected = {
  board: [
    ['⭕', '❌', '  '], 
    ['  ', '  ', '  '], 
    ['  ', '  ', '  ']];
  state: '❌';
}
type test_move2 = Expect<Equal<test_move2_actual, test_move2_expected>>;

type test_move3_actual = TicTacToe<test_move2_actual, 'middle-center'>;
type test_move3_expected = {
  board: [
    [ '⭕', '❌', '  ' ],
    [ '  ', '❌', '  ' ],
    [ '  ', '  ', '  ' ]
  ];
  state: '⭕';
};
type test_move3 = Expect<Equal<test_move3_actual, test_move3_expected>>;

type test_move4_actual = TicTacToe<test_move3_actual, 'bottom-left'>;
type test_move4_expected = {
  board: [
    [ '⭕', '❌', '  ' ],
    [ '  ', '❌', '  ' ],
    [ '⭕', '  ', '  ' ]
  ];
  state: '❌';
};
type test_move4 = Expect<Equal<test_move4_actual, test_move4_expected>>;


type test_x_win_actual = TicTacToe<test_move4_actual, 'bottom-center'>;
type test_x_win_expected = {
  board: [
    [ '⭕', '❌', '  ' ],
    [ '  ', '❌', '  ' ],
    [ '⭕', '❌', '  ' ]
  ];
  state: '❌ Won';
};
type test_x_win = Expect<Equal<test_x_win_actual, test_x_win_expected>>;

type type_move5_actual = TicTacToe<test_move4_actual, 'bottom-right'>;
type type_move5_expected = {
  board: [
    [ '⭕', '❌', '  ' ],
    [ '  ', '❌', '  ' ],
    [ '⭕', '  ', '❌' ]
  ];
  state: '⭕';
};
type test_move5 = Expect<Equal<type_move5_actual, type_move5_expected>>;

type test_o_win_actual = TicTacToe<type_move5_actual, 'middle-left'>;
type test_o_win_expected = {
  board: [
    [ '⭕', '❌', '  ' ],
    [ '⭕', '❌', '  ' ],
    [ '⭕', '  ', '❌' ]
  ];
  state: '⭕ Won';
};

// invalid move don't change the board and state
type test_invalid_actual = TicTacToe<test_move1_actual, 'top-center'>;
type test_invalid_expected = {
  board: [
    [ '  ', '❌', '  ' ],
    [ '  ', '  ', '  ' ],
    [ '  ', '  ', '  ' ]
  ];
  state: '⭕';
};
type test_invalid = Expect<Equal<test_invalid_actual, test_invalid_expected>>;

type test_before_draw = {
  board: [
    ['⭕', '❌', '⭕'], 
    ['⭕', '❌', '❌'], 
    ['❌', '⭕', '  ']];
  state: '⭕';
}
type test_draw_actual = TicTacToe<test_before_draw, 'bottom-right'>;
type test_draw_expected = {
  board: [
    ['⭕', '❌', '⭕'], 
    ['⭕', '❌', '❌'], 
    ['❌', '⭕', '⭕']];
  state: 'Draw';
}
type test_draw = Expect<Equal<test_draw_actual, test_draw_expected>>;
// #endregion

