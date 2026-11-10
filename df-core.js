/* =====================================================================
   DEMI-FOND N'EPS — noyau (chargé après socle.js et outils.js)
   · piste circulaire ou couloir (aller-retour), longueur réglable
   · programmation du cycle : chaque leçon = 1 à 4 exercices
   · données d'un exercice : res(n, sid).v.x[i] (fusion exercice par exercice)
   · VMA de référence, état de forme (−10 %), piliers, abandons
   ===================================================================== */
'use strict';

/* ---------- Types d'exercices ---------- */
const DFX = {
  cooper:{ n:'Test VMA', ico:'⏱️', c:'#0B346E' },
  bats:{ n:'Bats tes perfs', ico:'🔥', c:'#D0161B' },
  aventuriers:{ n:'Les Aventuriers du …', ico:'🗺️', c:'#1FA24A' },
  equipe:{ n:'Course d\'équipe', ico:'🤝', c:'#8A2BE2' },
  pelotons:{ n:'Course en pelotons', ico:'🐇', c:'#F7941D' },
  fc:{ n:'Fractionné court', ico:'⚡', c:'#0088E8' },
  fl:{ n:'Fractionné long', ico:'🔁', c:'#00897B' },
  eval:{ n:'Évaluation 3 × 500 m', ico:'📝', c:'#B5514C' },
};
const DF_TEST = t => t === 'cooper' || t === 'bats';
const DF_FRAC = t => t === 'fc' || t === 'fl';
const DF_TEAM = t => t === 'equipe' || t === 'aventuriers';

/* Formes de travail proposées pour les fractionnés */
const DF_FORMES = {
  fc:[
    { n:'30/30', mode:'temps', val:30, pct:100, rec:{ type:'passive', unite:'temps', val:30 }, series:2, reps:6, recS:180 },
    { n:'15/15', mode:'temps', val:15, pct:110, rec:{ type:'passive', unite:'temps', val:15 }, series:2, reps:8, recS:180 },
    { n:'45/30', mode:'temps', val:45, pct:95, rec:{ type:'active', unite:'temps', val:30 }, series:2, reps:5, recS:180 },
    { n:'8 × 200 m', mode:'dist', val:200, pct:100, rec:{ type:'active', unite:'temps', val:45 }, series:1, reps:8, recS:0 },
    { n:'Pyramide 15-30-45-30-15 s', mode:'temps', steps:[15, 30, 45, 30, 15], pct:105, rec:{ type:'passive', unite:'temps', val:30 }, series:2, reps:5, recS:180 },
    { n:'Pyramide 200-300-400-300-200 m', mode:'dist', steps:[200, 300, 400, 300, 200], pct:95, rec:{ type:'active', unite:'dist', val:100 }, series:1, reps:5, recS:0 },
  ],
  fl:[
    { n:'4 × 3 min', mode:'temps', val:180, pct:85, rec:{ type:'active', unite:'temps', val:90 }, series:1, reps:4, recS:0 },
    { n:'3 × 1000 m', mode:'dist', val:1000, pct:85, rec:{ type:'active', unite:'temps', val:120 }, series:1, reps:3, recS:0 },
    { n:'2 × (3 × 2 min)', mode:'temps', val:120, pct:90, rec:{ type:'active', unite:'temps', val:60 }, series:2, reps:3, recS:180 },
    { n:'5 × 600 m', mode:'dist', val:600, pct:90, rec:{ type:'active', unite:'dist', val:200 }, series:1, reps:5, recS:0 },
    { n:'Pyramide 1-2-3-2-1 min', mode:'temps', steps:[60, 120, 180, 120, 60], pct:90, rec:{ type:'active', unite:'temps', val:60 }, series:1, reps:5, recS:0 },
  ],
};
function dfxDefault(t){
  const b = { t };
  if (DF_TEST(t)) return { ...b, dur:360, proto:'cooper', v0:8 };
  if (t === 'aventuriers') return { ...b, dur:30, taille:2, form:'alea', attr:'alea', nbParc:3, coefTri:0.9, tabs:2, plat:'loire' };
  if (t === 'equipe') return { ...b, dur:12, nbEq:4, form:'equi', tabs:1, pauses:false };
  if (t === 'pelotons') return { ...b, d:500, nb:3, ns:3, rec:5 };
  if (t === 'eval') return { ...b, d:500, nb:3, rec:10 };
  if (DF_FRAC(t)) { const f = dfClone(DF_FORMES[t][0]); return { ...b, forme:f.n, ...f, pil:'fin' }; }
  return b;
}
const dfClone = o => JSON.parse(JSON.stringify(o));

