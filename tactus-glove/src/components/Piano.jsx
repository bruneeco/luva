import React, { useEffect, useState } from "react";
import * as Tone from "tone";
import "./Piano.css";

export default function Piano() {
  const [sampler, setSampler] = useState(null);

  useEffect(() => {
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
    }).toDestination();

    setSampler(newSampler);
  }, []);

  const playNote = (note) => {
    if (sampler) {
      Tone.start();
      sampler.triggerAttackRelease(note, "2n");
    }
  };

  const keyToNote = {
    Q: "C4",
    W: "D4",
    E: "E4",
    R: "F4",
    T: "G4",
    Y: "A4",
    U: "B4",
    I: "C5",
    O: "D5",
    P: "E5",
    A: "F5",
    S: "G5",
    D: "A5",
    F: "B5",
    G: "C6",
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toUpperCase();
      if (keyToNote[key]) {
        playNote(keyToNote[key]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sampler]);

  const whiteKeys = [
    { note: "C4", label: "C (Q)" },
    { note: "D4", label: "D (W)" },
    { note: "E4", label: "E (E)" },
    { note: "F4", label: "F (R)" },
    { note: "G4", label: "G (T)" },
    { note: "A4", label: "A (Y)" },
    { note: "B4", label: "B (U)" },
    { note: "C5", label: "C (I)" },
    { note: "D5", label: "D (O)" },
    { note: "E5", label: "E (P)" },
    { note: "F5", label: "F (A)" },
    { note: "G5", label: "G (S)" },
    { note: "A5", label: "A (D)" },
    { note: "B5", label: "B (F)" },
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
    <div className="piano-container">
      <div className="piano">
        {whiteKeys.map((key, i) => (
          <div
            key={i}
            className="white-key"
            onClick={() => playNote(key.note)}
          >
            <span className="key-number">{i + 1}</span>
            <span className="note-name">{key.label}</span>
            {blackKeys[i] && (
              <div
                className="black-key"
                onClick={(e) => {
                  e.stopPropagation();
                  playNote(blackKeys[i]);
                }}
              ></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
