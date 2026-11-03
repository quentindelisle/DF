/* =====================================================================
   SPÉCIFIQUE — Demi-fond · performance auto-référencée
   Chargé après socle.js et outils.js (ne modifie pas le socle, s'y branche).
   · Plan des courses par leçon : type (test demi-Cooper, courses à allure,
     Bats tes perfs, évaluation) + liste de courses { distance, % VMA, récup }.
     Le plan part vers les tablettes avec le QR de la leçon (dans S.params).
   · VMA de référence = dernier demi-Cooper avant la leçon (ou VMA fixée par l'enseignant).
   · Temps visé d'une course = distance ÷ (VMA × %) ; écart réalisé / visé en %.
   ===================================================================== */
'use strict';

/* ---------- Plan par défaut du cycle (8 leçons) ---------- */
const DF_TYPES = {
  cooper:{ n:'Test demi-Cooper', ico:'⏱️', d:'6 minutes : distance parcourue → VMA (km/h) = distance ÷ 100' },
  allure:{ n:'Courses à allure', ico:'🏃', d:'Tenir le temps visé, à la tolérance près' },
  bats:{ n:'Bats tes perfs', ico:'🔥', d:'Faire mieux que le temps visé sur chaque course' },
  eval:{ n:'Évaluation', ico:'📝', d:'Courses imposées : écart moyen annoncé / réalisé' },
};
const dfR = (d, p, r) => ({ d, p, r });
const DF_DEF = {
  1:{ type:'cooper', title:'Test demi-Cooper' },
  2:{ type:'allure', title:'Découvrir ses allures', runs:[dfR(500, 80, 3), dfR(500, 85, 3), dfR(500, 90, 4)] },
  3:{ type:'bats', title:'Bats tes perfs', runs:[dfR(300, 95, 3), dfR(500, 90, 4), dfR(800, 85, 5)] },
  4:{ type:'allure', title:'Tenir son allure', runs:[dfR(500, 90, 3), dfR(500, 90, 3), dfR(500, 90, 3), dfR(500, 90, 3)] },
  5:{ type:'allure', title:'Varier les allures', runs:[dfR(800, 85, 4), dfR(800, 85, 4), dfR(400, 95, 3)] },
  6:{ type:'cooper', title:'Retest demi-Cooper' },
  7:{ type:'allure', title:'Préparer l\'évaluation', runs:[dfR(500, 90, 10), dfR(500, 90, 10), dfR(500, 90, 10)] },
  8:{ type:'eval', title:'Évaluation · 3 courses', runs:[dfR(500, 90, 10), dfR(500, 90, 10), dfR(500, 90, 10)] },
};
const DF_FALLBACK = { type:'allure', title:'', runs:[dfR(500, 85, 3), dfR(500, 85, 3)] };
const dfClone = o => JSON.parse(JSON.stringify(o));
function dfPlan(n){ const P = S && S.params && S.params.plans && S.params.plans[n]; return P || DF_DEF[n] || DF_FALLBACK; }
const dfIsCooper = n => dfPlan(n).type === 'cooper';
const dfRuns = n => dfIsCooper(n) ? [] : (dfPlan(n).runs || []);
const dfParam = id => { const p = CFG.parametres.find(x => x.id === id); return p ? paramVal(p) : null; };
function dfEdit(n){
  S.params = S.params || {};
  S.params.plans = dfClone(S.params.plans || {});          // copie : un nouveau cycle ne partage pas ses plans
  if (!S.params.plans[n]) S.params.plans[n] = dfClone(dfPlan(n));
  return S.params.plans[n];
}
const dfPlanSummary = n => { const P = dfPlan(n), T = DF_TYPES[P.type] || DF_TYPES.allure;
  return P.type === 'cooper' ? `${T.ico} ${T.n}` : `${T.ico} ${T.n} · ${dfRuns(n).map(r => r.d + ' m ' + r.p + ' %').join(' · ') || 'aucune course'}`; };

/* ---------- Le nombre d'essais de chaque leçon suit son plan ---------- */
const _dfLesson = lesson;
lesson = function(n){
  const L = _dfLesson(n), P = dfPlan(n), k = P.type === 'cooper' ? 1 : Math.max(1, (P.runs || []).length);
  if (L.tries !== k) L.tries = k;
  if (!L._df) { L._df = 1; if (!L.title) L.title = P.title || ''; if (P.type === 'eval') L.ev = true; }
  return L;
};

