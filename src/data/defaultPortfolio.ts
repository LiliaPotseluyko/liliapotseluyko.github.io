import { PortfolioData } from '../types';

export const defaultPortfolioData: PortfolioData = {
  developerName: "Dr Lilia Potseluyko",
  title: "Cambridge-based Researcher & Digital Engineer",
  bio: "I transform complex spatial data into intuitive digital experiences. I work at the intersection of spatial data, digital twins, computer graphics, AI and user experience. I turn complex technical information into practical, interactive tools that help people understand real-world systems, explore evidence and make better decisions.",
  location: "Cambridge, UK",
  yearsOfExperience: 8,
  contactEmail: "lilia.potseluyko@gmail.com",
  githubUrl: "https://github.com/liliapotseluyko",
  linkedinUrl: "https://linkedin.com/in/lilia-potseluyko",
  keyAchievements: [
    "Led technical discovery & innovation strategy for a UK research fellowship proposal with National Highways and iRAP.",
    "Automated schematic map interface generation for a 12 km Swedish tunnel (Trafikverket/Nicander) containing ~20,000 IoT assets using mathematical coordinate transformations.",
    "Designed the end-to-end UX/UI and information architecture for RoadGP — an AI-assisted decision-support platform for National Highways.",
    "Developed Unreal Engine VR & desktop interactive digital twins combining LiDAR point clouds, 360° imagery, GPR, and road asset computer vision segmentation (featured on BBC News).",
    "Designed and built an immersive cyclist safety simulation for Department for Transport (DfT) transport planning research, tested with 4,000+ UK participants.",
    "Reduced VR visualization prep time from ~80 hours to 4.5 hours during KTP with Norscot Joinery; finalist for Scottish Innovator of the Future Award 2020."
  ],
  skills: [
    {
      category: "Digital Twins & Spatial Data",
      skills: ["Digital Twins Architecture", "Unreal Engine (VR & Desktop)", "Point Cloud Processing (LiDAR)", "QGIS & GIS", "Trimble MX9", "Geospatial REST APIs", "WebVR", "BIM (Revit)"]
    },
    {
      category: "Computer Vision & AI Strategy",
      skills: ["3D Reconstruction", "Photogrammetry", "RealityCapture", "OpenCV & PyTorch", "AI-assisted Decision Support", "Low-Cost Sensor Reconstruction", "LLM & Agent Workflows"]
    },
    {
      category: "UX Research & Product Design",
      skills: ["Google UX Design Certificate", "Figma Design Systems", "Dovetail", "User Research Interviews", "Usability Testing", "Information Architecture", "Continuous Discovery / Opportunity Solution Trees"]
    },
    {
      category: "Software Development & Architecture",
      skills: ["React & TypeScript", "Python (Dash, REST APIs)", "Microservices Architecture", "Agile & DevOps", "Mathematical Coordinate Transformation", "C++ / Unreal C++"]
    },
    {
      category: "Research Leadership & Governance",
      skills: ["Grant Application Leadership", "Stakeholder Engagement (National Highways, DfT, iRAP)", "PhD Supervision", "Public Speaking & Keynotes (BBC News, DFBI Delft, CONVR Florence)", "Scientific Publications"]
    }
  ],
  projects: [
    {
      id: "p1",
      title: "RoadGP — AI-Assisted Decision Support Platform",
      role: "Lead UX Researcher & Product Designer",
      description: "An AI-assisted decision-support platform developed for National Highways that uses machine learning models, historical maintenance records, and national road standards to recommend defect diagnoses, repair treatments, costs, and intervention priorities.",
      techStack: ["Figma", "UX Research", "Python", "REST API", "Python Dash", "Dovetail", "React"],
      impactMetrics: [
        "Created end-to-end sequential decision-support workflow for road inspectors and engineers",
        "Developed reusable Figma design system and interactive Python Dash prototypes",
        "Facilitated stakeholder workshops with National Highways, Costain, and DfT"
      ],
      challengesSolved: "Organized and analyzed qualitative user interviews in Dovetail to create searchable personas and information architecture, then translated insights into paper and React prototypes to ensure transparent, user-centered decision-making.",
      codeSnippet: `# REST API route snippet for RoadGP defect diagnosis evaluation
@app.route('/api/roadgp/diagnose', methods=['POST'])
def evaluate_defect_diagnosis():
    data = request.json
    defect_id = data.get('defectId')
    historical_matches = ml_model.query_historical_maintenance(defect_id)
    treatment_recommendations = calculate_intervention_priority(historical_matches)
    return jsonify({
        'defectId': defect_id,
        'recommendations': treatment_recommendations,
        'transparencyScore': 0.96
    })`,
      githubUrl: "https://github.com/liliapotseluyko/RoadGP-Prototypes",
      featured: true
    },
    {
      id: "p2",
      title: "Trafikverket 12km Tunnel Schematic Mapping & Digital Twin (Nicander)",
      role: "Computational Design & Digital Twin Lead",
      description: "Developed a mathematical coordinate transformation algorithm to automate schematic map generation for a 12 km Swedish tunnel containing ~20,000 IoT assets. Built interactive digital twin prototypes in Unreal Engine to monitor tunnel equipment states and simulate operational scenarios.",
      techStack: ["Mathematical Transformations", "Python", "Unreal Engine", "GIS", "C++", "Agile / DevOps"],
      impactMetrics: [
        "Replaced slow, error-prone manual transfer of asset locations from maps to operational interfaces",
        "Trafikverket adopted the automated solution over an in-house alternative",
        "Helped secure commercial investment in Nicander's digital twin product line"
      ],
      challengesSolved: "Formulated dynamic coordinate transformation algorithms to convert 3D geospatial positions along 12km tunnel alignments into clean 2D schematic interface layouts.",
      githubUrl: "https://github.com/liliapotseluyko/Tunnel-Schematic-Transformation",
      featured: true
    },
    {
      id: "p3",
      title: "CAMHighways & Immersive Unreal Engine Digital Twin",
      role: "Computer Vision & Spatial Data Lead",
      description: "Processed multimodal data collected at traffic speed using Trimble MX9 scanners (LiDAR, 360° imagery, GPR). Developed hybrid 3D reconstruction workflows for road surfaces and traffic signs, integrating them into Unreal Engine for interactive VR and desktop exploration.",
      techStack: ["LiDAR", "Trimble MX9", "Unreal Engine", "VR", "QGIS", "Point Cloud Segmentation", "3D Reconstruction"],
      impactMetrics: [
        "Featured on BBC News (International Pothole Day 2023) and Naked Scientists podcast",
        "Demonstrated to National Highways and showcased at CONVR Florence & Highways UK",
        "Published CAMHighways dataset (2024) and review of multimodal road data"
      ],
      challengesSolved: "Connected Unreal Engine digital twin prototypes with geospatial databases through REST APIs, enabling dynamic location-based streaming of high-resolution 3D road tiles as the user navigates the virtual environment.",
      githubUrl: "https://github.com/liliapotseluyko/CAMHighways-DigitalTwin",
      featured: true
    },
    {
      id: "p4",
      title: "DfT Immersive Cyclist Safety Simulation Study",
      role: "Lead Simulation Developer & UX Researcher",
      description: "Supported Department for Transport (DfT) transport planning research by designing and developing an immersive cyclist safety simulation for scenario testing in a nationwide study involving over 4,000 UK participants.",
      techStack: ["Immersive Video Simulation", "Stated-Preference Research", "UX Design", "DfT Policy Influencing"],
      impactMetrics: [
        "Nationwide study involving 4,000+ UK participants evaluating cycling infrastructure",
        "Informed Department for Transport decision-making on cycling infrastructure improvements in London",
        "Documented in peer-reviewed transport planning publication"
      ],
      challengesSolved: "Engineered realistic video-based simulation scenarios to accurately capture perceived cycling risk and behavioral responses under varied road layouts.",
      featured: true
    },
    {
      id: "p5",
      title: "Norscot Joinery KTP — BIM & WebVR Workflows (Univ. of Strathclyde)",
      role: "KTP Associate & VR/BIM Lead",
      description: "Led company transition from AutoCAD to BIM- and VR-enabled workflows for offsite timber kit-home construction, developing interoperable asset libraries, WebVR demonstrations, and client simulation tools.",
      techStack: ["BIM", "Revit", "WebVR", "3D Asset Libraries", "Interoperability Scripts"],
      impactMetrics: [
        "Reduced 3D visualization preparation time from ~80 hours down to 4.5 hours",
        "Finalist for Scottish Innovator of the Future Award 2020",
        "Received Outstanding Grade for Knowledge Transfer Partnership (KTP)"
      ],
      challengesSolved: "Automated manual 3D modeling pipelines to allow prospective homeowners to explore future homes in WebVR before construction, driving higher client conversion rates.",
      featured: false
    },
    {
      id: "p6",
      title: "National Highways & iRAP Road Safety Fellowship Proposal",
      role: "Technical Discovery & Strategy Lead",
      description: "Led technical discovery and innovation strategy for a UK research fellowship proposal in collaboration with National Highways and iRAP, defining human-in-the-loop decision-support workflows for road safety countermeasure selection.",
      techStack: ["Stakeholder Discovery", "3D Computer Vision", "Multimodal Data", "AI Strategy", "Digital Twins"],
      impactMetrics: [
        "Designed structured discovery interviews with senior technical leaders across partner organizations",
        "Synthesized insights into conceptual architecture integrating 3D computer vision and AI-assisted decision support",
        "Successfully submitted grant application and innovation roadmap"
      ],
      challengesSolved: "Coordinated proposal development across multiple work packages, managing deadlines and aligning contributions from academic and industry partners into a coherent research strategy.",
      featured: false
    }
  ],
  workExperience: [
    {
      company: "University of Cambridge",
      role: "Senior Researcher & Mobile Mapping Group Lead",
      period: "2022 - Present",
      summary: "Leading research activities across digital twins, mobile mapping, computer vision, and AI decision-support platforms for National Highways and DfT.",
      highlights: [
        "Lead of Mobile Mapping Group since 2023, supervising PhD students and coordinating multi-partner research teams.",
        "Principal investigator / lead designer for RoadGP AI decision support platform.",
        "Delivered keynotes at DFBI Delft (2025), workshops at CONVR Florence (2023), and BBC News features."
      ]
    },
    {
      company: "Nicander Ltd / Teesside University",
      role: "Computational Design & Digital Twin Specialist",
      period: "2020 - 2022",
      summary: "Led innovation projects for Trafikverket (Swedish Transport Administration) and Nicander Ltd.",
      highlights: [
        "Developed automated schematic mapping algorithms for a 12km tunnel with 20,000 IoT sensors.",
        "Managed a multidisciplinary team (CAD specialist, game developer, data scientist) using Agile and DevOps.",
        "Established digital twins as a strategic commercial product line for Nicander."
      ]
    },
    {
      company: "Norscot Joinery / University of Strathclyde",
      role: "Knowledge Transfer Partnership (KTP) Associate",
      period: "2017 - 2020",
      summary: "Led BIM and VR digital transformation for offsite timber home manufacturing.",
      highlights: [
        "Reduced visualization prep time from 80 hours to 4.5 hours.",
        "Finalist for Scottish Innovator of the Future Award 2020; received Outstanding KTP grade.",
        "Trained staff in VR client demonstrations and published PhD thesis."
      ]
    }
  ],
  rawUnstructuredText: `Dr Lilia Potseluyko - Cambridge-based Researcher & Digital Engineer
Email: lilia.potseluyko@gmail.com | lp625@cam.ac.uk | Phone: 078 69 78 1897
GitHub: https://github.com/liliapotseluyko | LinkedIn: https://linkedin.com/in/lilia-potseluyko

SUMMARY:
I am Dr Lilia Potseluyko, a Cambridge-based researcher and digital engineer working at the intersection of spatial data, digital twins, computer graphics, AI and user experience. I turn complex technical information into practical, interactive tools that help people understand real-world systems, explore evidence and make better decisions.

KEY PROJECTS & RESEARCH:
1. RoadGP Decision Support Interface (National Highways): Designed AI-assisted decision-support platform using machine learning models, historical maintenance records, and national standards. Created Figma design systems, Python Dash prototypes, and Dovetail UX research repositories.
2. Trafikverket 12km Tunnel Schematic Mapping (Nicander): Automated schematic map generation for a 12km Swedish tunnel containing 20,000 IoT assets using mathematical coordinate transformations. Built Unreal Engine digital twin prototypes.
3. CAMHighways Dataset & Immersive Digital Twin: Processed Trimble MX9 scanner data (LiDAR, 360 imagery, GPR) and built interactive Unreal Engine VR/desktop environments. Featured on BBC News (International Pothole Day 2023).
4. DfT Cyclist Safety Simulation: Designed immersive cyclist safety simulation for nationwide stated-preference study with over 4,000 UK participants for Department for Transport.
5. Norscot Joinery KTP (Univ of Strathclyde): Developed BIM and WebVR workflows, reducing visualization prep time from 80h to 4.5h. Finalist for Scottish Innovator of the Future Award 2020.
6. National Highways & iRAP Proposal: Led technical discovery for road safety fellowship proposal integrating computer vision and AI decision support.`
};
