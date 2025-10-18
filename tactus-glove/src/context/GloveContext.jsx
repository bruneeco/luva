import React, { createContext, useState, useEffect, useContext } from 'react';

export const GloveContext = createContext();

// Teclas QWERTYUIOP fixas para os 10 dedos
export const fingerKeys = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];

// Todas as notas disponíveis em ordem cromática
const allNotes = [
  'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5',
  'C6', 'C#6', 'D6', 'D#6', 'E6', 'F6', 'F#6', 'G6', 'G#6', 'A6', 'A#6', 'B6'
];

// Função para encontrar o índice de uma nota
const getNoteIndex = (note) => {
  return allNotes.indexOf(note);
};

// Função para obter nota por índice
const getNoteByIndex = (index) => {
  if (index >= 0 && index < allNotes.length) {
    return allNotes[index];
  }
  return null;
};

// Função para converter notas bemóis para equivalentes sustenidos
const normalizeNote = (note) => {
  const enharmonics = {
    'Cb': 'B',
    'Db': 'C#',
    'Eb': 'D#',
    'Fb': 'E',
    'Gb': 'F#',
    'Ab': 'G#',
    'Bb': 'A#'
  };
  
  for (const [flat, sharp] of Object.entries(enharmonics)) {
    if (note.includes(flat)) {
      return note.replace(flat, sharp);
    }
  }
  return note;
};

// Função para gerar escala maior
const generateMajorScale = (tonic) => {
  // Fórmula: Tom-Tom-semitom-Tom-Tom-Tom-semitom
  const intervals = [2, 2, 1, 2, 2, 2, 1]; // em semitons
  const normalizedTonic = normalizeNote(tonic);
  const startIndex = getNoteIndex(normalizedTonic);
  
  if (startIndex === -1) return [];
  
  const scale = [normalizedTonic];
  let currentIndex = startIndex;
  
  for (let i = 0; i < 7; i++) {
    currentIndex += intervals[i];
    const note = getNoteByIndex(currentIndex);
    if (note) {
      scale.push(note);
    }
  }
  
  return scale;
};

// Função para gerar escala menor natural
const generateMinorScale = (tonic) => {
  // Fórmula: Tom-semitom-Tom-Tom-semitom-Tom-Tom
  const intervals = [2, 1, 2, 2, 1, 2, 2]; // em semitons
  const normalizedTonic = normalizeNote(tonic);
  const startIndex = getNoteIndex(normalizedTonic);
  
  if (startIndex === -1) return [];
  
  const scale = [normalizedTonic];
  let currentIndex = startIndex;
  
  for (let i = 0; i < 7; i++) {
    currentIndex += intervals[i];
    const note = getNoteByIndex(currentIndex);
    if (note) {
      scale.push(note);
    }
  }
  
  return scale;
};

// Lista ordenada das escalas (mesmas do app mobile)
export const orderedScales = [
  // ...sem opção personalizada
  
  // Escalas Maiores
  'Dó Maior',
  'Sol Maior', 
  'Ré Maior',
  'Lá Maior',
  'Mi Maior',
  'Si / Dób Maior',
  'Solb / Fá# Maior',
  'Réb / Dó# Maior',
  'Láb Maior',
  'Mib Maior',
  'Sib Maior',
  'Fá Maior',
  
  // Escalas Menores
  'Lá Menor',
  'Mi Menor',
  'Si Menor',
  'Fá# Menor',
  'Dó# Menor',
  'Láb / Sol# Menor',
  'Mib / Ré# Menor',
  'Sib / Lá# Menor',
  'Fá Menor',
  'Dó Menor',
  'Sol Menor',
  'Ré Menor'
];

// Definição completa das escalas
export const scales = {
  // Escalas Maiores
  'Dó Maior': generateMajorScale('C5'),
  'Sol Maior': generateMajorScale('G5'),
  'Ré Maior': generateMajorScale('D5'),
  'Lá Maior': generateMajorScale('A5'),
  'Mi Maior': generateMajorScale('E5'),
  'Si / Dób Maior': generateMajorScale('B5'),
  'Solb / Fá# Maior': generateMajorScale('F#5'),
  'Réb / Dó# Maior': generateMajorScale('C#5'),
  'Láb Maior': generateMajorScale('G#5'),
  'Mib Maior': generateMajorScale('D#5'),
  'Sib Maior': generateMajorScale('A#5'),
  'Fá Maior': generateMajorScale('F5'),
  
  // Escalas Menores
  'Lá Menor': generateMinorScale('A5'),
  'Mi Menor': generateMinorScale('E5'),
  'Si Menor': generateMinorScale('B5'),
  'Fá# Menor': generateMinorScale('F#5'),
  'Dó# Menor': generateMinorScale('C#5'),
  'Láb / Sol# Menor': generateMinorScale('G#5'),
  'Mib / Ré# Menor': generateMinorScale('D#5'),
  'Sib / Lá# Menor': generateMinorScale('A#5'),
  'Fá Menor': generateMinorScale('F5'),
  'Dó Menor': generateMinorScale('C5'),
  'Sol Menor': generateMinorScale('G5'),
  'Ré Menor': generateMinorScale('D5'),
};

