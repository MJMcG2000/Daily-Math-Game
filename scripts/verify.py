#!/usr/bin/env python3
"""Verify the Mathdle problem bank.

For every problem in data/problems/*.json this checks that:
  1. an independent sympy computation (the `check` in scripts/bank/*.py, which works the
     problem out from its statement) equals answerNumeric;
  2. the exact `answer` string, read by sympy, equals answerNumeric;
  3. the game's own TypeScript parser accepts `answer` and gets the same value;
  4. every LaTeX fragment renders with KaTeX;
  5. the entry has the required fields, a unique id, hints, at least 3 solution steps,
     a course tag (hard), and alt text for any diagram;
  6. the final solution step shows the answer (for rational answers);
  7. easy problems are not trivially solvable without paper (heuristic, see `trivial`).
It also checks bank sizes. Exit code 1 on any failure.

Usage:  python3 scripts/verify.py
"""
import importlib
import json
import math
import pathlib
import re
import subprocess
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
import sympy as sp  # noqa: E402

from answer_sympy import answer_to_sympy  # noqa: E402
from build_bank import SOURCES  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parent.parent
MIN_PER_BANK = 100
REL_TOL = 1e-9

failures: list[str] = []
warnings: list[str] = []


def fail(pid, msg):
    failures.append(f'{pid}: {msg}')


def to_float(v):
    if v in ('inf', sp.oo):
        return math.inf
    if v in ('-inf', -sp.oo):
        return -math.inf
    v = sp.N(v, 30)
    if not v.is_real:
        if abs(sp.im(v)) > 1e-20:
            raise ValueError(f'non-real value {v}')
        v = sp.re(v)
    return float(v)


def close(a: float, b: float) -> bool:
    if math.isinf(a) or math.isinf(b):
        return a == b
    return abs(a - b) <= REL_TOL * max(1.0, abs(b))


def checks_by_id():
    out = {}
    for diff, mods in SOURCES.items():
        for mod in mods:
            try:
                m = importlib.import_module(f'bank.{mod}')
            except ModuleNotFoundError as err:
                if err.name == f'bank.{mod}':
                    continue
                raise
            for p in m.PROBLEMS:
                if p.id in out:
                    fail(p.id, f'duplicate id in authoring modules ({mod})')
                out[p.id] = p
    return out


MATH = re.compile(r'(?<!\\)\$\$([\s\S]+?)\$\$|(?<!\\)\$([^$]+?)(?<!\\)\$')
OPS = re.compile(r'\\frac|\\tfrac|\\dfrac|\\sqrt|\\cdot|\\times|\\div|\^|[-+*/=()]|\\left')


def trivial(p) -> str | None:
    """Heuristic: an easy problem is 'trivial' if it can be done in one's head —
    a short prompt with very little structure, or a solution of fewer than 3 steps."""
    if len(p['solutionSteps']) < 3:
        return 'fewer than 3 solution steps'
    maths = ' '.join(a or b for a, b in MATH.findall(p['prompt']))
    ops = len(OPS.findall(maths))
    words = len(re.findall(r'[A-Za-z]{2,}', MATH.sub(' ', p['prompt'])))
    if ops < 4 and words < 15:
        return f'little structure (ops={ops}, words={words})'
    v = p['answerNumeric']
    if isinstance(v, (int, float)) and float(v).is_integer() and abs(v) <= 10 and ops < 6 and words < 12:
        return 'small integer answer to a short computation'
    return None


NUM = re.compile(r'-?\d+(?:\.\d+)?')
FRAC = re.compile(r'(-)?\s*\\[dt]?frac(?:\{(-?\d+)\}|(\d))(?:\{(\d+)\}|(\d))')


def final_step_shows_answer(p, value) -> bool:
    """For rational answers: the last solution step should mention the value."""
    if not isinstance(value, sp.Rational):
        return True
    text = ' '.join(p['solutionSteps'][-2:]).replace('{,}', '').replace(',', '')
    candidates = set()
    for neg, a1, a2, b1, b2 in FRAC.findall(text):
        candidates.add(sp.Rational(int(a1 or a2), int(b1 or b2)) * (-1 if neg else 1))
    for m in NUM.findall(text):
        candidates.add(sp.Rational(m))
    return value in candidates


