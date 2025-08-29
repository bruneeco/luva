import React, { useState } from "react";
// SVG como React Component – requer vite-plugin-svgr configurado
import { ReactComponent as LuvaSvg } from "../assets/luva1.svg";
import "./ConfigGlove.css";

export default function ConfigGlove() {
  const [selectedFinger, setSelectedFinger] = useState(null);
  const [mappings, setMappings] = useState({});

  const handleKeyChange = (e) => {
    setMappings({ ...mappings, [selectedFinger]: e.target.value });
    setSelectedFinger(null);
  };

  const fingers = [
    { name: "Polegar", className: "thumb" },
    { name: "Indicador", className: "index" },
    { name: "Médio", className: "middle" },
    { name: "Anelar", className: "ring" },
    { name: "Mindinho", className: "pinky" },
  ];

  return (
    <div className="config-container">
      <h2>Configurações da luva</h2>

      <div className="hands">
        <LuvaSvg className="hand" />

        {fingers.map((finger) => (
          <button
            key={finger.name}
            className={`finger ${finger.className} ${selectedFinger === finger.name ? "selected" : ""}`}
            onClick={() => setSelectedFinger(finger.name)}
          >
            {finger.name[0]}
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

      <pre className="debug">{JSON.stringify(mappings, null, 2)}</pre>
    </div>
  );
}
