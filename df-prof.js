/* =====================================================================
   DEMI-FOND N'EPS — espace enseignant
   Programmation du cycle (piste, leçons, exercices, équipes, parcours, jokers),
   VMA, piliers évalués par l'enseignant, bilan des exercices, évaluation par blocs,
   état de forme à l'appel, fiches des exercices, classe de démonstration.
   ===================================================================== */
'use strict';

PTABS.lecons.n = 'Paramètres du cycle'; PTABS.lecons.ico = '⚙️';
PTABS.plan = { n:'Programmation des leçons', ico:'🗺️' };
PTABS.vma = { n:'VMA des élèves', ico:'⚡' };
PTABS.pilprof = { n:'Piliers (enseignant)', ico:'🎓' };
PTABS.bilanDF = { n:'Bilan des exercices', ico:'🏃' };
PTABS.evalDF = { n:'Évaluation', ico:'📝' };
PTABS.prog = { n:'Programme de la leçon', ico:'🏃' };
/* menu enseignant du socle 1.5 : Préparer le cycle · Ma leçon (outils dans l'ordre du déroulement) · Suivi et bilans */
PSECT.prep.tabs.splice(PSECT.prep.tabs.indexOf('lecons') + 1, 0, 'plan', 'vma');
PSECT.prep.sub = 'Élèves · groupes · programmation des leçons · VMA · réglages';
PSECT.jour.tabs.splice(PSECT.jour.tabs.indexOf('lecon') + 1, 0, 'prog');
PSECT.bilans.tabs.splice(0, 0, 'bilanDF', 'evalDF', 'pilprof');
const _dfViewProf = viewProf;
viewProf = () => { const f = { plan: dfProfPlan, prog: dfProfPlan, vma: dfProfVma, pilprof: dfProfPil, bilanDF: dfProfBilan, evalDF: dfProfEval }[UI.profTab];
  return f ? sectHeader(sectOf(UI.profTab)) + f() : _dfViewProf(); };
/* Ma leçon : Réglages → Programme de la leçon → Appel → … → Bilan (avec le bilan des exercices) */
const _dfProfLecon = profLecon;
profLecon = () => _dfProfLecon().replace(flowNext('appel', '✅ Suivant : faire l\'appel'), flowNext('prog', '🏃 Suivant : programme de la leçon'));
const _dfProfHub = profHub;
profHub = () => { const n = curLesson(), E = dfExs(n);
  const h = _dfProfHub(), b = `<button class="hub-btn" data-action="tab" data-tab="prog"><span class="ico">🏃</span><b>Programme de la leçon</b><small>${esc(dfLessonSummary(n))}</small></button>`, k = h.indexOf('</button>');
  return k < 0 ? h.replace('<div class="hub">', '<div class="hub">' + b) : h.slice(0, k + 9) + b + h.slice(k + 9); };
const _dfProfFin = profFin;
profFin = () => _dfProfFin().replace('<button class="btn small" data-action="tab" data-tab="recup">', `<button class="btn small" data-action="dfFinBil">🏃 Bilan des exercices</button><button class="btn small" data-action="tab" data-tab="recup">`);
Object.assign(ACT, { dfFinBil: () => { UI.bdL = curLesson(); go('prof', { profTab:'bilanDF' }); } });

/* ---------- Paramètres du cycle : le plan remplace le nombre d'essais ---------- */
profLecons = () => `<div class="card df-help"><b>⚙️ Paramètres du cycle</b> : à régler <b>en amont</b>, ils valent pour toutes les leçons (nombre de leçons, piste, fils suivis, forme des piliers, jokers). Ensuite, chaque leçon se prépare dans <button class="btn small" data-action="tab" data-tab="plan">🗺️ Programmation des leçons</button> : exercices, équipes, pilier observé, leçon en cours.</div>
    <div class="card"><div class="btn-row spread"><h3 style="margin:0">Nombre de leçons du cycle</h3>${stepper('nbLessons', S.settings.nbLessons)}</div></div>
    ${dfPisteCard()}` + frChoiceCard() + `${dfPilCfgCard()}${dfJokCard()}` + displayCard() + newCycleCard();
function dfPilCfgCard(){
  const L = { on:'Oui / non', ech:'Échelle 1 à 10', desc:'Descriptif moteur' };
  return `<div class="card"><h3>🎯 Piliers</h3><p class="muted">Forme de saisie de chaque pilier (observateurs et enseignant). Le ou les piliers observés se choisissent leçon par leçon dans la Programmation des leçons.</p>
    ${DF_PIL.map(p => { const m = dfPilMode(p); return `<div class="form-row df-pilcfg"><div><b>${esc(p.n)}</b><br><small class="muted">${esc(m === 'on' ? p.crit.join(' · ') : m === 'desc' ? p.desc.map(d => d.l).join(' · ') : 'de 1 (pas du tout) à 10 (parfaitement)')}</small></div>
      <div class="choices">${Object.entries(L).map(([k, l]) => `<button class="ch ${m === k ? 'on' : ''}" data-action="dfPilMode" data-p="${p.id}" data-m="${k}" ${m === k ? 'style="background:var(--navy);border-color:var(--navy);color:#fff"' : ''}>${l}</button>`).join('')}</div></div>`; }).join('')}</div>`;
}

/* ---------- Appel : état de forme ---------- */
const _dfProfAppel = profAppel;
profAppel = () => { const n = curLesson();
  return _dfProfAppel() + `<div class="card"><h3>😓 État de forme <small class="muted">(fractionnés : % de VMA baissé de 10 points)</small></h3>
    <p class="muted">Touchez les élèves qui se déclarent en petite forme aujourd'hui. Envoyé aux tablettes avec le QR de la leçon.</p>
    <div class="lchips">${sortedStudents().filter(s => dfPresent(n, s.id)).map(s => `<button class="chip ${dfForme(n, s.id) ? 'on' : ''}" data-action="dfFormeP" data-sid="${s.id}">${dfForme(n, s.id) ? '😓 ' : ''}${esc(nameOf(s.id))}</button>`).join('')}</div></div>`; };

/* =====================================================================
   PROGRAMMATION DU CYCLE
   ===================================================================== */
