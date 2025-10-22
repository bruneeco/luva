import React from "react";
import "./Ajuda.css";

export default function Ajuda() {
  return (
    <div className="ajuda-container">
      <header className="ajuda-header">
        <h1>Sobre o Projeto Tactus Glove</h1>
        <p>
          A <strong>Tactus Glove</strong> é uma luva sensorizada desenvolvida
          para tornar a <strong>música acessível</strong> a pessoas com
          limitações motoras ou intelectuais, permitindo que qualquer um possa
          tocar notas e melodias apenas com o movimento dos dedos.
        </p>
      </header>

      <section className="ajuda-section">
        <h2>🎵 Como Funciona</h2>
        <p>
          A luva utiliza <strong>ativadores mecânicos</strong> conectados a um{" "}
          <strong>ESP32</strong>. Cada movimento dos dedos é convertido em
          sinais digitais, que são enviados para o computador ou celular.  
          Esses sinais são traduzidos em notas musicais através de um{" "}
          <strong>piano virtual</strong>, exibido aqui no site.
        </p>
        <ul>
          <li>➡️ Movimentos dos dedos = notas musicais</li>
          <li>➡️ Configuração personalizada das teclas pelo usuário</li>
          <li>➡️ Sons gerados em tempo real com o sintetizador virtual</li>
        </ul>
      </section>

      <section className="ajuda-section">
        <h2>🎯 Objetivos</h2>
        <p>
          O projeto busca <strong>incluir e democratizar o acesso à música</strong>, 
          oferecendo uma ferramenta simples e de baixo custo para pessoas com deficiência.
        </p>
        <ul>
          <li>✔️ Tornar a prática musical mais acessível</li>
          <li>✔️ Promover autonomia e criatividade</li>
          <li>✔️ Oferecer personalização (volume, timbre, escala e sensibilidade)</li>
          <li>✔️ Estimular desenvolvimento motor e cognitivo</li>
        </ul>
      </section>

      <section className="ajuda-section">
        <h2>⚙️ Tecnologias Utilizadas</h2>
        <p>
          Para criar a Tactus Glove, foram usados componentes e ferramentas de
          baixo custo, mas com grande impacto:
        </p>
        <ul>
          <li><strong>ESP32</strong> – microcontrolador com Wi-Fi e Bluetooth</li>
          <li><strong>Sensores Flexíveis</strong> – captam os movimentos dos dedos</li>
          <li><strong>Site & App</strong> – feitos em React e React Native</li>
          <li><strong>Piano Virtual</strong> – sons processados em tempo real</li>
        </ul>
      </section>

      <section className="ajuda-section">
        <h2>🚀 Resultados Esperados</h2>
        <p>
          Esperamos que a Tactus Glove se torne uma ferramenta eficaz de{" "}
          <strong>inclusão musical</strong>, possibilitando que pessoas com
          limitações físicas ou cognitivas possam tocar, aprender e se expressar
          artisticamente de forma autônoma.
        </p>
      </section>

      <section className="ajuda-section">
        <h2>👥 Quem Somos</h2>
        <p>
          Este projeto foi desenvolvido por alunos da{" "}
          <strong>Escola Técnica Estadual Bento Quirino (Campinas/SP)</strong>,
          com orientação de professores e coorientadores.  
          Nosso objetivo é unir <strong>tecnologia e arte</strong> para criar
          soluções de impacto social positivo.
        </p>
      </section>
    </div>
  );
}
