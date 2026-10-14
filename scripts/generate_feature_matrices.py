"""RoadGP Sub-Page 6 diagrams, generated from Features_MVP_Calculation.xlsx.

Outputs (images/RoadGP/SUB-PAGE6_OST/):
  ost_2x2_impact_feasibility.png  numbered 2x2, dot colour = MoSCoW, grouped legend
  ost_moscow_board.png            2x2 MoSCoW board with numbered cards

Run:  py scripts/generate_feature_matrices.py
"""
import os
import openpyxl
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, Rectangle

plt.rcParams["font.family"] = "sans-serif"
plt.rcParams["font.sans-serif"] = ["Segoe UI", "DejaVu Sans", "Arial"]

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
DIR = os.path.join(ROOT, "images", "RoadGP", "SUB-PAGE6_OST")
XLSX = os.path.join(DIR, "Features_MVP_Calculation.xlsx")

BG, PANEL, CARD, LINE = "#111116", "#16161E", "#1C1C26", "#2A2A38"
TXT, MUTED, SOFT = "#F4F4F8", "#9A9AAE", "#C9C9D6"
MCOL = {"M": "#1DCD9F", "S": "#38BDF8", "C": "#FBBF24", "W": "#94A3B8"}
MNAME = {"M": "MUST HAVE", "S": "SHOULD HAVE", "C": "COULD HAVE", "W": "WON'T HAVE (THIS TIME)"}
GROUPS = ["Maintenance planning and prioritisation", "Visualisation and UX",
          "RoadGP Specific", "Security and Governance"]

# Small nudges (feasibility, impact) so numbered dots never overlap. Key = row order in the sheet.
NUDGE = {2: (0.03, -0.03), 10: (-0.03, 0.03), 13: (-0.01, -0.01), 15: (0.0, 0.0)}


def load():
    ws = openpyxl.load_workbook(XLSX, data_only=True)["Features_checked"]
    out = []
    for i, r in enumerate(ws.iter_rows(min_row=2, values_only=True), start=1):
        if not r[0]:
            continue
        dx, dy = NUDGE.get(i, (0, 0))
        out.append(dict(n=i, name=r[0], group=r[2], imp=float(r[3]), feas=float(r[4]),
                        m=str(r[5]).strip().upper()[0], px=float(r[4]) + dx, py=float(r[3]) + dy))
    return out


F = load()


def save(fig, name):
    path = os.path.join(DIR, name)
    fig.savefig(path, dpi=160, facecolor=BG)
    plt.close(fig)
    print("saved", path)


# ------------------------------------------------------------------ 2x2
def matrix():
    fig = plt.figure(figsize=(20, 11), facecolor=BG)
    ax = fig.add_axes([0.05, 0.09, 0.58, 0.80])
    ax.set_xlim(0.1, 1.1)
    ax.set_ylim(0.1, 1.1)
    ax.set_facecolor(PANEL)
    sx = sy = 0.65
    tints = [(0.1, sy, sx - 0.1, 1.1 - sy, "#38BDF8"), (sx, sy, 1.1 - sx, 1.1 - sy, "#1DCD9F"),
             (0.1, 0.1, sx - 0.1, sy - 0.1, "#F43F5E"), (sx, 0.1, 1.1 - sx, sy - 0.1, "#FBBF24")]
    for x, y, w, h, c in tints:
        ax.add_patch(Rectangle((x, y), w, h, color=c, alpha=0.08, lw=0))
    ax.axvline(sx, color="#5B5B75", lw=1.8)
    ax.axhline(sy, color="#5B5B75", lw=1.8)

    labels = [(0.12, 1.085, "BIG BETS", "high impact, harder to build", "#38BDF8", "left", "top"),
              (1.08, 1.085, "QUICK WINS", "high impact, easy to build", "#1DCD9F", "right", "top"),
              (0.12, 0.115, "MONEY PITS", "lower impact, hard to build", "#F43F5E", "left", "bottom"),
              (1.08, 0.115, "FILL-INS", "lower impact, easy to build", "#FBBF24", "right", "bottom")]
    for x, y, t, s, c, ha, va in labels:
        ty, sy_ = (y, y - 0.045) if va == "top" else (y + 0.045, y)
        ax.text(x, ty, t, color=c, fontsize=18, fontweight="bold", ha=ha, va=va)
        ax.text(x, sy_, s, color=c, fontsize=13, fontweight="bold", ha=ha, va=va, alpha=0.95)
    for f in F:
        c = MCOL[f["m"]]
        ax.scatter(f["px"], f["py"], s=960, color=c, edgecolor="white", linewidth=2.0, zorder=5)
        ax.text(f["px"], f["py"], str(f["n"]), color=BG, fontsize=13.5, fontweight="bold",
                ha="center", va="center", zorder=6)
    ax.set_xticks([0.2, 0.4, 0.6, 0.8, 1.0])
    ax.set_yticks([0.2, 0.4, 0.6, 0.8, 1.0])
    ax.tick_params(colors="#CBD5E1", labelsize=13)
    for s in ax.spines.values():
        s.set_color(LINE)
    ax.set_xlabel("Feasibility  (low effort  →  high feasibility)", color="#E2E8F0", fontsize=15.5,
                  fontweight="bold", labelpad=14)
    ax.set_ylabel("Impact", color="#E2E8F0", fontsize=15.5, fontweight="bold", labelpad=14)

    fig.text(0.05, 0.945, "RoadGP: Impact vs Feasibility 2×2", color="#FFFFFF", fontsize=29, fontweight="bold")
    fig.text(0.05, 0.91, "15 candidate features. Dot colour = MoSCoW decision. Positions nudged slightly to avoid overlap.",
             color="#CBD5E1", fontsize=14.5, fontweight="bold")

    lg = fig.add_axes([0.66, 0.09, 0.33, 0.80])
    lg.set_xlim(0, 100)
    lg.set_ylim(0, 100)
    lg.axis("off")
    y = 98
    group_colors = {
        "Maintenance planning and prioritisation": "#38BDF8",
        "Visualisation and UX": "#A78BFA",
        "RoadGP Specific": "#1DCD9F",
        "Security and Governance": "#FBBF24"
    }
    for g in GROUPS:
        gc = group_colors.get(g, "#CBD5E1")
        lg.text(0, y, g.upper(), color=gc, fontsize=12.5, fontweight="bold", va="center")
        y -= 3.6
        for f in [f for f in F if f["group"] == g]:
            lg.scatter(2.2, y, s=360, color=MCOL[f["m"]], edgecolor="white", linewidth=1.2, zorder=3)
            lg.text(2.2, y, str(f["n"]), color=BG, fontsize=10, fontweight="bold", ha="center", va="center", zorder=4)
            lg.text(6, y, f["name"], color="#FFFFFF", fontsize=13.5, fontweight="bold", va="center")
            y -= 3.5
        y -= 1.8
    x = 0
    for k, n in zip("MSCW", ["Must", "Should", "Could", "Won't"]):
        lg.scatter(x + 1.5, 3, s=280, color=MCOL[k], edgecolor="white", linewidth=1.1, zorder=3)
        lg.text(x + 4.5, 3, f"{k} = {n}", color="#FFFFFF", fontsize=13, fontweight="bold", va="center")
        x += 25
    save(fig, "ost_2x2_impact_feasibility.png")