const DF_SCHEMA = {
  aventuriers:[ { k:'plat', l:'Plateau de jeu', opts:Object.entries(DF_PLATEAUX).map(([k, P]) => [k, P.n]) }, { k:'seg', l:'Distance d\'un tronçon', seg:true },
    { k:'dur', l:'Durée du jeu', u:'min', min:10, max:60, st:5 },
    { k:'taille', l:'Équipes', opts:[[2, 'Binômes'], [3, 'Trinômes']] }, { k:'nbParc', l:'Parcours par équipe', u:'', min:1, max:5, st:1 },
    { k:'coefTri', l:'Coefficient des trinômes (s\'il reste des binômes)', u:'', min:0.5, max:1, st:0.05 }, { k:'tabs', l:'Tablettes pour la saisie', u:'', min:1, max:8, st:1 },
    { k:'form', l:'Constitution des équipes', opts:[['libre', 'Libre (à la main)'], ['alea', 'Aléatoire'], ['proche', 'VMA proches'], ['equi', 'VMA équilibrées']] },
    { k:'attr', l:'Attribution des parcours', opts:[['alea', 'Aléatoire'], ['vma', 'Selon la VMA de l\'équipe']] } ],
  equipe:[ { k:'dur', l:'Durée', u:'min', min:4, max:40, st:1 }, { k:'nbEq', l:'Nombre d\'équipes', u:'', min:2, max:8, st:1 }, { k:'tabs', l:'Tablettes pour compter les tours', u:'', min:1, max:3, st:1 },
    { k:'form', l:'Constitution des équipes', opts:[['equi', 'Niveau : équipes équilibrées'], ['besoin', 'Groupes de besoin (piliers)'], ['proche', 'VMA proches'], ['alea', 'Aléatoire'], ['libre', 'À la main']] },
    { k:'pauses', l:'Noter les entrées / sorties de pause', bool:true } ],
  pelotons:[ { k:'d', l:'Distance d\'une course', u:'m', min:200, max:1500, st:50 }, { k:'nb', l:'Courses par élève', u:'', min:1, max:6, st:1 }, { k:'ns', l:'Nombre de séries', u:'', min:1, max:8, st:1 }, { k:'rec', l:'Récupération entre courses', u:'min', min:1, max:15, st:1 } ],
  chrono:[ { k:'d', l:'Distance', u:'m', min:50, max:10000, st:50, edit:true }, { k:'nb', l:'Courses par élève', u:'', min:1, max:4, st:1 },
    { k:'dep', l:'Départ', def:'commun', opts:[['commun', '🏁 Départ commun'], ['af', '🏁 All finishers (arrivée tous ensemble)']] },
    { k:'pct', l:'Allure visée (All finishers : temps visé de chaque coureur)', u:'% VMA', def:90, min:60, max:120, st:5, when: e => e.dep === 'af' } ],
  eval:[ { k:'d', l:'Distance', u:'m', min:300, max:800, st:50 }, { k:'nb', l:'Courses', u:'', min:2, max:4, st:1 }, { k:'rec', l:'Récupération', u:'min', min:3, max:15, st:1 } ],
};
const dfStepper = (act, attrs, disp) => `<div class="stepper"><button class="cbtn" data-action="${act}" ${attrs} data-d="-1">−</button><b class="df-sv">${disp}</b><button class="cbtn" data-action="${act}" ${attrs} data-d="1">+</button></div>`;
function dfSchemaRows(n, i, e){
  return (DF_SCHEMA[e.t] || []).filter(f => !f.when || f.when(e)).map(f => { const a = `data-n="${n}" data-i="${i}" data-k="${f.k}"`;
    if (f.bool) return `<div class="form-row"><span>${esc(f.l)}</span><button class="btn small ${e[f.k] ? 'green' : ''}" data-action="dfPB" ${a}>${e[f.k] ? '✓ Oui' : 'Non'}</button></div>`;
    if (f.seg) return `<div class="form-row"><span>${esc(f.l)}<br><small class="muted">1 tronçon du plateau = cette distance (${dfSegTours(e)} tour(s) de ${dfLap()} m)</small></span><div class="row">${dfStepper('dfSeg', a, dfSegM(e) + ' m')}<button class="btn small" data-action="dfSegSet" ${a}>✎</button></div></div>`;
    const val = e[f.k] ?? f.def;
    if (f.opts) return `<div class="form-row"><span>${esc(f.l)}</span><div class="choices">${f.opts.map(([v, l]) => `<button class="ch ${val === v ? 'on' : ''}" data-action="dfPO" ${a} data-v="${v}" ${val === v ? 'style="background:var(--navy);border-color:var(--navy);color:#fff"' : ''}>${esc(l)}</button>`).join('')}</div></div>`;
    return `<div class="form-row"><span>${esc(f.l)}</span><div class="row">${dfStepper('dfPS', a, `${fmtN(val, 2)} ${f.u}`)}${f.edit ? `<button class="btn small" data-action="dfPSet" ${a}>✎</button>` : ''}</div></div>`; }).join('');
}
function dfFracEditor(n, i, e){
  const a = k => `data-n="${n}" data-i="${i}" data-k="${k}"`, ch = (k, v, l, cur) => `<button class="ch ${cur === v ? 'on' : ''}" data-action="dfFO" ${a(k)} data-v="${v}" ${cur === v ? 'style="background:var(--navy);border-color:var(--navy);color:#fff"' : ''}>${l}</button>`;
  const ex = [12, 14, 16].map(v => `VMA ${v} : ${dfRepTarget(e, 0, v, false).txt}`).join(' · ');
  return `<div class="form-row"><span>Formes proposées</span><div class="choices">${DF_FORMES[e.t].map((f, k) => `<button class="ch ${e.forme === f.n ? 'on' : ''}" data-action="dfForm" data-n="${n}" data-i="${i}" data-f="${k}" ${e.forme === f.n ? 'style="background:var(--orange);border-color:var(--orange);color:#fff"' : ''}>${esc(f.n)}</button>`).join('')}</div></div>
    <div class="form-row"><span>Je fixe</span><div class="choices">${ch('mode', 'dist', '📏 la distance → temps calculé', e.mode)}${ch('mode', 'temps', '⏱ le temps → distance calculée', e.mode)}</div></div>
    ${e.steps && e.steps.length ? `<div class="form-row"><span>Pyramide (${e.mode === 'dist' ? 'm' : 's'})</span><button class="btn small" data-action="dfSteps" data-n="${n}" data-i="${i}">${e.steps.join(' - ')} ✎</button></div>`
      : `<div class="form-row"><span>${e.mode === 'dist' ? 'Distance de course' : 'Temps de course'}</span>${dfStepper('dfFS', a('val'), e.mode === 'dist' ? fmtN(e.val, 0) + ' m' : dfT(e.val))}</div>
         <div class="form-row"><span>Répétitions par série</span>${dfStepper('dfFS', a('reps'), e.reps)}</div><div class="form-row"><span>Pyramide (valeurs différentes)</span><button class="btn small" data-action="dfSteps" data-n="${n}" data-i="${i}">Créer ✎</button></div>`}
    <div class="form-row"><span>Intensité</span>${dfStepper('dfFS', a('pct'), e.pct + ' % VMA')}</div>
    <div class="form-row"><span>Récupération</span><div class="choices">${ch('rec.type', 'active', 'Active', e.rec.type)}${ch('rec.type', 'passive', 'Passive', e.rec.type)}${ch('rec.unite', 'temps', 'en temps', e.rec.unite)}${ch('rec.unite', 'dist', 'en distance', e.rec.unite)}</div>
      ${dfStepper('dfFS', a('rec.val'), e.rec.unite === 'dist' ? fmtN(e.rec.val, 0) + ' m' : dfT(e.rec.val))}</div>
    <div class="form-row"><span>Séries</span>${dfStepper('dfFS', a('series'), e.series)}</div>
    ${e.series > 1 ? `<div class="form-row"><span>Récupération entre séries</span>${dfStepper('dfFS', a('recS'), dfT(e.recS))}</div>` : ''}
    ${dfObs(e) ? `<div class="form-row"><span>Piliers notés par l'observateur</span><div class="choices">${ch('pil', 'serie', 'à la fin de chaque série', e.pil)}${ch('pil', 'fin', 'une fois, en fin d\'exercice', e.pil)}${ch('pil', 'rep', 'à chaque répétition', e.pil)}</div></div>` : ''}
    <p class="muted">Exemple de cibles : ${esc(ex)}. Un élève en petite forme (appel) court à ${e.pct - 10} %.</p>`;
}
function dfComposer(n, i, e){
  const teams = e.eq && Object.keys(e.eq).length ? e.eq : null, nb = dfNbTeams(n, e), sel = UI.dfCsel;
  const cur = teams || dfTeams(n, i, e), present = sortedStudents().filter(s => dfPresent(n, s.id) && dfConc(e, s.id)), nbShown = Math.max(nb, ...Object.values(cur).map(t => t + 1));
  const modes = e.t === 'pelotons' ? [['proche', '⚡ VMA proches'], ['alea', '🎲 Aléatoire']] : [['equi', '⚖️ VMA équilibrées'], ['proche', '⚡ VMA proches'], ['besoin', '🎯 Besoins (piliers)'], ['alea', '🎲 Aléatoire']];
  const col = t => `<div class="df-col" style="--tc:${dfTeamCol(t).c}"><button class="df-colh" data-action="dfCmv" data-n="${n}" data-i="${i}" data-t="${t}">${esc(dfTeamName(e, t))}${sel ? ' ⬅' : ''}</button>
    ${present.filter(s => cur[s.id] === t).map(s => `<button class="chip ${sel === s.id ? 'on' : ''}" data-action="dfCsel" data-sid="${s.id}">${esc(nameOf(s.id))} <small>${fmtN(dfVmaFor(n, s.id, i), 1)}</small></button>`).join('')}
    <small class="muted">VMA moy. ${fmtN(avg(vals(present.filter(s => cur[s.id] === t).map(s => dfVmaFor(n, s.id, i)))), 1)}</small></div>`;
  const out = present.filter(s => cur[s.id] == null);
  return `<div class="df-comp"><div class="btn-row"><b>Proposer :</b>${modes.map(([m, l]) => `<button class="btn small" data-action="dfCprop" data-n="${n}" data-i="${i}" data-m="${m}">${l}</button>`).join('')}
      <button class="btn small ghost" data-action="dfCclear" data-n="${n}" data-i="${i}">↺ Repli automatique</button></div>
    <p class="muted">${teams ? '✓ Composition enregistrée.' : 'Pas encore enregistrée : proposition automatique (VMA) affichée.'} Touchez un élève puis l'équipe où le placer. ${['equipe', 'aventuriers'].includes(e.t) ? `Tablette d'une équipe = numéro de l'équipe modulo ${e.tabs || 1}.` : ''}</p>
    ${out.length ? `<div class="df-col" style="--tc:#9AA3B5"><b>Non placés</b>${out.map(s => `<button class="chip ${sel === s.id ? 'on' : ''}" data-action="dfCsel" data-sid="${s.id}">${esc(nameOf(s.id))}</button>`).join('')}</div>` : ''}
    <div class="df-cols">${Array.from({ length: nbShown + (sel ? 1 : 0) }, (_, t) => col(t)).join('')}</div>
    ${e.t === 'aventuriers' ? dfParcEditor(n, i, e) : ''}</div>`;
}
function dfParcEditor(n, i, e){
  const P = dfParc(n, i, e), teams = dfTeams(n, i, e), nb = Math.max(0, ...Object.values(teams).map(t => t + 1));
  return `<div class="card"><div class="btn-row spread"><h3 style="margin:0">🎫 Parcours (${e.nbParc} par équipe)</h3><div class="btn-row">
      <button class="btn small" data-action="dfParcA" data-n="${n}" data-i="${i}" data-m="alea">🎲 Aléatoire</button><button class="btn small" data-action="dfParcA" data-n="${n}" data-i="${i}" data-m="vma">⚡ Selon la VMA</button></div></div>
    <p class="muted">${e.parc && Object.keys(e.parc).length ? '✓ Parcours attribués.' : 'Non attribués : tirage automatique identique sur toutes les tablettes.'} Valeur d'un parcours = nombre de tronçons du plus court chemin.</p>
    ${Array.from({ length: nb }, (_, t) => `<div class="df-tkrow"><span class="dot" style="background:${dfTeamCol(t).c}"></span><b>${esc(dfTeamName(e, t))}</b> ${(P[t] || []).map(id => dfBoard(e).tickets[id]).filter(Boolean).map(tk => `<span class="pill">${esc(tk.a)} → ${esc(tk.b)} · ${tk.pts}</span>`).join(' ')}</div>`).join('')}</div>`;
}
function dfPisteCard(){
  const P = dfPiste();
  return `<div class="card"><h3>🏟️ Ma piste</h3><div class="df-pistes">
      <button class="df-pc ${P.mode === 'circ' ? 'on' : ''}" data-action="dfPM" data-m="circ">${dfPisteSVG('circ', P.mode === 'circ' ? P.L : 250, { plots: [] })}<b>Piste circulaire</b><small>1 tour = la longueur de la piste</small></button>
      <button class="df-pc ${P.mode === 'couloir' ? 'on' : ''}" data-action="dfPM" data-m="couloir">${dfPisteSVG('couloir', P.mode === 'couloir' ? P.L : 100, { plots: [] })}<b>Piste couloir (aller-retour)</b><small>1 tour = un aller + un retour</small></button></div>
    <div class="form-row"><span>${P.mode === 'couloir' ? 'Longueur du couloir (aller)' : 'Longueur de la piste'}</span><div class="row">${dfStepper('dfPLen', '', P.L + ' m')}<button class="btn small" data-action="dfPLset">✎</button></div></div>
    <p class="muted">1 tour = <b>${dfLap()} m</b> · tour impossible en moins de ${dfT(dfLapMin())} (26 km/h) · demi-Cooper : ${dfPlots().length} plots tous les ${fmtN(dfPlotStep(), 0)} m.</p></div>`;
}
function dfJokCard(){
  return `<details class="card"><summary><b>🃏 Jokers de la course en pelotons</b> <span class="muted">(${dfJoks().length} actifs)</span></summary>
    ${dfJokAll().map((j, k) => `<div class="form-row"><span><b>${esc(j.l)}</b> · ${j.p === 'n' ? '1 pt par coureur doublé' : j.p + ' pts'}</span><div class="btn-row">
      ${j.p !== 'n' ? dfStepper('dfJokP', `data-k="${k}"`, j.p + ' pts') : ''}<button class="btn small" data-action="dfJokL" data-k="${k}">✎</button>
      <button class="btn small ${j.on !== false ? 'green' : ''}" data-action="dfJokOn" data-k="${k}">${j.on !== false ? '✓ Proposé' : 'Masqué'}</button><button class="btn small ghost" data-action="dfJokDel" data-k="${k}">🗑</button></div></div>`).join('')}
    <div class="btn-row"><button class="btn small primary" data-action="dfJokAdd">＋ Nouveau thème</button><button class="btn small ghost" data-action="dfJokReset">↺ Jokers par défaut</button></div></details>`;
}
function dfProfPlan(){ return dfProfPlan0() + (UI.profTab === 'prog' ? flowNext('appel', '✅ Suivant : faire l\'appel') : ''); }
function dfProfPlan0(){
  const J = UI.profTab === 'prog', n = !J && UI.planL && UI.planL <= S.settings.nbLessons ? UI.planL : curLesson(), C = dfCyc(n), E = C.ex || [];
  return `${J ? `<p class="muted">Exercices de la leçon ${n} et leurs réglages. Le programme de tout le cycle : ${PSECT.prep.ico} ${esc(PSECT.prep.t)} → 🗺️ Programmation des leçons.</p>` : `<div class="card df-help"><b>🗺️ Programmation des leçons</b> : uniquement ce qui est propre à chaque leçon (exercices et réglages, équipes, parcours, pilier observé, leçon en cours). Ce qui cadre tout le cycle (piste, fils, forme des piliers, jokers) se règle avant dans <button class="btn small" data-action="tab" data-tab="lecons">⚙️ Paramètres du cycle</button></div>
    <div class="card"><div class="btn-row spread"><div class="lchips"><b>Leçon</b>${Array.from({ length: S.settings.nbLessons }, (_, k) => k + 1).map(l => `<button class="chip ${l === n ? 'on' : ''}" data-action="dfPL" data-n="${l}">${l === curLesson() ? '▶ ' : ''}${l} ${dfExs(l).map(e => DFX[e.t].ico).join('')}</button>`).join('')}</div>
      <div class="btn-row"><button class="btn small" data-action="dfCycPrint">🖨 Fiche du cycle</button></div></div>
      <p class="muted">▶ = leçon en cours (celle envoyée par le QR). Chaque leçon contient 1 à 4 exercices. <b>Renvoyez le QR de la leçon</b> après une modification.</p></div>`}
    <div class="card strong"><div class="btn-row spread"><h3 style="margin:0">Leçon ${n} · ${esc(lesson(n).title || C.title || '—')}</h3>
      <div class="btn-row"><button class="btn small" data-action="dfLTitle" data-n="${n}">✎ Titre</button>${S.params && S.params.cyc && S.params.cyc[n] ? `<button class="btn small ghost" data-action="dfLReset" data-n="${n}">↺ Leçon par défaut</button>` : ''}</div></div>
      <div class="form-row"><span>Leçon en cours (envoyée par le QR)</span>${n === curLesson() ? '<b>✓ Oui</b>' : `<button class="btn small" data-action="setLesson" data-n="${n}">▶ En faire la leçon en cours</button>`}</div>
      <div class="form-row"><span>Leçon d'évaluation</span><button class="btn small ${lesson(n).ev ? 'green' : ''}" data-action="dfLEv" data-n="${n}">${lesson(n).ev ? '✓ Oui' : 'Non'}</button></div>
      <div class="form-row"><span>🎯 Pilier(s) observé(s) pendant la leçon<br><small class="muted">les observateurs ne notent que ceux-là</small></span><div class="choices">${DF_PIL.map(p => { const on_ = dfLessonPil(n).includes(p.id);
        return `<button class="ch ${on_ ? 'on' : ''}" data-action="dfLPil" data-n="${n}" data-p="${p.id}" ${on_ ? 'style="background:var(--orange);border-color:var(--orange);color:#fff"' : ''}>${esc(p.n)}</button>`; }).join('')}<button class="ch ${dfLessonPil(n).length ? '' : 'on'}" data-action="dfLPil" data-n="${n}" data-p="" ${dfLessonPil(n).length ? '' : 'style="background:var(--navy);border-color:var(--navy);color:#fff"'}>Aucun pilier</button></div></div>
      ${dfLessonPil(n).length ? '' : '<p class="muted">Aucun pilier dans cette leçon : pas d\'observation, et la leçon ne compte ni pour le fil bleu ni pour la partie « observateur » du fil rouge.</p>'}</div>
    ${E.map((e, i) => `<div class="card df-excard" style="--xc:${DFX[e.t].c}"><div class="btn-row spread"><h3 style="margin:0">${DFX[e.t].ico} ${i + 1}. ${esc(DFX[e.t].n)}</h3>
        <div class="btn-row"><button class="btn small" data-action="dfFiche" data-t="${e.t}" data-n="${n}" data-i="${i}">📖 Fiche</button><button class="btn small ghost" data-action="dfXmv" data-n="${n}" data-i="${i}" data-d="-1" ${i ? '' : 'disabled'}>↑</button>
        <button class="btn small ghost" data-action="dfXmv" data-n="${n}" data-i="${i}" data-d="1" ${i < E.length - 1 ? '' : 'disabled'}>↓</button><button class="btn small ghost" data-action="dfXdel" data-n="${n}" data-i="${i}">🗑</button></div></div>
      <p class="muted">${esc(dfExSummary(e))}</p>
      ${DF_FRAC(e.t) ? dfFracEditor(n, i, e) : DF_TEST(e.t) ? dfTestEditor(n, i, e) : dfSchemaRows(n, i, e)}
      ${dfObsRow(n, i, e)}
      ${dfWhoRow(n, i, e)}
      ${['equipe', 'aventuriers', 'pelotons'].includes(e.t) ? `<details class="df-compd" ${UI.dfComp === n + '-' + i ? 'open' : ''}><summary data-action="dfComp" data-k="${n}-${i}"><b>🧩 ${e.t === 'pelotons' ? 'Séries' : 'Équipes'}${e.t === 'aventuriers' ? ' et parcours' : ''}</b></summary>${UI.dfComp === n + '-' + i ? dfComposer(n, i, e) : ''}</details>` : ''}
      ${DF_GRPT(e.t) ? `<div class="form-row"><span>🧩 Groupes pour cet exercice<br><small class="muted">${dfNbG(e) < 2 ? 'toute la classe ensemble' : DF_FRAC(e.t) ? 'passages : Série 1 · groupe 1, Série 1 · groupe 2…' : 'un groupe court, l\'autre observe…'}</small></span>${dfStepper('dfNbG', `data-n="${n}" data-i="${i}"`, dfNbG(e) < 2 ? 'aucun' : dfNbG(e) + ' groupes')}</div>
        ${dfNbG(e) > 1 ? `<details class="df-compd" ${UI.dfComp === n + '-' + i ? 'open' : ''}><summary data-action="dfComp" data-k="${n}-${i}"><b>🧩 Composer les ${dfNbG(e)} groupes</b> <small class="muted">${e.eq && Object.keys(e.eq).length ? '✓ composition enregistrée' : 'proposition automatique'}</small></summary>${UI.dfComp === n + '-' + i ? dfComposer(n, i, e) : ''}</details>` : ''}` : ''}</div>`).join('')}
    ${E.length < 4 ? `<div class="card"><b>＋ Ajouter un exercice</b><div class="df-exgrid">${Object.entries(DFX).map(([t, X]) => `<button class="df-exbtn" style="--xc:${X.c}" data-action="dfXadd" data-n="${n}" data-t="${t}"><span class="ico">${X.ico}</span><b>${esc(X.n)}</b></button>`).join('')}</div></div>` : '<p class="muted">4 exercices au maximum par leçon.</p>'}`;
}
/* observer les piliers dans cet exercice : oui / non */
function dfObsRow(n, i, e){
  const o = dfObs(e), a = `data-n="${n}" data-i="${i}"`, B = (v, l, on) => `<button class="ch ${on ? 'on' : ''}" data-action="dfObsT" ${a} data-v="${v}" ${on ? 'style="background:var(--navy);border-color:var(--navy);color:#fff"' : ''}>${l}</button>`;
  return `<div class="form-row"><span>👀 Observer les piliers dans cet exercice<br><small class="muted">${!o ? 'pas d\'observation : l\'exercice ne compte pas pour la partie « observateur » du fil rouge' : dfLessonPil(n).length ? 'piliers de la leçon : ' + esc(dfPilNames(dfLessonPil(n))) : '⚠️ aucun pilier choisi pour cette leçon (plus haut)'}</small></span><div class="choices">${B(1, '👀 Oui', o)}${B(0, 'Non', !o)}</div></div>`;
}
/* élèves concernés par l'exercice : toute la classe ou une sélection (rattrapage d'un test…) */
function dfWhoRow(n, i, e){
  const w = dfWho(e), a = `data-n="${n}" data-i="${i}"`, B = (v, l, on) => `<button class="ch ${on ? 'on' : ''}" data-action="dfWho" ${a} data-v="${v}" ${on ? 'style="background:var(--navy);border-color:var(--navy);color:#fff"' : ''}>${l}</button>`;
  return `<div class="form-row"><span>👥 Élèves concernés</span><div class="choices">${B('all', 'Toute la classe', !w)}${B('some', 'Seulement quelques élèves', !!w)}</div></div>
    ${w ? `<div class="df-who"><div class="lchips">${sortedStudents().map(s => `<button class="chip ${w.includes(s.id) ? 'on' : ''}" data-action="dfWhoT" ${a} data-sid="${s.id}">${w.includes(s.id) ? '✓ ' : ''}${esc(nameOf(s.id))}</button>`).join('')}</div>
      <div class="btn-row"><button class="btn small" data-action="dfWhoQ" ${a} data-q="novma">＋ Élèves sans VMA</button>${n > 1 ? `<button class="btn small" data-action="dfWhoQ" ${a} data-q="abs">＋ Absents en leçon ${n - 1}</button>` : ''}<button class="btn small ghost" data-action="dfWhoQ" ${a} data-q="none">Tout désélectionner</button></div>
      <p class="muted">${w.length} élève(s) sélectionné(s). Les autres ne voient pas cet exercice sur les tablettes, et il ne compte pas pour eux. Les saisies se récupèrent comme d'habitude (📥).</p></div>` : ''}`;
}
/* test VMA : protocole au choix (demi-Cooper ou VAMEVAL) */
function dfTestEditor(n, i, e){
  const pr = dfProto(e), a = `data-n="${n}" data-i="${i}"`;
  return `${e.t === 'bats' ? '<p>🔥 Retest : évaluation intermédiaire notée /6 sur le progrès de VMA ; la nouvelle VMA sert aux cibles des fractionnés et de l\'évaluation.</p>' : ''}
    <div class="form-row"><span>Protocole du test</span><div class="choices">${Object.entries(DF_PROTO).map(([k, P]) => `<button class="ch ${pr === k ? 'on' : ''}" data-action="dfPO" ${a} data-k="proto" data-v="${k}" ${pr === k ? 'style="background:var(--navy);border-color:var(--navy);color:#fff"' : ''}>${P.ico} ${esc(P.n)}</button>`).join('')}</div></div>
    <p class="muted">${esc(DF_PROTO[pr].d)}</p>
    ${pr === 'vameval' ? `<div class="form-row"><span>Vitesse du premier palier</span>${dfStepper('dfV0', a, fmtN(e.v0 || 8, 1) + ' km/h')}</div>
      <p class="muted">Plots tous les <b>${fmtN(dfVamStep(), 1)} m</b> (${dfPiste().mode === 'couloir' ? 'sur le couloir' : 'autour de la piste'}). La tablette émet un bip à chaque plot et un double bip à chaque changement de palier.</p>` : ''}
    <button class="btn small" data-action="dfPlotsGuide" data-i="${i}" data-n="${n}">📍 Placement des plots</button>`;
}
/* fiche du cycle imprimable */
function dfCycPrint(){
  modal(`<h2>🗺️ ${esc(CFG.name)} · ${esc(className())}</h2><p class="muted">${dfPiste().mode === 'couloir' ? 'Couloir de ' + dfPiste().L + ' m en aller-retour' : 'Piste de ' + dfPiste().L + ' m'} · 1 tour = ${dfLap()} m</p>
    <table class="tbl"><thead><tr><th>Leçon</th><th>Exercices</th><th>🎯 Pilier(s)</th></tr></thead><tbody>${Array.from({ length: S.settings.nbLessons }, (_, k) => k + 1).map(l => `<tr><td><b>L${l}</b><br><small>${esc(lesson(l).title || '')}</small></td>
      <td>${dfExs(l).map(e => `${DFX[e.t].ico} <b>${esc(DFX[e.t].n)}</b> · ${esc(dfExSummary(e))}`).join('<br>')}</td><td>${esc(dfPilNames(dfLessonPil(l)))}</td></tr>`).join('')}</tbody></table>
    <div class="btn-row spread no-print" style="margin-top:12px"><button class="btn" data-print>🖨 Imprimer</button><button class="btn primary" data-close>Fermer</button></div>`, { wide: true });
  dfModalBind();
}