/* ---------- Temps ---------- */
const dfT = s => { if (s == null || !isFinite(s)) return '—'; s = Math.round(s); const m = Math.floor(s / 60), r = s % 60; return m ? `${m}'${String(r).padStart(2, '0')}"` : `${r}"`; };
const dfTarget = (run, vma) => vma > 0 && run.p > 0 ? run.d / (vma * run.p / 100 / 3.6) : null;
function dfPassages(run, tgt){
  const piste = dfParam('piste') || 250, out = [];
  if (run.d <= piste) out.push(`mi-course (${run.d / 2} m) : ${dfT(tgt / 2)}`);
  else for (let x = piste; x < run.d - 1; x += piste) out.push(`${x} m : ${dfT(tgt * x / run.d)}`);
  return out.length ? 'Passages à annoncer · ' + out.join(' · ') : '';
}

/* ---------- VMA ---------- */
const DF_VMA = () => fieldById('vma');
const dfCooperLessons = (upTo) => Array.from({ length: upTo }, (_, i) => i + 1).filter(dfIsCooper);
const dfVmaAt = (k, sid) => lessonVal(k, sid, DF_VMA());
function dfVmaRef(n, sid){
  const man = S.params && S.params.vmaMan && S.params.vmaMan[sid];
  if (man) return { v: +man, src: 'fixée par l\'enseignant' };
  for (let k = n - 1; k >= 1; k--) if (dfIsCooper(k)) { const v = dfVmaAt(k, sid); if (v != null && v > 0) return { v, src: 'demi-Cooper L' + k }; }
  return null;
}
/* C = calculs de la leçon n en cours (évite de recalculer la leçon elle-même) */
function dfGain(n, sid, C){
  const L = dfCooperLessons(n).map(k => [k, k === n && C ? C.L.vma : dfVmaAt(k, sid)]).filter(x => x[1] != null && x[1] > 0);
  return L.length >= 2 ? r10(L[L.length - 1][1] - L[0][1], 2) : null;
}

/* ---------- Courses d'une leçon : temps visés, écarts, réussites ---------- */
function dfRunStats(n, sid, C){
  const P = dfPlan(n), runs = dfRuns(n), ref = dfVmaRef(n, sid), tol = dfParam('tol') || 3, f = fieldById('tps');
  const rows = runs.map((run, j) => {
    const real = C ? C.t[j]?.tps ?? null : rawVal(n, sid, f, j), tgt = ref ? dfTarget(run, ref.v) : null;
    if (real == null || tgt == null) return { run, real, tgt, e: null, ok: null };
    const e = (real - tgt) / tgt * 100, ok = P.type === 'bats' ? real <= tgt + 0.005 : Math.abs(e) <= tol + 1e-9;
    return { run, real, tgt, e, ok };
  });
  const done = rows.filter(r => r.real != null).length, cmp = rows.filter(r => r.e != null);
  return { P, ref, rows, k: runs.length, done, ok: cmp.filter(r => r.ok).length, cmp: cmp.length,
    ecart: cmp.length ? avg(cmp.map(r => Math.abs(r.e))) : null, tol };
}
const _dfCalcAll = calcAll;
calcAll = function(n, sid){
  const C = _dfCalcAll(n, sid);
  if (!dfIsCooper(n)) { const R = dfRunStats(n, sid, C); C.L.ecart = R.ecart == null ? null : r10(R.ecart, 2); C.L.ok = R.cmp ? R.ok : null; }
  else { C.L.ecart = null; C.L.ok = null; }
  if (!dfIsCooper(n)) { C.L.dist = null; C.L.vma = null; }   // la VMA ne se mesure qu'aux leçons de test
  C.L.gain = dfGain(n, sid, C);
  return C;
};

/* ---------- Fiche complète : seulement les saisies utiles à la leçon ---------- */
const dfNeed = n => (dfIsCooper(n) ? ['tours', 'metres', 'met'] : ['tps', 'allure', 'posture', 'met']).map(fieldById).filter(f => f && shownF(f));
entryDone = function(n, sid){
  const r = res(n, sid); if (!r) return false;
  const ok = (f, v) => f.type === 'criteres' ? critFull(v) : v != null;
  return dfNeed(n).every(f => f.per === 'try' ? Array.from({ length: tries(n) }, (_, j) => rawVal(n, sid, f, j)).every(v => ok(f, v)) : ok(f, rawVal(n, sid, f)));
};

/* ---------- Fil rouge investissement (règle « fonction » de activite.js) ---------- */
window.DF_frInvest = function(n, sid){
  if (dfIsCooper(n)) { const v = dfVmaAt(n, sid); return v == null ? null : { lv: 3, why: `demi-Cooper fait : VMA ${fmtN(v, 1)} km/h` }; }
  const R = dfRunStats(n, sid, calcAll(n, sid)); if (!R.done) return null;
  if (R.done < R.k) return n === curLesson() ? { lv: null, why: `en cours : ${R.done}/${R.k} courses` } : { lv: R.done / R.k >= .5 ? 2 : 1, why: `${R.done}/${R.k} courses faites` };
  if (!R.cmp) return { lv: null, why: 'pas de VMA de référence' };
  const p = R.ok / R.k * 100;
  return { lv: p >= 75 ? 4 : p >= 50 ? 3 : 2, why: `${R.ok}/${R.k} courses ${R.P.type === 'bats' ? 'battues' : 'réussies'} · écart moyen ${fmtN(R.ecart, 1)} %` };
};

