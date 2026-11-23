/* =====================================================================
   DEMI-FOND N'EPS — sons et voix de la tablette (appel des départs « All finishers »)
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

Object.assign(ACT, { dfVoice: () => { ROOT.dfVoice = !dfVoiceOn(); save(); if (dfVoiceOn()) dfSay('Voix activée'); rerender(); } });
