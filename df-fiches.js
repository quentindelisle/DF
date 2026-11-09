/* =====================================================================
   DEMI-FOND N'EPS — fiches des exercices (📖), classe de démonstration, styles
   ===================================================================== */
'use strict';

const DF_FICHES = {
  cooper:{
    but:'Mesurer sa VMA : courir la plus grande distance possible en 6 minutes. VMA (km/h) = distance (m) ÷ 100.',
    mat:['Plots numérotés (voir placement)', 'Une tablette par groupe', 'Sifflet'],
    deroul:['Échauffement 10 min progressif (footing, gammes, 2 accélérations).', 'Un groupe court, l\'autre observe : un observateur par coureur, qui compte ses tours.', 'Départ commun au signal ; le chronométreur lance le compte à rebours de 6 min sur la tablette.', 'Au coup de sifflet, chaque coureur s\'arrête sur place ; l\'observateur relève le numéro du dernier plot dépassé (plots numérotés en continu : 8, 9, 10… 40).', 'Sur la tablette : sélectionner les coureurs arrêtés au même plot → toucher le numéro (case 8 à 40). Plot n = VMA de n ÷ 2 km/h avec des plots tous les 50 m.', 'Récupération active 5 min, puis on inverse les rôles.'],
    roles:['Coureur : partir à une allure tenable, accélérer sur la dernière minute', 'Observateur : compter les tours pour annoncer le bon numéro de plot', 'Chronométreur : départ, annonce des minutes et des 30 dernières secondes'],
    reussite:['Allure régulière : pas de départ en sprint', 'Aucun arrêt pendant les 6 minutes', 'Dernier tour au moins aussi rapide que les autres'],
    secu:['Échauffement complet obligatoire', 'Le coureur arrêté sort de la piste par l\'intérieur', 'Signaler tout malaise : arrêt immédiat'],
    vari:['Couloir en aller-retour si pas de piste', 'Annonce des temps de passage pour apprendre l\'allure'] },
  bats:{
    but:'Refaire le demi-Cooper et battre sa VMA du début de cycle. Évaluation intermédiaire notée sur 6 ; la nouvelle VMA sert aux cibles des fractionnés et de l\'évaluation.',
    mat:['Même mise en place que le demi-Cooper'],
    deroul:['Rappel de la VMA du premier test : chacun annonce son objectif (plot visé).', 'Même déroulement que le demi-Cooper.', 'Barème : moins bien → 1 ou 2/6 · même VMA → 3/6 · +0,5 à 1 km/h → 4/6 · +1,5 à 2 km/h → 5/6 · +2,5 km/h et plus → 6/6.'],
    roles:['Coureur, observateur, chronométreur (comme au premier test)'],
    reussite:['Dépasser le plot du premier test', 'Gérer son allure : départ contrôlé, accélération finale'],
    secu:['Échauffement complet', 'Hydratation'],
    vari:['Annoncer à chaque minute la distance qu\'il faudrait avoir couru pour battre sa perf'] },
  aventuriers:{
    but:'Relier des villes de Loire-Atlantique en courant en relais : chaque trajet du plateau coûte autant de tours de piste que de tronçons.',
    mat:['Plateau sur chaque tablette (une tablette pour quelques équipes)', 'Piste ou couloir balisé', 'Chasubles de couleur (facultatif)'],
    deroul:['Équipes de 2 (ou 3) ; chaque équipe reçoit 3 parcours (2 villes à relier). Plus les villes sont éloignées, plus le parcours rapporte.', 'Jeu (30 min) : un coureur de l\'équipe s\'élance pour X tours ; au retour il « achète » un trajet de X tronçons : il choisit son nom puis touche le trajet sur la carte de l\'équipe.', 'Un seul coureur de l\'équipe en course à la fois ; les autres récupèrent.', 'Fin : points des trajets (1 tronçon = 1 pt, 2 = 2, 3 = 4, 4 = 7, 5 = 10) + valeur des parcours reliés + 10 pts à l\'équipe qui a traversé le plus de villes + 10 pts à l\'équipe qui a relié le plus de parcours (égalité : la première arrivée).'],
    roles:['Coureur', 'Stratège de l\'équipe (choix des trajets)', 'Secrétaire : saisit les trajets sur la tablette'],
    reussite:['Courir des relais réguliers, sans s\'épuiser au premier passage', 'Choisir des trajets utiles aux parcours'],
    secu:['Zone de relais hors de la piste', 'Pas de course à contresens'],
    vari:['Trinômes : résultat multiplié par le coefficient choisi s\'il y a aussi des binômes', 'Parcours attribués selon la VMA de l\'équipe pour équilibrer'] },
  equipe:{
    but:'Courir le plus de tours possible pour son équipe pendant la durée fixée ; tous les tours comptent, les pauses sont permises.',
    mat:['1 à 3 tablettes au bord de la piste (une par couleur d\'équipe ou plus)', 'Chasubles de couleur'],
    deroul:['Équipes constituées par l\'enseignant (niveau, besoins, VMA proches ou hasard).', 'Départ commun ; chaque coureur gère son effort, peut faire des pauses.', 'À chaque tour, le coureur passe devant la tablette de son équipe et dit son prénom : le secrétaire touche sa tuile (+1 tour). Un passage impossible (plus de 26 km/h) est ignoré ; ＋ force l\'ajout.', 'Si l\'option est choisie : ⏸ à l\'entrée et à la sortie de pause.', 'Fin : distance de chaque élève, part dans l\'équipe, régularité des tours.'],
    roles:['Coureur', 'Secrétaire à la tablette (tournant)', 'Observateur des pauses'],
    reussite:['Tours réguliers', 'Pauses courtes et utiles'],
    secu:['Les coureurs en pause sortent de la piste', 'Tablette posée hors du couloir de course'],
    vari:['Objectif collectif annoncé (ex. 10 km pour l\'équipe)', 'Tours imposés à allure cible'] },
  pelotons:{
    but:'Courir des 500 m en série homogène (VMA proches) et gagner des points de performance et de joker.',
    mat:['Une tablette par série (ou une pour toutes)', 'Ligne de départ / arrivée'],
    deroul:['Séries proposées par la tablette selon la VMA.', 'Avant chaque course, chaque coureur choisit son joker sur la tablette de sa série.', 'Le starter donne le départ pour toute la série : « 🔫 Départ » sur la tablette.', 'L\'observateur touche « 🏁 Arrivée » sur la tuile de son coureur quand il passe la ligne.', 'Il valide le joker ✓ ou ✗ (lièvre : nombre de coureurs doublés).', 'Note d\'une course /10 : % de VMA (135 % et plus = 5/5, −0,5 par tranche de 5 %) + points du joker. Au-delà de 10, les points sont gardés pour la course suivante.'],
    roles:['Coureur', 'Observateur (arrivée et joker)', 'Starter'],
    reussite:['Choisir un joker réaliste', 'Tenir sa place dans le peloton'],
    secu:['Départ en ligne, pas de bousculade', 'Doubler par l\'extérieur'],
    vari:['Ajouter des jokers (Programmation du cycle)', 'Lièvre désigné par l\'enseignant'] },
  fc:{
    but:'Développer sa VMA par des efforts courts (≥ 95 % VMA) entrecoupés de récupérations.',
    mat:['Plots de distance (ou repères de temps)', 'Une tablette par groupe', 'Minuteur intégré à l\'écran'],
    deroul:['Chaque coureur lit sa cible sur la tablette (temps pour la distance, ou distance pour le temps).', 'Un élève en petite forme (déclaré à l\'appel) court à 10 % de VMA en moins.', 'L\'observateur note chaque répétition : ✓ cible atteinte, ≈ presque, ✗ non atteinte.', 'L\'observateur note les piliers (fin d\'exercice ou à chaque passage).'],
    roles:['Coureur', 'Observateur (cibles et piliers)', 'Chronométreur'],
    reussite:['Atteindre la cible à chaque répétition', 'Même qualité de course sur la dernière répétition'],
    secu:['Récupérations respectées', 'Arrêt si douleur'],
    vari:['30/30, 15/15, 45/30, 200 m, pyramides'] },
  fl:{
    but:'Développer l\'endurance à haute intensité (80 à 90 % VMA) sur des efforts longs.',
    mat:['Plots de distance', 'Une tablette par groupe'],
    deroul:['Cibles calculées d\'après la VMA (temps ou distance).', 'Récupération active (trottiner) entre les efforts.', 'Observateur : ✓ / ≈ / ✗ et piliers.'],
    roles:['Coureur', 'Observateur', 'Chronométreur'],
    reussite:['Allure régulière sur tout l\'effort', 'Récupération active, sans arrêt'],
    secu:['Hydratation', 'Adapter avec la petite forme (−10 %)'],
    vari:['4 × 3 min, 3 × 1000 m, 5 × 600 m, pyramide 1-2-3-2-1 min'] },
  eval:{
    but:'Évaluation auto-référencée : 3 × 500 m avec des cibles calculées d\'après sa VMA. Note /12.',
    mat:['Piste ou couloir', 'Une tablette par groupe'],
    deroul:['Chaque course : 3 pts selon le % de VMA (110 % et plus = 3 · 105 % = 2,5 · 100 % = 2 · 95 % = 1,5 · 90 % = 1 · 85 % = 0,5).', 'Régularité /3 : 0,5 pt retiré par tranche de 4 s d\'écart entre deux courses.', 'Départ commun de la série, l\'observateur touche 🏁 à l\'arrivée de son coureur.', 'Les observateurs notent aussi les piliers.'],
    roles:['Coureur', 'Observateur (arrivée, piliers)', 'Starter'],
    reussite:['Trois courses proches (moins de 4 s d\'écart)', 'Atteindre sa cible'],
    secu:['Récupération active de 10 min entre les courses'],
    vari:['Distance réglable (Programmation du cycle)'] },
};
DF_FICHES.fl = { ...DF_FICHES.fl };
function dfFiche(t, n, i){
  const F = DF_FICHES[t], X = DFX[t], e = n != null && i != null ? dfEx(n, i) : null; if (!F) return;
  const li = a => `<ul>${a.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
  let extra = '';
  if (e) extra += `<p class="pill tgt">${esc(dfExSummary(e))}</p>`;
  if (DF_TEST(t)) extra += dfPisteSVG(dfPiste().mode, dfPiste().L, { plots: dfPlots() }) + `<p><b>Un plot tous les ${fmtN(dfPlotStep(), 0)} m</b>, numérotés en continu : plot n = ${fmtN(dfPlotStep() / 100, 2)} × n km/h. Bouton « 📍 Placement des plots » : numéros à écrire sur chaque plot.</p>`;
  if (t === 'aventuriers') extra += `<div class="df-map small"><svg viewBox="0 0 ${DF_PLATEAU.w} ${DF_PLATEAU.h}"><image href="aventuriers/plateau.jpg" width="${DF_PLATEAU.w}" height="${DF_PLATEAU.h}"/></svg></div><p>1 tronçon = 1 tour de ${dfLap()} m.</p>`;
  if (t === 'pelotons') extra += `<p><b>Jokers :</b></p>${li(dfJoks().map(j => `${j.l} · ${j.p === 'n' ? '1 pt par coureur doublé' : j.p + ' pts'}`))}`;
  modal(`<h2>📖 ${X.ico} ${esc(X.n)}</h2>${extra}<h3>But</h3><p>${esc(F.but)}</p><h3>Matériel et mise en place</h3>${li(F.mat)}<h3>Déroulement</h3><ol>${F.deroul.map(x => `<li>${esc(x)}</li>`).join('')}</ol>
    <h3>Rôles</h3>${li(F.roles)}<h3>Critères de réussite</h3>${li(F.reussite)}<h3>Sécurité</h3>${li(F.secu)}<h3>Variantes</h3>${li(F.vari)}
    <div class="btn-row spread no-print" style="margin-top:12px"><button class="btn" data-print>🖨 Imprimer</button><button class="btn primary" data-close>Fermer</button></div>`, { wide: true });
  dfModalBind();
}

/* =====================================================================
   Classe de démonstration : 3 leçons jouées avec des données plausibles
   ===================================================================== */
const _dfMakeDemo = makeDemoClass;
makeDemoClass = function(){
  _dfMakeDemo();
  const nbL = S.settings.nbLessons, lap = dfLap(), rnd_ = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.floor(Math.random() * a.length)];
  const lvl = {}, V = {}, G = {}; S.students.forEach(s => { lvl[s.id] = Math.random(); V[s.id] = (s.sx === 'F' ? 10 : 11.5) + lvl[s.id] * 5; G[s.id] = rnd_(-0.4, 2.8); });
  S.results = {}; S.notes = {}; S.ppil = {}; S.settings.current = nbL;
  const pilObj = (l, sid, by, q) => ({ by, ...Object.fromEntries(DF_PIL.filter(p => dfLessonPil(l).includes(p.id)).map(p => { const m = dfPilMode(p);
    if (m === 'on') return [p.id, p.crit.map(() => Math.random() < q + 0.15 ? 1 : 0)]; if (m === 'ech') return [p.id, Math.max(1, Math.min(10, Math.round(2 + q * 8 + rnd_(-1.5, 1.5))))];
    const D = [...p.desc].sort((x, y) => x.v - y.v); return [p.id, D[Math.max(0, Math.min(D.length - 1, Math.round(q * (D.length - 1) + rnd_(-0.6, 0.6))))].v]; })) });
  for (let l = 1; l <= nbL; l++) {
    const L = lesson(l); L.att = {}; S.results[l] = {};
    S.students.forEach((s, k) => { if ((k * 7 + l * 3) % 23 === 0) L.att[s.id] = pick([1, 1, 2]); });
    const pres = S.students.filter(s => !isOff(attOf(l, s.id)));
    pres.forEach((s, k) => { const mate = pres[(k + 1) % pres.length], q = Math.min(1, Math.max(0, lvl[s.id] * 0.6 + l * 0.04 + rnd_(-0.15, 0.15)));
      const vma = V[s.id] + (l >= 3 ? G[s.id] * (l >= 6 ? 1 : 0.7) : 0), x = {};
      dfExs(l).forEach((e, i) => { let o;
        if (DF_TEST(e.t)) { const v = e.t === 'bats' ? V[s.id] + G[s.id] : V[s.id]; o = { pn: Math.max(8, Math.min(40, Math.round(v * 100 / dfPlotStep()))) }; }
        else if (e.t === 'equipe') { const n = Math.round(e.dur * 60 * vma * rnd_(0.65, 0.82) / 3.6 / lap); let t = 0; o = { laps: Array.from({ length: n }, () => r10(t += lap / (vma * rnd_(0.68, 0.86) / 3.6), 1)) }; if (e.pauses && k % 4 === 0) o.pz = [[r10(t / 2, 1), r10(t / 2 + 40, 1)]]; }
        else if (e.t === 'aventuriers') { const R = DF_ROUTES.map((_, q) => q).filter(q => (q + k) % 9 < 3).slice(0, 2 + (k % 3)); o = { buys: R.map((q, z) => ({ r: q, ts: now() - 2e6 + k * 3000 + z * 90000 })) }; }
        else if (e.t === 'pelotons') o = { c: Array.from({ length: e.nb }, (_, c) => { const J = dfJoks()[(k + c + l) % dfJoks().length]; return { t: r10(dfTime(e.d, vma, rnd_(102, 128) + q * 8), 2), j: J.id, ok: Math.random() < 0.4 + q * 0.4, nd: J.p === 'n' ? 1 + (k % 3) : 0 }; }) };
        else if (DF_FRAC(e.t)) { const ok = 0.45 + q * 0.5; o = { r: Array.from({ length: e.series || 1 }, () => dfReps(e).map(() => { const z = Math.random(); return z < ok ? 2 : z < ok + 0.2 ? 1 : 0; })), pil: { fin: pilObj(l, s.id, mate.id, q) } }; }
        else if (e.t === 'eval') { const b = dfTime(e.d, vma, rnd_(97, 108) + q * 4); o = { c: [0, 1, 2].map(() => ({ t: r10(b + rnd_(-3, 5) * (1.2 - q), 2) })), pil: { fin: pilObj(l, s.id, mate.id, q) } }; }
        if (o) { if (k % 13 === 5 && l === 5 && i === 0) o.ab = true; o.ts = now(); x[i] = o; } });
      const v = { x, met: Math.max(1, Math.min(4, Math.round(1 + q * 3 + rnd_(-0.5, 0.5)))) };
      if (k % 6 === 2 && DF_FRAC((dfExs(l)[0] || {}).t)) v.fo = true;
      if (CFG.evalObs) v._obs = { by: mate.id, lv: Math.max(1, Math.min(4, Math.round(2 + q * 2 + rnd_(-0.6, 0.6)))) };
      S.results[l][s.id] = { v, ts: now(), d: 'demo' };
      if (l === 4 || l === nbL) { const P = pilObj(l, s.id, null, Math.min(1, q + rnd_(-0.1, 0.1))); delete P.by; (S.ppil[l] = S.ppil[l] || {})[s.id] = P; }
    });
    if (l === 2) S.notes[2] = { [pres[0].id]: 'Part trop vite sur les 30/30', [pres[3].id]: 'Très bon investissement' };
  }
  save(); toast('🧪 Classe de démonstration : cycle complet de ' + nbL + ' leçons', 3500);
};

/* ---------- Styles propres à l'appli ---------- */
document.head.insertAdjacentHTML('beforeend', `<style>
.df-sub{margin:18px 0 8px}
.df-help{background:#EAF2FB;border-color:var(--navy)}.df-pilfocus{color:#B5514C;font-weight:800;margin:0 0 8px}
.df-pilcfg>div:first-child{flex:1;min-width:220px}
.df-exgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px}
.df-exbtn{display:flex;flex-direction:column;align-items:flex-start;gap:4px;text-align:left;border:3px solid var(--xc);border-left-width:12px;border-radius:14px;background:#fff;padding:12px 14px;color:var(--ink)}
.df-exbtn .ico{font-size:30px}.df-exbtn b{font-size:19px}.df-exbtn small{color:var(--grey);font-weight:600}
.df-exhead{display:flex;justify-content:space-between;align-items:center;gap:10px;border-color:var(--navy)}
.df-excard{border-left:10px solid var(--xc)}.df-exline{border-left:8px solid var(--xc)}
.df-timer{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;background:var(--navy);color:#fff;border-radius:16px;padding:10px 18px;margin-bottom:12px}
.df-timer b{font-size:56px;line-height:1;font-variant-numeric:tabular-nums;display:block}.df-timer small{font-weight:700;opacity:.9}
.df-timer.run{background:#1E8E3E}.df-timer.end{background:#D0161B}
.df-timer .btn{border-color:#fff}
.df-modes{margin:6px 0}.df-setup{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.tile.df-tile{position:relative;cursor:pointer;min-height:118px}
.df-tile .df-big{font-size:40px;font-weight:900;line-height:1}.df-tile .df-big small{font-size:15px}
.tile.sel{outline:5px solid var(--orange);outline-offset:-2px;background:#FFF3E2}
.tile.abd{opacity:.55;background:repeating-linear-gradient(45deg,#fff,#fff 10px,#FFE7E5 10px,#FFE7E5 20px)}
.tile.paused{background:#EEF1F6}
.df-ab,.df-minus,.df-plus,.df-pz,.df-fo{position:absolute;border:2px solid var(--line);background:#fff;border-radius:10px;font-weight:900;min-width:40px;min-height:40px}
.df-ab{right:6px;bottom:6px}.df-ab.on{background:#D0161B;border-color:#D0161B}
.df-minus{left:6px;bottom:6px}.df-plus{left:52px;bottom:6px}.df-pz{right:52px;bottom:6px}.df-pz.on{background:#FFD000}
td .df-ab{position:static}.df-fo{position:static;margin-left:6px}.df-fo.on{background:#FFD000;border-color:#F59E0B}
.df-plotbar.dim{opacity:.7}.df-plotbar .btn-row{margin-top:8px}
.df-pn{display:grid;grid-template-columns:repeat(auto-fill,minmax(74px,1fr));gap:8px;margin-top:10px}
.df-pnb{border:3px solid var(--navy);border-radius:12px;background:#fff;color:var(--navy);padding:6px 2px;display:flex;flex-direction:column;align-items:center;min-height:62px}
.df-pnb b{font-size:24px;line-height:1}.df-pnb small{font-size:12px;font-weight:700;color:var(--grey)}
.df-pnb:not([disabled]):active{background:var(--orange);color:#fff}.df-pnb[disabled]{opacity:.45}
.df-wide{grid-template-columns:repeat(auto-fill,minmax(300px,1fr))}.df-wide .tile.df-tile{align-items:flex-start;padding-bottom:52px}
.df-fin{min-height:58px;font-size:20px}.df-jok{text-align:left}
.df-score{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin-bottom:10px}
.df-sc{border:4px solid var(--tc);border-radius:14px;padding:8px 12px;background:#fff;display:flex;flex-direction:column}.df-sc span{font-size:26px;font-weight:900}
.df-team{border-color:var(--tc);border-left-width:12px}
.df-mat td,.df-mat th{text-align:center;padding:4px}.df-mat td.nm{text-align:left}.df-mat td.nm>div{display:inline-block}
.df-cell{width:58px;height:52px;border:2px solid var(--line);border-radius:10px;background:#fff;font-size:22px;font-weight:900;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1}
.df-cell small{font-size:11px;font-weight:700;opacity:.85}
tr.abd{opacity:.5}
.df-pil{border-top:1px solid #E6EBF3;padding:8px 0}.df-pil h4{margin:0 0 6px}
.df-svg{width:100%;max-width:520px;display:block;margin:6px auto}
.df-steps ol{margin-top:4px}.df-conv td,.df-conv th{text-align:center}
.df-av{display:grid;grid-template-columns:minmax(260px,340px) 1fr;gap:12px;align-items:start}
@media (max-width:900px){.df-av{grid-template-columns:1fr}}
.df-map{border:3px solid var(--navy);border-radius:16px;overflow:hidden;background:#5BC0EB}.df-map svg{display:block;width:100%;height:auto}
.df-map.small{max-width:520px;margin:6px auto}
.df-rt{cursor:pointer}.df-rt:hover rect{fill:rgba(255,255,255,.45)}.df-rt.own:hover rect{fill-opacity:.8}
.df-tk{display:flex;justify-content:space-between;padding:8px 10px;border:2px dashed var(--line);border-radius:10px;margin-bottom:6px}.df-tk.ok{border:2px solid #1E8E3E;background:#E7F5DF}
.df-avsc{font-size:18px}.choices .ch small{display:block;font-size:12px;opacity:.8}
.df-pistes{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin-bottom:8px}
.df-pc{border:3px solid var(--line);border-radius:16px;background:#fff;padding:8px;display:flex;flex-direction:column;align-items:center;gap:2px;color:var(--ink)}
.df-pc.on{border-color:var(--navy);box-shadow:0 0 0 4px var(--orange)}.df-pc small{color:var(--grey)}
.df-comp .df-cols{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin-top:10px}
.df-col{border:3px solid var(--tc);border-radius:14px;padding:8px;display:flex;flex-wrap:wrap;gap:6px;align-content:flex-start;background:#fff}
.df-colh{width:100%;border:0;background:var(--tc);color:#fff;font-weight:900;border-radius:10px;padding:8px;text-shadow:0 1px 2px rgba(0,0,0,.4)}
.df-compd summary{cursor:pointer;padding:6px 0}.df-tkrow{padding:6px 0;border-top:1px solid #E6EBF3}
.df-sv{min-width:90px;text-align:center}
.up{color:#1E8E3E}.down{color:#D0161B}
</style>`);
ACT.demoClass = async () => { if (!(await confirmBox('Créer la classe de démonstration ?', '18 élèves fictifs avec un cycle complet (8 leçons, tous les exercices, évaluation, piliers de l\'enseignant). Vos classes ne sont pas modifiées.', 'Créer'))) return; makeDemoClass(); go('prof', { profTab:'menu' }); };

/* Classe de démonstration : dans « Classe & élèves » (et plus dans Export & sauvegarde) */
const _dfProfExport = profExport;
profExport = () => _dfProfExport().replace(/<div class="card"><h3>🧪 Classe de démonstration<\/h3>[\s\S]*?<\/button><\/div>/, '');
const _dfProfClasse = profClasse;
profClasse = () => _dfProfClasse() + `<div class="card"><h3>🧪 Classe de démonstration</h3><p class="muted">Une classe fictive de 18 élèves avec un cycle complet (8 leçons, tous les exercices, évaluation, piliers), pour tester ou présenter l'appli. Elle s'ajoute à vos classes et se supprime comme une classe normale.</p>
  <button class="btn" data-action="demoClass">🧪 Créer la classe de démonstration</button></div>`;
