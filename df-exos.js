/* =====================================================================
   DEMI-FOND N'EPS — écrans des exercices (tablettes)
   Test demi-Cooper / Bats tes perfs · Course d'équipe · Course en pelotons
   Fractionnés court et long · Évaluation 3 × 500 m
   ===================================================================== */
'use strict';

/* ---------- Équipes / séries : composition (enregistrée dans l'exercice, sinon proposée) ---------- */
const dfVmaFor = (n, sid, i) => { const r = dfVmaRef(n, sid, i); return r ? r.v : null; };
function dfPropose(n, i, e, mode, nb){
  const L = sortedStudents().filter(s => dfPresent(n, s.id)).map(s => ({ id: s.id, v: dfVmaFor(n, s.id, i) }));
  const known = L.filter(x => x.v != null).map(x => x.v).sort((a, b) => a - b), med = known.length ? known[Math.floor(known.length / 2)] : 12;
  L.forEach(x => { if (x.v == null) x.v = med; });
  nb = Math.max(1, Math.min(nb, L.length || 1)); const out = {};
  if (mode === 'alea') shuffle(L).forEach((x, k) => out[x.id] = k % nb);
  else if (mode === 'proche') { L.sort((a, b) => b.v - a.v); const per = L.length / nb; L.forEach((x, k) => out[x.id] = Math.min(nb - 1, Math.floor(k / per))); }
  else if (mode === 'besoin') {
    const need = sid => { const sc = DF_PIL.map(p => { const a = []; for (let l = 1; l <= curLesson(); l++) dfExs(l).forEach((_, j) => { const x = dfX(l, sid, j); Object.values((x && x.pil) || {}).forEach(o => { const s = dfPilScore(p, o[p.id]); if (s != null) a.push(s); }); }); return a.length ? avg(a) : 1; });
      return sc.indexOf(Math.min(...sc)); };
    L.forEach(x => x.nd = need(x.id)); L.sort((a, b) => a.nd - b.nd || b.v - a.v); const per = L.length / nb; L.forEach((x, k) => out[x.id] = Math.min(nb - 1, Math.floor(k / per)));
  } else { L.sort((a, b) => b.v - a.v); L.forEach((x, k) => { const r = Math.floor(k / nb), c = k % nb; out[x.id] = r % 2 ? nb - 1 - c : c; }); }   // équilibrées (serpentin)
  return out;
}
const dfNbTeams = (n, e) => e.t === 'aventuriers' ? Math.max(1, Math.floor(sortedStudents().filter(s => dfPresent(n, s.id)).length / (e.taille || 2))) : e.t === 'pelotons' ? e.ns : e.nbEq;
function dfTeams(n, i, e){
  if (e.eq && Object.keys(e.eq).length) return e.eq;
  const m = e.t === 'pelotons' ? 'proche' : (e.form === 'libre' ? 'equi' : e.form) || 'equi';
  return dfPropose(n, i, e, m === 'alea' ? 'equi' : m, dfNbTeams(n, e));    // repli sans hasard : identique sur toutes les tablettes
}
const dfTeamOf = (n, i, e, sid) => dfTeams(n, i, e)[sid];
const DF_TCOL = COLORS.filter(c => c.k !== 'blanc');
const dfTeamCol = t => DF_TCOL[t % DF_TCOL.length];
const dfTeamName = (e, t) => `${e.t === 'pelotons' ? 'Série' : e.t === 'aventuriers' ? (e.taille === 3 ? 'Trinôme' : 'Binôme') : 'Équipe'} ${dfTeamCol(t).n}`;
function dfTabChips(e){
  const nb = e.tabs || 1; if (nb < 2) return '';
  const cur = Math.min(ROOT.dfTab || 0, nb - 1);
  return `<div class="filters"><b>Cette tablette :</b>${Array.from({ length: nb }, (_, k) => `<button class="chip ${k === cur ? 'on' : ''}" data-action="dfTabSel" data-k="${k}">📱 Tablette ${k + 1}</button>`).join('')}</div>`;
}
const dfMyTab = e => Math.min(ROOT.dfTab || 0, (e.tabs || 1) - 1);

/* =====================================================================
   TEST DEMI-COOPER et BATS TES PERFS
   ===================================================================== */
