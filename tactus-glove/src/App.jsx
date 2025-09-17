import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar";
import Piano from "./components/Piano";
import InfoBox from "./components/InfoBox";
import ConfigGlove from "./components/ConfigGlove"; // página de configurações
import "./App.css";

function Home({ mappingsDir, mappingsEsq }) {
  return (
    <main className="content">
      <h1>Teclado virtual</h1>

      {/* Barra de status */}
      <div className="status-bar">
        <div className="status">
          <span className="status-dot"></span>
          <span>Conectado</span>
        </div>
        <div className="volume">
          <span role="img" aria-label="volume">🔊</span>
          <input type="range" />
        </div>
      </div>

      {/* Piano agora recebe mapeamentos */}
      <Piano mappingsDir={mappingsDir} mappingsEsq={mappingsEsq} />

      {/* Caixas de informações */}
      <div className="info-boxes">
        <InfoBox text="Aqui teremos algumas informações sobre o piano virtual e como ele funciona." />
        <InfoBox text="Aqui teremos algumas informações sobre o piano virtual e como ele funciona." />
      </div>
    </main>
  );
}

export default function App() {
  // Estado global para as configurações da luva
  const [mappings, setMappings] = useState({
    dir: {
      PolegarDir: "",
      IndicadorDir: "G5",
      MédioDir: "A5",
      AnelarDir: "B5",
      MindinhoDir: "C6",
    },
    esq: {
      PolegarEsq: "",
      IndicadorEsq: "C5",
      MédioEsq: "D5",
      AnelarEsq: "E5",
      MindinhoEsq: "F5",
    },
  });

  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          {/* Home e Piano usam o mesmo estado */}
          <Route
            path="/"
            element={<Home mappingsDir={mappings.dir} mappingsEsq={mappings.esq} />}
          />
          <Route
            path="/piano"
            element={<Piano mappingsDir={mappings.dir} mappingsEsq={mappings.esq} />}
          />

          {/* Página de configuração atualiza mappings */}
          <Route
            path="/configuracoes"
            element={
              <ConfigGlove onMappingsChange={(newMappings) => setMappings(newMappings)} />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}
