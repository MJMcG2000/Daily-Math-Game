"""Behind-the-scenes categories for every problem: a school subject and an estimated US grade level.

These are stored in the JSON (`subject`, `gradeLevel`) but not shown to players. They exist for
authoring, balancing and future features (filters, analytics).

Grade levels follow a typical US sequence:
   6–7  Pre-Algebra (arithmetic, fractions, ratios, percents)
   8–9  Algebra 1
   10   Geometry (and harder Algebra 1 / early Algebra 2)
   11   Algebra 2, Trigonometry
   12   Precalculus, Calculus 1 (AP Calculus AB)
   13   first-year college (Calculus 2; AP Calculus BC students meet it in grade 12)

Each topic has a default (subject, grade). OVERRIDES adjusts individual problems whose content sits
above or below their topic's usual level.
"""

SUBJECTS = ['Pre-Algebra', 'Algebra 1', 'Geometry', 'Algebra 2', 'Trigonometry', 'Precalculus', 'Calculus 1', 'Calculus 2']
GRADES = range(6, 14)

TOPIC_DEFAULTS = {
    # easy
    'Order of operations': ('Pre-Algebra', 7),
    'Fractions': ('Pre-Algebra', 6),
    'Ratios': ('Pre-Algebra', 7),
    'Percents': ('Pre-Algebra', 7),
    'Multi-step linear equations': ('Algebra 1', 8),
    'Exponents': ('Algebra 1', 9),
    'Systems of equations': ('Algebra 1', 9),
    'Factoring': ('Algebra 1', 9),
    'Quadratics': ('Algebra 1', 9),
    'Slope': ('Algebra 1', 8),
    'Word problems': ('Algebra 1', 8),
    # medium
    'Area and volume': ('Geometry', 10),
    'Similar triangles': ('Geometry', 10),
    'Pythagorean theorem': ('Geometry', 10),
    'Circles': ('Geometry', 10),
    'Logs and exponentials': ('Algebra 2', 11),
    'Rational expressions': ('Algebra 2', 11),
    'Unit circle': ('Trigonometry', 11),
    'Trig identities': ('Trigonometry', 11),
    'Inverse trig': ('Trigonometry', 11),
    'Polar coordinates': ('Precalculus', 12),
    'Sequences and series': ('Algebra 2', 11),
    'Vectors': ('Precalculus', 12),
    'Conic sections': ('Precalculus', 11),
}

COURSE_DEFAULTS = {'calc1': ('Calculus 1', 12), 'calc2': ('Calculus 2', 13)}

OVERRIDES = {
    # Pre-Algebra problems that use negative or zero exponents, or telescoping, sit a year higher.
    'e004': ('Pre-Algebra', 8), 'e007': ('Pre-Algebra', 8), 'e009': ('Pre-Algebra', 8),
    'e017': ('Pre-Algebra', 8), 'e015': ('Pre-Algebra', 7), 'e016': ('Pre-Algebra', 7),
    'e031': ('Pre-Algebra', 8), 'e025': ('Algebra 1', 8), 'e034': ('Algebra 1', 8),
    'e021': ('Pre-Algebra', 7), 'e026': ('Algebra 1', 8),
    # Integer exponent rules come before rational exponents and exponential equations.
    'e046': ('Algebra 1', 8), 'e051': ('Algebra 1', 8), 'e053': ('Algebra 2', 10),
    # Systems: two-variable systems are grade 8; three variables is Algebra 2.
    'e055': ('Algebra 1', 8), 'e056': ('Algebra 1', 8), 'e058': ('Algebra 2', 10),
    # Factoring beyond quadratics.
    'e066': ('Algebra 2', 10), 'e067': ('Algebra 2', 10), 'e069': ('Algebra 1', 10), 'e070': ('Algebra 2', 10),
    # Radical equations with extraneous roots.
    'e080': ('Algebra 1', 10),
    # Word problems that need a quadratic or rational rates.
    'e092': ('Algebra 1', 9), 'e095': ('Algebra 1', 9),
    # Geometry problems leaning on coordinate algebra or trig.
    'm025': ('Geometry', 10), 'm026': ('Geometry', 10), 'm099': ('Geometry', 10), 'm100': ('Trigonometry', 11),
    'm019': ('Geometry', 10), 'm022': ('Geometry', 9), 'm016': ('Geometry', 8), 'm021': ('Algebra 1', 9),
    'm004': ('Geometry', 8), 'm013': ('Geometry', 9),
    # Inverse trig applications and composition are usually Precalculus.
    'm061': ('Precalculus', 12), 'm062': ('Precalculus', 12), 'm066': ('Precalculus', 12),
    # Infinite geometric series are usually Precalculus.
    'm077': ('Precalculus', 12), 'm078': ('Algebra 2', 11), 'm082': ('Precalculus', 12),
    'm090': ('Precalculus', 12), 'm085': ('Precalculus', 12),
}


def categorize(p) -> tuple[str, int]:
    if p.id in OVERRIDES:
        return OVERRIDES[p.id]
    if p.course:
        return COURSE_DEFAULTS[p.course]
    if p.topic not in TOPIC_DEFAULTS:
        raise KeyError(f'{p.id}: no category for topic "{p.topic}" (add it to TOPIC_DEFAULTS)')
    return TOPIC_DEFAULTS[p.topic]
