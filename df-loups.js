/* =====================================================================
   DEMI-FOND N'EPS — GARE AUX LOUPS (jeu de demi-fond à rôles secrets)
   On ne gagne pas en courant plus vite que les autres : on gagne en courant JUSTE (% de VMA).
   · Nuits = courses à allure imposée, avec un signal toutes les X s ; Jours = débat, indices, vote (récupération en marchant)
   · Le gardien du temps relève le plot atteint à chaque signal : contrat tenu (≥ 75 % des signaux à ± tolérance) = droit de vote
   · Par élève (res().v.x[i]) : rôle .role, statut .st, camp .camp, droit de vote forcé .vote, plots atteints .g[nuit] = [plots cumulés]
   · Propre à la tablette qui anime (S.dfg) : répartition des rôles, votes, étoiles, indices, journal
   Visuels originaux : emoji et formes uniquement.
   ===================================================================== */
'use strict';

const DF_LTYPES = { role:'Rôle', defi:'Défi', regle:'Règle spéciale', mission:'Mission secrète' };
const DF_LCAMPS = { loups:{ n:'Loups', ico:'🐺', c:'#3B2A7A' }, humains:{ n:'Village', ico:'🏡', c:'#2F7A3A' }, neutre:{ n:'Neutre', ico:'⚖️', c:'#9C6B12' } };
const DF_LSTATUS = { humain:['👤', 'Humain', '#2F7A3A'], mordu:['🩸', 'Mordu', '#C92A2A'], gueri:['💚', 'Guéri', '#0CA678'], revele:['👁️', 'Révélé', '#7048E8'] };
const DF_LCARDS = [
  ['loup', 'role', 'loups', 'Loup-Garou', '🐺', 'Mord les humains en réussissant des défis. Reçoit des missions secrètes.', 'Mordre des humains sans être démasqué.'],
  ['villageois', 'role', 'humains', 'Villageois', '👤', 'Court son contrat, observe, accuse, vote.', 'Tenir son contrat pour garder le droit de vote.'],
  ['voyante', 'role', 'humains', 'Voyante', '🔮', 'Si elle tient 3 signaux parfaits d\'affilée (pile sur le plot), elle regarde la carte d\'un joueur.', '3 signaux parfaits d\'affilée.'],
  ['sorciere', 'role', 'humains', 'Sorcière', '🧪', 'Potion de vie : court un tour de plus à son allure pour sauver un mordu. Potion de mort : sert de lièvre à un villageois ; s\'il réussit son contrat, un loup choisi par vote perd un pouvoir.', 'Chaque potion sert une fois par partie.'],
  ['chasseur', 'role', 'humains', 'Chasseur', '🏹', 'S\'il réussit un negative split (2e moitié plus rapide que la 1re), il désigne un loup présumé. Si c\'en est un, le loup est guéri.', 'Negative split réussi.'],
  ['gardien', 'role', 'neutre', 'Gardien du temps', '⏱️', 'Relève le plot atteint par son coureur à chaque signal et note les indices suspects. Le rôle tourne à chaque nuit.', 'Relevés exacts et complets.'],
  ['maire', 'role', 'neutre', 'Maire', '🎩', 'Anime le débat du jour, fait respecter la parole argumentée, départage les égalités.', 'Débat calme et argumenté.'],
  ['lievre', 'role', 'neutre', 'Lièvre', '🐇', 'Court à une allure donnée pour guider un ou plusieurs camarades.', 'Allure tenue pour ses camarades.'],
  ['morsure', 'defi', 'loups', 'La Morsure de régularité', '🐺', 'Le loup désigne une cible en secret au gardien du temps. Pendant la nuit, la cible doit être à son plot à chaque signal (tolérance ± 1 plot).', '3 signaux ratés → cible mordue.'],
  ['hurlement', 'defi', 'loups', 'Le Hurlement', '🌕', 'Le loup lance : « Cours 2 min à 75 % sans regarder les plots et annonce ta distance. »', 'Écart de plus de 10 % → cible mordue.'],
  ['traque', 'defi', 'loups', 'La Traque', '🐾', 'Le loup part 2 plots derrière sa cible. Il a droit à 1 min à +10 % de son allure pour la rejoindre.', 'S\'il la rejoint → cible mordue. S\'il ne tient plus son contrat ensuite → il est démasqué.'],
  ['lune', 'defi', 'loups', 'La Lune Rouge', '🔴', 'Toute la meute impose au village 1 min à 100 % de VMA.', 'Chaque humain qui n\'atteint pas son plot → mordu.'],
  ['mission', 'defi', 'loups', 'La Mission secrète', '🤫', 'Chaque loup reçoit une mission cachée tirée au hasard.', 'Mission réussie sans être repéré → +1 morsure pour la meute.'],
  ['balle', 'defi', 'humains', 'La Balle d\'argent', '🥈', 'Trios de villageois en relais : couvrir ensemble une distance cible en 4 min (80 % de la VMA de chacun).', 'Réussite → droit d\'accuser publiquement un joueur.'],
  ['voyante-d', 'defi', 'humains', 'La Course de la Voyante', '🔮', '3 signaux parfaits d\'affilée.', 'Réussite → la voyante regarde une carte.'],
  ['tir', 'defi', 'humains', 'Le Tir du Chasseur', '🏹', 'Le chasseur doit courir la 2e moitié plus vite que la 1re (negative split).', 'Réussite → il désigne un loup présumé.'],
  ['potions', 'defi', 'humains', 'Les Potions de la Sorcière', '🧪', 'Potion de vie ou potion de mort (voir la carte Sorcière).', 'Chaque potion sert une fois par partie.'],
  ['oeil', 'defi', 'humains', 'L\'Œil du village', '👁️', 'Les gardiens du temps relèvent les comportements suspects : accélérations injustifiées, regroupements, écarts au contrat.', 'Indices lus au début du jour.'],
  ['bucher', 'regle', 'neutre', 'Le Bûcher', '🔥', 'Seuls les joueurs qui ont respecté leur contrat pendant la nuit votent. L\'accusé révèle sa carte.', 'Si c\'est un loup, il redevient villageois.'],
  ['contamination', 'regle', 'neutre', 'La Contamination', '🧛', 'Un humain mordu devient loup. Personne n\'est jamais éliminé : tout le monde court jusqu\'à la fin.', 'Le mordu rejoint la meute.'],
  ['accusation', 'regle', 'neutre', 'L\'Accusation argumentée', '🗣️', 'Une accusation n\'est valable que si elle s\'appuie sur une preuve de course.', 'Ex. : « Il a accéléré entre les plots 6 et 9 alors que son contrat était stable. »'],
  ['etoile', 'regle', 'neutre', 'L\'Étoile de la Lune', '⭐', 'Bonus collectif.', 'Si au moins 75 % des contrats de la classe sont tenus, le camp vainqueur reçoit une étoile.'],
].map(([k, type, camp, titre, ico, desc, cond]) => ({ k, type, camp, titre, ico, desc, cond }));
const DF_LMISSIONS = ['Accélère entre les plots 5 et 8, puis reviens à ton allure.', 'Cours collé à un autre loup pendant 1 tour sans vous parler.', 'Passe 2 signaux avec 1 plot d\'avance, puis reviens pile sur ton plot.', 'Ralentis volontairement sur 1 signal puis rattrape ton retard au suivant.', 'Double un villageois puis laisse-le te redoubler.'];
const dfLCard = k => DF_LCARDS.find(c => c.k === k) || null;
const dfLCol = c => c.camp === 'loups' ? '#2B1E5C' : c.camp === 'humains' ? (['voyante', 'sorciere', 'chasseur'].includes(c.k) ? '#B8860B' : '#3F7D3A') : '#9C6B12';
/* leçons types (cartes en jeu, nuits [durée min, % VMA], durée du jour) */
const DF_LBASE = ['villageois', 'loup', 'gardien', 'maire', 'morsure', 'bucher', 'contamination'];
const DF_LALL = DF_LCARDS.map(c => c.k);
const DF_LMOD = [
  { t:'L1 · Le village s\'éveille', th:'Découverte, régularité', keys: DF_LBASE, nuits:[[3, 70], [3, 72], [3, 75], [3, 75]], jour:2, obj:'Tenir une allure, comprendre les plots, s\'approprier les rôles.' },
  { t:'L2 · Les yeux de la nuit', th:'Sensations et estimation', keys:[...DF_LBASE, 'voyante', 'voyante-d', 'hurlement', 'oeil'], nuits:[[4, 75], [4, 75], [4, 75], [4, 75]], jour:2, obj:'Estimer sa vitesse, utiliser ses sensations, observer.' },
  { t:'L3 · La traque', th:'Changements de rythme', keys:[...DF_LBASE, 'voyante', 'voyante-d', 'hurlement', 'oeil', 'chasseur', 'tir', 'traque', 'mission'], nuits:[[4, 75], [4, 80], [4, 80], [4, 85]], jour:2, obj:'Accélérer et revenir à son allure, mesurer le coût d\'une accélération.' },
  { t:'L4 · Le pacte du village', th:'Coopération', keys:[...DF_LBASE, 'voyante', 'voyante-d', 'hurlement', 'oeil', 'chasseur', 'tir', 'traque', 'mission', 'sorciere', 'lievre', 'balle', 'potions', 'accusation'], nuits:[[5, 80], [5, 80], [5, 80], [5, 80]], jour:2, obj:'Répartir l\'effort, conduire l\'allure d\'un camarade.' },
  { t:'L5 · La Lune Rouge', th:'Intensité et récupération', keys: DF_LALL, nuits:[[3, 80], [4, 85], [1, 100], [5, 80], [6, 75]], jour:2, obj:'Gérer un effort intense, récupérer activement.' },
  { t:'L6 · La grande nuit', th:'Projet de course', keys: DF_LALL, nuits:[[8, 85]], jour:3, obj:'Construire et réaliser son projet de course, s\'auto-évaluer.' },
];
const dfLMod = e => DF_LMOD[e.modele || 0] || DF_LMOD[0];
const dfLIn = (e, type) => dfLMod(e).keys.map(dfLCard).filter(c => c && (!type || c.type === type));
const dfLG = (n, i) => dfGame(n, i, () => ({ counts:null, stars:0, tally:{}, voted:{}, log:[], ind:[], tab:'animer', mi:0 }));
const dfLLog = (G, t) => G.log.push({ t: Date.now(), txt: t });
const dfLx = (n, i, sid) => dfX(n, sid, i) || {};
const dfLCampOf = (n, i, sid) => { const x = dfLx(n, i, sid); if (x.camp) return x.camp; const c = dfLCard(x.role); return c ? c.camp : 'humains'; };
const dfLList = (n, i, e) => sortedStudents().filter(s => dfPresent(n, s.id) && dfConc(e, s.id));
/* plots attendus : VMA × % × intervalle ÷ 3,6 ÷ espacement des plots (petite forme : −10 points) */
const dfLPer = (n, i, e, sid, pct) => { const r = dfVmaRef(n, sid, i); return r ? r.v * (pct - (dfForme(n, sid) ? 10 : 0)) / 100 * (e.sig || 30) / 3.6 / (e.pd || 20) : null; };
const dfLNsig = (e, mi) => Math.floor(((e.nuits || [])[mi] || [0])[0] * 60 / (e.sig || 30));
function dfLReg(n, i, e, sid, mi){
  const nt = (e.nuits || [])[mi]; if (!nt) return null; const per = dfLPer(n, i, e, sid, nt[1]), got = ((dfLx(n, i, sid).g || {})[mi]) || [], N = dfLNsig(e, mi), tol = e.tol ?? 1;
  const rows = Array.from({ length: N }, (_, k) => ({ exp: per == null ? null : Math.round(per * (k + 1)), got: got[k] ?? null })), R = rows.filter(r => r.got != null && r.exp != null);
  const ok = R.filter(r => Math.abs(r.got - r.exp) <= tol).length, half = Math.floor(R.length / 2);
  let ns = null; if (R.length >= 4) { const d = R.map((r, k) => r.got - (k ? R[k - 1].got : 0)); ns = d.slice(R.length - half).reduce((a, b) => a + b, 0) > d.slice(0, half).reduce((a, b) => a + b, 0); }
  return { rows, per, n: R.length, tenus: ok, pct: R.length ? Math.round(ok / R.length * 100) : null, ok: R.length ? ok / R.length >= 0.75 : null, ns };
}
/* droit de vote : forcé par le meneur, sinon contrat de la dernière nuit relevée */
function dfLVote(n, i, e, sid){ const x = dfLx(n, i, sid); if (x.vote != null) return x.vote; for (let mi = (e.nuits || []).length - 1; mi >= 0; mi--) { const r = dfLReg(n, i, e, sid, mi); if (r && r.n) return r.ok; } return true; }
function dfLContrats(n, i, e){ let ok = 0, nb = 0; dfLList(n, i, e).forEach(s => { const r = [...(e.nuits || [])].map((_, mi) => dfLReg(n, i, e, s.id, mi)).filter(r => r && r.n).pop(); if (!r) return; nb++; if (r.ok) ok++; }); return { ok, nb, pct: nb ? Math.round(ok / nb * 100) : null }; }
function dfLSuggest(e, nb){ const has = k => dfLIn(e).some(c => c.k === k);
  const o = { loup: Math.max(1, Math.round(nb / 5.5)), gardien: Math.max(1, Math.round(nb / 7)), voyante: has('voyante') ? 1 : 0, sorciere: has('sorciere') ? 1 : 0, chasseur: has('chasseur') ? 1 : 0, maire: has('maire') ? 1 : 0, lievre: 0 };
  o.villageois = Math.max(0, nb - Object.values(o).reduce((a, b) => a + b, 0)); return o; }

