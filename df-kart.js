/* =====================================================================
   DEMI-FOND N'EPS — KART'ENDURANCE · le Grand Prix du demi-fond (jeu de cartes)
   On gagne en RESPECTANT son allure contrat (% de VMA), pas en étant le plus rapide.
   · Écuries de 4 (composition de l'exercice : 🧩 dans la Programmation) ; rôles tournants à chaque Grand Prix
   · Circuit = forme de travail (le minuteur de la tablette en suit les manches), bip régulier pour caler l'allure
   · Boîte à objets : pioche de cartes Bonus / Malus / Kart, 3 cartes au maximum en main par écurie
   · Pièces (🪙) de chaque élève : res().v.x[i].co · pièces dépensées : .cs · fair-play : .fp · tableau du pilote : .pl
   · Pioche et mains : propres à la tablette qui anime (S.dfg)
   Visuels originaux : emoji, formes et couleurs uniquement.
   ===================================================================== */
'use strict';

const DF_KFAM = { bonus:{ n:'Bonus', c:'#2E8A16' }, malus:{ n:'Malus', c:'#E03131' }, kart:{ n:'Kart', c:'#1C6ED6' } };
const DF_KAPP = { moteur:['🏃', 'Moteur'], metho:['🧠', 'Méthodologique'], social:['🤝', 'Social'] };
const DF_KROLES = [['🏎️', 'Pilote', 'Court sur son allure contrat'], ['🔧', 'Mécanicien', 'Annonce les temps de passage'], ['🚩', 'Commissaire', 'Vérifie les passages aux plots'], ['📋', 'Chef de stand', 'Gère les pièces et les cartes'], ['📣', 'Coach', 'Encourage le pilote et lui rappelle ses repères']];
const DF_KCARDS0 = [
  ['champi', 'bonus', 'Champignon', '🍄', 'Accélération de 50 m à 110 % de VMA, puis se recaler sur son allure : +2 pièces.', 'moteur', 0, '50 m'],
  ['etoile', 'bonus', 'Étoile', '⭐', 'Immunité contre les malus pendant 2 tours.', 'social', 0, '2 tours'],
  ['dore', 'bonus', 'Champignon doré', '🌟', '3 accélérations de 30 m, +1 pièce pour chacune bien recalée.', 'moteur', 0, '3 × 30 m'],
  ['aspi', 'bonus', 'Aspiration', '💨', 'Un coéquipier sert de lièvre pendant 1 tour ; les pièces sont partagées.', 'social', 0, '1 tour'],
  ['stand', 'bonus', 'Arrêt au stand', '🔧', '30 s de récupération active sans perdre de pièces.', 'metho', 0, '30 s'],
  ['klaxon', 'bonus', 'Super klaxon', '📯', 'Annule un malus joué contre ton écurie.', 'social', 0, 'immédiat'],
  ['fusee', 'bonus', 'Fusée', '🚀', 'Le mécanicien annonce les temps de passage pendant 2 tours.', 'metho', 0, '2 tours'],
  ['plume', 'bonus', 'Plume', '🪶', 'Une erreur de passage est pardonnée.', 'metho', 0, '1 passage'],
  ['relais', 'bonus', 'Relais', '🤝', 'Un coéquipier court 1 tour à ta place.', 'social', 0, '1 tour'],
  ['banane', 'malus', 'Banane', '🍌', 'La cible fait un demi-tour sur elle-même au plot, puis relance.', 'moteur', 2, '1 plot'],
  ['verte', 'malus', 'Carapace verte', '🐢', 'La cible prédit son temps au tour : ± 2 s, sinon −1 pièce.', 'metho', 2, '1 tour'],
  ['rouge', 'malus', 'Carapace rouge', '🔴', 'La cible court 1 tour sans bip, au ressenti.', 'metho', 2, '1 tour'],
  ['bleue', 'malus', 'Carapace bleue', '🔵', 'Le leader fait la prochaine manche à +5 % de VMA.', 'moteur', 2, '1 manche'],
  ['encre', 'malus', 'Encre', '🦑', 'Le mécanicien de la cible reste muet pendant 2 tours.', 'social', 2, '2 tours'],
  ['eclair', 'malus', 'Éclair', '⚡', 'Les autres écuries passent à l\'allure 3 000 m pendant 1 tour.', 'moteur', 2, '1 tour'],
  ['bombe', 'malus', 'Bombe', '💣', 'La cible estime sa fréquence cardiaque : ± 10 battements par minute, sinon −1 pièce.', 'metho', 2, 'immédiat'],
  ['brouill', 'malus', 'Brouillard', '🌫️', 'La cible n\'a plus que des repères tous les 100 m.', 'metho', 2, '1 manche'],
  ['regul', 'kart', 'Régulier', '⏱️', 'Même temps à chaque tour : +1 pièce si tous les tours sont à ± 2 s.', 'metho', 0, '1 manche'],
  ['turbo', 'kart', 'Turbo final', '🔥', 'Negative split : la 2e moitié de course plus rapide que la 1re.', 'metho', 0, '1 manche'],
  ['lievre', 'kart', 'Lièvre', '🐇', 'Tu emmènes un coéquipier à son allure contrat.', 'social', 0, '1 manche'],
].map(([id, fam, name, ico, effet, app, cost, dur]) => ({ id, fam, name, ico, effet, app, cost, dur }));
/* cartes de la classe : cartes de base (désactivables) + cartes inventées par les élèves (Paramètres envoyés par le QR) */
const dfKCards = () => [...DF_KCARDS0, ...((S.params && S.params.kcards) || [])];
const dfKOn = c => !((S.params && S.params.koff) || []).includes(c.id);
const dfKCard = id => dfKCards().find(c => c.id === id) || null;
/* circuits = forme de travail de la manche */
const DF_KCIRC = {
  champi:{ n:'Circuit Champignon', ico:'🍄', reps:10, work:30, rec:30, pct:100, d:'30 s / 30 s à 100-105 % de VMA' },
  etoile:{ n:'Circuit Étoile', ico:'⭐', reps:3, work:180, rec:60, pct:85, d:'3 × 3 min à 85-90 % de VMA' },
  arc:{ n:'Circuit Arc-en-ciel', ico:'🌈', reps:1, work:660, rec:0, pct:80, d:'11 min à 80 % de VMA' },
  chateau:{ n:'Circuit Château', ico:'🏰', reps:2, work:360, rec:120, pct:85, d:'2 × 6 min à 85-90 % de VMA (évaluation)' },
};
/* modèles de leçon : quelles cartes entrent dans la pioche, et en combien d'exemplaires */
const DF_KART_MOD = {
  bonus:{ t:'Bonus seulement', circ:'champi', obj:'Découvrir son allure contrat et les temps de passage.', pick: c => c.fam === 'bonus' ? 2 : 0 },
  bm:{ t:'Bonus + Malus', circ:'etoile', obj:'Tenir son allure malgré les imprévus.', pick: c => c.fam === 'bonus' ? 2 : c.fam === 'malus' ? 1 : 0 },
  eleves:{ t:'Cartes inventées par les élèves', circ:'arc', obj:'Jouer avec les cartes inventées par la classe.', pick: c => c.byEl ? 2 : (c.fam === 'bonus' || c.fam === 'kart') ? 1 : 0 },
  chateau:{ t:'Circuit Château (évaluation)', circ:'chateau', obj:'Respecter son contrat sur toute la course.', pick: c => c.fam === 'kart' ? 1 : (c.id === 'plume' || c.id === 'stand') ? 1 : 0 },
};
const dfKMod = e => DF_KART_MOD[e.modele] || DF_KART_MOD.bonus;
const dfKCirc = e => DF_KCIRC[e.circ] || DF_KCIRC[dfKMod(e).circ];
const dfKPct = e => e.pct || dfKCirc(e).pct;
function dfKPhases(e){ const C = dfKCirc(e), P = []; for (let k = 0; k < C.reps; k++) { P.push({ n: `🏎️ Manche ${k + 1}/${C.reps} · ${dfKPct(e)} % VMA`, s: C.work, run: true }); if (C.rec && k < C.reps - 1) P.push({ n: '🔧 Stand · récupération', s: C.rec }); } return P; }
function dfKDeck(e){ const d = []; dfKCards().filter(dfKOn).forEach(c => { const k = dfKMod(e).pick(c); for (let j = 0; j < k; j++) d.push(c.id); }); return shuffle(d); }
const dfKG = (n, i, e) => { const G = dfGame(n, i, () => ({ gp:1, deck:null, hands:{}, log:[], tab:'jouer' })); if (!G.deck) G.deck = dfKDeck(e); return G; };
const dfKLog = (G, t) => { G.log.push({ t: Date.now(), txt: t }); };
/* écuries : équipes de l'exercice (membres triés par nom) ; rôle = (rang + Grand Prix − 1) modulo 4 */
function dfKEcs(n, i, e){ const T = dfTeams(n, i, e), nb = Math.max(0, ...Object.values(T).map(t => t + 1));
  return Array.from({ length: nb }, (_, t) => ({ t, c: dfTeamCol(t).c, name: dfTeamName(e, t), m: sortedStudents().filter(s => T[s.id] === t && dfPresent(n, s.id) && dfConc(e, s.id)).map(s => s.id) })).filter(E => E.m.length); }
