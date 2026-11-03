/* =====================================================================
   ACTIVITÉ — Demi-fond · performance auto-référencée (CA1)
   Socle N'EPS 1.3.0 · Quentin Delisle · N'EPS numérique
   Le plan des courses de chaque leçon (distance + % de VMA) et les calculs
   propres au demi-fond (VMA, temps visés, écarts) sont dans specifique.js.
   ===================================================================== */
window.APP_CONFIG = {
  /* ---------- Identité ---------- */
  id: 'demifond-vma-r4k8',           // NE JAMAIS CHANGER après diffusion
  name: 'Demi-fond VMA',
  short: 'Demi-fond',
  sub: 'CA1 · Demi-fond · performance auto-référencée',
  author: 'Quentin Delisle',
  color: '#B83A1B',                  // rouge brique (piste)
  accent: '#FFC21A',
  version: '1.0.0',
  url: '',

  /* ---------- Organisation ---------- */
  mode: 'cycle',
  lessons: 8,
  attempts: 3,                       // remplacé leçon par leçon par le nombre de courses du plan (specifique.js)
  maxGroups: 8,
  sexe: true,

  /* ---------- Saisies ----------
     Demi-Cooper (leçons « test VMA ») : tours + mètres → distance → VMA.
     Leçons de courses : un temps par course prévue (chrono), critères d'allure et de posture, méthode.
     ecart, ok et gain sont calculés par specifique.js (temps visés d'après la VMA de référence). */
  fields: [
    { id:'tours', label:'Demi-Cooper : tours complets', type:'counter', per:'lesson', min:0, max:16, step:1, better:'high',
      help:'Nombre de tours de piste complets en 6 minutes (outil « Compteur de tours » possible).' },
    { id:'metres', label:'Demi-Cooper : mètres du dernier tour', type:'dial', per:'lesson', min:0, max:390, step:10, unit:'m', better:'high',
      help:'Distance parcourue sur le tour non terminé au coup de sifflet (repères tous les 10 m).' },
    { id:'dist', label:'Distance en 6 min', type:'calc', per:'lesson', formula:'{tours} * {piste} + {metres}', unit:'m', dec:0, better:'high' },
    { id:'vma', label:'VMA', type:'calc', per:'lesson', formula:'ARRONDI({dist} / 100 ; 1)', unit:'km/h', dec:1, better:'high' },
    { id:'tps', label:'Temps de la course', type:'chrono', per:'try', agg:'mean', better:'low',
      help:'Le chronométreur lance au départ et arrête à l\'arrivée. Le coureur court sans montre.' },
    { id:'ecart', label:'Écart annoncé / réalisé', type:'calc', per:'lesson', formula:'', unit:'%', dec:1, better:'low', show:true },
    { id:'ok', label:'Courses réussies', type:'calc', per:'lesson', formula:'', dec:0, better:'high' },
    { id:'gain', label:'Progrès de VMA', type:'calc', per:'lesson', formula:'', unit:'km/h', dec:1, better:'high' },
    { id:'allure', label:'Pilier : gérer son allure', type:'criteres', per:'lesson',
      criteres:['Allure régulière : pas de grosse accélération ni de fin effondrée', 'Départ contrôlé, sans partir trop vite', 'Respiration maîtrisée à l\'arrivée'],
      conseils:['Cale-toi sur le temps de passage annoncé et garde la même foulée jusqu\'au bout.', 'Les 50 premiers mètres : pars plus lentement que tu ne le crois.', 'Souffle long par la bouche ; si tu es « dans le rouge », ton allure est trop élevée.'] },
    { id:'posture', label:'Pilier : posture de course', type:'criteres', per:'lesson',
      criteres:['Buste droit, tête dans l\'axe, regard loin devant', 'Bras actifs, coudes à 90°, d\'avant en arrière', 'Pose du pied sous le corps, foulée dynamique', 'Épaules et mains relâchées'],
      conseils:['Grandis-toi, regarde 10 m devant toi, pas tes pieds.', 'Les bras rythment la course : coudes près du corps, pas de croisement devant.', 'Pose le pied sous toi, pas loin devant : moins de freinage.', 'Mains ouvertes comme si tu tenais un œuf ; laisse tomber les épaules.'] },
    { id:'met', label:'Je m\'organise (méthode)', type:'choice', per:'lesson', double:true,
      help:'L\'observateur situe l\'échauffement, le respect des récupérations et le rôle tenu.',
      opts:[ { l:'Insuffisant', v:1, c:'#D0161B' }, { l:'Fragile', v:2, c:'#F07000' }, { l:'Satisfaisant', v:3, c:'#86DC96' }, { l:'Très bon', v:4, c:'#0B4F1C' } ] },
  ],

  /* ---------- Réglages de l'enseignant (Paramètres du cycle) ---------- */
  parametres: [
    { id:'piste', label:'Longueur de la piste', unit:'m', def:250, min:100, max:400, step:10 },
    { id:'tol', label:'Tolérance d\'une course réussie (écart au temps visé)', unit:'%', def:3, min:1, max:10, step:0.5 },
  ],

  ressources: [],

  evalObs: { label:'Mon observateur m\'a aidé à tenir mon allure' },

  /* ---------- Rôles (trinôme, rotation automatique) ---------- */
  roles: [ { n:'Coureur', d:'Je cours sans montre, sur le temps visé' },
           { n:'Chronométreur', d:'Je donne le départ, j\'annonce les passages, je saisis le temps' },
           { n:'Observateur', d:'Je coche les critères d\'allure et de posture' } ],
  rotate: true,

  /* ---------- Fils ---------- */
  filsRouges: [
    { id:'FR', nom:'Fil rouge · Investissement', actif:true, couleur:'#D0161B',
      regle:{ type:'fonction', calcul:(n, sid) => window.DF_frInvest ? window.DF_frInvest(n, sid) : null },
      explication:'Courses prévues toutes faites, puis part des courses réussies (temps visé tenu à la tolérance près, ou battu en « Bats tes perfs ») : 75 % et plus → très bonne ; 50 % → satisfaisante ; moins → fragile ; courses non faites → insuffisante. Test demi-Cooper fait → satisfaisante.' },
    { id:'FM', nom:'Fil bleu · Méthodo', actif:true, couleur:'#1E5FD8', regle:{ type:'echelle', champ:'met' },
      explication:'Niveau d\'organisation donné par l\'observateur à chaque leçon (échauffement, récupérations, rôle tenu).' },
  ],

  /* ---------- Note sur 20 ----------
     ecart : écart moyen (en % du temps annoncé) des 3 courses imposées de la leçon d'évaluation — ≤ 1 % = 10, ≥ 10 % = 0.
     gain  : VMA du dernier demi-Cooper − VMA du premier — 0 = 0 pt, +1,5 km/h et plus = 6 pts. */
  grade: { on:true, total:20, items:[
    { field:'ecart', from:'best', pts:10, table:[[1,10],[10,0]], label:'Écart annoncé / réalisé (L8)' },
    { field:'gain', from:'best', pts:6, table:[[0,0],[1.5,6]], label:'Progrès de VMA (L1 → L6)' },
    { field:'fr:FR', pts:2, table:[[1,0],[4,2]], label:'Fil rouge investissement' },
    { field:'fr:FM', pts:2, table:[[1,0],[4,2]], label:'Fil bleu méthodo' } ] },

  /* ---------- Outils de séance ---------- */
  tools: {
    timer:{ on:true, el:true, presets:'60, 120, 180, 360' },
    tours:{ on:true, el:true, field:'tours' },
    chrono:{ on:true, el:true },
    tirage:{ on:false }, equipes:{ on:false }, rotation:{ on:false }, interval:{ on:false }, score:{ on:false },
  },
};
