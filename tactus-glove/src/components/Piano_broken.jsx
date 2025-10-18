import React, { useEffect, useState, useRef } from "react";
import * as Tone from "tone";
import { useGlove } from "../context/GloveContext";
import "./Piano.css";

// Todas as notas do piano (brancas e pretas, ordem cromática)
const allNotes = [
  "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4",
  "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5", "A5", "A#5", "B5"
];

// Teclas do teclado físico para vincular (ordem deve bater com allNotes)
const keyboardKeys = [
  "A", "W", "S", "E", "D", "F", "T", "G", "Y", "H", "U", "J",
  "K", "O", "L", "P", ";", "Z", "X", "C", "V", "B", "N", "M"
];

// Mapeia nota para tecla do teclado físico
const noteToKey = {};
allNotes.forEach((note, i) => noteToKey[note] = keyboardKeys[i] || "");

// Componente principal do piano virtual
export default function Piano() {
  // Hook do contexto da luva
  const { getKeyToNoteMapping, fingerKeys } = useGlove();
  
  // Estado para o sampler de áudio (Tone.js)
  const [sampler, setSampler] = useState(null);
  // Estado para as notas atualmente ativas (pressionadas)
  const [activeNotes, setActiveNotes] = useState([]);
  // Estado para o volume do piano (em dB)
  const [volume, setVolume] = useState(-12); 
  // Referência para o node de volume do Tone.js
  const volumeNode = useRef(null);
  // Mantém controle das teclas do teclado físico que estão pressionadas
  const pressedKeys = useRef(new Set());
  // Mantém controle das teclas do mouse pressionadas (para não disparar várias vezes)
  const pressedMouseNotes = useRef(new Set());

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

  // Toca a nota (sustain) enquanto pressionada
  const triggerAttack = (note) => {
    if (sampler) {
      Tone.start();
      sampler.triggerAttack(note);
    }
  };

  // Teclado físico: agora usa o mapeamento do contexto para QWERTYUIOP
  useEffect(() => {
    const keyToNoteMapping = getKeyToNoteMapping();
    
    const handleKeyDown = (e) => {
      const key = e.key.toUpperCase();
      
      // Primeiro verifica se é uma tecla da luva (QWERTYUIOP)
      if (fingerKeys.includes(key) && keyToNoteMapping[key]) {
        const note = keyToNoteMapping[key];
        if (!pressedKeys.current.has(key)) {
          pressedKeys.current.add(key);
          triggerAttack(note);
          setActiveNotes((prev) => [...prev, note]);
        }
        return;
      }
      
      // Se não for tecla da luva, usa o mapeamento tradicional do piano
      const note = allNotes[keyboardKeys.indexOf(key)];
      if (note) {
        if (!pressedKeys.current.has(key)) {
          pressedKeys.current.add(key);
          triggerAttack(note);
          setActiveNotes((prev) => [...prev, note]);
        }
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toUpperCase();
      
      // Primeiro verifica se é uma tecla da luva
      if (fingerKeys.includes(key) && keyToNoteMapping[key]) {
        const note = keyToNoteMapping[key];
        pressedKeys.current.delete(key);
        setActiveNotes((prev) => prev.filter((n) => n !== note));
        return;
      }
      
      // Se não for tecla da luva, usa o mapeamento tradicional
      const note = allNotes[keyboardKeys.indexOf(key)];
      if (note) {
        pressedKeys.current.delete(key);
        setActiveNotes((prev) => prev.filter((n) => n !== note));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [sampler, getKeyToNoteMapping, fingerKeys]);

  // Renderização do piano: separa brancas e pretas para visual
  const whiteNotes = allNotes.filter(n => !n.includes("#"));
  const blackNotes = allNotes.filter(n => n.includes("#"));

  // Para posicionar as pretas corretamente sobre as brancas
  const blackKeyOffsets = {
    "C#4": 0, "D#4": 1, "F#4": 3, "G#4": 4, "A#4": 5,
    "C#5": 7, "D#5": 8, "F#5": 10, "G#5": 11, "A#5": 12,
  };

  // Função para destacar teclas da luva no piano visual
  const getKeyStyle = (note) => {
    const keyToNoteMapping = getKeyToNoteMapping();
    const isGloveNote = Object.values(keyToNoteMapping).includes(note);
    
    if (isGloveNote) {
      return {
        border: '2px solid #007bff',
        boxShadow: '0 0 5px rgba(0, 123, 255, 0.5)'
      };
    }
    return {};
  };

  // Renderização do componente do piano
  return (
    <div className="piano-main">
      {/* Informações da Luva */}
      <div className="glove-info">
        <h3>Mapeamento da Luva Atual:</h3>
        <div className="glove-mapping">
          {fingerKeys.map(key => {
            const keyToNoteMapping = getKeyToNoteMapping();
            const note = keyToNoteMapping[key];
            return (
              <span key={key} className="glove-key-info">
                <strong>{key}:</strong> {note || 'Não definido'}
              </span>
            );
          })}
        </div>
      </div>

      {/* Barra de volume estilizada */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <label htmlFor="volume-slider" style={{ marginRight: 12, fontWeight: 500, fontSize: 16, color: "#2d3e50" }}>
          Volume
        </label>
        <input
          id="volume-slider"
          type="range"
          min="-40"
          max="0"
          step="1"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          style={{
            width: 200,
            height: 8,
            background: `linear-gradient(to right, #007bff 0%, #007bff ${((volume + 40) / 40) * 100}%, #e9ecef ${((volume + 40) / 40) * 100}%, #e9ecef 100%)`,
            borderRadius: 4,
            outline: "none",
            cursor: "pointer",
          }}
        />
        <span style={{ marginLeft: 12, fontSize: 14, color: "#6c757d", minWidth: 40 }}>
          {volume} dB
        </span>
      </div>

      {/* Piano visual */}
      <div className="piano-container">
        {/* Teclas brancas */}
        <div className="white-keys">
          {whiteNotes.map((note, index) => (
            <div
              key={note}
              className={`white-key ${activeNotes.includes(note) ? "active" : ""}`}
              style={getKeyStyle(note)}
              onMouseDown={() => {
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
              <span className="note-label">{note}</span>
              <span className="key-label">{noteToKey[note] || ""}</span>
            </div>
          ))}
        </div>

        {/* Teclas pretas */}
        <div className="black-keys">
          {blackNotes.map((note) => (
            <div
              key={note}
              className={`black-key ${activeNotes.includes(note) ? "active" : ""}`}
              style={{
                left: `${(blackKeyOffsets[note] || 0) * 42 + 29}px`,
                ...getKeyStyle(note)
              }}
              onMouseDown={() => {
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
              <span className="note-label">{note}</span>
              <span className="key-label">{noteToKey[note] || ""}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Instruções */}
      <div className="instructions">
        <p>
          <strong>Luva:</strong> Use as teclas Q, W, E, R, T, Y, U, I, O, P conforme configurado | 
          <strong> Piano:</strong> Use as teclas A-M para tocar | 
          <strong>Mouse:</strong> Clique nas teclas
        </p>
      </div>
    </div>
  );
}