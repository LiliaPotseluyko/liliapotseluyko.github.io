#!/usr/bin/env python3
"""
================================================================================
UX MOOD BOARD GENERATOR
================================================================================
Features:
  1. Justified Sequence Layout (DEFAULT for timelines/progressions):
     - ZERO cropping: 100% native aspect ratio preserved for every image.
     - Preserves high resolution (~700-850px per screenshot).
     - Strictly preserves chronological / iteration sequence (01 to N).
     - Optimal row balancing (Knuth-Plass dynamic programming).
     - Optional iteration badges (#01 · Jun 2025) on each frame.
  2. Mondrian / BSP Grid Layout:
     - Recursively partitions a single 16:9 canvas into cohesive tiles.

Quick Run:
    py data_prep/generate_moodboard.py
================================================================================
"""

import os
import re
import sys
import random
import argparse
from datetime import datetime
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw, ImageFont

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass


# ==============================================================================
# 🎨 USER-EDITABLE CONFIGURATION VARIABLES
# ==============================================================================

# 1. LAYOUT MODE
# Options: 'justified' (zero cropping, preserved resolution & sequence)
#      or  'bsp'       (fixed 16:9 canvas with randomized mosaic frames)
DEFAULT_LAYOUT = 'justified'

# 2. CANVAS & ROW DIMENSIONS (For Justified mode)
CANVAS_WIDTH = 4600                # Total canvas width in pixels
TARGET_ROW_HEIGHT = 750            # Approximate height per row (preserves resolution)
GAP_WIDTH = 18                     # Gap / divider line between images (in pixels)
OUTER_MARGIN = 24                  # Canvas outer margin (in pixels)
BACKGROUND_COLOR = (15, 18, 24)    # Canvas / gap background RGB (Dark slate)

# 3. SEQUENCE BADGES
# Options: 'both' (e.g. "#01 · Jun 2025"), 'number' ("#01"), 'none' (no text overlay)
DEFAULT_BADGES = 'both'

# 4. BSP / MONDRIAN MODE DEFAULTS (When --layout bsp is selected)
CANVAS_ASPECT_RATIO = 16 / 9
MIN_CELL_ASPECT_RATIO = 0.50
MAX_CELL_ASPECT_RATIO = 2.20
MIN_CELL_WIDTH = 180
MIN_CELL_HEIGHT = 160

# 5. DEFAULT DIRECTORIES
DEFAULT_INPUT_DIR = "moodboard_input"
DEFAULT_OUTPUT_PATH = "images/artefacts/moodboard.png"

# Script and Project directories
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
    
    cwd_path = Path.cwd() / path_obj
    if cwd_path.exists() and not prefer_output_dir:
        return cwd_path.resolve()
        
    root_path = PROJECT_ROOT / path_obj
    if root_path.exists() and not prefer_output_dir:
        return root_path.resolve()
        
    script_path = SCRIPT_DIR / path_obj
    if script_path.exists() and not prefer_output_dir:
        return script_path.resolve()

    return (PROJECT_ROOT / path_obj).resolve()


def find_images(folder_path: Path):
    """Recursively finds all valid image files in the target directory in sorted order."""
    valid_exts = {'.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tiff'}
    images = []
    for f in folder_path.iterdir():
        if f.is_file() and f.suffix.lower() in valid_exts:
            images.append(f)
    return sorted(images, key=lambda x: x.name.lower())


def parse_date_from_filename(filename: str):
    """Attempts to extract a date from filenames like 'Screenshot 2025-06-02 180110.png'."""
    m = re.search(r'(\d{4})[-_](\d{2})[-_](\d{2})', filename)
    if m:
        try:
            dt = datetime(int(m.group(1)), int(m.group(2)), int(m.group(3)))
            return dt.strftime('%b %Y')
        except Exception:
            pass
    return None


def get_font(size: int = 24):
    """Loads clean system font for badges."""
    font_names = ['segoeuib.ttf', 'arialbd.ttf', 'HelveticaBold.ttf', 'calibrib.ttf']
    for fn in font_names:
        try:
            return ImageFont.truetype(fn, size)
        except Exception:
            continue
    return ImageFont.load_default()


