import React, { useState } from "react";
import luvaImg from "../assets/luva1.svg";
import "./ConfigGlove.css";

export default function ConfigGlove() {
  const [selectedFinger, setSelectedFinger] = useState(null);
  const [mappings, setMappings] = useState({});

  const fingers = [
    { name: "Polegar", short: "P", className: "thumb" },
    { name: "Indicador", short: "I", className: "index" },
    { name: "Médio", short: "M", className: "middle" },
    { name: "Anelar", short: "A", className: "ring" },
    { name: "Mindinho", short: "D", className: "pinky" },
  ];

  const handleKeyChange = (e) => {
    if (selectedFinger) {
      setMappings((prev) => ({
        ...prev,
        [selectedFinger]: e.target.value,
      }));
      setSelectedFinger(null);
    }
  };

  return (
    <div className="config-container">
      <h2>Configurações da luva</h2>

      <div className="hands">
        <img src={luvaImg} alt="Luva" className="hand" />

        {fingers.map(({ name, short, className }) => (
          <button
            key={name}
            className={`finger ${className} ${
              selectedFinger === name ? "selected" : ""
            }`}
            onClick={() => setSelectedFinger(name)}
          >
            {short}
          </button>
        ))}
      </div>

      {selectedFinger && (
        <div className="config-popup">
          <p>Configurar dedo {selectedFinger}:</p>
          <input
            type="text"
            placeholder="Digite a tecla..."
            onBlur={handleKeyChange}
            autoFocus
          />
        </div>
      )}

    </div>
  );
}
