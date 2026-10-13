"""Generates the RoadGP 2x2 (Feasibility vs Impact) matrix and MoSCoW board.
Run: py scripts/generate_feature_matrices.py
"""
import os
import textwrap
import matplotlib.pyplot as plt
from matplotlib.lines import Line2D
from matplotlib.patches import FancyBboxPatch, Rectangle

LBL = {"M": "Must Have", "S": "Should Have", "C": "Could Have", "W": "Won't Have"}

plt.rcParams["font.family"] = "sans-serif"
plt.rcParams["font.sans-serif"] = ["Segoe UI", "DejaVu Sans", "Arial"]

OUT = os.path.join(os.path.dirname(__file__), "..", "images", "RoadGP")
os.makedirs(OUT, exist_ok=True)

BG, PANEL, CARD, LINE = "#111116", "#16161E", "#1C1C26", "#2A2A38"
TXT, MUTED = "#F4F4F8", "#9A9AAE"
MOSCOW = {
    "M": ("MUST HAVE", "#1DCD9F"),
    "S": ("SHOULD HAVE", "#38BDF8"),
    "C": ("COULD HAVE", "#A78BFA"),
    "W": ("WON'T HAVE (NOW)", "#F43F5E"),
}

# name, description, category, impact, feasibility, moscow, status, plot (x, y), label placement
F = [
    ("Human in the loop",
     "Interface for verifying low-confidence road defect data from computer vision.",
     "Visualisation and UX", 0.8, 1.0, "M", "Completed", (1.02, 0.80), "right"),
    ("Repair history view",
     "Transparent visualisation of repair history for a road section.",
     "Visualisation and UX", 0.7, 1.0, "M", "In progress", (1.02, 0.70), "right"),
    ("Jobs and invoices",
     "Integrate visualisation with job and invoicing systems to clarify repair tasks and support completion checks.",
     "Visualisation and UX", 1.0, 0.4, "W", "No NH costing/invoicing data", (0.40, 0.97), "above"),
    ("Costs & treatment advice",
     "Integrate RoadGP with costing systems to support cost-effective repair planning.",
     "RoadGP Specific", 1.0, 0.2, "W", "No access to data or APIs", (0.20, 1.00), "above"),
    ("Failed repairs input",
     "Collect information about failed repairs through the interface to improve future decision-making.",
     "RoadGP Specific", 1.0, 0.6, "M", "Lack of data; feeds treatment advice", (0.60, 1.00), "above"),
    ("Issue data input UI",
     "Clear, structured issue data-input interfaces to improve RoadGP recommendations and decision support.",
     "RoadGP Specific", 0.8, 0.9, "M", "Required to start collecting data", (0.86, 0.80), "left"),
    ("Team review & standardisation",
     "Enable users to request team opinions on decisions, standardising decision-making across teams.",
     "Visualisation and UX", 0.4, 0.7, "C", "If time is available", (0.70, 0.40), "right"),
    ("Clustering automation",
     "Automate defect clustering to create assessment segments for RoadGP treatment advice.",
     "RoadGP Specific", 1.0, 0.9, "M", "Completed", (0.88, 1.00), "above"),
    ("Clusters, labels & segments",
     "Connect RoadGP clusters at 15 m, NH network-model segments at 100 m and repair job areas at 10 km.",
     "RoadGP Specific", 0.6, 0.9, "M", "In progress", (0.90, 0.60), "right"),
    ("Governance & security",
     "Integration protocols and secure cloud architecture for NH systems.",
     "Security and Governance", 1.0, 1.0, "S", "Due", (1.03, 1.03), "right"),
]


