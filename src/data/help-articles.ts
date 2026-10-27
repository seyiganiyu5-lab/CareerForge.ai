import type { HelpCategory, HelpArticle } from '@/types/content';

export const helpCategories: HelpCategory[] = [
  {
    slug: 'getting-started',
    icon: 'Rocket',
    articleCount: 2,
    en: {
      title: 'Getting Started',
      description: 'Learn the basics and set up your Hassify account in minutes.',
    },
    fr: {
      title: 'Prise en Main',
      description: "Apprenez les bases et configurez votre compte Hassify en quelques minutes.",
    },
  },
  {
    slug: 'account-profile',
    icon: 'User',
    articleCount: 2,
    en: {
      title: 'Account & Profile',
      description: 'Manage your account settings, personal information, and preferences.',
    },
    fr: {
      title: 'Compte & Profil',
      description: 'Gérez vos paramètres de compte, vos informations personnelles et vos préférences.',
    },
  },
  {
    slug: 'resume-builder',
    icon: 'FileText',
    articleCount: 3,
    en: {
      title: 'Resume Builder',
      description: 'Create professional resumes with our AI-powered resume builder.',
    },
    fr: {
      title: 'Créateur de CV',
      description: 'Créez des CV professionnels avec notre créateur de CV propulsé par l\'IA.',
    },
  },
  {
    slug: 'ai-cover-letter',
    icon: 'Mail',
    articleCount: 2,
    en: {
      title: 'AI Cover Letter',
      description: 'Generate tailored cover letters that match your resume and job targets.',
    },
    fr: {
      title: 'Lettre de Motivation IA',
      description: 'Générez des lettres de motivation sur mesure qui correspondent à votre CV et à vos objectifs professionnels.',
    },
  },
  {
    slug: 'resume-review',
    icon: 'Star',
    articleCount: 2,
    en: {
      title: 'Resume Review',
      description: 'Get AI-powered feedback and scoring to improve your resume quality.',
    },
    fr: {
      title: 'Revue de CV',
      description: 'Obtenez des commentaires et des scores alimentés par l\'IA pour améliorer la qualité de votre CV.',
    },
  },
  {
    slug: 'ats-optimization',
    icon: 'ShieldCheck',
    articleCount: 2,
    en: {
      title: 'ATS Optimization',
      description: 'Ensure your resume passes Applicant Tracking Systems used by employers.',
    },
    fr: {
      title: 'Optimisation ATS',
      description: 'Assurez-vous que votre CV passe les systèmes de suivi des candidats utilisés par les employeurs.',
    },
  },
  {
    slug: 'templates',
    icon: 'Layout',
    articleCount: 2,
    en: {
      title: 'Templates',
      description: 'Browse and customize professionally designed resume templates.',
    },
    fr: {
      title: 'Modèles',
      description: 'Parcourez et personnalisez des modèles de CV conçus par des professionnels.',
    },
  },
  {
    slug: 'job-tracker',
    icon: 'ListChecks',
    articleCount: 1,
    en: {
      title: 'Job Tracker',
      description: 'Keep track of all your job applications and their statuses in one place.',
    },
    fr: {
      title: 'Suivi de Candidatures',
      description: 'Suivez toutes vos candidatures et leurs statuts au même endroit.',
    },
  },
  {
    slug: 'billing-subscription',
    icon: 'CreditCard',
    articleCount: 2,
    en: {
      title: 'Billing & Subscription',
      description: 'Manage your subscription plan, payments, and billing information.',
    },
    fr: {
      title: 'Facturation & Abonnement',
      description: 'Gérez votre plan d\'abonnement, vos paiements et vos informations de facturation.',
    },
  },
  {
    slug: 'security',
    icon: 'Lock',
    articleCount: 2,
    en: {
      title: 'Security',
      description: 'Learn about how we protect your account and keep your data safe.',
    },
    fr: {
      title: 'Sécurité',
      description: 'Découvrez comment nous protégeons votre compte et gardons vos données en sécurité.',
    },
  },
  {
    slug: 'privacy',
    icon: 'Eye',
    articleCount: 1,
    en: {
      title: 'Privacy',
      description: 'Understand how we collect, use, and protect your personal information.',
    },
    fr: {
      title: 'Confidentialité',
      description: 'Comprenez comment nous collectons, utilisons et protégeons vos informations personnelles.',
    },
  },
  {
    slug: 'technical-issues',
    icon: 'Wrench',
    articleCount: 2,
    en: {
      title: 'Technical Issues',
      description: 'Troubleshoot common technical problems and find browser compatibility info.',
    },
    fr: {
      title: 'Problèmes Techniques',
      description: 'Résolvez les problèmes techniques courants et trouvez des informations sur la compatibilité des navigateurs.',
    },
  },
];