/* =====================================================================
   Saisie d'un élève (remplace viewEntry du socle pour cette appli)
   ===================================================================== */
function dfFieldCard(f, n, sid, C, prev){
  const pv = prev ? lessonVal(prev, sid, f) : null, Lv = C.L[f.id];
  let h = `<div class="card field-card"><div class="fc-head"><h3>${esc(f.label)}${f.unit && f.type !== 'chrono' ? ` <small>(${esc(f.unit)})</small>` : ''}</h3>
    <div class="fc-info">${pv != null ? `<span class="pill">Leçon ${prev} : ${fmtF(f, pv)}</span>` : ''}</div></div>
    ${f.help ? `<div class="muted help">${esc(f.help)}</div>` : ''}${f.ressource ? `<div class="res-row">${resLink(f.ressource)}</div>` : ''}`;
  if (f.type === 'calc') h += `<div class="calc-row"><div class="calc-cell big"><b>${fmtF(f, Lv)}</b></div></div>`;
  else h += `<div class="ctl-grid one ${f.type === 'dial' ? 'dials' : ''}">${ctlHTML(f, rawVal(n, sid, f), null, null)}</div>`;
  if (f.double && isProf() && UI.profUnlocked) h += pevRow(n, sid, f);
  return h + '</div>';
}
function dfBadge(R, row){
  if (row.real == null) return '';
  if (row.tgt == null) return `<div class="df-badge">Temps : <b>${fmtChrono(row.real)}</b></div>`;
  const ds = row.real - row.tgt, pc = `${row.e >= 0 ? '+' : '−'}${fmtN(Math.abs(row.e), 1)} %`, s = `${fmtN(Math.abs(ds), 1)} s`;
  if (R.P.type === 'bats') return row.ok ? `<div class="df-badge ok">🔥 Temps visé battu de ${s} !</div>` : `<div class="df-badge ko">Manqué de ${s} (${pc}) · à la prochaine !</div>`;
  if (row.ok) return `<div class="df-badge ok">✓ Allure tenue : ${ds >= 0 ? '+' : '−'}${s} (${pc})</div>`;
  return ds < 0 ? `<div class="df-badge fast">⚡ Trop rapide de ${s} (${pc}) : pars plus doucement</div>` : `<div class="df-badge ko">🐢 Trop lent de ${s} (${pc}) : accélère dès le départ</div>`;
}
function dfRunCard(n, sid, R, j){
  const row = R.rows[j], run = row.run, f = fieldById('tps');
  return `<div class="card field-card df-run ${row.ok === true ? 'ok' : row.ok === false ? 'ko' : ''}"><div class="fc-head"><h3>Course ${j + 1} · ${run.d} m à ${run.p} % de VMA</h3>
    <div class="fc-info">${row.tgt != null ? `<span class="pill tgt">🎯 ${R.P.type === 'eval' ? 'Temps annoncé' : 'Temps visé'} : ${dfT(row.tgt)}</span>` : '<span class="pill">Pas de VMA : temps visé inconnu</span>'}${run.r ? `<span class="pill">Récup ${run.r} min</span>` : ''}</div></div>
    ${row.tgt != null ? `<div class="muted help">${dfPassages(run, row.tgt)}</div>` : ''}
    <div class="ctl-grid one">${ctlHTML(f, rawVal(n, sid, f, j), j, null)}</div>${dfBadge(R, row)}</div>`;
}
viewEntry = function(){
  const n = curLesson(), sid = UI.sid, a = attOf(n, sid), ro = roleOf(n, sid), C = calcAll(n, sid), P = dfPlan(n), T = DF_TYPES[P.type] || DF_TYPES.allure;
  const prevC = [...Array(n - 1).keys()].map(i => n - 1 - i).find(l => dfIsCooper(l) && dfVmaAt(l, sid) != null);
  let h = `<div class="entry-head">${band(sid)}<div><div class="entry-name">${esc(nameOf(sid))}</div>
    <div class="muted">${a ? `<span class="tag ${ATT[a].cls}">${ATT[a].n}</span> ` : ''}${ro && on('roles') ? `<span class="tag role">${esc(ro.n)}</span> ${esc(ro.d || '')}` : ''}${S.rt === n ? ' <span class="tag rt">🔁 Rattrapage</span>' : ''}</div></div>
    <span id="saved-flag" class="saved"></span></div>`;
  if (FRS.length) h += frStrip(sid);
  h += `<div class="card strong df-type"><b>${T.ico} ${esc(T.n)}</b> <span class="muted">· ${esc(T.d)}</span></div>`;
  if (P.type === 'cooper') {
    const v = C.L.vma, pv = prevC ? dfVmaAt(prevC, sid) : null;
    h += `<div class="card df-vma"><div class="df-vma-big"><small>Ma VMA</small><b>${v == null ? '—' : fmtN(v, 1) + ' km/h'}</b><small>${C.L.dist == null ? 'tours + mètres à saisir' : fmtN(C.L.dist, 0) + ' m en 6 min'}</small></div>
      ${pv != null ? `<div class="df-vma-prev">Leçon ${prevC} : <b>${fmtN(pv, 1)} km/h</b>${v != null ? ` · <b class="${v >= pv ? 'up' : 'down'}">${v >= pv ? '+' : '−'}${fmtN(Math.abs(v - pv), 1)} km/h</b>` : ''}</div>` : ''}
      <div class="muted help">Piste de ${dfParam('piste')} m · VMA = distance ÷ 100</div>${miniChart(DF_VMA(), sid)}</div>`;
    ['tours', 'metres'].forEach(id => h += dfFieldCard(fieldById(id), n, sid, C, null));
  } else {
    const R = dfRunStats(n, sid, C);
    h += `<div class="card df-ref">${R.ref ? `⚡ VMA de référence : <b>${fmtN(R.ref.v, 1)} km/h</b> <span class="muted">(${esc(R.ref.src)})</span>` : '⚠️ <b>Pas de VMA de référence</b> : demi-Cooper manquant. L\'enseignant peut fixer une VMA (Espace enseignant → VMA des élèves).'}
      ${P.type === 'bats' ? '<div class="df-bats">🔥 <b>Bats tes perfs !</b> Fais mieux que ton temps visé sur chaque course.</div>' : P.type === 'eval' ? '<div class="df-bats">📝 <b>Évaluation</b> : cours sans montre, au plus près du temps annoncé.</div>' : `<div class="muted">Course réussie si tu arrives à ± ${fmtN(R.tol, 1)} % du temps visé.</div>`}</div>`;
    R.rows.forEach((_, j) => h += dfRunCard(n, sid, R, j));
    if (R.cmp) h += `<div class="card df-sum"><b>${R.P.type === 'bats' ? '🔥 Temps battus' : '✓ Courses réussies'} : ${R.ok} / ${R.k}</b> · écart moyen ${fmtN(R.ecart, 1)} %</div>`;
    ['allure', 'posture'].forEach(id => { const f = fieldById(id); if (shownF(f)) h += dfFieldCard(f, n, sid, C, null); });
  }
  h += dfFieldCard(fieldById('met'), n, sid, C, null);
  h += obsCard(n, sid);
  if (isProf() && UI.profUnlocked) h += `<div class="card"><h3>📝 Remarque de l'enseignant <small class="muted">(reste sur cette tablette)</small></h3>
    <textarea id="prof-note" rows="2" style="width:100%" placeholder="Comportement, progrès, conseil, blessure…">${esc(noteOf(n, sid))}</textarea>
    <div class="btn-row">${['Très bon investissement', 'Allure bien tenue', 'Part trop vite', 'Manque d\'engagement', 'Bon chronométreur', 'À encourager'].map(t => `<button class="chip small-chip" data-action="quickNote" data-t="${esc(t)}">${esc(t)}</button>`).join('')}</div></div>`;
  const list = sortedStudents().filter(s => ROOT.grp == null || ROOT.grp >= nbGroups() || (s.grp || 0) === ROOT.grp), i = list.findIndex(s => s.id === sid), nx = list[i + 1];
  h += `<div class="btn-row spread entry-foot"><button class="btn" data-action="go" data-view="saisie">▦ Retour aux élèves</button>
    ${nx ? `<button class="btn primary" data-action="entry" data-sid="${nx.id}">${esc(nameOf(nx.id))} ▶</button>` : ''}</div>`;
  return h;
};