function dfBatsNote(g){ if (g == null) return null; if (g < -1) return 1; if (g < -0.25) return 2; if (g < 0.5) return 3; if (g < 1.5) return 4; if (g < 2.5) return 5; return 6; }
function dfBatsGain(n, sid, i){ const v = dfTestVma(n, sid, i), r = dfVmaRef(n, sid, i); return v == null || !r ? null : r10(v - r.v, 2); }
function dfTestView(n, i, e){
  const key = `t${n}-${i}`, list = dfGroupList().filter(s => dfPresent(n, s.id)), lap = dfLap(), mode = UI.dfMode || 'tours', sel = UI.dfSel || [];
  let h = `${groupChips(ROOT.grp != null && ROOT.grp < nbGroups() ? ROOT.grp : null)}
    <div class="card df-setup"><b>📐 Mise en place :</b> ${dfPiste().mode === 'couloir' ? `couloir de ${dfPiste().L} m en aller-retour (1 tour = ${lap} m)` : `piste de ${lap} m`}, ${dfPlots().length} plots tous les ${fmtN(dfPlotStep(), 0)} m.
      <button class="btn small" data-action="dfPlotsGuide">📍 Placement des plots</button></div>
    ${dfTimerHTML(key, [{ n:'Demi-Cooper · 6 min', s: e.dur || 360 }])}
    <div class="btn-row df-modes"><button class="btn ${mode === 'tours' ? 'primary' : ''}" data-action="dfMode" data-m="tours">🏃 1. Compter les tours</button>
      <button class="btn ${mode === 'plot' ? 'primary' : ''}" data-action="dfMode" data-m="plot">📍 2. Placer au plot d'arrêt</button></div>
    <p class="muted">${mode === 'tours' ? 'Touchez la tuile du coureur à chaque passage sur la ligne (− pour corriger). Un passage plus rapide que 26 km/h est ignoré.' : 'Au coup de sifflet, chaque coureur s\'arrête : touchez les tuiles des coureurs arrêtés au même plot, puis le plot.'}</p>`;
  if (mode === 'plot') h += `<div class="card df-plotbar ${sel.length ? '' : 'dim'}"><b>${sel.length ? sel.length + ' coureur(s) sélectionné(s) → plot d\'arrêt :' : 'Sélectionnez des coureurs'}</b>
    <div class="btn-row">${dfPlots().map(p => `<button class="btn small" data-action="dfPlot" data-d="${p.d}" ${sel.length ? '' : 'disabled'}>${esc(p.l)}</button>`).join('')}
    <button class="btn small ghost" data-action="dfSetLaps" ${sel.length ? '' : 'disabled'}>✎ Tours…</button><button class="btn small ghost" data-action="dfSelAll">Tout / rien</button></div></div>`;
  h += `<div class="tiles">${list.map(s => { const x = dfX(n, s.id, i) || {}, L = (x.laps || []).length, v = dfTestVma(n, s.id, i), last = L > 1 && x.laps[L - 1] != null && x.laps[L - 2] != null ? x.laps[L - 1] - x.laps[L - 2] : L === 1 && x.laps[0] != null ? x.laps[0] : null;
    const g = e.t === 'bats' ? dfBatsGain(n, s.id, i) : null, ref = e.t === 'bats' ? dfVmaRef(n, s.id, i) : null;
    const inner = `<span class="df-big">${L}<small> tour${L > 1 ? 's' : ''}</small></span>
      <span class="meta">${x.plot != null ? `+${fmtN(x.plot, 0)} m · <b>${fmtN(v, 1)} km/h</b>` : last != null ? 'dernier tour ' + dfT(last) : '&nbsp;'}</span>
      ${e.t === 'bats' ? `<span class="meta">${ref ? `avant : ${fmtN(ref.v, 1)}` : 'pas de VMA avant'}${g != null ? ` · <b class="${g >= 0 ? 'up' : 'down'}">${g >= 0 ? '+' : '−'}${fmtN(Math.abs(g), 1)}</b> · ${dfBatsNote(g)}/6` : ''}</span>` : ''}
      ${mode === 'tours' ? `<button class="df-minus" data-action="dfLapUndo" data-sid="${s.id}" data-i="${i}">−</button>` : ''}${dfAbBtn(n, i, s.id)}`;
    return dfTile(s.id, inner, { cls: `${mode === 'plot' && sel.includes(s.id) ? 'sel' : ''} ${x.ab ? 'abd' : ''}`, attrs: `data-action="${mode === 'tours' ? 'dfLapAdd' : 'dfSel'}" data-sid="${s.id}" data-i="${i}"` }); }).join('')}</div>`;
  return h;
}
DF_VIEWS.cooper = { view: dfTestView };
DF_VIEWS.bats = { view: dfTestView };
DF_LINE.cooper = DF_LINE.bats = (n, sid, i, e) => { const x = dfX(n, sid, i); if (!x) return ''; const v = dfTestVma(n, sid, i), g = e.t === 'bats' ? dfBatsGain(n, sid, i) : null;
  return `<div class="muted">${(x.laps || []).length} tours${x.plot != null ? ' + ' + fmtN(x.plot, 0) + ' m' : ''} · VMA <b>${v == null ? '—' : fmtN(v, 1) + ' km/h'}</b>${g != null ? ` · progrès ${g >= 0 ? '+' : '−'}${fmtN(Math.abs(g), 1)} km/h · note ${dfBatsNote(g)}/6` : ''}</div>`; };