/* =====================================================================
   VMA DES ÉLÈVES
   ===================================================================== */
function dfTestsList(){ const a = []; for (let l = 1; l <= S.settings.nbLessons; l++) dfExs(l).forEach((e, i) => { if (DF_TEST(e.t)) a.push({ l, i, e }); }); return a; }
function dfProfVma(){
  const n = curLesson(), T = dfTestsList();
  return `<div class="card"><h3>⚡ VMA des élèves</h3><p class="muted">VMA = distance du demi-Cooper ÷ 100. La VMA de référence d'une leçon est celle du dernier test (demi-Cooper ou Bats tes perfs) qui la précède.
    « VMA fixée » remplace les tests pour cet élève (absent au test, test non représentatif) : laissez vide sinon.</p></div>
    <div class="card scroll-x"><table class="tbl"><thead><tr><th>Élève</th>${T.map(x => `<th>L${x.l}<br><small>${esc(DFX[x.e.t].n)}</small></th>`).join('')}<th>Progrès</th><th>VMA fixée<br><small>km/h</small></th><th>Référence L${n}</th></tr></thead><tbody>
    ${sortedStudents().map(s => { const v = T.map(x => dfTestVma(x.l, s.id, x.i)), ok = vals(v), g = ok.length > 1 ? ok[ok.length - 1] - ok[0] : null, ref = dfVmaRef(n, s.id, null), man = S.params?.vmaMan?.[s.id];
      return `<tr><td class="nm">${band(s.id)}${esc(nameOf(s.id))}</td>${T.map((x, k) => { const a = attOf(x.l, s.id); return `<td>${v[k] == null ? (a ? `<small>${ATT[a].n}</small>` : '—') : `<b>${fmtN(v[k], 1)}</b><br><small>${fmtN(v[k] * 100, 0)} m</small>`}</td>`; }).join('')}
        <td>${g == null ? '—' : `<b class="${g >= 0 ? 'up' : 'down'}">${g >= 0 ? '+' : '−'}${fmtN(Math.abs(g), 1)}</b>`}</td>
        <td><input type="text" inputmode="decimal" placeholder="ex. 12,5" class="df-vma-in" data-sid="${s.id}" value="${man == null ? '' : String(man).replace('.', ',')}" style="width:90px"></td>
        <td>${ref ? `<b>${fmtN(ref.v, 1)}</b><br><small>${esc(ref.src)}</small>` : '—'}</td></tr>`; }).join('')}</tbody></table></div>`;
}

