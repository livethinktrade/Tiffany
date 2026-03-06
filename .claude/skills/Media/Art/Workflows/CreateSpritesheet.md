# Spritesheet Generation Workflow

**Generate consistent, properly formatted spritesheets for game animations.**

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the CreateSpritesheet workflow in the Art skill to generate animation frames"}' \
  > /dev/null 2>&1 &
```

Running **CreateSpritesheet** in **Art**...

---

## 🚨🚨🚨 ALL 8 STEPS ARE MANDATORY — NO EXCEPTIONS 🚨🚨🚨

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  EVERY SINGLE STEP BELOW IS MANDATORY. EXECUTE ALL OF THEM.  ⚠️
⚠️  DO NOT SKIP ANY STEP. DO NOT ABBREVIATE. DO NOT SHORTCUT.   ⚠️
⚠️  IF YOU SKIP A STEP, YOU HAVE FAILED THE WORKFLOW.           ⚠️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

```
INPUT: Character description + animation type + reference images
     ↓
[1] UNDERSTAND: Character, animation, type (companion/hero/minion) ← MANDATORY
     ↓
[2] CONFIGURE: Load grid spec from SpriteStandard.md ← MANDATORY
     ↓
[3] KEY POSES: Generate 4 anchor frames (0, 8, 16, 24 for 32-frame) ← MANDATORY
     ↓
[4] TWEENS: Generate in-between frames with key poses as references ← MANDATORY
     ↓
[5] BACKGROUNDS: Remove backgrounds from all frames ← MANDATORY
     ↓
[6] VALIDATE FRAMES: Check consistency, dimensions, transparency ← MANDATORY
     ↓
[7] ASSEMBLE: Montage into grid spritesheet ← MANDATORY
     ↓
[8] CSS: Generate keyframe animation (optional but recommended) ← MANDATORY
```

---

## Step 1: Understand the Request — MANDATORY

**Gather required information:**

1. **Character description** — Detailed visual description for consistency
   - Example: "cute pink floating orb companion with sparkles and gentle glow"

2. **Animation type** — Which row of the spritesheet
   - `idle` (row 0): breathing, floating, blinking
   - `walk` (row 1): movement cycle
   - `attack` (row 2): strike sequence
   - `special` (row 3): character ability

3. **Character type** — Determines grid format
   - `companion`: 8×4 grid, 32 frames, 128×128 each
   - `hero`: 4×4 grid, 16 frames, 256×256 each
   - `minion`: 4×4 grid, 16 frames, 128×128 each

4. **Reference images** — For character consistency (optional but recommended)

**Output:** Clear understanding of what to generate.

---

## Step 2: Configure Grid Spec — MANDATORY

**Load the appropriate configuration from SpriteStandard.md:**

```bash
# Read the spec
cat ~/.claude/skills/Media/Art/Data/SpriteStandard.md
```

**Grid configurations:**

| Type | Columns | Rows | Frames | Frame Size | Sheet Size |
|------|---------|------|--------|------------|------------|
| companion | 8 | 4 | 32 | 128×128 | 1024×512 |
| hero | 4 | 4 | 16 | 256×256 | 1024×1024 |
| minion | 4 | 4 | 16 | 128×128 | 512×512 |

**For idle animation (row 0):** Only generate frames for that row.
- companion idle: 8 frames (columns 0-7 of row 0)
- hero/minion idle: 4 frames (columns 0-3 of row 0)

**Output:** Grid config ready for generation.

---

## Step 3: Generate Key Poses — MANDATORY

**Generate anchor frames FIRST to establish character consistency.**

### Key Pose Positions (for 8-frame idle)

| Frame | Position | Description |
|-------|----------|-------------|
| 0 | Neutral | Base pose, centered |
| 2 | Quarter | Slight movement/breath in |
| 4 | Peak | Maximum of motion cycle |
| 6 | Return | Moving back to neutral |

### Generation Command

```bash
# Generate each key pose
bun run ~/.claude/skills/Media/Art/Tools/Generate.ts \
  --model nano-banana-pro \
  --prompt "[CHARACTER DESCRIPTION] in [POSE DESCRIPTION], game sprite, centered, transparent background, 2D art style, consistent proportions" \
  --size 1K \
  --aspect-ratio 1:1 \
  --reference-image [USER_REFERENCE_IF_PROVIDED] \
  --remove-bg \
  --output ~/Downloads/sprite-frames/frame-00.png
```

### Key Pose Prompts (Idle Animation)

**Frame 0 — Neutral:**
```
[CHARACTER] in neutral idle pose, relaxed, breathing normally, centered in frame
```

**Frame 2 — Inhale:**
```
[CHARACTER] with slight upward float, gentle breath in, body rising slightly
```

**Frame 4 — Peak:**
```
[CHARACTER] at peak of idle motion, fully expanded, brightest glow/most extended
```

**Frame 6 — Exhale:**
```
[CHARACTER] breathing out, settling back down, body contracting slightly
```

**Output:** 4 key pose images saved.

---

## Step 4: Generate Tween Frames — MANDATORY

**Generate in-between frames using ALL key poses as references.**

### Tween Strategy

Use all previously generated key poses as reference images for consistency:

```bash
bun run ~/.claude/skills/Media/Art/Tools/Generate.ts \
  --model nano-banana-pro \
  --prompt "[CHARACTER] transitioning between [PREV_POSE] and [NEXT_POSE], [SPECIFIC POSITION DESCRIPTION]" \
  --reference-image ~/Downloads/sprite-frames/frame-00.png \
  --reference-image ~/Downloads/sprite-frames/frame-02.png \
  --reference-image ~/Downloads/sprite-frames/frame-04.png \
  --reference-image ~/Downloads/sprite-frames/frame-06.png \
  --size 1K \
  --aspect-ratio 1:1 \
  --remove-bg \
  --output ~/Downloads/sprite-frames/frame-01.png
