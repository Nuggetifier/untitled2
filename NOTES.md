# Notes

Notes from working on the renderer with Claude (Nov 2026).

**Working preference:** Claude explains and points to the code, but only edits when I ask, and only changes what I name.

## Open bugs

### `behind` flag never resets (game.ts, perspective projection loop)

`let behind = false;` is declared *before* the `for (let i = 0; i < 7; i++)` corner loop and never reset.
Once one corner has `depth <= 0`, every later corner in the loop is also flagged as behind, even if it's in front of the camera.

- Effect: visible points end up in the "behind" part of `newPoints`, so the reflection math in `drawCubeFace` reflects one *visible* point about another.
- Depends on view direction because which corner goes behind first changes as the camera turns.
- Fix idea: each corner needs its own result. Reset `behind` at the start of each pass, or use `depth <= 0` directly for that corner.

### Corner pairing in `drawCubeFace` (2-behind case, and probably 1 and 3)

Building `newPoints` with `splice(0, 0, …)` for visible points (reverses them) and `push` for behind points (keeps order) means the fixed pairs (`point0`/`point2`, `point1`/`point3`) only match real neighbors for some faces.

With face corners A, B, C, D in loop order:

| Visible | `newPoints` | Code pairs | Actual neighbors | Result |
|---|---|---|---|---|
| A, B | `[B, A, C, D]` | B–C, A–D | B–C, A–D | correct |
| B, C | `[C, B, A, D]` | C–A, B–D | C–D, B–A | wrong |
| C, D | `[D, C, A, B]` | D–A, C–B | D–A, C–B | correct |
| D, A | `[D, A, B, C]` | D–B, A–C | D–C, A–B | wrong |

Fix idea: keep the loop order. Rotate the array so it starts at the visible corner that comes right after a behind one, or find each visible corner's behind neighbor by index with `(i + 1) % 4` or `(i + 3) % 4`.

## Lessons

- **`if` without `{}` controls only the next statement.** An unbraced `if (pointsBehind === 3)` made `ctx.beginPath()` conditional.
- **Canvas paths:** `fill()` fills everything since the last `beginPath()`, and `closePath()` doesn't reset it. Without `beginPath()`, old faces get redrawn every frame, so the screen looks like it isn't refreshing.
- **`===` vs `==`:** `===` compares type and value with no conversion. Use it by default. There's no `====`. `Object.is` differs only for `NaN` and `+0`/`-0`.

## Setup

- **Repo:** https://github.com/Nuggetifier/untitled2 (private, account Nuggetifier).
- **New computer:**
  1. `gh auth login`
  2. `gh repo clone Nuggetifier/untitled2` (or WebStorm: File → New → Project from Version Control)
  3. `npm install`
  4. `npm run dev`
- **Sync:** run `git add .; git commit -m "..."; git push` before leaving a computer, and `git pull` when starting on the other one.
- **Node on this PC:** installed at `C:\Users\Nima1\AppData\Local\Programs\NodeJS\node-v24.22.2-win-x64`, which isn't on PATH. WebStorm finds it, but to use `npm` in a regular terminal, add that folder to PATH.
