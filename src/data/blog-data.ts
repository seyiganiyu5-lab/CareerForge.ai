export type BlogBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string; level?: 2 | 3 }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'callout'; variant: 'info' | 'tip' | 'warning'; title?: string; text: string }
  | { type: 'quote'; text: string; author?: string }
  | { type: 'image'; alt: string; caption?: string }
  | { type: 'code'; language: string; code: string }
  | { type: 'steps'; steps: { title: string; description: string }[] };

export interface BlogCategory {
  slug: string;
  content: { en: { name: string }; fr: { name: string } };
}

export interface BlogAuthor {
  name: string;
  role: string;
  bio: { en: string; fr: string };
}

export interface BlogPost {
  slug: string;
  category: string;
  featured: boolean;
  author: BlogAuthor;
  date: string;
  seo: {
    en: { title?: string; description: string; keywords: string[] };
    fr: { title?: string; description: string; keywords: string[] };
  };
  content: {
    en: { title: string; description: string; readingTime: number; body: BlogBlock[] };
    fr: { title: string; description: string; readingTime: number; body: BlogBlock[] };
  };
}

export const blogCategories: BlogCategory[] = [
  { slug: 'career-advice', content: { en: { name: 'Career Advice' }, fr: { name: 'Conseils de Carrière' } } },
  { slug: 'resume-tips', content: { en: { name: 'Resume Tips' }, fr: { name: 'Conseils CV' } } },
  { slug: 'cover-letters', content: { en: { name: 'Cover Letters' }, fr: { name: 'Lettres de Motivation' } } },
  { slug: 'interview-prep', content: { en: { name: 'Interview Preparation' }, fr: { name: 'Préparation Entretien' } } },
  { slug: 'ai-technology', content: { en: { name: 'AI & Technology' }, fr: { name: 'IA et Technologie' } } },
  { slug: 'job-search', content: { en: { name: 'Job Search' }, fr: { name: 'Recherche d\'Emploi' } } },
  { slug: 'remote-work', content: { en: { name: 'Remote Work' }, fr: { name: 'Télétravail' } } },
  { slug: 'career-growth', content: { en: { name: 'Career Growth' }, fr: { name: 'Évolution Professionnelle' } } },
  { slug: 'product-updates', content: { en: { name: 'Product Updates' }, fr: { name: 'Mises à Jour' } } },
  { slug: 'announcements', content: { en: { name: 'Announcements' }, fr: { name: 'Annonces' } } },
];

const authors: Record<string, BlogAuthor> = {
  sarah: { name: 'Sarah Chen', role: 'Content Lead', bio: { en: 'Sarah leads the content team at CareerForge AI, helping job seekers create compelling career documents.', fr: 'Sarah dirige l\'équipe de contenu chez CareerForge AI, aidant les chercheurs d\'emploi à créer des documents de carrière convaincants.' } },
  marcus: { name: 'Marcus Johnson', role: 'Career Expert', bio: { en: 'Marcus is a career strategist with 10+ years of experience helping professionals advance their careers.', fr: 'Marcus est un stratège de carrière avec plus de 10 ans d\'expérience aidant les professionnels à faire avancer leur carrière.' } },
  aminata: { name: 'Aminata Diallo', role: 'Support Specialist', bio: { en: 'Aminata ensures every CareerForge AI user has a smooth experience and gets the help they need.', fr: 'Aminata veille à ce que chaque utilisateur de CareerForge AI ait une expérience fluide.' } },
};