def draw_iteration_badge(image: Image.Image, number_str: str, date_str: str = None, mode: str = 'both'):
    """Draws a modern, semi-transparent designer sequence badge on top-left of image."""
    if mode == 'none':
        return image

    text = number_str
    if mode == 'both' and date_str:
        text = f"{number_str} · {date_str}"

    font = get_font(size=26)
    draw = ImageDraw.Draw(image, "RGBA")

    # Measure text bounds
    bbox = font.getbbox(text)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]

    pad_x = 16
    pad_y = 10
    badge_w = text_w + 2 * pad_x
    badge_h = text_h + 2 * pad_y

    x0 = 16
    y0 = 16
    x1 = x0 + badge_w
    y1 = y0 + badge_h

    # Draw rounded pill badge with semi-transparency
    draw.rounded_rectangle([x0, y0, x1, y1], radius=10, fill=(10, 14, 22, 220), outline=(255, 255, 255, 55), width=1)
    # Draw text
    draw.text((x0 + pad_x, y0 + pad_y - 2), text, font=font, fill=(245, 248, 252, 255))
    return image


# ==============================================================================
# JUSTIFIED SEQUENCE LAYOUT (0% Cropping, High Resolution, Sequential Order)
# ==============================================================================

def create_justified_moodboard(
    image_files: list,
    out_file: Path,
    canvas_width: int = CANVAS_WIDTH,
    target_row_height: int = TARGET_ROW_HEIGHT,
    gap: int = GAP_WIDTH,
    margin: int = OUTER_MARGIN,
    bg_color: tuple = BACKGROUND_COLOR,
    badge_mode: str = DEFAULT_BADGES
):
    """
    Lays out images in strict chronological / numbered order across justified rows.
    Zero cropping is applied, and high resolution is preserved.
    """
    n = len(image_files)
    print(f"[INFO] Running Justified Timeline Layout for {n} images...")
    print(f"[INFO] Mode: ZERO cropping | Sequential Order (1..{n}) | Target row height: {target_row_height}px")

    # Read image sizes & aspect ratios
    images_meta = []
    for f in image_files:
        with Image.open(f) as im:
            w, h = im.size
            images_meta.append({
                'path': f,
                'orig_w': w,
                'orig_h': h,
                'ar': w / max(1, h)
            })

    available_w = canvas_width - (2 * margin)

    # Dynamic Programming to find mathematically optimal row partitions
    def get_row_cost(i, j, is_last):
        count = j - i + 1
        sum_ar = sum(images_meta[k]['ar'] for k in range(i, j + 1))
        gaps_total = (count - 1) * gap
        avail = available_w - gaps_total
        h = avail / max(0.001, sum_ar)
        if is_last:
            if h > target_row_height * 1.35:
                return (h - target_row_height) ** 2 * 2.5
            return abs(h - target_row_height) * 15
        return (h - target_row_height) ** 2

    dp = [float('inf')] * (n + 1)
    parent = [-1] * (n + 1)
    dp[0] = 0

    max_per_row = 8
    min_per_row = 1

    for j in range(1, n + 1):
        for i in range(max(0, j - max_per_row), j - min_per_row + 1):
            is_last = (j == n)
            cost = dp[i] + get_row_cost(i, j - 1, is_last)
            if cost < dp[j]:
                dp[j] = cost
                parent[j] = i

    # Reconstruct optimal rows
    curr = n
    row_spans = []
    while curr > 0:
        prev = parent[curr]
        row_spans.append((prev, curr - 1))
        curr = prev
    row_spans.reverse()

    # Compute row heights and exact image placements
    row_plans = []
    total_canvas_height = margin * 2 + (len(row_spans) - 1) * gap

    for r_idx, (start_idx, end_idx) in enumerate(row_spans):
        count = end_idx - start_idx + 1
        items = images_meta[start_idx : end_idx + 1]
        sum_ar = sum(it['ar'] for it in items)
        gaps_total = (count - 1) * gap

        # Row height to fill width exactly
        is_last_row = (r_idx == len(row_spans) - 1)
        h_row = int(round((available_w - gaps_total) / sum_ar))
        
        # If last row has very few images, cap height to target_row_height
        if is_last_row and count <= 2 and h_row > target_row_height * 1.2:
            h_row = target_row_height

        row_plans.append({
            'items': items,
            'start_idx': start_idx,
            'height': h_row,
            'count': count
        })
        total_canvas_height += h_row

    print(f"[INFO] Partitioned into {len(row_plans)} balanced rows. Canvas: {canvas_width}x{total_canvas_height} px.")

    # Create master canvas
    canvas = Image.new("RGB", (canvas_width, total_canvas_height), bg_color)

    # Render each row
    current_y = margin

    for r_idx, rplan in enumerate(row_plans):
        h_row = rplan['height']
        items = rplan['items']
        start_num = rplan['start_idx'] + 1

        # Calculate widths
        widths = [int(round(h_row * it['ar'])) for it in items]
        
        # Adjust rounding drift so row width matches available_w exactly
        diff = available_w - (sum(widths) + (len(items) - 1) * gap)
        if diff != 0 and len(widths) > 0 and not (r_idx == len(row_plans) - 1 and len(items) <= 2):
            widths[-1] += diff

        current_x = margin
        for idx_in_row, (it, w_img) in enumerate(zip(items, widths)):
            img_path = it['path']
            global_idx = start_num + idx_in_row
            num_str = f"#{global_idx:02d}"
            date_str = parse_date_from_filename(img_path.name)

            try:
                with Image.open(img_path) as img:
                    img = img.convert("RGBA")
                    # High quality resize (NO CROPPING)
                    resized = img.resize((w_img, h_row), Image.Resampling.LANCZOS)
                    # Add subtle sequence badge
                    badged = draw_iteration_badge(resized, num_str, date_str, mode=badge_mode)
                    # Paste onto canvas
                    canvas.paste(badged, (current_x, current_y), badged)
            except Exception as e:
                print(f"[WARN] Error placing {img_path.name}: {e}")

            current_x += w_img + gap

        current_y += h_row + gap

    out_file.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(str(out_file), format="PNG", quality=95, optimize=True)

    print(f"\n[SUCCESS] Redone mood board exported with ZERO cropping & sequence badges:")
    print(f"👉 {out_file} ({canvas_width}x{total_canvas_height})")
    return out_file


