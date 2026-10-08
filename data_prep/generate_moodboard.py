#!/usr/bin/env python3
"""
================================================================================
UX MOOD BOARD GENERATOR (FIGMA / MONDRIAN STYLE)
================================================================================
Recursively partitions a canvas into aesthetic, cohesive rectangular frames 
(using recursive Binary Space Partitioning inspired by Figma mood board templates),
center-crops source images of any dimensions to seamlessly fill each frame without 
distortion, and outputs a single high-resolution PNG moodboard.

Default Input:  Folder with source images (e.g. 'moodboard_input' or any folder)
Default Output: 'images/artefacts/moodboard.png'

Quick Run:
    py data_prep/generate_moodboard.py
    
Custom Options:
    py data_prep/generate_moodboard.py --input "path/to/my_images" --output "images/artefacts/moodboard.png"
    py data_prep/generate_moodboard.py --aspect-ratio 1.777 --gap 14 --bg-color FFFFFF
================================================================================
"""

import os
import sys
import random
import argparse
from pathlib import Path
from PIL import Image, ImageOps

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass


# ==============================================================================
# 🎨 USER-EDITABLE CONFIGURATION VARIABLES
# You can tweak these values directly in this file or override them via CLI flags!
# ==============================================================================

# 1. CANVAS DIMENSIONS & ASPECT RATIO
# ------------------------------------------------------------------------------
# Change this ratio to change the overall shape of the mood board:
#   16 / 9  (= 1.778) -> Standard widescreen / presentation slide (Figma standard)
#   4  / 3  (= 1.333) -> Classic tablet / portfolio sheet
#   3  / 2  (= 1.500) -> Standard 35mm photo print ratio
#   1  / 1  (= 1.000) -> Square grid (Instagram / social)
#   21 / 9  (= 2.333) -> Ultra-wide panoramic showcase
CANVAS_ASPECT_RATIO = 16 / 9

# Width of the output image in pixels (High-DPI 2560px default)
CANVAS_WIDTH = 2560

# 2. FRAME SPACING & BORDER STYLING
# ------------------------------------------------------------------------------
GAP_WIDTH = 12                     # Gap / divider line between frames (e.g. 0, 8, 12, 16, 24 px)
OUTER_MARGIN = 12                  # Outer canvas margin (set 0 for edge-to-edge borderless)

# Background color for dividers & canvas borders:
# Options: (18, 18, 18) for Dark Slate, (0, 0, 0) for Pure Black, (255, 255, 255) for Pure White
BACKGROUND_COLOR = (18, 18, 18)

# 3. INDIVIDUAL CELL ASPECT RATIO CONSTRAINTS
# ------------------------------------------------------------------------------
# Keeps randomly generated frames cohesive and prevents awkward needle-thin shapes:
#   MIN_CELL_ASPECT_RATIO = 0.50 allows portrait cards (up to 1:2 height)
#   MAX_CELL_ASPECT_RATIO = 2.20 allows landscape banners (up to 2.2:1 width)
MIN_CELL_ASPECT_RATIO = 0.50
MAX_CELL_ASPECT_RATIO = 2.20

# Minimum pixel dimensions for any individual cell:
MIN_CELL_WIDTH = 180
MIN_CELL_HEIGHT = 160

# 4. DEFAULT DIRECTORIES (Can be relative to project root or absolute paths)
# ------------------------------------------------------------------------------
# In Visual Studio, you can change this to any folder name or full path:
# e.g., "moodboard_input", "images", or r"C:\Users\Admin\Pictures\MyImages"
DEFAULT_INPUT_DIR = "moodboard_input"
DEFAULT_OUTPUT_PATH = "images/artefacts/moodboard.png"

# Script and Project directories (automatically detects root regardless of where VS runs it from)
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
# ==============================================================================


