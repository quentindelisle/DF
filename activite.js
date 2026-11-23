/* =====================================================================
   ACTIVITÉ — Demi-fond N'EPS (CA1) · performance auto-référencée
   Socle N'EPS 1.5.0 · Quentin Delisle · N'EPS numérique
   Les exercices (test VMA demi-Cooper ou VAMEVAL, Bats tes perfs, Run Express, course d'équipe,
   course en pelotons, fractionnés, Zombie Frac', Kart'Endurance, Gare aux loups, évaluation 3 × 500 m) sont dans df-*.js.
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
  version: '2.7.0',
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
      explication:'Noté sur 6 : investissement comme coureur /3 (exercices faits sans abandon, cibles des fractionnés atteintes) et comme observateur /3 (observations faites, accord avec l\'enseignant).' },
    { id:'FM', nom:'Fil bleu · Piliers', actif:true, couleur:'#1E5FD8',
      regle:{ type:'fonction', calcul:(n, sid) => window.DF_frPil ? window.DF_frPil(n, sid) : null },
      explication:'Noté sur 6 : critères techniques observés (foulée, posture, bras, regard, gestion de l\'effort), notés par l\'enseignant (2/3) et par les observateurs (1/3).' },
  ],

  grade: { on:false, total:20, items:[] },   // évaluation par blocs : onglet 📝 Évaluation

  tools: {
    timer:{ on:true, el:true, presets:'30, 60, 180, 360, 600' },
    interval:{ on:true, el:true, work:30, rest:30, rounds:8 },
    chrono:{ on:true, el:true },
    tirage:{ on:false }, equipes:{ on:false }, rotation:{ on:false }, score:{ on:false }, tours:{ on:false },
  },
};
