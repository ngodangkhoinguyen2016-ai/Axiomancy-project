import type { StudyQuestion, StudySubject } from "./question-bank";

export const RARITIES = ["Common", "Uncommon", "Rare", "Epic", "Legendary", "Mythic"] as const;
export type Rarity = (typeof RARITIES)[number];
export const CARD_SUBJECTS = ["Mathematics", "Chemistry", "Physics", "Biology"] as const;
export type Subject = (typeof CARD_SUBJECTS)[number];
export type CardKind = "number" | "operator" | "ability";
export type DeckTier = "Base" | "Tactical" | "Breakthrough";
export type CardSpecial = "euler" | "infinity" | "radium" | "absolute-zero" | "newton" | "schrodinger" | "helix" | "mitochondria";

export type GameCard = {
  id: string;
  name: string;
  symbol: string;
  subject: Subject;
  rarity: Rarity;
  tier: DeckTier;
  kind: CardKind;
  cost: number;
  ability: string;
  effect: "bonus" | "shield" | "heal" | "draw" | "energy" | "weaken" | "burst" | "special";
  power: number;
  special?: CardSpecial;
  exclusive?: boolean;
  eventOnly?: boolean;
};

export const CARD_POOL: GameCard[] = [
  { id: "zero-keeper", name: "Zero Keeper", symbol: "0", subject: "Mathematics", rarity: "Common", tier: "Base", kind: "number", cost: 0, ability: "Neutral Origin: gain 5 Shield when an equation resolves to 0.", effect: "shield", power: 5 },
  { id: "unit-initiate", name: "Unit Initiate", symbol: "1", subject: "Mathematics", rarity: "Common", tier: "Base", kind: "number", cost: 0, ability: "Identity Law: add 2 damage without changing the proof.", effect: "bonus", power: 2 },
  { id: "twin-squire", name: "Twin Squire", symbol: "2", subject: "Mathematics", rarity: "Common", tier: "Base", kind: "number", cost: 0, ability: "Pair Bond: +2 damage in a complete equation.", effect: "bonus", power: 2 },
  { id: "triad-scholar", name: "Triad Scholar", symbol: "3", subject: "Mathematics", rarity: "Common", tier: "Base", kind: "number", cost: 0, ability: "Third Insight: gain 3 Shield after resolving.", effect: "shield", power: 3 },
  { id: "quadro-sentinel", name: "Quadro Sentinel", symbol: "4", subject: "Mathematics", rarity: "Common", tier: "Base", kind: "number", cost: 0, ability: "Stable Frame: gain 4 Shield after resolving.", effect: "shield", power: 4 },
  { id: "pentagon-guard", name: "Pentagon Guard", symbol: "5", subject: "Mathematics", rarity: "Common", tier: "Base", kind: "number", cost: 0, ability: "Fivefold Guard: +5 damage when the result is divisible by 5.", effect: "bonus", power: 5 },
  { id: "six-sage", name: "Sixfold Sage", symbol: "6", subject: "Mathematics", rarity: "Common", tier: "Base", kind: "number", cost: 0, ability: "Perfect Number: +4 damage and 2 Shield.", effect: "bonus", power: 4 },
  { id: "seven-seer", name: "Seven Seer", symbol: "7", subject: "Mathematics", rarity: "Uncommon", tier: "Base", kind: "number", cost: 0, ability: "Lucky Prime: restore 4 HP after a valid equation.", effect: "heal", power: 4 },
  { id: "octave-bulwark", name: "Octave Bulwark", symbol: "8", subject: "Mathematics", rarity: "Uncommon", tier: "Base", kind: "number", cost: 0, ability: "Cubic Frame: gain 7 Shield after resolving.", effect: "shield", power: 7 },
  { id: "nine-oracle", name: "Nine Oracle", symbol: "9", subject: "Mathematics", rarity: "Uncommon", tier: "Base", kind: "number", cost: 0, ability: "Square Insight: +6 equation damage.", effect: "bonus", power: 6 },
  { id: "hydrogen-spark", name: "Hydrogen Spark", symbol: "H", subject: "Chemistry", rarity: "Common", tier: "Base", kind: "ability", cost: 1, ability: "Lightest Element: restore 7 HP.", effect: "heal", power: 7 },
  { id: "oxygen-aegis", name: "Oxygen Aegis", symbol: "O", subject: "Chemistry", rarity: "Uncommon", tier: "Base", kind: "ability", cost: 1, ability: "Oxidizing Guard: gain 10 Shield.", effect: "shield", power: 10 },
  { id: "mass-standard", name: "Mass Standard", symbol: "m", subject: "Physics", rarity: "Common", tier: "Base", kind: "ability", cost: 1, ability: "Inertial Mass: gain 8 Shield.", effect: "shield", power: 8 },
  { id: "velocity-standard", name: "Velocity Standard", symbol: "v", subject: "Physics", rarity: "Uncommon", tier: "Base", kind: "ability", cost: 1, ability: "Velocity Boost: deal 9 damage.", effect: "burst", power: 9 },
  { id: "temperature-standard", name: "Temperature Standard", symbol: "K", subject: "Physics", rarity: "Uncommon", tier: "Base", kind: "ability", cost: 1, ability: "Kelvin Control: weaken the next attack by 5.", effect: "weaken", power: 5 },

  { id: "pulse-measure", name: "Pulse Measure", symbol: "72", subject: "Biology", rarity: "Common", tier: "Base", kind: "number", cost: 0, ability: "Vital Rhythm: restore 3 HP after resolving.", effect: "heal", power: 3 },
  { id: "chromosome-count", name: "Chromosome Count", symbol: "46", subject: "Biology", rarity: "Uncommon", tier: "Base", kind: "number", cost: 0, ability: "Paired Code: +5 equation damage.", effect: "bonus", power: 5 },
  { id: "carbon-frame", name: "Carbon Frame", symbol: "C", subject: "Chemistry", rarity: "Common", tier: "Base", kind: "ability", cost: 1, ability: "Organic Backbone: gain 7 Shield.", effect: "shield", power: 7 },
  { id: "charge-standard", name: "Charge Standard", symbol: "q", subject: "Physics", rarity: "Common", tier: "Base", kind: "ability", cost: 1, ability: "Elementary Charge: deal 8 damage.", effect: "burst", power: 8 },

  { id: "union-adept", name: "Union Adept", symbol: "+", subject: "Mathematics", rarity: "Rare", tier: "Tactical", kind: "operator", cost: 0, ability: "United Front: restore 3 HP when addition resolves.", effect: "heal", power: 3 },
  { id: "difference-ranger", name: "Difference Ranger", symbol: "−", subject: "Mathematics", rarity: "Rare", tier: "Tactical", kind: "operator", cost: 0, ability: "Decisive Difference: subtraction gains +12 damage.", effect: "bonus", power: 12 },
  { id: "cross-blade", name: "Cross-Blade", symbol: "×", subject: "Mathematics", rarity: "Epic", tier: "Tactical", kind: "operator", cost: 0, ability: "Crosscut: multiplication gains +6 damage.", effect: "bonus", power: 6 },
  { id: "division-monk", name: "Division Monk", symbol: "÷", subject: "Mathematics", rarity: "Epic", tier: "Tactical", kind: "operator", cost: 0, ability: "Exact Quotient: triple the quotient, add 10 damage, and return 1 AP.", effect: "energy", power: 1 },
  { id: "axiom-ward", name: "Axiom Ward", symbol: "◇", subject: "Physics", rarity: "Rare", tier: "Tactical", kind: "ability", cost: 1, ability: "Perfect Barrier: gain 18 Shield.", effect: "shield", power: 18 },
  { id: "renewal-theorem", name: "Renewal Theorem", symbol: "♥", subject: "Biology", rarity: "Rare", tier: "Tactical", kind: "ability", cost: 1, ability: "Revised Proof: restore 12 HP.", effect: "heal", power: 12 },
  { id: "vanguard-paladin", name: "Vanguard Paladin", symbol: "V", subject: "Physics", rarity: "Rare", tier: "Tactical", kind: "ability", cost: 2, ability: "Opening Thesis: deal 14 damage and gain 8 Shield.", effect: "burst", power: 14 },
  { id: "kinetic-reserve", name: "Kinetic Reserve", symbol: "Δp", subject: "Physics", rarity: "Epic", tier: "Tactical", kind: "ability", cost: 1, ability: "Stored Momentum: deal 10 damage and restore 1 AP.", effect: "energy", power: 10 },
  { id: "barrier-matrix", name: "Barrier Matrix", symbol: "▦", subject: "Chemistry", rarity: "Epic", tier: "Tactical", kind: "ability", cost: 2, ability: "Ionic Lattice: gain 26 survival Shield.", effect: "shield", power: 26 },
  { id: "atp-surge", name: "ATP Surge", symbol: "ATP", subject: "Biology", rarity: "Epic", tier: "Tactical", kind: "ability", cost: 1, ability: "Cellular Energy: restore 2 AP.", effect: "energy", power: 0 },
  { id: "catalyst-spark", name: "Catalyst Spark", symbol: "Ea", subject: "Chemistry", rarity: "Rare", tier: "Tactical", kind: "ability", cost: 1, ability: "Lower Activation: restore 1 AP and deal 7 damage.", effect: "energy", power: 7 },
  { id: "regeneration-ward", name: "Regeneration Ward", symbol: "↟", subject: "Biology", rarity: "Rare", tier: "Tactical", kind: "ability", cost: 1, ability: "Tissue Repair: restore 10 HP and gain 6 Shield.", effect: "heal", power: 10 },

  { id: "golden-ratio", name: "The Golden Ratio", symbol: "φ", subject: "Mathematics", rarity: "Legendary", tier: "Breakthrough", kind: "ability", cost: 2, ability: "Divine Proportion: gain 22 Shield and restore 8 HP.", effect: "shield", power: 22 },
  { id: "fibonacci-convergence", name: "Fibonacci Convergence", symbol: "1,1,2", subject: "Mathematics", rarity: "Legendary", tier: "Breakthrough", kind: "ability", cost: 2, ability: "Recursive Growth: deal 29 damage and restore 1 AP.", effect: "energy", power: 29 },
  { id: "eulers-identity", name: "Euler's Identity", symbol: "eⁱπ+1", subject: "Mathematics", rarity: "Mythic", tier: "Breakthrough", kind: "ability", cost: 3, ability: "Imaginary Truth: true damage pierces every Boss shield.", effect: "special", power: 48, special: "euler" },
  { id: "infinity-loop", name: "The Infinity Loop", symbol: "∞", subject: "Mathematics", rarity: "Legendary", tier: "Breakthrough", kind: "ability", cost: 2, ability: "Recursive Proof: instantly doubles your most recent combo damage.", effect: "special", power: 24, special: "infinity" },
  { id: "avogadro-vanguard", name: "Avogadro Vanguard", symbol: "Nₐ", subject: "Chemistry", rarity: "Legendary", tier: "Breakthrough", kind: "ability", cost: 2, ability: "Molecular Legion: deal 32 damage.", effect: "burst", power: 32 },
  { id: "periodic-architect", name: "Periodic Architect", symbol: "118", subject: "Chemistry", rarity: "Legendary", tier: "Breakthrough", kind: "ability", cost: 2, ability: "Elemental Order: gain 30 Shield.", effect: "shield", power: 30 },
  { id: "catalyst-sovereign", name: "Catalyst Sovereign", symbol: "Ea↓", subject: "Chemistry", rarity: "Legendary", tier: "Breakthrough", kind: "ability", cost: 2, ability: "Activation Collapse: deal 24 damage and restore 1 AP.", effect: "energy", power: 24 },
  { id: "covalent-covenant", name: "Covalent Covenant", symbol: "H₂O", subject: "Chemistry", rarity: "Legendary", tier: "Breakthrough", kind: "ability", cost: 2, ability: "Shared Electrons: restore 24 HP.", effect: "heal", power: 24 },
  { id: "radium-queen", name: "The Radium Queen", symbol: "Ra", subject: "Chemistry", rarity: "Mythic", tier: "Breakthrough", kind: "ability", cost: 3, ability: "Radiant Decay: drains 5% of the Boss's max HP every turn.", effect: "special", power: 5, special: "radium" },
  { id: "absolute-zero", name: "Absolute Zero", symbol: "0 K", subject: "Chemistry", rarity: "Legendary", tier: "Breakthrough", kind: "ability", cost: 2, ability: "Thermal Lock: freezes the Boss and its deck for 2 turns.", effect: "special", power: 2, special: "absolute-zero" },
  { id: "relativity-engine", name: "Relativity Engine", symbol: "E=mc²", subject: "Physics", rarity: "Legendary", tier: "Breakthrough", kind: "ability", cost: 2, ability: "Mass-Energy Release: deal 34 damage.", effect: "burst", power: 34 },
  { id: "maxwell-field", name: "Maxwell's Field", symbol: "∇×B", subject: "Physics", rarity: "Legendary", tier: "Breakthrough", kind: "ability", cost: 2, ability: "Electromagnetic Ward: gain 31 Shield.", effect: "shield", power: 31 },
  { id: "photon-lance", name: "Photon Lance", symbol: "hν", subject: "Physics", rarity: "Legendary", tier: "Breakthrough", kind: "ability", cost: 2, ability: "Quantized Light: deal 26 damage and restore 1 AP.", effect: "energy", power: 26 },
  { id: "quantum-tunneler", name: "Quantum Tunneler", symbol: "Ψ→", subject: "Physics", rarity: "Legendary", tier: "Breakthrough", kind: "ability", cost: 2, ability: "Barrier Passage: deal 28 damage and weaken the next attack.", effect: "weaken", power: 28 },
  { id: "newtons-gravity", name: "Newton's Gravity", symbol: "F=G", subject: "Physics", rarity: "Mythic", tier: "Breakthrough", kind: "ability", cost: 3, ability: "Equalized Orbit: lowers Boss HP to your current HP, never raising it.", effect: "special", power: 0, special: "newton" },
  { id: "schrodingers-cat", name: "Schrödinger's Cat", symbol: "ψ🐈", subject: "Physics", rarity: "Legendary", tier: "Breakthrough", kind: "ability", cost: 2, ability: "Quantum Survival: the next fatal blow is dodged or reflected with equal odds.", effect: "special", power: 0, special: "schrodinger" },
  { id: "darwin-adaptation", name: "Darwin's Adaptation", symbol: "ΔDNA", subject: "Biology", rarity: "Legendary", tier: "Breakthrough", kind: "ability", cost: 2, ability: "Survival Selection: restore 26 HP.", effect: "heal", power: 26 },
  { id: "mendel-codex", name: "Mendel's Codex", symbol: "Aa", subject: "Biology", rarity: "Legendary", tier: "Breakthrough", kind: "ability", cost: 2, ability: "Dominant Defense: gain 29 Shield.", effect: "shield", power: 29 },
  { id: "synapse-storm", name: "Synapse Storm", symbol: "⚡N", subject: "Biology", rarity: "Legendary", tier: "Breakthrough", kind: "ability", cost: 2, ability: "Neural Cascade: deal 31 damage.", effect: "burst", power: 31 },
  { id: "homeostasis-protocol", name: "Homeostasis Protocol", symbol: "±37°", subject: "Biology", rarity: "Legendary", tier: "Breakthrough", kind: "ability", cost: 2, ability: "Dynamic Balance: deal 22 damage and restore 1 AP.", effect: "energy", power: 22 },
  { id: "helix-weaver", name: "The Helix Weaver", symbol: "DNA", subject: "Biology", rarity: "Mythic", tier: "Breakthrough", kind: "ability", cost: 3, ability: "Genetic Recall: revive once with 50% HP after knockout.", effect: "special", power: 50, special: "helix" },
  { id: "mitochondria-core", name: "Mitochondria Core", symbol: "ATP+", subject: "Biology", rarity: "Legendary", tier: "Breakthrough", kind: "ability", cost: 2, ability: "Energy Mutation: restore 1 AP without exceeding the three-AP combat limit.", effect: "special", power: 1, special: "mitochondria" },
  { id: "euclid-prime", name: "Euclid Prime", symbol: "∵", subject: "Mathematics", rarity: "Legendary", tier: "Breakthrough", kind: "ability", cost: 3, ability: "Infinite Primes: deal 36 piercing damage.", effect: "burst", power: 36 },
  { id: "turing-oracle", name: "Turing Oracle", symbol: "T", subject: "Mathematics", rarity: "Legendary", tier: "Breakthrough", kind: "ability", cost: 2, ability: "Halting Answer: deal 25 damage and weaken the next attack.", effect: "weaken", power: 25 },
  { id: "axiom-dragon", name: "Axiom Dragon", symbol: "Σ∞", subject: "Mathematics", rarity: "Mythic", tier: "Breakthrough", kind: "ability", cost: 3, ability: "Ultimate Formula: deal 55 damage and gain 20 Shield.", effect: "burst", power: 55 },
  { id: "newtons-apple", name: "Newton's Apple", symbol: "🍎", subject: "Physics", rarity: "Legendary", tier: "Breakthrough", kind: "ability", cost: 2, ability: "Falling Insight: deal 30 damage and weaken the next enemy force by 6.", effect: "weaken", power: 30, exclusive: true },
  { id: "midnight-abacus", name: "Midnight Abacus", symbol: "☾Σ", subject: "Mathematics", rarity: "Epic", tier: "Tactical", kind: "ability", cost: 1, ability: "Event Formula: gain 12 Shield and refund 1 AP if played on an even turn.", effect: "energy", power: 12, eventOnly: true },
  { id: "aurora-catalyst", name: "Aurora Catalyst", symbol: "Au⁺", subject: "Chemistry", rarity: "Legendary", tier: "Breakthrough", kind: "ability", cost: 2, ability: "Flash Reaction: deal 27 damage and seed a luminous barrier.", effect: "burst", power: 27, eventOnly: true },
  { id: "five-minute-photon", name: "Five-Minute Photon", symbol: "5hν", subject: "Physics", rarity: "Epic", tier: "Tactical", kind: "ability", cost: 1, ability: "Brief Window: deal 16 piercing damage during a Flash Event.", effect: "burst", power: 16, eventOnly: true },
  { id: "hourglass-helix", name: "Hourglass Helix", symbol: "DNA⌛", subject: "Biology", rarity: "Legendary", tier: "Breakthrough", kind: "ability", cost: 2, ability: "Timed Adaptation: restore 20 HP and gain 10 Shield.", effect: "heal", power: 20, eventOnly: true },
  { id: "chronicle-zero", name: "Chronicle Zero", symbol: "0:05", subject: "Mathematics", rarity: "Mythic", tier: "Breakthrough", kind: "ability", cost: 3, ability: "Hourly Axiom: freeze the enemy, then double the next complete equation.", effect: "special", power: 2, special: "absolute-zero", eventOnly: true },
  { id: "archive-firefly", name: "Archive Firefly", symbol: "✦", subject: "Biology", rarity: "Rare", tier: "Base", kind: "ability", cost: 1, ability: "Event Spark: restore 8 HP and illuminate one future draw.", effect: "heal", power: 8, eventOnly: true },
];

