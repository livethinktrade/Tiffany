#!/usr/bin/env bun

/**
 * CreateSpritesheet - Spritesheet Generation CLI
 *
 * Generate consistent spritesheets for game animations using key pose strategy.
 * Outputs properly formatted spritesheet PNG and optional CSS keyframes.
 *
 * Usage:
 *   bun run CreateSpritesheet.ts --character "description" --animation idle --type companion --output ~/Downloads/sprite.png
 *
 * @see ~/.claude/skills/Media/Art/Data/SpriteStandard.md
 */

import { spawn } from "bun";
import { mkdir, readFile, writeFile, exists } from "node:fs/promises";
import { resolve, dirname, basename } from "node:path";

// ============================================================================
// Types
// ============================================================================

type CharacterType = "companion" | "hero" | "minion";
type AnimationType = "idle" | "walk" | "attack" | "special";

interface GridConfig {
  columns: number;
  rows: number;
  totalFrames: number;
  frameWidth: number;
  frameHeight: number;
  sheetWidth: number;
  sheetHeight: number;
  duration: number;
  fps: number;
}

interface CLIArgs {
  character: string;
  animation: AnimationType;
  type: CharacterType;
  referenceImages: string[];
  output: string;
  css: boolean;
  keyPosesOnly: boolean;
  framesDir?: string;
}

// ============================================================================
// Configuration
// ============================================================================

const GRID_CONFIGS: Record<CharacterType, GridConfig> = {
  companion: {
    columns: 8,
    rows: 4,
    totalFrames: 32,
    frameWidth: 128,
    frameHeight: 128,
    sheetWidth: 1024,
    sheetHeight: 512,
    duration: 8,
    fps: 4,
  },
  hero: {
    columns: 4,
    rows: 4,
    totalFrames: 16,
    frameWidth: 256,
    frameHeight: 256,
    sheetWidth: 1024,
    sheetHeight: 1024,
    duration: 12,
    fps: 1.33,
  },
  minion: {
    columns: 4,
    rows: 4,
    totalFrames: 16,
    frameWidth: 128,
    frameHeight: 128,
    sheetWidth: 512,
    sheetHeight: 512,
    duration: 12,
    fps: 1.33,
  },
};

// Animation row descriptions for prompts
const ANIMATION_DESCRIPTIONS: Record<AnimationType, { poses: string[] }> = {
  idle: {
    poses: [
      "neutral idle pose, relaxed, breathing normally",
      "slight upward float, gentle breath in",
      "at peak of idle motion, fully expanded",
      "breathing out, settling back down",
    ],
  },
  walk: {
    poses: [
      "starting walk pose, weight shifting",
      "mid-stride, one foot forward",
      "full stride, maximum extension",
      "returning to start, completing cycle",
    ],
  },
  attack: {
    poses: [
      "wind-up pose, preparing to strike",
      "mid-swing, building momentum",
      "full strike, maximum impact",
      "follow-through, recovering",
    ],
  },
  special: {
    poses: [
      "channeling energy, charging up",
      "power building, glowing",
      "releasing ability, peak effect",
      "recovering, energy dissipating",
    ],
  },
};

const PAI_DIR = process.env.PAI_DIR || resolve(process.env.HOME!, ".claude");
const GENERATE_SCRIPT = resolve(PAI_DIR, "skills/Media/Art/Tools/Generate.ts");

// ============================================================================
// Help
// ============================================================================

