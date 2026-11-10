/* =====================================================================
   DEMI-FOND N'EPS — Les Aventuriers du … (jeu de relais en binômes / trinômes)
   Plateau au choix (Loire-Atlantique, France, Europe). 1 tronçon = une distance
   réglée en mètres par l'enseignant (par défaut 1 tour de piste). Le coureur court
   X tronçons puis « achète » un trajet de X tronçons sur la carte de son équipe.
   ===================================================================== */
'use strict';
const DF_TTR = { 1:1, 2:2, 3:4, 4:7, 5:10, 6:15 };                 // points d'un trajet selon sa longueur (règle du jeu)
const DF_RCOL = { rouge:'#E3262B', bleu:'#1E5FD8', vert:'#1FA24A', jaune:'#FFD400', orange:'#FF7A00', violet:'#8A2BE2', rose:'#FF4FA3', gris:'#8A94A6' };

/* ---------- Plateaux ---------- */
const DF_BOARDS = {};
const dfPlatKey = e => (e && DF_PLATEAUX[e.plat]) ? e.plat : 'loire';
function dfBoard(e){
  const k = dfPlatKey(e); if (DF_BOARDS[k]) return DF_BOARDS[k];
  const P = DF_PLATEAUX[k], names = P.cities.map(c => c.n), adj = {}; names.forEach(c => adj[c] = []);
  P.routes.forEach(r => { adj[r.a].push([r.b, r.segments]); adj[r.b].push([r.a, r.segments]); });
  /* plus court chemin (en tronçons) entre deux villes → valeur d'un parcours */
  const dist = src => { const D = Object.fromEntries(names.map(c => [c, Infinity])); D[src] = 0; const Q = new Set(names);
    while (Q.size) { let u = null; Q.forEach(c => { if (u == null || D[c] < D[u]) u = c; }); Q.delete(u); adj[u].forEach(([v, w]) => { if (D[u] + w < D[v]) D[v] = D[u] + w; }); } return D; };
  const tk = []; names.forEach((a, ia) => { const D = dist(a); names.forEach((b, ib) => { if (ib > ia && D[b] >= 4 && D[b] <= 12) tk.push({ a, b, pts: D[b] }); }); });
  return DF_BOARDS[k] = { k, P, routes: P.routes, city: Object.fromEntries(P.cities.map(c => [c.n, c])), s: P.s || 1, vb: P.vb || [0, 0, P.w, P.h],
    tickets: tk.sort((x, y) => x.pts - y.pts || x.a.localeCompare(y.a)).map((t, q) => ({ ...t, id: q })) };
}
const dfBoardName = e => DF_PLATEAUX[dfPlatKey(e)].n;
/* distance d'un tronçon (m) : réglée par l'enseignant, sinon 1 tour de piste */
const dfSegM = e => Math.round(+((e && e.seg) || 0) || dfLap());
const dfSegTours = e => fmtN(dfSegM(e) / dfLap(), 2);
const dfAvSegs = (e, buys) => (buys || []).reduce((s, b) => s + ((dfBoard(e).routes[b.r] || {}).segments || 0), 0);

/* hasard reproductible (même tirage sur toutes les tablettes si l'enseignant n'a pas attribué) */
const dfRng = seed => () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
function dfAttribParcours(n, i, e, mode, rnd = Math.random){
  const teams = dfTeams(n, i, e), nb = Math.max(1, ...Object.values(teams).map(t => t + 1)), out = {}, T = dfBoard(e).tickets, k = e.nbParc || 3;
  const pick = (pool, used) => { const P = pool.filter(t => !used.includes(t.id)); return P.length ? P[Math.floor(rnd() * P.length)] : null; };
  if (mode === 'vma') {
    const str = Array.from({ length: nb }, (_, t) => { const v = vals(Object.keys(teams).filter(s => teams[s] === t).map(s => dfVmaFor(n, s, i))); return { t, v: v.length ? avg(v) : 0 }; }).sort((a, b) => a.v - b.v);
    str.forEach((x, rank) => { const lo = Math.floor(rank / nb * T.length * 0.7), hi = Math.max(lo + k + 2, Math.ceil((rank + 1) / nb * T.length * 0.7 + T.length * 0.3)); const pool = T.slice(lo, Math.min(T.length, hi)), used = [];
      for (let q = 0; q < k; q++) { const t = pick(pool, used) || pick(T, used); if (t) used.push(t.id); } out[x.t] = used; });
  } else for (let t = 0; t < nb; t++) { const used = []; for (let q = 0; q < k; q++) { const tk = pick(T, used); if (tk) used.push(tk.id); } out[t] = used; }
  return out;
}
const dfParc = (n, i, e) => e.parc && Object.keys(e.parc).length ? e.parc : dfAttribParcours(n, i, e, 'alea', dfRng(n * 100 + i + 7 + dfPlatKey(e).length));

