"""Diagrams shown with the worked solution (after the problem is finished).

SOLUTION_DIAGRAMS maps problem id -> (svg, alt text). They are drawn to scale from the
problem's numbers with plot.Plot, and illustrate the key step of the solution.
"""
import math

from .plot import Plot

S2, S3 = math.sqrt(2), math.sqrt(3)
D = {}


def add(pid, plot, parts, alt):
    D[pid] = (plot.svg(*parts), alt)


# ------------------------------------------------------------------ medium: geometry
p = Plot(-6, 6, -6, 6, width=240)
add('m001', p, [
    p.circle(0, 0, 5), p.poly([(-3, -4), (3, -4), (3, 4), (-3, 4)]),
    p.shade([(0, 0), (3, 0), (3, 4)]), p.poly([(0, 0), (3, 0), (3, 4)], width=2.5),
    p.right_angle(3, 0, -1, 0), p.dot(0, 0),
    p.label(1.5, 0, '3', dy=15), p.label(3, 2, '4', dx=10, anchor='start'), p.label(1.3, 2.4, '5', dx=-6, dy=-4),
], 'Cross-section: the right triangle from the center of the sphere, across 3 to the cylinder wall and up 4 to the rim, has hypotenuse 5, the sphere radius.')

p = Plot(-1, 11, -1.5, 11, width=240)
add('m003', p, [
    p.poly([(0, 0), (10, 0), (10, 10), (0, 10)], width=1.2),
    p.arc(0, 0, 10, 0, math.pi / 2), p.arc(10, 0, 10, math.pi / 2, math.pi),
    p.shade([(0, 0)] + [(10 * math.cos(t * math.pi / 3 / 30), 10 * math.sin(t * math.pi / 3 / 30)) for t in range(31)], 0.12),
    p.shade([(10, 0)] + [(10 - 10 * math.cos(t * math.pi / 3 / 30), 10 * math.sin(t * math.pi / 3 / 30)) for t in range(31)], 0.12),
    p.poly([(0, 0), (10, 0), (5, 5 * S3)], dash=True),
    p.angle_mark(0, 0, 0, math.pi / 3, 1.4), p.angle_mark(10, 0, 2 * math.pi / 3, math.pi, 1.4),
    p.label(0, 0, 'A', dx=-8, dy=14), p.label(10, 0, 'B', dx=8, dy=14), p.label(5, 5 * S3, 'P', dy=-6),
    p.label(1.9, 0.4, '60°', anchor='start', size=11), p.label(8.1, 0.4, '60°', anchor='end', size=11),
    p.label(5, 0, '10', dy=15),
], 'The two 60-degree sectors at A and B overlap in the equilateral triangle ABP. The region is the two sectors minus the triangle counted twice.')

p = Plot(-1, 23, -2, 10, width=260)
add('m007', p, [
    p.poly([(0, 0), (22, 0), (16, 8), (6, 8)]),
    p.line(6, 8, 6, 0, dash=True), p.line(16, 8, 16, 0, dash=True),
    p.shade([(0, 0), (16, 0), (16, 8)]), p.line(0, 0, 16, 8, width=3),
    p.label(3, 0, '6', dy=15), p.label(11, 0, '10', dy=15), p.label(16, 4, '8', dx=8, anchor='start'),
    p.label(2.4, 4.6, '10', dx=-4), p.label(11, 3.2, '8√5', dy=14),
], 'Dropping perpendiculars gives height 8. The diagonal is the hypotenuse of a right triangle with base 6 + 10 = 16 and height 8.')

p = Plot(-1, 9, -1, 7, width=240)
Dx, Dy = 0.8 * 3.6, 6 - 0.6 * 3.6
add('m011', p, [
    p.poly([(0, 0), (8, 0), (0, 6)]), p.line(0, 0, Dx, Dy, dash=True), p.right_angle(0, 0, 1, 0),
    p.right_angle(Dx, Dy, -0.8, 0.6, 0.3),
    p.label(0, 3, '6', dx=-10), p.label(4, 0, '8', dy=15),
    p.label(Dx / 2, (6 + Dy) / 2, '3.6', dx=10, dy=-6, anchor='start'), p.label((Dx + 8) / 2, Dy / 2, '6.4', dx=8, dy=-4, anchor='start'),
], 'The altitude from the right angle splits the hypotenuse 10 into pieces 3.6 and 6.4, which are 6 squared over 10 and 8 squared over 10.')