/* Tuiles de saisie : VMA et temps visés en rappel */
const _dfViewSaisie = viewSaisie;
viewSaisie = function(){
  const n = curLesson();
  return `<div class="card df-type"><b>${esc(lessonLabel(n))}</b> <span class="muted">· ${esc(dfPlanSummary(n))}</span></div>` +
    _dfViewSaisie().replace(/data-action="entry" data-sid="(\w+)">/g, (m, sid) => { const r = dfIsCooper(n) ? null : dfVmaRef(n, sid);
        return m + (r ? `<span class="df-tile">⚡ ${fmtN(r.v, 1)} km/h</span>` : ''); });
};

/* =====================================================================
   Espace enseignant : plan des courses, VMA des élèves, courses
   ===================================================================== */
PTABS.plan = { n:'Plan des courses', ico:'🗺️' };
PTABS.vma = { n:'VMA des élèves', ico:'⚡' };
PTABS.courses = { n:'Courses et temps visés', ico:'⏱️' };
PSECT[0][1].splice(PSECT[0][1].indexOf('lecons') + 1, 0, 'plan', 'vma');
PSECT[3][1].splice(0, 0, 'courses');
const _dfViewProf = viewProf;
viewProf = () => UI.profTab === 'plan' ? dfProfPlan() : UI.profTab === 'vma' ? dfProfVma() : UI.profTab === 'courses' ? dfProfCourses() : _dfViewProf();

