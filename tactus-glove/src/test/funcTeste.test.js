const handleKeyDown = require('../funcTeste');

let setLastPlayed;

const mappingsDir = {
  1: 'C5',
};

const mappingsEsq = {
  1: 'F5',
};

const noteToKey = {
  C5: 'Q',
};

beforeEach(() => {
  setLastPlayed = jest.fn();
});


test('Tecla pressionada deve retornar dedo e nota correspondente', function(){
    const event = { key: 'Q' };

    handleKeyDown(event, mappingsDir, mappingsEsq, noteToKey, setLastPlayed);

  expect(setLastPlayed).toHaveBeenCalledWith('Dedo 1: Nota C5');
});