s = 24 / 7
p = Plot(-1, 9, -1, 7, width=240)
add('m015', p, [
    p.axes(-0.5, 8.8, -0.5, 6.8), p.line(8, 0, 0, 6, width=2.5),
    p.shade([(0, 0), (s, 0), (s, s), (0, s)]), p.poly([(0, 0), (s, 0), (s, s), (0, s)]), p.dot(s, s),
    p.label(s, s, '(s, s)', dx=6, dy=-6, anchor='start'), p.label(4.6, 2.6, 'x/8 + y/6 = 1', dx=8, anchor='start', size=12),
    p.label(8, 0, '8', dy=15), p.label(0, 6, '6', dx=-10),
], 'With the right angle at the origin, the square\'s far corner (s, s) must lie on the hypotenuse x/8 + y/6 = 1.')

p = Plot(-1, 10, -1, 21, width=160)
add('m017', p, [
    p.poly([(0, 0), (9, 0), (9, 20), (0, 20)]), p.line(4, 0, 4, 20, dash=True), p.line(0, 0, 9, 20, width=3),
    p.dot(0, 0), p.dot(9, 20),
    p.label(2, 0, '4', dy=15), p.label(6.5, 0, '5', dy=15), p.label(9, 10, '20', dx=8, anchor='start'),
    p.label(4.5, 10, '√481', dx=-8, anchor='end'),
], 'Unfolding the 4-wide and 5-wide faces side by side makes a 9 by 20 rectangle. The shortest outside path is its diagonal, square root of 481.')

p = Plot(-1, 11, -1, 7, width=240)
P0 = (3.2, 2.2)
add('m019', p, [
    p.poly([(0, 0), (10, 0), (10, 6), (0, 6)]),
    p.line(0, 0, *P0), p.line(10, 0, *P0), p.line(10, 6, *P0), p.line(0, 6, *P0), p.dot(*P0),
    p.line(P0[0], 0, P0[0], 6, dash=True), p.line(0, P0[1], 10, P0[1], dash=True),
    p.label(0, 0, 'A', dx=-8, dy=12), p.label(10, 0, 'B', dx=8, dy=12), p.label(10, 6, 'C', dx=8, dy=-4), p.label(0, 6, 'D', dx=-8, dy=-4),
    p.label(1.4, 0.9, '3', dy=-4), p.label(6.8, 0.9, '4', dy=-4), p.label(6.8, 4.4, '5', dy=-4), p.label(1.4, 4.3, '?', dy=-4),
    p.label(P0[0], P0[1], 'P', dx=8, dy=14, anchor='start'),
], 'Dashed lines through P split each corner distance into horizontal and vertical parts. Opposite corners use all four parts, so PA² + PC² = PB² + PD².')

p = Plot(-1, 5, -1, 3, width=240)
add('m020', p, [
    p.poly([(0, 0), (4, 0), (4, 2), (0, 2)]), p.line(2, 0, 2, 2, dash=True), p.line(0, 0, 4, 2, width=3),
    p.dot(0, 0), p.dot(4, 2),
    p.label(1, 0, '2', dy=15), p.label(3, 0, '2', dy=15), p.label(4, 1, '2', dx=8, anchor='start'),
    p.label(2, 1.15, '2√5', dy=-8, dx=-4),
], 'Two adjacent faces of the cube unfold into a 2 by 4 rectangle. The ant\'s shortest path is its diagonal, 2 root 5.')