export const helpArticles: HelpArticle[] = [
  // ─── Getting Started ───
  {
    slug: 'how-to-create-first-resume',
    category: 'getting-started',
    author: 'Hassify Team',
    en: {
      title: 'How to Create Your First Resume',
      description: 'A step-by-step guide to building a professional resume from scratch using Hassify.',
      readingTime: '4 min read',
      lastUpdated: '2025-01-15',
      content: {
        intro: 'Creating your first resume can feel overwhelming, but Hassify makes the process simple and intuitive. In this guide, we will walk you through every step to help you build a polished, professional resume that stands out to hiring managers.',
        sections: [
          {
            id: 'step-1-sign-up',
            heading: 'Step 1: Sign Up and Log In',
            body: 'Start by creating your Hassify account. You can sign up using your email address, Google account, or Apple ID. Once registered, log in to access your personal dashboard where all your resumes and tools are organized in one place. The onboarding wizard will ask a few quick questions about your career level and goals to personalize your experience.',
          },
          {
            id: 'step-2-choose-template',
            heading: 'Step 2: Choose a Template',
            body: 'Browse our collection of professionally designed resume templates. Each template is optimized for readability and ATS compatibility. Hover over any template to see a preview, then click to select it. You can always change your template later without losing any of your content, so feel free to experiment until you find the perfect look.',
          },
          {
            id: 'step-3-fill-sections',
            heading: 'Step 3: Fill in Your Information',
            body: 'Hassify breaks your resume into clear sections: personal details, professional summary, work experience, education, and skills. Fill in each section using our guided input fields. As you type, our AI will offer smart suggestions to help you write compelling descriptions of your experience and achievements.',
          },
          {
            id: 'step-4-review-export',
            heading: 'Step 4: Review and Export',
            body: 'Once all sections are complete, use our built-in resume reviewer to check for common issues. The AI will analyze your resume for completeness, action verbs, quantifiable achievements, and ATS compatibility. After making any suggested improvements, export your resume as a PDF in one click. Your resume is now ready to send to employers.',
          },
        ],
        conclusion: 'That is it — your first professional resume is ready in just four simple steps. Remember, you can always come back to edit and update your resume as your career progresses. Hassify saves all your work automatically, so your data is always safe and accessible.',
      },
    },
    fr: {
      title: 'Comment Créer Votre Premier CV',
      description: 'Un guide étape par étape pour créer un CV professionnel à partir de zéro avec Hassify.',
      readingTime: '4 min de lecture',
      lastUpdated: '2025-01-15',
      content: {
        intro: "Créer votre premier CV peut sembler intimidant, mais Hassify simplifie le processus. Dans ce guide, nous vous accompagnerons à chaque étape pour vous aider à construire un CV poli et professionnel qui se démarque auprès des recruteurs.",
        sections: [
          {
            id: 'step-1-sign-up',
            heading: 'Étape 1 : Inscrivez-vous et Connectez-vous',
            body: "Commencez par créer votre compte Hassify. Vous pouvez vous inscrire avec votre adresse e-mail, votre compte Google ou votre identifiant Apple. Une fois inscrit, connectez-vous pour accéder à votre tableau de bord personnel où tous vos CV et outils sont organisés. L'assistant de démarrage posera quelques questions rapides sur votre niveau de carrière et vos objectifs pour personnaliser votre expérience.",
          },
          {
            id: 'step-2-choose-template',
            heading: 'Étape 2 : Choisissez un Modèle',
            body: "Parcourez notre collection de modèles de CV conçus par des professionnels. Chaque modèle est optimisé pour la lisibilité et la compatibilité ATS. Survolez n'importe quel modèle pour voir un aperçu, puis cliquez pour le sélectionner. Vous pouvez toujours changer de modèle plus tard sans perdre votre contenu, alors n'hésitez pas à expérimenter.",
          },
          {
            id: 'step-3-fill-sections',
            heading: 'Étape 3 : Remplissez Vos Informations',
            body: "Hassify divise votre CV en sections claires : coordonnées personnelles, résumé professionnel, expérience de travail, formation et compétences. Remplissez chaque section avec nos champs de saisie guidés. Pendant que vous tapez, notre IA vous proposera des suggestions intelligentes pour vous aider à rédiger des descriptions convaincantes de votre expérience et de vos réalisations.",
          },
          {
            id: 'step-4-review-export',
            heading: 'Étape 4 : Révisez et Exportez',
            body: "Une fois toutes les sections remplies, utilisez notre réviseur de CV intégré pour vérifier les problèmes courants. L'IA analysera votre CV pour sa complétude, l'utilisation de verbes d'action, les réalisations quantifiables et la compatibilité ATS. Après avoir apporté les améliorations suggérées, exportez votre CV en PDF en un clic. Votre CV est prêt à être envoyé aux employeurs.",
          },
        ],
        conclusion: "C'est tout — votre premier CV professionnel est prêt en quatre étapes simples. N'oubliez pas que vous pouvez toujours revenir modifier et mettre à jour votre CV au fil de votre évolution professionnelle. Hassify sauvegarde automatiquement tout votre travail.",
      },
    },
  },
  {
    slug: 'getting-started-guide',
    category: 'getting-started',
    author: 'Hassify Team',
    en: {
      title: 'Getting Started Guide',
      description: 'Everything you need to know to get the most out of Hassify from day one.',
      readingTime: '5 min read',
      lastUpdated: '2025-01-15',
      content: {
        intro: 'Welcome to Hassify! This comprehensive guide covers everything you need to know to hit the ground running. Whether you are a recent graduate, a seasoned professional, or someone switching careers, our platform has the tools to help you land your dream job.',
        sections: [
          {
            id: 'explore-dashboard',
            heading: 'Explore Your Dashboard',
            body: 'After logging in, you will land on your personal dashboard. This is your command center for all career-building activities. From here, you can create new resumes, generate cover letters, track job applications, and access your subscription settings. Take a moment to familiarize yourself with the layout — the sidebar on the left provides quick navigation to all major features.',
          },
          {
            id: 'ai-features',
            heading: 'Understand AI-Powered Features',
            body: 'Hassify uses advanced artificial intelligence to enhance every part of your job search. Our AI can write professional summaries, suggest action verbs for your experience descriptions, generate tailored cover letters, score your resume for ATS compatibility, and provide personalized improvement tips. These features work together to ensure your application materials are as strong as possible.',
          },
          {
            id: 'language-support',
            heading: 'Language Support',
            body: 'Hassify supports both English and French. You can switch languages at any time using the language toggle in the navigation bar. All help articles, interface text, and AI-generated content are available in both languages. This makes it easy to create bilingual resumes or work in the language that is most comfortable for you.',
          },
          {
            id: 'free-vs-premium',
            heading: 'Free vs. Premium Plans',
            body: 'The free plan lets you create 1 resume and up to 3 cover letters with basic AI assistance. The Premium plan unlocks unlimited creations, advanced AI features, priority support, and access to all premium templates. You can upgrade at any time from your account settings or the pricing page.',
          },
          {
            id: 'next-steps',
            heading: 'Recommended Next Steps',
            body: 'We suggest starting by creating your first resume using the AI Resume Builder. Then, generate a matching cover letter for a specific job posting. Use the Resume Review tool to check your work, and set up the Job Tracker to monitor your applications. These four steps will give you a complete, professional job application toolkit.',
          },
        ],
        conclusion: 'You are now ready to make the most of Hassify. If you have any questions along the way, our Help Center is always available with detailed guides for every feature. Happy job hunting!',
      },
    },
    fr: {
      title: 'Guide de Prise en Main',
      description: 'Tout ce que vous devez savoir pour tirer le meilleur parti de Hassify dès le premier jour.',
      readingTime: '5 min de lecture',
      lastUpdated: '2025-01-15',
      content: {
        intro: "Bienvenue sur Hassify ! Ce guide complet couvre tout ce que vous devez savoir pour bien démarrer. Que vous soyez un jeune diplômé, un professionnel expérimenté ou en reconversion, notre plateforme possède les outils pour vous aider à décrocher l'emploi de vos rêves.",
        sections: [
          {
            id: 'explore-dashboard',
            heading: 'Explorez Votre Tableau de Bord',
            body: "Après vous être connecté, vous arriverez sur votre tableau de bord personnel. C'est votre centre de commandement pour toutes les activités de développement de carrière. Depuis ici, vous pouvez créer de nouveaux CV, générer des lettres de motivation, suivre vos candidatures et accéder aux paramètres de votre abonnement. Prenez un moment pour vous familiariser avec l'interface.",
          },
          {
            id: 'ai-features',
            heading: 'Comprenez les Fonctionnalités Alimentées par l\'IA',
            body: "Hassify utilise une intelligence artificielle avancée pour améliorer chaque étape de votre recherche d'emploi. Notre IA peut rédiger des résumés professionnels, suggérer des verbes d'action pour vos descriptions d'expérience, générer des lettres de motivation personnalisées, évaluer votre CV pour la compatibilité ATS et fournir des conseils d'amélioration personnalisés.",
          },
          {
            id: 'language-support',
            heading: 'Support Multilingue',
            body: "Hassify prend en charge l'anglais et le français. Vous pouvez changer de langue à tout moment en utilisant le sélecteur dans la barre de navigation. Tous les articles d'aide, les textes de l'interface et le contenu généré par l'IA sont disponibles dans les deux langues.",
          },
          {
            id: 'free-vs-premium',
            heading: 'Plans Gratuit et Premium',
            body: "Le plan gratuit vous permet de créer 1 CV et jusqu'à 3 lettres de motivation avec une assistance IA de base. Le plan Premium débloque les créations illimitées, les fonctionnalités IA avancées, le support prioritaire et l'accès à tous les modèles premium. Vous pouvez passer à la version supérieure à tout moment.",
          },
          {
            id: 'next-steps',
            heading: 'Prochaines Étapes Recommandées',
            body: "Nous vous suggérons de commencer par créer votre premier CV avec le Créateur de CV IA. Ensuite, générez une lettre de motivation correspondante pour une annonce spécifique. Utilisez l'outil de Revue de CV pour vérifier votre travail, et configurez le Suivi de Candidatures pour surveiller vos applications.",
          },
        ],
        conclusion: "Vous êtes maintenant prêt à tirer le meilleur parti de Hassify. Si vous avez des questions en cours de route, notre Centre d'Aide est toujours disponible avec des guides détaillés pour chaque fonctionnalité. Bonne recherche d'emploi !",
      },
    },
  },

  // ─── Account & Profile ───
  {
    slug: 'edit-your-profile',
    category: 'account-profile',
    author: 'Hassify Team',
    en: {
      title: 'Edit Your Profile',
      description: 'Learn how to update your personal information, profile picture, and account preferences.',
      readingTime: '3 min read',
      lastUpdated: '2025-01-15',
      content: {
        intro: 'Keeping your profile information up to date ensures that Hassify can personalize your experience and generate the most relevant resume content. This guide explains how to edit every aspect of your profile.',
        sections: [
          {
            id: 'access-profile',
            heading: 'Accessing Your Profile Settings',
            body: 'To edit your profile, click on your avatar or name in the top-right corner of the navigation bar and select "Profile Settings" from the dropdown menu. This will take you to the profile editing page where you can update all your personal information, including your name, email address, phone number, and location.',
          },
          {
            id: 'profile-picture',
            heading: 'Updating Your Profile Picture',
            body: 'A professional profile picture helps personalize your account. Click on the camera icon overlaying your current avatar to upload a new photo. We recommend using a clear, recent headshot with a plain background. Supported formats include JPG, PNG, and WebP, with a maximum file size of 5 MB. The image will be automatically cropped to a circle.',
          },
          {
            id: 'notification-preferences',
            heading: 'Managing Notification Preferences',
            body: 'In your profile settings, you can control which email notifications you receive. Options include job application reminders, resume tips, product updates, and marketing communications. Toggle each option on or off based on your preferences. We recommend keeping at least the application reminders enabled so you never miss a deadline.',
          },
          {
            id: 'save-changes',
            heading: 'Saving Your Changes',
            body: 'After making edits to any section, click the "Save Changes" button at the bottom of the page. Your updates will be applied immediately across all Hassify tools. If you navigate away without saving, a confirmation prompt will remind you to save your unsaved changes to prevent accidental data loss.',
          },
        ],
        conclusion: 'A well-maintained profile helps our AI generate more accurate and personalized content for your resumes and cover letters. We recommend reviewing your profile at least once a quarter to keep your information current.',
      },
    },
    fr: {
      title: 'Modifier Votre Profil',
      description: 'Apprenez à mettre à jour vos informations personnelles, votre photo de profil et vos préférences de compte.',
      readingTime: '3 min de lecture',
      lastUpdated: '2025-01-15',
      content: {
        intro: "Maintenir vos informations de profil à jour garantit que Hassify peut personnaliser votre expérience et générer le contenu de CV le plus pertinent. Ce guide explique comment modifier chaque aspect de votre profil.",
        sections: [
          {
            id: 'access-profile',
            heading: 'Accéder aux Paramètres de Profil',
            body: "Pour modifier votre profil, cliquez sur votre avatar ou votre nom dans le coin supérieur droit de la barre de navigation et sélectionnez « Paramètres du Profil » dans le menu déroulant. Vous accéderez à la page d'édition de profil où vous pourrez mettre à jour toutes vos informations personnelles.",
          },
          {
            id: 'profile-picture',
            heading: 'Mettre à Jour Votre Photo de Profil',
            body: "Une photo de profil professionnelle aide à personnaliser votre compte. Cliquez sur l'icône de l'appareil photo superposée à votre avatar actuel pour télécharger une nouvelle photo. Nous recommandons d'utiliser un portrait clair et récent sur fond uni. Les formats pris en charge incluent JPG, PNG et WebP, avec une taille maximale de 5 Mo.",
          },
          {
            id: 'notification-preferences',
            heading: 'Gérer les Préférences de Notification',
            body: "Dans les paramètres de votre profil, vous pouvez contrôler quelles notifications par e-mail vous recevez. Les options incluent les rappels de candidature, les conseils de CV, les mises à jour du produit et les communications marketing. Activez ou désactivez chaque option selon vos préférences.",
          },
          {
            id: 'save-changes',
            heading: 'Sauvegarder Vos Modifications',
            body: "Après avoir modifié une section, cliquez sur le bouton « Sauvegarder les Modifications » en bas de la page. Vos mises à jour seront appliquées immédiatement sur tous les outils Hassify. Si vous naviguez sans sauvegarder, une invite de confirmation vous rappellera de sauvegarder.",
          },
        ],
        conclusion: "Un profil bien entretenu aide notre IA à générer du contenu plus précis et personnalisé pour vos CV et lettres de motivation. Nous recommandons de vérifier votre profil au moins une fois par trimestre.",
      },
    },
  },
  {
    slug: 'delete-your-account',
    category: 'account-profile',
    author: 'Hassify Team',
    en: {
      title: 'Delete Your Account',
      description: 'Understand the account deletion process and what happens to your data when you leave.',
      readingTime: '3 min read',
      lastUpdated: '2025-01-15',
      content: {
        intro: 'We understand that you may decide to close your Hassify account. This guide explains the account deletion process, what data is affected, and how to download your information before leaving.',
        sections: [
          {
            id: 'before-deleting',
            heading: 'Before You Delete Your Account',
            body: 'Before proceeding, we strongly recommend downloading all your resumes and cover letters. Go to your dashboard, open each document, and export it as a PDF. Once your account is deleted, all saved resumes, cover letters, job tracker data, and profile information will be permanently removed from our servers. This action cannot be undone.',
          },
          {
            id: 'deletion-steps',
            heading: 'How to Delete Your Account',
            body: 'Navigate to "Profile Settings" from your account menu. Scroll down to the "Danger Zone" section at the bottom of the page. Click the "Delete Account" button. You will be asked to confirm by typing your email address. After confirmation, your account will be scheduled for deletion. You will receive a final confirmation email, and you have 30 days to contact support if you change your mind.',
          },
          {
            id: 'data-retention',
            heading: 'What Happens to Your Data',
            body: 'Upon account deletion, we permanently erase all personal data, resumes, cover letters, and application tracking records from our active databases. Anonymous, aggregated usage statistics that cannot be linked back to you may be retained for analytical purposes. Payment records are kept for a minimum of 12 months as required by financial regulations, but these records do not contain your resume content.',
          },
        ],
        conclusion: 'If you are experiencing issues that are prompting you to consider deletion, please contact our support team first. We may be able to resolve your concerns and keep you as a valued member of the Hassify community.',
      },
    },
    fr: {
      title: 'Supprimer Votre Compte',
      description: 'Comprenez le processus de suppression de compte et ce qui arrive à vos données lorsque vous partez.',
      readingTime: '3 min de lecture',
      lastUpdated: '2025-01-15',
      content: {
        intro: "Nous comprenons que vous pouvez décider de fermer votre compte Hassify. Ce guide explique le processus de suppression de compte, les données concernées et comment télécharger vos informations avant de partir.",
        sections: [
          {
            id: 'before-deleting',
            heading: 'Avant de Supprimer Votre Compte',
            body: "Avant de procéder, nous vous recommandons vivement de télécharger tous vos CV et lettres de motivation. Accédez à votre tableau de bord, ouvrez chaque document et exportez-le en PDF. Une fois votre compte supprimé, tous les CV sauvegardés, lettres de motivation, données du suivi de candidatures et informations de profil seront définitivement supprimés de nos serveurs. Cette action est irréversible.",
          },
          {
            id: 'deletion-steps',
            heading: 'Comment Supprimer Votre Compte',
            body: "Accédez aux « Paramètres du Profil » depuis votre menu de compte. Faites défiler jusqu'à la section « Zone Dangereuse » en bas de la page. Cliquez sur le bouton « Supprimer le Compte ». Vous devrez confirmer en tapant votre adresse e-mail. Après confirmation, votre compte sera programmé pour la suppression. Vous recevrez un e-mail de confirmation final et avez 30 jours pour contacter le support si vous changez d'avis.",
          },
          {
            id: 'data-retention',
            heading: 'Ce Qui Arrive à Vos Données',
            body: "Lors de la suppression du compte, nous effaçons définitivement toutes les données personnelles, CV, lettres de motivation et enregistrements de suivi de candidatures de nos bases de données actives. Des statistiques d'utilisation anonymisées et agrégées peuvent être conservées à des fins analytiques. Les enregistrements de paiement sont conservés pendant un minimum de 12 mois conformément aux réglementations financières.",
          },
        ],
        conclusion: "Si vous rencontrez des problèmes qui vous poussent à envisager la suppression, veuillez d'abord contacter notre équipe de support. Nous pourrons peut-être résoudre vos préoccupations et vous garder comme membre précieux de la communauté Hassify.",
      },
    },
  },

  // ─── Resume Builder ───
  {
    slug: 'ai-resume-builder-guide',
    category: 'resume-builder',
    author: 'Hassify Team',
    en: {
      title: 'AI Resume Builder Guide',
      description: 'Master the AI-powered resume builder to create compelling, job-winning resumes.',
      readingTime: '5 min read',
      lastUpdated: '2025-01-15',
      content: {
        intro: 'The AI Resume Builder is the heart of Hassify. It combines intelligent writing assistance with a drag-and-drop editor to help you create professional resumes in a fraction of the time it would take manually. This guide covers all the features and best practices for getting the best results.',
        sections: [
          {
            id: 'ai-assistant',
            heading: 'How the AI Assistant Works',
            body: 'As you fill in your resume sections, the AI assistant analyzes your input in real time. For work experience, it suggests action-oriented bullet points based on your job title and industry. For the professional summary, it generates a compelling overview based on your career highlights. The AI draws from a database of successful resumes and current hiring trends to provide relevant, modern suggestions.',
          },
          {
            id: 'section-management',
            heading: 'Managing Resume Sections',
            body: 'Your resume is divided into standard sections: Contact Information, Professional Summary, Work Experience, Education, and Skills. You can add custom sections such as Certifications, Languages, Volunteer Work, or Projects. Each section can be reordered by clicking and dragging the handle on the left. To remove a section, click the three-dot menu and select "Remove." The AI will adjust its suggestions based on which sections you include.',
          },
          {
            id: 'ai-writing-tips',
            heading: 'Tips for Best AI Results',
            body: 'For the most accurate AI suggestions, provide specific details. Instead of writing "managed a team," write "managed a team of 12 engineers across 3 projects." Include numbers, metrics, and specific technologies wherever possible. The more context you give the AI, the better its output will be. You can always edit AI-generated text to add your personal voice and ensure complete accuracy.',
          },
          {
            id: 'real-time-preview',
            heading: 'Real-Time Preview',
            body: 'As you edit, the resume preview updates in real time on the right side of the screen. This lets you see exactly how your resume will look when exported. You can toggle between editing and preview modes, or use the split-view layout to see both simultaneously. The preview accurately reflects your chosen template, fonts, and spacing.',
          },
        ],
        conclusion: 'The AI Resume Builder is designed to save you hours of writing time while producing resumes that outperform manually written ones. Experiment with different sections and AI suggestions to find the combination that best represents your unique professional story.',
      },
    },
    fr: {
      title: 'Guide du Créateur de CV IA',
      description: 'Maîtrisez le créateur de CV alimenté par l\'IA pour créer des CV convaincants et gagnants.',
      readingTime: '5 min de lecture',
      lastUpdated: '2025-01-15',
      content: {
        intro: "Le Créateur de CV IA est le cœur de Hassify. Il combine une assistance rédactionnelle intelligente avec un éditor glisser-déposer pour vous aider à créer des CV professionnels en une fraction du temps nécessaire manuellement. Ce guide couvre toutes les fonctionnalités et les meilleures pratiques pour obtenir les meilleurs résultats.",
        sections: [
          {
            id: 'ai-assistant',
            heading: 'Comment Fonctionne l\'Assistant IA',
            body: "Pendant que vous remplissez les sections de votre CV, l'assistant IA analyse votre saisie en temps réel. Pour l'expérience professionnelle, il suggère des puces orientées action basées sur votre titre d'emploi et votre industrie. Pour le résumé professionnel, il génère un aperçu convaincant basé sur vos points forts. L'IA s'appuie sur une base de données de CV réussis et des tendances d'embauche actuelles.",
          },
          {
            id: 'section-management',
            heading: 'Gestion des Sections du CV',
            body: "Votre CV est divisé en sections standard : Coordonnées, Résumé Professionnel, Expérience de Travail, Formation et Compétences. Vous pouvez ajouter des sections personnalisées telles que Certifications, Langues, Travail Bénévole ou Projets. Chaque section peut être réorganisée par glisser-déposer. L'IA ajuste ses suggestions en fonction des sections que vous incluez.",
          },
          {
            id: 'ai-writing-tips',
            heading: 'Conseils pour de Meilleurs Résultats IA',
            body: "Pour des suggestions IA plus précises, fournissez des détails spécifiques. Au lieu d'écrire « gérait une équipe », écrivez « gérait une équipe de 12 ingénieurs sur 3 projets ». Incluez des chiffres, des métriques et des technologies spécifiques autant que possible. Plus vous donnez de contexte à l'IA, meilleur sera son résultat.",
          },
          {
            id: 'real-time-preview',
            heading: 'Aperçu en Temps Réel',
            body: "Pendant que vous éditez, l'aperçu du CV se met à jour en temps réel sur le côté droit de l'écran. Cela vous permet de voir exactement comment votre CV apparaîtra lors de l'exportation. Vous pouvez basculer entre les modes édition et aperçu, ou utiliser la présentation divisée pour voir les deux simultanément.",
          },
        ],
        conclusion: "Le Créateur de CV IA est conçu pour vous faire gagner des heures de rédaction tout en produisant des CV qui surpassent ceux écrits manuellement. Expérimentez avec différentes sections et suggestions IA pour trouver la combinaison qui représente le mieux votre histoire professionnelle unique.",
      },
    },
  },
  {
    slug: 'customize-resume-sections',
    category: 'resume-builder',
    author: 'Hassify Team',
    en: {
      title: 'Customize Resume Sections',
      description: 'Learn how to add, remove, reorder, and fine-tune every section of your resume.',
      readingTime: '4 min read',
      lastUpdated: '2025-01-15',
      content: {
        intro: 'Every career is unique, and your resume should reflect that. Hassify gives you full control over every section of your resume, from the standard work experience block to custom sections for certifications, publications, or volunteer work.',
        sections: [
          {
            id: 'reorder-sections',
            heading: 'Reordering Sections',
            body: 'The order of sections on your resume matters. For most professionals, work experience should come first. Recent graduates may want to place education before experience. To reorder sections, click and hold the drag handle on the left side of any section header, then drag it to your desired position. The preview updates instantly to reflect the new layout.',
          },
          {
            id: 'add-custom-sections',
            heading: 'Adding Custom Sections',
            body: 'Click the "Add Section" button at the bottom of the resume editor to see available custom sections. Options include Certifications, Languages, Projects, Volunteer Experience, Publications, Awards, and Professional Affiliations. Each custom section comes with pre-built fields optimized for that type of content. You can add multiple instances of the same section type if needed.',
          },
          {
            id: 'tune-content',
            heading: 'Fine-Tuning Content Within Sections',
            body: 'Within each section, you can adjust the level of detail shown. Use the "Expand" and "Collapse" toggles to show or hide individual entries. For work experience, you can choose whether to display the location and employment dates. The AI can also help you adjust the tone — switch between formal, modern, and concise writing styles using the tone selector at the top of the editor.',
          },
        ],
        conclusion: 'A well-structured resume with the right sections in the right order can significantly improve your chances of getting noticed by recruiters. Take time to experiment with different arrangements to find what works best for your specific career situation.',
      },
    },
    fr: {
      title: 'Personnaliser les Sections du CV',
      description: 'Apprenez à ajouter, supprimer, réorganiser et affiner chaque section de votre CV.',
      readingTime: '4 min de lecture',
      lastUpdated: '2025-01-15',
      content: {
        intro: "Chaque carrière est unique, et votre CV devrait le refléter. Hassify vous donne un contrôle total sur chaque section de votre CV, de la section d'expérience standard aux sections personnalisées pour les certifications ou le travail bénévole.",
        sections: [
          {
            id: 'reorder-sections',
            heading: 'Réorganiser les Sections',
            body: "L'ordre des sections de votre CV est important. Pour la plupart des professionnels, l'expérience de travail devrait venir en premier. Les jeunes diplômés peuvent placer la formation avant l'expérience. Pour réorganiser les sections, cliquez et maintenez la poignée de glissement à gauche de l'en-tête de section, puis déplacez-la à la position souhaitée.",
          },
          {
            id: 'add-custom-sections',
            heading: 'Ajouter des Sections Personnalisées',
            body: "Cliquez sur le bouton « Ajouter une Section » en bas de l'éditeur de CV pour voir les sections personnalisées disponibles. Les options incluent Certifications, Langues, Projets, Expérience Bénévole, Publications, Prix et Affiliations Professionnelles. Chaque section personnalisée est livrée avec des champs préconstruits optimisés pour ce type de contenu.",
          },
          {
            id: 'tune-content',
            heading: 'Affiner le Contenu des Sections',
            body: "Dans chaque section, vous pouvez ajuster le niveau de détail affiché. Utilisez les boutons « Développer » et « Réduire » pour afficher ou masquer des entrées individuelles. Pour l'expérience de travail, vous pouvez choisir d'afficher le lieu et les dates d'emploi. L'IA peut également vous aider à ajuster le ton avec le sélecteur de style en haut de l'éditeur.",
          },
        ],
        conclusion: "Un CV bien structuré avec les bonnes sections dans le bon ordre peut améliorer considérablement vos chances d'être remarqué par les recruteurs. Prenez le temps d'expérimenter avec différents arrangements pour trouver ce qui fonctionne le mieux pour votre situation professionnelle.",
      },
    },
  },
  {
    slug: 'export-resume-pdf',
    category: 'resume-builder',
    author: 'Hassify Team',
    en: {
      title: 'Export Your Resume as PDF',
      description: 'How to download your finished resume in PDF format for job applications.',
      readingTime: '2 min read',
      lastUpdated: '2025-01-15',
      content: {
        intro: 'Once your resume is complete, exporting it as a PDF is the final step before submitting it to employers. PDF is the most widely accepted format because it preserves your exact formatting across all devices and operating systems.',
        sections: [
          {
            id: 'export-steps',
            heading: 'Steps to Export',
            body: 'Open your completed resume in the editor and click the "Export" button in the top-right corner. Select "PDF" as the format. You can choose to export with or without a watermark (premium only removes watermarks). Click "Download" and the PDF will be saved to your device. The file will be named using your full name and the word "Resume" for easy identification.',
          },
          {
            id: 'format-options',
            heading: 'Format Options',
            body: 'Hassify currently supports PDF export. We chose PDF as the primary format because it is the industry standard for job applications. PDF files maintain consistent formatting regardless of the software or device used to view them, ensuring your resume looks exactly as you designed it. We are working on adding additional format options in future updates.',
          },
          {
            id: 'quality-check',
            heading: 'Before You Send',
            body: 'Before submitting your exported PDF, open it in your default PDF viewer to do a final visual check. Verify that all text is readable, formatting is consistent, and nothing is cut off. Check that the file size is reasonable — typically under 2 MB. If the file seems too large, try reducing the number of images or using a simpler template.',
          },
        ],
        conclusion: 'Exporting your resume as a PDF ensures maximum compatibility with employer application systems. Always send your resume in PDF format unless an employer specifically requests a different format.',
      },
    },
    fr: {
      title: 'Exporter Votre CV en PDF',
      description: 'Comment télécharger votre CV terminé au format PDF pour vos candidatures.',
      readingTime: '2 min de lecture',
      lastUpdated: '2025-01-15',
      content: {
        intro: "Une fois votre CV terminé, l'exporter en PDF est la dernière étape avant de le soumettre aux employeurs. Le PDF est le format le plus largement accepté car il préserve votre mise en forme exacte sur tous les appareils et systèmes d'exploitation.",
        sections: [
          {
            id: 'export-steps',
            heading: 'Étapes d\'Exportation',
            body: "Ouvrez votre CV terminé dans l'éditeur et cliquez sur le bouton « Exporter » dans le coin supérieur droit. Sélectionnez « PDF » comme format. Vous pouvez choisir d'exporter avec ou sans filigrane (seul le premium supprime les filigranes). Cliquez sur « Télécharger » et le PDF sera sauvegardé sur votre appareil.",
          },
          {
            id: 'format-options',
            heading: 'Options de Format',
            body: "Hassify prend actuellement en charge l'exportation PDF. Nous avons choisi le PDF comme format principal car c'est la norme de l'industrie pour les candidatures. Les fichiers PDF maintiennent une mise en forme cohérente quel que soit le logiciel ou l'appareil utilisé pour les afficher.",
          },
          {
            id: 'quality-check',
            heading: 'Avant d\'Envoyer',
            body: "Avant de soumettre votre PDF exporté, ouvrez-le dans votre visionneuse PDF par défaut pour un contrôle visuel final. Vérifiez que tout le texte est lisible, que la mise en forme est cohérente et que rien n'est coupé. Vérifiez que la taille du fichier est raisonnable — généralement inférieure à 2 Mo.",
          },
        ],
        conclusion: "Exporter votre CV en PDF garantit une compatibilité maximale avec les systèmes de candidature des employeurs. Envoyez toujours votre CV au format PDF sauf si un employeur demande spécifiquement un autre format.",
      },
    },
  },

  // ─── AI Cover Letter ───
  {
    slug: 'generate-cover-letter',
    category: 'ai-cover-letter',
    author: 'Hassify Team',
    en: {
      title: 'Generate a Cover Letter with AI',
      description: 'Create a personalized, job-specific cover letter in seconds using our AI generator.',
      readingTime: '4 min read',
      lastUpdated: '2025-01-15',
      content: {
        intro: 'A well-crafted cover letter can be the difference between getting an interview and being overlooked. Hassify generates tailored cover letters that complement your resume and target specific job openings, saving you time while maintaining a professional, personalized touch.',
        sections: [
          {
            id: 'how-generation-works',
            heading: 'How Cover Letter Generation Works',
            body: 'Navigate to the "Cover Letter" section from your dashboard. Paste the job description of the position you are applying for into the provided field. The AI will analyze the job requirements, compare them with your resume data, and generate a cover letter that highlights your most relevant qualifications. The entire process takes just a few seconds.',
          },
          {
            id: 'input-quality',
            heading: 'Providing Quality Input',
            body: 'The quality of the generated cover letter depends heavily on the quality of your input. Make sure your resume is complete and up to date before generating a cover letter. When pasting the job description, include the full text — requirements, responsibilities, and qualifications. The more information the AI has, the more targeted and compelling the cover letter will be.',
          },
          {
            id: 'customization',
            heading: 'Customizing the Output',
            body: 'After generation, you can edit the cover letter directly in the editor. The AI provides a strong foundation, but adding a personal anecdote or specific reference to the company can make your letter stand out. You can also adjust the tone — choose between formal, enthusiastic, or concise styles. Each regeneration will produce a slightly different version, so feel free to generate multiple times and combine the best parts.',
          },
        ],
        conclusion: 'AI-generated cover letters are a powerful starting point, but always review and personalize them before sending. A cover letter that reflects your genuine voice and enthusiasm will always make a stronger impression than a generic one.',
      },
    },
    fr: {
      title: 'Générer une Lettre de Motivation avec l\'IA',
      description: 'Créez une lettre de motivation personnalisée et spécifique à un emploi en quelques secondes.',
      readingTime: '4 min de lecture',
      lastUpdated: '2025-01-15',
      content: {
        intro: "Une lettre de motivation bien rédigée peut faire la différence entre obtenir un entretien et être ignoré. Hassify génère des lettres de motivation sur mesure qui complètent votre CV et ciblent des offres d'emploi spécifiques, vous faisant gagner du temps tout en conservant un ton professionnel et personnalisé.",
        sections: [
          {
            id: 'how-generation-works',
            heading: 'Comment Fonctionne la Génération',
            body: "Accédez à la section « Lettre de Motivation » depuis votre tableau de bord. Collez la description de poste dans le champ prévu. L'IA analysera les exigences du poste, les comparera aux données de votre CV et générera une lettre de motivation mettant en valeur vos qualifications les plus pertinentes. Le processus ne prend que quelques secondes.",
          },
          {
            id: 'input-quality',
            heading: 'Fournir des Données de Qualité',
            body: "La qualité de la lettre de motivation générée dépend fortement de la qualité de vos données d'entrée. Assurez-vous que votre CV est complet et à jour avant de générer une lettre. Lorsque vous collez la description de poste, incluez le texte complet — exigences, responsabilités et qualifications. Plus l'IA dispose d'informations, plus la lettre sera ciblée et convaincante.",
          },
          {
            id: 'customization',
            heading: 'Personnaliser le Résultat',
            body: "Après la génération, vous pouvez modifier la lettre directement dans l'éditeur. L'IA fournit une base solide, mais ajouter une anecdote personnelle ou une référence spécifique à l'entreprise peut faire ressortir votre lettre. Vous pouvez également ajuster le ton — choisissez entre les styles formel, enthousiaste ou concis. N'hésitez pas à générer plusieurs fois et à combiner les meilleures parties.",
          },
        ],
        conclusion: "Les lettres de motivation générées par l'IA sont un point de départ puissant, mais révisez toujours et personnalisez-les avant de les envoyer. Une lettre qui reflète votre voix authentique et votre enthousiasme fera toujours plus d'impression qu'une lettre générique.",
      },
    },
  },
  {
    slug: 'customize-cover-letter',
    category: 'ai-cover-letter',
    author: 'Hassify Team',
    en: {
      title: 'Customize Your Cover Letter',
      description: 'Edit and personalize your AI-generated cover letter to make it truly your own.',
      readingTime: '3 min read',
      lastUpdated: '2025-01-15',
      content: {
        intro: 'While our AI generates excellent cover letter drafts, adding your personal touch makes all the difference. This guide shows you how to effectively customize an AI-generated cover letter to maximize its impact.',
        sections: [
          {
            id: 'editing-basics',
            heading: 'Editing Basics',
            body: 'After generating your cover letter, click anywhere in the text to start editing. The editor works like a standard word processor — you can type, delete, and format text freely. The left panel shows the job description for quick reference while you edit. Changes are auto-saved every 30 seconds, but you can also save manually using the keyboard shortcut Ctrl+S (Cmd+S on Mac).',
          },
          {
            id: 'tone-adjustment',
            heading: 'Adjusting Tone and Style',
            body: 'Use the tone selector at the top of the editor to change the overall writing style. Options include "Professional" for corporate roles, "Creative" for design or marketing positions, "Technical" for engineering roles, and "Warm" for people-facing positions. The AI will regenerate the letter with the new tone while preserving your manual edits where possible.',
          },
          {
            id: 'personal-touches',
            heading: 'Adding Personal Touches',
            body: 'The most effective cover letters include specific details that show genuine interest in the company. Add a sentence about why you admire the company, reference a recent project or news article, or mention a shared value. These personal touches demonstrate that you have done your research and are not simply sending a mass-produced letter. Keep personal additions concise and relevant to the role.',
          },
        ],
        conclusion: 'The best cover letters balance professional structure with genuine personal expression. Use the AI draft as your foundation, then add enough personalization to make the letter unmistakably yours before sending.',
      },
    },
    fr: {
      title: 'Personnaliser Votre Lettre de Motivation',
      description: 'Modifiez et personnalisez votre lettre de motivation générée par l\'IA pour la rendre véritablement vôtre.',
      readingTime: '3 min de lecture',
      lastUpdated: '2025-01-15',
      content: {
        intro: "Bien que notre IA génère d'excellents brouillons de lettres de motivation, ajouter votre touche personnelle fait toute la différence. Ce guide vous montre comment personnaliser efficacement une lettre de motivation générée par l'IA pour maximiser son impact.",
        sections: [
          {
            id: 'editing-basics',
            heading: 'Bases de l\'Édition',
            body: "Après avoir généré votre lettre de motivation, cliquez n'importe où dans le texte pour commencer l'édition. L'éditeur fonctionne comme un traitement de texte standard. Le panneau gauche affiche la description de poste pour une référence rapide. Les modifications sont sauvegardées automatiquement toutes les 30 secondes.",
          },
          {
            id: 'tone-adjustment',
            heading: 'Ajuster le Ton et le Style',
            body: "Utilisez le sélecteur de ton en haut de l'éditeur pour changer le style d'écriture global. Les options incluent « Professionnel » pour les postes corporatifs, « Créatif » pour les postes de design ou marketing, « Technique » pour les postes d'ingénierie et « Chaleureux » pour les postes en contact avec le public. L'IA régénérera la lettre avec le nouveau ton tout en préservant vos modifications manuelles.",
          },
          {
            id: 'personal-touches',
            heading: 'Ajouter des Touches Personnelles',
            body: "Les lettres de motivation les plus efficaces incluent des détails spécifiques montrant un intérêt sincère pour l'entreprise. Ajoutez une phrase sur les raisons pour lesquelles vous admirez l'entreprise, référez-vous à un projet récent ou mentionnez une valeur partagée. Ces touches personnelles démontrent que vous avez fait vos recherches. Gardez les ajouts personnels concis et pertinents pour le poste.",
          },
        ],
        conclusion: "Les meilleures lettres de motivation équilibrent structure professionnelle et expression personnelle authentique. Utilisez le brouillon IA comme base, puis ajoutez suffisamment de personnalisation pour rendre la lettre incontestablement vôtre avant de l'envoyer.",
      },
    },
  },

  // ─── Resume Review ───
  {
    slug: 'ai-resume-review',
    category: 'resume-review',
    author: 'Hassify Team',
    en: {
      title: 'AI Resume Review',
      description: 'Get detailed AI-powered feedback on your resume with actionable improvement suggestions.',
      readingTime: '4 min read',
      lastUpdated: '2025-01-15',
      content: {
        intro: 'The AI Resume Review is a powerful tool that analyzes your resume against industry best practices and provides a comprehensive score along with specific, actionable feedback. Think of it as having a professional career coach review your resume in seconds.',
        sections: [
          {
            id: 'how-review-works',
            heading: 'How the Review Works',
            body: 'Open any resume in the editor and click the "Review" button in the toolbar. The AI will scan your resume across multiple dimensions: content completeness, action verb usage, quantifiable achievements, formatting consistency, ATS compatibility, and overall impact. Within a few seconds, you will receive a detailed report with an overall score from 0 to 100 and specific suggestions for improvement.',
          },
          {
            id: 'understanding-scores',
            heading: 'Understanding Your Score',
            body: 'Scores above 80 indicate a strong resume that is well-optimized for both human readers and ATS systems. Scores between 60 and 80 suggest room for improvement but are generally competitive. Scores below 60 indicate significant issues that should be addressed before applying. The score breakdown shows individual category scores so you can prioritize which areas to improve first.',
          },
          {
            id: 'implementing-feedback',
            heading: 'Implementing the Feedback',
            body: 'Each suggestion in the review report includes a "Fix" button. Clicking it will automatically apply the suggested change to your resume. For example, if the AI detects weak bullet points, clicking "Fix" will replace them with stronger, action-oriented alternatives. You can accept or reject each change individually, giving you full control over the final result.',
          },
        ],
        conclusion: 'We recommend running a resume review before every job application. Job requirements vary, and a quick review ensures your resume is tailored to each specific opportunity. Regular reviews also help you continuously improve your resume over time.',
      },
    },
    fr: {
      title: 'Revue de CV par l\'IA',
      description: 'Obtenez des commentaires détaillés sur votre CV avec des suggestions d\'amélioration concrètes.',
      readingTime: '4 min de lecture',
      lastUpdated: '2025-01-15',
      content: {
        intro: "La Revue de CV IA est un outil puissant qui analyse votre CV par rapport aux meilleures pratiques de l'industrie et fournit un score complet avec des commentaires spécifiques et actionnables. Pensez-y comme avoir un coach de carrière professionnel qui révise votre CV en quelques secondes.",
        sections: [
          {
            id: 'how-review-works',
            heading: 'Comment Fonctionne la Revue',
            body: "Ouvrez n'importe quel CV dans l'éditeur et cliquez sur le bouton « Réviser » dans la barre d'outils. L'IA analysera votre CV sur plusieurs dimensions : complétude du contenu, utilisation de verbes d'action, réalisations quantifiables, cohérence de la mise en forme, compatibilité ATS et impact global. En quelques secondes, vous recevrez un rapport détaillé avec un score global de 0 à 100.",
          },
          {
            id: 'understanding-scores',
            heading: 'Comprendre Votre Score',
            body: "Les scores supérieurs à 80 indiquent un CV solide bien optimisé pour les lecteurs humains et les systèmes ATS. Les scores entre 60 et 80 suggèrent des possibilités d'amélioration mais sont généralement compétitifs. Les scores inférieurs à 60 indiquent des problèmes significatifs à adresser avant de postuler.",
          },
          {
            id: 'implementing-feedback',
            heading: 'Mettre en Œuvre les Commentaires',
            body: "Chaque suggestion du rapport de revue inclut un bouton « Corriger ». En cliquant dessus, la modification suggérée sera automatiquement appliquée à votre CV. Vous pouvez accepter ou rejeter chaque modification individuellement, vous donnant un contrôle total sur le résultat final.",
          },
        ],
        conclusion: "Nous recommandons d'effectuer une revue de CV avant chaque candidature. Les exigences des postes varient, et une revue rapide garantit que votre CV est adapté à chaque opportunité spécifique. Les revues régulières vous aident également à améliorer continuellement votre CV au fil du temps.",
      },
    },
  },
  {
    slug: 'improve-resume-score',
    category: 'resume-review',
    author: 'Hassify Team',
    en: {
      title: 'Improve Your Resume Score',
      description: 'Proven strategies to boost your resume review score and stand out to employers.',
      readingTime: '4 min read',
      lastUpdated: '2025-01-15',
      content: {
        intro: 'If your resume score is not where you want it to be, do not worry. Here are the most effective strategies to improve your score based on the most common issues our AI detects across thousands of resumes.',
        sections: [
          {
            id: 'use-action-verbs',
            heading: 'Start Bullet Points with Action Verbs',
            body: 'The single most impactful change you can make is replacing weak openings like "Responsible for" or "Worked on" with strong action verbs. Examples include "Spearheaded," "Optimized," "Delivered," "Implemented," and "Transformed." Action verbs immediately convey leadership and impact, making your achievements feel more significant. Aim to use a variety of action verbs rather than repeating the same ones.',
          },
          {
            id: 'quantify-achievements',
            heading: 'Quantify Your Achievements',
            body: 'Numbers make your accomplishments concrete and credible. Instead of "Improved team performance," write "Improved team performance by 35% through implementing weekly sprint reviews." Whenever possible, include metrics such as percentage increases, dollar amounts, team sizes, project timelines, or the number of clients served. Our AI gives significantly higher scores to bullet points that include quantifiable results.',
          },
          {
            id: 'optimize-summary',
            heading: 'Write a Strong Professional Summary',
            body: 'Your professional summary is the first thing recruiters read, so make it count. Keep it to 2-3 sentences that highlight your years of experience, key skills, and career goals. Avoid generic statements like "Hardworking professional seeking new opportunities." Instead, be specific: "Senior software engineer with 8 years of experience building scalable web applications, specializing in React and Node.js." The AI scores summaries based on specificity and relevance.',
          },
          {
            id: 'formatting-tips',
            heading: 'Formatting Best Practices',
            body: 'Consistent formatting signals attention to detail. Use the same font size for all section headings, consistent bullet point styles, and uniform date formatting throughout. Avoid using more than two font types. Keep margins between 0.5 and 1 inch. Ensure adequate white space — a cramped resume is hard to read. The AI checks for these formatting consistencies and deducts points for inconsistencies.',
          },
        ],
        conclusion: 'Improving your resume score is an iterative process. Make the changes suggested by the AI, run another review, and repeat until you are satisfied with the results. Most users can improve their score by 20-30 points with just a few targeted edits.',
      },
    },
    fr: {
      title: 'Améliorer le Score de Votre CV',
      description: 'Des stratégies éprouvées pour booster le score de revue de votre CV et vous démarquer.',
      readingTime: '4 min de lecture',
      lastUpdated: '2025-01-15',
      content: {
        intro: "Si le score de votre CV n'est pas celui que vous souhaitez, ne vous inquiétez pas. Voici les stratégies les plus efficaces pour améliorer votre score, basées sur les problèmes les plus courants détectés par notre IA sur des milliers de CV.",
        sections: [
          {
            id: 'use-action-verbs',
            heading: 'Commencez les Puces par des Verbes d\'Action',
            body: "Le changement le plus impactant que vous puissiez faire est de remplacer les ouvertures faibles comme « Responsable de » ou « A travaillé sur » par des verbes d'action forts. Des exemples incluent « Piloté », « Optimisé », « Livré », « Implémenté » et « Transformé ». Visez à utiliser une variété de verbes d'action plutôt que de répéter les mêmes.",
          },
          {
            id: 'quantify-achievements',
            heading: 'Quantifiez Vos Réalisations',
            body: "Les chiffres rendent vos accomplissements concrets et crédibles. Au lieu de « Amélioré la performance de l'équipe », écrivez « Amélioré la performance de l'équipe de 35% grâce à la mise en place de revues de sprint hebdomadaires. » Incluez des métriques telles que des pourcentages d'augmentation, des montants en dollars, des tailles d'équipe ou des délais de projet.",
          },
          {
            id: 'optimize-summary',
            heading: 'Rédigez un Résumé Professionnel Solide',
            body: "Votre résumé professionnel est la première chose que les recruteurs lisent, alors faites-le compter. Limitez-le à 2-3 phrases mettant en valeur vos années d'expérience, vos compétences clés et vos objectifs de carrière. Évitez les déclarations génériques. Soyez spécifique et pertinent. L'IA évalue les résumés en fonction de leur spécificité et de leur pertinence.",
          },
          {
            id: 'formatting-tips',
            heading: 'Bonnes Pratiques de Mise en Forme',
            body: "Une mise en forme cohérente signale l'attention aux détails. Utilisez la même taille de police pour tous les titres de section, des styles de puces cohérents et un formatage de dates uniforme. Évitez d'utiliser plus de deux types de police. Gardez des marges entre 0,5 et 1 pouce. Assurez un espacement blanc adéquat.",
          },
        ],
        conclusion: "Améliorer le score de votre CV est un processus itératif. Apportez les modifications suggérées par l'IA, relancez une revue et répétez jusqu'à ce que vous soyez satisfait des résultats. La plupart des utilisateurs peuvent améliorer leur score de 20 à 30 points avec seulement quelques modifications ciblées.",
      },
    },
  },

  // ─── ATS Optimization ───
  {
    slug: 'what-is-ats',
    category: 'ats-optimization',
    author: 'Hassify Team',
    en: {
      title: 'What Is ATS?',
      description: 'Understand Applicant Tracking Systems and why ATS-friendly resumes get more interviews.',
      readingTime: '4 min read',
      lastUpdated: '2025-01-15',
      content: {
        intro: 'Applicant Tracking Systems (ATS) are software applications used by employers to manage the hiring process. Understanding how ATS works is essential because an estimated 75% of resumes are filtered by these systems before a human ever sees them.',
        sections: [
          {
            id: 'how-ats-works',
            heading: 'How ATS Works',
            body: 'When you submit your resume online, it typically goes into an ATS database first. The system parses your resume, extracting information like your name, contact details, work history, education, and skills into structured data fields. It then ranks resumes based on keyword matches with the job description. Only the top-ranked resumes are usually forwarded to hiring managers for review.',
          },
          {
            id: 'common-ats-problems',
            heading: 'Common ATS Problems',
            body: 'Many well-designed resumes fail ATS screening due to avoidable issues. Common problems include: using graphics, tables, or text boxes that the ATS cannot read; using non-standard section headings like "My Journey" instead of "Work Experience"; including headers and footers with important information; using unusual file formats; and having multiple columns. These elements can scramble the parsing process and cause your resume to be ranked lower or rejected entirely.',
          },
          {
            id: 'hassify-advantage',
            heading: 'How Hassify Helps',
            body: 'Every template in Hassify is designed to be ATS-friendly. We avoid graphics, tables, and complex layouts that confuse parsing software. Our AI also analyzes job descriptions and suggests relevant keywords to include in your resume, increasing your match rate. The ATS score in our review tool shows exactly how well your resume will perform when processed by an Applicant Tracking System, so you can optimize before applying.',
          },
        ],
        conclusion: 'Do not let your resume be rejected by a robot before a human reads it. By using ATS-optimized templates and including the right keywords, you can dramatically increase your chances of passing automated screening and reaching the hiring manager.',
      },
    },
    fr: {
      title: 'Qu\'est-ce que l\'ATS ?',
      description: 'Comprenez les Systèmes de Suivi des Candidats et pourquoi les CV compatibles ATS obtiennent plus d\'entretiens.',
      readingTime: '4 min de lecture',
      lastUpdated: '2025-01-15',
      content: {
        intro: "Les Systèmes de Suivi des Candidats (ATS) sont des applications logicielles utilisées par les employeurs pour gérer le processus de recrutement. Comprendre le fonctionnement de l'ATS est essentiel car environ 75% des CV sont filtrés par ces systèmes avant qu'un humain ne les voie.",
        sections: [
          {
            id: 'how-ats-works',
            heading: 'Comment Fonctionne l\'ATS',
            body: "Lorsque vous soumettez votre CV en ligne, il passe d'abord dans une base de données ATS. Le système analyse votre CV, extrayant des informations comme votre nom, vos coordonnées, votre historique de travail, votre formation et vos compétences dans des champs de données structurées. Il classe ensuite les CV en fonction des correspondances de mots-clés avec la description de poste.",
          },
          {
            id: 'common-ats-problems',
            heading: 'Problèmes ATS Courants',
            body: "Beaucoup de CV bien conçus échouent au filtrage ATS en raison de problèmes évitables. Les problèmes courants incluent : l'utilisation de graphiques, tableaux ou zones de texte que l'ATS ne peut pas lire ; l'utilisation d'en-têtes de section non standard ; l'inclusion d'en-têtes et de pieds de page avec des informations importantes ; et l'utilisation de formats de fichier inhabituels.",
          },
          {
            id: 'hassify-advantage',
            heading: 'Comment Hassify Aide',
            body: "Chaque modèle dans Hassify est conçu pour être compatible ATS. Nous évitons les graphiques, tableaux et mises en page complexes qui confondent le logiciel d'analyse. Notre IA analyse également les descriptions de poste et suggère des mots-clés pertinents à inclure dans votre CV. Le score ATS dans notre outil de revue montre exactement comment votre CV performera lorsqu'il sera traité par un ATS.",
          },
        ],
        conclusion: "Ne laissez pas votre CV être rejeté par un robot avant qu'un humain ne le lise. En utilisant des modèles optimisés ATS et en incluant les bons mots-clés, vous pouvez augmenter considérablement vos chances de passer le filtrage automatisé et d'atteindre le responsable du recrutement.",
      },
    },
  },
  {
    slug: 'optimize-resume-ats',
    category: 'ats-optimization',
    author: 'Hassify Team',
    en: {
      title: 'Optimize Your Resume for ATS',
      description: 'Step-by-step instructions to make your resume ATS-friendly and increase your match rate.',
      readingTime: '4 min read',
      lastUpdated: '2025-01-15',
      content: {
        intro: 'Optimizing your resume for Applicant Tracking Systems does not mean sacrificing visual appeal. With Hassify, you can have a resume that looks great to human readers while also scoring high in ATS screening. Here is how.',
        sections: [
          {
            id: 'keyword-strategy',
            heading: 'Keyword Optimization Strategy',
            body: 'Start by carefully reading the job description. Identify the key skills, qualifications, and technologies mentioned. These are your target keywords. Incorporate them naturally throughout your resume — in your skills section, work experience bullet points, and professional summary. Do not simply stuff keywords; use them in context. For example, if the job requires "project management," mention a specific project you managed with measurable results.',
          },
          {
            id: 'formatting-rules',
            heading: 'ATS-Friendly Formatting Rules',
            body: 'Stick to these formatting rules for maximum ATS compatibility: use standard section headings (Experience, Education, Skills); avoid columns, tables, and text boxes; use standard fonts like Arial, Calibri, or Times New Roman; do not use headers or footers for important information; save and submit as PDF (unless otherwise specified); and keep the layout single-column and left-aligned.',
          },
          {
            id: 'using-ats-checker',
            heading: 'Using the ATS Checker',
            body: 'Hassify includes a built-in ATS checker that simulates how major ATS systems will parse and score your resume. Paste the job description into the ATS checker tool, and it will compare your resume against the job requirements. You will receive an ATS match percentage, a list of missing keywords, and specific suggestions to improve your score. Run this check for every job application to maximize your chances.',
          },
        ],
        conclusion: 'ATS optimization is not a one-time task — it should be done for each job application. The effort is worth it: ATS-optimized resumes are up to 3 times more likely to be seen by a hiring manager. Let Hassify handle the technical side while you focus on crafting great content.',
      },
    },
    fr: {
      title: 'Optimiser Votre CV pour l\'ATS',
      description: 'Instructions étape par étape pour rendre votre CV compatible ATS et augmenter votre taux de correspondance.',
      readingTime: '4 min de lecture',
      lastUpdated: '2025-01-15',
      content: {
        intro: "Optimiser votre CV pour les Systèmes de Suivi des Candidats ne signifie pas sacrifier l'attrait visuel. Avec Hassify, vous pouvez avoir un CV qui est à la fois beau pour les lecteurs humains et bien classé dans le filtrage ATS. Voici comment.",
        sections: [
          {
            id: 'keyword-strategy',
            heading: 'Stratégie d\'Optimisation des Mots-Clés',
            body: "Commencez par lire attentivement la description de poste. Identifiez les compétences clés, les qualifications et les technologies mentionnées. Ce sont vos mots-clés cibles. Intégrez-les naturellement dans votre CV — dans votre section compétences, les puces d'expérience et le résumé professionnel. N'accumulez pas les mots-clés ; utilisez-les en contexte.",
          },
          {
            id: 'formatting-rules',
            heading: 'Règles de Mise en Forme Compatible ATS',
            body: "Respectez ces règles de mise en forme pour une compatibilité ATS maximale : utilisez des en-têtes de section standard ; évitez les colonnes, tableaux et zones de texte ; utilisez des polices standard comme Arial, Calibri ou Times New Roman ; n'utilisez pas d'en-têtes ou de pieds de page pour les informations importantes ; et sauvegardez en PDF.",
          },
          {
            id: 'using-ats-checker',
            heading: 'Utilisation du Vérificateur ATS',
            body: "Hassify inclut un vérificateur ATS intégré qui simule la façon dont les principaux systèmes ATS analyseront et noteront votre CV. Collez la description de poste dans l'outil de vérification ATS, et il comparera votre CV aux exigences du poste. Vous recevrez un pourcentage de correspondance ATS, une liste des mots-clés manquants et des suggestions spécifiques pour améliorer votre score.",
          },
        ],
        conclusion: "L'optimisation ATS n'est pas une tâche ponctuelle — elle doit être effectuée pour chaque candidature. L'effort en vaut la peine : les CV optimisés pour l'ATS ont jusqu'à 3 fois plus de chances d'être vus par un responsable du recrutement. Laissez Hassify gérer le côté technique pendant que vous vous concentrez sur la création d'un excellent contenu.",
      },
    },
  },

  // ─── Templates ───
  {
    slug: 'choose-right-template',
    category: 'templates',
    author: 'Hassify Team',
    en: {
      title: 'Choose the Right Template',
      description: 'Find the perfect resume template for your industry, experience level, and career goals.',
      readingTime: '3 min read',
      lastUpdated: '2025-01-15',
      content: {
        intro: 'Your resume template sets the first visual impression for recruiters. Choosing the right one can make a significant difference in how your qualifications are perceived. Hassify offers a curated selection of templates, each designed for specific career situations.',
        sections: [
          {
            id: 'template-categories',
            heading: 'Template Categories',
            body: 'Our templates are organized into categories to help you find the right fit quickly. "Professional" templates are ideal for corporate roles in finance, law, and management. "Creative" templates work well for design, marketing, and media positions. "Technical" templates are optimized for engineering and IT roles with dedicated sections for technical skills. "Minimalist" templates offer a clean, modern look that works across most industries. "Executive" templates are designed for senior-level professionals with extensive experience.',
          },
          {
            id: 'experience-considerations',
            heading: 'Consider Your Experience Level',
            body: 'If you are a recent graduate or entry-level candidate, choose a template that places education near the top. For mid-career professionals, templates that emphasize work experience are ideal. Senior executives should opt for templates that provide ample space for leadership accomplishments and strategic initiatives. Hassify automatically suggests templates based on the career level you select during onboarding.',
          },
          {
            id: 'switch-templates',
            heading: 'Switching Templates Anytime',
            body: 'You are never locked into a template choice. At any point during the editing process, you can click the "Change Template" button to browse and select a different design. Your content will be automatically transferred to the new template, preserving all your text and data. This makes it easy to compare how your resume looks in different styles before exporting.',
          },
        ],
        conclusion: 'The best template is one that presents your qualifications clearly and professionally while matching the expectations of your target industry. Take a few minutes to browse all options — the right template can give your job search a powerful head start.',
      },
    },
    fr: {
      title: 'Choisir le Bon Modèle',
      description: 'Trouvez le modèle de CV parfait pour votre industrie, votre niveau d\'expérience et vos objectifs de carrière.',
      readingTime: '3 min de lecture',
      lastUpdated: '2025-01-15',
      content: {
        intro: "Le modèle de votre CV donne la première impression visuelle aux recruteurs. Choisir le bon peut faire une différence significative dans la façon dont vos qualifications sont perçues. Hassify propose une sélection soignée de modèles, chacun conçu pour des situations de carrière spécifiques.",
        sections: [
          {
            id: 'template-categories',
            heading: 'Catégories de Modèles',
            body: "Nos modèles sont organisés en catégories pour vous aider à trouver rapidement celui qui vous convient. Les modèles « Professionnel » sont idéaux pour les postes corporatifs en finance, droit et gestion. Les modèles « Créatif » fonctionnent bien pour les postes de design, marketing et média. Les modèles « Technique » sont optimisés pour les postes d'ingénierie et d'informatique.",
          },
          {
            id: 'experience-considerations',
            heading: 'Considérez Votre Niveau d\'Expérience',
            body: "Si vous êtes un jeune diplômé ou un candidat de niveau débutant, choisissez un modèle qui place la formation en haut. Pour les professionnels en milieu de carrière, les modèles qui mettent l'accent sur l'expérience de travail sont idéaux. Les cadres supérieurs devraient opter pour des modèles offrant beaucoup d'espace pour les accomplissements de leadership.",
          },
          {
            id: 'switch-templates',
            heading: 'Changer de Modèle à Tout Moment',
            body: "Vous n'êtes jamais enfermé dans un choix de modèle. À tout moment, vous pouvez cliquer sur le bouton « Changer de Modèle » pour parcourir et sélectionner un autre design. Votre contenu sera automatiquement transféré au nouveau modèle, préservant tout votre texte et vos données.",
          },
        ],
        conclusion: "Le meilleur modèle est celui qui présente vos qualifications clairement et professionnellement tout en correspondant aux attentes de votre industrie cible. Prenez quelques minutes pour parcourir toutes les options — le bon modèle peut donner un puissant coup d'avance à votre recherche d'emploi.",
      },
    },
  },
  {
    slug: 'customize-template',
    category: 'templates',
    author: 'Hassify Team',
    en: {
      title: 'Customize Your Template',
      description: 'Personalize colors, fonts, and layout options to make your resume uniquely yours.',
      readingTime: '3 min read',
      lastUpdated: '2025-01-15',
      content: {
        intro: 'While Hassify templates look great out of the box, customizing them to reflect your personal brand can help you stand out even more. Our template customization options give you control over colors, fonts, and layout without breaking the ATS-friendly structure.',
        sections: [
          {
            id: 'color-customization',
            heading: 'Color Customization',
            body: 'Click the "Customize" button while editing your resume to access the color picker. You can change the accent color used for headings, borders, and section dividers. We recommend choosing a color that complements your target industry — navy blue for finance, forest green for healthcare, or charcoal for law. Avoid overly bright or neon colors. Stick to one accent color for a cohesive, professional look.',
          },
          {
            id: 'font-options',
            heading: 'Font Options',
            body: 'Each template comes with a recommended font pairing, but you can customize these in the settings panel. Choose from our curated list of professional fonts that are web-safe and ATS-compatible. For headings, slightly bolder fonts work well, while body text should use clean, highly readable typefaces. Ensure there is a clear size contrast between headings (14-16pt) and body text (10-12pt) for good visual hierarchy.',
          },
          {
            id: 'layout-adjustments',
            heading: 'Layout Adjustments',
            body: 'Adjust margins, line spacing, and section padding from the layout settings. Increasing margins creates a more open, breathable feel, while tighter spacing allows you to fit more content on a single page. The ideal resume length is one page for less than 10 years of experience and two pages for more senior roles. Use the page count indicator to ensure your resume fits the recommended length.',
          },
        ],
        conclusion: 'Template customization is about finding the right balance between personal expression and professional standards. Small, thoughtful adjustments to color, font, and spacing can transform a good resume into a great one while keeping it ATS-compatible.',
      },
    },
    fr: {
      title: 'Personnaliser Votre Modèle',
      description: 'Personnalisez les couleurs, les polices et les options de mise en page pour rendre votre CV unique.',
      readingTime: '3 min de lecture',
      lastUpdated: '2025-01-15',
      content: {
        intro: "Bien que les modèles Hassify soient beaux tels quels, les personnaliser pour refléter votre marque personnelle peut vous aider à vous démarquer davantage. Nos options de personnalisation vous donnent le contrôle sur les couleurs, les polices et la mise en page sans compromettre la structure compatible ATS.",
        sections: [
          {
            id: 'color-customization',
            heading: 'Personnalisation des Couleurs',
            body: "Cliquez sur le bouton « Personnaliser » lors de l'édition de votre CV pour accéder au sélecteur de couleurs. Vous pouvez changer la couleur d'accent utilisée pour les titres, les bordures et les séparateurs de section. Nous recommandons de choisir une couleur qui complète votre industrie cible — bleu marine pour la finance, vert forêt pour la santé ou charbon pour le droit.",
          },
          {
            id: 'font-options',
            heading: 'Options de Polices',
            body: "Chaque modèle est livré avec une paire de polices recommandée, mais vous pouvez les personnaliser dans le panneau des paramètres. Choisissez parmi notre liste de polices professionnelles qui sont sûres pour le web et compatibles ATS. Pour les titres, des polices légèrement plus grasses fonctionnent bien, tandis que le corps du texte devrait utiliser des typographies propres et très lisibles.",
          },
          {
            id: 'layout-adjustments',
            heading: 'Ajustements de Mise en Page',
            body: "Ajustez les marges, l'espacement des lignes et le remplissage des sections depuis les paramètres de mise en page. L'augmentation des marges crée une sensation plus ouverte, tandis qu'un espacement plus serré vous permet de placer plus de contenu sur une seule page. La longueur idéale d'un CV est d'une page pour moins de 10 ans d'expérience et de deux pages pour les rôles plus seniors.",
          },
        ],
        conclusion: "La personnalisation de modèle consiste à trouver le bon équilibre entre expression personnelle et normes professionnelles. De petits ajustements réfléchis aux couleurs, aux polices et à l'espacement peuvent transformer un bon CV en un excellent tout en le gardant compatible ATS.",
      },
    },
  },

  // ─── Job Tracker ───
  {
    slug: 'track-applications',
    category: 'job-tracker',
    author: 'Hassify Team',
    en: {
      title: 'Track Your Job Applications',
      description: 'Use the Job Tracker to organize and monitor all your job applications in one place.',
      readingTime: '3 min read',
      lastUpdated: '2025-01-15',
      content: {
        intro: 'Keeping track of multiple job applications can quickly become overwhelming. The Hassify Job Tracker simplifies this process by giving you a centralized dashboard to manage every application from initial submission to final decision.',
        sections: [
          {
            id: 'adding-applications',
            heading: 'Adding Applications',
            body: 'To add a new application, click the "Add Application" button on the Job Tracker page. Fill in the company name, job title, application URL, and the date you applied. You can also attach the resume and cover letter you submitted for easy reference. If you applied through the platform, applications can be linked automatically when you export a resume directly from a job-specific cover letter.',
          },
          {
            id: 'status-tracking',
            heading: 'Status Tracking',
            body: 'Each application has a status that you can update as you progress through the hiring process. Available statuses include: Applied, Phone Screen, Interview, Technical Assessment, Offer, Rejected, and Withdrawn. Simply click the status badge on any application card to cycle through the stages. The dashboard provides a visual overview of where you stand across all applications.',
          },
          {
            id: 'notes-reminders',
            heading: 'Notes and Reminders',
            body: 'Add notes to any application to record interview details, recruiter names, or follow-up tasks. Set reminder dates to prompt yourself to follow up if you have not heard back within a certain timeframe. The tracker will send you email notifications when a reminder is due. This ensures you never miss an opportunity to reconnect with a potential employer.',
          },
        ],
        conclusion: 'The Job Tracker transforms the chaos of a multi-application job search into an organized, manageable process. By centralizing all your application data, you can follow up strategically and make informed decisions about where to focus your efforts.',
      },
    },
    fr: {
      title: 'Suivre Vos Candidatures',
      description: 'Utilisez le Suivi de Candidatures pour organiser et surveiller toutes vos candidatures au même endroit.',
      readingTime: '3 min de lecture',
      lastUpdated: '2025-01-15',
      content: {
        intro: "Suivre plusieurs candidatures peut rapidement devenir écrasant. Le Suivi de Candidatures de Hassify simplifie ce processus en vous donnant un tableau de bord centralisé pour gérer chaque candidature de la soumission initiale à la décision finale.",
        sections: [
          {
            id: 'adding-applications',
            heading: 'Ajouter des Candidatures',
            body: "Pour ajouter une nouvelle candidature, cliquez sur le bouton « Ajouter une Candidature » sur la page du Suivi. Remplissez le nom de l'entreprise, le titre du poste, l'URL de candidature et la date de votre candidature. Vous pouvez également joindre le CV et la lettre de motivation que vous avez soumis pour une référence facile.",
          },
          {
            id: 'status-tracking',
            heading: 'Suivi du Statut',
            body: "Chaque candidature a un statut que vous pouvez mettre à jour au fur et à mesure que vous progressez dans le processus de recrutement. Les statuts disponibles incluent : Candidaté, Entretien Téléphonique, Entretien, Évaluation Technique, Offre, Rejeté et Retiré. Cliquez sur le badge de statut pour faire défiler les étapes.",
          },
          {
            id: 'notes-reminders',
            heading: 'Notes et Rappels',
            body: "Ajoutez des notes à n'importe quelle candidature pour enregistrer les détails d'entretien, les noms des recruteurs ou les tâches de suivi. Définissez des dates de rappel pour vous inciter à faire un suivi si vous n'avez pas reçu de réponse dans un certain délai. Le suivi vous enverra des notifications par e-mail lorsqu'un rappel est dû.",
          },
        ],
        conclusion: "Le Suivi de Candidatures transforme le chaos d'une recherche d'emploi multi-candidatures en un processus organisé et gérable. En centralisant toutes vos données de candidature, vous pouvez faire des suivis stratégiques et prendre des décisions éclairées sur la concentration de vos efforts.",
      },
    },
  },

  // ─── Billing & Subscription ───
  {
    slug: 'subscription-plans',
    category: 'billing-subscription',
    author: 'Hassify Team',
    en: {
      title: 'Subscription Plans',
      description: 'Compare our Free and Premium plans to find the best fit for your job search needs.',
      readingTime: '3 min read',
      lastUpdated: '2025-01-15',
      content: {
        intro: 'Hassify offers two subscription tiers designed to support job seekers at every stage. Whether you are just starting out or actively applying to multiple positions, we have a plan that fits your needs and budget.',
        sections: [
          {
            id: 'free-plan',
            heading: 'Free Plan',
            body: 'The Free plan is perfect for exploring Hassify and creating your first documents. It includes 1 resume creation, 3 cover letter generations, access to 3 basic templates, and basic ATS checking. The free plan does not expire and has no credit card requirement. It is a great way to experience the platform before committing.',
          },
          {
            id: 'premium-plan',
            heading: 'Premium Plan',
            body: 'The Premium plan unlocks the full power of Hassify. It includes unlimited resume creations, unlimited AI cover letter generations, access to all templates including premium designs, unlimited AI reviews and ATS checks, priority customer support, and the ability to export without watermarks. Premium plans are available as monthly or annual subscriptions, with the annual option offering significant savings.',
          },
          {
            id: 'managing-subscription',
            heading: 'Managing Your Subscription',
            body: 'View and manage your subscription from the "Billing" section in your account settings. Here you can see your current plan, billing history, next payment date, and update your payment method. If you upgrade from Free to Premium, you will be charged immediately and gain instant access to all premium features. Downgrading takes effect at the end of your current billing period.',
          },
        ],
        conclusion: 'Investing in a Premium subscription often pays for itself with the very first interview you land. The time saved on resume writing and the quality improvement in your application materials can significantly accelerate your job search.',
      },
    },
    fr: {
      title: 'Plans d\'Abonnement',
      description: 'Comparez nos plans Gratuit et Premium pour trouver celui qui correspond le mieux à vos besoins.',
      readingTime: '3 min de lecture',
      lastUpdated: '2025-01-15',
      content: {
        intro: "Hassify propose deux niveaux d'abonnement conçus pour accompagner les chercheurs d'emploi à chaque étape. Que vous commenciez tout juste ou que vous postuliez activement à plusieurs postes, nous avons un plan qui correspond à vos besoins et à votre budget.",
        sections: [
          {
            id: 'free-plan',
            heading: 'Plan Gratuit',
            body: "Le plan Gratuit est parfait pour explorer Hassify et créer vos premiers documents. Il inclut 1 création de CV, 3 générations de lettres de motivation, l'accès à 3 modèles de base et la vérification ATS de base. Le plan gratuit n'expire pas et ne nécessite pas de carte de crédit.",
          },
          {
            id: 'premium-plan',
            heading: 'Plan Premium',
            body: "Le plan Premium débloque toute la puissance de Hassify. Il inclut des créations de CV illimitées, des générations de lettres de motivation IA illimitées, l'accès à tous les modèles y compris les designs premium, des revues IA et des vérifications ATS illimitées, le support client prioritaire et la possibilité d'exporter sans filigrane. Les plans premium sont disponibles en abonnements mensuels ou annuels.",
          },
          {
            id: 'managing-subscription',
            heading: 'Gérer Votre Abonnement',
            body: "Consultez et gérez votre abonnement depuis la section « Facturation » dans les paramètres de votre compte. Vous pouvez y voir votre plan actuel, votre historique de facturation, la date du prochain paiement et mettre à jour votre méthode de paiement. Si vous passez du Gratuit au Premium, vous serez facturé immédiatement et obtiendrez un accès instantané à toutes les fonctionnalités premium.",
          },
        ],
        conclusion: "Investir dans un abonnement Premium se rembourse souvent dès le premier entretien obtenu. Le temps économisé sur la rédaction de CV et l'amélioration de la qualité de vos documents de candidature peuvent accélérer considérablement votre recherche d'emploi.",
      },
    },
  },
  {
    slug: 'cancel-subscription',
    category: 'billing-subscription',
    author: 'Hassify Team',
    en: {
      title: 'Cancel Your Subscription',
      description: 'How to cancel your Premium plan and what happens to your data and access.',
      readingTime: '2 min read',
      lastUpdated: '2025-01-15',
      content: {
        intro: 'We understand that circumstances change, and you may need to cancel your Premium subscription. This guide explains the cancellation process and what to expect after cancellation.',
        sections: [
          {
            id: 'cancellation-steps',
            heading: 'How to Cancel',
            body: 'Go to "Account Settings" and click on the "Billing" tab. Under "Subscription Management," click "Cancel Subscription." You will be asked to provide a reason for cancellation — this feedback helps us improve. Confirm the cancellation, and you will receive an email confirmation. Your Premium access continues until the end of the current billing period. No partial refunds are issued for remaining days.',
          },
          {
            id: 'after-cancellation',
            heading: 'What Happens After Cancellation',
            body: 'When your Premium period ends, your account reverts to the Free plan. All resumes and cover letters you created remain accessible, but you will not be able to create new documents beyond the Free plan limits. Premium-only templates will show a lock icon, and exported PDFs will include a small watermark. You can reactivate your Premium subscription at any time to regain full access.',
          },
        ],
        conclusion: 'If you are canceling due to a technical issue or unsatisfactory experience, please contact our support team first. We are committed to resolving any problems and would appreciate the opportunity to keep you as a satisfied customer.',
      },
    },
    fr: {
      title: 'Annuler Votre Abonnement',
      description: 'Comment annuler votre plan Premium et ce qui arrive à vos données et votre accès.',
      readingTime: '2 min de lecture',
      lastUpdated: '2025-01-15',
      content: {
        intro: "Nous comprenons que les circonstances changent et que vous devrez peut-être annuler votre abonnement Premium. Ce guide explique le processus d'annulation et à quoi vous attendre après l'annulation.",
        sections: [
          {
            id: 'cancellation-steps',
            heading: 'Comment Annuler',
            body: "Accédez aux « Paramètres du Compte » et cliquez sur l'onglet « Facturation ». Sous « Gestion de l'Abonnement », cliquez sur « Annuler l'Abonnement ». Vous devrez fournir une raison d'annulation — ce retour nous aide à nous améliorer. Confirmez l'annulation et vous recevrez une confirmation par e-mail. Votre accès Premium continue jusqu'à la fin de la période de facturation en cours.",
          },
          {
            id: 'after-cancellation',
            heading: 'Ce Qui Arrive Après l\'Annulation',
            body: "Lorsque votre période Premium se termine, votre compte revient au plan Gratuit. Tous les CV et lettres de motivation que vous avez créés restent accessibles, mais vous ne pourrez pas créer de nouveaux documents au-delà des limites du plan Gratuit. Les modèles réservés au Premium afficheront une icône de verrouillage. Vous pouvez réactiver votre abonnement Premium à tout moment pour retrouver un accès complet.",
          },
        ],
        conclusion: "Si vous annulez en raison d'un problème technique ou d'une expérience insatisfaisante, veuillez d'abord contacter notre équipe de support. Nous nous engageons à résoudre tout problème et apprécierions l'opportunité de vous garder comme client satisfait.",
      },
    },
  },

  // ─── Security ───
  {
    slug: 'account-security',
    category: 'security',
    author: 'Hassify Team',
    en: {
      title: 'Account Security',
      description: 'Learn about the security measures that protect your Hassify account and data.',
      readingTime: '3 min read',
      lastUpdated: '2025-01-15',
      content: {
        intro: 'At Hassify, we take the security of your account and personal data seriously. This article explains the security measures we have in place and what you can do to further protect your account.',
        sections: [
          {
            id: 'encryption',
            heading: 'Data Encryption',
            body: 'All data transmitted between your browser and our servers is encrypted using TLS 1.3, the latest encryption standard. Your resumes, cover letters, and personal information are encrypted at rest using AES-256 encryption. This means that even in the unlikely event of unauthorized access to our servers, your data would remain unreadable without the encryption keys.',
          },
          {
            id: 'password-security',
            heading: 'Password Security',
            body: 'We enforce strong password requirements: a minimum of 8 characters with a mix of uppercase, lowercase, numbers, and special characters. Passwords are hashed using bcrypt with a high work factor, so even if our database were compromised, your original password would not be recoverable. We recommend using a unique password for Hassify that you do not use on any other website.',
          },
          {
            id: 'session-management',
            heading: 'Session Management',
            body: 'Your login sessions are managed using secure, HTTP-only cookies that cannot be accessed by JavaScript. Sessions automatically expire after 30 days of inactivity. You can view and terminate active sessions from your account security settings. If you notice any suspicious activity, we recommend changing your password immediately and terminating all active sessions.',
          },
        ],
        conclusion: 'Security is a shared responsibility. While we implement robust measures on our end, using strong passwords, enabling two-factor authentication, and keeping your software updated are essential steps you can take to keep your account safe.',
      },
    },
    fr: {
      title: 'Sécurité du Compte',
      description: 'Découvrez les mesures de sécurité qui protègent votre compte et vos données Hassify.',
      readingTime: '3 min de lecture',
      lastUpdated: '2025-01-15',
      content: {
        intro: "Chez Hassify, nous prenons la sécurité de votre compte et de vos données personnelles au sérieux. Cet article explique les mesures de sécurité en place et ce que vous pouvez faire pour protéger davantage votre compte.",
        sections: [
          {
            id: 'encryption',
            heading: 'Chiffrement des Données',
            body: "Toutes les données transmises entre votre navigateur et nos serveurs sont chiffrées using TLS 1.3, la norme de chiffrement la plus récente. Vos CV, lettres de motivation et informations personnelles sont chiffrés au repos using AES-256. Cela signifie qu'en cas d'accès non autorisé à nos serveurs, vos données resteraient illisibles sans les clés de chiffrement.",
          },
          {
            id: 'password-security',
            heading: 'Sécurité des Mots de Passe',
            body: "Nous imposons des exigences de mot de passe strictes : un minimum de 8 caractères avec un mélange de majuscules, minuscules, chiffres et caractères spéciaux. Les mots de passe sont hachés using bcrypt avec un facteur de travail élevé. Nous recommandons d'utiliser un mot de passe unique pour Hassify que vous n'utilisez sur aucun autre site web.",
          },
          {
            id: 'session-management',
            heading: 'Gestion des Sessions',
            body: "Vos sessions de connexion sont gérées using des cookies sécurisés, HTTP-only qui ne peuvent pas être accédés par JavaScript. Les sessions expirent automatiquement après 30 jours d'inactivité. Vous pouvez consulter et terminer les sessions actives depuis les paramètres de sécurité de votre compte. Si vous remarquez une activité suspecte, nous recommandons de changer immédiatement votre mot de passe.",
          },
        ],
        conclusion: "La sécurité est une responsabilité partagée. Bien que nous mettions en œuvre des mesures robustes de notre côté, l'utilisation de mots de passe forts, l'activation de l'authentification à deux facteurs et la mise à jour de vos logiciels sont des étapes essentielles que vous pouvez prendre pour garder votre compte en sécurité.",
      },
    },
  },
  {
    slug: 'two-factor-authentication',
    category: 'security',
    author: 'Hassify Team',
    en: {
      title: 'Two-Factor Authentication',
      description: 'Add an extra layer of security to your account with two-factor authentication (2FA).',
      readingTime: '3 min read',
      lastUpdated: '2025-01-15',
      content: {
        intro: 'Two-factor authentication (2FA) adds a critical second layer of security to your account. Even if someone obtains your password, they will not be able to access your account without the second verification factor.',
        sections: [
          {
            id: 'enable-2fa',
            heading: 'Enabling 2FA',
            body: 'Go to "Account Settings" and navigate to the "Security" tab. Click "Enable Two-Factor Authentication." You will be prompted to scan a QR code using an authenticator app such as Google Authenticator, Authy, or Microsoft Authenticator. After scanning, enter the 6-digit code displayed in your app to verify the setup. Save the backup codes provided — these are one-time-use codes you can use if you lose access to your authenticator app.',
          },
          {
            id: 'using-2fa',
            heading: 'Using 2FA',
            body: 'After enabling 2FA, every login will require both your password and a 6-digit code from your authenticator app. Open your authenticator app and enter the code for Hassify. The code changes every 30 seconds, so make sure to enter it promptly. If you do not have access to your authenticator, use one of your backup codes. Each backup code can only be used once, so be sure to generate new ones if you use several.',
          },
          {
            id: 'disable-2fa',
            heading: 'Disabling 2FA',
            body: 'While we strongly recommend keeping 2FA enabled, you can disable it from the "Security" tab in your account settings. You will need to enter your current password and a valid 2FA code to confirm the change. After disabling 2FA, your account will rely solely on password protection, which is significantly less secure.',
          },
        ],
        conclusion: 'Two-factor authentication is one of the most effective ways to protect your account from unauthorized access. We strongly recommend enabling it, especially if your resume contains sensitive personal or professional information.',
      },
    },
    fr: {
      title: 'Authentification à Deux Facteurs',
      description: 'Ajoutez une couche de sécurité supplémentaire à votre compte avec l\'authentification à deux facteurs (2FA).',
      readingTime: '3 min de lecture',
      lastUpdated: '2025-01-15',
      content: {
        intro: "L'authentification à deux facteurs (2FA) ajoute une seconde couche de sécurité critique à votre compte. Même si quelqu'un obtient votre mot de passe, il ne pourra pas accéder à votre compte sans le second facteur de vérification.",
        sections: [
          {
            id: 'enable-2fa',
            heading: 'Activer la 2FA',
            body: "Accédez aux « Paramètres du Compte » et naviguez vers l'onglet « Sécurité ». Cliquez sur « Activer l'Authentification à Deux Facteurs ». Vous serez invité à scanner un code QR using une application d'authentification telle que Google Authenticator, Authy ou Microsoft Authenticator. Après le scan, entrez le code à 6 chiffres affiché dans votre application pour vérifier la configuration. Sauvegardez les codes de secours fournis.",
          },
          {
            id: 'using-2fa',
            heading: 'Utiliser la 2FA',
            body: "Après avoir activé la 2FA, chaque connexion nécessitera votre mot de passe et un code à 6 chiffres de votre application d'authentification. Ouvrez votre application et entrez le code pour Hassify. Le code change toutes les 30 secondes. Si vous n'avez pas accès à votre application d'authentification, utilisez un de vos codes de secours. Chaque code de secours ne peut être utilisé qu'une seule fois.",
          },
          {
            id: 'disable-2fa',
            heading: 'Désactiver la 2FA',
            body: "Bien que nous recommandions fortement de garder la 2FA activée, vous pouvez la désactiver depuis l'onglet « Sécurité » dans les paramètres de votre compte. Vous devrez entrer votre mot de passe actuel et un code 2FA valide pour confirmer le changement. Après la désactivation, votre compte reposera uniquement sur la protection par mot de passe.",
          },
        ],
        conclusion: "L'authentification à deux facteurs est l'un des moyens les plus efficaces de protéger votre compte contre l'accès non autorisé. Nous la recommandons fortement, surtout si votre CV contient des informations personnelles ou professionnelles sensibles.",
      },
    },
  },

  // ─── Privacy ───
  {
    slug: 'data-privacy',
    category: 'privacy',
    author: 'Hassify Team',
    en: {
      title: 'Data Privacy',
      description: 'How we collect, use, store, and protect your personal information on Hassify.',
      readingTime: '4 min read',
      lastUpdated: '2025-01-15',
      content: {
        intro: 'Your privacy is fundamental to us. This article provides a clear overview of our data practices so you can make informed decisions about using Hassify.',
        sections: [
          {
            id: 'data-collection',
            heading: 'What Data We Collect',
            body: 'We collect the information you directly provide: your name, email address, phone number (optional), career history, education details, and resume content. We also collect usage data such as pages visited, features used, and device information to improve our service. We do not scrape your social media profiles or collect data from third-party sources without your explicit consent.',
          },
          {
            id: 'data-usage',
            heading: 'How We Use Your Data',
            body: 'Your data is used to provide and improve our services. Specifically: your resume data powers the AI writing and review features; your email is used for account communication and optional notifications; usage analytics help us identify bugs and improve the user experience. We never sell your personal data to third parties. We do not use your resume content to train AI models without your explicit opt-in.',
          },
          {
            id: 'data-storage',
            heading: 'Data Storage and Retention',
            body: 'Your data is stored on secure servers in Canada. Data is retained for as long as your account is active. If you delete your account, personal data is purged within 30 days, except where retention is required by law (such as payment records for 12 months). Anonymous, aggregated analytics data that cannot identify you may be retained indefinitely for service improvement purposes.',
          },
          {
            id: 'your-rights',
            heading: 'Your Privacy Rights',
            body: 'Under GDPR and PIPEDA regulations, you have the right to access your data, request corrections, request data portability, and request deletion. To exercise any of these rights, contact us at privacy@hassify.com or through the support ticket system. We will respond to all data requests within 30 days. You can also export all your data at any time from your account settings.',
          },
        ],
        conclusion: 'We are committed to transparency and giving you control over your information. Our full Privacy Policy provides additional details, and our support team is always available to answer any privacy-related questions.',
      },
    },
    fr: {
      title: 'Confidentialité des Données',
      description: 'Comment nous collectons, utilisons, stockons et protégeons vos informations personnelles sur Hassify.',
      readingTime: '4 min de lecture',
      lastUpdated: '2025-01-15',
      content: {
        intro: "Votre vie privée est fondamentale pour nous. Cet article fournit un aperçu clair de nos pratiques en matière de données afin que vous puissiez prendre des décisions éclairées sur l'utilisation de Hassify.",
        sections: [
          {
            id: 'data-collection',
            heading: 'Quelles Données Nous Collectons',
            body: "Nous collectons les informations que vous fournissez directement : votre nom, votre adresse e-mail, votre numéro de téléphone (facultatif), votre historique professionnel, vos détails de formation et le contenu de votre CV. Nous collectons également des données d'utilisation telles que les pages visitées et les fonctionnalités utilisées. Nous ne récupérons pas vos profils de réseaux sociaux.",
          },
          {
            id: 'data-usage',
            heading: 'Comment Nous Utilisons Vos Données',
            body: "Vos données sont utilisées pour fournir et améliorer nos services. Plus précisément : les données de votre CV alimentent les fonctionnalités d'écriture et de revue IA ; votre e-mail est utilisé pour la communication du compte et les notifications optionnelles ; les analytiques d'utilisation nous aident à identifier les bugs et à améliorer l'expérience utilisateur. Nous ne vendons jamais vos données personnelles à des tiers.",
          },
          {
            id: 'data-storage',
            heading: 'Stockage et Conservation des Données',
            body: "Vos données sont stockées sur des serveurs sécurisés au Canada. Les données sont conservées tant que votre compte est actif. Si vous supprimez votre compte, les données personnelles sont purgées dans les 30 jours, sauf si la conservation est requise par la loi (comme les enregistrements de paiement pendant 12 mois).",
          },
          {
            id: 'your-rights',
            heading: 'Vos Droits en Matière de Confidentialité',
            body: "En vertu des réglementations RGPD et LPRPDE, vous avez le droit d'accéder à vos données, de demander des corrections, de demander la portabilité des données et de demander la suppression. Pour exercer ces droits, contactez-nous à privacy@hassify.com ou via le système de tickets de support. Nous répondrons à toutes les demandes de données dans les 30 jours.",
          },
        ],
        conclusion: "Nous nous engageons à la transparence et à vous donner le contrôle sur vos informations. Notre Politique de Confidentialité complète fournit des détails supplémentaires, et notre équipe de support est toujours disponible pour répondre à toute question relative à la confidentialité.",
      },
    },
  },

  // ─── Technical Issues ───
  {
    slug: 'change-language',
    category: 'technical-issues',
    author: 'Hassify Team',
    en: {
      title: 'Change the Interface Language',
      description: 'How to switch between English and French on Hassify.',
      readingTime: '2 min read',
      lastUpdated: '2025-01-15',
      content: {
        intro: 'Hassify is fully bilingual, supporting both English and French. You can switch the interface language at any time, and your preference will be remembered across sessions.',
        sections: [
          {
            id: 'switching-language',
            heading: 'Switching Languages',
            body: 'To change the interface language, click the language toggle button in the navigation bar at the top of the page. This button displays the current alternative language — for example, "FR" when you are in English mode, or "EN" when you are in French mode. Click it to switch instantly. The entire interface, including navigation, buttons, and help articles, will update to the selected language.',
          },
          {
            id: 'language-and-ai',
            heading: 'Language and AI Content',
            body: 'When you switch languages, AI-generated content (resume suggestions, cover letters, review feedback) will also be generated in the selected language. However, previously generated content will not be automatically translated. If you want a cover letter in a different language, generate a new one after switching. Your resume data remains the same across languages — only the interface and new AI output change.',
          },
          {
            id: 'language-persistence',
            heading: 'Language Preference Persistence',
            body: 'Your language preference is stored in your browser\'s local storage and persists between sessions. This means you will not need to switch languages every time you visit. However, if you clear your browser data or use a different device, the default language (English) will be used until you switch again. We are working on saving language preferences to your account in a future update.',
          },
        ],
        conclusion: 'The bilingual support is one of Hassify\'s key features, especially for job seekers in bilingual markets like Canada. Feel free to switch between languages as needed — your work is always saved and accessible in both languages.',
      },
    },
    fr: {
      title: 'Changer la Langue de l\'Interface',
      description: 'Comment basculer entre l\'anglais et le français sur Hassify.',
      readingTime: '2 min de lecture',
      lastUpdated: '2025-01-15',
      content: {
        intro: "Hassify est entièrement bilingue, prenant en charge l'anglais et le français. Vous pouvez changer la langue de l'interface à tout moment, et votre préférence sera mémorisée d'une session à l'autre.",
        sections: [
          {
            id: 'switching-language',
            heading: 'Changer de Langue',
            body: "Pour changer la langue de l'interface, cliquez sur le bouton de sélection de langue dans la barre de navigation en haut de la page. Ce bouton affiche la langue alternative actuelle — par exemple, « FR » en mode anglais, ou « EN » en mode français. Cliquez pour basculer instantanément. L'interface entière se mettra à jour dans la langue sélectionnée.",
          },
          {
            id: 'language-and-ai',
            heading: 'Langue et Contenu IA',
            body: "Lorsque vous changez de langue, le contenu généré par l'IA (suggestions de CV, lettres de motivation, retours de revue) sera également généré dans la langue sélectionnée. Cependant, le contenu précédemment généré ne sera pas automatiquement traduit. Si vous souhaitez une lettre de motivation dans une autre langue, générez-en une nouvelle après le changement.",
          },
          {
            id: 'language-persistence',
            heading: 'Persistance de la Préférence de Langue',
            body: "Votre préférence de langue est stockée dans le stockage local de votre navigateur et persiste entre les sessions. Cela signifie que vous n'aurez pas besoin de changer de langue à chaque visite. Cependant, si vous effacez les données de votre navigateur ou utilisez un autre appareil, la langue par défaut (anglais) sera utilisée.",
          },
        ],
        conclusion: "Le support bilingue est l'une des caractéristiques clés de Hassify, surtout pour les chercheurs d'emploi sur les marchés bilingues comme le Canada. N'hésitez pas à basculer entre les langues au besoin — votre travail est toujours sauvegardé et accessible dans les deux langues.",
      },
    },
  },
  {
    slug: 'browser-compatibility',
    category: 'technical-issues',
    author: 'Hassify Team',
    en: {
      title: 'Browser Compatibility',
      description: 'Which browsers and devices are supported by Hassify for the best experience.',
      readingTime: '2 min read',
      lastUpdated: '2025-01-15',
      content: {
        intro: 'Hassify is a modern web application built with the latest web technologies. To ensure the best experience, we recommend using a supported browser. Here is our full compatibility information.',
        sections: [
          {
            id: 'supported-browsers',
            heading: 'Supported Browsers',
            body: 'We officially support the latest two versions of Google Chrome, Mozilla Firefox, Apple Safari, and Microsoft Edge. For the most reliable experience, we recommend Google Chrome or Firefox. Our platform uses modern CSS and JavaScript features that require up-to-date browsers. If you are using an older browser version, you may experience rendering issues or missing functionality.',
          },
          {
            id: 'mobile-support',
            heading: 'Mobile and Tablet Support',
            body: 'Hassify is fully responsive and works on mobile devices and tablets. However, for the best resume editing experience, we recommend using a desktop or laptop computer with a screen size of at least 13 inches. The resume editor and preview work best on larger screens. On mobile, you can view resumes, track applications, and use most features, but creating new resumes is optimized for desktop.',
          },
          {
            id: 'troubleshooting',
            heading: 'Common Browser Issues',
            body: 'If you experience issues, try these steps: clear your browser cache and cookies, disable browser extensions (especially ad blockers), ensure JavaScript is enabled, update your browser to the latest version, and try an incognito/private browsing window. If problems persist, try a different supported browser. Our support team can also help diagnose browser-specific issues if you contact us with details about your browser version and operating system.',
          },
        ],
        conclusion: 'Using a supported and up-to-date browser ensures you get the full Hassify experience with all features working correctly. We continuously test against new browser versions to maintain compatibility.',
      },
    },
    fr: {
      title: 'Compatibilité des Navigateurs',
      description: 'Quels navigateurs et appareils sont pris en charge par Hassify pour la meilleure expérience.',
      readingTime: '2 min de lecture',
      lastUpdated: '2025-01-15',
      content: {
        intro: "Hassify est une application web moderne construite avec les dernières technologies web. Pour garantir la meilleure expérience, nous recommandons d'utiliser un navigateur pris en charge. Voici nos informations complètes de compatibilité.",
        sections: [
          {
            id: 'supported-browsers',
            heading: 'Navigateurs Pris en Charge',
            body: "Nous prenons officiellement en charge les deux dernières versions de Google Chrome, Mozilla Firefox, Apple Safari et Microsoft Edge. Pour l'expérience la plus fiable, nous recommandons Google Chrome ou Firefox. Notre plateforme utilise des fonctionnalités CSS et JavaScript modernes qui nécessitent des navigateurs à jour.",
          },
          {
            id: 'mobile-support',
            heading: 'Support Mobile et Tablette',
            body: "Hassify est entièrement responsive et fonctionne sur les appareils mobiles et tablettes. Cependant, pour la meilleure expérience d'édition de CV, nous recommandons d'utiliser un ordinateur de bureau ou portable avec un écran d'au moins 13 pouces. Sur mobile, vous pouvez consulter les CV, suivre les candidatures et utiliser la plupart des fonctionnalités.",
          },
          {
            id: 'troubleshooting',
            heading: 'Problèmes Courants de Navigateur',
            body: "Si vous rencontrez des problèmes, essayez ces étapes : effacez le cache et les cookies de votre navigateur, désactivez les extensions de navigateur (surtout les bloqueurs de publicités), assurez-vous que JavaScript est activé, mettez à jour votre navigateur et essayez une fenêtre de navigation privée. Si les problèmes persistent, essayez un autre navigateur pris en charge.",
          },
        ],
        conclusion: "L'utilisation d'un navigateur pris en charge et à jour garantit que vous obtenez l'expérience complète de Hassify avec toutes les fonctionnalités fonctionnant correctement. Nous testons continuellement contre les nouvelles versions de navigateurs pour maintenir la compatibilité.",
      },
    },
  },
];