import { QUESTION_BANK, STUDY_SUBJECTS, type PlayableQuestion, type QuestionBankSource, type StudyQuestion, type StudySubject } from "./question-bank";
import type { CustomQuestionBank, EducationLevel, LanguagePreference } from "./game-data";

export const GRADE_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
export const QUESTION_EPOCH_MS = 2 * 60 * 60 * 1000;

export type AdaptiveQuestion = PlayableQuestion & {
  grade: EducationLevel;
  subject: StudySubject;
  epoch: number;
  hint: string;
};

type Draft = { prompt: string; answer: string; distractors: string[]; hint: string };
type TemplateMode = "lab" | "tower";
type TemplateVariables = Record<string, string | number>;
type GeneratedTemplate = {
  vars: TemplateVariables;
  answer: string | number;
  distractors?: string[];
  hint: string;
  spread?: number;
  renderAnswer?: (value: number) => string;
};
type GeneratorContext = { grade: EducationLevel; floor: number; mode: TemplateMode };
type QuestionTemplate = {
  id: string;
  grades: readonly EducationLevel[];
  template: string;
  modes?: readonly TemplateMode[];
  weight?: number;
  generate: (next: () => number, context: GeneratorContext) => GeneratedTemplate;
};

type LocalizedQuestionTemplate = { template: string; hint: string; answers?: Record<string, string> };