export const blogPosts: BlogPost[] = [
  {
    slug: 'build-ats-friendly-resume-2025', category: 'resume-tips', featured: true, author: authors.sarah, date: '2025-07-01',
    seo: { en: { description: 'Learn how to build a resume that passes ATS systems and gets noticed by recruiters in 2025.', keywords: ['ATS', 'resume', '2025', 'tips'] }, fr: { description: 'Apprenez à créer un CV qui passe les systèmes ATS et est remarqué par les recruteurs en 2025.', keywords: ['ATS', 'CV', '2025', 'conseils'] } },
    content: {
      en: { title: 'How to Build an ATS-Friendly Resume in 2025', description: 'The complete guide to creating resumes that pass automated screening and land interviews.', readingTime: 8, body: [
        { type: 'paragraph', text: 'In 2025, over 98% of large companies use Applicant Tracking Systems (ATS) to screen resumes before a human ever sees them. If your resume isn\'t ATS-friendly, it might never reach a hiring manager — no matter how qualified you are.' },
        { type: 'heading', text: 'What Makes a Resume ATS-Friendly?', level: 2 },
        { type: 'paragraph', text: 'An ATS-friendly resume is one that can be easily parsed, read, and scored by automated software. The key principles are surprisingly simple but often overlooked by job seekers.' },
        { type: 'list', items: ['Use a clean, single-column layout without complex graphics', 'Choose standard section headings: "Work Experience," "Education," "Skills"', 'Use standard fonts like Arial, Calibri, or Georgia', 'Save and submit as a text-based PDF (not an image-based scan)', 'Include relevant keywords from the job description naturally throughout your resume'] },
        { type: 'heading', text: 'The Keyword Strategy', level: 2 },
        { type: 'paragraph', text: 'Keywords are the single most important factor in ATS scoring. The system matches your resume against the job description and scores you based on keyword density and relevance.' },
        { type: 'callout', variant: 'tip', title: 'Pro Tip', text: 'Don\'t just copy-paste keywords. Use them naturally in context. For example, instead of listing "project management" as a standalone skill, write "Led cross-functional project management initiatives that delivered 3 products on time and under budget."' },
        { type: 'heading', text: 'Common ATS Mistakes to Avoid', level: 2 },
        { type: 'list', items: ['Using tables, text boxes, or columns that confuse the parser', 'Including headers/footers with page numbers that might merge with content', 'Using non-standard file formats (some ATS can\'t read .docx properly)', 'Submitting resumes with photos or graphics embedded', 'Using creative section names like "My Journey" instead of "Work Experience"'] },
        { type: 'heading', text: 'How CareerForge AI Helps', level: 2 },
        { type: 'paragraph', text: 'CareerForge AI is built with ATS compatibility at its core. Every template we offer is tested against popular ATS systems. Our AI-powered tools analyze job descriptions in real-time and help you optimize your resume with the right keywords, structure, and content.' },
        { type: 'quote', text: 'The best resume isn\'t the most creative one — it\'s the one that gets past the gatekeeper and into the hands of a real person.', author: 'CareerForge AI Team' },
        { type: 'paragraph', text: 'Start building your ATS-friendly resume today with CareerForge AI. Our platform guides you through every step and ensures your resume meets the standards that modern hiring systems demand.' },
      ]},
      fr: { title: 'Comment Créer un CV Compatible ATS en 2025', description: 'Le guide complet pour créer des CV qui passent le filtrage automatisé et décrochent des entretiens.', readingTime: 8, body: [
        { type: 'paragraph', text: 'En 2025, plus de 98 % des grandes entreprises utilisent des systèmes de suivi des candidats (ATS) pour filtrer les CV. Si votre CV n\'est pas compatible ATS, il pourrait ne jamais atteindre un responsable du recrutement.' },
        { type: 'heading', text: 'Qu\'est-ce qu\'un CV Compatible ATS ?', level: 2 },
        { type: 'list', items: ['Utilisez une mise en page propre et en colonne unique', 'Choisissez des titres de section standards', 'Utilisez des polices standardes comme Arial, Calibri ou Georgia', 'Enregistrez et soumettez en PDF basé sur le texte', 'Incluez des mots-clés pertinents de la description d\'emploi'] },
        { type: 'heading', text: 'La Stratégie des Mots-Clés', level: 2 },
        { type: 'callout', variant: 'tip', title: 'Conseil Pro', text: 'N\'utilisez pas de copier-coller de mots-clés. Utilisez-les naturellement dans le contexte pour montrer votre expérience réelle.' },
        { type: 'heading', text: 'Erreurs Courantes à Éviter', level: 2 },
        { type: 'list', items: ['Utilisation de tableaux ou de colonnes qui confondent l\'analyseur', 'En-têtes/pieds de page qui pourraient fusionner avec le contenu', 'Formats de fichiers non standards', 'CV avec des photos ou graphiques intégrés', 'Noms de section créatifs au lieu de noms standards'] },
        { type: 'heading', text: 'Comment CareerForge AI Aide', level: 2 },
        { type: 'paragraph', text: 'CareerForge AI est conçu avec la compatibilité ATS au cœur. Chaque modèle est testé contre les systèmes ATS populaires.' },
        { type: 'quote', text: 'Le meilleur CV n\'est pas le plus créatif — c\'est celui qui passe le gardien et arrive entre les mains d\'une vraie personne.', author: 'Équipe CareerForge AI' },
      ]},
    }
  },
  {
    slug: '10-resume-mistakes-cost-interview', category: 'resume-tips', featured: false, author: authors.marcus, date: '2025-06-28',
    seo: { en: { description: 'The top 10 resume mistakes that could be costing you interviews and how to fix them.', keywords: ['resume mistakes', 'interview', 'errors', 'fix'] }, fr: { description: 'Les 10 erreurs de CV qui pourraient vous coûter des entretiens et comment les corriger.', keywords: ['erreurs CV', 'entretien', 'corriger'] } },
    content: {
      en: { title: '10 Resume Mistakes That Could Cost You the Interview', description: 'Avoid these common pitfalls that send your resume straight to the rejection pile.', readingTime: 7, body: [
        { type: 'paragraph', text: 'Your resume has about 6-7 seconds to make an impression. Make sure you\'re not making these critical mistakes that could be costing you interviews.' },
        { type: 'heading', text: '1. Using a Generic Objective Statement', level: 3 },
        { type: 'paragraph', text: 'Replace vague objectives like "Seeking a challenging position" with a targeted professional summary that highlights your specific value proposition and career goals.' },
        { type: 'heading', text: '2. Listing Duties Instead of Achievements', level: 3 },
        { type: 'paragraph', text: 'Don\'t just describe what you did — show the impact. Use numbers and metrics: "Increased sales by 25%" is far more compelling than "Responsible for sales."' },
        { type: 'heading', text: '3. Poor Formatting', level: 3 },
        { type: 'paragraph', text: 'Inconsistent fonts, spacing, and alignment make your resume look unprofessional. Use a clean, consistent template like those available on CareerForge AI.' },
        { type: 'heading', text: '4. Including Irrelevant Information', level: 3 },
        { type: 'paragraph', text: 'Every line of your resume should earn its place. Remove outdated skills, unrelated jobs from 15+ years ago, and personal information like marital status or photo.' },
        { type: 'heading', text: '5. Typos and Grammatical Errors', level: 3 },
        { type: 'callout', variant: 'warning', text: 'A single typo can be enough for a recruiter to discard your resume. Always proofread carefully, and use tools like CareerForge AI\'s built-in review feature.' },
        { type: 'heading', text: '6. Missing Keywords', level: 3 },
        { type: 'paragraph', text: 'If your resume doesn\'t contain the keywords from the job description, the ATS will rank it low. Always tailor your resume to each position.' },
        { type: 'heading', text: '7-10: More Common Mistakes', level: 3 },
        { type: 'list', items: ['7. Making it too long (stick to 1-2 pages for most professionals)', '8. Using buzzwords without context ("synergy," "go-getter," "team player")', '9. Not including a LinkedIn profile or portfolio link', '10. Failing to quantify your impact with numbers and metrics'] },
        { type: 'paragraph', text: 'The good news? CareerForge AI helps you avoid all of these mistakes automatically. Our AI-powered tools analyze your content in real-time and suggest improvements as you write.' },
      ]},
      fr: { title: '10 Erreurs de CV Qui Could Vous Coûter l\'Entretien', description: 'Évitez ces pièges courants qui envoient votre CV directement à la pile des rejets.', readingTime: 7, body: [
        { type: 'paragraph', text: 'Votre CV a environ 6-7 secondes pour faire une impression. Assurez-vous de ne pas commettre ces erreurs critiques.' },
        { type: 'heading', text: '1. Utiliser un Énoncé d\'Objectif Générique', level: 3 },
        { type: 'paragraph', text: 'Remplacez les objectifs vagues par un résumé professionnel ciblé qui met en valeur votre proposition de valeur spécifique.' },
        { type: 'heading', text: '2. Énumérer des Tâches au Lieu de Réalisations', level: 3 },
        { type: 'paragraph', text: 'Ne décrivez pas seulement ce que vous avez fait — montrez l\'impact. Utilisez des chiffres : "Augmenté les ventes de 25 %" est bien plus convaincant.' },
        { type: 'heading', text: '3. Mauvais Formatage', level: 3 },
        { type: 'paragraph', text: 'Des polices, espacements et alignements incohérents donnent une impression non professionnelle. Utilisez un modèle propre et cohérent.' },
        { type: 'heading', text: '4. Inclure des Informations Irrelevantes', level: 3 },
        { type: 'paragraph', text: 'Chaque ligne de votre CV devrait mériter sa place. Supprimez les compétences obsolètes et les informations personnelles.' },
        { type: 'heading', text: '5. Fautes de Frappe et Erreurs Grammaticales', level: 3 },
        { type: 'callout', variant: 'warning', text: 'Une seule faute de frappe peut suffire à un recruteur pour écarter votre CV. Relisez toujours attentivement.' },
        { type: 'heading', text: '6. Mots-Clés Manquants', level: 3 },
        { type: 'paragraph', text: 'Si votre CV ne contient pas les mots-clés de la description d\'emploi, l\'ATS le classera bas. Adaptez toujours votre CV à chaque poste.' },
        { type: 'heading', text: '7-10 : Autres Erreurs Courantes', level: 3 },
        { type: 'list', items: ['7. CV trop long (limitez-vous à 1-2 pages)', '8. Utilisation de mots à la mode sans contexte', '9. Ne pas inclure de lien LinkedIn ou portfolio', '10. Ne pas quantifier votre impact avec des chiffres'] },
      ]},
    }
  },
  {
    slug: 'ai-transforming-cover-letter-writing', category: 'ai-technology', featured: true, author: authors.sarah, date: '2025-06-25',
    seo: { en: { description: 'How artificial intelligence is revolutionizing cover letter writing for job seekers.', keywords: ['AI', 'cover letter', 'writing', 'technology'] }, fr: { description: 'Comment l\'intelligence artificielle révolutionne la rédaction de lettres de motivation.', keywords: ['IA', 'lettre de motivation', 'rédaction', 'technologie'] } },
    content: {
      en: { title: 'How AI is Transforming Cover Letter Writing', description: 'The future of personalized job applications is here — and it\'s powered by AI.', readingTime: 6, body: [
        { type: 'paragraph', text: 'Gone are the days of spending hours crafting cover letters from scratch. AI-powered tools like CareerForge AI are transforming how job seekers approach one of the most time-consuming parts of the application process.' },
        { type: 'heading', text: 'The Problem with Traditional Cover Letters', level: 2 },
        { type: 'paragraph', text: 'Research shows that 63% of hiring managers consider cover letters important, yet most job seekers either skip them entirely or submit generic letters that hurt more than they help. The main challenges include:' },
        { type: 'list', items: ['Time: Writing a tailored letter for each application takes 30-60 minutes', 'Personalization: Balancing personal voice with professional tone is difficult', 'Relevance: Connecting your specific experience to each job\'s requirements', 'Fatigue: After writing dozens of letters, quality inevitably drops'] },
        { type: 'heading', text: 'How AI Solves These Challenges', level: 2 },
        { type: 'paragraph', text: 'Modern AI cover letter generators analyze both your resume and the target job description to produce letters that are genuinely personalized and relevant.' },
        { type: 'callout', variant: 'info', title: 'How CareerForge AI Works', text: 'Our AI reads your complete professional profile and the job requirements, then generates a cover letter that highlights your most relevant achievements and skills for that specific position. It\'s not a template — it\'s a custom-written letter.' },
        { type: 'heading', text: 'Best Practices for AI-Generated Cover Letters', level: 2 },
        { type: 'list', items: ['Always review and personalize the generated letter', 'Add specific examples and anecdotes from your experience', 'Mention the company by name and reference something specific about them', 'Keep the letter focused and concise — one page maximum', 'End with a confident call to action'] },
        { type: 'quote', text: 'AI doesn\'t replace your voice — it amplifies it. The best AI-generated cover letters are ones where the human adds the finishing touches that make it truly personal.', author: 'Sarah Chen, Content Lead at CareerForge AI' },
      ]},
      fr: { title: 'Comment l\'IA Transforme la Rédaction de Lettres de Motivation', description: 'L\'avenir des candidatures personnalisées est là — et il est alimenté par l\'IA.', readingTime: 6, body: [
        { type: 'paragraph', text: 'L\'époque où il fallait passer des heures à rédiger des lettres de motivation de zéro est révolue. Les outils alimentés par l\'IA comme CareerForge AI transforment la façon dont les chercheurs d\'emploi abordent l\'une des parties les plus chronophages du processus de candidature.' },
        { type: 'heading', text: 'Le Problème des Lettres de Motivation Traditionnelles', level: 2 },
        { type: 'list', items: ['Temps : Rédiger une lettre personnalisée prend 30 à 60 minutes', 'Personnalisation : Équilibrer voix personnelle et ton professionnel est difficile', 'Pertinence : Connecter votre expérience spécifique aux exigences de chaque poste', 'Fatigue : Après des dizaines de lettres, la qualité diminue inévitablement'] },
        { type: 'heading', text: 'Comment l\'IA Résout Ces Défis', level: 2 },
        { type: 'paragraph', text: 'Les générateurs modernes de lettres de motivation IA analysent votre CV et la description d\'emploi cible pour produire des lettres véritablement personnalisées et pertinentes.' },
        { type: 'callout', variant: 'info', title: 'Comment Fonctionne CareerForge AI', text: 'Notre IA lit votre profil professionnel complet et les exigences du poste, puis génère une lettre qui met en valeur vos réalisations les plus pertinentes.' },
        { type: 'heading', text: 'Bonnes Pratiques pour les Lettres Générées par l\'IA', level: 2 },
        { type: 'list', items: ['Vérifiez et personnalisez toujours la lettre générée', 'Ajoutez des exemples spécifiques de votre expérience', 'Mentionnez l\'entreprise par nom', 'Gardez la lettre concentrée et concise', 'Terminez par un appel à l\'action confiant'] },
      ]},
    }
  },
  {
    slug: 'getting-started-careerforge-guide', category: 'product-updates', featured: false, author: authors.aminata, date: '2025-06-20',
    seo: { en: { description: 'A complete guide to getting started with CareerForge AI.', keywords: ['getting started', 'guide', 'tutorial', 'setup'] }, fr: { description: 'Un guide complet pour démarrer avec CareerForge AI.', keywords: ['premiers pas', 'guide', 'tutoriel', 'configuration'] } },
    content: {
      en: { title: 'Getting Started with CareerForge AI: A Complete Guide', description: 'Everything you need to know to make the most of our AI-powered career platform.', readingTime: 6, body: [
        { type: 'paragraph', text: 'Welcome to CareerForge AI! Whether you\'re a fresh graduate or an experienced professional, our platform has everything you need to create standout application materials. This guide walks you through every feature.' },
        { type: 'heading', text: 'Step 1: Create Your Account', level: 2 },
        { type: 'paragraph', text: 'Sign up in seconds with your email, Google, or Apple account. After email verification, you\'ll be guided through a quick onboarding process to set up your career profile.' },
        { type: 'heading', text: 'Step 2: Build Your First Resume', level: 2 },
        { type: 'paragraph', text: 'Our AI Resume Builder guides you section by section. Enter your experience, and our AI suggests improvements in real-time. Choose from professionally designed templates, all tested for ATS compatibility.' },
        { type: 'heading', text: 'Step 3: Generate Cover Letters', level: 2 },
        { type: 'paragraph', text: 'Paste a job description, and our AI generates a personalized cover letter based on your resume. Review, edit, and export — it\'s that simple.' },
        { type: 'heading', text: 'Step 4: Check ATS Compatibility', level: 2 },
        { type: 'paragraph', text: 'Use our ATS Checker to scan your resume against any job description. Get an instant compatibility score with specific suggestions for improvement.' },
        { type: 'callout', variant: 'tip', text: 'Free users can create 1 resume and up to 3 cover letters. Upgrade to Pro for unlimited access to all features including the job tracker and advanced AI tools.' },
      ]},
      fr: { title: 'Démarrer avec CareerForge AI : Guide Complet', description: 'Tout ce que vous devez savoir pour tirer le meilleur parti de notre plateforme de carrière.', readingTime: 6, body: [
        { type: 'paragraph', text: 'Bienvenue sur CareerForge AI ! Que vous soyez un jeune diplômé ou un professionnel expérimenté, notre plateforme a tout ce dont vous avez besoin.' },
        { type: 'heading', text: 'Étape 1 : Créez Votre Compte', level: 2 },
        { type: 'paragraph', text: 'Inscrivez-vous en quelques secondes avec votre e-mail, Google ou Apple. Après vérification, vous serez guidé pour configurer votre profil de carrière.' },
        { type: 'heading', text: 'Étape 2 : Créez Votre Premier CV', level: 2 },
        { type: 'paragraph', text: 'Notre Constructeur de CV IA vous guide section par section. Notre IA suggère des améliorations en temps réel.' },
        { type: 'heading', text: 'Étape 3 : Générez des Lettres de Motivation', level: 2 },
        { type: 'paragraph', text: 'Collez une description d\'emploi et notre IA génère une lettre de motivation personnalisée basée sur votre CV.' },
        { type: 'heading', text: 'Étape 4 : Vérifiez la Compatibilité ATS', level: 2 },
        { type: 'callout', variant: 'tip', text: 'Les utilisateurs gratuits peuvent créer 1 CV et jusqu\'à 3 lettres de motivation. Passez à Pro pour un accès illimité.' },
      ]},
    }
  },
  {
    slug: 'interview-tips-from-hiring-managers', category: 'interview-prep', featured: false, author: authors.marcus, date: '2025-06-22',
    seo: { en: { description: 'Interview preparation tips gathered from real hiring managers.', keywords: ['interview', 'preparation', 'tips', 'hiring managers'] }, fr: { description: 'Conseils de préparation aux entretiens recueillis auprès de vrais recruteurs.', keywords: ['entretien', 'préparation', 'conseils', 'recruteurs'] } },
    content: {
      en: { title: 'Interview Preparation Tips from Hiring Managers', description: 'What hiring managers actually want to see — straight from the source.', readingTime: 7, body: [
        { type: 'paragraph', text: 'We interviewed dozens of hiring managers across industries to find out what really makes a candidate stand out. Here are their top tips.' },
        { type: 'heading', text: 'Before the Interview', level: 2 },
        { type: 'list', items: ['Research the company thoroughly — recent news, products, culture, and mission', 'Review the job description and prepare 5-7 specific examples from your experience', 'Practice your answers out loud, not just in your head', 'Prepare thoughtful questions to ask the interviewer', 'Test your technology if it\'s a virtual interview'] },
        { type: 'heading', text: 'During the Interview', level: 2 },
        { type: 'paragraph', text: 'The STAR method (Situation, Task, Action, Result) remains the gold standard for answering behavioral questions. Structure your responses clearly:' },
        { type: 'steps', steps: [
          { title: 'Situation', description: 'Set the scene with brief context' },
          { title: 'Task', description: 'Explain what you needed to accomplish' },
          { title: 'Action', description: 'Describe the specific steps you took' },
          { title: 'Result', description: 'Share the outcome with quantifiable metrics' }
        ]},
        { type: 'heading', text: 'What Hiring Managers Hate', level: 2 },
        { type: 'list', items: ['Vague answers without specific examples', 'Speaking negatively about previous employers', 'Not having questions prepared', 'Rambling instead of being concise', 'Failing to connect their experience to the role'] },
        { type: 'quote', text: 'The best candidates don\'t just answer our questions — they show us how they think, solve problems, and communicate. That\'s what we\'re really evaluating.', author: 'Hiring Manager, Tech Industry' },
      ]},
      fr: { title: 'Conseils de Préparation aux Entretiens de Recruteurs', description: 'Ce que les recruteurs veulent vraiment voir — directement de la source.', readingTime: 7, body: [
        { type: 'paragraph', text: 'Nous avons interviewé des dizaines de recruteurs pour découvrir ce qui fait vraiment la différence chez un candidat.' },
        { type: 'heading', text: 'Avant l\'Entretien', level: 2 },
        { type: 'list', items: ['Recherchez l\'entreprise en profondeur', 'Examinez la description d\'emploi et préparez 5 à 7 exemples spécifiques', 'Pratiquez vos réponses à voix haute', 'Préparez des questions réfléchies à poser au recruteur', 'Testez votre technologie pour un entretien virtuel'] },
        { type: 'heading', text: 'Pendant l\'Entretien', level: 2 },
        { type: 'steps', steps: [
          { title: 'Situation', description: 'Décrivez brièvement le contexte' },
          { title: 'Tâche', description: 'Expliquez ce que vous deviez accomplir' },
          { title: 'Action', description: 'Décrivez les étapes spécifiques que vous avez prises' },
          { title: 'Résultat', description: 'Partagez le résultat avec des métriques quantifiables' }
        ]},
        { type: 'heading', text: 'Ce que les Recruteurs Détestent', level: 2 },
        { type: 'list', items: ['Réponses vagues sans exemples spécifiques', 'Parler négativement des employeurs précédents', 'Ne pas avoir de questions préparées', 'Divaguer au lieu d\'être concis', 'Ne pas relier leur expérience au poste'] },
      ]},
    }
  },
  {
    slug: 'complete-guide-remote-job-applications', category: 'remote-work', featured: false, author: authors.marcus, date: '2025-06-18',
    seo: { en: { description: 'Everything you need to know about applying for remote jobs successfully.', keywords: ['remote', 'job application', 'remote work', 'tips'] }, fr: { description: 'Tout ce que vous devez savoir sur les candidatures à des emplois en télétravail.', keywords: ['télétravail', 'candidature', 'conseils'] } },
    content: {
      en: { title: 'The Complete Guide to Remote Job Applications', description: 'Stand out in the competitive remote job market with these proven strategies.', readingTime: 7, body: [
        { type: 'paragraph', text: 'Remote work has become the norm for many industries, and competition for remote positions is fiercer than ever. Here\'s how to make your application stand out.' },
        { type: 'heading', text: 'Tailor Your Resume for Remote Work', level: 2 },
        { type: 'list', items: ['Highlight remote-relevant skills: self-motivation, communication, time management', 'Include experience with remote collaboration tools (Slack, Zoom, Notion, etc.)', 'Mention any previous remote work experience prominently', 'Show results and outcomes, not just activities — remote employers value output over hours'] },
        { type: 'heading', text: 'Remote-Specific Cover Letter Tips', level: 2 },
        { type: 'paragraph', text: 'Your cover letter should explicitly address why you\'re a great fit for remote work. Demonstrate your ability to work independently, manage your time effectively, and communicate proactively in a virtual environment.' },
        { type: 'callout', variant: 'tip', text: 'Mention your home office setup if you have one. Employers want to know you have a dedicated, professional workspace.' },
        { type: 'heading', text: 'Preparing for Remote Interviews', level: 2 },
        { type: 'list', items: ['Test your camera, microphone, and internet connection beforehand', 'Choose a quiet, well-lit background — a clean, professional setting', 'Dress professionally from head to toe (even if they can only see your top half)', 'Have notes ready, but don\'t read from them — use bullet points as memory aids', 'Engage actively and show enthusiasm through your camera presence'] },
      ]},
      fr: { title: 'Le Guide Complet des Candidatures en Télétravail', description: 'Démarquez-vous sur le marché concurrentiel du télétravail avec ces stratégies éprouvées.', readingTime: 7, body: [
        { type: 'paragraph', text: 'Le télétravail est devenu la norme pour de nombreuses industries, et la concurrence pour les postes à distance est plus féroce que jamais.' },
        { type: 'heading', text: 'Adaptez Votre CV pour le Télétravail', level: 2 },
        { type: 'list', items: ['Mettez en valeur les compétences pertinentes : autonomie, communication, gestion du temps', 'Incluez l\'expérience avec les outils de collaboration à distance', 'Mentionnez toute expérience de télétravail précédente', 'Montrez des résultats et des résultats concrets'] },
        { type: 'heading', text: 'Conseils de Lettre de Motivation pour le Télétravail', level: 2 },
        { type: 'paragraph', text: 'Votre lettre de motivation doit expliquer explicitement pourquoi vous êtes un excellent candidat pour le télétravail.' },
        { type: 'callout', variant: 'tip', text: 'Mentionnez votre configuration de bureau à domicile si vous en avez un.' },
        { type: 'heading', text: 'Préparer les Entretiens à Distance', level: 2 },
        { type: 'list', items: ['Testez votre caméra, microphone et connexion internet', 'Choisissez un arrière-plan calme et bien éclairé', 'Habillez-vous professionnellement', 'Ayez des notes prêtes', "Montrez de l'enthousiasme"]},
      ]},
    }
  },
  {
    slug: 'customize-resume-templates-impact', category: 'resume-tips', featured: false, author: authors.sarah, date: '2025-06-15',
    seo: { en: { description: 'How to customize resume templates for maximum visual impact.', keywords: ['template', 'customize', 'design', 'visual impact'] }, fr: { description: 'Comment personnaliser les modèles de CV pour un impact visuel maximal.', keywords: ['modèle', 'personnaliser', 'design', 'impact visuel'] } },
    content: {
      en: { title: 'How to Customize Resume Templates for Maximum Impact', description: 'Transform any template into a standout resume with these customization strategies.', readingTime: 5, body: [
        { type: 'paragraph', text: 'A great resume template is a starting point, not a finished product. The most effective resumes are those that are thoughtfully customized to reflect both the applicant and the target role.' },
        { type: 'heading', text: 'Color Strategy', level: 2 },
        { type: 'paragraph', text: 'Color is one of the most impactful customization options. Use it strategically to draw attention to key sections without overwhelming the reader.' },
        { type: 'list', items: ['Use 1-2 accent colors maximum for a professional look', 'Match colors to the industry (tech: blue, creative: warm tones, finance: navy/grey)', 'Use color for section headings, divider lines, and icons', 'Ensure sufficient contrast for readability in both print and digital formats'] },
        { type: 'heading', text: 'Font Selection', level: 2 },
        { type: 'paragraph', text: 'Your font choice communicates professionalism. Pair a strong heading font with a clean body font. CareerForge AI templates come with professionally paired fonts, but you can customize them.' },
        { type: 'callout', variant: 'warning', text: 'Avoid decorative or script fonts. They may look creative but are harder to read and can cause ATS parsing issues.' },
      ]},
      fr: { title: 'Comment Personnaliser les Modèles de CV pour un Impact Maximum', description: 'Transformez n\'importe quel modèle en un CV remarquable avec ces stratégies.', readingTime: 5, body: [
        { type: 'paragraph', text: 'Un bon modèle de CV est un point de départ, pas un produit fini. Les CV les plus efficaces sont ceux qui sont soigneusement personnalisés.' },
        { type: 'heading', text: 'Stratégie de Couleur', level: 2 },
        { type: 'list', items: ['Utilisez 1 à 2 couleurs d\'accent maximum', 'Adaptez les couleurs à l\'industrie', 'Utilisez la couleur pour les titres de section et les lignes de séparation', 'Assurez un contraste suffisant pour la lisibilité'] },
        { type: 'heading', text: 'Sélection de la Police', level: 2 },
        { type: 'callout', variant: 'warning', text: 'Évitez les polices décoratives ou cursives. Elles peuvent causer des problèmes d\'analyse ATS.' },
      ]},
    }
  },
  {
    slug: 'career-growth-strategies-2025', category: 'career-growth', featured: false, author: authors.marcus, date: '2025-06-10',
    seo: { en: { description: 'Proven career growth strategies for professional advancement in 2025.', keywords: ['career growth', 'development', 'advancement', '2025'] }, fr: { description: 'Stratégies éprouvées d\'évolution professionnelle pour 2025.', keywords: ['évolution professionnelle', 'développement', '2025'] } },
    content: {
      en: { title: 'Career Growth Strategies for 2025', description: 'Actionable strategies to accelerate your career development this year.', readingTime: 6, body: [
        { type: 'paragraph', text: 'The job market is evolving rapidly with AI, remote work, and new industries emerging. Here are the career growth strategies that will matter most in 2025.' },
        { type: 'heading', text: '1. Embrace AI as a Career Tool', level: 2 },
        { type: 'paragraph', text: 'AI isn\'t replacing professionals — it\'s empowering them. Learn to use AI tools for resume building, cover letter writing, and interview preparation to gain a competitive edge.' },
        { type: 'heading', text: '2. Build a Personal Brand', level: 2 },
        { type: 'list', items: ['Optimize your LinkedIn profile with a professional headshot and compelling summary', 'Share industry insights regularly to establish thought leadership', 'Collect and showcase recommendations from colleagues and managers'] },
        { type: 'heading', text: '3. Develop In-Demand Skills', level: 2 },
        { type: 'paragraph', text: 'Focus on skills that are growing in demand across industries: data literacy, project management, digital communication, and cross-cultural collaboration. Even if you\'re not in tech, these skills make you more versatile and valuable.' },
        { type: 'callout', variant: 'tip', text: 'Use CareerForge AI\'s job description analysis feature to identify the skills most in demand for your target roles, then build your development plan around them.' },
      ]},
      fr: { title: 'Stratégies d\'Évolution Professionnelle pour 2025', description: 'Stratégies concrètes pour accélérer votre développement professionnel cette année.', readingTime: 6, body: [
        { type: 'paragraph', text: 'Le marché du travail évolue rapidement. Voici les stratégies d\'évolution de carrière les plus importantes en 2025.' },
        { type: 'heading', text: '1. Adoptez l\'IA comme Outil de Carrière', level: 2 },
        { type: 'paragraph', text: 'L\'IA ne remplace pas les professionnels — elle les responsabilise. Apprenez à utiliser les outils IA pour construire votre CV et préparer vos entretiens.' },
        { type: 'heading', text: '2. Construisez une Marque Personnelle', level: 2 },
        { type: 'list', items: ['Optimisez votre profil LinkedIn', 'Partagez des perspectives sectorielles régulièrement', 'Collectez et présentez des recommandations'] },
        { type: 'heading', text: '3. Développez des Compétences Recherchées', level: 2 },
        { type: 'callout', variant: 'tip', text: 'Utilisez l\'analyse de descriptions d\'emploi de CareerForge AI pour identifier les compétences les plus demandées.' },
      ]},
    }
  },
  {
    slug: 'understanding-applicant-tracking-systems', category: 'ai-technology', featured: false, author: authors.sarah, date: '2025-06-08',
    seo: { en: { description: 'A deep dive into how Applicant Tracking Systems work and how to beat them.', keywords: ['ATS', 'applicant tracking', 'how it works', 'beating ATS'] }, fr: { description: 'Un examen approfondi du fonctionnement des systèmes de suivi des candidats.', keywords: ['ATS', 'suivi candidats', 'fonctionnement'] } },
    content: {
      en: { title: 'Understanding Applicant Tracking Systems', description: 'A comprehensive guide to how ATS works and how to ensure your resume gets through.', readingTime: 8, body: [
        { type: 'paragraph', text: 'Applicant Tracking Systems (ATS) are the gatekeepers of modern hiring. Understanding how they work is no longer optional — it\'s essential for any serious job seeker.' },
        { type: 'heading', text: 'What Exactly Is an ATS?', level: 2 },
        { type: 'paragraph', text: 'An ATS is software that helps companies manage the entire hiring process, from job posting to hiring decisions. For job seekers, the most important function is resume screening — the process of parsing, analyzing, and ranking your resume.' },
        { type: 'heading', text: 'How ATS Parses Your Resume', level: 2 },
        { type: 'steps', steps: [
          { title: 'Text Extraction', description: 'The ATS extracts all text from your resume file, removing formatting' },
          { title: 'Section Identification', description: 'It identifies standard sections (Experience, Education, Skills, etc.)' },
          { title: 'Data Extraction', description: 'It pulls out specific data points: dates, job titles, company names, skills' },
          { title: 'Keyword Matching', description: 'It compares extracted data against the job description requirements' },
          { title: 'Scoring and Ranking', description: 'It assigns a relevance score and ranks all applicants' }
        ]},
        { type: 'heading', text: 'The Top 5 ATS Systems', level: 2 },
        { type: 'list', items: ['Workday — Used by large enterprises, strict parsing rules', 'Greenhouse — Popular with tech companies, more flexible', 'Lever — Used by mid-size companies, good at identifying skills', 'iCIMS — Enterprise-focused, comprehensive screening', 'Jobvite — Known for social recruiting integration'] },
        { type: 'callout', variant: 'info', text: 'CareerForge AI tests all templates against these major ATS systems to ensure maximum compatibility. Our ATS Checker simulates how these systems would score your resume.' },
      ]},
      fr: { title: 'Comprendre les Systèmes de Suivi des Candidats', description: 'Un guide complet du fonctionnement des ATS et comment assurer que votre CV passe.', readingTime: 8, body: [
        { type: 'paragraph', text: 'Les systèmes de suivi des candidats (ATS) sont les gardiens du recrutement moderne.' },
        { type: 'heading', text: 'Qu\'est-ce qu\'un ATS Exactement ?', level: 2 },
        { type: 'paragraph', text: 'Un ATS est un logiciel qui aide les entreprises à gérer l\'ensemble du processus de recrutement.' },
        { type: 'heading', text: 'Comment l\'ATS Analyse Votre CV', level: 2 },
        { type: 'steps', steps: [
          { title: 'Extraction de Texte', description: 'L\'ATS extrait tout le texte de votre fichier CV' },
          { title: 'Identification des Sections', description: 'Il identifie les sections standards' },
          { title: 'Extraction de Données', description: 'Il extrait des points de données spécifiques' },
          { title: 'Correspondance des Mots-Clés', description: 'Il compare les données extraites aux exigences' },
          { title: 'Scoring et Classement', description: 'Il attribue un score de pertinence' }
        ]},
      ]},
    }
  },
  {
    slug: 'what-hiring-managers-look-for-2025', category: 'career-advice', featured: false, author: authors.marcus, date: '2025-06-05',
    seo: { en: { description: 'What hiring managers are really looking for in 2025 candidates.', keywords: ['hiring managers', 'what they want', '2025', 'recruiting'] }, fr: { description: 'Ce que les recruteurs recherchent vraiment chez les candidats en 2025.', keywords: ['recruteurs', 'recherche', '2025', 'recrutement'] } },
    content: {
      en: { title: 'What Hiring Managers Look for in 2025', description: 'The skills, qualities, and red flags that shape hiring decisions this year.', readingTime: 6, body: [
        { type: 'paragraph', text: 'The hiring landscape has shifted significantly. Here\'s what hiring managers told us they\'re looking for in 2025 candidates.' },
        { type: 'heading', text: 'Top Skills in Demand', level: 2 },
        { type: 'list', items: ['Adaptability and willingness to learn new tools (especially AI)', 'Strong written and verbal communication skills', 'Data literacy — the ability to interpret and use data in decision-making', 'Cross-functional collaboration experience', 'Problem-solving with concrete examples and results'] },
        { type: 'heading', text: 'What Makes a Candidate Stand Out', level: 2 },
        { type: 'paragraph', text: 'Beyond skills, hiring managers value candidates who demonstrate genuine enthusiasm for the role and company, ask thoughtful questions, and show evidence of continuous learning.' },
        { type: 'quote', text: 'I can teach technical skills. What I can\'t teach is curiosity, resilience, and the ability to communicate complex ideas simply. Those are the qualities that make someone truly exceptional.', author: 'VP of Engineering, Fortune 500 Company' },
        { type: 'heading', text: 'Common Red Flags', level: 2 },
        { type: 'list', items: ['Generic resumes that show no tailoring to the specific role', 'Inability to articulate specific achievements with measurable results', 'Negative comments about previous employers', 'Lack of questions or engagement during the interview', 'Unprofessional online presence'] },
      ]},
      fr: { title: 'Ce que les Recruteurs Recherchent en 2025', description: 'Les compétences, qualités et signaux d\'alerte qui façonnent les décisions de recrutement cette année.', readingTime: 6, body: [
        { type: 'paragraph', text: 'Le paysage du recrutement a considérablement changé. Voici ce que les recruteurs recherchent chez les candidats en 2025.' },
        { type: 'heading', text: 'Compétences les Plus Recherchées', level: 2 },
        { type: 'list', items: ['Adaptabilité et volonté d\'apprendre de nouveaux outils (surtout l\'IA)', 'Solides compétences de communication écrite et orale', 'Culture des données', 'Expérience de collaboration interfonctionnelle', 'Résolution de problèmes avec des exemples concrets'] },
        { type: 'heading', text: 'Ce qui Fait Ressortir un Candidat', level: 2 },
        { type: 'quote', text: 'Je peux enseigner les compétences techniques. Ce que je ne peux pas enseigner, c\'est la curiosité, la résilience et la capacité à communiquer.', author: 'VP Ingénierie, Entreprise du Fortune 500' },
        { type: 'heading', text: 'Signaux d\'Alerte Courants', level: 2 },
        { type: 'list', items: ['CV génériques sans adaptation au poste', 'Incapacité à articuler des réalisations mesurables', 'Commentaires négatifs sur les employeurs précédents', 'Manque de questions lors de l\'entretien', 'Présence en ligne non professionnelle'] },
      ]},
    }
  },
];

