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
  } = useGlove();

  // Estado para o dedo selecionado da mão direita
  const [selectedFingerDir, setSelectedFingerDir] = useState(null);
  // Estado para o dedo selecionado da mão esquerda  
  const [selectedFingerEsq, setSelectedFingerEsq] = useState(null);
  // Estado para a nota selecionada no select
  const [selectedKey, setSelectedKey] = useState("");
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

  // Identifica qual dedo está selecionado (direita ou esquerda)
  const selectedFinger = selectedFingerDir || selectedFingerEsq;
  const isDir = !!selectedFingerDir;
  const isEsq = !!selectedFingerEsq;

  // Verifica se o modo personalizado está ativo
  const isCustomMode = configMode === 'custom' || selectedScale === 'Personalizado';

  // Atualiza o mapeamento do dedo selecionado ao escolher uma nota
  const handleKeyChange = (e) => {
    const newNote = e.target.value;
    setSelectedKey(newNote);
    
    if (!selectedFinger || !isCustomMode) return;

    updateFingerNote(selectedFinger, newNote);
  };

  // Função para lidar com a seleção de um dedo
  const handleFingerSelect = (fingerName, isRight) => {
    // Só permite seleção se estiver no modo personalizado
    if (!isCustomMode) return;

    if (isRight) {
      setSelectedFingerDir(fingerName);
      setSelectedFingerEsq(null);
    } else {
      setSelectedFingerEsq(fingerName);
      setSelectedFingerDir(null);
    }
    
    const currentNote = getFingerNote(fingerName);
    setSelectedKey(currentNote);
  };

  // Função para aplicar um preset de escala
  const handleScalePresetSelect = (scaleName) => {
    if (scaleName === 'Personalizado') {
      // Ativa modo personalizado sem alterar mapeamento atual
      setSelectedFingerDir(null);
      setSelectedFingerEsq(null);
      setSelectedKey("");
    } else {
      // Aplica preset de escala
      applyScalePreset(scaleName);
      setSelectedFingerDir(null);
      setSelectedFingerEsq(null);
      setSelectedKey("");
    }
  };

  // Função para confirmar configurações
  const handleConfirm = async () => {
    try {
      setFeedback("Salvando configurações...");
      
      // Converte o mapeamento de dedos para o formato esperado pelo ESP32
      const espMapping = {};
      Object.keys(fingerMapping).forEach(finger => {
        const key = getFingerKey(finger);
        const note = getFingerNote(finger);
        if (key && note) {
          espMapping[key] = note;
        }
      });

      // Opcional: enviar para ESP32
      try {
        const response = await fetch("http://192.168.4.1/config", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(espMapping),
        });

        if (response.ok) {
          setFeedback("Configurações confirmadas e enviadas!");
        } else {
          setFeedback("Configurações salvas (ESP32 não disponível)");
        }
      } catch (error) {
        setFeedback("Configurações salvas localmente");
      }
    } catch (error) {
      console.error("Erro:", error);
      setFeedback("Erro ao salvar configurações");
    }

    setTimeout(() => setFeedback(""), 3000);
  };

  // Função para cancelar alterações
  const handleCancel = () => {
    // Recarrega configurações do localStorage
    const savedMapping = localStorage.getItem('gloveFingerMapping');
    const savedScale = localStorage.getItem('gloveSelectedScale');
    const savedMode = localStorage.getItem('gloveConfigMode');
    
    if (savedMapping) {
      // Se houver configurações salvas, reverte para elas
      const parsedMapping = JSON.parse(savedMapping);
      setFingerMapping(parsedMapping);
      if (savedScale) setSelectedScale(savedScale);
      if (savedMode) setConfigMode(savedMode);
    }
    
    // Limpa seleções
    setSelectedFingerDir(null);
    setSelectedFingerEsq(null);
    setSelectedKey("");
    setFeedback("Alterações canceladas");
    
    setTimeout(() => setFeedback(""), 2000);
  };

  // Limpa feedback após um tempo
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  return (
    <div className="config-layout">
      {/* Sidebar com presets de escalas */}
      <div className="presets-sidebar">
        <h2>Presets de Escalas</h2>
        <div className="presets-list">
          {/* Opção Personalizado */}
          
          
          {/* Escalas predefinidas */}
          {orderedScales.map(scale => (
            <button
              key={scale}
              className={`preset-button ${selectedScale === scale && configMode === 'preset' ? 'active' : ''}`}
              onClick={() => handleScalePresetSelect(scale)}
            >
              {scale}
            </button>
          ))}
        </div>
      </div>

      {/* Área principal de configuração */}
      <div className="config-main">
        <div className="config-container">
          <h1>Configuração da Luva</h1>

          {/* Informação do modo atual */}
          <div className="current-mode-info">
            <strong>Modo atual:</strong> {isCustomMode ? 'Personalizado' : selectedScale}
            {!isCustomMode && (
              <span className="mode-hint"></span>
            )}
          </div>

          {/* Container das mãos lado a lado */}
          <div className="hands-container">
            {/* Mão Esquerda */}
            <div className="hand-section">
              <h2>Mão Esquerda</h2>
              <div className="hand-visual">
                <img src={luvaImgEsq} alt="Luva Esquerda" className="hand-image" />
                
              </div>
            </div>

            {/* Mão Direita */}
            <div className="hand-section">
              <h2>Mão Direita</h2>
              <div className="hand-visual">
                <img src={luvaImgDir} alt="Luva Direita" className="hand-image" />
                
              </div>
            </div>
          </div>

          {/* Seletor de nota para dedo selecionado */}
          {selectedFinger && isCustomMode && (
            <div className="note-selector">
              <h3>
                Configurar {fingersDir.concat(fingersEsq).find(f => f.name === selectedFinger)?.label}
                <span className="finger-key-display">
                  (Tecla: {getFingerKey(selectedFinger)})
                </span>
              </h3>
              <select
                value={selectedKey}
                onChange={handleKeyChange}
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

          {/* Botões de Ação */}
          <div className="action-buttons">
            <button onClick={handleCancel} className="btn-cancel">
              Cancelar
            </button>
            <button onClick={handleConfirm} className="btn-confirm">
              Confirmar
            </button>
          </div>

          {/* Feedback */}
          {feedback && <div className="feedback">{feedback}</div>}
        </div>
      </div>
    </div>
  );
}