p = Plot(-11, 11, -11, 11, width=240)
add('m023', p, [
    p.circle(0, 0, 10), p.dot(0, 0),
    p.line(-8, 6, 8, 6, width=2.5), p.line(0, 0, 0, 6, dash=True), p.line(0, 0, 8, 6, dash=True),
    p.line(-6, -8, 6, -8, width=2.5), p.line(0, 0, 0, -8, dash=True), p.line(0, 0, 6, -8, dash=True),
    p.label(4, 6, '8', dy=-6), p.label(0, 3, '6', dx=-8, anchor='end'), p.label(4.2, 3.4, '10', dx=8, anchor='start'),
    p.label(3, -8, '6', dy=15), p.label(0, -4, '8', dx=-8, anchor='end'), p.label(3.2, -4, '10', dx=8, anchor='start'),
], 'The perpendicular from the center bisects each chord. The first chord gives radius 10; then the chord 8 from the center has half-length 6.')

p = Plot(-9, 9, -9, 9, width=220)
a = 3 * math.pi / 8  # half of 135°
add('m025', p, [
    p.circle(0, 0, 8), p.dot(0, 0),
    p.shade([(8 * math.cos(t), 8 * math.sin(t)) for t in [(-a + 2 * a * i / 40) for i in range(41)]]),
    p.line(8 * math.cos(-a), 8 * math.sin(-a), 8 * math.cos(a), 8 * math.sin(a), width=2.5),
    p.line(0, 0, 8 * math.cos(a), 8 * math.sin(a), dash=True), p.line(0, 0, 8 * math.cos(-a), 8 * math.sin(-a), dash=True),
    p.angle_mark(0, 0, -a, a, 1.4), p.label(2, 0, '135°', anchor='start', size=11), p.label(-1.5, 3.4, '8', size=12),
], 'The shaded segment is the 135-degree sector minus the triangle formed by the two radii and the chord.')

C2 = (13, 0)
u = (5 / 13, 12 / 13)
A = (9 * u[0], 9 * u[1])
B = (13 + 4 * u[0], 4 * u[1])
Q = (5 * u[0], 5 * u[1])
p = Plot(-10, 18, -10, 11, width=260)
add('m027', p, [
    p.circle(0, 0, 9), p.circle(*C2, 4), p.line(0, 0, *C2, dash=True),
    p.line(A[0] - 6 * u[1], A[1] + 6 * u[0], B[0] + 4 * u[1], B[1] - 4 * u[0], width=1.5),
    p.line(0, 0, *A), p.line(*C2, *B), p.line(*C2, *Q, dash=True),
    p.shade([(0, 0), Q, C2]),
    p.label(6.5, 0, '13', dy=15), p.label(Q[0] / 2, Q[1] / 2, '5', dx=-10), p.label((Q[0] + 13) / 2, Q[1] / 2, '12', dx=-2, dy=-8),
    p.label(*A, 'A', dx=-4, dy=-8), p.label(*B, 'B', dx=4, dy=-8),
], 'Sliding the small radius over makes a right triangle with hypotenuse 13 (between the centers) and leg 9 − 4 = 5. Its other leg, 12, equals AB.')

p = Plot(-1, 13, -1, 10, width=240)
add('m030', p, [
    p.poly([(0, 0), (12, 0), (0, 9)]), p.circle(3, 3, 3), p.dot(3, 3),
    p.line(3, 3, 3, 0, dash=True), p.line(3, 3, 0, 3, dash=True), p.line(3, 3, 4.8, 5.4, dash=True),
    p.label(1.5, 0, 'r', dy=15, italic=True), p.label(7.5, 0, '12 − r', dy=15), p.label(0, 1.5, 'r', dx=-10, italic=True), p.label(0, 6, '9 − r', dx=-6, anchor='end'),
    p.label(8.4, 2.7, '(12 − r) + (9 − r) = 15', dx=4, dy=-6, anchor='start', size=11),
], 'Tangent segments from each corner are equal. The hypotenuse is made of the two leftover pieces: (12 − r) + (9 − r) = 15, so r = 3.')

p = Plot(-1.6, 1.6, -1.4, 1.4, width=220)
pts = [(7 * math.pi / 6, '7π/6'), (5 * math.pi / 3, '5π/3'), (3 * math.pi / 4, '3π/4')]
parts = [p.axes(), p.circle(0, 0, 1)]
for ang, lab in pts:
    x, y = math.cos(ang), math.sin(ang)
    parts += [p.line(0, 0, x, y), p.dot(x, y), p.line(x, y, x, 0, dash=True), p.label(x, y, lab, dx=10 if x > 0 else -10, dy=-6 if y > 0 else 14, anchor='start' if x > 0 else 'end', size=12)]
