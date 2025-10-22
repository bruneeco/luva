import React, { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { useGlove } from "../context/GloveContext";
import "./Jogos.css";
import "./Piano.css";

const allNotes = [
  "C5","C#5","D5","D#5","E5","F5","F#5","G5","G#5","A5","A#5","B5",
  "C6","C#6","D6","D#6","E6","F6","F#6","G6","G#6","A6","A#6","B6"
];

const keyboardKeys = [
  "A","W","S","E","D","F","T","G","Y","H","U","J",
  "K","O","L","P",";","Z","X","C","V","B","N","M"
];

const noteToKey = {};
allNotes.forEach((note,i) => noteToKey[note] = keyboardKeys[i] || "");

const keyToNote = {};
Object.entries(noteToKey).forEach(([note,key]) => { if (key) keyToNote[key] = note; });

const SONGS = [
  {
    id: "cai",
    name: "Cai Cai Balão (trecho)",
    seq: [
      { note: "G5", dur: "8n" }, { note: "G5", dur: "8n" }, { note: "F5", dur: "8n" }, { note: "E5", dur: "4n" },
      { note: "G5", dur: "8n" }, { note: "G5", dur: "8n" }, { note: "F5", dur: "8n" }, { note: "E5", dur: "4n" },
      { note: "G5", dur: "8n" }, { note: "A5", dur: "8n" }, { note: "G5", dur: "8n" },
      { note: "F5", dur: "8n" }, { note: "E5", dur: "8n" }, { note: "D5", dur: "4n" },
      { note: "D5", dur: "8n" }, { note: "E5", dur: "8n" }, { note: "F5", dur: "8n" },
      { note: "D5", dur: "8n" }, { note: "E5", dur: "8n" }, { note: "F5", dur: "8n" },
      { note: "D5", dur: "8n" }, { note: "E5", dur: "8n" }, { note: "F5", dur: "4n" },
      { note: "G5", dur: "8n" }, { note: "A5", dur: "8n" }, { note: "G5", dur: "8n" },
      { note: "F5", dur: "8n" }, { note: "E5", dur: "8n" }, { note: "D5", dur: "8n" }, { note: "C5", dur: "4n" }
    ]
  }
];

export default function Jogos(){
  const { getKeyToNoteMapping } = useGlove();

  const [sampler, setSampler] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [volume, setVolume] = useState(-12);
  const volumeNode = useRef(null);

  const [activeNotes, setActiveNotes] = useState([]);
  const pressedMouseNotes = useRef(new Set());
  const pressedKeys = useRef(new Set());

  const [selectedSong, setSelectedSong] = useState(SONGS[0].id);
  const [mode, setMode] = useState("idle");
  const [status, setStatus] = useState("Pronto");
  const [playerIndex, setPlayerIndex] = useState(0);
  const [expectedIndex, setExpectedIndex] = useState(null);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(420);
  const playerTimeout = useRef(null);

  // 🚀 Inicializa sampler
  useEffect(() => {
    volumeNode.current = new Tone.Volume(volume).toDestination();

    const s = new Tone.Sampler({
      urls: {
        A0: "A0.mp3", C1: "C1.mp3", "D#1": "Ds1.mp3", "F#1": "Fs1.mp3",
        A1: "A1.mp3", C2: "C2.mp3", "D#2": "Ds2.mp3", "F#2": "Fs2.mp3",
        A2: "A2.mp3", C3: "C3.mp3", "D#3": "Ds3.mp3", "F#3": "Fs3.mp3",
        A3: "A3.mp3", C4: "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3",
        A4: "A4.mp3", C5: "C5.mp3", "D#5": "Ds5.mp3", "F#5": "Fs5.mp3",
        A5: "A5.mp3", C6: "C6.mp3", "D#6": "Ds6.mp3", "F#6": "Fs6.mp3",
        A6: "A6.mp3", C7: "C7.mp3", "D#7": "Ds7.mp3", "F#7": "Fs7.mp3",
        A7: "A7.mp3", C8: "C8.mp3"
      },
      baseUrl: "https://tonejs.github.io/audio/salamander/"
    }).connect(volumeNode.current);

    setSampler(s);
    if (s.loaded) setLoaded(true);
    Tone.loaded().then(() => setLoaded(true));

    return () => {
      try { s.dispose(); volumeNode.current.dispose(); } catch {}
    };
  }, []);

  useEffect(() => {
    if (volumeNode.current) volumeNode.current.volume.value = volume;
  }, [volume]);

  // 🔹 Função que "pinta" a nota
  const flashNote = (note, ms = 220) => {
    setActiveNotes(prev => prev.includes(note) ? prev : [...prev, note]);
    setTimeout(() => setActiveNotes(prev => prev.filter(n => n !== note)), ms);
  };

  // 🔹 Toca nota longa
  const triggerAttackRelease = async (note, dur = "8n") => {
    try { await Tone.start(); } catch {}
    if (sampler && loaded) {
      const duration = Tone.Time(dur).toSeconds() * 1.8;
      sampler.triggerAttack(note);
      setActiveNotes(prev => [...new Set([...prev, note])]);

      setTimeout(() => {
        sampler.triggerRelease(note);
        setActiveNotes(prev => prev.filter(n => n !== note));
      }, duration * 1000);
    } else {
      const synth = new Tone.Synth({
        envelope: { attack: 0.02, decay: 0.1, sustain: 0.6, release: 0.8 }
      }).toDestination();
      synth.triggerAttackRelease(note, dur);
      flashNote(note, 400);
    }
  };

  const durToMs = (dur) => {
    switch (dur) {
      case "4n": return speed * 2.0;
      case "8n": return speed * 1.3;
      case "16n": return speed * 0.8;
      default: return speed * 1.2;
    }
  };

  const noteAt = (song, idx) => {
    if (!song || !song.seq || idx == null) return null;
    const step = song.seq[idx];
    return typeof step === "string" ? step : (step && step.note);
  };

  // 🔹 Mostra música (sequência)
  const showSong = async (songSeq) => {
    setMode("showing");
    setStatus("Mostrando sequência");
    setPlayerIndex(0);
    setExpectedIndex(null);
    await new Promise(res => setTimeout(res, 180));
    const song = SONGS.find(s => s.id === selectedSong);
    for (let i = 0; i < songSeq.length; i++){
      const step = songSeq[i];
      const note = typeof step === "string" ? step : step.note;
      const dur = typeof step === "string" ? "8n" : (step.dur || "8n");
      setExpectedIndex(i);
      await triggerAttackRelease(note, dur);
      await new Promise(res => setTimeout(res, durToMs(dur)));
    }
    setMode("playing");
    setStatus("Sua vez — toque as notas na ordem!");
    setPlayerIndex(0);
    setExpectedIndex(0);
  };

  // 🔹 Jogador toca nota
  const handlePlayerInput = async (note) => {
    if (mode !== "playing") return;
    const song = SONGS.find(s => s.id === selectedSong);
    if (!song) return;

    const expectedObj = song.seq[playerIndex];
    const expected = typeof expectedObj === "string" ? expectedObj : expectedObj.note;

    await triggerAttackRelease(note, "8n");

    if (note === expected) {
      const next = playerIndex + 1;
      setScore(prev => prev + 1);
      setStatus("Correto!");
      if (next < song.seq.length) {
        setPlayerIndex(next);
        setExpectedIndex(next);
      } else {
        setMode("success");
        setStatus("🎵 Música completa!");
        setExpectedIndex(null);
        setPlayerIndex(0);
        clearTimeout(playerTimeout.current);
        playerTimeout.current = setTimeout(() => {
          setMode("idle");
          setStatus("Pronto");
        }, 1500);
      }
    } else {
      setMode("fail");
      setStatus(`Erro! A nota certa era ${expected}`);
      setExpectedIndex(playerIndex);
      clearTimeout(playerTimeout.current);
      playerTimeout.current = setTimeout(() => {
        setMode("idle");
        setStatus("Pronto");
        setExpectedIndex(null);
        setPlayerIndex(0);
      }, 1500);
    }
  };

  // 🔹 Eventos teclado (com sustain)
  useEffect(() => {
    const onKeyDown = (e) => {
      const key = String(e.key).toUpperCase();
      if (!key || pressedKeys.current.has(key)) return;
      pressedKeys.current.add(key);

      const gloveMapping = getKeyToNoteMapping && getKeyToNoteMapping();
      let note = gloveMapping?.[key] || keyToNote[key];

      if (note) {
        e.preventDefault();
        setActiveNotes(prev => [...new Set([...prev, note])]); // mantém nota ativa
        if (mode === "playing") handlePlayerInput(note);
        else sampler?.triggerAttack?.(note);
      }
    };
    const onKeyUp = (e) => {
      const key = String(e.key).toUpperCase();
      pressedKeys.current.delete(key);
      const gloveMapping = getKeyToNoteMapping && getKeyToNoteMapping();
      let note = gloveMapping?.[key] || keyToNote[key];
      if (note) {
        sampler?.triggerRelease?.(note);
        setActiveNotes(prev => prev.filter(n => n !== note));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [mode, playerIndex, selectedSong, sampler, loaded, getKeyToNoteMapping]);

  const startSelected = async () => {
    try { await Tone.start(); } catch {}
    const song = SONGS.find(s=>s.id===selectedSong);
    if (!song) return;
    setMode("idle");
    setStatus("Pronto");
    setPlayerIndex(0);
    setExpectedIndex(null);
    setTimeout(() => showSong(song.seq), 200);
  };

  const whiteNotes = allNotes.filter(n => !n.includes("#"));
  const blackNotes = allNotes.filter(n => n.includes("#"));
  const blackKeyOffsets = {
    "C#5": 0, "D#5": 1, "F#5": 3, "G#5": 4, "A#5": 5,
    "C#6": 7, "D#6": 8, "F#6": 10, "G#6": 11, "A#6": 12,
  };

  function notaLabel(note){ return note.replace(/\d/,''); }
  const gloveMapping = (getKeyToNoteMapping && getKeyToNoteMapping()) || {};
  const expectedStyleFor = (isBlack) => ({
    background: isBlack
      ? "linear-gradient(180deg,#1e40af,#3b82f6)"
      : "linear-gradient(180deg,#1e3a8a,#2563eb)",
    color: "#fff",
    borderColor: "rgba(37,99,235,0.6)",
    boxShadow: "0 0 20px rgba(37,99,235,0.4)"
  });
  const currentExpectedNote = (() => {
    const song = SONGS.find(s => s.id === selectedSong);
    if (!song || expectedIndex == null) return null;
    return noteAt(song, expectedIndex);
  })();

  return (
    <div className="jogo-root">
      <div className="jogo-panel">
        <h2>Jogos Musicais — Acompanhe a canção</h2>

        <div className="jogo-controls">
          <label>
            Música
            <select value={selectedSong} onChange={e=>setSelectedSong(e.target.value)} style={{marginLeft:8}}>
              {SONGS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>

          <button className="btn primary" onClick={startSelected} disabled={!loaded}>
            {loaded ? "Tocar / Jogar" : "Carregando amostras..."}
          </button>

          <button className="btn" onClick={() => { setMode("idle"); setPlayerIndex(0); setStatus("Pronto"); setExpectedIndex(null); }}>
            Parar
          </button>

          <label>
            Velocidade
            <input type="range" min="260" max="900" step="20" value={speed}
              onChange={e=>setSpeed(Number(e.target.value))} />
          </label>

          <label>
            Volume
            <input type="range" min={-48} max={0} step={1} value={volume}
              onChange={e=>setVolume(Number(e.target.value))} />
          </label>

          <div style={{marginLeft: "auto", color:"#334155", fontWeight:600}}>
            Score: <strong style={{color:"var(--primary)"}}>{score}</strong>
            &nbsp;&nbsp;Status: <em style={{color:"#556"}}>{status}</em>
          </div>
        </div>

        <div className="piano-container" style={{marginTop:12}}>
          <div className="piano" style={{position:"relative"}}>
            {whiteNotes.map((note)=> {
              const isActive = activeNotes.includes(note);
              const isGloveKey = Object.values(gloveMapping).includes(note);
              const mappedKey = noteToKey[note];
              const isExpected = currentExpectedNote === note;
              return (
                <div key={note}
                  className={`white-key ${isActive ? "active": ""} ${isGloveKey ? "glove-key": ""}`}
                  style={isExpected ? expectedStyleFor(false) : undefined}
                  onMouseDown={() => {
                    if (!pressedMouseNotes.current.has(note)) {
                      pressedMouseNotes.current.add(note);
                      sampler?.triggerAttack?.(note);
                      setActiveNotes(prev => [...new Set([...prev, note])]);
                      if (mode === "playing") handlePlayerInput(note);
                    }
                  }}
                  onMouseUp={() => {
                    pressedMouseNotes.current.delete(note);
                    sampler?.triggerRelease?.(note);
                    setActiveNotes(prev => prev.filter(n => n !== note));
                  }}
                  onMouseLeave={() => {
                    pressedMouseNotes.current.delete(note);
                    sampler?.triggerRelease?.(note);
                    setActiveNotes(prev => prev.filter(n => n !== note));
                  }}
                >
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                    <div className="note-name">{notaLabel(note)}</div>
                    <div style={{fontSize:12, color:isExpected ? "#e6f0ff" : "#8b97a6", marginTop:6}}>{mappedKey}</div>
                  </div>
                </div>
              );
            })}

            {blackNotes.map((note,i)=> {
              const isActive = activeNotes.includes(note);
              const isGloveKey = Object.values(gloveMapping).includes(note);
              const left = (blackKeyOffsets[note] || 0) * 63 + 44 + (i*6);
              const mappedKey = noteToKey[note];
              const isExpected = currentExpectedNote === note;
              return (
                <div key={note}
                  className={`black-key ${isActive ? "active": ""} ${isGloveKey ? "glove-key": ""}`}
                  style={{left:`${left}px`, width:34, ...(isExpected ? expectedStyleFor(true) : {})}}
                  onMouseDown={(e)=>{ e.stopPropagation(); if (!pressedMouseNotes.current.has(note)) {
                    pressedMouseNotes.current.add(note);
                    sampler?.triggerAttack?.(note);
                    setActiveNotes(prev => [...new Set([...prev, note])]);
                    if (mode === "playing") handlePlayerInput(note);
                  }}}
                  onMouseUp={() => {
                    pressedMouseNotes.current.delete(note);
                    sampler?.triggerRelease?.(note);
                    setActiveNotes(prev => prev.filter(n => n !== note));
                  }}
                  onMouseLeave={() => {
                    pressedMouseNotes.current.delete(note);
                    sampler?.triggerRelease?.(note);
                    setActiveNotes(prev => prev.filter(n => n !== note));
                  }}
                >
                  <div className="note-name">{notaLabel(note)}</div>
                  <div style={{ fontSize: 10, color: isExpected ? "#e0f2fe" : "#cbd5e1", marginTop: 4 }}>
                    {mappedKey}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <p style={{ color: "#334155", fontWeight: 500 }}>
            Toque a nota azul para continuar a sequência 🎵
          </p>
        </div>
      </div>
    </div>
  );
}
