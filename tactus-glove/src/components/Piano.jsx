import React, { useEffect, useState, useRef } from "react";
import * as Tone from "tone";
import "./Piano.css";

// Componente principal do piano virtual
export default function Piano() {
  // Estado para o sampler de áudio (Tone.js)
  const [sampler, setSampler] = useState(null);
  // Estado para os bindings de teclas do teclado físico para notas
  const [keyBindings, setKeyBindings] = useState({});
  // Estado para as notas atualmente ativas (pressionadas)
  const [activeNotes, setActiveNotes] = useState([]);
  // Estado para o volume do piano (em dB)
  const [volume, setVolume] = useState(-12); 
  // Referência para o node de volume do Tone.js
  const volumeNode = useRef(null);

  // Mantém controle das teclas do teclado físico que estão pressionadas
  const pressedKeys = useRef(new Set());

  // Inicializa o sampler e o node de volume ao montar o componente
  useEffect(() => {
    // Cria o node de volume e conecta à saída de áudio
    volumeNode.current = new Tone.Volume(volume).toDestination();

    // Cria o sampler com os samples das notas
    const newSampler = new Tone.Sampler({
      urls: {
        A0: "A0.mp3",
        C1: "C1.mp3",
        "D#1": "Ds1.mp3",
        "F#1": "Fs1.mp3",
        A1: "A1.mp3",
        C2: "C2.mp3",
        "D#2": "Ds2.mp3",
        "F#2": "Fs2.mp3",
        A2: "A2.mp3",
        C3: "C3.mp3",
        "D#3": "Ds3.mp3",
        "F#3": "Fs3.mp3",
        A3: "A3.mp3",
        C4: "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        A4: "A4.mp3",
        C5: "C5.mp3",
        "D#5": "Ds5.mp3",
        "F#5": "Fs5.mp3",
        A5: "A5.mp3",
        C6: "C6.mp3",
        "D#6": "Ds6.mp3",
        "F#6": "Fs6.mp3",
        A6: "A6.mp3",
        C7: "C7.mp3",
        "D#7": "Ds7.mp3",
        "F#7": "Fs7.mp3",
        A7: "A7.mp3",
        C8: "C8.mp3",
      },
      baseUrl: "https://tonejs.github.io/audio/salamander/",
    }).connect(volumeNode.current);

    setSampler(newSampler);

    // Limpeza ao desmontar: desconecta sampler e libera volumeNode
    return () => {
      newSampler.disconnect();
      volumeNode.current.dispose();
    };
  }, []);

  // Atualiza o volume do node de volume sempre que o estado volume mudar
  useEffect(() => {
    if (volumeNode.current) {
      volumeNode.current.volume.value = volume;
    }
  }, [volume]);

  // Carrega os bindings das teclas do localStorage ao montar
  useEffect(() => {
    const savedBindings = localStorage.getItem("gloveKeyBindings");
    if (savedBindings) {
      setKeyBindings(JSON.parse(savedBindings));
    }
  }, []);

  // Toca a nota (sustain) enquanto pressionada
  const triggerAttack = (note) => {
    if (sampler) {
      Tone.start();
      sampler.triggerAttack(note);
    }
  };

  // Solta a nota (encerra sustain)
  const triggerRelease = (note) => {
    if (sampler) {
      sampler.triggerRelease(note);
    }
  };

  // Lógica para teclado físico: só dispara se a tecla não estiver pressionada
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toUpperCase();
      if (keyBindings[key]) {
        const note = keyBindings[key];
        if (!pressedKeys.current.has(key)) {
          pressedKeys.current.add(key);
          triggerAttack(note);
          setActiveNotes((prev) => [...prev, note]);
        }
      }
    };
    const handleKeyUp = (e) => {
      const key = e.key.toUpperCase();
      if (keyBindings[key]) {
        const note = keyBindings[key];
        pressedKeys.current.delete(key);
        setActiveNotes((prev) => prev.filter((n) => n !== note));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    // Remove listeners ao desmontar
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [sampler, keyBindings]);

  // Lista das teclas brancas do piano (ordem importa para renderização)
  const whiteKeys = [
    "C4", "D4", "E4", "F4", "G4", "A4", "B4",
    "C5", "D5", "E5", "F5", "G5", "A5", "B5"
  ];

  // Mapeamento das posições das teclas pretas (índice -> nota)
  const blackKeys = {
    1: "C#4",
    2: "D#4",
    4: "F#4",
    5: "G#4",
    6: "A#4",
    8: "C#5",
    9: "D#5",
    11: "F#5",
  };

  // Mantém controle das teclas do mouse pressionadas (para não disparar várias vezes)
  const pressedMouseNotes = useRef(new Set());

  // Renderização do componente do piano
  return (
    <div className="piano-main">
      {/* Barra de volume estilizada */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <label htmlFor="volume-slider" style={{ marginRight: 12, fontWeight: 500, fontSize: 16, color: "#2d3e50" }}>
          Volume
        </label>
        <input
          id="volume-slider"
          className="volume-slider"
          type="range"
          min={-48}
          max={0}
          value={volume}
          onChange={e => setVolume(Number(e.target.value))}
        />
      </div>
      {/* Container centralizado do piano */}
      <div className="piano-container">
        <div className="piano">
          {/* Renderiza as teclas brancas e, se houver, as pretas sobrepostas */}
          {whiteKeys.map((note, i) => (
            <div
              key={i}
              className={`white-key${activeNotes.includes(note) ? " active" : ""}`}
              onMouseDown={() => {
                // Só dispara se não estiver pressionada
                if (!pressedMouseNotes.current.has(note)) {
                  pressedMouseNotes.current.add(note);
                  triggerAttack(note);
                  setActiveNotes((prev) => [...prev, note]);
                }
              }}
              onMouseUp={() => {
                pressedMouseNotes.current.delete(note);
                setActiveNotes((prev) => prev.filter((n) => n !== note));
              }}
              onMouseLeave={() => {
                pressedMouseNotes.current.delete(note);
                setActiveNotes((prev) => prev.filter((n) => n !== note));
              }}
            >
              {/* Nome da nota na tecla branca */}
              <span className="note-name">{note}</span>
              {/* Se existir tecla preta nessa posição, renderiza sobreposta */}
              {blackKeys[i] && (
                <div
                  className={`black-key${activeNotes.includes(blackKeys[i]) ? " active" : ""}`}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    if (!pressedMouseNotes.current.has(blackKeys[i])) {
                      pressedMouseNotes.current.add(blackKeys[i]);
                      triggerAttack(blackKeys[i]);
                      setActiveNotes((prev) => [...prev, blackKeys[i]]);
                    }
                  }}
                  onMouseUp={(e) => {
                    e.stopPropagation();
                    pressedMouseNotes.current.delete(blackKeys[i]);
                    setActiveNotes((prev) => prev.filter((n) => n !== blackKeys[i]));
                  }}
                  onMouseLeave={(e) => {
                    e.stopPropagation();
                    pressedMouseNotes.current.delete(blackKeys[i]);
                    setActiveNotes((prev) => prev.filter((n) => n !== blackKeys[i]));
                  }}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
