import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════
   HEARTSTRING — Africa to the World
   v4 — Login · Persistent Storage · No Duplicates
═══════════════════════════════════════════════════ */

const C = {
  bg: "#08070f", card: "#111018", cardAlt: "#0e0d16",
  border: "rgba(240,165,0,0.12)", borderHov: "rgba(240,165,0,0.35)",
  gold: "#f0a500", orange: "#e07b39", cream: "#fdf0d5",
  text: "#f0e8d6", muted: "#8a7a64", green: "#2d6a4f",
  lime: "#48b87e", purple: "#c77dff", red: "#e63946",
  blue: "#48cae4", teal: "#7ec8e3",
};

const LANGS = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "sw", label: "Kiswahili", flag: "🇰🇪" },
  { code: "yo", label: "Yorùbá", flag: "🇳🇬" },
  { code: "ha", label: "Hausa", flag: "🇳🇬" },
  { code: "zu", label: "isiZulu", flag: "🇿🇦" },
  { code: "am", label: "አማርኛ", flag: "🇪🇹" },
  { code: "ar", label: "العربية", flag: "🇪🇬" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
];

/* ── Storage helpers ── */
async function save(key, val) {
  try { await window.storage.set(key, JSON.stringify(val)); } catch {}
}
async function load(key, fallback = null) {
  try {
    const r = await window.storage.get(key);
    return r ? JSON.parse(r.value) : fallback;
  } catch { return fallback; }
}
async function loadShared(key, fallback = null) {
  try {
    const r = await window.storage.get(key, true);
    return r ? JSON.parse(r.value) : fallback;
  } catch { return fallback; }
}
async function saveShared(key, val) {
  try { await window.storage.set(key, JSON.stringify(val), true); } catch {}
}

/* ── Unique ID ── */
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

/* ── Seed posts (community data) ── */
const SEED_ADVICE = [
  { id: "seed-1", author: "Anonymous", avatar: "?", color: C.teal, tag: "Silent Treatment", tagColor: C.blue, question: "We had a fight 4 days ago and just... stopped talking. It feels like reaching out means I lost. But every day of silence kills me more. What do I do?", replies: 34, helpful: 89, time: "6h ago", topAnswer: { by: "Amaka · 3yr LDR", text: "Whoever reaches out first didn't lose — they won. They chose the relationship over their ego. Send one message: 'I miss you and I want us to be okay.' That's the whole message." } },
  { id: "seed-2", author: "Kofi · Accra ↔ Seoul", avatar: "KO", color: C.orange, tag: "Drifting Apart", tagColor: C.orange, question: "We're not fighting. We're just drifting. Calls feel like check-ins. We used to talk for 3 hours. Now I'm lucky if we go 30 minutes. Is this the end?", replies: 61, helpful: 134, time: "1 day ago", topAnswer: { by: "Zanele · LDR veteran", text: "This is the plateau — almost every LDR hits it. You haven't run out of love, you've run out of new things. Stop scheduling 'calls' and start scheduling experiences. Cook together, watch something, play a game." } },
  { id: "seed-3", author: "Anonymous", avatar: "?", color: C.purple, tag: "Jealousy", tagColor: C.purple, question: "My partner has a close friend at their university. They hang out a lot. Distance makes everything feel 10x more threatening. I can't sleep.", replies: 47, helpful: 102, time: "2 days ago", topAnswer: { by: "Fatima · Nairobi ↔ Paris", text: "What you're feeling is insecurity dressed as jealousy — and distance is the cause, not your partner. Ask: what would make ME feel safe without controlling them? Share that as a need, not an accusation." } },
  { id: "seed-4", author: "Wanjiru · Nairobi ↔ Amsterdam", avatar: "WJ", color: C.lime, tag: "Loneliness", tagColor: C.lime, question: "I sit at events with people laughing and I'm texting my partner 'I wish you were here' but they're asleep because timezones. I feel lonely in rooms full of people.", replies: 78, helpful: 203, time: "3 days ago", topAnswer: { by: "Community Wisdom", text: "It doesn't fully go away — but it transforms. You stop feeling lonely in crowds and start feeling proud. Proud that you love someone so deeply that no room feels quite complete without them." } },
];

const SEED_GROUPS = [
  { id: "g1", name: "Pan-African LDR", emoji: "🌍", color: C.orange, members: "18.4k", msgs: [
    { id: "g1-m1", sender: "Amara", av: "AM", color: C.orange, text: "Good morning from Lagos! ☀️ Anyone doing the 5AM call routine?", time: "06:12" },
    { id: "g1-m2", sender: "Kofi", av: "KO", color: C.green, text: "Every single day. Accra to Seoul — 8 hour difference. Worth every yawn 😂", time: "06:15" },
    { id: "g1-m3", sender: "Fatima", av: "FA", color: C.purple, text: "This community saved my relationship on the hardest days. Sending love 💛", time: "06:24" },
  ]},
  { id: "g2", name: "East Africa ↔ World", emoji: "🦁", color: C.gold, members: "11.2k", msgs: [
    { id: "g2-m1", sender: "Wanjiru", av: "WA", color: C.gold, text: "Nairobi to Amsterdam. Daily voice notes — never missed one in 14 months.", time: "08:00" },
  ]},
  { id: "g3", name: "West Africa Connected", emoji: "🌴", color: C.green, members: "22.1k", msgs: [
    { id: "g3-m1", sender: "Chioma", av: "CH", color: C.orange, text: "Abuja to London. He sends pepper soup through friends 😭❤️", time: "10:00" },
  ]},
  { id: "g4", name: "Closing the Gap ✈️", emoji: "✈️", color: C.red, members: "13.5k", msgs: [
    { id: "g4-m1", sender: "James", av: "JA", color: C.red, text: "23 days. TWENTY THREE DAYS. I cannot stop shaking 🙏", time: "16:00" },
  ]},
];

const SILENCE_TIPS = [
  { icon: "💌", title: "The One-Line Break", body: "Send exactly this: 'I don't want us to be like this.' No blame. No long message. It opens a door without deciding who's right.", color: C.teal },
  { icon: "🎙️", title: "Voice Note First", body: "Your voice breaks walls that typed words cannot. Send a 20-second voice note — just your voice.", color: C.gold },
  { icon: "⏳", title: "The 24-Hour Rule", body: "Wait 24 hours before sending anything important when angry. In LDR, messages are permanent.", color: C.orange },
  { icon: "🌙", title: "Never End a Night Silent", body: "Even 'Goodnight' breaks the cold. It says: I'm still here. You matter more than my pride.", color: C.purple },
  { icon: "🤝", title: "Reaching Out First = Strength", body: "Whoever reaches out first chose the relationship over their ego. You can't 'wait it out' across miles.", color: C.lime },
  { icon: "📝", title: "Write What You Can't Say", body: "'I feel...' instead of 'You always...' — that one shift changes the whole energy of reconnection.", color: C.red },
];

const LDR_STAGES = [
  { range: "0–3 Months", emoji: "🌱", color: C.lime, title: "The Honeymoon Distance", desc: "Everything is exciting. Calls are long. You're still discovering each other from afar.", advice: "Build communication rituals NOW before novelty fades. Daily voice notes, weekly video dates. Create the structure while you're motivated." },
  { range: "3–8 Months", emoji: "🌤️", color: C.gold, title: "The Adjustment", desc: "Calls start feeling repetitive. You wonder if this is sustainable.", advice: "Don't mistake routine for distance. Introduce experience calls — cook together, watch something, play games." },
  { range: "8–18 Months", emoji: "⛈️", color: C.orange, title: "The Hard Season", desc: "Fights are more intense. Silences longer. Jealousy surfaces. You question everything.", advice: "This is where most LDRs end — not from lack of love but lack of tools. You need an end date and a plan." },
  { range: "18+ Months", emoji: "🌅", color: C.purple, title: "The Commitment", desc: "You've built something unbreakable. You've survived everything.", advice: "You're choosing this. Now actively close the gap. This is a season, not a permanent state." },
];

/* ═══════ REUSABLE UI ═══════ */
function Av({ initials, color, size = 40 }) {
  const bg = color || C.muted;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: size * 0.33, color: "#08070f", flexShrink: 0, border: `2px solid ${bg}66` }}>
      {initials === "?" ? "👤" : initials}
    </div>
  );
}

function Pill({ label, color }) {
  return <span style={{ background: color + "22", color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, fontFamily: "'Nunito', sans-serif", border: `1px solid ${color}44`, whiteSpace: "nowrap" }}>{label}</span>;
}