/* =====================================================================
   PILIERS ÉVALUÉS PAR L'ENSEIGNANT (mode administrateur)
   ===================================================================== */
const dfPP = (n, sid) => S.ppil?.[n]?.[sid] || null;
function dfProfPil(){
  const n = UI.pilL || curLesson();
  return `<div class="card"><div class="lchips"><b>Leçon</b>${Array.from({ length: S.settings.nbLessons }, (_, k) => k + 1).map(l => `<button class="chip ${l === n ? 'on' : ''}" data-action="dfPilL" data-n="${l}">${l}${Object.keys(S.ppil?.[l] || {}).length ? ' ✓' : ''}</button>`).join('')}</div>
      <p class="muted">Évaluez quand vous le décidez : touchez un élève. Votre évaluation compte pour 2/3 du fil bleu et sert de référence à la qualité des observations des élèves.</p>
      ${dfLessonPil(n).length ? '' : '<p class="warn-card card">⚠️ Aucun pilier n\'est prévu dans la leçon ' + n + ' : ce que vous noteriez ici ne compte pas dans l\'évaluation. Choisissez une leçon avec pilier, ou ajoutez-en un dans la Programmation.</p>'}</div>
    ${groupChips(UI.pilG ?? null, 'dfPilG')}<div class="tiles">${sortedStudents().filter(s => UI.pilG == null || (s.grp || 0) === UI.pilG).map(s => { const m = dfPilMean(dfPP(n, s.id));
      return `<button class="tile ${m != null ? 'done' : ''}" data-action="dfPPopen" data-sid="${s.id}">${band(s.id)}<span class="name">${esc(nameOf(s.id))}</span><span class="meta">${m != null ? Math.round(m * 100) + ' %' : '—'}</span></button>`; }).join('')}</div>`;
}
function dfPPmodal(sid){
  const n = UI.pilL || curLesson(), o = dfPP(n, sid) || {};
  const obs = []; dfExs(n).forEach((e, i) => Object.values((dfX(n, sid, i) || {}).pil || {}).forEach(p => { const m = dfPilMean(p); if (m != null) obs.push(`${esc(DFX[e.t].ico)} ${Math.round(m * 100)} %${p.by ? ' par ' + esc(nameOf(p.by)) : ''}`); }));
  const m = modal(`<h2>🎓 ${esc(nameOf(sid))} · leçon ${n}</h2>${obs.length ? `<p class="muted">Observateurs : ${obs.join(' · ')}</p>` : ''}<p class="muted">🎯 Pilier(s) de la leçon ${n} : <b>${esc(dfPilNames(dfLessonPil(n)))}</b>${UI.ppAll ? '' : ' · <button class="btn small ghost" data-allp>Afficher tous les piliers</button>'}</p>${dfPilForm(o, 'dfPPset', `data-sid="${sid}"`, UI.ppAll ? null : dfLessonPil(n))}
    <div class="btn-row spread" style="margin-top:12px"><span class="muted">${dfPilMean(o) != null ? 'Score : ' + Math.round(dfPilMean(o) * 100) + ' %' : ''}</span><div class="btn-row">${dfNextPil(sid)}<button class="btn primary" data-x>Fermer</button></div></div>`, { wide: true });
  m.querySelector('[data-x]').onclick = () => { closeModal(); rerender(); };
  const nx = m.querySelector('[data-nx]'); if (nx) nx.onclick = () => dfPPmodal(nx.dataset.nx);
  const al = m.querySelector('[data-allp]'); if (al) al.onclick = () => { UI.ppAll = true; dfPPmodal(sid); };
}
function dfNextPil(sid){ const L = sortedStudents().filter(s => UI.pilG == null || (s.grp || 0) === UI.pilG), k = L.findIndex(s => s.id === sid), nx = L[k + 1]; return nx ? `<button class="btn" data-nx="${nx.id}">${esc(nameOf(nx.id))} ▶</button>` : ''; }

/* =====================================================================
   BILAN DES EXERCICES (par leçon)
   ===================================================================== */