function showHelp(): void {
  console.log(`
CreateSpritesheet - Spritesheet Generation CLI

Generate consistent spritesheets for game animations.

USAGE:
  bun run CreateSpritesheet.ts --character "<description>" --animation <type> --type <char-type> [OPTIONS]

REQUIRED:
  --character <desc>     Character description for AI generation
  --animation <type>     Animation type: idle, walk, attack, special
  --type <char-type>     Character type: companion, hero, minion

OPTIONS:
  --reference-image <path>   Reference image for consistency (can use multiple)
  --output <path>            Output spritesheet path (default: ~/Downloads/spritesheet.png)
  --css                      Generate CSS keyframes file alongside spritesheet
  --key-poses-only           Only generate key poses (for review before full generation)
  --frames-dir <path>        Directory for intermediate frames (default: auto-generated)
  --help, -h                 Show this help message

GRID SPECIFICATIONS:
  companion: 8x4 grid, 32 frames, 128x128 each, 1024x512 sheet
  hero:      4x4 grid, 16 frames, 256x256 each, 1024x1024 sheet
  minion:    4x4 grid, 16 frames, 128x128 each, 512x512 sheet

EXAMPLES:
  # Generate Megan companion idle spritesheet
  bun run CreateSpritesheet.ts \\
    --character "cute pink floating orb with sparkles and gentle glow" \\
    --animation idle \\
    --type companion \\
    --reference-image ~/refs/megan.png \\
    --css \\
    --output ~/Downloads/megan-companion-idle.png

  # Generate key poses only for review
  bun run CreateSpritesheet.ts \\
    --character "fierce warrior with flaming sword" \\
    --animation attack \\
    --type hero \\
    --key-poses-only \\
    --output ~/Downloads/warrior-attack.png

OUTPUT:
  [output].png          Assembled spritesheet
  [output].css          CSS keyframes (if --css flag used)
  [frames-dir]/         Individual frame images

MORE INFO:
  Specification: ~/.claude/skills/Media/Art/Data/SpriteStandard.md
  Workflow:      ~/.claude/skills/Media/Art/Workflows/CreateSpritesheet.md
`);
  process.exit(0);
}

// ============================================================================
// Argument Parsing
// ============================================================================

function parseArgs(argv: string[]): CLIArgs {
  const args = argv.slice(2);

  if (args.includes("--help") || args.includes("-h") || args.length === 0) {
    showHelp();
  }

  const parsed: Partial<CLIArgs> = {
    referenceImages: [],
    css: false,
    keyPosesOnly: false,
    output: resolve(process.env.HOME!, "Downloads/spritesheet.png"),
  };

  for (let i = 0; i < args.length; i++) {
    const flag = args[i];

    if (!flag.startsWith("--")) {
      console.error(`❌ Invalid flag: ${flag}`);
      process.exit(1);
    }

    const key = flag.slice(2);

    // Boolean flags
    if (key === "css") {
      parsed.css = true;
      continue;
    }
    if (key === "key-poses-only") {
      parsed.keyPosesOnly = true;
      continue;
    }

    // Value flags
    const value = args[i + 1];
    if (!value || value.startsWith("--")) {
      console.error(`❌ Missing value for flag: ${flag}`);
      process.exit(1);
    }

    switch (key) {
      case "character":
        parsed.character = value;
        i++;
        break;
      case "animation":
        if (!["idle", "walk", "attack", "special"].includes(value)) {
          console.error(`❌ Invalid animation: ${value}. Must be: idle, walk, attack, special`);
          process.exit(1);
        }
        parsed.animation = value as AnimationType;
        i++;
        break;
      case "type":
        if (!["companion", "hero", "minion"].includes(value)) {
          console.error(`❌ Invalid type: ${value}. Must be: companion, hero, minion`);
          process.exit(1);
        }
        parsed.type = value as CharacterType;
        i++;
        break;
      case "reference-image":
        parsed.referenceImages!.push(value);
        i++;
        break;
      case "output":
        parsed.output = value;
        i++;
        break;
      case "frames-dir":
        parsed.framesDir = value;
        i++;
        break;
      default:
        console.error(`❌ Unknown flag: ${flag}`);
        process.exit(1);
    }
  }

  // Validate required args
  if (!parsed.character) {
    console.error("❌ Missing required argument: --character");
    process.exit(1);
  }
  if (!parsed.animation) {
    console.error("❌ Missing required argument: --animation");
    process.exit(1);
  }
  if (!parsed.type) {
    console.error("❌ Missing required argument: --type");
    process.exit(1);
  }

  return parsed as CLIArgs;
}