# ------------------------------------------------------------------ MoSCoW board
def board():
    W = 200
    row_h, gap = 11.2, 2.0
    top_n = max(sum(1 for f in F if f["m"] == "M"), sum(1 for f in F if f["m"] == "S"))
    bot_n = max(sum(1 for f in F if f["m"] == "C"), sum(1 for f in F if f["m"] == "W"))
    head = 13
    top_h = head + top_n * (row_h + gap) + 4
    bot_h = head + bot_n * (row_h + gap) + 4
    title_h = 16
    H = title_h + top_h + 4 + bot_h + 5
    fig = plt.figure(figsize=(20, 20 * H / W), facecolor=BG)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, W)
    ax.set_ylim(0, H)
    ax.axis("off")
    ax.text(4, H - 6.0, "RoadGP: MoSCoW Prioritisation", color="#FFFFFF", fontsize=31, fontweight="bold", va="center")
    ax.text(4, H - 12.0, "Numbers match the 2×2. Sorted by impact, then feasibility.", color="#CBD5E1", fontsize=15.5, fontweight="bold", va="center")

    colw = (W - 8 - 3) / 2
    cells = {"M": (4, 0), "S": (4 + colw + 3, 0), "C": (4, 1), "W": (4 + colw + 3, 1)}
    for k, (x, rowi) in cells.items():
        h = top_h if rowi == 0 else bot_h
        ytop = H - title_h - (0 if rowi == 0 else top_h + 4)
        items = sorted([f for f in F if f["m"] == k], key=lambda f: (-f["imp"], -f["feas"]))
        c = MCOL[k]
        ax.add_patch(FancyBboxPatch((x, ytop - h), colw, h, boxstyle="round,pad=0,rounding_size=2.2",
                                    fc=PANEL, ec=LINE, lw=1.5))
        ax.add_patch(FancyBboxPatch((x, ytop - head), colw, head, boxstyle="round,pad=0,rounding_size=2.2",
                                    fc=c, ec="none", alpha=0.98))
        ax.text(x + 3.5, ytop - head / 2, f"{MNAME[k]}  ({len(items)})", color="#081418" if k in "MS" else ("#181204" if k == "C" else "#0F172A"),
                fontsize=18, fontweight="bold", va="center")
        y = ytop - head - 2.0
        for f in items:
            y -= row_h
            ax.add_patch(FancyBboxPatch((x + 2.5, y), colw - 5, row_h, boxstyle="round,pad=0,rounding_size=1.4",
                                        fc=CARD, ec=c, lw=1.5))
            ax.scatter(x + 7.0, y + row_h / 2, s=840, color=c, zorder=3)
            ax.text(x + 7.0, y + row_h / 2, str(f["n"]), color="#071E18" if k in "MS" else ("#1E1602" if k == "C" else "#0F172A"),
                    fontsize=13, fontweight="bold", ha="center", va="center", zorder=4)
            ax.text(x + 12.2, y + row_h * 0.67, f["name"], color="#FFFFFF", fontsize=15.5, fontweight="bold", va="center")
            ax.text(x + 12.2, y + row_h * 0.28,
                    f"Impact: {f['imp']:.1f}   •   Feasibility: {f['feas']:.1f}   •   {f['group']}",
                    color="#CBD5E1", fontsize=12.2, fontweight="semibold", va="center")
            y -= gap
    save(fig, "ost_moscow_board.png")


if __name__ == "__main__":
    matrix()
    board()