/* ═══════ TRANSLATE ═══════ */
function TranslateBtn({ text }) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chosen, setChosen] = useState(null);

  async function go(lang) {
    setChosen(lang); setOpen(false); setResult(null); setLoading(true);
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 400, messages: [{ role: "user", content: `Translate to ${lang.label}. Return ONLY the translation:\n\n${text}` }] }),
      });
      const d = await r.json();
      setResult(d.content?.map(c => c.text || "").join("") || "Translation unavailable.");
    } catch { setResult("Translation unavailable right now."); }
    setLoading(false);
  }

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button onClick={() => { if (result) { setResult(null); setChosen(null); } else setOpen(!open); }}
        style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 20, padding: "3px 10px", cursor: "pointer", color: C.gold, fontSize: 11, fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>
        🌐 {result ? `${chosen?.flag} Hide` : "Translate"}
      </button>
      {open && (
        <div style={{ position: "absolute", bottom: "calc(100% + 6px)", left: 0, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 6, zIndex: 300, minWidth: 160, boxShadow: "0 8px 30px #00000099" }}>
          {LANGS.map(l => (
            <button key={l.code} onClick={() => go(l)} style={{ width: "100%", background: "none", border: "none", padding: "6px 10px", borderRadius: 7, cursor: "pointer", display: "flex", gap: 7, alignItems: "center", color: C.text, fontFamily: "'Nunito', sans-serif", fontSize: 13, textAlign: "left" }}
              onMouseEnter={e => e.currentTarget.style.background = C.gold + "15"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}>
              {l.flag} {l.label}
            </button>
          ))}
        </div>
      )}
      {loading && <p style={{ color: C.gold, fontSize: 11, margin: "6px 0 0", fontFamily: "'Nunito', sans-serif" }}>⟳ Translating...</p>}
      {result && !loading && (
        <div style={{ marginTop: 8, padding: "10px 12px", background: C.gold + "11", border: `1px solid ${C.gold}33`, borderRadius: 10 }}>
          <div style={{ color: C.gold, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4, fontFamily: "'Nunito', sans-serif" }}>{chosen?.flag} {chosen?.label}</div>
          <p style={{ color: C.cream, fontFamily: "'Nunito', sans-serif", fontSize: 13, lineHeight: 1.65, margin: 0 }}>{result}</p>
        </div>
      )}
    </div>
  );
}