function dfProfBilan(){
  const n = UI.bdL || curLesson(), E = dfExs(n), L = sortedStudents();
  const tot = sid => { const v = vals(E.map((_, i) => dfExDist(n, sid, i))); return v.length ? v.reduce((a, b) => a + b, 0) : null; };
  let h = `<div class="card"><div class="lchips"><b>Leçon</b>${Array.from({ length: S.settings.nbLessons }, (_, k) => k + 1).map(l => `<button class="chip ${l === n ? 'on' : ''}" data-action="dfBdL" data-n="${l}">${l}</button>`).join('')}</div>
    <b>${esc(lessonLabel(n))}</b> <span class="muted">· ${esc(dfLessonSummary(n))}</span></div>
    <div class="card scroll-x"><h3>📏 Distance courue dans la leçon</h3><table class="tbl"><thead><tr><th>Élève</th>${E.map(e => `<th>${DFX[e.t].ico} ${esc(DFX[e.t].n)}</th>`).join('')}<th>Total</th><th>Abandons</th></tr></thead><tbody>
    ${L.map(s => { const a = attOf(n, s.id); if (isOff(a)) return `<tr><td class="nm">${band(s.id)}${esc(nameOf(s.id))}</td><td colspan="${E.length + 2}" class="muted">${ATT[a].n}</td></tr>`;
      return `<tr><td class="nm"><button class="lnk" data-action="stuDetail" data-sid="${s.id}">${band(s.id)}${esc(nameOf(s.id))}</button></td>${E.map((_, i) => { const x = dfX(n, s.id, i); return `<td>${x && x.ab ? '🚩 ' : ''}${dfKm(dfExDist(n, s.id, i))}</td>`; }).join('')}<td><b>${dfKm(tot(s.id))}</b></td><td>${E.filter((_, i) => (dfX(n, s.id, i) || {}).ab).length || ''}</td></tr>`; }).join('')}</tbody></table></div>`;
  E.forEach((e, i) => { h += `<div class="card scroll-x df-excard" style="--xc:${DFX[e.t].c}"><h3>${DFX[e.t].ico} ${i + 1}. ${esc(DFX[e.t].n)} <small class="muted">${esc(dfExSummary(e))}</small></h3>${(DF_BILAN[e.t] || (() => ''))(n, i, e)}</div>`; });
  return h;
}
const dfRowsP = (n, i, f) => sortedStudents().filter(s => dfPresent(n, s.id) && dfConc(dfEx(n, i), s.id)).map(f).join('');
const DF_BILAN = {
  cooper: (n, i, e) => `<table class="tbl"><thead><tr><th>Élève</th><th>${dfProto(e) === 'vameval' ? 'Dernier palier' : 'Plot d\'arrêt'}</th><th>Distance</th><th>VMA</th>${e.t === 'bats' ? '<th>Avant</th><th>Progrès</th><th>Note /6</th>' : ''}</tr></thead><tbody>${dfRowsP(n, i, s => { const x = dfX(n, s.id, i) || {}, g = e.t === 'bats' ? dfBatsGain(n, s.id, i) : null, r = e.t === 'bats' ? dfVmaRef(n, s.id, i) : null;
    return `<tr><td class="nm">${band(s.id)}${esc(nameOf(s.id))}</td><td>${x.ab ? '🚩' : x.vv != null ? fmtN(x.vv, 1) + ' km/h' : dfTestPn(x) ?? '—'}</td><td>${dfKm(dfTestDist(x))}</td><td><b>${fmtN(dfTestVma(n, s.id, i), 1)}</b></td>
      ${e.t === 'bats' ? `<td>${r ? fmtN(r.v, 1) : '—'}</td><td>${g == null ? '—' : (g >= 0 ? '+' : '−') + fmtN(Math.abs(g), 1)}</td><td><b>${dfBatsNote(g) ?? '—'}</b></td>` : ''}</tr>`; })}</tbody></table>`,
  equipe: (n, i, e) => { const teams = dfTeams(n, i, e);
    return Array.from({ length: e.nbEq }, (_, t) => { const M = sortedStudents().filter(s => teams[s.id] === t && dfPresent(n, s.id)), tl = M.reduce((a, s) => a + ((dfX(n, s.id, i) || {}).laps || []).length, 0);
      return `<h4><span class="dot" style="background:${dfTeamCol(t).c}"></span> ${esc(dfTeamName(e, t))} · ${tl} tours · ${dfKm(tl * dfLap())}</h4><table class="tbl"><thead><tr><th>Élève</th><th>Tours</th><th>Distance</th><th>Part de l'équipe</th><th>Régularité</th><th>Pauses</th></tr></thead><tbody>
      ${M.map(s => { const x = dfX(n, s.id, i) || {}, L = (x.laps || []).length, r = dfRegul(x); return `<tr><td class="nm">${band(s.id)}${esc(nameOf(s.id))}</td><td>${x.ab ? '🚩 ' : ''}${L}</td><td>${dfKm(L * dfLap())}</td><td>${tl ? Math.round(L / tl * 100) + ' %' : '—'}</td><td>${r == null ? '—' : r + ' %'}</td><td>${(x.pz || []).length || ''}</td></tr>`; }).join('')}</tbody></table>`; }).join(''); },
  aventuriers: (n, i, e) => { const A = dfAvScores(n, i, e);
    return dfAvTable(n, i, e) + `<h4>Distance par coureur (comparée à son ${e.taille === 3 ? 'trinôme' : 'binôme'})</h4><table class="tbl"><thead><tr><th>Équipe</th><th>Coureur</th><th>Trajets</th><th>Tronçons</th><th>Distance</th><th>Part de l'équipe</th></tr></thead><tbody>
      ${A.map(a => a.members.map((s, k) => { const B = (dfX(n, s.id, i) || {}).buys || [], tr = dfAvSegs(e, B);
        return `<tr>${k ? '' : `<td rowspan="${a.members.length}"><span class="dot" style="background:${dfTeamCol(a.t).c}"></span> ${esc(dfTeamCol(a.t).n)}</td>`}<td class="nm">${band(s.id)}${esc(nameOf(s.id))}</td><td>${B.length}</td><td>${tr}</td><td>${dfKm(tr * dfSegM(e))}</td><td>${a.laps ? Math.round(tr / a.laps * 100) + ' %' : '—'}</td></tr>`; }).join('')).join('')}</tbody></table>`; },
  pelotons: (n, i, e) => `<table class="tbl"><thead><tr><th>Élève</th><th>Série</th>${Array.from({ length: e.nb }, (_, k) => `<th>C${k + 1}</th>`).join('')}<th>Note /10</th></tr></thead><tbody>${dfRowsP(n, i, s => { const N = dfPelNote(n, s.id, i, e), x = dfX(n, s.id, i) || {}, t = dfTeamOf(n, i, e, s.id);
    return `<tr><td class="nm">${band(s.id)}${esc(nameOf(s.id))}</td><td>${t != null ? `<span class="dot" style="background:${dfTeamCol(t).c}"></span>` : ''}</td>${Array.from({ length: e.nb }, (_, k) => { const c = (x.c || [])[k] || {}, sc = dfPelCourse(n, s.id, i, e, k), J = dfJok(c.j);
      return `<td>${c.t ? `<b>${dfT(c.t)}</b> · ${fmtN(sc.pct, 0)} %<br><small>${fmtN(sc.perf, 1)}/5${J ? ` + 🃏 ${c.ok ? sc.jp : '✗'}` : ''} = ${fmtN(sc.tot, 1)}</small>` : '—'}</td>`; }).join('')}<td><b>${N.note == null ? '—' : fmtN(N.note, 1)}</b></td></tr>`; })}</tbody></table>`,
  fc: (n, i, e) => `<table class="tbl"><thead><tr><th>Élève</th><th>VMA · %</th><th>Répétitions</th><th>Cibles atteintes</th><th>Piliers (obs.)</th><th>Distance</th></tr></thead><tbody>${dfRowsP(n, i, s => { const x = dfX(n, s.id, i) || {}, a = dfFracCells(x), r = dfVmaRef(n, s.id, i), pm = vals(Object.values(x.pil || {}).map(dfPilMean));
    return `<tr><td class="nm">${band(s.id)}${esc(nameOf(s.id))}</td><td>${r ? fmtN(r.v, 1) : '—'} · ${e.pct - (dfForme(n, s.id) ? 10 : 0)} %${dfForme(n, s.id) ? ' 😓' : ''}</td><td>${x.ab ? '🚩 ' : ''}${a.length}/${dfRepCount(e)}</td>
      <td>${a.length ? `<b>${Math.round(avg(a.map(v => v / 2)) * 100)} %</b> <small>${a.map(v => DF_CELL[v].s).join('')}</small>` : '—'}</td><td>${pm.length ? Math.round(avg(pm) * 100) + ' %' : '—'}</td><td>${dfKm(dfExDist(n, s.id, i))}</td></tr>`; })}</tbody></table>`,
  eval: (n, i, e) => `<table class="tbl"><thead><tr><th>Élève</th><th>VMA</th>${Array.from({ length: e.nb }, (_, k) => `<th>C${k + 1}</th>`).join('')}<th>Régularité /3</th><th>Note /12</th></tr></thead><tbody>${dfRowsP(n, i, s => { const Sc = dfEvScore(n, s.id, i, e) || { t: [], pts: [] }, r = dfVmaRef(n, s.id, i);
    return `<tr><td class="nm">${band(s.id)}${esc(nameOf(s.id))}</td><td>${r ? fmtN(r.v, 1) : '—'}</td>${Array.from({ length: e.nb }, (_, k) => `<td>${Sc.t[k] ? `${dfT(Sc.t[k])}<br><small>${fmtN(dfPctOf(e.d, Sc.t[k], r && r.v), 0)} % · ${fmtN(Sc.pts[k], 1)}/3</small>` : '—'}</td>`).join('')}<td>${fmtN(Sc.reg, 1)}</td><td><b>${Sc.total == null ? '—' : fmtN(Sc.total, 2)}</b></td></tr>`; })}</tbody></table>`,
};
DF_BILAN.chrono = (n, i, e) => `<table class="tbl"><thead><tr><th>Élève</th><th>VMA</th>${Array.from({ length: e.nb || 1 }, (_, k) => `<th>${(e.nb || 1) > 1 ? 'Course ' + (k + 1) : fmtN(e.d, 0) + ' m'}</th>`).join('')}</tr></thead><tbody>${dfRowsP(n, i, s => { const x = dfX(n, s.id, i) || {}, r = dfVmaRef(n, s.id, i);
    return `<tr><td class="nm">${band(s.id)}${esc(nameOf(s.id))}</td><td>${r ? fmtN(r.v, 1) : '—'}</td>${Array.from({ length: e.nb || 1 }, (_, k) => { const t = ((x.c || [])[k] || {}).t; return `<td>${x.ab ? '🚩 ' : ''}${t ? `<b>${dfMSs(t)}</b><br><small>${fmtN(e.d / t * 3.6, 1)} km/h${r ? ' · ' + fmtN(dfPctOf(e.d, t, r.v), 0) + ' % VMA' : ''}</small>` : '—'}</td>`; }).join('')}</tr>`; })}</tbody></table>`;
DF_BILAN.bats = DF_BILAN.cooper; DF_BILAN.fl = DF_BILAN.fc;

