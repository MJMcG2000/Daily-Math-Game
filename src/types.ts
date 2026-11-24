export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Problem {
  id: string;
  difficulty: Difficulty;
  /** Hard problems only: which course the problem belongs to. Hard days alternate calc1/calc2. */
  course?: 'calc1' | 'calc2';
  topic: string;
  /** Text with inline LaTeX in $...$ and display LaTeX in $$...$$. */
  prompt: string;
  /** Exact answer written in the game's own input syntax, e.g. "3pi/4", "2sqrt(5)", "ln(3)", "inf". */
  answer: string;
  answerNumeric: number | 'inf' | '-inf';
  hint1: string;
  hint2: string;
  solutionSteps: string[];
  /** Optional inline SVG markup. Use currentColor so it follows the theme. */
  diagram?: string;
  /** Required when diagram is present: a text description for screen readers. */
  diagramAlt?: string;
}

export type Mark = 'correct' | 'close' | 'wrong';

export interface GuessRecord {
  input: string;
  value: number;
  mark: Mark;
  /** Direction the true answer lies relative to this guess. */
  direction?: 'higher' | 'lower';
}

export interface ProblemState {
  id: string;
  guesses: GuessRecord[];
  hintsUsed: number;
  status: 'playing' | 'solved' | 'failed';
  /** The prompt is hidden until the player starts the problem; this also starts its timer. */
  started: boolean;
  /** Active time spent on the problem, in milliseconds. */
  elapsedMs: number;
}

export interface DayState {
  day: number;
  problems: ProblemState[];
}