add('m046', p, parts, 'Unit circle with the three angles. Each point\'s reference triangle (dashed) shows the size; the quadrant shows the sign: sin(7π/6) = −1/2, cos(5π/3) = 1/2, tan(3π/4) = −1.')

p = Plot(-1.6, 1.6, -1.4, 1.4, width=220)
add('m048', p, [
    p.axes(), p.circle(0, 0, 1), p.line(-0.5, -1.3, -0.5, 1.3, dash=True),
    p.dot(-0.5, S3 / 2), p.dot(-0.5, -S3 / 2), p.dot(1, 0),
    p.label(-0.5, S3 / 2, '2π/3', dx=-8, dy=-6, anchor='end', size=12), p.label(-0.5, -S3 / 2, '4π/3', dx=-8, dy=14, anchor='end', size=12),
    p.label(1, 0, '0', dx=8, dy=-6, anchor='start', size=12), p.label(-0.5, -1.3, 'x = −1/2', dx=6, dy=4, anchor='start', size=11),
], 'The solutions are where the unit circle has x-coordinate −1/2 (angles 2π/3 and 4π/3) or x-coordinate 1 (angle 0).')

p = Plot(-6.5, 5, -1, 4, width=260)
P1 = (4 * math.cos(math.pi / 6), 4 * math.sin(math.pi / 6))
P2 = (6 * math.cos(5 * math.pi / 6), 6 * math.sin(5 * math.pi / 6))
add('m069', p, [
    p.axes(), p.line(0, 0, *P1), p.line(0, 0, *P2), p.line(*P1, *P2, width=3), p.dot(*P1), p.dot(*P2),
    p.angle_mark(0, 0, math.pi / 6, 5 * math.pi / 6, 0.8), p.label(0, 0.9, '2π/3', dy=-4, size=11),
    p.label(P1[0] / 2, P1[1] / 2, '4', dy=14), p.label(P2[0] / 2, P2[1] / 2, '6', dy=14),
    p.label((P1[0] + P2[0]) / 2, (P1[1] + P2[1]) / 2, 'd', dy=-8, italic=True),
], 'The two points and the origin form a triangle with sides 4 and 6 and an angle of 2π/3 between them. The law of cosines gives d.')

p = Plot(-1.4, 2.4, -1.4, 2.4, width=220)
add('m071', p, [
    p.axes(), p.circle(0, 1, 1), p.circle(1, 0, 1), p.line(0, 0, 1, 1, width=3), p.dot(0, 0), p.dot(1, 1),
    p.label(1, 1, '(1, 1)', dx=8, dy=-6, anchor='start', size=12), p.label(0, 0, '(0, 0)', dx=-6, dy=16, anchor='end', size=12),
    p.label(0, 2, 'r = 2 sin θ', dy=-6, size=11), p.label(2, 0, 'r = 2 cos θ', dx=4, dy=16, anchor='end', size=11),
], 'The circles x² + (y − 1)² = 1 and (x − 1)² + y² = 1 cross at the origin and at (1, 1). Their common chord has length √2.')

p = Plot(-0.6, 3.6, -0.6, 3.6, width=220)
add('m074', p, [
    p.axes(), p.line(-0.4, 3.4, 3.4, -0.4, width=2.5), p.line(0, 0, 1.5, 1.5, dash=True),
    p.right_angle(1.5, 1.5, S2 / 2, -S2 / 2, 0.22), p.dot(1.5, 1.5),
    p.label(2.6, 0.4, 'x + y = 3', dx=6, anchor='start', size=12), p.label(0.75, 0.75, '3√2/2', dx=-8, dy=-4, anchor='end', size=12),
], 'The line x + y = 3 is closest to the origin at (1.5, 1.5), where the perpendicular from the origin meets it.')

