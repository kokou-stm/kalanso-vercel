/**
 * Academic Space - Comprehensive Help Content
 * Extracted from user guides (EN/FR/DE)
 * 
 * Usage:
 * import { getHelp } from './help-content'
 * const helpText = getHelp('dashboard', 'courseCode', language)
 */

export interface HelpItem {
  title: string
  content: string
  shortContent?: string // For compact tooltips
}

export interface HelpSection {
  main: HelpItem
  [key: string]: HelpItem
}

export interface HelpContent {
  dashboard: HelpSection
  timeline: HelpSection
  content: HelpSection
  objectives: HelpSection
}

export const helpContent: Record<'en' | 'fr' | 'de', HelpContent> = {
  en: {
    dashboard: {
      main: {
        title: "What is Academic Space?",
        content: `Academic Space is your instructor hub for creating and managing competency-based courses.

Here you can:
• Create and organize courses by domain
• Structure learning progressions (classes → sessions)
• Map content to sessions
• Define learning objectives using Bloom's Taxonomy
• Track student progress and mastery

The platform guides you through building courses that lead to genuine skill mastery, not just completion.`
      },
      courseCode: {
        title: "Auto-Generated Course Code",
        content: `Format: [DOMAIN]-[LEVEL][NUMBER]
Example: CUL-101 (Culinary, level 1, course 1)

The system suggests the next available code based on your selected domain.

You can override this with a custom code if needed.

Level Guide:
• 1XX: Beginner/Foundational
• 2XX: Intermediate
• 3XX: Advanced
• X50: Special topics`,
        shortContent: "Format: [DOMAIN]-[LEVEL][NUMBER]. Auto-generated, can override."
      },
      courseTitle: {
        title: "Writing Effective Course Titles",
        content: `Be specific and descriptive (10-100 characters).

Good examples:
✓ "French Culinary Techniques for Professionals"
✓ "Introduction to Machine Learning with Python"

Too vague:
✗ "Course 1"
✗ "Cooking"

Tip: Students should understand scope from title alone.`,
        shortContent: "Be specific and descriptive (10-100 characters)."
      },
      description: {
        title: "Course Description",
        content: `Brief overview (50-500 characters) of objectives and content.

Focus on outcomes - what students will be able to DO, not just topics covered.

Good example: "Learn essential French culinary techniques including knife skills, sauce preparation, and classical cooking methods. This hands-on course prepares students for professional kitchen work with focus on precision and timing."`,
        shortContent: "Brief overview (50-500 chars) focusing on student outcomes."
      },
      domain: {
        title: "Course Domain",
        content: `Subject area / discipline.

Options: Culinary, IT & AI, Healthcare, Business, General

Why it matters: Different domains have different pedagogical needs. Culinary courses need more procedural/application objectives, while business courses may emphasize evaluation/analysis.

Affects: Course code generation, default learning objectives.`,
        shortContent: "Subject area. Affects course code and default objectives."
      },
      duration: {
        title: "Course Duration",
        content: `Expected course length in weeks (1-52).

Recommendations:
• Short courses: 2-4 weeks
• Standard courses: 8-12 weeks
• Comprehensive programs: 16-24 weeks

Be realistic - account for practice time, not just content consumption.`,
        shortContent: "Expected length: Short (2-4w), Standard (8-12w), Long (16-24w)."
      },
      difficulty: {
        title: "Difficulty Level",
        content: `Complexity indicator for student expectations.

Beginner: No prerequisites, fundamental concepts
Intermediate: Requires basic domain knowledge
Advanced: Requires solid foundation, complex applications
Expert: Professional level, specialized mastery

Affects default mastery thresholds (higher for advanced courses).`,
        shortContent: "Beginner, Intermediate, Advanced, or Expert."
      },
      classCount: {
        title: "Number of Classes",
        content: `Major modules or units in the course.

Typical structure: 8-12 classes per course
Each class typically spans 1-3 weeks
Contains 3-5 sessions (individual lessons)

Click on course card to view and modify structure.`,
        shortContent: "Major course modules. Typical: 8-12 per course."
      },
      emptyState: {
        title: "Create Your First Course",
        content: `Classes are the major modules of your course. Each class contains multiple sessions (individual lessons).

Get started by clicking "Create Course" to build your first educational program.

Need help? Click the help button (?) in the top bar for guidance.`,
        shortContent: ""
      }
    },
    
    timeline: {
      main: {
        title: "How to Structure Your Course",
        content: `Classes are major modules (typically 1-3 weeks each)
Sessions are individual learning experiences (30-90 minutes each)

Recommended Structure:
1. Start with 3-5 classes for short course, 8-12 for standard
2. Include 3-5 sessions per class
3. Follow theory → practice → assessment pattern

Tips:
• Use auto-create sessions to build initial structure quickly
• Rename sessions with descriptive titles
• Drag to reorder as needed
• Keep as draft until content and objectives are ready`,
        shortContent: "Classes = modules (1-3 weeks). Sessions = lessons (30-90 min)."
      },
      addClass: {
        title: "Adding a Class",
        content: `Classes are the major building blocks of your course.

Each class should:
• Cover a cohesive topic or skill area
• Span 1-3 weeks of learning
• Contain 3-5 sessions
• Build on previous classes

Use "Auto-create sessions" to quickly set up initial structure.`,
        shortContent: "Major course module spanning 1-3 weeks with 3-5 sessions."
      },
      addSession: {
        title: "Adding a Session",
        content: `Sessions are individual learning experiences.

Each session should:
• Take 30-90 minutes to complete
• Focus on specific learning objectives
• Follow pattern: theory → practice → check understanding
• Build progressively in complexity

Keep sessions focused - better to have more smaller sessions than fewer large ones.`,
        shortContent: "Individual lesson (30-90 min) with specific objectives."
      },
      classTitle: {
        title: "Class Title",
        content: `Be descriptive and specific.

Good: "Introduction to Knife Skills and Safety"
Bad: "Class 1" or "Week 1"

Students should understand what they'll learn from the title alone.`,
        shortContent: "Descriptive title indicating what students will learn."
      },
      sessionTitle: {
        title: "Session Title",
        content: `Clear, action-oriented title.

Good: "Mastering the Julienne Cut"
Bad: "Cutting Practice" or "Session 2"

Format: [Action Verb] + [Specific Skill/Topic]`,
        shortContent: "Action-oriented title for specific learning activity."
      },
      weekNumber: {
        title: "Week Number",
        content: `Which week of the course this class occurs.

Used for:
• Student planning and scheduling
• Progress visualization
• Calendar integration

Can span multiple weeks for complex topics.`,
        shortContent: "Which course week(s) this class occurs in."
      },
      sessionDuration: {
        title: "Estimated Duration",
        content: `How long students need to complete this session (15-120 minutes).

Include time for:
• Consuming content (videos, reading)
• Practice activities
• Self-assessment

Be realistic - students need processing time, not just content viewing time.`,
        shortContent: "Completion time including content, practice, and assessment."
      },
      autoCreate: {
        title: "Auto-Create Sessions",
        content: `Automatically generate initial session structure.

Select 1-5 sessions to create. System will:
• Number them sequentially
• Assign default durations
• Create placeholders for you to customize

You can always add, remove, or reorder sessions later.`,
        shortContent: "Quickly generate 1-5 session placeholders."
      },
      dragReorder: {
        title: "Drag to Reorder",
        content: `Click and hold the drag handle (⋮⋮) to reorder classes or sessions.

Numbers automatically update after reordering.

Tip: Structure courses progressively - foundational concepts first, advanced applications later.`,
        shortContent: "Hold drag handle (⋮⋮) to reorder. Auto-renumbers."
      },
      published: {
        title: "Publishing Classes/Sessions",
        content: `Draft: Hidden from students, still editable
Published: Visible to students, locked structure

Only publish when:
• Content is assigned
• Learning objectives are defined
• You've reviewed for quality

You can bulk publish multiple items at once.`,
        shortContent: "Draft = hidden/editable. Published = visible/locked."
      },
      emptyState: {
        title: "Create Your First Class",
        content: `No classes created yet. Start building your course structure by adding your first class.

A class is a major module (1-3 weeks) containing multiple sessions (individual lessons).

Click "Add Class" to get started.`,
        shortContent: ""
      }
    },
    
    content: {
      main: {
        title: "How Content Mapping Works",
        content: `Left Panel: Content Library
Upload and manage all your learning materials

Right Panel: Course Structure
Drag content from library to assign to sessions

Content Types:
• Videos (lectures, demonstrations)
• PDFs (readings, handouts)
• Documents (guides, instructions)
• Links (external resources)
• Quizzes (assessments)
• Images (diagrams, references)
• Audio (podcasts, recordings)

Content stays in library until assigned to sessions.`,
        shortContent: "Drag from library (left) to sessions (right)."
      },
      upload: {
        title: "Uploading Content",
        content: `Two options:

Upload File: PDFs, videos, documents from your computer
• Drag and drop or click to browse
• System auto-fills title and detects type
• Max size varies by type

Add Link: External resources
• YouTube, Vimeo, websites, etc.
• Provide URL, title, and description

Content remains in library until assigned to sessions.`,
        shortContent: "Upload files or add external links to library."
      },
      assign: {
        title: "Assigning Content to Sessions",
        content: `Three methods:

1. Drag and Drop: Click content, drag to session drop zone
2. Click Drop Zone: Click session, select content from modal
3. Bulk Assignment: Select multiple items, assign at once

Content can be assigned to multiple sessions.

Tip: Assign in logical order - intro content first, practice materials next, assessments last.`,
        shortContent: "Drag content to session or click drop zone to assign."
      },
      contentTypes: {
        title: "Content Type Icons",
        content: `Video (Blue): Lectures, demonstrations, tutorials
PDF (Red): Readings, handouts, reference materials
Document (Green): Word docs, guides, instructions
Link (Orange): External websites, resources
Quiz (Indigo): Assessments, practice questions
Image (Pink): Diagrams, infographics, references
Audio (Purple): Podcasts, recordings, audio guides

Type determines how content is displayed to students.`,
        shortContent: "7 types: Video, PDF, Doc, Link, Quiz, Image, Audio."
      },
      required: {
        title: "Required vs Optional Content",
        content: `Required (red badge): Students must complete to progress
Optional (gray badge): Supplementary material

Mark as required:
• Core concepts and essential skills
• Prerequisites for later sessions
• Graded assessments

Mark as optional:
• Enrichment materials
• Additional practice
• Going deeper topics`,
        shortContent: "Required = must complete. Optional = supplementary."
      },
      tags: {
        title: "Content Tags",
        content: `Organize and find content with tags.

Tag by:
• Skill level (beginner, intermediate, advanced)
• Topic (safety, techniques, theory)
• Type (lecture, practice, reference)
• Domain-specific categories

Tags enable powerful filtering and search.

Format: Lowercase, comma-separated
Example: "introduction, video, important"`,
        shortContent: "Labels for organizing and finding content."
      },
      search: {
        title: "Searching Content",
        content: `Find content quickly by:
• Title or description text
• Content type filter
• Tag filter
• Assignment status (assigned/unassigned)

Combine filters for precise results.

Tip: Use descriptive titles and tags to make content easy to find later.`,
        shortContent: "Search by text, type, tags, or assignment status."
      },
      emptyLibrary: {
        title: "Add Your First Content",
        content: `No content yet. Upload your first learning material to get started.

What you can add:
• Videos (MP4, MOV, etc.)
• PDFs (readings, handouts)
• Documents (DOCX, etc.)
• Links (YouTube, websites)

Content stays in library until assigned to sessions.`,
        shortContent: ""
      },
      emptyStructure: {
        title: "Create Classes First",
        content: `No classes available. You need to create your course structure (classes and sessions) before you can assign content.

Go to Timeline Editor to build your course structure.`,
        shortContent: ""
      }
    },
    
    objectives: {
      main: {
        title: "Understanding Learning Objectives",
        content: `Learning objectives define exactly what students must master.

Every objective includes:
1. What students do (Cognitive: Remember → Create)
2. What students learn (Knowledge: Factual → Metacognitive)
3. Success criteria (How we measure mastery)
4. Mastery threshold (Minimum performance for competency)

Benefits:
✓ Clear expectations for students
✓ Targeted assessments
✓ Accurate progress tracking
✓ Evidence of mastery, not just completion`,
        shortContent: "Define what students must master with Bloom's Taxonomy."
      },
      bloomMatrix: {
        title: "Bloom's Taxonomy Explained",
        content: `4×6 Matrix combining:

Cognitive Dimensions (what students DO):
• Remember: Recall facts
• Understand: Explain ideas
• Apply: Use in new situations
• Analyze: Break down and examine
• Evaluate: Make judgments
• Create: Generate new ideas

Knowledge Dimensions (what students LEARN):
• Factual: Basic facts, terminology
• Conceptual: Principles, theories
• Procedural: Techniques, methods
• Metacognitive: Self-awareness, strategies

Each objective is classified into one of 24 cells.`,
        shortContent: "6 cognitive levels × 4 knowledge types = 24 competency cells."
      },
      addObjective: {
        title: "Creating Learning Objectives",
        content: `Format: [Cognitive Verb] + [Knowledge Type] + [Context]

Example: "Students will be able to demonstrate proper knife handling procedures in a professional kitchen environment."

Steps:
1. Write objective statement
2. Classify with AI (or manually)
3. Define success criteria
4. Set mastery threshold
5. Mark as required if needed`,
        shortContent: "Write clear, measurable objectives using action verbs."
      },
      classifyAI: {
        title: "AI Classification",
        content: `AI analyzes your objective text and suggests:
• Cognitive dimension (Remember → Create)
• Knowledge dimension (Factual → Metacognitive)
• Confidence score (60-100%)
• Reasoning explanation

Review the suggestion and accept or override.

High confidence (90-100%): Strong match, likely correct
Medium (75-89%): Reasonable suggestion, verify
Low (60-74%): Weak match, consider manual classification`,
        shortContent: "AI suggests Bloom's classification. Review and accept/override."
      },
      successCriteria: {
        title: "Success Criteria",
        content: `Specific, measurable indicators that demonstrate mastery.

Guidelines:
• Specific: Exactly what must be demonstrated
• Measurable: Can be observed and assessed
• Observable: Coach/instructor can verify
• Achievable: Within scope of learning

Example for "Apply knife safety":
✓ "Use proper grip with fingers curled under"
✓ "Maintain stable cutting board position"
✓ "Complete task without injury"
✗ "Do it safely" (too vague)

Add 2-4 criteria per objective.`,
        shortContent: "2-4 specific, measurable indicators of mastery."
      },
      masteryThreshold: {
        title: "Mastery Threshold",
        content: `Minimum score (60-100%) required to demonstrate mastery.

Recommendations:
• 90-100%: Safety-critical skills, core fundamentals
• 80-90%: Standard procedural skills
• 70-80%: Complex integration tasks
• 60-70%: Creative/open-ended work

Students must meet threshold to progress.

Tip: Higher thresholds for foundational skills, lower for advanced creative work.`,
        shortContent: "Minimum score (60-100%) required to progress."
      },
      requiredProgression: {
        title: "Required for Progression",
        content: `Toggle determines if students must master this objective to advance.

Required: Student cannot access later sessions until mastered
Optional: Student can progress, but objective still tracked

Mark as required:
• Core competencies
• Safety-critical skills
• Prerequisites for later work

Mark as optional:
• Enrichment objectives
• Advanced challenges
• Nice-to-have skills`,
        shortContent: "Must master before progressing to next session."
      },
      cognitiveLevel: {
        title: "Cognitive Dimension",
        content: `What mental process students perform:

Remember (Gray): Retrieve facts from memory
Understand (Blue): Construct meaning from information
Apply (Green): Use procedures in given situations
Analyze (Yellow): Break down into parts, find relationships
Evaluate (Orange): Make judgments based on criteria
Create (Purple): Assemble elements into something new

Course progression: Start low (Remember/Understand), build to high (Create).`,
        shortContent: "Mental process: Remember → Understand → Apply → Analyze → Evaluate → Create"
      },
      knowledgeDimension: {
        title: "Knowledge Dimension",
        content: `What type of knowledge students acquire:

Factual: Terminology, specific details, basic elements
Conceptual: Categories, principles, theories, structures
Procedural: How to do something - techniques, methods, skills
Metacognitive: Self-knowledge, reflection, learning strategies

Vocational training focuses heavily on Procedural, but needs all types.`,
        shortContent: "Knowledge type: Factual, Conceptual, Procedural, or Metacognitive"
      },
      emptyState: {
        title: "Add Your First Learning Objective",
        content: `No learning objectives yet. Define what students must master in this session.

Objectives should be:
• Specific and measurable
• Aligned with session content
• Classified using Bloom's Taxonomy
• Include clear success criteria

Click "Add Objective" to get started.`,
        shortContent: ""
      }
    }
  },

  fr: {
    dashboard: {
      main: {
        title: "Qu'est-ce que l'Espace Académique ?",
        content: `L'Espace Académique est votre centre instructeur pour créer et gérer des cours basés sur les compétences.

Ici vous pouvez :
• Créer et organiser des cours par domaine
• Structurer les progressions d'apprentissage (classes → sessions)
• Mapper du contenu aux sessions
• Définir des objectifs d'apprentissage utilisant la Taxonomie de Bloom
• Suivre le progrès et la maîtrise des étudiants

La plateforme vous guide dans la construction de cours qui mènent à une véritable maîtrise des compétences, pas seulement à l'achèvement.`
      },
      courseCode: {
        title: "Code de Cours Auto-Généré",
        content: `Format : [DOMAINE]-[NIVEAU][NUMÉRO]
Exemple : CUL-101 (Culinaire, niveau 1, cours 1)

Le système suggère le prochain code disponible basé sur votre domaine sélectionné.

Vous pouvez le remplacer par un code personnalisé si nécessaire.

Guide des Niveaux :
• 1XX : Débutant/Fondamental
• 2XX : Intermédiaire
• 3XX : Avancé
• X50 : Sujets spéciaux`,
        shortContent: "Format : [DOMAINE]-[NIVEAU][NUMÉRO]. Auto-généré, peut être remplacé."
      },
      courseTitle: {
        title: "Rédiger des Titres de Cours Efficaces",
        content: `Soyez spécifique et descriptif (10-100 caractères).

Bons exemples :
✓ "Techniques Culinaires Françaises pour Professionnels"
✓ "Introduction à l'Apprentissage Automatique avec Python"

Trop vague :
✗ "Cours 1"
✗ "Cuisine"

Astuce : Les étudiants devraient comprendre la portée du titre seul.`,
        shortContent: "Soyez spécifique et descriptif (10-100 caractères)."
      },
      description: {
        title: "Description du Cours",
        content: `Aperçu bref (50-500 caractères) des objectifs et du contenu.

Concentrez-vous sur les résultats - ce que les étudiants pourront FAIRE, pas seulement les sujets couverts.

Bon exemple : "Apprenez les techniques culinaires françaises essentielles incluant les compétences au couteau, la préparation de sauces et les méthodes de cuisson classiques. Ce cours pratique prépare les étudiants au travail en cuisine professionnelle avec un accent sur la précision et le timing."`,
        shortContent: "Aperçu bref (50-500 car) axé sur les résultats étudiants."
      },
      domain: {
        title: "Domaine du Cours",
        content: `Domaine / discipline.

Options : Culinaire, IT & IA, Santé, Commerce, Général

Pourquoi c'est important : Différents domaines ont différents besoins pédagogiques. Les cours culinaires nécessitent plus d'objectifs procéduraux/application, tandis que les cours de commerce peuvent mettre l'accent sur évaluation/analyse.

Affecte : Génération du code de cours, objectifs d'apprentissage par défaut.`,
        shortContent: "Domaine. Affecte le code de cours et les objectifs par défaut."
      },
      duration: {
        title: "Durée du Cours",
        content: `Durée de cours attendue en semaines (1-52).

Recommandations :
• Cours courts : 2-4 semaines
• Cours standards : 8-12 semaines
• Programmes complets : 16-24 semaines

Soyez réaliste - tenez compte du temps de pratique, pas seulement de la consommation de contenu.`,
        shortContent: "Durée attendue : Court (2-4s), Standard (8-12s), Long (16-24s)."
      },
      difficulty: {
        title: "Niveau de Difficulté",
        content: `Indicateur de complexité pour les attentes des étudiants.

Débutant : Pas de prérequis, concepts fondamentaux
Intermédiaire : Nécessite des connaissances de base du domaine
Avancé : Nécessite une base solide, applications complexes
Expert : Niveau professionnel, maîtrise spécialisée

Affecte les seuils de maîtrise par défaut (plus élevés pour les cours avancés).`,
        shortContent: "Débutant, Intermédiaire, Avancé, ou Expert."
      },
      classCount: {
        title: "Nombre de Classes",
        content: `Modules ou unités majeurs dans le cours.

Structure typique : 8-12 classes par cours
Chaque classe couvre typiquement 1-3 semaines
Contient 3-5 sessions (leçons individuelles)

Cliquez sur la carte de cours pour voir et modifier la structure.`,
        shortContent: "Modules majeurs du cours. Typique : 8-12 par cours."
      },
      emptyState: {
        title: "Créer Votre Premier Cours",
        content: `Les classes sont les modules majeurs de votre cours. Chaque classe contient plusieurs sessions (leçons individuelles).

Commencez en cliquant sur "Créer un Cours" pour construire votre premier programme éducatif.

Besoin d'aide ? Cliquez sur le bouton d'aide (?) dans la barre supérieure pour des conseils.`,
        shortContent: ""
      }
    },
    
    timeline: {
      main: {
        title: "Comment Structurer Votre Cours",
        content: `Les classes sont des modules majeurs (typiquement 1-3 semaines chacun)
Les sessions sont des expériences d'apprentissage individuelles (30-90 minutes chacune)

Structure Recommandée :
1. Commencez avec 3-5 classes pour un cours court, 8-12 pour standard
2. Incluez 3-5 sessions par classe
3. Suivez le schéma théorie → pratique → évaluation

Conseils :
• Utilisez l'auto-création de sessions pour construire rapidement la structure initiale
• Renommez les sessions avec des titres descriptifs
• Glissez pour réorganiser au besoin
• Gardez comme brouillon jusqu'à ce que le contenu et les objectifs soient prêts`,
        shortContent: "Classes = modules (1-3 sem). Sessions = leçons (30-90 min)."
      },
      addClass: {
        title: "Ajouter une Classe",
        content: `Les classes sont les blocs de construction majeurs de votre cours.

Chaque classe devrait :
• Couvrir un sujet ou domaine de compétence cohésif
• Couvrir 1-3 semaines d'apprentissage
• Contenir 3-5 sessions
• Construire sur les classes précédentes

Utilisez "Auto-créer sessions" pour configurer rapidement la structure initiale.`,
        shortContent: "Module majeur du cours couvrant 1-3 semaines avec 3-5 sessions."
      },
      addSession: {
        title: "Ajouter une Session",
        content: `Les sessions sont des expériences d'apprentissage individuelles.

Chaque session devrait :
• Prendre 30-90 minutes à compléter
• Se concentrer sur des objectifs d'apprentissage spécifiques
• Suivre le schéma : théorie → pratique → vérifier la compréhension
• Progresser graduellement en complexité

Gardez les sessions ciblées - mieux vaut avoir plus de petites sessions que moins de grandes.`,
        shortContent: "Leçon individuelle (30-90 min) avec objectifs spécifiques."
      },
      classTitle: {
        title: "Titre de Classe",
        content: `Soyez descriptif et spécifique.

Bon : "Introduction aux Compétences au Couteau et Sécurité"
Mauvais : "Classe 1" ou "Semaine 1"

Les étudiants devraient comprendre ce qu'ils apprendront du titre seul.`,
        shortContent: "Titre descriptif indiquant ce que les étudiants apprendront."
      },
      sessionTitle: {
        title: "Titre de Session",
        content: `Titre clair, orienté action.

Bon : "Maîtriser la Coupe Julienne"
Mauvais : "Pratique de Coupe" ou "Session 2"

Format : [Verbe d'Action] + [Compétence/Sujet Spécifique]`,
        shortContent: "Titre orienté action pour activité d'apprentissage spécifique."
      },
      weekNumber: {
        title: "Numéro de Semaine",
        content: `À quelle semaine du cours cette classe se produit.

Utilisé pour :
• Planification et programmation des étudiants
• Visualisation des progrès
• Intégration du calendrier

Peut couvrir plusieurs semaines pour des sujets complexes.`,
        shortContent: "Quelle(s) semaine(s) du cours cette classe se produit."
      },
      sessionDuration: {
        title: "Durée Estimée",
        content: `Combien de temps les étudiants ont besoin pour compléter cette session (15-120 minutes).

Inclure le temps pour :
• Consommer le contenu (vidéos, lecture)
• Activités de pratique
• Auto-évaluation

Soyez réaliste - les étudiants ont besoin de temps de traitement, pas seulement de temps de visionnage de contenu.`,
        shortContent: "Temps de complétion incluant contenu, pratique et évaluation."
      },
      autoCreate: {
        title: "Auto-Créer Sessions",
        content: `Générez automatiquement la structure de session initiale.

Sélectionnez 1-5 sessions à créer. Le système va :
• Les numéroter séquentiellement
• Assigner des durées par défaut
• Créer des espaces réservés à personnaliser

Vous pouvez toujours ajouter, supprimer ou réorganiser les sessions plus tard.`,
        shortContent: "Générez rapidement 1-5 espaces réservés de session."
      },
      dragReorder: {
        title: "Glisser pour Réorganiser",
        content: `Cliquez et maintenez la poignée de glissement (⋮⋮) pour réorganiser les classes ou sessions.

Les numéros se mettent à jour automatiquement après réorganisation.

Astuce : Structurez les cours progressivement - concepts fondamentaux d'abord, applications avancées plus tard.`,
        shortContent: "Maintenez la poignée (⋮⋮) pour réorganiser. Auto-renumérotation."
      },
      published: {
        title: "Publier Classes/Sessions",
        content: `Brouillon : Caché des étudiants, encore modifiable
Publié : Visible aux étudiants, structure verrouillée

Ne publiez que quand :
• Le contenu est assigné
• Les objectifs d'apprentissage sont définis
• Vous avez révisé pour la qualité

Vous pouvez publier en masse plusieurs éléments à la fois.`,
        shortContent: "Brouillon = caché/modifiable. Publié = visible/verrouillé."
      },
      emptyState: {
        title: "Créer Votre Première Classe",
        content: `Aucune classe créée encore. Commencez à construire la structure de votre cours en ajoutant votre première classe.

Une classe est un module majeur (1-3 semaines) contenant plusieurs sessions (leçons individuelles).

Cliquez sur "Ajouter une Classe" pour commencer.`,
        shortContent: ""
      }
    },
    
    content: {
      main: {
        title: "Comment Fonctionne le Mappage de Contenu",
        content: `Panneau Gauche : Bibliothèque de Contenu
Téléchargez et gérez tous vos matériaux d'apprentissage

Panneau Droit : Structure du Cours
Glissez le contenu de la bibliothèque pour l'assigner aux sessions

Types de Contenu :
• Vidéos (cours, démonstrations)
• PDFs (lectures, documents)
• Documents (guides, instructions)
• Liens (ressources externes)
• Quizzes (évaluations)
• Images (diagrammes, références)
• Audio (podcasts, enregistrements)

Le contenu reste dans la bibliothèque jusqu'à ce qu'il soit assigné aux sessions.`,
        shortContent: "Glissez de la bibliothèque (gauche) aux sessions (droite)."
      },
      upload: {
        title: "Téléchargement de Contenu",
        content: `Deux options :

Télécharger un Fichier : PDFs, vidéos, documents depuis votre ordinateur
• Glissez-déposez ou cliquez pour parcourir
• Le système remplit automatiquement le titre et détecte le type
• Taille max varie selon le type

Ajouter un Lien : Ressources externes
• YouTube, Vimeo, sites web, etc.
• Fournir l'URL, le titre et la description

Le contenu reste dans la bibliothèque jusqu'à ce qu'il soit assigné aux sessions.`,
        shortContent: "Téléchargez des fichiers ou ajoutez des liens externes à la bibliothèque."
      },
      assign: {
        title: "Assigner du Contenu aux Sessions",
        content: `Trois méthodes :

1. Glisser-Déposer : Cliquez sur le contenu, glissez vers la zone de dépôt de session
2. Cliquer sur Zone de Dépôt : Cliquez sur la session, sélectionnez le contenu depuis le modal
3. Assignation en Masse : Sélectionnez plusieurs éléments, assignez en une fois

Le contenu peut être assigné à plusieurs sessions.

Astuce : Assignez dans un ordre logique - contenu d'intro d'abord, matériaux de pratique ensuite, évaluations en dernier.`,
        shortContent: "Glissez le contenu vers la session ou cliquez sur la zone de dépôt pour assigner."
      },
      contentTypes: {
        title: "Icônes de Type de Contenu",
        content: `Vidéo (Bleu) : Cours, démonstrations, tutoriels
PDF (Rouge) : Lectures, documents, matériaux de référence
Document (Vert) : Docs Word, guides, instructions
Lien (Orange) : Sites web externes, ressources
Quiz (Indigo) : Évaluations, questions de pratique
Image (Rose) : Diagrammes, infographies, références
Audio (Violet) : Podcasts, enregistrements, guides audio

Le type détermine comment le contenu est affiché aux étudiants.`,
        shortContent: "7 types : Vidéo, PDF, Doc, Lien, Quiz, Image, Audio."
      },
      required: {
        title: "Contenu Requis vs Optionnel",
        content: `Requis (badge rouge) : Les étudiants doivent compléter pour progresser
Optionnel (badge gris) : Matériel supplémentaire

Marquez comme requis :
• Concepts de base et compétences essentielles
• Prérequis pour les sessions ultérieures
• Évaluations notées

Marquez comme optionnel :
• Matériaux d'enrichissement
• Pratique supplémentaire
• Sujets d'approfondissement`,
        shortContent: "Requis = doit compléter. Optionnel = supplémentaire."
      },
      tags: {
        title: "Tags de Contenu",
        content: `Organisez et trouvez du contenu avec des tags.

Tag par :
• Niveau de compétence (débutant, intermédiaire, avancé)
• Sujet (sécurité, techniques, théorie)
• Type (cours, pratique, référence)
• Catégories spécifiques au domaine

Les tags permettent un filtrage et une recherche puissants.

Format : Minuscules, séparés par des virgules
Exemple : "introduction, vidéo, important"`,
        shortContent: "Étiquettes pour organiser et trouver du contenu."
      },
      search: {
        title: "Recherche de Contenu",
        content: `Trouvez du contenu rapidement par :
• Titre ou texte de description
• Filtre de type de contenu
• Filtre de tag
• Statut d'assignation (assigné/non assigné)

Combinez les filtres pour des résultats précis.

Astuce : Utilisez des titres descriptifs et des tags pour rendre le contenu facile à trouver plus tard.`,
        shortContent: "Recherchez par texte, type, tags ou statut d'assignation."
      },
      emptyLibrary: {
        title: "Ajoutez Votre Premier Contenu",
        content: `Pas encore de contenu. Téléchargez votre premier matériel d'apprentissage pour commencer.

Ce que vous pouvez ajouter :
• Vidéos (MP4, MOV, etc.)
• PDFs (lectures, documents)
• Documents (DOCX, etc.)
• Liens (YouTube, sites web)

Le contenu reste dans la bibliothèque jusqu'à ce qu'il soit assigné aux sessions.`,
        shortContent: ""
      },
      emptyStructure: {
        title: "Créez d'Abord des Classes",
        content: `Aucune classe disponible. Vous devez créer la structure de votre cours (classes et sessions) avant de pouvoir assigner du contenu.

Allez dans l'Éditeur de Timeline pour construire la structure de votre cours.`,
        shortContent: ""
      }
    },
    
    objectives: {
      main: {
        title: "Comprendre les Objectifs d'Apprentissage",
        content: `Les objectifs d'apprentissage définissent exactement ce que les étudiants doivent maîtriser.

Chaque objectif inclut :
1. Ce que les étudiants font (Cognitif : Mémoriser → Créer)
2. Ce que les étudiants apprennent (Connaissance : Factuel → Métacognitif)
3. Critères de succès (Comment nous mesurons la maîtrise)
4. Seuil de maîtrise (Performance minimale pour la compétence)

Avantages :
✓ Attentes claires pour les étudiants
✓ Évaluations ciblées
✓ Suivi précis des progrès
✓ Preuve de maîtrise, pas seulement d'achèvement`,
        shortContent: "Définissez ce que les étudiants doivent maîtriser avec la Taxonomie de Bloom."
      },
      bloomMatrix: {
        title: "Taxonomie de Bloom Expliquée",
        content: `Matrice 4×6 combinant :

Dimensions Cognitives (ce que les étudiants FONT) :
• Mémoriser : Rappeler des faits
• Comprendre : Expliquer des idées
• Appliquer : Utiliser dans de nouvelles situations
• Analyser : Décomposer et examiner
• Évaluer : Porter des jugements
• Créer : Générer de nouvelles idées

Dimensions de Connaissance (ce que les étudiants APPRENNENT) :
• Factuel : Faits de base, terminologie
• Conceptuel : Principes, théories
• Procédural : Techniques, méthodes
• Métacognitif : Conscience de soi, stratégies

Chaque objectif est classé dans une des 24 cellules.`,
        shortContent: "6 niveaux cognitifs × 4 types de connaissance = 24 cellules de compétence."
      },
      addObjective: {
        title: "Créer des Objectifs d'Apprentissage",
        content: `Format : [Verbe Cognitif] + [Type de Connaissance] + [Contexte]

Exemple : "Les étudiants seront capables de démontrer les procédures appropriées de manipulation des couteaux dans un environnement de cuisine professionnelle."

Étapes :
1. Écrire l'énoncé d'objectif
2. Classifier avec l'IA (ou manuellement)
3. Définir les critères de succès
4. Fixer le seuil de maîtrise
5. Marquer comme requis si nécessaire`,
        shortContent: "Écrivez des objectifs clairs et mesurables en utilisant des verbes d'action."
      },
      classifyAI: {
        title: "Classification IA",
        content: `L'IA analyse le texte de votre objectif et suggère :
• Dimension cognitive (Mémoriser → Créer)
• Dimension de connaissance (Factuel → Métacognitif)
• Score de confiance (60-100%)
• Explication du raisonnement

Révisez la suggestion et acceptez ou remplacez.

Haute confiance (90-100%) : Forte correspondance, probablement correcte
Moyenne (75-89%) : Suggestion raisonnable, vérifier
Faible (60-74%) : Correspondance faible, considérer la classification manuelle`,
        shortContent: "L'IA suggère la classification de Bloom. Révisez et acceptez/remplacez."
      },
      successCriteria: {
        title: "Critères de Succès",
        content: `Indicateurs spécifiques et mesurables qui démontrent la maîtrise.

Directives :
• Spécifique : Exactement ce qui doit être démontré
• Mesurable : Peut être observé et évalué
• Observable : Le coach/instructeur peut vérifier
• Atteignable : Dans la portée de l'apprentissage

Exemple pour "Appliquer la sécurité avec le couteau" :
✓ "Utiliser une prise appropriée avec les doigts courbés sous"
✓ "Maintenir une position stable de la planche à découper"
✓ "Compléter la tâche sans blessure"
✗ "Le faire en toute sécurité" (trop vague)

Ajoutez 2-4 critères par objectif.`,
        shortContent: "2-4 indicateurs spécifiques et mesurables de maîtrise."
      },
      masteryThreshold: {
        title: "Seuil de Maîtrise",
        content: `Score minimum (60-100%) requis pour démontrer la maîtrise.

Recommandations :
• 90-100% : Compétences critiques pour la sécurité, fondamentaux de base
• 80-90% : Compétences procédurales standard
• 70-80% : Tâches d'intégration complexes
• 60-70% : Travail créatif/ouvert

Les étudiants doivent atteindre le seuil pour progresser.

Astuce : Seuils plus élevés pour les compétences fondamentales, plus bas pour le travail créatif avancé.`,
        shortContent: "Score minimum (60-100%) requis pour progresser."
      },
      requiredProgression: {
        title: "Requis pour la Progression",
        content: `Le bouton bascule détermine si les étudiants doivent maîtriser cet objectif pour avancer.

Requis : L'étudiant ne peut pas accéder aux sessions ultérieures jusqu'à la maîtrise
Optionnel : L'étudiant peut progresser, mais l'objectif est toujours suivi

Marquer comme requis :
• Compétences de base
• Compétences critiques pour la sécurité
• Prérequis pour le travail ultérieur

Marquer comme optionnel :
• Objectifs d'enrichissement
• Défis avancés
• Compétences agréables à avoir`,
        shortContent: "Doit maîtriser avant de progresser à la session suivante."
      },
      cognitiveLevel: {
        title: "Dimension Cognitive",
        content: `Quel processus mental les étudiants effectuent :

Mémoriser (Gris) : Récupérer des faits de la mémoire
Comprendre (Bleu) : Construire du sens à partir de l'information
Appliquer (Vert) : Utiliser des procédures dans des situations données
Analyser (Jaune) : Décomposer en parties, trouver des relations
Évaluer (Orange) : Porter des jugements basés sur des critères
Créer (Violet) : Assembler des éléments en quelque chose de nouveau

Progression du cours : Commencer bas (Mémoriser/Comprendre), construire vers haut (Créer).`,
        shortContent: "Processus mental : Mémoriser → Comprendre → Appliquer → Analyser → Évaluer → Créer"
      },
      knowledgeDimension: {
        title: "Dimension de Connaissance",
        content: `Quel type de connaissance les étudiants acquièrent :

Factuel : Terminologie, détails spécifiques, éléments de base
Conceptuel : Catégories, principes, théories, structures
Procédural : Comment faire quelque chose - techniques, méthodes, compétences
Métacognitif : Connaissance de soi, réflexion, stratégies d'apprentissage

La formation professionnelle se concentre fortement sur le Procédural, mais nécessite tous les types.`,
        shortContent: "Type de connaissance : Factuel, Conceptuel, Procédural, ou Métacognitif"
      },
      emptyState: {
        title: "Ajoutez Votre Premier Objectif d'Apprentissage",
        content: `Aucun objectif d'apprentissage encore. Définissez ce que les étudiants doivent maîtriser dans cette session.

Les objectifs devraient être :
• Spécifiques et mesurables
• Alignés avec le contenu de la session
• Classifiés en utilisant la Taxonomie de Bloom
• Inclure des critères de succès clairs

Cliquez sur "Ajouter un Objectif" pour commencer.`,
        shortContent: ""
      }
    }
  },

  de: {
    dashboard: {
      main: {
        title: "Was ist der Akademische Raum?",
        content: `Der Akademische Raum ist Ihr Instructor-Hub zur Erstellung und Verwaltung kompetenzbasierter Kurse.

Hier können Sie:
• Kurse erstellen und nach Domain organisieren
• Lernprogressionen strukturieren (Klassen → Sitzungen)
• Inhalte Sitzungen zuordnen
• Lernziele mithilfe der Bloom-Taxonomie definieren
• Studentenfortschritt und Meisterschaft verfolgen

Die Plattform führt Sie durch den Aufbau von Kursen, die zu echter Kompetenzmeisterschaft führen, nicht nur zum Abschluss.`
      },
      courseCode: {
        title: "Auto-Generierter Kurs-Code",
        content: `Format: [DOMAIN]-[LEVEL][NUMMER]
Beispiel: CUL-101 (Kulinarisch, Level 1, Kurs 1)

Das System schlägt den nächsten verfügbaren Code basierend auf Ihrer gewählten Domain vor.

Sie können dies bei Bedarf mit einem benutzerdefinierten Code überschreiben.

Level-Guide:
• 1XX: Anfänger/Grundlegend
• 2XX: Fortgeschritten
• 3XX: Erweitert
• X50: Spezialthemen`,
        shortContent: "Format: [DOMAIN]-[LEVEL][NUMMER]. Auto-generiert, kann überschrieben werden."
      },
      courseTitle: {
        title: "Effektive Kurs-Titel Schreiben",
        content: `Seien Sie spezifisch und beschreibend (10-100 Zeichen).

Gute Beispiele:
✓ "Französische Kochtechniken für Profis"
✓ "Einführung in Maschinelles Lernen mit Python"

Zu vage:
✗ "Kurs 1"
✗ "Kochen"

Tipp: Studenten sollten den Umfang allein aus dem Titel verstehen.`,
        shortContent: "Seien Sie spezifisch und beschreibend (10-100 Zeichen)."
      },
      description: {
        title: "Kursbeschreibung",
        content: `Kurzer Überblick (50-500 Zeichen) über Ziele und Inhalt.

Konzentrieren Sie sich auf Ergebnisse - was Studenten TUN können werden, nicht nur auf abgedeckte Themen.

Gutes Beispiel: "Lernen Sie wesentliche französische Kochtechniken einschließlich Messerfähigkeiten, Saucenzubereitung und klassische Kochmethoden. Dieser praxisorientierte Kurs bereitet Studenten auf professionelle Küchenarbeit vor mit Fokus auf Präzision und Timing."`,
        shortContent: "Kurzer Überblick (50-500 Z) fokussiert auf Studentenergebnisse."
      },
      domain: {
        title: "Kurs-Domain",
        content: `Fachbereich / Disziplin.

Optionen: Kulinarisch, IT & KI, Gesundheit, Geschäft, Allgemein

Warum es wichtig ist: Verschiedene Domains haben unterschiedliche pädagogische Bedürfnisse. Kulinarische Kurse benötigen mehr prozedurale/Anwendungsziele, während Geschäftskurse Bewertung/Analyse betonen können.

Beeinflusst: Kurs-Code-Generierung, Standard-Lernziele.`,
        shortContent: "Fachbereich. Beeinflusst Kurs-Code und Standard-Ziele."
      },
      duration: {
        title: "Kursdauer",
        content: `Erwartete Kurslänge in Wochen (1-52).

Empfehlungen:
• Kurze Kurse: 2-4 Wochen
• Standard-Kurse: 8-12 Wochen
• Umfassende Programme: 16-24 Wochen

Seien Sie realistisch - berücksichtigen Sie Übungszeit, nicht nur Inhaltskonsum.`,
        shortContent: "Erwartete Länge: Kurz (2-4W), Standard (8-12W), Lang (16-24W)."
      },
      difficulty: {
        title: "Schwierigkeitsgrad",
        content: `Komplexitätsindikator für Studentenerwartungen.

Anfänger: Keine Voraussetzungen, grundlegende Konzepte
Fortgeschritten: Erfordert Basis-Domain-Kenntnisse
Erweitert: Erfordert solide Grundlage, komplexe Anwendungen
Experte: Professionelles Niveau, spezialisierte Meisterschaft

Beeinflusst Standard-Meisterschaftsschwellen (höher für erweiterte Kurse).`,
        shortContent: "Anfänger, Fortgeschritten, Erweitert, oder Experte."
      },
      classCount: {
        title: "Anzahl der Klassen",
        content: `Hauptmodule oder Einheiten im Kurs.

Typische Struktur: 8-12 Klassen pro Kurs
Jede Klasse umfasst typischerweise 1-3 Wochen
Enthält 3-5 Sitzungen (einzelne Lektionen)

Klicken Sie auf die Kurs-Karte, um die Struktur anzuzeigen und zu ändern.`,
        shortContent: "Haupt-Kursmodule. Typisch: 8-12 pro Kurs."
      },
      emptyState: {
        title: "Erstellen Sie Ihren Ersten Kurs",
        content: `Klassen sind die Hauptmodule Ihres Kurses. Jede Klasse enthält mehrere Sitzungen (einzelne Lektionen).

Beginnen Sie, indem Sie auf "Kurs Erstellen" klicken, um Ihr erstes Bildungsprogramm zu erstellen.

Brauchen Sie Hilfe? Klicken Sie auf den Hilfe-Button (?) in der oberen Leiste für Anleitung.`,
        shortContent: ""
      }
    },
    
    timeline: {
      main: {
        title: "Wie Sie Ihren Kurs Strukturieren",
        content: `Klassen sind Hauptmodule (typischerweise je 1-3 Wochen)
Sitzungen sind individuelle Lernerfahrungen (je 30-90 Minuten)

Empfohlene Struktur:
1. Beginnen Sie mit 3-5 Klassen für kurzen Kurs, 8-12 für Standard
2. Fügen Sie 3-5 Sitzungen pro Klasse hinzu
3. Folgen Sie dem Muster Theorie → Praxis → Bewertung

Tipps:
• Verwenden Sie Auto-Erstellung für Sitzungen, um schnell die Anfangsstruktur aufzubauen
• Benennen Sie Sitzungen mit beschreibenden Titeln um
• Ziehen Sie zum Neuordnen nach Bedarf
• Behalten Sie als Entwurf, bis Inhalt und Ziele bereit sind`,
        shortContent: "Klassen = Module (1-3 Wochen). Sitzungen = Lektionen (30-90 Min)."
      },
      addClass: {
        title: "Eine Klasse Hinzufügen",
        content: `Klassen sind die Hauptbausteine Ihres Kurses.

Jede Klasse sollte:
• Ein kohärentes Thema oder Fähigkeitsbereich abdecken
• 1-3 Wochen Lernen umfassen
• 3-5 Sitzungen enthalten
• Auf vorherigen Klassen aufbauen

Verwenden Sie "Sitzungen Auto-Erstellen", um schnell die Anfangsstruktur einzurichten.`,
        shortContent: "Haupt-Kursmodul über 1-3 Wochen mit 3-5 Sitzungen."
      },
      addSession: {
        title: "Eine Sitzung Hinzufügen",
        content: `Sitzungen sind individuelle Lernerfahrungen.

Jede Sitzung sollte:
• 30-90 Minuten zum Abschluss benötigen
• Sich auf spezifische Lernziele konzentrieren
• Dem Muster folgen: Theorie → Praxis → Verständnis prüfen
• Progressiv in Komplexität aufbauen

Halten Sie Sitzungen fokussiert - besser mehr kleinere Sitzungen als weniger große.`,
        shortContent: "Einzelne Lektion (30-90 Min) mit spezifischen Zielen."
      },
      classTitle: {
        title: "Klassen-Titel",
        content: `Seien Sie beschreibend und spezifisch.

Gut: "Einführung in Messerfähigkeiten und Sicherheit"
Schlecht: "Klasse 1" oder "Woche 1"

Studenten sollten verstehen, was sie aus dem Titel allein lernen werden.`,
        shortContent: "Beschreibender Titel, der anzeigt, was Studenten lernen werden."
      },
      sessionTitle: {
        title: "Sitzungs-Titel",
        content: `Klarer, aktionsorientierter Titel.

Gut: "Julienne-Schnitt Meistern"
Schlecht: "Schneidübung" oder "Sitzung 2"

Format: [Aktionsverb] + [Spezifische Fähigkeit/Thema]`,
        shortContent: "Aktionsorientierter Titel für spezifische Lernaktivität."
      },
      weekNumber: {
        title: "Wochennummer",
        content: `In welcher Kurswoche diese Klasse stattfindet.

Verwendet für:
• Studentenplanung und Terminierung
• Fortschrittsvisualisierung
• Kalenderintegration

Kann mehrere Wochen für komplexe Themen umfassen.`,
        shortContent: "In welcher Kurswoche(n) diese Klasse stattfindet."
      },
      sessionDuration: {
        title: "Geschätzte Dauer",
        content: `Wie lange Studenten benötigen, um diese Sitzung abzuschließen (15-120 Minuten).

Zeit einbeziehen für:
• Inhaltskonsum (Videos, Lesen)
• Übungsaktivitäten
• Selbstbewertung

Seien Sie realistisch - Studenten benötigen Verarbeitungszeit, nicht nur Inhaltsansichtszeit.`,
        shortContent: "Abschlusszeit einschließlich Inhalt, Übung und Bewertung."
      },
      autoCreate: {
        title: "Sitzungen Auto-Erstellen",
        content: `Anfängliche Sitzungsstruktur automatisch generieren.

Wählen Sie 1-5 zu erstellende Sitzungen. System wird:
• Sie sequentiell nummerieren
• Standarddauern zuweisen
• Platzhalter zum Anpassen erstellen

Sie können Sitzungen später jederzeit hinzufügen, entfernen oder neu ordnen.`,
        shortContent: "Schnell 1-5 Sitzungs-Platzhalter generieren."
      },
      dragReorder: {
        title: "Zum Neuordnen Ziehen",
        content: `Klicken und halten Sie den Ziehgriff (⋮⋮), um Klassen oder Sitzungen neu zu ordnen.

Nummern aktualisieren sich automatisch nach Neuordnung.

Tipp: Strukturieren Sie Kurse progressiv - grundlegende Konzepte zuerst, erweiterte Anwendungen später.`,
        shortContent: "Ziehgriff (⋮⋮) halten zum Neuordnen. Auto-Neunummerierung."
      },
      published: {
        title: "Klassen/Sitzungen Veröffentlichen",
        content: `Entwurf: Für Studenten verborgen, noch bearbeitbar
Veröffentlicht: Für Studenten sichtbar, Struktur gesperrt

Nur veröffentlichen, wenn:
• Inhalt zugewiesen ist
• Lernziele definiert sind
• Sie auf Qualität geprüft haben

Sie können mehrere Elemente auf einmal massenveröffentlichen.`,
        shortContent: "Entwurf = verborgen/bearbeitbar. Veröffentlicht = sichtbar/gesperrt."
      },
      emptyState: {
        title: "Erstellen Sie Ihre Erste Klasse",
        content: `Noch keine Klassen erstellt. Beginnen Sie mit dem Aufbau Ihrer Kursstruktur, indem Sie Ihre erste Klasse hinzufügen.

Eine Klasse ist ein Hauptmodul (1-3 Wochen) mit mehreren Sitzungen (einzelne Lektionen).

Klicken Sie auf "Klasse Hinzufügen", um zu beginnen.`,
        shortContent: ""
      }
    },
    
    content: {
      main: {
        title: "Wie Inhaltszuordnung Funktioniert",
        content: `Linkes Panel: Inhaltsbibliothek
Laden Sie alle Ihre Lernmaterialien hoch und verwalten Sie sie

Rechtes Panel: Kursstruktur
Ziehen Sie Inhalt aus der Bibliothek, um ihn Sitzungen zuzuweisen

Inhaltstypen:
• Videos (Vorlesungen, Demonstrationen)
• PDFs (Lesungen, Handouts)
• Dokumente (Leitfäden, Anweisungen)
• Links (externe Ressourcen)
• Quizze (Bewertungen)
• Bilder (Diagramme, Referenzen)
• Audio (Podcasts, Aufnahmen)

Inhalt bleibt in der Bibliothek, bis er Sitzungen zugewiesen wird.`,
        shortContent: "Ziehen Sie von Bibliothek (links) zu Sitzungen (rechts)."
      },
      upload: {
        title: "Inhalt Hochladen",
        content: `Zwei Optionen:

Datei Hochladen: PDFs, Videos, Dokumente von Ihrem Computer
• Ziehen und ablegen oder klicken zum Durchsuchen
• System füllt Titel automatisch aus und erkennt Typ
• Max. Größe variiert nach Typ

Link Hinzufügen: Externe Ressourcen
• YouTube, Vimeo, Websites, etc.
• URL, Titel und Beschreibung angeben

Inhalt bleibt in Bibliothek, bis er Sitzungen zugewiesen wird.`,
        shortContent: "Laden Sie Dateien hoch oder fügen Sie externe Links zur Bibliothek hinzu."
      },
      assign: {
        title: "Inhalt Sitzungen Zuweisen",
        content: `Drei Methoden:

1. Ziehen und Ablegen: Inhalt klicken, zu Sitzungs-Ablagebereich ziehen
2. Ablagebereich Klicken: Sitzung klicken, Inhalt aus Modal wählen
3. Massenzuweisung: Mehrere Elemente wählen, auf einmal zuweisen

Inhalt kann mehreren Sitzungen zugewiesen werden.

Tipp: In logischer Reihenfolge zuweisen - Intro-Inhalt zuerst, Übungsmaterialien als Nächstes, Bewertungen zuletzt.`,
        shortContent: "Ziehen Sie Inhalt zur Sitzung oder klicken Sie Ablagebereich zum Zuweisen."
      },
      contentTypes: {
        title: "Inhaltstyp-Symbole",
        content: `Video (Blau): Vorlesungen, Demonstrationen, Tutorials
PDF (Rot): Lesungen, Handouts, Referenzmaterialien
Dokument (Grün): Word-Docs, Leitfäden, Anweisungen
Link (Orange): Externe Websites, Ressourcen
Quiz (Indigo): Bewertungen, Übungsfragen
Bild (Rosa): Diagramme, Infografiken, Referenzen
Audio (Lila): Podcasts, Aufnahmen, Audio-Leitfäden

Typ bestimmt, wie Inhalt Studenten angezeigt wird.`,
        shortContent: "7 Typen: Video, PDF, Dok, Link, Quiz, Bild, Audio."
      },
      required: {
        title: "Erforderlicher vs Optionaler Inhalt",
        content: `Erforderlich (rotes Abzeichen): Studenten müssen abschließen, um fortzufahren
Optional (graues Abzeichen): Ergänzendes Material

Als erforderlich markieren:
• Kernkonzepte und wesentliche Fähigkeiten
• Voraussetzungen für spätere Sitzungen
• Bewertete Assessments

Als optional markieren:
• Bereicherungsmaterialien
• Zusätzliche Übung
• Vertiefungsthemen`,
        shortContent: "Erforderlich = muss abschließen. Optional = ergänzend."
      },
      tags: {
        title: "Inhalts-Tags",
        content: `Organisieren und finden Sie Inhalt mit Tags.

Tag nach:
• Fähigkeitslevel (Anfänger, Fortgeschritten, Erweitert)
• Thema (Sicherheit, Techniken, Theorie)
• Typ (Vorlesung, Übung, Referenz)
• Domain-spezifische Kategorien

Tags ermöglichen leistungsstarkes Filtern und Suchen.

Format: Kleinbuchstaben, kommagetrennt
Beispiel: "einführung, video, wichtig"`,
        shortContent: "Etiketten zum Organisieren und Finden von Inhalt."
      },
      search: {
        title: "Inhalt Suchen",
        content: `Finden Sie Inhalt schnell nach:
• Titel oder Beschreibungstext
• Inhaltstyp-Filter
• Tag-Filter
• Zuweisungsstatus (zugewiesen/nicht zugewiesen)

Kombinieren Sie Filter für präzise Ergebnisse.

Tipp: Verwenden Sie beschreibende Titel und Tags, um Inhalt später leicht zu finden.`,
        shortContent: "Suchen Sie nach Text, Typ, Tags oder Zuweisungsstatus."
      },
      emptyLibrary: {
        title: "Fügen Sie Ihren Ersten Inhalt Hinzu",
        content: `Noch kein Inhalt. Laden Sie Ihr erstes Lernmaterial hoch, um zu beginnen.

Was Sie hinzufügen können:
• Videos (MP4, MOV, etc.)
• PDFs (Lesungen, Handouts)
• Dokumente (DOCX, etc.)
• Links (YouTube, Websites)

Inhalt bleibt in Bibliothek, bis er Sitzungen zugewiesen wird.`,
        shortContent: ""
      },
      emptyStructure: {
        title: "Erstellen Sie Zuerst Klassen",
        content: `Keine Klassen verfügbar. Sie müssen Ihre Kursstruktur (Klassen und Sitzungen) erstellen, bevor Sie Inhalt zuweisen können.

Gehen Sie zum Timeline-Editor, um Ihre Kursstruktur aufzubauen.`,
        shortContent: ""
      }
    },
    
    objectives: {
      main: {
        title: "Lernziele Verstehen",
        content: `Lernziele definieren genau, was Studenten meistern müssen.

Jedes Ziel beinhaltet:
1. Was Studenten tun (Kognitiv: Erinnern → Erschaffen)
2. Was Studenten lernen (Wissen: Faktisch → Metakognitiv)
3. Erfolgskriterien (Wie wir Meisterschaft messen)
4. Meisterschaftsschwelle (Mindestleistung für Kompetenz)

Vorteile:
✓ Klare Erwartungen für Studenten
✓ Gezielte Bewertungen
✓ Genaue Fortschrittsverfolgung
✓ Nachweis der Meisterschaft, nicht nur des Abschlusses`,
        shortContent: "Definieren Sie, was Studenten mit Bloom's Taxonomie meistern müssen."
      },
      bloomMatrix: {
        title: "Bloom-Taxonomie Erklärt",
        content: `4×6-Matrix kombiniert:

Kognitive Dimensionen (was Studenten TUN):
• Erinnern: Fakten abrufen
• Verstehen: Ideen erklären
• Anwenden: In neuen Situationen verwenden
• Analysieren: Zerlegen und untersuchen
• Bewerten: Urteile fällen
• Erschaffen: Neue Ideen generieren

Wissensdimensionen (was Studenten LERNEN):
• Faktisch: Grundlegende Fakten, Terminologie
• Konzeptionell: Prinzipien, Theorien
• Prozedural: Techniken, Methoden
• Metakognitiv: Selbstbewusstsein, Strategien

Jedes Ziel wird in eine der 24 Zellen klassifiziert.`,
        shortContent: "6 kognitive Ebenen × 4 Wissenstypen = 24 Kompetenz-Zellen."
      },
      addObjective: {
        title: "Lernziele Erstellen",
        content: `Format: [Kognitives Verb] + [Wissenstyp] + [Kontext]

Beispiel: "Studenten werden in der Lage sein, angemessene Messerhandhabungsverfahren in einer professionellen Küchenumgebung zu demonstrieren."

Schritte:
1. Zielaussage schreiben
2. Mit KI klassifizieren (oder manuell)
3. Erfolgskriterien definieren
4. Meisterschaftsschwelle festlegen
5. Als erforderlich markieren, falls nötig`,
        shortContent: "Schreiben Sie klare, messbare Ziele mit Aktionsverben."
      },
      classifyAI: {
        title: "KI-Klassifizierung",
        content: `KI analysiert Ihren Zieltext und schlägt vor:
• Kognitive Dimension (Erinnern → Erschaffen)
• Wissensdimension (Faktisch → Metakognitiv)
• Vertrauensscore (60-100%)
• Begründungserklärung

Überprüfen Sie den Vorschlag und akzeptieren oder überschreiben Sie ihn.

Hohes Vertrauen (90-100%): Starke Übereinstimmung, wahrscheinlich korrekt
Mittel (75-89%): Vernünftiger Vorschlag, überprüfen
Niedrig (60-74%): Schwache Übereinstimmung, manuelle Klassifizierung erwägen`,
        shortContent: "KI schlägt Bloom-Klassifizierung vor. Überprüfen und akzeptieren/überschreiben."
      },
      successCriteria: {
        title: "Erfolgskriterien",
        content: `Spezifische, messbare Indikatoren, die Meisterschaft demonstrieren.

Richtlinien:
• Spezifisch: Genau was demonstriert werden muss
• Messbar: Kann beobachtet und bewertet werden
• Beobachtbar: Coach/Instructor kann verifizieren
• Erreichbar: Im Rahmen des Lernens

Beispiel für "Messersicherheit anwenden":
✓ "Richtigen Griff mit Fingern nach unten gebogen verwenden"
✓ "Stabile Schneidebrettposition beibehalten"
✓ "Aufgabe ohne Verletzung abschließen"
✗ "Sicher machen" (zu vage)

Fügen Sie 2-4 Kriterien pro Ziel hinzu.`,
        shortContent: "2-4 spezifische, messbare Indikatoren der Meisterschaft."
      },
      masteryThreshold: {
        title: "Meisterschaftsschwelle",
        content: `Mindestscore (60-100%) erforderlich, um Meisterschaft zu demonstrieren.

Empfehlungen:
• 90-100%: Sicherheitskritische Fähigkeiten, Kernfundamente
• 80-90%: Standard-prozedurale Fähigkeiten
• 70-80%: Komplexe Integrationsaufgaben
• 60-70%: Kreative/offene Arbeit

Studenten müssen Schwelle erreichen, um fortzufahren.

Tipp: Höhere Schwellen für grundlegende Fähigkeiten, niedrigere für erweiterte kreative Arbeit.`,
        shortContent: "Mindestscore (60-100%) erforderlich zum Fortschreiten."
      },
      requiredProgression: {
        title: "Erforderlich für Fortschritt",
        content: `Schalter bestimmt, ob Studenten dieses Ziel meistern müssen, um fortzufahren.

Erforderlich: Student kann nicht auf spätere Sitzungen zugreifen, bis gemeistert
Optional: Student kann fortfahren, aber Ziel wird noch verfolgt

Als erforderlich markieren:
• Kernkompetenzen
• Sicherheitskritische Fähigkeiten
• Voraussetzungen für spätere Arbeit

Als optional markieren:
• Bereicherungsziele
• Erweiterte Herausforderungen
• Nice-to-have Fähigkeiten`,
        shortContent: "Muss meistern, bevor zur nächsten Sitzung fortgefahren werden kann."
      },
      cognitiveLevel: {
        title: "Kognitive Dimension",
        content: `Welchen mentalen Prozess Studenten ausführen:

Erinnern (Grau): Fakten aus dem Gedächtnis abrufen
Verstehen (Blau): Bedeutung aus Informationen konstruieren
Anwenden (Grün): Verfahren in gegebenen Situationen verwenden
Analysieren (Gelb): In Teile zerlegen, Beziehungen finden
Bewerten (Orange): Urteile basierend auf Kriterien fällen
Erschaffen (Lila): Elemente zu etwas Neuem zusammenfügen

Kursprogression: Niedrig beginnen (Erinnern/Verstehen), zu hoch aufbauen (Erschaffen).`,
        shortContent: "Mentaler Prozess: Erinnern → Verstehen → Anwenden → Analysieren → Bewerten → Erschaffen"
      },
      knowledgeDimension: {
        title: "Wissensdimension",
        content: `Welche Art von Wissen Studenten erwerben:

Faktisch: Terminologie, spezifische Details, grundlegende Elemente
Konzeptionell: Kategorien, Prinzipien, Theorien, Strukturen
Prozedural: Wie man etwas macht - Techniken, Methoden, Fähigkeiten
Metakognitiv: Selbstwissen, Reflexion, Lernstrategien

Berufsausbildung konzentriert sich stark auf Prozedural, benötigt aber alle Typen.`,
        shortContent: "Wissenstyp: Faktisch, Konzeptionell, Prozedural, oder Metakognitiv"
      },
      emptyState: {
        title: "Fügen Sie Ihr Erstes Lernziel Hinzu",
        content: `Noch keine Lernziele. Definieren Sie, was Studenten in dieser Sitzung meistern müssen.

Ziele sollten sein:
• Spezifisch und messbar
• Mit Sitzungsinhalt ausgerichtet
• Mit Bloom-Taxonomie klassifiziert
• Klare Erfolgskriterien einschließen

Klicken Sie auf "Ziel Hinzufügen", um zu beginnen.`,
        shortContent: ""
      }
    }
  }
}

/**
 * Helper function to get help content
 * @param section - The section (dashboard, timeline, content, objectives)
 * @param item - The specific help item
 * @param language - The language code (en, fr, de)
 * @returns The help item or falls back to English
 */
export function getHelp(
  section: keyof HelpContent,
  item: string,
  language: 'en' | 'fr' | 'de' = 'en'
): HelpItem {
  const content = helpContent[language]?.[section]?.[item] || helpContent.en[section][item]
  
  if (!content) {
    console.warn(`Help content not found for: ${section}.${item} in ${language}`)
    return {
      title: 'Help Not Available',
      content: 'This help content is not yet available. Please check back later.'
    }
  }
  
  return content
}

/**
 * Get short content for tooltips (if available, otherwise returns full content)
 */
export function getShortHelp(
  section: keyof HelpContent,
  item: string,
  language: 'en' | 'fr' | 'de' = 'en'
): string {
  const helpItem = getHelp(section, item, language)
  return helpItem.shortContent || helpItem.content
}
