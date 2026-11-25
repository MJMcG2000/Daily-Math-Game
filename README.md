# Mathdle

A daily math puzzle in the spirit of Wordle. Every day, every player gets the same three problems:

| # | Difficulty | Content | Score weight | Full-points time |
|---|------------|---------|--------------|------------------|
| 1 | Easy | Pre-algebra / Algebra 1 | ×1 | 3 min |
| 2 | Medium | Geometry, Algebra 2, Precalculus, Trigonometry | ×2 | 6 min |
| 3 | Hard | Calculus 1 and Calculus 2, alternating by day | ×3 | 10 min |

Every problem is meant to be worked out on paper, and its answer is a single exact value such as `3pi/4`, `2sqrt(5)`, `ln(3)` or `inf`.
The game is fully static: there is no backend, and the day's problems are chosen from the date.

## Playing

- **3 guesses** per problem. A wrong guess tells you whether the answer is **higher ↑** or **lower ↓**. It is marked **≈ close** if it is within 10% of the answer, otherwise **✗ wrong**.
- **2 hints** per problem: first a nudge toward the approach, then a key intermediate step. Each hint costs 0.5 points.
- **Give up** at any time to see the answer and the worked solution straight away. The problem scores 0, shows a 🏳️ in the share grid, and counts as not solved. In Endless mode it resets your Practice streak or ends your Survival run.
- After a problem is solved or out of guesses, its full worked solution is shown one step at a time.
- No spoilers: a problem's topic (for example "Integration by parts") stays hidden until you finish it, because it names the method. Hard problems show only whether they're Calc 1 or Calc 2.
- Problems can be done in any order. A problem stays hidden until you reveal it, and revealing it starts its timer. The timer pauses when you switch problems, switch browser tabs or open a menu.
- A new puzzle unlocks at **local midnight**, with a countdown on screen.

### Endless mode

Switch to **Endless** at the top of the page, or open the site with `#endless` at the end of the URL. There are two options:

- **Practice:** pick Easy, Medium, Hard or Mixed and get one problem after another. The game tracks your current streak, best streak and solve count. Skipping a problem you've started, or switching difficulty mid-problem, resets the streak.
- **Survival:** problems 1–3 are Easy, 4–6 are Medium, and everything after that is Hard. The run ends at the first problem you don't solve, and your best run is saved. Sharing a run shows a coloured bar for the problems solved, with no spoilers.

Endless mode has no timer or points. It never serves today's daily problems, and it doesn't touch your daily stats or streaks. Each difficulty is dealt from its own shuffled queue, so a problem doesn't repeat until you've seen the rest of that difficulty.

### Scoring

```
base       = 3 / 2 / 1 points for solving on guess 1 / 2 / 3   (0 if not solved)
after hint = max(0.5, base − 0.5 × hints used)
time       = 1.0 up to the target time, then falls in a straight line to 0.5 at 3× the target (never lower)
score      = after hint × time × weight          (weight: easy 1, medium 2, hard 3)
```

The best possible day is **18** points.

### Stats and sharing

Stats are kept in your browser's `localStorage`:
- the **Perfect streak** (days in a row with all 3 problems solved);
- the **Solve streak** (days in a row with at least 1 solved);
- days played, average and best score;
- solve rate, guess distribution and average solve time for each difficulty.

**Share** copies a grid with no spoilers:

```
Mathdle #42 — 2/3 · 6/18 pts
① 🟩 1:12
② 🟨🟩 💡 4:30
③ 🟥🟥🟥 💡💡 10:00
```

🟩 correct · 🟨 close · 🟥 wrong · ⬜ not attempted · 💡 a hint used.

## Answer syntax

The input box shows a live KaTeX preview of how your answer was read. An answer that can't be parsed shows a friendly error and **never costs a guess**. Two answers count as equal if they agree to a relative tolerance of 1e-6, so `1/2`, `0.5`, `2/4` and `sin(pi/6)` are all the same answer.

