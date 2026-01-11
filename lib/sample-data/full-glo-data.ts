import type { FullGLO, GLOProgress } from "@/types/glo"

export const sampleFullGLO: FullGLO = {
  id: "GLO_001",
  title: "Julienne Cutting Technique",
  learningObjective:
    "Execute precise julienne cuts (3mm × 3mm × 5cm) with consistent size and shape for professional presentations",
  taxonomyCell: "3C",
  taxonomyCellName: "Apply × Procedural",
  estimatedTime: 15,
  difficulty: "medium",
  masteryThreshold: 85,

  contentModules: [
    {
      type: "video",
      title: "Julienne Technique Demonstration",
      url: "/placeholder.mp4",
      description: "Watch Chef Pierre demonstrate perfect julienne cuts",
      duration: 300,
    },
    {
      type: "text",
      title: "Step-by-Step Instructions",
      data: `## Julienne Cutting Steps

1. **Square off the vegetable** - Remove rounded edges to create a stable rectangle
2. **Cut into 3mm thick planks** - Use consistent pressure and smooth motions
3. **Stack planks** - Align edges for uniform cuts
4. **Cut into 3mm strips** - Maintain 5cm length for classic julienne
5. **Check dimensions** - All pieces should be identical

### Key Points
- Keep your knife sharp for clean cuts
- Use the claw grip to protect fingers
- Practice slowly before building speed`,
      description: "Written instructions with detailed steps",
    },
    {
      type: "diagram",
      title: "Julienne Dimensions",
      url: "/julienne-cutting-diagram.jpg",
      description: "Visual guide showing exact dimensions",
    },
  ],

  practiceExercises: [
    {
      type: "exercise",
      prompt:
        "Practice julienne cuts on a carrot. Take your time to achieve consistent dimensions. Upload 2 photos: top view and side view showing the uniform cuts.",
      hints: [
        "Use a sharp knife for clean cuts",
        "The claw grip protects your fingers",
        "Start slowly - speed comes with practice",
        "All pieces should be the same size",
      ],
    },
    {
      type: "reflection",
      prompt:
        "After practicing, reflect: What was most challenging about maintaining consistent dimensions? What strategy helped you improve?",
      hints: [
        "Consider your knife grip and posture",
        "Think about your cutting rhythm",
        "Reflect on visual checks you used",
      ],
    },
  ],

  assessmentQuestions: [
    {
      id: "q1",
      type: "multiple_choice_single",
      question: "What are the standard dimensions for julienne cuts?",
      cellCode: "3C",
      points: 1,
      difficulty: "easy",
      options: ["2mm × 2mm × 4cm", "3mm × 3mm × 5cm", "5mm × 5mm × 7cm", "4mm × 4mm × 6cm"],
      correctAnswer: 1,
      explanation: "Julienne cuts are standardized at 3mm × 3mm × 5cm for professional kitchens.",
      hints: ["Think about matchstick size"],
    },
    {
      id: "q2",
      type: "true_false",
      question: "You should square off the vegetable before starting julienne cuts.",
      cellCode: "3C",
      points: 1,
      difficulty: "easy",
      correctAnswer: true,
      explanation: "Squaring off creates stable, flat surfaces for consistent cuts.",
      hints: ["Consider what makes cutting easier and safer"],
    },
  ],

  learningObjectivesChecklist: [
    "Understand the standard julienne dimensions (3mm × 3mm × 5cm)",
    "Demonstrate proper knife grip and hand position",
    "Execute julienne cuts with consistent sizing",
    "Produce professional-quality cuts within time limits",
  ],

  tips: [
    "Keep your knife sharp - dull knives are dangerous",
    "Use the claw grip to protect your fingers",
    "Practice slowly first, then build speed",
    "Consistency matters more than speed",
  ],
}

export const sampleGLOProgress: GLOProgress = {
  gloId: "GLO_001",
  status: "in_progress",
  contentCompleted: false,
  practiceCompleted: false,
  assessmentCompleted: false,
  currentScore: 0,
  attempts: 0,
  timeSpent: 0,
}