/* ---------- Cycle par défaut (8 leçons) ---------- */
const DF_DEF = {
  1:{ title:'Test VMA et course d\'équipe', ex:['cooper', 'equipe'], pil:['effort'] },
  2:{ title:'Fractionné court et Aventuriers du …', ex:['fc', 'aventuriers'], pil:['foulee'] },
  3:{ title:'Bats tes perfs et pelotons', ex:['bats', 'pelotons'], pil:['effort'] },
  4:{ title:'Fractionné long et Aventuriers du …', ex:['fl', 'aventuriers'], pil:['posture'] },
  5:{ title:'Pyramide et course d\'équipe', ex:[['fc', 4], 'equipe'], pil:['bras'] },
  6:{ title:'Fractionné long et pelotons', ex:[['fl', 1], 'pelotons'], pil:['regard'] },
  7:{ title:'Préparer l\'évaluation', ex:[['fc', 3], 'pelotons'], pil:['effort'] },
  8:{ title:'Évaluation 3 × 500 m', ex:['eval'], pil:['foulee', 'posture', 'bras', 'regard', 'effort'] },
};
function dfDefLesson(n){
  const D = DF_DEF[n] || { title:'', ex:['fc'] };
  return { title: D.title, pil: D.pil ? [...D.pil] : DF_PIL.map(p => p.id), ex: D.ex.map(e => { const [t, f] = Array.isArray(e) ? e : [e, null]; const x = dfxDefault(t);
    if (f != null && DF_FRAC(t)) Object.assign(x, dfClone(DF_FORMES[t][f]), { forme: DF_FORMES[t][f].n }); return x; }) };
}
const DF_DEFC = {};
function dfCyc(n){ const C = S && S.params && S.params.cyc && S.params.cyc[n]; if (C) return C; return DF_DEFC[n] = DF_DEFC[n] || dfDefLesson(n); }
const dfExs = n => dfCyc(n).ex || [];
const dfEx = (n, i) => dfExs(n)[i] || null;
function dfEditL(n){
  S.params = S.params || {}; S.params.cyc = dfClone(S.params.cyc || {});
  if (!S.params.cyc[n]) S.params.cyc[n] = dfClone(dfCyc(n));
  return S.params.cyc[n];
}

/* ---------- Piste ---------- */
const dfPiste = () => ({ mode: (S.params && S.params.pm) || 'circ', L: +((S.params && S.params.pL) || 250) });
const dfLap = () => { const P = dfPiste(); return P.mode === 'couloir' ? 2 * P.L : P.L; };
const dfLapMin = () => dfLap() / (26 / 3.6);                 // tour impossible en moins de ce temps (26 km/h)
const dfTol = () => +((S.params && S.params.tol) || 3);
/* espacement des plots du demi-Cooper : 50 m = 0,5 km/h de VMA */
function dfPlotStep(){ const P = dfPiste(), base = P.mode === 'couloir' ? P.L : dfLap(); return base / Math.max(1, Math.round(base / 50)); }   // couloir : les mêmes plots servent à l'aller et au retour
function dfPlots(){
  const P = dfPiste(), lap = dfLap(), s = dfPlotStep(), out = [];
  for (let d = 0; d < lap - 0.01; d += s) {
    const dd = Math.round(d * 10) / 10;
    if (P.mode === 'couloir') out.push({ d: dd, l: Math.abs(dd - P.L) < 0.05 ? `Demi-tour · ${fmtN(dd, 0)} m` : dd < P.L ? `Aller · plot ${fmtN(dd, 0)} m` : `Retour · plot ${fmtN(2 * P.L - dd, 0)} m (${fmtN(dd, 0)})` });
    else out.push({ d: dd, l: `Plot ${out.length} · ${fmtN(dd, 0)} m` });
  }
  return out;
}

/* ---------- Temps et vitesses ---------- */
const dfT = s => { if (s == null || !isFinite(s)) return '—'; const neg = s < 0; s = Math.round(Math.abs(s)); const m = Math.floor(s / 60), r = s % 60; return (neg ? '−' : '') + (m ? `${m}'${String(r).padStart(2, '0')}"` : `${r}"`); };
const dfTc = s => s == null || !isFinite(s) ? '—' : fmtChrono(s);
const dfTime = (d, vma, pct) => vma > 0 && pct > 0 ? d / (vma * pct / 100 / 3.6) : null;       // s
const dfDist = (s, vma, pct) => vma > 0 && pct > 0 ? s * vma * pct / 100 / 3.6 : null;        // m
const dfPctOf = (d, t, vma) => vma > 0 && t > 0 ? (d / t * 3.6) / vma * 100 : null;
const dfKm = d => d == null ? '—' : d >= 1000 ? fmtN(d / 1000, 2) + ' km' : fmtN(d, 0) + ' m';