/* Schéma et mesures pour placer les plots */
function dfPisteSVG(mode, L, opts = {}){
  const plots = opts.plots || [], W = 520, H = 220;
  if (mode === 'couloir') {
    const x0 = 40, x1 = 480, y = 110, px = d => x0 + (x1 - x0) * Math.min(d, L) / L;
    return `<svg viewBox="0 0 ${W} ${H}" class="df-svg"><rect x="20" y="70" width="480" height="80" rx="12" fill="#D9774F"/><line x1="20" x2="500" y1="110" y2="110" stroke="#fff" stroke-width="3" stroke-dasharray="10 8"/>
      <path d="M60 88 H440" stroke="#fff" stroke-width="5" marker-end="url(#ar)"/><path d="M440 132 H60" stroke="#fff" stroke-width="5" marker-end="url(#ar)"/>
      <defs><marker id="ar" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8z" fill="#fff"/></marker></defs>
      <line x1="${x0}" x2="${x0}" y1="62" y2="158" stroke="#0B346E" stroke-width="5"/><text x="${x0}" y="52" text-anchor="middle" font-size="15" font-weight="800" fill="#0B346E">Départ</text>
      <line x1="${x1}" x2="${x1}" y1="62" y2="158" stroke="#0B346E" stroke-width="5"/><text x="${x1 + 10}" y="52" text-anchor="end" font-size="15" font-weight="800" fill="#0B346E">Demi-tour · ${L} m</text>
      ${plots.filter(p => p.d <= L + 0.05).map(p => `<g><path d="M${px(p.d) - 9} 178 L${px(p.d)} 160 L${px(p.d) + 9} 178z" fill="#F7941D" stroke="#0B346E" stroke-width="2"/><text x="${px(p.d)}" y="198" text-anchor="middle" font-size="13" font-weight="800" fill="#0B346E">${fmtN(p.d, 0)}</text></g>`).join('')}
      <text x="260" y="20" text-anchor="middle" font-size="15" font-weight="800" fill="#0B346E">Couloir en aller-retour · 1 tour = ${2 * L} m</text></svg>`;
  }
  const cx = 260, cy = 110, rx = 210, ry = 85, lap = L, pt = d => { const a = Math.PI / 2 + 2 * Math.PI * d / lap; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]; };
  return `<svg viewBox="0 0 ${W} ${H}" class="df-svg"><ellipse cx="${cx}" cy="${cy}" rx="${rx + 18}" ry="${ry + 18}" fill="#D9774F"/><ellipse cx="${cx}" cy="${cy}" rx="${rx - 18}" ry="${ry - 18}" fill="#7CC37A"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="8 6"/>
    <line x1="${cx}" x2="${cx}" y1="${cy + ry - 22}" y2="${cy + ry + 22}" stroke="#0B346E" stroke-width="5"/>
    <text x="${cx}" y="${cy + 12}" text-anchor="middle" font-size="18" font-weight="900" fill="#0B346E">Piste de ${lap} m</text><text x="${cx}" y="${cy + 34}" text-anchor="middle" font-size="13" font-weight="700" fill="#0B346E">sens de course ↺</text>
    ${plots.map((p, k) => { const [x, y] = pt(p.d); return `<g><circle cx="${x}" cy="${y}" r="13" fill="#F7941D" stroke="#0B346E" stroke-width="2.5"/><text x="${x}" y="${y + 5}" text-anchor="middle" font-size="13" font-weight="900" fill="#0B346E">${k}</text></g>`; }).join('')}</svg>`;
}
function dfPlotsGuide(){
  const P = dfPiste(), lap = dfLap(), s = dfPlotStep(), plots = dfPlots(), maxT = Math.ceil(2400 / lap);
  const rows = Array.from({ length: maxT }, (_, k) => k + Math.max(1, Math.floor(600 / lap)) - 1).filter(t => t >= 0 && t * lap <= 2600);
  modal(`<h2>📍 Placement des plots · demi-Cooper</h2>${dfPisteSVG(P.mode, P.L, { plots })}
    <div class="df-steps"><p><b>Pour les observateurs :</b></p><ol>
      <li>Plot 0 sur la ligne de départ${P.mode === 'couloir' ? ' (début du couloir) ; un plot au demi-tour à ' + P.L + ' m' : ''}.</li>
      <li>Puis un plot tous les <b>${fmtN(s, 0)} m</b> dans le sens de la course (au décamètre, ou ≈ ${Math.round(s / 0.8)} grands pas de 80 cm)${P.mode === 'couloir' ? ', à l\'aller seulement : au retour on lit les mêmes plots à l\'envers' : ''}.</li>
      <li>${P.mode === 'couloir' ? (Math.round(P.L / s) + 1) + ' plots posés de 0 à ' + P.L + ' m, relus au retour : ' + plots.length + ' repères par tour' : plots.length + ' plots en tout'}. Chaque plot = <b>+${fmtN(s / 100, 2)} km/h</b> de VMA (VMA = distance en 6 min ÷ 100).</li>
      <li>Au coup de sifflet des 6 min, chaque coureur s'arrête sur place ; on retient le dernier plot dépassé.</li></ol></div>
    <div class="scroll-x"><table class="tbl df-conv"><thead><tr><th>Tours</th>${plots.map(p => `<th>${esc(p.l)}</th>`).join('')}</tr></thead><tbody>
      ${rows.map(t => `<tr><td><b>${t}</b></td>${plots.map(p => `<td>${fmtN((t * lap + p.d) / 100, 1)}</td>`).join('')}</tr>`).join('')}</tbody></table><p class="muted small">VMA en km/h selon le nombre de tours complets et le plot d'arrêt.</p></div>
    <div class="btn-row spread no-print" style="margin-top:12px"><button class="btn" data-print>🖨 Imprimer</button><button class="btn primary" data-close>Fermer</button></div>`, { wide: true });
  dfModalBind();
}
function dfModalBind(){ const m = $('#modal-root .modal'); if (!m) return; const c = m.querySelector('[data-close]'); if (c) c.onclick = closeModal;
  const p = m.querySelector('[data-print]'); if (p) p.onclick = () => { document.body.classList.add('print-modal'); window.print(); setTimeout(() => document.body.classList.remove('print-modal'), 500); }; }

/* =====================================================================
   COURSE D'ÉQUIPE
   ===================================================================== */
