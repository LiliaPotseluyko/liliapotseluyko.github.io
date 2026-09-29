# Portfolio Updates Ingestion Hub

Welcome to your portfolio's dynamic update staging area!

Whenever you have a new project, new sketchbook scans, screenshots, demo videos, or academic achievements, you don't need to manually code HTML or write CSS. 

### How to Add a New Change in 3 Steps:

1. **Drop Your Media:**
   - Put your new images, photos, or screenshots into the `images/` directory.

2. **Fill Out a Quick Template:**
   - For a new project or case study update: Copy [`project_template.md`](project_template.md) and fill in your raw thoughts, bullet points, and links.
   - For a new publication, talk, or workshop: Copy [`academic_template.md`](academic_template.md).

3. **Tell Your Agent Team:**
   - In your chat, simply say:
     > *"Hey, I added a new update in `updates/my-new-project.md`. Run the multi-agent pipeline!"*

---

### What the Agents Will Automatically Do:

```mermaid
flowchart TD
    User["You drop media & notes"] --> Pipeline["Multi-Agent Ingestion Pipeline"]
    Pipeline --> AssetCurator["1. Asset Curator\n(Indexes images, verifies resolution & video embeds)"]
    AssetCurator --> IA["2. Information Architect\n(Drafts 6-section case study HTML)"]
    IA --> Recruiter["3. Recruiter\n(Sharpens impact metrics & aligns target roles)"]
    Recruiter --> UI["4. UI Designer\n(Adds card to projects.html & index.html)"]
    UI --> RAG["5. RAG Manager\n(Grounds knowledge_base.md & AI Assistant)"]
    RAG --> Live["Ready to preview & deploy to GitHub Pages!"]
```