/* ---------- Données d'un exercice ---------- */
const dfX = (n, sid, i) => res(n, sid)?.v?.x?.[i] || null;
function dfSetX(n, sid, i, fn){ setRes(n, sid, r => { r.v.x = r.v.x || {}; const o = r.v.x[i] = r.v.x[i] || {}; fn(o); o.ts = now(); }); }
const dfPresent = (n, sid) => !isOff(attOf(n, sid));
const dfGroupList = () => sortedStudents().filter(s => ROOT.grp == null || ROOT.grp >= nbGroups() || (s.grp || 0) === ROOT.grp);

/* fusion des saisies : exercice par exercice (plusieurs tablettes pour un même élève) */
mergeRes = function(R){
  let n = 0;
  Object.entries(R || {}).forEach(([l, byS]) => Object.entries(byS || {}).forEach(([sid, r]) => {
    S.results[l] = S.results[l] || {}; const cur = S.results[l][sid];
    if (!cur) S.results[l][sid] = r;
    else {
      const nw = (r.ts || 0) > (cur.ts || 0), a = nw ? cur : r, b = nw ? r : cur;
      const m = { ...a, ...b, v: { ...a.v, ...b.v } }, X = { ...((cur.v || {}).x || {}) };
      Object.entries((r.v || {}).x || {}).forEach(([i, o]) => { if (!X[i] || (o.ts || 0) > (X[i].ts || 0)) X[i] = o; });
      m.v.x = X; m.ts = Math.max(r.ts || 0, cur.ts || 0); S.results[l][sid] = m;
    }
    n++; if (lesson(l).att[sid] === 1) delete lesson(l).att[sid];
  }));
  return n;
};

/* QR de la leçon : seulement le plan de la leçon envoyée */
const _dfBuildSeance = buildSeance;
buildSeance = function(n, ids){
  const p = _dfBuildSeance(n, ids), k = n || curLesson(), pa = { ...(p.pa || {}) };
  pa.cyc = { [k]: dfCyc(k) }; if (pa.fo) pa.fo = { [k]: pa.fo[k] || [] };
  p.pa = pa; return p;
};

/* ---------- VMA ---------- */
function dfTestVma(n, sid, i){ const x = dfX(n, sid, i); if (!x || x.ab) return null; if (x.vv != null) return x.vv; const d = dfTestDist(x); return d == null ? null : r10(d / 100, 2); }
/* demi-Cooper : numéro du plot d'arrêt (plots numérotés en continu tous les dfPlotStep() m) */
function dfTestPn(x){ return x && x.pn != null ? x.pn : null; }
function dfTestDist(x){ if (x && x.vv != null) return dfVamDist(x.vv, x.v0 || 8); const k = dfTestPn(x); return k == null ? null : k * dfPlotStep(); }
const dfTestDone = x => !!x && (x.pn != null || x.vv != null);
/* ---------- VAMEVAL : paliers d'1 min, +0,5 km/h, un bip à chaque plot (≈ 20 m) ---------- */
const DF_PROTO = {
  cooper:{ n:'Demi-Cooper', ico:'⏱️', d:'6 minutes de course : on court la plus grande distance possible. VMA = distance ÷ 100.' },
  vameval:{ n:'VAMEVAL', ico:'📶', d:'Test progressif : la vitesse augmente de 0,5 km/h chaque minute, imposée par des bips (un plot à chaque bip). VMA = vitesse du dernier palier terminé.' },
};
const dfProto = e => (e && e.proto === 'vameval') ? 'vameval' : 'cooper';
const dfVamStep = () => { const P = dfPiste(), base = P.mode === 'couloir' ? P.L : dfLap(); return base / Math.max(1, Math.round(base / 20)); };
const dfVamV = (k, v0) => (v0 || 8) + 0.5 * k;                                   // vitesse du palier k (0 = premier)
function dfVamAt(t, v0){ const k = Math.max(0, Math.floor(t / 60)), inP = t - k * 60; let d = 0; for (let j = 0; j < k; j++) d += dfVamV(j, v0) / 3.6 * 60; d += dfVamV(k, v0) / 3.6 * inP; return { k, v: dfVamV(k, v0), inP, d, done: k > 0 ? dfVamV(k - 1, v0) : null }; }
function dfVamDist(vv, v0){ let d = 0; for (let v = v0 || 8; v <= vv + 0.01; v += 0.5) d += v / 3.6 * 60; return Math.round(d); }
function dfVmaRef(n, sid, i){
  const man = S.params && S.params.vmaMan && S.params.vmaMan[sid];
  if (man) return { v: +man, src: 'fixée par l\'enseignant' };
  if (i != null) for (let j = i - 1; j >= 0; j--) { const e = dfEx(n, j); if (e && DF_TEST(e.t)) { const v = dfTestVma(n, sid, j); if (v) return { v, src: `${DFX[e.t].n} (cette leçon)` }; } }
  for (let k = n - 1; k >= 1; k--) { const v = lessonVal(k, sid, fieldById('vma')); if (v != null && v > 0) return { v, src: 'test de la leçon ' + k }; }
  return null;
}
/* petite forme (−10 % de VMA) : déclarée à l'appel par l'enseignant, ou sur la tablette (saisie de l'élève) */
function dfForme(n, sid){ const f = res(n, sid)?.v?.fo; if (f != null) return !!f; return ((S.params && S.params.fo && S.params.fo[n]) || []).includes(sid); }