def resolve_path(p: str, prefer_output_dir: bool = False) -> Path:
    """
    Intelligently resolves paths so running from Visual Studio, PyCharm,
    or different terminal directories always works seamlessly.
    """
    path_obj = Path(p)
    if path_obj.is_absolute():
        return path_obj
    
    # Check if path exists relative to current working directory
    cwd_path = Path.cwd() / path_obj
    if cwd_path.exists() and not prefer_output_dir:
        return cwd_path.resolve()
        
    # Check if path exists relative to project root
    root_path = PROJECT_ROOT / path_obj
    if root_path.exists() and not prefer_output_dir:
        return root_path.resolve()
        
    # Check if path exists relative to script directory
    script_path = SCRIPT_DIR / path_obj
    if script_path.exists() and not prefer_output_dir:
        return script_path.resolve()

    # For output files that don't exist yet, default to project root
    return (PROJECT_ROOT / path_obj).resolve()


class Rect:
    """Represents a rectangular frame on the canvas."""
    def __init__(self, x: int, y: int, w: int, h: int):
        self.x = int(x)
        self.y = int(y)
        self.w = int(w)
        self.h = int(h)

    @property
    def aspect_ratio(self) -> float:
        return self.w / max(1, self.h)

    @property
    def area(self) -> int:
        return self.w * self.h

    def __repr__(self):
        return f"Rect({self.x}, {self.y}, {self.w}x{self.h})"


def split_rect(rect: Rect, gap: int, min_w: int, min_h: int, min_ar: float, max_ar: float):
    """
    Subdivides a rectangle either vertically or horizontally using aesthetic modular
    ratios (halves, thirds, two-fifths) while adhering strictly to min/max aspect ratios.
    """
    can_split_v = (rect.w - gap) >= (2 * min_w)
    can_split_h = (rect.h - gap) >= (2 * min_h)

    if not can_split_v and not can_split_h:
        return None

    # Determine preferred orientation based on current cell proportions
    ar = rect.aspect_ratio
    if ar > max_ar * 0.85 and can_split_v:
        orientations = [True, False] if can_split_h else [True]
    elif ar < min_ar * 1.15 and can_split_h:
        orientations = [False, True] if can_split_v else [False]
    else:
        # Bias towards splitting the longer dimension
        first_is_v = (rect.w >= rect.h)
        orientations = [first_is_v, not first_is_v]

    # Modular split ratios inspired by Figma layout grids
    ratios = [0.333, 0.40, 0.50, 0.60, 0.667]
    random.shuffle(ratios)

    for split_v in orientations:
        if split_v and can_split_v:
            avail_w = rect.w - gap
            for r in ratios:
                w1 = int(round(avail_w * r))
                w2 = avail_w - w1
                if w1 >= min_w and w2 >= min_w:
                    ar1 = w1 / rect.h
                    ar2 = w2 / rect.h
                    if min_ar <= ar1 <= max_ar and min_ar <= ar2 <= max_ar:
                        return (
                            Rect(rect.x, rect.y, w1, rect.h),
                            Rect(rect.x + w1 + gap, rect.y, w2, rect.h)
                        )
        elif not split_v and can_split_h:
            avail_h = rect.h - gap
            for r in ratios:
                h1 = int(round(avail_h * r))
                h2 = avail_h - h1
                if h1 >= min_h and h2 >= min_h:
                    ar1 = rect.w / h1
                    ar2 = rect.w / h2
                    if min_ar <= ar1 <= max_ar and min_ar <= ar2 <= max_ar:
                        return (
                            Rect(rect.x, rect.y, rect.w, h1),
                            Rect(rect.x, rect.y + h1 + gap, rect.w, h2)
                        )

    return None


