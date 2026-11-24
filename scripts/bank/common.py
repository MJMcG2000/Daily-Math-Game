"""Shared helpers for authoring problems.

Each problem is declared with P(...). `check` is a zero-argument function that recomputes
the answer *from the problem statement* with sympy (solve the equation, do the integral,
sum the series...). It is written independently of `answer`, the exact string players see,
and verify.py confirms the two agree.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable, Optional

import sympy as sp
from sympy import (  # noqa: F401  (re-exported for the bank modules)
    Eq, E, I, Rational as R, Symbol, atan, acos, asin, cos, diff, exp, factorial, integrate,
    limit, log, nsimplify, oo, pi, sec, simplify, sin, solve, sqrt, summation, symbols, tan, cbrt,
)

x, y, z, t, u, n, k, r, h, a, b, c, theta = symbols('x y z t u n k r h a b c theta', real=True)


@dataclass
class P:
    id: str
    topic: str
    prompt: str
    answer: str
    check: Callable[[], object]
    hint1: str
    hint2: str
    steps: list[str]
    diagram: Optional[str] = None
    alt: Optional[str] = None
    course: Optional[str] = None  # hard only: 'calc1' | 'calc2'
    extra: dict = field(default_factory=dict)


def only(sols, cond=lambda s: True):
    """Return the unique solution satisfying cond (raises if not unique)."""
    sols = [s for s in (sols if isinstance(sols, (list, tuple)) else [sols]) if cond(s)]
    if len(sols) != 1:
        raise ValueError(f'expected exactly one solution, got {sols}')
    return sols[0]


def solve1(expr_or_eq, var=x, cond=lambda s: True):
    """Solve a single equation for one real solution satisfying cond."""
    sols = sp.solve(expr_or_eq, var)
    return only([s for s in sols if s.is_real is not False], cond)


def pos(s):
    return s.is_positive


def dist(p, q):
    return sp.sqrt((p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2)


# ----------------------------------------------------------------- SVG helpers
# Diagrams use currentColor so they follow light/dark theme.

def svg(w: int, h: int, body: str) -> str:
    return (
        f'<svg viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg" fill="none" '
        f'stroke="currentColor" stroke-width="2" stroke-linejoin="round" font-size="13" '
        f'font-family="system-ui, sans-serif">{body}</svg>'
    )


def label(xp: float, yp: float, text: str, anchor: str = 'middle', italic: bool = False) -> str:
    style = ' font-style="italic"' if italic else ''
    return f'<text x="{xp}" y="{yp}" fill="currentColor" stroke="none" text-anchor="{anchor}"{style}>{text}</text>'


def line(x1, y1, x2, y2, dash: bool = False) -> str:
    d = ' stroke-dasharray="5 4"' if dash else ''
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}"{d}/>'


def poly(points, close: bool = True, dash: bool = False) -> str:
    tag = 'polygon' if close else 'polyline'
    d = ' stroke-dasharray="5 4"' if dash else ''
    pts = ' '.join(f'{px},{py}' for px, py in points)
    return f'<{tag} points="{pts}"{d}/>'


def circle(cx, cy, rad, fill: bool = False, dash: bool = False) -> str:
    f = ' fill="currentColor"' if fill else ''
    d = ' stroke-dasharray="5 4"' if dash else ''
    return f'<circle cx="{cx}" cy="{cy}" r="{rad}"{f}{d}/>'


def right_angle(xc, yc, dx, dy, s=10) -> str:
    """Small square marking a right angle at (xc, yc); dx, dy = ±1 give the square's direction."""
    return f'<polyline points="{xc + dx * s},{yc} {xc + dx * s},{yc + dy * s} {xc},{yc + dy * s}" stroke-width="1.5"/>'


def path(d: str, dash: bool = False, fill: str | None = None) -> str:
    da = ' stroke-dasharray="5 4"' if dash else ''
    fl = f' fill="{fill}"' if fill else ''
    return f'<path d="{d}"{da}{fl}/>'


def shade(d: str) -> str:
    return f'<path d="{d}" fill="currentColor" fill-opacity="0.15" stroke="none"/>'