function dfEquipeView(n, i, e){
  const key = `q${n}-${i}`, T = dfTimer(key), tab = dfMyTab(e), teams = dfTeams(n, i, e), nbT = e.nbEq;
  const myTeams = Array.from({ length: nbT }, (_, t) => t).filter(t => t % (e.tabs || 1) === tab);
  const mates = t => sortedStudents().filter(s => teams[s.id] === t && dfPresent(n, s.id));
  const tot = t => mates(t).reduce((a, s) => a + ((dfX(n, s.id, i) || {}).laps || []).length, 0);
  let h = `${dfTabChips(e)}${dfTimerHTML(key, [{ n:'Course d\'équipe', s: e.dur * 60 }])}
    <div class="df-score">${Array.from({ length: nbT }, (_, t) => `<div class="df-sc" style="--tc:${dfTeamCol(t).c}"><b>${esc(dfTeamCol(t).n)}</b><span>${tot(t)} tours</span><small>${dfKm(tot(t) * dfLap())}</small></div>`).join('')}</div>
    <p class="muted">Touchez la tuile quand le coureur passe et dit son prénom : +1 tour. Passage trop rapide (> 26 km/h) ignoré ; <b>＋</b> force l'ajout, <b>−</b> retire le dernier tour.${e.pauses ? ' ⏸ : entrée / sortie de pause.' : ''}</p>`;
  h += myTeams.map(t => `<div class="card df-team" style="--tc:${dfTeamCol(t).c}"><h3>${esc(dfTeamName(e, t))} · ${tot(t)} tours</h3><div class="tiles">${mates(t).map(s => {
    const x = dfX(n, s.id, i) || {}, L = (x.laps || []).length, pz = (x.pz || []).length && x.pz[x.pz.length - 1][1] == null;
    return dfTile(s.id, `<span class="df-big">${L}</span><span class="meta">${pz ? '⏸ en pause' : dfKm(L * dfLap())}</span>
      <button class="df-minus" data-action="dfLapUndo" data-sid="${s.id}" data-i="${i}">−</button><button class="df-plus" data-action="dfLapForce" data-sid="${s.id}" data-i="${i}">＋</button>
      ${e.pauses ? `<button class="df-pz ${pz ? 'on' : ''}" data-action="dfPause" data-sid="${s.id}" data-i="${i}">⏸</button>` : ''}${dfAbBtn(n, i, s.id)}`,
      { cls: `${pz ? 'paused' : ''} ${x.ab ? 'abd' : ''}`, attrs: `data-action="dfLapAdd" data-sid="${s.id}" data-i="${i}"`, style: `border-color:${dfTeamCol(t).c}` }); }).join('') || '<p class="muted">Aucun élève.</p>'}</div></div>`).join('');
  return h;
}
DF_VIEWS.equipe = { view: dfEquipeView };
function dfLapsOf(x){ const L = (x && x.laps || []).filter(v => v != null); const d = []; for (let k = 0; k < L.length; k++) d.push(L[k] - (k ? L[k - 1] : 0)); return d; }
function dfRegul(x){ const d = dfLapsOf(x).slice(1).filter(v => v > 0); if (d.length < 2) return null; const m = avg(d), sd = Math.sqrt(avg(d.map(v => (v - m) ** 2))); return Math.max(0, Math.round(100 - sd / m * 100)); }
DF_LINE.equipe = (n, sid, i) => { const x = dfX(n, sid, i); if (!x) return ''; const r = dfRegul(x);
  return `<div class="muted">${(x.laps || []).length} tours · ${dfKm((x.laps || []).length * dfLap())}${r != null ? ` · régularité ${r} %` : ''}${(x.pz || []).length ? ` · ${x.pz.length} pause(s)` : ''}</div>`; };

/* =====================================================================
   SÉRIE CHRONOMÉTRÉE (pelotons et évaluation) : départ commun, arrivée par tuile
   ===================================================================== */
const DFC = {};
const dfChr = key => DFC[key] = DFC[key] || { run:false, t0:0 };
const dfChrNow = c => c.run ? performance.now() / 1000 - c.t0 : 0;
setInterval(() => { Object.entries(DFC).forEach(([k, c]) => { if (!c.run) return; const el = document.querySelector(`[data-dfc="${k}"]`); if (el) el.textContent = dfTc(dfChrNow(c)); }); }, 100);
function dfChrHTML(key){ const c = dfChr(key);
  return `<div class="df-timer ${c.run ? 'run' : ''}"><div><small>Chrono de la série</small><b data-dfc="${key}">${dfTc(dfChrNow(c))}</b></div>
    <div class="btn-row">${c.run ? `<button class="btn red" data-action="dfChr" data-key="${key}" data-a="stop">⏹ Arrêter</button>` : `<button class="btn green" data-action="dfChr" data-key="${key}" data-a="go">🔫 Départ</button>`}</div></div>`; }

/* =====================================================================
   COURSE EN PELOTONS
   ===================================================================== */
