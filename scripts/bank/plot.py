"""Tiny SVG plotting helper for diagrams drawn in *math* coordinates (y up, equal aspect).

    p = Plot(-1, 5, -1, 4)
    svg = p.svg(p.axes(), p.curve(lambda x: x**2, 0, 2), p.dot(1, 1), p.label(1, 1, 'P', dx=6, dy=-6))

Everything uses currentColor so diagrams follow the light/dark theme.
"""
from __future__ import annotations

import math
from typing import Callable, Iterable


def _f(v: float) -> str:
    return f'{v:.1f}'.rstrip('0').rstrip('.')


class Plot:
    def __init__(self, xmin, xmax, ymin, ymax, width=260, pad=20):
        self.xmin, self.xmax, self.ymin, self.ymax, self.pad = xmin, xmax, ymin, ymax, pad
        self.s = (width - 2 * pad) / (xmax - xmin)
        self.w = width
        self.h = round((ymax - ymin) * self.s + 2 * pad)

    # coordinate transforms
    def X(self, x):
        return self.pad + (x - self.xmin) * self.s

    def Y(self, y):
        return self.pad + (self.ymax - y) * self.s

    def P(self, x, y):
        return f'{_f(self.X(x))},{_f(self.Y(y))}'

    # primitives
    def line(self, x1, y1, x2, y2, dash=False, width=None):
        d = ' stroke-dasharray="5 4"' if dash else ''
        w = f' stroke-width="{width}"' if width else ''
        return f'<line x1="{_f(self.X(x1))}" y1="{_f(self.Y(y1))}" x2="{_f(self.X(x2))}" y2="{_f(self.Y(y2))}"{d}{w}/>'

    def poly(self, pts: Iterable[tuple[float, float]], close=True, dash=False, width=None):
        tag = 'polygon' if close else 'polyline'
        d = ' stroke-dasharray="5 4"' if dash else ''
        w = f' stroke-width="{width}"' if width else ''
        return f'<{tag} points="{" ".join(self.P(x, y) for x, y in pts)}"{d}{w}/>'

    def shade(self, pts: Iterable[tuple[float, float]], opacity=0.18):
        return (f'<polygon points="{" ".join(self.P(x, y) for x, y in pts)}" fill="currentColor" '
                f'fill-opacity="{opacity}" stroke="none"/>')

    def circle(self, cx, cy, r, dash=False):
        d = ' stroke-dasharray="5 4"' if dash else ''
        return f'<circle cx="{_f(self.X(cx))}" cy="{_f(self.Y(cy))}" r="{_f(r * self.s)}"{d}/>'

    def dot(self, x, y, r=3.2):
        return f'<circle cx="{_f(self.X(x))}" cy="{_f(self.Y(y))}" r="{r}" fill="currentColor"/>'

    def label(self, x, y, text, dx=0, dy=0, anchor='middle', italic=False, size=None):
        it = ' font-style="italic"' if italic else ''
        sz = f' font-size="{size}"' if size else ''
        return (f'<text x="{_f(self.X(x) + dx)}" y="{_f(self.Y(y) + dy)}" fill="currentColor" stroke="none" '
                f'text-anchor="{anchor}"{it}{sz}>{text}</text>')

    def samples(self, f: Callable[[float], float], a, b, n=80):
        return [(a + (b - a) * i / n, f(a + (b - a) * i / n)) for i in range(n + 1)]

    def curve(self, f, a, b, n=80, dash=False, width=None):
        return self.poly(self.samples(f, a, b, n), close=False, dash=dash, width=width)

    def param(self, fx, fy, t0, t1, n=120, dash=False, close=False):
        pts = [(fx(t0 + (t1 - t0) * i / n), fy(t0 + (t1 - t0) * i / n)) for i in range(n + 1)]
        return self.poly(pts, close=close, dash=dash)

    def arc(self, cx, cy, r, a0, a1, dash=False):
        return self.param(lambda t: cx + r * math.cos(t), lambda t: cy + r * math.sin(t), a0, a1, dash=dash)

    def angle_mark(self, cx, cy, a0, a1, r=0.6):
        """Small arc marking the angle from direction a0 to a1 (radians) at (cx, cy); r in math units."""
        return self.param(lambda t: cx + r * math.cos(t), lambda t: cy + r * math.sin(t), a0, a1, n=24)

    def right_angle(self, x, y, ux, uy, size=0.35):
        """Right-angle box at (x, y) between unit directions u and its +90° rotation."""
        vx, vy = -uy, ux
        s = size
        pts = [(x + ux * s, y + uy * s), (x + ux * s + vx * s, y + uy * s + vy * s), (x + vx * s, y + vy * s)]
        return self.poly(pts, close=False, width=1.5)

    def axes(self, x0=None, x1=None, y0=None, y1=None):
        x0 = self.xmin if x0 is None else x0
        x1 = self.xmax if x1 is None else x1
        y0 = self.ymin if y0 is None else y0
        y1 = self.ymax if y1 is None else y1
        return (f'<g stroke-width="1.2" opacity="0.6">{self.line(x0, 0, x1, 0)}{self.line(0, y0, 0, y1)}</g>')

    def svg(self, *parts: str) -> str:
        return (f'<svg viewBox="0 0 {self.w} {self.h}" xmlns="http://www.w3.org/2000/svg" fill="none" '
                f'stroke="currentColor" stroke-width="2" stroke-linejoin="round" font-size="13" '
                f'font-family="system-ui, sans-serif">{"".join(parts)}</svg>')