const VI_QUESTION_COPY: Record<string, LocalizedQuestionTemplate> = {
  "math-fragment-addition": { template: "Astrea tìm thấy {a} Quantum Fragments rồi thu thập thêm {b}. Cô ấy có tất cả bao nhiêu mảnh?", hint: "Cộng số ban đầu với số mảnh vừa thu thập." },
  "math-safe-subtraction": { template: "Archives có {total} Shards. Orion đã dùng {spent}. Còn lại bao nhiêu Shards?", hint: "Lấy tổng ban đầu trừ đi lượng đã sử dụng." },
  "math-array-multiplication": { template: "Turing xếp {groups} hàng, mỗi hàng có {each} ký hiệu số. Có tất cả bao nhiêu ký hiệu?", hint: "Nhân số hàng với số ký hiệu trong mỗi hàng." },
  "math-reverse-division": { template: "Lada chia đều {total} Probability Tokens vào {groups} kho. Mỗi kho nhận bao nhiêu?", hint: "Chia tổng số Token cho số kho bằng nhau rồi kiểm tra bằng phép nhân." },
  "math-clean-percent": { template: "Focus Meter đang đầy {percent}% trên tổng {whole} đơn vị. Có bao nhiêu đơn vị đã được nạp?", hint: "Đổi phần trăm thành phân số hoặc số thập phân rồi nhân với tổng." },
  "math-reverse-linear": { template: "Giải mã dị thường không gian bằng cách tìm x: {a}x − {b} = {c}", hint: "Cộng số bị trừ vào hai vế, sau đó chia cả hai vế cho hệ số của x." },
  "math-vault-word-problem": { template: "{character} đã {verb} {total} {item}. Nếu chia đều vào {groups} kho dữ liệu, mỗi kho có bao nhiêu?", hint: "Chia tổng số vật phẩm cho số kho bằng nhau." },
  "math-arithmetic-sequence": { template: "Dãy số bắt đầu bằng {first}, {second}, {third}, … Số hạng thứ {position} là bao nhiêu?", hint: "Tìm công sai rồi dùng aₙ = a₁ + (n − 1)d." },
  "math-power-rule": { template: "Tính đạo hàm của f(x) = {coefficient}x^{power}.", hint: "Nhân hệ số với số mũ, sau đó giảm số mũ đi một." },
  "physics-push-pull": { template: "Orion làm một thùng hàng chuyển động bằng cách đẩy. Một tác động đẩy hoặc kéo được gọi là gì?", hint: "Đó là tác động có thể làm thay đổi chuyển động của vật.", answers: { Force: "Lực", Mass: "Khối lượng", Volume: "Thể tích", Circuit: "Mạch điện" } },
  "physics-clean-speed": { template: "Một trinh sát đi được {distance} mét trong {time} giây. Vận tốc của nó là bao nhiêu?", hint: "Vận tốc bằng quãng đường chia cho thời gian." },
  "physics-newton-force": { template: "Một Vanguard mech có khối lượng {m} kg và gia tốc {a} m/s². Lực đẩy bằng bao nhiêu?", hint: "Áp dụng định luật II Newton: F = ma." },
  "physics-work": { template: "Một lực không đổi {force} N đẩy vật đi {distance} m cùng hướng. Công thực hiện bằng bao nhiêu?", hint: "Khi lực cùng hướng chuyển động, công bằng lực nhân quãng đường." },
  "physics-electric-power": { template: "Một mạch điện hoạt động ở {voltage} V với dòng điện {current} A. Công suất bằng bao nhiêu?", hint: "Dùng công thức công suất điện P = VI." },
  "chemistry-states": { template: "Trạng thái vật chất nào giữ được hình dạng riêng?", hint: "Các hạt của nó giữ vị trí tương đối cố định thay vì chảy.", answers: { Solid: "Chất rắn", Liquid: "Chất lỏng", Gas: "Chất khí", Plasma: "Plasma" } },
  "chemistry-molecule-count": { template: "Mỗi phân tử nước chứa 3 nguyên tử. Có bao nhiêu nguyên tử trong {molecules} phân tử nước?", hint: "Nhân số phân tử với 3 nguyên tử trong mỗi phân tử." },
  "chemistry-atomic-number": { template: "Một nguyên tử {element} trung hòa có số hiệu nguyên tử {atomic}. Nó có bao nhiêu proton?", hint: "Số hiệu nguyên tử bằng số proton." },
  "chemistry-mass-concentration": { template: "Hòa tan {solute} g Quantum Salt tạo thành {solution} g dung dịch. Nồng độ phần trăm khối lượng C% bằng bao nhiêu?", hint: "Dùng C% = khối lượng chất tan ÷ khối lượng dung dịch × 100." },
  "chemistry-clean-moles": { template: "Một mẫu có khối lượng {mass} g và khối lượng mol {molar} g/mol. Mẫu có bao nhiêu mol?", hint: "Chia khối lượng mẫu cho khối lượng mol." },
  "biology-heart": { template: "Cơ quan nào bơm máu đi khắp cơ thể?", hint: "Bạn có thể cảm nhận cơ quan này đập trong lồng ngực.", answers: { Heart: "Tim", Lung: "Phổi", Stomach: "Dạ dày", Brain: "Não" } },
  "biology-limb-count": { template: "Archives quan sát {animals} côn trùng. Mỗi con có 6 chân. Có tất cả bao nhiêu chân?", hint: "Nhân số côn trùng với 6 chân mỗi con." },
  "biology-heartbeats": { template: "Tim của một sinh vật đập {rate} lần mỗi phút. Trong {minutes} phút, tim đập bao nhiêu lần?", hint: "Nhân nhịp tim mỗi phút với số phút." },
  "biology-cell-doubling": { template: "Một tế bào trải qua {rounds} vòng nguyên phân. Nếu mọi tế bào đều phân chia ở mỗi vòng, cuối cùng có bao nhiêu tế bào?", hint: "Bắt đầu từ một tế bào và nhân đôi sau mỗi vòng." },
  "biology-population-growth": { template: "Một quần thể bắt đầu với {start} cá thể và tăng {percent}%. Có thêm bao nhiêu cá thể?", hint: "Đổi phần trăm thành phân số hoặc số thập phân rồi nhân với số ban đầu." },
  "biology-dna-nucleotides": { template: "Một đoạn DNA mã hóa kỹ năng có Adenine (A) = {A} và Guanine (G) = {G}. Tổng số nucleotide N = 2A + 2G bằng bao nhiêu?", hint: "Vì A bắt cặp với T và G bắt cặp với C, hãy nhân đôi A và G trước khi cộng." },
};

