const handleKeyDown = (e, mappingsDir, mappingsEsq, noteToKey, setLastPlayed) => {
    const pressedKey = e.key.toUpperCase();
    // Verifica mão direita
    const fingerDir = Object.keys(mappingsDir).find(
        (f) => noteToKey[mappingsDir[f]] === pressedKey
    );
    // Verifica mão esquerda
    const fingerEsq = Object.keys(mappingsEsq).find(
        (f) => noteToKey[mappingsEsq[f]] === pressedKey
    );
    if (fingerDir) {
        setLastPlayed(`Dedo ${fingerDir}: Nota ${mappingsDir[fingerDir]}`);
    } else if (fingerEsq) {
        setLastPlayed(`Dedo ${fingerEsq}: Nota ${mappingsEsq[fingerEsq]}`);
    }
};

module.exports = handleKeyDown;

