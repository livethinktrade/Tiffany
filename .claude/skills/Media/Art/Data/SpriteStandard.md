# Spritesheet Standard Specification

Standard formats and formulas for game sprite animation sheets.

---

## Grid Formats

| Type | Grid | Frames | Frame Size | Sheet Size | Duration | FPS |
|------|------|--------|------------|------------|----------|-----|
| **Companion** | 8×4 | 32 | 128×128 | 1024×512 | 8s | 4 |
| **Hero** | 4×4 | 16 | 256×256 | 1024×1024 | 12s | 1.33 |
| **Minion** | 4×4 | 16 | 128×128 | 512×512 | 12s | 1.33 |

---

## Animation Row Layout

Each row represents a different animation state:

| Row | Animation | Motion Description |
|-----|-----------|---------------------|
| 0 | **Idle** | Subtle breathing, floating, blinking |
| 1 | **Walk** | Left-to-right walk cycle |
| 2 | **Attack** | Wind-up, strike, follow-through |
| 3 | **Special** | Character-specific ability |

---

## Naming Convention

```
{character}-{type}-{animation}.png
```

### Examples
```
megan-companion-idle.png
mocha-hero-attack.png
doubt-minion-idle.png
tiffany-companion-walk.png
aaron-companion-special.png
```

---

## CSS Keyframe Formulas

### The Math (First Principles)

CSS `background-position` percentages represent position within **slidable space**, not raw image percentages.

**Key formulas:**
```
Slidable space = background_size - element_size
Column position (%) = column_index × (100 / (columns - 1))
Row position (%) = row_index × (100 / (rows - 1))
Keyframe time (%) = frame_index × (100 / total_frames)
```

### Why 14.286% not 12.5% for 8 columns

- **Wrong**: 100 / 8 = 12.5% (dividing by column count)
- **Correct**: 100 / 7 = 14.286% (dividing by slidable steps)

The denominator is `(columns - 1)` because frame 0 is at 0% and frame 7 is at 100%.

---

## CSS Generation Examples

### Companion (8×4 grid, 32 frames)

```css
.sprite-companion {
  width: 128px;
  height: 128px;
  background-size: 800% 400%;  /* 8 cols × 100%, 4 rows × 100% */
  animation: companion-idle 8s steps(1) infinite;
}

@keyframes companion-idle {
  0%      { background-position: 0% 0%; }        /* frame 0: col 0, row 0 */
  3.125%  { background-position: 14.286% 0%; }   /* frame 1: col 1, row 0 */
  6.25%   { background-position: 28.571% 0%; }   /* frame 2: col 2, row 0 */
  9.375%  { background-position: 42.857% 0%; }   /* frame 3: col 3, row 0 */
  12.5%   { background-position: 57.143% 0%; }   /* frame 4: col 4, row 0 */
  15.625% { background-position: 71.429% 0%; }   /* frame 5: col 5, row 0 */
  18.75%  { background-position: 85.714% 0%; }   /* frame 6: col 6, row 0 */
  21.875% { background-position: 100% 0%; }      /* frame 7: col 7, row 0 */
  25%     { background-position: 0% 33.333%; }   /* frame 8: col 0, row 1 */
  /* ... continues for all 32 frames ... */
  96.875% { background-position: 100% 100%; }    /* frame 31: col 7, row 3 */
}
```

### Hero/Minion (4×4 grid, 16 frames)

```css
.sprite-hero {
  width: 256px;
  height: 256px;
  background-size: 400% 400%;  /* 4 cols × 100%, 4 rows × 100% */
  animation: hero-idle 12s steps(1) infinite;
}

@keyframes hero-idle {
  0%      { background-position: 0% 0%; }        /* frame 0 */
  6.25%   { background-position: 33.333% 0%; }   /* frame 1 */
  12.5%   { background-position: 66.667% 0%; }   /* frame 2 */
  18.75%  { background-position: 100% 0%; }      /* frame 3 */
  25%     { background-position: 0% 33.333%; }   /* frame 4 */
  /* ... continues for all 16 frames ... */
  93.75%  { background-position: 100% 100%; }    /* frame 15 */
}
```

---

## Formula Reference Card

| Grid | Columns | Rows | Col Step | Row Step | Frame Step | background-size |
|------|---------|------|----------|----------|------------|-----------------|
| 8×4 | 8 | 4 | 14.286% | 33.333% | 3.125% | 800% 400% |
| 4×4 | 4 | 4 | 33.333% | 33.333% | 6.25% | 400% 400% |
| 8×8 | 8 | 8 | 14.286% | 14.286% | 1.5625% | 800% 800% |

### General Formula

```javascript
const colStep = 100 / (columns - 1);
const rowStep = 100 / (rows - 1);
const frameStep = 100 / totalFrames;

function getPosition(frameIndex, columns) {
  const col = frameIndex % columns;
  const row = Math.floor(frameIndex / columns);
  return {
    x: col * colStep,
    y: row * rowStep
  };
}
```

---

## Frame Generation Strategy

### Key Pose Approach (Recommended)

1. **Generate 4 key poses** (anchor frames)
   - Frame 0: Start position
   - Frame 8: Quarter through (for 32-frame)
   - Frame 16: Halfway
   - Frame 24: Three-quarters

2. **Generate in-between frames** with all key poses as references
   - Use `--reference-image` flag with ALL key poses
   - Describe exact position in animation arc
   - nano-banana-pro supports up to 14 reference images

3. **Background removal** on all frames
   - Use `--remove-bg` flag or separate RemoveBg.ts tool

4. **Montage assembly**
   ```bash
   montage frame-*.png -tile 8x4 -geometry 128x128+0+0 spritesheet.png
   ```

---

## ImageMagick Montage Commands

### Companion (8×4)
```bash
montage frame-{00..31}.png -tile 8x4 -geometry 128x128+0+0 -background none output.png
```

### Hero (4×4)
```bash
montage frame-{00..15}.png -tile 4x4 -geometry 256x256+0+0 -background none output.png
```

### Minion (4×4)
```bash
montage frame-{00..15}.png -tile 4x4 -geometry 128x128+0+0 -background none output.png
```

**Flags:**
- `-tile CxR` — Grid dimensions (columns × rows)
- `-geometry WxH+0+0` — Frame size with no spacing
- `-background none` — Preserve transparency

---

## Validation Checklist

Before using a spritesheet:

- [ ] Sheet dimensions match spec (e.g., 1024×512 for companion)
- [ ] Frame count matches grid (e.g., 32 frames for 8×4)
- [ ] All frames have transparent background
- [ ] Frames are consistently sized
- [ ] Character is centered in each frame
- [ ] Animation flows smoothly when played
- [ ] CSS keyframes use correct percentage formulas
