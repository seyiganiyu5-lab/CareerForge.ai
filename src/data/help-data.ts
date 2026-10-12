export type ArticleBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string; level?: 2 | 3 }
  | { type: 'list'; items: string[] }
  | { type: 'callout'; variant: 'info' | 'tip' | 'warning'; title?: string; text: string }
  | { type: 'quote'; text: string; author?: string }
  | { type: 'steps'; steps: { title: string; description: string }[] };

export interface HelpCategory {
  slug: string;
  icon: string;
  articleCount: number;
  content: {
    en: { title: string; description: string };
    fr: { title: string; description: string };
  };
}

export interface HelpArticle {
  slug: string;
  category: string;
  popular: boolean;
  author: { name: string; role: string };
  date: string;
  lastUpdated: string;
  seo: {
    en: { description: string; keywords: string[] };
    fr: { description: string; keywords: string[] };
  };
  content: {
    en: { title: string; description: string; readingTime: number; body: ArticleBlock[] };
    fr: { title: string; description: string; readingTime: number; body: ArticleBlock[] };
  };
}

export const helpCategories: HelpCategory[] = [
  { slug: 'getting-started', icon: 'Rocket', articleCount: 3, content: { en: { title: 'Getting Started', description: 'Learn the basics and set up your CareerForge AI account.' }, fr: { title: 'Premiers Pas', description: 'Apprenez les bases et configurez votre compte CareerForge AI.' } } },
  { slug: 'account-profile', icon: 'UserCog', articleCount: 4, content: { en: { title: 'Account & Profile', description: 'Manage your account settings, preferences, and personal information.' }, fr: { title: 'Compte et Profil', description: 'Gérez vos paramètres de compte, vos préférences et vos informations personnelles.' } } },
  { slug: 'resume-builder', icon: 'FileText', articleCount: 3, content: { en: { title: 'Resume Builder', description: 'Create, edit, and optimize professional ATS-friendly resumes.' }, fr: { title: 'Constructeur de CV', description: 'Créez, modifiez et optimisez des CV professionnels aux normes ATS.' } } },
  { slug: 'ai-cover-letter', icon: 'Mail', articleCount: 2, content: { en: { title: 'AI Cover Letter', description: 'Generate personalized cover letters powered by artificial intelligence.' }, fr: { title: 'Lettre de Motivation IA', description: 'Générez des lettres de motivation personnalisées alimentées par l\'intelligence artificielle.' } } },
  { slug: 'resume-review', icon: 'ScanSearch', articleCount: 2, content: { en: { title: 'Resume Review', description: 'Get AI-powered feedback and suggestions to improve your resume.' }, fr: { title: 'Révision de CV', description: 'Obtenez des retours et suggestions alimentés par l\'IA pour améliorer votre CV.' } } },
  { slug: 'ats-optimization', icon: 'Target', articleCount: 3, content: { en: { title: 'ATS Optimization', description: 'Understand and optimize for Applicant Tracking Systems.' }, fr: { title: 'Optimisation ATS', description: 'Comprenez et optimisez pour les systèmes de suivi des candidats.' } } },
  { slug: 'templates', icon: 'LayoutTemplate', articleCount: 2, content: { en: { title: 'Templates', description: 'Browse and customize professional resume templates.' }, fr: { title: 'Modèles', description: 'Parcourez et personnalisez des modèles de CV professionnels.' } } },
  { slug: 'job-tracker', icon: 'ClipboardList', articleCount: 2, content: { en: { title: 'Job Tracker', description: 'Track your job applications and manage your job search pipeline.' }, fr: { title: 'Suivi de Candidatures', description: 'Suivez vos candidatures et gérez votre processus de recherche d\'emploi.' } } },
  { slug: 'billing-subscription', icon: 'CreditCard', articleCount: 3, content: { en: { title: 'Billing & Subscription', description: 'Manage your subscription, payments, and billing information.' }, fr: { title: 'Facturation et Abonnement', description: 'Gérez votre abonnement, vos paiements et vos informations de facturation.' } } },
  { slug: 'security', icon: 'Shield', articleCount: 2, content: { en: { title: 'Security', description: 'Learn about our security measures and how to protect your account.' }, fr: { title: 'Sécurité', description: 'Découvrez nos mesures de sécurité et comment protéger votre compte.' } } },
  { slug: 'privacy', icon: 'Eye', articleCount: 2, content: { en: { title: 'Privacy', description: 'Understand how we handle and protect your personal data.' }, fr: { title: 'Vie Privée', description: 'Comprenez comment nous traitons et protégeons vos données personnelles.' } } },
  { slug: 'technical-issues', icon: 'Wrench', articleCount: 2, content: { en: { title: 'Technical Issues', description: 'Troubleshoot common technical problems and find solutions.' }, fr: { title: 'Problèmes Techniques', description: 'Résolvez les problèmes techniques courants et trouvez des solutions.' } } },
];