const dfLessonChips = (sel, action) => `<div class="lchips"><b>Leçon</b>${Array.from({ length: S.settings.nbLessons }, (_, i) => i + 1).map(l =>
  `<button class="chip ${l === sel ? 'on' : ''}" data-action="${action}" data-n="${l}">${l} ${DF_TYPES[dfPlan(l).type]?.ico || ''}</button>`).join('')}</div>`;
const dfStep = (j, k, val, unit) => `<div class="stepper df-st"><button class="cbtn" data-action="dfRun" data-j="${j}" data-k="${k}" data-d="-1">−</button>
  <button class="df-val" data-action="dfRunSet" data-j="${j}" data-k="${k}"><b>${val}</b> ${unit}</button><button class="cbtn" data-action="dfRun" data-j="${j}" data-k="${k}" data-d="1">+</button></div>`;

function dfProfPlan(){
  const n = UI.planL || curLesson(), P = dfPlan(n), L = lesson(n), runs = dfRuns(n), custom = !!(S.params && S.params.plans && S.params.plans[n]);
  return `<div class="card">${dfLessonChips(n, 'dfPL')}<p class="muted">Choisissez la forme de chaque leçon et ses courses. Les temps visés de chaque élève sont calculés d'après sa VMA. <b>Renvoyez le QR de la leçon</b> après une modification.</p></div>
    <div class="card strong"><div class="btn-row spread"><h3 style="margin:0">Leçon ${n} · ${esc(L.title || '—')}</h3>
      <div class="btn-row"><button class="btn small" data-action="dfTitle" data-n="${n}">✎ Titre</button>${custom ? `<button class="btn small ghost" data-action="dfReset" data-n="${n}">↺ Plan par défaut</button>` : ''}</div></div>
      <div class="choices df-types">${Object.entries(DF_TYPES).map(([k, T]) => `<button class="ch ${P.type === k ? 'on' : ''}" data-action="dfType" data-t="${k}" ${P.type === k ? 'style="background:var(--navy);border-color:var(--navy);color:#fff"' : ''}>${T.ico} ${esc(T.n)}</button>`).join('')}</div>
      <p class="muted">${esc((DF_TYPES[P.type] || {}).d || '')}${P.type === 'eval' ? ' · leçon comptée dans la note' : ''}</p></div>
    ${P.type === 'cooper' ? `<div class="card"><b>⏱️ Test demi-Cooper</b><p>6 minutes de course. Le chronométreur compte les tours (outil « 🏃 Compteur de tours ») puis saisit les mètres du dernier tour. Piste réglée à <b>${dfParam('piste')} m</b> (Paramètres du cycle).</p></div>` :
    `<div class="card"><h3>Courses prévues (${runs.length})</h3>
      ${runs.map((r, j) => `<div class="df-run-row"><b class="df-n">${j + 1}</b>${dfStep(j, 'd', r.d, 'm')}${dfStep(j, 'p', r.p, '% VMA')}${dfStep(j, 'r', r.r || 0, 'min récup')}
        <button class="btn small ghost" data-action="dfDel" data-j="${j}" title="Retirer">🗑</button></div>`).join('') || '<p class="muted">Aucune course.</p>'}
      <div class="btn-row"><button class="btn primary" data-action="dfAdd">＋ Ajouter une course</button>${runs.length ? '<button class="btn" data-action="dfPrint">🖨 Fiche des temps visés</button>' : ''}</div>
      <p class="muted small">Distance : pas de 50 m · % de VMA : pas de 5 % · touchez une valeur pour la taper.</p></div>
    ${runs.length ? dfTargetsTable(n) : ''}`}`;
}
function dfTargetsTable(n){
  const runs = dfRuns(n);
  return `<div class="card scroll-x"><h3>Temps visés de la leçon ${n}</h3><table class="tbl"><thead><tr><th>Élève</th><th>VMA</th>${runs.map((r, j) => `<th>C${j + 1}<br><small>${r.d} m · ${r.p} %</small></th>`).join('')}</tr></thead><tbody>
    ${sortedStudents().map(s => { const ref = dfVmaRef(n, s.id); return `<tr><td class="nm">${band(s.id)}${esc(nameOf(s.id))}</td><td>${ref ? fmtN(ref.v, 1) : '—'}</td>${runs.map(r => `<td><b>${ref ? dfT(dfTarget(r, ref.v)) : '—'}</b></td>`).join('')}</tr>`; }).join('')}
    </tbody></table></div>`;
}
function dfProfVma(){
  const n = curLesson(), CL = dfCooperLessons(S.settings.nbLessons);
  return `<div class="card"><h3>⚡ VMA des élèves</h3><p class="muted">VMA = distance du demi-Cooper ÷ 100. La VMA de référence d'une leçon est celle du dernier demi-Cooper avant elle.
    « VMA fixée » remplace les tests pour cet élève (absent au test, test non représentatif) : laissez vide sinon.</p></div>
    <div class="card scroll-x"><table class="tbl"><thead><tr><th>Élève</th>${CL.map(k => `<th>L${k}<br><small>${esc(lesson(k).title || 'demi-Cooper')}</small></th>`).join('')}<th>Progrès</th><th>VMA fixée<br><small>km/h</small></th><th>Référence L${n}</th></tr></thead><tbody>
    ${sortedStudents().map(s => { const g = dfGain(S.settings.nbLessons, s.id), ref = dfVmaRef(n, s.id), man = S.params?.vmaMan?.[s.id];
      return `<tr><td class="nm">${band(s.id)}${esc(nameOf(s.id))}</td>${CL.map(k => { const a = attOf(k, s.id), v = dfVmaAt(k, s.id); return `<td>${a && v == null ? `<small>${ATT[a].n}</small>` : v == null ? '—' : `<b>${fmtN(v, 1)}</b><br><small>${fmtN(lessonVal(k, s.id, fieldById('dist')), 0)} m</small>`}</td>`; }).join('')}
        <td>${g == null ? '—' : `<b class="${g >= 0 ? 'up' : 'down'}">${g >= 0 ? '+' : '−'}${fmtN(Math.abs(g), 1)}</b>`}</td>
        <td><input type="number" step="0.1" min="5" max="25" inputmode="decimal" class="df-vma-in" data-sid="${s.id}" value="${man ?? ''}" style="width:90px"></td>
        <td>${ref ? `<b>${fmtN(ref.v, 1)}</b><br><small>${esc(ref.src)}</small>` : '—'}</td></tr>`; }).join('')}</tbody></table></div>`;
}
function dfProfCourses(){
  const n = UI.coursesL || curLesson(), P = dfPlan(n), runs = dfRuns(n);
  let body;
  if (P.type === 'cooper') body = `<table class="tbl"><thead><tr><th>Élève</th><th>Tours</th><th>Mètres</th><th>Distance</th><th>VMA</th><th>Progrès</th></tr></thead><tbody>
    ${sortedStudents().map(s => { const a = attOf(n, s.id), g = dfGain(n, s.id);
      return `<tr><td class="nm">${band(s.id)}${esc(nameOf(s.id))}</td>${isOff(a) ? `<td colspan="5" class="muted">${ATT[a].n}</td>` :
        ['tours', 'metres', 'dist', 'vma'].map(id => `<td>${fmtF(fieldById(id), lessonVal(n, s.id, fieldById(id)))}</td>`).join('') + `<td>${g == null ? '—' : (g >= 0 ? '+' : '−') + fmtN(Math.abs(g), 1) + ' km/h'}</td>`}</tr>`; }).join('')}</tbody></table>`;
  else body = `<table class="tbl"><thead><tr><th>Élève</th><th>VMA</th>${runs.map((r, j) => `<th>C${j + 1}<br><small>${r.d} m · ${r.p} %</small></th>`).join('')}<th>Écart moyen</th><th>${P.type === 'bats' ? 'Battus' : 'Réussies'}</th></tr></thead><tbody>
    ${sortedStudents().map(s => { const a = attOf(n, s.id); if (isOff(a)) return `<tr><td class="nm">${band(s.id)}${esc(nameOf(s.id))}</td><td colspan="${runs.length + 3}" class="muted">${ATT[a].n}</td></tr>`;
      const R = dfRunStats(n, s.id, res(n, s.id) ? calcAll(n, s.id) : null);
      return `<tr><td class="nm"><button class="lnk" data-action="stuDetail" data-sid="${s.id}">${band(s.id)}${esc(nameOf(s.id))}</button></td><td>${R.ref ? fmtN(R.ref.v, 1) : '—'}</td>
        ${R.rows.map(r => `<td class="${r.ok === true ? 'df-ok' : r.ok === false ? (r.e < 0 && P.type !== 'bats' ? 'df-fast' : 'df-ko') : ''}"><b>${r.real == null ? '—' : dfT(r.real)}</b><br><small>🎯 ${dfT(r.tgt)}${r.e != null ? ' · ' + (r.e >= 0 ? '+' : '−') + fmtN(Math.abs(r.e), 1) + ' %' : ''}</small></td>`).join('')}
        <td>${R.ecart == null ? '—' : '<b>' + fmtN(R.ecart, 1) + ' %</b>'}</td><td>${R.cmp ? `${R.ok} / ${R.k}` : '—'}</td></tr>`; }).join('')}</tbody></table>
    <div class="legend"><span class="lg df-ok">✓ réussie</span><span class="lg df-fast">⚡ trop rapide</span><span class="lg df-ko">${P.type === 'bats' ? 'non battue' : '🐢 trop lente'}</span><span class="muted">tolérance ± ${fmtN(dfParam('tol'), 1)} %</span></div>`;
  return `<div class="card">${dfLessonChips(n, 'dfCL')}<b>${esc(lessonLabel(n))}</b> <span class="muted">· ${esc(dfPlanSummary(n))}</span></div><div class="card scroll-x">${body}</div>`;
}