| Meaning | Type it as |
|---|---|
| π | `pi`, `Pi`, `PI`, `π` |
| e (Euler's number) | `e`, so `2e` = 2·e and `epi` = e·π |
| Scientific notation | a number followed **directly** by `e` and an integer: `1e3` = 1000, `2.5e-4`. Note that `2e+1` means 2·e + 1. |
| Square root | `sqrt(2)`, `sqrt2`, `√2`, `√(2)`, `2^(1/2)` |
| Cube root | `cbrt(8)`, `∛8`, `8^(1/3)` (real cube root, so `cbrt(-8)` = −2) |
| Natural log | `ln(x)`, or `log_e(x)` |
| Base-10 log | `log(x)` |
| Other bases | `log_2(8)`, `log_(1/2)(8)`, `log(8, 2)` |
| Trig (radians) | `sin cos tan sec csc cot`, and `sin^2(x)` means (sin x)² |
| Inverse trig | `arcsin`/`asin`, `arccos`/`acos`, `arctan`/`atan` (plus `arcsec`, `arccsc`, `arccot`) |
| Infinity | `inf`, `infinity`, `∞`, `-inf` |
| Powers | `^` or `**`, plus `²`, `³` |
| Multiplication | `*`, `·`, `×`, or implied: `2pi`, `3sqrt(2)`, `2(3+1)`, `(1/2)ln(3)`, `4π²` |

Precedence rules:
- Implied multiplication binds like `*`, left to right: `1/2pi` is ½·π, so write `1/(2pi)` for 1/(2π).
- A function written without parentheses takes the next number or constant, with its exponent: `sqrt2pi` = √2·π, `ln3` = ln 3.
- `-2^2` = −4, and `^` is right-associative.

The parser is in [`src/lib/parse.ts`](src/lib/parse.ts) and its tests are in [`src/lib/parse.test.ts`](src/lib/parse.test.ts). The pipeline is:
1. Normalize the input: Unicode symbols, case and whitespace.
2. Tokenize it, handling `e` versus scientific notation, splitting names like `sqrt2` and `pie`, and `log_b`.
3. Parse it with a recursive-descent parser, which makes implied multiplication explicit.
4. Evaluate the result and render the preview with **mathjs**.

## Development

Requirements: Node 20 or newer. Python 3.10 or newer is needed only for the problem-bank scripts.

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:5173.

```bash
npm test
```

This runs the Vitest unit tests: parser, checker, scoring, daily selection, streaks and share text.

```bash
npm run build
```

This produces the static site in `dist/`.

```bash
npm run preview
```

This serves the built `dist/` folder locally.

### Problem gallery (for authors)

With `npm run dev` running, open `http://localhost:5173/?gallery=hard` (or `easy`, `medium`, `all`, or a problem id such as `h019`).
It shows every problem with its answer, hints, diagram and full solution, for proofreading. The gallery exists only in development and is not included in production builds.

## The problem bank

The game reads `data/problems/{easy,medium,hard}.json`, which holds 100 problems per difficulty. The hard bank has 50 Calc 1 and 50 Calc 2 problems. Each entry looks like this:

```jsonc
{
  "id": "h042",
  "difficulty": "hard",
  "course": "calc1",                 // hard only: calc1 | calc2
  "topic": "u-substitution",
  "prompt": "Evaluate $$\\int_0^{\\sqrt{3}}\\frac{4x}{x^2 + 1}\\,dx.$$",  // text with $inline$ / $$display$$ LaTeX; literal dollar sign = \\$
  "answer": "4ln(2)",                // exact answer in the game's own input syntax
  "answerNumeric": 2.772588722239781,// or "inf" / "-inf"
  "hint1": "…", "hint2": "…",
  "subject": "Calculus 1",            // behind the scenes: Pre-Algebra … Calculus 2
  "gradeLevel": 12,                  // behind the scenes: estimated US grade, 6–12 (13 = first-year college)
  "solutionDiagram": "<svg …>",      // optional diagram shown with the worked solution
  "solutionDiagramAlt": "…",         // required with a solution diagram (also shown as its caption)
  "keyIdea": "…",                    // one or two sentences: the insight that unlocks the problem
  "solutionSteps": ["…", "…", "…"],  // each step says what is done and why; **bold** lead-ins allowed
  "diagram": "<svg …>",              // optional inline SVG drawn with currentColor
  "diagramAlt": "…"                  // required with a diagram
}
```

### Categories (behind the scenes)

Every problem carries a `subject` and an estimated US `gradeLevel`. Players never see them; they show up only in the JSON files and the development gallery. Current counts:

| Subject | Problems | Typical grade |
|---|---|---|
| Pre-Algebra | 33 | 6–8 |
| Algebra 1 | 63 | 8–10 |
| Geometry | 30 | 8–10 |
| Algebra 2 | 26 | 10–11 |
| Trigonometry | 20 | 11 |
| Precalculus | 28 | 11–12 |
| Calculus 1 | 50 | 12 |
| Calculus 2 | 50 | 13 (first-year college; AP Calculus BC students meet it in grade 12) |

### How the daily problems are chosen

- The day number is the count of local calendar days since `EPOCH` in [`src/lib/daily.ts`](src/lib/daily.ts). Puzzle #1 is 2026-11-24; change it before launch if you like.
- Each bank is sorted by `id`, then shuffled with a seeded generator (mulberry32 seeded by FNV-1a) separately for each pass through the bank. Nothing repeats until a bank is used up, and the order of entries in the JSON file doesn't matter.
- The hard problem alternates between Calc 1 (even days) and Calc 2 (odd days). Each course is its own pool with its own shuffle.
- Once a player starts a day, the problem IDs are saved. A deploy that changes the banks mid-day won't swap out problems that someone is already working on.
- Adding problems changes which problems future days get, because the shuffle depends on the bank's size. Past days are not stored anywhere, so this is harmless.

### Adding problems

The JSON files are generated. The source of truth is in `scripts/bank/*.py`, where each problem is written as Python with two things:
- the exact `answer` string players see;
- a sympy `check` that **recomputes the answer from the problem statement**, for example by solving the equation, doing the integral or summing the series.

```python
P('e101', 'Quadratics',
  r'Find the larger solution of $x^2 - 6x + 4 = 0$.',
  '3+sqrt(5)', lambda: max(solve(x**2 - 6*x + 4, x)),
  r'Complete the square.',
  r'$(x - 3)^2 = 5$.',
  [r'...', r'...', r'The larger solution is $3 + \sqrt5$.'])
```

Each problem's explanation lives in `scripts/bank/explain_*.py`, keyed by problem ID. An entry holds the **key idea** and the **worked solution steps**, and each step should say *why* it is done, not just what is computed. Start a step with a short `**bold**` label. Diagrams for worked solutions live in `scripts/bank/solution_diagrams.py`. They are drawn to scale in real math coordinates with the small helper in `scripts/bank/plot.py`. Its **subject and estimated grade level** come from `scripts/bank/categories.py`: each topic has a default, and individual problems can override it.

1. Add entries to a module in `scripts/bank/`, then add the explanation and, for a new topic, a category default. To add a new module, list it in `SOURCES` in `scripts/build_bank.py`.
2. Install the Python dependencies once:

   ```bash
   pip install -r scripts/requirements.txt
   ```

3. Rebuild the JSON files:

   ```bash
   npm run bank
   ```

4. Verify the bank:

   ```bash
   npm run verify
   ```

`scripts/verify.py` checks every problem and exits with an error if any check fails. For each problem it checks that:
- the independent sympy `check()` equals `answerNumeric`;
- sympy, reading the `answer` string, gets the same value;
- the game's own TypeScript parser accepts `answer` and gets the same value (through `scripts/check_bank.ts`);
- every LaTeX fragment renders in KaTeX;
- the required fields, unique IDs, at least 3 solution steps, a course tag on hard problems, and alt text on diagrams are all present;
- for a rational answer, the final solution steps actually show it;
- there is a key idea, and the solution explains itself in words rather than being a list of bare equations;
- `subject` and `gradeLevel` are valid.

It also checks bank sizes: at least 100 per difficulty and 50 per calculus course.

It also **flags easy problems that look trivial**, meaning a short prompt with little structure or a tiny answer from a short computation. Make a flagged problem harder, or, if it really does need paper, add `extra={'reviewed_nontrivial': 'why'}`. The verifier then prints the override as a warning instead of failing.

## Deploying

The build uses a relative `base` (`./`), so the same `dist/` works at a domain root or in a sub-path.

### GitHub Pages

1. Push to `main`.
2. In the repository, go to **Settings → Pages → Source** and choose **GitHub Actions**.
3. The workflow in `.github/workflows/deploy.yml` runs the unit tests, verifies the bank, builds the site and publishes `dist/`.

### Vercel

1. Import the repository in Vercel. It detects Vite automatically.
2. Use build command `npm run build` and output directory `dist`.

Or deploy from the command line:

```bash
npx vercel --prod
```

### Any static host

```bash
npm run build
```

Then upload the `dist/` folder.

## Accessibility

- Every control can be reached and used from the keyboard. The problem tabs use arrow keys, and the dialogs are native `<dialog>` elements with focus handling and Esc to close.
- Screen readers get labels on all icon buttons, a polite live region announcing the feedback for each guess, and alt text on every diagram.
- Feedback never relies on colour alone: each mark has an icon (✓ ≈ ✗), a text label and an arrow.
- Light and dark themes follow the system setting, with a manual toggle. Diagrams use `currentColor`, so they follow the theme.
- Reduced-motion preferences are respected.

## Project layout

```
data/problems/          generated problem banks (JSON)
scripts/bank/           problem source of truth (Python + sympy checks)
scripts/build_bank.py   bank modules → JSON
scripts/verify.py       verification (sympy + game parser + KaTeX)
scripts/check_bank.ts   runs the bank through the game's parser and KaTeX
src/lib/                parser, checker, scoring, daily selection, stats, share
src/components/         React UI
```