function hash(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function generator(seed: string) {
  let state = hash(seed) || 1;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

function integer(next: () => number, minimum: number, maximum: number) {
  return minimum + Math.floor(next() * (maximum - minimum + 1));
}

function pick<T>(next: () => number, items: readonly T[]) {
  return items[integer(next, 0, items.length - 1)];
}

function gradeRange(minimum: number, maximum: number) {
  return GRADE_LEVELS.filter((grade) => grade >= minimum && grade <= maximum) as EducationLevel[];
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));
}

function interpolate(template: string, vars: TemplateVariables) {
  return template.replace(/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g, (_match, key: string) => String(vars[key] ?? `{${key}}`));
}

export function questionEpoch(now = Date.now()) {
  return Math.floor(now / QUESTION_EPOCH_MS);
}

function numericOptions(answer: number, next: () => number, spread = Math.max(1, Math.ceil(Math.abs(answer) * .12))) {
  const values = new Set<number>([answer]);
  const offsets = [spread, -spread, spread * 2, -spread * 2, 1, -1, 3, -3];
  for (const offset of offsets.sort(() => next() - .5)) {
    if (values.size === 4) break;
    const value = Number((answer + offset).toFixed(2));
    if (value >= 0 || answer < 0) values.add(value);
  }
  while (values.size < 4) values.add(Number((answer + integer(next, 2, 14)).toFixed(2)));
  return [...values];
}

function renderTemplate(entry: QuestionTemplate, next: () => number, context: GeneratorContext, language: LanguagePreference): Draft {
  const generated = entry.generate(next, context);
  const localized = language === "vi" ? VI_QUESTION_COPY[entry.id] : undefined;
  const prompt = interpolate(localized?.template ?? entry.template, generated.vars);
  const hint = localized?.hint ?? generated.hint;
  if (typeof generated.answer === "number") {
    const render = generated.renderAnswer ?? formatNumber;
    const answer = render(generated.answer);
    const distractors = generated.distractors ?? numericOptions(generated.answer, next, generated.spread).map(render).filter((option) => option !== answer);
    return { prompt, answer, distractors, hint };
  }
  const translateAnswer = (value: string) => localized?.answers?.[value] ?? value;
  return { prompt, answer: translateAnswer(generated.answer), distractors: (generated.distractors ?? []).map(translateAnswer), hint };
}

const TOWER_CHARACTERS = ["Astrea", "Turing", "Orion", "Lada"] as const;
const TOWER_ITEMS = ["Quantum Cores", "Logic Fragments", "Time Shards"] as const;
const TOWER_VERBS = ["synthesized", "extracted", "distributed"] as const;

/**
 * One data dictionary powers both the Infinite Question Lab and Endless Tower.
 * Each entry owns its curriculum range, language template and reverse generator,
 * so new question types do not need another grade-based if/else chain.
 */
