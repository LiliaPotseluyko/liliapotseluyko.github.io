# Specialist AI Agents for Portfolio Engineering

This directory defines the system prompts, operational guidelines, and rubrics for the 5 specialist agent personas configured for Dr Lilia Potseluyko's portfolio.

These agents can be invoked directly in Antigravity or used with LLM workflows on Google Cloud:

| Agent File | Role | Mission |
| :--- | :--- | :--- |
| [`agent_recruiter.md`](agent_recruiter.md) | **Career Alignment & Recruiter** | Evaluates copy and case studies against hiring rubrics for Product Owner, PM, Service Designer, and FDE roles. |
| [`agent_information_architect.md`](agent_information_architect.md) | **Information Architect & Writer** | Structures case studies (Problem, Process, Architecture, Demos, Outcomes) and crafts punchy copy. |
| [`agent_asset_curator.md`](agent_asset_curator.md) | **Digital Asset & Media Curator** | Crawls, indexes, quality-checks, and selects the best images, videos, and figures for each page. |
| [`agent_ui_designer.md`](agent_ui_designer.md) | **UI & Interaction Designer** | Manages dark-mode ergonomics (`#000`, `#1DCD9F`, `#e9008c`), responsive layouts, and interactive components. |
| [`agent_rag_manager.md`](agent_rag_manager.md) | **RAG & Knowledge Base Manager** | Curates `knowledge_base.md`, ingests multiple CVs, and optimizes retrieval for Google Cloud Vertex AI Search. |
