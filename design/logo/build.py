# /// script
# dependencies = ["fonttools", "uharfbuzz"]
# ///
"""Build the WeTube logo SVGs (and PNGs when rsvg-convert is installed).

Run with: uv run build.py

Symbol: two identical right-pointing triangles with a 16.8-unit border and
5-unit clipped corners. Each triangle is split on its corner bisectors: the
left and lower edges (together the W) are red, the top edge is pale red.
Wordmark: lowercase "etube" from Chakra Petch Bold Italic outlines, in red.
"""
from pathlib import Path
import math
import shutil
import subprocess

import uharfbuzz as hb
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent
FONT = ROOT / 'fonts' / 'ChakraPetch-BoldItalic.ttf'

RED = '#ed004a'
EDGES = {'light': '#f6a8c0', 'dark': '#6c1636'}  # top-edge color per background
HEIGHT = 112.0       # cap height of the composition: etube spans exactly 0..HEIGHT
MARGIN_X, MARGIN_Y = 24, 28
TEXT_GAP = 7.589     # visible gap between the triangle tips and the e
TRIANGLE = [(8., 0.), (20., 112.), (86., 48.)]  # top-left, bottom-left, tip
STEP = 62.857142857  # second triangle = first moved right
WEIGHT = 16.8        # border width, measured perpendicular to each edge
CHAMFER = 5.0        # clipped length at each outer corner
UNDERLAP = 1.0       # pale color runs this far under the red to avoid a seam


def intersection(p, v, q, w):
    det = v[0] * w[1] - v[1] * w[0]
    t = ((q[0] - p[0]) * w[1] - (q[1] - p[1]) * w[0]) / det
    return (p[0] + t * v[0], p[1] + t * v[1])


def inset(poly, distance):
    center = (sum(x for x, _ in poly) / len(poly), sum(y for _, y in poly) / len(poly))
    lines = []
    for p, q in zip(poly, poly[1:] + poly[:1]):
        v = (q[0] - p[0], q[1] - p[1])
        length = math.hypot(*v)
        n = (-v[1] / length, v[0] / length)
        if n[0] * (center[0] - p[0]) + n[1] * (center[1] - p[1]) < 0:
            n = (-n[0], -n[1])
        lines.append(((p[0] + distance * n[0], p[1] + distance * n[1]), v))
    return [intersection(*lines[i - 1], *lines[i]) for i in range(len(poly))]


def chamfer(poly, distance):
    result = []
    for i, p in enumerate(poly):
        for q in (poly[i - 1], poly[(i + 1) % len(poly)]):
            v = (q[0] - p[0], q[1] - p[1])
            length = math.hypot(*v)
            result.append((p[0] + v[0] * distance / length, p[1] + v[1] * distance / length))
    return result


def unit(v):
    length = math.hypot(*v)
    return (v[0] / length, v[1] / length)


def incenter(a, b, c):
    la, lb, lc = math.dist(b, c), math.dist(c, a), math.dist(a, b)
    s = la + lb + lc
    return ((la * a[0] + lb * b[0] + lc * c[0]) / s, (la * a[1] + lb * b[1] + lc * c[1]) / s)


def regions(tri):
    """Red W region (left + lower edge) and pale region (top edge).

    The inset counter's corners lie on the bisectors, so splitting through the
    incenter joins each outer corner to its counter corner like a miter."""
    a, b, c = tri
    i = incenter(a, b, c)
    far = lambda p: (i[0] + (p[0] - i[0]) * 4, i[1] + (p[1] - i[1]) * 4)
    red = [i, far(a), far(b), far(c)]

    def toward_b(p):
        d = unit((p[0] - i[0], p[1] - i[1]))
        n = (-d[1], d[0])
        if n[0] * (b[0] - i[0]) + n[1] * (b[1] - i[1]) < 0:
            n = (-n[0], -n[1])
        return n, d

    (na, da), (nc, dc) = toward_b(a), toward_b(c)
    pa = (i[0] + UNDERLAP * na[0], i[1] + UNDERLAP * na[1])
    pc = (i[0] + UNDERLAP * nc[0], i[1] + UNDERLAP * nc[1])
    s = intersection(pa, da, pc, dc)
    pale = [s, (s[0] + da[0] * 400, s[1] + da[1] * 400), (s[0] + dc[0] * 400, s[1] + dc[1] * 400)]
    return red, pale


def shift(poly, dx):
    return [(x + dx, y) for x, y in poly]


def points(poly):
    return ' '.join(f'{x:.7f},{y:.7f}' for x, y in poly)


OUTER = chamfer(TRIANGLE, CHAMFER)
INNER = chamfer(inset(TRIANGLE, WEIGHT), min(CHAMFER * .25, 1.25))
VISIBLE = OUTER + shift(OUTER, STEP)
X0, X1 = min(x for x, _ in VISIBLE), max(x for x, _ in VISIBLE)
Y0, Y1 = min(y for _, y in VISIBLE), max(y for _, y in VISIBLE)
# Fit the clipped triangles to the full text height, so their top meets the top
# of the b and their bottom corners sit on the baseline of etube.
FIT = HEIGHT / (Y1 - Y0)
SYMBOL_WIDTH = (X1 - X0) * FIT