export const PROCEDURAL_QUESTION_DICTIONARY: Record<StudySubject, readonly QuestionTemplate[]> = {
  Mathematics: [
    {
      id: "math-fragment-addition",
      grades: gradeRange(1, 3),
      template: "Astrea found {a} Quantum Fragments, then collected {b} more. How many fragments does she have in total?",
      generate: (next, { grade, floor }) => {
        const ceiling = 10 + grade * 10 + Math.min(20, floor);
        const a = integer(next, 1, ceiling);
        const b = integer(next, 1, ceiling);
        return { vars: { a, b }, answer: a + b, hint: `Start at ${a}, then count forward ${b} steps.` };
      },
    },
    {
      id: "math-safe-subtraction",
      grades: gradeRange(1, 4),
      template: "The Archive held {total} shards. Orion spent {spent}. How many shards remain?",
      generate: (next, { grade, floor }) => {
        const remaining = integer(next, 1, 10 + grade * 8 + Math.min(12, floor));
        const spent = integer(next, 1, 8 + grade * 4);
        return { vars: { total: remaining + spent, spent }, answer: remaining, hint: "Subtract the amount spent from the starting total." };
      },
    },
    {
      id: "math-array-multiplication",
      grades: gradeRange(3, 6),
      template: "Turing arranged {groups} rows of {each} number-runes. How many runes are there?",
      generate: (next, { grade }) => {
        const groups = integer(next, 2, Math.min(12, grade + 5));
        const each = integer(next, 2, 12);
        return { vars: { groups, each }, answer: groups * each, spread: groups, hint: `Add ${each} once for each of the ${groups} equal rows, or multiply ${groups} × ${each}.` };
      },
    },
    {
      id: "math-reverse-division",
      grades: gradeRange(4, 7),
      template: "Lada divides {total} Probability Tokens equally among {groups} vaults. How many enter each vault?",
      generate: (next, { grade, floor }) => {
        const groups = integer(next, 2, Math.min(12, grade + 3));
        const answer = integer(next, 2, 10 + Math.floor(floor / 8));
        return { vars: { total: groups * answer, groups }, answer, spread: 2, hint: `Divide the total by ${groups}; multiplication can verify the quotient.` };
      },
    },
    {
      id: "math-clean-percent",
      grades: gradeRange(5, 8),
      template: "A Focus Meter is {percent}% full out of {whole} units. How many units are charged?",
      generate: (next) => {
        const percent = pick(next, [10, 20, 25, 40, 50, 75] as const);
        const whole = integer(next, 2, 14) * 20;
        return { vars: { percent, whole }, answer: whole * percent / 100, spread: Math.max(2, whole / 20), hint: `Rewrite ${percent}% as ${percent / 100}, then multiply by ${whole}.` };
      },
    },
    {
      id: "math-reverse-linear",
      grades: gradeRange(7, 12),
      template: "Decode the spatial anomaly by finding x: {a}x − {b} = {c}",
      weight: 2,
      generate: (next, { grade, floor }) => {
        const x = integer(next, 2, 15 + Math.floor(floor / 3));
        const a = integer(next, 2, Math.min(12, 5 + Math.ceil(grade / 2)));
        const b = integer(next, 1, 20 + Math.floor(floor / 4));
        return { vars: { a, b, c: a * x - b }, answer: x, spread: Math.max(1, Math.floor(a / 2)), renderAnswer: (value) => `x = ${formatNumber(value)}`, hint: `Add ${b} to both sides, then divide every term by ${a}.` };
      },
    },
    {
      id: "math-vault-word-problem",
      grades: gradeRange(4, 12),
      template: "{character} {verb} {total} {item}. If divided equally among {groups} data vaults, how many does each vault hold?",
      modes: ["tower", "lab"],
      generate: (next, { grade, floor }) => {
        const groups = integer(next, 3, Math.min(12, 7 + Math.ceil(grade / 3)));
        const answer = integer(next, 5, 12 + Math.floor(floor / 8));
        return { vars: { character: pick(next, TOWER_CHARACTERS), verb: pick(next, TOWER_VERBS), total: groups * answer, item: pick(next, TOWER_ITEMS), groups }, answer, spread: Math.max(1, Math.floor(groups / 2)), hint: `Divide the total by the ${groups} equal vaults.` };
      },
    },
    {
      id: "math-arithmetic-sequence",
      grades: gradeRange(8, 12),
      template: "The sequence begins {first}, {second}, {third}, … What is term {position}?",
      generate: (next) => {
        const first = integer(next, 2, 14);
        const difference = integer(next, 2, 9);
        const position = integer(next, 6, 15);
        return { vars: { first, second: first + difference, third: first + difference * 2, position }, answer: first + (position - 1) * difference, spread: difference, hint: `Use aₙ = a₁ + (n − 1)d with d = ${difference}.` };
      },
    },
    {
      id: "math-power-rule",
      grades: gradeRange(12, 12),
      template: "Differentiate f(x) = {coefficient}x^{power}.",
      generate: (next) => {
        const power = integer(next, 2, 6);
        const coefficient = integer(next, 2, 9);
        const answerCoefficient = coefficient * power;
        return { vars: { coefficient, power }, answer: `${answerCoefficient}x^${power - 1}`, distractors: [`${coefficient}x^${power - 1}`, `${answerCoefficient}x^${power}`, `${power}x^${coefficient - 1}`], hint: "Multiply the coefficient by the exponent, then reduce the exponent by one." };
      },
    },
  ],
  Physics: [
    {
      id: "physics-push-pull",
      grades: gradeRange(1, 3),
      template: "Orion moves a crate by pushing it. A push or pull is called a…",
      generate: () => ({ vars: {}, answer: "Force", distractors: ["Mass", "Volume", "Circuit"], hint: "It is an action that can change an object's motion." }),
    },
    {
      id: "physics-clean-speed",
      grades: gradeRange(4, 7),
      template: "A scout travels {distance} meters in {time} seconds. What is its speed?",
      generate: (next) => {
        const speed = integer(next, 2, 18);
        const time = integer(next, 2, 12);
        return { vars: { distance: speed * time, time }, answer: speed, spread: 2, renderAnswer: (value) => `${formatNumber(value)} m/s`, hint: "Speed equals distance divided by time." };
      },
    },
    {
      id: "physics-newton-force",
      grades: gradeRange(6, 12),
      template: "A Vanguard mech with a mass of {m} kg accelerates at {a} m/s². What is its thrust force?",
      weight: 2,
      generate: (next) => {
        const m = integer(next, 10, 50);
        const a = integer(next, 2, 10);
        return { vars: { m, a }, answer: m * a, spread: m, renderAnswer: (value) => `${formatNumber(value)} N`, hint: "Apply Newton's second law F = ma." };
      },
    },
    {
      id: "physics-work",
      grades: gradeRange(7, 10),
      template: "A constant force of {force} N moves an artifact {distance} m in the same direction. How much work is done?",
      generate: (next) => {
        const force = integer(next, 4, 30);
        const distance = integer(next, 2, 16);
        return { vars: { force, distance }, answer: force * distance, spread: force, renderAnswer: (value) => `${formatNumber(value)} J`, hint: "For aligned force and motion, work equals force × distance." };
      },
    },
    {
      id: "physics-electric-power",
      grades: gradeRange(8, 12),
      template: "A circuit runs at {voltage} V with {current} A of current. What power does it use?",
      generate: (next) => {
        const voltage = integer(next, 3, 24);
        const current = integer(next, 2, 10);
        return { vars: { voltage, current }, answer: voltage * current, spread: voltage, renderAnswer: (value) => `${formatNumber(value)} W`, hint: "Use electric power P = VI." };
      },
    },
  ],
  Chemistry: [
    {
      id: "chemistry-states",
      grades: gradeRange(1, 3),
      template: "Which state of matter keeps its own shape?",
      generate: () => ({ vars: {}, answer: "Solid", distractors: ["Liquid", "Gas", "Plasma"], hint: "Its particles stay in fixed positions instead of flowing." }),
    },
    {
      id: "chemistry-molecule-count",
      grades: gradeRange(3, 6),
      template: "Each water molecule contains 3 atoms. How many atoms are in {molecules} water molecules?",
      generate: (next) => {
        const molecules = integer(next, 2, 16);
        return { vars: { molecules }, answer: molecules * 3, spread: 3, hint: "Multiply the number of molecules by 3 atoms per molecule." };
      },
    },
    {
      id: "chemistry-atomic-number",
      grades: gradeRange(4, 8),
      template: "A neutral {element} atom has atomic number {atomic}. How many protons does it have?",
      generate: (next) => {
        const element = pick(next, [{ name: "Hydrogen", atomic: 1 }, { name: "Carbon", atomic: 6 }, { name: "Oxygen", atomic: 8 }, { name: "Sodium", atomic: 11 }, { name: "Calcium", atomic: 20 }] as const);
        return { vars: { element: element.name, atomic: element.atomic }, answer: element.atomic, spread: 2, hint: "An element's atomic number equals its number of protons." };
      },
    },
    {
      id: "chemistry-mass-concentration",
      grades: gradeRange(8, 12),
      template: "Dissolving {solute} g of Quantum Salt yields {solution} g of solution. What is the mass percentage (C%)?",
      weight: 2,
      generate: (next) => {
        const solute = integer(next, 10, 50);
        const multiplier = pick(next, [2, 4, 5, 10] as const);
        return { vars: { solute, solution: solute * multiplier }, answer: 100 / multiplier, spread: 5, renderAnswer: (value) => `${formatNumber(value)}%`, hint: "Use C% = solute mass ÷ solution mass × 100." };
      },
    },
    {
      id: "chemistry-clean-moles",
      grades: gradeRange(9, 12),
      template: "A sample has mass {mass} g and molar mass {molar} g/mol. How many moles are present?",
      generate: (next) => {
        const moles = integer(next, 2, 8);
        const molar = pick(next, [2, 4, 12, 16, 18, 32, 40] as const);
        return { vars: { mass: moles * molar, molar }, answer: moles, spread: 1, renderAnswer: (value) => `${formatNumber(value)} mol`, hint: "Divide sample mass by molar mass." };
      },
    },
  ],
  Biology: [
    {
      id: "biology-heart",
      grades: gradeRange(1, 3),
      template: "Which organ pumps blood around the body?",
      generate: () => ({ vars: {}, answer: "Heart", distractors: ["Lung", "Stomach", "Brain"], hint: "You can feel this organ beating in your chest." }),
    },
    {
      id: "biology-limb-count",
      grades: gradeRange(1, 4),
      template: "The Archive observes {animals} insects. Each has 6 legs. How many legs are observed?",
      generate: (next) => {
        const animals = integer(next, 2, 12);
        return { vars: { animals }, answer: animals * 6, spread: 6, hint: "Multiply the number of insects by 6 legs each." };
      },
    },
    {
      id: "biology-heartbeats",
      grades: gradeRange(3, 7),
      template: "A creature's heart beats {rate} times each minute. How many beats occur in {minutes} minutes?",
      generate: (next) => {
        const rate = integer(next, 5, 16) * 5;
        const minutes = integer(next, 2, 8);
        return { vars: { rate, minutes }, answer: rate * minutes, spread: rate, hint: "Multiply beats per minute by the number of minutes." };
      },
    },
    {
      id: "biology-cell-doubling",
      grades: gradeRange(4, 8),
      template: "One cell completes {rounds} rounds of mitosis. If every cell divides each round, how many cells result?",
      generate: (next) => {
        const rounds = integer(next, 2, 6);
        return { vars: { rounds }, answer: 2 ** rounds, spread: 2, hint: `Start with one cell and double the total ${rounds} times.` };
      },
    },
    {
      id: "biology-population-growth",
      grades: gradeRange(6, 10),
      template: "A colony starts with {start} organisms and grows by {percent}%. How many organisms are added?",
      generate: (next) => {
        const percent = pick(next, [10, 20, 25, 50] as const);
        const start = integer(next, 2, 15) * 20;
        return { vars: { start, percent }, answer: start * percent / 100, spread: Math.max(2, start / 20), hint: `Convert ${percent}% to a fraction or decimal, then multiply by ${start}.` };
      },
    },
    {
      id: "biology-dna-nucleotides",
      grades: gradeRange(9, 12),
      template: "A skill-encoding DNA segment has Adenine (A) = {A} and Guanine (G) = {G}. What is the total number of nucleotides (N = 2A + 2G)?",
      weight: 2,
      generate: (next) => {
        const A = integer(next, 100, 500);
        const G = integer(next, 100, 500);
        return { vars: { A, G }, answer: 2 * A + 2 * G, spread: 2 * Math.max(10, Math.round((A + G) / 20)), hint: "Because A pairs with T and G pairs with C, double A and G before adding." };
      },
    },
  ],
};