export const CARD_BY_ID = Object.fromEntries(CARD_POOL.map((card) => [card.id, card])) as Record<string, GameCard>;

export function effectiveCardCost(card: GameCard) {
  if (card.kind !== "ability") return 0;
  if (Number.isFinite(card.cost) && card.cost > 0) return card.cost;
  return card.tier === "Breakthrough" || card.rarity === "Mythic" ? 3 : 1;
}
export const BASE_DECK_IDS = ["zero-keeper", "unit-initiate", "twin-squire", "triad-scholar", "quadro-sentinel", "pentagon-guard", "six-sage", "seven-seer", "octave-bulwark", "nine-oracle", "hydrogen-spark", "oxygen-aegis", "mass-standard", "velocity-standard", "temperature-standard"];
export const TACTICAL_DECK_IDS = ["union-adept", "difference-ranger", "cross-blade", "division-monk", "axiom-ward", "renewal-theorem", "vanguard-paladin", "kinetic-reserve", "barrier-matrix"];
export const STARTER_BREAKTHROUGH_IDS = ["euclid-prime", "golden-ratio", "avogadro-vanguard", "periodic-architect", "relativity-engine", "darwin-adaptation"];
export const DECK_SIZE = 16;
export const MIN_BASE_CARDS = 8;
export const STARTER_DECK = [
  "zero-keeper", "unit-initiate", "twin-squire", "triad-scholar", "quadro-sentinel", "pentagon-guard", "six-sage", "seven-seer", "octave-bulwark", "nine-oracle",
  "union-adept", "difference-ranger", "cross-blade", "division-monk", "axiom-ward", "golden-ratio",
];
export const STARTER_BREAKTHROUGH_ID = "euclid-prime";
export const BREAKTHROUGH_CAPACITY = 6;
export const SUMMON_RATES: Record<Rarity, number> = { Common: 50, Uncommon: 27, Rare: 13, Epic: 7, Legendary: 2.5, Mythic: 0.5 };
export const MAX_CARD_LEVEL = 5;
export const FRAGMENT_UPGRADE_COSTS = [0, 2, 4, 7, 11] as const;

