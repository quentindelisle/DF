/* =====================================================================
   DEMI-FOND N'EPS — fiches des exercices (📖), classe de démonstration, styles
   ===================================================================== */
'use strict';

/* Fiches 📖 rédigées pour les élèves de seconde (à lire avant la leçon pour la préparer).
   Chaque fiche est une fonction de l'exercice programmé (e) : distances, durées et plateau à jour. */
const dfFx = e => e || {};
const DF_FICHES = {
  cooper: e => dfProto(e) === 'vameval' ? {
    but:'Mesurer ta VMA (vitesse maximale aérobie) : la vitesse la plus élevée que tu peux tenir en respirant encore « à fond ». C\'est ton repère pour tout le cycle : les allures des séances seront calculées à partir d\'elle.',
    savoir:['Le test VAMEVAL est progressif : tu pars très lentement (' + fmtN(dfFx(e).v0 || 8, 1) + ' km/h) et la vitesse augmente de 0,5 km/h chaque minute.', 'Des plots sont posés tous les ' + fmtN(dfVamStep(), 0) + ' m environ. À chaque bip, tu dois arriver au plot suivant. Un double bip annonce que ça accélère.', 'Ta VMA = la vitesse du dernier palier (minute) que tu as terminé en entier.'],
    deroul:['Échauffement de 10 minutes : footing lent, gammes (talons-fesses, montées de genoux), 2 accélérations.', 'La classe est en binômes : l\'un court, l\'autre observe. Puis on inverse.', 'Au départ, tout le monde court ensemble en suivant les bips : ni en avance, ni en retard.', 'Quand tu as 2 bips de retard ou que tu n\'arrives plus à suivre, tu t\'arrêtes et tu sors de la piste par l\'intérieur. Ton observateur le signale tout de suite pour que ta VMA soit enregistrée.', 'Récupération en marchant, puis tu deviens observateur.'],
    roles:['Coureur : rester calé sur les bips, sans partir devant.', 'Observateur : vérifier que ton camarade atteint chaque plot à temps, annoncer son arrêt à la personne qui tient la tablette.'],
    reussite:['Je suis le rythme sans prendre d\'avance au début.', 'Je vais au bout de mes possibilités : je m\'arrête quand je ne peux vraiment plus suivre.', 'Je connais ma VMA à la fin de la leçon et je la note.'],
    secu:['Échauffement complet obligatoire.', 'Si tu as mal (poitrine, malaise, douleur) : tu t\'arrêtes tout de suite et tu préviens.', 'On sort de la piste par l\'intérieur sans couper la route des autres.'],
    prep:['Viens en tenue de course avec des chaussures lacées et une bouteille d\'eau.', 'Calcule : à 10 km/h, combien de mètres parcours-tu en 1 minute ? (10 000 m ÷ 60 ≈ 167 m)', 'Réfléchis : pourquoi un test progressif évite-t-il de « partir trop vite » ?'] } : {
    but:'Mesurer ta VMA (vitesse maximale aérobie) : courir la plus grande distance possible en 6 minutes. Ta VMA (en km/h) = ta distance (en m) ÷ 100. Exemple : 1 200 m → 12 km/h.',
    savoir:['La VMA sert de repère pour tout le cycle : les allures des séances seront calculées à partir d\'elle.', 'Des plots numérotés sont posés tous les ' + fmtN(dfPlotStep(), 0) + ' m. À la fin, tu annonces le numéro du dernier plot que tu as dépassé.', 'Le secret : une allure régulière. Celui qui part en sprint s\'écroule après 2 minutes.'],
    deroul:['Échauffement de 10 minutes : footing lent, gammes (talons-fesses, montées de genoux), 2 accélérations.', 'La classe est en binômes : l\'un court, l\'autre observe. Puis on inverse.', 'Départ ensemble au signal. Le chrono de 6 minutes tourne sur la tablette ; les minutes sont annoncées.', 'Au coup de sifflet final, tu t\'arrêtes sur place et tu annonces le numéro du dernier plot dépassé.', 'Récupération en marchant 5 minutes, puis tu deviens observateur.'],
    roles:['Coureur : partir à une allure que tu peux tenir, accélérer dans la dernière minute.', 'Observateur : compter les tours de ton camarade pour vérifier le bon numéro de plot.', 'Chronométreur : annoncer chaque minute et les 30 dernières secondes.'],
    reussite:['Je cours les 6 minutes sans m\'arrêter.', 'Mes tours ont à peu près tous la même durée.', 'Ma dernière minute est au moins aussi rapide que les autres.'],
    secu:['Échauffement complet obligatoire.', 'Si tu as mal (poitrine, malaise, douleur) : tu t\'arrêtes tout de suite et tu préviens.', 'À la fin, on sort de la piste par l\'intérieur.'],
    prep:['Viens en tenue de course avec des chaussures lacées et une bouteille d\'eau.', 'Calcule : si tu cours 1 350 m en 6 minutes, quelle est ta VMA ?', 'Fixe-toi un objectif : quel plot veux-tu atteindre ?'] },
  bats: e => { const F = DF_FICHES.cooper(e); return { ...F,
    but:'Refaire le test VMA pour battre ta VMA du début du cycle. C\'est une évaluation : tu es noté sur 6 selon tes progrès. Ta nouvelle VMA servira à calculer tes allures pour la suite et pour l\'évaluation finale.',
    reussite:['Je dépasse ma VMA du premier test.', 'Je gère mon allure : départ contrôlé, fin forte.', 'Barème : moins bien → 1 ou 2/6 · même VMA → 3/6 · +0,5 à 1 km/h → 4/6 · +1,5 à 2 km/h → 5/6 · +2,5 km/h et plus → 6/6.'],
    prep:['Retrouve ta VMA du premier test et calcule ce qu\'il te faut pour gagner 0,5 km/h.', 'Repense à ton premier test : es-tu parti trop vite ? trop lentement ?', 'Viens en tenue avec de l\'eau.'] }; },
  aventuriers: e => ({
    but:'Un jeu de relais par équipe sur la carte « ' + dfBoardName(e) + ' » : vous reliez des villes en courant. Chaque trajet de la carte se « paie » en courant autant de tronçons qu\'il en a.',
    savoir:['1 tronçon de la carte = ' + dfSegM(e) + ' m à courir.', 'Votre équipe reçoit ' + (dfFx(e).nbParc || 3) + ' parcours (2 villes à relier) : plus elles sont éloignées, plus le parcours rapporte de points.', 'Points d\'un trajet : 1 tronçon = 1 pt · 2 = 2 · 3 = 4 · 4 = 7 · 5 = 10. Les longs trajets rapportent beaucoup, mais il faut les courir !', 'Bonus : +10 pts à l\'équipe qui traverse le plus de villes, +10 pts à celle qui relie le plus de parcours.'],
    deroul:['Équipes de ' + (dfFx(e).taille === 3 ? '3' : '2') + '. Avant de courir, regardez la carte et choisissez ensemble votre trajet.', 'Un seul coureur de l\'équipe court à la fois ; les autres récupèrent.', 'Au retour, il va à la tablette : il touche la couleur de son équipe, son prénom, puis le trajet qu\'il vient de courir.', 'Le temps de jeu est de ' + (dfFx(e).dur || 30) + ' minutes. Quand le chrono est terminé, on compte les points.'],
    roles:['Coureur : choisir un trajet adapté à ta forme et courir à une allure régulière.', 'Stratège : proposer les trajets utiles pour relier vos parcours.', 'Secrétaire : saisir le trajet sur la tablette sans se tromper.'],
    reussite:['Je cours des relais réguliers, sans m\'épuiser au premier passage.', 'Je choisis des trajets qui servent à nos parcours.', 'Je récupère activement entre deux relais (je marche, je respire).'],
    secu:['La zone de relais est hors de la piste.', 'On ne court pas à contresens.', 'On boit pendant les récupérations.'],
    prep:['Regarde la carte : quelles villes de tes parcours sont proches ? lointaines ?', 'Calcule : combien de mètres pour un trajet de 4 tronçons ? (4 × ' + dfSegM(e) + ' m)', 'Réfléchis : vaut-il mieux courir plusieurs petits trajets ou un grand ?'] }),
  equipe: e => ({
    but:'Courir le plus de tours possible pour ton équipe pendant ' + (dfFx(e).dur || 12) + ' minutes. Tous tes tours comptent pour l\'équipe et tu as le droit de faire des pauses.',
    savoir:['C\'est une course longue : il faut doser ton effort pour tenir jusqu\'au bout.', 'Une pause courte et bien placée peut te permettre de faire plus de tours au total.'],
    deroul:['Les équipes sont faites par ton professeur.', 'Départ ensemble. Chacun gère son effort et peut s\'arrêter pour récupérer.', 'À chaque tour, tu passes devant la tablette de ton équipe et tu dis ton prénom : le secrétaire ajoute ton tour.', 'À la fin, tu vois ta distance et ta part dans le total de l\'équipe.'],
    roles:['Coureur : tenir une allure régulière.', 'Secrétaire à la tablette (chacun son tour) : ajouter les tours sans erreur.', 'Observateur des pauses : noter les entrées et sorties de pause.'],
    reussite:['Mes tours ont à peu près la même durée.', 'Mes pauses sont courtes et utiles.', 'J\'apporte ma part au total de l\'équipe.'],
    secu:['En pause, tu sors de la piste.', 'La tablette est posée hors du couloir de course.'],
    prep:['Fixe-toi un objectif de tours pour toi.', 'Calcule : combien de mètres fait ton équipe si elle court 40 tours de ' + dfLap() + ' m ?'] }),
  pelotons: e => ({
    but:'Courir des ' + (dfFx(e).d || 500) + ' m en groupe de niveau proche (même VMA) et marquer des points de performance et de joker.',
    savoir:['Ta note de course sur 10 = points de vitesse (selon ton % de VMA : 135 % et plus = 5/5) + points du joker réussi.', 'Le joker est un défi que tu choisis avant de courir (par exemple : finir dans les 3 premiers, doubler des coureurs…).'],
    deroul:['Les séries sont faites selon la VMA.', 'Avant chaque course, choisis ton joker sur la tablette de ta série.', 'Départ de toute la série au signal.', 'Ton observateur arrête ton temps à l\'arrivée et valide (ou non) ton joker.', 'Au-delà de 10 points, le surplus est gardé pour la course suivante.'],
    roles:['Coureur : choisir un joker réaliste et tenir sa place dans le groupe.', 'Observateur : arrivée et joker de son coureur.', 'Starter : donner le départ.'],
    reussite:['Mon joker est réussi.', 'Je reste dans le groupe sans m\'épuiser trop tôt.'],
    secu:['Départ en ligne, sans bousculade.', 'On double par l\'extérieur.'],
    prep:['Regarde la liste des jokers et choisis celui qui te correspond.', 'Calcule le temps à viser sur ' + (dfFx(e).d || 500) + ' m à 100 % de ta VMA (aide : temps (s) = distance ÷ (VMA ÷ 3,6)).'] }),
  fc: e => ({
    but:'Développer ta VMA avec des efforts courts et rapides (autour de ta VMA), séparés par des récupérations.',
    savoir:['Séance : ' + (e ? dfFracSummary(e) : 'efforts courts et récupérations') + '.', 'La tablette calcule ta cible à partir de ta VMA : un temps pour une distance, ou une distance pour un temps.', 'Si tu es en petite forme, tu le dis au début : ta cible baisse de 10 %.'],
    deroul:['Échauffement progressif.', 'Vous êtes en binôme : l\'un court, l\'autre observe. Vous échangez les rôles à chaque série (ou à la moitié de la séance).', 'Avant de partir, repère ton plot de couleur sur le schéma ci-dessus : c\'est ta cible.', 'Ton observateur note chaque répétition : ✓ cible atteinte, ≈ presque, ✗ non atteinte.', 'Il observe aussi un point technique de ta course (pilier de la leçon).'],
    roles:['Coureur : atteindre sa cible à chaque répétition, ni trop tôt ni trop tard.', 'Observateur : regarder si ton camarade arrive à son plot au signal, noter ✓ / ≈ / ✗ et observer le pilier de la leçon.', 'Les deux rôles alternent : quand tu as couru, tu observes ton camarade.'],
    reussite:['J\'atteins ma cible à chaque répétition.', 'Ma dernière répétition est aussi bonne que la première.'],
    secu:['Je respecte les récupérations.', 'Je m\'arrête si j\'ai mal.'],
    prep:['Retrouve ta VMA et calcule la distance que tu dois courir en 30 s à 100 % de ta VMA (VMA ÷ 3,6 × 30).', 'Relis le pilier observé de la leçon : que va regarder ton observateur ?'] }),
  fl: e => ({
    but:'Développer ton endurance à haute intensité (80 à 90 % de ta VMA) sur des efforts longs.',
    savoir:['Séance : ' + (e ? dfFracSummary(e) : 'efforts longs et récupérations actives') + '.', 'L\'allure doit être tenue du début à la fin de chaque effort : c\'est un travail de régularité.'],
    deroul:['Échauffement progressif.', 'Vous êtes en binôme : l\'un court, l\'autre observe, puis vous échangez.', 'Avant de partir, repère ta cible sur le schéma ci-dessus (plot de couleur ou temps à réaliser).', 'Entre les efforts, tu trottines doucement (récupération active), sans t\'arrêter.', 'Ton observateur note ✓ / ≈ / ✗ et le pilier observé.'],
    roles:['Coureur : tenir son allure cible du début à la fin de l\'effort.', 'Observateur : vérifier l\'allure (cible atteinte ou non) et observer le pilier de la leçon.', 'Les deux rôles alternent : quand tu as couru, tu observes ton camarade.'],
    reussite:['Mon allure est régulière pendant tout l\'effort.', 'Je récupère en trottinant, sans m\'arrêter.'],
    secu:['Je bois pendant la séance.', 'Petite forme : cible baissée de 10 %, je le signale.'],
    prep:['Calcule ton allure à 85 % de ta VMA (VMA × 0,85).', 'Combien de temps pour 1 000 m à cette allure ?'] }),
  eval: e => ({
    but:'L\'évaluation de fin de cycle : ' + (dfFx(e).nb || 3) + ' courses de ' + (dfFx(e).d || 500) + ' m avec des cibles calculées d\'après ta VMA. Note sur 12.',
    savoir:['Chaque course rapporte jusqu\'à 3 pts selon ton % de VMA (110 % et plus = 3 · 105 % = 2,5 · 100 % = 2 · 95 % = 1,5 · 90 % = 1 · 85 % = 0,5).', 'Régularité sur 3 : on retire 0,5 pt par tranche de 4 s d\'écart entre deux courses.', 'Tu dois donc aller vite ET être régulier.'],
    deroul:['Échauffement complet.', 'Départ de la série au signal ; ton observateur arrête ton temps à l\'arrivée.', 'Récupération de ' + (dfFx(e).rec || 10) + ' minutes entre les courses.', 'Les observateurs notent aussi les piliers (technique de course).'],
    roles:['Coureur', 'Observateur (arrivée, piliers)', 'Starter'],
    reussite:['Mes courses ont moins de 4 s d\'écart.', 'J\'atteins ma cible.'],
    secu:['Récupération active entre les courses.', 'Je bois.'],
    prep:['Calcule ton temps sur ' + (dfFx(e).d || 500) + ' m à 100 % et à 105 % de ta VMA.', 'Décide de ta stratégie : quel temps vises-tu à chaque course ?'] }),
};
/* ---------- Schéma du fractionné : plots de couleur selon la VMA des élèves ---------- */
const DF_CONES = [{ n:'rouge', c:'#E3262B' }, { n:'bleu', c:'#1E5FD8' }, { n:'jaune', c:'#FFD400' }, { n:'vert', c:'#1FA24A' }, { n:'orange', c:'#FF7A00' }, { n:'blanc', c:'#FFFFFF' }];
function dfFracGroups(n, i){
  const L = sortedStudents().filter(s => dfPresent(n, s.id)).map(s => ({ id: s.id, v: dfVmaFor(n, s.id, i) })).filter(x => x.v > 0);
  if (!L.length) return { ex: true, G: [10, 12, 14, 16].map(v => ({ v, ids: [] })) };
  let w = 1; const key = v => Math.round(v / w) * w; while (new Set(L.map(x => key(x.v))).size > DF_CONES.length) w++;
  const M = {}; L.forEach(x => (M[key(x.v)] = M[key(x.v)] || []).push(x.id));
  return { ex: false, w, G: Object.keys(M).map(Number).sort((a, b) => a - b).map(v => ({ v, ids: M[v] })) };
}
function dfFracSchema(n, i, e){
  const P = dfPiste(), lap = dfLap(), R = dfReps(e), r0 = R[0], tps = e.mode !== 'dist', { ex, w, G } = dfFracGroups(n, i);
  const r5 = d => Math.round(d / 5) * 5, dfT = s => { s = Math.round(s); const m = Math.floor(s / 60), r = s % 60; return m ? `${m} min${r ? ' ' + String(r).padStart(2, '0') + ' s' : ''}` : `${r} s`; };   // temps en langage simple
  const rows = G.map((g, k) => ({ ...g, col: DF_CONES[k % DF_CONES.length], d: tps ? r5(dfDist(r0, g.v, e.pct)) : r0, t: tps ? r0 : dfTime(r0, g.v, e.pct) }));
  const where = d => { if (P.mode === 'couloir') { const q = d % (2 * P.L); return q <= P.L ? '' : ' (après le demi-tour)'; } return d >= lap ? ` (1 tour + ${fmtN(d - lap, 0)} m)` : ''; };
  /* schéma de la piste */
  const cone = (x, y, c) => `<path d="M${x - 11} ${y + 9} L${x} ${y - 13} L${x + 11} ${y + 9}z" fill="${c}" stroke="#0B346E" stroke-width="2.5"/>`;
  let svg;
  if (P.mode === 'couloir') {
    const x0 = 40, x1 = 480, px = d => { const q = d % (2 * P.L); return x0 + (x1 - x0) * (q <= P.L ? q : 2 * P.L - q) / P.L; };
    svg = `<svg viewBox="0 0 520 190" class="df-svg"><rect x="20" y="60" width="480" height="70" rx="12" fill="#D9774F"/><line x1="20" x2="500" y1="95" y2="95" stroke="#fff" stroke-width="3" stroke-dasharray="10 8"/>
      <line x1="${x0}" x2="${x0}" y1="52" y2="138" stroke="#0B346E" stroke-width="5"/><text x="${x0}" y="44" text-anchor="middle" font-size="14" font-weight="800" fill="#0B346E">Départ</text>
      <text x="${x1}" y="44" text-anchor="end" font-size="14" font-weight="800" fill="#0B346E">Demi-tour · ${P.L} m</text>
      ${tps ? rows.map((r, k) => cone(px(r.d), 95 + (k % 2 ? 22 : -22), r.col.c)).join('') : cone(px(r0), 95, '#FF7A00') + `<text x="${px(r0)}" y="160" text-anchor="middle" font-size="13" font-weight="900" fill="#0B346E">Arrivée · ${fmtN(r0, 0)} m${where(r0)}</text>`}<text x="260" y="175" text-anchor="middle" font-size="13" font-weight="700" fill="#0B346E">→ sens de course</text></svg>`;
  } else {
    const cx = 260, cy = 115, rx = 205, ry = 82, pt = (d, o = 0) => { const a = Math.PI / 2 - 2 * Math.PI * (d % lap) / lap; return [cx + (rx + o) * Math.cos(a), cy + (ry + o) * Math.sin(a)]; };
    svg = `<svg viewBox="0 0 520 252" class="df-svg"><ellipse cx="${cx}" cy="${cy}" rx="${rx + 20}" ry="${ry + 20}" fill="#D9774F"/><ellipse cx="${cx}" cy="${cy}" rx="${rx - 20}" ry="${ry - 20}" fill="#7CC37A"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="8 6"/>
      <line x1="${cx}" x2="${cx}" y1="${cy + ry - 24}" y2="${cy + ry + 24}" stroke="#0B346E" stroke-width="6"/><text x="${cx}" y="${cy + ry + 42}" text-anchor="middle" font-size="14" font-weight="900" fill="#0B346E">DÉPART</text>
      <text x="${cx}" y="${cy + 6}" text-anchor="middle" font-size="17" font-weight="900" fill="#0B346E">Piste de ${lap} m</text><text x="${cx}" y="${cy + 26}" text-anchor="middle" font-size="13" font-weight="700" fill="#0B346E">sens de course ↺</text>
      ${tps ? rows.map((r, k) => { const [x, y] = pt(r.d, k % 2 ? 8 : -8); return cone(x, y, r.col.c); }).join('') : (() => { const [x, y] = pt(r0); const [lx, ly] = pt(r0, -42); return cone(x, y, '#FF7A00') + `<text x="${lx}" y="${ly + 5}" text-anchor="middle" font-size="13" font-weight="900" fill="#0B346E">Arrivée · ${fmtN(r0, 0)} m</text>`; })()}</svg>`;
  }
  const rec = e.rec.type === 'active' ? `tu trottines doucement pendant ${e.rec.unite === 'dist' ? fmtN(e.rec.val, 0) + ' m' : dfT(e.rec.val)}` : `tu récupères ${e.rec.unite === 'dist' ? fmtN(e.rec.val, 0) + ' m' : dfT(e.rec.val)} sur place (debout, en marchant doucement)`;
  const nb = `${R.length} répétition${R.length > 1 ? 's' : ''}${e.series > 1 ? ` × ${e.series} séries (${dfT(e.recS)} de repos entre les séries)` : ''}`;
  const pyr = e.steps && e.steps.length ? `<p class="muted">Pyramide : ${R.map(v => tps ? dfT(v) : fmtN(v, 0) + ' m').join(' - ')}. Le schéma montre la 1<sup>re</sup> répétition ; le tableau donne ta cible pour chaque répétition.</p>` : '';
  const expl = tps
    ? [`Au signal, tu cours <b>${dfT(r0)}</b> : tu dois arriver à <b>ton plot de couleur</b> juste au signal suivant.`, `Ta couleur dépend de ta VMA : trouve ton prénom dans le tableau.`, `Puis ${rec}.`, `À la répétition suivante, tu repars de ton plot vers la ligne de départ (même distance, dans l'autre sens).`, `En tout : ${nb}.`]
    : [`Tu cours <b>${fmtN(r0, 0)} m</b> (jusqu'au plot d'arrivée) et tu dois arriver <b>en ton temps cible</b> : trouve ton prénom dans le tableau.`, `Arrivé trop tôt ? Tu es parti trop vite. Trop tard ? Accélère à la prochaine.`, `Puis ${rec}.`, `En tout : ${nb}.`];
  expl.push('En petite forme ? Préviens ton professeur : tu viseras la cible de la couleur juste en dessous de la tienne.');
  const stepCols = e.steps && e.steps.length ? R : null;
  return `<div class="df-fschema"><h3>🗺️ Ce que tu vas faire en arrivant · ${esc(e.forme || dfFracSummary(e))}</h3>${svg}
    <ul>${expl.map(x => `<li>${x}</li>`).join('')}</ul>${pyr}
    <div class="scroll-x"><table class="tbl"><thead><tr><th>${tps ? 'Ma cible' : 'Mon groupe'}</th><th>VMA</th>${stepCols ? stepCols.map((v, k) => `<th>Rép. ${k + 1}<br><small>${tps ? dfT(v) : fmtN(v, 0) + ' m'}</small></th>`).join('') : `<th>${tps ? `Distance en ${dfT(r0)}` : `Temps pour ${fmtN(r0, 0)} m`}</th>`}${ex ? '' : '<th>Élèves</th>'}</tr></thead><tbody>
      ${rows.map(r => `<tr><td><span class="df-cone" style="--cc:${r.col.c}"></span> ${tps ? `plot <b>${r.col.n}</b>` : `<b>${r.col.n}</b>`}</td><td>${ex || w === 1 ? fmtN(r.v, 0) : `${fmtN(r.v - w / 2, 1)} à ${fmtN(r.v + w / 2, 1)}`} km/h</td>
        ${stepCols ? stepCols.map(v => `<td><b>${tps ? fmtN(r5(dfDist(v, r.v, e.pct)), 0) + ' m' : dfT(dfTime(v, r.v, e.pct))}</b></td>`).join('') : `<td><b>${tps ? fmtN(r.d, 0) + ' m' + where(r.d) : dfT(r.t)}</b></td>`}${ex ? '' : `<td><small>${r.ids.map(id => esc(nameOf(id))).join(', ')}</small></td>`}</tr>`).join('')}</tbody></table></div>
    <p class="muted">${ex ? 'Exemples (les VMA de la classe ne sont pas encore connues).' : `Calculé avec ta VMA de référence, à ${e.pct} % de VMA.`} Distances arrondies à 5 m.</p></div>`;
}
function dfFiche(t, n, i){
  const e = n != null && i != null ? dfEx(n, i) : null, Fn = DF_FICHES[t], X = DFX[t]; if (!Fn) return;
  const F = Fn(e), li = a => `<ul>${a.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
  let extra = '', titre = X.n;
  if (t === 'aventuriers') titre = dfBoardName(e);
  if (DF_TEST(t)) titre = `${X.n} · ${DF_PROTO[dfProto(e)].n}`;
  if (t === 'aventuriers') extra += `<div class="df-map small">${dfAvSVG(e)}</div>`;
  if (DF_FRAC(t) && e) extra += dfFracSchema(n, i, e);
  if (t === 'pelotons') extra += `<p><b>Les jokers :</b></p>${li(dfJoks().map(j => `${j.l} · ${j.p === 'n' ? '1 pt par coureur doublé' : j.p + ' pts'}`))}`;
  modal(`<h2>📖 ${X.ico} ${esc(titre)}</h2><p class="muted">Fiche élève · à lire avant la leçon</p>${extra}
    <h3>🎯 Le but</h3><p>${esc(F.but)}</p><h3>💡 Ce qu'il faut savoir</h3>${li(F.savoir)}<h3>▶️ Comment ça se passe</h3><ol>${F.deroul.map(x => `<li>${esc(x)}</li>`).join('')}</ol>
    <h3>👥 Mes rôles</h3>${li(F.roles)}<h3>✅ Je réussis si…</h3>${li(F.reussite)}<h3>🛡️ Ma sécurité</h3>${li(F.secu)}<h3>📝 Pour préparer la leçon</h3>${li(F.prep)}
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
        if (DF_TEST(e.t)) { const v = e.t === 'bats' ? V[s.id] + G[s.id] : V[s.id]; o = dfProto(e) === 'vameval' ? { vv: Math.max(e.v0 || 8, Math.floor(v * 2) / 2), v0: e.v0 || 8 } : { pn: Math.max(8, Math.min(40, Math.round(v * 100 / dfPlotStep()))) }; }
        else if (e.t === 'equipe') { const n = Math.round(e.dur * 60 * vma * rnd_(0.65, 0.82) / 3.6 / lap); let t = 0; o = { laps: Array.from({ length: n }, () => r10(t += lap / (vma * rnd_(0.68, 0.86) / 3.6), 1)) }; if (e.pauses && k % 4 === 0) o.pz = [[r10(t / 2, 1), r10(t / 2 + 40, 1)]]; }
        else if (e.t === 'aventuriers') { const R = dfBoard(e).routes.map((_, q) => q).filter(q => (q + k) % 9 < 3).slice(0, 2 + (k % 3)); o = { buys: R.map((q, z) => ({ r: q, ts: now() - 2e6 + k * 3000 + z * 90000 })) }; }
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
.df-tk{display:flex;justify-content:space-between;padding:8px 10px;border:2px dashed var(--tc,var(--line));border-radius:10px;margin-bottom:6px;background:color-mix(in srgb,var(--tc,#fff) 10%,#fff)}.df-tk.ok{border:2px solid #1E8E3E;background:#E7F5DF}
.df-teamsel{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px}
.df-tsel{border:4px solid var(--tc);background:#fff;border-radius:14px;padding:10px 8px;display:flex;flex-direction:column;align-items:center;gap:2px;color:var(--ink);min-height:64px}
.df-tsel b{font-size:18px}.df-tsel small{font-size:12px;color:var(--grey);font-weight:700;text-align:center}
.df-tsel.on{background:var(--tc);color:#fff;box-shadow:0 0 0 4px rgba(0,0,0,.15)}.df-tsel.on b,.df-tsel.on small{color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.45)}
.df-fschema{border:3px solid var(--navy);border-radius:16px;padding:10px 14px;margin:10px 0;background:#F6FAFF}.df-fschema h3{margin-top:4px}
.df-cone{display:inline-block;width:0;height:0;border-left:9px solid transparent;border-right:9px solid transparent;border-bottom:18px solid var(--cc);filter:drop-shadow(0 0 1px #0B346E);vertical-align:-3px}
.df-vamnow{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;font-size:18px;border-color:var(--navy)}
.tile.df-stopped{background:#EAF2FB}
.df-timer b{font-size:clamp(34px,6vw,56px)}
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