/* ---------- carte (HTML) ---------- */
function dfLCardHTML(c){ if (!c) return ''; const cp = DF_LCAMPS[c.camp] || DF_LCAMPS.neutre;
  return `<div class="df-lc" style="--lc:${dfLCol(c)}"><div class="df-lc-band"><span>${DF_LTYPES[c.type]}</span><span title="${cp.n}">${cp.ico}</span></div><div class="df-lc-ico">${esc(c.ico)}</div><div class="df-lc-t">${esc(c.titre)}</div><div class="df-lc-d">${esc(c.desc)}</div>${c.cond ? `<div class="df-lc-c">${esc(c.cond)}</div>` : ''}</div>`; }

/* ---------- écran de la tablette ---------- */
function dfLoupsView(n, i, e){
  const G = dfLG(n, i), tab = G.tab || 'animer';
  const nav = `<div class="filters">${[['animer', '🌙 Animer la partie'], ['gardien', '⏱️ Gardien du temps'], ['plots', '🧮 Plots par signal'], ['indices', '👁️ Indices'], ['cartes', '🃏 Cartes']].map(([k, l]) => `<button class="chip ${tab === k ? 'on' : ''}" data-action="dfLTab" data-i="${i}" data-v="${k}">${l}</button>`).join('')}</div>`;
  const M = dfLMod(e);
  return `<div class="card df-lhead"><b>🐺 On ne gagne pas en courant plus vite : on gagne en courant <u>juste</u>.</b><br><span class="muted">${esc(M.t)} · ${esc(M.th)} · 🎯 ${esc(M.obj)}</span></div>${nav}` +
    ({ gardien: dfLGardien, plots: dfLPlots, indices: dfLIndices, cartes: dfLCartes }[tab] || dfLAnimer)(n, i, e);
}
function dfLPhases(e){ const P = []; (e.nuits || []).forEach(([d, p], k) => { P.push({ n: `🌙 NUIT ${k + 1} · ${d} min à ${p} % VMA`, s: d * 60, night: true, k, p }); P.push({ n: `☀️ JOUR ${k + 1} · débat et vote`, s: (e.jour || 2) * 60, k }); }); return P; }
function dfLSignal(e){ const s = e.son || 'sifflet'; if (s === 'hurlement') dfSnd.howl(); else if (s === 'gong') dfSnd.gong(); else dfSnd.whistle(); }
function dfLAnimer(n, i, e){
  const G = dfLG(n, i), R = dfLList(n, i, e), roles = dfLIn(e, 'role'), nb = R.length, key = `l${n}-${i}`, T = dfTimer(key), sig = e.sig || 30;
  if (!G.counts) G.counts = dfLSuggest(e, nb);
  const dealt = R.some(s => dfLx(n, i, s.id).role), secret = G.secret;
  T.quiet = true;
  T.onTick = T_ => { const st = dfTimerState(T_), ph = (T_.phases || [])[st.k]; if (!ph) return; const into = ph.s - st.left;
    if (ph.night) { const sg = Math.floor(into / sig); if (T_._sg != null && sg > T_._sg && st.left > 1) dfLSignal(e); T_._sg = sg; const el = document.querySelector(`[data-lgsig="${key}"]`); if (el) el.textContent = `Signal n° ${sg + 1} · toutes les ${sig} s`; } else T_._sg = null;
    if (Math.ceil(st.left) === 30 && T_._v30 !== st.k && ph.s > 45 && T_.run) { T_._v30 = st.k; dfSay('Plus que 30 secondes'); } };
  T.onPhase = st => { const ph = (T.phases || [])[st.k]; T._sg = 0;
    if (!ph) { beepEnd(); dfSay('Fin de la partie. Le village fait ses comptes.'); return; }
    if (ph.night) { dfSnd.howl(); dfSay(`Nuit ${ph.k + 1}, ${dfSayT((e.nuits[ph.k] || [0])[0] * 60)} à ${ph.p} pour cent.`, 1.8); } else { dfSnd.whistle(); dfSay('Le jour se lève. Le village se réunit.', 0.8); } };
  T.onGo = T_ => { T_._sg = 0; const st = dfTimerState(T_), ph = (T_.phases || [])[st.k]; if (ph && ph.night && T_.acc < 1) { dfSnd.howl(); dfSay(`Nuit ${ph.k + 1}, ${dfSayT(e.nuits[ph.k][0] * 60)} à ${ph.p} pour cent.`, 1.5); } };
  const st = dfTimerState(T), ph = (T.phases || dfLPhases(e))[st.k], night = ph && ph.night;
  const loups = R.filter(s => dfLCampOf(n, i, s.id) === 'loups').length, hum = nb - loups, C = dfLContrats(n, i, e), tot = Object.values(G.counts).reduce((a, b) => a + b, 0);
  return `<div class="card"><h3>1. Répartition des rôles <small class="muted">${nb} élève(s) présent(s)</small></h3>
      <div class="df-lcounts">${roles.map(c => `<div class="df-lcnt" style="--lc:${dfLCol(c)}"><span>${esc(c.ico)} ${esc(c.titre)}</span><div class="stepper"><button class="cbtn" data-action="dfLCnt" data-i="${i}" data-k="${c.k}" data-d="-1">−</button><b class="df-sv">${G.counts[c.k] || 0}</b><button class="cbtn" data-action="dfLCnt" data-i="${i}" data-k="${c.k}" data-d="1">+</button></div></div>`).join('')}</div>
      <p class="muted">Conseil : environ 1 loup pour 5 à 6 élèves et 1 gardien du temps pour 6 coureurs. Total : <b>${tot}</b> / ${nb}${tot < nb ? ' (les autres seront villageois)' : ''}.</p>
      <div class="btn-row"><button class="btn primary" data-action="dfLDeal" data-i="${i}">🎲 Tirer les rôles au hasard</button><button class="btn" data-action="dfLPass" data-i="${i}" ${dealt ? '' : 'disabled'}>📱 Passe la tablette</button>
        <button class="btn ${secret ? 'primary' : ''}" data-action="dfLSecret" data-i="${i}">${secret ? '🙈 Masquer les rôles' : '🔐 Vue secrète du meneur'}</button><button class="btn small ghost" data-action="dfLSug" data-i="${i}">↺ Répartition conseillée</button></div></div>
    <div class="card df-lnight ${night ? 'night' : 'day'}"><div class="btn-row spread"><h3 style="margin:0">2. ${night ? '🌙 La nuit' : '☀️ Le jour'}</h3><div class="btn-row"><span class="muted">${e.son === 'hurlement' ? '🐺' : e.son === 'gong' ? '🔔' : '📣'} signal toutes les ${sig} s</span>${dfVoiceBtn()}</div></div>
      ${dfTimerHTML(key, dfLPhases(e), { extra: `<button class="btn ghost" data-action="dfTm" data-key="${key}" data-a="next">⏭ Phase suivante</button>` })}
      <p class="df-lsig" data-lgsig="${key}">${night ? `Signal n° ${Math.floor((ph.s - st.left) / sig) + 1} · toutes les ${sig} s` : 'Débat, indices, vote · récupération en marchant'}</p>
      <h4>Défis de la leçon</h4><div class="df-ldefis">${dfLIn(e, 'defi').map(c => `<div class="df-ldef" style="--lc:${dfLCol(c)}"><b>${esc(c.ico)} ${esc(c.titre)}</b><small class="muted">${esc(c.cond)}</small><div class="btn-row"><button class="btn small primary" data-action="dfLDefi" data-i="${i}" data-k="${c.k}" data-v="1">✓ Réussi</button><button class="btn small" data-action="dfLDefi" data-i="${i}" data-k="${c.k}" data-v="0">✗ Raté</button>${c.k === 'mission' ? `<button class="btn small" data-action="dfLMiss">🤫 Tirer une mission</button>` : ''}</div></div>`).join('') || '<p class="muted">Aucun défi.</p>'}</div></div>
    <div class="card"><div class="btn-row spread"><h3 style="margin:0">3. Tableau du village</h3><b class="df-lscore">🐺 ${loups} loup(s) · 🏡 ${hum} humain(s) · ⭐ ${G.stars || 0}</b></div>
      <p class="muted">Touchez le statut pour le changer (humain → mordu → guéri → révélé). 🗳️ = droit de vote (contrat tenu pendant la nuit, rempli par la grille du gardien du temps ; touchez pour forcer). Contrats tenus : <b>${C.pct != null ? C.pct + ' %' : '—'}</b>${C.pct != null && C.pct >= 75 ? ' → ⭐ l\'Étoile de la Lune est gagnée' : ''}.</p>
      <div class="df-lvillage">${R.map(s => { const x = dfLx(n, i, s.id), c = dfLCard(x.role), stt = x.st || 'humain', SS = DF_LSTATUS[stt], v = dfLVote(n, i, e, s.id), camp = dfLCampOf(n, i, s.id);
        return `<div class="df-lv ${secret && camp === 'loups' ? 'wolf' : ''}"><span class="df-lvn">${band(s.id)}${esc(nameOf(s.id))}</span><span class="df-lvr">${secret || stt === 'revele' ? (c ? esc(c.ico) + ' ' + esc(c.titre) : '—') : '🔒 secret'}</span>
          <button class="df-lst" style="--sc:${SS[2]}" data-action="dfLSt" data-i="${i}" data-sid="${s.id}">${SS[0]} ${SS[1]}</button><button class="df-lvote ${v ? 'on' : ''}" data-action="dfLVoteR" data-i="${i}" data-sid="${s.id}">${v ? '🗳️ Vote' : '🚫 Pas de vote'}</button></div>`; }).join('')}</div>
      <div class="btn-row" style="margin-top:8px"><button class="btn" data-action="dfLStar" data-i="${i}">⭐ Étoile de la Lune +1</button><button class="btn ${G.vopen ? 'primary' : ''}" data-action="dfLVOpen" data-i="${i}">🗳️ ${G.vopen ? 'Fermer le vote' : 'Ouvrir le vote'}</button></div>
      <p class="muted">Victoire : le Village gagne s'il n'y a plus de loups à la dernière aube ; la Meute gagne si les loups sont majoritaires. ${dealt ? loups === 0 ? '<b>🏡 Le Village gagne !</b>' : loups > hum ? '<b>🐺 La Meute est majoritaire !</b>' : '' : ''}</p></div>
    ${G.vopen ? dfLVoteHTML(n, i, e) : ''}
    ${G.ind.length ? `<div class="card"><h3>👁️ Indices des gardiens du temps</h3><ul class="df-log">${G.ind.map(q => `<li><b>${esc(nameOf(q.sid))}</b> · ${esc(q.type)}${q.plot ? ' · plot ' + esc(q.plot) : ''}${q.txt ? ' · ' + esc(q.txt) : ''}</li>`).join('')}</ul></div>` : ''}
    ${G.log.length ? `<div class="card"><h3>📜 Journal de partie</h3><ul class="df-log">${G.log.slice().reverse().slice(0, 25).map(l => `<li><small>${new Date(l.t).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })}</small> ${esc(l.txt)}</li>`).join('')}</ul></div>` : ''}`;
}
function dfLVoteHTML(n, i, e){
  const G = dfLG(n, i), R = dfLList(n, i, e), voters = R.filter(s => dfLVote(n, i, e, s.id)), T = G.tally || {}, sec = G.vmode === 'secret';
  const top = Object.entries(T).sort((a, b) => b[1] - a[1]), mx = top.length ? top[0][1] : 0, lead = top.filter(q => q[1] === mx && mx > 0);
  return `<div class="card df-lvotep"><div class="btn-row spread"><h3 style="margin:0">🗳️ Vote du village</h3><div class="filters"><button class="chip ${sec ? '' : 'on'}" data-action="dfLVMode" data-i="${i}" data-v="main">✋ À main levée</button><button class="chip ${sec ? 'on' : ''}" data-action="dfLVMode" data-i="${i}" data-v="secret">🤫 Vote secret</button></div></div>
    <p class="muted">${voters.length} votant(s) (droit de vote mérité). ${sec ? 'Chaque votant touche son nom puis l\'accusé, à l\'abri des regards.' : 'Le maire compte les mains levées pour chaque accusé.'}</p>
    ${sec ? `<div class="lchips">${voters.map(s => `<button class="chip ${(G.voted || {})[s.id] ? 'on' : ''}" data-action="dfLVoter" data-i="${i}" data-sid="${s.id}" ${(G.voted || {})[s.id] ? 'disabled' : ''}>${(G.voted || {})[s.id] ? '✓ ' : ''}${esc(nameOf(s.id))}</button>`).join('')}</div>` : ''}
    <div class="df-lcands">${R.map(s => `<div class="df-lcand"><span>${esc(nameOf(s.id))}</span>${sec ? `<b>${T[s.id] ? '🔒' : ''}</b>` : `<div class="stepper"><button class="cbtn" data-action="dfLTally" data-i="${i}" data-sid="${s.id}" data-d="-1">−</button><b class="df-sv">${T[s.id] || 0}</b><button class="cbtn" data-action="dfLTally" data-i="${i}" data-sid="${s.id}" data-d="1">+</button></div>`}</div>`).join('')}</div>
    <div class="btn-row" style="margin-top:8px"><button class="btn primary" data-action="dfLVEnd" data-i="${i}" ${lead.length ? '' : 'disabled'}>📣 Résultat et révélation</button><button class="btn" data-action="dfLVReset" data-i="${i}">↺ Nouveau vote</button></div>
    ${lead.length > 1 ? '<p class="muted">Égalité : le maire départage.</p>' : ''}</div>`;
}
function dfLNuitChips(n, i, e, act = 'dfLMi'){ const G = dfLG(n, i), mi = Math.min(G.mi || 0, (e.nuits || []).length - 1);
  return `<div class="filters"><b>Nuit :</b>${(e.nuits || []).map(([d, p], k) => `<button class="chip ${k === mi ? 'on' : ''}" data-action="${act}" data-i="${i}" data-k="${k}">Nuit ${k + 1} · ${d} min à ${p} %</button>`).join('')}</div>`; }