function chooseTemplate(subject: StudySubject, grade: EducationLevel, mode: TemplateMode, next: () => number) {
  const available = PROCEDURAL_QUESTION_DICTIONARY[subject].filter((entry) => entry.grades.includes(grade) && (!entry.modes || entry.modes.includes(mode)));
  if (!available.length) throw new Error(`No ${subject} templates are available for Grade ${grade}.`);
  const totalWeight = available.reduce((sum, entry) => sum + (entry.weight ?? 1), 0);
  let roll = next() * totalWeight;
  for (const entry of available) {
    roll -= entry.weight ?? 1;
    if (roll <= 0) return entry;
  }
  return available.at(-1)!;
}

function seededShuffle<T>(items: T[], next: () => number) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(next() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

function packageQuestion(draft: Draft, details: { id: string; grade: EducationLevel; subject: StudySubject; epoch: number }, next: () => number): AdaptiveQuestion {
  const choices = seededShuffle([...new Set([draft.answer, ...draft.distractors])].slice(0, 4), next);
  while (choices.length < 4) choices.push(`Not ${choices.length + 1}`);
  return { ...details, prompt: draft.prompt, options: choices.map((text) => ({ text, correct: text === draft.answer })), hint: draft.hint };
}

export function generateOneQuestion(subject: StudySubject, grade: EducationLevel, seenIds: readonly string[] = [], epoch = questionEpoch(), language: LanguagePreference = "en"): AdaptiveQuestion {
  const seen = new Set(seenIds);
  for (let attempt = 0; attempt < 320; attempt += 1) {
    const next = generator(`${epoch}:lab:${language}:${grade}:${subject}:${attempt}`);
    const entry = chooseTemplate(subject, grade, "lab", next);
    const draft = renderTemplate(entry, next, { grade, floor: 1, mode: "lab" }, language);
    const fingerprint = hash(`${language}:${grade}:${subject}:${entry.id}:${draft.prompt}`).toString(36);
    const id = `adaptive-${epoch}-${grade}-${subject.toLowerCase()}-${fingerprint}`;
    if (seen.has(id)) continue;
    return packageQuestion(draft, { id, grade, subject, epoch }, next);
  }
  throw new Error("The current two-hour question pool is exhausted. Change subject or grade while the Archive refreshes.");
}

export function generateTowerMathQuestion(grade: EducationLevel, floor: number, seenIds: readonly string[] = [], epoch = questionEpoch(), salt = 0, language: LanguagePreference = "en"): AdaptiveQuestion {
  const seen = new Set(seenIds);
  const level = Math.max(1, Math.min(9999, Math.floor(floor)));
  for (let attempt = 0; attempt < 400; attempt += 1) {
    const next = generator(`${epoch}:tower:${language}:${grade}:${level}:${salt + attempt}`);
    const entry = chooseTemplate("Mathematics", grade, "tower", next);
    const draft = renderTemplate(entry, next, { grade, floor: level, mode: "tower" }, language);
    const fingerprint = hash(`${language}:${grade}:tower:${level}:${entry.id}:${draft.prompt}`).toString(36);
    const id = `tower-${epoch}-${grade}-${level}-${fingerprint}`;
    if (seen.has(id)) continue;
    return packageQuestion(draft, { id, grade, subject: "Mathematics", epoch }, next);
  }
  throw new Error("Unable to produce a unique Tower question in the current rotation.");
}

export function defaultBankForLevel(level: EducationLevel): QuestionBankSource {
  void level;
  return QUESTION_BANK;
}

// Compatibility export for old embedded routes. New gameplay requests one question at a time.
export function generateGradeDecks(level: EducationLevel): CustomQuestionBank {
  return Object.fromEntries(STUDY_SUBJECTS.map((subject) => {
    const seen: string[] = [];
    const questions: StudyQuestion[] = Array.from({ length: 8 }, () => {
      const item = generateOneQuestion(subject, level, seen);
      seen.push(item.id);
      const correctAnswer = item.options.find((option) => option.correct)?.text ?? item.options[0].text;
      return { id: item.id, prompt: item.prompt, correctAnswer, options: item.options.map((option) => option.text) as [string, string, string, string] };
    });
    return [subject, questions];
  })) as CustomQuestionBank;
}

export function questionHint(question: ({ prompt: string; options: Array<{ text: string; correct: boolean }>; hint?: string } | undefined), subject: StudySubject, grade: EducationLevel, language?: LanguagePreference) {
  language = language ?? (/[À-ỹ]/u.test(question?.prompt ?? "") ? "vi" : "en");
  if (!question) return language === "vi" ? "Hãy chọn môn và bắt đầu phiên để mình có thể xem câu hỏi đang hoạt động." : "Choose a subject and start a session so I can inspect the active question.";
  if (question.hint) return language === "vi" ? `Bước 1: xác định câu hỏi cần tìm gì. Bước 2: ${question.hint} Bước 3: kiểm tra lập luận với các lựa chọn. Mình sẽ không tiết lộ đáp án.` : `Step 1: identify what the question is asking. Step 2: ${question.hint} Step 3: test your reasoning against the answer choices. I will not reveal the final answer.`;
  const base = subject === "Mathematics"
    ? "Identify the unknown, choose the matching operation, then work in reverse and check by substitution."
    : subject === "Chemistry"
      ? "Classify the question as particles, properties, bonding, or change; recall that category's rule; then eliminate mismatched processes."
      : subject === "Physics"
        ? "List the known quantities and units, select the law connecting them, then check the direction and unit of every option."
        : "Identify the biological level, connect structure to function, then reject choices from a different system or process.";
  if (language === "vi") {
    const localizedBase = subject === "Mathematics" ? "Xác định ẩn số, chọn phép tính phù hợp, làm ngược và kiểm tra bằng cách thay lại." : subject === "Chemistry" ? "Phân loại câu hỏi theo hạt, tính chất, liên kết hoặc biến đổi; nhớ quy tắc rồi loại phương án sai cơ chế." : subject === "Physics" ? "Liệt kê đại lượng và đơn vị đã biết, chọn định luật nối chúng, rồi kiểm tra hướng và đơn vị." : "Xác định cấp tổ chức sinh học, nối cấu trúc với chức năng rồi loại lựa chọn thuộc hệ khác.";
    return `Gợi ý Grade ${grade}: ${localizedBase} Mình sẽ hướng dẫn logic nhưng không nêu đáp án đúng.`;
  }
  return `Grade ${grade} hint: ${base} I will guide the logic without naming the correct option.`;
}

export function tutorReply(message: string, subject: StudySubject, grade: EducationLevel, activeQuestion?: { prompt: string; options: Array<{ text: string; correct: boolean }>; hint?: string }, language: LanguagePreference = "en") {
  const text = message.trim().toLowerCase();
  if (!text) return language === "vi" ? "Hãy hỏi về câu hiện tại, yêu cầu gợi ý hoặc khám phá một khái niệm." : "Ask about the active question, request a hint, or explore a subject concept.";
  if (text.includes("hint") || text.includes("stuck") || text.includes("help") || text.includes("gợi ý") || text.includes("giúp")) return questionHint(activeQuestion, subject, grade, language);
  if (text.includes("generate") || text.includes("new question") || text.includes("câu mới")) return language === "vi" ? `Mình tạo đúng một câu ${subject} Grade ${grade} duy nhất mỗi lần. Hãy hoàn thành hoặc bỏ qua câu hiện tại để nhận câu tiếp theo từ pool hai giờ.` : `I generate exactly one unique Grade ${grade} ${subject} question at a time. Finish or skip the active prompt and I will create the next one from the current two-hour pool.`;
  const vocabulary = grade <= 4 ? "Use a short rule and one clear example." : grade <= 8 ? "Name the rule, show the important step, and check the result." : "State the governing model, justify each transformation, and test boundary conditions.";
  if (language === "vi") return grade <= 4 ? `Với ${subject} Grade ${grade}: dùng một quy tắc ngắn và một ví dụ rõ ràng. Nếu bạn hỏi về câu hiện tại, hãy yêu cầu gợi ý theo từng bước.` : grade <= 8 ? `Với ${subject} Grade ${grade}: gọi tên quy tắc, trình bày bước quan trọng và kiểm tra kết quả. Mình không đưa đáp án trực tiếp.` : `Với ${subject} Grade ${grade}: nêu mô hình chi phối, giải thích từng phép biến đổi và kiểm tra điều kiện biên. Mình sẽ hướng dẫn mà không tiết lộ đáp án.`;
  return `For Grade ${grade} ${subject}: ${vocabulary} If you mean the active prompt, ask for a contextual hint and I will guide the steps without exposing its answer.`;
}
