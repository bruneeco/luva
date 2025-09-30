import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Piano from "./components/Piano";
import Ajuda from "./components/Ajuda";
import InfoBox from "./components/InfoBox";
import ConfigGlove from "./components/ConfigGlove"; // página de configurações
import "./App.css";

function Home({ mappingsDir, mappingsEsq }) {
  const navigate = useNavigate();

  // Redireciona automaticamente para /piano ao montar
  React.useEffect(() => {
    navigate("/piano");
  }, [navigate]);

  return null; // Não renderiza nada, só redireciona
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
            path="/ajuda"
            element={<Ajuda mappingsDir={mappings.dir} mappingsEsq={mappings.esq} />}
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