p = Plot(-1.6, 1.6, -0.4, 2.0, width=220)
add('m083', p, [
    p.axes(),
    '<defs><marker id="vh" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" stroke="none"/></marker></defs>',
    p.line(0, 0, 0.5, S3 / 2).replace('/>', ' marker-end="url(#vh)"/>'), p.line(0, 0, -0.5, S3 / 2).replace('/>', ' marker-end="url(#vh)"/>'),
    p.angle_mark(0, 0, math.pi / 3, 2 * math.pi / 3, 0.35), p.label(0, 0.42, 'π/3', dy=-4, size=11),
    p.label(0.5, S3 / 2, 'u', dx=8, italic=True, anchor='start'), p.label(-0.5, S3 / 2, 'v', dx=-8, italic=True, anchor='end'),
], 'Scaled to unit length, u points at 60° and v at 120°, so the angle between them is π/3.')

p = Plot(-1, 11, -8, 8, width=220)
add('m092', p, [
    p.axes(), p.param(lambda t: t * t / 12, lambda t: t, -8, 8), p.dot(9, 0), p.dot(3, 6), p.dot(3, -6),
    p.line(9, 0, 3, 6, dash=True), p.line(9, 0, 3, -6, dash=True),
    p.label(9, 0, '(9, 0)', dx=4, dy=16), p.label(3, 6, '(3, 6)', dx=-6, dy=-6, anchor='end', size=12),
    p.label(6, 3, '6√2', dx=6, anchor='start', size=12), p.label(5.3, 8, 'y² = 12x', anchor='start', size=12),
], 'The closest points on the parabola to (9, 0) are (3, ±6), at distance 6√2.')

p = Plot(-8, 12, -2, 9, width=260)
add('m095', p, [
    p.axes(), p.curve(lambda x: (x - 2) ** 2 / 8 - 1, -7, 11), p.line(-8, 7, 12, 7, dash=True),
    p.dot(2, -1), p.dot(2, 1), p.dot(-6, 7), p.dot(10, 7), p.line(-6, 7, 10, 7, width=3),
    p.label(2, -1, 'vertex', dx=8, dy=12, anchor='start', size=11), p.label(2, 1, 'focus', dx=8, anchor='start', size=11),
    p.label(-6, 7, '−6', dy=-8), p.label(10, 7, '10', dy=-8), p.label(2, 7, '16', dy=-8),
], 'The parabola (x − 2)² = 8(y + 1) meets y = 7 at x = −6 and x = 10, which are 16 apart.')

c = 2 + 2 * S2
p = Plot(-0.5, c + 0.5, -0.5, c + 0.5, width=220)
oct_pts = [(S2, 0), (S2 + 2, 0), (c, S2), (c, S2 + 2), (S2 + 2, c), (S2, c), (0, S2 + 2), (0, S2)]
add('m099', p, [
    p.poly([(0, 0), (c, 0), (c, c), (0, c)], dash=True), p.poly(oct_pts, width=2.5),
    p.shade([(0, 0), (S2, 0), (0, S2)]), p.shade([(c, 0), (c - S2, 0), (c, S2)]),
    p.shade([(c, c), (c - S2, c), (c, c - S2)]), p.shade([(0, c), (S2, c), (0, c - S2)]),
    p.label(S2 / 2, 0, '√2', dy=15, size=12), p.label(S2 + 1, 0, '2', dy=15), p.label(c - S2 / 2, 0, '√2', dy=15, size=12),
], 'The octagon is a square of side 2 + 2√2 with four isosceles right triangles (legs √2, shaded) cut from the corners.')

# ------------------------------------------------------------------ hard
p = Plot(-5, 5, -1, 11, width=200)
add('h025', p, [
    p.poly([(-4, 10), (4, 10), (0, 0)]), p.shade([(-2.4, 6), (2.4, 6), (0, 0)]), p.line(-2.4, 6, 2.4, 6),
    p.line(0, 0, 0, 10, dash=True), p.poly([(0, 0), (4, 10), (0, 10)], width=2.5), p.poly([(0, 0), (2.4, 6), (0, 6)], width=2.5),
    p.label(2, 10, '4', dy=-6), p.label(1.2, 6, 'r', dy=-6, italic=True), p.label(0, 3, 'h', dx=-8, anchor='end', italic=True),
    p.label(0, 8, '10', dx=-8, anchor='end'),
], 'The water cone and the tank are similar triangles: r/h = 4/10, so r = 2h/5. That makes the volume a function of h alone.')