/* Note : le progrès de VMA ne dépend pas de la présence à la leçon d'évaluation */
const _dfGradeValue = gradeValue;
gradeValue = (sid, it) => it.field === 'gain' ? dfGain(S.settings.nbLessons, sid) : _dfGradeValue(sid, it);

/* Paramètres du cycle : le nombre d'essais est remplacé par le plan des courses */
const _dfProfLecons = profLecons;
profLecons = () => _dfProfLecons().replace(/<div class="form-row"><span>Nombre d'essais par élève<\/span>[\s\S]*?<\/div><\/div>/,
  `<div class="form-row"><span>Courses de la leçon</span><button class="btn small" data-action="tab" data-tab="plan">${esc(dfPlanSummary(curLesson()))} ✎</button></div>`);

/* Classe de démonstration : VMA et temps plausibles */
const _dfMakeDemo = makeDemoClass;
makeDemoClass = function(){
  _dfMakeDemo();
  const piste = dfParam('piste') || 250, lvl = {}; S.students.forEach(s => lvl[s.id] = (s.sx === 'F' ? 10.5 : 12) + Math.random() * 4);
  for (let l = 1; l < curLesson(); l++) { S.results[l] = S.results[l] || {};
    S.students.forEach(s => { const r = S.results[l][s.id]; if (!r) return;
      if (dfIsCooper(l)) { delete r.v.allure; delete r.v.posture; const d = Math.round((lvl[s.id] + (l > 1 ? Math.random() : 0)) * 100 / 10) * 10; r.v.tours = Math.floor(d / piste); r.v.metres = d % piste; r.v.tps = [null]; }
      else { delete r.v.tours; delete r.v.metres; const ref = dfVmaRef(l, s.id); r.v.tps = dfRuns(l).map(run => ref ? r10(dfTarget(run, ref.v) * (1 + (Math.random() - .5) * .1), 2) : null); } }); }
  save();
};