/* un seul pilote par écurie : la rotation se fait sur la taille de l'écurie (5e membre et suivants : coach) */
const dfKRole = (E, sid, gp) => { const k = E.m.indexOf(sid); return k < 0 ? null : Math.min((k + gp - 1) % E.m.length, DF_KROLES.length - 1); };
const dfKCo = (n, i, sid) => { const x = dfX(n, sid, i) || {}; return (x.co || 0) - (x.cs || 0); };
const dfKEcCo = (n, i, E) => E.m.reduce((a, sid) => a + dfKCo(n, i, sid), 0);
const dfKFair = (n, i, E) => E.m.reduce((a, sid) => a + ((dfX(n, sid, i) || {}).fp || 0), 0);

/* ---------- carte (HTML) ---------- */
function dfKCardHTML(c, small){
  if (!c) return ''; const F = DF_KFAM[c.fam] || DF_KFAM.bonus, A = DF_KAPP[c.app] || DF_KAPP.moteur;
  return `<div class="df-kc ${small ? 'sm' : ''} ${dfKOn(c) ? '' : 'off'}" style="--kc:${F.c}"><div class="df-kc-band"><span>${F.n}</span><span>🪙 ${c.cost || 0}</span></div>
    <div class="df-kc-ico">${esc(c.ico || '🎴')}</div><div class="df-kc-name">${esc(c.name)}</div><div class="df-kc-fx">${esc(c.effet || '')}</div>
    <div class="df-kc-foot"><span>${A[0]} ${A[1]}</span><span>${c.dur ? esc(c.dur) : ''}${c.byEl ? ' · ✍️ élèves' : ''}</span></div></div>`;
}

