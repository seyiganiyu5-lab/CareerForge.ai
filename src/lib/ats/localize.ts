import type { AiLocale } from '@/lib/ai/locale';

// French versions of the rule-based ATS checker messages (keys are the English text in the route).
const FR: Record<string, string> = {
  // Contact information
  'Full name is missing or incomplete.': 'Le nom complet est manquant ou incomplet.',
  'Email address is missing.': "L'adresse e-mail est manquante.",
  'Phone number is missing.': 'Le numéro de téléphone est manquant.',
  'Location/city is missing. Adding one helps with local job matching.':
    'La localisation/ville est manquante. L\'ajouter aide à correspondre aux offres locales.',

  // Summary
  'Professional summary is missing. Add a 2-3 sentence summary to make a strong first impression.':
    'Le résumé professionnel est manquant. Ajoutez un résumé de 2 à 3 phrases pour faire une bonne première impression.',
  'Consider expanding your summary to 100-200 characters for better impact.':
    "Pensez à développer votre résumé à 100-200 caractères pour plus d'impact.",
  'Use action-oriented language with metrics in your summary (e.g., "led a team of 5", "increased revenue by 20%").':
    'Utilisez un langage orienté action avec des chiffres dans votre résumé (ex. « dirigé une équipe de 5 personnes », « augmenté le chiffre d\'affaires de 20 % »).',

  // Work experience
  'Work experience section is missing. This is one of the most important sections for ATS.':
    "La section Expérience professionnelle est manquante. C'est l'une des sections les plus importantes pour les ATS.",
  'Work entry is missing a company name.': "Une expérience n'a pas de nom d'entreprise.",
  'Work entry is missing a job title/position.': "Une expérience n'a pas d'intitulé de poste.",
  'Work entry is missing a start date.': "Une expérience n'a pas de date de début.",
  'Work entry is missing a description. Add bullet points with achievements.':
    "Une expérience n'a pas de description. Ajoutez des puces avec vos réalisations.",
  'No work experience entry has all required fields (company, position, dates, description).':
    "Aucune expérience ne contient tous les champs requis (entreprise, poste, dates, description).",
  'Ensure all work experience entries have complete details.':
    'Assurez-vous que toutes vos expériences sont complètes.',
  'Use action verbs (e.g., "led", "developed", "achieved") in your work descriptions.':
    'Utilisez des verbes d\'action (ex. « dirigé », « développé », « réalisé ») dans vos descriptions de poste.',

  'Add dates to each role (e.g. "Jan 2021 – Mar 2023").':
    'Ajoutez des dates à chaque poste (ex. « janv. 2021 – mars 2023 »).',
  'Add measurable results (numbers, percentages, amounts) to show your impact.':
    'Ajoutez des résultats mesurables (chiffres, pourcentages, montants) pour montrer votre impact.',

  // Education
  'Education section is missing. Most ATS systems expect this section.':
    'La section Formation est manquante. La plupart des ATS attendent cette section.',
  'Education entry is missing a school/university name.':
    "Une formation n'a pas de nom d'établissement.",
  'Education entry is missing a degree.': "Une formation n'a pas de diplôme.",

  // Skills
  'Skills section is missing. Add at least 3 skills relevant to your target role.':
    'La section Compétences est manquante. Ajoutez au moins 3 compétences liées au poste visé.',
  'Add at least 3 more skills to strengthen this section.':
    'Ajoutez au moins 3 compétences supplémentaires pour renforcer cette section.',
  'Consider adding soft skills (e.g., leadership, communication) alongside your technical skills.':
    'Pensez à ajouter des savoir-être (ex. leadership, communication) en plus de vos compétences techniques.',
  'Include more technical/hard skills relevant to your target role.':
    'Ajoutez davantage de compétences techniques liées au poste visé.',

  // Formatting
  'Consider adding more standard section headers (Experience, Education, Skills).':
    'Pensez à ajouter davantage de titres de section standards (Expérience, Formation, Compétences).',
  'Standard section headers (Experience, Education, Skills) are missing or hard to detect.':
    'Les titres de section standards (Expérience, Formation, Compétences) sont absents ou difficiles à détecter.',
  'Add employment dates to your work experience entries.':
    'Ajoutez les dates de vos expériences professionnelles.',
  'Use more bullet points to describe your achievements and responsibilities.':
    'Utilisez davantage de puces pour décrire vos réalisations et responsabilités.',
  'Use bullet points (•, -, etc.) to format your experience descriptions.':
    'Utilisez des puces (•, -, etc.) pour mettre en forme vos descriptions d\'expérience.',
  'Remove box-drawing or special characters that ATS systems cannot parse.':
    'Supprimez les caractères spéciaux ou de tableau que les ATS ne savent pas lire.',
  'Avoid using excessive ALL CAPS text. Reserve uppercase for section headers only.':
    "Évitez l'excès de texte en MAJUSCULES. Réservez les majuscules aux titres de section.",
  'Too much uppercase text detected. Use standard capitalization for better readability.':
    'Trop de texte en majuscules détecté. Utilisez une casse standard pour une meilleure lisibilité.',

  // Length
  'Resume appears to be very short (under 100 words). Aim for at least 300-800 words for a single page.':
    'Le CV semble très court (moins de 100 mots). Visez au moins 300 à 800 mots pour une page.',
  'Resume is quite short. Most competitive resumes are 300-800 words.':
    'Le CV est assez court. La plupart des CV compétitifs font entre 300 et 800 mots.',
  'Resume is a bit thin. Consider adding more detail to reach 300+ words.':
    'Le CV est un peu léger. Ajoutez plus de détails pour atteindre au moins 300 mots.',
  'Resume is slightly long. Consider trimming to keep it within 2 pages.':
    'Le CV est un peu long. Pensez à le raccourcir pour tenir sur 2 pages.',
  'Resume is too long (over 2000 words). Most recruiters prefer 1-2 page resumes. Trim less relevant content.':
    'Le CV est trop long (plus de 2000 mots). La plupart des recruteurs préfèrent 1 à 2 pages. Supprimez le contenu moins pertinent.',

  // Request errors
  'Authentication required. Please log in.': 'Authentification requise. Veuillez vous connecter.',
  'Provide either resumeId or resumeText.': 'Sélectionnez un CV ou collez son texte.',
  'ATS scoring is not available on your current plan.':
    "L'analyse ATS n'est pas disponible avec votre offre actuelle.",
  'Resume not found.': 'CV introuvable.',
  'An unexpected error occurred.': "Une erreur inattendue s'est produite.",
  'Resume scoring completed successfully.': 'Le score du CV a bien été calculé.',
  'AI analysis encountered an issue.': "L'analyse IA a rencontré un problème.",
};