def generate_cohesive_frames(
    canvas_w: int,
    canvas_h: int,
    target_count: int,
    gap: int,
    margin: int,
    min_w: int = MIN_CELL_WIDTH,
    min_h: int = MIN_CELL_HEIGHT,
    min_ar: float = MIN_CELL_ASPECT_RATIO,
    max_ar: float = MAX_CELL_ASPECT_RATIO
):
    """
    Recursively partitions the canvas area into cohesive rectangular frames.
    """
    initial_w = canvas_w - (2 * margin)
    initial_h = canvas_h - (2 * margin)
    root = Rect(margin, margin, initial_w, initial_h)

    rects = [root]
    attempts = 0
    max_attempts = 400

    while len(rects) < target_count and attempts < max_attempts:
        attempts += 1
        
        # Filter rects that can still be split
        splittable = [
            r for r in rects 
            if (r.w - gap >= 2 * min_w) or (r.h - gap >= 2 * min_h)
        ]
        if not splittable:
            break

        # Sort by area descending so largest rectangles are prioritized for division
        splittable.sort(key=lambda r: r.area, reverse=True)
        # Select randomly from top 3 largest boxes for organic variety
        pick_pool = splittable[:min(len(splittable), 3)]
        chosen_rect = random.choice(pick_pool)

        res = split_rect(chosen_rect, gap, min_w, min_h, min_ar, max_ar)
        if res:
            rects.remove(chosen_rect)
            rects.extend(res)

    return rects


def find_images(folder_path: Path):
    """Recursively finds all valid image files in the target directory."""
    valid_exts = {'.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tiff'}
    images = []
    for f in folder_path.iterdir():
        if f.is_file() and f.suffix.lower() in valid_exts:
            images.append(f)
    return sorted(images)


def create_moodboard(
    input_dir: str,
    output_path: str,
    canvas_width: int = CANVAS_WIDTH,
    canvas_aspect_ratio: float = CANVAS_ASPECT_RATIO,
    gap: int = GAP_WIDTH,
    margin: int = OUTER_MARGIN,
    bg_color: tuple = BACKGROUND_COLOR,
    min_cell_ar: float = MIN_CELL_ASPECT_RATIO,
    max_cell_ar: float = MAX_CELL_ASPECT_RATIO,
    frame_count: int = None,
    seed: int = None
):
    """
    Orchestrates the entire mood board generation pipeline.
    """
    if seed is not None:
        random.seed(seed)

    input_path = resolve_path(input_dir)
    out_file = resolve_path(output_path, prefer_output_dir=True)

    if not input_path.exists():
        raise FileNotFoundError(f"Input directory not found: {input_path}")

    image_files = find_images(input_path)
    if not image_files:
        raise ValueError(f"No image files found in directory: {input_path}")

    print(f"[INFO] Found {len(image_files)} source images in: {input_path}")

    # Determine frame count (defaults to number of images found, or custom count)
    if frame_count is not None and frame_count > 0:
        target_frames = frame_count
    else:
        target_frames = max(4, len(image_files))

    # Calculate canvas height from width and aspect ratio
    canvas_height = int(round(canvas_width / canvas_aspect_ratio))

    print(f"[INFO] Canvas size: {canvas_width}x{canvas_height} px (Aspect Ratio: {canvas_aspect_ratio:.3f})")
    print(f"[INFO] Partitioning into {target_frames} cohesive frames (gap={gap}px, margin={margin}px)...")

    frames = generate_cohesive_frames(
        canvas_w=canvas_width,
        canvas_h=canvas_height,
        target_count=target_frames,
        gap=gap,
        margin=margin,
        min_w=MIN_CELL_WIDTH,
        min_h=MIN_CELL_HEIGHT,
        min_ar=min_cell_ar,
        max_ar=max_cell_ar
    )

    print(f"[INFO] Successfully created {len(frames)} frames. Center-cropping images...")

    # Create canvas
    canvas = Image.new("RGB", (canvas_width, canvas_height), bg_color)

    # Randomly assign images to frames (cycle if more frames than images)
    selected_images = list(image_files)
    random.shuffle(selected_images)
    while len(selected_images) < len(frames):
        selected_images.extend(image_files)
    selected_images = selected_images[:len(frames)]

    # Crop and paste each image
    for idx, (frame, img_path) in enumerate(zip(frames, selected_images)):
        try:
            with Image.open(img_path) as img:
                img = img.convert("RGB")
                # Center-crop to exact frame dimensions without distortion
                cropped_img = ImageOps.fit(
                    img,
                    (frame.w, frame.h),
                    method=Image.Resampling.LANCZOS,
                    centering=(0.5, 0.5)
                )
                canvas.paste(cropped_img, (frame.x, frame.y))
        except Exception as e:
            print(f"[WARN] Could not process {img_path.name}: {e}")

    # Ensure output destination directory exists
    out_file.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(str(out_file), format="PNG", quality=95, optimize=True)

    print(f"\n[SUCCESS] UX Mood Board generated successfully!")
    print(f"👉 Output saved to: {out_file} ({canvas_width}x{canvas_height})")
    return out_file


