import { shuffleItems, type PlayableQuestion } from "./question-bank";

type GeneratedMath = { prompt: string; answer: number; spread?: number };

function randomInt(minimum: number, maximum: number) {
  const span = maximum - minimum + 1;
  if (span <= 1) return minimum;
  const values = new Uint32Array(1);
  globalThis.crypto.getRandomValues(values);
  return minimum + ((values[0] ?? 0) % span);
}

const templates: Array<() => GeneratedMath> = [
  () => {
    const coefficient = randomInt(2, 9);
    const answer = randomInt(2, 16);
    const offset = randomInt(2, 18);
    return { prompt: `Solve for x: ${coefficient}x + ${offset} = ${coefficient * answer + offset}`, answer };
  },
  () => {
    const coefficient = randomInt(2, 8);
    const answer = randomInt(5, 20);
    const offset = randomInt(2, Math.min(12, answer - 1));
    return { prompt: `Solve for x: ${coefficient}x − ${offset} = ${coefficient * answer - offset}`, answer };
  },
  () => {
    const multiplier = randomInt(2, 7);
    const offset = randomInt(2, 10);
    const answer = randomInt(2, 14);
    return { prompt: `Solve for x: ${multiplier}(x + ${offset}) = ${multiplier * (answer + offset)}`, answer };
  },
  () => {
    const denominator = randomInt(2, 9);
    const quotient = randomInt(2, 12);
    return { prompt: `Solve for x: x ÷ ${denominator} = ${quotient}`, answer: denominator * quotient, spread: denominator };
  },
  () => {
    const base = randomInt(4, 18);
    const multiplier = randomInt(2, 8);
    const offset = randomInt(3, 20);
    return { prompt: `Evaluate: ${multiplier}(${base} + ${offset}) − ${multiplier * offset}`, answer: multiplier * base, spread: multiplier };
  },
  () => {
    const first = randomInt(8, 30);
    const difference = randomInt(2, 9);
    return { prompt: `The sequence is ${first}, ${first + difference}, ${first + difference * 2}, … What is the 8th term?`, answer: first + difference * 7, spread: difference };
  },
  () => {
    const percent = [10, 20, 25, 40, 50][randomInt(0, 4)];
    const unit = randomInt(3, 16) * 20;
    return { prompt: `What is ${percent}% of ${unit}?`, answer: percent * unit / 100, spread: Math.max(2, unit / 20) };
  },
  () => {
    const width = randomInt(5, 18);
    const length = randomInt(width + 2, width + 16);
    const perimeter = 2 * (length + width);
    return { prompt: `A rectangle has perimeter ${perimeter} cm and width ${width} cm. What is its length?`, answer: length, spread: 2 };
  },
];

function optionsFor(answer: number, spread = Math.max(2, Math.ceil(Math.abs(answer) * .08))) {
  const values = new Set<number>([answer]);
  const candidates = [answer + spread, answer - spread, answer + spread * 2, answer - spread * 2, answer + 1, answer - 1];
  for (const value of candidates) {
    if (values.size >= 4 || value < 0 || !Number.isFinite(value)) continue;
    values.add(value);
  }
  while (values.size < 4) values.add(answer + values.size * 3 + 1);
  return shuffleItems([...values].slice(0, 4).map((value) => ({ text: Number.isInteger(value) ? String(value) : value.toFixed(1), correct: value === answer })));
}

export function generateTowerQuestionDeck(count = 5, floor = 1): PlayableQuestion[] {
  const order = shuffleItems(templates);
  return Array.from({ length: count }, (_, index) => {
    const generated = order[index % order.length]();
    return {
      id: `tower-g7-f${floor}-${Date.now()}-${index}-${randomInt(1000, 9999)}`,
      prompt: generated.prompt,
      options: optionsFor(generated.answer, generated.spread),
    };
  });
}