/* analyse d'une équipe : trajets, villes, parcours reliés (dans l'ordre des achats) */
function dfAvTeam(n, i, e, t){
  const B = dfBoard(e), teams = dfTeams(n, i, e), members = sortedStudents().filter(s => teams[s.id] === t);
  const buys = []; members.forEach(s => ((dfX(n, s.id, i) || {}).buys || []).forEach(b => buys.push({ ...b, sid: s.id }))); buys.sort((a, b) => a.ts - b.ts);
  const par = {}, find = c => { while (par[c] && par[c] !== c) c = par[c]; return c; }, cities = new Set(), tk = (dfParc(n, i, e)[t] || []).map(id => B.tickets[id]).filter(Boolean);
  let trajets = 0, citiesAt = null; const done = {};
  buys.forEach(b => { const r = B.routes[b.r]; if (!r) return; trajets += DF_TTR[r.segments] || r.segments;
    [r.a, r.b].forEach(c => { if (!cities.has(c)) { cities.add(c); citiesAt = b.ts; } par[c] = par[c] || c; });
    par[find(r.a)] = find(r.b);
    tk.forEach(T => { if (done[T.id] == null && par[T.a] && par[T.b] && find(T.a) === find(T.b)) done[T.id] = b.ts; }); });
  const parcours = tk.map(T => ({ ...T, done: done[T.id] != null, at: done[T.id] }));
  const pd = parcours.filter(p => p.done);
  return { t, members, buys, trajets, parcours, cities: cities.size, citiesAt, parcDone: pd.length, parcAt: pd.length ? Math.max(...pd.map(p => p.at)) : null,
    parcPts: pd.reduce((s, p) => s + p.pts, 0), owned: new Set(buys.map(b => b.r)), laps: dfAvSegs(e, buys) };
}
function dfAvScores(n, i, e){
  const teams = dfTeams(n, i, e), nb = Math.max(0, ...Object.values(teams).map(t => t + 1));
  const A = Array.from({ length: nb }, (_, t) => dfAvTeam(n, i, e, t)).filter(a => a.members.length);
  const best = (key, at) => { const c = A.filter(a => a[key] > 0).sort((x, y) => y[key] - x[key] || (x[at] ?? 1e18) - (y[at] ?? 1e18)); return c.length ? c[0].t : null; };
  const bC = best('cities', 'citiesAt'), bP = best('parcDone', 'parcAt'), minSize = Math.min(...A.map(a => a.members.length));
  A.forEach(a => { a.bonusC = a.t === bC ? 10 : 0; a.bonusP = a.t === bP ? 10 : 0; a.brut = a.trajets + a.parcPts + a.bonusC + a.bonusP;
    a.coef = a.members.length > minSize ? (e.coefTri || 1) : 1; a.total = r10(a.brut * a.coef, 1); });
  return A.sort((x, y) => y.total - x.total);
}