function dfLGardien(n, i, e){
  const G = dfLG(n, i), R = dfLList(n, i, e), mi = Math.min(G.mi || 0, (e.nuits || []).length - 1), sid = R.some(s => s.id === G.obs) ? G.obs : (R[0] || {}).id;
  if (!sid || mi < 0) return '<p class="muted">Aucun coureur, ou aucune nuit programmée.</p>';
  const nt = e.nuits[mi], r = dfLReg(n, i, e, sid, mi), tol = e.tol ?? 1, pd = e.pd || 20;
  return `${dfLNuitChips(n, i, e)}<div class="card"><h3>⏱️ Grille du gardien du temps · régularité</h3>
    <div class="lchips"><b>Coureur observé</b>${R.map(s => { const q = dfLReg(n, i, e, s.id, mi); return `<button class="chip ${s.id === sid ? 'on' : ''}" data-action="dfLObs" data-i="${i}" data-sid="${s.id}">${esc(nameOf(s.id))}${q && q.n ? (q.ok ? ' ✅' : ' ❌') : ''}</button>`; }).join('')}</div>
    <p class="muted">${r.per != null ? `<b>${esc(nameOf(sid))}</b> : ${nt[1] - (dfForme(n, sid) ? 10 : 0)} % de VMA → <b>${fmtN(r.per, 1)} plots par signal</b> (${Math.round(r.per * pd)} m toutes les ${e.sig || 30} s, un plot tous les ${pd} m). Tolérance ± ${tol} plot.` : 'VMA non connue : plots attendus inconnus.'} Touchez + / − pour le plot atteint au signal (compté depuis le départ).</p>
    <div class="scroll-x"><table class="tbl df-lgtbl"><thead><tr><th>Signal</th><th>Plot attendu</th><th>Plot atteint</th><th>Écart</th><th>Tenu ?</th></tr></thead><tbody>
    ${r.rows.map((q, k) => { const d = q.got != null && q.exp != null ? q.got - q.exp : null, ok = d != null && Math.abs(d) <= tol;
      return `<tr><td>${k + 1}</td><td>${q.exp ?? '—'}</td><td><div class="stepper"><button class="cbtn" data-action="dfLGot" data-i="${i}" data-sid="${sid}" data-k="${k}" data-d="-1">−</button><b class="df-sv">${q.got ?? '—'}</b><button class="cbtn" data-action="dfLGot" data-i="${i}" data-sid="${sid}" data-k="${k}" data-d="1">+</button></div></td>
        <td>${d == null ? '—' : d > 0 ? '+' + d : d < 0 ? '−' + -d : '='}</td><td>${d == null ? '' : ok ? '✅' : '❌'}</td></tr>`; }).join('')}</tbody></table></div>
    <p class="df-lsum">Signaux tenus : <b>${r.tenus}/${r.n}</b> · régularité <b>${r.pct ?? '—'} %</b> · negative split : <b>${r.ns == null ? '—' : r.ns ? 'oui' : 'non'}</b> · droit de vote : <b>${r.n ? (r.ok ? 'oui 🗳️' : 'non 🚫') : '—'}</b></p>
    <div class="btn-row"><button class="btn small" data-action="dfLIndOpen" data-i="${i}" data-sid="${sid}">👁️ Noter un indice suspect</button></div></div>`;
}
function dfLPlots(n, i, e){
  const G = dfLG(n, i), mi = Math.min(G.mi || 0, (e.nuits || []).length - 1); if (mi < 0) return '<p class="muted">Aucune nuit programmée.</p>';
  const [dur, pct] = e.nuits[mi], pd = e.pd || 20, sig = e.sig || 30, COL = ['#1c7ed6', '#2f9e44', '#f08c00', '#e03131', '#7048e8', '#1098ad', '#e64980', '#5c940d'];
  const rows = dfLList(n, i, e).map(s => { const per = dfLPer(n, i, e, s.id, pct); return { s, per, np: per == null ? null : Math.round(per) }; }), ns = [...new Set(rows.filter(r => r.np != null).map(r => r.np))].sort((a, b) => a - b);
  return `${dfLNuitChips(n, i, e)}<div class="card scroll-x"><h3>🧮 Contrat d'allure : plots par signal</h3>
    <p class="muted">Distance par signal = VMA × % de VMA × ${sig} s ÷ 3,6. Exemple : VMA 12 à 80 % → ${fmtN(12 * 0.8 * sig / 3.6, 0)} m toutes les ${sig} s → ${fmtN(12 * 0.8 * sig / 3.6 / pd, 1)} plots (un plot tous les ${pd} m).</p>
    <table class="tbl"><thead><tr><th>Élève</th><th>VMA</th><th>Vitesse cible</th><th>Distance / signal</th><th>Plots / signal</th><th>Distance de la nuit</th></tr></thead><tbody>
    ${rows.map(r => { const ref = dfVmaRef(n, r.s.id, i); if (r.per == null) return `<tr><td class="nm">${band(r.s.id)}${esc(nameOf(r.s.id))}</td><td colspan="5" class="muted">VMA non connue</td></tr>`;
      const p = pct - (dfForme(n, r.s.id) ? 10 : 0); return `<tr><td class="nm">${band(r.s.id)}${esc(nameOf(r.s.id))}${dfForme(n, r.s.id) ? ' 😓' : ''}</td><td>${fmtN(ref.v, 1)}</td><td>${fmtN(ref.v * p / 100, 1)} km/h</td><td>${Math.round(r.per * pd)} m</td>
        <td><span class="df-lpn" style="background:${COL[ns.indexOf(r.np) % COL.length]}">${r.np}</span> <small>(${fmtN(r.per, 1)})</small></td><td>${dfKm(ref.v * p / 100 / 3.6 * dur * 60)}</td></tr>`; }).join('')}</tbody></table>
    <p class="muted">Couleurs : un groupe par nombre de plots, à reporter sur les chasubles ou sur les plots au bord de la piste.</p></div>`;
}
function dfLIndices(n, i, e){ const G = dfLG(n, i);
  return `<div class="card"><div class="btn-row spread"><h3 style="margin:0">👁️ Indices suspects (Œil du village)</h3><button class="btn small primary" data-action="dfLIndOpen" data-i="${i}">＋ Noter un indice</button></div>
    <p class="muted">Une accusation n'est valable que si elle s'appuie sur une preuve de course : un plot, un moment, un écart.</p>
    <table class="tbl"><thead><tr><th>Joueur</th><th>Indice</th><th>Plot</th><th>Précision</th><th></th></tr></thead><tbody>${G.ind.map((q, k) => `<tr><td><b>${esc(nameOf(q.sid))}</b></td><td>${esc(q.type)}</td><td>${esc(q.plot || '')}</td><td>${esc(q.txt || '')}</td><td><button class="btn small ghost" data-action="dfLIndDel" data-i="${i}" data-k="${k}">✕</button></td></tr>`).join('') || '<tr><td colspan="5" class="muted">Aucun indice.</td></tr>'}</tbody></table></div>`; }