/* ---------- Piliers ---------- */
const DF_PIL = [
  { id:'foulee', n:'Foulée', mode:'desc',
    crit:['Pose du pied sous le corps (pas loin devant)', 'Foulée ample et fréquente', 'Talon qui remonte vers la fesse', 'Course légère, sans bruit de freinage'],
    desc:[ { l:'Foulée courte, pieds qui traînent', v:1 }, { l:'Peu d\'amplitude, attaque talon marquée', v:2 }, { l:'Foulée qui s\'allonge, quelques freinages', v:3 }, { l:'Ample et fréquente, accélération du pied', v:4 } ] },
  { id:'posture', n:'Posture verticale', mode:'desc',
    crit:['Buste droit, légèrement penché vers l\'avant', 'Bassin haut, gainé (pas « assis »)', 'Pas de cassure aux hanches', 'Épaules basses et relâchées'],
    desc:[ { l:'Assis, cassé aux hanches', v:1 }, { l:'Penché en arrière ou trop en avant', v:2 }, { l:'Droit mais se tasse en fin de course', v:3 }, { l:'Grand et gainé du début à la fin', v:4 } ] },
  { id:'bras', n:'Utilisation des bras', mode:'desc',
    crit:['Coudes à 90°', 'Bras d\'avant en arrière, sans croiser devant', 'Mains et épaules relâchées', 'Bras qui relancent dans les accélérations'],
    desc:[ { l:'Bras peu utilisés, ballants', v:1 }, { l:'Bras réflexes mais pas moteurs', v:2 }, { l:'Bras utilisés surtout en fin de course', v:3 }, { l:'Bras moteurs, rythmés, tout au long', v:4 } ] },
  { id:'regard', n:'Regard devant', mode:'desc',
    crit:['Regard 10 à 15 m devant', 'Tête dans l\'axe du corps', 'Visage et mâchoire relâchés'],
    desc:[ { l:'Vers le bas', v:1 }, { l:'Tire la tête', v:2 }, { l:'En face', v:4 } ] },
  { id:'effort', n:'Gestion de l\'effort', mode:'desc',
    crit:['Départ contrôlé', 'Même allure du début à la fin', 'Respiration maîtrisée à l\'arrivée'],
    desc:[ { l:'Se dégrade en milieu de course', v:1 }, { l:'Se dégrade en fin de course', v:2 }, { l:'Régulier', v:4 } ] },
];
const dfPilMode = p => (S.params && S.params.pilMode && S.params.pilMode[p.id]) || p.mode;
/* score d'un pilier, de 0 à 1 */
function dfPilScore(p, v){
  if (v == null) return null; const m = dfPilMode(p);
  if (m === 'on') { if (!Array.isArray(v)) return null; const o = v.filter(x => x != null); return o.length ? o.filter(Boolean).length / o.length : null; }
  if (m === 'ech') return typeof v === 'number' ? (v - 1) / 9 : null;
  if (typeof v !== 'number') return null; const mx = Math.max(...p.desc.map(d => d.v)); return v / mx;
}
function dfPilMean(o){ if (!o) return null; const a = vals(DF_PIL.map(p => dfPilScore(p, o[p.id]))); return a.length ? avg(a) : null; }
/* formulaire d'un pilier (data-action = action ; attrs = data-… communs) */
/* piliers observés pendant la leçon n (réglés dans la Programmation des leçons) */
function dfLessonPil(n){ const a = dfCyc(n).pil; return a && a.length ? a : DF_PIL.map(p => p.id); }
const dfPilNames = ids => ids.map(id => (DF_PIL.find(p => p.id === id) || {}).n).filter(Boolean).join(', ');
function dfPilForm(o, action, attrs, ids){
  o = o || {};
  return DF_PIL.filter(p => !ids || ids.includes(p.id)).map(p => { const m = dfPilMode(p), v = o[p.id];
    let ctl = '';
    if (m === 'on') ctl = p.crit.map((c, k) => { const x = Array.isArray(v) ? v[k] : null;
      return `<div class="crit-row"><span class="crit-c">${esc(c)}</span><button class="cr-b ok ${x === 1 ? 'on' : ''}" data-action="${action}" ${attrs} data-p="${p.id}" data-k="${k}" data-v="1">✓</button><button class="cr-b ko ${x === 0 ? 'on' : ''}" data-action="${action}" ${attrs} data-p="${p.id}" data-k="${k}" data-v="0">✗</button></div>`; }).join('');
    else if (m === 'ech') ctl = `<div class="scale">${Array.from({ length:10 }, (_, k) => k + 1).map(x => { const c = SCALE10[x - 1], on_ = v === x;
      return `<button class="sc ${on_ ? 'on' : ''}" data-action="${action}" ${attrs} data-p="${p.id}" data-v="${x}" style="${on_ ? `background:${c};color:${darkTxt(c) ? '#0A1633' : '#fff'}` : `border-color:${c}`}"><b>${x}</b></button>`; }).join('')}</div>`;
    else { const mx = Math.max(...p.desc.map(d => d.v)); ctl = `<div class="choices">${p.desc.map(d => { const c = d.v === mx ? '#1E8E3E' : d.v >= mx * .7 ? '#86DC96' : d.v >= mx * .45 ? '#F07000' : '#D0161B', on_ = v === d.v;
      return `<button class="ch ${on_ ? 'on' : ''}" data-action="${action}" ${attrs} data-p="${p.id}" data-v="${d.v}" style="${on_ ? `background:${c};border-color:${c};color:${darkTxt(c) ? '#0A1633' : '#fff'}` : `border-color:${c}`}">${esc(d.l)}</button>`; }).join('')}</div>`; }
    return `<div class="df-pil"><h4>${esc(p.n)}</h4>${ctl}</div>`; }).join('');
}
/* applique un clic du formulaire à l'objet piliers */
function dfPilApply(o, d){
  const p = DF_PIL.find(x => x.id === d.p); if (!p) return o; o = o || {};
  if (dfPilMode(p) === 'on') { const a = Array.isArray(o[p.id]) ? [...o[p.id]] : p.crit.map(() => null); const k = +d.k, v = +d.v; a[k] = a[k] === v ? null : v; o[p.id] = a; }
  else { const v = +d.v; o[p.id] = o[p.id] === v ? null : v; if (o[p.id] == null) delete o[p.id]; }
  return o;
}