/* carte d'une équipe (image du plateau + trajets cliquables + parcours en surbrillance) */
function dfAvSVG(e, inner = ''){
  const B = dfBoard(e), P = B.P, [x0, y0, w, h] = B.vb;
  return `<svg viewBox="${x0} ${y0} ${w} ${h}"><image href="${P.img}" x="${P.vb ? x0 : 0}" y="${P.vb ? y0 : 0}" width="${P.vb ? w : P.w}" height="${P.vb ? h : P.h}" preserveAspectRatio="none"/>${inner}</svg>`;
}
function dfAvMap(n, i, e, t, opts = {}){
  const B = dfBoard(e), s = B.s, a = dfAvTeam(n, i, e, t), col = dfTeamCol(t).c;
  const routes = B.routes.map((r, k) => { const own = a.owned.has(k);
    return `<g class="df-rt ${own ? 'own' : ''}" ${opts.click ? `data-action="dfBuy" data-r="${k}" data-t="${t}" data-i="${i}"` : ''}>${r.cells.map(([x, y, len, ang]) =>
      `<rect x="${x - len / 2 + 2 * s}" y="${y - 13 * s}" width="${len - 4 * s}" height="${26 * s}" rx="${9 * s}" transform="rotate(${ang} ${x} ${y})" fill="${own ? col : 'rgba(255,255,255,0.01)'}" stroke="${own ? '#fff' : 'transparent'}" stroke-width="${own ? 4 * s : 0}"/>`).join('')}</g>`; }).join('');
  /* parcours tirés au sort : halo léger sur les deux villes, cercle plein quand le parcours est relié */
  const glow = a.parcours.map(p => [p.a, p.b].map(c => { const C = B.city[c]; return C ? `<circle cx="${C.x}" cy="${C.y}" r="${40 * s}" fill="${col}" fill-opacity="${p.done ? .35 : .2}" stroke="${col}" stroke-width="${6 * s}" stroke-opacity=".9" stroke-dasharray="${p.done ? '0' : `${12 * s} ${7 * s}`}"/>` : ''; }).join('')).join('');
  return `<div class="df-map">${dfAvSVG(e, `<g style="pointer-events:none">${glow}</g>${routes}`)}</div>`;
}
function dfAvPhase(n, i, e){ const T = dfTimer(`a${n}-${i}`); if (!T.run && !T.acc) return 'libre'; const st = dfTimerState({ ...T, phases: [{ n:'Temps restant', s: e.dur * 60 }] }); return st.k === 0 ? 'jeu' : 'fin'; }
function dfAventuriersView(n, i, e){
  const teams = dfTeams(n, i, e), nb = Math.max(1, ...Object.values(teams).map(t => t + 1)), tab = dfMyTab(e), B = dfBoard(e), seg = dfSegM(e);
  const mine = Array.from({ length: nb }, (_, t) => t).filter(t => t % (e.tabs || 1) === tab && sortedStudents().some(s => teams[s.id] === t));
  const t = mine.includes(UI.dfTeam) ? UI.dfTeam : null, t0 = t ?? mine[0];
  if (t0 == null) return `${dfTabChips(e)}<div class="card">Aucune équipe sur cette tablette.</div>`;
  const a = dfAvTeam(n, i, e, t0), run = t != null && UI.dfRun && a.members.some(s => s.id === UI.dfRun) ? UI.dfRun : null, ph = dfAvPhase(n, i, e);
  const pDist = sid => dfAvSegs(e, (dfX(n, sid, i) || {}).buys) * seg, tc = q => dfTeamCol(q).c;
  return `${dfTabChips(e)}${dfTimerHTML(`a${n}-${i}`, [{ n: t != null ? `⏳ Temps restant · ${dfTeamName(e, t)} saisit` : '⏳ Temps restant (toutes les équipes)', s: e.dur * 60 }], { color: t != null ? tc(t) : null })}
    <div class="df-av"><div class="df-av-side">
      <div class="card"><h3>1. Qui saisit ?</h3><div class="df-teamsel">${mine.map(q => { const M = sortedStudents().filter(s => teams[s.id] === q);
          return `<button class="df-tsel ${q === t ? 'on' : ''}" style="--tc:${tc(q)}" data-action="dfTeam" data-t="${q}"><b>${esc(dfTeamCol(q).n)}</b><small>${M.map(s => esc(nameOf(s.id))).join(' · ')}</small></button>`; }).join('')}</div>
        ${t != null ? `<h3 style="margin-top:12px">2. Qui a couru ?</h3><div class="choices">${a.members.map(s => `<button class="ch ${run === s.id ? 'on' : ''}" data-action="dfRun" data-sid="${s.id}" ${run === s.id ? `style="background:${tc(t)};border-color:${tc(t)};color:#fff"` : ''}>${esc(nameOf(s.id))}<small>${dfKm(pDist(s.id))}</small></button>`).join('')}</div>
        <p class="muted">3. Touchez le trajet couru sur la carte : <b>1 tronçon = ${seg} m</b> (${dfSegTours(e)} tour${dfSegM(e) > dfLap() ? 's' : ''} de piste).</p>
        <button class="btn small ghost" data-action="dfBuyUndo" data-t="${t}" data-i="${i}" ${a.buys.length ? '' : 'disabled'}>↩ Annuler le dernier trajet</button>` : '<p class="muted">Touchez la couleur de l\'équipe qui vient saisir, puis le prénom du coureur.</p>'}</div>
      ${t != null ? `<div class="card"><h3>🎫 Nos parcours</h3>${a.parcours.map(p => `<div class="df-tk ${p.done ? 'ok' : ''}" style="--tc:${tc(t)}"><b>${esc(p.a)} → ${esc(p.b)}</b><span>${p.pts} pts ${p.done ? '✓' : ''}</span></div>`).join('')}</div>
      <div class="card df-avsc"><b>${a.trajets}</b> pts trajets · <b>${a.parcPts}</b> pts parcours · ${a.cities} villes · ${a.laps} tronçons (${dfKm(a.laps * seg)})</div>` : ''}
      ${ph === 'fin' ? '<div class="card warn-card"><b>🏁 Partie terminée</b> : comptez les points (Espace enseignant → Bilan).</div>' : ''}
    </div>${t != null ? dfAvMap(n, i, e, t, { click: true }) : `<div class="df-map">${dfAvSVG(e)}</div>`}</div>
    <details class="card"><summary><b>🏆 Classement provisoire (saisies de cette tablette)</b></summary>${dfAvTable(n, i, e)}</details>`;
}
function dfAvTable(n, i, e){
  const A = dfAvScores(n, i, e);
  return `<div class="scroll-x"><table class="tbl"><thead><tr><th>Équipe</th><th>Trajets</th><th>Parcours</th><th>Villes</th><th>Bonus</th><th>Coef.</th><th>Total</th></tr></thead><tbody>${A.map(a => `<tr><td class="nm"><span class="dot" style="background:${dfTeamCol(a.t).c}"></span> <b>${esc(dfTeamCol(a.t).n)}</b> <small>${a.members.map(s => esc(nameOf(s.id))).join(', ')}</small></td>
    <td>${a.trajets}</td><td>${a.parcDone}/${a.parcours.length} · ${a.parcPts}</td><td>${a.cities}</td><td>${a.bonusC ? '🏙️ +10 ' : ''}${a.bonusP ? '🎫 +10' : ''}</td><td>${a.coef === 1 ? '' : '× ' + fmtN(a.coef, 2)}</td><td><b>${fmtN(a.total, 1)}</b></td></tr>`).join('')}</tbody></table></div>`;
}
DF_VIEWS.aventuriers = { view: dfAventuriersView };
DF_LINE.aventuriers = (n, sid, i, e) => { const x = dfX(n, sid, i); if (!x || !(x.buys || []).length) return ''; const t = dfTeamOf(n, i, e, sid);
  const a = t == null ? null : dfAvTeam(n, i, e, t), me = dfAvSegs(e, x.buys);
  return `<div class="muted">${x.buys.length} trajet(s) · ${me} tronçons · ${dfKm(me * dfSegM(e))}${a && a.laps ? ` · ${Math.round(me / a.laps * 100)} % de la distance de l'équipe` : ''}</div>`; };

Object.assign(ACT, {
  dfTeam: d => { const t = +d.t; UI.dfTeam = UI.dfTeam === t ? null : t; UI.dfRun = null; rerender(); },
  dfRun: d => { UI.dfRun = UI.dfRun === d.sid ? null : d.sid; rerender(); },
  dfBuy: async d => {
    const n = curLesson(), i = +d.i, e = dfEx(n, i), t = +d.t, r = dfBoard(e).routes[+d.r], a = dfAvTeam(n, i, e, t), ph = dfAvPhase(n, i, e), seg = dfSegM(e);
    if (a.owned.has(+d.r)) return toast('Trajet déjà acheté par votre équipe');
    if (ph === 'fin' && !(isProf() && UI.profUnlocked)) return toast('🏁 La partie est terminée');
    if (!UI.dfRun) return toast('Choisissez d\'abord le coureur');
    if (!(await confirmBox(`${esc(r.a)} → ${esc(r.b)}`, `${esc(nameOf(UI.dfRun))} a couru <b>${r.segments * seg} m</b> (${r.segments} tronçon${r.segments > 1 ? 's' : ''} de ${seg} m) ? Trajet de ${r.segments} tronçon(s) : ${DF_TTR[r.segments] || r.segments} pts.`, 'Valider le trajet'))) return;
    dfSetX(n, UI.dfRun, i, o => { (o.buys = o.buys || []).push({ r: +d.r, ts: now(), tm: t }); }); beepShort(); UI.dfRun = null; rerender(); },
  dfBuyUndo: async d => { const n = curLesson(), i = +d.i, e = dfEx(n, i), a = dfAvTeam(n, i, e, +d.t), b = a.buys[a.buys.length - 1], R = dfBoard(e).routes; if (!b) return;
    if (!(await confirmBox('Annuler le dernier trajet ?', `${esc(R[b.r].a)} → ${esc(R[b.r].b)} (${esc(nameOf(b.sid))})`, 'Annuler le trajet', true))) return;
    dfSetX(n, b.sid, i, o => { o.buys = (o.buys || []).filter(x => x.ts !== b.ts); }); rerender(); },
});