// Messages with numbers or keyword lists in them
const FR_PATTERNS: [RegExp, (...m: string[]) => string][] = [
  [/^Summary is too short \((\d+) chars\)\. Aim for 50\+ characters\.$/,
    (n) => `Le résumé est trop court (${n} caractères). Visez au moins 50 caractères.`],
  [/^(\d+) of (\d+) job keywords found\. Consider adding: ([\s\S]*)$/,
    (a, b, list) => `${a} mots-clés de l'offre sur ${b} trouvés. Pensez à ajouter : ${list}`],
  [/^Only (\d+) of (\d+) job keywords found\. Consider adding: ([\s\S]*)$/,
    (a, b, list) => `Seulement ${a} mots-clés de l'offre sur ${b} trouvés. Pensez à ajouter : ${list}`],
  [/^Very few keywords matched \((\d+)\/(\d+)\)\. Strongly consider incorporating: ([\s\S]*)$/,
    (a, b, list) => `Très peu de mots-clés correspondent (${a}/${b}). Intégrez de préférence : ${list}`],
];

/** Translate an ATS checker message into the user's language (unknown text is returned as-is). */
export function localizeAtsMessage(message: string, locale: AiLocale): string {
  if (locale !== 'fr') return message;
  if (FR[message]) return FR[message];
  for (const [re, fn] of FR_PATTERNS) {
    const m = message.match(re);
    if (m) return fn(...m.slice(1));
  }
  return message;
}