/* Fiche imprimable des temps visés */
function dfPrintTargets(n){
  modal(`<h2>${esc(className())} · ${esc(lessonLabel(n))}</h2><p class="muted">${esc(dfPlanSummary(n))} · piste ${dfParam('piste')} m</p>${dfTargetsTable(n)}
    <div class="btn-row spread no-print" style="margin-top:12px"><button class="btn" data-print>🖨 Imprimer</button><button class="btn primary" data-close>Fermer</button></div>`, { wide: true });
  const m = $('#modal-root .modal'); m.querySelector('[data-close]').onclick = closeModal;
  m.querySelector('[data-print]').onclick = () => { document.body.classList.add('print-modal'); window.print(); setTimeout(() => document.body.classList.remove('print-modal'), 500); };
}

/* ---------- Actions ---------- */
const DF_LIM = { d:[50, 5000, 50], p:[50, 130, 5], r:[0, 20, 1] };
const dfChanged = () => { save(); rerender(); toast('✓ Plan enregistré · renvoyez le QR de la leçon'); };
Object.assign(ACT, {
  dfPL: d => { UI.planL = +d.n; rerender(); },
  dfCL: d => { UI.coursesL = +d.n; rerender(); },
  dfType: d => { const n = UI.planL || curLesson(), P = dfEdit(n); P.type = d.t;
    if (d.t !== 'cooper' && !(P.runs && P.runs.length)) P.runs = dfClone(DF_FALLBACK.runs);
    lesson(n).ev = d.t === 'eval'; if (!lesson(n).title || Object.values(DF_TYPES).some(T => T.n === lesson(n).title)) lesson(n).title = DF_TYPES[d.t].n; dfChanged(); },
  dfRun: d => { const n = UI.planL || curLesson(), r = dfEdit(n).runs[+d.j], [lo, hi, st] = DF_LIM[d.k]; r[d.k] = Math.max(lo, Math.min(hi, (r[d.k] || 0) + (+d.d) * st)); dfChanged(); },
  dfRunSet: async d => { const n = UI.planL || curLesson(), [lo, hi] = DF_LIM[d.k], cur = dfPlan(n).runs[+d.j][d.k];
    const v = await numberBox({ d:'Distance (m)', p:'% de VMA', r:'Récupération (min)' }[d.k], cur, { step: 1, min: lo, max: hi }); if (v == null) return;
    dfEdit(n).runs[+d.j][d.k] = Math.round(v); dfChanged(); },
  dfAdd: () => { const n = UI.planL || curLesson(), P = dfEdit(n); P.runs = P.runs || []; P.runs.push(dfClone(P.runs[P.runs.length - 1] || dfR(500, 85, 3))); dfChanged(); },
  dfDel: async d => { const n = UI.planL || curLesson(); if (!(await confirmBox('Retirer la course ' + (+d.j + 1) + ' ?', 'Les temps déjà saisis pour les courses suivantes changent de place.', 'Retirer', true))) return;
    dfEdit(n).runs.splice(+d.j, 1); dfChanged(); },
  dfReset: async d => { const n = +d.n; if (!(await confirmBox('Revenir au plan par défaut ?', 'Leçon ' + n + ' : ' + esc(dfPlanSummary(n)), 'Revenir'))) return;
    S.params.plans = dfClone(S.params.plans || {}); delete S.params.plans[n]; lesson(n).ev = (DF_DEF[n] || DF_FALLBACK).type === 'eval'; dfChanged(); },
  dfTitle: async d => { const n = +d.n, t = await textBox('Titre de la leçon ' + n, lesson(n).title); if (t == null) return; lesson(n).title = t; save(); rerender(); },
  dfPrint: () => dfPrintTargets(UI.planL || curLesson()),
});
document.addEventListener('change', e => {
  if (!e.target.classList || !e.target.classList.contains('df-vma-in')) return;
  const v = parseFloat(String(e.target.value).replace(',', '.')), sid = e.target.dataset.sid;
  S.params = S.params || {}; S.params.vmaMan = { ...(S.params.vmaMan || {}) };
  if (isFinite(v) && v > 0) S.params.vmaMan[sid] = r10(v, 1); else delete S.params.vmaMan[sid];
  save(); rerender(); toast('✓ VMA enregistrée · renvoyez le QR de la leçon');
});