# ----------------------------------------------------------------------------
# 1. 2x2 MATRIX
# ----------------------------------------------------------------------------
def matrix():
    fig, ax = plt.subplots(figsize=(16, 10), facecolor=BG)
    ax.set_facecolor(PANEL)
    ax.set_xlim(0.05, 1.40)
    ax.set_ylim(0.25, 1.17)
    xs, ys = 0.50, 0.55  # quadrant dividers

    ax.axvline(xs, color=LINE, ls="--", lw=1.4)
    ax.axhline(ys, color=LINE, ls="--", lw=1.4)
    ax.add_patch(Rectangle((xs, ys), 2, 2, color="#1DCD9F", alpha=0.05, lw=0))

    quad = [
        (0.07, 1.145, "STRATEGIC BETS", "High impact · Low feasibility", "#38BDF8", "left", "top"),
        (1.38, 1.145, "QUICK WINS · CORE MVP", "High impact · High feasibility", "#1DCD9F", "right", "top"),
        (0.07, 0.27, "DEPRIORITISE", "Low impact · Low feasibility", "#6B6B80", "left", "bottom"),
        (1.38, 0.27, "FILL-INS", "Low impact · High feasibility", "#A78BFA", "right", "bottom"),
    ]
    for x, y, t, s, c, ha, va in quad:
        ax.text(x, y, t, color=c, fontsize=15, fontweight="bold", ha=ha, va=va)
        dy = -0.03 if va == "top" else 0.03
        ax.text(x, y + dy, s, color=c, fontsize=11, ha=ha, va=va, alpha=0.8)

    for name, _, cat, imp, feas, m, status, (px, py), place in F:
        col = MOSCOW[m][1]
        ax.scatter(px, py, s=330, color=col, edgecolor="white", linewidth=1.6, zorder=5)
        if place == "right":
            off, ha, va = (16, 0), "left", "center"
        elif place == "left":
            off, ha, va = (-16, 0), "right", "center"
        else:
            off, ha, va = (0, 18), "center", "bottom"
        ax.annotate(f"{m}  {name}", (px, py), xytext=off, textcoords="offset points",
                    ha=ha, va=va, fontsize=11.5, color=TXT, fontweight="bold", zorder=6,
                    bbox=dict(boxstyle="round,pad=0.4", fc=BG, ec=col, lw=1.6))

    ax.set_xticks([0.2, 0.4, 0.6, 0.8, 1.0])
    ax.set_yticks([0.4, 0.6, 0.8, 1.0])
    ax.tick_params(colors=MUTED, labelsize=11)
    for s in ax.spines.values():
        s.set_color(LINE)
    ax.set_xlabel("FEASIBILITY  (ease of implementation / data availability)  →",
                  color=MUTED, fontsize=13, fontweight="bold", labelpad=12)
    ax.set_ylabel("IMPACT  (value to users and maintenance decisions)  →",
                  color=MUTED, fontsize=13, fontweight="bold", labelpad=12)

    fig.text(0.07, 0.955, "RoadGP: 2×2 Prioritisation Matrix", color=TXT, fontsize=24, fontweight="bold")
    fig.text(0.07, 0.918, "Feasibility vs impact for 10 candidate features. Positions nudged slightly to avoid overlap.",
             color=MUTED, fontsize=13)
    # legend
    x = 0.56
    for k in "MSCW":
        c = MOSCOW[k][1]
        fig.add_artist(Line2D([x], [0.935], marker="o", ms=11, color=c, mec="white",
                              transform=fig.transFigure))
        fig.text(x + 0.012, 0.935, f"{k} · {LBL[k]}", color=TXT, fontsize=11.5, va="center")
        x += 0.105
    fig.subplots_adjust(left=0.07, right=0.98, top=0.88, bottom=0.09)
    fig.savefig(os.path.join(OUT, "matrix_2x2_features.png"), dpi=200, facecolor=BG)
    plt.close(fig)


# ----------------------------------------------------------------------------
# 2. MoSCoW BOARD
# ----------------------------------------------------------------------------
NOTES = {
    "S": "Protocols must be agreed before cloud deployment, so this is the first fast-follow after the MVP.",
    "C": "Peer review stays in existing manual meetings until formal workflow tooling is prioritised.",
    "W": "NH costing and invoicing systems are not accessible, so both are deferred to a later horizon.",
}