const DF_JOK_DEF = [
  { id:'nd', l:'Je ne me ferai doubler par personne', p:7, on:true },
  { id:'d3', l:'Je vais doubler 3 personnes', p:5, on:true },
  { id:'lv1', l:'Je tiens le 1er tour sans être rattrapé par le lièvre', p:3, on:true },
  { id:'lievre', l:'Je suis le lièvre : 1 point par coureur doublé', p:'n', on:true },
  { id:'top3', l:'Je termine dans les 3 premiers', p:5, on:true },
  { id:'neg', l:'Mon 2e tour est plus rapide que le 1er', p:4, on:false },
  { id:'mieux', l:'Je bats mon temps de la course précédente', p:4, on:false },
  { id:'lache', l:'Je reste au contact du groupe de tête jusqu\'à la cloche', p:3, on:false },
];
const dfJokAll = () => (S.params && S.params.jok) || DF_JOK_DEF;
const dfJoks = () => dfJokAll().filter(j => j.on !== false);
const dfJok = id => dfJokAll().find(j => j.id === id) || null;
const dfPelPerf = pct => pct == null ? null : pct >= 135 ? 5 : Math.max(0, 5 - 0.5 * Math.ceil((135 - pct) / 5 - 1e-9));
function dfPelCourse(n, sid, i, e, k){
  const x = dfX(n, sid, i), c = x && x.c && x.c[k]; if (!c || !c.t) return null; const ref = dfVmaRef(n, sid, i);
  const pct = ref ? dfPctOf(e.d, c.t, ref.v) : null, perf = dfPelPerf(pct), J = dfJok(c.j);
  const jp = J && c.ok ? (J.p === 'n' ? (+c.nd || 0) : +J.p) : 0;
  return { pct, perf, jp, tot: perf == null ? null : perf + jp };
}
function dfPelNote(n, sid, i, e){
  let carry = 0; const out = [];
  for (let k = 0; k < e.nb; k++) { const c = dfPelCourse(n, sid, i, e, k); if (!c || c.tot == null) { out.push(null); continue; } const s = c.tot + carry; out.push(Math.min(10, s)); carry = Math.max(0, s - 10); }
  const ok = out.filter(v => v != null); return { courses: out, carry, note: ok.length ? r10(ok.reduce((a, b) => a + b, 0) / e.nb, 2) : null };
}
function dfPelTargets(vma, d){ return [[135, '5/5'], [125, '4/5'], [115, '3/5'], [100, '1,5/5']].map(([p, l]) => `${l} ${dfT(dfTime(d, vma, p))}`).join(' · '); }
function dfPelotonsView(n, i, e){
  const teams = dfTeams(n, i, e), ns = e.ns, ser = UI.dfSer != null && UI.dfSer < ns ? UI.dfSer : 0, k = UI.dfK != null && UI.dfK < e.nb ? UI.dfK : 0, key = `p${n}-${i}-${ser}-${k}`, c = dfChr(key);
  const list = sortedStudents().filter(s => teams[s.id] === ser && dfPresent(n, s.id));
  let h = `<div class="filters"><b>Série :</b>${Array.from({ length: ns }, (_, s) => `<button class="chip ${s === ser ? 'on' : ''}" data-action="dfSer" data-s="${s}"><span class="dot" style="background:${dfTeamCol(s).c}"></span>${esc(dfTeamCol(s).n)}</button>`).join('')}</div>
    <div class="filters"><b>Course :</b>${Array.from({ length: e.nb }, (_, q) => `<button class="chip ${q === k ? 'on' : ''}" data-action="dfK" data-k="${q}">${q + 1}</button>`).join('')}</div>
    <p class="muted">1. Chaque coureur choisit son joker. 2. Le starter donne le départ. 3. L'observateur touche <b>🏁</b> quand son coureur passe la ligne. 4. Il valide le joker ✓ / ✗.</p>
    ${dfChrHTML(key)}<div class="tiles df-wide">${list.map(s => { const x = dfX(n, s.id, i) || {}, cc = (x.c || [])[k] || {}, ref = dfVmaRef(n, s.id, i), J = dfJok(cc.j), sc = dfPelCourse(n, s.id, i, e, k), N = dfPelNote(n, s.id, i, e);
      return dfTile(s.id, `<span class="meta">${ref ? `VMA ${fmtN(ref.v, 1)} · ${dfPelTargets(ref.v, e.d)}` : 'pas de VMA'}</span>
        <button class="btn small df-jok" data-action="dfJokPick" data-sid="${s.id}" data-i="${i}" data-k="${k}">🃏 ${J ? esc(J.l) + ` (${J.p === 'n' ? '1/doublé' : J.p + ' pts'})` : 'Choisir un joker'}</button>
        <div class="btn-row">${cc.t ? `<button class="btn small" data-action="dfCT" data-sid="${s.id}" data-i="${i}" data-k="${k}">⏱ ${dfTc(cc.t)}</button>` : `<button class="btn green df-fin" data-action="dfFin" data-sid="${s.id}" data-i="${i}" data-k="${k}" data-key="${key}" ${c.run ? '' : 'disabled'}>🏁 Arrivée</button>`}
          ${J && cc.t ? `<button class="btn small ${cc.ok === true ? 'green' : ''}" data-action="dfJokOk" data-sid="${s.id}" data-i="${i}" data-k="${k}" data-v="1">✓ joker</button><button class="btn small ${cc.ok === false ? 'red' : ''}" data-action="dfJokOk" data-sid="${s.id}" data-i="${i}" data-k="${k}" data-v="0">✗</button>
            ${J.p === 'n' && cc.ok ? `<span class="stepper"><button class="cbtn" data-action="dfNd" data-sid="${s.id}" data-i="${i}" data-k="${k}" data-d="-1">−</button><b>${cc.nd || 0}</b><button class="cbtn" data-action="dfNd" data-sid="${s.id}" data-i="${i}" data-k="${k}" data-d="1">+</button></span>` : ''}` : ''}</div>
        <span class="meta">${sc ? `${fmtN(sc.pct, 0)} % VMA → ${fmtN(sc.perf, 1)}/5 + joker ${sc.jp} = <b>${fmtN(sc.tot, 1)}</b>` : ''}${N.note != null ? ` · note ${fmtN(N.note, 1)}/10${N.carry ? ' (+' + fmtN(N.carry, 1) + ' en réserve)' : ''}` : ''}</span>${dfAbBtn(n, i, s.id)}`, { cls: x.ab ? 'abd' : '' }); }).join('') || '<p class="muted">Aucun coureur dans cette série.</p>'}</div>`;
  return h;
}
DF_VIEWS.pelotons = { view: dfPelotonsView };
DF_LINE.pelotons = (n, sid, i, e) => { const N = dfPelNote(n, sid, i, e); if (N.note == null) return '';
  return `<div class="muted">Courses : ${N.courses.map(v => v == null ? '—' : fmtN(v, 1)).join(' · ')} · note <b>${fmtN(N.note, 1)}/10</b></div>`; };
function dfJokPick(d){
  const n = curLesson(), i = +d.i, k = +d.k, cur = (((dfX(n, d.sid, i) || {}).c || [])[k] || {}).j;
  const m = modal(`<h2>🃏 Joker de ${esc(nameOf(d.sid))} · course ${k + 1}</h2><div class="res-list">${dfJoks().map(j => `<button class="btn ${j.id === cur ? 'primary' : ''}" data-j="${j.id}">${esc(j.l)} · ${j.p === 'n' ? '1 pt par coureur doublé' : j.p + ' pts'}</button>`).join('')}
    <button class="btn ghost" data-j="">Pas de joker</button></div><div class="btn-row spread" style="margin-top:10px"><span></span><button class="btn ghost" data-x>Annuler</button></div>`);
  m.querySelector('[data-x]').onclick = closeModal;
  m.querySelectorAll('[data-j]').forEach(b => b.onclick = () => { dfSetX(n, d.sid, i, o => { o.c = o.c || []; o.c[k] = { ...(o.c[k] || {}), j: b.dataset.j || null, ok: null }; }); closeModal(); rerender(); });
}

/* =====================================================================
   FRACTIONNÉS (court et long)
   ===================================================================== */