export function fragmentCostForLevel(level: number) {
  return FRAGMENT_UPGRADE_COSTS[Math.min(FRAGMENT_UPGRADE_COSTS.length - 1, Math.max(1, level))] ?? 11;
}

export function cardLevelBonus(level: number) {
  return Math.max(0, level - 1) * .08;
}

export const RARITY_DECK_LIMIT: Record<Rarity, number> = { Common: 3, Uncommon: 3, Rare: 3, Epic: 2, Legendary: 1, Mythic: 1 };

export function validateDeck(deckIds: string[]) {
  const errors: string[] = [];
  if (deckIds.length !== DECK_SIZE) errors.push(`Deck must contain exactly ${DECK_SIZE} cards.`);
  const baseCount = deckIds.filter((id) => CARD_BY_ID[id]?.tier === "Base").length;
  if (baseCount < MIN_BASE_CARDS) errors.push(`At least ${MIN_BASE_CARDS} cards must be Base cards.`);
  const operatorCount = deckIds.filter((id) => CARD_BY_ID[id]?.tier === "Tactical" && CARD_BY_ID[id]?.kind === "operator").length;
  const supportCount = deckIds.filter((id) => CARD_BY_ID[id]?.tier === "Tactical" && CARD_BY_ID[id]?.kind !== "operator").length;
  const breakthroughCount = deckIds.filter((id) => CARD_BY_ID[id]?.tier === "Breakthrough").length;
  if (operatorCount < 1) errors.push("At least one Tactical mathematical operator is required.");
  if (supportCount < 1) errors.push("At least one non-operator Tactical card is required.");
  if (breakthroughCount < 1) errors.push("At least one Breakthrough card is required.");
  const counts = deckIds.reduce<Record<string, number>>((result, id) => ({ ...result, [id]: (result[id] ?? 0) + 1 }), {});
  for (const [id, count] of Object.entries(counts)) {
    const card = CARD_BY_ID[id];
    if (!card) errors.push(`Unknown card: ${id}.`);
    else if (count > RARITY_DECK_LIMIT[card.rarity]) errors.push(`${card.name} exceeds the ${RARITY_DECK_LIMIT[card.rarity]}× ${card.rarity} limit.`);
  }
  return { valid: errors.length === 0, errors, baseCount };
}