// ============================================================================
// Frame Generation
// ============================================================================

async function generateFrame(
  prompt: string,
  referenceImages: string[],
  outputPath: string,
  frameSize: number
): Promise<void> {
  const args = [
    "run",
    GENERATE_SCRIPT,
    "--model", "nano-banana-pro",
    "--prompt", prompt,
    "--size", "1K",
    "--aspect-ratio", "1:1",
    "--remove-bg",
    "--output", outputPath,
  ];

  // Add reference images
  for (const ref of referenceImages) {
    args.push("--reference-image", ref);
  }

  console.log(`  Generating: ${basename(outputPath)}`);

  const proc = spawn({
    cmd: ["bun", ...args],
    stdout: "inherit",
    stderr: "inherit",
  });

  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    throw new Error(`Frame generation failed for ${outputPath}`);
  }
}

async function generateKeyPoses(
  args: CLIArgs,
  config: GridConfig,
  framesDir: string
): Promise<string[]> {
  const keyPoseIndices = config.columns === 8 ? [0, 2, 4, 6] : [0, 1, 2, 3];
  const poses = ANIMATION_DESCRIPTIONS[args.animation].poses;
  const generatedPaths: string[] = [];

  console.log("\n🎨 Generating key poses...\n");

  for (let i = 0; i < keyPoseIndices.length; i++) {
    const frameIndex = keyPoseIndices[i];
    const paddedIndex = frameIndex.toString().padStart(2, "0");
    const outputPath = resolve(framesDir, `frame-${paddedIndex}.png`);

    const prompt = `${args.character}, ${poses[i]}, game sprite, centered, transparent background, 2D art style, consistent proportions`;

    // Use user-provided references plus any previously generated key poses
    const refs = [...args.referenceImages, ...generatedPaths];

    await generateFrame(prompt, refs, outputPath, config.frameWidth);
    generatedPaths.push(outputPath);
  }

  return generatedPaths;
}

async function generateTweenFrames(
  args: CLIArgs,
  config: GridConfig,
  framesDir: string,
  keyPosePaths: string[]
): Promise<void> {
  const keyPoseIndices = config.columns === 8 ? [0, 2, 4, 6] : [0, 1, 2, 3];
  const totalFrames = config.columns; // For single-row animation
  const poses = ANIMATION_DESCRIPTIONS[args.animation].poses;

  console.log("\n🎨 Generating tween frames...\n");

  for (let i = 0; i < totalFrames; i++) {
    // Skip key poses (already generated)
    if (keyPoseIndices.includes(i)) continue;

    const paddedIndex = i.toString().padStart(2, "0");
    const outputPath = resolve(framesDir, `frame-${paddedIndex}.png`);

    // Find surrounding key poses for description
    const prevKeyIndex = Math.max(...keyPoseIndices.filter((k) => k < i));
    const nextKeyIndex = Math.min(...keyPoseIndices.filter((k) => k > i));
    const prevPoseIdx = keyPoseIndices.indexOf(prevKeyIndex);
    const nextPoseIdx = keyPoseIndices.indexOf(nextKeyIndex);

    const prompt = `${args.character}, transitioning between ${poses[prevPoseIdx]} and ${poses[nextPoseIdx]}, game sprite, centered, transparent background, 2D art style`;

    // Use all key poses as references for consistency
    const refs = [...args.referenceImages, ...keyPosePaths];

    await generateFrame(prompt, refs, outputPath, config.frameWidth);
  }
}

// ============================================================================
// Montage Assembly
// ============================================================================