p = Plot(-2.6, 2.6, -0.5, 4.2, width=220)
xs = math.sqrt(2.5)
add('h035', p, [
    p.axes(), p.curve(lambda x: x * x, -2.05, 2.05), p.dot(0, 3), p.dot(xs, 2.5), p.dot(-xs, 2.5),
    p.line(0, 3, xs, 2.5, width=2.5), p.line(0, 3, -xs, 2.5, width=2.5), p.line(0, 3, 0, 0, dash=True),
    p.label(0, 3, '(0, 3)', dy=-8), p.label(xs, 2.5, '√11/2', dx=8, dy=10, anchor='start', size=12),
    p.label(0, 1.5, '3', dx=-6, anchor='end', size=12),
], 'The closest points to (0, 3) are at x = ±√(5/2), distance √11/2, closer than the vertex, which is 3 away.')

r5 = 5 / S2
p = Plot(-6, 6, -1, 6, width=240)
add('h036', p, [
    p.line(-5.8, 0, 5.8, 0, width=1.2), p.arc(0, 0, 5, 0, math.pi),
    p.shade([(-r5, 0), (r5, 0), (r5, r5), (-r5, r5)]), p.poly([(-r5, 0), (r5, 0), (r5, r5), (-r5, r5)]),
    p.line(0, 0, r5, r5, dash=True), p.dot(r5, r5),
    p.label(r5 / 2, 0, 'x', dy=15, italic=True), p.label(r5, r5 / 2, 'y', dx=8, anchor='start', italic=True), p.label(1.5, 2.2, '5', dx=-8),
], 'The best rectangle has its corner at x = y = 5/√2, at 45°. It is 5√2 wide and 5/√2 tall, for an area of 25.')

p = Plot(-5, 2, -1, 11, width=180)
add('h038', p, [
    p.line(-5, 0, 2, 0, width=1.2), p.line(1, 0, 1, 11, width=3), p.line(0, 0, 0, 8, width=3),
    p.line(-4, 0, 0, 8, width=2.5), p.line(0, 8, 1, 10, width=2.5), p.line(0, 8, 1, 8, dash=True),
    p.angle_mark(-4, 0, 0, math.atan(2), 0.9), p.label(-2.8, 0.4, 'θ', size=12),
    p.label(-2.3, 4, '4√5', dx=-6, anchor='end', size=12), p.label(0.5, 9, '√5', dx=-6, anchor='end', size=12),
    p.label(0, 4, '8', dx=6, anchor='start'), p.label(0.5, 8, '1', dy=-4, size=11),
], 'At the optimum tan θ = 2. The ladder splits at the fence top into 8/sin θ = 4√5 and 1/cos θ = √5, for a total of 5√5.')

p = Plot(-0.5, 8.5, -1, 3.5, width=260)
add('h040', p, [
    p.line(-0.5, 0, 8.5, 0, width=1.2), p.dot(0, 3), p.dot(8, 0), p.line(0, 3, 0, 0, dash=True),
    p.line(0, 3, 2.25, 0, width=3), p.line(2.25, 0, 8, 0, width=3), p.dot(2.25, 0),
    p.label(0, 3, 'well', dx=8, anchor='start', size=12), p.label(8, 0, 'refinery', dy=-8, anchor='end', size=12),
    p.label(0, 1.5, '3', dx=-6, anchor='end'), p.label(1.125, 0, '9/4', dy=15, size=12),
    p.label(1.4, 1.8, '15/4', dx=6, anchor='start', size=12), p.label(5.1, 0, '23/4 on land', dy=15, size=12),
], 'The cheapest route reaches the shore 9/4 km along: 15/4 km underwater at $5M and 23/4 km on land at $3M, for a total of $36M.')

