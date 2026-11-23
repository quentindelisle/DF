/* =====================================================================
   DEMI-FOND N'EPS — jeux : sons, voix, ZOMBIE FRAC'
   (Kart'Endurance : df-kart.js · Gare aux loups : df-loups.js)
   Idées de jeux reprises de la version d'Emilie Bidault et Romain Chauviré,
   réécrites pour la structure de cette appli (exercices programmés par leçon).
   ===================================================================== */
'use strict';

/* ---------- Sons (WebAudio, sans fichier) ---------- */
const dfAC = () => { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); return AC; } catch (e) { return null; } };
function dfTone(type, f0, f1, d, v = 0.3, t0 = 0){
  const a = dfAC(); if (!a) return; const t = a.currentTime + t0, o = a.createOscillator(), g = a.createGain(); o.type = type;
  o.frequency.setValueAtTime(f0, t); if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + d);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + Math.min(0.05, d / 4)); g.gain.setValueAtTime(v, t + d * 0.8); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + d + 0.05);
}
const dfSnd = {
  whistle(){ const a = dfAC(); if (!a) return; const t = a.currentTime, o = a.createOscillator(), l = a.createOscillator(), lg = a.createGain(), g = a.createGain();
    o.type = 'sine'; o.frequency.value = 2900; l.frequency.value = 38; lg.gain.value = 160; l.connect(lg); lg.connect(o.frequency);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35, t + 0.03); g.gain.setValueAtTime(0.35, t + 0.45); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    o.connect(g); g.connect(a.destination); o.start(t); l.start(t); o.stop(t + 0.6); l.stop(t + 0.6); if (navigator.vibrate) navigator.vibrate(120); },
  growl(){ const a = dfAC(); if (!a) return; const t = a.currentTime, o = a.createOscillator(), o2 = a.createOscillator(), lfo = a.createGain(), g = a.createGain();
    o.type = 'sawtooth'; o2.type = 'square'; o.frequency.setValueAtTime(95, t); o.frequency.linearRampToValueAtTime(70, t + 1.1); o2.frequency.setValueAtTime(6, t); lfo.gain.value = 25; o2.connect(lfo); lfo.connect(o.frequency);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35, t + 0.12); g.gain.setValueAtTime(0.35, t + 0.9); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
    o.connect(g); g.connect(a.destination); o.start(t); o2.start(t); o.stop(t + 1.25); o2.stop(t + 1.25); },
  howl(){ dfTone('sawtooth', 320, 720, 0.6, 0.25); dfTone('sawtooth', 720, 380, 1.2, 0.25, 0.6); if (navigator.vibrate) navigator.vibrate(200); },
  gong(){ dfTone('sine', 98, 90, 1.6, 0.4); dfTone('sine', 196, 180, 1.2, 0.15); },
  tick(){ dfTone('square', 1320, 1320, 0.06, 0.2); },
  coin(){ dfTone('square', 988, 988, 0.08, 0.18); dfTone('square', 1319, 1319, 0.25, 0.18, 0.08); },
};
/* ---------- Voix (synthèse vocale française de la tablette) ---------- */
let DF_VOICE = null;
function dfPickVoice(){ try { const V = speechSynthesis.getVoices(); DF_VOICE = V.find(v => /^fr(-|_)FR/i.test(v.lang)) || V.find(v => /^fr/i.test(v.lang)) || null; } catch (e) {} }
try { dfPickVoice(); speechSynthesis.onvoiceschanged = dfPickVoice; } catch (e) {}
const dfVoiceOn = () => ROOT.dfVoice !== false;
function dfSay(txt, delay = 0){
  if (!dfVoiceOn() || !window.speechSynthesis) return false;
  try { const u = new SpeechSynthesisUtterance(txt); u.lang = 'fr-FR'; if (DF_VOICE) u.voice = DF_VOICE; u.rate = 1.02;
    setTimeout(() => { try { speechSynthesis.speak(u); } catch (e) {} }, delay * 1000); return true; } catch (e) { return false; }
}
const dfSayT = s => { s = Math.round(s); const m = Math.floor(s / 60), r = s % 60; return (m ? `${m} minute${m > 1 ? 's' : ''}` : '') + (m && r ? ' ' : '') + (r || !m ? `${r} seconde${r > 1 ? 's' : ''}` : ''); };
const dfVoiceBtn = () => `<button class="btn small ${dfVoiceOn() ? 'green' : ''}" data-action="dfVoice">${dfVoiceOn() ? '🔊 Voix activée' : '🔇 Voix coupée'}</button>`;

