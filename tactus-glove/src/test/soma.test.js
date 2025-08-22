const soma = require('../soma')

test('Soma 1 + 2 o resultado tem se qser 3', function(){
    expect(soma(1, 2)).toBe(3);
});