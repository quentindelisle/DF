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
PSECT[0][1].splice(PSECT[0][1].indexOf('lecons') + 1, 0, 'plan', 'vma');
PSECT[3][1].splice(0, 0, 'bilanDF', 'evalDF', 'pilprof');
const _dfViewProf = viewProf;
viewProf = () => ({ plan: dfProfPlan, vma: dfProfVma, pilprof: dfProfPil, bilanDF: dfProfBilan, evalDF: dfProfEval }[UI.profTab] || _dfViewProf)();

/* ---------- Paramètres du cycle : le plan remplace le nombre d'essais ---------- */
profLecons = () => { const n = curLesson();
  return `<div class="card df-help"><b>⚙️ Paramètres du cycle</b> : ce qui vaut pour tout le cycle (piste, piliers, jokers). Le contenu de chaque leçon se prépare dans <button class="btn small" data-action="tab" data-tab="plan">🗺️ Programmation des leçons</button></div>
    <div class="card"><div class="btn-row spread"><h3 style="margin:0">Nombre de leçons du cycle</h3>${stepper('nbLessons', S.settings.nbLessons)}</div></div>
    <div class="card"><h3>Leçon en cours</h3><div class="lchips">${Array.from({ length: S.settings.nbLessons }, (_, i) => i + 1).map(l => `<button class="chip ${l === n ? 'on' : ''} ${lesson(l).ev ? 'ev' : ''}" data-action="setLesson" data-n="${l}">${l}${lesson(l).ev ? ' 📝' : ''}</button>`).join('')}</div>
      <p class="muted">${esc(lessonLabel(n))} · ${esc(dfLessonSummary(n))}</p></div>
    ${dfPisteCard()}${dfPilCfgCard()}${dfJokCard()}` + displayCard() + frChoiceCard() + newCycleCard(); };
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
  aventuriers:[ { k:'dur', l:'Durée du jeu', u:'min', min:10, max:60, st:5 },
    { k:'taille', l:'Équipes', opts:[[2, 'Binômes'], [3, 'Trinômes']] }, { k:'nbParc', l:'Parcours par équipe', u:'', min:1, max:5, st:1 },
    { k:'coefTri', l:'Coefficient des trinômes (s\'il reste des binômes)', u:'', min:0.5, max:1, st:0.05 }, { k:'tabs', l:'Tablettes pour la saisie', u:'', min:1, max:8, st:1 },
    { k:'form', l:'Constitution des équipes', opts:[['libre', 'Libre (à la main)'], ['alea', 'Aléatoire'], ['proche', 'VMA proches'], ['equi', 'VMA équilibrées']] },
    { k:'attr', l:'Attribution des parcours', opts:[['alea', 'Aléatoire'], ['vma', 'Selon la VMA de l\'équipe']] } ],
  equipe:[ { k:'dur', l:'Durée', u:'min', min:4, max:40, st:1 }, { k:'nbEq', l:'Nombre d\'équipes', u:'', min:2, max:8, st:1 }, { k:'tabs', l:'Tablettes pour compter les tours', u:'', min:1, max:3, st:1 },
    { k:'form', l:'Constitution des équipes', opts:[['equi', 'Niveau : équipes équilibrées'], ['besoin', 'Groupes de besoin (piliers)'], ['proche', 'VMA proches'], ['alea', 'Aléatoire'], ['libre', 'À la main']] },
    { k:'pauses', l:'Noter les entrées / sorties de pause', bool:true } ],
  pelotons:[ { k:'d', l:'Distance d\'une course', u:'m', min:200, max:1500, st:50 }, { k:'nb', l:'Courses par élève', u:'', min:1, max:6, st:1 }, { k:'ns', l:'Nombre de séries', u:'', min:1, max:8, st:1 }, { k:'rec', l:'Récupération entre courses', u:'min', min:1, max:15, st:1 } ],
  eval:[ { k:'d', l:'Distance', u:'m', min:300, max:800, st:50 }, { k:'nb', l:'Courses', u:'', min:2, max:4, st:1 }, { k:'rec', l:'Récupération', u:'min', min:3, max:15, st:1 } ],
};
const dfStepper = (act, attrs, disp) => `<div class="stepper"><button class="cbtn" data-action="${act}" ${attrs} data-d="-1">−</button><b class="df-sv">${disp}</b><button class="cbtn" data-action="${act}" ${attrs} data-d="1">+</button></div>`;
function dfSchemaRows(n, i, e){
  return (DF_SCHEMA[e.t] || []).map(f => { const a = `data-n="${n}" data-i="${i}" data-k="${f.k}"`;
    if (f.bool) return `<div class="form-row"><span>${esc(f.l)}</span><button class="btn small ${e[f.k] ? 'green' : ''}" data-action="dfPB" ${a}>${e[f.k] ? '✓ Oui' : 'Non'}</button></div>`;
    if (f.opts) return `<div class="form-row"><span>${esc(f.l)}</span><div class="choices">${f.opts.map(([v, l]) => `<button class="ch ${e[f.k] === v ? 'on' : ''}" data-action="dfPO" ${a} data-v="${v}" ${e[f.k] === v ? 'style="background:var(--navy);border-color:var(--navy);color:#fff"' : ''}>${esc(l)}</button>`).join('')}</div></div>`;
    return `<div class="form-row"><span>${esc(f.l)}</span>${dfStepper('dfPS', a, `${fmtN(e[f.k], 2)} ${f.u}`)}</div>`; }).join('');
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
    <div class="form-row"><span>Piliers notés par l'observateur</span><div class="choices">${ch('pil', 'fin', 'en fin d\'exercice', e.pil)}${ch('pil', 'rep', 'à chaque passage', e.pil)}</div></div>
    <p class="muted">Exemple de cibles : ${esc(ex)}. Un élève en petite forme (appel) court à ${e.pct - 10} %.</p>`;
}
function dfComposer(n, i, e){
  const teams = e.eq && Object.keys(e.eq).length ? e.eq : null, nb = e.t === 'aventuriers' ? dfNbTeams(n, e) : e.t === 'pelotons' ? e.ns : e.nbEq, sel = UI.dfCsel;
  const cur = teams || dfTeams(n, i, e), present = sortedStudents().filter(s => dfPresent(n, s.id)), nbShown = Math.max(nb, ...Object.values(cur).map(t => t + 1));
  const modes = e.t === 'pelotons' ? [['proche', '⚡ VMA proches'], ['alea', '🎲 Aléatoire']] : [['equi', '⚖️ VMA équilibrées'], ['proche', '⚡ VMA proches'], ['besoin', '🎯 Besoins (piliers)'], ['alea', '🎲 Aléatoire']];
  const col = t => `<div class="df-col" style="--tc:${dfTeamCol(t).c}"><button class="df-colh" data-action="dfCmv" data-n="${n}" data-i="${i}" data-t="${t}">${esc(dfTeamName(e, t))}${sel ? ' ⬅' : ''}</button>
    ${present.filter(s => cur[s.id] === t).map(s => `<button class="chip ${sel === s.id ? 'on' : ''}" data-action="dfCsel" data-sid="${s.id}">${esc(nameOf(s.id))} <small>${fmtN(dfVmaFor(n, s.id, i), 1)}</small></button>`).join('')}
    <small class="muted">VMA moy. ${fmtN(avg(vals(present.filter(s => cur[s.id] === t).map(s => dfVmaFor(n, s.id, i)))), 1)}</small></div>`;
  const out = present.filter(s => cur[s.id] == null);
  return `<div class="df-comp"><div class="btn-row"><b>Proposer :</b>${modes.map(([m, l]) => `<button class="btn small" data-action="dfCprop" data-n="${n}" data-i="${i}" data-m="${m}">${l}</button>`).join('')}
      <button class="btn small ghost" data-action="dfCclear" data-n="${n}" data-i="${i}">↺ Repli automatique</button></div>
    <p class="muted">${teams ? '✓ Composition enregistrée.' : 'Pas encore enregistrée : proposition automatique (VMA) affichée.'} Touchez un élève puis l'équipe où le placer. ${e.t !== 'pelotons' ? `Tablette d'une équipe = numéro de l'équipe modulo ${e.tabs || 1}.` : ''}</p>
    ${out.length ? `<div class="df-col" style="--tc:#9AA3B5"><b>Non placés</b>${out.map(s => `<button class="chip ${sel === s.id ? 'on' : ''}" data-action="dfCsel" data-sid="${s.id}">${esc(nameOf(s.id))}</button>`).join('')}</div>` : ''}
    <div class="df-cols">${Array.from({ length: nbShown + (sel ? 1 : 0) }, (_, t) => col(t)).join('')}</div>
    ${e.t === 'aventuriers' ? dfParcEditor(n, i, e) : ''}</div>`;
}
function dfParcEditor(n, i, e){
  const P = dfParc(n, i, e), teams = dfTeams(n, i, e), nb = Math.max(0, ...Object.values(teams).map(t => t + 1));
  return `<div class="card"><div class="btn-row spread"><h3 style="margin:0">🎫 Parcours (${e.nbParc} par équipe)</h3><div class="btn-row">
      <button class="btn small" data-action="dfParcA" data-n="${n}" data-i="${i}" data-m="alea">🎲 Aléatoire</button><button class="btn small" data-action="dfParcA" data-n="${n}" data-i="${i}" data-m="vma">⚡ Selon la VMA</button></div></div>
    <p class="muted">${e.parc && Object.keys(e.parc).length ? '✓ Parcours attribués.' : 'Non attribués : tirage automatique identique sur toutes les tablettes.'} Valeur d'un parcours = nombre de tronçons du plus court chemin.</p>
    ${Array.from({ length: nb }, (_, t) => `<div class="df-tkrow"><span class="dot" style="background:${dfTeamCol(t).c}"></span><b>${esc(dfTeamName(e, t))}</b> ${(P[t] || []).map(id => DF_TICKETS[id]).filter(Boolean).map(tk => `<span class="pill">${esc(tk.a)} → ${esc(tk.b)} · ${tk.pts}</span>`).join(' ')}</div>`).join('')}</div>`;
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
function dfProfPlan(){
  const n = UI.planL && UI.planL <= S.settings.nbLessons ? UI.planL : curLesson(), C = dfCyc(n), E = C.ex || [];
  return `<div class="card df-help"><b>🗺️ Programmation des leçons</b> : pour chaque leçon, ses exercices, leurs réglages, les équipes et le pilier observé. Piste, forme des piliers et jokers : <button class="btn small" data-action="tab" data-tab="lecons">⚙️ Paramètres du cycle</button></div>
    <div class="card"><div class="btn-row spread"><div class="lchips"><b>Leçon</b>${Array.from({ length: S.settings.nbLessons }, (_, k) => k + 1).map(l => `<button class="chip ${l === n ? 'on' : ''}" data-action="dfPL" data-n="${l}">${l} ${dfExs(l).map(e => DFX[e.t].ico).join('')}</button>`).join('')}</div>
      <div class="btn-row"><button class="btn small" data-action="dfCycPrint">🖨 Fiche du cycle</button></div></div>
      <p class="muted">Chaque leçon contient 1 à 4 exercices. <b>Renvoyez le QR de la leçon</b> après une modification.</p></div>
    <div class="card strong"><div class="btn-row spread"><h3 style="margin:0">Leçon ${n} · ${esc(lesson(n).title || C.title || '—')}</h3>
      <div class="btn-row"><button class="btn small" data-action="dfLTitle" data-n="${n}">✎ Titre</button>${S.params && S.params.cyc && S.params.cyc[n] ? `<button class="btn small ghost" data-action="dfLReset" data-n="${n}">↺ Leçon par défaut</button>` : ''}</div></div>
      <div class="form-row"><span>Leçon en cours (envoyée par le QR)</span>${n === curLesson() ? '<b>✓ Oui</b>' : `<button class="btn small" data-action="setLesson" data-n="${n}">▶ En faire la leçon en cours</button>`}</div>
      <div class="form-row"><span>Leçon d'évaluation</span><button class="btn small ${lesson(n).ev ? 'green' : ''}" data-action="dfLEv" data-n="${n}">${lesson(n).ev ? '✓ Oui' : 'Non'}</button></div>
      <div class="form-row"><span>🎯 Pilier(s) observé(s) pendant la leçon<br><small class="muted">les observateurs ne notent que ceux-là</small></span><div class="choices">${DF_PIL.map(p => { const on_ = (C.pil || DF_PIL.map(x => x.id)).includes(p.id);
        return `<button class="ch ${on_ ? 'on' : ''}" data-action="dfLPil" data-n="${n}" data-p="${p.id}" ${on_ ? 'style="background:var(--orange);border-color:var(--orange);color:#fff"' : ''}>${esc(p.n)}</button>`; }).join('')}</div></div></div>
    ${E.map((e, i) => `<div class="card df-excard" style="--xc:${DFX[e.t].c}"><div class="btn-row spread"><h3 style="margin:0">${DFX[e.t].ico} ${i + 1}. ${esc(DFX[e.t].n)}</h3>
        <div class="btn-row"><button class="btn small" data-action="dfFiche" data-t="${e.t}" data-n="${n}" data-i="${i}">📖 Fiche</button><button class="btn small ghost" data-action="dfXmv" data-n="${n}" data-i="${i}" data-d="-1" ${i ? '' : 'disabled'}>↑</button>
        <button class="btn small ghost" data-action="dfXmv" data-n="${n}" data-i="${i}" data-d="1" ${i < E.length - 1 ? '' : 'disabled'}>↓</button><button class="btn small ghost" data-action="dfXdel" data-n="${n}" data-i="${i}">🗑</button></div></div>
      <p class="muted">${esc(dfExSummary(e))}</p>
      ${DF_FRAC(e.t) ? dfFracEditor(n, i, e) : DF_TEST(e.t) ? `<p>${e.t === 'bats' ? '🔥 Retest du demi-Cooper : évaluation intermédiaire notée /6 sur le progrès de VMA ; la nouvelle VMA sert aux cibles des fractionnés et de l\'évaluation.' : '⏱️ 6 minutes de course, VMA = distance ÷ 100.'}</p><button class="btn small" data-action="dfPlotsGuide">📍 Placement des plots</button>` : dfSchemaRows(n, i, e)}
      ${['equipe', 'aventuriers', 'pelotons'].includes(e.t) ? `<details class="df-compd" ${UI.dfComp === n + '-' + i ? 'open' : ''}><summary data-action="dfComp" data-k="${n}-${i}"><b>🧩 ${e.t === 'pelotons' ? 'Séries' : 'Équipes'}${e.t === 'aventuriers' ? ' et parcours' : ''}</b></summary>${UI.dfComp === n + '-' + i ? dfComposer(n, i, e) : ''}</details>` : ''}</div>`).join('')}
    ${E.length < 4 ? `<div class="card"><b>＋ Ajouter un exercice</b><div class="df-exgrid">${Object.entries(DFX).map(([t, X]) => `<button class="df-exbtn" style="--xc:${X.c}" data-action="dfXadd" data-n="${n}" data-t="${t}"><span class="ico">${X.ico}</span><b>${esc(X.n)}</b></button>`).join('')}</div></div>` : '<p class="muted">4 exercices au maximum par leçon.</p>'}`;
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
        <td><input type="number" step="0.1" min="5" max="25" inputmode="decimal" class="df-vma-in" data-sid="${s.id}" value="${man ?? ''}" style="width:90px"></td>
        <td>${ref ? `<b>${fmtN(ref.v, 1)}</b><br><small>${esc(ref.src)}</small>` : '—'}</td></tr>`; }).join('')}</tbody></table></div>`;
}

/* =====================================================================
   PILIERS ÉVALUÉS PAR L'ENSEIGNANT (mode administrateur)
   ===================================================================== */
const dfPP = (n, sid) => S.ppil?.[n]?.[sid] || null;
function dfProfPil(){
  const n = UI.pilL || curLesson();
  return `<div class="card"><div class="lchips"><b>Leçon</b>${Array.from({ length: S.settings.nbLessons }, (_, k) => k + 1).map(l => `<button class="chip ${l === n ? 'on' : ''}" data-action="dfPilL" data-n="${l}">${l}${Object.keys(S.ppil?.[l] || {}).length ? ' ✓' : ''}</button>`).join('')}</div>
      <p class="muted">Évaluez quand vous le décidez : touchez un élève. Votre évaluation compte pour 6 pts et sert de référence à la qualité des observations des élèves.</p></div>
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
const dfRowsP = (n, f) => sortedStudents().filter(s => dfPresent(n, s.id)).map(f).join('');
const DF_BILAN = {
  cooper: (n, i, e) => `<table class="tbl"><thead><tr><th>Élève</th><th>Plot d'arrêt</th><th>Distance</th><th>VMA</th>${e.t === 'bats' ? '<th>Avant</th><th>Progrès</th><th>Note /6</th>' : ''}</tr></thead><tbody>${dfRowsP(n, s => { const x = dfX(n, s.id, i) || {}, g = e.t === 'bats' ? dfBatsGain(n, s.id, i) : null, r = e.t === 'bats' ? dfVmaRef(n, s.id, i) : null;
    return `<tr><td class="nm">${band(s.id)}${esc(nameOf(s.id))}</td><td>${x.ab ? '🚩' : dfTestPn(x) ?? '—'}</td><td>${dfKm(dfTestDist(x))}</td><td><b>${fmtN(dfTestVma(n, s.id, i), 1)}</b></td>
      ${e.t === 'bats' ? `<td>${r ? fmtN(r.v, 1) : '—'}</td><td>${g == null ? '—' : (g >= 0 ? '+' : '−') + fmtN(Math.abs(g), 1)}</td><td><b>${dfBatsNote(g) ?? '—'}</b></td>` : ''}</tr>`; })}</tbody></table>`,
  equipe: (n, i, e) => { const teams = dfTeams(n, i, e);
    return Array.from({ length: e.nbEq }, (_, t) => { const M = sortedStudents().filter(s => teams[s.id] === t && dfPresent(n, s.id)), tl = M.reduce((a, s) => a + ((dfX(n, s.id, i) || {}).laps || []).length, 0);
      return `<h4><span class="dot" style="background:${dfTeamCol(t).c}"></span> ${esc(dfTeamName(e, t))} · ${tl} tours · ${dfKm(tl * dfLap())}</h4><table class="tbl"><thead><tr><th>Élève</th><th>Tours</th><th>Distance</th><th>Part de l'équipe</th><th>Régularité</th><th>Pauses</th></tr></thead><tbody>
      ${M.map(s => { const x = dfX(n, s.id, i) || {}, L = (x.laps || []).length, r = dfRegul(x); return `<tr><td class="nm">${band(s.id)}${esc(nameOf(s.id))}</td><td>${x.ab ? '🚩 ' : ''}${L}</td><td>${dfKm(L * dfLap())}</td><td>${tl ? Math.round(L / tl * 100) + ' %' : '—'}</td><td>${r == null ? '—' : r + ' %'}</td><td>${(x.pz || []).length || ''}</td></tr>`; }).join('')}</tbody></table>`; }).join(''); },
  aventuriers: (n, i, e) => { const A = dfAvScores(n, i, e);
    return dfAvTable(n, i, e) + `<h4>Distance par coureur (comparée à son ${e.taille === 3 ? 'trinôme' : 'binôme'})</h4><table class="tbl"><thead><tr><th>Équipe</th><th>Coureur</th><th>Trajets</th><th>Tours</th><th>Distance</th><th>Part de l'équipe</th></tr></thead><tbody>
      ${A.map(a => a.members.map((s, k) => { const B = (dfX(n, s.id, i) || {}).buys || [], tr = B.reduce((x, b) => x + DF_ROUTES[b.r].segments, 0);
        return `<tr>${k ? '' : `<td rowspan="${a.members.length}"><span class="dot" style="background:${dfTeamCol(a.t).c}"></span> ${esc(dfTeamCol(a.t).n)}</td>`}<td class="nm">${band(s.id)}${esc(nameOf(s.id))}</td><td>${B.length}</td><td>${tr}</td><td>${dfKm(tr * dfLap())}</td><td>${a.laps ? Math.round(tr / a.laps * 100) + ' %' : '—'}</td></tr>`; }).join('')).join('')}</tbody></table>`; },
  pelotons: (n, i, e) => `<table class="tbl"><thead><tr><th>Élève</th><th>Série</th>${Array.from({ length: e.nb }, (_, k) => `<th>C${k + 1}</th>`).join('')}<th>Note /10</th></tr></thead><tbody>${dfRowsP(n, s => { const N = dfPelNote(n, s.id, i, e), x = dfX(n, s.id, i) || {}, t = dfTeamOf(n, i, e, s.id);
    return `<tr><td class="nm">${band(s.id)}${esc(nameOf(s.id))}</td><td>${t != null ? `<span class="dot" style="background:${dfTeamCol(t).c}"></span>` : ''}</td>${Array.from({ length: e.nb }, (_, k) => { const c = (x.c || [])[k] || {}, sc = dfPelCourse(n, s.id, i, e, k), J = dfJok(c.j);
      return `<td>${c.t ? `<b>${dfT(c.t)}</b> · ${fmtN(sc.pct, 0)} %<br><small>${fmtN(sc.perf, 1)}/5${J ? ` + 🃏 ${c.ok ? sc.jp : '✗'}` : ''} = ${fmtN(sc.tot, 1)}</small>` : '—'}</td>`; }).join('')}<td><b>${N.note == null ? '—' : fmtN(N.note, 1)}</b></td></tr>`; })}</tbody></table>`,
  fc: (n, i, e) => `<table class="tbl"><thead><tr><th>Élève</th><th>VMA · %</th><th>Répétitions</th><th>Cibles atteintes</th><th>Piliers (obs.)</th><th>Distance</th></tr></thead><tbody>${dfRowsP(n, s => { const x = dfX(n, s.id, i) || {}, a = dfFracCells(x), r = dfVmaRef(n, s.id, i), pm = vals(Object.values(x.pil || {}).map(dfPilMean));
    return `<tr><td class="nm">${band(s.id)}${esc(nameOf(s.id))}</td><td>${r ? fmtN(r.v, 1) : '—'} · ${e.pct - (dfForme(n, s.id) ? 10 : 0)} %${dfForme(n, s.id) ? ' 😓' : ''}</td><td>${x.ab ? '🚩 ' : ''}${a.length}/${dfRepCount(e)}</td>
      <td>${a.length ? `<b>${Math.round(avg(a.map(v => v / 2)) * 100)} %</b> <small>${a.map(v => DF_CELL[v].s).join('')}</small>` : '—'}</td><td>${pm.length ? Math.round(avg(pm) * 100) + ' %' : '—'}</td><td>${dfKm(dfExDist(n, s.id, i))}</td></tr>`; })}</tbody></table>`,
  eval: (n, i, e) => `<table class="tbl"><thead><tr><th>Élève</th><th>VMA</th>${Array.from({ length: e.nb }, (_, k) => `<th>C${k + 1}</th>`).join('')}<th>Régularité /3</th><th>Note /12</th></tr></thead><tbody>${dfRowsP(n, s => { const Sc = dfEvScore(n, s.id, i, e) || { t: [], pts: [] }, r = dfVmaRef(n, s.id, i);
    return `<tr><td class="nm">${band(s.id)}${esc(nameOf(s.id))}</td><td>${r ? fmtN(r.v, 1) : '—'}</td>${Array.from({ length: e.nb }, (_, k) => `<td>${Sc.t[k] ? `${dfT(Sc.t[k])}<br><small>${fmtN(dfPctOf(e.d, Sc.t[k], r && r.v), 0)} % · ${fmtN(Sc.pts[k], 1)}/3</small>` : '—'}</td>`).join('')}<td>${fmtN(Sc.reg, 1)}</td><td><b>${Sc.total == null ? '—' : fmtN(Sc.total, 2)}</b></td></tr>`; })}</tbody></table>`,
};
DF_BILAN.bats = DF_BILAN.cooper; DF_BILAN.fl = DF_BILAN.fc;