// Mapeamento padrão dos dedos (10 dedos para teclas QWERTYUIOP)
const defaultFingerMapping = {
  // Mão Esquerda (5 dedos: Q, W, E, R, T)
  'PolegarEsq': '',      // Q - Geralmente não usado
  'IndicadorEsq': 'C5',  // W 
  'MédioEsq': 'D5',      // E
  'AnelarEsq': 'E5',     // R
  'MindinhoEsq': 'F5',   // T
  
  // Mão Direita (5 dedos: Y, U, I, O, P)
  'PolegarDir': '',      // Y - Geralmente não usado
  'IndicadorDir': 'G5',  // U
  'MédioDir': 'A5',      // I
  'AnelarDir': 'B5',     // O
  'MindinhoDir': 'C6',   // P
};

// Mapeamento fixo dedo -> tecla do teclado
const fingerToKeyMapping = {
  // Mão Esquerda
  'PolegarEsq': 'Q',
  'IndicadorEsq': 'W', 
  'MédioEsq': 'E',
  'AnelarEsq': 'R',
  'MindinhoEsq': 'T',
  
  // Mão Direita
  'PolegarDir': 'Y',
  'IndicadorDir': 'U',
  'MédioDir': 'I',
  'AnelarDir': 'O',
  'MindinhoDir': 'P',
};

export const GloveProvider = ({ children }) => {
  // Estado para a escala selecionada
  const [selectedScale, setSelectedScale] = useState('Dó Maior');
  
  // Estado para o mapeamento personalizado dos dedos
  const [fingerMapping, setFingerMapping] = useState(() => {
    // Carrega do localStorage ou usa o padrão
    const saved = localStorage.getItem('gloveFingerMapping');
    return saved ? JSON.parse(saved) : defaultFingerMapping;
  });
  
  // Estado para o modo de configuração (preset ou personalizado)
  const [configMode, setConfigMode] = useState('preset'); // 'preset' ou 'custom'
  
  // Calcula as notas da escala atual
  const scaleNotes = scales[selectedScale] || [];
  
  // Função para aplicar uma escala preset
  const applyScalePreset = (scaleName) => {
    if (scaleName === 'Personalizado') {
      // Ativa modo personalizado sem alterar mapeamento atual
      setSelectedScale('Personalizado');
      setConfigMode('custom');
      
      // Salvar no localStorage
      localStorage.setItem('gloveSelectedScale', 'Personalizado');
      localStorage.setItem('gloveConfigMode', 'custom');
      return;
    }
    
    if (!scales[scaleName]) return;
    
    const notes = scales[scaleName].slice(0, 10); // Pegar apenas as 10 primeiras notas
    const newMapping = { ...defaultFingerMapping };
    
    // Mapear as notas para os dedos na ordem Q,W,E,R,T,Y,U,I,O,P
    const fingers = [
      'PolegarEsq', 'IndicadorEsq', 'MédioEsq', 'AnelarEsq', 'MindinhoEsq',
      'PolegarDir', 'IndicadorDir', 'MédioDir', 'AnelarDir', 'MindinhoDir'
    ];
    
    notes.forEach((note, index) => {
      if (fingers[index]) {
        newMapping[fingers[index]] = note;
      }
    });
    
    setFingerMapping(newMapping);
    setSelectedScale(scaleName);
    setConfigMode('preset');
    
    // Salvar no localStorage
    localStorage.setItem('gloveFingerMapping', JSON.stringify(newMapping));
    localStorage.setItem('gloveSelectedScale', scaleName);
    localStorage.setItem('gloveConfigMode', 'preset');
  };
  
  // Função para atualizar uma nota específica de um dedo (modo personalizado)
  const updateFingerNote = (fingerName, note) => {
    const newMapping = { ...fingerMapping, [fingerName]: note };
    setFingerMapping(newMapping);
    setConfigMode('custom');
    
    // Salvar no localStorage
    localStorage.setItem('gloveFingerMapping', JSON.stringify(newMapping));
    localStorage.setItem('gloveConfigMode', 'custom');
  };
  
  // Função para obter a tecla do teclado de um dedo
  const getFingerKey = (fingerName) => {
    return fingerToKeyMapping[fingerName] || '';
  };
  
  // Função para obter a nota de um dedo
  const getFingerNote = (fingerName) => {
    return fingerMapping[fingerName] || '';
  };
  
  // Função para obter o mapeamento tecla -> nota para o piano
  const getKeyToNoteMapping = () => {
    const mapping = {};
    Object.keys(fingerMapping).forEach(finger => {
      const key = getFingerKey(finger);
      const note = getFingerNote(finger);
      if (key && note) {
        mapping[key] = note;
      }
    });
    return mapping;
  };
  
  // Carregar configurações salvas ao inicializar
  useEffect(() => {
    const savedScale = localStorage.getItem('gloveSelectedScale');
    const savedMode = localStorage.getItem('gloveConfigMode');
    
    if (savedScale && scales[savedScale]) {
      setSelectedScale(savedScale);
    }
    if (savedMode) {
      setConfigMode(savedMode);
    }
  }, []);
  
  const contextValue = {
    // Estados
    selectedScale,
    scaleNotes,
    fingerMapping,
    configMode,
    
    // Escalas disponíveis
    orderedScales,
    scales,
    allNotes,
    
    // Funções
    applyScalePreset,
    updateFingerNote,
    getFingerKey,
    getFingerNote,
    getKeyToNoteMapping,
    
    // Mapeamentos
    fingerToKeyMapping,
    fingerKeys,
  };
  
  return (
    <GloveContext.Provider value={contextValue}>
      {children}
    </GloveContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useGlove = () => {
  const context = useContext(GloveContext);
  if (!context) {
    throw new Error('useGlove deve ser usado dentro de um GloveProvider');
  }
  return context;
};