/* =====================================================================
   ÉVALUATION : blocs séparés
   ===================================================================== */
const dfInterp = (x, t) => x == null ? null : Math.round(interp(t, x) * 4) / 4;
function dfAllEx(upTo){ const a = []; for (let l = 1; l <= (upTo || S.settings.nbLessons); l++) dfExs(l).forEach((e, i) => a.push({ l, i, e })); return a; }
const dfLessonHeld = l => Object.keys(S.results[l] || {}).length > 0;
/* ---------- Briques des fils (valeurs de 0 à 1, null si rien à évaluer) ---------- */
const dfFracLike = e => dfObs(e);                                                // exercices où l'on observe un camarade (choix par exercice)
/* coureur : exercices faits sans abandon (régularité) et cibles des fractionnés (qualité) */
function dfInvRunner(sid, X){
  const slots = X.filter(x => dfLessonHeld(x.l) && dfPresent(x.l, sid) && dfConc(x.e, sid)), ok = slots.filter(x => { const o = dfX(x.l, sid, x.i); return o && !o.ab; });
  const cells = []; X.filter(x => DF_FRAC(x.e.t)).forEach(x => dfFracCells(dfX(x.l, sid, x.i)).forEach(v => cells.push(v / 2)));
  const reg = slots.length ? Math.max(0, Math.min(1, (ok.length / slots.length - 0.5) / 0.5)) : null, qual = cells.length ? Math.max(0, Math.min(1, (avg(cells) - 0.4) / 0.5)) : null;
  return { reg, qual, regTxt: slots.length ? `${ok.length}/${slots.length} exercices sans abandon` : '', qualTxt: cells.length ? `${Math.round(avg(cells) * 100)} % des cibles` : '' };
}
/* observateur : observations faites (quantité) et accord avec l'enseignant (qualité) */
function dfInvObserver(sid, X){
  const exp = X.filter(x => dfFracLike(x.e) && dfLessonPil(x.l).length && dfLessonHeld(x.l) && dfPresent(x.l, sid) && dfConc(x.e, sid));
  const did = exp.filter(x => S.students.some(r => Object.values((dfX(x.l, r.id, x.i) || {}).pil || {}).some(p => p.by === sid)));
  const agr = []; X.filter(x => dfLessonPil(x.l).length).forEach(x => { S.students.forEach(r => { const P = dfPP(x.l, r.id); if (!P) return;
    Object.values((dfX(x.l, r.id, x.i) || {}).pil || {}).forEach(o => { if (o.by !== sid) return;
      const d = vals(DF_PIL.map(p => { const a = dfPilScore(p, o[p.id]), b = dfPilScore(p, P[p.id]); return a == null || b == null ? null : 1 - Math.abs(a - b); })); if (d.length) agr.push(avg(d)); }); }); });
  const q = exp.length ? did.length / exp.length : null;
  return { quant: q, qual: agr.length ? Math.max(0, Math.min(1, (avg(agr) - 0.6) / 0.3)) : null,
    quantTxt: exp.length ? `${did.length}/${exp.length} observations faites` : '', qualTxt: agr.length ? `accord ${Math.round(avg(agr) * 100)} % avec l'enseignant` : '' };
}
const dfMean = a => { const v = vals(a); return v.length ? avg(v) : null; };
const dfQ = v => v == null ? null : Math.round(v * 4) / 4;                      // au quart de point
/* 🔴 Fil rouge · Investissement /6 = coureur /3 + observateur /3 */
function dfFilRouge(sid, X){
  const R = dfInvRunner(sid, X), O = dfInvObserver(sid, X), c = dfMean([R.reg, R.qual]), o = dfMean([O.quant, O.qual]);
  const cour = c == null ? null : dfQ(c * 3), obs = o == null ? null : dfQ(o * 3);
  const tot = cour == null && obs == null ? null : cour != null && obs != null ? cour + obs : dfQ((cour ?? obs) * 2);
  return { v: tot, cour, obs, short: `coureur ${cour == null ? '—' : fmtN(cour, 2)}/3 · observateur ${obs == null ? '—' : fmtN(obs, 2)}/3`, txt: `coureur ${cour == null ? '—' : fmtN(cour, 2)}/3 (${[R.regTxt, R.qualTxt].filter(Boolean).join(', ') || '—'}) · observateur ${obs == null ? '—' : fmtN(obs, 2)}/3 (${[O.quantTxt, O.qualTxt].filter(Boolean).join(', ') || '—'})` };
}
/* 🔵 Fil bleu · Piliers /6 : piliers notés par l'enseignant (2/3) et par les observateurs (1/3) */
function dfFilBleu(sid, X){
  const ps = []; X.filter(x => dfLessonPil(x.l).length).forEach(x => Object.values((dfX(x.l, sid, x.i) || {}).pil || {}).forEach(o => { const m = dfPilMean(o); if (m != null) ps.push(m); }));
  const last = {}; for (let l = 1; l <= S.settings.nbLessons; l++) { const P = dfPP(l, sid); if (P && dfLessonPil(l).length) DF_PIL.forEach(p => { if (P[p.id] != null) last[p.id] = P[p.id]; }); }
  const pp = vals(DF_PIL.map(p => dfPilScore(p, last[p.id]))), el = ps.length ? avg(ps) : null, pr = pp.length ? avg(pp) : null;
  const v = el == null && pr == null ? null : el != null && pr != null ? dfQ(pr * 4 + el * 2) : dfQ((pr ?? el) * 6);
  return { v, txt: `enseignant ${pr == null ? '—' : Math.round(pr * 100) + ' %'}${pp.length ? ` (${pp.length}/${DF_PIL.length} piliers)` : ''} · observateurs ${el == null ? '—' : Math.round(el * 100) + ' %'}` };
}
function dfEvalBlocks(sid){
  const X = dfAllEx(), B = {};
  /* AFL1 : 3 × 500 m /12 (meilleure évaluation) */
  const ev = vals(X.filter(x => x.e.t === 'eval').map(x => (dfEvScore(x.l, sid, x.i, x.e) || {}).total)); B.afl1 = ev.length ? Math.max(...ev) : null;
  /* Bats tes perfs /6 (dernier) */
  const bt = X.filter(x => x.e.t === 'bats').map(x => dfBatsNote(dfBatsGain(x.l, sid, x.i))).filter(v => v != null); B.bats = bt.length ? bt[bt.length - 1] : null;
  const FR = dfFilRouge(sid, X), FB = dfFilBleu(sid, X);
  /* note proposée par l'appli, ajustée par le niveau final choisi par l'enseignant (onglet des fils) */
  [['frInv', 'FR', FR], ['frPil', 'FM', FB]].forEach(([k, id, F]) => { const fr = CFG.filsRouges.find(x => x.id === id), C = fr ? frFinal(fr, sid) : null, a = dfFilAdj(F.v, C);
    B[k] = a; B[k + 'Prop'] = F.v; B[k + 'Lv'] = C;
    B[k + 'Txt'] = (id === 'FR' ? FR.short : FB.txt) + (C ? ` · niveau retenu : ${COMP_LV[C].n}${a !== F.v ? ` (proposé ${F.v == null ? '—' : fmtN(F.v, 2)})` : ''}` : ' · niveau final à choisir');
    B[k + 'Det'] = (id === 'FR' ? FR.txt : FB.txt) + (C ? ` · niveau retenu : ${COMP_LV[C].n}` : ''); });
  B.frCour = FR.cour; B.frObs = FR.obs;
  return B;
}
/* niveaux des fils ↔ note /6 : Insuffisante 0–1,5 · Fragile 1,5–3 · Satisfaisante 3–4,5 · Très bonne 4,5–6 */
const DF_LVB = [null, [0, 1.5], [1.5, 3], [3, 4.5], [4.5, 6]];
const dfLvOf6 = v => v == null ? null : v < 1.5 ? 1 : v < 3 ? 2 : v < 4.5 ? 3 : 4;
function dfFilAdj(v, C){ if (!C) return v; const [lo, hi] = DF_LVB[C]; if (v == null) return dfQ((lo + hi) / 2); return v < lo ? lo : v > hi ? hi : v; }
/* la proposition de l'appli (pelote, niveau proposé) vient de la note /6 */
const dfFilProp = (fr, sid) => { const X = dfAllEx(); return fr.id === 'FR' ? dfFilRouge(sid, X).v : fr.id === 'FM' ? dfFilBleu(sid, X).v : undefined; };
const _dfFrMoy = frMoy;
frMoy = (fr, sid) => { const v = dfFilProp(fr, sid); if (v === undefined) return _dfFrMoy(fr, sid); return v == null ? null : Math.min(4.49, 0.5 + v / 1.5); };
const _dfFrDetail = frDetailView;
frDetailView = sid => _dfFrDetail(sid).replace(/ \(moyenne [^)]*\)/g, '')
  + `<div class="card"><h3>Notes /6</h3>${FRS.map(fr => { const v = dfFilProp(fr, sid); if (v === undefined) return ''; const C = frFinal(fr, sid), a = dfFilAdj(v, C);
    return `<p>${yarnIcon(fr, 18)} <b>${esc(fr.nom)}</b> : proposée <b>${v == null ? '—' : fmtN(v, 2)}/6</b>${v != null ? ` (${COMP_LV[dfLvOf6(v)].n})` : ''}${C ? ` → niveau retenu <b>${COMP_LV[C].n}</b> → note <b>${fmtN(a, 2)}/6</b>` : ' · choisissez le niveau final ci-dessus pour valider ou ajuster'}</p>`; }).join('')}
    <p class="muted">Le niveau final est votre décision : la note reste celle proposée si elle est dans le niveau choisi, sinon elle est ramenée dans ce niveau (Insuffisante 0–1,5 · Fragile 1,5–3 · Satisfaisante 3–4,5 · Très bonne 4,5–6).</p></div>`;
