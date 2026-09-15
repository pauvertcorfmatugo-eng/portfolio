// ─────────────────────────────────────────────────────────────
//  ASSISTANT DU PORTFOLIO
//  Répond aux questions des visiteurs à partir des données du site
//  (profil.js, projets.js). Aucune IA, aucun service externe :
//  on repère des mots-clés et on construit la réponse.
//
//  Réponse = { text, links?, action?, suggestions? }
//   - text        : **gras** autorisé, retours à la ligne conservés
//   - links       : [{ label, to }] lien interne  |  [{ label, href }] lien externe
//   - action      : { type: 'message', prefill } → propose d'écrire à Ugo
//   - suggestions : questions proposées ensuite
// ─────────────────────────────────────────────────────────────

import { competences, liens, niveauLabel, parcours, profil, recherche } from '../../data/profil';
import { projets } from '../../data/projets';
import { publicUrl } from '../../lib/paths';

const P = profil.prenom;

/** Minuscules, sans accents ni ponctuation, entouré d'espaces : " quel niveau en csharp " */
export function normalize(str) {
  const t = str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/c\s*#|c\s*sharp|\.net\b|dotnet/g, ' csharp ')
    .replace(/c\+\+/g, ' cplusplus ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return ` ${t} `;
}

// "=mot" : mot exact. Sinon : un mot qui commence par la clé ("competence" ⊂ "competences").
// "~mot" : mot trop courant pour décider seul, il compte pour moitié.
function has(text, key) {
  const k = key.replace(/^~/, '');
  if (k.startsWith('=')) return text.includes(` ${k.slice(1)} `);
  return text.includes(` ${k}`);
}

const hits = (text, keys) =>
  keys.reduce((score, k) => (has(text, k) ? score + (k.startsWith('~') ? 0.5 : 1) : score), 0);

// ── Intentions ───────────────────────────────────────────────

const INTENTS = [
  { id: 'greet', social: true, keys: ['bonjour', 'salut', 'hello', 'coucou', '=hey', 'bonsoir', '=yo', '=hi', '=slt', '=bjr'] },
  { id: 'thanks', social: true, keys: ['merci', 'thank', '=top', 'parfait', 'genial', '=super', '=cool', '=ok'] },
  { id: 'bye', social: true, keys: ['au revoir', '=bye', 'a plus', 'a bientot', 'bonne journee', 'bonne soiree'] },
  { id: 'help', keys: ['aide', '=help', 'que peux', 'quoi demander', 'comment ca marche', 'tu sers', 'quelles questions'] },
  { id: 'about', keys: ['qui est', 'qui es', 'c est qui', 'presente', 'presentation', 'parle moi de toi', 'parle moi d ugo', 'parle moi de lui', 'profil', 'en bref', 'decris', 'ugo en quelques'] },
  { id: 'skills', keys: ['competence', 'skill', 'techno', 'langage', 'stack', 'maitrise', 'sait faire', 'sais faire', 'savoir faire', '~outil', '~niveau', 'point fort', 'points forts', 'specialite'] },
  { id: 'projects', keys: ['projet', 'realisation', 'travaux', 'deja fait', 'deja realise', '~application', '~appli', 'exemples de'] },
  { id: 'internship', keys: ['stage', 'stagiaire', 'alternance', '~recherche', '~cherche', 'dispo', '~periode', '~duree', '~quand', 'recrut', 'embauch', 'candidat', '~offre', 'opportunit', 'combien de temps', 'combien de semaines'] },
  { id: 'education', keys: ['formation', 'etude', 'diplome', '=bts', '=sio', 'slam', 'ecole', 'lycee', 'cursus', 'carcouet', 'scolar'] },
  { id: 'experience', keys: ['experience', '~travail', 'emploi', '=job', '=jobs', '~poste', 'cuisin', 'restaurant', 'camping', 'boulot', 'metier', 'parcours pro'] },
  { id: 'contact', keys: ['contact', 'joindre', '=mail', 'email', 'e mail', 'linkedin', 'github', 'telephone', '=tel', 'numero', 'appeler', '~ecrire', 'reseaux sociaux', 'rencontrer', 'entretien'] },
  { id: 'cv', keys: ['=cv', 'curriculum'] },
  { id: 'languages', keys: ['langue', 'anglais', 'english', 'francais', 'bilingue', 'toeic'] },
  { id: 'location', keys: ['habite', 'ville', 'localisation', 'situe', 'region', 'nantes', 'pornic', 'mobil', 'deplac', 'ou est il', 'ou vit', 'd ou', 'secteur'] },
  { id: 'site', keys: ['ce site', 'ce portfolio', 'site fait', 'site realise', 'fait ce site', 'construit', 'chatbot', 'es tu un', 't es un', 'es tu une', 'robot', '=bot', 'une ia', 'un humain'] },
];

// Techniques présentes dans les compétences ou les étiquettes de projets.
const TECHS = [
  { match: 'PHP', aliases: ['php'] },
  { match: 'SQL', aliases: ['sql', 'mysql', 'mariadb', 'base de donnee', 'bases de donnee', '=bdd', 'requete', 'trigger'] },
  { match: 'C#', aliases: ['csharp', 'visual studio'] },
  { match: 'UML', aliases: ['uml'] },
  { match: 'Merise', aliases: ['merise', '=mcd', '=mld'] },
  { match: 'Linux', aliases: ['linux', 'bash', 'shell', 'terminal', 'debian', 'ubuntu'] },
  { match: 'Virtualisation', aliases: ['virtualis', '=vm', '=vms', 'machine virtuelle', 'machines virtuelles', 'virtualbox', 'vmware', 'hyper v', 'proxmox'] },
  { match: 'Hardware', aliases: ['hardware', 'montage', 'materiel', 'monter un pc', 'composant'] },
  { match: 'Bootstrap', aliases: ['bootstrap'] },
  { match: 'Git', aliases: ['=git', 'gitlab', 'versionn'] },
  { match: 'Agile', aliases: ['agile', 'scrum'] },
  { match: 'Réseau', aliases: ['reseau', 'network'] },
];

// Techniques connues mais absentes du portfolio : on ne prétend rien.
const OTHER_TECHS = [
  ['javascript', 'JavaScript'], ['=js', 'JavaScript'], ['typescript', 'TypeScript'], ['python', 'Python'],
  ['=java', 'Java'], ['react', 'React'], ['=vue', 'Vue.js'], ['angular', 'Angular'], ['node', 'Node.js'],
  ['docker', 'Docker'], ['kubernetes', 'Kubernetes'], ['laravel', 'Laravel'], ['symfony', 'Symfony'],
  ['=html', 'HTML'], ['=css', 'CSS'], ['golang', 'Go'], ['rust', 'Rust'], ['kotlin', 'Kotlin'],
  ['swift', 'Swift'], ['flutter', 'Flutter'], ['django', 'Django'], ['spring', 'Spring'], ['mongo', 'MongoDB'],
  ['postgre', 'PostgreSQL'], ['wordpress', 'WordPress'], ['figma', 'Figma'], ['cisco', 'Cisco'],
  ['windows server', 'Windows Server'], ['active directory', 'Active Directory'], ['azure', 'Azure'],
  ['=aws', 'AWS'], ['cplusplus', 'C++'], ['cyber', 'la cybersécurité'], ['powershell', 'PowerShell'],
];

// Mots qui désignent un projet précis.
const PROJECT_KEYS = {
  ministages44: ['ministage', 'mini stage', 'stage bts', 'premier stage', 'dernier stage', 'stage precedent', 'bcrypt', 'hachage', '=hash', 'mot de passe', 'mots de passe', 'doublon', 'en double', 'securit'],
  'decap-velo': ['decap', 'velo', 'cycli', 'club'],
  'cloud-maison': ['cloud', '=nas', 'serveur maison', 'auto heberg', 'self host'],
};

// ── Aides pour construire les réponses ───────────────────────

const allSkills = competences.flatMap((g) => g.skills.map((s) => ({ ...s, domaine: g.domaine })));
const langues = competences.find((g) => g.domaine === 'Langues')?.skills ?? [];
const formations = parcours.filter((p) => p.type === 'formation');
const experiences = parcours.filter((p) => p.type === 'experience');
const vedette = projets.find((p) => p.vedette) ?? projets[0];

const projectLink = (p) =>
  p.details ? { label: p.titre, to: `/projets/${p.slug}` } : p.lien ? { label: `${p.titre} (GitHub)`, href: p.lien } : null;

const levelText = (s) => `${niveauLabel(s).toLowerCase()} (${(s.niveau / 10).toString().replace('.', ',')}/10)`;

const SUGGEST = {
  start: ['Qui est Ugo ?', 'Quelles sont ses compétences ?', 'Quel stage recherche-t-il ?', `Parle-moi de ${vedette.slug === 'ministages44' ? 'Ministages44' : vedette.titre}`, 'Comment le contacter ?'],
  afterAbout: ['Quelles sont ses compétences ?', 'Ses projets ?', 'Quel stage recherche-t-il ?'],
  afterSkills: ['Son niveau en SQL ?', 'Ses projets ?', 'Il parle anglais ?'],
  afterProjects: ['Parle-moi de Ministages44', 'Quelles sont ses compétences ?', 'Comment le contacter ?'],
  afterStage: ['Comment le contacter ?', 'Sa formation ?', 'Où est-il basé ?'],
  generic: ['Ses projets ?', 'Quel stage recherche-t-il ?', 'Comment le contacter ?'],
};

const askUgo = (prefill) => ({ type: 'message', prefill });

// ── Réponses ─────────────────────────────────────────────────

const answers = {
  greet: () => ({
    text: `Bonjour ! Que souhaitez-vous savoir sur ${P} ?`,
    suggestions: SUGGEST.start,
  }),

  thanks: () => ({
    text: 'Avec plaisir ! Autre chose ?',
    suggestions: SUGGEST.generic,
  }),

  bye: () => ({
    text: `Merci de votre visite, et à bientôt ! Pour recontacter ${P} : ${profil.email}`,
  }),

  help: () => ({
    text: `Je réponds à partir des informations de ce portfolio : parcours, compétences, projets, recherche de stage, contact…\nPosez votre question librement, ou choisissez-en une ci-dessous.`,
    suggestions: SUGGEST.start,
  }),

  about: () => ({
    text: `**${profil.nom}** — ${profil.titre}, basé à ${profil.localisation}.\n\nEn quelques mots, dans les siens :\n« ${profil.accroche} »`,
    links: [{ label: 'Voir son profil', to: '/#profil' }],
    suggestions: SUGGEST.afterAbout,
  }),

  skills: () => {
    const lines = competences.map((g) => `• **${g.domaine}** : ${g.skills.map((s) => s.nom).join(', ')}`);
    const forts = allSkills
      .filter((s) => s.domaine !== 'Langues')
      .sort((a, b) => b.niveau - a.niveau)
      .slice(0, 2)
      .map((s) => s.nom);
    return {
      text: `Ses compétences, par domaine :\n${lines.join('\n')}\n\nSes points forts : **${forts.join('** et **')}**.`,
      links: [{ label: 'Voir le détail des niveaux', to: '/#competences' }],
      suggestions: SUGGEST.afterSkills,
    };
  },

  projects: () => ({
    text: `${P} présente ${projets.length} projets :\n${projets.map((p) => `• **${p.titre}** — ${p.desc}`).join('\n')}\n\nLe plus détaillé est « ${vedette.titre} », avec une étude de cas complète et des extraits de code.`,
    links: [...projets.map(projectLink).filter(Boolean), { label: 'Tous les projets', to: '/#projets' }],
    suggestions: SUGGEST.afterProjects,
  }),

  internship: () => {
    if (!recherche.disponible) {
      return {
        text: `${P} n'est pas en recherche active pour le moment, mais vous pouvez tout de même lui écrire.`,
        action: askUgo(''),
      };
    }
    const details = [
      recherche.periode && `Période : **${recherche.periode}**.`,
      recherche.duree && `Durée : **${recherche.duree}**.`,
    ].filter(Boolean);
    const intro = [
      `${P} recherche un **${recherche.type.toLowerCase()}** en ${recherche.domaine.toLowerCase()}.`,
      ...details,
      `Il est basé à ${profil.localisation}.`,
    ];
    const role = vedette.infos?.find((i) => i.label === 'Mon rôle')?.valeur;
    return {
      text: `${intro.join('\n')}\n\nSon expérience de stage : **${vedette.titre}**${role ? ` (rôle : ${role.toLowerCase()})` : ''}.`,
      links: [
        { label: "Lire l'étude de cas", to: `/projets/${vedette.slug}` },
        { label: 'Le contacter', to: '/#contact' },
        { label: 'Télécharger le CV', href: publicUrl(profil.cv), download: true },
      ],
      suggestions: SUGGEST.afterStage,
    };
  },

  education: () => ({
    text:
      formations.map((f) => `**${f.titre}** — ${f.lieu} (${f.date}).\n${f.desc}`).join('\n\n') +
      "\n\nL'option SLAM (Solutions Logicielles et Applications Métiers) est la spécialité développement du BTS SIO.",
    links: [{ label: 'Voir le parcours', to: '/#parcours' }],
    suggestions: ['Ses expériences ?', 'Quelles sont ses compétences ?', 'Quel stage recherche-t-il ?'],
  }),

  experience: () => ({
    text: `Ses expériences professionnelles :\n${experiences
      .map((e) => `• **${e.titre}** — ${e.lieu} (${e.date}) : ${e.desc}`)
      .join('\n')}\n\nCôté informatique, son expérience principale est son stage : « ${vedette.titre} ».`,
    links: [
      { label: "Lire l'étude de cas", to: `/projets/${vedette.slug}` },
      { label: 'Voir le parcours', to: '/#parcours' },
    ],
    suggestions: ['Sa formation ?', 'Ses projets ?', 'Comment le contacter ?'],
  }),

  contact: () => ({
    text: `Pour contacter ${P} :\n• Email : **${profil.email}**\n• LinkedIn et GitHub : liens ci-dessous\n\nVous pouvez aussi lui laisser un message directement ici.`,
    links: [
      { label: 'Envoyer un email', href: `mailto:${profil.email}` },
      { label: 'LinkedIn', href: liens.linkedin },
      { label: 'GitHub', href: liens.github },
    ],
    action: askUgo(''),
  }),

  cv: () => ({
    text: `Voici le CV de ${P}, au format PDF.`,
    links: [{ label: 'Télécharger le CV', href: publicUrl(profil.cv), download: true }],
    suggestions: SUGGEST.generic,
  }),

  languages: () => ({
    text: langues.map((l) => `• **${l.nom}** : ${niveauLabel(l).toLowerCase()}`).join('\n'),
    suggestions: SUGGEST.generic,
  }),

  location: () => ({
    text: `${P} est basé à **${profil.localisation}**.`,
    suggestions: ['Quel stage recherche-t-il ?', 'Comment le contacter ?'],
  }),

  site: () => ({
    text: `Je suis un assistant automatique, pas une IA ni ${P} en personne : je réponds à partir des informations publiées sur ce portfolio.\n\nLe site est développé en React (Vite), avec une petite API en PHP. Si je ne sais pas répondre, vous pouvez laisser un message à ${P}.`,
    action: askUgo(''),
    suggestions: SUGGEST.start,
  }),
};

function techAnswer(techs) {
  const blocks = [];
  const links = [];
  for (const tech of techs) {
    const key = normalize(tech.match);
    const skill = allSkills.find((s) => normalize(s.nom).includes(key));
    const used = projets.filter((p) => p.tags.some((t) => normalize(t) === key));
    let line = skill ? `**${skill.nom}** : ${levelText(skill)}.` : `**${tech.match}** : utilisé en projet.`;
    if (used.length) line += `\nUtilisé dans : ${used.map((p) => p.titre).join(', ')}.`;
    blocks.push(line);
    used.forEach((p) => {
      const link = projectLink(p);
      if (link && !links.some((l) => l.label === link.label)) links.push(link);
    });
  }
  return { text: blocks.join('\n\n'), links, suggestions: SUGGEST.afterSkills };
}

function projectAnswer(p) {
  const lines = [`**${p.titre}**`, p.desc, `Technologies : ${p.tags.join(', ')}.`];
  if (p.pointsCles?.length) lines.push('', 'Points clés :', ...p.pointsCles.map((x) => `• ${x}`));
  const links = [];
  if (p.details) links.push({ label: "Lire l'étude de cas", to: `/projets/${p.slug}` });
  if (p.lien) links.push({ label: 'Voir le code sur GitHub', href: p.lien });
  const res = { text: lines.join('\n'), links, suggestions: SUGGEST.afterProjects };
  if (!p.details) {
    res.text += `\n\nPour plus de détails sur ce projet, le mieux est de demander directement à ${P}.`;
    res.action = askUgo(`Bonjour Ugo, j'aimerais en savoir plus sur votre projet « ${p.titre} ».`);
  }
  return res;
}

function unknownTechAnswer(label, question) {
  return {
    text: `**${label}** ne fait pas partie des compétences qu'${P} met en avant sur ce portfolio. Le mieux est de lui poser la question directement.`,
    action: askUgo(question),
    suggestions: ['Quelles sont ses compétences ?', 'Ses projets ?'],
  };
}

function fallback(question) {
  return {
    text: `Je n'ai pas la réponse à cette question. Vous pouvez la transmettre à ${P} : il vous répondra par email.`,
    action: askUgo(question),
    suggestions: SUGGEST.start.slice(0, 3),
  };
}

export const welcome = {
  text: `Bonjour ! Je suis l'assistant du portfolio de ${P}. Posez-moi vos questions sur son parcours, ses compétences, ses projets ou sa recherche de stage.`,
  suggestions: SUGGEST.start,
};

// ── Choix de la réponse ──────────────────────────────────────

export function reply(question) {
  const text = normalize(question);
  if (text.trim() === '') return answers.help();

  const scored = INTENTS.map((intent) => ({ ...intent, score: hits(text, intent.keys) })).filter((i) => i.score > 0);
  // Une salutation accompagnée d'une vraie question : on répond à la question.
  const serious = scored.filter((i) => !i.social);
  const ranked = (serious.length ? serious : scored).sort((a, b) => b.score - a.score);
  const top = ranked[0]?.id;

  const projectHits = projets.filter((p) => (PROJECT_KEYS[p.slug] ?? []).some((k) => has(text, k)));
  const techHits = TECHS.filter((t) => t.aliases.some((a) => has(text, a)));
  const other = OTHER_TECHS.find(([key]) => has(text, key));

  if (projectHits.length === 1 && top !== 'contact') return projectAnswer(projectHits[0]);
  if (projectHits.length > 1) return answers.projects();

  const specific = ['contact', 'internship', 'education', 'experience', 'languages', 'cv', 'site'];
  if (techHits.length && !specific.includes(top)) return techAnswer(techHits);
  if (other && (!top || top === 'skills' || top === 'about')) return unknownTechAnswer(other[1], question);

  if (top) return answers[top]();
  return fallback(question);
}
