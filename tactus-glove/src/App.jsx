import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Piano from "./components/Piano";
import Ajuda from "./components/Ajuda";
import Jogos from "./components/Jogos";
import ConfigGlove from "./components/ConfigGlove"; // página de configurações
import { GloveProvider } from "./context/GloveContext";
import "./App.css";

function Home() {
  const navigate = useNavigate();

  // Redireciona automaticamente para /piano ao montar
  React.useEffect(() => {
    navigate("/piano");
  }, [navigate]);

  return null; // Não renderiza nada, só redireciona
}

export default function App() {
  return (
    <GloveProvider>
      <Router>
        <div className="app">
          <Navbar />
          <Routes>
            {/* Home e Piano usam o mesmo estado */}
            <Route
              path="/"
              element={<Home />}
            />
            <Route
              path="/ajuda"
              element={<Ajuda />}
            />

            <Route
              path="/piano"
              element={<Piano />}
            />

            <Route
              path="/jogos"
              element={<Jogos />}
            />

            {/* Página de configuração */}
            <Route
              path="/configuracoes"
              element={<ConfigGlove />}
            />
          </Routes>
        </div>
      </Router>
    </GloveProvider>
  );
}