export function buildCombatDeck(player: Pick<PlayerState, "deckIds">) {
  const deck = validateDeck(player.deckIds).valid ? player.deckIds : STARTER_DECK;
  return deck.map((id) => CARD_BY_ID[id]).filter(Boolean).map((card) => ({ ...card, cost: effectiveCardCost(card) }));
}

export type CombatDrawState = { hand: GameCard[]; queue: GameCard[] };

export function restoreCombatHandRatio(currentHand: GameCard[], currentQueue: GameCard[]): CombatDrawState {
  const pool = [...currentHand, ...currentQueue];
  const selected = new Set<number>();
  const hand: GameCard[] = [];
  const take = (count: number, predicate: (card: GameCard) => boolean) => {
    for (let index = 0; index < pool.length && count > 0; index += 1) {
      if (selected.has(index) || !predicate(pool[index])) continue;
      selected.add(index); hand.push(pool[index]); count -= 1;
    }
  };
  take(2, (card) => card.tier === "Base");
  take(1, (card) => card.tier === "Tactical" && card.kind === "operator");
  take(1, (card) => card.tier === "Tactical" && card.kind !== "operator");
  take(1, (card) => card.tier === "Breakthrough");
  take(5 - hand.length, () => true);
  return { hand: hand.slice(0, 5), queue: pool.filter((_, index) => !selected.has(index)) };
}

export function cycleCombatCards(hand: GameCard[], queue: GameCard[], used: GameCard[]): CombatDrawState {
  const remaining = [...hand];
  const discarded: GameCard[] = [];
  for (const card of used) {
    const index = remaining.indexOf(card);
    if (index >= 0) discarded.push(...remaining.splice(index, 1));
  }
  return restoreCombatHandRatio(remaining, [...queue, ...discarded]);
}

export function endTurnRedraw(hand: GameCard[], queue: GameCard[]): CombatDrawState {
  const shuffledIndexes = hand.map((_, index) => index).sort(() => Math.random() - .5).slice(0, Math.min(2, hand.length));
  const discarded = shuffledIndexes.sort((a, b) => b - a).map((index) => hand[index]);
  return cycleCombatCards(hand, queue, discarded);
}

export type TowerModifier = { id: string; name: string; symbol: string; description: string };
export const TOWER_MODIFIERS: TowerModifier[] = [
  { id: "gravity-inversion", name: "Gravity Inversion", symbol: "±", description: "+ cards calculate as subtraction on this floor." },
  { id: "time-dilation", name: "Time Dilation", symbol: "⌛", description: "Maximum AP is reduced from 3 to 2." },
  { id: "entropy-tax", name: "Entropy Tax", symbol: "Δ", description: "Ability cards cost 1 additional AP." },
  { id: "recursive-pressure", name: "Recursive Pressure", symbol: "↻", description: "Enemy attack grows by 2 after every turn." },
  { id: "prime-lock", name: "Prime Lock", symbol: "P", description: "Non-prime equation results deal 25% less damage." },
];

export type Stage = {
  id: string;
  chapter: number;
  order: number;
  title: string;
  subtitle: string;
  lore: string;
  kind: "battle" | "elite" | "boss" | "special" | "tower" | "event";
  optional?: boolean;
  prerequisite?: string;
  hp: number;
  damage: number;
  xp: number;
  coins: number;
  gems: number;
  bossStyle?: "fraction" | "algebra" | "geometry" | "fallacy" | "probability" | "chemistry" | "physics" | "biology" | "memory" | "axiom" | "tower";
  towerFloor?: number;
  modifiers?: TowerModifier[];
};

export type Chapter = { id: number; title: string; subtitle: string; lore: string; accent: string; stages: Stage[] };

const chapterBlueprints = [
  {
    title: "Foundations of Aletheia", subtitle: "Learn the laws that hold the Archives together.", accent: "#55d9ff",
    lore: "Beneath the Grand Citadel, the first axioms are being erased. Astrea leads you into the oldest stacks to recover the premises on which Aletheia was built.",
    names: ["The First Premise", "Mirror Proof", "Broken Sum", "Paradox Engine", "Library After Dark", "The Fraction Crown"],
    loreLines: ["A single glowing numeral waits where the first theorem was written.", "A mirrored archive repeats every answer—except the truthful one.", "Addition sigils fracture and rain from the ceiling.", "A brass engine manufactures contradictions faster than they can be disproved.", "When the lamps fade, forgotten footnotes begin to hunt.", "The Crown divides every certainty into smaller and smaller doubts."],
    bossStyle: "fraction" as const,
  },
  {
    title: "The Algebraic Wilds", subtitle: "Variables grow restless beyond the Citadel walls.", accent: "#9e7cff",
    lore: "Beyond the walls, variables have escaped their equations and formed a kingdom of unknowns. Restore balance before X claims every possible value.",
    names: ["Unknown Wanderer", "Garden of X", "Linear Ambush", "Factor Colossus", "Negative Grove", "Sovereign Equation"],
    loreLines: ["A hooded variable changes value whenever you look away.", "Roots shaped like X drink meaning from abandoned formulae.", "Linear hunters strike from both sides of the coordinate path.", "The Colossus can only be broken by revealing its common factors.", "Below zero, signs reverse and familiar rules feel hostile.", "The Sovereign has declared that only one solution may exist: obedience."],
    bossStyle: "algebra" as const,
  },
  {
    title: "Geometry of Stars", subtitle: "Trace defensive constellations across a fractured sky.", accent: "#ffbd68",
    lore: "The celestial diagrams protecting Aletheia have slipped out of alignment. Reconnect their points before the sky folds into an impossible shape.",
    names: ["Point of Origin", "Impossible Triangle", "Parallel Passage", "Polyhedron Warden", "Golden Chamber", "The Euclidean Eye"],
    loreLines: ["Every route begins at a point no wider than thought.", "Three edges close around a space that should not exist.", "Two roads promise never to meet, yet both lead to the same gate.", "A many-faced guardian rotates between offense and defense.", "A chamber resonates in the ratio shared by shells and stars.", "The Eye measures every angle—and judges every imperfection."],
    bossStyle: "geometry" as const,
  },
  {
    title: "The Infinite Archive", subtitle: "Face recursion, probability, and the Great Fallacy.", accent: "#ff6ca8",
    lore: "At the edge of the catalogue, pages repeat without end. The Great Fallacy is rewriting memory itself, and Astrea's oldest theorem may be the final key.",
    names: ["Binary Threshold", "Turing's Riddle", "Recursive Hall", "Quantum Librarian", "Astrea's Memory", "The Great Fallacy"],
    loreLines: ["A gate opens only for answers expressed in two states.", "A machine asks whether your proof will ever finish.", "Each corridor contains a smaller copy of itself.", "The Librarian occupies every shelf until observed.", "A sealed page contains the theorem Astrea chose to forget.", "The final anomaly insists that truth is only a matter of repetition."],
    bossStyle: "fallacy" as const,
  },
  {
    title: "The Probability Bazaar", subtitle: "When every choice has a price, uncertainty becomes a weapon.", accent: "#df8cff",
    lore: "Lada reveals a market where futures are traded like coins. The Great Fallacy has rigged its scales, teaching frightened Scholars to confuse luck with destiny.",
    names: ["Loaded Coin", "Conditional Alley", "Expected Value", "Variance Warden", "The Unlikely Door", "The Gambler's Proof"],
    loreLines: ["A coin lands on its edge and refuses certainty.", "Every path depends on the one taken before it.", "A merchant prices tomorrow by averaging its possible shapes.", "The Warden grows stronger whenever outcomes spread apart.", "A nearly impossible door opens for those who still test it.", "The Gambler claims probability excuses every choice; your proof must restore responsibility."],
    bossStyle: "probability" as const,
  },
  {
    title: "The Alchemical Divide", subtitle: "Repair bonds broken by fear and careless reaction.", accent: "#75e7b3",
    lore: "A district built on collaboration is separating into hostile elements. Its reactions mirror a city that has forgotten how differences can form stronger bonds.",
    names: ["Atomic Census", "Valence Bridge", "Acid Rain", "Catalyst Golem", "Equilibrium Garden", "The Bondbreaker"],
    loreLines: ["Every citizen is counted by the protons they carry.", "Electrons cross a bridge that demands trust from both shores.", "Old arguments fall from the clouds and corrode new ideas.", "A patient catalyst accelerates conflict without being consumed.", "Forward and reverse changes learn to coexist.", "The Bondbreaker insists isolation is stability; the chapter asks you to prove otherwise."],
    bossStyle: "chemistry" as const,
  },
  {
    title: "Momentum's Frontier", subtitle: "Give force a direction before it becomes destruction.", accent: "#6db8ff",
    lore: "Orion's former training ground has become a battlefield of uncontrolled motion. Here, strength without reflection repeats harm faster each time.",
    names: ["Vector Crossing", "Friction March", "Circuit of Doubt", "Resonance Knight", "The Quiet Vacuum", "Titan of Momentum"],
    loreLines: ["Arrows disagree until their components are understood.", "Progress slows, revealing the surfaces that resist it.", "A current returns only when every broken path reconnects.", "A single repeated frequency threatens to shake the frontier apart.", "In silence, motion continues without an audience.", "The Titan mistakes speed for purpose; Orion asks you to redirect it."],
    bossStyle: "physics" as const,
  },
  {
    title: "The Living Theorem", subtitle: "Adapt without surrendering the pattern that makes you yourself.", accent: "#70dda8",
    lore: "A forest of self-editing organisms is erasing traits it calls imperfect. The Helix Weaver teaches that survival is not sameness, but responsive variation held in balance.",
    names: ["Cellular Gate", "Osmotic River", "Inheritance Path", "Selection Beast", "Homeostasis Grove", "The Perfect Clone"],
    loreLines: ["A membrane decides what may enter without closing itself to change.", "Water crosses toward balance one molecule at a time.", "Traits travel forward carrying both gifts and burdens.", "The Beast rewards only one shape and weakens the whole forest.", "Many systems adjust together to preserve a living range.", "The Clone offers freedom from uncertainty at the cost of every future adaptation."],
    bossStyle: "biology" as const,
  },
  {
    title: "The Mnemonic Sea", subtitle: "Separate the memory that guides you from the story that traps you.", accent: "#86a1ff",
    lore: "Aletheia's lost memories have pooled into a sea where regrets repeat as facts. Astrea must confront the theorem she erased—and why she believed forgetting would protect everyone.",
    names: ["Echo Shore", "False Recall", "Pattern Current", "Mnemonic Leviathan", "Astrea's Letter", "The Kindly Lie"],
    loreLines: ["Old voices return, changed slightly by every retelling.", "Confidence makes an invented detail feel true.", "Recognizing a pattern helps until the pattern is imposed on everything.", "The Leviathan feeds on memories never re-examined.", "Astrea reads the apology she wrote to a future version of herself.", "The Kindly Lie offers comfort without growth; truth must prove it can also be compassionate."],
    bossStyle: "memory" as const,
  },
  {
    title: "The Last Axiom", subtitle: "Choose which truths deserve to become foundations.", accent: "#f5c96a",
    lore: "At the Citadel's summit, the Great Fallacy reveals itself not as ignorance, but as the wish for one rule that ends every difficult question. Your final task is to defend uncertainty without abandoning truth.",
    names: ["Premise of Fear", "Contradiction Court", "Proof Without Witness", "Theorem Eater", "The Open Question", "The Great Fallacy Rewritten"],
    loreLines: ["A hidden assumption turns fear into an unquestioned law.", "Two incompatible claims demand that you reject people instead of premises.", "A proof survives even when applause does not.", "The Eater consumes every theorem presented as beyond revision.", "One unanswered question remains bright rather than empty.", "The final Fallacy can only be defeated by a truth strong enough to be examined again."],
    bossStyle: "axiom" as const,
  },
];