```

### Tween Descriptions

| Frame | Between | Description |
|-------|---------|-------------|
| 1 | 0→2 | Just starting to rise, slight upward motion |
| 3 | 2→4 | Continuing rise, approaching peak |
| 5 | 4→6 | Beginning descent from peak |
| 7 | 6→0 | Settling back to neutral, completing cycle |

**Output:** All 8 frames generated (or 4 for hero/minion row).

---

## Step 5: Remove Backgrounds — MANDATORY

**Ensure all frames have transparent backgrounds.**

If `--remove-bg` wasn't used during generation:

```bash
# Batch remove backgrounds
for f in ~/Downloads/sprite-frames/frame-*.png; do
  bun run ~/.claude/skills/Media/Art/Tools/RemoveBg.ts "$f"
done
```

**Output:** All frames have transparent backgrounds.

---

## Step 6: Validate Frames — MANDATORY

**Check each frame before assembly:**

### Validation Checklist

- [ ] All frames exist (0-7 for companion, 0-3 for hero/minion)
- [ ] All frames are same dimensions (128×128 or 256×256)
- [ ] All frames have transparent background (check alpha channel)
- [ ] Character is consistently sized across frames
- [ ] Character is centered in each frame
- [ ] Animation flow is smooth (view in sequence)

### Dimension Check

```bash
# Check all frame dimensions
for f in ~/Downloads/sprite-frames/frame-*.png; do
  magick identify "$f"
done
```

### Visual Review

```bash
# Open all frames for visual inspection
open ~/Downloads/sprite-frames/frame-*.png
```

**If any frame fails validation:** Regenerate that specific frame.

**Output:** All frames validated.

---

## Step 7: Assemble Spritesheet — MANDATORY

**Use ImageMagick montage to create the grid.**

### Montage Commands

**Companion idle (8 frames, single row):**
```bash
montage ~/Downloads/sprite-frames/frame-{00..07}.png \
  -tile 8x1 \
  -geometry 128x128+0+0 \
  -background none \
  ~/Downloads/megan-companion-idle.png
```

**Full companion sheet (32 frames, 8×4 grid):**
```bash
montage ~/Downloads/sprite-frames/frame-{00..31}.png \
  -tile 8x4 \
  -geometry 128x128+0+0 \
  -background none \
  ~/Downloads/megan-companion-full.png
```

**Hero (16 frames, 4×4 grid):**
```bash
montage ~/Downloads/sprite-frames/frame-{00..15}.png \
  -tile 4x4 \
  -geometry 256x256+0+0 \
  -background none \
  ~/Downloads/mocha-hero-idle.png
```

### Verify Output Dimensions

```bash
magick identify ~/Downloads/[output-name].png
# Should show: 1024x512 for companion, 1024x1024 for hero, 512x512 for minion
```

**Output:** Assembled spritesheet at correct dimensions.

---

## Step 8: Generate CSS — MANDATORY

**Create the animation keyframes for use in game/web.**

### CSS Generation

For a single-row animation (e.g., idle only):

```css
/* Generated CSS for [character]-[type]-[animation] */

.sprite-[character] {
  width: [FRAME_WIDTH]px;
  height: [FRAME_HEIGHT]px;
  background-image: url('[filename].png');
  background-size: [COLS * 100]% 100%;
  animation: [character]-[animation] [DURATION]s steps(1) infinite;
}

@keyframes [character]-[animation] {
  /* For 8-frame single row: */
  0%      { background-position: 0% 0%; }
  12.5%   { background-position: 14.286% 0%; }
  25%     { background-position: 28.571% 0%; }
  37.5%   { background-position: 42.857% 0%; }
  50%     { background-position: 57.143% 0%; }
  62.5%   { background-position: 71.429% 0%; }
  75%     { background-position: 85.714% 0%; }
  87.5%   { background-position: 100% 0%; }
}
```

### Save CSS File

```bash
# Save alongside the spritesheet
echo "[CSS CONTENT]" > ~/Downloads/[character]-[type]-[animation].css
```

**Output:** CSS file ready for integration.

---

## Quick Reference

### Full Workflow Command (CLI Tool)

```bash
bun run ~/.claude/skills/Media/Art/Tools/CreateSpritesheet.ts \
  --character "cute pink floating orb companion with sparkles and gentle glow" \
  --animation idle \
  --type companion \
  --reference-image ~/refs/megan-face.png \
  --css \
  --output ~/Downloads/megan-companion-idle.png
```

### Output Files

| File | Description |
|------|-------------|
| `[name].png` | Spritesheet image |
| `[name].css` | Animation keyframes (if --css) |
| `sprite-frames/` | Individual frames (intermediate) |

---

## Troubleshooting

### Character inconsistency between frames
- Add more reference images (up to 14 supported)
- Generate key poses first, use them all as references for tweens
- Be more specific in character description

### Animation feels jerky
- Add more in-between frames
- Check that poses flow smoothly
- Verify timing in CSS (adjust duration)

### Montage produces wrong dimensions
- Verify `-geometry` matches frame size
- Verify `-tile` matches grid dimensions
- Check input frames are correct size

### Background not transparent
- Re-run RemoveBg.ts on all frames
- Verify PNG has alpha channel
- Use `-background none` in montage

---

**The workflow: UNDERSTAND → CONFIGURE → KEY POSES → TWEENS → BACKGROUNDS → VALIDATE → ASSEMBLE → CSS → Complete**