# ==============================================================================
# BSP RECURSIVE MOSAIC LAYOUT (Single Fixed Ratio Canvas)
# ==============================================================================

class Rect:
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


def split_rect(rect: Rect, gap: int, min_w: int, min_h: int, min_ar: float, max_ar: float):
    can_split_v = (rect.w - gap) >= (2 * min_w)
    can_split_h = (rect.h - gap) >= (2 * min_h)
    if not can_split_v and not can_split_h:
        return None

    ar = rect.aspect_ratio
    if ar > max_ar * 0.85 and can_split_v:
        orientations = [True, False] if can_split_h else [True]
    elif ar < min_ar * 1.15 and can_split_h:
        orientations = [False, True] if can_split_v else [False]
    else:
        first_is_v = (rect.w >= rect.h)
        orientations = [first_is_v, not first_is_v]

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
                        return (Rect(rect.x, rect.y, w1, rect.h), Rect(rect.x + w1 + gap, rect.y, w2, rect.h))
        elif not split_v and can_split_h:
            avail_h = rect.h - gap
            for r in ratios:
                h1 = int(round(avail_h * r))
                h2 = avail_h - h1
                if h1 >= min_h and h2 >= min_h:
                    ar1 = rect.w / h1
                    ar2 = rect.w / h2
                    if min_ar <= ar1 <= max_ar and min_ar <= ar2 <= max_ar:
                        return (Rect(rect.x, rect.y, rect.w, h1), Rect(rect.x, rect.y + h1 + gap, rect.w, h2))
    return None


