/* =====================================================================
   DEMI-FOND N'EPS — Les Aventuriers du 44 (jeu de relais en binômes / trinômes)
   1 tronçon du plateau = 1 tour de piste. Le coureur court X tours puis « achète »
   un trajet de X tronçons sur la carte de son équipe. Parcours (2 villes) à relier.
   ===================================================================== */
'use strict';
const DF_ROUTES = DF_PLATEAU.routes;
const DF_CITY = Object.fromEntries(DF_PLATEAU.cities.map(c => [c.n, c]));
const DF_TTR = { 1:1, 2:2, 3:4, 4:7, 5:10, 6:15 };                 // points d'un trajet selon sa longueur (règle du jeu)
const DF_RCOL = { rouge:'#E3262B', bleu:'#1E5FD8', vert:'#1FA24A', jaune:'#FFD400', orange:'#FF7A00', violet:'#8A2BE2', rose:'#FF4FA3', gris:'#8A94A6' };

/* plus court chemin (en tronçons) entre deux villes → valeur d'un parcours */
const DF_TICKETS = (() => {
  const names = DF_PLATEAU.cities.map(c => c.n), adj = {}; names.forEach(c => adj[c] = []);
  DF_ROUTES.forEach(r => { adj[r.a].push([r.b, r.segments]); adj[r.b].push([r.a, r.segments]); });
  const dist = src => { const D = Object.fromEntries(names.map(c => [c, Infinity])); D[src] = 0; const Q = new Set(names);
    while (Q.size) { let u = null; Q.forEach(c => { if (u == null || D[c] < D[u]) u = c; }); Q.delete(u); adj[u].forEach(([v, w]) => { if (D[u] + w < D[v]) D[v] = D[u] + w; }); } return D; };
  const out = []; names.forEach((a, ia) => { const D = dist(a); names.forEach((b, ib) => { if (ib > ia && D[b] >= 4 && D[b] <= 12) out.push({ a, b, pts: D[b] }); }); });
  return out.sort((x, y) => x.pts - y.pts || x.a.localeCompare(y.a)).map((t, k) => ({ ...t, id: k }));
})();
/* hasard reproductible (même tirage sur toutes les tablettes si l'enseignant n'a pas attribué) */
const dfRng = seed => () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
function dfAttribParcours(n, i, e, mode, rnd = Math.random){
  const teams = dfTeams(n, i, e), nb = Math.max(1, ...Object.values(teams).map(t => t + 1)), out = {}, T = DF_TICKETS, k = e.nbParc || 3;
  const pick = (pool, used) => { const P = pool.filter(t => !used.includes(t.id)); return P.length ? P[Math.floor(rnd() * P.length)] : null; };
  if (mode === 'vma') {
    const str = Array.from({ length: nb }, (_, t) => { const v = vals(Object.keys(teams).filter(s => teams[s] === t).map(s => dfVmaFor(n, s, i))); return { t, v: v.length ? avg(v) : 0 }; }).sort((a, b) => a.v - b.v);
    str.forEach((x, rank) => { const lo = Math.floor(rank / nb * T.length * 0.7), hi = Math.max(lo + k + 2, Math.ceil((rank + 1) / nb * T.length * 0.7 + T.length * 0.3)); const pool = T.slice(lo, Math.min(T.length, hi)), used = [];
      for (let q = 0; q < k; q++) { const t = pick(pool, used) || pick(T, used); if (t) used.push(t.id); } out[x.t] = used; });
  } else for (let t = 0; t < nb; t++) { const used = []; for (let q = 0; q < k; q++) { const tk = pick(T, used); if (tk) used.push(tk.id); } out[t] = used; }
  return out;
}
const dfParc = (n, i, e) => e.parc && Object.keys(e.parc).length ? e.parc : dfAttribParcours(n, i, e, 'alea', dfRng(n * 100 + i + 7));

