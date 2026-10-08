# UX Mood Board Generator (`data_prep/generate_moodboard.py`)

A standalone Python script to generate high-resolution UX Mood Boards.

Supports two distinct layout engines:
1. **Justified Timeline Layout (`--layout justified`, DEFAULT)**:
   - **Zero Cropping (0%)**: 100% of every screenshot's native aspect ratio is preserved.
   - **Preserves Native Resolution**: Rows are scaled to a generous target height (~750px) so UI text and diagrams remain sharp and readable.
   - **Chronological Sequence & Progression**: Images are ordered strictly in progression order (`#01` to `#N`).
   - **Sequence Badges**: Modern, sleek overlay pills showing iteration number and date (e.g. `#01 · Jun 2025`).
   - **Optimal Line-Breaking**: Knuth-Plass dynamic programming algorithm to guarantee balanced, edge-to-edge rows with uniform gaps.
2. **Mondrian / BSP Grid Layout (`--layout bsp`)**:
   - Recursively subdivides a single 16:9 canvas into random mosaic frames (center-cropped).

---

## 🚀 Quick Run

Run in your PowerShell terminal or Visual Studio:

```powershell
py data_prep/generate_moodboard.py --input "C:\Users\Admin\OneDrive\Desktop\portfolio\RoadGP\UI\selected" --output "images/RoadGP/SUB-PAPAGE5/UI iterations.png"
```

---

## ⚙️ Command-Line Options

| Option | Flag | Default | Description |
| :--- | :--- | :--- | :--- |
| **Input folder** | `-i` / `--input` | `moodboard_input` | Path to folder containing source images |
| **Output path** | `-o` / `--output` | `images/artefacts/moodboard.png` | Destination PNG image file |
| **Layout mode** | `-l` / `--layout` | `justified` | `justified` (zero cropping, sequential) or `bsp` (random mosaic) |
| **Sequence badges**| `-b` / `--badges` | `both` | `both` (`#01 · Jun 2025`), `number` (`#01`), or `none` (no text) |
| **Canvas width** | `-w` / `--width` | `4600` | Canvas width in pixels |
| **Row height** | `-rh` / `--row-height`| `750` | Approximate row height (higher = more resolution per image) |
| **Gap size** | `-g` / `--gap` | `18` | Divider gap between images in pixels |
| **Divider color** | `-bg` / `--bg-color` | `0f1218` | Background / divider color in hex or name |

---

## 📝 Examples

### 1. Sequential Progression with Zero Cropping & Date Badges (Recommended)
```powershell
py data_prep/generate_moodboard.py --input "path/to/UI/selected" --output "images/RoadGP/SUB-PAPAGE5/UI iterations.png"
```

### 2. Zero Cropping with Number-Only Badges (No Dates)
```powershell
py data_prep/generate_moodboard.py --badges number
```

### 3. Clean Zero-Crop Layout with NO Overlay Text
```powershell
py data_prep/generate_moodboard.py --badges none
```

### 4. Random 16:9 Mosaic Style (BSP)
```powershell
py data_prep/generate_moodboard.py --layout bsp --aspect-ratio 1.778
```