/* ---------- Synthèse d'une leçon (saisies calculées du socle) ---------- */
function dfExDist(n, sid, i){
  const e = dfEx(n, i), x = dfX(n, sid, i); if (!e || !x) return null; const lap = dfLap();
  if (DF_TEST(e.t)) return dfTestDist(x);
  if (e.t === 'equipe') return (x.laps || []).length * lap;
  if (e.t === 'aventuriers') return dfAvSegs(e, x.buys) * dfSegM(e);
  if (e.t === 'pelotons' || e.t === 'eval') return (x.c || []).filter(c => c && c.t).length * e.d;
  if (DF_FRAC(e.t)) { const ref = dfVmaRef(n, sid, i); let d = 0; (x.r || []).forEach(row => (row || []).forEach((v, k) => { if (v != null && v > 0) d += dfRepDist(e, k, ref ? ref.v : null, dfForme(n, sid)) || 0; })); return d; }
  return null;
}
function dfFracCells(x){ const a = []; (x && x.r || []).forEach(row => (row || []).forEach(v => { if (v != null) a.push(v); })); return a; }
const _dfCalcAll = calcAll;
calcAll = function(n, sid){
  const C = _dfCalcAll(n, sid), E = dfExs(n);
  let vma = null, dist = 0, hasD = false, cib = [], pil = [], ab = 0;
  E.forEach((e, i) => { const x = dfX(n, sid, i); if (!x) return;
    if (x.ab) ab++;
    if (DF_TEST(e.t)) { const v = dfTestVma(n, sid, i); if (v != null) vma = v; }
    const d = dfExDist(n, sid, i); if (d != null) { dist += d; hasD = true; }
    if (DF_FRAC(e.t)) dfFracCells(x).forEach(v => cib.push(v / 2));
    Object.values(x.pil || {}).forEach(o => { const m = dfPilMean(o); if (m != null) pil.push(m); }); });
  C.L.vma = vma; C.L.dist = hasD ? dist : null; C.L.cibles = cib.length ? Math.round(avg(cib) * 100) : null;
  C.L.pil = pil.length ? Math.round(avg(pil) * 100) : null; C.L.ab = res(n, sid) ? ab : null;
  return C;
};
entryDone = function(n, sid){ const E = dfExs(n); return E.length > 0 && E.every((e, i) => { const x = dfX(n, sid, i); return x && (x.ab || dfExDone(n, sid, i)); }); };
function dfExDone(n, sid, i){
  const e = dfEx(n, i), x = dfX(n, sid, i); if (!e || !x) return false;
  if (DF_TEST(e.t)) return dfTestDone(x);
  if (e.t === 'equipe') return (x.laps || []).length > 0;
  if (e.t === 'aventuriers') return (x.buys || []).length > 0;
  if (e.t === 'pelotons' || e.t === 'eval') return (x.c || []).filter(c => c && c.t).length >= e.nb;
  if (DF_FRAC(e.t)) return dfFracCells(x).length >= dfRepCount(e);
  return false;
}