async function assembleSpritesheetRow(
  framesDir: string,
  outputPath: string,
  config: GridConfig
): Promise<void> {
  console.log("\n🔧 Assembling spritesheet...\n");

  // Build frame list for single row
  const frameFiles: string[] = [];
  for (let i = 0; i < config.columns; i++) {
    const paddedIndex = i.toString().padStart(2, "0");
    frameFiles.push(resolve(framesDir, `frame-${paddedIndex}.png`));
  }

  // Verify all frames exist
  for (const f of frameFiles) {
    if (!(await exists(f))) {
      throw new Error(`Missing frame: ${f}`);
    }
  }

  const montageCmd = [
    "montage",
    ...frameFiles,
    "-tile", `${config.columns}x1`,
    "-geometry", `${config.frameWidth}x${config.frameHeight}+0+0`,
    "-background", "none",
    outputPath,
  ];

  const proc = spawn({
    cmd: montageCmd,
    stdout: "inherit",
    stderr: "inherit",
  });

  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    throw new Error("Montage assembly failed");
  }

  console.log(`✅ Spritesheet saved: ${outputPath}`);
}

// ============================================================================
// CSS Generation
// ============================================================================

function generateCSS(
  characterName: string,
  animation: AnimationType,
  config: GridConfig,
  spritesheetFilename: string
): string {
  const frames = config.columns; // Single row
  const colStep = 100 / (config.columns - 1);
  const frameStep = 100 / frames;

  let keyframes = "";
  for (let i = 0; i < frames; i++) {
    const timePercent = (i * frameStep).toFixed(3);
    const posX = (i * colStep).toFixed(3);
    keyframes += `  ${timePercent}% { background-position: ${posX}% 0%; }\n`;
  }

  // Calculate duration for single row (not full sheet)
  const rowDuration = config.duration / config.rows;

  return `/* Generated CSS for ${characterName}-${animation} spritesheet */
/* Spec: ${config.columns} frames, ${config.frameWidth}x${config.frameHeight}px each */

.sprite-${characterName} {
  width: ${config.frameWidth}px;
  height: ${config.frameHeight}px;
  background-image: url('${spritesheetFilename}');
  background-size: ${config.columns * 100}% 100%;
  animation: ${characterName}-${animation} ${rowDuration}s steps(1) infinite;
}

@keyframes ${characterName}-${animation} {
${keyframes}}
`;
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
  try {
    const args = parseArgs(process.argv);
    const config = GRID_CONFIGS[args.type];

    console.log(`
╔════════════════════════════════════════════════════════════════╗
║  CreateSpritesheet - ${args.type} ${args.animation}
║  Grid: ${config.columns}x1 (single row), ${config.frameWidth}x${config.frameHeight}px frames
╚════════════════════════════════════════════════════════════════╝
`);

    // Setup frames directory
    const outputDir = dirname(args.output);
    const outputName = basename(args.output, ".png");
    const framesDir = args.framesDir || resolve(outputDir, `${outputName}-frames`);
    await mkdir(framesDir, { recursive: true });

    console.log(`📁 Frames directory: ${framesDir}`);

    // Step 1: Generate key poses
    const keyPosePaths = await generateKeyPoses(args, config, framesDir);

    if (args.keyPosesOnly) {
      console.log("\n✅ Key poses generated. Review before continuing with full generation.");
      console.log(`   Frames: ${framesDir}`);
      return;
    }

    // Step 2: Generate tween frames
    await generateTweenFrames(args, config, framesDir, keyPosePaths);

    // Step 3: Assemble spritesheet
    await assembleSpritesheetRow(framesDir, args.output, config);

    // Step 4: Generate CSS if requested
    if (args.css) {
      const characterName = args.character.split(" ")[0].toLowerCase().replace(/[^a-z]/g, "");
      const cssContent = generateCSS(
        characterName,
        args.animation,
        config,
        basename(args.output)
      );
      const cssPath = args.output.replace(/\.png$/, ".css");
      await writeFile(cssPath, cssContent);
      console.log(`✅ CSS saved: ${cssPath}`);
    }

    console.log("\n✅ Spritesheet generation complete!");
    console.log(`   Spritesheet: ${args.output}`);
    if (args.css) {
      console.log(`   CSS: ${args.output.replace(/\.png$/, ".css")}`);
    }
    console.log(`   Frames: ${framesDir}`);

  } catch (error) {
    console.error(`\n❌ Error: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}

main();