/* =====================================================================
   ÉVALUATION : blocs séparés
   ===================================================================== */
const dfInterp = (x, t) => x == null ? null : Math.round(interp(t, x) * 4) / 4;
function dfAllEx(upTo){ const a = []; for (let l = 1; l <= (upTo || S.settings.nbLessons); l++) dfExs(l).forEach((e, i) => a.push({ l, i, e })); return a; }
const dfLessonHeld = l => Object.keys(S.results[l] || {}).length > 0;
function dfEvalBlocks(sid){
  const X = dfAllEx(), B = {};
  /* AFL1 : 3 × 500 m /12 (meilleure évaluation) */
  const ev = vals(X.filter(x => x.e.t === 'eval').map(x => (dfEvScore(x.l, sid, x.i, x.e) || {}).total)); B.afl1 = ev.length ? Math.max(...ev) : null;
  /* Bats tes perfs /6 (dernier) */
  const bt = X.filter(x => x.e.t === 'bats').map(x => dfBatsNote(dfBatsGain(x.l, sid, x.i))).filter(v => v != null); B.bats = bt.length ? bt[bt.length - 1] : null;
  /* régularité de l'investissement /2 : exercices faits sans abandon */
  const slots = X.filter(x => dfLessonHeld(x.l) && dfPresent(x.l, sid)); const okS = slots.filter(x => { const o = dfX(x.l, sid, x.i); return o && !o.ab; });
  B.regInv = slots.length ? dfInterp(okS.length / slots.length, [[0.5, 0], [1, 2]]) : null; B.regInvTxt = slots.length ? `${okS.length}/${slots.length} exercices · ${slots.filter(x => (dfX(x.l, sid, x.i) || {}).ab).length} abandon(s)` : '';
  /* qualité de l'investissement /3 : cibles des fractionnés */
  const cells = []; X.filter(x => DF_FRAC(x.e.t)).forEach(x => dfFracCells(dfX(x.l, sid, x.i)).forEach(v => cells.push(v / 2)));
  B.qualInv = cells.length ? dfInterp(avg(cells), [[0.4, 0], [0.9, 3]]) : null; B.qualInvTxt = cells.length ? Math.round(avg(cells) * 100) + ' % des cibles' : '';
  /* observations faites par l'élève (comme observateur) */
  const exp = X.filter(x => (DF_FRAC(x.e.t) || x.e.t === 'eval') && dfLessonHeld(x.l) && dfPresent(x.l, sid));
  const did = exp.filter(x => S.students.some(r => Object.values((dfX(x.l, r.id, x.i) || {}).pil || {}).some(p => p.by === sid)));
  const q = exp.length ? did.length / exp.length : null;
  B.quantObs = q == null ? null : q >= 0.95 ? 2 : q >= 0.75 ? 1.5 : q >= 0.5 ? 1 : q > 0 ? 0.5 : 0;
  B.quantObsTxt = q == null ? '' : (q >= 0.95 ? 'n\'oublie jamais' : q >= 0.75 ? 'oublie parfois' : q >= 0.5 ? 'oublie souvent' : q > 0 ? 'oublie très souvent' : 'n\'a pas encore documenté') + ` (${did.length}/${exp.length})`;
  const agr = [];
  for (let l = 1; l <= S.settings.nbLessons; l++) S.students.forEach(r => { const P = dfPP(l, r.id); if (!P) return;
    dfExs(l).forEach((e, i) => Object.values((dfX(l, r.id, i) || {}).pil || {}).forEach(o => { if (o.by !== sid) return;
      const d = vals(DF_PIL.map(p => { const a = dfPilScore(p, o[p.id]), b = dfPilScore(p, P[p.id]); return a == null || b == null ? null : 1 - Math.abs(a - b); })); if (d.length) agr.push(avg(d)); })); });
  B.qualObs = agr.length ? dfInterp(avg(agr), [[0.6, 0], [0.9, 3]]) : null; B.qualObsTxt = agr.length ? `accord ${Math.round(avg(agr) * 100)} % avec l'enseignant (${agr.length})` : 'pas encore comparable';
  /* piliers évalués par les observateurs /3 */
  const ps = []; X.forEach(x => Object.values((dfX(x.l, sid, x.i) || {}).pil || {}).forEach(o => { const m = dfPilMean(o); if (m != null) ps.push(m); }));
  B.pilEl = ps.length ? Math.round(avg(ps) * 3 * 4) / 4 : null; B.pilElTxt = ps.length ? Math.round(avg(ps) * 100) + ' %' : '';
  /* piliers évalués par l'enseignant /6 (dernière évaluation de chaque pilier) */
  const last = {}; for (let l = 1; l <= S.settings.nbLessons; l++) { const P = dfPP(l, sid); if (P) DF_PIL.forEach(p => { if (P[p.id] != null) last[p.id] = P[p.id]; }); }
  const pp = vals(DF_PIL.map(p => dfPilScore(p, last[p.id]))); B.pilProf = pp.length ? Math.round(avg(pp) * 6 * 4) / 4 : null; B.pilProfTxt = pp.length ? `${pp.length}/${DF_PIL.length} piliers` : '';
  return B;
}
const DF_BLOCKS = [['afl1', 'AFL1 · 3 × 500 m', 12], ['bats', 'Bats tes perfs', 6], ['regInv', 'Régularité de l\'investissement', 2], ['qualInv', 'Qualité de l\'investissement', 3],
  ['qualObs', 'Qualité des observations', 3], ['quantObs', 'Quantité des observations', 2], ['pilEl', 'Piliers (élèves)', 3], ['pilProf', 'Piliers (enseignant)', 6]];
