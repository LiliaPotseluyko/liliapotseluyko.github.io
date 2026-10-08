#!/usr/bin/env python3
"""
================================================================================
UX MOOD BOARD GENERATOR
================================================================================
Features:
  1. Hero Center Layout (--hero "filename"):
     - Central master sketch kept 100% UN増CROPPED at large focal scale.
     - Surrounding sketches dynamically zoomed into busy/inked detail areas.
     - Chronological sequence wrapped around the center with iteration badges.
  2. Justified Sequence Layout (--layout justified, DEFAULT):
     - ZERO cropping: 100% native aspect ratio preserved for every image.
     - Preserves high resolution (~750px per screenshot).
     - Strictly preserves chronological sequence (01 to N).
     - Optimal row balancing (Knuth-Plass dynamic programming).
  3. Mondrian / BSP Grid Layout (--layout bsp):
     - Recursively subdivides canvas into random mosaic frames.

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
import numpy as np
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

DEFAULT_LAYOUT = 'justified'

CANVAS_WIDTH = 4600                # Total canvas width in pixels
TARGET_ROW_HEIGHT = 750            # Approximate height per row (preserves resolution)
GAP_WIDTH = 18                     # Gap / divider line between images (in pixels)
OUTER_MARGIN = 24                  # Canvas outer margin (in pixels)
BACKGROUND_COLOR = (15, 18, 24)    # Canvas / gap background RGB (Dark slate)

DEFAULT_BADGES = 'both'            # 'both', 'number', or 'none'

CANVAS_ASPECT_RATIO = 16 / 9
MIN_CELL_ASPECT_RATIO = 0.40
MAX_CELL_ASPECT_RATIO = 2.80
MIN_CELL_WIDTH = 120
MIN_CELL_HEIGHT = 100

DEFAULT_INPUT_DIR = "moodboard_input"
DEFAULT_OUTPUT_PATH = "images/artefacts/moodboard.png"

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
# ==============================================================================


def resolve_path(p: str, prefer_output_dir: bool = False) -> Path:
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


def find_images(folder_paths):
    """Recursively finds all valid image files in one or more target directories."""
    if isinstance(folder_paths, (str, Path)):
        folder_paths = [folder_paths]
    
    valid_exts = {'.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tiff'}
    images = []
    seen = set()

    for p in folder_paths:
        p_obj = Path(p).resolve()
        if p_obj.exists() and p_obj.is_dir():
            for f in p_obj.iterdir():
                if f.is_file() and f.suffix.lower() in valid_exts and f.resolve() not in seen:
                    seen.add(f.resolve())
                    images.append(f)
        else:
            print(f"[WARN] Input path not found or not a directory: {p_obj}")

    return sorted(images, key=lambda x: x.name.lower())


def parse_date_from_filename(filename: str):
    m = re.search(r'(\d{4})[-_](\d{2})[-_](\d{2})', filename)
    if m:
        try:
            dt = datetime(int(m.group(1)), int(m.group(2)), int(m.group(3)))
            return dt.strftime('%b %Y')
        except Exception:
            pass
    return None


def get_font(size: int = 24):
    font_names = ['segoeuib.ttf', 'arialbd.ttf', 'HelveticaBold.ttf', 'calibrib.ttf']
    for fn in font_names:
        try:
            return ImageFont.truetype(fn, size)
        except Exception:
            continue
    return ImageFont.load_default()


def draw_iteration_badge(image: Image.Image, number_str: str, date_str: str = None, mode: str = 'both', is_hero: bool = False):
    if mode == 'none':
        return image

    text = number_str
    if mode == 'both' and date_str:
        text = f"{number_str} · {date_str}"

    font = get_font(size=28 if is_hero else 25)
    draw = ImageDraw.Draw(image, "RGBA")

    bbox = font.getbbox(text)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]

    pad_x = 18 if is_hero else 16
    pad_y = 11 if is_hero else 9
    badge_w = text_w + 2 * pad_x
    badge_h = text_h + 2 * pad_y

    x0 = 18
    y0 = 18
    x1 = x0 + badge_w
    y1 = y0 + badge_h

    # Highlight hero badge in subtle cyan/gold border
    border_color = (56, 189, 248, 160) if is_hero else (255, 255, 255, 55)
    bg_fill = (10, 20, 32, 230) if is_hero else (10, 14, 22, 220)

    draw.rounded_rectangle([x0, y0, x1, y1], radius=10, fill=bg_fill, outline=border_color, width=2 if is_hero else 1)
    draw.text((x0 + pad_x, y0 + pad_y - 2), text, font=font, fill=(245, 248, 252, 255))
    return image


def get_busy_crop(im: Image.Image, target_w: int, target_h: int, zoom: float = 1.25) -> Image.Image:
    """
    Computes saliency / edge-energy gradient to detect detailed sketch ink,
    zooming into the busy content and stripping away empty margins/desks.
    """
    try:
        gray = np.array(im.convert('L'), dtype=float)
        gy, gx = np.gradient(gray)
        energy = np.hypot(gx, gy)

        proj_x = energy.sum(axis=0)
        proj_y = energy.sum(axis=1)

        total_x = proj_x.sum()
        total_y = proj_y.sum()
        if total_x == 0 or total_y == 0:
            return ImageOps.fit(im, (target_w, target_h), Image.Resampling.LANCZOS)

        cum_x = np.cumsum(proj_x) / total_x
        cum_y = np.cumsum(proj_y) / total_y

        # Concentrate on middle 84% of ink energy
        x_min = int(np.searchsorted(cum_x, 0.08))
        x_max = int(np.searchsorted(cum_x, 0.92))
        y_min = int(np.searchsorted(cum_y, 0.08))
        y_max = int(np.searchsorted(cum_y, 0.92))

        cx = (x_min + x_max) / 2
        cy = (y_min + y_max) / 2

        orig_w, orig_h = im.size
        target_ar = target_w / target_h

        # Zoom in on sketch
        crop_w = orig_w / max(1.0, zoom)
        crop_h = orig_h / max(1.0, zoom)

        if (crop_w / crop_h) > target_ar:
            crop_w = crop_h * target_ar
        else:
            crop_h = crop_w / target_ar

        left = max(0, min(orig_w - crop_w, cx - crop_w / 2))
        top = max(0, min(orig_h - crop_h, cy - crop_h / 2))
        right = min(orig_w, left + crop_w)
        bottom = min(orig_h, top + crop_h)

        cropped = im.crop((int(round(left)), int(round(top)), int(round(right)), int(round(bottom))))
        return cropped.resize((target_w, target_h), Image.Resampling.LANCZOS)
    except Exception:
        return ImageOps.fit(im, (target_w, target_h), Image.Resampling.LANCZOS)


# ==============================================================================
# HERO CENTER LAYOUT (Centerpiece Uncropped, Surrounding Zoomed In)
# ==============================================================================

def create_hero_center_moodboard(
    image_files: list,
    out_file: Path,
    hero_query: str,
    canvas_width: int = CANVAS_WIDTH,
    gap: int = GAP_WIDTH,
    margin: int = OUTER_MARGIN,
    bg_color: tuple = BACKGROUND_COLOR,
    badge_mode: str = DEFAULT_BADGES,
    zoom: float = 1.25
):
    """
    Renders a hero centerpiece moodboard where:
      - The designated hero sketch is positioned in the exact CENTER, 100% UN増CROPPED.
      - The surrounding sketches are arranged around it chronologically, zoomed into
        their busy ink/sketch areas.
    """
    # 1. Match hero file
    clean_q = Path(hero_query).name.lower()
    hero_match = None
    for f in image_files:
        if clean_q in f.name.lower():
            hero_match = f
            break
    if not hero_match:
        # Fallback to file that contains '214135' or largest image
        for f in image_files:
            if '214135' in f.name:
                hero_match = f
                break
    if not hero_match:
        hero_match = image_files[len(image_files) // 2]

    other_images = [f for f in image_files if f != hero_match]
    other_images.sort(key=lambda x: x.name.lower())

    print(f"[INFO] Hero Spotlight: {hero_match.name} (Centered & 100% Uncropped)")
    print(f"[INFO] Surrounding Sketches: {len(other_images)} items (Zoom factor: {zoom}x into busy areas)")

    # 2. Hero dimensions
    with Image.open(hero_match) as h_im:
        h_w, h_h = h_im.size
        hero_ar = h_w / h_h

    avail_w = canvas_width - (2 * margin)

    # 3. Geometry & Row Allocations
    # Distribute surrounding images: Top (5), Left (2), Right (2), Bottom (4) = 13
    n_other = len(other_images)
    top_count = min(5, max(1, n_other // 3))
    bottom_count = min(4, max(1, (n_other - top_count) // 2))
    left_count = 2
    right_count = max(1, n_other - top_count - bottom_count - left_count)

    top_images = other_images[:top_count]
    left_images = other_images[top_count : top_count + left_count]
    right_images = other_images[top_count + left_count : top_count + left_count + right_count]
    bottom_images = other_images[top_count + left_count + right_count :]

    h_mid = 1400
    h_top = 680
    h_bottom = 680

    w_hero = int(round(h_mid * hero_ar))
    avail_flank_w = avail_w - w_hero - (2 * gap)
    w_left = avail_flank_w // 2
    w_right = avail_flank_w - w_left

    total_canvas_height = margin * 2 + h_top + gap + h_mid + gap + h_bottom

    print(f"[INFO] Canvas size: {canvas_width}x{total_canvas_height} px")
    print(f"[INFO] Hero box: {w_hero}x{h_mid} px (Uncropped)")

    canvas = Image.new("RGB", (canvas_width, total_canvas_height), bg_color)

    # Helper to calculate width partition
    def get_row_widths(count, row_avail_w):
        base_w = (row_avail_w - (count - 1) * gap) // count
        rem = (row_avail_w - (count - 1) * gap) % count
        widths = [base_w] * count
        widths[-1] += rem
        return widths

    # Global numbering sequence
    curr_number = 1

    # RENDER TOP ROW
    top_widths = get_row_widths(len(top_images), avail_w)
    tx = margin
    ty = margin
    for idx, (img_path, w_cell) in enumerate(zip(top_images, top_widths)):
        num_str = f"#{curr_number:02d}"
        date_str = parse_date_from_filename(img_path.name)
        curr_number += 1
        with Image.open(img_path) as im:
            cropped = get_busy_crop(im.convert("RGBA"), w_cell, h_top, zoom=zoom)
            badged = draw_iteration_badge(cropped, num_str, date_str, mode=badge_mode)
            canvas.paste(badged, (tx, ty), badged)
        tx += w_cell + gap

    # RENDER LEFT FLANK (Stacked)
    h_left_cell = (h_mid - (len(left_images) - 1) * gap) // len(left_images)
    lx = margin
    ly = margin + h_top + gap
    for img_path in left_images:
        num_str = f"#{curr_number:02d}"
        date_str = parse_date_from_filename(img_path.name)
        curr_number += 1
        with Image.open(img_path) as im:
            cropped = get_busy_crop(im.convert("RGBA"), w_left, h_left_cell, zoom=zoom)
            badged = draw_iteration_badge(cropped, num_str, date_str, mode=badge_mode)
            canvas.paste(badged, (lx, ly), badged)
        ly += h_left_cell + gap

    # RENDER CENTER HERO (100% UN増CROPPED)
    cx = margin + w_left + gap
    cy = margin + h_top + gap
    hero_num_str = f"#{curr_number:02d} · MASTER WIREFRAME"
    hero_date_str = parse_date_from_filename(hero_match.name)
    curr_number += 1
    with Image.open(hero_match) as h_im:
        h_im = h_im.convert("RGBA")
        resized_hero = h_im.resize((w_hero, h_mid), Image.Resampling.LANCZOS)
        badged_hero = draw_iteration_badge(resized_hero, hero_num_str, hero_date_str, mode=badge_mode, is_hero=True)
        canvas.paste(badged_hero, (cx, cy), badged_hero)

    # RENDER RIGHT FLANK (Stacked)
    h_right_cell = (h_mid - (len(right_images) - 1) * gap) // len(right_images)
    rx = cx + w_hero + gap
    ry = margin + h_top + gap
    for img_path in right_images:
        num_str = f"#{curr_number:02d}"
        date_str = parse_date_from_filename(img_path.name)
        curr_number += 1
        with Image.open(img_path) as im:
            cropped = get_busy_crop(im.convert("RGBA"), w_right, h_right_cell, zoom=zoom)
            badged = draw_iteration_badge(cropped, num_str, date_str, mode=badge_mode)
            canvas.paste(badged, (rx, ry), badged)
        ry += h_right_cell + gap

    # RENDER BOTTOM ROW
    bottom_widths = get_row_widths(len(bottom_images), avail_w)
    bx = margin
    by = margin + h_top + gap + h_mid + gap
    for img_path, w_cell in zip(bottom_images, bottom_widths):
        num_str = f"#{curr_number:02d}"
        date_str = parse_date_from_filename(img_path.name)
        curr_number += 1
        with Image.open(img_path) as im:
            cropped = get_busy_crop(im.convert("RGBA"), w_cell, h_bottom, zoom=zoom)
            badged = draw_iteration_badge(cropped, num_str, date_str, mode=badge_mode)
            canvas.paste(badged, (bx, by), badged)
        bx += w_cell + gap

    out_file.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(str(out_file), format="PNG", quality=95, optimize=True)

    print(f"\n[SUCCESS] Hero-Centered Mood Board exported:")
    print(f"👉 {out_file} ({canvas_width}x{total_canvas_height})")
    return out_file


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
    n = len(image_files)
    print(f"[INFO] Running Justified Timeline Layout for {n} images...")
    print(f"[INFO] Mode: ZERO cropping | Sequential Order (1..{n}) | Target row height: {target_row_height}px")

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

    curr = n
    row_spans = []
    while curr > 0:
        prev = parent[curr]
        row_spans.append((prev, curr - 1))
        curr = prev
    row_spans.reverse()

    row_plans = []
    total_canvas_height = margin * 2 + (len(row_spans) - 1) * gap

    for r_idx, (start_idx, end_idx) in enumerate(row_spans):
        count = end_idx - start_idx + 1
        items = images_meta[start_idx : end_idx + 1]
        sum_ar = sum(it['ar'] for it in items)
        gaps_total = (count - 1) * gap

        is_last_row = (r_idx == len(row_spans) - 1)
        h_row = int(round((available_w - gaps_total) / sum_ar))
        
        if is_last_row and count <= 2 and h_row > target_row_height * 1.2:
            h_row = target_row_height

        row_plans.append({
            'items': items,
            'start_idx': start_idx,
            'height': h_row,
            'count': count
        })
        total_canvas_height += h_row

    canvas = Image.new("RGB", (canvas_width, total_canvas_height), bg_color)
    current_y = margin

    for r_idx, rplan in enumerate(row_plans):
        h_row = rplan['height']
        items = rplan['items']
        start_num = rplan['start_idx'] + 1

        widths = [int(round(h_row * it['ar'])) for it in items]
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
                    resized = img.resize((w_img, h_row), Image.Resampling.LANCZOS)
                    badged = draw_iteration_badge(resized, num_str, date_str, mode=badge_mode)
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
# BSP RECURSIVE MOSAIC LAYOUT
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
    uncropped: list = None,
    seed: int = None
):
    target_frames = max(4, len(image_files))
    canvas_height = int(round(canvas_width / canvas_aspect_ratio))
    
    # Process uncropped list
    uncropped_terms = []
    if uncropped:
        for u in uncropped:
            u_clean = Path(u).name.strip().lower()
            if u_clean:
                uncropped_terms.append(u_clean)

    # Gather image metadata
    images_meta = []
    for f in image_files:
        fn_lower = f.name.lower()
        is_unc = any(term in fn_lower for term in uncropped_terms) if uncropped_terms else False
        try:
            with Image.open(f) as im:
                w, h = im.size
                ar = w / max(1, h)
        except Exception:
            w, h, ar = 1000, 1000, 1.0
        images_meta.append({
            'file': f,
            'orig_w': w,
            'orig_h': h,
            'ar': ar,
            'uncropped': is_unc
        })

    uncropped_count = sum(1 for m in images_meta if m['uncropped'])
    print(f"[INFO] BSP Mosaic: {len(images_meta)} images ({uncropped_count} designated UN増CROPPED) on {canvas_width}x{canvas_height} px canvas...")
    if uncropped_count > 0:
        for m in images_meta:
            if m['uncropped']:
                print(f"   ⭐ Keep Uncropped: {m['file'].name} (AR: {m['ar']:.2f})")

    min_w = max(110, int(MIN_CELL_WIDTH * (30 / max(30, target_frames))))
    min_h = max(90, int(MIN_CELL_HEIGHT * (30 / max(30, target_frames))))

    def generate_partition(s):
        if s is not None:
            random.seed(s)
        root = Rect(margin, margin, canvas_width - 2 * margin, canvas_height - 2 * margin)
        rects = [root]
        attempts = 0
        max_attempts = max(800, target_frames * 25)
        while len(rects) < target_frames and attempts < max_attempts:
            attempts += 1
            splittable = [r for r in rects if (r.w - gap >= 2 * min_w) or (r.h - gap >= 2 * min_h)]
            if not splittable:
                break
            splittable.sort(key=lambda r: r.area, reverse=True)
            chosen = random.choice(splittable[:min(len(splittable), 5)])
            res = split_rect(chosen, gap, min_w, min_h, MIN_CELL_ASPECT_RATIO, MAX_CELL_ASPECT_RATIO)
            if res:
                rects.remove(chosen)
                rects.extend(res)
        return rects

    # Find optimal partition layout if seed not explicitly fixed
    best_rects = None
    best_cost = float('inf')

    try:
        from scipy.optimize import linear_sum_assignment
        has_scipy = True
    except ImportError:
        has_scipy = False

    candidate_seeds = [seed] if seed is not None else list(range(40))

    for s in candidate_seeds:
        candidate_rects = generate_partition(s)
        if len(candidate_rects) != len(images_meta):
            continue
        if not has_scipy:
            best_rects = candidate_rects
            break
        # Calculate assignment cost
        N = len(images_meta)
        cost_mat = np.zeros((N, N))
        for i, img in enumerate(images_meta):
            for j, r in enumerate(candidate_rects):
                diff = abs(img['ar'] - r.aspect_ratio)
                if img['uncropped']:
                    diff *= 15.0
                cost_mat[i, j] = diff
        row_ind, col_ind = linear_sum_assignment(cost_mat)
        total_cost = cost_mat[row_ind, col_ind].sum()
        if total_cost < best_cost:
            best_cost = total_cost
            best_rects = candidate_rects
            best_row = row_ind
            best_col = col_ind

    if best_rects is None:
        best_rects = generate_partition(seed or 0)

    # Perform assignment
    rects = best_rects
    print(f"[INFO] Partitioned into {len(rects)} cohesive frames. Matching images to frames...")

    assignments = []
    if has_scipy and len(rects) == len(images_meta):
        cost_mat = np.zeros((len(images_meta), len(rects)))
        for i, img in enumerate(images_meta):
            for j, r in enumerate(rects):
                diff = abs(img['ar'] - r.aspect_ratio)
                if img['uncropped']:
                    diff *= 15.0
                cost_mat[i, j] = diff
        row_ind, col_ind = linear_sum_assignment(cost_mat)
        for i, j in zip(row_ind, col_ind):
            assignments.append((images_meta[i], rects[j]))
    else:
        # Fallback 1-to-1 pairing
        for img, frame in zip(images_meta, rects):
            assignments.append((img, frame))

    canvas = Image.new("RGB", (canvas_width, canvas_height), bg_color)

    for img_info, frame in assignments:
        img_path = img_info['file']
        is_unc = img_info['uncropped']
        try:
            if is_unc:
                with Image.open(img_path) as img:
                    img = img.convert("RGBA")
                    contained = ImageOps.contain(img, (frame.w, frame.h), method=Image.Resampling.LANCZOS)
                    cw, ch = contained.size
                    px = frame.x + (frame.w - cw) // 2
                    py = frame.y + (frame.h - ch) // 2
                    canvas.paste(contained, (px, py), contained)
            else:
                with Image.open(img_path) as img:
                    img = img.convert("RGB")
                    cropped = ImageOps.fit(img, (frame.w, frame.h), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))
                    canvas.paste(cropped, (frame.x, frame.y))
        except Exception as e:
            print(f"[WARN] Error placing {img_path.name}: {e}")

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
        description="Generate high-resolution UX Mood Boards."
    )
    parser.add_argument("--input", "-i", nargs='+', default=[DEFAULT_INPUT_DIR], help="Source images directory or directories")
    parser.add_argument("--output", "-o", default=DEFAULT_OUTPUT_PATH, help="Output PNG path")
    parser.add_argument("--layout", "-l", choices=['justified', 'bsp'], default=DEFAULT_LAYOUT,
                        help="Layout mode: 'justified' or 'bsp'")
    parser.add_argument("--hero", help="Filename of image to place uncropped in the center (activates Hero Center layout)")
    parser.add_argument("--zoom", type=float, default=1.25, help="Zoom factor into busy areas of sketches (default: 1.25)")
    parser.add_argument("--width", "-w", type=int, default=CANVAS_WIDTH, help="Canvas width in pixels")
    parser.add_argument("--row-height", "-rh", type=int, default=TARGET_ROW_HEIGHT, help="Target row height (justified mode)")
    parser.add_argument("--badges", "-b", choices=['both', 'number', 'none'], default=DEFAULT_BADGES,
                        help="Sequence badge overlay: 'both', 'number', or 'none'")
    parser.add_argument("--gap", "-g", type=int, default=GAP_WIDTH, help="Divider gap in pixels")
    parser.add_argument("--margin", "-m", type=int, default=OUTER_MARGIN, help="Outer canvas margin in pixels")
    parser.add_argument("--bg-color", "-bg", default="0f1218", help="Canvas background color in hex or name")
    parser.add_argument("--aspect-ratio", "-ar", type=float, default=CANVAS_ASPECT_RATIO, help="Canvas aspect ratio for BSP mode")
    parser.add_argument("--seed", "-s", type=int, default=None, help="Random seed for BSP mode")
    parser.add_argument("--uncropped", "-u", nargs='*', default=[], help="Image filenames or keywords to preserve 100% uncropped")

    args = parser.parse_args()

    input_paths = [resolve_path(p) for p in args.input]
    out_file = resolve_path(args.output, prefer_output_dir=True)

    images = find_images(input_paths)
    if not images:
        raise ValueError(f"No image files found in {input_paths}")

    print(f"[INFO] Loaded {len(images)} total images from {len(input_paths)} source folder(s).")

    bg_tuple = parse_color(args.bg_color)

    if args.hero:
        create_hero_center_moodboard(
            image_files=images,
            out_file=out_file,
            hero_query=args.hero,
            canvas_width=args.width,
            gap=args.gap,
            margin=args.margin,
            bg_color=bg_tuple,
            badge_mode=args.badges,
            zoom=args.zoom
        )
    elif args.layout == 'bsp':
        create_bsp_moodboard(
            image_files=images,
            out_file=out_file,
            canvas_width=args.width,
            canvas_aspect_ratio=args.aspect_ratio,
            gap=args.gap,
            margin=args.margin,
            bg_color=bg_tuple,
            uncropped=args.uncropped,
            seed=args.seed
        )
    else:
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


if __name__ == "__main__":
    main()