type Locale = 'en' | 'fr';

export function getBlogPostBySlug(slug: string, locale: Locale): BlogPost | undefined {
  return blogPosts.find(p => p.slug === slug);
}

export function getBlogPostsByCategory(categorySlug: string, locale: Locale): BlogPost[] {
  if (categorySlug === 'all') return blogPosts;
  return blogPosts.filter(p => p.category === categorySlug);
}

export function getFeaturedPosts(locale: Locale): BlogPost[] {
  return blogPosts.filter(p => p.featured);
}

export function getRelatedPosts(currentSlug: string, category: string, locale: Locale, limit = 3): BlogPost[] {
  return blogPosts
    .filter(p => p.slug !== currentSlug && p.category === category)
    .slice(0, limit);
}

export function searchBlogPosts(query: string, locale: Locale): BlogPost[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return blogPosts.filter(p => {
    const c = p.content[locale];
    return (
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.body.some(b => {
        if (b.type === 'paragraph' || b.type === 'quote') return b.text.toLowerCase().includes(q);
        if (b.type === 'list') return b.items.some(i => i.toLowerCase().includes(q));
        if (b.type === 'heading') return b.text.toLowerCase().includes(q);
        if (b.type === 'callout') return (b.title + b.text).toLowerCase().includes(q);
        return false;
      })
    );
  });
}