/* ---------- Fractionné : répétitions ---------- */
const dfReps = e => e.steps && e.steps.length ? e.steps : Array.from({ length: e.reps || 1 }, () => e.val);
const dfRepCount = e => dfReps(e).length * (e.series || 1);
function dfRepDist(e, k, vma, forme){ const v = dfReps(e)[k]; if (v == null) return null; const pct = e.pct - (forme ? 10 : 0);
  return e.mode === 'dist' ? v : dfDist(v, vma, pct); }
function dfRepTarget(e, k, vma, forme){ const v = dfReps(e)[k], pct = e.pct - (forme ? 10 : 0);
  if (e.mode === 'dist') return { txt: `${fmtN(v, 0)} m en ${dfT(dfTime(v, vma, pct))}`, d: v, t: dfTime(v, vma, pct) };
  const d = dfDist(v, vma, pct); return { txt: `${dfT(v)} → ${d == null ? '—' : fmtN(Math.round(d / 5) * 5, 0) + ' m'}`, d, t: v }; }
const dfRecTxt = e => `${e.rec.type === 'active' ? 'Récup active' : 'Récup passive'} ${e.rec.unite === 'dist' ? fmtN(e.rec.val, 0) + ' m' : dfT(e.rec.val)}`;
function dfFracSummary(e){
  const R = dfReps(e), u = e.mode === 'dist' ? (v => fmtN(v, 0) + ' m') : dfT;
  const body = e.steps && e.steps.length ? 'pyramide ' + R.map(u).join('-') : `${R.length} × ${u(e.val)}`;
  return `${e.series > 1 ? e.series + ' séries de ' : ''}${body} à ${e.pct} % VMA · ${dfRecTxt(e)}${e.series > 1 && e.recS ? ' · ' + dfT(e.recS) + ' entre séries' : ''}`;
}
function dfExSummary(e){
  if (!e) return '';
  if (DF_TEST(e.t)) return dfProto(e) === 'vameval' ? `VAMEVAL · départ ${fmtN(e.v0 || 8, 1)} km/h, +0,5 km/h par minute · plots tous les ${fmtN(dfVamStep(), 1)} m` : `Demi-Cooper · 6 min · plots tous les ${fmtN(dfPlotStep(), 0)} m`;
  if (e.t === 'aventuriers') return `${dfBoardName(e)} · ${e.dur} min · ${e.taille === 3 ? 'trinômes' : 'binômes'} · ${e.nbParc} parcours · 1 tronçon = ${dfSegM(e)} m`;
  if (e.t === 'equipe') return `${e.dur} min · ${e.nbEq} équipes · ${e.tabs} tablette(s)`;
  if (e.t === 'pelotons') return `${e.nb} × ${e.d} m · ${e.ns} séries`;
  if (e.t === 'eval') return `${e.nb} × ${e.d} m · récup ${e.rec} min`;
  if (DF_FRAC(e.t)) return dfFracSummary(e);
  return '';
}
const dfLessonSummary = n => dfExs(n).map(e => `${DFX[e.t].ico} ${DFX[e.t].n}`).join(' + ') || 'aucun exercice';

/* ---------- Le nombre d'essais du socle n'est plus utilisé : 1 ---------- */
const _dfLesson = lesson;
lesson = function(n){ const L = _dfLesson(n); if (L.tries !== 1) L.tries = 1;
  if (!L._df) { L._df = 2; if (!L.title) L.title = dfCyc(n).title || ''; if (dfExs(n).some(e => e.t === 'eval')) L.ev = true; } return L; };

