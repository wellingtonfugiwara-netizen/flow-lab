import { EMPTY, parseProgress, withResult } from '../progress';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe('parseProgress', () => {
  it('lê o que foi gravado', () => {
    expect(parseProgress('{"5-1":7,"5-2":9}')).toEqual({ '5-1': 7, '5-2': 9 });
  });

  it('devolve vazio sem nada gravado', () => {
    expect(parseProgress(null)).toEqual(EMPTY);
    expect(parseProgress('')).toEqual(EMPTY);
  });

  it('não quebra com dado corrompido', () => {
    expect(parseProgress('{isto não é json')).toEqual(EMPTY);
    expect(parseProgress('[1,2,3]')).toEqual(EMPTY);
    expect(parseProgress('"texto"')).toEqual(EMPTY);
  });

  it('descarta entrada que não é número válido', () => {
    expect(parseProgress('{"5-1":"sete","5-2":-1,"5-3":null,"6-1":4}')).toEqual({ '6-1': 4 });
  });
});

describe('withResult', () => {
  it('grava nível novo', () => {
    expect(withResult(EMPTY, '5-1', 8)).toEqual({ '5-1': 8 });
  });

  it('guarda só o melhor resultado', () => {
    const antes = { '5-1': 8 };
    expect(withResult(antes, '5-1', 6)).toEqual({ '5-1': 6 });
    expect(withResult(antes, '5-1', 9)).toBe(antes);
    expect(withResult(antes, '5-1', 8)).toBe(antes);
  });

  it('não altera o objeto anterior', () => {
    const antes = { '5-1': 8 };
    withResult(antes, '5-2', 5);
    expect(antes).toEqual({ '5-1': 8 });
  });
});
