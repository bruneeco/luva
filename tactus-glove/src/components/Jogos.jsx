import React, { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { useGlove } from "../context/GloveContext";
import "./Jogos.css";
import "./Piano.css";

// todas as notas disponíveis (ordem cromática)
const allNotes = [
  "C5","C#5","D5","D#5","E5","F5","F#5","G5","G#5","A5","A#5","B5",
  "C6","C#6","D6","D#6","E6","F6","F#6","G6","G#6","A6","A#6","B6"
];

// teclas do teclado físico que mapeiam as notas (mesma ordem)
const keyboardKeys = [
  "A","W","S","E","D","F","T","G","Y","H","U","J",
  "K","O","L","P",";","Z","X","C","V","B","N","M"
];

// mapa nota -> tecla (para mostrar dica na UI)
const noteToKey = {};
allNotes.forEach((note,i) => noteToKey[note] = keyboardKeys[i] || "");

// mapa tecla -> nota (usado para input via teclado)
const keyToNote = {};
Object.entries(noteToKey).forEach(([note,key]) => { if (key) keyToNote[key] = note; });

// músicas / sequências do jogo
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
  // pegar mapeamento da luva (se existir)
  const { getKeyToNoteMapping } = useGlove();

  // --- estados e refs principais ---
  const [sampler, setSampler] = useState(null); // sampler de áudio
  const [loaded, setLoaded] = useState(false); // se amostras carregadas
  const [volume, setVolume] = useState(-12); // volume em dB
  const volumeNode = useRef(null); // node do Tone.js para controlar volume

  const [activeNotes, setActiveNotes] = useState([]); // notas atualmente "acendidas"
  const pressedMouseNotes = useRef(new Set()); // controle de clique do mouse
  const pressedKeys = useRef(new Set()); // controle de teclas pressionadas

  // sustain / timers
  const sustainMs = useRef(1200); // quanto tempo manter nota após soltar (ms)
  const releaseTimers = useRef(new Map()); // map note => timeout id

  // estado do jogo
  const [selectedSong, setSelectedSong] = useState(SONGS[0].id);
  const [mode, setMode] = useState("idle"); // idle | showing | playing | success
  const [status, setStatus] = useState("Pronto");
  const [playerIndex, setPlayerIndex] = useState(0);

  // índice da nota esperada (indicador azul)
  const [expectedIndex, setExpectedIndex] = useState(null);
  const expectedIndexRef = useRef(expectedIndex); // ref sincronizada para listeners

  // mantém ref atualizada para evitar stale closures
  useEffect(() => {
    expectedIndexRef.current = expectedIndex;
  }, [expectedIndex]);

  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(420); // ainda usado para durToMs
  const playerTimeout = useRef(null);

  // indicador / auto-advance
  const indicatorTimer = useRef(null);
  const currentSongRef = useRef(null);
  const completedIndices = useRef(new Set()); // passos já pontuados

  // --- helpers de timers / release ---
  const clearReleaseTimer = (note) => {
    const t = releaseTimers.current.get(note);
    if (t) {
      clearTimeout(t);
      releaseTimers.current.delete(note);
    }
  };
  // agenda liberação da nota depois de ms
  const scheduleRelease = (note, ms) => {
    clearReleaseTimer(note);
    const id = setTimeout(() => {
      try { sampler?.triggerRelease?.(note); } catch {}
      setActiveNotes(prev => prev.filter(n => n !== note));
      releaseTimers.current.delete(note);
    }, ms);
    releaseTimers.current.set(note, id);
  };
  const immediateRelease = (note) => {
    clearReleaseTimer(note);
    try { sampler?.triggerRelease?.(note); } catch {}
    setActiveNotes(prev => prev.filter(n => n !== note));
  };
  const stopAllNotes = () => {
    // limpa todos os timers e libera qualquer nota ativa
    for (const [note, t] of releaseTimers.current) {
      clearTimeout(t);
    }
    releaseTimers.current.clear();
    [...new Set(activeNotes)].forEach(n => {
      try { sampler?.triggerRelease?.(n); } catch {}
    });
    setActiveNotes([]);
  };

  // limpa indicador automático
  const clearIndicator = () => {
    if (indicatorTimer.current) {
      clearTimeout(indicatorTimer.current);
      indicatorTimer.current = null;
    }
    currentSongRef.current = null;
  };

  // agenda passo do indicador (não usado no modo "apertar para avançar")
  const scheduleIndicatorStep = (song, idx) => {
    clearIndicator();
    if (!song || idx == null || idx >= song.seq.length) {
      setExpectedIndex(null);
      return;
    }
    currentSongRef.current = song;
    setExpectedIndex(idx);
    const step = song.seq[idx];
    const dur = (typeof step === "string") ? "8n" : (step.dur || "8n");
    const ms = durToMs(dur);
    indicatorTimer.current = setTimeout(() => {
      if (currentSongRef.current?.id !== song.id) return;
      const next = idx + 1;
      if (next < song.seq.length) {
        scheduleIndicatorStep(song, next);
      } else {
        setExpectedIndex(song.seq.length - 1);
        clearIndicator();
      }
    }, ms);
  };

  // --- inicializa sampler (Tone.Sampler) ---
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
      try {
        for (const [, t] of releaseTimers.current) clearTimeout(t);
        releaseTimers.current.clear();
        clearIndicator();
        s.dispose();
        volumeNode.current.dispose();
      } catch {}
    };
  }, []);

  // atualiza volume quando o estado muda
  useEffect(() => {
    if (volumeNode.current) volumeNode.current.volume.value = volume;
  }, [volume]);

  // pinta uma nota por curto tempo (efeito visual)
  const flashNote = (note, ms = 220) => {
    setActiveNotes(prev => prev.includes(note) ? prev : [...prev, note]);
    setTimeout(() => setActiveNotes(prev => prev.filter(n => n !== note)), ms);
  };

  // toca nota e agenda release automático (usado na reprodução da sequência)
  const triggerAttackRelease = async (note, dur = "8n") => {
    try { await Tone.start(); } catch {}
    if (sampler && loaded) {
      const duration = Tone.Time(dur).toSeconds() * 1.8;
      clearReleaseTimer(note);
      sampler.triggerAttack(note);
      setActiveNotes(prev => [...new Set([...prev, note])]);
      scheduleRelease(note, Math.max(200, Math.round(duration * 1000)));
    } else {
      const synth = new Tone.Synth({
        envelope: { attack: 0.02, decay: 0.1, sustain: 0.6, release: 0.8 }
      }).toDestination();
      synth.triggerAttackRelease(note, dur);
      flashNote(note, 400);
    }
  };

  // converte duração musical para ms (simples)
  const durToMs = (dur) => {
    switch (dur) {
      case "4n": return speed * 2.0;
      case "8n": return speed * 1.3;
      case "16n": return speed * 0.8;
      default: return speed * 1.2;
    }
  };

  // retorna a nota no passo idx da música
  const noteAt = (song, idx) => {
    if (!song || !song.seq || idx == null) return null;
    const step = song.seq[idx];
    return typeof step === "string" ? step : (step && step.note);
  };

  // --- reproduz a sequência (mostra para o usuário) ---
  const showSong = async (songSeq, songId) => {
    setMode("showing");
    setStatus("Mostrando sequência");
    setPlayerIndex(0);
    setExpectedIndex(null);
    completedIndices.current.clear();
    stopAllNotes();
    clearTimeout(playerTimeout.current);
    clearIndicator();
    await new Promise(res => setTimeout(res, 180));

    const song = SONGS.find(s => s.id === songId);
    if (!song) {
      setMode("idle");
      setStatus("Pronto");
      return;
    }

    for (let i = 0; i < songSeq.length; i++){
      const step = songSeq[i];
      const note = typeof step === "string" ? step : step.note;
      const dur = typeof step === "string" ? "8n" : (step.dur || "8n");
      setExpectedIndex(i); // destaca a nota enquanto toca
      await triggerAttackRelease(note, dur);
      await new Promise(res => setTimeout(res, durToMs(dur)));
    }

    // após reproduzir, passa para modo onde usuário precisa apertar cada nota indicada
    setMode("playing");
    setStatus("Sua vez — toque as notas na ordem!");
    setPlayerIndex(0);
    completedIndices.current.clear();
    setExpectedIndex(0); // espera primeira nota do usuário
  };

  // resolve uma tecla/entrada para nota (usa mapping do contexto ou keyToNote)
  const resolveKeyToNote = (input) => {
    if (!input) return null;
    if (/^[A-G]#?\d$/i.test(String(input).trim())) return String(input).trim().toUpperCase();
    const keyChar = String(input).trim();
    const gm = getKeyToNoteMapping && getKeyToNoteMapping();
    return (gm && (gm[keyChar] || gm[keyChar.toUpperCase()] || gm[keyChar.toLowerCase()]))
      || keyToNote[keyChar] 
      || keyToNote[keyChar.toUpperCase()] 
      || keyToNote[keyChar.toLowerCase()] 
      || null;
  };

  // --- quando jogador aperta uma nota (mouse ou teclado) ---
  const handlePlayerInput = (rawInput) => {
    if (mode !== "playing") return;
    const song = SONGS.find(s => s.id === selectedSong);
    if (!song) return;
    const currentIdx = expectedIndexRef.current; // usa ref para evitar stale closure
    if (currentIdx == null) return;

    const pressedNote = resolveKeyToNote(rawInput);
    if (!pressedNote) {
      setStatus("Tecla não mapeada para nota");
      return;
    }

    // toca o som da nota pressionada
    triggerAttackRelease(pressedNote, "8n");

    const expectedRaw = noteAt(song, currentIdx) || "";
    const expectedNote = String(expectedRaw).trim().toUpperCase();

    if (expectedNote && pressedNote.toUpperCase() === expectedNote) {
      // marca ponto se ainda não marcou este passo
      if (!completedIndices.current.has(currentIdx)) {
        completedIndices.current.add(currentIdx);
        setScore(prev => prev + 1);
      }
      setStatus("Correto!");

      // avança para próxima nota — atualiza ref também
      setExpectedIndex(prev => {
        const next = (currentIdx == null) ? 1 : currentIdx + 1;
        if (next < song.seq.length) {
          expectedIndexRef.current = next;
          return next;
        } else {
          // fim da música
          clearIndicator();
          setMode("success");
          setStatus("🎵 Música completa!");
          setPlayerIndex(0);
          clearTimeout(playerTimeout.current);
          playerTimeout.current = setTimeout(() => {
            setMode("idle");
            setStatus("Pronto");
          }, 1500);
          expectedIndexRef.current = null;
          return null;
        }
      });
    } else {
      // mostra erro mas não avança indicador
      setStatus(`Errado — tente a nota azul (${expectedRaw || "?"})`);
    }
  };

  // --- listeners de teclado (respeita mapeamento e sustain) ---
  useEffect(() => {
    const resolveKeyChar = (e) => {
      if (e.key && e.key.length === 1) return e.key.toUpperCase();
      if (e.code && e.code.startsWith("Key")) return e.code.slice(3).toUpperCase();
      return String(e.key || "").toUpperCase();
    };

    const onKeyDown = (e) => {
      if (mode === "showing") return; // bloqueia durante reprodução
      const keyChar = resolveKeyChar(e);
      if (!keyChar || pressedKeys.current.has(keyChar)) return;
      pressedKeys.current.add(keyChar);

      const mappedNote = resolveKeyToNote(keyChar);
      console.log("[keyDown] keyChar:", keyChar, "mappedNote:", mappedNote, "mode:", mode, "expectedIndexRef:", expectedIndexRef.current);
      if (mappedNote) {
        e.preventDefault();
        clearReleaseTimer(mappedNote);
        setActiveNotes(prev => [...new Set([...prev, mappedNote])]);
        if (mode === "playing") {
          // passa nota já mapeada para evitar ambiguidade
          handlePlayerInput(mappedNote);
        } else {
          sampler?.triggerAttack?.(mappedNote);
        }
      }
    };

    const onKeyUp = (e) => {
      const keyChar = resolveKeyChar(e);
      pressedKeys.current.delete(keyChar);
      const mappedNote = resolveKeyToNote(keyChar);
      console.log("[keyUp] keyChar:", keyChar, "mappedNote:", mappedNote);
      if (mappedNote) scheduleRelease(mappedNote, sustainMs.current);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [mode, playerIndex, selectedSong, sampler, loaded]); // dependências reativas

  // --- iniciar música selecionada ---
  const startSelected = async () => {
    try { await Tone.start(); } catch {}
    const song = SONGS.find(s=>s.id===selectedSong);
    if (!song) return;
    stopAllNotes();
    clearTimeout(playerTimeout.current);
    clearIndicator();
    completedIndices.current.clear();
    setScore(0); // reset score ao iniciar
    setMode("idle");
    setStatus("Pronto");
    setPlayerIndex(0);
    setExpectedIndex(null);
    setTimeout(() => showSong(song.seq, song.id), 200);
  };

  // --- layout das teclas brancas e pretas ---
  const whiteNotes = allNotes.filter(n => !n.includes("#"));
  const blackNotes = allNotes.filter(n => n.includes("#"));
  const blackKeyOffsets = {
    "C#5": 0, "D#5": 1, "F#5": 3, "G#5": 4, "A#5": 5,
    "C#6": 7, "D#6": 8, "F#6": 10, "G#6": 11, "A#6": 12,
  };

  // label curta (usada antes) — agora usamos notaParaPortugues
  function notaLabel(note){ return note.replace(/\d/,''); }

  const gloveMapping = (getKeyToNoteMapping && getKeyToNoteMapping()) || {};

  // estilo para nota esperada (azul)
  const expectedStyleFor = (isBlack) => ({
    background: isBlack
      ? "linear-gradient(180deg,#1e40af,#3b82f6)"
      : "linear-gradient(180deg,#1e3a8a,#2563eb)",
    color: "#fff",
    borderColor: "rgba(37,99,235,0.6)",
    boxShadow: "0 0 20px rgba(37,99,235,0.4)"
  });

  // nota atualmente esperada (usada na renderização)
  const currentExpectedNote = (() => {
    const song = SONGS.find(s => s.id === selectedSong);
    if (!song || expectedIndex == null) return null;
    return noteAt(song, expectedIndex);
  })();

  // exibe nota (Dó, Ré, Mi...) com sustenido e oitava
  function notaParaPortugues(note) {
    if (!note) return note;
    const match = String(note).match(/^([A-G])(#?)(\d)$/);
    if (!match) return note;
    const [, letra, sustenido, oitava] = match;
    const mapa = {
      'C': 'Dó',
      'D': 'Ré',
      'E': 'Mi',
      'F': 'Fá',
      'G': 'Sol',
      'A': 'Lá',
      'B': 'Si',
    };
    return mapa[letra] + (sustenido ? '#' : '') + oitava;
  }

  
  return (
    <div className="jogo-root">
      <div className="jogo-panel">
        <h2>Jogos Musicais</h2>

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

          <button className="btn" onClick={() => { clearIndicator(); setMode("idle"); setPlayerIndex(0); setStatus("Pronto"); setExpectedIndex(null); stopAllNotes(); }}>
            Parar
          </button>

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
                      clearReleaseTimer(note);
                      sampler?.triggerAttack?.(note); // toca ao clicar
                      setActiveNotes(prev => [...new Set([...prev, note])]);
                      if (mode === "playing") handlePlayerInput(note); // passa nota ao handler
                    }
                  }}
                  onMouseUp={() => {
                    pressedMouseNotes.current.delete(note);
                    scheduleRelease(note, sustainMs.current); // agenda release ao soltar
                  }}
                  onMouseLeave={() => {
                    pressedMouseNotes.current.delete(note);
                    scheduleRelease(note, sustainMs.current);
                  }}
                >
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                    <div className="note-name">{notaParaPortugues(note)}</div> {/* mostra partitura */}
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
                    clearReleaseTimer(note);
                    sampler?.triggerAttack?.(note);
                    setActiveNotes(prev => [...new Set([...prev, note])]);
                    if (mode === "playing") handlePlayerInput(note);
                  }}}
                  onMouseUp={() => {
                    pressedMouseNotes.current.delete(note);
                    scheduleRelease(note, sustainMs.current);
                  }}
                  onMouseLeave={() => {
                    pressedMouseNotes.current.delete(note);
                    scheduleRelease(note, sustainMs.current);
                  }}
                >
                  <div className="note-name">{notaParaPortugues(note)}</div>
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