/* ---------- Comptes à rebours partagés (continuent quand on change d'écran) ---------- */
const DFT = {};
/* affichage d'un compte à rebours : « 5 min 07 s » (et pas 5:07, lu comme une heure) */
const dfMS = s => { s = Math.max(0, Math.ceil(s)); const m = Math.floor(s / 60), r = s % 60; return m ? `${m} min ${String(r).padStart(2, '0')} s` : `${r} s`; };
function dfTimer(key){ return DFT[key] = DFT[key] || { run:false, t0:0, acc:0, phases:null, ended:false }; }
const dfTNow = T => T.run ? (performance.now() / 1000 - T.t0) + T.acc : T.acc;
function dfTimerState(T){ let t = dfTNow(T); const P = T.phases || []; for (let k = 0; k < P.length; k++) { if (t < P[k].s) return { k, name: P[k].n, left: P[k].s - t, el: dfTNow(T) }; t -= P[k].s; } return { k: P.length, name: 'Terminé', left: 0, el: dfTNow(T) }; }
function dfTimerHTML(key, phases, opts = {}){
  const T = dfTimer(key); T.phases = phases; const st = dfTimerState(T);
  const sty = opts.color && st.left > 0 ? ` style="background:${opts.color}"` : '';
  return `<div class="df-timer ${T.run ? 'run' : ''} ${st.left <= 0 ? 'end' : ''}" data-dft="${key}"${sty}><div><small data-dft-ph>${esc(st.name)}</small><b data-dft-t>${dfMS(st.left)}</b></div>
    <div class="btn-row">${T.run ? `<button class="btn red" data-action="dfTm" data-key="${key}" data-a="stop">⏸ Pause</button>` : `<button class="btn green" data-action="dfTm" data-key="${key}" data-a="go">▶ ${T.acc ? 'Reprendre' : 'Départ'}</button>`}
    <button class="btn ghost" data-action="dfTm" data-key="${key}" data-a="reset">↺</button>${opts.extra || ''}</div></div>`;
}
setInterval(() => {
  Object.entries(DFT).forEach(([key, T]) => { if (!T.run || !T.phases) return;
    const st = dfTimerState(T); if (T._k != null && st.k !== T._k) { beepEnd(); if (st.k >= T.phases.length) { T.run = false; T.acc = dfTNow(T); keepAwake(false); } if (UI.view === 'dfx') rerender(); }
    T._k = st.k; const c = Math.ceil(st.left); if (!T.quiet && T._c !== c && c <= 3 && c > 0) beepShort(); T._c = c;
    if (T.onTick) T.onTick(T);
    const el = document.querySelector(`[data-dft="${key}"]`); if (el) { const tt = el.querySelector('[data-dft-t]'), ph = el.querySelector('[data-dft-ph]'); if (tt) tt.textContent = dfMS(st.left); if (ph) ph.textContent = st.name; } });
}, 100);