/* ---------- Styles propres à l'appli ---------- */
document.head.insertAdjacentHTML('beforeend', `<style>
.df-type{display:flex;flex-wrap:wrap;gap:6px;align-items:baseline}
.df-ref{font-size:19px}.df-ref .df-bats{margin-top:8px;font-size:20px}
.df-run.ok{border-color:#1E8E3E}.df-run.ko{border-color:#F07000}
.df-badge{margin-top:10px;padding:10px 14px;border-radius:12px;font-weight:800;background:#EEF1F6}
.df-badge.ok{background:#1E8E3E;color:#fff}.df-badge.ko{background:#F07000;color:#fff}.df-badge.fast{background:#FFD000;color:#0A1633}
.df-sum{font-size:20px;border-color:var(--navy)}
.df-vma{display:flex;flex-wrap:wrap;gap:18px;align-items:center}
.df-vma-big{display:flex;flex-direction:column;align-items:center;background:var(--navy);color:#fff;border-radius:16px;padding:10px 22px;min-width:180px}
.df-vma-big b{font-size:38px;line-height:1.1}.df-vma-prev{font-size:19px}
.up{color:#1E8E3E}.down{color:#D0161B}
.df-tile{display:block;font-size:14px;font-weight:800;color:var(--navy)}
.df-run-row{display:flex;flex-wrap:wrap;gap:10px;align-items:center;padding:8px 0;border-top:1px solid #E6EBF3}
.df-n{width:34px;height:34px;border-radius:50%;background:var(--navy);color:#fff;display:inline-flex;align-items:center;justify-content:center}
.df-val{border:0;background:none;font:inherit;padding:0 8px;min-width:110px;color:var(--ink)}
.df-types{margin:10px 0}
td.df-ok,.lg.df-ok{background:#1E8E3E;color:#fff}td.df-ko,.lg.df-ko{background:#F07000;color:#fff}td.df-fast,.lg.df-fast{background:#FFD000;color:#0A1633}
</style>`);
