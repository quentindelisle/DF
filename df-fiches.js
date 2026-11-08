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
    deroul:['Équipes de 2 (ou 3) ; chaque équipe reçoit 3 parcours (2 villes à relier). Plus les villes sont éloignées, plus le parcours rapporte.', 'Temps d\'organisation : lire ses parcours, choisir les trajets, l\'ordre des relais.', 'Jeu (30 min) : un coureur de l\'équipe s\'élance pour X tours ; au retour il « achète » un trajet de X tronçons : il choisit son nom puis touche le trajet sur la carte de l\'équipe.', 'Un seul coureur de l\'équipe en course à la fois ; les autres récupèrent.', 'Fin : points des trajets (1 tronçon = 1 pt, 2 = 2, 3 = 4, 4 = 7, 5 = 10) + valeur des parcours reliés + 10 pts à l\'équipe qui a traversé le plus de villes + 10 pts à l\'équipe qui a relié le plus de parcours (égalité : la première arrivée).'],
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
  _dfMakeDemo(); const lap = dfLap(), V = {}; S.students.forEach(s => V[s.id] = (s.sx === 'F' ? 10.5 : 12) + Math.random() * 4);
  const rnd_ = (a, b) => a + Math.random() * (b - a), last = curLesson() - 1;
  for (let l = 1; l <= last; l++) { S.results[l] = S.results[l] || {};
    dfExs(l).forEach((e, i) => S.students.forEach((s, k) => { const r = S.results[l][s.id]; if (!r) return; r.v.x = r.v.x || {}; const vma = V[s.id] + (l > 2 ? 0.6 : 0);
      const mate = S.students.find(o => o.id !== s.id && o.grp === s.grp && ((S.students.indexOf(o) + 1) % S.students.length) !== k) || S.students[(k + 1) % S.students.length];
      const pil = () => ({ by: mate.id, ...Object.fromEntries(DF_PIL.map(p => [p.id, p.desc[Math.min(p.desc.length - 1, Math.floor(Math.random() * p.desc.length))].v])) });
      if (DF_TEST(e.t)) { const k = Math.max(8, Math.min(40, Math.round(vma * 100 / dfPlotStep()))); r.v.x[i] = { pn: k, ts: now() }; if (e.t === 'cooper') V[s.id] = k * dfPlotStep() / 100; }
      else if (e.t === 'equipe') { const n = Math.round(e.dur * 60 * vma * 0.75 / 3.6 / lap); let t = 0; r.v.x[i] = { laps: Array.from({ length: n }, () => r10(t += lap / (vma * rnd_(0.7, 0.85) / 3.6), 1)), ts: now() }; }
      else if (e.t === 'aventuriers') { const R = DF_ROUTES.map((x, q) => q).filter(q => q % S.students.length === k || (q + 7) % S.students.length === k).slice(0, 3); r.v.x[i] = { buys: R.map((q, z) => ({ r: q, ts: now() - 1e6 + k * 1000 + z * 60000 })), ts: now() }; }
      else if (e.t === 'pelotons') r.v.x[i] = { c: Array.from({ length: e.nb }, (_, q) => { const J = dfJoks()[(k + q) % dfJoks().length]; return { t: r10(dfTime(e.d, vma, rnd_(108, 128)), 2), j: J.id, ok: Math.random() < 0.55, nd: J.p === 'n' ? 2 : 0 }; }), ts: now() };
      else if (DF_FRAC(e.t)) r.v.x[i] = { r: Array.from({ length: e.series }, () => dfReps(e).map(() => [2, 2, 2, 1, 0][Math.floor(Math.random() * 5)])), pil: { fin: pil() }, ts: now() };
      else if (e.t === 'eval') { const b = dfTime(e.d, vma, rnd_(98, 110)); r.v.x[i] = { c: [0, 1, 2].map(() => ({ t: r10(b + rnd_(-4, 6), 2) })), pil: { fin: pil() }, ts: now() }; }
      if (k % 11 === 7 && l === last && i === 0) r.v.x[i].ab = true; })); }
  save();
};

/* ---------- Styles propres à l'appli ---------- */
document.head.insertAdjacentHTML('beforeend', `<style>
.df-sub{margin:18px 0 8px}
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
