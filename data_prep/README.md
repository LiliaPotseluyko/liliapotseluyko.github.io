# UX Mood Board Generator (`data_prep/generate_moodboard.py`)

A standalone Python script inspired by Figma mood board templates and Mondrian mosaic layouts. It recursively partitions a canvas into cohesive rectangular frames of varying sizes, center-crops images without distortion, and exports a single high-resolution PNG mood board.

---

## 🚀 Quick Start

Run directly from the root of your project:

```powershell
py data_prep/generate_moodboard.py
```

By default, this:
1. Scans `moodboard_input/` for images (`.png`, `.jpg`, `.jpeg`, `.webp`, etc.).
2. Creates cohesive frames matching the image count.
3. Outputs the final mood board to `images/artefacts/moodboard.png` (2560×1440).

---

## ⚙️ Customizing the Output

You can control everything either via command-line arguments or by editing the variables at the top of [`data_prep/generate_moodboard.py`](file:///c:/Users/Admin/Documents/GitHub/liliapotseluyko.github.io/data_prep/generate_moodboard.py).

### 1. Pointing to Any Image Folder
```powershell
py data_prep/generate_moodboard.py --input "path/to/your/images" --output "images/artefacts/my_moodboard.png"
```

### 2. Changing the Canvas Aspect Ratio
- **16:9** (Widescreen presentation, default): `--aspect-ratio 1.778`
- **4:3** (Classic iPad / portfolio grid): `--aspect-ratio 1.333`
- **1:1** (Square): `--aspect-ratio 1.0`
- **21:9** (Ultra-wide panorama): `--aspect-ratio 2.333`

```powershell
py data_prep/generate_moodboard.py --aspect-ratio 1.333
```

### 3. Customizing Gap Width and Background Color
- Change gap width between frames (e.g. `0` for flush, `8`, `12`, `16`, `24` px):
  ```powershell
  py data_prep/generate_moodboard.py --gap 16
  ```
- Change background/divider color (`black`, `white`, `dark`, or any hex code):
  ```powershell
  py data_prep/generate_moodboard.py --bg-color white
  py data_prep/generate_moodboard.py --bg-color 000000
  ```

### 4. Setting a Specific Number of Frames
```powershell
py data_prep/generate_moodboard.py --frames 12
```

### 5. Reproducible Random Seed
If you like a particular layout and want to regenerate it with new images:
```powershell
py data_prep/generate_moodboard.py --seed 42
```

---

## 📝 Editable Variables in the Script

Open [`data_prep/generate_moodboard.py`](file:///c:/Users/Admin/Documents/GitHub/liliapotseluyko.github.io/data_prep/generate_moodboard.py) to edit these constants directly:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `CANVAS_WIDTH` | `2560` | Output width in pixels |
| `CANVAS_ASPECT_RATIO` | `16 / 9` | Overall board aspect ratio (`16/9`, `4/3`, `1/1`, etc.) |
| `GAP_WIDTH` | `12` | Spacing between frames in pixels |
| `OUTER_MARGIN` | `12` | Margin around the outer canvas |
| `BACKGROUND_COLOR` | `(18, 18, 18)` | Divider color: dark slate `(18, 18, 18)`, white `(255, 255, 255)`, black `(0, 0, 0)` |
| `MIN_CELL_ASPECT_RATIO` | `0.50` | Min width/height ratio (prevents overly narrow vertical strips) |
| `MAX_CELL_ASPECT_RATIO` | `2.20` | Max width/height ratio (prevents overly thin horizontal strips) |