/* ---------- Rendu des écrans d'exercice ---------- */
const DF_VIEWS = {};      // t → { view(n, i, e), bind?(n, i, e) }
const _dfRender = render;
render = function(){
  if (UI.view === 'dfx' && ROOT.role && S.students.length) {
    stopScan(); const n = curLesson(), i = UI.ex, e = dfEx(n, i);
    if (!e) { UI.view = 'saisie'; return _dfRender(); }
    setTop(`${DFX[e.t].ico} ${e.t === 'aventuriers' ? dfBoardName(e) : DF_TEST(e.t) ? DFX[e.t].n + ' · ' + DF_PROTO[dfProto(e)].n : DFX[e.t].n}`, `${className()} · Leçon ${n} · exercice ${i + 1}`, `<button class="btn small" data-action="go" data-view="saisie">▦ Leçon</button>`);
    const V = DF_VIEWS[e.t]; $('#main').innerHTML = `<div class="df-exhead card"><div><b>${esc(dfExSummary(e))}</b>${DF_FRAC(e.t) || e.t === 'eval' ? `<br><span class="df-pilfocus">🎯 Pilier${dfLessonPil(n).length > 1 ? 's' : ''} observé${dfLessonPil(n).length > 1 ? 's' : ''} : ${esc(dfPilNames(dfLessonPil(n)))}</span>` : ''}</div><button class="btn small" data-action="dfFiche" data-t="${e.t}" data-n="${n}" data-i="${i}">📖 Fiche</button></div>` + (V ? V.view(n, i, e) : '');
    if (V && V.bind) V.bind(n, i, e); return;
  }
  _dfRender();
};
/* accueil de la saisie : les exercices de la leçon, puis les fiches élèves */
const _dfViewSaisie = viewSaisie;
viewSaisie = function(){
  const n = curLesson(), E = dfExs(n);
  return `<div class="card strong"><h3 style="margin:0 0 8px">${esc(lessonLabel(n))}</h3><p class="df-pilfocus">🎯 Pilier${dfLessonPil(n).length > 1 ? 's' : ''} de la leçon : ${esc(dfPilNames(dfLessonPil(n)))}</p><div class="df-exgrid">${E.map((e, i) => `<button class="df-exbtn" style="--xc:${DFX[e.t].c}" data-action="dfOpen" data-i="${i}">
      <span class="ico">${DFX[e.t].ico}</span><b>${i + 1}. ${esc(DFX[e.t].n)}</b><small>${esc(dfExSummary(e))}</small></button>`).join('') || '<p class="muted">Aucun exercice programmé.</p>'}</div></div>
    <h3 class="df-sub">👤 Fiches élèves <small class="muted">(abandons, méthode, observateur)</small></h3>` + _dfViewSaisie();
};
/* fiche d'un élève pour la leçon */
viewEntry = function(){
  const n = curLesson(), sid = UI.sid, a = attOf(n, sid), ro = roleOf(n, sid), C = calcAll(n, sid), ref = dfVmaRef(n, sid);
  let h = `<div class="entry-head">${band(sid)}<div><div class="entry-name">${esc(nameOf(sid))}</div>
    <div class="muted">${a ? `<span class="tag ${ATT[a].cls}">${ATT[a].n}</span> ` : ''}${ro && on('roles') ? `<span class="tag role">${esc(ro.n)}</span> ${esc(ro.d || '')}` : ''}${dfForme(n, sid) ? ' <span class="tag inap">😓 −10 %</span>' : ''}</div></div><span id="saved-flag" class="saved"></span></div>`;
  if (FRS.length) h += frStrip(sid);
  h += `<div class="card df-ref">⚡ VMA de référence : ${ref ? `<b>${fmtN(ref.v, 1)} km/h</b> <span class="muted">(${esc(ref.src)})</span>` : '<b>—</b>'} · distance de la leçon : <b>${dfKm(C.L.dist)}</b></div>`;
  h += dfExs(n).map((e, i) => { const x = dfX(n, sid, i), done = dfExDone(n, sid, i);
    return `<div class="card df-exline" style="--xc:${DFX[e.t].c}"><div class="btn-row spread"><b>${DFX[e.t].ico} ${i + 1}. ${esc(DFX[e.t].n)}</b>
      <div class="btn-row"><span class="muted">${x && x.ab ? '🚩 Abandon' : done ? '✓ fait' : x ? '… en cours' : '—'}${dfExDist(n, sid, i) ? ' · ' + dfKm(dfExDist(n, sid, i)) : ''}</span>
      <button class="btn small ${x && x.ab ? 'red' : 'ghost'}" data-action="dfAb" data-i="${i}" data-sid="${sid}">🚩 Abandon</button>
      <button class="btn small" data-action="dfOpen" data-i="${i}">Ouvrir ▸</button></div></div>${DF_LINE[e.t] ? DF_LINE[e.t](n, sid, i, e) : ''}</div>`; }).join('');
  h += dfFieldCardMet(n, sid);
  h += obsCard(n, sid);
  if (isProf() && UI.profUnlocked) h += `<div class="card"><h3>📝 Remarque de l'enseignant <small class="muted">(reste sur cette tablette)</small></h3>
    <textarea id="prof-note" rows="2" style="width:100%" placeholder="Comportement, progrès, conseil, blessure…">${esc(noteOf(n, sid))}</textarea>
    <div class="btn-row">${['Très bon investissement', 'Allure bien tenue', 'Part trop vite', 'Manque d\'engagement', 'Bon observateur', 'À encourager'].map(t => `<button class="chip small-chip" data-action="quickNote" data-t="${esc(t)}">${esc(t)}</button>`).join('')}</div></div>`;
  const list = dfGroupList(), k = list.findIndex(s => s.id === sid), nx = list[k + 1];
  h += `<div class="btn-row spread entry-foot"><button class="btn" data-action="go" data-view="saisie">▦ Retour</button>${nx ? `<button class="btn primary" data-action="entry" data-sid="${nx.id}">${esc(nameOf(nx.id))} ▶</button>` : ''}</div>`;
  return h;
};
const DF_LINE = {};       // résumé par type dans la fiche élève
function dfFieldCardMet(n, sid){
  const f = fieldById('met'); if (!f) return '';
  return `<div class="card field-card"><div class="fc-head"><h3>${esc(f.label)}</h3></div>${f.help ? `<div class="muted help">${esc(f.help)}</div>` : ''}
    <div class="ctl-grid one">${ctlHTML(f, rawVal(n, sid, f), null, null)}</div>${f.double && isProf() && UI.profUnlocked ? pevRow(n, sid, f) : ''}</div>`;
}

/* tuile d'élève commune */
function dfTile(sid, inner, opts = {}){
  const a = attOf(curLesson(), sid);
  return `<div class="tile df-tile ${opts.cls || ''} ${isOff(a) ? 'off' : ''}" ${opts.attrs || ''} style="${opts.style || ''}">${band(sid)}<span class="name">${esc(nameOf(sid))}</span>${inner}</div>`;
}
const dfAbBtn = (n, i, sid) => { const x = dfX(n, sid, i); return `<button class="df-ab ${x && x.ab ? 'on' : ''}" data-action="dfAb" data-i="${i}" data-sid="${sid}" title="Abandon">🚩</button>`; };

/* ---------- Actions communes ---------- */
Object.assign(ACT, {
  dfOpen: d => go('dfx', { ex: +d.i }),
  dfAb: d => { const n = curLesson(); dfSetX(n, d.sid, +d.i, o => { o.ab = !o.ab; if (!o.ab) delete o.ab; }); rerender(); },
  dfTm: d => { const T = dfTimer(d.key);
    if (d.a === 'go') { T.t0 = performance.now() / 1000; T.run = true; T._k = dfTimerState(T).k; beepGo(); keepAwake(true); if (T.onGo) T.onGo(); }
    if (d.a === 'stop') { T.acc = dfTNow(T); T.run = false; keepAwake(false); }
    if (d.a === 'reset') { T.acc = 0; T.run = false; T._k = null; }
    rerender(); },
});