export const helpArticles: HelpArticle[] = [
  {
    slug: 'how-to-create-first-resume', category: 'getting-started', popular: true,
    author: { name: 'Sarah Chen', role: 'Content Lead' }, date: '2025-06-15', lastUpdated: '2025-07-01',
    seo: { en: { description: 'Learn how to create your first professional resume with CareerForge AI.', keywords: ['resume', 'create', 'first resume', 'getting started'] }, fr: { description: 'Apprenez à créer votre premier CV professionnel avec CareerForge AI.', keywords: ['CV', 'créer', 'premier CV', 'premiers pas'] } },
    content: {
      en: { title: 'How to Create Your First Resume', description: 'A step-by-step guide to building your first professional resume with CareerForge AI.', readingTime: 5, body: [
        { type: 'paragraph', text: 'Creating your first resume with CareerForge AI is quick and straightforward. Our AI-powered platform guides you through every step, ensuring your resume meets ATS standards and stands out to recruiters.' },
        { type: 'heading', text: 'Step 1: Complete Your Profile', level: 2 },
        { type: 'paragraph', text: 'Before creating a resume, make sure your profile is complete with your personal information, job title, and career level. This information helps our AI generate personalized content tailored to your experience.' },
        { type: 'heading', text: 'Step 2: Choose a Template', level: 2 },
        { type: 'paragraph', text: 'Browse our collection of professionally designed templates. Each template is ATS-compatible and can be customized with your preferred colors, fonts, and layout. Choose one that best represents your professional brand.' },
        { type: 'tip', variant: 'tip', title: 'Pro Tip', text: 'Choose a clean, professional template. Simple designs often perform better with ATS systems than overly creative layouts.' },
        { type: 'heading', text: 'Step 3: Add Your Content', level: 2 },
        { type: 'paragraph', text: 'Fill in your work experience, education, skills, and certifications. Our AI will suggest improvements and optimize your content for ATS compatibility as you type.' },
        { type: 'steps', steps: [
          { title: 'Add Work Experience', description: 'List your previous positions with job titles, company names, dates, and key achievements. Use action verbs and quantify results where possible.' },
          { title: 'Add Education', description: 'Include your degrees, institutions, graduation dates, and relevant coursework or honors.' },
          { title: 'Add Skills', description: 'List both technical and soft skills relevant to your target position. Our AI will suggest skills based on your job description.' },
          { title: 'Review & Export', description: 'Review your complete resume, check the ATS score, and export it as a polished PDF.' }
        ]},
        { type: 'paragraph', text: 'Your resume is now ready! You can always come back to edit it, generate new versions for different positions, or use our AI to tailor it to specific job descriptions.' },
      ]},
      fr: { title: 'Comment Créer Votre Premier CV', description: 'Un guide étape par étape pour construire votre premier CV professionnel avec CareerForge AI.', readingTime: 5, body: [
        { type: 'paragraph', text: 'Créer votre premier CV avec CareerForge AI est rapide et simple. Notre plateforme alimentée par l\'IA vous guide à chaque étape, garantissant que votre CV répond aux normes ATS et se distingue auprès des recruteurs.' },
        { type: 'heading', text: 'Étape 1 : Complétez Votre Profil', level: 2 },
        { type: 'paragraph', text: 'Avant de créer un CV, assurez-vous que votre profil est complet avec vos informations personnelles, votre titre d\'emploi et votre niveau de carrière. Ces informations aident notre IA à générer du contenu personnalisé adapté à votre expérience.' },
        { type: 'heading', text: 'Étape 2 : Choisissez un Modèle', level: 2 },
        { type: 'paragraph', text: 'Parcourez notre collection de modèles professionnellement conçus. Chaque modèle est compatible ATS et peut être personnalisé avec vos couleurs, polices et mise en page préférés.' },
        { type: 'callout', variant: 'tip', title: 'Conseil Pro', text: 'Choisissez un modèle propre et professionnel. Les designs simples fonctionnent souvent mieux avec les systèmes ATS que les mises en page trop créatives.' },
        { type: 'heading', text: 'Étape 3 : Ajoutez Votre Contenu', level: 2 },
        { type: 'paragraph', text: 'Remplissez votre expérience professionnelle, votre formation, vos compétences et vos certifications. Notre IA suggérera des améliorations et optimisera votre contenu pour la compatibilité ATS au fur et à mesure que vous tapez.' },
        { type: 'steps', steps: [
          { title: 'Ajoutez l\'Expérience Professionnelle', description: 'Listez vos postes précédents avec les titres, noms d\'entreprises, dates et réalisations clés.' },
          { title: 'Ajoutez la Formation', description: 'Incluez vos diplômes, établissements, dates de graduation et cours ou honneurs pertinents.' },
          { title: 'Ajoutez les Compétences', description: 'Listez les compétences techniques et comportementales pertinentes pour le poste visé.' },
          { title: 'Vérifiez et Exportez', description: 'Vérifiez votre CV complet, consultez le score ATS et exportez-le en PDF professionnel.' }
        ]},
        { type: 'paragraph', text: 'Votre CV est maintenant prêt ! Vous pouvez toujours revenir le modifier, générer de nouvelles versions pour différents postes ou utiliser notre IA pour l\'adapter à des descriptions d\'emploi spécifiques.' },
      ]},
    }
  },
  {
    slug: 'how-ats-works', category: 'ats-optimization', popular: true,
    author: { name: 'Marcus Johnson', role: 'Career Expert' }, date: '2025-06-20', lastUpdated: '2025-07-05',
    seo: { en: { description: 'Understand how Applicant Tracking Systems work and why ATS optimization matters for your job search.', keywords: ['ATS', 'applicant tracking system', 'optimization', 'resume'] }, fr: { description: 'Comprenez comment fonctionnent les systèmes de suivi des candidats et pourquoi l\'optimisation ATS importe.', keywords: ['ATS', 'suivi candidats', 'optimisation', 'CV'] } },
    content: {
      en: { title: 'How ATS Works and Why It Matters', description: 'Understanding Applicant Tracking Systems is crucial for getting your resume noticed by employers.', readingTime: 6, body: [
        { type: 'paragraph', text: 'An Applicant Tracking System (ATS) is software used by employers to manage job applications. Over 98% of Fortune 500 companies use an ATS to screen resumes before a human ever sees them. Understanding how these systems work is essential for job search success.' },
        { type: 'heading', text: 'How ATS Processes Your Resume', level: 2 },
        { type: 'paragraph', text: 'When you submit your resume, the ATS performs several automated tasks:' },
        { type: 'list', items: ['Parses your resume text and extracts key information (name, contact, education, experience, skills)', 'Matches your qualifications against the job description requirements', 'Scores and ranks your resume based on keyword matches and relevance', 'Flags or filters out resumes that don\'t meet minimum criteria'] },
        { type: 'heading', text: 'Common ATS Pitfalls', level: 2 },
        { type: 'callout', variant: 'warning', title: 'Watch Out', text: 'These common mistakes can cause your resume to be rejected by ATS before a human reviewer ever sees it.' },
        { type: 'list', items: ['Using images, graphics, or complex formatting that ATS cannot read', 'Submitting PDFs with scanned images instead of text-based PDFs', 'Missing critical keywords from the job description', 'Using non-standard section headings that ATS cannot recognize', 'Including headers/footers that interfere with text parsing'] },
        { type: 'heading', text: 'How CareerForge AI Helps', level: 2 },
        { type: 'paragraph', text: 'CareerForge AI is specifically designed to create ATS-optimized resumes. Our platform ensures your resume uses clean formatting, includes relevant keywords, and follows the structural conventions that ATS systems expect.' },
        { type: 'tip', variant: 'tip', text: 'Use our built-in ATS Checker to scan your resume against specific job descriptions and get an instant compatibility score with actionable improvement suggestions.' },
      ]},
      fr: { title: 'Comment Fonctionne l\'ATS et Pourquoi C\'est Important', description: 'Comprendre les systèmes de suivi des candidats est crucial pour que votre CV soit remarqué par les employeurs.', readingTime: 6, body: [
        { type: 'paragraph', text: 'Un système de suivi des candidats (ATS) est un logiciel utilisé par les employeurs pour gérer les candidatures. Plus de 98 % des entreprises du Fortune 500 utilisent un ATS pour filtrer les CV avant qu\'un humain ne les voie.' },
        { type: 'heading', text: 'Comment l\'ATS Traite Votre CV', level: 2 },
        { type: 'list', items: ['Analyse le texte de votre CV et extrait les informations clés', 'Fait correspondre vos qualifications aux exigences de l\'offre d\'emploi', 'Note et classe votre CV en fonction des correspondances de mots-clés', 'Signale ou filtre les CV qui ne répondent pas aux critères minimums'] },
        { type: 'heading', text: 'Pièges Courants de l\'ATS', level: 2 },
        { type: 'callout', variant: 'warning', title: 'Attention', text: 'Ces erreurs courantes peuvent entraîner le rejet de votre CV par l\'ATS avant qu\'un humain ne le consulte.' },
        { type: 'list', items: ['Utilisation d\'images ou de formatages complexes que l\'ATS ne peut pas lire', 'Soumission de PDF avec des images numérisées au lieu de PDF basés sur le texte', 'Absence de mots-clés critiques de la description d\'emploi', 'Utilisation d\'en-têtes de section non standards', 'Inclusion d\'en-têtes/pieds de page qui interfèrent avec l\'analyse du texte'] },
        { type: 'heading', text: 'Comment CareerForge AI Aide', level: 2 },
        { type: 'paragraph', text: 'CareerForge AI est spécialement conçu pour créer des CV optimisés pour l\'ATS. Notre plateforme garantit que votre CV utilise un formatage propre, inclut des mots-clés pertinents et suit les conventions structurelles que les systèmes ATS attendent.' },
        { type: 'callout', variant: 'tip', text: 'Utilisez notre Vérificateur ATS intégré pour analyser votre CV par rapport à des descriptions d\'emploi spécifiques et obtenir un score de compatibilité instantané.' },
      ]},
    }
  },
  {
    slug: 'how-to-generate-cover-letter', category: 'ai-cover-letter', popular: true,
    author: { name: 'Sarah Chen', role: 'Content Lead' }, date: '2025-06-22', lastUpdated: '2025-07-02',
    seo: { en: { description: 'Learn how to generate a personalized cover letter using CareerForge AI.', keywords: ['cover letter', 'AI', 'generate', 'personalized'] }, fr: { description: 'Apprenez à générer une lettre de motivation personnalisée avec CareerForge AI.', keywords: ['lettre de motivation', 'IA', 'générer', 'personnalisée'] } },
    content: {
      en: { title: 'How to Generate a Cover Letter with AI', description: 'Create a compelling, personalized cover letter in seconds with our AI-powered tool.', readingTime: 4, body: [
        { type: 'paragraph', text: 'CareerForge AI\'s cover letter generator uses advanced AI to create personalized cover letters tailored to specific job positions. Here\'s how to make the most of this powerful feature.' },
        { type: 'heading', text: 'Generating Your Cover Letter', level: 2 },
        { type: 'steps', steps: [
          { title: 'Navigate to Cover Letters', description: 'From your dashboard, click on "Cover Letter" in the left sidebar to access the cover letter generator.' },
          { title: 'Enter Job Details', description: 'Paste the job description or enter the job title and company name. The more details you provide, the more personalized your cover letter will be.' },
          { title: 'Generate with AI', description: 'Click "Generate with AI" and our system will create a tailored cover letter based on your resume and the job requirements.' },
          { title: 'Review and Edit', description: 'Always review the generated letter. Personalize it further with specific examples from your experience that match the job requirements.' }
        ]},
        { type: 'callout', variant: 'info', title: 'Best Practice', text: 'While our AI generates excellent cover letters, always add a personal touch. Mention a specific project, achievement, or connection to the company to make your letter truly stand out.' },
        { type: 'heading', text: 'Tips for Great Cover Letters', level: 2 },
        { type: 'list', items: ['Address the hiring manager by name when possible', 'Open with a strong hook that relates to the company or role', 'Include 2-3 specific achievements that match the job requirements', 'Keep it concise — ideally one page', 'End with a clear call to action and your contact information'] },
      ]},
      fr: { title: 'Comment Générer une Lettre de Motivation avec l\'IA', description: 'Créez une lettre de motivation convaincante et personnalisée en quelques secondes avec notre outil alimenté par l\'IA.', readingTime: 4, body: [
        { type: 'paragraph', text: 'Le générateur de lettres de motivation de CareerForge AI utilise une IA avancée pour créer des lettres de motivation personnalisées adaptées à des postes spécifiques.' },
        { type: 'heading', text: 'Générer Votre Lettre de Motivation', level: 2 },
        { type: 'steps', steps: [
          { title: 'Accédez aux Lettres de Motivation', description: 'Depuis votre tableau de bord, cliquez sur "Lettre de Motivation" dans la barre latérale.' },
          { title: 'Entrez les Détails du Poste', description: 'Collez la description d\'emploi ou entrez le titre du poste et le nom de l\'entreprise.' },
          { title: 'Générez avec l\'IA', description: 'Cliquez sur "Générer avec l\'IA" et notre système créera une lettre de motivation sur mesure.' },
          { title: 'Vérifiez et Modifiez', description: 'Vérifiez toujours la lettre générée. Personnalisez-la avec des exemples spécifiques de votre expérience.' }
        ]},
        { type: 'callout', variant: 'info', title: 'Bonne Pratique', text: 'Bien que notre IA génère d\'excellentes lettres de motivation, ajoutez toujours une touche personnelle. Mentionnez un projet ou une réalisation spécifique.' },
        { type: 'heading', text: 'Conseils pour d\'Excellentes Lettres de Motivation', level: 2 },
        { type: 'list', items: ['Adressez-vous au recruteur par son nom lorsque c\'est possible', 'Commencez par un accroche forte liée à l\'entreprise ou au poste', 'Incluez 2-3 réalisations spécifiques correspondant aux exigences du poste', 'Gardez-la concise — idéalement une page', 'Terminez par un appel à l\'action clair'] },
      ]},
    }
  },
  {
    slug: 'how-to-change-language', category: 'account-profile', popular: true,
    author: { name: 'Aminata Diallo', role: 'Support Specialist' }, date: '2025-06-10', lastUpdated: '2025-06-28',
    seo: { en: { description: 'Learn how to change the display language of CareerForge AI.', keywords: ['language', 'settings', 'english', 'french'] }, fr: { description: 'Apprenez à changer la langue d\'affichage de CareerForge AI.', keywords: ['langue', 'paramètres', 'anglais', 'français'] } },
    content: {
      en: { title: 'How to Change Your Language', description: 'Switch between English and French on CareerForge AI.', readingTime: 2, body: [
        { type: 'paragraph', text: 'CareerForge AI supports both English and French. You can switch the display language at any time using the language toggle in the navigation bar.' },
        { type: 'heading', text: 'Changing the Language', level: 2 },
        { type: 'steps', steps: [
          { title: 'Find the Language Toggle', description: 'Look for the Globe icon in the top navigation bar (next to the theme toggle).' },
          { title: 'Click to Switch', description: 'Click the Globe icon to instantly switch between English and French. The entire interface will update to your selected language.' },
          { title: 'Language is Saved', description: 'Your language preference is automatically saved and will persist across sessions.' }
        ]},
        { type: 'callout', variant: 'info', text: 'The language setting affects the entire CareerForge AI interface, including all menus, labels, and system messages. Resume and cover letter content remains in the language you wrote it.' },
      ]},
      fr: { title: 'Comment Changer de Langue', description: 'Basculez entre l\'anglais et le français sur CareerForge AI.', readingTime: 2, body: [
        { type: 'paragraph', text: 'CareerForge AI prend en charge l\'anglais et le français. Vous pouvez changer la langue d\'affichage à tout moment.' },
        { type: 'heading', text: 'Changer la Langue', level: 2 },
        { type: 'steps', steps: [
          { title: 'Trouvez le Sélecteur de Langue', description: 'Recherchez l\'icône Globe dans la barre de navigation supérieure.' },
          { title: 'Cliquez pour Changer', description: 'Cliquez sur l\'icône Globe pour basculer instantanément entre l\'anglais et le français.' },
          { title: 'La Langue Est Sauvegardée', description: 'Votre préférence de langue est automatiquement sauvegardée et persiste entre les sessions.' }
        ]},
        { type: 'callout', variant: 'info', text: 'Le paramètre de langue affecte l\'ensemble de l\'interface de CareerForge AI. Le contenu de votre CV et de votre lettre de motivation reste dans la langue dans laquelle vous l\'avez rédigé.' },
      ]},
    }
  },
  {
    slug: 'how-to-switch-dark-mode', category: 'account-profile', popular: true,
    author: { name: 'Aminata Diallo', role: 'Support Specialist' }, date: '2025-06-12', lastUpdated: '2025-06-28',
    seo: { en: { description: 'Learn how to switch between light and dark mode.', keywords: ['theme', 'dark mode', 'light mode', 'appearance'] }, fr: { description: 'Apprenez à basculer entre le mode clair et le mode sombre.', keywords: ['thème', 'mode sombre', 'mode clair', 'apparence'] } },
    content: {
      en: { title: 'How to Switch Between Light and Dark Mode', description: 'Customize your viewing experience with light and dark mode.', readingTime: 2, body: [
        { type: 'paragraph', text: 'CareerForge AI supports both light and dark mode to suit your preferences and reduce eye strain during extended use.' },
        { type: 'heading', text: 'Switching Themes', level: 2 },
        { type: 'steps', steps: [
          { title: 'Find the Theme Toggle', description: 'Look for the Sun/Moon icon in the top navigation bar.' },
          { title: 'Click to Toggle', description: 'Click the icon to switch between light and dark mode. The change applies instantly.' },
          { title: 'Automatic Detection', description: 'CareerForge AI can also detect your system preference and apply the appropriate theme automatically.' }
        ]},
      ]},
      fr: { title: 'Comment Basculer entre le Mode Clair et Sombre', description: 'Personnalisez votre expérience d\'affichage avec le mode clair et sombre.', readingTime: 2, body: [
        { type: 'paragraph', text: 'CareerForge AI prend en charge le mode clair et sombre pour s\'adapter à vos préférences.' },
        { type: 'heading', text: 'Changer de Thème', level: 2 },
        { type: 'steps', steps: [
          { title: 'Trouvez le Sélecteur de Thème', description: 'Recherchez l\'icône Soleil/Lune dans la barre de navigation supérieure.' },
          { title: 'Cliquez pour Basculer', description: 'Cliquez sur l\'icône pour basculer entre le mode clair et sombre.' },
          { title: 'Détection Automatique', description: 'CareerForge AI peut également détecter la préférence de votre système.' }
        ]},
      ]},
    }
  },
  {
    slug: 'how-to-delete-account', category: 'account-profile', popular: true,
    author: { name: 'Aminata Diallo', role: 'Support Specialist' }, date: '2025-06-18', lastUpdated: '2025-07-01',
    seo: { en: { description: 'Learn how to permanently delete your CareerForge AI account.', keywords: ['delete', 'account', 'remove', 'data'] }, fr: { description: 'Apprenez à supprimer définitivement votre compte CareerForge AI.', keywords: ['supprimer', 'compte', 'données'] } },
    content: {
      en: { title: 'How to Delete Your Account', description: 'Permanently delete your account and all associated data.', readingTime: 3, body: [
        { type: 'paragraph', text: 'If you no longer wish to use CareerForge AI, you can permanently delete your account. Please note that this action is irreversible and will remove all your data.' },
        { type: 'callout', variant: 'warning', title: 'Important', text: 'Account deletion is permanent. All your resumes, cover letters, application data, and personal information will be permanently removed within 30 days. This action cannot be undone.' },
        { type: 'heading', text: 'Before You Delete', level: 2 },
        { type: 'list', items: ['Export any resumes or cover letters you want to keep', 'Cancel any active subscriptions', 'Download your data from account settings'] },
        { type: 'heading', text: 'How to Delete', level: 2 },
        { type: 'steps', steps: [
          { title: 'Go to Settings', description: 'Navigate to your account settings from the dashboard.' },
          { title: 'Find Delete Account', description: 'Scroll to the "Danger Zone" section and click "Delete Account".' },
          { title: 'Confirm Deletion', description: 'Type your email address to confirm, then click "Delete My Account".' }
        ]},
      ]},
      fr: { title: 'Comment Supprimer Votre Compte', description: 'Supprimez définitivement votre compte et toutes les données associées.', readingTime: 3, body: [
        { type: 'paragraph', text: 'Si vous ne souhaitez plus utiliser CareerForge AI, vous pouvez supprimer définitivement votre compte. Cette action est irréversible.' },
        { type: 'callout', variant: 'warning', title: 'Important', text: 'La suppression du compte est permanente. Tous vos CV, lettres de motivation et données personnelles seront supprimés dans les 30 jours. Cette action ne peut pas être annulée.' },
        { type: 'heading', text: 'Avant de Supprimer', level: 2 },
        { type: 'list', items: ['Exportez les CV ou lettres de motivation que vous souhaitez conserver', 'Annulez tout abonnement actif', 'Téléchargez vos données depuis les paramètres du compte'] },
        { type: 'heading', text: 'Comment Supprimer', level: 2 },
        { type: 'steps', steps: [
          { title: 'Allez dans les Paramètres', description: 'Accédez aux paramètres de votre compte depuis le tableau de bord.' },
          { title: 'Trouvez Supprimer le Compte', description: 'Défilez jusqu\'à la section "Zone de Danger" et cliquez sur "Supprimer le Compte".' },
          { title: 'Confirmez la Suppression', description: 'Tapez votre adresse e-mail pour confirmer, puis cliquez sur "Supprimer Mon Compte".' }
        ]},
      ]},
    }
  },
  {
    slug: 'managing-your-subscription', category: 'billing-subscription', popular: false,
    author: { name: 'Marcus Johnson', role: 'Career Expert' }, date: '2025-06-25', lastUpdated: '2025-07-03',
    seo: { en: { description: 'Manage your CareerForge AI subscription plan, payments, and billing.', keywords: ['subscription', 'billing', 'payment', 'plan'] }, fr: { description: 'Gérez votre abonnement CareerForge AI, vos paiements et votre facturation.', keywords: ['abonnement', 'facturation', 'paiement', 'forfait'] } },
    content: {
      en: { title: 'Managing Your Subscription', description: 'Everything you need to know about plans, payments, and billing.', readingTime: 5, body: [
        { type: 'paragraph', text: 'CareerForge AI offers flexible subscription plans to suit your needs. Here\'s how to manage your subscription.' },
        { type: 'heading', text: 'Available Plans', level: 2 },
        { type: 'list', items: ['Free Plan: 1 resume and 3 cover letters with basic AI suggestions', 'Pro Plan ($7.99/month): Unlimited resumes and cover letters with full AI features', 'Enterprise Plan: Custom pricing — Everything in Pro plus team features and API access'] },
        { type: 'heading', text: 'Upgrading or Downgrading', level: 2 },
        { type: 'paragraph', text: 'You can change your plan at any time from your account settings. When upgrading, you\'ll get immediate access to new features. When downgrading, you\'ll retain access to your current plan until the end of the billing period.' },
        { type: 'heading', text: 'Cancellation and Refunds', level: 2 },
        { type: 'paragraph', text: 'You can cancel your subscription at any time. We offer a 7-day money-back guarantee for new subscribers. After cancellation, you\'ll continue to have access to paid features until the end of your current billing period.' },
      ]},
      fr: { title: 'Gérer Votre Abonnement', description: 'Tout ce que vous devez savoir sur les forfaits, les paiements et la facturation.', readingTime: 5, body: [
        { type: 'paragraph', text: 'CareerForge AI propose des forfaits d\'abonnement flexibles pour répondre à vos besoins.' },
        { type: 'heading', text: 'Forfaits Disponibles', level: 2 },
        { type: 'list', items: ['Forfait Gratuit : 1 CV et 3 lettres de motivation avec suggestions IA de base', 'Forfait Pro (7,99 $/mois) : CV et lettres illimités avec toutes les fonctionnalités IA', 'Forfait Entreprise : Tarif sur mesure — Tout le Pro plus les fonctionnalités d\'équipe et l\'accès API'] },
        { type: 'heading', text: 'Mise à Niveau ou Régression', level: 2 },
        { type: 'paragraph', text: 'Vous pouvez changer de forfait à tout moment depuis les paramètres de votre compte. En cas de mise à niveau, vous aurez immédiatement accès aux nouvelles fonctionnalités.' },
        { type: 'heading', text: 'Annulation et Remboursements', level: 2 },
        { type: 'paragraph', text: 'Vous pouvez annuler votre abonnement à tout moment. Nous offrons une garantie de remboursement de 7 jours pour les nouveaux abonnés.' },
      ]},
    }
  },
  {
    slug: 'customizing-templates', category: 'templates', popular: false,
    author: { name: 'Sarah Chen', role: 'Content Lead' }, date: '2025-06-28', lastUpdated: '2025-07-01',
    seo: { en: { description: 'Learn how to customize resume templates to match your personal brand.', keywords: ['template', 'customize', 'design', 'personalize'] }, fr: { description: 'Apprenez à personnaliser les modèles de CV pour correspondre à votre marque personnelle.', keywords: ['modèle', 'personnaliser', 'design'] } },
    content: {
      en: { title: 'Customizing Resume Templates', description: 'Make your resume stand out by personalizing templates to match your brand.', readingTime: 4, body: [
        { type: 'paragraph', text: 'CareerForge AI offers a variety of professionally designed templates. Each template is fully customizable, allowing you to adjust colors, fonts, layout, and section order.' },
        { type: 'heading', text: 'Template Customization Options', level: 2 },
        { type: 'list', items: ['Color schemes: Choose from preset palettes or create custom colors', 'Font combinations: Select from professional font pairings', 'Section layout: Rearrange sections to highlight your strengths', 'Spacing and margins: Fine-tune the visual balance of your resume'] },
        { type: 'callout', variant: 'tip', text: 'Keep your customization professional. Subtle color accents and clean typography make a stronger impression than bold or flashy designs.' },
        { type: 'heading', text: 'ATS Compatibility', level: 2 },
        { type: 'paragraph', text: 'All our templates are designed to be ATS-compatible. However, be mindful that excessive customization (especially with graphics and complex layouts) may reduce ATS readability. Always check your ATS score after making changes.' },
      ]},
      fr: { title: 'Personnaliser les Modèles de CV', description: 'Faites ressortir votre CV en personnalisant les modèles.', readingTime: 4, body: [
        { type: 'paragraph', text: 'CareerForge AI propose une variété de modèles professionnellement conçus. Chaque modèle est entièrement personnalisable.' },
        { type: 'heading', text: 'Options de Personnalisation', level: 2 },
        { type: 'list', items: ['Palettes de couleurs : Choisissez parmi des palettes prédéfinies ou créez des couleurs personnalisées', 'Combinaisons de polices : Sélectionnez des paires de polices professionnelles', 'Mise en page : Réorganisez les sections pour mettre en valeur vos atouts', 'Espacement et marges : Ajustez l\'équilibre visuel de votre CV'] },
        { type: 'callout', variant: 'tip', text: 'Gardez votre personnalisation professionnelle. Des accents de couleur subtils font une plus forte impression que des designs voyants.' },
      ]},
    }
  },
  {
    slug: 'securing-your-account', category: 'security', popular: false,
    author: { name: 'Aminata Diallo', role: 'Support Specialist' }, date: '2025-06-30', lastUpdated: '2025-07-02',
    seo: { en: { description: 'Learn how to keep your CareerForge AI account secure.', keywords: ['security', 'password', 'two-factor', 'protect'] }, fr: { description: 'Apprenez à sécuriser votre compte CareerForge AI.', keywords: ['sécurité', 'mot de passe', 'protéger'] } },
    content: {
      en: { title: 'Securing Your Account', description: 'Best practices for keeping your CareerForge AI account safe.', readingTime: 3, body: [
        { type: 'paragraph', text: 'Protecting your account is important. Here are the best practices to keep your CareerForge AI account and data secure.' },
        { type: 'heading', text: 'Password Security', level: 2 },
        { type: 'list', items: ['Use a strong, unique password (at least 8 characters with uppercase, lowercase, numbers, and special characters)', 'Never share your password with anyone', 'Use a password manager to generate and store strong passwords', 'Change your password periodically'] },
        { type: 'heading', text: 'Account Protection Tips', level: 2 },
        { type: 'list', items: ['Sign out from shared or public computers after use', 'Keep your email secure — it\'s used for account recovery', 'Review your account activity regularly', 'Contact support immediately if you notice suspicious activity'] },
        { type: 'callout', variant: 'info', text: 'CareerForge AI uses industry-standard encryption (AES-256 at rest, TLS 1.3 in transit) to protect your data. We never store your password in plain text.' },
      ]},
      fr: { title: 'Sécuriser Votre Compte', description: 'Meilleures pratiques pour garder votre compte CareerForge AI en sécurité.', readingTime: 3, body: [
        { type: 'paragraph', text: 'Protéger votre compte est important. Voici les meilleures pratiques pour garder votre compte et vos données en sécurité.' },
        { type: 'heading', text: 'Sécurité du Mot de Passe', level: 2 },
        { type: 'list', items: ['Utilisez un mot de passe fort et unique (au moins 8 caractères)', 'Ne partagez jamais votre mot de passe', 'Utilisez un gestionnaire de mots de passe', 'Changez votre mot de passe périodiquement'] },
        { type: 'heading', text: 'Conseils de Protection', level: 2 },
        { type: 'list', items: ['Déconnectez-vous des ordinateurs partagés après utilisation', 'Gardez votre e-mail sécurisé', 'Vérifiez régulièrement l\'activité de votre compte', 'Contactez le support immédiatement si vous remarquez une activité suspecte'] },
      ]},
    }
  },
  {
    slug: 'using-ai-resume-suggestions', category: 'resume-builder', popular: false,
    author: { name: 'Marcus Johnson', role: 'Career Expert' }, date: '2025-07-01', lastUpdated: '2025-07-05',
    seo: { en: { description: 'How to use AI suggestions to improve your resume content.', keywords: ['AI', 'suggestions', 'resume', 'improve'] }, fr: { description: 'Comment utiliser les suggestions IA pour améliorer le contenu de votre CV.', keywords: ['IA', 'suggestions', 'CV', 'améliorer'] } },
    content: {
      en: { title: 'Using AI Resume Suggestions', description: 'Leverage AI to write more compelling resume content.', readingTime: 4, body: [
        { type: 'paragraph', text: 'CareerForge AI provides intelligent suggestions as you build your resume. These suggestions help you write stronger bullet points, better descriptions, and more impactful content overall.' },
        { type: 'heading', text: 'Types of AI Suggestions', level: 2 },
        { type: 'list', items: ['Content Enhancement: AI suggests stronger verbs, more specific metrics, and clearer descriptions', 'Keyword Optimization: AI identifies missing keywords from your target job description', 'Skills Recommendations: AI suggests relevant skills based on your experience and target role', 'Formatting Tips: AI recommends structural improvements for better readability'] },
        { type: 'callout', variant: 'tip', text: 'AI suggestions are a starting point. Always review and personalize them to accurately reflect your unique experience and achievements.' },
      ]},
      fr: { title: 'Utiliser les Suggestions IA pour le CV', description: 'Tirez parti de l\'IA pour rédiger un contenu de CV plus convaincant.', readingTime: 4, body: [
        { type: 'paragraph', text: 'CareerForge AI fournit des suggestions intelligentes pendant la création de votre CV.' },
        { type: 'heading', text: 'Types de Suggestions IA', level: 2 },
        { type: 'list', items: ['Amélioration du contenu : l\'IA suggère des verbes plus forts et des descriptions plus claires', 'Optimisation des mots-clés : l\'IA identifie les mots-clés manquants', 'Recommandations de compétences : l\'IA suggère des compétences pertinentes', 'Conseils de formatage : l\'IA recommande des améliorations structurelles'] },
      ]},
    }
  },
  {
    slug: 'tracking-job-applications', category: 'job-tracker', popular: false,
    author: { name: 'Sarah Chen', role: 'Content Lead' }, date: '2025-07-02', lastUpdated: '2025-07-05',
    seo: { en: { description: 'Learn how to use the job application tracker to manage your job search.', keywords: ['tracker', 'applications', 'job search', 'manage'] }, fr: { description: 'Apprenez à utiliser le suivi de candidatures pour gérer votre recherche d\'emploi.', keywords: ['suivi', 'candidatures', 'recherche d\'emploi'] } },
    content: {
      en: { title: 'Tracking Job Applications', description: 'Stay organized and never miss an opportunity with the Job Tracker.', readingTime: 3, body: [
        { type: 'paragraph', text: 'The Job Tracker helps you organize your job search by tracking every application in one place. Stay on top of deadlines, follow-ups, and status updates.' },
        { type: 'heading', text: 'Adding Applications', level: 2 },
        { type: 'steps', steps: [
          { title: 'Click "Add Application"', description: 'Enter the job title, company name, and a link to the job posting.' },
          { title: 'Set Status', description: 'Track each application through stages: Applied, Interviewing, Offer, Rejected, or Accepted.' },
          { title: 'Add Notes', description: 'Keep track of important details like interview dates, contacts, and follow-up reminders.' }
        ]},
      ]},
      fr: { title: 'Suivre vos Candidatures', description: 'Restez organisé et ne manquez aucune opportunité avec le Suivi de Candidatures.', readingTime: 3, body: [
        { type: 'paragraph', text: 'Le Suivi de Candidatures vous aide à organiser votre recherche d\'emploi en suivant chaque candidature au même endroit.' },
        { type: 'heading', text: 'Ajouter des Candidatures', level: 2 },
        { type: 'steps', steps: [
          { title: 'Cliquez sur "Ajouter une Candidature"', description: 'Entrez le titre du poste, le nom de l\'entreprise et le lien vers l\'offre.' },
          { title: 'Définissez le Statut', description: 'Suivez chaque candidature à travers les étapes : Postulé, Entretien, Offre, Refusé ou Accepté.' },
          { title: 'Ajoutez des Notes', description: 'Gardez une trace des détails importants comme les dates d\'entretien et les rappels.' }
        ]},
      ]},
    }
  },
  {
    slug: 'payment-methods-and-pricing', category: 'billing-subscription', popular: false,
    author: { name: 'Marcus Johnson', role: 'Career Expert' }, date: '2025-07-03', lastUpdated: '2025-07-05',
    seo: { en: { description: 'Information about accepted payment methods and pricing.', keywords: ['payment', 'pricing', 'FCFA', 'methods'] }, fr: { description: 'Informations sur les méthodes de paiement acceptées et les tarifs.', keywords: ['paiement', 'tarifs', 'FCFA', 'méthodes'] } },
    content: {
      en: { title: 'Payment Methods and Pricing', description: 'Everything about payment options, currency, and pricing.', readingTime: 3, body: [
        { type: 'paragraph', text: 'CareerForge AI supports multiple payment methods to make subscribing convenient.' },
        { type: 'heading', text: 'Accepted Payment Methods', level: 2 },
        { type: 'list', items: ['Mobile money and digital wallets', 'Credit and debit cards (Visa, Mastercard)', 'Bank transfers'] },
        { type: 'heading', text: 'Pricing', level: 2 },
        { type: 'list', items: ['Free: No cost, includes basic features', 'Pro: $7.99/month or $79.99/year (save ~17%)', 'Enterprise: Custom pricing — contact our sales team'] },
        { type: 'callout', variant: 'info', text: 'All prices are displayed inclusive of applicable taxes. Annual plans offer significant savings compared to monthly billing.' },
      ]},
      fr: { title: 'Méthodes de Paiement et Tarifs', description: 'Tout sur les options de paiement, la devise et les tarifs.', readingTime: 3, body: [
        { type: 'paragraph', text: 'CareerForge AI supporte plusieurs méthodes de paiement.' },
        { type: 'heading', text: 'Méthodes de Paiement Acceptées', level: 2 },
        { type: 'list', items: ['Mobile money et portefeuilles numériques', 'Cartes de crédit et de débit (Visa, Mastercard)', 'Virements bancaires'] },
        { type: 'heading', text: 'Tarifs', level: 2 },
        { type: 'list', items: ['Gratuit : Sans frais, inclut les fonctionnalités de base', 'Pro : 7,99 $/mois ou 79,99 $/an (économie ~17 %)', 'Entreprise : Tarif sur mesure — contactez notre équipe commerciale'] },
      ]},
    }
  },
  {
    slug: 'resume-review-ai-feedback', category: 'resume-review', popular: false,
    author: { name: 'Sarah Chen', role: 'Content Lead' }, date: '2025-07-04', lastUpdated: '2025-07-05',
    seo: { en: { description: 'Get AI-powered feedback on your resume to improve your chances.', keywords: ['review', 'feedback', 'AI', 'improve'] }, fr: { description: 'Obtenez des retours alimentés par l\'IA sur votre CV pour améliorer vos chances.', keywords: ['révision', 'retours', 'IA', 'améliorer'] } },
    content: {
      en: { title: 'Getting AI Resume Feedback', description: 'Use our AI review feature to get actionable feedback on your resume.', readingTime: 3, body: [
        { type: 'paragraph', text: 'The AI Resume Review feature analyzes your resume and provides detailed feedback on content, structure, and ATS compatibility.' },
        { type: 'heading', text: 'How to Get a Review', level: 2 },
        { type: 'steps', steps: [
          { title: 'Open Your Resume', description: 'Go to your resume in the editor and click "AI Review."' },
          { title: 'Review Feedback', description: 'The AI will analyze your resume and provide specific suggestions organized by category.' },
          { title: 'Apply Suggestions', description: 'Click on any suggestion to apply it directly to your resume, or dismiss it if not relevant.' }
        ]},
        { type: 'callout', variant: 'tip', text: 'Run an AI review after every major edit to ensure your resume stays optimized and error-free.' },
      ]},
      fr: { title: 'Obtenir des Retours IA sur Votre CV', description: 'Utilisez notre fonctionnalité de révision IA pour obtenir des retours exploitables.', readingTime: 3, body: [
        { type: 'paragraph', text: 'La fonctionnalité de Révision IA analyse votre CV et fournit des retours détaillés sur le contenu, la structure et la compatibilité ATS.' },
        { type: 'heading', text: 'Comment Obtenir une Révision', level: 2 },
        { type: 'steps', steps: [
          { title: 'Ouvrez Votre CV', description: 'Allez à votre CV dans l\'éditeur et cliquez sur "Révision IA."' },
          { title: 'Consultez les Retours', description: 'L\'IA analysera votre CV et fournira des suggestions spécifiques.' },
          { title: 'Appliquez les Suggestions', description: 'Cliquez sur une suggestion pour l\'appliquer directement ou ignorez-la.' }
        ]},
      ]},
    }
  },
  {
    slug: 'your-data-and-privacy', category: 'privacy', popular: false,
    author: { name: 'Aminata Diallo', role: 'Support Specialist' }, date: '2025-07-02', lastUpdated: '2025-07-05',
    seo: { en: { description: 'Understand how CareerForge AI handles your personal data.', keywords: ['privacy', 'data', 'GDPR', 'protection'] }, fr: { description: 'Comprenez comment CareerForge AI traite vos données personnelles.', keywords: ['vie privée', 'données', 'RGPD', 'protection'] } },
    content: {
      en: { title: 'Your Data and Privacy', description: 'How we collect, use, and protect your personal information.', readingTime: 4, body: [
        { type: 'paragraph', text: 'At CareerForge AI, we take your privacy seriously. This article summarizes our data practices. For the full details, please read our Privacy Policy.' },
        { type: 'heading', text: 'What We Collect', level: 2 },
        { type: 'list', items: ['Account information: name, email, job title, career level', 'Resume and cover letter content you create', 'Usage analytics (anonymized)', 'Device and browser information'] },
        { type: 'heading', text: 'Your Rights', level: 2 },
        { type: 'list', items: ['Access and download your data at any time', 'Update or correct your personal information', 'Request deletion of your account and data', 'Object to processing for direct marketing', 'Restrict processing in certain circumstances'] },
        { type: 'callout', variant: 'info', text: 'We do not sell your personal data to third parties. Your resume content is never used to train AI models without your explicit consent.' },
      ]},
      fr: { title: 'Vos Données et Votre Vie Privée', description: 'Comment nous collectons, utilisons et protégeons vos informations personnelles.', readingTime: 4, body: [
        { type: 'paragraph', text: 'Chez CareerForge AI, nous prenons votre vie privée au sérieux. Pour les détails complets, veuillez lire notre Politique de Confidentialité.' },
        { type: 'heading', text: 'Ce que Nous Collectons', level: 2 },
        { type: 'list', items: ['Informations de compte : nom, e-mail, titre d\'emploi, niveau de carrière', 'Contenu de CV et lettres de motivation que vous créez', 'Analytiques d\'utilisation (anonymisées)', 'Informations sur l\'appareil et le navigateur'] },
        { type: 'heading', text: 'Vos Droits', level: 2 },
        { type: 'list', items: ['Accéder et télécharger vos données à tout moment', 'Mettre à jour ou corriger vos informations personnelles', 'Demander la suppression de votre compte et de vos données', 'Vous opposer au traitement à des fins de marketing direct', 'Demander la limitation du traitement'] },
      ]},
    }
  },
  {
    slug: 'troubleshooting-common-issues', category: 'technical-issues', popular: false,
    author: { name: 'Aminata Diallo', role: 'Support Specialist' }, date: '2025-07-03', lastUpdated: '2025-07-05',
    seo: { en: { description: 'Solutions to common technical issues with CareerForge AI.', keywords: ['troubleshoot', 'issues', 'fix', 'problem'] }, fr: { description: 'Solutions aux problèmes techniques courants avec CareerForge AI.', keywords: ['dépannage', 'problèmes', 'résoudre'] } },
    content: {
      en: { title: 'Troubleshooting Common Issues', description: 'Solutions for the most frequently encountered technical problems.', readingTime: 4, body: [
        { type: 'paragraph', text: 'If you\'re experiencing technical difficulties, check these common solutions before contacting support.' },
        { type: 'heading', text: 'Page Not Loading', level: 2 },
        { type: 'list', items: ['Clear your browser cache and cookies', 'Try a different browser (Chrome, Firefox, Safari)', 'Check your internet connection', 'Disable browser extensions that might interfere'] },
        { type: 'heading', text: 'PDF Export Issues', level: 2 },
        { type: 'list', items: ['Ensure your browser allows pop-ups from CareerForge AI', 'Try a different browser if the PDF is blank', 'Check that your resume content is not empty'] },
        { type: 'heading', text: 'AI Suggestions Not Working', level: 2 },
        { type: 'list', items: ['Free plan users are limited to 5 AI suggestions per day', 'Check your internet connection for real-time AI features', 'Try refreshing the page and retrying'] },
        { type: 'callout', variant: 'info', text: 'If none of these solutions work, please contact our support team at support@careerforge.ai with a description of the issue and your browser/device information.' },
      ]},
      fr: { title: 'Résoudre les Problèmes Courants', description: 'Solutions aux problèmes techniques les plus fréquemment rencontrés.', readingTime: 4, body: [
        { type: 'paragraph', text: 'Si vous rencontrez des difficultés techniques, vérifiez ces solutions courantes avant de contacter le support.' },
        { type: 'heading', text: 'La Page ne Charge Pas', level: 2 },
        { type: 'list', items: ['Videz le cache et les cookies de votre navigateur', 'Essayez un autre navigateur', 'Vérifiez votre connexion internet', 'Désactivez les extensions de navigateur'] },
        { type: 'heading', text: 'Problèmes d\'Export PDF', level: 2 },
        { type: 'list', items: ['Assurez-vous que votre navigateur autorise les pop-ups', 'Essayez un autre navigateur si le PDF est vide', 'Vérifiez que le contenu de votre CV n\'est pas vide'] },
        { type: 'heading', text: 'Suggestions IA Non Fonctionnelles', level: 2 },
        { type: 'list', items: ['Les utilisateurs du forfait gratuit sont limités à 5 suggestions IA par jour', 'Vérifiez votre connexion internet', 'Essayez de rafraîchir la page'] },
      ]},
    }
  },
  {
    slug: 'getting-started-guide', category: 'getting-started', popular: false,
    author: { name: 'Sarah Chen', role: 'Content Lead' }, date: '2025-06-15', lastUpdated: '2025-07-01',
    seo: { en: { description: 'Complete getting started guide for CareerForge AI.', keywords: ['getting started', 'guide', 'setup', 'beginner'] }, fr: { description: 'Guide complet de démarrage pour CareerForge AI.', keywords: ['premiers pas', 'guide', 'configuration', 'débutant'] } },
    content: {
      en: { title: 'Getting Started with CareerForge AI', description: 'A complete guide to setting up and using CareerForge AI for the first time.', readingTime: 6, body: [
        { type: 'paragraph', text: 'Welcome to CareerForge AI! This guide will walk you through everything you need to get started with our AI-powered career platform.' },
        { type: 'heading', text: 'Create Your Account', level: 2 },
        { type: 'paragraph', text: 'Sign up with your email and password, or use Google or Apple sign-in for faster registration. You\'ll receive a verification email — click the link to verify your account.' },
        { type: 'heading', text: 'Complete Your Profile', level: 2 },
        { type: 'paragraph', text: 'After verification, you\'ll be guided through a quick onboarding process where you\'ll provide:' },
        { type: 'list', items: ['Your name and basic information', 'Your country and location', 'Your current job title', 'Your career level (Student, Graduate, Professional, etc.)', 'Your career goals'] },
        { type: 'heading', text: 'Explore Your Dashboard', level: 2 },
        { type: 'paragraph', text: 'Your dashboard is your command center. From here, you can access all CareerForge AI features including the resume builder, cover letter generator, ATS checker, and job tracker.' },
        { type: 'callout', variant: 'tip', text: 'Start by creating your first resume. The AI will guide you through each section and provide suggestions to make your resume stand out.' },
      ]},
      fr: { title: 'Démarrer avec CareerForge AI', description: 'Un guide complet pour configurer et utiliser CareerForge AI pour la première fois.', readingTime: 6, body: [
        { type: 'paragraph', text: 'Bienvenue sur CareerForge AI ! Ce guide vous accompagnera dans tout ce dont vous avez besoin pour démarrer.' },
        { type: 'heading', text: 'Créez Votre Compte', level: 2 },
        { type: 'paragraph', text: 'Inscrivez-vous avec votre e-mail et mot de passe, ou utilisez la connexion Google ou Apple pour une inscription plus rapide.' },
        { type: 'heading', text: 'Complétez Votre Profil', level: 2 },
        { type: 'list', items: ['Votre nom et informations de base', 'Votre pays et votre localisation', 'Votre titre d\'emploi actuel', 'Votre niveau de carrière', 'Vos objectifs professionnels'] },
        { type: 'heading', text: 'Explorez Votre Tableau de Bord', level: 2 },
        { type: 'paragraph', text: 'Votre tableau de bord est votre centre de commandement. Accédez à toutes les fonctionnalités : constructeur de CV, générateur de lettres de motivation, vérificateur ATS et suivi de candidatures.' },
      ]},
    }
  },
  {
    slug: 'keyword-optimization-tips', category: 'ats-optimization', popular: false,
    author: { name: 'Marcus Johnson', role: 'Career Expert' }, date: '2025-07-01', lastUpdated: '2025-07-05',
    seo: { en: { description: 'Learn how to optimize your resume keywords for ATS systems.', keywords: ['keywords', 'ATS', 'optimization', 'tips'] }, fr: { description: 'Apprenez à optimiser les mots-clés de votre CV pour les systèmes ATS.', keywords: ['mots-clés', 'ATS', 'optimisation', 'conseils'] } },
    content: {
      en: { title: 'Keyword Optimization Tips', description: 'Master the art of keyword optimization to pass ATS screening.', readingTime: 4, body: [
        { type: 'paragraph', text: 'Keywords are the bridge between your resume and the ATS. Here\'s how to optimize them effectively.' },
        { type: 'heading', text: 'Finding the Right Keywords', level: 2 },
        { type: 'list', items: ['Carefully read the job description and identify repeated terms', 'Include both the full term and common acronyms (e.g., "Search Engine Optimization" and "SEO")', 'Use industry-standard job titles and skill names', 'Include both hard skills (technical) and soft skills (interpersonal)'] },
        { type: 'callout', variant: 'tip', text: 'Use CareerForge AI\'s ATS Checker to analyze your resume against a specific job description. It will identify missing keywords and suggest where to add them.' },
      ]},
      fr: { title: 'Conseils d\'Optimisation des Mots-Clés', description: 'Maîtrisez l\'art de l\'optimisation des mots-clés pour passer le filtrage ATS.', readingTime: 4, body: [
        { type: 'paragraph', text: 'Les mots-clés sont le pont entre votre CV et l\'ATS. Voici comment les optimiser efficacement.' },
        { type: 'heading', text: 'Trouver les Bons Mots-Clés', level: 2 },
        { type: 'list', items: ['Lisez attentivement la description d\'emploi et identifiez les termes répétés', 'Incluez le terme complet et les acronymes courants', 'Utilisez des titres d\'emploi et des noms de compétences standard de l\'industrie', 'Incluez les compétences techniques et comportementales'] },
      ]},
    }
  },
  {
    slug: 'two-factor-authentication', category: 'security', popular: false,
    author: { name: 'Aminata Diallo', role: 'Support Specialist' }, date: '2025-07-04', lastUpdated: '2025-07-05',
    seo: { en: { description: 'Learn about account security features and best practices.', keywords: ['security', 'authentication', 'account safety'] }, fr: { description: 'Découvrez les fonctionnalités de sécurité du compte.', keywords: ['sécurité', 'authentification', 'sécurité du compte'] } },
    content: {
      en: { title: 'Account Security Features', description: 'Advanced security features to protect your CareerForge AI account.', readingTime: 3, body: [
        { type: 'paragraph', text: 'CareerForge AI implements multiple layers of security to protect your account and data.' },
        { type: 'heading', text: 'Security Features', level: 2 },
        { type: 'list', items: ['Encrypted password storage using industry-standard hashing', 'Secure session management with automatic timeout', 'Email verification for sensitive actions', 'Regular security audits and monitoring'] },
        { type: 'heading', text: 'If Your Account is Compromised', level: 2 },
        { type: 'steps', steps: [
          { title: 'Change Your Password', description: 'Immediately change your password to a new, strong one.' },
          { title: 'Contact Support', description: 'Email support@careerforge.ai to report the compromise.' },
          { title: 'Review Activity', description: 'Check your account for any unauthorized changes or data access.' }
        ]},
      ]},
      fr: { title: 'Fonctionnalités de Sécurité du Compte', description: 'Des fonctionnalités de sécurité avancées pour protéger votre compte CareerForge AI.', readingTime: 3, body: [
        { type: 'paragraph', text: 'CareerForge AI implémente plusieurs couches de sécurité pour protéger votre compte et vos données.' },
        { type: 'heading', text: 'Fonctionnalités de Sécurité', level: 2 },
        { type: 'list', items: ['Stockage de mot de passe chiffré avec hachage standard de l\'industrie', 'Gestion de session sécurisée avec déconnexion automatique', 'Vérification par e-mail pour les actions sensibles', 'Audits de sécurité réguliers et surveillance'] },
      ]},
    }
  },
  {
    slug: 'understanding-ai-cover-letter', category: 'ai-cover-letter', popular: false,
    author: { name: 'Marcus Johnson', role: 'Career Expert' }, date: '2025-07-03', lastUpdated: '2025-07-05',
    seo: { en: { description: 'How AI generates cover letters and how to use them effectively.', keywords: ['AI', 'cover letter', 'generation', 'personalization'] }, fr: { description: 'Comment l\'IA génère des lettres de motivation et comment les utiliser efficacement.', keywords: ['IA', 'lettre de motivation', 'génération', 'personnalisation'] } },
    content: {
      en: { title: 'How AI Cover Letter Generation Works', description: 'Understanding the technology behind AI-powered cover letters.', readingTime: 4, body: [
        { type: 'paragraph', text: 'CareerForge AI uses advanced language models to generate cover letters that are tailored to your experience and the specific job you\'re applying for.' },
        { type: 'heading', text: 'How It Works', level: 2 },
        { type: 'list', items: ['The AI analyzes your resume to understand your skills, experience, and career trajectory', 'It processes the target job description to identify key requirements and desired qualifications', 'It generates a cover letter that bridges your experience with the job requirements', 'The output is personalized — not a generic template — and highlights your most relevant achievements'] },
        { type: 'callout', variant: 'info', text: 'Your resume data is processed only to generate the cover letter and is not stored or used for any other purpose. We do not use your data to train our AI models.' },
      ]},
      fr: { title: 'Comment Fonctionne la Génération IA de Lettres de Motivation', description: 'Comprendre la technologie derrière les lettres de motivation alimentées par l\'IA.', readingTime: 4, body: [
        { type: 'paragraph', text: 'CareerForge AI utilise des modèles de langage avancés pour générer des lettres de motivation adaptées à votre expérience et au poste spécifique.' },
        { type: 'heading', text: 'Comment Ça Marche', level: 2 },
        { type: 'list', items: ['L\'IA analyse votre CV pour comprendre vos compétences et votre expérience', 'Elle traite la description d\'emploi cible pour identifier les exigences clés', 'Elle génère une lettre de motivation qui relie votre expérience aux exigences du poste', 'Le résultat est personnalisé — pas un modèle générique'] },
      ]},
    }
  },
  {
    slug: 'exporting-and-sharing-resumes', category: 'resume-builder', popular: false,
    author: { name: 'Sarah Chen', role: 'Content Lead' }, date: '2025-07-05', lastUpdated: '2025-07-05',
    seo: { en: { description: 'How to export and share your resumes in different formats.', keywords: ['export', 'PDF', 'share', 'download'] }, fr: { description: 'Comment exporter et partager vos CV dans différents formats.', keywords: ['export', 'PDF', 'partager', 'télécharger'] } },
    content: {
      en: { title: 'Exporting and Sharing Resumes', description: 'Download your resume as a professional PDF or share it directly.', readingTime: 3, body: [
        { type: 'paragraph', text: 'Once your resume is ready, you can export it in professional formats or share it directly with employers.' },
        { type: 'heading', text: 'Export Options', level: 2 },
        { type: 'list', items: ['PDF Export: Generates a clean, ATS-compatible PDF file', 'Direct Link: Share a view-only link to your resume (coming soon)'] },
        { type: 'heading', text: 'Best Practices for Sharing', level: 2 },
        { type: 'list', items: ['Always export as PDF — this preserves formatting across all devices', 'Name your file professionally: "FirstName_LastName_Resume.pdf"', 'Verify the PDF looks correct before sending', 'Keep a backup copy stored safely'] },
      ]},
      fr: { title: 'Exporter et Partager des CV', description: 'Téléchargez votre CV en PDF professionnel ou partagez-le directement.', readingTime: 3, body: [
        { type: 'paragraph', text: 'Une fois votre CV prêt, vous pouvez l\'exporter en formats professionnels ou le partager directement.' },
        { type: 'heading', text: 'Options d\'Export', level: 2 },
        { type: 'list', items: ['Export PDF : Génère un fichier PDF propre et compatible ATS', 'Lien Direct : Partagez un lien en lecture seule (bientôt disponible)'] },
        { type: 'heading', text: 'Bonnes Pratiques pour le Partage', level: 2 },
        { type: 'list', items: ['Exportez toujours en PDF pour préserver le formatage', 'Nommez votre fichier professionnellement', 'Vérifiez que le PDF est correct avant de l\'envoyer', 'Gardez une copie de sauvegarde'] },
      ]},
    }
  },
  {
    slug: 'data-retention-and-deletion', category: 'privacy', popular: false,
    author: { name: 'Aminata Diallo', role: 'Support Specialist' }, date: '2025-07-05', lastUpdated: '2025-07-05',
    seo: { en: { description: 'How long we keep your data and how to request deletion.', keywords: ['data retention', 'deletion', 'GDPR', 'privacy'] }, fr: { description: 'Combien de temps nous conservons vos données et comment demander la suppression.', keywords: ['rétention des données', 'suppression', 'RGPD', 'vie privée'] } },
    content: {
      en: { title: 'Data Retention and Deletion', description: 'Understanding how long we keep your data and your right to deletion.', readingTime: 3, body: [
        { type: 'paragraph', text: 'We retain your data only as long as necessary to provide our services. Here\'s our data retention policy.' },
        { type: 'heading', text: 'Retention Periods', level: 2 },
        { type: 'list', items: ['Active account data: Retained for as long as your account is active', 'Deleted accounts: Data removed from active systems within 30 days, from backups within 90 days', 'Analytics data: Anonymized and retained for up to 2 years for service improvement'] },
        { type: 'heading', text: 'Requesting Data Deletion', level: 2 },
        { type: 'paragraph', text: 'You can request complete data deletion through your account settings or by contacting privacy@careerforge.ai. We will process your request within 30 days.' },
      ]},
      fr: { title: 'Rétention et Suppression des Données', description: 'Comprendre la durée de conservation de vos données et votre droit à la suppression.', readingTime: 3, body: [
        { type: 'paragraph', text: 'Nous conservons vos données uniquement aussi longtemps que nécessaire pour fournir nos services.' },
        { type: 'heading', text: 'Délais de Conservation', level: 2 },
        { type: 'list', items: ['Données de compte actif : Conservées tant que votre compte est actif', 'Comptes supprimés : Données supprimées des systèmes actifs sous 30 jours', 'Données analytiques : Anonymisées et conservées jusqu\'à 2 ans'] },
        { type: 'heading', text: 'Demander la Suppression des Données', level: 2 },
        { type: 'paragraph', text: 'Vous pouvez demander la suppression complète de vos données via les paramètres de votre compte ou en contactant privacy@careerforge.ai.' },
      ]},
    }
  },
];