function dfProfEval(){
  return `<div class="card"><h3>📝 Évaluation par blocs</h3><p class="muted">Chaque bloc est affiché séparément (pas de total). Survolez ou touchez une case pour le détail. Les piliers de l'enseignant se notent dans 🎓 Piliers (enseignant).</p>
      <button class="btn primary" data-action="dfEvalXls">📊 Export Excel</button></div>
    <div class="card scroll-x"><table class="tbl"><thead><tr><th>Élève</th>${DF_BLOCKS.map(([, l, m]) => `<th>${esc(l)}<br><small>/${m}</small></th>`).join('')}</tr></thead><tbody>
    ${sortedStudents().map(s => { const B = dfEvalBlocks(s.id); return `<tr><td class="nm">${band(s.id)}${esc(nameOf(s.id))}</td>${DF_BLOCKS.map(([k]) => `<td title="${esc(B[k + 'Txt'] || '')}"><b>${B[k] == null ? '—' : fmtN(B[k], 2)}</b>${B[k + 'Txt'] ? `<br><small>${esc(B[k + 'Txt'])}</small>` : ''}</td>`).join('')}</tr>`; }).join('')}</tbody></table></div>`;
}
function dfEvalXls(){
  if (!window.XLSX) return toast('Bibliothèque Excel non chargée');
  const rows = [['Nom', 'Prénom', ...DF_BLOCKS.flatMap(([, l, m]) => [`${l} /${m}`, `${l} (détail)`])], ...sortedStudents().map(s => { const B = dfEvalBlocks(s.id); return [s.nom || s.disp || '', s.prenom || '', ...DF_BLOCKS.flatMap(([k]) => [B[k] == null ? '' : B[k], B[k + 'Txt'] || ''])]; })];
  const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Évaluation');
  const dist = [['Nom', 'Prénom', ...Array.from({ length: S.settings.nbLessons }, (_, k) => 'L' + (k + 1) + ' (m)')], ...sortedStudents().map(s => [s.nom || s.disp || '', s.prenom || '', ...Array.from({ length: S.settings.nbLessons }, (_, k) => { const v = lessonVal(k + 1, s.id, fieldById('dist')); return v == null ? '' : Math.round(v); })])];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(dist), 'Distances');
  XLSX.writeFile(wb, `${CFG.short} - évaluation - ${className()}.xlsx`.replace(/[\\/:*?"<>|]/g, '-'));
}

/* fil rouge investissement : exercices faits sans abandon et cibles des fractionnés */
window.DF_frInvest = function(n, sid){
  const E = dfExs(n); if (!E.length) return null; const xs = E.map((_, i) => dfX(n, sid, i)); if (!xs.some(Boolean)) return null;
  const ab = xs.filter(x => x && x.ab).length, done = E.filter((_, i) => dfExDone(n, sid, i)).length, cells = [];
  E.forEach((e, i) => { if (DF_FRAC(e.t)) dfFracCells(xs[i]).forEach(v => cells.push(v / 2)); });
  if (n === curLesson() && done + ab < E.length) return { lv: null, why: `en cours : ${done}/${E.length} exercices` };
  let lv = ab ? (ab >= E.length ? 1 : 2) : done === E.length ? 3 : 2; if (lv === 3 && (!cells.length || avg(cells) >= 0.75)) lv = 4;
  return { lv, why: `${done}/${E.length} exercices faits${ab ? ' · ' + ab + ' abandon(s)' : ''}${cells.length ? ' · cibles ' + Math.round(avg(cells) * 100) + ' %' : ''}` };
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
  dfLPil: d => { const C = dfEditL(+d.n), a = C.pil && C.pil.length ? [...C.pil] : DF_PIL.map(p => p.id), k = a.indexOf(d.p);
    if (k >= 0) { if (a.length === 1) return toast('Gardez au moins un pilier'); a.splice(k, 1); } else a.push(d.p);
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
  dfPS: d => { const n = +d.n, i = +d.i, e = dfEditL(n).ex[i], f = DF_SCHEMA[e.t].find(x => x.k === d.k); e[d.k] = r10(Math.max(f.min, Math.min(f.max, (+e[d.k] || 0) + +d.d * f.st)), 2); dfSaveP(); },
  dfPO: d => { const n = +d.n, i = +d.i, e = dfEditL(n).ex[i]; e[d.k] = isFinite(+d.v) && d.v !== '' ? +d.v : d.v; dfSaveP(); },
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