/* ---------- écran de la tablette ---------- */
function dfKartView(n, i, e){
  const G = dfKG(n, i, e), tab = G.tab || 'jouer';
  const nav = `<div class="filters">${[['jouer', '🏁 Jouer'], ['cartes', '🎴 Cartes'], ['bilan', '🏆 Classements et tableau de bord']].map(([k, l]) => `<button class="chip ${tab === k ? 'on' : ''}" data-action="dfKTab" data-i="${i}" data-v="${k}">${l}</button>`).join('')}</div>`;
  return `<div class="card df-khead"><b>🏎️ On gagne en <u>respectant son allure contrat</u>, pas en étant le plus rapide.</b> <span class="muted">· ${esc(dfKMod(e).t)} · 🎯 ${esc(dfKMod(e).obj)}</span></div>${nav}` +
    (tab === 'cartes' ? dfKCartes(n, i, e) : tab === 'bilan' ? dfKBilan(n, i, e) : dfKJouer(n, i, e));
}
function dfKJouer(n, i, e){
  const G = dfKG(n, i, e), Es = dfKEcs(n, i, e), C = dfKCirc(e), pct = dfKPct(e), key = `k${n}-${i}`, T = dfTimer(key), bp = e.beep || 15, lap = dfLap();
  T.quiet = false;
  T.onTick = T_ => { const st = dfTimerState(T_), ph = (T_.phases || [])[st.k]; if (!ph || !ph.run) { T_._b = null; return; } const into = ph.s - st.left, b = Math.floor(into / bp); if (T_._b != null && b > T_._b && st.left > 0.5) dfSnd.tick(); T_._b = b; };
  T.onPhase = st => { const ph = (T.phases || [])[st.k]; if (!ph) { beepEnd(); dfSay('Drapeau à damier ! Fin du Grand Prix ' + G.gp + '.'); return; } if (ph.run) { dfSnd.whistle(); dfSay('Feu vert ! ' + ph.n.replace(/^🏎️ /, '').replace('/', ' sur '), 0.6); } else { beepEnd(); dfSay('Arrêt au stand.', 0.5); } };
  T.onGo = T_ => { T_._b = 0; if (T_.acc < 1) dfSay(`Grand Prix ${G.gp}. Pilotes, à vos marques. Allure ${pct} pour cent.`); };
  return `<div class="card"><div class="btn-row spread"><div><b>${C.ico} ${esc(C.n)}</b> · ${esc(C.d)}<br><span class="muted">Allure contrat <b>${pct} % de VMA</b> · un bip toutes les <b>${bp} s</b></span></div>
      <div class="btn-row"><b>Grand Prix</b><div class="stepper"><button class="cbtn" data-action="dfKGp" data-i="${i}" data-d="-1">−</button><b class="df-sv">${G.gp} / ${e.gp || 4}</b><button class="cbtn" data-action="dfKGp" data-i="${i}" data-d="1">+</button></div>${dfVoiceBtn()}</div></div></div>
    ${dfTimerHTML(key, dfKPhases(e), { extra: `<button class="btn ghost" data-action="dfTm" data-key="${key}" data-a="next">⏭</button>` })}
    <div class="card btn-row spread"><div class="btn-row"><button class="btn primary df-kbox" data-action="dfKDraw" data-i="${i}">🎁 Boîte à objets</button><span class="muted">Pioche : <b>${G.deck.length}</b> carte(s)</span><button class="btn small ghost" data-action="dfKShuffle" data-i="${i}">🔀 Refaire la pioche</button></div>
      <span class="muted">🪙 Passage dans l'allure +1 · ⭐ tour parfait +1 et une carte · 🎯 ressenti juste +2 · jouer un malus coûte 2</span></div>
    <p class="muted">Rôles tournants à chaque Grand Prix : ${DF_KROLES.slice(0, 4).map(r => r[0] + ' ' + r[1]).join(' · ')} (et 📣 coach dans une écurie de 5). Les écuries se composent dans la Programmation (🧩).</p>
    <div class="df-kecs">${Es.map(E => { const pil = E.m.find(sid => dfKRole(E, sid, G.gp) === 0), ref = pil ? dfVmaRef(n, pil, i) : null, t50 = ref ? dfTime(50, ref.v, pct) : null, hand = G.hands[E.t] || [];
      return `<div class="df-kec" style="--ec:${E.c};--et:${darkTxt(E.c) ? '#0A1633' : '#fff'}"><div class="df-kec-h"><b>${esc(E.name)}</b><span class="df-kcoins">🪙 ${dfKEcCo(n, i, E)}</span></div>
        ${pil ? `<div class="df-kpil"><div><small>🏎️ Pilote du Grand Prix ${G.gp}</small><b>${esc(nameOf(pil))}</b><small>${ref ? `VMA ${fmtN(ref.v, 1)} · ${pct} % → <b>50 m en ${fmtN(t50, 1)} s</b> · 1 tour (${lap} m) en ${dfT(dfTime(lap, ref.v, pct))}` : 'pas de VMA'}</small></div>
          <div class="btn-row"><button class="btn small" data-action="dfKCo" data-i="${i}" data-sid="${pil}" data-v="1">✓ Passage +1</button><button class="btn small primary" data-action="dfKPerf" data-i="${i}" data-sid="${pil}" data-t="${E.t}">⭐ Tour parfait</button><button class="btn small" data-action="dfKCo" data-i="${i}" data-sid="${pil}" data-v="2">🎯 Ressenti juste +2</button></div></div>` : ''}
        <div class="df-kmem">${E.m.map(sid => { const r = DF_KROLES[dfKRole(E, sid, G.gp)];
          return `<div class="df-km ${r[1] === 'Pilote' ? 'pil' : ''}"><span title="${esc(r[2])}">${r[0]}</span><span class="df-kmn">${esc(nameOf(sid))}<small>${r[1]}</small></span>
            <button class="cbtn" data-action="dfKCo" data-i="${i}" data-sid="${sid}" data-v="-1">−</button><b>${dfKCo(n, i, sid)}</b><button class="cbtn" data-action="dfKCo" data-i="${i}" data-sid="${sid}" data-v="1">+</button></div>`; }).join('')}</div>
        <div class="df-khand"><small class="muted">Main ${hand.length}/3</small><div class="df-khand-c">${hand.map((id, k) => { const c = dfKCard(id); return c ? `<div>${dfKCardHTML(c, true)}<div class="btn-row"><button class="btn small primary" data-action="dfKPlay" data-i="${i}" data-t="${E.t}" data-k="${k}">Jouer</button><button class="btn small ghost" data-action="dfKDisc" data-i="${i}" data-t="${E.t}" data-k="${k}">✕</button></div></div>` : ''; }).join('') || '<span class="muted">Aucune carte</span>'}</div></div>
        <div class="btn-row spread df-kfair"><span>🤝 Fair-play</span><span class="btn-row"><button class="cbtn" data-action="dfKFp" data-i="${i}" data-t="${E.t}" data-d="-1">−</button><b>${dfKFair(n, i, E)}</b><button class="cbtn" data-action="dfKFp" data-i="${i}" data-t="${E.t}" data-d="1">+</button></span></div></div>`; }).join('') || '<p class="muted">Aucune écurie : composez-les dans la Programmation (🧩).</p>'}</div>
    ${G.log.length ? `<div class="card"><h3>📜 Journal de la partie</h3><ul class="df-log">${G.log.slice().reverse().slice(0, 20).map(l => `<li><small>${new Date(l.t).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })}</small> ${esc(l.txt)}</li>`).join('')}</ul></div>` : ''}`;
}
function dfKCartes(n, i, e){
  const L = dfKCards();
  return `<div class="card"><div class="btn-row spread"><h3 style="margin:0">🎴 Les cartes de la classe</h3><div class="btn-row">${isProf() && UI.profUnlocked ? '<button class="btn small primary" data-action="dfKNew">＋ Carte inventée par les élèves</button>' : ''}<button class="btn small" data-action="dfKPrint">🖨 Cartes à découper</button></div></div>
    <p class="muted">Pioche de ce modèle (${esc(dfKMod(e).t)}) : ${L.filter(dfKOn).map(c => [c, dfKMod(e).pick(c)]).filter(q => q[1]).map(([c, k]) => `${c.ico} ${esc(c.name)} ×${k}`).join(' · ') || 'vide'}. ${isProf() && UI.profUnlocked ? 'Touchez une carte pour la retirer des pioches (ou la remettre). Renvoyez le QR de la leçon après une modification.' : ''}</p>
    <div class="df-kgrid">${L.map(c => `<div class="df-kcell" ${isProf() && UI.profUnlocked ? `data-action="dfKOnOff" data-id="${c.id}"` : ''}>${dfKCardHTML(c)}${c.byEl && isProf() && UI.profUnlocked ? `<button class="btn small ghost" data-action="dfKDel" data-id="${c.id}">🗑 Supprimer</button>` : ''}</div>`).join('')}</div></div>`;
}
function dfKBilan(n, i, e){
  const Es = dfKEcs(n, i, e), pct = dfKPct(e), medal = k => ['🥇', '🥈', '🥉'][k] || (k + 1) + '.', all = Es.flatMap(E => E.m.map(sid => ({ sid, E })));
  const pil = [...all].sort((a, b) => dfKCo(n, i, b.sid) - dfKCo(n, i, a.sid)), ec = [...Es].sort((a, b) => dfKEcCo(n, i, b) - dfKEcCo(n, i, a)), fp = [...Es].sort((a, b) => dfKFair(n, i, b) - dfKFair(n, i, a));
  return `<div class="card df-kranks"><div><h3>🏎️ Coupe Pilote</h3><ol>${pil.slice(0, 10).map((q, k) => `<li><span>${medal(k)}</span>${esc(nameOf(q.sid))}<b>🪙 ${dfKCo(n, i, q.sid)}</b></li>`).join('')}</ol></div>
    <div><h3>🏁 Coupe Écurie</h3><ol>${ec.map((E, k) => `<li><span>${medal(k)}</span><i class="dot" style="background:${E.c}"></i>${esc(E.name)}<b>🪙 ${dfKEcCo(n, i, E)}</b></li>`).join('')}</ol></div>
    <div><h3>🤝 Trophée Fair-Play</h3><ol>${fp.map((E, k) => `<li><span>${medal(k)}</span><i class="dot" style="background:${E.c}"></i>${esc(E.name)}<b>${dfKFair(n, i, E)} pt</b></li>`).join('')}</ol></div></div>
  <div class="card scroll-x"><h3>📋 Tableau de bord des pilotes</h3><p class="muted">Fréquence cardiaque à l'arrivée, ressenti sur l'échelle de Borg (6 = aucun effort, 20 = effort maximal) et ce que l'élève changera la prochaine fois.</p>
    <table class="tbl"><thead><tr><th>Pilote</th><th>VMA</th><th>50 m à ${pct} %</th><th>FC</th><th>Borg</th><th>Ce que je change la prochaine fois</th><th>🪙</th></tr></thead><tbody>
    ${all.map(({ sid, E }) => { const ref = dfVmaRef(n, sid, i), pl = (dfX(n, sid, i) || {}).pl || {};
      return `<tr><td class="nm"><i class="dot" style="background:${E.c}"></i> ${esc(nameOf(sid))}</td><td>${ref ? fmtN(ref.v, 1) : '—'}</td><td>${ref ? fmtN(dfTime(50, ref.v, pct), 1) + ' s' : '—'}</td>
        <td><button class="btn small" data-action="dfKPl" data-i="${i}" data-sid="${sid}" data-k="fc">${pl.fc || '✎'}</button></td><td><button class="btn small" data-action="dfKPl" data-i="${i}" data-sid="${sid}" data-k="borg">${pl.borg || '✎'}</button></td>
        <td><button class="btn small ghost" data-action="dfKPl" data-i="${i}" data-sid="${sid}" data-k="chg" style="text-align:left">${pl.chg ? esc(pl.chg) : '✎ Partir moins vite, respirer en rythme…'}</button></td><td><b>${dfKCo(n, i, sid)}</b></td></tr>`; }).join('')}</tbody></table></div>`;
}
DF_VIEWS.kart = { view: dfKartView };
DF_LINE.kart = (n, sid, i) => { const x = dfX(n, sid, i); if (!x) return ''; const pl = x.pl || {};
  return `<div class="muted">🪙 ${dfKCo(n, i, sid)} pièce(s)${x.fp ? ' · 🤝 ' + x.fp : ''}${pl.fc ? ' · FC ' + pl.fc : ''}${pl.borg ? ' · Borg ' + pl.borg : ''}${pl.chg ? ' · « ' + esc(pl.chg) + ' »' : ''}</div>`; };