def parse_color(color_str: str) -> tuple:
    """Parses hex code (e.g. '000000', '#FFFFFF') or preset color name."""
    clean = color_str.strip().lstrip('#')
    if len(clean) == 6:
        return tuple(int(clean[i:i+2], 16) for i in (0, 2, 4))
    presets = {
        'white': (255, 255, 255),
        'black': (0, 0, 0),
        'dark': (18, 18, 18),
        'light': (245, 245, 245),
        'gray': (40, 40, 40)
    }
    return presets.get(clean.lower(), BACKGROUND_COLOR)


def main():
    parser = argparse.ArgumentParser(
        description="Generate a cohesive, borderless UX Mood Board from a folder of images."
    )
    parser.add_argument(
        "--input", "-i",
        default=DEFAULT_INPUT_DIR,
        help=f"Folder containing source images (default: {DEFAULT_INPUT_DIR})"
    )
    parser.add_argument(
        "--output", "-o",
        default=DEFAULT_OUTPUT_PATH,
        help=f"Output PNG path (default: {DEFAULT_OUTPUT_PATH})"
    )
    parser.add_argument(
        "--width", "-w",
        type=int,
        default=CANVAS_WIDTH,
        help=f"Canvas width in pixels (default: {CANVAS_WIDTH})"
    )
    parser.add_argument(
        "--aspect-ratio", "-ar",
        type=float,
        default=CANVAS_ASPECT_RATIO,
        help=f"Canvas aspect ratio (e.g. 1.778 for 16:9, 1.333 for 4:3, 1.0 for square; default: {CANVAS_ASPECT_RATIO:.3f})"
    )
    parser.add_argument(
        "--gap", "-g",
        type=int,
        default=GAP_WIDTH,
        help=f"Gap / divider width in pixels between frames (default: {GAP_WIDTH})"
    )
    parser.add_argument(
        "--margin", "-m",
        type=int,
        default=OUTER_MARGIN,
        help=f"Outer margin around the canvas (default: {OUTER_MARGIN})"
    )
    parser.add_argument(
        "--bg-color", "-bg",
        type=str,
        default="121212",
        help="Background / border color in hex or name (e.g. '000000', 'FFFFFF', '121212', 'white', 'black')"
    )
    parser.add_argument(
        "--min-cell-ar",
        type=float,
        default=MIN_CELL_ASPECT_RATIO,
        help=f"Minimum cell aspect ratio (default: {MIN_CELL_ASPECT_RATIO})"
    )
    parser.add_argument(
        "--max-cell-ar",
        type=float,
        default=MAX_CELL_ASPECT_RATIO,
        help=f"Maximum cell aspect ratio (default: {MAX_CELL_ASPECT_RATIO})"
    )
    parser.add_argument(
        "--frames", "-f",
        type=int,
        default=None,
        help="Number of frames to generate (default: matches number of source images)"
    )
    parser.add_argument(
        "--seed", "-s",
        type=int,
        default=None,
        help="Random seed for reproducible layout generation (default: None)"
    )

    args = parser.parse_args()
    bg_tuple = parse_color(args.bg_color)

    create_moodboard(
        input_dir=args.input,
        output_path=args.output,
        canvas_width=args.width,
        canvas_aspect_ratio=args.aspect_ratio,
        gap=args.gap,
        margin=args.margin,
        bg_color=bg_tuple,
        min_cell_ar=args.min_cell_ar,
        max_cell_ar=args.max_cell_ar,
        frame_count=args.frames,
        seed=args.seed
    )


if __name__ == "__main__":
    main()
