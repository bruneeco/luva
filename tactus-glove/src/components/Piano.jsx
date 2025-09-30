import React, { useEffect, useState, useRef } from "react";
import * as Tone from "tone";
import "./Piano.css";

export default function Piano() {
  const [sampler, setSampler] = useState(null);
  const [keyBindings, setKeyBindings] = useState({});
  const [activeNotes, setActiveNotes] = useState([]);
  const [volume, setVolume] = useState(-12); 
  const volumeNode = useRef(null);

  useEffect(() => {
    volumeNode.current = new Tone.Volume(volume).toDestination();

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

    return () => {
      newSampler.disconnect();
      volumeNode.current.dispose();
    };
  }, []);

  useEffect(() => {
    if (volumeNode.current) {
      volumeNode.current.volume.value = volume;
    }
  }, [volume]);

  useEffect(() => {
    const savedBindings = localStorage.getItem("gloveKeyBindings");
    if (savedBindings) {
      setKeyBindings(JSON.parse(savedBindings));
    }
  }, []);

  const playNote = (note) => {
    if (sampler) {
      Tone.start();
      sampler.triggerAttackRelease(note, "2n");
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toUpperCase();
      if (keyBindings[key]) {
        const note = keyBindings[key];
        playNote(note);
        setActiveNotes((prev) => [...prev, note]);
      }
    };
    const handleKeyUp = (e) => {
      const key = e.key.toUpperCase();
      if (keyBindings[key]) {
        const note = keyBindings[key];
        setActiveNotes((prev) => prev.filter((n) => n !== note));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [sampler, keyBindings]);

  const whiteKeys = [
    "C4", "D4", "E4", "F4", "G4", "A4", "B4",
    "C5", "D5", "E5", "F5", "G5", "A5", "B5"
  ];

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

  return (
    <div className="piano-main">
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
      <div className="piano-container">
        <div className="piano">
          {whiteKeys.map((note, i) => (
            <div
              key={i}
              className={`white-key${activeNotes.includes(note) ? " active" : ""}`}
              onMouseDown={() => {
                playNote(note);
                setActiveNotes((prev) => [...prev, note]);
              }}
              onMouseUp={() => setActiveNotes((prev) => prev.filter((n) => n !== note))}
              onMouseLeave={() => setActiveNotes((prev) => prev.filter((n) => n !== note))}
            >
              <span className="note-name">{note}</span>
              {blackKeys[i] && (
                <div
                  className={`black-key${activeNotes.includes(blackKeys[i]) ? " active" : ""}`}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    playNote(blackKeys[i]);
                    setActiveNotes((prev) => [...prev, blackKeys[i]]);
                  }}
                  onMouseUp={(e) => {
                    e.stopPropagation();
                    setActiveNotes((prev) => prev.filter((n) => n !== blackKeys[i]));
                  }}
                  onMouseLeave={(e) => {
                    e.stopPropagation();
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