def create_bsp_moodboard(
    image_files: list,
    out_file: Path,
    canvas_width: int,
    canvas_aspect_ratio: float,
    gap: int,
    margin: int,
    bg_color: tuple,
    seed: int = None
):
    if seed is not None:
        random.seed(seed)

    target_frames = max(4, len(image_files))
    canvas_height = int(round(canvas_width / canvas_aspect_ratio))
    root = Rect(margin, margin, canvas_width - 2 * margin, canvas_height - 2 * margin)
    rects = [root]
    attempts = 0

    while len(rects) < target_frames and attempts < 400:
        attempts += 1
        splittable = [r for r in rects if (r.w - gap >= 2 * MIN_CELL_WIDTH) or (r.h - gap >= 2 * MIN_CELL_HEIGHT)]
        if not splittable:
            break
        splittable.sort(key=lambda r: r.area, reverse=True)
        chosen = random.choice(splittable[:min(len(splittable), 3)])
        res = split_rect(chosen, gap, MIN_CELL_WIDTH, MIN_CELL_HEIGHT, MIN_CELL_ASPECT_RATIO, MAX_CELL_ASPECT_RATIO)
        if res:
            rects.remove(chosen)
            rects.extend(res)

    canvas = Image.new("RGB", (canvas_width, canvas_height), bg_color)
    shuffled = list(image_files)
    random.shuffle(shuffled)
    while len(shuffled) < len(rects):
        shuffled.extend(image_files)

    for frame, img_path in zip(rects, shuffled[:len(rects)]):
        try:
            with Image.open(img_path) as img:
                img = img.convert("RGB")
                cropped = ImageOps.fit(img, (frame.w, frame.h), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))
                canvas.paste(cropped, (frame.x, frame.y))
        except Exception as e:
            print(f"[WARN] Error in {img_path.name}: {e}")

    out_file.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(str(out_file), format="PNG", quality=95, optimize=True)
    print(f"\n[SUCCESS] BSP Mood board saved to: {out_file}")
    return out_file


# ==============================================================================
# MAIN ROUTING
# ==============================================================================

def parse_color(color_str: str) -> tuple:
    clean = color_str.strip().lstrip('#')
    if len(clean) == 6:
        return tuple(int(clean[i:i+2], 16) for i in (0, 2, 4))
    presets = {
        'white': (255, 255, 255),
        'black': (0, 0, 0),
        'dark': (15, 18, 24),
        'light': (245, 245, 245),
        'gray': (40, 40, 40)
    }
    return presets.get(clean.lower(), BACKGROUND_COLOR)


def main():
    parser = argparse.ArgumentParser(
        description="Generate high-resolution UX Mood Boards with zero-crop progression or random mosaic."
    )
    parser.add_argument("--input", "-i", default=DEFAULT_INPUT_DIR, help="Source images directory")
    parser.add_argument("--output", "-o", default=DEFAULT_OUTPUT_PATH, help="Output PNG path")
    parser.add_argument("--layout", "-l", choices=['justified', 'bsp'], default=DEFAULT_LAYOUT,
                        help="Layout mode: 'justified' (zero cropping, preserved progression) or 'bsp' (random mosaic)")
    parser.add_argument("--width", "-w", type=int, default=CANVAS_WIDTH, help="Canvas width in pixels")
    parser.add_argument("--row-height", "-rh", type=int, default=TARGET_ROW_HEIGHT, help="Target row height (justified mode)")
    parser.add_argument("--badges", "-b", choices=['both', 'number', 'none'], default=DEFAULT_BADGES,
                        help="Sequence badge overlay: 'both' (#01 · Jun 2025), 'number' (#01), or 'none'")
    parser.add_argument("--gap", "-g", type=int, default=GAP_WIDTH, help="Divider gap in pixels")
    parser.add_argument("--margin", "-m", type=int, default=OUTER_MARGIN, help="Outer canvas margin in pixels")
    parser.add_argument("--bg-color", "-bg", default="0f1218", help="Canvas background color in hex or name")
    parser.add_argument("--aspect-ratio", "-ar", type=float, default=CANVAS_ASPECT_RATIO, help="Canvas aspect ratio for BSP mode")
    parser.add_argument("--seed", "-s", type=int, default=None, help="Random seed for BSP mode")

    args = parser.parse_args()

    input_path = resolve_path(args.input)
    out_file = resolve_path(args.output, prefer_output_dir=True)

    if not input_path.exists():
        raise FileNotFoundError(f"Input directory not found: {input_path}")

    images = find_images(input_path)
    if not images:
        raise ValueError(f"No image files found in {input_path}")

    bg_tuple = parse_color(args.bg_color)

    if args.layout == 'justified':
        create_justified_moodboard(
            image_files=images,
            out_file=out_file,
            canvas_width=args.width,
            target_row_height=args.row_height,
            gap=args.gap,
            margin=args.margin,
            bg_color=bg_tuple,
            badge_mode=args.badges
        )
    else:
        create_bsp_moodboard(
            image_files=images,
            out_file=out_file,
            canvas_width=args.width,
            canvas_aspect_ratio=args.aspect_ratio,
            gap=args.gap,
            margin=args.margin,
            bg_color=bg_tuple,
            seed=args.seed
        )


if __name__ == "__main__":
    main()