export const CHAPTERS: Chapter[] = chapterBlueprints.map((blueprint, chapterIndex) => {
  const id = chapterIndex + 1;
  const base = chapterIndex * 22;
  const ids = blueprint.names.map((_, index) => `c${id}-s${index + 1}`);
  return {
    id, title: blueprint.title, subtitle: blueprint.subtitle, lore: blueprint.lore, accent: blueprint.accent,
    stages: blueprint.names.map((name, index) => ({
      id: ids[index], chapter: id, order: index + 1, title: name, lore: blueprint.loreLines[index],
      subtitle: index === 1 || index === 4 ? "Optional research anomaly" : index === 5 ? "Chapter apex" : "Core theorem",
      kind: index === 5 ? "boss" : index === 1 || index === 4 ? "special" : index === 3 ? "elite" : "battle",
      optional: index === 1 || index === 4,
      prerequisite: index === 0 ? undefined : index === 1 ? ids[0] : index === 2 ? ids[0] : index === 3 ? ids[2] : index === 4 ? ids[2] : ids[3],
      hp: 48 + base + index * 14, damage: 8 + id * 2 + index,
      xp: index === 5 ? 240 : index === 3 ? 190 : index === 1 || index === 4 ? 130 : 160,
      coins: index === 5 ? 420 : index === 3 ? 280 : index === 1 || index === 4 ? 180 : 220,
      gems: index === 5 ? 35 : index === 3 ? 20 : index === 1 || index === 4 ? 12 : 15,
      bossStyle: index === 5 ? blueprint.bossStyle : undefined,
    })),
  };
});

export function allChaptersCleared(player: Pick<PlayerState, "clearedStages">) {
  return CHAPTERS.every((chapter) => player.clearedStages.includes(chapter.stages.at(-1)!.id));
}

export function createTowerStage(floor: number): Stage {
  const modifiers = TOWER_MODIFIERS.filter((modifier, index) => floor >= 4 + index * 2 && (floor + index) % (index + 3) === 0).slice(0, Math.min(3, 1 + Math.floor(floor / 15)));
  return {
    id: `tower-${floor}`, chapter: 5, order: floor, towerFloor: floor, title: `Tower Floor ${floor}`,
    subtitle: modifiers.length ? modifiers.map((item) => item.name).join(" · ") : "Unmodified ascent",
    lore: `The Endless Tower has recalculated itself ${floor} times. Its guardian now predicts ${Math.min(99, 35 + floor)}% of ordinary strategies.`,
    kind: "tower", bossStyle: "tower", modifiers,
    hp: Math.round(105 + floor * 24 + Math.pow(floor, 1.32) * 3), damage: 11 + floor * 3,
    xp: 120 + floor * 18, coins: 130 + floor * 24, gems: 5 + Math.floor(floor / 2),
  };
}

export function isFlashEventActive(date = new Date()) {
  return date.getUTCMinutes() < 5;
}

export function flashEventSecondsRemaining(date = new Date()) {
  if (!isFlashEventActive(date)) return 0;
  return Math.max(0, 5 * 60 - date.getUTCMinutes() * 60 - date.getUTCSeconds());
}

export function secondsUntilFlashEvent(date = new Date()) {
  if (isFlashEventActive(date)) return 0;
  return Math.max(0, (60 - date.getUTCMinutes()) * 60 - date.getUTCSeconds());
}

