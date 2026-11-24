"""Turn a Mathdle answer string into a sympy expression — independently of the game's TS parser."""
import re

import sympy as sp
from sympy.parsing.sympy_parser import (
    convert_xor, implicit_multiplication_application, parse_expr, standard_transformations,
)

TRANSFORMS = standard_transformations + (implicit_multiplication_application, convert_xor)


def _log(x, b=None):
    return sp.log(x, 10) if b is None else sp.log(x, b)


LOCALS = {
    'ln': sp.log, 'log': _log, 'sqrt': sp.sqrt, 'cbrt': lambda v: sp.real_root(v, 3),
    'e': sp.E, 'pi': sp.pi, 'inf': sp.oo, 'infinity': sp.oo,
    'sin': sp.sin, 'cos': sp.cos, 'tan': sp.tan, 'sec': sp.sec, 'csc': sp.csc, 'cot': sp.cot,
    'arcsin': sp.asin, 'asin': sp.asin, 'arccos': sp.acos, 'acos': sp.acos,
    'arctan': sp.atan, 'atan': sp.atan, 'exp': sp.exp,
}


def answer_to_sympy(s: str) -> sp.Expr:
    s = s.replace('π', 'pi').replace('√', 'sqrt').replace('∞', 'inf')
    s = re.sub(r'log_(\w+|\([^)]*\))\(([^)]*)\)', r'log(\2, \1)', s)
    return parse_expr(s, local_dict=LOCALS, transformations=TRANSFORMS, evaluate=True)