def main():
    banks = {d: json.loads((ROOT / 'data' / 'problems' / f'{d}.json').read_text()) for d in SOURCES}
    checks = checks_by_id()

    proc = subprocess.run(['npx', 'tsx', 'scripts/check_bank.ts'], cwd=ROOT, capture_output=True, text=True)
    if proc.returncode != 0:
        print(proc.stderr)
        sys.exit('check_bank.ts failed')
    ts = json.loads(proc.stdout)

    seen = set()
    total = 0
    for diff, probs in banks.items():
        if len(probs) < MIN_PER_BANK:
            failures.append(f'[{diff}] only {len(probs)} problems (need {MIN_PER_BANK})')
        if diff == 'hard':
            for course in ('calc1', 'calc2'):
                cnt = sum(1 for p in probs if p.get('course') == course)
                if cnt < MIN_PER_BANK // 2:
                    failures.append(f'[hard] only {cnt} {course} problems (need {MIN_PER_BANK // 2})')
        for p in probs:
            total += 1
            pid = p.get('id', '?')
            for key in ('id', 'difficulty', 'topic', 'prompt', 'answer', 'answerNumeric', 'hint1', 'hint2', 'solutionSteps'):
                if key not in p or p[key] in ('', None, []):
                    fail(pid, f'missing {key}')
            if pid in seen:
                fail(pid, 'duplicate id')
            seen.add(pid)
            if p.get('difficulty') != diff:
                fail(pid, f'difficulty {p.get("difficulty")} in {diff}.json')
            if diff == 'hard' and p.get('course') not in ('calc1', 'calc2'):
                fail(pid, 'hard problem without course calc1/calc2')
            if p.get('diagram') and not p.get('diagramAlt'):
                fail(pid, 'diagram without diagramAlt')
            if not p.get('keyIdea'):
                fail(pid, 'missing keyIdea (add it in scripts/bank/explain_*.py)')
            prose = ' '.join(re.sub(r'\$\$[\s\S]*?\$\$|\$[^$]*\$', ' ', st)
                             for st in [p.get('keyIdea', ''), *p.get('solutionSteps', [])])
            if len(re.findall(r'[A-Za-z]{2,}', prose)) < 25:
                fail(pid, 'worked solution is mostly bare equations: explain the steps in words')
            if len(p.get('solutionSteps', [])) < 3:
                fail(pid, 'fewer than 3 solution steps')

            expected = to_float(p['answerNumeric'])

            # 1. independent recomputation
            src = checks.get(pid)
            if not src:
                fail(pid, 'no independent sympy check found in scripts/bank/')
            else:
                try:
                    got = src.check()
                    gf = to_float(got)
                    if not close(gf, expected):
                        fail(pid, f'check() = {got} ≈ {gf:.12g}, but answerNumeric = {expected:.12g}')
                except Exception as e:  # noqa: BLE001
                    fail(pid, f'check() raised {type(e).__name__}: {e}')

            # 2. sympy reading of the answer string
            try:
                av = answer_to_sympy(p['answer'])
                if not close(to_float(av), expected):
                    fail(pid, f'answer "{p["answer"]}" reads as {av} ≠ answerNumeric {expected}')
            except Exception as e:  # noqa: BLE001
                fail(pid, f'sympy cannot read answer "{p["answer"]}": {e}')
                av = None

            # 3. the game's parser
            tv = ts['answers'].get(pid)
            if isinstance(tv, dict):
                fail(pid, f'game parser rejects answer "{p["answer"]}": {tv["error"]}')
            elif tv is None or not close(to_float(tv), expected):
                fail(pid, f'game parser reads "{p["answer"]}" as {tv}, expected {expected}')

            # 4. LaTeX
            for err in ts['latexErrors'].get(pid, []):
                fail(pid, f'LaTeX: {err}')

            # 6. final step mentions the answer
            if av is not None and not final_step_shows_answer(p, sp.nsimplify(av)):
                fail(pid, f'final solution steps never show the answer {p["answer"]}')

            # 7. triviality
            if diff == 'easy':
                why = trivial(p)
                reviewed = src.extra.get('reviewed_nontrivial') if src else None
                if why and reviewed:
                    warnings.append(f'{pid}: flagged as possibly trivial ({why}); reviewed: {reviewed}')
                elif why:
                    fail(pid, f'easy problem looks trivial: {why}')

    print(f'Checked {total} problems: ' + ', '.join(f'{d} {len(v)}' for d, v in banks.items()))
    for w in warnings:
        print('WARN', w)
    if failures:
        print(f'\n{len(failures)} FAILURE(S):')
        for f in failures:
            print('  ✗', f)
        sys.exit(1)
    print('All checks passed ✓')


if __name__ == '__main__':
    main()