export function createFlashEventStage(date = new Date()): Stage {
  const hourKey = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}-${date.getUTCHours()}`;
  return {
    id: `flash-${hourKey}`, chapter: 0, order: 1, title: "Chronicle Zero", subtitle: "Hourly Flash Anomaly",
    lore: "For five minutes, an unfiled future intersects the Archives. Prove it before the shelves correct the contradiction and seal the path again.",
    kind: "event", bossStyle: "probability", hp: 170, damage: 18, xp: 360, coins: 520, gems: 42,
  };
}

export type QuestReward = { coins?: number; gems?: number; knowledgePoints?: number; skillPoints?: number; xp?: number; summonTickets?: number; standardTickets?: number };
export type Quest = { id: string; title: string; description: string; target: number; reward: QuestReward; metric: string };

export const DAILY_QUESTS: Quest[] = [
  { id: "daily-flawless", title: "Flawless Logic", description: "Clear an Endless Tower gate with no wrong answers.", target: 1, metric: "flawlessTower", reward: { coins: 260, xp: 120 } },
  { id: "daily-speed", title: "Speed Caster", description: "Defeat a chapter Boss before Turn 3 ends.", target: 1, metric: "speedBoss", reward: { gems: 24, xp: 140 } },
  { id: "daily-pemdas", title: "PEMDAS Master", description: "Resolve a four-card tactical chain in one turn.", target: 1, metric: "pemdasChains", reward: { knowledgePoints: 90, coins: 220 } },
  { id: "daily-retreat", title: "Tactical Retreat", description: "Skip a turn while at least 2 AP remain.", target: 1, metric: "tacticalRetreats", reward: { gems: 18, xp: 100 } },
  { id: "daily-answers", title: "Rigorous Study", description: "Answer 8 questions correctly.", target: 8, metric: "answers", reward: { coins: 240, knowledgePoints: 60 } },
];

export const WEEKLY_QUESTS: Quest[] = [
  { id: "weekly-anomaly", title: "Anomaly Hunter", description: "Defeat Chronicle Zero 3 times.", target: 3, metric: "chronicleZero", reward: { gems: 120, knowledgePoints: 320 } },
  { id: "weekly-damage", title: "The Grand Scholar", description: "Accumulate 5,000 damage in the Endless Tower.", target: 5000, metric: "towerDamage", reward: { gems: 180, knowledgePoints: 500 } },
  { id: "weekly-truth", title: "Absolute Truth", description: "Play 10 Breakthrough cards.", target: 10, metric: "breakthroughCards", reward: { coins: 1200, xp: 420 } },
  { id: "weekly-fragments", title: "Resource Management", description: "Complete 2 Fragment upgrades.", target: 2, metric: "fragmentUpgrades", reward: { gems: 90, knowledgePoints: 260 } },
  { id: "weekly-answers", title: "Disciplined Scholar", description: "Answer 60 questions correctly.", target: 60, metric: "answers", reward: { coins: 1500, xp: 500 } },
  { id: "weekly-pvp", title: "Arena Theorem", description: "Win 5 Scholar Showdowns.", target: 5, metric: "pvpWins", reward: { gems: 150, knowledgePoints: 400 } },
  { id: "weekly-tower", title: "Endless Ascent", description: "Clear 7 tower floors.", target: 7, metric: "towerFloors", reward: { skillPoints: 5, coins: 1200 } },
];

export type LoginReward = QuestReward & { cardId?: string; selector?: boolean };

export const ORIENTATION_LOGIN_REWARDS: LoginReward[] = [
  { coins: 150 }, { gems: 15 }, { knowledgePoints: 80 }, { coins: 300, xp: 100 }, { gems: 30 }, { coins: 500, skillPoints: 1 }, { cardId: "newtons-apple", gems: 50 },
];

export const MONTHLY_LOGIN_REWARDS: LoginReward[] = [
  { coins: 120 }, { gems: 8 }, { xp: 100 }, { knowledgePoints: 60 }, { coins: 220 }, { gems: 12 }, { coins: 320, xp: 120 },
  { knowledgePoints: 100 }, { coins: 180 }, { gems: 15 }, { xp: 160 }, { coins: 260 }, { knowledgePoints: 120 }, { gems: 25, coins: 350 },
  { xp: 180 }, { coins: 240 }, { gems: 18 }, { knowledgePoints: 140 }, { coins: 320 }, { skillPoints: 1 }, { gems: 35, coins: 400 },
  { coins: 280 }, { xp: 220 }, { gems: 22 }, { knowledgePoints: 180 }, { coins: 420 }, { gems: 40 }, { gems: 60, selector: true },
];

export type LanguagePreference = "vi" | "en";
export type PlayerSettings = { theme: "dark" | "light"; sound: boolean; musicVolume: number; effectsVolume: number; reducedMotion: boolean; hints: boolean; language: LanguagePreference };
export type EducationLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type SubjectScore = { answered: number; correct: number };
export type RestrictionState = { enabled: boolean; quota: number; answered: number; dayKey: string };
export type CustomQuestionBank = Record<StudySubject, StudyQuestion[]>;
export type PlayerState = {
  version: number; gems: number; coins: number; knowledgePoints: number; skillPoints: number; summonTickets: number; standardTickets: number; xp: number; level: number; tutorialComplete: boolean;
  deckIds: string[]; baseDeckIds: string[]; tacticalDeckIds: string[]; breakthroughDeckIds: string[];
  ownedCards: Record<string, number>; cardFragments: Record<string, number>; cardLevels: Record<string, number>; unlockedSkills: string[]; clearedStages: string[];
  pity: { legendary: number; mythic: number }; dailyKey: string; weeklyKey: string;
  dailyProgress: Record<string, number>; weeklyProgress: Record<string, number>; claimedDaily: string[]; claimedWeekly: string[];
  dailyQuestStates: boolean[]; claimedQuestMilestones: string[];
  loginStreak: number; lastLoginClaim: string; referralCode: string; playSeconds: number; towerFloor: number; towerBest: number;
  orientationDay: number; monthlyLoginDay: number; monthlySelectorPending: boolean;
  pvpWins: number; pvpLosses: number; pvpRating: number; perfectParries: number; perfectEquilibrium: number; madScientist: number; pityBlessing: number; highestCombo: number; bestGlobalRank: number; equippedTitle: string; equippedFrame: string;
  settings: PlayerSettings; educationLevel: EducationLevel; pinHash: string; restriction: RestrictionState;
  subjectStats: Record<StudySubject, SubjectScore>; customQuestionBank: CustomQuestionBank | null; lastBanner: Subject;
};

export function emptyProgress(quests: Quest[]) {
  return Object.fromEntries(Array.from(new Set(quests.map((quest) => quest.metric))).map((metric) => [metric, 0]));
}

export function createDefaultPlayer(): PlayerState {
  const startingCards = [...STARTER_DECK];
  return {
    version: 8, gems: 0, coins: 0, knowledgePoints: 0, skillPoints: 0, summonTickets: 0, standardTickets: 0, xp: 0, level: 0, tutorialComplete: false,
    deckIds: [...startingCards], baseDeckIds: startingCards.filter((id) => CARD_BY_ID[id]?.tier === "Base"), tacticalDeckIds: startingCards.filter((id) => CARD_BY_ID[id]?.tier === "Tactical"), breakthroughDeckIds: startingCards.filter((id) => CARD_BY_ID[id]?.tier === "Breakthrough"),
    ownedCards: Object.fromEntries(startingCards.map((id) => [id, 1])), cardFragments: {}, cardLevels: {}, unlockedSkills: [], clearedStages: [],
    pity: { legendary: 0, mythic: 0 }, dailyKey: "", weeklyKey: "", dailyProgress: emptyProgress(DAILY_QUESTS), weeklyProgress: emptyProgress(WEEKLY_QUESTS),
    claimedDaily: [], claimedWeekly: [], dailyQuestStates: DAILY_QUESTS.map(() => false), claimedQuestMilestones: [], loginStreak: 0, lastLoginClaim: "", referralCode: "", playSeconds: 0, towerFloor: 1, towerBest: 0,
    orientationDay: 0, monthlyLoginDay: 0, monthlySelectorPending: false,
    pvpWins: 0, pvpLosses: 0, pvpRating: 1000, perfectParries: 0, perfectEquilibrium: 0, madScientist: 0, pityBlessing: 0, highestCombo: 0, bestGlobalRank: 999, equippedTitle: "New Scholar", equippedFrame: "Archive Bronze",
    settings: { theme: "dark", sound: true, musicVolume: 45, effectsVolume: 70, reducedMotion: false, hints: true, language: "vi" },
    educationLevel: 7, pinHash: "", restriction: { enabled: false, quota: 10, answered: 0, dayKey: "" },
    subjectStats: { Mathematics: { answered: 0, correct: 0 }, Chemistry: { answered: 0, correct: 0 }, Physics: { answered: 0, correct: 0 }, Biology: { answered: 0, correct: 0 } },
    customQuestionBank: null, lastBanner: "Mathematics",
  };
}

export const SKILL_BRANCHES = [
  { id: "calculation", name: "Calculation", icon: "Σ", color: "cyan", focus: "Equation damage, PEMDAS precision, and Max AP" },
  { id: "resilience", name: "Resilience", icon: "△", color: "gold", focus: "Health, shields, and recovery" },
  { id: "momentum", name: "Momentum", icon: "Δ", color: "violet", focus: "AP recovery, ability tempo, and turn flow" },
  { id: "inquiry", name: "Inquiry", icon: "?", color: "rose", focus: "Forecasts, recalculation, and learning rewards" },
] as const;

export type SkillNode = { id: string; branch: string; index: number; name: string; rarity: Rarity; description: string; gems: number; knowledgePoints: number; skillPoints: number; prerequisite?: string };

const RADIAL_SKILLS: Record<string, SkillNode[]> = {
  calculation: [
    { id: "calculation-1", branch: "calculation", index: 1, name: "Clean Sum", rarity: "Common", description: "+2 flat damage after a valid equation is evaluated.", gems: 5, knowledgePoints: 40, skillPoints: 1 },
    { id: "calculation-2", branch: "calculation", index: 2, name: "Ordered Operations", rarity: "Uncommon", description: "+5% equation damage after all flat bonuses.", gems: 9, knowledgePoints: 70, skillPoints: 1, prerequisite: "calculation-1" },
    { id: "calculation-3", branch: "calculation", index: 3, name: "Coefficient Edge", rarity: "Rare", description: "+4 additional flat equation damage.", gems: 14, knowledgePoints: 110, skillPoints: 2, prerequisite: "calculation-2" },
    { id: "calculation-4", branch: "calculation", index: 4, name: "Fourth Action", rarity: "Epic", description: "+1 Max AP in every combat unless a modifier suppresses it.", gems: 24, knowledgePoints: 180, skillPoints: 3, prerequisite: "calculation-3" },
    { id: "calculation-5", branch: "calculation", index: 5, name: "Proof Amplifier", rarity: "Legendary", description: "+10% equation damage after flat bonuses and element synergy.", gems: 38, knowledgePoints: 280, skillPoints: 4, prerequisite: "calculation-4" },
    { id: "calculation-6", branch: "calculation", index: 6, name: "Axiom Unbound", rarity: "Mythic", description: "+8 flat damage and subtraction/division pierce 10 extra Shield.", gems: 60, knowledgePoints: 420, skillPoints: 5, prerequisite: "calculation-5" },
  ],
  resilience: [
    { id: "resilience-1", branch: "resilience", index: 1, name: "Vital Premise", rarity: "Common", description: "+8 maximum HP.", gems: 5, knowledgePoints: 40, skillPoints: 1 },
    { id: "resilience-2", branch: "resilience", index: 2, name: "Opening Ward", rarity: "Uncommon", description: "Begin combat with 7 Shield.", gems: 9, knowledgePoints: 70, skillPoints: 1, prerequisite: "resilience-1" },
    { id: "resilience-3", branch: "resilience", index: 3, name: "Retained Shape", rarity: "Rare", description: "Retain 10% of Shield that would be spent blocking.", gems: 14, knowledgePoints: 110, skillPoints: 2, prerequisite: "resilience-2" },
    { id: "resilience-4", branch: "resilience", index: 4, name: "Second Wind", rarity: "Epic", description: "+14 maximum HP and +5 starting Shield.", gems: 24, knowledgePoints: 180, skillPoints: 3, prerequisite: "resilience-3" },
    { id: "resilience-5", branch: "resilience", index: 5, name: "Living Geometry", rarity: "Legendary", description: "Retain an additional 15% Shield when blocking.", gems: 38, knowledgePoints: 280, skillPoints: 4, prerequisite: "resilience-4" },
    { id: "resilience-6", branch: "resilience", index: 6, name: "Unbroken Theorem", rarity: "Mythic", description: "+25 maximum HP and +12 starting Shield.", gems: 60, knowledgePoints: 420, skillPoints: 5, prerequisite: "resilience-5" },
  ],
  momentum: [
    { id: "momentum-1", branch: "momentum", index: 1, name: "Stored Motion", rarity: "Common", description: "5% chance for instant AP recovery after an equation.", gems: 5, knowledgePoints: 40, skillPoints: 1 },
    { id: "momentum-2", branch: "momentum", index: 2, name: "Continuity", rarity: "Uncommon", description: "+5% instant AP recovery chance.", gems: 9, knowledgePoints: 70, skillPoints: 1, prerequisite: "momentum-1" },
    { id: "momentum-3", branch: "momentum", index: 3, name: "Ability Compression", rarity: "Rare", description: "The first ability each battle costs 1 less AP.", gems: 14, knowledgePoints: 110, skillPoints: 2, prerequisite: "momentum-2" },
    { id: "momentum-4", branch: "momentum", index: 4, name: "Instant Recovery", rarity: "Epic", description: "+15% chance to recover 1 AP immediately after any complete equation.", gems: 24, knowledgePoints: 180, skillPoints: 3, prerequisite: "momentum-3" },
    { id: "momentum-5", branch: "momentum", index: 5, name: "Zero-Cost Insight", rarity: "Legendary", description: "The first ability each turn costs 0 AP.", gems: 38, knowledgePoints: 280, skillPoints: 4, prerequisite: "momentum-4" },
    { id: "momentum-6", branch: "momentum", index: 6, name: "Perpetual Proof", rarity: "Mythic", description: "+20% instant AP recovery chance, capped at Max AP.", gems: 60, knowledgePoints: 420, skillPoints: 5, prerequisite: "momentum-5" },
  ],
  inquiry: [
    { id: "inquiry-1", branch: "inquiry", index: 1, name: "Next Premise", rarity: "Common", description: "Reveal one additional future card.", gems: 5, knowledgePoints: 40, skillPoints: 1 },
    { id: "inquiry-2", branch: "inquiry", index: 2, name: "Recalculate", rarity: "Uncommon", description: "+1 Recalculate charge per battle.", gems: 9, knowledgePoints: 70, skillPoints: 1, prerequisite: "inquiry-1" },
    { id: "inquiry-3", branch: "inquiry", index: 3, name: "Research Yield", rarity: "Rare", description: "+10% rewards from correct Question Lab answers.", gems: 14, knowledgePoints: 110, skillPoints: 2, prerequisite: "inquiry-2" },
    { id: "inquiry-4", branch: "inquiry", index: 4, name: "Deep Forecast", rarity: "Epic", description: "Reveal two more future cards.", gems: 24, knowledgePoints: 180, skillPoints: 3, prerequisite: "inquiry-3" },
    { id: "inquiry-5", branch: "inquiry", index: 5, name: "Patient Hypothesis", rarity: "Legendary", description: "+20% Question Lab reward value.", gems: 38, knowledgePoints: 280, skillPoints: 4, prerequisite: "inquiry-4" },
    { id: "inquiry-6", branch: "inquiry", index: 6, name: "Open Question", rarity: "Mythic", description: "+1 Recalculate charge and reveal the next five cards.", gems: 60, knowledgePoints: 420, skillPoints: 5, prerequisite: "inquiry-5" },
  ],
};

export function getSkillNodes(branch: string): SkillNode[] {
  return RADIAL_SKILLS[branch] ?? [];
}

export type SkillBonuses = {
  maxHp: number; equationFlat: number; equationPercent: number; startingShield: number;
  shieldRetention: number; queuePreviewBonus: number; handSizeBonus: number; mulliganBonus: number;
  abilityDiscount: number; freeFirstAbility: boolean; equationRefundChance: number; maxApBonus: number; questionRewardPercent: number;
};

export function getSkillBonuses(unlockedSkills: string[]): SkillBonuses {
  const bonuses: SkillBonuses = { maxHp: 0, equationFlat: 0, equationPercent: 0, startingShield: 0, shieldRetention: 0, queuePreviewBonus: 0, handSizeBonus: 0, mulliganBonus: 0, abilityDiscount: 0, freeFirstAbility: false, equationRefundChance: 0, maxApBonus: 0, questionRewardPercent: 0 };
  const has = (id: string) => unlockedSkills.includes(id);
  if (has("calculation-1")) bonuses.equationFlat += 2;
  if (has("calculation-2")) bonuses.equationPercent += 5;
  if (has("calculation-3")) bonuses.equationFlat += 4;
  if (has("calculation-4")) bonuses.maxApBonus += 1;
  if (has("calculation-5")) bonuses.equationPercent += 10;
  if (has("calculation-6")) bonuses.equationFlat += 8;
  if (has("resilience-1")) bonuses.maxHp += 8;
  if (has("resilience-2")) bonuses.startingShield += 7;
  if (has("resilience-3")) bonuses.shieldRetention += 10;
  if (has("resilience-4")) { bonuses.maxHp += 14; bonuses.startingShield += 5; }
  if (has("resilience-5")) bonuses.shieldRetention += 15;
  if (has("resilience-6")) { bonuses.maxHp += 25; bonuses.startingShield += 12; }
  if (has("momentum-1")) bonuses.equationRefundChance += 5;
  if (has("momentum-2")) bonuses.equationRefundChance += 5;
  if (has("momentum-3")) bonuses.abilityDiscount = 1;
  if (has("momentum-4")) bonuses.equationRefundChance += 15;
  if (has("momentum-5")) bonuses.freeFirstAbility = true;
  if (has("momentum-6")) bonuses.equationRefundChance += 20;
  if (has("inquiry-1")) bonuses.queuePreviewBonus += 1;
  if (has("inquiry-2")) bonuses.mulliganBonus += 1;
  if (has("inquiry-3")) bonuses.questionRewardPercent += 10;
  if (has("inquiry-4")) bonuses.queuePreviewBonus += 2;
  if (has("inquiry-5")) bonuses.questionRewardPercent += 20;
  if (has("inquiry-6")) { bonuses.mulliganBonus += 1; bonuses.queuePreviewBonus += 2; }
  bonuses.shieldRetention = Math.min(50, bonuses.shieldRetention);
  bonuses.equationRefundChance = Math.min(45, bonuses.equationRefundChance);
  return bonuses;
}

export type Achievement = { id: string; name: string; description: string; title: string; frame?: string; hidden?: boolean; target: number; metric: "stages" | "chapters" | "level" | "cards" | "pvpWins" | "tower" | "parries" | "combo" | "top10" | "top1" | "equilibrium" | "madScientist" | "pityBlessing" };
export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-proof", name: "First Proof", description: "Clear your first combat stage.", title: "Premise Keeper", frame: "Cyan Premise", target: 1, metric: "stages" },
  { id: "chapter-sage", name: "Chapter Sage", description: "Clear an entire chapter.", title: "Chapter Sage", target: 1, metric: "chapters" },
  { id: "perfect-counter", name: "Counterexample", description: "Perform 3 Perfect Parries.", title: "Exact Counter", target: 3, metric: "parries" },
  { id: "collector", name: "Living Catalogue", description: "Discover 20 different cards.", title: "Archive Curator", target: 20, metric: "cards" },
  { id: "arena-proof", name: "Arena Proof", description: "Win 10 PvP matches.", title: "Duel Theorist", frame: "Crimson Arena", target: 10, metric: "pvpWins" },
  { id: "tower-climber", name: "Endless Ascent", description: "Reach Tower Floor 10.", title: "Tower Walker", frame: "Infinite Spire", target: 10, metric: "tower" },
  { id: "quantum-fire", name: "Quantum Fire", description: "Clear Endless Tower Floor 50.", title: "Quantum Ascendant", frame: "Quantum Fire", target: 50, metric: "tower" },
  { id: "grand-scholar", name: "Grand Scholar", description: "Reach Scholar Level 20.", title: "Grand Scholar", target: 20, metric: "level" },
  { id: "hundred-proof", name: "Overwhelming Proof", description: "Deal at least 100 damage in one hit.", title: "Axiom Breaker", target: 100, metric: "combo" },
  { id: "mad-scientist", name: "The Mad Scientist", description: "Accumulate more than 100 calculation damage before ending a single turn.", title: "The Mad Scientist", frame: "Voltaic Formula", hidden: true, target: 1, metric: "madScientist" },
  { id: "pitys-blessing", name: "Pity's Blessing", description: "Receive a Mythic card exactly when the Mythic Pity counter reaches its maximum.", title: "Pity's Blessing", frame: "Prismatic Mercy", hidden: true, target: 1, metric: "pityBlessing" },
  { id: "global-top-ten", name: "Council Seat", description: "Reach the overall Top 10 Scholar ranking.", title: "Decan of Logic", frame: "Gold Frame", target: 1, metric: "top10" },
  { id: "global-apex", name: "Apex Thesis", description: "Reach the overall #1 Scholar ranking.", title: "Apex Scholar", frame: "Apex Prism", target: 1, metric: "top1" },
  { id: "perfect-equilibrium", name: "Hidden: Perfect Equilibrium", description: "Finish a chapter boss with exactly 0 AP and 1 HP.", title: "Perfect Equilibrium", frame: "Equilibrium Halo", hidden: true, target: 1, metric: "equilibrium" },
];

export function achievementProgress(player: PlayerState, achievement: Achievement) {
  if (achievement.metric === "stages") return player.clearedStages.length;
  if (achievement.metric === "chapters") return CHAPTERS.filter((chapter) => player.clearedStages.includes(chapter.stages.at(-1)!.id)).length;
  if (achievement.metric === "level") return player.level;
  if (achievement.metric === "cards") return Object.values(player.ownedCards).filter((count) => count > 0).length;
  if (achievement.metric === "pvpWins") return player.pvpWins;
  if (achievement.metric === "tower") return player.towerBest;
  if (achievement.metric === "parries") return player.perfectParries;
  if (achievement.metric === "top10") return player.bestGlobalRank <= 10 ? 1 : 0;
  if (achievement.metric === "top1") return player.bestGlobalRank === 1 ? 1 : 0;
  if (achievement.metric === "equilibrium") return player.perfectEquilibrium;
  if (achievement.metric === "madScientist") return player.madScientist;
  if (achievement.metric === "pityBlessing") return player.pityBlessing;
  return player.highestCombo;
}

export const PVP_RANKS = [
  { name: "Bronze Analyst", min: 0, color: "#b87952" }, { name: "Silver Logician", min: 1100, color: "#b9c5d8" },
  { name: "Gold Theorist", min: 1250, color: "#e7bd56" }, { name: "Platinum Scholar", min: 1450, color: "#79d7d2" },
  { name: "Diamond Archivist", min: 1700, color: "#8eb9ff" }, { name: "Master Axiom", min: 2000, color: "#b88bff" },
  { name: "Grand Scholar", min: 2350, color: "#ff7fb8" },
] as const;

export function getPvpRank(rating: number) { return [...PVP_RANKS].reverse().find((rank) => rating >= rank.min) ?? PVP_RANKS[0]; }
export function levelFromXp(xp: number) { return Math.floor(xp / 500); }
export function xpIntoLevel(xp: number) { return xp % 500; }
