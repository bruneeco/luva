import Navbar from "./components/Navbar";
import Piano from "./components/Piano";
import InfoBox from "./components/InfoBox";
import "./App.css";

export default function App() {
  return (
    <div className="app">
      <Navbar />
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

        <Piano />

        {/* Caixas de informações */}
        <div className="info-boxes">
          <InfoBox text="Aqui teremos algumas informações sobre o piano virtual e como ele funciona." />
          <InfoBox text="Aqui teremos algumas informações sobre o piano virtual e como ele funciona." />
        </div>
      </main>
    </div>
  );
}