def symbol(edge):
    red_region, pale_region = regions(TRIANGLE)
    clips = ''.join(f'<clipPath id="outer-{k}"><polygon points="{points(shift(OUTER, k * STEP))}"/></clipPath>' for k in (0, 1))
    counters = ''.join(f'<polygon points="{points(shift(INNER, k * STEP))}" fill="black"/>' for k in (0, 1))
    defs = (f'<defs>{clips}<mask id="play-counters" x="0" y="-1" width="170" height="114" maskUnits="userSpaceOnUse" style="mask-type:luminance">'
            f'<rect x="0" y="-1" width="170" height="114" fill="white"/>{counters}</mask></defs>')
    # Pale top edges first, then the red W strokes of both triangles on top, so
    # the second triangle's left edge stays continuous across the first tip.
    tops = ''.join(f'<polygon clip-path="url(#outer-{k})" points="{points(shift(pale_region, k * STEP))}"/>' for k in (0, 1))
    ws = ''.join(f'<polygon clip-path="url(#outer-{k})" points="{points(shift(red_region, k * STEP))}"/>' for k in (0, 1))
    return (f'<g transform="scale({FIT:.9f}) translate({-X0:.7f} {-Y0:.7f})">{defs}'
            f'<g mask="url(#play-counters)"><g fill="{edge}">{tops}</g><g fill="{RED}">{ws}</g></g></g>')


def etube():
    tt = TTFont(FONT)
    glyphset = tt.getGlyphSet()
    order = tt.getGlyphOrder()
    face = hb.Face(FONT.read_bytes())
    font = hb.Font(face)
    font.scale = (face.upem, face.upem)
    hb.ot_font_set_funcs(font)
    buffer = hb.Buffer()
    buffer.add_str('etube')
    buffer.guess_segment_properties()
    hb.shape(font, buffer, {'kern': True})
    bounds = BoundsPen(glyphset)
    paths, x = [], 0
    for info, pos in zip(buffer.glyph_infos, buffer.glyph_positions):
        pen = SVGPathPen(glyphset)
        glyph = glyphset[order[info.codepoint]]
        for target in (pen, bounds):
            glyph.draw(TransformPen(target, (1, 0, 0, 1, x + pos.x_offset, pos.y_offset)))
        paths.append(pen.getCommands())
        x += pos.x_advance
    return paths, bounds.bounds


def wrap(body, width, title):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{width + 2 * MARGIN_X:.3f}" height="{HEIGHT + 2 * MARGIN_Y:.0f}" '
            f'viewBox="0 0 {width + 2 * MARGIN_X:.3f} {HEIGHT + 2 * MARGIN_Y:.0f}" role="img" aria-label="{title}"><title>{title}</title>'
            f'<g transform="translate({MARGIN_X} {MARGIN_Y})">{body}</g></svg>\n')


FAVICON_PAD = 2.0  # units around the symbol; a tab icon has no room for the logo files' margins


def favicon(mark):
    """The symbol alone in a square cropped to it, for browser tabs. Its top edges follow the
    browser's light or dark theme, since a tab bar is either."""
    side = SYMBOL_WIDTH + 2 * FAVICON_PAD
    body = mark.replace(f'<g fill="{EDGES["dark"]}">', '<g class="edge">')
    assert 'class="edge"' in body, 'symbol() no longer groups the top edges by fill color'
    style = (f'<style>.edge{{fill:{EDGES["dark"]}}}'
             f'@media (prefers-color-scheme: light){{.edge{{fill:{EDGES["light"]}}}}}</style>')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{side:.3f}" height="{side:.3f}" viewBox="0 0 {side:.3f} {side:.3f}" '
            f'role="img" aria-label="WeTube"><title>WeTube</title>{style}'
            f'<g transform="translate({FAVICON_PAD} {(side - HEIGHT) / 2:.3f})">{body}</g></svg>\n')


def main():
    paths, (xmin, ymin, xmax, ymax) = etube()
    scale = HEIGHT / (ymax - ymin)
    left = SYMBOL_WIDTH + TEXT_GAP
    text = (f'<g fill="{RED}" transform="translate({left - xmin * scale:.8f} {ymax * scale:.8f}) scale({scale:.9f} {-scale:.9f})">'
            + ''.join(f'<path d="{p}"/>' for p in paths) + '</g>')
    logo_width = left + (xmax - xmin) * scale
    written = []
    for surface, edge in EDGES.items():
        mark = symbol(edge)
        for name, body, width, title in [(f'wetube-logo-on-{surface}', mark + text, logo_width, 'WeTube'),
                                         (f'wetube-mark-on-{surface}', mark, SYMBOL_WIDTH, 'WeTube symbol')]:
            (ROOT / f'{name}.svg').write_text(wrap(body, width, title))
            written.append(name)
    (ROOT / 'wetube-favicon.svg').write_text(favicon(symbol(EDGES['dark'])))
    print(f'symbol fit {FIT:.5f}; symbol {SYMBOL_WIDTH:.3f} x {HEIGHT:.0f}; logo {logo_width:.3f} x {HEIGHT:.0f} (plus {MARGIN_X}/{MARGIN_Y} margins)')
    if shutil.which('rsvg-convert'):
        for name in written:
            size = ['-w', '2400'] if 'logo' in name else ['-h', '1024']
            subprocess.run(['rsvg-convert', *size, f'{name}.svg', '-o', f'{name}.png'], cwd=ROOT, check=True)
        # For browsers that take no SVG tab icon; a PNG cannot follow the theme, so it keeps the dark edges.
        subprocess.run(['rsvg-convert', '-w', '64', 'wetube-favicon.svg', '-o', 'wetube-favicon.png'], cwd=ROOT, check=True)
        print('PNGs exported with rsvg-convert.')
    else:
        print('rsvg-convert not found; PNGs not regenerated.')


if __name__ == '__main__':
    main()