const DF_BLOCKS = [['afl1', 'AFL1 · 3 × 500 m', 12], ['bats', 'Bats tes perfs', 6], ['frInv', '🔴 Fil rouge · Investissement', 6], ['frPil', '🔵 Fil bleu · Piliers', 6]];
function dfProfEval(){
  return `<div class="card"><h3>📝 Évaluation par blocs</h3><p class="muted">Chaque bloc est affiché séparément (pas de total). Survolez ou touchez une case pour le détail. <b>Fil rouge /6</b> = investissement comme coureur /3 (exercices sans abandon, cibles des fractionnés) + comme observateur /3 (observations faites, accord avec l'enseignant). <b>Fil bleu /6</b> = piliers techniques : notes de l'enseignant (2/3, 🎓 Piliers) et des observateurs (1/3).</p>
      <div class="btn-row"><button class="btn primary" data-action="dfEvalXls">📊 Export Excel</button><button class="btn" data-action="dfEvalFiche">📖 Fiche élève : comment je suis évalué</button></div></div>
    <div class="card scroll-x"><table class="tbl"><thead><tr><th>Élève</th>${DF_BLOCKS.map(([, l, m]) => `<th>${esc(l)}<br><small>/${m}</small></th>`).join('')}</tr></thead><tbody>
    ${sortedStudents().map(s => { const B = dfEvalBlocks(s.id); return `<tr><td class="nm">${band(s.id)}${esc(nameOf(s.id))}</td>${DF_BLOCKS.map(([k]) => `<td title="${esc(B[k + 'Det'] || B[k + 'Txt'] || '')}"><b>${B[k] == null ? '—' : fmtN(B[k], 2)}</b>${B[k + 'Txt'] ? `<br><small>${esc(B[k + 'Txt'])}</small>` : ''}</td>`).join('')}</tr>`; }).join('')}</tbody></table></div>`;
}
function dfEvalXls(){
  if (!window.XLSX) return toast('Bibliothèque Excel non chargée');
  const rows = [['Nom', 'Prénom', ...DF_BLOCKS.flatMap(([, l, m]) => [`${l} /${m}`, `${l} (détail)`])], ...sortedStudents().map(s => { const B = dfEvalBlocks(s.id); return [s.nom || s.disp || '', s.prenom || '', ...DF_BLOCKS.flatMap(([k]) => [B[k] == null ? '' : B[k], B[k + 'Det'] || B[k + 'Txt'] || ''])]; })];
  const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Évaluation');
  const dist = [['Nom', 'Prénom', ...Array.from({ length: S.settings.nbLessons }, (_, k) => 'L' + (k + 1) + ' (m)')], ...sortedStudents().map(s => [s.nom || s.disp || '', s.prenom || '', ...Array.from({ length: S.settings.nbLessons }, (_, k) => { const v = lessonVal(k + 1, s.id, fieldById('dist')); return v == null ? '' : Math.round(v); })])];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(dist), 'Distances');
  XLSX.writeFile(wb, `${CFG.short} - évaluation - ${className()}.xlsx`.replace(/[\\/:*?"<>|]/g, '-'));
}

/* fils par leçon (nœuds de la pelote, niveaux 1 à 4) */
const dfLv = v => v == null ? null : v >= 0.85 ? 4 : v >= 0.6 ? 3 : v >= 0.35 ? 2 : 1;
window.DF_frInvest = function(n, sid){
  const E0 = dfExs(n), I = E0.map((e, i) => i).filter(i => dfConc(E0[i], sid)); if (!I.length) return null; const xs = I.map(i => dfX(n, sid, i)); if (!xs.some(Boolean)) return null;
  const done = I.filter(i => dfExDone(n, sid, i)).length, ab = xs.filter(x => x && x.ab).length;
  if (n === curLesson() && done + ab < I.length) return { lv: null, why: `en cours : ${done}/${I.length} exercices` };
  const X = I.map(i => ({ l: n, i, e: E0[i] })), R = dfInvRunner(sid, X), O = dfInvObserver(sid, X);
  const c = dfMean([R.reg, R.qual]), o = dfMean([O.quant, O.qual]), m = dfMean([c, o]);
  return { lv: dfLv(m), why: `coureur : ${[R.regTxt, R.qualTxt].filter(Boolean).join(', ') || '—'}${O.quantTxt ? ` · observateur : ${[O.quantTxt, O.qualTxt].filter(Boolean).join(', ')}` : ''}` };
};
window.DF_frPil = function(n, sid){
  if (!dfLessonPil(n).length) return null;
  const ps = []; dfExs(n).forEach((e, i) => Object.values((dfX(n, sid, i) || {}).pil || {}).forEach(o => { const m = dfPilMean(o); if (m != null) ps.push(m); }));
  const P = dfPP(n, sid), pp = P ? vals(DF_PIL.map(p => dfPilScore(p, P[p.id]))) : [], el = ps.length ? avg(ps) : null, pr = pp.length ? avg(pp) : null;
  if (el == null && pr == null) return null;
  const m = el != null && pr != null ? (pr * 2 + el) / 3 : (pr ?? el);
  return { lv: dfLv(m), why: `piliers ${Math.round(m * 100)} %${pr != null ? ' · enseignant ' + Math.round(pr * 100) + ' %' : ''}${el != null ? ' · observateurs ' + Math.round(el * 100) + ' %' : ''}` };
};

/* =====================================================================
   ACTIONS (enseignant)
   ===================================================================== */
const dfSaveP = (msg = '✓ Enregistré · renvoyez le QR de la leçon') => { save(); rerender(); toast(msg); };
const dfSetPath = (o, k, v) => { const p = k.split('.'); let t = o; while (p.length > 1) t = t[p.shift()]; t[p[0]] = v; };
const dfGetPath = (o, k) => k.split('.').reduce((t, x) => t == null ? t : t[x], o);
Object.assign(ACT, {
  dfFormeP: d => { const n = curLesson(); S.params = S.params || {}; S.params.fo = dfClone(S.params.fo || {}); const a = S.params.fo[n] = S.params.fo[n] || [], cur = dfForme(n, d.sid), k = a.indexOf(d.sid);
    if (cur) { if (k >= 0) a.splice(k, 1); } else if (k < 0) a.push(d.sid);
    const r = res(n, d.sid); if (r && r.v.fo != null) setRes(n, d.sid, R => { delete R.v.fo; }); save(); rerender(); },
  dfPL: d => { UI.planL = +d.n; UI.dfComp = null; rerender(); },
  dfLEv: d => { const L = lesson(+d.n); L.ev = !L.ev; dfSaveP(); },
  dfLPil: d => { const C = dfEditL(+d.n), a = [...dfLessonPil(+d.n)], k = a.indexOf(d.p);
    if (!d.p) a.length = 0; else if (k >= 0) a.splice(k, 1); else a.push(d.p);
    C.pil = DF_PIL.map(p => p.id).filter(id => a.includes(id)); dfSaveP(); },
  dfPM: d => { S.params = S.params || {}; if (S.params.pm !== d.m) { S.params.pm = d.m; S.params.pL = d.m === 'couloir' ? 100 : 250; } dfSaveP(); },
  dfPLen: d => { S.params = S.params || {}; S.params.pL = Math.max(20, Math.min(1000, dfPiste().L + +d.d * (dfPiste().mode === 'couloir' ? 5 : 10))); dfSaveP(); },
  dfPLset: async () => { const v = await numberBox(dfPiste().mode === 'couloir' ? 'Longueur du couloir (m)' : 'Longueur de la piste (m)', dfPiste().L, { step: 1, min: 20, max: 1000, unit: 'm' }); if (v == null) return; S.params.pL = Math.round(v); dfSaveP(); },
  dfLTitle: async d => { const n = +d.n, t = await textBox('Titre de la leçon ' + n, lesson(n).title); if (t == null) return; lesson(n).title = t; dfEditL(n).title = t; dfSaveP(); },
  dfLReset: async d => { const n = +d.n; if (!(await confirmBox('Revenir à la leçon par défaut ?', `Leçon ${n} : ${esc(dfDefLesson(n).ex.map(e => DFX[e.t].n).join(' + '))}`, 'Revenir'))) return;
    S.params.cyc = dfClone(S.params.cyc || {}); delete S.params.cyc[n]; delete DF_DEFC[n]; lesson(n).title = dfDefLesson(n).title; dfSaveP(); },
  dfXadd: d => { const n = +d.n, C = dfEditL(n); if ((C.ex || []).length >= 4) return; (C.ex = C.ex || []).push(dfxDefault(d.t)); if (d.t === 'eval') lesson(n).ev = true; dfSaveP(); },
  dfXdel: async d => { const n = +d.n, i = +d.i; if (!(await confirmBox('Retirer cet exercice ?', 'Les saisies déjà faites pour les exercices suivants changent de place.', 'Retirer', true))) return; dfEditL(n).ex.splice(i, 1); dfSaveP(); },
  dfXmv: d => { const n = +d.n, i = +d.i, j = i + +d.d, E = dfEditL(n).ex; if (j < 0 || j >= E.length) return; [E[i], E[j]] = [E[j], E[i]]; dfSaveP(); },
  dfPSet: async d => { const n = +d.n, i = +d.i, e = dfEditL(n).ex[i], f = DF_SCHEMA[e.t].find(x => x.k === d.k); const v = await numberBox(f.l + (f.u ? ` (${f.u})` : ''), e[d.k], { step: f.st < 1 ? f.st : 1, min: f.min, max: f.max, unit: f.u }); if (v == null) return; e[d.k] = Math.max(f.min, Math.min(f.max, v)); dfSaveP(); },
  dfNbG: d => { const n = +d.n, i = +d.i, e = dfEditL(n).ex[i]; e.nbG = Math.max(1, Math.min(6, dfNbG(e) + +d.d)); delete e.eq; dfSaveP(); },
  dfWho: d => { const n = +d.n, i = +d.i, e = dfEditL(n).ex[i]; if (d.v === 'all') delete e.who; else if (!dfWho(e)) e.who = []; delete e.eq; dfSaveP(); },
  dfWhoT: d => { const n = +d.n, i = +d.i, e = dfEditL(n).ex[i], w = [...(dfWho(e) || [])], k = w.indexOf(d.sid); if (k >= 0) w.splice(k, 1); else w.push(d.sid); e.who = w; delete e.eq; dfSaveP(); },
  dfWhoQ: d => { const n = +d.n, i = +d.i, e = dfEditL(n).ex[i], w = new Set(dfWho(e) || []);
    if (d.q === 'none') w.clear();
    if (d.q === 'novma') sortedStudents().forEach(s => { if (!dfVmaRef(n, s.id, i)) w.add(s.id); });
    if (d.q === 'abs') sortedStudents().forEach(s => { if (isOff(attOf(n - 1, s.id))) w.add(s.id); });
    e.who = sortedStudents().map(s => s.id).filter(id => w.has(id)); delete e.eq; dfSaveP(); },
  dfPS: d => { const n = +d.n, i = +d.i, e = dfEditL(n).ex[i], f = DF_SCHEMA[e.t].find(x => x.k === d.k); e[d.k] = r10(Math.max(f.min, Math.min(f.max, (+(e[d.k] ?? f.def) || 0) + +d.d * f.st)), 2); dfSaveP(); },
  dfPO: async d => { const n = +d.n, i = +d.i, e = dfEditL(n).ex[i], v = isFinite(+d.v) && d.v !== '' ? +d.v : d.v; if (e[d.k] === v) return;
    if (d.k === 'plat') { const used = sortedStudents().some(s => ((dfX(n, s.id, i) || {}).buys || []).length);
      if (used && !(await confirmBox('Changer de plateau ?', 'Des trajets ont déjà été saisis sur l\'ancien plateau : ils ne correspondront plus à la carte.', 'Changer'))) return;
      delete e.parc; }
    e[d.k] = v;
    dfSaveP(); },
  dfObsT: d => { const e = dfEditL(+d.n).ex[+d.i]; e.obs = d.v === '1'; dfSaveP(); },
  dfSeg: d => { const n = +d.n, i = +d.i, e = dfEditL(n).ex[i]; e.seg = Math.max(25, Math.min(3000, dfSegM(e) + +d.d * 25)); dfSaveP(); },
  dfSegSet: async d => { const n = +d.n, i = +d.i, e = dfEditL(n).ex[i]; const v = await numberBox('Distance d\'un tronçon (m)', dfSegM(e), { step: 1, min: 25, max: 3000, unit: 'm' }); if (v == null) return; e.seg = Math.round(v); dfSaveP(); },
  dfV0: d => { const n = +d.n, i = +d.i, e = dfEditL(n).ex[i]; e.v0 = Math.max(6, Math.min(12, (e.v0 || 8) + +d.d * 0.5)); dfSaveP(); },
  dfPB: d => { const n = +d.n, i = +d.i, e = dfEditL(n).ex[i]; e[d.k] = !e[d.k]; dfSaveP(); },
  dfForm: d => { const n = +d.n, i = +d.i, e = dfEditL(n).ex[i], F = dfClone(DF_FORMES[e.t][+d.f]); delete e.steps; Object.assign(e, F, { forme: F.n }); dfSaveP(); },
  dfFO: d => { const n = +d.n, i = +d.i, e = dfEditL(n).ex[i]; dfSetPath(e, d.k, d.v); e.forme = '';
    if (d.k === 'mode') { e.val = d.v === 'dist' ? 200 : 30; delete e.steps; } if (d.k === 'rec.unite') e.rec.val = d.v === 'dist' ? 100 : 30; dfSaveP(); },
  dfFS: d => { const n = +d.n, i = +d.i, e = dfEditL(n).ex[i], st = { val: e.mode === 'dist' ? 50 : 5, reps: 1, pct: 5, 'rec.val': e.rec.unite === 'dist' ? 50 : 5, series: 1, recS: 30 }[d.k],
      lim = { val: [5, 5000], reps: [1, 30], pct: [50, 140], 'rec.val': [0, 2000], series: [1, 6], recS: [0, 900] }[d.k];
    dfSetPath(e, d.k, Math.max(lim[0], Math.min(lim[1], (+dfGetPath(e, d.k) || 0) + +d.d * st))); e.forme = ''; dfSaveP(); },
  dfSteps: async d => { const n = +d.n, i = +d.i, e = dfEx(n, i), t = await textBox(`Pyramide : valeurs en ${e.mode === 'dist' ? 'mètres' : 'secondes'} séparées par des tirets (vide = répétitions identiques)`, (e.steps || [e.val, e.val * 2, e.val * 3, e.val * 2, e.val]).join('-'));
    if (t == null) return; const a = t.split(/[^\d.,]+/).map(x => parseFloat(x.replace(',', '.'))).filter(x => x > 0); const E = dfEditL(n).ex[i]; if (a.length) { E.steps = a; E.reps = a.length; } else delete E.steps; E.forme = ''; dfSaveP(); },
  dfComp: (d, el) => { UI.dfComp = UI.dfComp === d.k ? null : d.k; UI.dfCsel = null; rerender(); },
  dfCsel: d => { UI.dfCsel = UI.dfCsel === d.sid ? null : d.sid; rerender(); },
  dfCmv: d => { if (!UI.dfCsel) return; const n = +d.n, i = +d.i, e = dfEditL(n).ex[i]; const cur = e.eq && Object.keys(e.eq).length ? e.eq : dfTeams(n, i, dfEx(n, i)); e.eq = { ...cur, [UI.dfCsel]: +d.t }; UI.dfCsel = null; dfSaveP('✓ Équipe modifiée'); },
  dfCprop: d => { const n = +d.n, i = +d.i, e = dfEditL(n).ex[i]; e.eq = dfPropose(n, i, e, d.m, dfNbTeams(n, e));
    dfSaveP('✓ Proposition enregistrée'); },
  dfCclear: d => { const n = +d.n, i = +d.i, e = dfEditL(n).ex[i]; delete e.eq; delete e.parc; dfSaveP('Repli automatique'); },
  dfParcA: d => { const n = +d.n, i = +d.i, e = dfEditL(n).ex[i]; if (!e.eq) e.eq = dfTeams(n, i, e); e.parc = dfAttribParcours(n, i, e, d.m); dfSaveP('✓ Parcours attribués'); },
  dfJokP: d => { S.params.jok = dfClone(dfJokAll()); const j = S.params.jok[+d.k]; j.p = Math.max(1, Math.min(20, j.p + +d.d)); dfSaveP(); },
  dfJokOn: d => { S.params.jok = dfClone(dfJokAll()); const j = S.params.jok[+d.k]; j.on = j.on === false; dfSaveP(); },
  dfJokDel: async d => { if (!(await confirmBox('Supprimer ce joker ?', esc(dfJokAll()[+d.k].l), 'Supprimer', true))) return; S.params.jok = dfClone(dfJokAll()); S.params.jok.splice(+d.k, 1); dfSaveP(); },
  dfJokL: async d => { const t = await textBox('Intitulé du joker', dfJokAll()[+d.k].l); if (!t) return; S.params.jok = dfClone(dfJokAll()); S.params.jok[+d.k].l = t; dfSaveP(); },
  dfJokAdd: async () => { const t = await textBox('Nouveau joker (ex. « Je finis à moins de 2 s de mon temps annoncé »)', ''); if (!t) return; const p = await numberBox('Points gagnés si l\'objectif est atteint', 4, { step: 1, min: 1, max: 20 }); if (p == null) return;
    S.params.jok = dfClone(dfJokAll()); S.params.jok.push({ id: 'j' + rnd(4), l: t, p: Math.round(p), on: true }); dfSaveP(); },
  dfJokReset: async () => { if (!(await confirmBox('Revenir aux jokers par défaut ?', 'Vos thèmes ajoutés seront supprimés.', 'Revenir'))) return; delete S.params.jok; dfSaveP(); },
  dfPilMode: d => { S.params = S.params || {}; S.params.pilMode = { ...(S.params.pilMode || {}), [d.p]: d.m }; dfSaveP(); },
  dfPilL: d => { UI.pilL = +d.n; rerender(); },
  dfPilG: d => { UI.pilG = d.g === '' ? null : +d.g; rerender(); },
  dfPPopen: d => { UI.ppAll = false; dfPPmodal(d.sid); },
  dfPPset: d => { const n = UI.pilL || curLesson(); S.ppil = S.ppil || {}; const L = S.ppil[n] = S.ppil[n] || {}; L[d.sid] = dfPilApply({ ...(L[d.sid] || {}) }, d); if (!Object.keys(L[d.sid]).length) delete L[d.sid]; save(); dfPPmodal(d.sid); },
  dfBdL: d => { UI.bdL = +d.n; rerender(); },
  dfEvalXls: () => dfEvalXls(),
  dfCycPrint: () => dfCycPrint(),
  dfFiche: d => dfFiche(d.t, d.n ? +d.n : null, d.i != null && d.i !== '' ? +d.i : null),
});
/* ACT.nbLessons du socle sert aussi ici */
document.addEventListener('change', e => {
  if (!e.target.classList || !e.target.classList.contains('df-vma-in')) return;
  const v = parseFloat(String(e.target.value).replace(',', '.')), sid = e.target.dataset.sid;
  S.params = S.params || {}; S.params.vmaMan = { ...(S.params.vmaMan || {}) };
  if (isFinite(v) && v > 0) S.params.vmaMan[sid] = r10(v, 1); else delete S.params.vmaMan[sid];
  save(); rerender(); toast('✓ VMA enregistrée · renvoyez le QR de la leçon');
});

/* Fils : notes /6 sous les pelotes */
const _dfProfFil = profFilRouge;
profFilRouge = () => _dfProfFil() + (FRS.length ? `<div class="card scroll-x"><h3>Notes des fils /6 <small class="muted">(détail dans 📝 Évaluation)</small></h3><table class="tbl"><thead><tr><th>Élève</th>${FRS.map(fr => `<th>${yarnIcon(fr, 16)} ${esc(fr.nom)}<br><small>/6</small></th>`).join('')}</tr></thead><tbody>
  ${sortedStudents().filter(s => UI.frG == null || (s.grp || 0) === UI.frG).map(s => { const B = dfEvalBlocks(s.id), k = { FR: 'frInv', FM: 'frPil' };
    return `<tr><td class="nm">${band(s.id)}${esc(nameOf(s.id))}</td>${FRS.map(fr => { const v = B[k[fr.id]]; return `<td title="${esc(B[k[fr.id] + 'Txt'] || '')}"><b>${v == null ? '—' : fmtN(v, 2)}</b>${B[k[fr.id] + 'Lv'] ? `<br><small>proposé ${B[k[fr.id] + 'Prop'] == null ? '—' : fmtN(B[k[fr.id] + 'Prop'], 2)} · ${COMP_LV[B[k[fr.id] + 'Lv']].n}</small>` : '<br><small class="muted">niveau final à choisir</small>'}</td>`; }).join('')}</tr>`; }).join('')}</tbody></table></div>` : '');