/* état de jeu propre à cette tablette (pioche, mains, votes…) : S.dfg[leçon][exercice] */
function dfGame(n, i, init){ S.dfg = S.dfg || {}; const L = S.dfg[n] = S.dfg[n] || {}; if (!L[i]) L[i] = init ? init() : {}; return L[i]; }
const dfGameReset = (n, i) => { if (S.dfg && S.dfg[n]) delete S.dfg[n][i]; save(); };

/* =====================================================================
   ZOMBIE FRAC' : le fractionné raconté comme une fuite devant les zombies.
   Les réglages du fractionné ne changent pas (formes, % VMA, récupérations, séries, groupes).
   Chaque effort = une FUITE ; chaque récupération = la PLANQUE.
   🏃 échappé (cible atteinte, +1 ressource) · 🩹 griffé (presque) · 🧟 rattrapé (non atteinte).
   Deux 🧟 de suite = infecté ; une fuite réussie ensuite = antidote 💉. Personne n'est éliminé.
   ===================================================================== */
const DF_ZCELL = { 2:{ s:'🏃', c:'#2E8A16', l:'Échappé' }, 1:{ s:'🩹', c:'#F59A1B', l:'Griffé' }, 0:{ s:'🧟', c:'#7A1F1F', l:'Rattrapé' } };
const DF_ZRES = [['🥫', 'conserves'], ['💧', 'eau'], ['💊', 'médicaments'], ['🔋', 'piles'], ['🧰', 'outils']];
const DF_ZBUILD = [[0.15, '🧱', 'Palissade', 'Le camp est protégé : les zombies ne passent plus la nuit.'], [0.35, '🗼', 'Tour de guet', 'On voit les zombies arriver de loin.'], [0.55, '🥕', 'Potager', 'Le camp peut nourrir tout le monde.'], [0.75, '🏥', 'Infirmerie', 'Les griffés sont soignés plus vite.'], [0.9, '📡', 'Radio', 'Le signal des secours est capté : le camp est sauvé !']];
const DF_ZMIS = [
  { t:'Le ravitaillement', ico:'🥫', intro:'Ici la radio du camp. Nos réserves sont vides. Vous allez courir jusqu\'au supermarché abandonné et revenir avec de quoi tenir. Restez à votre allure : ceux qui partent trop vite s\'épuisent et se font rattraper.',
    radio:['Les zombies sortent du parking ! Fuyez, à votre allure !', 'Ils sont derrière vous, ne vous retournez pas, courez !', 'Une rue bloquée : contournez par le parc, gardez le rythme !', 'Ils accélèrent ! Tenez votre allure, pas plus vite !', 'Dernière ligne droite vers le camp, tenez bon !'] },
  { t:'L\'hôpital abandonné', ico:'🏥', intro:'Ici la radio du camp. Il nous faut des médicaments. L\'hôpital est envahi : vous allez enchaîner des sprints entre les couloirs et vous cacher dans les salles vides pour souffler.',
    radio:['Les portes cèdent ! Courez jusqu\'à l\'escalier !', 'Couloir B, ils arrivent par la gauche, filez !', 'Attrapez la trousse et repartez, vite mais régulier !', 'Les lumières s\'éteignent, fiez-vous à votre allure !', 'Sortie de secours en vue, dernier effort !'] },
  { t:'La radio de la colline', ico:'📡', intro:'Ici la radio du camp. Pour appeler les secours, il faut réparer l\'antenne en haut de la colline. Chaque fuite vous rapproche du sommet ; chaque planque vous laisse reprendre votre souffle.',
    radio:['Les zombies montent la colline, partez !', 'Sentier étroit : un pas après l\'autre, gardez le rythme !', 'Ils vous ont repérés, fuyez jusqu\'au prochain rocher !', 'Le vent se lève, ne lâchez pas votre allure !', 'L\'antenne est en vue, dernier sprint maîtrisé !'] },
];
const dfZMis = (n, i, e) => { const g = S.dfg && S.dfg[n] && S.dfg[n][i]; const k = g && g.mis != null ? g.mis : (e.mission || 0); return DF_ZMIS[k] || DF_ZMIS[0]; };
/* état d'un survivant : ressources gagnées, infection (2 rattrapages de suite), antidote (fuite réussie après) */
function dfZState(x){
  const seq = []; (x && x.r || []).forEach(row => (row || []).forEach(v => { if (v != null) seq.push(v); }));
  let inf = false, streak = 0, res = 0, cured = 0;
  seq.forEach(v => { if (v === 2) { res++; if (inf) { inf = false; cured++; } streak = 0; } else if (v === 0) { streak++; if (streak >= 2) inf = true; } else streak = 0; });
  return { seq, res, inf, cured, griffes: seq.filter(v => v === 1).length };
}
const dfZResOf = (sid, k) => { let h = 0; for (const ch of sid + k) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return DF_ZRES[h % DF_ZRES.length]; };
const dfZPhases = P => P.map(p => ({ ...p, n: p.n.replace(/effort (\d+)/, '🧟 Fuite $1').replace(/^Récup entre séries/, '🏕️ Retour au camp').replace(/^Récupération$/, '🏚️ Planque').replace(/^Récup \(\w+\)$/, '🏚️ Planque') }));
/* sons et messages radio du minuteur (appelé à chaque affichage) */
function dfZHook(key, e){
  const T = dfTimer(key), n = curLesson(), i = UI.ex, M = dfZMis(n, i, e);
  T.onPhase = st => { const ph = (T.phases || [])[st.k];
    if (!ph) { beepEnd(); dfSay('Tout le monde est rentré au camp. Bravo, survivants !'); return; }
    if (ph.n.includes('Fuite')) { dfSnd.growl(); const f = T.phases.slice(0, st.k + 1).filter(p => p.n.includes('Fuite')).length - 1; dfSay('Radio du camp. ' + M.radio[f % M.radio.length], 1.2); }
    else { dfSnd.whistle(); dfSay(ph.n.includes('camp') ? 'Retour au camp. Récupérez, la prochaine sortie approche.' : 'Planque ! Reprends ton souffle.', 0.6); } };
  T.onGo = T_ => { const st = dfTimerState(T_), ph = (T_.phases || [])[st.k]; if (ph && ph.n.includes('Fuite')) { dfSnd.growl(); dfSay('Radio du camp. ' + (T_.acc < 1 ? M.intro + ' ' : '') + M.radio[0], 1.2); } };
}
function dfZBanner(key){
  const T = dfTimer(key), st = dfTimerState(T), ph = (T.phases || [])[st.k], started = T.run || T.acc > 0, fuite = started && ph && ph.n.includes('Fuite');
  return `<div class="df-zban ${fuite ? 'fuite' : started && ph ? 'planque' : ''}">${fuite ? '🧟🧟🧟 FUIS ! Les zombies sont derrière toi : tiens ta cible !' : started && ph ? '🏚️ PLANQUE : reprends ton souffle, les zombies rôdent…' : started ? '🏕️ Tout le monde est rentré au camp.' : '📻 Prêts ? Au départ, les zombies sortent du bois.'}</div>`;
}
function dfZHead(n, i, e){
  const M = dfZMis(n, i, e), cur = DF_ZMIS.indexOf(M);
  return `<div class="card df-zhead"><div class="btn-row spread"><h3 style="margin:0">${M.ico} Mission : ${esc(M.t)}</h3><div class="btn-row">${dfVoiceBtn()}<button class="btn small" data-action="dfZTest">🧟 Grognement</button></div></div>
    <div class="filters"><b>Mission :</b>${DF_ZMIS.map((m, k) => `<button class="chip ${k === cur ? 'on' : ''}" data-action="dfZMis" data-i="${i}" data-k="${k}">${m.ico} ${esc(m.t)}</button>`).join('')}</div>
    <p class="df-zintro">📻 ${esc(M.intro)}</p>
    <p class="muted" style="margin:0">Deux 🧟 de suite = <b>infecté</b> 🤢 ; une fuite réussie ensuite = <b>antidote</b> 💉. Personne n'est éliminé : tout le monde court toutes les fuites. 🧟‍♂️ = « zombie chasseur » (élève lièvre à +10 %, qui part 2 plots derrière).</p></div>`;
}
function dfZCamp(n, i, e){
  const L = dfExList(n, i, e), Z = L.map(s => ({ s, z: dfZState(dfX(n, s.id, i)) })), total = Z.reduce((a, q) => a + q.z.res, 0), max = Math.max(1, L.length * dfRepCount(e)), ratio = total / max;
  const next = DF_ZBUILD.find(b => ratio < b[0]), inf = Z.filter(q => q.z.inf).length, R = DF_ZRES.map(([ic]) => [ic, 0]);
  Z.forEach(({ s }) => ((dfX(n, s.id, i) || {}).r || []).forEach((row, a) => (row || []).forEach((v, b) => { if (v === 2) R.find(q => q[0] === dfZResOf(s.id, a + '-' + b)[0])[1]++; })));
  return `<div class="card df-zcamp"><div class="btn-row spread"><h3 style="margin:0">🏕️ Le camp des survivants</h3><b>🧑 ${L.length - inf} humain(s) · 🤢 ${inf} infecté(s) · 🎒 ${total} ressource(s)</b></div>
    <div class="df-zbar"><span style="width:${Math.min(100, Math.round(ratio / 0.9 * 100))}%"></span></div>
    <div class="df-zbuilds">${DF_ZBUILD.map(b => `<div class="df-zb ${ratio >= b[0] ? 'on' : ''}" title="${esc(b[3])}"><span>${b[1]}</span><b>${b[2]}</b><small>${ratio >= b[0] ? 'construit' : Math.ceil(b[0] * max) + ' ressources'}</small></div>`).join('')}</div>
    <p class="muted">${next ? `Prochaine construction : <b>${next[1]} ${next[2]}</b> à ${Math.ceil(next[0] * max)} ressources.` : '<b>📡 Les secours ont capté le signal : le camp est sauvé !</b>'} Réserves : ${R.map(([ic, k]) => ic + ' ' + k).join(' · ')}</p></div>`;
}
DF_VIEWS.zf = { view: (n, i, e) => dfZHead(n, i, e) + dfFracView(n, i, e) + dfZCamp(n, i, e) };
DF_LINE.zf = (n, sid, i, e) => { const x = dfX(n, sid, i); if (!x) return ''; const a = dfFracCells(x), z = dfZState(x);
  return `<div class="muted">${a.length}/${dfRepCount(e)} fuites · cibles ${a.length ? Math.round(avg(a.map(v => v / 2)) * 100) + ' %' : '—'} · 🎒 ${z.res} · ${x.zc ? '🧟‍♂️ chasseur' : z.inf ? '🤢 infecté' : z.cured ? '💉 guéri' : '🧑 humain'}</div>`; };

Object.assign(ACT, {
  dfVoice: () => { ROOT.dfVoice = !dfVoiceOn(); save(); if (dfVoiceOn()) dfSay('Voix activée'); rerender(); },
  dfZc: d => { const n = curLesson(); dfSetX(n, d.sid, +d.i, o => { o.zc = !o.zc; if (!o.zc) delete o.zc; }); rerender(); },
  dfZMis: d => { const n = curLesson(), g = dfGame(n, +d.i); g.mis = +d.k; save(); rerender(); },
  dfZTest: () => dfSnd.growl(),
});
