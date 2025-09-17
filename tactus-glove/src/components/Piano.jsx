import React, { useEffect, useState } from "react";
import * as Tone from "tone";
import "./Piano.css";

export default function Piano() {
  const [sampler, setSampler] = useState(null);
  const [keyBindings, setKeyBindings] = useState({});

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
        playNote(keyBindings[key]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
    <div className="piano-container">
      <div className="piano">
        {whiteKeys.map((note, i) => (
          <div
            key={i}
            className="white-key"
            onClick={() => playNote(note)}
          >
            <span className="note-name">{note}</span>
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
