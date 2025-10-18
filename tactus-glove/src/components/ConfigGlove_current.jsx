import React, { useState, useEffect } from "react";
import luvaImgDir from "../assets/luvaDir.svg";
import luvaImgEsq from "../assets/luvaEsq.svg";
import { useGlove } from "../context/GloveContext";
import "./ConfigGlove.css";

// Componente principal de configuração da luva
export default function ConfigGlove() {
  // Hook do contexto da luva
  const {
    selectedScale,
    fingerMapping,
    configMode,
    orderedScales,
    allNotes,
    applyScalePreset,
    updateFingerNote,
    getFingerKey,
    getFingerNote,
    fingerToKeyMapping,
  } = useGlove();
  
  // Estado para o dedo selecionado
  const [selectedFinger, setSelectedFinger] = useState(null);
  // Estado para a nota selecionada no select
  const [selectedKey, setSelectedKey] = useState("");
  // Estado para mostrar/ocultar o resumo das configurações
  const [showResult, setShowResult] = useState(false);
  // Estado para feedback visual ao usuário (ex: envio para ESP)
  const [feedback, setFeedback] = useState("");

  // Lista de dedos da mão direita
  const fingersDir = [
    { name: "PolegarDir", label: "Polegar Direito", short: "PD", className: "thumb" },
    { name: "IndicadorDir", label: "Indicador Direito", short: "ID", className: "index" },
    { name: "MédioDir", label: "Médio Direito", short: "MD", className: "middle" },
    { name: "AnelarDir", label: "Anelar Direito", short: "AD", className: "ring" },
    { name: "MindinhoDir", label: "Mindinho Direito", short: "DD", className: "pinky" },
  ];

  // Lista de dedos da mão esquerda
  const fingersEsq = [
    { name: "PolegarEsq", label: "Polegar Esquerdo", short: "PE", className: "thumb" },
    { name: "IndicadorEsq", label: "Indicador Esquerdo", short: "IE", className: "index" },
    { name: "MédioEsq", label: "Médio Esquerdo", short: "ME", className: "middle" },
    { name: "AnelarEsq", label: "Anelar Esquerdo", short: "AE", className: "ring" },
    { name: "MindinhoEsq", label: "Mindinho Esquerdo", short: "DE", className: "pinky" },
  ];

  // Mapeamento de notas para teclas do piano visual
  const noteToKey = {
    C5: "Q", "C#5": "2", D5: "W", "D#5": "3", E5: "E", F5: "R",
    "F#5": "5", G5: "T", "G#5": "6", A5: "Y", "A#5": "7", B5: "U",
    C6: "I", "C#6": "9", D6: "O", "D#6": "0", E6: "P", F6: "[",
    "F#6": "=", G6: "]", "G#6": "\\", A6: "A", "A#6": "S", B6: "D",
  };

  // Função para lidar com a seleção de um dedo
  const handleFingerSelect = (fingerName) => {
    setSelectedFinger(fingerName);
    const currentNote = getFingerNote(fingerName);
    setSelectedKey(currentNote);
  };

  // Função para atualizar a nota de um dedo
  const handleNoteChange = (fingerName, note) => {
    updateFingerNote(fingerName, note);
    setSelectedKey(note);
  };

  // Função para aplicar um preset de escala
  const handleScalePresetChange = (scaleName) => {
    applyScalePreset(scaleName);
    setSelectedFinger(null);
    setSelectedKey("");
  };

  // Função para salvar configurações no ESP32
  const handleSaveToESP = async () => {
    try {
      setFeedback("Enviando configurações...");
      
      // Converte o mapeamento de dedos para o formato esperado pelo ESP32
      const espMapping = {};
      Object.keys(fingerMapping).forEach(finger => {
        const key = getFingerKey(finger);
        const note = getFingerNote(finger);
        if (key && note) {
          espMapping[key] = note;
        }
      });

      const response = await fetch("http://192.168.4.1/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(espMapping),
      });

      if (response.ok) {
        setFeedback("Configurações enviadas com sucesso!");
      } else {
        setFeedback("Erro ao enviar configurações.");
      }
    } catch (error) {
      console.error("Erro:", error);
      setFeedback("Erro de conexão com o ESP32.");
    }

    setTimeout(() => setFeedback(""), 3000);
  };

  // Limpa feedback após um tempo
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  return (
    <div className="config-container">
      <h1>Configuração da Luva</h1>

      {/* Seção de Presets de Escalas */}
      <div className="preset-section">
        <h2>Presets de Escalas</h2>
        <div className="preset-controls">
          <label>
            Escala selecionada:
            <select 
              value={selectedScale} 
              onChange={(e) => handleScalePresetChange(e.target.value)}
              className="scale-select"
            >
              {orderedScales.map(scale => (
                <option key={scale} value={scale}>{scale}</option>
              ))}
            </select>
          </label>
          <span className="config-mode">
            Modo: {configMode === 'preset' ? 'Preset' : 'Personalizado'}
          </span>
        </div>
      </div>

      {/* Seção de Configuração Manual */}
      <div className="manual-config-section">
        <h2>Configuração Manual</h2>
        <p>Clique em um dedo para personalizar sua nota:</p>

        {/* Mãos lado a lado */}
        <div className="hands-container">
          {/* Mão Esquerda */}
          <div className="hand-section">
            <h3>Mão Esquerda</h3>
            <div className="hand-visual">
              <img src={luvaImgEsq} alt="Mão Esquerda" className="hand-image" />
              <div className="finger-buttons">
                {fingersEsq.map((finger) => (
                  <button
                    key={finger.name}
                    className={`finger-button ${finger.className} ${
                      selectedFinger === finger.name ? "selected" : ""
                    }`}
                    onClick={() => handleFingerSelect(finger.name)}
                    title={finger.label}
                  >
                    <span className="finger-label">{finger.short}</span>
                    <span className="finger-key">{getFingerKey(finger.name)}</span>
                    <span className="finger-note">{getFingerNote(finger.name)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mão Direita */}
          <div className="hand-section">
            <h3>Mão Direita</h3>
            <div className="hand-visual">
              <img src={luvaImgDir} alt="Mão Direita" className="hand-image" />
              <div className="finger-buttons">
                {fingersDir.map((finger) => (
                  <button
                    key={finger.name}
                    className={`finger-button ${finger.className} ${
                      selectedFinger === finger.name ? "selected" : ""
                    }`}
                    onClick={() => handleFingerSelect(finger.name)}
                    title={finger.label}
                  >
                    <span className="finger-label">{finger.short}</span>
                    <span className="finger-key">{getFingerKey(finger.name)}</span>
                    <span className="finger-note">{getFingerNote(finger.name)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Seletor de nota para dedo selecionado */}
        {selectedFinger && (
          <div className="note-selector">
            <h3>
              Configurar {fingersDir.concat(fingersEsq).find(f => f.name === selectedFinger)?.label}
              <span className="finger-key-display">
                (Tecla: {getFingerKey(selectedFinger)})
              </span>
            </h3>
            <select
              value={selectedKey}
              onChange={(e) => handleNoteChange(selectedFinger, e.target.value)}
              className="note-select"
            >
              <option value="">Selecione uma nota</option>
              {allNotes.map((note) => (
                <option key={note} value={note}>
                  {note}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Botões de Ação */}
      <div className="action-buttons">
        <button 
          onClick={() => setShowResult(!showResult)}
          className="btn-toggle-result"
        >
          {showResult ? "Ocultar" : "Mostrar"} Configurações
        </button>
        <button onClick={handleSaveToESP} className="btn-save-esp">
          Enviar para ESP32
        </button>
      </div>

      {/* Feedback */}
      {feedback && <div className="feedback">{feedback}</div>}

      {/* Resumo das Configurações */}
      {showResult && (
        <div className="result-section">
          <h2>Resumo das Configurações</h2>
          <div className="config-summary">
            <div className="current-scale">
              <strong>Escala Atual:</strong> {selectedScale} ({configMode})
            </div>
            <div className="finger-mappings">
              <h3>Mapeamento de Dedos:</h3>
              <div className="mappings-grid">
                {Object.keys(fingerMapping).map(finger => {
                  const key = getFingerKey(finger);
                  const note = getFingerNote(finger);
                  const fingerInfo = fingersDir.concat(fingersEsq).find(f => f.name === finger);
                  return (
                    <div key={finger} className="mapping-item">
                      <span className="finger-info">{fingerInfo?.short} ({key}):</span>
                      <span className="note-info">{note || "Não definido"}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}