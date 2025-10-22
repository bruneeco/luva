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
        <p>
          O projeto prioriza <strong>baixo custo</strong>, <strong>reprodutibilidade</strong> e integração com práticas de
          reabilitação, oferecendo documentação completa, firmware aberto e uma interface web para configuração e treino.
        </p>
      </header>

      <section className="ajuda-section">
        <h2>🎵 Como Funciona</h2>
        <p>
          A luva utiliza <strong>ativadores mecânicos</strong> e sensores flexíveis conectados a um{" "}
          <strong>ESP32</strong>. Os sinais digitais são transmitidos por USB/Wi‑Fi ou Bluetooth Low Energy e mapeados para
          notas no piano virtual com baixa latência. Há um fluxo de funcionamento claro:
        </p>
        <ol>
          <li><strong>Detecção:</strong> sensor detecta dobra/pressão do dedo.</li>
          <li><strong>Leitura:</strong> ESP32 digitaliza e envia evento.</li>
          <li><strong>Mapeamento:</strong> aplicação traduz evento em nota configurada pelo usuário.</li>
          <li><strong>Feedback:</strong> som imediato pelo sintetizador e sinal visual no piano.</li>
        </ol>
      </section>

      <section className="ajuda-section">
        <h2>🎯 Objetivos</h2>
        <p>
          O projeto busca <strong>incluir e democratizar o acesso à música</strong>, oferecendo uma ferramenta prática para uso terapêutico e educacional.
        </p>
        <ul>
          <li>✔️ Tornar a prática musical mais acessível em ambientes clínicos e domiciliares.</li>
          <li>✔️ Promover autonomia e autoestima através da criação sonora.</li>
          <li>✔️ Permitir personalização (volume, mapeamento de dedos).</li>
        </ul>
        <p>
          Indicadores de sucesso: redução do tempo de reação, ganho em precisão motora e satisfação do usuário/terapeuta.
        </p>
      </section>

      <section className="ajuda-section">
        <h2>🧠 Benefícios terapêuticos e para qualidade motora</h2>
        <p>
          Além do aspecto musical, a Tactus Glove é uma ferramenta de reabilitação que pode complementar terapia ocupacional e fisioterapia.
        </p>
        <ul>
          <li><strong>Melhora da motricidade fina:</strong> exercícios sequenciais e discretos treinam independência digital e controle fino.</li>
          <li><strong>Força e controle graduais:</strong> ajustes de sensibilidade permitem aumentar progressivamente a exigência de força.</li>
          <li><strong>Propriocepção:</strong> o feedback sonoro e visual reforça mapeamento sensório-motor.</li>
          <li><strong>Coordenação mão–olho:</strong> tarefas rítmicas melhoram sincronização e tempo de reação.</li>
          <li><strong>Função bilateral:</strong> exercícios que pedem uso coordenado das duas mãos reforçam integração hemisférica.</li>
          <li><strong>Medição e registro:</strong> logs e métricas permitem acompanhamento longitudinal da evolução motora.</li>
          <li><strong>Adesão e motivação:</strong> formato lúdico aumenta engajamento em programas de reabilitação.</li>
        </ul>

        <h3>Exemplos de exercícios práticos</h3>
        <ul>
          <li><strong>Tapping sequencial:</strong> treinos controlados por tempo e precisão para independência dos dedos.</li>
          <li><strong>Controle de tempo:</strong> tocar no tempo de um metrônomo para treinar ritmo, regularidade e capacidade de sincronização.</li>
        </ul>
      </section>

      <section className="ajuda-section">
        <h2>⚙️ Tecnologias Utilizadas</h2>
        <p>
          O sistema combina hardware simples e software aberto para facilitar manutenção e escalabilidade.
        </p>
        <ul>
          <li><strong>Hardware:</strong> ESP32, sensores flex (ou interruptores), fios, conectores e estrutura textil/encaixe para luva.</li>
          <li><strong>Comunicação:</strong> USB serial, Wi‑Fi e BLE para diferentes cenários de uso.</li>
          <li><strong>Firmware:</strong> código em C/C++ (ESP-IDF/Arduino) com protocolo simples de eventos.</li>
          <li><strong>Front-end:</strong> React web para configuração, treino e visualização de métricas; Tone.js para síntese sonora.</li>
        </ul>
      </section>

      <section className="ajuda-section">
        <h2>📈 Resultados Esperados e Validação</h2>
        <p>
          Para avaliação do impacto, propomos um protocolo piloto com métricas objetivas e qualitativas:
        </p>
        <ul>
          <li><strong>Métricas objetivas:</strong> latência média do evento, taxa de detecção correta, tempo de reação e consistência.</li>
          <li><strong>Métricas clínicas:</strong> melhora nos testes de motricidade antes e depois do programa de treino.</li>
          <li><strong>Métricas de usabilidade:</strong> tempo de configuração e taxa de adesão.</li>
          <li><strong>Estudo piloto:</strong> 4–8 semanas com acompanhamento, coleta de dados e relatório com resultados e recomendações.</li>
        </ul>
      </section>
      <section className="ajuda-section">
        <h2>👥 Quem Somos</h2>
        <p>
          Este projeto foi desenvolvido por alunos da{" "}
          <strong>Escola Técnica Estadual Bento Quirino (Campinas/SP)</strong>,
          com orientação de professores e coorientadores.  
          Contamos com apoio técnico de profissionais da área de saúde e eletrônica.
        </p>
        <p>
          Contato para avaliadores e parcerias: <strong>tactusgloves@gmail.com</strong> 
        </p>
      </section>
    </div>
  );
}