rb = math.sqrt(8)
p = Plot(-3.6, 3.6, -3.6, 3.6, width=220)
add('h041', p, [
    p.circle(0, 0, 3), p.poly([(0, 3), (rb, -1), (-rb, -1)], width=2.5), p.dot(0, 0),
    p.line(0, 3, 0, -1, dash=True), p.line(0, 0, rb, -1, dash=True),
    p.label(0, 1.5, 'h = 4', dx=6, anchor='start', size=12), p.label(rb / 2, -1, '2√2', dy=15, size=12),
    p.label(rb / 2, -0.5, '3', dx=4, dy=-4, anchor='start', size=12),
], 'Best cone: height 4 and base radius 2√2. The radius 3 from the sphere\'s center to the base rim gives ρ² + 1² = 3².')

p = Plot(-2, 4, -1, 10, width=200)
add('h049', p, [
    p.axes(), p.shade(p.samples(lambda x: 2 * x + 3, -1, 3, 10) + p.samples(lambda x: x * x, 3, -1, 60)),
    p.curve(lambda x: x * x, -1.8, 3.15), p.line(-1.5, 0, 3.5, 10), p.dot(-1, 1), p.dot(3, 9),
    p.label(-1, 1, '−1', dx=-6, dy=14, anchor='end', size=12), p.label(3, 9, '3', dx=8, anchor='start', size=12),
    p.label(1, 5, 'y = 2x + 3', dx=-8, dy=-6, anchor='end', size=11), p.label(2.2, 4.8, 'y = x²', dx=8, anchor='start', size=11),
], 'The line is above the parabola between their crossings at x = −1 and x = 3. The shaded area is the integral of (2x + 3 − x²).')

p = Plot(-0.5, 4.8, -1.6, 2.6, width=240)
add('h076', p, [
    p.axes(), p.line(-0.5, -1, 4.8, -1, dash=True),
    p.shade([(0, 0)] + p.samples(math.sqrt, 0, 4, 60) + [(4, 0)]), p.curve(math.sqrt, 0, 4),
    p.line(2.5, -1, 2.5, math.sqrt(2.5), width=3), p.line(2.7, -1, 2.7, 0, width=1.5),
    p.label(2.5, 0.6, 'R = √x + 1', dx=-6, anchor='end', size=11), p.label(2.7, -0.5, 'r = 1', dx=6, anchor='start', size=11),
    p.label(4.8, -1, 'axis y = −1', dy=14, anchor='end', size=11),
], 'Washers about y = −1: the outer radius runs from the axis up to the curve (√x + 1), and the inner radius from the axis up to the x-axis (1).')

p = Plot(-0.3, 1.3, -0.2, 1.2, width=220)
add('h077', p, [
    p.axes(), p.line(0, 0, 1.1, 1.1), p.curve(lambda x: x * x, 0, 1.08),
    p.shade(p.samples(lambda x: x, 0, 1, 10) + p.samples(lambda x: x * x, 1, 0, 40), 0.1),
    p.shade([(0.58, 0.58 ** 2), (0.62, 0.62 ** 2), (0.62, 0.62), (0.58, 0.58)], 0.5),
    p.line(0, 0.3, 0.6, 0.3, dash=True),
    p.label(0.3, 0.3, 'radius x', dy=-6, size=11), p.label(0.62, 0.48, 'height x − x²', dx=6, anchor='start', size=11),
], 'A thin vertical strip at x sweeps a cylindrical shell around the y-axis. The radius is x and the height is x − x².')

p = Plot(-2.6, 5.4, -2.6, 2.6, width=260)
xc = 0.9
yc = math.sqrt(4 - xc * xc)
add('h080', p, [
    p.axes(), p.circle(0, 0, 2), p.line(xc, -yc, xc, yc, width=3),
    p.label(xc, yc, 's = 2√(4 − x²)', dx=8, dy=4, anchor='start', size=11), p.label(xc, -yc, 'x', dy=15, italic=True),
], 'Looking down on the base disk: at position x the chord has length 2√(4 − x²). A square with that side stands on it, with area 4(4 − x²).')


SOLUTION_DIAGRAMS = D
