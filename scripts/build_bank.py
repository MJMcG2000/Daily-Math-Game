#!/usr/bin/env python3
"""Build data/problems/{easy,medium,hard}.json from the authoring modules in scripts/bank/.

answerNumeric is computed from the exact `answer` string with sympy. Run verify.py afterwards.
"""
import importlib
import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
import sympy as sp  # noqa: E402

from answer_sympy import answer_to_sympy  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'data' / 'problems'
SOURCES = {
    'easy': ['easy_a', 'easy_b'],
    'medium': ['medium_a', 'medium_b'],
    'hard': ['hard_a', 'hard_b'],
}


def load(difficulty):
    problems = []
    for mod in SOURCES[difficulty]:
        try:
            m = importlib.import_module(f'bank.{mod}')
        except ModuleNotFoundError as err:
            if err.name == f'bank.{mod}':
                continue
            raise
        problems.extend(m.PROBLEMS)
    return problems


def numeric(answer: str):
    v = answer_to_sympy(answer)
    if v == sp.oo:
        return 'inf'
    if v == -sp.oo:
        return '-inf'
    return float(sp.N(v, 30))


def clean(text: str) -> str:
    # Authoring modules use raw strings, where \' (needed for apostrophes and primes) stays literal.
    return text.replace("\\'", "'")


def to_json(p, difficulty):
    p.prompt, p.hint1, p.hint2 = clean(p.prompt), clean(p.hint1), clean(p.hint2)
    p.steps = [clean(s) for s in p.steps]
    if p.alt:
        p.alt = clean(p.alt)
    d = {
        'id': p.id,
        'difficulty': difficulty,
        'topic': p.topic,
        'prompt': p.prompt,
        'answer': p.answer,
        'answerNumeric': numeric(p.answer),
        'hint1': p.hint1,
        'hint2': p.hint2,
        'solutionSteps': p.steps,
    }
    if p.course:
        d['course'] = p.course
    if p.diagram:
        d['diagram'] = p.diagram
        d['diagramAlt'] = p.alt
    return d


def main():
    for diff in SOURCES:
        probs = load(diff)
        if not probs:
            continue
        data = [to_json(p, diff) for p in probs]
        (OUT / f'{diff}.json').write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n')
        print(f'{diff}: {len(data)} problems')


if __name__ == '__main__':
    main()