/* analyse d'une équipe : trajets, villes, parcours reliés (dans l'ordre des achats) */
function dfAvTeam(n, i, e, t){
  const teams = dfTeams(n, i, e), members = sortedStudents().filter(s => teams[s.id] === t);
  const buys = []; members.forEach(s => ((dfX(n, s.id, i) || {}).buys || []).forEach(b => buys.push({ ...b, sid: s.id }))); buys.sort((a, b) => a.ts - b.ts);
  const par = {}, find = c => { while (par[c] && par[c] !== c) c = par[c]; return c; }, cities = new Set(), tk = (dfParc(n, i, e)[t] || []).map(id => DF_TICKETS[id]).filter(Boolean);
  let trajets = 0, citiesAt = null; const done = {};
  buys.forEach(b => { const r = DF_ROUTES[b.r]; if (!r) return; trajets += DF_TTR[r.segments] || r.segments;
    [r.a, r.b].forEach(c => { if (!cities.has(c)) { cities.add(c); citiesAt = b.ts; } par[c] = par[c] || c; });
    par[find(r.a)] = find(r.b);
    tk.forEach(T => { if (done[T.id] == null && par[T.a] && par[T.b] && find(T.a) === find(T.b)) done[T.id] = b.ts; }); });
  const parcours = tk.map(T => ({ ...T, done: done[T.id] != null, at: done[T.id] }));
  const pd = parcours.filter(p => p.done);
  return { t, members, buys, trajets, parcours, cities: cities.size, citiesAt, parcDone: pd.length, parcAt: pd.length ? Math.max(...pd.map(p => p.at)) : null,
    parcPts: pd.reduce((s, p) => s + p.pts, 0), owned: new Set(buys.map(b => b.r)), laps: buys.reduce((s, b) => s + (DF_ROUTES[b.r] || {}).segments, 0) };
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

/* carte d'une équipe (image du plateau + trajets cliquables) */
function dfAvMap(n, i, e, t, opts = {}){
  const a = dfAvTeam(n, i, e, t), col = dfTeamCol(t).c, tkC = new Set(a.parcours.flatMap(p => [p.a, p.b]));
  const routes = DF_ROUTES.map((r, k) => { const own = a.owned.has(k);
    return `<g class="df-rt ${own ? 'own' : ''}" ${opts.click ? `data-action="dfBuy" data-r="${k}" data-t="${t}" data-i="${i}"` : ''}>${r.cells.map(([x, y, len, ang]) =>
      `<rect x="${x - len / 2 + 2}" y="${y - 13}" width="${len - 4}" height="26" rx="9" transform="rotate(${ang} ${x} ${y})" fill="${own ? col : 'rgba(255,255,255,0.01)'}" stroke="${own ? '#fff' : 'transparent'}" stroke-width="${own ? 4 : 0}"/>`).join('')}</g>`; }).join('');
  const rings = [...tkC].map(c => { const C = DF_CITY[c]; return C ? `<circle cx="${C.x}" cy="${C.y}" r="30" fill="none" stroke="${col}" stroke-width="8" stroke-dasharray="${a.parcours.some(p => p.done && (p.a === c || p.b === c)) ? '0' : '12 7'}"/>` : ''; }).join('');
  return `<div class="df-map"><svg viewBox="0 0 ${DF_PLATEAU.w} ${DF_PLATEAU.h}"><image href="aventuriers/plateau.jpg" x="0" y="0" width="${DF_PLATEAU.w}" height="${DF_PLATEAU.h}"/>${rings}${routes}</svg></div>`;
}
function dfAvPhase(n, i, e){ const T = dfTimer(`a${n}-${i}`); if (!T.run && !T.acc) return 'libre'; const st = dfTimerState({ ...T, phases: [{ n:'Organisation', s: e.orga * 60 }, { n:'Jeu', s: e.dur * 60 }] }); return st.k === 0 ? 'orga' : st.k === 1 ? 'jeu' : 'fin'; }
function dfAventuriersView(n, i, e){
  const teams = dfTeams(n, i, e), nb = Math.max(1, ...Object.values(teams).map(t => t + 1)), tab = dfMyTab(e);
  const mine = Array.from({ length: nb }, (_, t) => t).filter(t => t % (e.tabs || 1) === tab && sortedStudents().some(s => teams[s.id] === t));
  const t = mine.includes(UI.dfTeam) ? UI.dfTeam : mine[0]; if (t == null) return `${dfTabChips(e)}<div class="card">Aucune équipe sur cette tablette.</div>`;
  const a = dfAvTeam(n, i, e, t), run = UI.dfRun && a.members.some(s => s.id === UI.dfRun) ? UI.dfRun : null, ph = dfAvPhase(n, i, e);
  const pDist = sid => ((dfX(n, sid, i) || {}).buys || []).reduce((s, b) => s + (DF_ROUTES[b.r] || {}).segments, 0) * dfLap();
  return `${dfTabChips(e)}${dfTimerHTML(`a${n}-${i}`, [{ n:'Organisation', s: e.orga * 60 }, { n:'Jeu', s: e.dur * 60 }])}
    <div class="filters"><b>Équipe :</b>${mine.map(q => `<button class="chip ${q === t ? 'on' : ''}" data-action="dfTeam" data-t="${q}"><span class="dot" style="background:${dfTeamCol(q).c}"></span>${esc(dfTeamName(e, q))}</button>`).join('')}</div>
    <div class="df-av"><div class="df-av-side">
      <div class="card"><h3>1. Qui a couru ?</h3><div class="choices">${a.members.map(s => `<button class="ch ${run === s.id ? 'on' : ''}" data-action="dfRun" data-sid="${s.id}" ${run === s.id ? `style="background:${dfTeamCol(t).c};border-color:${dfTeamCol(t).c};color:#fff"` : ''}>${esc(nameOf(s.id))}<small>${dfKm(pDist(s.id))}</small></button>`).join('')}</div>
        <p class="muted">2. Touchez le trajet couru sur la carte : <b>1 tronçon = 1 tour</b> (${dfLap()} m).</p>
        <button class="btn small ghost" data-action="dfBuyUndo" data-t="${t}" data-i="${i}" ${a.buys.length ? '' : 'disabled'}>↩ Annuler le dernier trajet</button></div>
      <div class="card"><h3>🎫 Nos parcours</h3>${a.parcours.map(p => `<div class="df-tk ${p.done ? 'ok' : ''}"><b>${esc(p.a)} → ${esc(p.b)}</b><span>${p.pts} pts ${p.done ? '✓' : ''}</span></div>`).join('')}</div>
      <div class="card df-avsc"><b>${a.trajets}</b> pts trajets · <b>${a.parcPts}</b> pts parcours · ${a.cities} villes · ${a.laps} tours (${dfKm(a.laps * dfLap())})</div>
      ${ph === 'orga' ? '<div class="card warn-card"><b>⏳ Organisation :</b> lisez vos parcours, choisissez vos trajets et l\'ordre des relais.</div>' : ph === 'fin' ? '<div class="card warn-card"><b>🏁 Partie terminée</b> : comptez les points (Espace enseignant → Bilan).</div>' : ''}
    </div>${dfAvMap(n, i, e, t, { click: true })}</div>
    <details class="card"><summary><b>🏆 Classement provisoire (saisies de cette tablette)</b></summary>${dfAvTable(n, i, e)}</details>`;
}
function dfAvTable(n, i, e){
  const A = dfAvScores(n, i, e);
  return `<div class="scroll-x"><table class="tbl"><thead><tr><th>Équipe</th><th>Trajets</th><th>Parcours</th><th>Villes</th><th>Bonus</th><th>Coef.</th><th>Total</th></tr></thead><tbody>${A.map(a => `<tr><td class="nm"><span class="dot" style="background:${dfTeamCol(a.t).c}"></span> <b>${esc(dfTeamCol(a.t).n)}</b> <small>${a.members.map(s => esc(nameOf(s.id))).join(', ')}</small></td>
    <td>${a.trajets}</td><td>${a.parcDone}/${a.parcours.length} · ${a.parcPts}</td><td>${a.cities}</td><td>${a.bonusC ? '🏙️ +10 ' : ''}${a.bonusP ? '🎫 +10' : ''}</td><td>${a.coef === 1 ? '' : '× ' + fmtN(a.coef, 2)}</td><td><b>${fmtN(a.total, 1)}</b></td></tr>`).join('')}</tbody></table></div>`;
}
DF_VIEWS.aventuriers = { view: dfAventuriersView };
DF_LINE.aventuriers = (n, sid, i, e) => { const x = dfX(n, sid, i); if (!x || !(x.buys || []).length) return ''; const t = dfTeamOf(n, i, e, sid);
  const a = t == null ? null : dfAvTeam(n, i, e, t), me = (x.buys || []).reduce((s, b) => s + (DF_ROUTES[b.r] || {}).segments, 0);
  return `<div class="muted">${x.buys.length} trajet(s) · ${me} tours · ${dfKm(me * dfLap())}${a && a.laps ? ` · ${Math.round(me / a.laps * 100)} % des tours de l'équipe` : ''}</div>`; };

Object.assign(ACT, {
  dfTeam: d => { UI.dfTeam = +d.t; UI.dfRun = null; rerender(); },
  dfRun: d => { UI.dfRun = UI.dfRun === d.sid ? null : d.sid; rerender(); },
  dfBuy: async d => {
    const n = curLesson(), i = +d.i, e = dfEx(n, i), t = +d.t, r = DF_ROUTES[+d.r], a = dfAvTeam(n, i, e, t), ph = dfAvPhase(n, i, e);
    if (a.owned.has(+d.r)) return toast('Trajet déjà acheté par votre équipe');
    if (ph === 'orga') return toast('⏳ Attendez la fin du temps d\'organisation');
    if (ph === 'fin' && !(isProf() && UI.profUnlocked)) return toast('🏁 La partie est terminée');
    if (!UI.dfRun) return toast('Choisissez d\'abord le coureur');
    if (!(await confirmBox(`${esc(r.a)} → ${esc(r.b)}`, `${esc(nameOf(UI.dfRun))} a couru <b>${r.segments} tour${r.segments > 1 ? 's' : ''}</b> (${r.segments * dfLap()} m) ? Trajet de ${r.segments} tronçon(s) : ${DF_TTR[r.segments] || r.segments} pts.`, 'Valider le trajet'))) return;
    dfSetX(n, UI.dfRun, i, o => { (o.buys = o.buys || []).push({ r: +d.r, ts: now(), tm: t }); }); beepShort(); UI.dfRun = null; rerender(); },
  dfBuyUndo: async d => { const n = curLesson(), i = +d.i, e = dfEx(n, i), a = dfAvTeam(n, i, e, +d.t), b = a.buys[a.buys.length - 1]; if (!b) return;
    if (!(await confirmBox('Annuler le dernier trajet ?', `${esc(DF_ROUTES[b.r].a)} → ${esc(DF_ROUTES[b.r].b)} (${esc(nameOf(b.sid))})`, 'Annuler le trajet', true))) return;
    dfSetX(n, b.sid, i, o => { o.buys = (o.buys || []).filter(x => x.ts !== b.ts); }); rerender(); },
});
