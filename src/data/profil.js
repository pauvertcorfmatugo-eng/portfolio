// ─────────────────────────────────────────────────────────────
//  CONTENU DU PORTFOLIO
//  Tout le texte du site vient de ce fichier (et de projets.js).
//  Modifie ici : tout le site suit.
// ─────────────────────────────────────────────────────────────

export const profil = {
  nom: 'Ugo Pauvert--Corfmat',
  prenom: 'Ugo',
  titre: 'Développeur Web & App',
  // Ce qui t'attire le plus (affiché sous ton nom et dans la carte profil.json)
  focus: ['backend', 'bases de données'],
  accroche:
    "Futur développeur (BTS SIO SLAM), je conçois des applications web et logicielles complètes. Toujours avide de découvrir de nouveaux langages, j'ai un fort attrait pour l'optimisation des bases de données et la création d'architectures backend performantes.",
  email: 'pauvertcorfmat.ugo@gmail.com',
  // Le téléphone n'est pas affiché sur le site (évite le démarchage), comme sur l'ancienne version.
  telephone: '06 13 32 73 32',
  localisation: 'Nantes / Pornic',
  // Mets ton CV dans public/cv/ avec exactement ce nom de fichier.
  cv: 'cv/CV_Ugo_Pauvert_Corfmat.pdf',
};

export const liens = {
  linkedin: 'https://www.linkedin.com/in/ugo-pauvert-corfmat-93299a39b/',
  github: 'https://github.com/pauvertcorfmatugo-eng',
};

// Ce que tu recherches. Les champs laissés vides ne s'affichent pas.
export const recherche = {
  disponible: true,
  type: 'Stage',
  domaine: 'Développement web & applicatif',
  periode: '', // ex : 'Janvier → mars 2027'
  duree: '', // ex : '8 semaines'
};

// niveau : sur 100 (affiché en jauge de 10 segments).
// label  : facultatif, remplace le libellé calculé automatiquement.
export const competences = [
  {
    domaine: 'Backend',
    skills: [
      { nom: 'PHP (Procédural/Objet)', niveau: 80 },
      { nom: 'C# (Visual Studio)', niveau: 70 },
      { nom: 'SQL (Avancé)', niveau: 75 },
    ],
  },
  {
    domaine: 'Conception',
    skills: [
      { nom: 'UML', niveau: 60 },
      { nom: 'Merise (MCD)', niveau: 65 },
    ],
  },
  {
    domaine: 'Système',
    skills: [
      { nom: 'Linux / Bash', niveau: 50 },
      { nom: 'Virtualisation (VM)', niveau: 70 },
      { nom: 'Hardware / Montage PC', niveau: 90 },
    ],
  },
  {
    domaine: 'Langues',
    skills: [
      { nom: 'Français', niveau: 100, label: 'Langue maternelle' },
      { nom: 'Anglais', niveau: 40, label: 'Intermédiaire' },
    ],
  },
];

// Ordre d'affichage = ordre du tableau.
export const parcours = [
  {
    type: 'formation',
    date: '2023 - 2025',
    titre: 'BTS SIO (Option SLAM)',
    lieu: 'Lycée Carcouët, Nantes',
    desc: "Développement d'applications et web.",
  },
  {
    type: 'experience',
    date: 'Mars 2025 - Actuel',
    titre: 'Cuisinier (CDD)',
    lieu: 'Restaurant',
    desc: 'Préparation des plats et services.',
  },
  {
    type: 'experience',
    date: 'Étés 2023 & 2024',
    titre: 'Agent de nettoyage',
    lieu: 'Camping des Pierres Couchées',
    desc: 'Nettoyage de mobil-homes.',
  },
];

export function niveauLabel(skill) {
  if (skill.label) return skill.label;
  if (skill.niveau >= 85) return "Très à l'aise";
  if (skill.niveau >= 70) return "À l'aise";
  if (skill.niveau >= 55) return 'Bonne base';
  return 'En progression';
}