type Locale = 'en' | 'fr';

export function getArticleBySlug(slug: string, locale: Locale): HelpArticle | undefined {
  return helpArticles.find(a => a.slug === slug);
}

export function getArticlesByCategory(categorySlug: string, locale: Locale): HelpArticle[] {
  return helpArticles.filter(a => a.category === categorySlug);
}

export function getPopularArticles(locale: Locale): HelpArticle[] {
  return helpArticles.filter(a => a.popular);
}

export function searchArticles(query: string, locale: Locale): HelpArticle[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return helpArticles.filter(a => {
    const c = a.content[locale];
    return (
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.body.some(b => {
        if (b.type === 'paragraph' || b.type === 'quote') return b.text.toLowerCase().includes(q);
        if (b.type === 'list') return b.items.some(i => i.toLowerCase().includes(q));
        if (b.type === 'heading') return b.text.toLowerCase().includes(q);
        if (b.type === 'callout') return (b.title + b.text).toLowerCase().includes(q);
        if (b.type === 'steps') return b.steps.some(s => (s.title + s.description).toLowerCase().includes(q));
        return false;
      })
    );
  });
}

export function getRelatedArticles(currentSlug: string, category: string, locale: Locale, limit = 3): HelpArticle[] {
  return helpArticles
    .filter(a => a.slug !== currentSlug && a.category === category)
    .slice(0, limit);
}

export function getAdjacentArticles(slug: string, locale: Locale): { prev?: HelpArticle; next?: HelpArticle } {
  const idx = helpArticles.findIndex(a => a.slug === slug);
  return {
    prev: idx > 0 ? helpArticles[idx - 1] : undefined,
    next: idx < helpArticles.length - 1 ? helpArticles[idx + 1] : undefined,
  };
}