def board():
    W, H = 200, 154
    fig = plt.figure(figsize=(20, 15.4), facecolor=BG)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, W)
    ax.set_ylim(0, H)
    ax.axis("off")

    ax.text(5, H - 8, "RoadGP: MoSCoW Prioritisation Board", color=TXT, fontsize=30, fontweight="bold", va="center")
    ax.text(5, H - 15, "What goes into the MVP, what follows, and what is blocked by external data access",
            color=MUTED, fontsize=16, va="center")

    colw, gap, x0 = 46, 2.6, 5
    top = H - 24
    cardh, cgap = 15, 1.5
    for i, k in enumerate("MSCW"):
        title, col = MOSCOW[k]
        items = [f for f in F if f[5] == k]
        if k == "M":  # order: completed / in progress first
            items.sort(key=lambda f: {"Completed": 0, "In progress": 1}.get(f[6], 2))
        x = x0 + i * (colw + gap)
        ax.add_patch(FancyBboxPatch((x, top - 12), colw, 12, boxstyle="round,pad=0,rounding_size=1.5",
                                    fc=CARD, ec=col, lw=2.5))
        ax.text(x + 2.5, top - 4.2, title, color=col, fontsize=18, fontweight="bold", va="center")
        ax.text(x + 2.5, top - 8.8, f"{len(items)} feature{'s' if len(items) != 1 else ''}",
                color=MUTED, fontsize=12, va="center")
        y = top - 12 - cgap
        for name, desc, cat, imp, feas, m, status, *_ in items:
            y -= cardh
            ax.add_patch(FancyBboxPatch((x, y), colw, cardh, boxstyle="round,pad=0,rounding_size=1.2",
                                        fc=CARD, ec=LINE, lw=1.2))
            ax.add_patch(Rectangle((x, y + 1.2), 0.9, cardh - 2.4, color=col, lw=0))
            ax.text(x + 2.5, y + cardh - 3, name, color=TXT, fontsize=14, fontweight="bold", va="center")
            ax.text(x + colw - 2, y + cardh - 3, f"I {imp:.1f} · F {feas:.1f}", color=col,
                    fontsize=11, ha="right", va="center", fontweight="bold")
            ax.text(x + 2.5, y + cardh - 6.2, f"{cat}  ·  {status}", color=MUTED, fontsize=10.5, va="center")
            d = textwrap.fill(desc, 56)
            lines = d.split("\n")[:2]
            for j, ln in enumerate(lines):
                ax.text(x + 2.5, y + cardh - 9.6 - j * 2.8, ln, color="#C9C9D6", fontsize=10.5, va="center")
            y -= cgap
        if k in NOTES:
            nh = 18
            y -= nh
            ax.add_patch(FancyBboxPatch((x, y), colw, nh, boxstyle="round,pad=0,rounding_size=1.2",
                                        fc="none", ec=col, lw=1.4, ls=":"))
            ax.text(x + 2.5, y + nh - 3.5, "WHY", color=col, fontsize=11, fontweight="bold", va="center")
            for j, ln in enumerate(textwrap.fill(NOTES[k], 58).split("\n")[:4]):
                ax.text(x + 2.5, y + nh - 7 - j * 3, ln, color="#C9C9D6", fontsize=11, va="center")

    # footer
    fy = 4
    ax.add_patch(FancyBboxPatch((x0, fy), W - 2 * x0, 10, boxstyle="round,pad=0,rounding_size=1.5",
                                fc=CARD, ec=LINE, lw=1.2))
    ax.text(x0 + 3, fy + 5, "MVP SCOPE", color=TXT, fontsize=14, fontweight="bold", va="center")
    for i, k in enumerate("MSCW"):
        n = sum(1 for f in F if f[5] == k)
        ax.add_patch(plt.Circle((x0 + 50 + i * 36, fy + 5), 0.9, color=MOSCOW[k][1]))
        ax.text(x0 + 52.5 + i * 36, fy + 5, f"{LBL[k]}: {n} ({n*10}%)",
                color=TXT, fontsize=13, va="center")
    fig.savefig(os.path.join(OUT, "moscow_roadmap.png"), dpi=150, facecolor=BG)
    plt.close(fig)


if __name__ == "__main__":
    matrix()
    board()
    print("Saved to", os.path.abspath(OUT))