function dfLCartes(n, i, e){
  return `<div class="card"><div class="btn-row spread"><h3 style="margin:0">🃏 Cartes de la leçon · ${esc(dfLMod(e).t)}</h3><button class="btn small" data-action="dfLPrint" data-i="${i}">🖨 Cartes à découper</button></div>
    <p class="muted">Les cartes en jeu dépendent de la leçon type choisie dans la Programmation.</p><div class="df-kgrid">${dfLIn(e).map(dfLCardHTML).join('')}</div></div>`;
}
DF_VIEWS.loups = { view: dfLoupsView };
DF_LINE.loups = (n, sid, i, e) => { const x = dfX(n, sid, i); if (!x) return ''; const c = dfLCard(x.role), S_ = DF_LSTATUS[x.st || 'humain'];
  const R = (e.nuits || []).map((_, mi) => dfLReg(n, i, e, sid, mi)).filter(r => r && r.n);
  return `<div class="muted">${c ? c.ico + ' ' + esc(c.titre) + ' · ' : ''}${S_[0]} ${S_[1]}${R.length ? ' · contrats : ' + R.map(r => `${r.tenus}/${r.n}${r.ok ? ' ✅' : ' ❌'}`).join(' · ') : ''}</div>`; };

/* passe la tablette : chaque élève découvre son rôle en secret */
function dfLPass(n, i){
  const e = dfEx(n, i), G = dfLG(n, i), R = dfLList(n, i, e);
  const m = modal(`<h2>📱 Passe la tablette</h2><p class="muted">Chaque élève touche son nom, regarde sa carte 5 secondes, puis passe la tablette au suivant.</p>
    <div class="lchips">${R.map(s => `<button class="chip ${dfLx(n, i, s.id).seen ? 'on' : ''}" data-sid="${s.id}">${dfLx(n, i, s.id).seen ? '✓ ' : ''}${esc(nameOf(s.id))}</button>`).join('')}</div>
    <div class="btn-row spread" style="margin-top:10px"><span></span><button class="btn primary" data-x>Fermer</button></div>`);
  m.querySelector('[data-x]').onclick = () => { closeModal(); rerender(); };
  m.querySelectorAll('[data-sid]').forEach(b => b.onclick = () => { const sid = b.dataset.sid, c = dfLCard(dfLx(n, i, sid).role); dfSetX(n, sid, i, o => { o.seen = 1; }); closeModal();
    const ov = document.createElement('div'); ov.className = 'df-lreveal'; ov.innerHTML = `<div><p>${esc(nameOf(sid))}, tu es…</p>${dfLCardHTML(c)}${c && c.k === 'loup' ? `<p>🐺 Ta meute : ${R.filter(s => s.id !== sid && dfLCampOf(n, i, s.id) === 'loups').map(s => esc(nameOf(s.id))).join(', ') || 'tu es seul'}</p>` : ''}<p class="df-lcd">5</p><small>Touchez pour cacher</small></div>`; document.body.appendChild(ov);
    let k = 5, done = false; const fin = () => { if (done) return; done = true; clearInterval(it); ov.remove(); dfLPass(n, i); };
    const it = setInterval(() => { k--; const c_ = ov.querySelector('.df-lcd'); if (c_) c_.textContent = k; if (k <= 0) fin(); }, 1000); ov.onclick = fin; });
}
function dfLIndModal(n, i, sid){
  const e = dfEx(n, i), R = dfLList(n, i, e), types = ['Accélération injustifiée', 'Regroupement / course collée', 'Ralentissement puis rattrapage', 'Écart au contrat', 'Autre indice'];
  const m = modal(`<h2>👁️ Noter un indice suspect</h2><div class="form-row"><span>Joueur</span><select data-f="sid">${R.map(s => `<option value="${s.id}" ${s.id === sid ? 'selected' : ''}>${esc(nameOf(s.id))}</option>`).join('')}</select></div>
    <div class="form-row"><span>Indice</span><select data-f="type">${types.map(t => `<option>${t}</option>`).join('')}</select></div>
    <div class="form-row"><span>Plot n° (ou signal)</span><input data-f="plot" style="max-width:120px"></div><div class="form-row"><span>Précision</span><input data-f="txt" style="width:100%"></div>
    <div class="btn-row spread" style="margin-top:10px"><button class="btn ghost" data-c>Annuler</button><button class="btn primary" data-ok>＋ Ajouter</button></div>`);
  const v = k => m.querySelector(`[data-f="${k}"]`).value.trim();
  m.querySelector('[data-c]').onclick = closeModal;
  m.querySelector('[data-ok]').onclick = () => { dfLG(n, i).ind.push({ sid: v('sid'), type: v('type'), plot: v('plot'), txt: v('txt') }); save(); closeModal(); toast('👁️ Indice noté'); rerender(); };
}
Object.assign(ACT, {
  dfLTab: d => { dfLG(curLesson(), +d.i).tab = d.v; save(); rerender(); },
  dfLMi: d => { dfLG(curLesson(), +d.i).mi = +d.k; save(); rerender(); },
  dfLObs: d => { dfLG(curLesson(), +d.i).obs = d.sid; save(); rerender(); },
  dfLCnt: d => { const n = curLesson(), G = dfLG(n, +d.i); if (!G.counts) { const e = dfEx(n, +d.i); G.counts = dfLSuggest(e, dfLList(n, +d.i, e).length); } G.counts[d.k] = Math.max(0, (G.counts[d.k] || 0) + +d.d); save(); rerender(); },
  dfLSug: d => { const n = curLesson(), e = dfEx(n, +d.i); dfLG(n, +d.i).counts = dfLSuggest(e, dfLList(n, +d.i, e).length); save(); rerender(); },
  dfLSecret: d => { const G = dfLG(curLesson(), +d.i); G.secret = !G.secret; save(); rerender(); },
  dfLDeal: async d => { const n = curLesson(), i = +d.i, e = dfEx(n, i), G = dfLG(n, i), R = shuffle(dfLList(n, i, e).map(s => s.id));
    if (R.some(sid => dfLx(n, i, sid).role) && !(await confirmBox('Nouveau tirage ?', 'Les rôles déjà distribués (et les statuts) seront remplacés.', 'Tirer'))) return;
    if (!G.counts) G.counts = dfLSuggest(e, R.length);
    const keys = []; dfLIn(e, 'role').forEach(c => { for (let k = 0; k < (G.counts[c.k] || 0); k++) keys.push(c.k); });
    R.forEach((sid, k) => dfSetX(n, sid, i, o => { o.role = keys[k] || 'villageois'; delete o.st; delete o.camp; delete o.vote; delete o.seen; }));
    G.tally = {}; G.voted = {}; dfLLog(G, `Rôles tirés au hasard (${R.length} joueurs).`); save(); toast('🎲 Rôles distribués : passez la tablette'); rerender(); },
  dfLPass: d => dfLPass(curLesson(), +d.i),
  dfLSt: d => { const n = curLesson(), i = +d.i, G = dfLG(n, i), O = ['humain', 'mordu', 'gueri', 'revele'], x = dfLx(n, i, d.sid), nx = O[(O.indexOf(x.st || 'humain') + 1) % O.length], c = dfLCard(x.role);
    dfSetX(n, d.sid, i, o => { o.st = nx; if (nx === 'mordu') o.camp = 'loups'; else if (nx === 'gueri') o.camp = 'humains'; else if (nx === 'humain') delete o.camp; else if (nx === 'revele' && c && c.camp === 'loups' && !o.camp) o.camp = 'humains'; });
    dfLLog(G, `${nameOf(d.sid)} : ${DF_LSTATUS[nx][1].toLowerCase()}${nx === 'mordu' ? ' (contamination : rejoint la meute)' : ''}`); save(); const y = scrollY; rerender(); scrollTo(0, y); },
  dfLVoteR: d => { const n = curLesson(), i = +d.i, e = dfEx(n, i), v = !dfLVote(n, i, e, d.sid); dfSetX(n, d.sid, i, o => { o.vote = v; }); const y = scrollY; rerender(); scrollTo(0, y); },
  dfLStar: d => { const G = dfLG(curLesson(), +d.i); G.stars = (G.stars || 0) + 1; dfLLog(G, '⭐ Étoile de la Lune gagnée.'); save(); rerender(); },
  dfLDefi: d => { const G = dfLG(curLesson(), +d.i), c = dfLCard(d.k), ok = d.v === '1'; dfLLog(G, `${c.titre} : ${ok ? 'réussi ✓ — ' + c.cond : 'raté ✗'}`); save(); toast(`${c.ico} ${c.titre} : ${ok ? 'réussi' : 'raté'}`); rerender(); },
  dfLMiss: () => { const t = DF_LMISSIONS[Math.floor(Math.random() * DF_LMISSIONS.length)];
    modal(`<h2>🤫 Mission secrète</h2><p class="df-lmiss">${esc(t)}</p><p class="muted">Réussie sans être repéré → +1 morsure pour la meute.</p><div class="btn-row spread"><span></span><button class="btn primary" data-close>Compris</button></div>`); dfModalBind(); },
  dfLVOpen: d => { const G = dfLG(curLesson(), +d.i); G.vopen = !G.vopen; save(); rerender(); },
  dfLVMode: d => { dfLG(curLesson(), +d.i).vmode = d.v; save(); rerender(); },
  dfLTally: d => { const G = dfLG(curLesson(), +d.i); G.tally[d.sid] = Math.max(0, (G.tally[d.sid] || 0) + +d.d); save(); const y = scrollY; rerender(); scrollTo(0, y); },
  dfLVoter: async d => { const n = curLesson(), i = +d.i, G = dfLG(n, i), R = dfLList(n, i, dfEx(n, i)).filter(s => s.id !== d.sid);
    const who = await choiceBox(`🤫 ${esc(nameOf(d.sid))} vote`, 'Touche le joueur que tu accuses.', R.map(s => ({ label: esc(nameOf(s.id)), value: s.id }))); if (!who) return;
    G.voted = G.voted || {}; G.voted[d.sid] = 1; G.tally[who] = (G.tally[who] || 0) + 1; save(); toast('🗳️ Vote enregistré'); rerender(); },
  dfLVReset: d => { const G = dfLG(curLesson(), +d.i); G.tally = {}; G.voted = {}; save(); rerender(); },
  dfLVEnd: async d => { const n = curLesson(), i = +d.i, G = dfLG(n, i), top = Object.entries(G.tally).sort((a, b) => b[1] - a[1]); if (!top.length) return;
    const lead = top.filter(q => q[1] === top[0][1]);
    let sid = lead[0][0]; if (lead.length > 1) { sid = await choiceBox('⚖️ Égalité', 'Le maire départage :', lead.map(([s]) => ({ label: esc(nameOf(s)), value: s }))); if (!sid) return; }
    const c = dfLCard(dfLx(n, i, sid).role), wolf = dfLCampOf(n, i, sid) === 'loups';
    dfSetX(n, sid, i, o => { o.st = 'revele'; if (wolf) o.camp = 'humains'; });
    dfLLog(G, `🔥 Bûcher : ${nameOf(sid)} révèle sa carte (${c ? c.titre : '?'})${wolf ? ' — c\'était un loup : il redevient villageois !' : ' — ce n\'était pas un loup.'}`);
    G.tally = {}; G.voted = {}; save(); rerender(); dfSay(wolf ? `${nameOf(sid)} était un loup !` : `${nameOf(sid)} n'était pas un loup.`, 0.3);
    modal(`<h2>🔥 ${esc(nameOf(sid))} révèle sa carte</h2><div class="df-lrev1">${dfLCardHTML(c)}</div><p class="df-lmiss">${wolf ? '🐺 C\'était un loup ! Il redevient villageois.' : '🏡 Ce n\'était pas un loup.'}</p><div class="btn-row spread"><span></span><button class="btn primary" data-close>Continuer</button></div>`); dfModalBind(); },
  dfLGot: d => { const n = curLesson(), i = +d.i, e = dfEx(n, i), G = dfLG(n, i), mi = Math.min(G.mi || 0, e.nuits.length - 1), k = +d.k, r = dfLReg(n, i, e, d.sid, mi);
    dfSetX(n, d.sid, i, o => { o.g = o.g || {}; const a = o.g[mi] = o.g[mi] || []; const cur = a[k]; a[k] = cur == null ? (r.rows[k].exp ?? (k ? (a[k - 1] ?? 0) : 0)) : Math.max(0, cur + +d.d); for (let j = 0; j < a.length; j++) if (a[j] === undefined) a[j] = null; });
    const y = scrollY; rerender(); scrollTo(0, y); },
  dfLIndOpen: d => dfLIndModal(curLesson(), +d.i, d.sid),
  dfLIndDel: d => { dfLG(curLesson(), +d.i).ind.splice(+d.k, 1); save(); rerender(); },
  dfLPrint: d => { const e = dfEx(curLesson(), +d.i); modal(`<h2>🖨 Gare aux loups · cartes à découper</h2><p class="muted no-print">${esc(dfLMod(e).t)}. Imprimez en couleur, puis découpez. Prévoyez autant de cartes Rôle que de joueurs.</p><div class="df-kprint">${dfLIn(e).map(dfLCardHTML).join('')}${DF_LMISSIONS.map((t, k) => dfLCardHTML({ type:'mission', camp:'loups', titre:'Mission ' + (k + 1), ico:'🤫', desc:t, cond:'Réussie sans être repéré → +1 morsure.' })).join('')}</div>
    <div class="btn-row spread no-print" style="margin-top:12px"><button class="btn" data-print>🖨 Imprimer</button><button class="btn primary" data-close>Fermer</button></div>`, { wide: true }); dfModalBind(); },
});