/* boîte à objets : tirer une carte et la donner à une écurie */
function dfKDraw(n, i){
  const e = dfEx(n, i), G = dfKG(n, i, e), Es = dfKEcs(n, i, e);
  if (!G.deck.length) return toast('La pioche est vide : refaites la pioche.');
  const id = G.deck.pop(), c = dfKCard(id); save(); dfSnd.whistle();
  const m = modal(`<h2>🎁 Boîte à objets</h2><div class="df-kflip">${dfKCardHTML(c)}</div><p class="muted">À quelle écurie donner la carte ? (3 cartes au maximum en main)</p>
    <div class="btn-row">${Es.map(E => { const k = (G.hands[E.t] || []).length; return `<button class="btn" style="border-color:${E.c}" data-t="${E.t}" ${k >= 3 ? 'disabled' : ''}>${esc(E.name)} (${k}/3)</button>`; }).join('')}<button class="btn ghost" data-t="">Remettre dans la pioche</button></div>`);
  m.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { const t = b.dataset.t;
    if (t === '') G.deck.unshift(id); else { const h = G.hands[t] = G.hands[t] || []; if (h.length < 3) { h.push(id); dfKLog(G, `${dfTeamName(e, +t)} reçoit « ${c.name} ».`); } }
    save(); closeModal(); rerender(); });
}
Object.assign(ACT, {
  dfKTab: d => { const n = curLesson(); dfKG(n, +d.i, dfEx(n, +d.i)).tab = d.v; save(); rerender(); },
  dfKGp: d => { const n = curLesson(), e = dfEx(n, +d.i), G = dfKG(n, +d.i, e); G.gp = Math.max(1, Math.min(e.gp || 4, G.gp + +d.d)); dfKLog(G, `Grand Prix ${G.gp} : les rôles tournent.`); save(); rerender(); },
  dfKDraw: d => dfKDraw(curLesson(), +d.i),
  dfKShuffle: d => { const n = curLesson(), e = dfEx(n, +d.i), G = dfKG(n, +d.i, e); G.deck = dfKDeck(e); save(); toast('🔀 Pioche refaite'); rerender(); },
  dfKCo: d => { const n = curLesson(), v = +d.v; dfSetX(n, d.sid, +d.i, o => { o.co = Math.max(0, (o.co || 0) + v); }); if (v > 0) dfSnd.coin(); const y = scrollY; rerender(); scrollTo(0, y); },
  dfKPerf: d => { const n = curLesson(), i = +d.i, G = dfKG(n, i, dfEx(n, i)); dfSetX(n, d.sid, i, o => { o.co = (o.co || 0) + 1; }); dfSnd.coin(); dfKLog(G, `⭐ Tour parfait de ${nameOf(d.sid)} : +1 pièce et une carte.`); save(); rerender(); dfKDraw(n, i); },
  dfKFp: d => { const n = curLesson(), i = +d.i, e = dfEx(n, i), E = dfKEcs(n, i, e).find(q => q.t === +d.t); if (!E) return;
    const sid = +d.d > 0 ? E.m[0] : E.m.find(s => (dfX(n, s, i) || {}).fp > 0); if (!sid) return; dfSetX(n, sid, i, o => { o.fp = Math.max(0, (o.fp || 0) + +d.d); if (!o.fp) delete o.fp; }); const y = scrollY; rerender(); scrollTo(0, y); },
  dfKDisc: d => { const n = curLesson(), i = +d.i, G = dfKG(n, i, dfEx(n, i)), h = G.hands[d.t] || [], id = h.splice(+d.k, 1)[0]; dfKLog(G, `Carte « ${(dfKCard(id) || {}).name} » défaussée.`); save(); rerender(); },
  dfKPlay: async d => { const n = curLesson(), i = +d.i, e = dfEx(n, i), G = dfKG(n, i, e), Es = dfKEcs(n, i, e), E = Es.find(q => q.t === +d.t), h = G.hands[d.t] || [], c = dfKCard(h[+d.k]); if (!c || !E) return;
    if (dfKEcCo(n, i, E) < (c.cost || 0)) return toast(`Pas assez de pièces : cette carte coûte ${c.cost}.`);
    let tg = null; if (c.fam === 'malus') { tg = await choiceBox(`${esc(c.ico)} ${esc(c.name)} · quelle écurie vise-t-on ?`, esc(c.effet), Es.filter(q => q.t !== E.t).map(q => ({ label: esc(q.name), value: q }))); if (!tg) return; }
    h.splice(+d.k, 1);
    let rest = c.cost || 0; E.m.forEach(sid => { if (rest <= 0) return; const a = Math.min(rest, dfKCo(n, i, sid)); if (a > 0) { dfSetX(n, sid, i, o => { o.cs = (o.cs || 0) + a; }); rest -= a; } });
    dfKLog(G, `${E.name} joue « ${c.name} »${tg ? ' contre ' + tg.name : ''} : ${c.effet}`); save(); toast(`${c.ico} ${c.name}${tg ? ' → ' + tg.name : ''}`); rerender(); },
  dfKPl: async d => { const n = curLesson(), i = +d.i, pl = ((dfX(n, d.sid, i) || {}).pl || {}), k = d.k;
    const v = k === 'chg' ? await textBox(`${nameOf(d.sid)} : ce que je change la prochaine fois`, pl.chg || '') : await numberBox(k === 'fc' ? `${nameOf(d.sid)} : fréquence cardiaque à l'arrivée` : `${nameOf(d.sid)} : ressenti (Borg, de 6 à 20)`, pl[k], k === 'fc' ? { step: 1, min: 60, max: 230, unit: 'bpm' } : { step: 1, min: 6, max: 20 });
    if (v === undefined || (k === 'chg' && v == null)) return; dfSetX(n, d.sid, i, o => { o.pl = { ...(o.pl || {}), [k]: v }; if (v == null || v === '') delete o.pl[k]; }); rerender(); },
  dfKOnOff: d => { S.params = S.params || {}; const a = new Set(S.params.koff || []); a.has(d.id) ? a.delete(d.id) : a.add(d.id); S.params.koff = [...a]; save(); rerender(); },
  dfKNew: async () => { const name = await textBox('Nom de la carte inventée (ex. « Turbo-relais »)', ''); if (!name) return;
    const fam = await choiceBox('Famille de la carte', '', Object.entries(DF_KFAM).map(([k, F]) => ({ label: F.n, value: k }))); if (!fam) return;
    const effet = await textBox('Effet en jeu (une phrase courte)', ''); if (!effet) return;
    const app = await choiceBox('Ce que la carte fait travailler', '', Object.entries(DF_KAPP).map(([k, A]) => ({ label: A[0] + ' ' + A[1], value: k }))) || 'moteur';
    S.params = S.params || {}; S.params.kcards = [...(S.params.kcards || []), { id: 'el' + rnd(4), fam, name, ico: fam === 'malus' ? '🌀' : fam === 'kart' ? '🛞' : '🎁', effet, app, cost: fam === 'malus' ? 2 : 0, dur: '', byEl: true }];
    save(); toast('✓ Carte ajoutée (modèle « Cartes inventées par les élèves »)'); rerender(); },
  dfKDel: async d => { if (!(await confirmBox('Supprimer cette carte ?', esc((dfKCard(d.id) || {}).name || ''), 'Supprimer', true))) return; S.params.kcards = (S.params.kcards || []).filter(c => c.id !== d.id); save(); rerender(); },
  dfKPrint: () => { modal(`<h2>🖨 Kart'Endurance · cartes à découper</h2><p class="muted no-print">Imprimez en couleur, puis découpez. Cartes actives de la classe.</p><div class="df-kprint">${dfKCards().filter(dfKOn).map(c => dfKCardHTML(c)).join('')}</div>
    <div class="btn-row spread no-print" style="margin-top:12px"><button class="btn" data-print>🖨 Imprimer</button><button class="btn primary" data-close>Fermer</button></div>`, { wide: true }); dfModalBind(); },
});
