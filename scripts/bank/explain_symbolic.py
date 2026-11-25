"""Key ideas and worked solutions for the symbolic problems (scripts/bank/symbolic.py)."""

EXPLAIN = {
    'm101': (
        r'Turn the sum into sums you already know: $\sum k(k + 1) = \sum k^2 + \sum k$. Then factor out what the two formulas share.',
        [r'**Expand the general term.** $k(k + 1) = k^2 + k$, so the sum is $\sum_{k=1}^n k^2 + \sum_{k=1}^n k$.',
         r'**Use the standard formulas.** $\sum_{k=1}^n k^2 = \dfrac{n(n+1)(2n+1)}{6}$ and $\sum_{k=1}^n k = \dfrac{n(n+1)}{2} = \dfrac{3n(n+1)}{6}$.',
         r'**Factor out the common part** $\dfrac{n(n+1)}{6}$: $\dfrac{n(n+1)}{6}\big[(2n + 1) + 3\big] = \dfrac{n(n+1)(2n + 4)}{6}$.',
         r'**Simplify.** $\dfrac{n(n+1)(n+2)}{3}$. Check with $n = 2$: $1\cdot2 + 2\cdot3 = 8$, and $\tfrac{2\cdot3\cdot4}{3} = 8$. ✓']),
    'm102': (
        r'Logs with different bases can\'t be combined directly. Convert $\log_4$ to base $2$ first, then undo the log by exponentiating.',
        [r'**Change of base.** $\log_4 x = \dfrac{\log_2 x}{\log_2 4} = \dfrac{\log_2 x}{2}$, since $4 = 2^2$.',
         r'**Combine.** The equation becomes $\log_2 x + \tfrac12\log_2 x = \tfrac32\log_2 x = a$, so $\log_2 x = \tfrac{2a}{3}$.',
         r'**Undo the log.** $x = 2^{2a/3}$. Check with $a = 3$: $x = 4$, and $\log_2 4 + \log_4 4 = 2 + 1 = 3$. ✓']),
    'm103': (
        r'Split $3\theta$ into $2\theta + \theta$, apply the addition formula, then use the double-angle formulas and $\sin^2\theta = 1 - \cos^2\theta$ to leave only cosines.',
        [r'**Addition formula.** $\cos3\theta = \cos(2\theta + \theta) = \cos2\theta\cos\theta - \sin2\theta\sin\theta$.',
         r'**First term.** $\cos2\theta = 2c^2 - 1$, so $\cos2\theta\cos\theta = 2c^3 - c$.',
         r'**Second term.** $\sin2\theta\sin\theta = 2\sin\theta\cos\theta\sin\theta = 2c\sin^2\theta = 2c(1 - c^2) = 2c - 2c^3$.',
         r'**Subtract.** $(2c^3 - c) - (2c - 2c^3) = 4c^3 - 3c$. Check at $\theta = 0$ ($c = 1$): $\cos 0 = 1$ and $4 - 3 = 1$. ✓']),
    'm104': (
        r'Combine the two fractions inside the parentheses first. Their difference has numerator $2a$, which cancels the $\tfrac{1}{2a}$ outside.',
        [r'**Common denominator.** $\dfrac{1}{x - a} - \dfrac{1}{x + a} = \dfrac{(x + a) - (x - a)}{(x - a)(x + a)}$.',
         r'**Simplify the numerator.** $(x + a) - (x - a) = 2a$, so the parentheses equal $\dfrac{2a}{x^2 - a^2}$, using the difference of squares $(x - a)(x + a) = x^2 - a^2$.',
         r'**Multiply by $\tfrac{1}{2a}$.** The $2a$ cancels, leaving $\dfrac{1}{x^2 - a^2}$.']),
    'm105': (
        r'The square\'s diagonal is a diameter of the circle, which links the circle\'s radius to $s$. Then subtract the two areas.',
        [r'**Diagonal.** A square with side $s$ has diagonal $s\sqrt2$, by Pythagoras: $\sqrt{s^2 + s^2}$.',
         r'**Radius.** The diagonal is a diameter, so $r = \tfrac{s\sqrt2}{2}$ and $r^2 = \tfrac{s^2}{2}$.',
         r'**Areas.** The circle has area $\pi r^2 = \tfrac{\pi s^2}{2}$ and the square has area $s^2$.',
         r'**Difference.** $\tfrac{\pi s^2}{2} - s^2 = s^2\left(\tfrac\pi2 - 1\right) \approx 0.571s^2$.']),
    'm106': (
        r'The shortest path from a point to a line is perpendicular to the line. For $Ax + By = C$, the perpendicular direction is $\langle A, B\rangle$, which leads to the distance formula $\dfrac{|C|}{\sqrt{A^2 + B^2}}$ from the origin.',
        [r'**Identify $A$, $B$ and $C$.** $ax + y = 1$ has $A = a$, $B = 1$ and $C = 1$.',
         r'**Why the formula works.** The closest point is $t\langle a, 1\rangle$ for some $t$. Putting it into the line gives $t(a^2 + 1) = 1$, and its length is $|t|\sqrt{a^2 + 1} = \dfrac{1}{\sqrt{a^2 + 1}}$.',
         r'**Answer.** $\dfrac{1}{\sqrt{a^2 + 1}}$. Check with $a = 0$: the line $y = 1$ is at distance $1$. ✓']),
    'h101': (
        r'A product of two functions: use the product rule, $(uv)\' = u\'v + uv\'$.',
        [r'**Name the factors.** $u = x^2$ and $v = \sin x$, so $u\' = 2x$ and $v\' = \cos x$.',
         r'**Apply the rule.** $f\'(x) = u\'v + uv\' = 2x\sin x + x^2\cos x$.',
         r'**Check at a point.** At $x = 0$ the formula gives $0$, which matches $f(x) \approx x^3$ near $0$ having slope $0$ there.']),
    'h102': (
        r'Use the chain rule on $\ln u$. The derivative of $u = x + \sqrt{x^2 + 1}$ turns out to be $u$ divided by $\sqrt{x^2 + 1}$, so almost everything cancels.',
        [r'**Chain rule.** $\dfrac{dy}{dx} = \dfrac{u\'}{u}$ with $u = x + \sqrt{x^2 + 1}$.',
         r'**Differentiate $u$.** $u\' = 1 + \dfrac{x}{\sqrt{x^2 + 1}} = \dfrac{\sqrt{x^2 + 1} + x}{\sqrt{x^2 + 1}}$, putting both terms over a common denominator.',
         r'**Notice the numerator is $u$.** So $u\' = \dfrac{u}{\sqrt{x^2 + 1}}$, and $\dfrac{u\'}{u} = \dfrac{1}{\sqrt{x^2 + 1}}$.',
         r'**Answer.** $\dfrac{1}{\sqrt{x^2 + 1}}$. This shows that $y$ is the inverse hyperbolic sine, $\sinh^{-1}x$.']),
    'h103': (
        r'When both the base and the exponent vary, neither the power rule nor the exponential rule applies. Take $\ln$ of both sides so the exponent comes down, then differentiate implicitly.',
        [r'**Take logs.** $\ln y = \sin x\,\ln x$.',
         r'**Differentiate both sides.** The left gives $\dfrac{y\'}{y}$. The right needs the product rule: $\cos x\ln x + \sin x\cdot\dfrac1x$.',
         r'**Solve for $y\'$.** Multiply by $y = x^{\sin x}$: $\dfrac{dy}{dx} = x^{\sin x}\left(\cos x\ln x + \dfrac{\sin x}{x}\right)$.']),
    'h104': (
        r'Product rule, where each factor needs the chain rule. Factor out $e^{2x}$ at the end.',
        [r'**Derivatives of the factors.** $(e^{2x})\' = 2e^{2x}$ (chain rule, inner derivative $2$) and $(\cos3x)\' = -3\sin3x$ (inner derivative $3$).',
         r'**Product rule.** $f\'(x) = 2e^{2x}\cos3x + e^{2x}(-3\sin3x)$.',
         r'**Factor.** $f\'(x) = e^{2x}(2\cos3x - 3\sin3x)$.']),
    'h105': (
        r'The FTC (Fundamental Theorem of Calculus) says $\dfrac{d}{du}\int_0^u f(t)\,dt = f(u)$. When the upper bound is $g(x)$, the chain rule adds a factor $g\'(x)$. You never need to integrate $\tfrac{\sin t}{t}$, which has no elementary antiderivative.',
        [r'**Structure.** $F(x) = G(x^2)$, where $G(u) = \displaystyle\int_0^u\frac{\sin t}{t}\,dt$ and $G\'(u) = \dfrac{\sin u}{u}$.',
         r'**Chain rule.** $F\'(x) = G\'(x^2)\cdot2x = \dfrac{\sin(x^2)}{x^2}\cdot2x$.',
         r'**Simplify.** $F\'(x) = \dfrac{2\sin(x^2)}{x}$.']),
    'h106': (
        r'Bounds that are expressions in $x$ work like any other bounds: find an antiderivative in $t$, then substitute the upper and lower limits.',
        [r'**Antiderivative.** $\displaystyle\int t\,dt = \tfrac{t^2}{2}$.',
         r'**Plug in the bounds.** $\tfrac{(x^2)^2}{2} - \tfrac{x^2}{2} = \tfrac{x^4}{2} - \tfrac{x^2}{2}$.',
         r'**Answer.** $\tfrac{x^4 - x^2}{2}$. Check: at $x = 1$ both bounds are $1$, and the formula gives $0$. ✓']),
    'h107': (
        r'Treat $a$ as a constant and integrate in $x$. The integrand is even (symmetric about the $y$-axis), so the integral is twice the integral from $0$ to $a$.',
        [r'**Antiderivative.** $\displaystyle\int(a^2 - x^2)\,dx = a^2x - \tfrac{x^3}{3}$. Since $a^2$ is a constant, its antiderivative is $a^2x$.',
         r'**Use symmetry.** $2\left[a^2x - \tfrac{x^3}{3}\right]_0^a = 2\left(a^3 - \tfrac{a^3}{3}\right)$.',
         r'**Simplify.** $2\cdot\tfrac{2a^3}{3} = \tfrac{4a^3}{3}$. It scales like $a^3$, as it should: widening the parabola multiplies both its width and its height.']),
    'h108': (
        r'Find where the curves meet, decide which is on top, and integrate (top − bottom). Every step carries the parameter $a$.',
        [r'**Intersections.** $x^2 = ax$ gives $x(x - a) = 0$, so $x = 0$ and $x = a$.',
         r'**Top curve.** At $x = \tfrac a2$ the line gives $\tfrac{a^2}{2}$ and the parabola $\tfrac{a^2}{4}$, so the line is on top.',
         r'**Integrate.** $\displaystyle\int_0^a(ax - x^2)\,dx = \left[\tfrac{ax^2}{2} - \tfrac{x^3}{3}\right]_0^a = \tfrac{a^3}{2} - \tfrac{a^3}{3}$.',
         r'**Area.** $\tfrac{a^3}{6}$. For $a = 1$ that is the familiar $\tfrac16$.']),
    'h109': (
        r'Rewrite the quotient so that each sine sits over its own argument. Those pieces each tend to $1$, leaving a simple ratio of the arguments.',
        [r'**Regroup.** $\dfrac{\sin ax}{\sin bx} = \dfrac{\sin ax}{ax}\cdot\dfrac{bx}{\sin bx}\cdot\dfrac{ax}{bx}$.',
         r'**Standard limit.** As $x \to 0$, $ax$ and $bx$ also go to $0$, so $\dfrac{\sin ax}{ax} \to 1$ and $\dfrac{bx}{\sin bx} \to 1$.',
         r'**What\'s left.** $\dfrac{ax}{bx} = \dfrac ab$. (L\'Hôpital agrees: $\dfrac{a\cos ax}{b\cos bx} \to \dfrac ab$.)']),
    'h110': (
        r'Differentiate both sides with respect to $x$, treating $y$ as a function of $x$. The chain rule turns $y^2$ into $2y\,y\'$.',
        [r'**Differentiate.** $\dfrac{d}{dx}(x^2) + \dfrac{d}{dx}(y^2) = \dfrac{d}{dx}(25)$, which gives $2x + 2y\dfrac{dy}{dx} = 0$.',
         r'**Solve.** $\dfrac{dy}{dx} = -\dfrac{x}{y}$.',
         r'**Geometric check.** The radius to $(x, y)$ has slope $\tfrac yx$. The tangent is perpendicular to it, so its slope is the negative reciprocal, $-\tfrac xy$. ✓']),
    'h111': (
        r'Write the volume in terms of the radius, then differentiate both sides with respect to time. The chain rule brings in $\tfrac{dr}{dt} = k$.',
        [r'**Volume.** $V = \tfrac43\pi r^3$.',
         r'**Differentiate with respect to $t$.** $\dfrac{dV}{dt} = \tfrac43\pi\cdot3r^2\dfrac{dr}{dt} = 4\pi r^2\dfrac{dr}{dt}$.',
         r'**Substitute $\tfrac{dr}{dt} = k$.** $\dfrac{dV}{dt} = 4\pi r^2k$. That is the surface area times the rate the radius grows, which makes sense: a new thin shell of thickness $k\,dt$ is added.']),
    'h112': (
        r'Use the perimeter to write the area in terms of one side, then maximize. The answer is a square.',
        [r'**One variable.** If one side is $w$, the other is $\tfrac p2 - w$, so $A(w) = w\left(\tfrac p2 - w\right)$.',
         r'**Critical point.** $A\'(w) = \tfrac p2 - 2w = 0$, so $w = \tfrac p4$. The other side is also $\tfrac p4$.',
         r'**Maximum area.** $\left(\tfrac p4\right)^2 = \tfrac{p^2}{16}$. It is a maximum because $A$ is a downward parabola in $w$.']),
    'h113': (
        r'Use integration by parts with $u = x$, so that differentiating it leaves just $1$. Then evaluate with $a$ as the upper limit.',
        [r'**Parts.** $u = x$, $dv = e^x\,dx$, so $du = dx$ and $v = e^x$: $\displaystyle\int xe^x\,dx = xe^x - \int e^x\,dx = (x - 1)e^x$.',
         r'**Upper limit $a$.** $(a - 1)e^a$.',
         r'**Lower limit $0$.** $(0 - 1)e^0 = -1$.',
         r'**Subtract.** $(a - 1)e^a - (-1) = (a - 1)e^a + 1$. Check: at $a = 0$ it gives $0$. ✓']),
    'h114': (
        r'$\ln x$ has no obvious partner, so use parts with $u = \ln x$ and $dv = dx$. Differentiating the log leaves $\tfrac1x$, which cancels with $v = x$.',
        [r'**Parts.** $u = \ln x$ and $v = x$: $\displaystyle\int\ln x\,dx = x\ln x - \int x\cdot\tfrac1x\,dx = x\ln x - x$.',
         r'**Evaluate.** At $a$: $a\ln a - a$. At $1$: $0 - 1 = -1$.',
         r'**Subtract.** $a\ln a - a + 1$. Check: at $a = 1$ the integral is $0$. ✓']),
    'h115': (
        r'Partial fractions turn the integrand into two simple logs. Combine them into one log at the end.',
        [r'**Partial fractions.** $\dfrac{1}{(x + 1)(x + 2)} = \dfrac{1}{x + 1} - \dfrac{1}{x + 2}$ (cover-up method: $A = 1$, $B = -1$).',
         r'**Antiderivative.** $\ln(x + 1) - \ln(x + 2) = \ln\dfrac{x + 1}{x + 2}$.',
         r'**Evaluate.** $\ln\dfrac{a + 1}{a + 2} - \ln\dfrac12 = \ln\dfrac{a + 1}{a + 2} + \ln2$.',
         r'**One logarithm.** $\ln\dfrac{2(a + 1)}{a + 2}$. As $a \to \infty$ this approaches $\ln2$, matching the improper integral from $0$ to $\infty$.']),
    'h116': (
        r'You can\'t integrate $\sin^2x$ directly, so lower its power with $\sin^2x = \dfrac{1 - \cos2x}{2}$.',
        [r'**Power reduction.** $\displaystyle\int_0^a\sin^2x\,dx = \int_0^a\frac{1 - \cos2x}{2}\,dx$.',
         r'**Integrate.** $\dfrac x2 - \dfrac{\sin2x}{4}$. The $\tfrac14$ comes from $\tfrac12$ times the $\tfrac12$ from the chain rule.',
         r'**Evaluate.** At $a$: $\tfrac a2 - \tfrac{\sin2a}{4}$. At $0$: $0$.',
         r'**Answer.** $\tfrac a2 - \tfrac{\sin2a}{4}$. At $a = \pi$ this is $\tfrac\pi2$, the familiar half of the interval.']),
    'h117': (
        r'This is an improper integral: integrate up to $b$, then let $b \to \infty$. Parts handles the $x$, and the exponential decay kills the boundary terms.',
        [r'**Parts.** $u = x$ and $dv = e^{-kx}dx$, so $v = -\tfrac1ke^{-kx}$: $\displaystyle\int xe^{-kx}dx = -\frac xke^{-kx} - \frac{1}{k^2}e^{-kx}$.',
         r'**Upper limit $b \to \infty$.** Both terms go to $0$, since $e^{-kb}$ shrinks faster than $b$ grows.',
         r'**Lower limit $0$.** $0 - \tfrac{1}{k^2}$.',
         r'**Value.** $0 - \left(-\tfrac{1}{k^2}\right) = \tfrac{1}{k^2}$.']),
    'h118': (
        r'Substitute $x = a\sin\theta$ to remove the square root. Geometrically, the integral is a quarter of a circle of radius $a$, which confirms the answer.',
        [r'**Substitute.** $x = a\sin\theta$, $dx = a\cos\theta\,d\theta$ and $\sqrt{a^2 - x^2} = a\cos\theta$. The bounds $0 \to 0$ and $a \to \tfrac\pi2$.',
         r'**New integral.** $\displaystyle\int_0^{\pi/2}a^2\cos^2\theta\,d\theta = a^2\int_0^{\pi/2}\frac{1 + \cos2\theta}{2}\,d\theta$.',
         r'**Evaluate.** $a^2\left[\tfrac\theta2 + \tfrac{\sin2\theta}{4}\right]_0^{\pi/2} = a^2\cdot\tfrac\pi4$.',
         r'**Answer.** $\tfrac{\pi a^2}{4}$: a quarter of the disk\'s area $\pi a^2$. ✓']),
    'h119': (
        r'Rotating a slanted line about the $x$-axis sweeps out a cone. Slice it into disks: each has radius equal to the line\'s height at that $x$.',
        [r'**Disk radius.** At position $x$ the radius is $\tfrac rh x$, growing from $0$ at the tip to $r$ at $x = h$.',
         r'**Volume integral.** $V = \pi\displaystyle\int_0^h\left(\frac rhx\right)^2dx = \pi\frac{r^2}{h^2}\int_0^hx^2\,dx$.',
         r'**Integrate.** $\pi\dfrac{r^2}{h^2}\cdot\dfrac{h^3}{3} = \dfrac{\pi r^2h}{3}$.',
         r'**This derives the cone formula:** one third of the cylinder $\pi r^2h$.']),
    'h120': (
        r'For arc length you need $\sqrt{1 + (y\')^2}$. This curve was chosen so that the expression under the root is just $1 + x$.',
        [r'**Recall the formula.** The arc length of $y = f(x)$ from $0$ to $a$ is $\displaystyle\int_0^a\sqrt{1 + (f\'(x))^2}\,dx$. It adds up tiny hypotenuses $\sqrt{dx^2 + dy^2}$ along the curve.',
         r'**Differentiate.** By the power rule, $y\' = \tfrac23\cdot\tfrac32x^{1/2} = \sqrt x$. Squaring gives $x$, so the expression under the root is just $1 + x$.',
         r'**Set up the integral.** $L = \displaystyle\int_0^a\sqrt{1 + x}\,dx$, an ordinary power of $(1 + x)$.',
         r'**Integrate and evaluate.** $\tfrac23(1 + x)^{3/2}\Big|_0^a = \tfrac23\left((1 + a)^{3/2} - 1\right)$. Check with $a = 3$: $\tfrac23(8 - 1) = \tfrac{14}{3}$, the same as the numeric version of this problem.']),
    'h121': (
        r'Start from the geometric series $\sum x^n = \dfrac{1}{1 - x}$. Differentiating brings down a factor of $n$, and multiplying by $x$ restores the power.',
        [r'**Geometric series.** $\displaystyle\sum_{n\ge0}x^n = \frac{1}{1 - x}$ for $|x| < 1$.',
         r'**Differentiate term by term.** $\displaystyle\sum_{n\ge1}nx^{n-1} = \frac{1}{(1 - x)^2}$. This is allowed inside the radius of convergence.',
         r'**Multiply by $x$.** $\displaystyle\sum_{n\ge1}nx^n = \frac{x}{(1 - x)^2}$. Check at $x = \tfrac12$: the formula gives $2$, and $\tfrac12 + \tfrac24 + \tfrac38 + \cdots = 2$. ✓']),
    'h122': (
        r'Multiply the two known Maclaurin series and keep only the terms up to $x^3$. Higher powers can\'t affect a degree-3 polynomial.',
        [r'**Series.** $e^x = 1 + x + \tfrac{x^2}{2} + \tfrac{x^3}{6} + \cdots$ and $\sin x = x - \tfrac{x^3}{6} + \cdots$.',
         r'**Collect by power.** $x$: $1\cdot x$. $x^2$: $x\cdot x$. $x^3$: $\tfrac{x^2}{2}\cdot x + 1\cdot\left(-\tfrac{x^3}{6}\right) = \tfrac{x^3}{2} - \tfrac{x^3}{6}$.',
         r'**Simplify.** The $x^3$ coefficient is $\tfrac13$, so the polynomial is $x + x^2 + \tfrac{x^3}{3}$.']),
    'h123': (
        r'Partial fractions split each term into a difference. When you add them up, every middle term cancels (telescopes).',
        [r'**Split.** $\dfrac{1}{k(k + 1)} = \dfrac1k - \dfrac{1}{k + 1}$.',
         r'**Write out the sum.** $\left(1 - \tfrac12\right) + \left(\tfrac12 - \tfrac13\right) + \cdots + \left(\tfrac1n - \tfrac{1}{n + 1}\right)$.',
         r'**Cancel.** Only $1$ and $-\tfrac{1}{n + 1}$ survive: $1 - \dfrac{1}{n + 1} = \dfrac{n}{n + 1}$. As $n \to \infty$ it approaches $1$, the infinite sum.']),
    'h124': (
        r'Integrate by parts with $u = \ln x$, which differentiates to $\tfrac1x$ and lowers the power. The boundary term at $0$ vanishes because $x^{n+1}\ln x \to 0$.',
        [r'**Parts.** $u = \ln x$ and $dv = x^n\,dx$, so $v = \tfrac{x^{n+1}}{n + 1}$: $\displaystyle\int x^n\ln x\,dx = \frac{x^{n+1}\ln x}{n + 1} - \int\frac{x^n}{n + 1}\,dx$.',
         r'**Finish the antiderivative.** $\dfrac{x^{n+1}\ln x}{n + 1} - \dfrac{x^{n+1}}{(n + 1)^2}$.',
         r'**Limits.** At $1$: $0 - \tfrac{1}{(n + 1)^2}$. At $0^+$: both terms go to $0$, since $n + 1 > 0$.',
         r'**Value.** $-\dfrac{1}{(n + 1)^2}$. It is negative, as it should be, because $\ln x < 0$ on $(0, 1)$.']),
}