const DF_CELL = { 2:{ s:'✓', c:'#1E8E3E' }, 1:{ s:'≈', c:'#F59E0B' }, 0:{ s:'✗', c:'#D0161B' } };
function dfFracPhases(e){
  const R = dfReps(e), P = [];
  for (let s = 0; s < (e.series || 1); s++) R.forEach((v, k) => { P.push({ n: `S${s + 1} · effort ${k + 1}`, s: v });
    const last = k === R.length - 1; if (!last && e.rec.unite === 'temps') P.push({ n: `Récup (${e.rec.type})`, s: e.rec.val });
    if (last && s < e.series - 1 && e.recS) P.push({ n:'Récup entre séries', s: e.recS }); });
  return P;
}
function dfFracView(n, i, e){
  const list = dfGroupList().filter(s => dfPresent(n, s.id)), R = dfReps(e), cols = [];
  for (let s = 0; s < (e.series || 1); s++) R.forEach((v, k) => cols.push({ s, k }));
  const key = `f${n}-${i}`;
  let h = `${groupChips(ROOT.grp != null && ROOT.grp < nbGroups() ? ROOT.grp : null)}
    ${e.mode === 'temps' ? dfTimerHTML(key, dfFracPhases(e)) : e.rec.unite === 'temps' ? dfTimerHTML(key, [{ n:'Récupération', s: e.rec.val }]) : ''}
    <p class="muted">Cible de chaque coureur d'après sa VMA (😓 = élève en petite forme, −10 % de VMA). Touchez une case après chaque répétition : ✓ cible atteinte · ≈ presque · ✗ non atteinte.
      ${e.pil === 'rep' ? 'Piliers : à chaque passage.' : 'Piliers : en fin d\'exercice.'}</p>
    <div class="card scroll-x"><table class="tbl df-mat"><thead><tr><th>Coureur</th>${cols.map(c => `<th>${e.series > 1 ? 'S' + (c.s + 1) + '·' : ''}${c.k + 1}<br><small>${e.mode === 'dist' ? fmtN(R[c.k], 0) + ' m' : dfT(R[c.k])}</small></th>`).join('')}<th>👀</th><th>🚩</th></tr></thead><tbody>
    ${list.map(st => { const sid = st.id, x = dfX(n, sid, i) || {}, ref = dfVmaRef(n, sid, i), fo = dfForme(n, sid), np = Object.keys(x.pil || {}).length;
      return `<tr class="${x.ab ? 'abd' : ''}"><td class="nm">${band(sid)}<div><b>${esc(nameOf(sid))}</b><br><small>${ref ? fmtN(ref.v, 1) + ' km/h · ' + (e.pct - (fo ? 10 : 0)) + ' %' : 'pas de VMA'}</small>
        <button class="df-fo ${fo ? 'on' : ''}" data-action="dfForme" data-sid="${sid}" title="Petite forme : −10 %">😓</button></div></td>
        ${cols.map(c => { const v = ((x.r || [])[c.s] || [])[c.k], tg = ref ? dfRepTarget(e, c.k, ref.v, fo) : null;
          return `<td><button class="df-cell" data-action="dfCell" data-sid="${sid}" data-i="${i}" data-s="${c.s}" data-k="${c.k}" style="${v != null ? `background:${DF_CELL[v].c};color:#fff` : ''}">${v != null ? DF_CELL[v].s : ''}<small>${tg ? (e.mode === 'dist' ? dfT(tg.t) : tg.d == null ? '' : fmtN(Math.round(tg.d / 5) * 5, 0) + ' m') : ''}</small></button></td>`; }).join('')}
        <td><button class="btn small ${np ? 'green' : ''}" data-action="dfPilOpen" data-sid="${sid}" data-i="${i}">👀${np ? ' ' + np : ''}</button></td><td>${dfAbBtn(n, i, sid)}</td></tr>`; }).join('')}
    </tbody></table></div>`;
  return h;
}
DF_VIEWS.fc = DF_VIEWS.fl = { view: dfFracView };
DF_LINE.fc = DF_LINE.fl = (n, sid, i, e) => { const x = dfX(n, sid, i); if (!x) return ''; const a = dfFracCells(x);
  return `<div class="muted">${a.length}/${dfRepCount(e)} répétitions · cibles ${a.length ? Math.round(avg(a.map(v => v / 2)) * 100) + ' %' : '—'}${Object.keys(x.pil || {}).length ? ' · piliers observés' : ''}</div>`; };

/* Piliers d'un coureur (observateur), pour un exercice */
function dfPilModal(n, sid, i){
  const e = dfEx(n, i), x = dfX(n, sid, i) || {}, keys = e.pil === 'rep' ? (() => { const a = []; for (let s = 0; s < (e.series || 1); s++) dfReps(e).forEach((_, k) => a.push(`s${s}r${k}`)); return a; })() : ['fin'];
  const key = UI.dfPk && keys.includes(UI.dfPk) ? UI.dfPk : keys[0], o = (x.pil || {})[key] || {}, g = student(sid)?.grp || 0;
  const mates = sortedStudents().filter(s => s.id !== sid && dfPresent(n, s.id) && (e.t === 'eval' || nbGroups() < 2 || (s.grp || 0) === g));
  const m = modal(`<h2>👀 Piliers de ${esc(nameOf(sid))}</h2>
    ${keys.length > 1 ? `<div class="lchips"><b>Passage</b>${keys.map(k => `<button class="chip ${k === key ? 'on' : ''}" data-pk="${k}">${k.replace(/s(\d+)r(\d+)/, (z, a, b) => (e.series > 1 ? 'S' + (+a + 1) + '·' : '') + (+b + 1))}</button>`).join('')}</div>` : ''}
    <div class="lchips"><b>Observateur</b>${mates.map(s => `<button class="chip ${o.by === s.id ? 'on' : ''}" data-by="${s.id}">${esc(nameOf(s.id))}</button>`).join('')}</div>
    ${dfPilForm(o, 'dfPilSet', `data-sid="${sid}" data-i="${i}" data-key="${key}"`)}
    <div class="btn-row spread" style="margin-top:12px"><span class="muted">${dfPilMean(o) != null ? 'Score : ' + Math.round(dfPilMean(o) * 100) + ' %' : ''}</span><button class="btn primary" data-x>Fermer</button></div>`, { wide: true });
  m.querySelector('[data-x]').onclick = () => { closeModal(); rerender(); };
  m.querySelectorAll('[data-pk]').forEach(b => b.onclick = () => { UI.dfPk = b.dataset.pk; dfPilModal(n, sid, i); });
  m.querySelectorAll('[data-by]').forEach(b => b.onclick = () => { dfSetX(n, sid, i, X => { X.pil = X.pil || {}; const P = X.pil[key] = X.pil[key] || {}; P.by = P.by === b.dataset.by ? null : b.dataset.by; }); dfPilModal(n, sid, i); });
}

/* =====================================================================
   ÉVALUATION 3 × 500 m (/12)
   ===================================================================== */
const DF_EV_TAB = [[110, 3], [105, 2.5], [100, 2], [95, 1.5], [90, 1], [85, 0.5]];
const dfEvPts = pct => { if (pct == null) return null; for (const [p, v] of DF_EV_TAB) if (pct >= p - 1e-9) return v; return 0; };
function dfEvScore(n, sid, i, e){
  const x = dfX(n, sid, i), ref = dfVmaRef(n, sid, i); if (!x) return null;
  const t = Array.from({ length: e.nb }, (_, k) => ((x.c || [])[k] || {}).t || null);
  const pts = t.map(v => v && ref ? dfEvPts(dfPctOf(e.d, v, ref.v)) : null);
  let reg = null; if (t.every(Boolean)) { let ded = 0; for (let k = 1; k < t.length; k++) ded += 0.5 * Math.floor(Math.abs(t[k] - t[k - 1]) / 4); reg = Math.max(0, 3 - ded); }
  const done = pts.every(v => v != null) && reg != null;
  return { t, pts, reg, ref, total: done ? pts.reduce((a, b) => a + b, 0) * (3 * 3 / (3 * e.nb)) + reg : null };
}
function dfEvalView(n, i, e){
  const k = UI.dfK != null && UI.dfK < e.nb ? UI.dfK : 0, g = ROOT.grp != null && ROOT.grp < nbGroups() ? ROOT.grp : null, key = `e${n}-${i}-${g ?? 'all'}-${k}`, c = dfChr(key);
  const list = dfGroupList().filter(s => dfPresent(n, s.id));
  return `${groupChips(g)}<div class="filters"><b>Course :</b>${Array.from({ length: e.nb }, (_, q) => `<button class="chip ${q === k ? 'on' : ''}" data-action="dfK" data-k="${q}">${q + 1}</button>`).join('')}</div>
    <p class="muted">Chaque course : 3 pts selon le % de VMA (≥ 110 % = 3 · 105 % = 2,5 · 100 % = 2 · 95 % = 1,5 · 90 % = 1 · 85 % = 0,5). Régularité /3 : −0,5 par tranche de 4 s d'écart entre deux courses.</p>
    ${dfChrHTML(key)}<div class="tiles df-wide">${list.map(s => { const x = dfX(n, s.id, i) || {}, cc = (x.c || [])[k] || {}, Sc = dfEvScore(n, s.id, i, e) || {}, ref = dfVmaRef(n, s.id, i), np = Object.keys(x.pil || {}).length;
      return dfTile(s.id, `<span class="meta">${ref ? `VMA ${fmtN(ref.v, 1)} · 3 pts : ${dfT(dfTime(e.d, ref.v, 110))} · 2 pts : ${dfT(dfTime(e.d, ref.v, 100))} · 1 pt : ${dfT(dfTime(e.d, ref.v, 90))}` : 'pas de VMA'}</span>
        <div class="btn-row">${cc.t ? `<button class="btn small" data-action="dfCT" data-sid="${s.id}" data-i="${i}" data-k="${k}">⏱ ${dfTc(cc.t)}</button>` : `<button class="btn green df-fin" data-action="dfFin" data-sid="${s.id}" data-i="${i}" data-k="${k}" data-key="${key}" ${c.run ? '' : 'disabled'}>🏁 Arrivée</button>`}
          <button class="btn small ${np ? 'green' : ''}" data-action="dfPilOpen" data-sid="${s.id}" data-i="${i}">👀 Piliers</button></div>
        <span class="meta">${(Sc.t || []).map((t, q) => `C${q + 1} ${t ? dfT(t) + ' → ' + fmtN(Sc.pts[q], 1) : '—'}`).join(' · ')}${Sc.reg != null ? ` · régularité ${fmtN(Sc.reg, 1)}/3` : ''}${Sc.total != null ? ` · <b>${fmtN(Sc.total, 2)}/12</b>` : ''}</span>${dfAbBtn(n, i, s.id)}`, { cls: x.ab ? 'abd' : '' }); }).join('')}</div>`;
}
DF_VIEWS.eval = { view: dfEvalView };
DF_LINE.eval = (n, sid, i, e) => { const S_ = dfEvScore(n, sid, i, e); if (!S_) return ''; return `<div class="muted">${S_.t.map(t => dfT(t)).join(' · ')}${S_.total != null ? ` · <b>${fmtN(S_.total, 2)}/12</b>` : ''}</div>`; };

/* ---------- Actions des exercices ---------- */
Object.assign(ACT, {
  dfMode: d => { UI.dfMode = d.m; UI.dfSel = []; rerender(); },
  dfSel: d => { const a = UI.dfSel = UI.dfSel || [], k = a.indexOf(d.sid); if (k >= 0) a.splice(k, 1); else a.push(d.sid); rerender(); },
  dfSelAll: () => { const n = curLesson(), L = dfGroupList().filter(s => dfPresent(n, s.id)).map(s => s.id); UI.dfSel = (UI.dfSel || []).length === L.length ? [] : L; rerender(); },
  dfPlot: d => { const n = curLesson(), i = UI.ex; (UI.dfSel || []).forEach(sid => dfSetX(n, sid, i, o => { o.plot = +d.d; })); UI.dfSel = []; toast('✓ Plot enregistré'); rerender(); },
  dfSetLaps: async () => { const n = curLesson(), i = UI.ex, v = await numberBox('Nombre de tours complets', null, { step: 1, min: 0, max: 40 }); if (v == null) return;
    (UI.dfSel || []).forEach(sid => dfSetX(n, sid, i, o => { const L = o.laps || []; o.laps = Array.from({ length: Math.round(v) }, (_, k) => L[k] ?? null); })); rerender(); },
  dfLapAdd: (d, el, force) => { const n = curLesson(), i = +d.i, e = dfEx(n, i), T = dfTimer(`${DF_TEST(e.t) ? 't' : 'q'}${n}-${i}`), t = T.run || T.acc ? r10(dfTNow(T), 2) : null;
    const x = dfX(n, d.sid, i) || {}, L = x.laps || [], last = [...L].reverse().find(v => v != null);
    if (x.pz && x.pz.length && x.pz[x.pz.length - 1][1] == null) return toast('⏸ ' + nameOf(d.sid) + ' est en pause');
    if (!force && t != null && last != null && t - last < dfLapMin()) { toast(`⚠️ ${nameOf(d.sid)} : passage trop rapide, ignoré (＋ pour forcer)`); return; }
    dfSetX(n, d.sid, i, o => { (o.laps = o.laps || []).push(t); }); beepShort(); if (navigator.vibrate) navigator.vibrate(30); rerender(); },
  dfLapForce: d => ACT.dfLapAdd(d, null, true),
  dfLapUndo: d => { const n = curLesson(); dfSetX(n, d.sid, +d.i, o => { (o.laps || []).pop(); }); rerender(); },
  dfPause: d => { const n = curLesson(), i = +d.i, T = dfTimer(`q${n}-${i}`), t = r10(dfTNow(T), 1);
    dfSetX(n, d.sid, i, o => { const P = o.pz = o.pz || []; if (P.length && P[P.length - 1][1] == null) P[P.length - 1][1] = t; else P.push([t, null]); }); rerender(); },
  dfTabSel: d => { ROOT.dfTab = +d.k; save(); rerender(); },
  dfSer: d => { UI.dfSer = +d.s; rerender(); },
  dfK: d => { UI.dfK = +d.k; rerender(); },
  dfChr: d => { const c = dfChr(d.key); if (d.a === 'go') { c.t0 = performance.now() / 1000; c.run = true; beepGo(); keepAwake(true); } else { c.run = false; keepAwake(false); } rerender(); },
  dfFin: d => { const c = dfChr(d.key); if (!c.run) return; const t = r10(dfChrNow(c), 2), n = curLesson(), e = dfEx(n, +d.i);
    if (e && t < e.d / (26 / 3.6)) return toast('⚠️ Temps impossible (plus de 26 km/h) : attendez l\'arrivée');
    dfSetX(n, d.sid, +d.i, o => { o.c = o.c || []; o.c[+d.k] = { ...(o.c[+d.k] || {}), t }; }); beepShort(); rerender(); },
  dfCT: async d => { const n = curLesson(), i = +d.i, k = +d.k, cur = (((dfX(n, d.sid, i) || {}).c || [])[k] || {}).t;
    const v = await numberBox(`Temps de ${nameOf(d.sid)} · course ${k + 1} (secondes)`, cur, { step: 0.01, min: 0, max: 3600, unit: 's' }); if (v === undefined) return;
    dfSetX(n, d.sid, i, o => { o.c = o.c || []; o.c[k] = { ...(o.c[k] || {}), t: v }; }); rerender(); },
  dfJokPick: d => dfJokPick(d),
  dfJokOk: d => { const n = curLesson(); dfSetX(n, d.sid, +d.i, o => { const c = o.c[+d.k]; c.ok = c.ok === (d.v === '1') ? null : d.v === '1'; }); rerender(); },
  dfNd: d => { const n = curLesson(); dfSetX(n, d.sid, +d.i, o => { const c = o.c[+d.k]; c.nd = Math.max(0, (c.nd || 0) + +d.d); }); rerender(); },
  dfCell: d => { const n = curLesson(), s = +d.s, k = +d.k; dfSetX(n, d.sid, +d.i, o => { o.r = o.r || []; const row = o.r[s] = o.r[s] || []; const v = row[k]; row[k] = v == null ? 2 : v === 2 ? 1 : v === 1 ? 0 : null; });
    if (dfEx(n, +d.i).pil === 'rep' && ((dfX(n, d.sid, +d.i).r || [])[s] || [])[k] === 2) { UI.dfPk = `s${s}r${k}`; }
    rerender(); },
  dfForme: d => { const n = curLesson(), v = !dfForme(n, d.sid); setRes(n, d.sid, r => { r.v.fo = v; }); rerender(); },
  dfPilOpen: d => { UI.dfPk = null; dfPilModal(curLesson(), d.sid, +d.i); },
  dfPilSet: d => { const n = curLesson(), i = +d.i; dfSetX(n, d.sid, i, X => { X.pil = X.pil || {}; const by = (X.pil[d.key] || {}).by; X.pil[d.key] = { ...dfPilApply({ ...(X.pil[d.key] || {}) }, d), ...(by ? { by } : {}) }; });
    UI.dfPk = d.key; dfPilModal(n, d.sid, i); },
  dfPlotsGuide: () => dfPlotsGuide(),
});
