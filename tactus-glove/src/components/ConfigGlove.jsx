import React, { useState, useEffect } from "react";
import luvaImgDir from "../assets/luvaDir.svg";
import luvaImgEsq from "../assets/luvaEsq.svg";
import "./ConfigGlove.css";

export default function ConfigGlove() {
  // Estado mão direita
  const [selectedFingerDir, setSelectedFingerDir] = useState(null);
  const [mappingsDir, setMappingsDir] = useState(() => {
    return JSON.parse(localStorage.getItem("gloveMappingsDir")) || {
      PolegarDir: "",
      IndicadorDir: "G5",
      MédioDir: "A5",
      AnelarDir: "B5",
      MindinhoDir: "C6",
    };
  });

  // Estado mão esquerda
  const [selectedFingerEsq, setSelectedFingerEsq] = useState(null);
  const [mappingsEsq, setMappingsEsq] = useState(() => {
    return JSON.parse(localStorage.getItem("gloveMappingsEsq")) || {
      PolegarEsq: "",
      IndicadorEsq: "C5",
      MédioEsq: "D5",
      AnelarEsq: "E5",
      MindinhoEsq: "F5",
    };
  });

  const [selectedKey, setSelectedKey] = useState("");
  const [showResult, setShowResult] = useState(false);

  // Estado para feedback
  const [feedback, setFeedback] = useState("");

  const fingersDir = [
    { name: "PolegarDir", label: "Polegar Direito", short: "PD", className: "thumb" },
    { name: "IndicadorDir", label: "Indicador Direito", short: "ID", className: "index" },
    { name: "MédioDir", label: "Médio Direito", short: "MD", className: "middle" },
    { name: "AnelarDir", label: "Anelar Direito", short: "AD", className: "ring" },
    { name: "MindinhoDir", label: "Mindinho Direito", short: "DD", className: "pinky" },
  ];

  const fingersEsq = [
    { name: "PolegarEsq", label: "Polegar Esquerdo", short: "PE", className: "thumb" },
    { name: "IndicadorEsq", label: "Indicador Esquerdo", short: "IE", className: "index" },
    { name: "MédioEsq", label: "Médio Esquerdo", short: "ME", className: "middle" },
    { name: "AnelarEsq", label: "Anelar Esquerdo", short: "AE", className: "ring" },
    { name: "MindinhoEsq", label: "Mindinho Esquerdo", short: "DE", className: "pinky" },
  ];

  const notes = [
    "C5","C#5","D5","D#5","E5","F5","F#5","G5","G#5","A5","A#5","B5",
    "C6","C#6","D6","D#6","E6","F6","F#6","G6","G#6","A6","A#6","B6"
  ];

  const keyboardKeys = [
    "Q","W","E","R","T","Y","U","I","O","P",
    "A","S","D","F","G","H","J","K","L",
    "Z","X","C","V","B"
  ];

  // Converte nota para tecla padrão
  const noteToKey = {};
  notes.forEach((note, i) => noteToKey[note] = keyboardKeys[i] || "");

  // Identifica dedo selecionado
  const selectedFinger = selectedFingerDir || selectedFingerEsq;
  const isDir = !!selectedFingerDir;
  const isEsq = !!selectedFingerEsq;

  // Atualiza mapping do dedo selecionado
  const handleKeyChange = (e) => {
    setSelectedKey(e.target.value);
    if (!selectedFinger) return;

    if (isDir) {
      const updated = { ...mappingsDir, [selectedFinger]: e.target.value };
      setMappingsDir(updated);
      localStorage.setItem("gloveMappingsDir", JSON.stringify(updated));
    } else if (isEsq) {
      const updated = { ...mappingsEsq, [selectedFinger]: e.target.value };
      setMappingsEsq(updated);
      localStorage.setItem("gloveMappingsEsq", JSON.stringify(updated));
    }

    // Atualiza também o binding geral que o piano vai ler
    const allMappings = { ...mappingsDir, ...mappingsEsq };
    const keyBindings = {};
    Object.keys(allMappings).forEach(f => {
      if (allMappings[f]) {
        keyBindings[noteToKey[allMappings[f]]] = allMappings[f];
      }
    });
    localStorage.setItem("gloveKeyBindings", JSON.stringify(keyBindings));

    setSelectedFingerDir(null);
    setSelectedFingerEsq(null);
  };

  const handleShowResult = () => setShowResult(true);
  const handleHideResult = () => setShowResult(false);

  // Função para enviar configurações para o ESP
  const handleSendToESP = async () => {
    setFeedback("Enviando...");
    try {
      // Monte o objeto de configuração
      const config = {
        direita: mappingsDir,
        esquerda: mappingsEsq,
      };
      // Troque o endereço pelo IP do seu ESP
      const response = await fetch("http://localhost:3001/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (response.ok) {
        setFeedback("Configuração enviada com sucesso!");
      } else {
        setFeedback("Erro ao enviar configuração.");
      }
    } catch (err) {
      setFeedback("Erro de conexão com o ESP.");
    }
    setTimeout(() => setFeedback(""), 3000);
  };

  // Carrega a última configuração ao iniciar
  useEffect(() => {
    fetch("http://localhost:3001/config")
      .then(res => res.json())
      .then(arr => {
        const ultimaConfig = arr[arr.length - 1]; // <-- sempre a mais recente
        if (ultimaConfig) {
          setMappingsDir(ultimaConfig.direita);
          setMappingsEsq(ultimaConfig.esquerda);
        }
      });
  }, []);

  return (
    <div className="config-container" style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}>
      <h2 style={{ textAlign:"center" }}>Configurações da luva</h2>

      <div className="hands-row" style={{ display:"flex", flexDirection:"row", alignItems:"center", justifyContent:"center" }}>
        {/* Mão Esquerda */}
        <div style={{ position:"relative", display:"flex", flexDirection:"column", alignItems:"center", marginRight:48 }}>
          <img src={luvaImgEsq} alt="Luva Esquerda" className="hand"/>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
            {fingersEsq.map(({ name, short, className }) => (
              <button
                key={name}
                className={`finger ${className} ${selectedFingerEsq === name ? "selected" : ""}`}
                onClick={() => setSelectedFingerEsq(name)}
                style={{ margin:"6px 0" }}
              >
                {mappingsEsq[name] ? (
                  <span className="selected-note">
                    {mappingsEsq[name]} ({noteToKey[mappingsEsq[name]]})
                  </span>
                ) : short}
              </button>
            ))}
          </div>
          <span style={{ marginTop:8, fontWeight:"bold" }}>Mão Esquerda</span>
        </div>

        {/* Mão Direita */}
        <div style={{ position:"relative", display:"flex", flexDirection:"column", alignItems:"center", marginLeft:48 }}>
          <img src={luvaImgDir} alt="Luva Direita" className="hand"/>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
            {fingersDir.map(({ name, short, className }) => (
              <button
                key={name}
                className={`finger ${className} ${selectedFingerDir === name ? "selected" : ""}`}
                onClick={() => setSelectedFingerDir(name)}
                style={{ margin:"6px 0" }}
              >
                {mappingsDir[name] ? (
                  <span className="selected-note">
                    {mappingsDir[name]} ({noteToKey[mappingsDir[name]]})
                  </span>
                ) : short}
              </button>
            ))}
          </div>
          <span style={{ marginTop:8, fontWeight:"bold" }}>Mão Direita</span>
        </div>

        {/* Área de resultado */}
        <div style={{ marginLeft:32, minWidth:250, display:"flex", flexDirection:"column", alignItems:"center" }}>
          {!showResult ? (
            <button style={{ marginBottom:16, padding:"8px 16px", fontSize:16 }} onClick={handleShowResult}>
              Mostrar teclas e notas dos dedos
            </button>
          ) : (
            <button style={{ marginBottom:16, padding:"8px 16px", fontSize:16 }} onClick={handleHideResult}>
              Fechar respostas
            </button>
          )}

          {showResult && (
            <div className="teclas-mapeadas" style={{ marginTop:0, textAlign:"center" }}>
              <h4>Mão Esquerda</h4>
              {fingersEsq.map(({ name, label }) => (
                <p key={name}>{label}: {mappingsEsq[name]} ({noteToKey[mappingsEsq[name]]})</p>
              ))}
              <h4 style={{ marginTop:16 }}>Mão Direita</h4>
              {fingersDir.map(({ name, label }) => (
                <p key={name}>{label}: {mappingsDir[name]} ({noteToKey[mappingsDir[name]]})</p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar de configuração */}
      {selectedFinger && (
        <div className="config-sidebar">
          <button
            className="close-sidebar"
            onClick={() => { setSelectedFingerDir(null); setSelectedFingerEsq(null); }}
            style={{ float:"right", margin:8, fontSize:18 }}
          >×</button>
          <h3 style={{ textAlign:"center" }}>
            Configurar dedo{" "}
            {isDir ? fingersDir.find(f => f.name===selectedFinger)?.label
                   : fingersEsq.find(f => f.name===selectedFinger)?.label}
          </h3>
          <select
            value={selectedKey}
            onChange={handleKeyChange}
            autoFocus
            style={{ marginTop:16, width:"90%", fontSize:16, display:"block", marginLeft:"auto", marginRight:"auto" }}
          >
            <option value="" disabled>Selecione uma nota...</option>
            {notes.map((note, i) => <option key={i} value={note}>{note}</option>)}
          </select>
        </div>
      )}

      {/* Botão de salvar e feedback */}
      <button
        style={{ marginTop: 32, padding: "10px 28px", fontSize: 18, background: "#4f8cff", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}
        onClick={handleSendToESP}
      >
        Salvar configurações na luva
      </button>
      {feedback && (
        <div style={{ marginTop: 12, fontWeight: "bold", color: feedback.includes("sucesso") ? "green" : "red" }}>
          {feedback}
        </div>
      )}
    </div>
  );
}
