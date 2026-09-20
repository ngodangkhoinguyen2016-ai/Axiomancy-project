export const STUDY_SUBJECTS = ["Mathematics", "Chemistry", "Physics", "Biology"] as const;

export type StudySubject = (typeof STUDY_SUBJECTS)[number];

export type StudyQuestion = {
  id: string;
  prompt: string;
  options: readonly [string, string, string, string];
  correctAnswer: string;
};

export type PlayableQuestion = Omit<StudyQuestion, "options" | "correctAnswer"> & {
  options: Array<{ text: string; correct: boolean }>;
};

export type QuestionBankSource = Record<StudySubject, readonly StudyQuestion[]>;

function question(
  id: string,
  prompt: string,
  correctAnswer: string,
  options: readonly [string, string, string, string],
): StudyQuestion {
  return { id, prompt, options, correctAnswer };
}

export const QUESTION_BANK: Record<StudySubject, readonly StudyQuestion[]> = {
  Mathematics: [
    question("math-01", "What is 15 + 12?", "27", ["25", "27", "29", "30"]),
    question("math-02", "What is 45 - 18?", "27", ["25", "26", "27", "28"]),
    question("math-03", "What is 8 x 7?", "56", ["54", "56", "58", "64"]),
    question("math-04", "What is 64 / 8?", "8", ["6", "7", "8", "9"]),
    question("math-05", "What is the decimal form of 1/2?", "0.5", ["0.2", "0.5", "0.25", "1.2"]),
    question("math-06", "What is 3 squared?", "9", ["6", "9", "12", "27"]),
    question("math-07", "What is the square root of 81?", "9", ["7", "8", "9", "10"]),
    question("math-08", "What is the area of a rectangle with sides 4 and 5?", "20", ["9", "18", "20", "45"]),
    question("math-09", "What is the perimeter of a square with a side length of 5?", "20", ["10", "15", "20", "25"]),
    question("math-10", "What is 10% of 200?", "20", ["10", "20", "30", "40"]),
    question("math-11", "Solve for x: x + 5 = 15", "10", ["5", "10", "15", "20"]),
    question("math-12", "What is 9 x 9?", "81", ["72", "81", "90", "99"]),
    question("math-13", "What is 100 / 4?", "25", ["20", "25", "30", "40"]),
    question("math-14", "What is 1/4 as a percentage?", "25%", ["14%", "20%", "25%", "40%"]),
    question("math-15", "What is 2 cubed (2^3)?", "8", ["4", "6", "8", "16"]),
    question("math-16", "What is the square root of 100?", "10", ["10", "20", "50", "100"]),
    question("math-17", "What is the area of a triangle with base 10 and height 4?", "20", ["14", "20", "40", "80"]),
    question("math-18", "What is 25% of 100?", "25", ["15", "20", "25", "30"]),
    question("math-19", "Solve for x: 2x = 10", "5", ["2", "5", "10", "20"]),
    question("math-20", "What is 15 x 3?", "45", ["30", "45", "50", "60"]),
    question("math-21", "What is 50 - 27?", "23", ["23", "25", "27", "33"]),
    question("math-22", "What is 12 x 12?", "144", ["124", "144", "164", "244"]),
    question("math-23", "What is 144 / 12?", "12", ["10", "12", "14", "16"]),
    question("math-24", "What is the decimal form of 3/4?", "0.75", ["0.34", "0.50", "0.75", "0.80"]),
    question("math-25", "What is 4 squared?", "16", ["8", "12", "16", "24"]),
  ],
  Chemistry: [
    question("chem-01", "What is the chemical symbol for Oxygen?", "O", ["Ox", "O", "Om", "On"]),
    question("chem-02", "What is the chemical symbol for Hydrogen?", "H", ["H", "Hy", "Ho", "Hd"]),
    question("chem-03", "What is the chemical formula for water?", "H2O", ["HO", "H2O", "H2O2", "HO2"]),
    question("chem-04", "Which gas is essential for human respiration?", "Oxygen", ["Nitrogen", "Helium", "Oxygen", "Carbon Dioxide"]),
    question("chem-05", "What state of matter is ice?", "Solid", ["Liquid", "Solid", "Gas", "Plasma"]),
    question("chem-06", "What state of matter is steam?", "Gas", ["Liquid", "Solid", "Gas", "Plasma"]),
    question("chem-07", "What is the center of an atom called?", "Nucleus", ["Core", "Nucleus", "Center", "Hub"]),
    question("chem-08", "Which particle has a positive charge?", "Proton", ["Electron", "Neutron", "Proton", "Photon"]),
    question("chem-09", "Which particle has a negative charge?", "Electron", ["Electron", "Neutron", "Proton", "Photon"]),
    question("chem-10", "Which particle has no charge (neutral)?", "Neutron", ["Electron", "Neutron", "Proton", "Photon"]),
    question("chem-11", "What is the formula for Carbon Dioxide?", "CO2", ["CO", "C2O", "CO2", "C2O2"]),
    question("chem-12", "What is the chemical symbol for Gold?", "Au", ["Go", "Gd", "Au", "Ag"]),
    question("chem-13", "What is the chemical symbol for Iron?", "Fe", ["Ir", "I", "Fe", "In"]),
    question("chem-14", "How do acids generally taste?", "Sour", ["Sweet", "Salty", "Bitter", "Sour"]),
    question("chem-15", "How do bases generally taste?", "Bitter", ["Sweet", "Salty", "Bitter", "Sour"]),
    question("chem-16", "What is the pH of pure water?", "7", ["0", "5", "7", "14"]),
    question("chem-17", "What is the most abundant gas in Earth's atmosphere?", "Nitrogen", ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"]),
    question("chem-18", "What is the process of a solid turning into a liquid called?", "Melting", ["Freezing", "Melting", "Condensation", "Evaporation"]),
    question("chem-19", "What is the process of a liquid turning into a gas called?", "Evaporation", ["Freezing", "Melting", "Condensation", "Evaporation"]),
    question("chem-20", "What is the chemical symbol for Sodium?", "Na", ["So", "Sd", "Na", "Nu"]),
    question("chem-21", "What is the chemical symbol for Chlorine?", "Cl", ["Ch", "Cl", "Cr", "Co"]),
    question("chem-22", "What is the formula for table salt?", "NaCl", ["NaCl", "KCl", "H2O", "CO2"]),
    question("chem-23", "What state of matter has a definite shape and volume?", "Solid", ["Solid", "Liquid", "Gas", "Plasma"]),
    question("chem-24", "What state of matter has a definite volume but no definite shape?", "Liquid", ["Solid", "Liquid", "Gas", "Plasma"]),
    question("chem-25", "What is the lightest element on the periodic table?", "Hydrogen", ["Oxygen", "Helium", "Hydrogen", "Carbon"]),
  ],
  Physics: [
    question("physics-01", "What force pulls objects toward the center of the Earth?", "Gravity", ["Magnetism", "Friction", "Gravity", "Tension"]),
    question("physics-02", "What is the standard unit of force?", "Newton", ["Joule", "Watt", "Newton", "Volt"]),
    question("physics-03", "What is the standard unit of energy?", "Joule", ["Joule", "Watt", "Newton", "Volt"]),
    question("physics-04", "What is the formula for speed?", "Distance / Time", ["Distance / Time", "Time / Distance", "Distance x Time", "Force x Mass"]),
    question("physics-05", "What is the opposite of a push?", "Pull", ["Shove", "Pull", "Throw", "Drop"]),
    question("physics-06", "What is the energy of a moving object called?", "Kinetic Energy", ["Potential Energy", "Kinetic Energy", "Thermal Energy", "Solar Energy"]),
    question("physics-07", "What is stored energy called?", "Potential Energy", ["Potential Energy", "Kinetic Energy", "Thermal Energy", "Solar Energy"]),
    question("physics-08", "Through which medium does sound travel fastest?", "Solid", ["Gas", "Liquid", "Solid", "Vacuum"]),
    question("physics-09", "Through which medium does light travel fastest?", "Vacuum", ["Gas", "Liquid", "Solid", "Vacuum"]),
    question("physics-10", "What tool is used to measure temperature?", "Thermometer", ["Barometer", "Thermometer", "Ruler", "Scale"]),
    question("physics-11", "What is the standard unit of electrical current?", "Ampere", ["Volt", "Watt", "Ampere", "Ohm"]),
    question("physics-12", "What type of object naturally attracts iron?", "Magnet", ["Magnet", "Plastic", "Glass", "Wood"]),
    question("physics-13", "What force resists motion when two surfaces rub together?", "Friction", ["Gravity", "Magnetism", "Friction", "Tension"]),
    question("physics-14", "What is the standard unit of power?", "Watt", ["Joule", "Watt", "Newton", "Volt"]),
    question("physics-15", "A push or a pull acting on an object is called a:", "Force", ["Mass", "Weight", "Force", "Energy"]),
    question("physics-16", "What is the boiling point of water in Celsius?", "100", ["0", "50", "100", "212"]),
    question("physics-17", "What is the freezing point of water in Celsius?", "0", ["0", "32", "50", "100"]),
    question("physics-18", "What is the primary source of Earth's energy?", "The Sun", ["The Moon", "The Core", "The Sun", "Wind"]),
    question("physics-19", "What type of charge do electrons have?", "Negative", ["Positive", "Negative", "Neutral", "Variable"]),
    question("physics-20", "What do like magnetic poles do?", "Repel", ["Attract", "Repel", "Destroy each other", "Nothing"]),
    question("physics-21", "What do opposite magnetic poles do?", "Attract", ["Attract", "Repel", "Destroy each other", "Nothing"]),
    question("physics-22", "Which color of light has the longest wavelength?", "Red", ["Violet", "Blue", "Green", "Red"]),
    question("physics-23", "Which color of light has the shortest wavelength?", "Violet", ["Violet", "Blue", "Green", "Red"]),
    question("physics-24", "What is the measure of the pull of gravity on an object?", "Weight", ["Mass", "Weight", "Volume", "Density"]),
    question("physics-25", "What material is a good conductor of electricity?", "Copper", ["Wood", "Plastic", "Copper", "Rubber"]),
  ],
  Biology: [
    question("biology-01", "What is known as the powerhouse of the cell?", "Mitochondria", ["Nucleus", "Ribosome", "Mitochondria", "Cell Wall"]),
    question("biology-02", "What process do plants use to make food?", "Photosynthesis", ["Respiration", "Photosynthesis", "Digestion", "Fermentation"]),
    question("biology-03", "What is the green pigment found in plants called?", "Chlorophyll", ["Melanin", "Chlorophyll", "Carotene", "Hemoglobin"]),
    question("biology-04", "Which human organ is responsible for pumping blood?", "Heart", ["Brain", "Lungs", "Heart", "Liver"]),
    question("biology-05", "Which human organ is primarily responsible for breathing?", "Lungs", ["Brain", "Lungs", "Heart", "Liver"]),
    question("biology-06", "What is the center of the human nervous system?", "Brain", ["Heart", "Brain", "Spine", "Stomach"]),
    question("biology-07", "Approximately how many bones are in the adult human body?", "206", ["106", "206", "306", "406"]),
    question("biology-08", "Animals that eat only plants are called:", "Herbivores", ["Carnivores", "Omnivores", "Herbivores", "Insectivores"]),
    question("biology-09", "Animals that eat only meat are called:", "Carnivores", ["Carnivores", "Omnivores", "Herbivores", "Insectivores"]),
    question("biology-10", "Animals that eat both plants and meat are called:", "Omnivores", ["Carnivores", "Omnivores", "Herbivores", "Insectivores"]),
    question("biology-11", "What is the basic building block of all living things?", "Cell", ["Tissue", "Organ", "Cell", "Atom"]),
    question("biology-12", "What molecule carries genetic instructions?", "DNA", ["RNA", "DNA", "ATP", "Protein"]),
    question("biology-13", "What is the process of a caterpillar turning into a butterfly called?", "Metamorphosis", ["Photosynthesis", "Metamorphosis", "Respiration", "Digestion"]),
    question("biology-14", "What are the smallest blood vessels in the human body?", "Capillaries", ["Arteries", "Veins", "Capillaries", "Aortas"]),
    question("biology-15", "What is the top layer of human skin called?", "Epidermis", ["Dermis", "Epidermis", "Hypodermis", "Follicle"]),
    question("biology-16", "What gas do plants primarily take in during photosynthesis?", "Carbon Dioxide", ["Oxygen", "Nitrogen", "Carbon Dioxide", "Helium"]),
    question("biology-17", "What gas do plants primarily release during photosynthesis?", "Oxygen", ["Oxygen", "Nitrogen", "Carbon Dioxide", "Helium"]),
    question("biology-18", "How many chambers does the human heart have?", "4", ["2", "3", "4", "5"]),
    question("biology-19", "What is the largest organ of the human body?", "Skin", ["Heart", "Brain", "Skin", "Liver"]),
    question("biology-20", "Which organ filters waste from the blood to produce urine?", "Kidneys", ["Liver", "Kidneys", "Stomach", "Lungs"]),
    question("biology-21", "What part of the plant absorbs water and nutrients from the soil?", "Roots", ["Leaves", "Stem", "Roots", "Flower"]),
    question("biology-22", "What part of the plant supports the leaves and flowers?", "Stem", ["Roots", "Stem", "Petal", "Seed"]),
    question("biology-23", "What type of animal is a frog?", "Amphibian", ["Reptile", "Mammal", "Amphibian", "Bird"]),
    question("biology-24", "What type of animal is a snake?", "Reptile", ["Reptile", "Mammal", "Amphibian", "Bird"]),
    question("biology-25", "What is the control center of an animal cell?", "Nucleus", ["Cytoplasm", "Cell Membrane", "Nucleus", "Vacuole"]),
  ],
};

function secureRandomIndex(maxExclusive: number) {
  if (maxExclusive <= 1) return 0;
  const cryptoSource = globalThis.crypto;
  if (!cryptoSource?.getRandomValues) return Math.floor(Math.random() * maxExclusive);

  const range = 0x1_0000_0000;
  const limit = range - (range % maxExclusive);
  const value = new Uint32Array(1);
  do cryptoSource.getRandomValues(value); while (value[0] >= limit);
  return value[0] % maxExclusive;
}

export function shuffleItems<T>(items: readonly T[]): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = secureRandomIndex(index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export function createQuestionDeck(subject: StudySubject, source: QuestionBankSource = QUESTION_BANK): PlayableQuestion[] {
  const selected = source[subject]?.length ? source[subject] : QUESTION_BANK[subject];
  return shuffleItems(selected).map(({ id, prompt, options, correctAnswer }) => ({
    id,
    prompt,
    options: shuffleItems(options.map((text) => ({ text, correct: text === correctAnswer }))),
  }));
}
