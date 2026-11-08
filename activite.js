/* =====================================================================
   ACTIVITÉ — Demi-fond N'EPS (CA1) · performance auto-référencée
   Socle N'EPS 1.3.0 · Quentin Delisle · N'EPS numérique
   Les exercices (test demi-Cooper, Bats tes perfs, Aventuriers du 44, course d'équipe,
   course en pelotons, fractionnés, évaluation 3 × 500 m) sont dans df-*.js.
   Les saisies ci-dessous sont la synthèse de chaque leçon, calculée par df-core.js.
   ===================================================================== */
window.APP_CONFIG = {
  id: 'demifond-vma-r4k8',           // NE JAMAIS CHANGER après diffusion
  name: 'Demi-fond N\'EPS',
  short: 'Demi-fond',
  sub: 'CA1 · Demi-fond · performance auto-référencée',
  author: 'Quentin Delisle',
  color: '#0B346E',                  // bleu marine de l'icône
  accent: '#F7941D',                 // orange de l'anneau
  version: '2.0.0',
  url: '',

  mode: 'cycle',
  lessons: 8,
  attempts: 1,
  maxGroups: 8,
  sexe: true,

  fields: [
    { id:'vma', label:'VMA mesurée', type:'calc', per:'lesson', formula:'', unit:'km/h', dec:1, better:'high' },
    { id:'dist', label:'Distance courue', type:'calc', per:'lesson', formula:'', unit:'m', dec:0, better:'high' },
    { id:'cibles', label:'Cibles des fractionnés', type:'calc', per:'lesson', formula:'', unit:'%', dec:0, better:'high' },
    { id:'pil', label:'Piliers (observateurs)', type:'calc', per:'lesson', formula:'', unit:'%', dec:0, better:'high' },
    { id:'ab', label:'Abandons', type:'calc', per:'lesson', formula:'', dec:0, better:'low' },
    { id:'met', label:'Je m\'organise (méthode)', type:'choice', per:'lesson', double:true,
      help:'L\'observateur situe l\'échauffement, le respect des récupérations et le rôle tenu.',
      opts:[ { l:'Insuffisant', v:1, c:'#D0161B' }, { l:'Fragile', v:2, c:'#F07000' }, { l:'Satisfaisant', v:3, c:'#86DC96' }, { l:'Très bon', v:4, c:'#0B4F1C' } ] },
  ],

  parametres: [],
  ressources: [],
  evalObs: { label:'Mon observateur m\'a aidé à progresser' },

  roles: [ { n:'Coureur', d:'Je cours sur ma cible' },
           { n:'Observateur', d:'Je saisis les tours, les cibles et les piliers' },
           { n:'Starter / chrono', d:'Je donne les départs et je gère le temps' } ],
  rotate: true,

  filsRouges: [
    { id:'FR', nom:'Fil rouge · Investissement', actif:true, couleur:'#D0161B',
      regle:{ type:'fonction', calcul:(n, sid) => window.DF_frInvest ? window.DF_frInvest(n, sid) : null },
      explication:'Exercices de la leçon faits sans abandon → satisfaisante ; et cibles des fractionnés atteintes à 75 % → très bonne ; un abandon → fragile ; tout abandonné → insuffisante.' },
    { id:'FM', nom:'Fil bleu · Méthodo', actif:true, couleur:'#1E5FD8', regle:{ type:'echelle', champ:'met' },
      explication:'Niveau d\'organisation donné par l\'observateur à chaque leçon (échauffement, récupérations, rôle tenu).' },
  ],

  grade: { on:false, total:20, items:[] },   // évaluation par blocs : onglet 📝 Évaluation

  tools: {
    timer:{ on:true, el:true, presets:'30, 60, 180, 360, 600' },
    interval:{ on:true, el:true, work:30, rest:30, rounds:8 },
    chrono:{ on:true, el:true },
    tirage:{ on:false }, equipes:{ on:false }, rotation:{ on:false }, score:{ on:false }, tours:{ on:false },
  },
};