/* ═══════ AMARA AI ADVISOR ═══════ */
function AmaraAdvisor({ user }) {
  const storageKey = `amara-chat-${user?.id || "guest"}`;
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    { id: "init", from: "amara", text: `Hey${user?.name ? ` ${user.name}` : ""}. I'm Amara — your LDR advisor. Whatever you're going through right now, say it here. No judgment.` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const histRef = useRef([]);
  const botRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    load(storageKey).then(saved => {
      if (saved?.msgs?.length) { setMsgs(saved.msgs); histRef.current = saved.history || []; }
    });
  }, [open]);

  useEffect(() => {
    if (botRef.current) botRef.current.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  async function send() {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput("");
    const userMsg = { id: uid(), from: "user", text };
    const newMsgs = [...msgs, userMsg];
    setMsgs(newMsgs);
    histRef.current = [...histRef.current, { role: "user", content: text }];
    setLoading(true);
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 400,
          system: `You are Amara, a warm and empathetic LDR (long distance relationship) advisor for the Heartstring community app — built from Africa for couples worldwide.
Help people through: silence after fights, loneliness, jealousy, drifting apart, communication breakdowns.
Style: warm, like a wise older sister. Acknowledge feelings FIRST. Give specific actionable advice. 80-120 words max. Never say "just communicate more" without explaining how. Never be dismissive.`,
          messages: histRef.current,
        }),
      });
      const d = await r.json();
      const reply = d.content?.map(c => c.text || "").join("") || "I'm still here. Keep talking.";
      histRef.current = [...histRef.current, { role: "assistant", content: reply }];
      const amaraMsg = { id: uid(), from: "amara", text: reply };
      const finalMsgs = [...newMsgs, amaraMsg];
      setMsgs(finalMsgs);
      await save(storageKey, { msgs: finalMsgs, history: histRef.current });
    } catch {
      setMsgs(prev => [...prev, { id: uid(), from: "amara", text: "Connection dropped. I'm still here — say it again." }]);
    }
    setLoading(false);
  }

  const STARTERS = ["We stopped talking after a fight", "I feel like we're drifting", "I'm feeling very lonely", "Who should reach out first?"];

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{ width: "100%", background: "linear-gradient(135deg, #0d1a20, #0a0d1a)", border: `1px solid ${C.teal}55`, borderRadius: 16, padding: "18px 20px", cursor: "pointer", textAlign: "left", marginBottom: 12, display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 46, height: 46, borderRadius: "50%", background: C.teal + "22", border: `2px solid ${C.teal}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🕊️</div>
      <div style={{ flex: 1 }}>
        <div style={{ color: C.teal, fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 700 }}>Talk to Amara</div>
        <div style={{ color: C.muted, fontSize: 12, fontFamily: "'Nunito', sans-serif" }}>AI advisor · 24/7 · Private · Your chat is saved</div>
      </div>
      <span style={{ color: C.teal }}>→</span>
    </button>
  );

  return (
    <div style={{ background: C.card, border: `1px solid ${C.teal}44`, borderRadius: 16, overflow: "hidden", marginBottom: 12 }}>
      <div style={{ background: "linear-gradient(135deg, #0d1a20, #0a0d1a)", padding: "13px 16px", display: "flex", gap: 10, alignItems: "center", borderBottom: `1px solid ${C.teal}22` }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.teal + "33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🕊️</div>
        <div style={{ flex: 1 }}>
          <div style={{ color: C.cream, fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 14 }}>Amara · LDR Advisor</div>
          <div style={{ color: C.lime, fontSize: 10, fontFamily: "'Nunito', sans-serif" }}>🟢 Online · Chat saved to your account</div>
        </div>
        <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: C.muted, fontSize: 15, cursor: "pointer" }}>✕</button>
      </div>
      <div style={{ height: 280, overflowY: "auto", padding: "12px 12px 0", display: "flex", flexDirection: "column", gap: 9 }}>
        {msgs.map(m => (
          <div key={m.id} style={{ display: "flex", gap: 7, flexDirection: m.from === "user" ? "row-reverse" : "row", alignItems: "flex-end" }}>
            {m.from === "amara" && <div style={{ width: 26, height: 26, borderRadius: "50%", background: C.teal + "33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>🕊️</div>}
            <div style={{ maxWidth: "76%", background: m.from === "user" ? C.gold + "1a" : "#0d1a20", border: `1px solid ${m.from === "user" ? C.gold + "44" : C.teal + "22"}`, borderRadius: m.from === "user" ? "14px 3px 14px 14px" : "3px 14px 14px 14px", padding: "9px 12px" }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: C.cream, lineHeight: 1.65, margin: 0 }}>{m.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 7, alignItems: "flex-end" }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: C.teal + "33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>🕊️</div>
            <div style={{ background: "#0d1a20", border: `1px solid ${C.teal}22`, borderRadius: "3px 14px 14px 14px", padding: "11px 14px", display: "flex", gap: 4 }}>
              {[0, 1, 2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: C.teal, animation: "dot 1.2s ease infinite", animationDelay: `${i * 0.2}s` }} />)}
            </div>
          </div>
        )}
        <div ref={botRef} />
      </div>
      {msgs.length < 3 && (
        <div style={{ padding: "8px 12px", display: "flex", gap: 5, flexWrap: "wrap" }}>
          {STARTERS.map(q => (
            <button key={q} onClick={() => setInput(q)} style={{ background: C.teal + "11", border: `1px solid ${C.teal}33`, borderRadius: 20, padding: "4px 9px", cursor: "pointer", color: C.teal, fontSize: 11, fontFamily: "'Nunito', sans-serif" }}>{q}</button>
          ))}
        </div>
      )}
      <div style={{ padding: "9px 12px 12px", borderTop: `1px solid ${C.teal}22`, display: "flex", gap: 7, alignItems: "flex-end" }}>
        <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="What's happening..." rows={2}
          style={{ flex: 1, background: "#0d1a20", border: `1px solid ${C.teal}33`, borderRadius: 9, padding: "8px 11px", color: C.cream, fontFamily: "'Cormorant Garamond', serif", fontSize: 14, outline: "none", resize: "none", lineHeight: 1.5 }} />
        <button onClick={send} disabled={loading || !input.trim()} style={{ width: 38, height: 38, borderRadius: 9, background: loading ? C.muted : C.teal, border: "none", cursor: loading ? "not-allowed" : "pointer", fontSize: 16, color: "#08070f", fontWeight: 700, flexShrink: 0 }}>→</button>
      </div>
    </div>
  );
}

/* ═══════ BREAK THE SILENCE ═══════ */
function BreakSilence() {
  const [step, setStep] = useState(0);
  const [dur, setDur] = useState("");
  const [cause, setCause] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 120, messages: [{ role: "user", content: `Write a short genuine first message to break silence in an LDR. Silence duration: ${dur}. Cause: ${cause}. 2-3 sentences max. Warm but not desperate. No blame. Like a real WhatsApp text. Return ONLY the message.` }] }),
      });
      const d = await r.json();
      setMsg(d.content?.map(c => c.text || "").join("") || "I miss us. I don't want this silence. I'm here when you're ready.");
    } catch { setMsg("I miss you and I want us to be okay. That's all I wanted to say."); }
    setLoading(false);
    setStep(3);
  }

  return (
    <div style={{ background: "linear-gradient(135deg, #0d1a20, #0a0d1a)", border: `1px solid ${C.teal}44`, borderRadius: 16, padding: 20, marginBottom: 12 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 22 }}>🕊️</span>
        <div>
          <div style={{ color: C.cream, fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 700 }}>Break the Silence</div>
          <div style={{ color: C.muted, fontSize: 11, fontFamily: "'Nunito', sans-serif" }}>AI writes the first message so you don't have to</div>
        </div>
      </div>
      {step === 0 && (
        <div>
          <p style={{ color: C.muted, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14, marginBottom: 10 }}>How long have you been silent?</p>
          {["Less than 24 hours", "1–3 days", "3–7 days", "Over a week", "Over a month"].map(d => (
            <button key={d} onClick={() => { setDur(d); setStep(1); }} style={{ width: "100%", display: "block", background: C.card, border: `1px solid ${C.border}`, borderRadius: 9, padding: "10px 13px", cursor: "pointer", color: C.text, fontFamily: "'Nunito', sans-serif", fontSize: 13, textAlign: "left", marginBottom: 6, transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.teal + "66"; e.currentTarget.style.background = C.teal + "08"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.card; }}>{d}</button>
          ))}
        </div>
      )}
      {step === 1 && (
        <div>
          <div style={{ color: C.teal, fontSize: 12, fontFamily: "'Nunito', sans-serif", marginBottom: 10 }}>Silent for: <b>{dur}</b></div>
          <p style={{ color: C.muted, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14, marginBottom: 10 }}>What caused the silence?</p>
          {["We had a fight", "I said something I regret", "They said something that hurt me", "We drifted into silence", "I don't even know"].map(c => (
            <button key={c} onClick={() => { setCause(c); setStep(2); }} style={{ width: "100%", display: "block", background: C.card, border: `1px solid ${C.border}`, borderRadius: 9, padding: "10px 13px", cursor: "pointer", color: C.text, fontFamily: "'Nunito', sans-serif", fontSize: 13, textAlign: "left", marginBottom: 6, transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.teal + "66"; e.currentTarget.style.background = C.teal + "08"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.card; }}>{c}</button>
          ))}
          <button onClick={() => setStep(0)} style={{ background: "none", border: "none", color: C.muted, fontSize: 12, cursor: "pointer", fontFamily: "'Nunito', sans-serif", marginTop: 4 }}>← Back</button>
        </div>
      )}
      {step === 2 && (
        <div style={{ textAlign: "center" }}>
          <p style={{ color: C.cream, fontFamily: "'Cormorant Garamond', serif", fontSize: 15, lineHeight: 1.7, marginBottom: 18 }}>
            Silent for <span style={{ color: C.teal }}>{dur}</span> after <span style={{ color: C.teal }}>{cause?.toLowerCase()}</span>.
          </p>
          <button onClick={generate} disabled={loading} style={{ background: loading ? C.muted : C.teal, color: "#08070f", border: "none", borderRadius: 20, padding: "11px 26px", cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 14 }}>
            {loading ? "Writing..." : "Write My Message 🕊️"}
          </button>
          <button onClick={() => setStep(1)} style={{ display: "block", margin: "8px auto 0", background: "none", border: "none", color: C.muted, fontSize: 12, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>← Back</button>
        </div>
      )}
      {step === 3 && msg && (
        <div>
          <p style={{ color: C.teal, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Nunito', sans-serif", marginBottom: 10 }}>✨ Your message</p>
          <div style={{ background: C.teal + "11", border: `1px solid ${C.teal}44`, borderRadius: 12, padding: "16px 18px", fontFamily: "'Cormorant Garamond', serif", fontSize: 17, color: C.cream, lineHeight: 1.8, fontStyle: "italic", marginBottom: 14 }}>"{msg}"</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => { try { navigator.clipboard.writeText(msg); } catch {} }} style={{ background: C.lime + "22", border: `1px solid ${C.lime}44`, color: C.lime, padding: "8px 14px", borderRadius: 20, cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: 600 }}>📋 Copy</button>
            <button onClick={() => { setStep(2); setMsg(""); }} style={{ background: "none", border: `1px solid ${C.border}`, color: C.muted, padding: "8px 14px", borderRadius: 20, cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontSize: 12 }}>↺ New</button>
            <button onClick={() => { setStep(0); setDur(""); setCause(""); setMsg(""); }} style={{ background: "none", border: `1px solid ${C.border}`, color: C.muted, padding: "8px 14px", borderRadius: 20, cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontSize: 12 }}>Start Over</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════ COUNTDOWN ═══════ */
function Countdown({ user }) {
  const [timer, setTimer] = useState({ d: 34, h: 8, m: 22, s: 41 });
  useEffect(() => {
    const iv = setInterval(() => setTimer(prev => {
      let { d, h, m, s } = prev;
      s--; if (s < 0) { s = 59; m--; } if (m < 0) { m = 59; h--; } if (h < 0) { h = 23; d = Math.max(0, d - 1); }
      return { d, h, m, s };
    }), 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ background: "linear-gradient(135deg, #1a0a00, #0d0d1a)", border: `1px solid ${C.gold}33`, borderRadius: 16, padding: 20, marginBottom: 12, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)` }} />
      <div style={{ color: C.gold, letterSpacing: 4, fontSize: 10, textTransform: "uppercase", fontFamily: "'Nunito', sans-serif", marginBottom: 10 }}>
        ✈️ Next Reunion{user?.partnerCity ? ` · ${user.partnerCity}` : ""}
      </div>
      <div style={{ display: "flex", gap: 14 }}>
        {[{ v: timer.d, l: "Days" }, { v: timer.h, l: "Hours" }, { v: timer.m, l: "Mins" }, { v: timer.s, l: "Secs" }].map(({ v, l }) => (
          <div key={l} style={{ textAlign: "center", minWidth: 44 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 700, color: C.cream, lineHeight: 1 }}>{String(v).padStart(2, "0")}</div>
            <div style={{ color: C.gold, fontSize: 9, letterSpacing: 2, fontFamily: "'Nunito', sans-serif", marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════ CALL SCREEN ═══════ */
function CallScreen({ contact, mode, onEnd }) {
  const [secs, setSecs] = useState(0);
  const [muted, setMuted] = useState(false);
  useEffect(() => { const iv = setInterval(() => setSecs(s => s + 1), 1000); return () => clearInterval(iv); }, []);
  const fmt = n => `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "linear-gradient(160deg, #08070f 0%, #1a0a00 40%, #0a0f1a 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "70px 24px 60px" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 30%, rgba(240,165,0,0.07) 0%, transparent 60%)" }} />
      <div style={{ position: "relative", textAlign: "center" }}>
        <div style={{ color: C.gold, letterSpacing: 4, fontSize: 11, textTransform: "uppercase", fontFamily: "'Nunito', sans-serif", marginBottom: 26 }}>{mode === "video" ? "📹 Video" : "📞 Voice"} · {fmt(secs)}</div>
        <div style={{ position: "relative", display: "inline-block", marginBottom: 20 }}>
          {[1, 2, 3].map(i => <div key={i} style={{ position: "absolute", inset: -(i * 13), borderRadius: "50%", border: `1px solid ${C.gold}`, opacity: 0.3 / i }} />)}
          <Av initials={contact.avatar} color={contact.color} size={106} />
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, color: C.cream }}>{contact.name}</div>
        <div style={{ color: C.muted, fontSize: 13, fontFamily: "'Nunito', sans-serif", marginTop: 3 }}>{contact.location}</div>
      </div>
      <div style={{ position: "relative", display: "flex", gap: 22, alignItems: "center" }}>
        {[
          { icon: muted ? "🔇" : "🎙️", label: muted ? "Unmute" : "Mute", action: () => setMuted(v => !v), big: false, red: false },
          { icon: "📴", label: "End", action: onEnd, big: true, red: true },
          { icon: "💬", label: "Chat", action: () => {}, big: false, red: false },
        ].map(b => (
          <div key={b.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <button onClick={b.action} style={{ width: b.big ? 66 : 52, height: b.big ? 66 : 52, borderRadius: "50%", background: b.red ? C.red : C.card, border: `2px solid ${b.red ? C.red : C.border}`, fontSize: b.big ? 22 : 17, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: b.red ? `0 0 26px ${C.red}55` : "none" }}>{b.icon}</button>
            <span style={{ color: C.muted, fontSize: 10, fontFamily: "'Nunito', sans-serif" }}>{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════ STAGE GUIDE ═══════ */
function StageGuide() {
  const [open, setOpen] = useState(null);
  return (
    <div>
      {LDR_STAGES.map((s, i) => (
        <div key={i} onClick={() => setOpen(open === i ? null : i)} style={{ background: C.card, border: `1px solid ${open === i ? s.color + "55" : C.border}`, borderRadius: 13, marginBottom: 9, cursor: "pointer", overflow: "hidden", transition: "border-color 0.2s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "14px 16px" }}>
            <span style={{ fontSize: 22 }}>{s.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 15, color: C.cream }}>{s.title}</div>
              <div style={{ color: s.color, fontSize: 11, fontFamily: "'Nunito', sans-serif" }}>{s.range}</div>
            </div>
            <span style={{ color: C.muted, fontSize: 13 }}>{open === i ? "▲" : "▼"}</span>
          </div>
          {open === i && (
            <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${s.color}22` }}>
              <p style={{ color: C.muted, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 13, lineHeight: 1.7, paddingTop: 12, marginBottom: 10 }}>{s.desc}</p>
              <div style={{ background: s.color + "11", border: `1px solid ${s.color}33`, borderRadius: 10, padding: "11px 13px" }}>
                <div style={{ color: s.color, fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 5, fontFamily: "'Nunito', sans-serif" }}>What to do now</div>
                <p style={{ color: C.cream, fontFamily: "'Nunito', sans-serif", fontSize: 12, lineHeight: 1.7, margin: 0 }}>{s.advice}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════
   AUTH SCREEN
   • Returning user  → email only, instant login
   • New user        → email → create account (password set once)
   • Forgot password → opens Gmail
═══════════════════════════════ */
function AuthScreen({ onLogin }) {
  // screen: "email" | "new-account" | "new-ldr" | "forgot"
  const [screen, setScreen] = useState("email");
  const [email, setEmail]   = useState("");
  const [form,  setForm]    = useState({ name: "", password: "", partnerName: "", myCity: "", partnerCity: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  function setF(k, v) { setForm(f => ({ ...f, [k]: v })); setError(""); }

  /* ── Step 1: user enters email ── */
  async function checkEmail() {
    const e = email.trim().toLowerCase();
    if (!e || !e.includes("@")) { setError("Please enter a valid email address."); return; }
    setLoading(true);
    setError("");
    const stored = await load(`user-auth-${e}`);
    if (stored) {
      // Returning user — log in instantly, no password needed
      await save("current-user", stored);
      onLogin(stored);
    } else {
      // New user — go to account creation
      setScreen("new-account");
    }
    setLoading(false);
  }

  /* ── Step 2a: create account ── */
  async function createAccount() {
    if (!form.name.trim()) { setError("Please enter your name."); return; }
    if (!form.password || form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setError("");
    setScreen("new-ldr");
  }

  /* ── Step 2b: save account with LDR details ── */
  async function finishSignup() {
    setLoading(true);
    const e = email.trim().toLowerCase();
    const user = {
      id: uid(),
      name: form.name.trim(),
      email: e,
      password: form.password,
      partnerName: form.partnerName.trim(),
      myCity: form.myCity.trim(),
      partnerCity: form.partnerCity.trim(),
      initials: form.name.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2),
      joinedAt: new Date().toISOString(),
    };
    await save(`user-auth-${e}`, user);
    await save("current-user", user);
    onLogin(user);
    setLoading(false);
  }

  /* ── Shared input style ── */
  const Inp = ({ placeholder, value, onChange, type = "text", onEnter }) => (
    <input type={type} placeholder={placeholder} value={value} onChange={e => { onChange(e.target.value); setError(""); }}
      onKeyDown={e => e.key === "Enter" && onEnter && onEnter()}
      style={{ width: "100%", background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 12, padding: "13px 16px", color: C.cream, fontFamily: "'Nunito', sans-serif", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 11, transition: "border-color 0.2s" }}
      onFocus={e => e.target.style.borderColor = C.gold + "99"}
      onBlur={e => e.target.style.borderColor = C.border}
    />
  );

  const Btn = ({ label, onClick, disabled, secondary }) => (
    <button onClick={onClick} disabled={disabled} style={{ width: "100%", background: secondary ? "none" : `linear-gradient(135deg, ${C.orange}, ${C.gold})`, border: secondary ? `1px solid ${C.border}` : "none", borderRadius: 12, padding: "13px 0", cursor: disabled ? "not-allowed" : "pointer", color: secondary ? C.muted : "#08070f", fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 15, opacity: disabled ? 0.6 : 1, transition: "opacity 0.2s", marginBottom: secondary ? 0 : 0 }}>
      {label}
    </button>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "28px 20px", position: "relative", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Nunito:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ position: "fixed", top: "15%", left: "25%", width: 500, height: 400, background: `radial-gradient(circle, ${C.gold}06 0%, transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "15%", right: "15%", width: 350, height: 350, background: `radial-gradient(circle, ${C.teal}05 0%, transparent 70%)`, pointerEvents: "none" }} />

      {/* Kente top bar */}
      <div style={{ width: "100%", maxWidth: 440, height: 3, borderRadius: 2, background: `linear-gradient(90deg, ${C.orange}, ${C.gold}, ${C.green}, ${C.purple}, ${C.red})`, marginBottom: 36 }} />

      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <div style={{ fontSize: 42, marginBottom: 10 }}>🌸</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 700, color: C.cream, lineHeight: 1 }}>Heartstring</div>
        <div style={{ color: C.gold, fontSize: 10, letterSpacing: 4, textTransform: "uppercase", marginTop: 5, fontFamily: "'Nunito', sans-serif" }}>Africa to the World</div>
        <p style={{ color: C.muted, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 15, marginTop: 14, lineHeight: 1.6 }}>
          {screen === "email"       && "Miles apart. Hearts together."}
          {screen === "new-account" && "Welcome. Let's set up your account."}
          {screen === "new-ldr"     && "Almost there — tell us about your LDR."}
          {screen === "forgot"      && "We'll help you get back in."}
        </p>
      </div>

      {/* Card */}
      <div style={{ width: "100%", maxWidth: 440, background: C.card, border: `1px solid ${C.border}`, borderRadius: 22, padding: "28px 26px", boxShadow: "0 24px 70px rgba(0,0,0,0.5)" }}>

        {/* ── SCREEN 1: Email entry ── */}
        {screen === "email" && (
          <div>
            <div style={{ color: C.gold, fontSize: 10, letterSpacing: 3, textTransform: "uppercase", fontFamily: "'Nunito', sans-serif", marginBottom: 18 }}>Enter your Gmail to continue</div>
            <Inp placeholder="your@gmail.com" value={email} onChange={setEmail} type="email" onEnter={checkEmail} />
            {error && <p style={{ color: C.red, fontSize: 12, fontFamily: "'Nunito', sans-serif", marginBottom: 10, marginTop: -5 }}>{error}</p>}
            <Btn label={loading ? "Checking..." : "Continue →"} onClick={checkEmail} disabled={loading || !email.trim()} />
            <button onClick={() => setScreen("forgot")} style={{ display: "block", margin: "14px auto 0", background: "none", border: "none", color: C.muted, fontSize: 12, fontFamily: "'Nunito', sans-serif", cursor: "pointer", textDecoration: "underline" }}>
              Forgot password?
            </button>
            <p style={{ color: C.muted, fontSize: 11, fontFamily: "'Nunito', sans-serif", textAlign: "center", marginTop: 16, lineHeight: 1.6 }}>
              Returning? Just enter your email — no password needed.<br />New here? We'll create your account automatically.
            </p>
          </div>
        )}

        {/* ── SCREEN 2a: New account — password set once ── */}
        {screen === "new-account" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
              <button onClick={() => setScreen("email")} style={{ background: "none", border: "none", color: C.gold, fontSize: 17, cursor: "pointer", padding: 0, lineHeight: 1 }}>←</button>
              <div>
                <div style={{ color: C.gold, fontSize: 10, letterSpacing: 3, textTransform: "uppercase", fontFamily: "'Nunito', sans-serif" }}>New Account · Step 1 of 2</div>
                <div style={{ color: C.muted, fontSize: 11, fontFamily: "'Nunito', sans-serif", marginTop: 2 }}>{email}</div>
              </div>
            </div>
            <Inp placeholder="Your full name" value={form.name} onChange={v => setF("name", v)} onEnter={createAccount} />
            <Inp placeholder="Create a password (set once, never asked again)" value={form.password} onChange={v => setF("password", v)} type="password" onEnter={createAccount} />
            {error && <p style={{ color: C.red, fontSize: 12, fontFamily: "'Nunito', sans-serif", marginBottom: 10, marginTop: -5 }}>{error}</p>}
            <div style={{ background: C.teal + "11", border: `1px solid ${C.teal}33`, borderRadius: 10, padding: "10px 13px", marginBottom: 14 }}>
              <p style={{ color: C.teal, fontSize: 12, fontFamily: "'Nunito', sans-serif", margin: 0, lineHeight: 1.6 }}>
                🔒 You only set this password once. Next time, just enter your email and you're in — no password needed.
              </p>
            </div>
            <Btn label="Next →" onClick={createAccount} />
          </div>
        )}

        {/* ── SCREEN 2b: LDR details ── */}
        {screen === "new-ldr" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <button onClick={() => setScreen("new-account")} style={{ background: "none", border: "none", color: C.gold, fontSize: 17, cursor: "pointer", padding: 0, lineHeight: 1 }}>←</button>
              <div style={{ color: C.gold, fontSize: 10, letterSpacing: 3, textTransform: "uppercase", fontFamily: "'Nunito', sans-serif" }}>New Account · Step 2 of 2</div>
            </div>
            <p style={{ color: C.muted, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14, marginBottom: 16, lineHeight: 1.6 }}>
              Optional — personalises your countdown, calls & experience
            </p>
            <Inp placeholder="Your partner's name" value={form.partnerName} onChange={v => setF("partnerName", v)} />
            <Inp placeholder="Your city / country (e.g. Lagos, Nigeria)" value={form.myCity} onChange={v => setF("myCity", v)} />
            <Inp placeholder="Their city / country (e.g. London, UK)" value={form.partnerCity} onChange={v => setF("partnerCity", v)} onEnter={finishSignup} />
            {error && <p style={{ color: C.red, fontSize: 12, fontFamily: "'Nunito', sans-serif", marginBottom: 10 }}>{error}</p>}
            <Btn label={loading ? "Creating your account..." : "Join Heartstring 🌸"} onClick={finishSignup} disabled={loading} />
            <button onClick={finishSignup} disabled={loading} style={{ display: "block", margin: "10px auto 0", background: "none", border: "none", color: C.muted, fontSize: 12, fontFamily: "'Nunito', sans-serif", cursor: "pointer" }}>
              Skip for now →
            </button>
          </div>
        )}

        {/* ── SCREEN: Forgot Password ── */}
        {screen === "forgot" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <button onClick={() => setScreen("email")} style={{ background: "none", border: "none", color: C.gold, fontSize: 17, cursor: "pointer", padding: 0 }}>←</button>
              <div style={{ color: C.gold, fontSize: 10, letterSpacing: 3, textTransform: "uppercase", fontFamily: "'Nunito', sans-serif" }}>Forgot Password</div>
            </div>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 38, marginBottom: 12 }}>🔑</div>
              <p style={{ color: C.cream, fontFamily: "'Cormorant Garamond', serif", fontSize: 16, lineHeight: 1.75, marginBottom: 6 }}>
                We'll send your password reset to your Gmail inbox.
              </p>
              <p style={{ color: C.muted, fontFamily: "'Nunito', sans-serif", fontSize: 12, lineHeight: 1.6 }}>
                Enter the email you signed up with, then tap the button below to open Gmail with a pre-filled message to our support team.
              </p>
            </div>
            <Inp placeholder="your@gmail.com" value={email} onChange={setEmail} type="email" />
            <button
              onClick={() => {
                const e = email.trim();
                if (!e || !e.includes("@")) { setError("Enter your email first."); return; }
                const subject = encodeURIComponent("Heartstring Password Reset Request");
                const body = encodeURIComponent(`Hi Heartstring Support,\n\nI need to reset my password for the account linked to: ${e}\n\nPlease help me regain access.\n\nThank you.`);
                window.open(`https://mail.google.com/mail/?view=cm&to=support@heartstring.app&su=${subject}&body=${body}`, "_blank");
              }}
              style={{ width: "100%", background: `linear-gradient(135deg, ${C.orange}, ${C.gold})`, border: "none", borderRadius: 12, padding: "13px 0", cursor: "pointer", color: "#08070f", fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <span>✉️</span> Open Gmail & Send Reset Request
            </button>
            {error && <p style={{ color: C.red, fontSize: 12, fontFamily: "'Nunito', sans-serif", textAlign: "center" }}>{error}</p>}
            <p style={{ color: C.muted, fontSize: 11, fontFamily: "'Nunito', sans-serif", textAlign: "center", marginTop: 12, lineHeight: 1.6 }}>
              Tip: Next time, just enter your email — returning users never need a password.
            </p>
          </div>
        )}

      </div>

      {/* Kente bottom bar */}
      <div style={{ width: "100%", maxWidth: 440, height: 3, borderRadius: 2, background: `linear-gradient(90deg, ${C.orange}, ${C.gold}, ${C.green}, ${C.purple}, ${C.red})`, marginTop: 34 }} />
    </div>
  );
}

/* ═══════════════════════════════
   MAIN APP
═══════════════════════════════ */
const TABS = [
  { id: "home", label: "Home", icon: "🏡" },
  { id: "peace", label: "Peace", icon: "🕊️" },
  { id: "advice", label: "Advice", icon: "💬" },
  { id: "groups", label: "Groups", icon: "👥" },
  { id: "guide", label: "Guide", icon: "🗺️" },
];

export default function Heartstring() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [callMode, setCallMode] = useState(null);
  const [callContact, setCallContact] = useState(null);
  const [activeGroup, setActiveGroup] = useState(null);
  const [activePost, setActivePost] = useState(null);
  const [liked, setLiked] = useState({});
  const [helpful, setHelpful] = useState({});
  const [chatInput, setChatInput] = useState("");
  const [groupMsgs, setGroupMsgs] = useState({});
  const [showAnonForm, setShowAnonForm] = useState(false);
  const [anonText, setAnonText] = useState("");
  const [anonTag, setAnonTag] = useState("Silent Treatment");
  const [userPosts, setUserPosts] = useState([]);
  const [anonDone, setAnonDone] = useState(false);
  const chatRef = useRef(null);

  /* ── Check saved session on mount ── */
  useEffect(() => {
    load("current-user").then(saved => {
      if (saved?.id) setUser(saved);
      setAuthChecked(true);
    });
  }, []);

  /* ── Load per-user data when user logs in ── */
  useEffect(() => {
    if (!user) return;
    load(`liked-${user.id}`).then(d => d && setLiked(d));
    load(`helpful-${user.id}`).then(d => d && setHelpful(d));
    load(`user-posts-${user.id}`).then(d => d && setUserPosts(d || []));
    // Load group messages — deduplicate by msg id
    SEED_GROUPS.forEach(g => {
      load(`group-msgs-${g.id}-${user.id}`).then(saved => {
        if (saved?.length) {
          setGroupMsgs(prev => ({ ...prev, [g.id]: saved }));
        }
      });
    });
  }, [user]);

  /* ── Persist liked ── */
  useEffect(() => { if (user) save(`liked-${user.id}`, liked); }, [liked]);
  useEffect(() => { if (user) save(`helpful-${user.id}`, helpful); }, [helpful]);
  useEffect(() => { if (user) save(`user-posts-${user.id}`, userPosts); }, [userPosts]);

  function logout() {
    save("current-user", null);
    setUser(null);
    setLiked({}); setHelpful({}); setUserPosts([]);
    setGroupMsgs({}); setActiveTab("home");
  }

  function goTab(id) { setActiveTab(id); setActiveGroup(null); setActivePost(null); }

  function startCall(mode, name, avatar, color, location) {
    setCallContact({ name, avatar, color, location });
    setCallMode(mode);
  }

  function sendGroupMsg(groupId) {
    if (!chatInput.trim()) return;
    const newMsg = {
      id: uid(),
      sender: user?.name || "You",
      av: user?.initials || "YO",
      color: C.gold,
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      self: true,
    };
    setGroupMsgs(prev => {
      const existing = prev[groupId] || [];
      // Deduplicate: don't add if same text sent within last 3 seconds
      const recent = existing.slice(-5);
      const isDupe = recent.some(m => m.self && m.text === newMsg.text && Date.now() - parseInt(m.id) < 3000);
      if (isDupe) return prev;
      const updated = [...existing, newMsg];
      save(`group-msgs-${groupId}-${user?.id}`, updated);
      return { ...prev, [groupId]: updated };
    });
    setChatInput("");
    setTimeout(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, 80);
  }

  function submitAnonPost() {
    if (!anonText.trim()) return;
    const post = { id: uid(), author: "Anonymous", avatar: "?", color: C.teal, tag: anonTag, tagColor: C.gold, question: anonText.trim(), replies: 0, helpful: 0, time: "Just now", topAnswer: null };
    setUserPosts(prev => {
      const isDupe = prev.some(p => p.question === anonText.trim());
      if (isDupe) return prev;
      return [post, ...prev];
    });
    setAnonText(""); setAnonTag("Silent Treatment");
    setShowAnonForm(false); setAnonDone(true);
  }

  if (!authChecked) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,700&family=Nunito:wght@400;700&display=swap" rel="stylesheet" />
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🌸</div>
        <div style={{ color: C.gold, fontFamily: "'Nunito', sans-serif", fontSize: 13 }}>Loading...</div>
      </div>
    </div>
  );

  if (!user) return <AuthScreen onLogin={u => setUser(u)} />;
  if (callMode) return <CallScreen contact={callContact} mode={callMode} onEnd={() => setCallMode(null)} />;

  return (
    <div style={{ minHeight: "100svh", background: C.bg, color: C.text, fontFamily: "'Nunito', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Nunito:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ position: "fixed", top: 0, left: "25%", width: 500, height: 300, background: `radial-gradient(circle, ${C.gold}06 0%, transparent 70%)`, pointerEvents: "none", zIndex: 0 }} />

      {/* ── HEADER ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "#08070fee", backdropFilter: "blur(16px)", borderBottom: `1px solid ${C.border}`, padding: "0 16px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>🌸</span>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, fontWeight: 700, color: C.cream, lineHeight: 1 }}>Heartstring</div>
              <div style={{ color: C.gold, fontSize: 8, letterSpacing: 3, textTransform: "uppercase" }}>Africa to the World</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
            <button onClick={() => startCall("voice", user.partnerName || "Partner", user.partnerName?.[0] || "P", C.orange, user.partnerCity || "Far away")} style={{ background: C.lime + "22", border: `1px solid ${C.lime}44`, borderRadius: 20, padding: "5px 11px", cursor: "pointer", color: C.lime, fontSize: 12, fontWeight: 700 }}>📞</button>
            <button onClick={() => startCall("video", user.partnerName || "Partner", user.partnerName?.[0] || "P", C.orange, user.partnerCity || "Far away")} style={{ background: C.orange + "22", border: `1px solid ${C.orange}44`, borderRadius: 20, padding: "5px 11px", cursor: "pointer", color: C.orange, fontSize: 12, fontWeight: 700 }}>📹</button>
            {/* Profile + logout */}
            <div style={{ position: "relative" }} className="profile-wrap">
              <button
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                onClick={logout}
                title="Tap to log out"
              >
                <Av initials={user.initials} color={C.gold} size={32} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── TABS ── */}
      <nav style={{ background: "#08070fee", borderBottom: `1px solid ${C.border}`, position: "sticky", top: 56, zIndex: 99 }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", overflowX: "auto", padding: "0 10px" }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => goTab(tab.id)} style={{ background: "none", border: "none", padding: "12px 14px", cursor: "pointer", color: activeTab === tab.id ? (tab.id === "peace" ? C.teal : C.gold) : C.muted, borderBottom: `2px solid ${activeTab === tab.id ? (tab.id === "peace" ? C.teal : C.gold) : "transparent"}`, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 600, transition: "all 0.2s", fontFamily: "'Nunito', sans-serif" }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── CONTENT ── */}
      <main className="hs-main" style={{ maxWidth: "100%", padding: "0", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "16px 14px 100px" }}>

        {/* ════ HOME ════ */}
        {activeTab === "home" && (
          <div>
            <div style={{ height: 3, borderRadius: 2, background: `linear-gradient(90deg, ${C.orange}, ${C.gold}, ${C.green}, ${C.purple})`, marginBottom: 14 }} />
            {/* Welcome */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
              <Av initials={user.initials} color={C.gold} size={44} />
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 17, color: C.cream }}>Welcome back, {user.name.split(" ")[0]} 🌸</div>
                <div style={{ color: C.muted, fontSize: 12 }}>{user.myCity && user.partnerCity ? `${user.myCity} ↔ ${user.partnerCity}` : "Your LDR journey continues"}</div>
              </div>
            </div>
            <Countdown user={user} />
            {/* Peace CTA */}
            <button onClick={() => goTab("peace")} style={{ width: "100%", background: "linear-gradient(135deg, #0d1a20, #0a0d1a)", border: `1px solid ${C.teal}44`, borderRadius: 14, padding: "14px 16px", cursor: "pointer", textAlign: "left", marginBottom: 12, display: "flex", alignItems: "center", gap: 11 }}>
              <span style={{ fontSize: 22 }}>🕊️</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: C.teal, fontFamily: "'Cormorant Garamond', serif", fontSize: 15, fontWeight: 700 }}>Struggling right now?</div>
                <div style={{ color: C.muted, fontSize: 11 }}>Silence, loneliness, arguments — visit the Peace Corner</div>
              </div>
              <span style={{ color: C.teal }}>→</span>
            </button>
            {/* Posts */}
            {[
              { id: "fp1", author: "Zanele", av: "ZA", color: C.red, loc: "Johannesburg ↔ London", time: "2h ago", tag: "🎉 Closing Gap", tagC: C.red, text: "After 22 months apart, I'm at the airport RIGHT NOW. My hands will not stop shaking. To everyone still waiting — YOUR day is coming. Hold on. HOLD ON." },
              { id: "fp2", author: "Fatima", av: "FA", color: C.green, loc: "Nairobi ↔ Paris", time: "5h ago", tag: "💡 Tip", tagC: C.lime, text: "We cook the same recipe on video call every Friday. It started as a joke — now it's the highlight of our week. Distance cannot steal Friday dinner. 🍲" },
              { id: "fp3", author: "Kofi & Yuki", av: "KY", color: C.purple, loc: "Accra ↔ Tokyo", time: "Yesterday", tag: "Milestone", tagC: C.purple, text: "500 days of us. 500 mornings knowing who you'll text first. 500 nights ending with the same voice. Some things distance just cannot reach." },
            ].map(post => (
              <div key={post.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 10, transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderHov; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = ""; }}>
                <div style={{ display: "flex", gap: 9, marginBottom: 10, alignItems: "center" }}>
                  <Av initials={post.av} color={post.color} size={38} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 15, color: C.cream }}>{post.author}</div>
                    <div style={{ color: C.muted, fontSize: 11 }}>{post.loc} · {post.time}</div>
                  </div>
                  <Pill label={post.tag} color={post.tagC} />
                </div>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: "#e8d8c4", lineHeight: 1.75, marginBottom: 10 }}>{post.text}</p>
                <div style={{ display: "flex", gap: 10, borderTop: `1px solid ${C.border}`, paddingTop: 9, flexWrap: "wrap", alignItems: "center" }}>
                  <button onClick={() => setLiked(p => ({ ...p, [post.id]: !p[post.id] }))} style={{ background: "none", border: "none", cursor: "pointer", color: liked[post.id] ? C.red : C.muted, fontSize: 12, fontWeight: 600, padding: 0 }}>{liked[post.id] ? "❤️" : "🤍"} {89 + (liked[post.id] ? 1 : 0)}</button>
                  <span style={{ color: C.muted, fontSize: 12 }}>💬 24</span>
                  <div style={{ marginLeft: "auto" }}><TranslateBtn text={post.text} /></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ════ PEACE ════ */}
        {activeTab === "peace" && (
          <div>
            <div style={{ height: 3, borderRadius: 2, background: `linear-gradient(90deg, ${C.teal}, ${C.blue}, ${C.teal})`, marginBottom: 16 }} />
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: C.cream, marginBottom: 4 }}>The Peace Corner</h2>
            <p style={{ color: C.muted, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14, marginBottom: 18, lineHeight: 1.6 }}>For the silences. For the fights. For "I don't know how to start talking again."</p>
            <AmaraAdvisor user={user} />
            <BreakSilence />
            <div style={{ color: C.gold, letterSpacing: 3, fontSize: 10, textTransform: "uppercase", fontFamily: "'Nunito', sans-serif", marginBottom: 10 }}>When Things Go Quiet 🌙</div>
            {SILENCE_TIPS.map((tip, i) => (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px", marginBottom: 8, display: "flex", gap: 12, transition: "border-color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = tip.color + "55"}
                onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{tip.icon}</span>
                <div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 14, color: C.cream, marginBottom: 3 }}>{tip.title}</div>
                  <p style={{ color: C.muted, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 13, lineHeight: 1.65, margin: 0 }}>{tip.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ════ ADVICE ════ */}
        {activeTab === "advice" && !activePost && (
          <div>
            <div style={{ height: 3, borderRadius: 2, background: `linear-gradient(90deg, ${C.purple}, ${C.orange}, ${C.gold})`, marginBottom: 16 }} />
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: C.cream, marginBottom: 4 }}>The Advice Wall</h2>
            <p style={{ color: C.muted, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14, marginBottom: 16 }}>Real questions. Real answers from people who've been there.</p>

            {/* Anonymous post form */}
            {!showAnonForm && !anonDone && (
              <button onClick={() => setShowAnonForm(true)} style={{ width: "100%", background: "none", border: `2px dashed ${C.gold}44`, borderRadius: 13, padding: "13px 16px", cursor: "pointer", color: C.gold, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14, marginBottom: 16, transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = C.gold + "08"; e.currentTarget.style.borderColor = C.gold + "88"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.borderColor = C.gold + "44"; }}>
                + Ask the community anonymously
              </button>
            )}

            {anonDone && (
              <div style={{ background: C.lime + "11", border: `1px solid ${C.lime}44`, borderRadius: 13, padding: "14px 16px", marginBottom: 16, display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 18 }}>✅</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: C.lime, fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 14 }}>Posted anonymously</div>
                  <div style={{ color: C.muted, fontSize: 11 }}>Visible to the community · Saved to your account</div>
                </div>
                <button onClick={() => { setAnonDone(false); setShowAnonForm(true); }} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 20, padding: "4px 10px", cursor: "pointer", color: C.muted, fontSize: 11 }}>+ Ask another</button>
              </div>
            )}

            {showAnonForm && (
              <div style={{ background: C.card, border: `1px solid ${C.gold}44`, borderRadius: 14, padding: 18, marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.muted + "33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>👤</div>
                    <div>
                      <div style={{ color: C.cream, fontFamily: "'Nunito', sans-serif", fontSize: 13, fontWeight: 700 }}>Anonymous</div>
                      <div style={{ color: C.muted, fontSize: 10 }}>Your identity is hidden</div>
                    </div>
                  </div>
                  <button onClick={() => setShowAnonForm(false)} style={{ background: "none", border: "none", color: C.muted, fontSize: 16, cursor: "pointer" }}>✕</button>
                </div>
                <div style={{ marginBottom: 11 }}>
                  <div style={{ color: C.muted, fontSize: 10, letterSpacing: 1, textTransform: "uppercase", fontFamily: "'Nunito', sans-serif", marginBottom: 7 }}>Topic</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {["Silent Treatment", "Drifting Apart", "Jealousy", "Loneliness", "Trust", "Arguments", "Closing Gap", "Other"].map(tag => (
                      <button key={tag} onClick={() => setAnonTag(tag)} style={{ background: anonTag === tag ? C.gold + "22" : "none", border: `1px solid ${anonTag === tag ? C.gold : C.border}`, borderRadius: 20, padding: "4px 10px", cursor: "pointer", color: anonTag === tag ? C.gold : C.muted, fontSize: 11, fontFamily: "'Nunito', sans-serif", fontWeight: anonTag === tag ? 700 : 400, transition: "all 0.15s" }}>{tag}</button>
                    ))}
                  </div>
                </div>
                <textarea value={anonText} onChange={e => setAnonText(e.target.value)} placeholder="What are you going through? This is a safe space." rows={4}
                  style={{ width: "100%", background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 10, padding: "11px 13px", color: C.cream, fontFamily: "'Cormorant Garamond', serif", fontSize: 14, lineHeight: 1.7, outline: "none", resize: "none", marginBottom: 12, boxSizing: "border-box" }} />
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button onClick={() => setShowAnonForm(false)} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 20, padding: "8px 16px", cursor: "pointer", color: C.muted, fontSize: 12, fontFamily: "'Nunito', sans-serif" }}>Cancel</button>
                  <button onClick={submitAnonPost} disabled={!anonText.trim()} style={{ background: anonText.trim() ? C.gold : C.muted, color: "#08070f", border: "none", borderRadius: 20, padding: "8px 20px", cursor: anonText.trim() ? "pointer" : "not-allowed", fontSize: 13, fontFamily: "'Nunito', sans-serif", fontWeight: 700, transition: "background 0.2s" }}>Post Anonymously 👤</button>
                </div>
              </div>
            )}

            {/* User's own posts first */}
            {userPosts.map(post => (
              <div key={post.id} style={{ background: C.card, border: `1px solid ${C.gold}33`, borderRadius: 14, padding: 18, marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 9, marginBottom: 10, alignItems: "center" }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: C.muted + "33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>👤</div>
                  <div style={{ flex: 1 }}><div style={{ color: C.cream, fontSize: 13, fontWeight: 700 }}>Anonymous · You</div><div style={{ color: C.muted, fontSize: 11 }}>Just now</div></div>
                  <Pill label={post.tag} color={C.gold} />
                </div>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: C.cream, lineHeight: 1.75, marginBottom: 10 }}>{post.question}</p>
                <div style={{ background: C.teal + "11", border: `1px solid ${C.teal}33`, borderRadius: 9, padding: "9px 12px", marginBottom: 10 }}>
                  <p style={{ color: C.teal, fontSize: 12, fontFamily: "'Nunito', sans-serif", margin: 0 }}>🕊️ Your question is live — the community will respond soon.</p>
                </div>
                <div style={{ display: "flex", gap: 10, borderTop: `1px solid ${C.border}`, paddingTop: 9, alignItems: "center" }}>
                  <span style={{ color: C.muted, fontSize: 12 }}>👍 0</span>
                  <span style={{ color: C.muted, fontSize: 12 }}>💬 0 replies</span>
                  <div style={{ marginLeft: "auto" }}><TranslateBtn text={post.question} /></div>
                </div>
              </div>
            ))}

            {/* Seed posts */}
            {SEED_ADVICE.map(post => (
              <div key={post.id} onClick={() => setActivePost(post)} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18, marginBottom: 10, cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = post.tagColor + "55"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = ""; }}>
                <div style={{ display: "flex", gap: 9, marginBottom: 10, alignItems: "center" }}>
                  <Av initials={post.avatar} color={post.color} size={38} />
                  <div style={{ flex: 1 }}><div style={{ color: C.muted, fontSize: 11 }}>{post.author} · {post.time}</div></div>
                  <Pill label={post.tag} color={post.tagColor} />
                </div>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: C.cream, lineHeight: 1.75, marginBottom: 10 }}>{post.question}</p>
                <div style={{ background: post.tagColor + "0d", border: `1px solid ${post.tagColor}22`, borderRadius: 9, padding: "9px 11px", marginBottom: 10 }}>
                  <div style={{ color: post.tagColor, fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 3 }}>Top Answer · {post.topAnswer.by}</div>
                  <p style={{ color: C.muted, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 12, lineHeight: 1.6, margin: 0 }}>"{post.topAnswer.text.substring(0, 100)}..."</p>
                </div>
                <div style={{ display: "flex", gap: 10, borderTop: `1px solid ${C.border}`, paddingTop: 9, flexWrap: "wrap", alignItems: "center" }}>
                  <button onClick={e => { e.stopPropagation(); setHelpful(p => ({ ...p, [post.id]: !p[post.id] })); }} style={{ background: "none", border: "none", cursor: "pointer", color: helpful[post.id] ? C.lime : C.muted, fontSize: 12, fontWeight: 600, padding: 0 }}>
                    {helpful[post.id] ? "✅" : "👍"} {post.helpful + (helpful[post.id] ? 1 : 0)}
                  </button>
                  <span style={{ color: C.muted, fontSize: 12 }}>💬 {post.replies}</span>
                  <div style={{ marginLeft: "auto" }}><TranslateBtn text={post.question} /></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "advice" && activePost && (
          <div>
            <button onClick={() => setActivePost(null)} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 20, padding: "6px 13px", cursor: "pointer", color: C.gold, fontSize: 13, fontWeight: 600, marginBottom: 12 }}>← Back</button>
            <div style={{ background: C.card, border: `1px solid ${activePost.tagColor}44`, borderRadius: 14, padding: 18, marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 9, marginBottom: 10 }}><Av initials={activePost.avatar} color={activePost.color} size={38} /><div style={{ color: C.muted, fontSize: 11 }}>{activePost.author} · {activePost.time}</div><div style={{ marginLeft: "auto" }}><Pill label={activePost.tag} color={activePost.tagColor} /></div></div>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: C.cream, lineHeight: 1.8, marginBottom: 12 }}>{activePost.question}</p>
              <TranslateBtn text={activePost.question} />
            </div>
            <div style={{ background: activePost.tagColor + "11", border: `1px solid ${activePost.tagColor}44`, borderRadius: 14, padding: 18, marginBottom: 12 }}>
              <div style={{ color: activePost.tagColor, fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 7, fontFamily: "'Nunito', sans-serif" }}>⭐ Best Answer · {activePost.topAnswer.by}</div>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: C.cream, lineHeight: 1.8, marginBottom: 10 }}>"{activePost.topAnswer.text}"</p>
              <TranslateBtn text={activePost.topAnswer.text} />
            </div>
            <div style={{ color: C.gold, letterSpacing: 3, fontSize: 9, textTransform: "uppercase", fontFamily: "'Nunito', sans-serif", marginBottom: 9 }}>Get personalised advice from Amara</div>
            <AmaraAdvisor user={user} />
          </div>
        )}

        {/* ════ GROUPS ════ */}
        {activeTab === "groups" && !activeGroup && (
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: C.cream, marginBottom: 4 }}>Community Groups</h2>
            <p style={{ color: C.muted, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14, marginBottom: 16 }}>Find the people who understand your exact situation.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 11 }}>
              {SEED_GROUPS.map(g => (
                <div key={g.id} onClick={() => setActiveGroup(g)} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18, cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = g.color + "66"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = ""; }}>
                  <div style={{ fontSize: 26, marginBottom: 8 }}>{g.emoji}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 16, color: C.cream, marginBottom: 4 }}>{g.name}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                    <span style={{ color: g.color, fontSize: 11, fontWeight: 600 }}>🟢 {g.members}</span>
                    <span style={{ color: g.color, fontSize: 11, fontWeight: 700 }}>Enter →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "groups" && activeGroup && (() => {
          const allMsgs = [...activeGroup.msgs, ...(groupMsgs[activeGroup.id] || [])];
          return (
            <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 170px)" }}>
              <div style={{ display: "flex", gap: 9, alignItems: "center", padding: "11px 13px", background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 10 }}>
                <button onClick={() => setActiveGroup(null)} style={{ background: "none", border: "none", cursor: "pointer", color: C.gold, fontSize: 16 }}>←</button>
                <span style={{ fontSize: 18 }}>{activeGroup.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 14, color: C.cream }}>{activeGroup.name}</div>
                  <div style={{ color: C.muted, fontSize: 10 }}>🟢 {activeGroup.members} · Active</div>
                </div>
                <button onClick={() => startCall("voice", activeGroup.name, activeGroup.emoji, activeGroup.color, "Group")} style={{ background: C.lime + "22", border: `1px solid ${C.lime}44`, borderRadius: 20, padding: "4px 10px", cursor: "pointer", color: C.lime, fontSize: 11, fontWeight: 700 }}>📞</button>
                <button onClick={() => startCall("video", activeGroup.name, activeGroup.emoji, activeGroup.color, "Group")} style={{ background: C.orange + "22", border: `1px solid ${C.orange}44`, borderRadius: 20, padding: "4px 10px", cursor: "pointer", color: C.orange, fontSize: 11, fontWeight: 700 }}>📹</button>
              </div>
              <div ref={chatRef} style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 9, paddingBottom: 6 }}>
                {allMsgs.map(m => (
                  <div key={m.id} style={{ display: "flex", gap: 7, flexDirection: m.self ? "row-reverse" : "row", alignItems: "flex-start" }}>
                    {!m.self && <Av initials={m.av} color={m.color} size={28} />}
                    <div style={{ maxWidth: "73%" }}>
                      {!m.self && <div style={{ color: m.color, fontSize: 10, fontWeight: 700, marginBottom: 2 }}>{m.sender}</div>}
                      <div style={{ background: m.self ? C.gold + "1a" : C.card, border: `1px solid ${m.self ? C.gold + "44" : C.border}`, borderRadius: m.self ? "13px 3px 13px 13px" : "3px 13px 13px 13px", padding: "8px 11px" }}>
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: C.cream, lineHeight: 1.6, margin: 0 }}>{m.text}</p>
                        <div style={{ marginTop: 5 }}><TranslateBtn text={m.text} /></div>
                      </div>
                      <div style={{ color: C.muted, fontSize: 9, marginTop: 2, textAlign: m.self ? "right" : "left" }}>{m.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 7, padding: "9px 11px", background: C.card, borderRadius: 11, border: `1px solid ${C.border}` }}>
                <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendGroupMsg(activeGroup.id)} placeholder="Say something..." style={{ flex: 1, background: "none", border: "none", outline: "none", color: C.text, fontFamily: "'Nunito', sans-serif", fontSize: 13 }} />
                <button onClick={() => sendGroupMsg(activeGroup.id)} style={{ width: 34, height: 34, borderRadius: 8, background: C.gold, border: "none", cursor: "pointer", fontSize: 14, color: "#08070f", fontWeight: 700 }}>↑</button>
              </div>
            </div>
          );
        })()}

        {/* ════ GUIDE ════ */}
        {activeTab === "guide" && (
          <div>
            <div style={{ height: 3, borderRadius: 2, background: `linear-gradient(90deg, ${C.green}, ${C.gold}, ${C.red})`, marginBottom: 16 }} />
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: C.cream, marginBottom: 4 }}>The LDR Survival Guide</h2>
            <p style={{ color: C.muted, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14, marginBottom: 18 }}>Everything nobody told you — from the honeymoon to the hard season.</p>
            <StageGuide />
            {/* Sign out */}
            <div style={{ marginTop: 28, padding: "16px 18px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ color: C.cream, fontFamily: "'Cormorant Garamond', serif", fontSize: 15, fontWeight: 700 }}>{user.name}</div>
                <div style={{ color: C.muted, fontSize: 11 }}>{user.email}</div>
              </div>
              <button onClick={logout} style={{ background: C.red + "22", border: `1px solid ${C.red}44`, borderRadius: 20, padding: "8px 16px", cursor: "pointer", color: C.red, fontSize: 12, fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>Sign Out</button>
            </div>
          </div>
        )}

      </div>
      </main>

      {/* ── BOTTOM NAV — hidden when keyboard is open ── */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#08070fee", backdropFilter: "blur(16px)", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-around", padding: "7px 0 calc(12px + env(safe-area-inset-bottom))", zIndex: 200 }} className="bottom-nav">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => goTab(tab.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: activeTab === tab.id ? (tab.id === "peace" ? C.teal : C.gold) : C.muted, fontFamily: "'Nunito', sans-serif", fontSize: 10, fontWeight: 600, padding: "0 8px", transition: "color 0.2s", minWidth: 48 }}>
            <span style={{ fontSize: 18 }}>{tab.icon}</span>{tab.label}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes dot { 0%,80%,100%{transform:scale(0);opacity:0} 40%{transform:scale(1);opacity:1} }
        * { box-sizing: border-box; scrollbar-width: thin; scrollbar-color: rgba(240,165,0,0.15) transparent; }
        *::-webkit-scrollbar { width: 3px; } *::-webkit-scrollbar-thumb { background: rgba(240,165,0,0.15); border-radius: 3px; }
        textarea, input { color-scheme: dark; } button:focus { outline: none; }

        /* ── Stop keyboard from jumping the layout ── */
        html, body { height: 100%; overflow: hidden; }
        html { scroll-behavior: smooth; }

        /* Hide bottom nav when virtual keyboard pushes viewport (mobile) */
        @media (max-height: 500px) {
          .bottom-nav { display: none !important; }
        }

        /* Prevent scroll-jump when input is focused on iOS/Android */
        input, textarea {
          font-size: 16px !important;
          -webkit-appearance: none;
          border-radius: 12px;
          transform: translateZ(0);
        }

        /* Stable viewport — don't resize when keyboard opens */
        .hs-main {
          height: 100svh;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }
      `}</style>
    </div>
  );
}
