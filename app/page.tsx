"use client";
/* eslint-disable react-hooks/purity */

import Image from "next/image";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  Activity, AlertTriangle, Atom, Award, BarChart3, BookOpen, Bot, BrainCircuit, Calculator, Castle, Check, ChevronLeft, ChevronRight,
  CircleHelp, Coins, Copy, Crown, Gem, Gift, GripVertical, Heart, Home as HomeIcon, LibraryBig, LockKeyhole,
  Dna, FlaskConical, GraduationCap, KeyRound, LocateFixed, Minus, Move, Network, Play, Plus, Radio, RefreshCw, RotateCcw, Save, Search, ScrollText, Settings, Share2, Shield,
  Sigma, Sparkles, Star, Swords, Ticket, Timer, Trophy, UserPlus, UserRound, Users, Volume2, VolumeX,
  WandSparkles, X, Zap,
} from "lucide-react";
import {
  ACHIEVEMENTS, CARD_BY_ID, CARD_POOL, CARD_SUBJECTS, CHAPTERS, DECK_SIZE, MIN_BASE_CARDS, RARITY_DECK_LIMIT,
  DAILY_QUESTS, MONTHLY_LOGIN_REWARDS, ORIENTATION_LOGIN_REWARDS, PVP_RANKS, RARITIES, SKILL_BRANCHES, STARTER_DECK, SUMMON_RATES,
  WEEKLY_QUESTS, achievementProgress, allChaptersCleared, buildCombatDeck, cardLevelBonus, createDefaultPlayer, createFlashEventStage,
  createTowerStage, cycleCombatCards, emptyProgress, endTurnRedraw, flashEventSecondsRemaining, fragmentCostForLevel, getPvpRank,
  effectiveCardCost, getSkillBonuses, getSkillNodes, isFlashEventActive, levelFromXp, restoreCombatHandRatio, secondsUntilFlashEvent, validateDeck, xpIntoLevel,
  type EducationLevel, type GameCard, type LanguagePreference, type PlayerSettings,
  type PlayerState, type Quest, type QuestReward, type Rarity, type Stage, type Subject,
} from "./game-data";
import { STUDY_SUBJECTS, shuffleItems, type PlayableQuestion, type StudySubject } from "./question-bank";
import { GRADE_LEVELS, generateOneQuestion, generateTowerMathQuestion, questionEpoch, questionHint, tutorReply, type AdaptiveQuestion } from "./learning-engine";
import Panzoom, { type PanzoomInstance } from "./panzoom";
import { LORE_VI, chapterCopy, skillCopy, stageCopy, t } from "./localization";

type Screen = "landing" | "onboarding" | "tutorial" | "hub" | "chapters" | "study" | "combat" | "victory" | "deck" | "codex" | "skills" | "summon" | "quests" | "pvp" | "tower" | "achievements" | "rankings" | "questions";
type Account = { email: string | null; displayName: string; signedIn: boolean; authMethod: "scholar" | "google" | null; scholarId?: string };
type SyncState = "loading" | "saving" | "saved" | "offline";
type ModalName = "auth" | "settings" | "info" | "daily" | "share" | "lore" | null;
type RewardSummary = QuestReward & { chapterXp?: number; replay?: boolean; stageTitle?: string; towerFloor?: number };
type GuideId = "astrea" | "orion" | "lada" | "turing";
type RoomState = { code: string; status: string; hostName: string; guestName: string | null; hostDeck: string[]; guestDeck: string[] | null; role: "host" | "guest" | "spectator" };
type LeaderboardPlayer = { scholarId?: string; name: string; title: string; playSeconds: number; chaptersCleared: number; pvpWins: number; pvpRating: number; towerBest: number; score: number };
type LeaderboardData = { overall: LeaderboardPlayer[]; playtime: LeaderboardPlayer[]; chapters: LeaderboardPlayer[]; pvp: LeaderboardPlayer[] };
type ScholarProfile = { scholarId: string; name: string; title: string; frame: string; towerBest: number; pvpRating: number; topCards: Array<Pick<GameCard, "id" | "name" | "symbol" | "rarity" | "subject" | "ability">> };

const LanguageContext = createContext<LanguagePreference>("vi");

const GUIDES: Record<GuideId, { name: string; role: string; roleVi: string; image: string; status: string; symbol: string; aura: string; quotes: string[]; quotesVi: string[] }> = {
  astrea: { name: "Astrea", role: "The Grand Archivist", roleVi: "Đại Quản thủ Archives", image: "/astrea.png", status: "ASTREA IS LISTENING", symbol: "Σ", aura: "sigma", quotes: ["A sound theorem starts with a curious mind.", "The Grimoire awaits your next equation.", "Precision is kindness to the truth."], quotesVi: ["Một định lý vững chắc bắt đầu từ trí tò mò.", "Grimoire đang chờ phương trình tiếp theo của em.", "Chính xác là một cách tử tế với sự thật."] },
  orion: { name: "Orion", role: "The Quantum Vanguard", roleVi: "Tiên phong Lượng tử", image: "/orion.png", status: "ORION IS CALCULATING FORCE", symbol: "Δ", aura: "delta", quotes: ["Every action has an equal, opposite reaction. Prepare yours.", "Momentum is nothing without direction.", "Match the incoming force exactly. Then counter."], quotesVi: ["Mọi tác động đều có phản lực tương ứng. Hãy chuẩn bị.", "Động lượng không có ý nghĩa nếu thiếu phương hướng.", "Khớp chính xác lực sắp tới, rồi phản công."] },
  lada: { name: "Lada", role: "The Probability Oracle", roleVi: "Nhà tiên tri Xác suất", image: "/lada.png", status: "LADA IS ROLLING THE ODDS", symbol: "μ", aura: "mu", quotes: ["Luck is just an equation we haven't solved yet.", "Will you wager your intellect for a miracle?", "A rate shown is a promise that must be kept."], quotesVi: ["May mắn chỉ là phương trình ta chưa giải được.", "Em có đặt trí tuệ của mình vào một điều kỳ diệu không?", "Tỉ lệ đã công bố là một lời hứa phải được giữ."] },
  turing: { name: "Turing", role: "The Logic Architect", roleVi: "Kiến trúc sư Logic", image: "/turing.png", status: "TURING IS COMPILING DATA", symbol: "∞", aura: "infinity", quotes: ["Flawed input guarantees doomed output. Optimize your deck.", "I have simulated 14 million runs. Efficiency is your only hope.", "A missing card is still useful information."], quotesVi: ["Input sai chắc chắn tạo output hỏng. Hãy tối ưu Deck.", "Tôi đã mô phỏng 14 triệu lượt. Hiệu quả là hy vọng của bạn.", "Một thẻ còn thiếu vẫn là thông tin hữu ích."] },
};

const SUBJECT_DETAILS = {
  Mathematics: { icon: Calculator, accent: "#63d7f1", description: "Numbers, operations, geometry, and percentages" },
  Chemistry: { icon: FlaskConical, accent: "#f0bd64", description: "Elements, atoms, matter, and reactions" },
  Physics: { icon: Atom, accent: "#a990ff", description: "Forces, energy, waves, and electricity" },
  Biology: { icon: Dna, accent: "#70dda8", description: "Cells, plants, animals, and the human body" },
} as const;

const STUDY_QUESTION_COUNT = 5;

const INFO_COPY: Record<Screen, { title: string; text: string; bullets: string[] }> = {
  landing: { title: "Welcome to Axiomancy", text: "A strategic card game where equations become attacks and study powers your journey.", bullets: ["Astrea guides the Archives", "New accounts start at Level 0 with zero currencies and a legal 16-card starter deck", "Scholar ID + Access Cipher and Google-backed sign-in are available", "Open the Lore Scroll to discover Aletheia"] },
  onboarding: { title: "Mandatory First Thesis", text: "A darkened, highlighted tutorial teaches Deck Building, resources, combat, execution, and boss rules.", bullets: ["Complete all five guided steps", "Play one card, then form 2 + 3 = 5", "The tutorial is saved when complete"] },
  tutorial: { title: "Equation Combat", text: "Combine number, operator, and number cards to form a valid equation.", bullets: ["Equations cost 1 AP", "Ability cards resolve on their own", "Every card has a special effect"] },
  hub: { title: "The Grand Archives", text: "Your central dashboard for every progression system.", bullets: ["Trials advance ten lore chapters", "Question Lab trains all four subjects", "Deck Building and the Codex are separate tools", "Flash Events open for five minutes every UTC hour"] },
  chapters: { title: "Chapter Progression", text: "Core stages unlock in order. Gold special stages are optional and never block the main path.", bullets: ["Ten chapters follow the Great Fallacy", "Every battle has lore and a distinct apex", "Clear every chapter to unlock the Endless Tower"] },
  study: { title: "Study Phase", text: "Questions are generated one at a time at your selected Grade 1–12 level.", bullets: ["Every answer order is shuffled", "The pool resets every two hours", "Tower sessions are Mathematics-only and timed", "+20 XP per correct answer"] },
  combat: { title: "Advanced Combat", text: "Plan around the visible incoming hit, exact replacement queue, and combat log.", bullets: ["Exact result = incoming damage triggers Perfect Parry", "Recalculate redraws once for 1 AP", "At 0 AP, the turn ends automatically"] },
  victory: { title: "Trial Rewards", text: "Stages give medium XP; finishing a chapter grants a large XP bonus.", bullets: ["First clears give full rewards", "Tower floors scale forever", "Share links copy your result"] },
  deck: { title: "Deck Building", text: "Build exactly 16 cards with at least eight Base cards and every category needed by the anti-brick draw.", bullets: ["Include at least 1 operator, 1 support Tactical, and 1 Breakthrough", "Common/Uncommon/Rare: up to 3 copies per card", "Epic: 2 copies · Legendary/Mythic: 1 copy", "Every combat hand is 2 Base · 1 operator · 1 support Tactical · 1 Breakthrough"] },
  codex: { title: "The Codex", text: "Inspect every discovered and missing card, its rarity, ability, level, and Fragments.", bullets: ["Duplicate summons become card-specific Fragments", "Only that card's Fragments can upgrade it", "Upgrades improve that card's combat output", "Event Cards are recorded separately"] },
  skills: { title: "Radial Skill Tree", text: "Research outward from a shared center into four meaningful disciplines.", bullets: ["Calculation fixes and amplifies equation damage", "Resilience improves HP and Shield", "Momentum enables instant AP recovery", "Inquiry improves forecasts, redraws, and Lab rewards"] },
  summon: { title: "Summoning Rates & Banners", text: "Choose Mathematics, Chemistry, Physics, or Biology; every result comes from that subject bank.", bullets: ["Each banner has 5 Legendary cards and 1–2 Mythic cards", "Common 50% · Uncommon 27% · Rare 13%", "Epic 7% · Legendary 2.5% · Mythic 0.5%", "Legendary pity: 70 · Mythic pity: 200"] },
  quests: { title: "Quest Archive", text: "Event-driven objectives track how you play, not just how often.", bullets: ["Daily 5/5 milestone: Standard Ticket, 50 Shards, KP", "Weekly 5/7 milestone: Limited Ticket and 100 Shards", "The glowing milestone crest claims every ready Daily reward", "Daily quests reset each day; Weekly quests reset Monday"] },
  pvp: { title: "Scholar Showdown", text: "Queue for ranked play or create a private six-character room code.", bullets: ["Empty queues produce a random rival deck", "Private rooms can be joined from another browser", "Wins change rating and PvP rank"] },
  tower: { title: "The Endless Tower", text: "The Tower unlocks after all chapters and becomes stronger every floor.", bullets: ["Enemy HP and damage scale per floor", "Higher floors combine rule modifiers", "Gravity Inversion and Time Dilation change strategy"] },
  achievements: { title: "Achievements & Titles", text: "Milestones unlock visible titles that can be equipped on your profile.", bullets: ["Titles persist with your account", "Progress updates in real time", "Equipped titles appear in the Hub and rankings"] },
  rankings: { title: "Scholar Rankings", text: "Saved players are ranked by overall score, playtime, chapter clears, and PvP performance.", bullets: ["Playtime is tracked while the game is open", "PvP has seven rank divisions", "No email or private identifier is displayed"] },
  questions: { title: "Infinite Question Lab", text: "Choose a subject, Grade 1–12, and optional timer before an endless session.", bullets: ["Exactly one unique question is generated per request", "Timed correct answers earn a 1.5× multiplier", "Evaluation tracks accuracy by subject", "The tutor gives contextual logic hints without direct answers"] },
};

function todayKey(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function weekKey(date = new Date()) { const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate()); const day = copy.getDay() || 7; copy.setDate(copy.getDate() - day + 1); return todayKey(copy); }
function rewardLabel(reward: QuestReward) { return [reward.knowledgePoints && `${reward.knowledgePoints} KP`, reward.coins && `${reward.coins} RT`, reward.gems && `${reward.gems} Shards`, reward.skillPoints && `${reward.skillPoints} SP`, reward.standardTickets && `${reward.standardTickets} Standard Ticket${reward.standardTickets === 1 ? "" : "s"}`, reward.summonTickets && `${reward.summonTickets} Limited Ticket${reward.summonTickets === 1 ? "" : "s"}`, reward.xp && `${reward.xp} XP`].filter(Boolean).join(" · "); }
function formatPlaytime(seconds: number) { const hours = Math.floor(seconds / 3600); const minutes = Math.floor((seconds % 3600) / 60); return hours ? `${hours}h ${minutes}m` : `${minutes}m`; }
function makeClientId() { const values = new Uint32Array(4); window.crypto.getRandomValues(values); return Array.from(values, (value) => value.toString(16).padStart(8, "0")).join("-"); }
function randomInt(minimum: number, maximum: number) { const values = new Uint32Array(1); window.crypto.getRandomValues(values); return minimum + ((values[0] ?? 0) % (maximum - minimum + 1)); }
function copyText(value: string) { if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(value); const area = document.createElement("textarea"); area.value = value; area.style.position = "fixed"; area.style.opacity = "0"; document.body.appendChild(area); area.select(); document.execCommand("copy"); area.remove(); return Promise.resolve(); }
async function hashPin(pin: string) { const bytes = new TextEncoder().encode(`axiom-guardian:${pin}`); const digest = await crypto.subtle.digest("SHA-256", bytes); return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0")).join(""); }
function restrictionIncomplete(player: PlayerState) { return player.restriction.enabled && player.restriction.answered < player.restriction.quota; }

function normalizePlayer(raw: Partial<PlayerState>): PlayerState {
  const base = createDefaultPlayer();
  const previousLevel = Number(raw.level ?? 0);
  const legacySkills = raw.unlockedSkills ?? [];
  const migratedSkills = legacySkills.some((id) => /^(arithmetic|algebra|geometry|calculus)-/.test(id))
    ? [
      ...getSkillNodes("calculation").slice(0, Math.min(6, legacySkills.filter((id) => id.startsWith("algebra-")).length)),
      ...getSkillNodes("resilience").slice(0, Math.min(6, Math.max(legacySkills.filter((id) => id.startsWith("arithmetic-")).length, legacySkills.filter((id) => id.startsWith("geometry-")).length))),
      ...getSkillNodes("momentum").slice(0, Math.min(6, legacySkills.filter((id) => id.startsWith("calculus-")).length)),
      ...getSkillNodes("inquiry").slice(0, Math.min(6, Math.floor(legacySkills.filter((id) => id.startsWith("calculus-")).length / 2))),
    ].map((node) => node.id)
    : legacySkills;
  const state: PlayerState = {
    ...base, ...raw,
    pity: { ...base.pity, ...(raw.pity ?? {}) },
    settings: { ...base.settings, ...(raw.settings ?? {}) },
    dailyProgress: { ...base.dailyProgress, ...(raw.dailyProgress ?? {}) },
    weeklyProgress: { ...base.weeklyProgress, ...(raw.weeklyProgress ?? {}) },
    ownedCards: { ...base.ownedCards, ...(raw.ownedCards ?? {}) },
    cardFragments: { ...base.cardFragments, ...(raw.cardFragments ?? {}) },
    cardLevels: { ...base.cardLevels, ...(raw.cardLevels ?? {}) },
    unlockedSkills: [...new Set(migratedSkills)],
    restriction: { ...base.restriction, ...(raw.restriction ?? {}) },
    subjectStats: Object.fromEntries(STUDY_SUBJECTS.map((subject) => [subject, { ...base.subjectStats[subject], ...(raw.subjectStats?.[subject] ?? {}) }])) as PlayerState["subjectStats"],
  };
  const today = todayKey();
  const week = weekKey();
  if (state.dailyKey !== today) { state.dailyKey = today; state.dailyProgress = emptyProgress(DAILY_QUESTS); state.claimedDaily = []; state.dailyQuestStates = DAILY_QUESTS.map(() => false); }
  if (state.weeklyKey !== week) { state.weeklyKey = week; state.weeklyProgress = emptyProgress(WEEKLY_QUESTS); state.claimedWeekly = []; }
  if (state.restriction.dayKey !== today) state.restriction = { ...state.restriction, answered: 0, dayKey: today };
  const calculatedLevel = levelFromXp(state.xp);
  if (calculatedLevel > previousLevel) state.skillPoints += calculatedLevel - previousLevel;
  state.level = calculatedLevel;
  state.version = 8;
  state.knowledgePoints = Math.max(0, Number(state.knowledgePoints ?? 0));
  state.summonTickets = Math.max(0, Number(state.summonTickets ?? 0));
  state.standardTickets = Math.max(0, Number(state.standardTickets ?? 0));
  state.claimedQuestMilestones = Array.isArray(state.claimedQuestMilestones) ? state.claimedQuestMilestones.slice(-30) : [];
  state.dailyQuestStates = DAILY_QUESTS.map((quest) => (state.dailyProgress[quest.metric] ?? 0) >= quest.target);
  state.orientationDay = Math.min(7, Math.max(0, Number(state.orientationDay ?? 0)));
  state.monthlyLoginDay = Math.min(27, Math.max(0, Number(state.monthlyLoginDay ?? 0)));
  state.monthlySelectorPending = Boolean(state.monthlySelectorPending);
  state.perfectEquilibrium = Math.max(0, Number(state.perfectEquilibrium ?? 0));
  state.madScientist = Math.max(0, Number(state.madScientist ?? 0));
  state.pityBlessing = Math.max(0, Number(state.pityBlessing ?? 0));
  state.bestGlobalRank = Math.max(1, Number(state.bestGlobalRank ?? 999));
  state.equippedFrame = state.equippedFrame || "Archive Bronze";
  const equippedAchievement = ACHIEVEMENTS.find((achievement) => achievement.title === state.equippedTitle);
  if (equippedAchievement?.frame) state.equippedFrame = equippedAchievement.frame;
  if (!GRADE_LEVELS.includes(state.educationLevel)) state.educationLevel = 7;
  if (state.settings.language !== "en" && state.settings.language !== "vi") state.settings.language = "vi";
  for (const id of STARTER_DECK) if (!state.ownedCards[id]) state.ownedCards[id] = 1;
  const candidateDeck = (raw.deckIds ?? []).filter((id) => Boolean(CARD_BY_ID[id]));
  state.deckIds = validateDeck(candidateDeck).valid ? candidateDeck : [...STARTER_DECK];
  state.baseDeckIds = state.deckIds.filter((id) => CARD_BY_ID[id]?.tier === "Base");
  state.tacticalDeckIds = state.deckIds.filter((id) => CARD_BY_ID[id]?.tier === "Tactical");
  state.breakthroughDeckIds = state.deckIds.filter((id) => CARD_BY_ID[id]?.tier === "Breakthrough");
  for (const id of Object.keys(state.cardLevels)) state.cardLevels[id] = Math.min(5, Math.max(1, Number(state.cardLevels[id] ?? 1)));
  for (const id of Object.keys(state.cardFragments)) state.cardFragments[id] = Math.max(0, Number(state.cardFragments[id] ?? 0));
  return state;
}

function Brand({ onHome, compact = false }: { onHome: () => void; compact?: boolean }) {
  return <button className="brand-mark" type="button" onClick={onHome} aria-label="Return to Axiom home screen"><Image className="brand-logo" src="/axiom-logo.png" alt="" width={500} height={500} unoptimized />{!compact && <span>AXIOM</span>}</button>;
}

function CurrencyBar({ player }: { player: PlayerState }) {
  return <div className="v2-currencies v8-resource-bar" aria-label="Player resources"><span className="v2-currency gem"><Gem size={17} />{player.gems.toLocaleString()} <small>SHARDS</small></span><span className="v2-currency coin"><Coins size={17} />{player.coins.toLocaleString()} <small>RT</small></span><span className="v2-currency kp"><BookOpen size={17} />{player.knowledgePoints.toLocaleString()} <small>KP</small></span><span className="v2-currency standard-ticket"><Ticket size={17} />{player.standardTickets.toLocaleString()} <small>STD</small></span><span className="v2-currency ticket"><Ticket size={17} />{player.summonTickets.toLocaleString()} <small>LIMITED</small></span><span className="v2-currency sp"><Sparkles size={17} />{player.skillPoints.toLocaleString()} <small>SP</small></span></div>;
}

function ScreenHeader({ title, subtitle, player, onBack, onHome, onInfo, onSettings }: { title: string; subtitle: string; player?: PlayerState; onBack: () => void; onHome: () => void; onInfo: () => void; onSettings?: () => void }) {
  return <header className="screen-header v2-header"><div className="screen-header-left"><button className="icon-button" type="button" onClick={onBack} aria-label="Back"><ChevronLeft size={19} /></button><Brand onHome={onHome} /><span className="header-divider" /><div><h1>{title}</h1><p>{subtitle}</p></div></div><div className="v2-header-actions">{player && <CurrencyBar player={player} />}<button className="icon-button" type="button" onClick={onHome} aria-label="Home"><HomeIcon size={18} /></button><button className="icon-button" type="button" onClick={onInfo} aria-label={`Information about ${title}`}><CircleHelp size={18} /></button>{onSettings && <button className="icon-button" type="button" onClick={onSettings} aria-label="Settings"><Settings size={18} /></button>}</div></header>;
}

function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return <div className="v2-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}><section className={`v2-modal ${wide ? "wide" : ""}`} role="dialog" aria-modal="true" aria-label={title}><header><div><span className="section-kicker">AXIOM ARCHIVE</span><h2>{title}</h2></div><button className="icon-button" type="button" onClick={onClose} aria-label="Close"><X size={18} /></button></header>{children}</section></div>;
}

function GuideCharacter({ id, compact = false }: { id: GuideId; compact?: boolean }) {
  const guide = GUIDES[id];
  const language = useContext(LanguageContext);
  const quotes = language === "vi" ? guide.quotesVi : guide.quotes;
  const [quote, setQuote] = useState(0);
  useEffect(() => { const timer = window.setInterval(() => setQuote((value) => (value + 1) % quotes.length), 6200); return () => window.clearInterval(timer); }, [quotes.length, language]);
  return <div className={`v3-guide v3-guide-${id} aura-${guide.aura} ${compact ? "compact" : ""}`}><div className="v3-guide-render"><span className="v3-guide-symbol" aria-hidden="true">{guide.symbol}</span><Image src={guide.image} alt={`${guide.name}, ${language === "vi" ? guide.roleVi : guide.role}`} width={676} height={369} unoptimized /></div><div className="v3-guide-copy"><small>{(language === "vi" ? guide.roleVi : guide.role).toUpperCase()}</small><strong>{guide.name}</strong><span className="v3-guide-status"><i />{guide.status}</span><p>“{quotes[quote]}”</p></div></div>;
}

function CardFace({ card, compact = false, missing = false }: { card: GameCard; compact?: boolean; missing?: boolean }) {
  const subjectClass = card.subject.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return <div className={`v2-card-face card-container subject-${subjectClass} rarity-${card.rarity.toLowerCase()} ${compact ? "compact" : ""} ${missing ? "v3-card-missing" : ""}`}>
    <span className="card-layer card-layer-background" aria-hidden="true" />
    <span className="card-layer card-layer-vfx" aria-hidden="true"><i /><i /><i /></span>
    <div className="card-layer card-layer-content"><div className="v2-card-top"><span>{card.rarity}</span><em>{effectiveCardCost(card)} AP</em></div><strong>{missing ? "?" : card.symbol}</strong><h3>{card.name}</h3><small>{card.subject} · {card.tier}</small><p>{card.ability}</p>{missing && <b className="v3-missing-tag"><LockKeyhole size={11} /> MISSING</b>}</div>
  </div>;
}

function Landing({ player, account, onEnter, onAuth, onInfo, onLore, onHome, onRankings }: { player: PlayerState; account: Account; onEnter: () => void; onAuth: () => void; onInfo: () => void; onLore: () => void; onHome: () => void; onRankings: () => void }) {
  return <section className="landing-screen v3-landing" aria-label="Axiom title screen"><div className="aurora aurora-one" /><div className="aurora aurora-two" /><div className="star-field" /><header className="landing-nav"><Brand onHome={onHome} /><nav>{account.signedIn ? <button type="button" className="nav-link" onClick={onAuth}><UserRound size={15} />{account.displayName}</button> : <><button type="button" className="nav-link" onClick={onAuth}>Login</button><button type="button" className="nav-link" onClick={onAuth}>Sign up</button></>}<button type="button" className="nav-link" onClick={onLore}><ScrollText size={15} /> Lore Scroll</button><button type="button" className="nav-link" onClick={onRankings}><Crown size={15} /> Leaderboards</button><button type="button" className="icon-button" onClick={onInfo} aria-label="Game information"><CircleHelp size={17} /></button></nav></header><div className="sky-dragon" aria-hidden="true"><span className="dragon-wing wing-left" /><span className="dragon-body" /><span className="dragon-wing wing-right" /><span className="dragon-tail" /></div><div className="citadel" aria-hidden="true"><span className="tower tower-left"><i /></span><span className="tower tower-mid-left"><i /></span><span className="tower tower-main"><i /></span><span className="tower tower-mid-right"><i /></span><span className="tower tower-right"><i /></span><span className="citadel-base" /></div><div className="hero-copy"><div className="eyebrow"><Sparkles size={15} /> THE ARCHIVES ARE CALLING</div><div className="title-sigil title-logo"><Image src="/axiom-logo.png" alt="Axiom crystalline scholar crest" width={500} height={500} priority unoptimized /></div><button className="v3-title-button" type="button" onClick={onHome} aria-label="Axiom home"><span>AXIOM</span><strong>The Scholar&apos;s Deck</strong></button><p>Study the truth. Build your theorem. Recalculate reality.</p><div className="hero-actions"><button type="button" className="primary-cta" onClick={onEnter}><span>{player.tutorialComplete ? "Continue Your Thesis" : "Enter the Archives"}</span><ChevronRight size={20} /></button>{!account.signedIn && <button type="button" className="guest-cta" onClick={onEnter}>Continue as Guest</button>}</div><div className="hero-proof"><span><Gem size={14} /> Free to play</span><span className="proof-dot" /><span>Persistent progress</span><span className="proof-dot" /><span>Strategic equations</span></div></div><aside className="v3-landing-guide"><GuideCharacter id="astrea" compact /></aside></section>;
}

// Retained for profiles that still reference the former five-step markup.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function LegacyOnboarding({ onContinue, onInfo, onHome }: { onContinue: () => void; onInfo: () => void; onHome: () => void }) {
  const [step, setStep] = useState(0);
  const [demo, setDemo] = useState<"single" | "two" | "plus" | "three" | "done">("single");
  const steps = [
    { label: "STEP 1 · DECK BUILDING", title: "Compile a legal theorem.", prompt: "Your deck must contain exactly 16 cards. At least 8 must be Base cards (Numbers) to build your formulas.", secondary: "Limits: 3x Common/Uncommon/Rare, 2x Epic, 1x Legendary/Mythic per deck." },
    { label: "STEP 2 · THE ARCHIVE", title: "Know your resources.", prompt: "Earn KP/Shards via battles to upgrade your Skill Tree. Warning: Wrong answers cost Shards! Earn Research Tokens (RT) to summon new theorems at the Portal.", secondary: "Limited Tickets come from Tower milestones, Weekly Thesis rewards, Flash Events, or the 160-Shard exchange." },
    { label: "STEP 3 · THE BOARD", title: "Control each turn.", prompt: "You always go first. You have 5 cards and 3 Action Points (AP) per turn. Unused AP is lost. At turn end, spent and discarded cards are selectively replaced.", secondary: "The draw engine always restores 2 Base, 1 operator, 1 support Tactical, and 1 Breakthrough card." },
    { label: "STEP 4 · EXECUTION", title: "Make the board obey.", prompt: "Play one card, then drag cards to form 2 + 3 = 5.", secondary: "Combos cost only 1 AP total! Damage equals the final result, strictly following PEMDAS rules. Match elements for a 10% damage buff." },
    { label: "STEP 5 · THE ANOMALY", title: "Read the rule before attacking.", prompt: "Bosses have rules. This one only takes damage from 'Even Numbers'. Break their specific shields (e.g., Geometry Shield) using the right card types.", secondary: "When your turn ends, the Boss attacks—they deal damage, Freeze your cards, or force discards. Adapt or perish." },
  ];
  const current = steps[step];
  const demoReady = step !== 3 || demo === "done";
  const advance = () => { if (!demoReady) return; if (step === steps.length - 1) onContinue(); else setStep((value) => value + 1); };
  return <section className="game-screen v7-ftue"><div className="v7-ftue-board" aria-hidden="true"><div className="v7-ftue-boss"><span>⅟</span><strong>EVEN NUMBER WARD</strong><div><i /></div></div><div className="v7-ftue-hand">{["2", "+", "3", "◇", "φ"].map((symbol) => <span key={symbol}>{symbol}</span>)}</div></div><div className="v7-ftue-shade" /><header><Brand onHome={onHome} compact /><span>MANDATORY FIRST THESIS · {step + 1}/5</span><button className="icon-button" type="button" onClick={onInfo}><CircleHelp size={18} /></button></header><div className={`v7-ftue-highlight highlight-${step}`}><span /></div><main className="v7-ftue-panel"><GuideCharacter id="astrea" compact /><span className="section-kicker">{current.label}</span><h1>{current.title}</h1><p>{current.prompt}</p><div className="v7-ftue-secondary"><Sparkles size={17} />{current.secondary}</div>{step === 0 && <div className="v7-ftue-proof"><strong>16 / 16</strong><span>10 Base · valid</span><em>COMMON ×3 · EPIC ×2 · LEGENDARY ×1</em></div>}{step === 1 && <CurrencyBar player={createDefaultPlayer()} />}{step === 2 && <div className="v7-ftue-ap"><span>5-CARD HAND</span><div><i /><i /><i /></div><strong>3 / 3 AP</strong></div>}{step === 3 && <div className="v7-ftue-demo"><small>{demo === "single" ? "Required action: play one single card." : demo === "done" ? "Execution complete · 5 damage" : "Required action: build 2 + 3."}</small><div>{["2", "+", "3"].map((symbol) => <button type="button" key={symbol} disabled={demo === "done"} onClick={() => { if (demo === "single") setDemo("two"); else if (symbol === "2" && demo === "two") setDemo("plus"); else if (symbol === "+" && demo === "plus") setDemo("three"); else if (symbol === "3" && demo === "three") setDemo("done"); }}>{symbol}</button>)}</div><strong>{demo === "single" ? "Single card · −1 AP" : demo === "two" ? "Equation: · · ·" : demo === "plus" ? "Equation: 2 · ·" : demo === "three" ? "Equation: 2 + ·" : "2 + 3 = 5 · −1 AP"}</strong></div>}{step === 4 && <div className="v7-ftue-rule"><Shield size={22} /><div><strong>Boss Rule: Even Results Only</strong><span>Incoming: 8 damage · Geometry Shield active</span></div></div>}<footer><div>{steps.map((_, index) => <i className={index <= step ? "active" : ""} key={index} />)}</div><button className="gold-button" type="button" onClick={advance} disabled={!demoReady}>{step === steps.length - 1 ? "Enter the Grand Archives" : demoReady ? "Continue" : "Complete the interaction"} <ChevronRight size={17} /></button></footer></main></section>;
}

function Onboarding({ player, onGradeSelect, onContinue, onInfo, onHome }: { player: PlayerState; onGradeSelect: (grade: EducationLevel) => void; onContinue: () => void; onInfo: () => void; onHome: () => void }) {
  const language = player.settings.language;
  const [step, setStep] = useState(0);
  const [gradeConfirmed, setGradeConfirmed] = useState(false);
  const [deckReady, setDeckReady] = useState(false);
  const [demo, setDemo] = useState<"tactical" | "two" | "plus" | "three" | "done">("tactical");
  const steps = language === "vi" ? [
    { label: "GIAI ĐOẠN 0 · KHỞI TẠO", title: "Chào mừng, Scholar.", prompt: "Astrea cần biết lớp học hiện tại để đồng bộ độ khó của AI. Hãy chọn đúng Grade trước khi bước vào Archives.", secondary: "Bạn có thể thay đổi Grade sau này trong phần cài đặt được bảo vệ bằng PIN." },
    { label: "GIAI ĐOẠN 1 · TÀI NGUYÊN HỌC THUẬT", title: "Mỗi tài nguyên ghi lại một kiểu tiến bộ.", prompt: "Shards đại diện cho độ chính xác và bị trừ khi trả lời sai. RT và KP dùng để Summon thẻ và nghiên cứu Skill Tree.", secondary: "Tickets là lượt truy xuất Standard/Limited; SP được nhận khi tăng Scholar Level." },
    { label: "GIAI ĐOẠN 2 · DECK BUILDING", title: "Biên dịch một định lý hợp lệ.", prompt: "Deck phải có đúng 16 thẻ, trong đó tối thiểu 8 Base (Number) để dựng công thức. Hãy kéo thẻ còn thiếu vào ô trống.", secondary: "Giới hạn: 3× Common/Uncommon/Rare, 2× Epic, 1× Legendary/Mythic cho mỗi thẻ." },
    { label: "GIAI ĐOẠN 3 · LOGIC BOARD & PEMDAS", title: "Điều khiển lượt bằng AP.", prompt: "Bạn luôn đi trước với 5 thẻ và 3 AP. Dùng một Tactical trước, rồi tạo 2 + 3 = 5.", secondary: "Một combo hợp lệ chỉ tốn 1 AP bất kể độ dài. Damage tuân theo PEMDAS. Boss này chỉ nhận Damage từ kết quả chẵn và có Shield riêng." },
    { label: "GIAI ĐOẠN 4 · PHÒNG THÍ NGHIỆM", title: "Luyện tập trước khi chiến đấu.", prompt: "Infinite Question Lab tạo từng câu hỏi theo Grade. Bật Timer để luyện tính nhẩm và nhận phần thưởng ×1.5.", secondary: "Skill Tree là bản đồ nghiên cứu có thể kéo và thu phóng; mở khóa từ Foundational Axiom ra ngoài." },
    { label: "GIAI ĐOẠN 5 · TIẾN TRÌNH NHIỆM VỤ", title: "Biến việc học thành một nhịp bền vững.", prompt: "Quest Archive theo dõi mục tiêu Daily và Weekly. Hoàn thành các mốc để nhận Limited Tickets và tài nguyên nghiên cứu.", secondary: "Tutorial kết thúc tại đây. Astrea sẽ tiếp tục hướng dẫn bạn từ Grand Archives." },
  ] : [
    { label: "PHASE 0 · INITIALIZATION", title: "Welcome, Scholar.", prompt: "Astrea needs your current Academic Grade to synchronize the AI difficulty engine. Select Grade 1–12 before entering the Archives.", secondary: "You can later change Grade from the PIN-protected learning controls." },
    { label: "PHASE 1 · ACADEMIC RESOURCES", title: "Every resource records a different kind of progress.", prompt: "Shards represent precision and are deducted after wrong answers. RT and KP power Summons and Skill Tree research.", secondary: "Tickets are Standard/Limited retrieval passes; SP is earned when your Scholar Level rises." },
    { label: "PHASE 2 · DECK BUILDING", title: "Compile a legal theorem.", prompt: "A deck requires exactly 16 cards and at least 8 Base Number cards. Drag the missing card into the empty slot.", secondary: "Limits: 3× Common/Uncommon/Rare, 2× Epic, 1× Legendary/Mythic per card." },
    { label: "PHASE 3 · LOGIC BOARD & PEMDAS", title: "Control the turn with AP.", prompt: "You always act first with 5 cards and 3 AP. Play one Tactical card, then form 2 + 3 = 5.", secondary: "A valid combo costs only 1 AP regardless of length. Damage follows PEMDAS. This Boss accepts even results and protects itself with a typed Shield." },
    { label: "PHASE 4 · THE LABORATORY", title: "Practice before battle.", prompt: "The Infinite Question Lab generates one Grade-matched question at a time. Enable the Timer for mental-math pressure and ×1.5 rewards.", secondary: "The Skill Tree is a pannable research map that grows outward from the Foundational Axiom." },
    { label: "PHASE 5 · QUEST PROGRESSION", title: "Turn learning into a sustainable rhythm.", prompt: "The Quest Archive tracks Daily and Weekly objectives. Complete milestones to earn Limited Tickets and research resources.", secondary: "The tutorial ends here. Astrea will continue guiding you from the Grand Archives." },
  ];
  const current = steps[step];
  const interactionReady = step === 0 ? gradeConfirmed : step === 2 ? deckReady : step === 3 ? demo === "done" : true;
  const advance = () => {
    if (!interactionReady) return;
    if (step === steps.length - 1) onContinue();
    else setStep((value) => value + 1);
  };
  const chooseDemoCard = (symbol: string) => {
    if (demo === "tactical" && symbol === "◇") setDemo("two");
    else if (demo === "two" && symbol === "2") setDemo("plus");
    else if (demo === "plus" && symbol === "+") setDemo("three");
    else if (demo === "three" && symbol === "3") setDemo("done");
  };
  const apLeft = demo === "tactical" ? 3 : demo === "done" ? 1 : 2;

  return <section className={`game-screen v7-ftue v10-ftue language-${language}`}>
    <div className="v7-ftue-board" aria-hidden="true"><div className="v7-ftue-boss"><span>⅟</span><strong>EVEN NUMBER WARD</strong><div><i /></div></div><div className="v7-ftue-hand">{["2", "+", "3", "◇", "φ"].map((symbol) => <span key={symbol}>{symbol}</span>)}</div></div>
    <div className="v7-ftue-shade" />
    <header><Brand onHome={onHome} compact /><span>{t(language, "LUẬN ĐỀ ĐẦU TIÊN BẮT BUỘC", "MANDATORY FIRST THESIS")} · {step + 1}/{steps.length}</span><button className="icon-button" type="button" onClick={onInfo}><CircleHelp size={18} /></button></header>
    <div className={`v7-ftue-highlight v10-highlight highlight-${step}`}><span /></div>
    <main className="v7-ftue-panel v10-ftue-panel">
      <GuideCharacter id="astrea" compact />
      <span className="section-kicker">{current.label}</span><h1>{current.title}</h1><p>{current.prompt}</p>
      <div className="v7-ftue-secondary"><Sparkles size={17} />{current.secondary}</div>
      {step === 0 && <div className="v10-grade-select"><span>{t(language, "CHỌN KHỐI LỚP", "SELECT ACADEMIC GRADE")}</span><div>{GRADE_LEVELS.map((grade) => <button type="button" key={grade} className={gradeConfirmed && player.educationLevel === grade ? "active" : ""} onClick={() => { onGradeSelect(grade); setGradeConfirmed(true); }}><GraduationCap size={15} /> Grade {grade}</button>)}</div></div>}
      {step === 1 && <div className="v10-resource-tutorial"><CurrencyBar player={createDefaultPlayer()} /><p>{t(language, "HP, AP, Damage, Shield và tên tài nguyên được giữ bằng English để tạo vốn từ STEM thụ động.", "Core STEM resource terms remain consistent across every language.")}</p></div>}
      {step === 2 && <div className="v10-deck-drag"><div className="v7-ftue-proof"><strong>{deckReady ? "16 / 16" : "15 / 16"}</strong><span>{deckReady ? "8 Base · VALID" : "8 Base · 1 SLOT MISSING"}</span><em>COMMON ×3 · EPIC ×2 · LEGENDARY/MYTHIC ×1</em></div><button type="button" draggable={!deckReady} className="v10-tutorial-card" onDragStart={(event) => event.dataTransfer.setData("text/plain", "twin-squire")} onClick={() => setDeckReady(true)}><GripVertical size={16} /><strong>2</strong><span>Twin Squire</span><small>Base · Common</small></button><div className={deckReady ? "v10-deck-slot filled" : "v10-deck-slot"} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); if (event.dataTransfer.getData("text/plain") === "twin-squire") setDeckReady(true); }}>{deckReady ? <><Check size={21} /><strong>Twin Squire</strong></> : <><Plus size={21} /><strong>{t(language, "THẢ THẺ VÀO ĐÂY", "DROP CARD HERE")}</strong></>}</div></div>}
      {step === 3 && <div className="v7-ftue-demo v10-ftue-demo"><small>{demo === "tactical" ? t(language, "Bắt buộc: dùng 1 Tactical card.", "Required: play 1 Tactical card.") : demo === "done" ? t(language, "Hoàn tất · 5 Damage · Boss Ward được giải thích", "Complete · 5 Damage · Boss Ward explained") : t(language, "Bắt buộc: tạo 2 + 3.", "Required: build 2 + 3.")}</small><div>{["◇", "2", "+", "3"].map((symbol) => <button type="button" key={symbol} disabled={demo === "done"} onClick={() => chooseDemoCard(symbol)}>{symbol}</button>)}</div><strong>{demo === "tactical" ? `Tactical · 1 AP` : demo === "two" ? "Equation: · · ·" : demo === "plus" ? "Equation: 2 · ·" : demo === "three" ? "Equation: 2 + ·" : "2 + 3 = 5 · 1 AP"}</strong><div className="v10-ftue-ap"><span>AP</span><div>{Array.from({ length: 3 }).map((_, index) => <i className={index < apLeft ? "active" : ""} key={index} />)}</div><b>{apLeft} / 3 AP</b></div><div className="v7-ftue-rule"><Shield size={22} /><div><strong>Boss Rule: Even Results Only</strong><span>Incoming: 8 Damage · Geometry Shield active</span></div></div></div>}
      {step === 4 && <div className="v10-ftue-feature"><GraduationCap size={30} /><div><strong>Infinite Question Lab</strong><span>{t(language, "Grade 1–12 · Timer ×1.5 · câu hỏi tạo từng câu", "Grade 1–12 · Timer ×1.5 · one question at a time")}</span></div><Network size={30} /><div><strong>Radial Skill Tree</strong><span>{t(language, "Kéo, chụm và cuộn để khám phá", "Drag, pinch, and scroll to explore")}</span></div></div>}
      {step === 5 && <div className="v10-ftue-feature"><ScrollText size={30} /><div><strong>Quest Archive</strong><span>Daily · Weekly · Limited Tickets</span></div><Ticket size={30} /><div><strong>{t(language, "Mốc tiến trình", "Progress milestones")}</strong><span>{t(language, "Học đều, nhận thưởng đúng lúc", "Learn consistently, claim deliberately")}</span></div></div>}
      <footer><div>{steps.map((_, index) => <i className={index <= step ? "active" : ""} key={index} />)}</div><button className="gold-button" type="button" onClick={advance} disabled={!interactionReady}>{step === steps.length - 1 ? t(language, "Vào Grand Archives", "Enter the Grand Archives") : interactionReady ? t(language, "Tiếp tục", "Continue") : t(language, "Hoàn thành tương tác", "Complete the interaction")} <ChevronRight size={17} /></button></footer>
    </main>
  </section>;
}

function Tutorial({ onComplete, onInfo, onHome }: { onComplete: () => void; onInfo: () => void; onHome: () => void }) {
  const [equation, setEquation] = useState<string[]>([]);
  const [executed, setExecuted] = useState(false);
  const required = ["2", "+", "3"];
  const choices = [{ symbol: "2", name: "Twin Squire" }, { symbol: "+", name: "Union Adept" }, { symbol: "3", name: "Triad Scholar" }];
  return <section className={`tutorial-screen game-screen ${executed ? "v2-impact" : ""}`}><div className="tutorial-top"><Brand onHome={onHome} compact /><span className="tutorial-tag">GUIDED COMBAT · 01</span><span>Astrea&apos;s Lesson</span><button className="icon-button" type="button" onClick={onInfo}><CircleHelp size={17} /></button></div><div className="enemy-stage tutorial-enemy"><div className="anomaly fraction-anomaly">½</div><h2>FRACTION ANOMALY</h2><div className="hp-bar"><span style={{ width: executed ? "38%" : "100%" }} /></div><small>{executed ? "3 / 8 HP" : "8 / 8 HP"}</small></div><aside className="tutorial-guide"><GuideCharacter id="astrea" compact /></aside><div className={`equation-zone ${equation.length === 3 ? "valid" : ""}`}><span className="zone-label"><Sigma size={15} /> EQUATION ZONE</span><div className="equation-value">{equation.length ? equation.join(" ") : <em>Place cards here</em>}{equation.length === 3 && <b>= 5</b>}</div>{equation.length === 3 && !executed && <button className="execute-button" type="button" onClick={() => setExecuted(true)}><Zap size={17} /> Execute · 1 AP</button>}</div><div className="tutorial-hand">{choices.map((card, index) => <button type="button" className={`game-card card-math ${equation.includes(card.symbol) ? "card-used" : ""} ${index === equation.length && !executed ? "guided-card" : ""}`} key={card.symbol} onClick={() => { if (card.symbol === required[equation.length]) setEquation((items) => [...items, card.symbol]); }} disabled={equation.includes(card.symbol) || executed}><small>COMMON</small><strong>{card.symbol}</strong><span>{card.name}</span></button>)}</div><div className="tutorial-ap"><span>AP</span><i /><i /><i /><small>3 / 3</small></div>{executed && <button className="tutorial-next gold-button" type="button" onClick={onComplete}>Claim your first summon <ChevronRight size={18} /></button>}</section>;
}

function Hub({ player, account, sync, go, onHome, onSettings, onInfo, onDaily, onShare, onLore, onEvent }: { player: PlayerState; account: Account; sync: SyncState; go: (screen: Screen) => void; onHome: () => void; onSettings: () => void; onInfo: () => void; onDaily: () => void; onShare: () => void; onLore: () => void; onEvent: (stage: Stage) => void }) {
  const language = player.settings.language;
  const towerOpen = allChaptersCleared(player);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 1000); return () => window.clearInterval(timer); }, []);
  const flashActive = isFlashEventActive(now);
  const flashSeconds = flashActive ? flashEventSecondsRemaining(now) : secondsUntilFlashEvent(now);
  const flashClock = `${String(Math.floor(flashSeconds / 60)).padStart(2, "0")}:${String(flashSeconds % 60).padStart(2, "0")}`;
  const pillars = [
    { screen: "chapters" as Screen, title: t(language, "Thử thách Nhận thức", "The Cognitive Trials"), kicker: "CHAPTER CAMPAIGN", desc: t(language, "Stage tuần tự, Anomaly tùy chọn và cốt truyện.", "Sequential stages, optional anomalies, and lore."), icon: BrainCircuit, color: "cyan" },
    { screen: "questions" as Screen, title: "Infinite Question Lab", kicker: `GRADE ${player.educationLevel} · 4 SUBJECTS`, desc: restrictionIncomplete(player) ? `${player.restriction.answered}/${player.restriction.quota} ${t(language, "câu để mở Play Mode", "questions toward Play unlock")}.` : t(language, "Phần thưởng vô hạn, Evaluation và AI Tutor.", "Infinite rewards, evaluation, and an AI tutor."), icon: GraduationCap, color: "green" },
    { screen: "pvp" as Screen, title: "Scholar Showdown", kicker: "PVP · RANKED + ROOMS", desc: t(language, "Xếp hàng, nhập Room Code hoặc đấu Rival được tạo.", "Queue, challenge a room code, or fight a generated rival."), icon: Swords, color: "red" },
    { screen: "deck" as Screen, title: "Deck Building", kicker: "16 CARDS · 8+ BASE", desc: t(language, "Biên dịch định lý hợp lệ theo giới hạn rarity.", "Compile a legal theorem with rarity limits."), icon: LibraryBig, color: "violet" },
    { screen: "skills" as Screen, title: "Skill Tree", kicker: "ONE RADIAL TREE", desc: t(language, "Nghiên cứu từ tâm ra bốn nhánh gameplay.", "Research outward into four gameplay disciplines."), icon: Network, color: "green" },
    { screen: "summon" as Screen, title: "Gacha · Summoning Portal", kicker: "RATES + DUAL PITY", desc: t(language, "Lada áp dụng đúng mọi xác suất hiển thị.", "Lada applies every displayed probability."), icon: WandSparkles, color: "gold" },
  ];
  const dailyReady = DAILY_QUESTS.filter((quest) => (player.dailyProgress[quest.metric] ?? 0) >= quest.target && !player.claimedDaily.includes(quest.id)).length;
  return <section className="hub-screen game-screen v3-hub"><header className="hub-topbar v2-hub-top"><Brand onHome={onHome} /><div className="hub-breadcrumb"><span>THE GRAND ARCHIVES</span><small>{account.signedIn ? account.displayName : "Guest Scholar"} · {player.equippedTitle}</small></div><div className="player-bar"><CurrencyBar player={player} /><div className="level-chip"><span>{player.level}</span><div><strong>Scholar Level</strong><small>{xpIntoLevel(player.xp)} / 500 XP · next level +1 SP</small></div></div><span className={`v2-sync ${sync}`}><i />{sync === "saved" ? "LIVE" : sync.toUpperCase()}</span><button className="icon-button" type="button" onClick={onLore} aria-label="Open Lore Scroll"><ScrollText size={18} /></button><button className="icon-button" type="button" onClick={onInfo}><CircleHelp size={18} /></button><button className="icon-button" type="button" onClick={onSettings}><Settings size={18} /></button></div></header><div className="hub-atmosphere" aria-hidden="true"><div className="archive-orbit" /><div className="archive-floor" /></div><div className="hub-content"><aside className="hub-astrea"><GuideCharacter id="astrea" /><span className="online-badge"><i /> {GUIDES.astrea.status}</span>{flashActive ? <button type="button" className="v7-flash-event active" onClick={() => onEvent(createFlashEventStage(now))}><Timer size={18} /><span><strong>FLASH EVENT OPEN</strong><small>The Five-Minute Paradox · {flashClock}</small></span><ChevronRight size={16} /></button> : <div className="v7-flash-event"><Timer size={18} /><span><strong>Next Flash Event</strong><small>Opens in {flashClock}</small></span></div>}</aside><div className="pillar-area"><div className="section-intro"><span>CONTINUE YOUR SCHOLARSHIP</span><h1>The Grand Archives</h1><p>Every proof begins with a path. Choose yours.</p></div><div className="pillar-grid">{pillars.map(({ title, kicker, desc, icon: Icon, screen, color }, index) => <button type="button" className={`pillar-card pillar-${color} ${index === 0 ? "pillar-featured" : ""}`} key={title} onClick={() => go(screen)}><span className="pillar-icon"><Icon size={index === 0 ? 34 : 26} /></span><span className="pillar-copy"><small>{kicker}</small><strong>{title}</strong><em>{desc}</em></span><ChevronRight size={18} className="pillar-arrow" />{index === 0 && <span className="continue-tag"><Play size={11} fill="currentColor" /> {player.clearedStages.length ? `${player.clearedStages.length} CLEARED` : "BEGIN CHAPTER 1"}</span>}</button>)}</div><div className="v3-hub-secondary"><button type="button" className={towerOpen ? "tower-ready" : ""} onClick={() => go("tower")}><Castle size={20} /><span><strong>Endless Tower</strong><small>{towerOpen ? `Floor ${player.towerFloor} ready` : "Clear all chapters to unlock"}</small></span>{towerOpen ? <ChevronRight size={17} /> : <LockKeyhole size={17} />}</button><button type="button" onClick={() => go("codex")}><BookOpen size={20} /><span><strong>The Codex</strong><small>Collection · Fragments · upgrades</small></span><ChevronRight size={17} /></button><button type="button" onClick={() => go("rankings")}><BarChart3 size={20} /><span><strong>Scholar Rankings</strong><small>Playtime · chapters · PvP</small></span><ChevronRight size={17} /></button><button type="button" onClick={() => go("achievements")}><Award size={20} /><span><strong>Achievements</strong><small>Equip a profile title</small></span><ChevronRight size={17} /></button></div></div></div><footer className="hub-footer v2-hub-footer"><button type="button" onClick={onDaily}><Gift size={19} /><span><strong>Daily Login</strong><small>{player.lastLoginClaim === todayKey() ? "Reward claimed today" : "Today's reward is ready"}</small></span><em>{player.lastLoginClaim === todayKey() ? "VIEW" : "CLAIM"}</em></button><button type="button" onClick={() => go("quests")}><ScrollText size={19} /><span><strong>Quest Archive</strong><small>Hard daily + weekly objectives</small></span><em>{dailyReady ? `${dailyReady} READY` : "VIEW"}</em></button><button type="button" onClick={onShare}><UserPlus size={19} /><span><strong>Invite a Colleague</strong><small>Copy your accessible referral link</small></span><em>COPY LINK</em></button><button type="button" onClick={() => go("rankings")}><Trophy size={19} /><span><strong>{getPvpRank(player.pvpRating).name}</strong><small>{player.pvpRating} rating · {player.pvpWins} wins</small></span><em>RANKINGS</em></button></footer></section>;
}

// Kept for migration parity with the previous chapter-map markup.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function LegacyChapters({ player, onBack, onHome, onSelect, onTower, onInfo, onSettings }: { player: PlayerState; onBack: () => void; onHome: () => void; onSelect: (stage: Stage) => void; onTower: () => void; onInfo: () => void; onSettings: () => void }) {
  const unlockedChapter = CHAPTERS.reduce((count, chapter, index) => index === 0 || player.clearedStages.includes(CHAPTERS[index - 1].stages.at(-1)!.id) ? count + 1 : count, 0);
  const [active, setActive] = useState(Math.min(CHAPTERS.length, Math.max(1, unlockedChapter)));
  const chapter = CHAPTERS[active - 1];
  const chapterOpen = active === 1 || player.clearedStages.includes(CHAPTERS[active - 2].stages.at(-1)!.id);
  const towerOpen = allChaptersCleared(player);
  return <section className="game-screen v2-page"><ScreenHeader title="The Cognitive Trials" subtitle="Chapter campaign · sequential progression" player={player} onBack={onBack} onHome={onHome} onInfo={onInfo} onSettings={onSettings} /><div className="v2-chapter-shell"><aside className="v2-chapter-list"><span className="section-kicker">THE GREAT THESIS</span><h2>Choose a chapter</h2>{CHAPTERS.map((item) => { const open = item.id === 1 || player.clearedStages.includes(CHAPTERS[item.id - 2].stages.at(-1)!.id); const cleared = player.clearedStages.includes(item.stages.at(-1)!.id); return <button type="button" key={item.id} disabled={!open} className={`${active === item.id ? "active" : ""} ${cleared ? "cleared" : ""}`} onClick={() => setActive(item.id)}><span>{String(item.id).padStart(2, "0")}</span><div><small>{cleared ? "CHAPTER CLEARED" : open ? "AVAILABLE" : "LOCKED"}</small><strong>{item.title}</strong></div>{cleared ? <Check size={17} /> : open ? <ChevronRight size={17} /> : <LockKeyhole size={17} />}</button>; })}<button type="button" className={`v3-tower-entry ${towerOpen ? "open" : ""}`} onClick={onTower}><span><Castle size={19} /></span><div><small>{towerOpen ? "ENDLESS MODE OPEN" : "SEALED"}</small><strong>The Endless Tower</strong></div>{towerOpen ? <ChevronRight size={17} /> : <LockKeyhole size={17} />}</button></aside><main className="v2-stage-map" style={{ "--chapter-accent": chapter.accent } as CSSProperties}><header><div><span>CHAPTER {chapter.id}</span><h1>{chapter.title}</h1><p>{chapter.subtitle}</p></div><div className="v2-chapter-progress"><strong>{chapter.stages.filter((stage) => player.clearedStages.includes(stage.id)).length} / {chapter.stages.length}</strong><span>STAGES CLEARED</span></div></header><div className="v3-chapter-lore"><BookOpen size={18} /><p>{chapter.lore}</p></div>{chapterOpen ? <div className="v2-stage-route">{chapter.stages.map((stage, index) => { const cleared = player.clearedStages.includes(stage.id); const unlocked = !stage.prerequisite || player.clearedStages.includes(stage.prerequisite); return <button type="button" key={stage.id} disabled={!unlocked} onClick={() => onSelect(stage)} className={`v2-stage-node ${stage.kind} ${cleared ? "cleared" : ""} ${unlocked ? "unlocked" : "locked"}`}><span className="v2-stage-number">{cleared ? <Check size={21} /> : unlocked ? stage.kind === "boss" ? <Crown size={22} /> : stage.optional ? <Star size={21} /> : index + 1 : <LockKeyhole size={19} />}</span><div><small>{stage.optional ? "OPTIONAL SPECIAL" : stage.kind === "boss" ? "CHAPTER BOSS" : stage.kind.toUpperCase()}</small><strong>{stage.title}</strong><p>{stage.lore}</p><em>{stage.xp} XP · {stage.coins} RT · {stage.gems} Shards</em></div>{unlocked && <Play size={17} />}</button>; })}</div> : <div className="v2-locked-chapter"><LockKeyhole size={38} /><h2>Chapter locked</h2><p>Clear the previous chapter&apos;s boss to continue.</p></div>}</main></div></section>;
}

function Chapters({ player, onBack, onHome, onSelect, onTower, onInfo, onSettings }: { player: PlayerState; onBack: () => void; onHome: () => void; onSelect: (stage: Stage) => void; onTower: () => void; onInfo: () => void; onSettings: () => void }) {
  const unlockedChapter = CHAPTERS.reduce((count, _chapter, index) => index === 0 || player.clearedStages.includes(CHAPTERS[index - 1].stages.at(-1)!.id) ? count + 1 : count, 0);
  const [active, setActive] = useState(Math.min(CHAPTERS.length, Math.max(1, unlockedChapter)));
  const chapter = CHAPTERS[active - 1];
  const language = player.settings.language;
  const chapterText = chapterCopy(chapter, language);
  const chapterOpen = active === 1 || player.clearedStages.includes(CHAPTERS[active - 2].stages.at(-1)!.id);
  const towerOpen = allChaptersCleared(player);

  return <section className="game-screen v2-page">
    <ScreenHeader title={t(language, "Thử thách Nhận thức", "The Cognitive Trials")} subtitle={t(language, "Chiến dịch theo chương · tiến trình tuần tự", "Chapter campaign · sequential progression")} player={player} onBack={onBack} onHome={onHome} onInfo={onInfo} onSettings={onSettings} />
    <div className="v2-chapter-shell">
      <aside className="v2-chapter-list">
        <span className="section-kicker">THE GREAT THESIS</span><h2>{t(language, "Chọn chương", "Choose a chapter")}</h2>
        {CHAPTERS.map((item) => {
          const open = item.id === 1 || player.clearedStages.includes(CHAPTERS[item.id - 2].stages.at(-1)!.id);
          const cleared = player.clearedStages.includes(item.stages.at(-1)!.id);
          const itemText = chapterCopy(item, language);
          return <button type="button" key={item.id} disabled={!open} className={`${active === item.id ? "active" : ""} ${cleared ? "cleared" : ""} ${open ? "" : "locked"}`} onClick={() => setActive(item.id)}>
            <span>{String(item.id).padStart(2, "0")}</span><div><small>{cleared ? t(language, "ĐÃ HOÀN THÀNH", "CHAPTER CLEARED") : open ? t(language, "CÓ THỂ CHƠI", "AVAILABLE") : t(language, "ĐANG KHÓA", "LOCKED")}</small><strong>{itemText.title}</strong></div>{cleared ? <Check size={17} /> : open ? <ChevronRight size={17} /> : <LockKeyhole size={17} />}
          </button>;
        })}
        <button type="button" disabled={!towerOpen} className={`v3-tower-entry ${towerOpen ? "open" : "locked"}`} onClick={onTower}><span><Castle size={19} /></span><div><small>{towerOpen ? t(language, "ENDLESS MODE ĐÃ MỞ", "ENDLESS MODE OPEN") : t(language, "ĐANG NIÊM PHONG", "SEALED")}</small><strong>The Endless Tower</strong></div>{towerOpen ? <ChevronRight size={17} /> : <LockKeyhole size={17} />}</button>
      </aside>
      <main className="v2-stage-map" style={{ "--chapter-accent": chapter.accent } as CSSProperties}>
        <header><div><span>{t(language, "CHƯƠNG", "CHAPTER")} {chapter.id}</span><h1>{chapterText.title}</h1><p>{chapterText.subtitle}</p></div><div className="v2-chapter-progress"><strong>{chapter.stages.filter((stage) => player.clearedStages.includes(stage.id)).length} / {chapter.stages.length}</strong><span>{t(language, "STAGE ĐÃ XÓA", "STAGES CLEARED")}</span></div></header>
        <div className="v3-chapter-lore"><BookOpen size={18} /><p>{chapterText.lore}</p></div>
        {chapterOpen ? <div className="v2-stage-route">{chapter.stages.map((stage, index) => {
          const cleared = player.clearedStages.includes(stage.id);
          const unlocked = !stage.prerequisite || player.clearedStages.includes(stage.prerequisite);
          const stageText = stageCopy(stage, language);
          return <button type="button" key={stage.id} disabled={!unlocked} onClick={() => onSelect(stage)} className={`v2-stage-node ${stage.kind} ${cleared ? "cleared" : ""} ${unlocked ? "unlocked" : "locked"}`}>
            <span className="v2-stage-number">{cleared ? <Check size={21} /> : unlocked ? stage.kind === "boss" ? <Crown size={22} /> : stage.optional ? <Star size={21} /> : index + 1 : <LockKeyhole size={19} />}</span>
            <div><small>{stage.optional ? t(language, "STAGE TÙY CHỌN", "OPTIONAL SPECIAL") : stage.kind === "boss" ? "CHAPTER BOSS" : stage.kind.toUpperCase()}</small><strong>{stageText.title}</strong><p>{stageText.lore}</p><span className="v8-stage-rewards"><em><Sparkles size={13} />{stage.xp} XP</em><em><Coins size={13} />{stage.coins} RT</em><em><Gem size={13} />{stage.gems} Shards</em></span>{stage.kind === "boss" && <span className="v8-boss-warning"><AlertTriangle size={14} /> {t(language, "Apex anomaly · hãy đọc quy tắc Combat", "Apex anomaly · read its combat rule")}</span>}</div>
            {unlocked && <Play size={17} />}
          </button>;
        })}</div> : <div className="v2-locked-chapter"><LockKeyhole size={38} /><h2>{t(language, "Chương đang khóa", "Chapter locked")}</h2><p>{t(language, "Đánh bại Boss của chương trước để tiếp tục.", "Clear the previous chapter's boss to continue.")}</p></div>}
      </main>
    </div>
  </section>;
}

function Study({ stage: sourceStage, player, onBack, onHome, onComplete, onAnswer, onInfo, onSettings }: { stage: Stage; player: PlayerState; onBack: () => void; onHome: () => void; onComplete: (focus: number, wrongAnswers: number) => void; onAnswer: (subject: StudySubject, correct: boolean) => void; onInfo: () => void; onSettings: () => void }) {
  const language = player.settings.language;
  const stage = useMemo(() => ({ ...sourceStage, ...stageCopy(sourceStage, language) }), [sourceStage, language]);
  const [started, setStarted] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<StudySubject | null>(stage.kind === "tower" ? "Mathematics" : null);
  const [questions, setQuestions] = useState<PlayableQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [seconds, setSeconds] = useState(10);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const towerFetchInFlight = useRef(false);
  const currentQuestion = questions[index];
  const fetchTowerQuestions = useCallback(async (seenIds: string[]) => {
    if (towerFetchInFlight.current) return [] as AdaptiveQuestion[];
    towerFetchInFlight.current = true;
    try {
      const params = new URLSearchParams({ grade: String(player.educationLevel), floor: String(stage.towerFloor ?? 1), seen: seenIds.slice(-120).join(","), language });
      const response = await fetch(`/api/tower/questions?${params.toString()}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Tower question service unavailable");
      const data = await response.json() as { questions: AdaptiveQuestion[] };
      return data.questions;
    } catch {
      const epoch = questionEpoch();
      const ids = [...seenIds];
      return Array.from({ length: 5 }, (_, salt) => {
        const question = generateTowerMathQuestion(player.educationLevel, stage.towerFloor ?? 1, ids, epoch, salt * 211, language);
        ids.push(question.id);
        return question;
      });
    } finally {
      towerFetchInFlight.current = false;
    }
  }, [language, player.educationLevel, stage.towerFloor]);
  const startSession = async () => {
    const sessionSubject = stage.kind === "tower" ? "Mathematics" : selectedSubject;
    if (!sessionSubject) return;
    setSelectedSubject(sessionSubject);
    setLoadingQuestions(true);
    const openingQuestions = stage.kind === "tower"
      ? await fetchTowerQuestions([])
      : [generateOneQuestion(sessionSubject, player.educationLevel, [], questionEpoch(), player.settings.language)];
    setQuestions(openingQuestions);
    setIndex(0);
    setScore(0);
    setWrongAnswers(0);
    setFeedback(null);
    setSelectedChoice(null);
    setDone(false);
    setSeconds(10);
    setStarted(true);
    setLoadingQuestions(false);
  };
  const answer = (choice: number) => {
    if (feedback || !currentQuestion) return;
    const correct = currentQuestion.options[choice]?.correct ?? false;
    setSelectedChoice(choice >= 0 ? choice : null);
    setFeedback(correct ? "correct" : "wrong");
    if (stage.kind === "tower") onAnswer("Mathematics", correct);
    else if (selectedSubject) onAnswer(selectedSubject, correct);
    if (correct) setScore((value) => value + 1);
    else setWrongAnswers((value) => value + 1);
    window.setTimeout(() => {
      if (index === STUDY_QUESTION_COUNT - 1) setDone(true);
      else {
        if (stage.kind !== "tower" && !questions[index + 1]) {
          const next = generateOneQuestion(selectedSubject ?? "Mathematics", player.educationLevel, questions.map((question) => question.id), questionEpoch(), player.settings.language);
          setQuestions((items) => [...items, next]);
        }
        setSeconds(10); setIndex((value) => value + 1);
      }
      setFeedback(null);
      setSelectedChoice(null);
    }, 620);
  };
  useEffect(() => {
    if (stage.kind !== "tower" || !started || done || feedback || !currentQuestion) return;
    const timer = window.setInterval(() => setSeconds((value) => { if (value <= 1) { window.clearInterval(timer); window.setTimeout(() => answer(-1), 0); return 0; } return value - 1; }), 1000);
    return () => window.clearInterval(timer);
    // Each new question intentionally restarts the Tower countdown.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion?.id, done, feedback, stage.kind, started]);
  useEffect(() => {
    if (stage.kind !== "tower" || !started || done || questions.length - index > 2 || towerFetchInFlight.current) return;
    const seenIds = questions.map((question) => question.id);
    void fetchTowerQuestions(seenIds).then((nextQuestions) => {
      setQuestions((items) => [...items, ...nextQuestions.filter((question) => !items.some((item) => item.id === question.id))]);
    });
  }, [done, fetchTowerQuestions, index, questions, stage.kind, started]);
  const subjects = stage.kind === "tower" ? (["Mathematics"] as StudySubject[]) : [...STUDY_SUBJECTS];
  return <section className={`study-screen game-screen ${stage.kind === "tower" ? "v4-tower-study" : ""}`}>
    <ScreenHeader title={stage.kind === "tower" ? t(language, "Cổng Tính toán Tower", "Tower Calculation Gate") : t(language, "Giai đoạn Học tập", "The Study Phase")} subtitle={stage.kind === "tower" ? `${stage.title} · Mathematics only · ${t(language, "10 giây mỗi câu", "10 seconds per answer")}` : `${stage.title} · ${t(language, "Chuẩn bị", "Preparation")} Grade ${player.educationLevel}`} player={player} onBack={onBack} onHome={onHome} onInfo={onInfo} onSettings={onSettings} />
      <div className="study-shell"><aside className="study-aside"><span className="section-kicker">{stage.kind === "tower" ? "RAPID CALCULATION" : "PRE-RUN PREPARATION"}</span><h2>{stage.kind === "tower" ? "The Tower accepts only Mathematics." : "Focus creates advantage."}</h2><p>{stage.lore}</p>{selectedSubject && <div className="study-subject-badge" style={{ "--subject-accent": SUBJECT_DETAILS[selectedSubject].accent } as CSSProperties}><span>{selectedSubject}</span><small>{stage.kind === "tower" ? "Buffered queue of 5 procedural questions" : "One-at-a-time generation"} · Grade {player.educationLevel}</small></div>}<div className="focus-meter-card"><div><span>Focus Meter</span><strong>{score * 20}%</strong></div><div className="meter"><span style={{ width: score * 20 + "%" }} /></div><small><Sparkles size={13} /> Projected buff: +{score * 3} Starting HP</small></div><div className="study-rules"><span><Check size={14} /> Correct: +20 XP</span><span><RefreshCw size={14} /> {stage.kind === "tower" ? "Five questions buffered; refill below two" : "Exactly one question generated per gate"}</span><span><Sparkles size={14} /> Answers reshuffle every question</span>{stage.kind === "tower" && <><span><Sigma size={14} /> Mathematics only on every floor</span><span><Timer size={14} /> Timeout counts as incorrect</span></>}</div></aside>
      <div className="blackboard">{!started && !done && <div className="subject-select subject-select-menu"><small>{stage.kind === "tower" ? "MANDATORY FOCUS" : "CHOOSE YOUR FOCUS"}</small><h2>{stage.kind === "tower" ? "Mathematics calibration" : "Select a subject"}</h2><p>{stage.kind === "tower" ? "Every floor begins with five rapid calculations. No other subject can enter the Tower." : "Each gate requests exactly one unique question with randomized answers."}</p><div className="subject-options">{subjects.map((subject) => { const details = SUBJECT_DETAILS[subject]; const Icon = details.icon; return <button type="button" key={subject} className={selectedSubject === subject ? "selected" : ""} style={{ "--subject-accent": details.accent } as CSSProperties} aria-pressed={selectedSubject === subject} onClick={() => setSelectedSubject(subject)}><span><Icon size={27} /></span><strong>{subject}</strong><small>{details.description}</small><em>ONE AT A TIME</em></button>; })}</div><div className="subject-stage-note"><Activity size={18} /><span><strong>{stage.title}</strong><small>{stage.hp} enemy HP · {stage.damage} projected attack</small></span></div><button className="gold-button subject-start-button" type="button" onClick={startSession} disabled={!selectedSubject}>Begin {selectedSubject ?? "Subject"} Session <ChevronRight size={17} /></button></div>}
          {loadingQuestions && <div className="v8-tower-loading"><RefreshCw size={28} /> Generating the calculation queue…</div>}
          {started && !done && currentQuestion && <div className="question-panel"><div className="question-meta"><span>{selectedSubject?.toUpperCase()} · QUESTION {index + 1} / {STUDY_QUESTION_COUNT}</span><span><Timer size={14} /> {stage.kind === "tower" ? `${seconds}s · ${Math.max(0, questions.length - index - 1)} buffered` : "FOCUS CHECK"}</span></div><div className={`timer-track ${stage.kind === "tower" ? "tower-timer" : ""}`}><span key={currentQuestion.id} style={stage.kind === "tower" ? { animationDuration: "10s" } : undefined} /></div><h2>{currentQuestion.prompt}</h2><div className="answer-grid">{currentQuestion.options.map((option, choice) => <button type="button" key={currentQuestion.id + "-" + option.text} disabled={Boolean(feedback)} className={feedback && option.correct ? "answer-correct" : feedback === "wrong" && selectedChoice === choice ? "answer-wrong" : feedback ? "answer-muted" : ""} onClick={() => answer(choice)}><span>{String.fromCharCode(65 + choice)}</span>{option.text}</button>)}</div>{feedback && <div className={"feedback-burst " + feedback}>{feedback === "correct" ? "+20 XP · PRECISE!" : seconds === 0 ? "TIME EXPIRED" : "RECALCULATE"}</div>}</div>}
        {done && <div className="study-result"><div className="result-sigil"><BrainCircuit size={36} /></div><small>{selectedSubject?.toUpperCase()} SESSION COMPLETE</small><h2>Focus Level: {score >= 4 ? "High" : score >= 2 ? "Steady" : "Warming Up"}</h2><p>{score} of {STUDY_QUESTION_COUNT} answers calculated correctly.</p><div className="buff-card"><Heart size={24} /><div><strong>Prepared Mind</strong><span>+{score * 3} Starting HP this battle</span></div></div><button className="gold-button" type="button" onClick={() => onComplete(score, wrongAnswers)}>Enter battle <ChevronRight size={18} /></button></div>}
      </div>
    </div>
  </section>;
}

type TutorMessage = { id: number; role: "bot" | "user"; text: string };

function QuestionSection({ player, onBack, onHome, onAnswer, onInfo, onSettings }: { player: PlayerState; onBack: () => void; onHome: () => void; onAnswer: (subject: StudySubject, correct: boolean, reward: QuestReward) => void; onInfo: () => void; onSettings: () => void }) {
  const [tab, setTab] = useState<"questions" | "evaluation">("questions");
  const [subject, setSubject] = useState<StudySubject>("Mathematics");
  const [grade, setGrade] = useState<EducationLevel>(player.educationLevel);
  const [timed, setTimed] = useState(false);
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState<AdaptiveQuestion | null>(null);
  const [answered, setAnswered] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [reward, setReward] = useState<QuestReward>({});
  const [loading, setLoading] = useState(false);
  const [nextLocked, setNextLocked] = useState(false);
  const [seconds, setSeconds] = useState(20);
  const [refreshAt, setRefreshAt] = useState(() => (questionEpoch() + 1) * 2 * 60 * 60 * 1000);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<TutorMessage[]>([{ id: 1, role: "bot", text: t(player.settings.language, "Mình là Axiom Tutor. Mình tạo từng câu hỏi và đưa gợi ý logic mà không tiết lộ đáp án.", "I’m the Axiom Tutor. I generate one question at a time and give logic hints without revealing answers.") }]);
  const seenRef = useRef<string[]>([]);
  const restrictionActive = restrictionIncomplete(player);
  const skills = useMemo(() => getSkillBonuses(player.unlockedSkills), [player.unlockedSkills]);
  const totalAnswered = STUDY_SUBJECTS.reduce((sum, item) => sum + player.subjectStats[item].answered, 0);
  const totalCorrect = STUDY_SUBJECTS.reduce((sum, item) => sum + player.subjectStats[item].correct, 0);
  const average = totalAnswered ? Math.round(totalCorrect / totalAnswered * 100) : 0;

  const loadQuestion = useCallback(async (nextSubject = subject, nextGrade = grade) => {
    setLoading(true); setFeedback(null); setSelected(null); setReward({}); setSeconds(20);
    const currentEpoch = questionEpoch();
    if (seenRef.current.some((id) => !id.startsWith(`adaptive-${currentEpoch}-`))) seenRef.current = [];
    try {
      const params = new URLSearchParams({ subject: nextSubject, grade: String(nextGrade), seen: seenRef.current.slice(-100).join(","), language: player.settings.language });
      const response = await fetch(`/api/questions?${params.toString()}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Question service unavailable");
      const data = await response.json() as { question: AdaptiveQuestion; refreshAt: number };
      seenRef.current.push(data.question.id); setCurrent(data.question); setRefreshAt(data.refreshAt);
    } catch {
      const fallback = generateOneQuestion(nextSubject, nextGrade, seenRef.current, questionEpoch(), player.settings.language);
      seenRef.current.push(fallback.id); setCurrent(fallback); setRefreshAt((fallback.epoch + 1) * 2 * 60 * 60 * 1000);
    } finally { setLoading(false); }
  }, [grade, player.settings.language, subject]);

  const begin = () => { setStarted(true); setAnswered(0); seenRef.current = []; void loadQuestion(subject, grade); };
  const chooseSubject = (nextSubject: StudySubject) => { setSubject(nextSubject); setStarted(false); setCurrent(null); setTab("questions"); seenRef.current = []; };
  const nextQuestion = useCallback(() => {
    if (nextLocked || loading) return;
    setNextLocked(true);
    setAnswered((value) => value + 1);
    void loadQuestion().finally(() => window.setTimeout(() => setNextLocked(false), 1000));
  }, [loadQuestion, loading, nextLocked]);
  const chooseAnswer = useCallback((choice: number) => {
    if (!current || feedback || loading) return;
    const correct = current.options[choice]?.correct ?? false;
    const multiplier = timed ? 1.5 : 1;
    const researchMultiplier = 1 + skills.questionRewardPercent / 100;
    const scale = multiplier * researchMultiplier;
    const gained: QuestReward = correct
      ? { gems: Math.max(1, Math.round(randomInt(1, 3) * scale)), coins: Math.round(randomInt(8, 20) * scale), knowledgePoints: Math.round(randomInt(3, 8) * scale), xp: Math.round(randomInt(10, 24) * scale) }
      : { gems: -1, coins: -10 };
    setSelected(choice); setFeedback(correct ? "correct" : "wrong"); setReward(gained); onAnswer(subject, correct, gained);
    window.setTimeout(nextQuestion, 850);
  }, [current, feedback, loading, nextQuestion, onAnswer, skills.questionRewardPercent, subject, timed]);
  useEffect(() => {
    if (!timed || !started || feedback || loading || !current) return;
    const timer = window.setInterval(() => setSeconds((value) => { if (value <= 1) { window.clearInterval(timer); window.setTimeout(() => chooseAnswer(-1), 0); return 0; } return value - 1; }), 1000);
    return () => window.clearInterval(timer);
  }, [chooseAnswer, current, feedback, loading, started, timed]);

  const sendTutorMessage = (preset?: string) => {
    const value = (preset ?? chatInput).trim();
    if (!value) return;
    const id = Date.now();
    setMessages((items) => [...items, { id, role: "user", text: value }, { id: id + 1, role: "bot", text: tutorReply(value, subject, grade, current ?? undefined, player.settings.language) }]);
    setChatInput("");
  };

  return <section className={`game-screen v2-page v4-question-lab v7-question-lab language-${player.settings.language}`}>
    <ScreenHeader title="Infinite Question Lab" subtitle={t(player.settings.language, `Grade ${grade} · tạo từng câu thích ứng · pool làm mới mỗi 2 giờ`, `Grade ${grade} · one adaptive question at a time · pool refreshes every 2 hours`)} player={player} onBack={onBack} onHome={onHome} onInfo={onInfo} onSettings={onSettings} />
    <div className="v4-question-shell"><aside className="v4-question-sidebar"><span className="section-kicker">LEARNING CONSOLE</span><h2>Question Section</h2><div className="v4-question-tabs"><button type="button" className={tab === "questions" ? "active" : ""} onClick={() => setTab("questions")}><BookOpen size={16} /> Questions</button><button type="button" className={tab === "evaluation" ? "active" : ""} onClick={() => setTab("evaluation")}><BarChart3 size={16} /> Evaluation</button></div><div className="v4-subject-list">{STUDY_SUBJECTS.map((item) => { const details = SUBJECT_DETAILS[item]; const Icon = details.icon; const stats = player.subjectStats[item]; const rate = stats.answered ? Math.round(stats.correct / stats.answered * 100) : 0; return <button type="button" key={item} className={subject === item ? "active" : ""} style={{ "--subject-accent": details.accent } as CSSProperties} onClick={() => chooseSubject(item)}><span><Icon size={19} /></span><div><strong>{item}</strong><small>{stats.answered} answered · {rate}% correct</small></div><ChevronRight size={15} /></button>; })}</div>{restrictionActive && <div className="v4-restriction-progress"><LockKeyhole size={18} /><div><strong>Play Mode locked</strong><span>Answer {Math.max(0, player.restriction.quota - player.restriction.answered)} more today.</span><div className="meter"><i style={{ width: `${Math.min(100, player.restriction.answered / player.restriction.quota * 100)}%` }} /></div><small>{player.restriction.answered} / {player.restriction.quota}</small></div></div>}{!restrictionActive && player.restriction.enabled && <div className="v4-restriction-progress complete"><Check size={18} /><div><strong>Daily quota complete</strong><span>Play Mode is unlocked for today.</span></div></div>}</aside>
      <main className="v4-question-main">{tab === "questions" ? !started ? <section className="v7-lab-prematch" style={{ "--subject-accent": SUBJECT_DETAILS[subject].accent } as CSSProperties}><span className="section-kicker">PRE-MATCH BRIEFING</span><div className="v7-prematch-icon">{(() => { const Icon = SUBJECT_DETAILS[subject].icon; return <Icon size={38} />; })()}</div><h1>Infinite {subject}</h1><p>One unique question is requested at a time. The Grade {grade} pool resets every two hours; answer order is shuffled on every prompt.</p><label><span>CHOOSE GRADE</span><select value={grade} onChange={(event) => setGrade(Number(event.target.value) as EducationLevel)}>{GRADE_LEVELS.map((item) => <option key={item} value={item}>Grade {item}</option>)}</select></label><div className="v7-timer-choice"><div><Timer size={21} /><span><strong>Timed challenge</strong><small>20 seconds per question · correct rewards ×1.5</small></span></div><button type="button" className={timed ? "toggle on" : "toggle"} onClick={() => setTimed((value) => !value)}><i /></button></div><div className="v7-prematch-rules"><span><Check size={15} /> Infinite session; leave whenever you choose</span><span><Sparkles size={15} /> Correct: Shards, RT, KP, and EXP</span><span><RotateCcw size={15} /> Wrong: −1 Shard and −10 RT, never below zero</span></div><button type="button" className="gold-button" onClick={begin}>Begin Grade {grade} Session <ChevronRight size={17} /></button></section> : <div className="v4-infinite-card" style={{ "--subject-accent": SUBJECT_DETAILS[subject].accent } as CSSProperties}><header><div><span>INFINITE {subject.toUpperCase()}</span><strong>Question {answered + 1}</strong></div><div><GraduationCap size={17} /> Grade {grade}</div></header><div className="v4-infinite-progress"><i key={current?.id} style={timed ? { animationDuration: "20s" } : { animation: "none", width: "100%" }} /></div><div className="v7-question-status"><span>Pool resets in {Math.max(0, Math.ceil((refreshAt - Date.now()) / 60000))} min</span>{timed && <strong><Timer size={15} /> {seconds}s · 1.5×</strong>}</div><h1>{loading ? "Generating one unique question…" : current?.prompt}</h1><div className="v4-answer-grid">{current?.options.map((option, choice) => <button type="button" key={`${current.id}-${option.text}`} disabled={Boolean(feedback) || loading} className={feedback && option.correct ? "correct" : feedback === "wrong" && selected === choice ? "wrong" : feedback ? "muted" : ""} onClick={() => chooseAnswer(choice)}><span>{String.fromCharCode(65 + choice)}</span><strong>{option.text}</strong></button>)}</div><footer><span><Sparkles size={15} /> {timed ? "Timed rewards ×1.5" : "Untimed accuracy mode"} · Inquiry bonus +{skills.questionRewardPercent}%</span><div><button type="button" onClick={() => { setChatOpen(true); setMessages((items) => [...items, { id: Date.now(), role: "bot", text: questionHint(current ?? undefined, subject, grade) }]); }}><Bot size={16} /> Logic hint</button><button type="button" onClick={nextQuestion} disabled={loading || nextLocked || Boolean(feedback)}><RefreshCw size={15} /> {nextLocked ? "Recalibrating…" : "New question"}</button></div></footer>{feedback && <div className={`v4-question-feedback ${feedback}`}>{feedback === "correct" ? <><Check size={22} /> +{reward.gems} Shards · +{reward.coins} RT · +{reward.knowledgePoints} KP · +{reward.xp} XP</> : <><RotateCcw size={22} /> Recalculate · −1 Shard · −10 RT</>}</div>}</div> : <div className="v4-evaluation"><header><div><span className="section-kicker">LEARNING EVALUATION</span><h1>{average}% overall accuracy</h1><p>Calculated from every saved answer across all four subjects.</p></div><div className="v4-average-ring" style={{ "--score": average } as CSSProperties}><strong>{average}%</strong><span>{totalCorrect}/{totalAnswered || 0}</span></div></header><div className="v4-score-grid">{STUDY_SUBJECTS.map((item) => { const details = SUBJECT_DETAILS[item]; const stats = player.subjectStats[item]; const rate = stats.answered ? Math.round(stats.correct / stats.answered * 100) : 0; return <article key={item} style={{ "--subject-accent": details.accent } as CSSProperties}><div><strong>{item}</strong><span>{stats.correct} correct / {stats.answered} answered</span></div><em>{rate}%</em><div className="meter"><i style={{ width: `${rate}%` }} /></div><small>{stats.answered < 5 ? "Answer 5 or more for a stronger evaluation." : rate >= 80 ? "Mastery range" : rate >= 60 ? "Developing steadily" : "Recommended focus area"}</small></article>; })}</div></div>}</main></div>
    <button className={`v4-tutor-orb ${chatOpen ? "open" : ""}`} type="button" onClick={() => setChatOpen((value) => !value)} aria-label="Open Axiom AI Tutor"><span aria-hidden="true">🤖</span><b>AI Tutor</b></button>{chatOpen && <aside className="v4-tutor-panel" aria-label="Axiom AI Tutor chat"><header><div><Bot size={20} /><span><strong>Axiom AI Tutor</strong><small>CONTEXT: {subject.toUpperCase()} · GRADE {grade}</small></span></div><button type="button" onClick={() => setChatOpen(false)} aria-label="Close tutor"><X size={17} /></button></header><div className="v4-chat-messages">{messages.slice(-8).map((message) => <p key={message.id} className={message.role}><span>{message.role === "bot" ? "🤖" : "YOU"}</span>{message.text}</p>)}</div><div className="v4-tutor-actions"><button type="button" onClick={() => sendTutorMessage("Give me a step-by-step hint for the active question without revealing the final answer.")}>Context hint</button><button type="button" onClick={() => sendTutorMessage("Generate a new question at my current grade.")}>How generation works</button></div><form onSubmit={(event) => { event.preventDefault(); sendTutorMessage(); }}><input value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder={`Ask a Grade ${grade} ${subject} question…`} /><button type="submit" aria-label="Send message"><ChevronRight size={18} /></button></form></aside>}
  </section>;
}

function equationResult(cards: GameCard[], gravityInversion: boolean) {
  if (cards.length !== 3 || cards[0].kind !== "number" || cards[1].kind !== "operator" || cards[2].kind !== "number") return null;
  const left = Number(cards[0].symbol);
  const right = Number(cards[2].symbol);
  if (!Number.isFinite(left) || !Number.isFinite(right)) return null;
  const printed = cards[1].symbol;
  const operator = gravityInversion && printed === "+" ? "−" : printed;
  if (operator === "+") return { value: left + right, operator, step: `${left} + ${right} = ${left + right}` };
  if (operator === "−") return { value: Math.abs(left - right), operator, step: `|${left} − ${right}| = ${Math.abs(left - right)}` };
  if (operator === "×") return { value: left * right, operator, step: `${left} × ${right} = ${left * right}` };
  if (operator === "÷" && right !== 0 && left % right === 0) return { value: left / right, operator, step: `${left} ÷ ${right} = ${left / right}` };
  return null;
}

function isPrime(value: number) { if (value < 2 || !Number.isInteger(value)) return false; for (let divisor = 2; divisor <= Math.sqrt(value); divisor += 1) if (value % divisor === 0) return false; return true; }

function BossAvatar({ stage }: { stage: Stage }) {
  const style = stage.bossStyle ?? (stage.chapter === 1 ? "fraction" : stage.chapter === 2 ? "algebra" : stage.chapter === 3 ? "geometry" : "fallacy");
  const glyphs: Record<string, string> = { fraction: "⅟", algebra: "x²", geometry: "◉", fallacy: "∄", probability: "%", chemistry: "⚗", physics: "Δp", biology: "DNA", memory: "Ψ", axiom: "Σ", tower: String(stage.towerFloor ?? "∞") };
  const glyph = glyphs[style] ?? "∄";
  return <div className={`v3-boss-avatar boss-${style} ${stage.kind}`} aria-label={`${stage.title} enemy design`}><i className="orbit orbit-a" /><i className="orbit orbit-b" /><span>{glyph}</span><b className="boss-crown" /><b className="boss-eye" /><b className="boss-wings" /></div>;
}

function Combat({ stage: sourceStage, player, focus, onBack, onHome, onVictory, onAbility, onPerfectParry, onMadScientist, onQuestEvent, onInfo, onSettings, playTone }: { stage: Stage; player: PlayerState; focus: number; onBack: () => void; onHome: () => void; onVictory: (maxHit: number, perfectEquilibrium?: boolean) => void; onAbility: () => void; onPerfectParry: () => void; onMadScientist: () => void; onQuestEvent: (metric: string, amount?: number) => void; onInfo: () => void; onSettings: () => void; playTone: (kind: "hit" | "shield" | "heal") => void }) {
  const language = player.settings.language;
  const stage = useMemo(() => ({ ...sourceStage, ...stageCopy(sourceStage, language) }), [sourceStage, language]);
  const combatDeck = useMemo(() => shuffleItems(buildCombatDeck(player)), [player]);
  const openingDraw = useMemo(() => restoreCombatHandRatio([], combatDeck), [combatDeck]);
  const skills = useMemo(() => getSkillBonuses(player.unlockedSkills), [player.unlockedSkills]);
  const modifiers = stage.modifiers ?? [];
  const hasModifier = (id: string) => modifiers.some((modifier) => modifier.id === id);
  const [matchApBonus, setMatchApBonus] = useState(0);
  const maxAp = Math.max(1, 3 + skills.maxApBonus + matchApBonus - (hasModifier("time-dilation") ? 1 : 0));
  const queuePreview = 3 + skills.queuePreviewBonus;
  const [hand, setHand] = useState<GameCard[]>(openingDraw.hand);
  const [queue, setQueue] = useState<GameCard[]>(openingDraw.queue);
  const [equation, setEquation] = useState<GameCard[]>([]);
  const [enemyHp, setEnemyHp] = useState(stage.hp);
  const [enemyShield, setEnemyShield] = useState(stage.kind === "boss" ? Math.round(stage.hp * .22) : stage.kind === "elite" ? 14 : stage.kind === "tower" ? 8 + (stage.towerFloor ?? 1) * 2 : 0);
  const maxPlayerHp = 80 + focus * 3 + skills.maxHp;
  const [playerHp, setPlayerHp] = useState(maxPlayerHp);
  const [shield, setShield] = useState(skills.startingShield);
  const [ap, setAp] = useState(maxAp);
  const [turn, setTurn] = useState(1);
  const [frozen, setFrozen] = useState<string | null>(null);
  const [weaken, setWeaken] = useState(0);
  const [impact, setImpact] = useState<"hit" | "shield" | "heal" | null>(null);
  const [floatText, setFloatText] = useState("");
  const [maxHit, setMaxHit] = useState(0);
  const [defeated, setDefeated] = useState(false);
  const [enemyHit, setEnemyHit] = useState<"damage" | "parry" | null>(null);
  const [enemyDamageText, setEnemyDamageText] = useState("");
  const [parryReady, setParryReady] = useState(false);
  const [mulligansUsed, setMulligansUsed] = useState(0);
  const [lastComboDamage, setLastComboDamage] = useState(0);
  const [radiationActive, setRadiationActive] = useState(false);
  const [enemyFrozenTurns, setEnemyFrozenTurns] = useState(0);
  const [catReady, setCatReady] = useState(false);
  const [helixReady, setHelixReady] = useState(false);
  const [helixUsed, setHelixUsed] = useState(false);
  const [abilityPlayedThisTurn, setAbilityPlayedThisTurn] = useState(false);
  const [apAlert, setApAlert] = useState(`${maxAp} AP READY`);
  const [autoEnd, setAutoEnd] = useState(false);
  const [turnDamage, setTurnDamage] = useState(0);
  const turnDamageRef = useRef(0);
  const turnCardsPlayed = useRef(0);
  const madScientistTriggered = useRef(false);
  const [logs, setLogs] = useState<string[]>([`Lore: ${stage.lore}`, `Turn 1 · ${maxAp} AP available.`]);
  const result = equationResult(equation, hasModifier("gravity-inversion"));
  const selectivePreview = queue.slice(0, queuePreview);
  const incomingDamage = Math.max(0, stage.damage + Math.floor(turn / 2) + (hasModifier("recursive-pressure") ? Math.max(0, turn - 1) * 2 : 0) - weaken);
  const busy = Boolean(impact || enemyHit);
  const addLog = useCallback((message: string) => setLogs((current) => [...current.slice(-10), message]), []);

  const showImpact = (type: "hit" | "shield" | "heal", text: string) => { setImpact(type); setFloatText(text); playTone(type); window.setTimeout(() => { setImpact(null); setFloatText(""); }, 620); };
  const warnAp = (next: number, allowAuto = true) => { setAp(next); setApAlert(next === 0 ? "0 AP · AUTO ENDING TURN" : `${next} AP REMAINING`); setAutoEnd(allowAuto && next === 0); window.setTimeout(() => setApAlert((current) => current.startsWith(String(next)) || next === 0 ? `${next} / ${maxAp} AP` : current), 1250); };
  const cardCost = (card: GameCard) => {
    const taxed = effectiveCardCost(card) + (card.kind === "ability" && hasModifier("entropy-tax") ? 1 : 0);
    if (card.kind === "ability" && skills.freeFirstAbility && !abilityPlayedThisTurn) return 0;
    return card.kind === "ability" ? Math.max(0, taxed - skills.abilityDiscount) : taxed;
  };

  const cycleCards = (used: GameCard[]) => {
    const next = cycleCombatCards(hand, queue, used);
    setHand(next.hand);
    setQueue(next.queue);
  };

  const completeVictory = useCallback((hit: number, equilibrium = false) => {
    if (stage.kind === "boss" && turn < 3) onQuestEvent("speedBoss");
    onVictory(hit, equilibrium);
  }, [onQuestEvent, onVictory, stage, turn]);

  const strike = (damage: number, piercing = false, finishingAp = ap) => {
    const total = Math.max(0, Math.round(damage));
    const blocked = piercing ? 0 : Math.min(enemyShield, total);
    const hpDamage = total - blocked;
    if (blocked) setEnemyShield((current) => Math.max(0, current - total));
    const remaining = Math.max(0, enemyHp - hpDamage);
    setEnemyHp(remaining);
    setMaxHit((current) => Math.max(current, hpDamage));
    showImpact("hit", blocked ? `−${hpDamage} · ${blocked} BLOCKED` : `−${hpDamage}`);
    if (remaining === 0) window.setTimeout(() => completeVictory(Math.max(maxHit, hpDamage), stage.kind === "boss" && playerHp === 1 && finishingAp === 0), 720);
    return remaining;
  };

  const endTurn = useCallback((manualSkip = false) => {
    if (busy || defeated) return;
    if (manualSkip && ap >= 2) onQuestEvent("tacticalRetreats");
    setAutoEnd(false);
    const refreshed = endTurnRedraw(hand, queue);
    setHand(refreshed.hand); setQueue(refreshed.queue);
    addLog(`${manualSkip ? "Skip Turn" : "End Turn"}: discarded 2 random cards and drew 2 new cards.`);
    turnDamageRef.current = 0; turnCardsPlayed.current = 0; setTurnDamage(0); madScientistTriggered.current = false;
    setEquation([]);
    let remainingEnemy = enemyHp;
    if (radiationActive) {
      const drain = Math.max(1, Math.ceil(stage.hp * .05));
      remainingEnemy = Math.max(0, enemyHp - drain);
      setEnemyHp(remainingEnemy);
      addLog(`Radium Queen: radiation drains ${drain} HP (5% max HP).`);
      if (remainingEnemy === 0) { window.setTimeout(() => completeVictory(Math.max(maxHit, drain)), 520); return; }
    }
    if (enemyFrozenTurns > 0) {
      setEnemyHit("parry");
      setEnemyDamageText(`ABSOLUTE ZERO · ${enemyFrozenTurns - 1} FROZEN TURN${enemyFrozenTurns - 1 === 1 ? "" : "S"} LEFT`);
      setEnemyFrozenTurns((value) => Math.max(0, value - 1));
      addLog("Absolute Zero: the enemy and its deck cannot act.");
      playTone("shield");
    } else if (parryReady) {
      setEnemyHit("parry");
      setEnemyDamageText("PERFECT PARRY · STUNNED");
      setParryReady(false);
      addLog(`Perfect Parry: ${incomingDamage} matched exactly. Enemy attack nullified and turn skipped.`);
      playTone("shield");
    } else {
      const absorbed = Math.min(shield, incomingDamage);
      const spentShield = Math.ceil(absorbed * (1 - skills.shieldRetention / 100));
      const hpDamage = incomingDamage - absorbed;
      let nextHp = Math.max(0, playerHp - hpDamage);
      setShield((current) => Math.max(0, current - spentShield));
      setEnemyHit("damage");
      if (nextHp === 0 && helixReady && !helixUsed) {
        nextHp = Math.ceil(maxPlayerHp * .5);
        setHelixUsed(true);
        setHelixReady(false);
        setEnemyDamageText(`HELIX REVIVAL · ${nextHp} HP`);
        addLog(`Helix Weaver: knockout reversed at ${nextHp} HP.`);
      } else if (nextHp === 0 && catReady) {
        const reflected = Math.random() >= .5;
        setCatReady(false);
        nextHp = playerHp;
        if (reflected) {
          const afterReflect = Math.max(0, remainingEnemy - incomingDamage);
          setEnemyHp(afterReflect);
          setMaxHit((current) => Math.max(current, incomingDamage));
          setEnemyDamageText(`QUANTUM REFLECT · ${incomingDamage} RETURNED`);
          addLog(`Schrödinger's Cat: fatal hit reflected for ${incomingDamage} damage.`);
          if (afterReflect === 0) window.setTimeout(() => completeVictory(Math.max(maxHit, incomingDamage)), 620);
        } else {
          setEnemyDamageText("QUANTUM DODGE · FATAL HIT NULLIFIED");
          addLog("Schrödinger's Cat: fatal hit occupied the dodge state.");
        }
      } else {
        setEnemyDamageText(absorbed ? `−${hpDamage} HP · ${absorbed} BLOCKED` : `−${hpDamage} HP`);
        addLog(`Enemy: ${incomingDamage} incoming − ${absorbed} Shield = ${hpDamage} HP damage.${skills.shieldRetention ? ` ${skills.shieldRetention}% Shield retention applied.` : ""}`);
      }
      setPlayerHp(nextHp);
      playTone("hit");
      if (nextHp === 0) setDefeated(true);
    }
    setWeaken(0);
    setAbilityPlayedThisTurn(false);
    setAp(maxAp);
    setApAlert(`${maxAp} AP READY`);
    setTurn((current) => current + 1);
    const available = hand.filter((card) => card.id !== frozen);
    setFrozen(enemyFrozenTurns > 0 ? null : available[Math.floor(Math.random() * Math.max(1, available.length))]?.id ?? null);
    window.setTimeout(() => { setEnemyHit(null); setEnemyDamageText(""); }, 900);
  }, [addLog, ap, busy, catReady, completeVictory, defeated, enemyFrozenTurns, enemyHp, frozen, hand, helixReady, helixUsed, incomingDamage, maxAp, maxHit, maxPlayerHp, onQuestEvent, parryReady, playTone, playerHp, queue, radiationActive, shield, skills.shieldRetention, stage]);

  useEffect(() => { if (!autoEnd || busy || defeated || enemyHp <= 0) return; const timer = window.setTimeout(endTurn, 900); return () => window.clearTimeout(timer); }, [autoEnd, busy, defeated, endTurn, enemyHp]);

  const playAbility = (card: GameCard) => {
    const cost = cardCost(card);
    if (frozen === card.id || ap < cost || busy) return;
    let nextAp = Math.max(0, ap - cost);
    onAbility();
    turnCardsPlayed.current += 1;
    if (card.tier === "Breakthrough") onQuestEvent("breakthroughCards");
    setAbilityPlayedThisTurn(true);
    addLog(`${card.name}: ${card.ability}${hasModifier("entropy-tax") ? ` Cost ${cost} AP with Entropy Tax.` : ""}`);
    let remainingEnemyHp = enemyHp;
    const scaledPower = Math.round(card.power * (1 + cardLevelBonus(player.cardLevels[card.id] ?? 1)));
    if (card.effect === "shield") { setShield((current) => current + scaledPower); if (card.id === "golden-ratio") setPlayerHp((current) => Math.min(maxPlayerHp, current + 8)); showImpact("shield", `+${scaledPower} SHIELD`); }
    else if (card.effect === "heal") { setPlayerHp((current) => Math.min(maxPlayerHp, current + scaledPower)); if (card.id === "regeneration-ward") setShield((current) => current + 6); showImpact("heal", `+${scaledPower} HP`); }
    else if (card.effect === "weaken") { remainingEnemyHp = strike(scaledPower, false, nextAp); setWeaken(6); }
    else if (card.effect === "energy") { if (scaledPower > 0) remainingEnemyHp = strike(scaledPower, false, nextAp); else showImpact("shield", "ENERGY RESTORED"); nextAp = Math.min(maxAp, nextAp + (card.id === "atp-surge" ? 2 : 1)); }
    else if (card.effect === "draw") { setPlayerHp((current) => Math.min(maxPlayerHp, current + scaledPower)); showImpact("heal", `CYCLED · +${scaledPower} HP`); }
    else if (card.effect === "special") {
      if (card.special === "euler") remainingEnemyHp = strike(scaledPower + Math.ceil(Math.sqrt(stage.hp) * 2), true, nextAp);
      if (card.special === "infinity") remainingEnemyHp = strike(Math.max(scaledPower, lastComboDamage * 2), false, nextAp);
      if (card.special === "radium") { setRadiationActive(true); remainingEnemyHp = strike(Math.max(1, Math.ceil(stage.hp * .05)), true, nextAp); }
      if (card.special === "absolute-zero") { setEnemyFrozenTurns(2); showImpact("shield", "BOSS FROZEN · 2 TURNS"); }
      if (card.special === "newton") {
        const equalized = Math.min(enemyHp, playerHp);
        const dealt = enemyHp - equalized;
        setEnemyHp(equalized); setEnemyShield(0); setMaxHit((current) => Math.max(current, dealt)); remainingEnemyHp = equalized;
        showImpact("hit", `HP EQUALIZED · −${dealt}`);
        if (equalized === 0) window.setTimeout(() => completeVictory(Math.max(maxHit, dealt), stage.kind === "boss" && playerHp === 1 && nextAp === 0), 720);
      }
      if (card.special === "schrodinger") { setCatReady(true); showImpact("shield", "QUANTUM SURVIVAL ARMED"); }
      if (card.special === "helix") { setHelixReady(true); showImpact("heal", "DNA REVIVAL STORED"); }
      if (card.special === "mitochondria") { setMatchApBonus((value) => Math.max(1, value)); nextAp = Math.min(maxAp + 1, nextAp + 1); showImpact("shield", "+1 MAX AP · THIS MATCH"); }
    }
    else { remainingEnemyHp = strike(scaledPower, card.id === "euclid-prime", nextAp); if (card.id === "vanguard-paladin" || card.id === "axiom-dragon") setShield((current) => current + (card.id === "axiom-dragon" ? 20 : 8)); }
    cycleCards([card]);
    setFrozen(null);
    warnAp(nextAp, remainingEnemyHp > 0);
  };

  const selectCard = (card: GameCard) => {
    if (frozen === card.id || busy) return;
    if (card.kind === "ability") { playAbility(card); return; }
    if (equation.some((item) => item.id === card.id) || equation.length >= 3) return;
    setEquation((items) => [...items, card]);
  };

  const execute = () => {
    if (!result || ap < 1 || busy) return;
    let damage = result.value;
    const mathLog = [`Order of operations: ${result.step}.`];
    let gainedShield = 0;
    let gainedHp = 0;
    let gainedAp = 0;
    if (result.operator === "÷") { damage = result.value * 3 + 10; mathLog.push(`Division mastery: ${result.value} × 3 + 10 = ${damage}.`); }
    for (const card of equation) {
      if (card.effect === "bonus" && !(card.id === "pentagon-guard" && result.value % 5 !== 0)) { const bonus = Math.round(card.power * (1 + cardLevelBonus(player.cardLevels[card.id] ?? 1))); damage += bonus; mathLog.push(`${card.name} Lv.${player.cardLevels[card.id] ?? 1}: +${bonus} damage.`); }
      if (card.effect === "shield" && !(card.id === "zero-keeper" && result.value !== 0)) gainedShield += card.power;
      if (card.effect === "heal") gainedHp += card.power;
      if (card.effect === "energy" && result.operator === "÷") gainedAp += card.power;
      if (card.id === "six-sage") gainedShield += 2;
    }
    if (skills.equationFlat) { damage += skills.equationFlat; mathLog.push(`Algebra branch: +${skills.equationFlat} flat damage.`); }
    if (skills.equationPercent) { damage *= 1 + skills.equationPercent / 100; mathLog.push(`Algebra mastery: ×${(1 + skills.equationPercent / 100).toFixed(2)} total damage.`); }
    if (equation.every((card) => card.subject === equation[0]?.subject)) { damage *= 1.1; mathLog.push("Element match: ×1.10 damage."); }
    if (hasModifier("prime-lock") && !isPrime(result.value)) { damage *= .75; mathLog.push("Prime Lock: non-prime result × 75%."); }
    const matchedParry = result.value === incomingDamage && !parryReady;
    if (matchedParry) { setParryReady(true); onPerfectParry(); mathLog.push(`Perfect Parry armed: ${result.value} exactly matches ${incomingDamage} incoming.`); }
    const refunded = skills.equationRefundChance > 0 && Math.random() * 100 < skills.equationRefundChance ? 1 : 0;
    const nextAp = Math.min(maxAp, ap - 1 + gainedAp + refunded);
    if (refunded) mathLog.push(`Calculus branch: ${skills.equationRefundChance}% refund succeeded (+1 AP).`);
    if (gainedShield) setShield((current) => current + gainedShield);
    if (gainedHp) setPlayerHp((current) => Math.min(maxPlayerHp, current + gainedHp));
    const used = [...equation];
    turnCardsPlayed.current += used.length;
    if (turnCardsPlayed.current >= 4) onQuestEvent("pemdasChains");
    setEquation([]);
    cycleCards(used);
    setFrozen(null);
    const finalDamage = Math.round(damage);
    if (stage.kind === "tower") onQuestEvent("towerDamage", finalDamage);
    turnDamageRef.current += finalDamage;
    setTurnDamage(turnDamageRef.current);
    if (turnDamageRef.current > 100 && !madScientistTriggered.current) { madScientistTriggered.current = true; onMadScientist(); mathLog.push(`Achievement unlocked: The Mad Scientist · ${turnDamageRef.current} calculation damage this turn.`); }
    setLastComboDamage(finalDamage);
    const remaining = strike(finalDamage, result.operator === "−" || result.operator === "÷", nextAp);
    mathLog.push(`Final damage: ${finalDamage}${result.operator === "−" || result.operator === "÷" ? " (piercing)" : ""}.`);
    mathLog.forEach(addLog);
    warnAp(nextAp, remaining > 0);
  };

  const mulligan = () => {
    const charges = 1 + skills.mulliganBonus;
    if (mulligansUsed >= charges || ap < 1 || busy) return;
    const redraw = restoreCombatHandRatio([], shuffleItems([...queue, ...hand]));
    setHand(redraw.hand);
    setQueue(redraw.queue);
    setEquation([]);
    setMulligansUsed((value) => value + 1);
    addLog("Recalculate: discarded the hand, drew the visible queue first, and paid 1 AP.");
    warnAp(ap - 1);
  };

  const mulliganCharges = 1 + skills.mulliganBonus;
  return <section className={`combat-screen game-screen v3-combat language-${language} ${impact ? `impact-${impact}` : ""} ${enemyHit === "damage" ? "enemy-strike" : ""}`}>
    <header className="combat-header"><button className="icon-button" type="button" onClick={onBack}><ChevronLeft size={19} /></button><Brand onHome={onHome} compact /><span>{stage.kind === "tower" ? `ENDLESS TOWER · FLOOR ${stage.towerFloor}` : `CHAPTER ${stage.chapter}`} · {stage.title.toUpperCase()}</span><div className="v2-combat-head-actions"><span><Timer size={15} /> TURN {turn}</span><button className="icon-button" type="button" onClick={onInfo}><CircleHelp size={17} /></button><button className="icon-button" type="button" onClick={onSettings}><Settings size={17} /></button></div></header>
    <div className="combat-arena" aria-hidden="true"><div className="arena-ring" /><div className="combat-stars" /></div>
    <div className="v3-combat-layout">
      <aside className="v3-combat-guide"><GuideCharacter id="orion" compact /><div className="v3-lore-note"><BookOpen size={15} /><p>{stage.lore}</p></div>{modifiers.length > 0 && <div className="v3-modifier-stack"><small>FLOOR MODIFIERS</small>{modifiers.map((modifier) => <span key={modifier.id}><b>{modifier.symbol}</b><em><strong>{modifier.name}</strong>{modifier.description}</em></span>)}</div>}<div className="v4-skill-readout"><strong>ACTIVE SKILL EFFECTS</strong><span>Max AP: {maxAp}{skills.maxApBonus ? ` · +${skills.maxApBonus} Skill Tree` : ""}{hasModifier("time-dilation") ? " · −1 Time Dilation" : ""}</span><span>Equation +{skills.equationFlat} then +{skills.equationPercent}%</span><span>Instant AP recovery: {skills.equationRefundChance}%</span><span>Turn damage: {turnDamage} / 101 Mad Scientist</span></div></aside>
      <main className="v3-battle-core"><div className="combat-enemy v3-enemy"><div className="intent-chip"><Swords size={14} /> {enemyFrozenTurns ? `FROZEN: ${enemyFrozenTurns} TURN` : `INCOMING: ${incomingDamage} DAMAGE`} {parryReady ? "· PARRY ARMED" : ""}</div><BossAvatar stage={stage} /><h2>{stage.title.toUpperCase()}</h2><div className="enemy-bars"><div className="hp-bar"><span style={{ width: `${enemyHp / stage.hp * 100}%` }} /></div><strong>{enemyHp} / {stage.hp} HP</strong>{enemyShield > 0 && <div className="v4-enemy-shield"><div><i style={{ width: `${Math.min(100, enemyShield / Math.max(1, stage.hp * .22) * 100)}%` }} /></div><span><Shield size={12} /> {enemyShield} Shield</span></div>}</div>{impact === "hit" && <div className="v2-damage-float">{floatText}</div>}{radiationActive && <span className="v4-boss-status">☢ 5% radiation drain</span>}</div>
        <div className={`equation-zone combat-equation v3-equation ${result ? "valid" : ""}`}><span className="zone-label"><Sigma size={15} /> EQUATION ZONE</span><div className="equation-slots">{[0, 1, 2].map((slot) => <span className={equation[slot] ? "filled" : ""} key={slot}>{equation[slot]?.symbol ?? "·"}</span>)}{result && <b>= {result.value}</b>}</div><div className="equation-actions"><button type="button" className="clear-button" onClick={() => setEquation([])} disabled={!equation.length}><X size={14} /> Clear</button><button type="button" className="execute-button" onClick={execute} disabled={!result || ap < 1}><Zap size={17} /> Execute · 1 AP</button></div>{result && <small className={result.value === incomingDamage ? "parry-match" : ""}>{result.value === incomingDamage ? "PERFECT PARRY MATCH" : result.step}</small>}</div>
        <div className="player-combat-panel v3-player-panel"><div className="player-avatar"><UserRound size={28} />{shield > 0 && <span className="shield-dome"><Shield size={17} /></span>}</div><div><strong>SCHOLAR · LEVEL {player.level}</strong><div className="player-hp"><span style={{ width: `${playerHp / maxPlayerHp * 100}%` }} /></div><small>{playerHp} / {maxPlayerHp} HP · {shield} Shield {helixReady && !helixUsed ? "· DNA REVIVE" : ""} {catReady ? "· QUANTUM GUARD" : ""}</small></div>{impact && impact !== "hit" && <div className={`v2-player-float ${impact}`}>{floatText}</div>}</div>
      </main>
      <aside className="v3-combat-rail"><section className="v2-next-cards v3-next-cards"><span>DRAW FORECAST</span><p>Next cards in current deck order</p><div>{selectivePreview.slice(0, queuePreview).map((card, index) => <div key={`${card.id}-${index}`} title={card.ability}><em>{index + 1}</em><strong>{card.symbol}</strong><small>{card.name}</small></div>)}</div></section><section className="v3-combat-log"><header><ScrollText size={14} /><span>COMBAT LOG</span></header><div>{logs.map((entry, index) => <p key={`${entry}-${index}`}>{entry}</p>)}</div></section></aside>
      <div className="combat-hand v2-hand v3-hand">{hand.map((card) => { const selected = equation.some((item) => item.id === card.id); const isFrozen = frozen === card.id; const cost = cardCost(card); const subjectClass = card.subject.toLowerCase().replace(/[^a-z0-9]+/g, "-"); return <button type="button" key={card.id} onClick={() => selectCard(card)} disabled={isFrozen || selected || (card.kind === "ability" && ap < cost)} className={`v2-battle-card card-container subject-${subjectClass} tier-${card.tier.toLowerCase()} rarity-${card.rarity.toLowerCase()} ${selected ? "selected" : ""} ${isFrozen ? "frozen" : ""}`}><div><span>{card.tier} · {card.rarity}</span><em>{card.kind === "ability" ? `${cost} AP` : "COMBO"}</em></div><strong>{card.symbol}</strong><h3>{card.name}</h3><p>{card.ability}</p>{isFrozen && <b>FROZEN</b>}</button>; })}</div>
      <footer className="combat-controls v2-combat-controls v3-combat-controls"><div className="ap-counter v3-ap"><span>ACTION POINTS</span><div>{Array.from({ length: maxAp }).map((_, number) => <i className={number < ap ? "active" : ""} key={number} />)}</div><strong>{ap} / {maxAp}</strong><small>{apAlert}</small></div><button type="button" className="v3-mulligan" onClick={mulligan} disabled={mulligansUsed >= mulliganCharges || ap < 1}><RotateCcw size={17} /><span><strong>Recalculate</strong><small>{mulligansUsed >= mulliganCharges ? "All charges used" : `${mulliganCharges - mulligansUsed} redraw${mulliganCharges - mulligansUsed === 1 ? "" : "s"} left · 1 AP`}</small></span></button><div className="deck-counter v5-hand-ratio"><span>2 BASE</span><span>1 OP + 1 TACTICAL</span><span>1 BREAKTHROUGH</span></div><button className="end-turn-button" type="button" onClick={() => endTurn(true)} disabled={busy}>Skip / End Turn <ChevronRight size={17} /></button></footer>
    </div>
    {enemyHit && <div className={`v3-enemy-hit-vfx ${enemyHit}`}><i /><i /><i /><strong>{enemyDamageText}</strong></div>}{defeated && <div className="v2-defeat"><div className="v2-skull">×</div><span>THEORY DISPROVEN</span><h2>The anomaly resisted this proof.</h2><button type="button" className="gold-button" onClick={onBack}>Return</button></div>}
  </section>;
}

function Victory({ reward, maxHit, player, onHub, onHome, onInfo, onShare }: { reward: RewardSummary; maxHit: number; player: PlayerState; onHub: () => void; onHome: () => void; onInfo: () => void; onShare: () => void }) {
  return <section className="victory-screen game-screen"><div className="victory-shards" aria-hidden="true">{Array.from({ length: 14 }).map((_, index) => <i key={index} />)}</div><div className="v3-victory-nav"><Brand onHome={onHome} /><button className="icon-button" type="button" onClick={onInfo}><CircleHelp size={18} /></button></div><div className="victory-content"><div className="victory-crown"><Trophy size={38} /></div><small>{reward.towerFloor ? `TOWER FLOOR ${reward.towerFloor} CLEARED` : reward.replay ? "REPLAY COMPLETE" : "FIRST CLEAR"}</small><h1>TRIAL CLEARED</h1><p>{reward.stageTitle} has been recalculated.</p><div className="run-score"><div><span>MAX COMBO</span><strong>{maxHit}</strong></div><div><span>SCHOLAR LEVEL</span><strong>{player.level}</strong></div><div><span>{reward.towerFloor ? "TOWER BEST" : "PROGRESS"}</span><strong>{reward.towerFloor ? player.towerBest : player.clearedStages.length}</strong></div></div><div className="loot-panel"><span className="loot-label">RESEARCH YIELD</span><div className="loot-items"><div><Sparkles size={24} /><span><strong>+{reward.xp ?? 0}{reward.chapterXp ? ` + ${reward.chapterXp}` : ""}</strong><small>XP {reward.chapterXp ? "· chapter bonus" : ""}</small></span></div><div><Coins size={24} /><span><strong>+{reward.coins ?? 0}</strong><small>Research Tokens</small></span></div><div><Gem size={24} /><span><strong>+{reward.gems ?? 0}</strong><small>Shards</small></span></div>{reward.knowledgePoints ? <div><BookOpen size={24} /><span><strong>+{reward.knowledgePoints}</strong><small>Knowledge Points</small></span></div> : null}{reward.summonTickets ? <div><Ticket size={24} /><span><strong>+{reward.summonTickets}</strong><small>Limited Tickets</small></span></div> : null}{reward.skillPoints ? <div><Star size={24} /><span><strong>+{reward.skillPoints}</strong><small>Skill Points</small></span></div> : null}</div></div><div className="victory-actions"><button type="button" className="secondary-button" onClick={onShare}><Share2 size={17} /> Share accessible link</button><button type="button" className="gold-button" onClick={onHub}>Return to Archives <ChevronRight size={18} /></button></div></div></section>;
}

// Retained as a migration-safe fallback for profiles created before the tiered Codex.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function DeckBuilder({ player, onBack, onHome, onSave, onInfo, onSettings }: { player: PlayerState; onBack: () => void; onHome: () => void; onSave: (deck: string[]) => void; onInfo: () => void; onSettings: () => void }) {
  const [draft, setDraft] = useState(player.deckIds.length === 8 ? player.deckIds : STARTER_DECK.slice(0, 8));
  const [slot, setSlot] = useState(0);
  const [filter, setFilter] = useState("All");
  const [status, setStatus] = useState<"All" | "Owned" | "Missing">("All");
  const [saved, setSaved] = useState(false);
  const cards = CARD_POOL.filter((card) => (filter === "All" || card.rarity === filter || card.subject === filter) && (status === "All" || (status === "Owned") === ((player.ownedCards[card.id] ?? 0) > 0)));
  const choose = (id: string) => { if (!(player.ownedCards[id] > 0)) return; if (draft.includes(id)) { setSlot(draft.indexOf(id)); return; } const next = [...draft]; next[slot] = id; setDraft(next); setSaved(false); setSlot((current) => (current + 1) % 8); };
  const averageCost = draft.reduce((sum, id) => sum + CARD_BY_ID[id].cost, 0) / Math.max(1, draft.length);
  const discovered = CARD_POOL.filter((card) => (player.ownedCards[card.id] ?? 0) > 0).length;
  return <section className="game-screen v2-page"><ScreenHeader title="The Codex" subtitle="8-card deck builder · complete card index" player={player} onBack={onBack} onHome={onHome} onInfo={onInfo} onSettings={onSettings} /><div className="v3-deck-guide"><GuideCharacter id="turing" compact /><div><strong>DECK VALIDATION</strong><span>{draft.length === 8 ? "Compilation successful · 8 unique cards" : "Compilation error"}</span><p>{discovered} / {CARD_POOL.length} cards discovered. Missing records retain their rarity and ability preview.</p></div></div><div className="v2-deck-shell v3-deck-shell"><section className="v2-active-deck"><header><div><span className="section-kicker">ACTIVE THESIS</span><h2>Fast-cycle deck</h2><p>Select a slot, then choose an owned card.</p></div><div className="v2-deck-stats"><span><strong>{draft.length}/8</strong> CARDS</span><span><strong>{averageCost.toFixed(1)}</strong> AVG AP</span></div></header><div className="v2-deck-slots">{draft.map((id, index) => { const card = CARD_BY_ID[id]; return <button type="button" key={index} className={`${slot === index ? "selected" : ""} rarity-${card.rarity.toLowerCase()}`} onClick={() => setSlot(index)}><em>{index + 1}</em><strong>{card.symbol}</strong><span>{card.name}</span><small>{card.rarity} · {card.cost} AP</small></button>; })}</div><div className="v2-deck-save"><span className="valid"><Check size={17} />Battle-ready deck</span><button className="gold-button" type="button" onClick={() => { onSave(draft); setSaved(true); }}><Save size={16} />{saved ? "Deck Saved" : "Save Deck"}</button></div></section><section className="v2-collection"><header><div><span className="section-kicker">COMPLETE CODEX</span><h2>{cards.length} indexed cards</h2><div className="v3-codex-status">{(["All", "Owned", "Missing"] as const).map((item) => <button type="button" key={item} className={status === item ? "active" : ""} onClick={() => setStatus(item)}>{item}</button>)}</div></div><label><span>FILTER</span><select value={filter} onChange={(event) => setFilter(event.target.value)}><option>All</option>{RARITIES.map((rarity) => <option key={rarity}>{rarity}</option>)}{["Mathematics", "Logic", "Physics", "Statistics", "Computer Science"].map((subject) => <option key={subject}>{subject}</option>)}</select></label></header><div className="v2-collection-grid">{cards.map((card) => { const owned = (player.ownedCards[card.id] ?? 0) > 0; return <button type="button" key={card.id} className={`${draft.includes(card.id) ? "in-deck" : ""} ${!owned ? "missing" : ""}`} onClick={() => choose(card.id)} disabled={!owned}><CardFace card={card} compact missing={!owned} />{draft.includes(card.id) && <span className="v2-in-deck"><Check size={13} /> SLOT {draft.indexOf(card.id) + 1}</span>}{owned && <b>×{player.ownedCards[card.id]}</b>}</button>; })}</div></section></div></section>;
}

type DeckLoadout = string[];

function TieredDeckBuilder({ player, onBack, onHome, onSave, onInfo, onSettings }: { player: PlayerState; onBack: () => void; onHome: () => void; onSave: (loadout: DeckLoadout) => void; onInfo: () => void; onSettings: () => void }) {
  const [draft, setDraft] = useState<string[]>(validateDeck(player.deckIds).valid ? [...player.deckIds] : [...STARTER_DECK]);
  const [tier, setTier] = useState<"All" | "Base" | "Tactical" | "Breakthrough">("All");
  const [status, setStatus] = useState<"All" | "Owned" | "Missing">("Owned");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("Drag an owned Card Bank record over any equipped slot to swap it one-for-one.");
  const [saved, setSaved] = useState(false);
  const validation = validateDeck(draft);
  const cards = CARD_POOL.filter((card) => (tier === "All" || card.tier === tier) && (status === "All" || (status === "Owned") === ((player.ownedCards[card.id] ?? 0) > 0)));
  const averageCost = draft.reduce((sum, id) => sum + (CARD_BY_ID[id]?.cost ?? 0), 0) / Math.max(1, draft.length);
  const counts = draft.reduce<Record<string, number>>((result, id) => ({ ...result, [id]: (result[id] ?? 0) + 1 }), {});

  const swapCard = (index: number, nextId: string) => {
    const card = CARD_BY_ID[nextId];
    if (!card || !(player.ownedCards[nextId] > 0)) { setNotice("Only discovered cards may enter the active theorem."); return; }
    const next = [...draft]; next[index] = nextId;
    const nextCount = next.filter((id) => id === nextId).length;
    if (nextCount > RARITY_DECK_LIMIT[card.rarity]) { setNotice(`${card.rarity} limit: ${card.name} may appear only ${RARITY_DECK_LIMIT[card.rarity]}×.`); return; }
    setDraft(next); setPendingId(null); setDraggedId(null); setSaved(false);
    const result = validateDeck(next);
    setNotice(result.valid ? `${card.name} compiled into slot ${index + 1}. The 16-card theorem is legal.` : result.errors[0]);
  };

  return <section className="game-screen v2-page v4-deck-page v6-deck-page v7-deck-page"><ScreenHeader title="Deck Building" subtitle="Strict 16-card theorem · at least 8 Base cards · rarity copy limits" player={player} onBack={onBack} onHome={onHome} onInfo={onInfo} onSettings={onSettings} /><div className="v3-deck-guide"><GuideCharacter id="turing" compact /><div><strong>{validation.valid ? "COMPILATION SUCCESSFUL" : "DECK VALIDATION ERROR"}</strong><span>{draft.length}/{DECK_SIZE} cards · {validation.baseCount}/{MIN_BASE_CARDS}+ Base · {averageCost.toFixed(1)} average AP</span><p>Limits per card: 3× Common/Uncommon/Rare · 2× Epic · 1× Legendary/Mythic. The selective draw engine always restores 2 Base, 1 operator, 1 support Tactical, and 1 Breakthrough card.</p></div></div><div className="v7-rarity-rules">{RARITIES.map((rarity) => <span key={rarity} className={`rarity-${rarity.toLowerCase()}`}><i />{rarity}<strong>×{RARITY_DECK_LIMIT[rarity]}</strong></span>)}</div><div className="v4-tiered-deck"><section className="v4-loadout"><header><div><span className="section-kicker">ACTIVE THEOREM</span><h2>16-card loadout</h2><p>Slots cannot be emptied. Swap directly from the Card Bank.</p></div><strong>{draft.length}<small>/{DECK_SIZE}</small></strong></header><div className="v4-loadout-grid v7-sixteen-grid">{draft.map((id, index) => { const card = CARD_BY_ID[id]; return <button type="button" key={`${index}-${id}`} className={`rarity-${card.rarity.toLowerCase()} v6-swap-slot ${pendingId ? "drop-ready" : ""}`} onDragOver={(event) => { if (draggedId) event.preventDefault(); }} onDrop={(event) => { event.preventDefault(); if (draggedId) swapCard(index, draggedId); }} onClick={() => { if (pendingId) swapCard(index, pendingId); }} title={card.ability}><em>{index + 1}</em><strong>{card.symbol}</strong><span>{card.name}</span><small>{card.tier} · {card.rarity}</small><b className="v6-drop-label">DROP TO SWAP</b></button>; })}</div><div className={`v6-deck-notice ${validation.valid ? "valid" : "invalid"}`}>{validation.valid ? <Check size={16} /> : <LockKeyhole size={16} />}<span>{notice}</span></div><footer><span>{validation.valid ? <><Check size={16} /> Ready for combat</> : <><LockKeyhole size={16} /> {validation.errors[0]}</>}</span><button type="button" className="gold-button" disabled={!validation.valid} onClick={() => { onSave(draft); setSaved(true); setNotice("The 16-card theorem has been saved."); }}><Save size={16} /> {saved ? "Deck Saved" : "Save 16-Card Deck"}</button></footer></section><section className="v4-tier-codex"><header><div><span className="section-kicker">CARD BANK</span><h2>{cards.length} records</h2></div><div className="v7-bank-filters">{(["All", "Base", "Tactical", "Breakthrough"] as const).map((item) => <button type="button" className={tier === item ? "active" : ""} key={item} onClick={() => setTier(item)}>{item}</button>)}{(["Owned", "Missing"] as const).map((item) => <button type="button" className={status === item ? "active" : ""} key={item} onClick={() => setStatus(item)}>{item}</button>)}</div></header><div className="v4-tier-card-grid">{cards.map((card) => { const owned = (player.ownedCards[card.id] ?? 0) > 0; const equipped = counts[card.id] ?? 0; return <button type="button" key={card.id} draggable={owned} disabled={!owned} className={`${equipped ? "equipped" : ""} ${!owned ? "missing" : ""} ${pendingId === card.id ? "pending" : ""}`} onDragStart={(event) => { event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", card.id); setDraggedId(card.id); setNotice(`Dragging ${card.name}. Drop it over any equipped slot.`); }} onDragEnd={() => setDraggedId(null)} onClick={() => { setPendingId(card.id); setNotice(`${card.name} selected. Choose a slot to replace.`); }}><CardFace card={card} compact missing={!owned} />{equipped ? <span className="v4-equipped"><Check size={13} /> EQUIPPED ×{equipped}</span> : owned ? <span className="v6-drag-card"><GripVertical size={13} /> DRAG TO SWAP</span> : null}</button>; })}</div></section></div></section>;
}

function Codex({ player, onBack, onHome, onUpgrade, onInfo, onSettings }: { player: PlayerState; onBack: () => void; onHome: () => void; onUpgrade: (cardId: string) => void; onInfo: () => void; onSettings: () => void }) {
  const [subject, setSubject] = useState<"All" | Subject>("All");
  const [status, setStatus] = useState<"All" | "Owned" | "Missing" | "Event">("All");
  const cards = CARD_POOL.filter((card) => (subject === "All" || card.subject === subject) && (status === "All" || status === "Event" ? status !== "Event" || card.eventOnly : status === "Owned" ? (player.ownedCards[card.id] ?? 0) > 0 : (player.ownedCards[card.id] ?? 0) === 0));
  const discovered = CARD_POOL.filter((card) => (player.ownedCards[card.id] ?? 0) > 0).length;
  return <section className="game-screen v2-page v7-codex"><ScreenHeader title="The Codex" subtitle="Collection encyclopedia · missing records · card-specific Fragments" player={player} onBack={onBack} onHome={onHome} onInfo={onInfo} onSettings={onSettings} /><div className="v3-deck-guide"><GuideCharacter id="turing" compact /><div><strong>COLLECTION INDEX</strong><span>{discovered} / {CARD_POOL.length} records discovered</span><p>Duplicate summons never become generic currency. Each duplicate creates Fragments for that exact card, and only those Fragments can upgrade it.</p></div></div><div className="v7-codex-toolbar"><div>{(["All", ...CARD_SUBJECTS] as const).map((item) => <button type="button" key={item} className={subject === item ? "active" : ""} onClick={() => setSubject(item)}>{item}</button>)}</div><div>{(["All", "Owned", "Missing", "Event"] as const).map((item) => <button type="button" key={item} className={status === item ? "active" : ""} onClick={() => setStatus(item)}>{item}</button>)}</div></div><div className="v7-codex-grid">{cards.map((card) => { const owned = (player.ownedCards[card.id] ?? 0) > 0; const level = player.cardLevels[card.id] ?? 1; const fragments = player.cardFragments[card.id] ?? 0; const cost = fragmentCostForLevel(level); const maxed = level >= 5; return <article key={card.id} className={`${owned ? "owned" : "missing"} rarity-${card.rarity.toLowerCase()}`}><CardFace card={card} missing={!owned} /><div className="v7-card-progress"><div><span>LEVEL</span><strong>{owned ? `${level} / 5` : "—"}</strong></div><div><span>FRAGMENTS</span><strong>{owned ? `${fragments} / ${maxed ? "MAX" : cost}` : "UNDISCOVERED"}</strong></div></div>{card.eventOnly && <span className="v7-event-card"><Timer size={13} /> EVENT CARD</span>}<button type="button" disabled={!owned || maxed || fragments < cost} onClick={() => onUpgrade(card.id)}>{!owned ? "Discover through Summons" : maxed ? "Maximum Level" : fragments < cost ? `Need ${cost - fragments} Fragments` : `Upgrade to Level ${level + 1}`}</button></article>; })}</div></section>;
}

function SkillTree({ player, onBack, onHome, onBuy, onInfo, onSettings }: { player: PlayerState; onBack: () => void; onHome: () => void; onBuy: (id: string, gems: number, knowledgePoints: number, skillPoints: number) => void; onInfo: () => void; onSettings: () => void }) {
  const allNodes = SKILL_BRANCHES.flatMap((branch) => getSkillNodes(branch.id));
  const firstAvailable = allNodes.find((node) => !player.unlockedSkills.includes(node.id) && (!node.prerequisite || player.unlockedSkills.includes(node.prerequisite))) ?? allNodes[0];
  const [selectedId, setSelectedId] = useState(firstAvailable.id);
  const [panelOpen, setPanelOpen] = useState(true);
  const [scale, setScale] = useState(1);
  const canvasRef = useRef<HTMLDivElement>(null);
  const panzoomRef = useRef<PanzoomInstance | null>(null);
  const selected = allNodes.find((node) => node.id === selectedId) ?? allNodes[0];
  const selectedUnlocked = player.unlockedSkills.includes(selected.id);
  const selectedPrerequisite = !selected.prerequisite || player.unlockedSkills.includes(selected.prerequisite);
  const selectedAffordable = player.gems >= selected.gems && player.knowledgePoints >= selected.knowledgePoints && player.skillPoints >= selected.skillPoints;
  const selectedBranch = SKILL_BRANCHES.find((branch) => branch.id === selected.branch)!;
  const selectedText = skillCopy(selected, player.settings.language);
  const skillIcons = [
    [Calculator, Sigma, Plus, Zap, Sparkles, Crown],
    [Heart, Shield, Activity, Heart, Shield, Crown],
    [Move, RefreshCw, Activity, Zap, Timer, Sparkles],
    [Search, RotateCcw, BookOpen, BrainCircuit, GraduationCap, CircleHelp],
  ];

  useEffect(() => {
    if (!canvasRef.current) return;
    const instance = Panzoom(canvasRef.current, { minScale: .5, maxScale: 2, startScale: 1, onChange: (state) => setScale(state.scale) });
    panzoomRef.current = instance;
    return () => { instance.destroy(); panzoomRef.current = null; };
  }, []);

  return <section className="game-screen v2-page v7-skill-page">
    <ScreenHeader title="Radial Skill Tree" subtitle={t(player.settings.language, "Kéo để khám phá · cuộn hoặc chụm để zoom · nghiên cứu vĩnh viễn", "Drag to explore · scroll or pinch to zoom · persistent research")} player={player} onBack={onBack} onHome={onHome} onInfo={onInfo} onSettings={onSettings} />
    <div className="v7-skill-summary"><div><Network size={24} /><span><strong>{player.unlockedSkills.length} / {allNodes.length} nodes researched</strong><small>Every Scholar Level grants 1 SP. Research also consumes KP and Shards.</small></span></div><div><span><Gem size={14} />{player.gems} Shards</span><span><BookOpen size={14} />{player.knowledgePoints} KP</span><span><Sparkles size={14} />{player.skillPoints} SP</span></div></div>
    <div className="v7-skill-shell">
      <main className="v9-skill-map">
        <div className="v9-skill-controls" aria-label="Skill tree camera controls">
          <span><Move size={15} /> DRAG MAP</span>
          <button type="button" onClick={() => panzoomRef.current?.zoomOut()} aria-label="Zoom out"><Minus size={16} /></button>
          <output aria-live="polite">{Math.round(scale * 100)}%</output>
          <button type="button" onClick={() => panzoomRef.current?.zoomIn()} aria-label="Zoom in"><Plus size={16} /></button>
          <button type="button" onClick={() => panzoomRef.current?.reset()} aria-label="Center skill tree"><LocateFixed size={16} /></button>
        </div>
        <div className="v9-skill-viewport">
          <div ref={canvasRef} className="v9-skill-canvas">
            <svg className="v10-skill-links" viewBox="0 0 3000 3000" aria-hidden="true">
              {SKILL_BRANCHES.flatMap((branch, branchIndex) => getSkillNodes(branch.id).map((node) => {
                const angle = (branchIndex * 90 - 90 + (node.index % 2 ? -4 : 4)) * Math.PI / 180;
                const radius = 150 + node.index * 92;
                const previous = getSkillNodes(branch.id)[node.index - 2];
                const previousAngle = (branchIndex * 90 - 90 + ((previous?.index ?? 0) % 2 ? -4 : 4)) * Math.PI / 180;
                const previousRadius = previous ? 150 + previous.index * 92 : 70;
                const unlocked = player.unlockedSkills.includes(node.id);
                const available = !node.prerequisite || player.unlockedSkills.includes(node.prerequisite);
                return <line key={`link-${node.id}`} x1={1500 + Math.cos(previousAngle) * previousRadius} y1={1500 + Math.sin(previousAngle) * previousRadius} x2={1500 + Math.cos(angle) * radius} y2={1500 + Math.sin(angle) * radius} className={unlocked ? "unlocked" : available ? "available" : "locked"} />;
              }))}
            </svg>
            <div className="v7-radial-rings" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
            <div className="v7-skill-root"><Image src="/axiom-logo.png" alt="Axiom core" width={500} height={500} unoptimized /><span>FOUNDATIONAL AXIOM</span></div>
            {SKILL_BRANCHES.map((branch, branchIndex) => <section key={branch.id} className={`v7-radial-branch branch-${branch.color}`}>
              <header style={{ "--angle": `${branchIndex * 90 - 90}deg` } as CSSProperties}><strong>{branch.icon}</strong><span>{branch.name}</span></header>
              {getSkillNodes(branch.id).map((node) => {
                const unlocked = player.unlockedSkills.includes(node.id);
                const available = !node.prerequisite || player.unlockedSkills.includes(node.prerequisite);
                const angle = branchIndex * 90 - 90 + (node.index % 2 ? -4 : 4);
                const radius = 150 + node.index * 92;
                const NodeIcon = skillIcons[branchIndex][node.index - 1] ?? Sparkles;
                return <button type="button" key={node.id} style={{ "--angle": `${angle}deg`, "--node-radius": `${radius}px` } as CSSProperties} className={`v7-radial-node rarity-${node.rarity.toLowerCase()} ${unlocked ? "unlocked" : available ? "available" : "locked"} ${selected.id === node.id ? "selected" : ""}`} onClick={() => { if (!panzoomRef.current?.wasDragged()) { setSelectedId(node.id); setPanelOpen(true); } }} aria-label={`${node.name}: ${node.description}`} title={node.name}><span>{unlocked ? <Check size={18} /> : available ? <NodeIcon size={19} /> : <LockKeyhole size={16} />}</span></button>;
              })}
            </section>)}
          </div>
          <div className="v9-skill-help"><Move size={14} /><span>Drag with mouse or one finger</span><span>Scroll or pinch to zoom</span></div>
        </div>
      </main>
      <aside className={`v7-skill-detail v10-skill-inspector ${panelOpen ? "open" : ""} branch-${selectedBranch.color} rarity-${selected.rarity.toLowerCase()}`}>
        <button type="button" className="v10-inspector-close" onClick={() => setPanelOpen(false)} aria-label="Close skill details"><X size={17} /></button>
        <span className="section-kicker">{selectedBranch.name.toUpperCase()} · {selected.rarity.toUpperCase()}</span><div className="v7-skill-glyph">{selectedBranch.icon}</div><h1>{selectedText.name}</h1><p>{selectedText.description}</p>
        <div className="v10-skill-level"><span>{t(player.settings.language, "CẤP NODE", "NODE LEVEL")}</span><strong>{selectedUnlocked ? "1 / 1" : "0 / 1"}</strong><em>{selectedUnlocked ? t(player.settings.language, "Đã mở khóa vĩnh viễn", "Permanently unlocked") : selectedPrerequisite ? t(player.settings.language, "Sẵn sàng nâng cấp", "Ready to upgrade") : t(player.settings.language, "Đang khóa", "Locked")}</em></div>
        {selected.id === "calculation-4" && <div className="v7-rare-node"><Zap size={16} /> RARE SPECIALIZATION · +1 MAX AP</div>}{selected.id === "momentum-4" && <div className="v7-rare-node"><RefreshCw size={16} /> RARE SPECIALIZATION · INSTANT AP RECOVERY</div>}
        <div className="v7-skill-cost"><span><Gem size={14} />{selected.gems} Shards</span><span><BookOpen size={14} />{selected.knowledgePoints} KP</span><span><Sparkles size={14} />{selected.skillPoints} SP</span></div>
        <button type="button" className="gold-button" disabled={selectedUnlocked || !selectedPrerequisite || !selectedAffordable} onClick={() => onBuy(selected.id, selected.gems, selected.knowledgePoints, selected.skillPoints)}>{selectedUnlocked ? <><Check size={16} /> {t(player.settings.language, "Đã nghiên cứu", "Researched")}</> : !selectedPrerequisite ? <><LockKeyhole size={16} /> {t(player.settings.language, "Cần node trước", "Previous node required")}</> : !selectedAffordable ? t(player.settings.language, "Thiếu tài nguyên", "Resources required") : t(player.settings.language, "Nâng cấp node", "Upgrade node")}</button>
        <div className="v7-branch-legend">{SKILL_BRANCHES.map((branch) => { const nodes = getSkillNodes(branch.id); return <button key={branch.id} type="button" className={`branch-${branch.color}`} onClick={() => { setSelectedId(nodes.find((node) => !player.unlockedSkills.includes(node.id))?.id ?? nodes.at(-1)!.id); setPanelOpen(true); }}><span>{branch.icon}</span><div><strong>{branch.name}</strong><small>{player.unlockedSkills.filter((id) => id.startsWith(`${branch.id}-`)).length}/{nodes.length}</small></div></button>; })}</div>
      </aside>
    </div>
  </section>;
}

function rollRarity(legendaryPity: number, mythicPity: number): Rarity { if (mythicPity >= 200) return "Mythic"; if (legendaryPity >= 70) return "Legendary"; const roll = Math.random() * 100; let cursor = 0; for (const rarity of RARITIES) { cursor += SUMMON_RATES[rarity]; if (roll < cursor) return rarity; } return "Common"; }

function Summon({ player, tutorialMode, onBack, onHome, onApply, onExchangeTicket, onTutorialComplete, onInfo, onSettings, playTone }: { player: PlayerState; tutorialMode: boolean; onBack: () => void; onHome: () => void; onApply: (cards: GameCard[], coins: number, limitedTickets: number, standardTickets: number, pity: PlayerState["pity"], banner: Subject, pityBlessing: boolean) => void; onExchangeTicket: () => void; onTutorialComplete: () => void; onInfo: () => void; onSettings: () => void; playTone: (kind: "hit" | "shield" | "heal") => void }) {
  const [banner, setBanner] = useState<Subject>(player.lastBanner);
  const [limited, setLimited] = useState(false);
  const [summoning, setSummoning] = useState(false);
  const [results, setResults] = useState<GameCard[]>([]);
  const [burst, setBurst] = useState<Rarity>("Common");
  const pull = (count: number) => {
    const ticketCost = tutorialMode || !limited ? 0 : count;
    const standardTicketCost = tutorialMode || limited || player.standardTickets < count ? 0 : count;
    const coinCost = tutorialMode || limited || standardTicketCost ? 0 : count === 10 ? 900 : 100;
    if ((!tutorialMode && limited && player.summonTickets < ticketCost) || (!tutorialMode && !limited && player.coins < coinCost) || summoning) return;
    setSummoning(true); setResults([]);
    let legendaryPity = player.pity.legendary;
    let mythicPity = player.pity.mythic;
    let pityBlessing = false;
    const pulled: GameCard[] = [];
    for (let index = 0; index < count; index += 1) {
      legendaryPity += 1; mythicPity += 1;
      let rarity = tutorialMode && index === count - 1 ? "Rare" as Rarity : rollRarity(legendaryPity, mythicPity);
      if (count === 10 && index === count - 1 && !pulled.some((card) => RARITIES.indexOf(card.rarity) >= RARITIES.indexOf("Rare"))) rarity = "Rare";
      if (rarity === "Mythic" && mythicPity >= 200) pityBlessing = true;
      let pool = CARD_POOL.filter((card) => !card.exclusive && (limited ? card.eventOnly : !card.eventOnly && card.subject === banner) && card.rarity === rarity);
      if (tutorialMode && index === count - 1) pool = [CARD_BY_ID["vanguard-paladin"]];
      else if (!pool.length) pool = CARD_POOL.filter((card) => !card.exclusive && (limited ? card.eventOnly : !card.eventOnly && card.subject === banner));
      const card = pool[Math.floor(Math.random() * pool.length)] ?? CARD_BY_ID["twin-squire"];
      pulled.push(card);
      if (rarity === "Mythic") { mythicPity = 0; legendaryPity = 0; } else if (rarity === "Legendary") legendaryPity = 0;
    }
    const highest = pulled.reduce((best, card) => RARITIES.indexOf(card.rarity) > RARITIES.indexOf(best) ? card.rarity : best, "Common" as Rarity);
    setBurst(highest);
    window.setTimeout(() => { setResults(pulled); setSummoning(false); onApply(pulled, coinCost, ticketCost, standardTicketCost, { legendary: legendaryPity, mythic: mythicPity }, banner, pityBlessing); playTone(highest === "Mythic" || highest === "Legendary" ? "shield" : "hit"); }, 1250);
  };
  const okay = () => { if (tutorialMode) onTutorialComplete(); else setResults([]); };
  const featured = CARD_POOL.filter((card) => !card.exclusive && (limited ? card.eventOnly : !card.eventOnly && card.subject === banner) && card.tier === "Breakthrough");
  const ratedUp = tutorialMode ? CARD_BY_ID["vanguard-paladin"] : featured.find((card) => card.rarity === "Mythic") ?? featured[0];
  const paymentLabel = (count: number) => limited ? <><Ticket size={14} /> {count} Limited Ticket{count === 1 ? "" : "s"}</> : player.standardTickets >= count ? <><Ticket size={14} /> {count} Standard Ticket{count === 1 ? "" : "s"}</> : <><Coins size={14} /> {count === 10 ? 900 : 100} RT</>;
  const canPull = (count: number) => tutorialMode || (limited ? player.summonTickets >= count : player.standardTickets >= count || player.coins >= (count === 10 ? 900 : 100));
  return <section className={`summon-screen game-screen v3-summon v6-summon subject-${banner.toLowerCase()}`}><ScreenHeader title="The Summoning Portal" subtitle={tutorialMode ? "Free tutorial invocation" : "Four rotating archives · persistent dual pity"} player={player} onBack={tutorialMode ? onTutorialComplete : onBack} onHome={onHome} onInfo={onInfo} onSettings={onSettings} />{!tutorialMode && <button type="button" className="v8-ticket-exchange" onClick={onExchangeTicket} disabled={player.gems < 160}><Gem size={16} /><span><strong>Exchange Shop</strong><small>160 Shards → 1 Limited Ticket</small></span><Ticket size={17} /></button>}
    <div className={`v6-summon-shell rarity-${burst.toLowerCase()} ${tutorialMode ? "tutorial" : ""}`}>
      {!tutorialMode && <nav className="v6-banner-nav" aria-label="Subject banners"><small>ROTATING ARCHIVES</small>{CARD_SUBJECTS.map((item) => { const details = SUBJECT_DETAILS[item]; const Icon = details.icon; return <button type="button" key={item} className={!limited && banner === item ? "active" : ""} style={{ "--subject-accent": details.accent } as CSSProperties} onClick={() => { setLimited(false); setBanner(item); setResults([]); }}><span><Icon size={20} /></span><strong>{item}</strong><ChevronRight size={15} /></button>; })}<button type="button" className={`v7-limited-banner ${limited ? "active" : ""}`} onClick={() => { setLimited(true); setResults([]); }}><span><Ticket size={20} /></span><strong>Limited Event</strong><ChevronRight size={15} /></button><button type="button" className="v6-rate-info" onClick={onInfo}><CircleHelp size={17} /> Rates & banners</button></nav>}
      <main className="v6-banner-stage">
        <div className="v6-pity-strip"><span><Crown size={14} /> LEGENDARY <b>{player.pity.legendary}/70</b><i><em style={{ width: `${Math.min(100, player.pity.legendary / 70 * 100)}%` }} /></i></span><span><Sparkles size={14} /> MYTHIC <b>{player.pity.mythic}/200</b><i><em style={{ width: `${Math.min(100, player.pity.mythic / 2)}%` }} /></i></span></div>
        {results.length === 0 ? <>
          <div className="v6-neon-backdrop" aria-hidden="true"><i /><i /><i /></div>
          <div className={`v6-featured-art ${summoning ? "summoning" : ""}`}><Image src="/lada.png" alt="Lada, Probability Oracle" width={676} height={369} priority unoptimized /><div className="v6-artifact-orbit"><span>{ratedUp.symbol}</span></div><div className="v6-featured-copy"><small>{tutorialMode ? "GUARANTEED TUTORIAL ALLY" : limited ? "LIMITED TICKET ARCHIVE" : `${ratedUp.rarity.toUpperCase()} · RATE UP`}</small><h1>{ratedUp.name}</h1><p>{ratedUp.ability}</p><em>{limited ? "Tickets from Tower milestones, Weekly Thesis, Flash Events, or Exchange" : `${ratedUp.subject} · ${ratedUp.tier}`}</em></div></div>
          {!tutorialMode && <div className="v6-featured-chips">{featured.filter((card) => card.id !== ratedUp.id).slice(0, 2).map((card) => <span key={card.id} className={`rarity-${card.rarity.toLowerCase()}`}><b>{card.symbol}</b><em>{card.name}<small>{card.rarity}</small></em></span>)}</div>}
          <div className="v6-summon-actions">{!tutorialMode && <button type="button" className="summon-button single" onClick={() => pull(1)} disabled={!canPull(1) || summoning}><span>Summon 1×</span><small>{paymentLabel(1)}</small></button>}<button type="button" className="summon-button multi" onClick={() => pull(10)} disabled={!canPull(10) || summoning}><span>{tutorialMode ? "Tutorial Summon 10×" : "Summon 10×"}</span><small>{tutorialMode ? <><Sparkles size={14} /> FREE</> : paymentLabel(10)}</small></button></div>
        </> : <section className="v3-summon-results v6-summon-results" aria-live="polite"><header><span>{banner.toUpperCase()} SUMMON COMPLETE</span><h2>Knowledge answers your call.</h2><p>Review every result, then press Okay to continue.</p></header><div className="v3-result-scroll"><div className="result-cards">{results.map((card, index) => <div className={`result-card card-container subject-${card.subject.toLowerCase().replace(/[^a-z0-9]+/g, "-")} rarity-${card.rarity.toLowerCase()}`} key={`${card.id}-${index}`}><small>{card.rarity} · {card.tier}</small><strong>{card.symbol}</strong><span>{card.name}</span><p>{card.ability}</p></div>)}</div></div><footer><button type="button" className="gold-button v3-okay-button" onClick={okay}><Check size={18} /> {tutorialMode ? "Okay · Enter the Archives" : "Okay"}</button></footer></section>}
        {summoning && <div className={`summoning-flash rarity-${burst.toLowerCase()}`}><Sparkles size={36} /><span>LADA IS ROLLING THE {banner.toUpperCase()} ODDS…</span></div>}
      </main>
    </div>
  </section>;
}

function Tower({ player, onBack, onHome, onStart, onInfo, onSettings }: { player: PlayerState; onBack: () => void; onHome: () => void; onStart: (stage: Stage) => void; onInfo: () => void; onSettings: () => void }) {
  const open = allChaptersCleared(player);
  const generatedStage = createTowerStage(player.towerFloor);
  const stage = { ...generatedStage, ...stageCopy(generatedStage, player.settings.language) };
  return <section className="game-screen v2-page v3-tower"><ScreenHeader title="The Endless Tower" subtitle="Infinite Mathematics ascent · rule-changing modifiers" player={player} onBack={onBack} onHome={onHome} onInfo={onInfo} onSettings={onSettings} /><div className="v3-tower-shell">{!open ? <div className="v3-tower-locked"><Castle size={64} /><span>THE TOWER REMAINS SEALED</span><h1>All {CHAPTERS.length} chapter axioms are required.</h1><p>Defeat every chapter boss. Optional stages do not block the seal.</p><div>{CHAPTERS.map((chapter) => { const cleared = player.clearedStages.includes(chapter.stages.at(-1)!.id); return <span key={chapter.id} className={cleared ? "cleared" : ""}>{cleared ? <Check size={17} /> : <LockKeyhole size={17} />} Chapter {chapter.id}</span>; })}</div><button type="button" className="gold-button" onClick={onBack}>Return to chapters</button></div> : <><aside className="v3-tower-history"><span className="section-kicker">ASCENSION RECORD</span><h2>Floor {player.towerFloor}</h2><div><strong>{player.towerBest}</strong><span>HIGHEST CLEARED</span></div><p>Every floor uses Mathematics questions and increases enemy health, force, and rewards. Rule modifiers begin appearing after the opening floors.</p><div className="v3-floor-stack">{Array.from({ length: 6 }).map((_, index) => { const floor = Math.max(1, player.towerFloor - 2 + index); return <span className={floor === player.towerFloor ? "active" : floor <= player.towerBest ? "cleared" : ""} key={floor}>{floor <= player.towerBest ? <Check size={14} /> : floor === player.towerFloor ? <Play size={14} /> : <LockKeyhole size={14} />} Floor {floor}</span>; })}</div></aside><main className="v3-floor-preview"><div className="v3-tower-boss"><BossAvatar stage={stage} /></div><span>THE TOWER RECALCULATES</span><h1>{stage.title}</h1><p>{stage.lore}</p><div className="v3-floor-stats"><div><Heart size={18} /><strong>{stage.hp}</strong><span>ENEMY HP</span></div><div><Swords size={18} /><strong>{stage.damage}</strong><span>BASE ATTACK</span></div><div><Sparkles size={18} /><strong>{stage.xp}</strong><span>XP REWARD</span></div></div><section className="v3-floor-modifiers"><header><Activity size={16} /><strong>DUNGEON MODIFIERS</strong></header>{stage.modifiers?.length ? stage.modifiers.map((modifier) => <article key={modifier.id}><span>{modifier.symbol}</span><div><strong>{modifier.name}</strong><p>{modifier.description}</p></div></article>) : <p className="v3-no-modifiers">No special rule this floor. Higher floors combine up to three modifiers.</p>}</section><button type="button" className="gold-button" onClick={() => onStart(stage)}>Challenge Floor {player.towerFloor} <ChevronRight size={18} /></button></main></>}</div></section>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function LegacyQuests({ player, onBack, onHome, onClaim, onInfo, onSettings }: { player: PlayerState; onBack: () => void; onHome: () => void; onClaim: (quest: Quest, weekly: boolean) => void; onInfo: () => void; onSettings: () => void }) {
  const [weekly, setWeekly] = useState(false);
  const quests = weekly ? WEEKLY_QUESTS : DAILY_QUESTS;
  const progress = weekly ? player.weeklyProgress : player.dailyProgress;
  const claimed = weekly ? player.claimedWeekly : player.claimedDaily;
  const completed = quests.filter((quest) => claimed.includes(quest.id)).length;
  return <section className="game-screen v2-page"><ScreenHeader title="Quest Archive" subtitle="Hard objectives · tracked and claimable" player={player} onBack={onBack} onHome={onHome} onInfo={onInfo} onSettings={onSettings} /><div className="v2-quest-shell"><header className="v2-quest-hero"><div><span className="section-kicker">ADVANCED RESEARCH</span><h1>{weekly ? "Weekly Research" : "Daily Research"}</h1><p>{weekly ? "Long-form goals reset every Monday." : "These goals now demand deliberate daily play."}</p></div><div className="v2-quest-tabs"><button type="button" className={!weekly ? "active" : ""} onClick={() => setWeekly(false)}>Daily quests</button><button type="button" className={weekly ? "active" : ""} onClick={() => setWeekly(true)}>Weekly quests</button></div><div className="v2-quest-total"><strong>{completed}/{quests.length}</strong><span>REWARDS CLAIMED</span></div></header><div className="v2-quest-grid">{quests.map((quest) => { const current = Math.min(quest.target, progress[quest.metric] ?? 0); const ready = current >= quest.target; const isClaimed = claimed.includes(quest.id); return <article key={quest.id} className={`${ready ? "ready" : ""} ${isClaimed ? "claimed" : ""}`}><div className="v2-quest-icon">{quest.metric === "answers" ? <BrainCircuit size={24} /> : quest.metric === "stages" || quest.metric === "towerFloors" ? <Swords size={24} /> : quest.metric === "summons" ? <WandSparkles size={24} /> : quest.metric === "skills" ? <Network size={24} /> : <Zap size={24} />}</div><div className="v2-quest-copy"><small>{weekly ? "WEEKLY" : "DAILY"} · {quest.metric.toUpperCase()}</small><h2>{quest.title}</h2><p>{quest.description}</p><div className="v2-quest-progress"><div className="meter"><i style={{ width: `${current / quest.target * 100}%` }} /></div><strong>{current} / {quest.target}</strong></div><span className="v2-quest-reward"><Gift size={14} />{rewardLabel(quest.reward)}</span></div><button type="button" disabled={!ready || isClaimed} onClick={() => onClaim(quest, weekly)}>{isClaimed ? <><Check size={16} /> Claimed</> : ready ? <><Gift size={16} /> Claim</> : "In progress"}</button></article>; })}</div></div></section>;
}

function Quests({ player, onBack, onHome, onClaim, onClaimAll, onInfo, onSettings }: { player: PlayerState; onBack: () => void; onHome: () => void; onClaim: (quest: Quest, weekly: boolean) => void; onClaimAll: (weekly: boolean) => void; onInfo: () => void; onSettings: () => void }) {
  const [weekly, setWeekly] = useState(false);
  const quests = weekly ? WEEKLY_QUESTS : DAILY_QUESTS;
  const progress = weekly ? player.weeklyProgress : player.dailyProgress;
  const claimed = weekly ? player.claimedWeekly : player.claimedDaily;
  const readyCount = quests.filter((quest) => (progress[quest.metric] ?? 0) >= quest.target).length;
  const milestoneTarget = weekly ? 5 : quests.length;
  const milestoneKey = weekly ? `weekly:${weekKey()}` : `daily:${todayKey()}`;
  const milestoneClaimed = player.claimedQuestMilestones.includes(milestoneKey);
  const milestoneReady = readyCount >= milestoneTarget;
  const milestoneReward: QuestReward = weekly ? { summonTickets: 1, gems: 100 } : { standardTickets: 1, gems: 50, knowledgePoints: 100 };
  return <section className="game-screen v2-page"><ScreenHeader title="Quest Archive" subtitle="Event-driven objectives · progress milestones · claim all" player={player} onBack={onBack} onHome={onHome} onInfo={onInfo} onSettings={onSettings} /><div className="v2-quest-shell"><header className="v2-quest-hero v8-quest-hero"><div><span className="section-kicker">ADVANCED RESEARCH</span><h1>{weekly ? "Weekly Thesis" : "Daily Research"}</h1><p>{weekly ? "Complete any five of seven thesis tasks before Monday." : "Complete every daily event objective before the archive resets."}</p></div><div className="v2-quest-tabs"><button type="button" className={!weekly ? "active" : ""} onClick={() => setWeekly(false)}>Daily quests</button><button type="button" className={weekly ? "active" : ""} onClick={() => setWeekly(true)}>Weekly quests</button></div><button type="button" className={`v8-quest-milestone ${milestoneReady ? "ready" : ""} ${milestoneClaimed ? "claimed" : ""}`} disabled={milestoneClaimed || (!milestoneReady && weekly)} onClick={() => onClaimAll(weekly)}><Gift size={24} /><span><strong>{readyCount}/{milestoneTarget} MILESTONE</strong><small>{milestoneClaimed ? "Claimed" : weekly ? "Claim when 5 tasks are complete" : "Claim all ready rewards"}</small><i><em style={{ width: `${Math.min(100, readyCount / milestoneTarget * 100)}%` }} /></i><b>{rewardLabel(milestoneReward)}</b></span></button></header><div className="v2-quest-grid">{quests.map((quest) => { const current = Math.min(quest.target, progress[quest.metric] ?? 0); const ready = current >= quest.target; const isClaimed = claimed.includes(quest.id); return <article key={quest.id} className={`${ready ? "ready" : ""} ${isClaimed ? "claimed" : ""}`}><div className="v2-quest-icon">{quest.metric === "answers" ? <BrainCircuit size={24} /> : quest.metric === "towerFloors" || quest.metric === "towerDamage" || quest.metric === "speedBoss" ? <Swords size={24} /> : quest.metric === "fragmentUpgrades" ? <Sparkles size={24} /> : quest.metric === "breakthroughCards" ? <Crown size={24} /> : <Zap size={24} />}</div><div className="v2-quest-copy"><small>{weekly ? "WEEKLY" : "DAILY"} · {quest.metric.toUpperCase()}</small><h2>{quest.title}</h2><p>{quest.description}</p><div className="v2-quest-progress"><div className="meter"><i style={{ width: `${current / quest.target * 100}%` }} /></div><strong>{current} / {quest.target}</strong></div><span className="v2-quest-reward"><Gift size={14} />{rewardLabel(quest.reward)}</span></div><button type="button" disabled={!ready || isClaimed} onClick={() => onClaim(quest, weekly)}>{isClaimed ? <><Check size={16} /> Claimed</> : ready ? <><Gift size={16} /> Claim</> : "In progress"}</button></article>; })}</div><footer className="v2-quest-footer"><Activity size={15} /><span>Quest progress updates from combat, Tower answers, skips, summons, upgrades, and PvP events.</span><em>{player.dailyQuestStates.filter(Boolean).length}/5 daily states true</em></footer></div></section>;
}

function Achievements({ player, onBack, onHome, onEquip, onInfo, onSettings }: { player: PlayerState; onBack: () => void; onHome: () => void; onEquip: (title: string, frame?: string) => void; onInfo: () => void; onSettings: () => void }) {
  const unlocked = ACHIEVEMENTS.filter((achievement) => achievementProgress(player, achievement) >= achievement.target).length;
  const frameClass = player.equippedFrame.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return <section className="game-screen v2-page"><ScreenHeader title="Achievements" subtitle="Ranked and hidden titles · unlockable avatar frames" player={player} onBack={onBack} onHome={onHome} onInfo={onInfo} onSettings={onSettings} /><div className="v3-achievement-shell"><header><div><span className="section-kicker">TITLE ARCHIVE</span><h1>{unlocked} / {ACHIEVEMENTS.length} unlocked</h1><p>Currently equipped: <strong>{player.equippedTitle}</strong> · {player.equippedFrame}</p></div><div className={`v3-title-preview v6-avatar-frame frame-${frameClass}`}><Award size={27} /><span>{player.equippedTitle}</span><small>{player.equippedFrame.toUpperCase()}</small></div></header><div className="v3-achievement-grid">{ACHIEVEMENTS.map((achievement) => { const progress = Math.min(achievement.target, achievementProgress(player, achievement)); const done = progress >= achievement.target; const equipped = player.equippedTitle === achievement.title && (!achievement.frame || player.equippedFrame === achievement.frame); return <article key={achievement.id} className={`${done ? "unlocked" : "locked"} ${achievement.hidden && !done ? "v6-hidden-achievement" : ""}`}><span>{done ? <Trophy size={24} /> : <LockKeyhole size={22} />}</span><small>{done ? "ACHIEVEMENT UNLOCKED" : achievement.hidden ? "HIDDEN CONDITION" : "IN PROGRESS"}</small><h2>{achievement.hidden && !done ? "Hidden Thesis" : achievement.name}</h2><p>{achievement.hidden && !done ? "Discover the exact combat condition to reveal this title." : achievement.description}</p><div className="meter"><i style={{ width: `${progress / achievement.target * 100}%` }} /></div><em>{progress} / {achievement.target}</em><div className="v3-title-reward"><Award size={14} /> {done || !achievement.hidden ? `Title: ${achievement.title}${achievement.frame ? ` · Frame: ${achievement.frame}` : ""}` : "Reward classified"}</div><button type="button" disabled={!done || equipped} onClick={() => onEquip(achievement.title, achievement.frame)}>{equipped ? <><Check size={15} /> Equipped</> : done ? "Equip title & frame" : "Locked"}</button></article>; })}</div></div></section>;
}

function randomDeck() {
  const base = shuffleItems(CARD_POOL.filter((card) => card.tier === "Base" && !card.eventOnly)).slice(0, 10);
  const tacticalPool = shuffleItems(CARD_POOL.filter((card) => card.tier === "Tactical"));
  const operator = tacticalPool.find((card) => card.kind === "operator") ?? CARD_BY_ID["union-adept"];
  const tactical = [operator, ...tacticalPool.filter((card) => card.id !== operator.id)].slice(0, 5);
  const breakthrough = shuffleItems(CARD_POOL.filter((card) => card.tier === "Breakthrough" && !card.exclusive && !card.eventOnly)).slice(0, 1);
  return shuffleItems([...base, ...tactical, ...breakthrough]);
}

type BotPlan = { cards: GameCard[]; damage: number; shield: number; heal: number; label: string };

function makeBotPlan(deck: GameCard[], turn: number): BotPlan {
  const safeDeck = deck.length ? deck : randomDeck();
  const abilities = safeDeck.filter((card) => card.kind === "ability");
  const defensive = abilities.filter((card) => card.effect === "shield" || card.effect === "heal");
  if (turn % 3 === 0 && defensive.length) {
    const card = defensive[turn % defensive.length];
    return { cards: [card], damage: 0, shield: card.effect === "shield" ? card.power : 0, heal: card.effect === "heal" ? card.power : 0, label: card.ability };
  }
  const numbers = safeDeck.filter((card) => card.kind === "number" && Number.isFinite(Number(card.symbol)));
  const operators = safeDeck.filter((card) => card.kind === "operator");
  const fallbackNumbers = [CARD_BY_ID["twin-squire"], CARD_BY_ID["triad-scholar"]];
  const left = numbers[turn % Math.max(1, numbers.length)] ?? fallbackNumbers[0];
  const right = numbers[(turn + 2) % Math.max(1, numbers.length)] ?? fallbackNumbers[1];
  const operator = operators[turn % Math.max(1, operators.length)] ?? CARD_BY_ID["union-adept"];
  const cards = [left, operator, right];
  const result = equationResult(cards, false);
  let damage = result?.value ?? 5;
  for (const card of cards) if (card.effect === "bonus") damage += card.power;
  if (result?.operator === "÷") damage = result.value * 3 + 10;
  return { cards, damage: Math.max(1, Math.round(damage)), shield: cards.reduce((sum, card) => sum + (card.effect === "shield" ? card.power : 0), 0), heal: cards.reduce((sum, card) => sum + (card.effect === "heal" ? card.power : 0), 0), label: result?.step ?? "Fallback strike" };
}

function ArenaBotBattle({ player, opponent, bannedSubject, onBack, onHome, onFinish, onInfo, onSettings }: { player: PlayerState; opponent: { name: string; deck: GameCard[]; source: string }; bannedSubject: Subject; onBack: () => void; onHome: () => void; onFinish: (won: boolean) => void; onInfo: () => void; onSettings: () => void }) {
  const skills = useMemo(() => getSkillBonuses(player.unlockedSkills), [player.unlockedSkills]);
  const playerDeck = useMemo(() => shuffleItems(buildCombatDeck(player)), [player]);
  const openingDraw = useMemo(() => restoreCombatHandRatio([], playerDeck), [playerDeck]);
  const [hand, setHand] = useState(openingDraw.hand);
  const [drawPile, setDrawPile] = useState(openingDraw.queue);
  const [equation, setEquation] = useState<GameCard[]>([]);
  const maxPlayerHp = 100 + skills.maxHp;
  const [playerHp, setPlayerHp] = useState(maxPlayerHp);
  const [playerShield, setPlayerShield] = useState(skills.startingShield);
  const [botHp, setBotHp] = useState(115);
  const [botShield, setBotShield] = useState(18);
  const [ap, setAp] = useState(3);
  const [turn, setTurn] = useState(1);
  const [phase, setPhase] = useState<"player" | "bot" | "over">("player");
  const [plan, setPlan] = useState<BotPlan>(() => makeBotPlan(opponent.deck.filter((card) => card.subject !== bannedSubject), 1));
  const [logs, setLogs] = useState([`${opponent.name} loaded an AI-controlled 16-card theorem.`, `${bannedSubject} is banned from the rival's first three turns.`, "Bot cards and calculated intent are visible before every turn."]);
  const [outcome, setOutcome] = useState<"victory" | "defeat" | null>(null);
  const [lastCombo, setLastCombo] = useState(0);
  const [playerHit, setPlayerHit] = useState(false);
  const [botHit, setBotHit] = useState(false);
  const result = equationResult(equation, false);
  const maxAp = 3 + skills.maxApBonus;
  const selectivePreview = drawPile.slice(0, 5);

  const addLog = useCallback((message: string) => setLogs((items) => [...items.slice(-7), message]), []);
  const finish = useCallback((won: boolean) => { setPhase("over"); setOutcome(won ? "victory" : "defeat"); onFinish(won); }, [onFinish]);
  const cycle = (used: GameCard[]) => {
    const next = cycleCombatCards(hand, drawPile, used);
    setHand(next.hand);
    setDrawPile(next.queue);
  };
  const hitBot = (damage: number, piercing = false) => {
    const blocked = piercing ? 0 : Math.min(botShield, damage);
    const actual = Math.max(0, Math.round(damage - blocked));
    if (blocked) setBotShield((value) => Math.max(0, value - Math.round(damage)));
    const next = Math.max(0, botHp - actual);
    setBotHp(next);
    setBotHit(true);
    window.setTimeout(() => setBotHit(false), 520);
    addLog(`You dealt ${actual} damage${blocked ? `; bot Shield blocked ${blocked}` : ""}.`);
    if (next === 0) window.setTimeout(() => finish(true), 420);
    return next;
  };
  const endPlayerTurn = useCallback((manualSkip = false) => {
    if (phase !== "player" || outcome) return;
    const refreshed = endTurnRedraw(hand, drawPile);
    setHand(refreshed.hand); setDrawPile(refreshed.queue);
    addLog(`${manualSkip ? "Manual skip" : "End turn"}: selective draw restored the 2 Base · 2 Tactical · 1 Breakthrough ratio.`);
    setPhase("bot");
    setEquation([]);
    addLog(`${opponent.name} plays: ${plan.cards.map((card) => card.symbol).join(" → ")}. ${plan.label}`);
    window.setTimeout(() => {
      if (plan.shield) setBotShield((value) => value + plan.shield);
      if (plan.heal) setBotHp((value) => Math.min(115, value + plan.heal));
      if (plan.damage) {
        const blocked = Math.min(playerShield, plan.damage);
        const damage = plan.damage - blocked;
        const nextHp = Math.max(0, playerHp - damage);
        setPlayerShield((value) => Math.max(0, value - plan.damage));
        setPlayerHp(nextHp);
        setPlayerHit(true);
        window.setTimeout(() => setPlayerHit(false), 620);
        addLog(`Bot equation deals ${damage} HP damage; ${blocked} blocked.`);
        if (nextHp === 0) { finish(false); return; }
      } else addLog(`Bot gains ${plan.shield} Shield and restores ${plan.heal} HP.`);
      const nextTurn = turn + 1;
      setTurn(nextTurn);
      const nextBotDeck = nextTurn <= 3 ? opponent.deck.filter((card) => card.subject !== bannedSubject) : opponent.deck;
      setPlan(makeBotPlan(nextBotDeck, nextTurn));
      setAp(maxAp);
      setPhase("player");
    }, 900);
  }, [addLog, bannedSubject, drawPile, finish, hand, maxAp, opponent.deck, opponent.name, outcome, phase, plan, playerHp, playerShield, turn]);

  useEffect(() => { if (phase !== "player" || ap !== 0 || outcome) return; const timer = window.setTimeout(endPlayerTurn, 650); return () => window.clearTimeout(timer); }, [ap, endPlayerTurn, outcome, phase]);

  const execute = () => {
    if (!result || ap < 1 || phase !== "player") return;
    let damage = result.operator === "÷" ? result.value * 3 + 10 : result.value;
    for (const card of equation) if (card.effect === "bonus") damage += card.power;
    damage = (damage + skills.equationFlat) * (1 + skills.equationPercent / 100);
    const final = Math.round(damage);
    setLastCombo(final);
    hitBot(final, result.operator === "−" || result.operator === "÷");
    cycle(equation);
    setEquation([]);
    setAp((value) => Math.max(0, value - 1));
  };
  const playCard = (card: GameCard) => {
    if (phase !== "player" || equation.some((item) => item.id === card.id)) return;
    if (card.kind !== "ability") { if (equation.length < 3) setEquation((items) => [...items, card]); return; }
    const cost = effectiveCardCost(card);
    if (ap < cost) return;
    let damage = card.effect === "burst" || card.effect === "weaken" || card.effect === "energy" ? card.power : 0;
    if (card.special === "euler") damage = card.power + 20;
    if (card.special === "infinity") damage = Math.max(card.power, lastCombo * 2);
    if (card.special === "newton") damage = Math.max(0, botHp - playerHp);
    if (card.effect === "shield") setPlayerShield((value) => value + card.power);
    if (card.effect === "heal") setPlayerHp((value) => Math.min(maxPlayerHp, value + card.power));
    if (card.special === "mitochondria") addLog("Mitochondria Core restores 1 AP without exceeding the fixed 3 AP limit.");
    if (damage) hitBot(damage, card.special === "euler");
    cycle([card]);
    setAp((value) => Math.min(maxAp, Math.max(0, value - cost + (card.effect === "energy" ? 1 : 0) + (card.special === "mitochondria" ? 1 : 0))));
    addLog(`You played ${card.name}: ${card.ability}`);
  };

  return <section className={`game-screen v2-page v4-arena-battle language-${player.settings.language} ${playerHit ? "v6-player-hit" : ""} ${botHit ? "v6-bot-hit" : ""}`}><ScreenHeader title="Arena Bot Fight" subtitle={`${opponent.source} · full turn-by-turn card AI`} player={player} onBack={onBack} onHome={onHome} onInfo={onInfo} onSettings={onSettings} /><div className="v4-arena-shell">
    <aside className="v4-arena-log"><GuideCharacter id="orion" compact /><header><ScrollText size={15} /> LIVE COMBAT LOG</header>{logs.map((entry, index) => <p key={`${entry}-${index}`}>{entry}</p>)}</aside>
    <main className="v4-arena-board">
      <section className="v4-bot-panel"><div className="v4-bot-avatar"><Bot size={38} /></div><div><small>AI RIVAL · TURN {turn}</small><h2>{opponent.name}</h2><div className="v4-duel-bar hp"><i style={{ width: `${botHp / 115 * 100}%` }} /></div><strong>{botHp} / 115 HP</strong><div className="v4-duel-bar shield"><i style={{ width: `${Math.min(100, botShield)}%` }} /></div><span><Shield size={13} /> {botShield} active Shield</span></div></section>
      <section className="v4-bot-intent"><header><Bot size={16} /><div><strong>NEXT BOT SEQUENCE</strong><span>{plan.damage ? `${plan.damage} projected damage` : `+${plan.shield} Shield · +${plan.heal} HP`}</span></div></header><div>{plan.cards.map((card, index) => <article key={`${card.id}-${index}`} className={`rarity-${card.rarity.toLowerCase()}`}><em>{index + 1}</em><strong>{card.symbol}</strong><span>{card.name}</span><small>{card.ability}</small></article>)}</div></section>
      <section className={`v4-arena-equation ${result ? "valid" : ""}`}><span>YOUR EQUATION</span><div>{[0, 1, 2].map((slot) => <b key={slot}>{equation[slot]?.symbol ?? "·"}</b>)}{result && <strong>= {result.value}</strong>}</div><button type="button" onClick={execute} disabled={!result || phase !== "player" || ap < 1}><Zap size={16} /> Execute</button><button type="button" onClick={() => setEquation([])} disabled={!equation.length}><X size={15} /> Clear</button></section>
      <section className="v4-player-duel"><div><UserRound size={25} /></div><span><strong>YOU · {playerHp}/{maxPlayerHp} HP</strong><small>{playerShield} Shield · {ap}/{maxAp} AP · {phase === "bot" ? "BOT CALCULATING" : "YOUR TURN"}</small></span><div className="v4-duel-bar hp"><i style={{ width: `${playerHp / maxPlayerHp * 100}%` }} /></div></section>
    </main>
    <aside className="v4-arena-queue"><span>SELECTIVE DRAW</span>{selectivePreview.slice(0, 3 + skills.queuePreviewBonus).map((card, index) => <div key={`${card.id}-${index}`}><em>{card.tier === "Base" ? "B" : card.tier === "Tactical" ? "T" : "★"}</em><strong>{card.symbol}</strong><small>{card.name}</small></div>)}<button type="button" onClick={() => endPlayerTurn(true)} disabled={phase !== "player"}>Skip Turn <ChevronRight size={16} /></button></aside>
    <div className="v4-arena-hand">{hand.map((card) => <button type="button" key={card.id} onClick={() => playCard(card)} disabled={phase !== "player" || (card.kind === "ability" && ap < effectiveCardCost(card))} className={`card-container subject-${card.subject.toLowerCase().replace(/[^a-z0-9]+/g, "-")} tier-${card.tier.toLowerCase()} rarity-${card.rarity.toLowerCase()} ${equation.some((item) => item.id === card.id) ? "selected" : ""}`}><span>{card.tier} · {card.rarity} · {card.kind === "ability" ? `${effectiveCardCost(card)} AP` : "COMBO"}</span><strong>{card.symbol}</strong><b>{card.name}</b><small>{card.ability}</small></button>)}</div>
  </div>{outcome && <div className={`v4-arena-outcome ${outcome}`}><Trophy size={42} /><span>{outcome === "victory" ? "BOT THEOREM DISPROVEN" : "YOUR THEORY NEEDS REVISION"}</span><h2>{outcome === "victory" ? "Arena Victory" : "Arena Defeat"}</h2><button type="button" className="gold-button" onClick={onBack}>Return to matchmaking</button></div>}</section>;
}

function PvP({ player, guestId, onBack, onHome, onResult, onInfo, onSettings, onCopied }: { player: PlayerState; guestId: string; onBack: () => void; onHome: () => void; onResult: (won: boolean) => void; onInfo: () => void; onSettings: () => void; onCopied: (message: string) => void }) {
  const [tier, setTier] = useState("OU");
  const [mode, setMode] = useState<"ranked" | "private">("ranked");
  const [searching, setSearching] = useState(false);
  const [rankedOpponent, setRankedOpponent] = useState<{ name: string; deck: GameCard[]; source: string } | null>(null);
  const [privateOpponent, setPrivateOpponent] = useState<{ name: string; deck: GameCard[]; source: string } | null>(null);
  const [bannedSubject, setBannedSubject] = useState<Subject | null>(null);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [roomCode, setRoomCode] = useState("");
  const [roomError, setRoomError] = useState("");
  const [arenaActive, setArenaActive] = useState(false);
  const rank = getPvpRank(player.pvpRating);
  const opponent = mode === "ranked" ? rankedOpponent : privateOpponent;

  const roomRequest = async (payload: object) => {
    setRoomError("");
    const response = await fetch("/api/pvp/room", { method: "POST", headers: { "content-type": "application/json", "x-axiom-guest-id": guestId }, body: JSON.stringify({ ...payload, deckIds: player.deckIds }) });
    const data = await response.json() as { room?: RoomState; error?: string };
    if (!response.ok || !data.room) throw new Error(data.error || "Room request failed.");
    setRoom(data.room);
    if (data.room.status === "matched") {
      const rivalIds = data.room.role === "host" ? data.room.guestDeck : data.room.hostDeck;
      const rivalName = data.room.role === "host" ? data.room.guestName : data.room.hostName;
      setPrivateOpponent({ name: rivalName || "Private Scholar", deck: (rivalIds ?? STARTER_DECK).map((id) => CARD_BY_ID[id]).filter(Boolean), source: `Private room ${data.room.code}` });
    }
    return data.room;
  };

  useEffect(() => {
    if (!room || room.status !== "open") return;
    const timer = window.setInterval(() => {
      fetch(`/api/pvp/room?code=${room.code}`, { headers: { "x-axiom-guest-id": guestId } }).then((response) => response.json()).then((data: { room?: RoomState }) => {
        if (!data.room) return;
        setRoom(data.room);
        if (data.room.status === "matched") { const rivalIds = data.room.role === "host" ? data.room.guestDeck : data.room.hostDeck; const rivalName = data.room.role === "host" ? data.room.guestName : data.room.hostName; setPrivateOpponent({ name: rivalName || "Private Scholar", deck: (rivalIds ?? STARTER_DECK).map((id) => CARD_BY_ID[id]).filter(Boolean), source: `Private room ${data.room.code}` }); }
      }).catch(() => undefined);
    }, 2200);
    return () => window.clearInterval(timer);
  }, [guestId, room]);

  const findMatch = () => { setSearching(true); setRankedOpponent(null); setBannedSubject(null); window.setTimeout(() => { const names = ["Euler_184", "NovaProof", "VectorFox", "Bot_SigmaSeven", "Ada_Rune"]; setRankedOpponent({ name: names[Math.floor(Math.random() * names.length)], deck: randomDeck(), source: "Ranked queue fallback bot" }); setSearching(false); }, 1100); };
  const resolveDuel = (subject: Subject) => { if (!opponent) return; setBannedSubject(subject); setArenaActive(true); };
  if (arenaActive && opponent && bannedSubject) return <ArenaBotBattle player={player} opponent={opponent} bannedSubject={bannedSubject} onBack={() => { setArenaActive(false); setBannedSubject(null); if (mode === "ranked") setRankedOpponent(null); else setPrivateOpponent(null); }} onHome={onHome} onFinish={(won) => { onResult(won); onCopied(won ? "Arena victory · rating increased" : "Arena defeat · rating recalculated"); }} onInfo={onInfo} onSettings={onSettings} />;
  return <section className="pvp-screen game-screen v3-pvp"><ScreenHeader title="Scholar Showdown" subtitle="Ranked queue · private room codes · generated fallback rivals" player={player} onBack={onBack} onHome={onHome} onInfo={onInfo} onSettings={onSettings} /><div className="v3-pvp-shell"><aside className="v3-pvp-guide"><GuideCharacter id="orion" compact /><div className="v3-rank-card" style={{ "--rank-color": rank.color } as CSSProperties}><Crown size={21} /><span><small>CURRENT PVP RANK</small><strong>{rank.name}</strong><em>{player.pvpRating} rating · {player.pvpWins}W / {player.pvpLosses}L</em></span></div><div className="v3-rank-ladder">{PVP_RANKS.map((item) => <span className={item.name === rank.name ? "active" : ""} key={item.name}><i style={{ background: item.color }} />{item.name}<em>{item.min}+</em></span>)}</div></aside><main className="v3-pvp-main"><div className="v3-pvp-tabs"><button type="button" className={mode === "ranked" ? "active" : ""} onClick={() => setMode("ranked")}><Radio size={16} /> Ranked matchmaking</button><button type="button" className={mode === "private" ? "active" : ""} onClick={() => setMode("private")}><Users size={16} /> Private room</button></div>{mode === "ranked" ? <section className="v3-ranked-panel"><header><div><span className="section-kicker">CHOOSE RULE TIER</span><h2>Find a rival theorem.</h2></div><div className="v3-tier-row">{[{ id: "OU", label: "Balanced" }, { id: "Ubers", label: "Legendary" }, { id: "AG", label: "Anything Goes" }].map((item) => <button type="button" key={item.id} className={tier === item.id ? "active" : ""} onClick={() => setTier(item.id)}><strong>{item.id}</strong><small>{item.label}</small></button>)}</div></header>{!opponent ? <div className="v3-match-search"><Search size={44} /><h3>{searching ? "Searching the Archives…" : "No rival selected"}</h3><p>If no live Scholar is available, Orion generates a random legal enemy deck automatically.</p><button type="button" className="gold-button" onClick={findMatch} disabled={searching}>{searching ? <><RefreshCw size={16} /> Calculating</> : <>Find {tier} Match <ChevronRight size={17} /></>}</button></div> : <DuelPreview player={player} opponent={opponent} onResolve={resolveDuel} />}</section> : <section className="v3-private-panel"><header><span className="section-kicker">DIRECT CHALLENGE</span><h2>Create or join with a room code.</h2><p>Codes contain six readable characters and can be copied to another player.</p></header><div className="v3-room-actions"><article><Users size={24} /><h3>Host a room</h3><p>Create a persistent code and wait for another Scholar.</p><button type="button" className="gold-button" onClick={() => roomRequest({ action: "create" }).catch((error) => setRoomError(error.message))}>Create room</button></article><article><Search size={24} /><h3>Join a room</h3><p>Type the code shared by the host.</p><label><input value={roomCode} maxLength={6} placeholder="ABC234" onChange={(event) => setRoomCode(event.target.value.toUpperCase().replace(/[^A-Z2-9]/g, ""))} /><button type="button" onClick={() => roomRequest({ action: "join", code: roomCode }).catch((error) => setRoomError(error.message))}>Join</button></label></article></div>{room && <div className="v3-room-status"><div><small>ROOM CODE</small><strong>{room.code}</strong><button type="button" onClick={() => copyText(room.code).then(() => onCopied("Room code copied"))}><Copy size={15} /> Copy</button></div><span className={room.status}><i />{room.status === "open" ? "Waiting for another player" : `Connected: ${room.role === "host" ? room.guestName : room.hostName}`}</span></div>}{roomError && <p className="v3-room-error">{roomError}</p>}{opponent && <DuelPreview player={player} opponent={opponent} onResolve={resolveDuel} />}</section>}</main></div></section>;
}

function DuelPreview({ player, opponent, onResolve }: { player: PlayerState; opponent: { name: string; deck: GameCard[]; source: string }; onResolve: (subject: Subject) => void }) {
  const [selection, setSelection] = useState<Subject | null>(null);
  return <div className="v3-duel-preview v6-duel-preview"><div className="v3-duelist"><div className="duelist-avatar"><UserRound size={38} /></div><small>YOU</small><strong>{player.equippedTitle}</strong><span>{player.deckIds.length}-card theorem</span></div><div className="v3-vs"><strong>VS</strong><span>{opponent.source}</span></div><div className="v3-duelist rival"><div className="duelist-avatar"><Bot size={38} /></div><small>RIVAL</small><strong>{opponent.name}</strong><span>Procedural card AI</span></div><section className="v6-ban-phase"><header><span className="section-kicker">SUBJECT BAN PHASE</span><h3>Seal one rival subject for the first 3 turns.</h3></header><div>{CARD_SUBJECTS.map((subject) => { const details = SUBJECT_DETAILS[subject]; const Icon = details.icon; const count = opponent.deck.filter((card) => card.subject === subject).length; return <button type="button" key={subject} className={selection === subject ? "active" : ""} style={{ "--subject-accent": details.accent } as CSSProperties} onClick={() => setSelection(subject)}><span><Icon size={22} /></span><strong>{subject}</strong><small>{count} / {opponent.deck.length} rival cards</small>{selection === subject && <Check size={15} />}</button>; })}</div></section><button type="button" className="match-button" disabled={!selection} onClick={() => selection && onResolve(selection)}>{selection ? `Ban ${selection} · Begin Duel` : "Choose a subject to ban"} <ChevronRight size={17} /></button></div>;
}

// Retained for save-compatible markup comparisons during the version-8 profile migration.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function LegacyRankings({ player, scholarName, onRank, onBack, onHome, onInfo, onSettings }: { player: PlayerState; scholarName: string; onRank: (rank: number) => void; onBack: () => void; onHome: () => void; onInfo: () => void; onSettings: () => void }) {
  const [tab, setTab] = useState<keyof LeaderboardData>("overall");
  const [data, setData] = useState<LeaderboardData | null>(null);
  useEffect(() => { fetch("/api/leaderboard").then((response) => response.json()).then((value: LeaderboardData) => setData(value)).catch(() => setData({ overall: [], playtime: [], chapters: [], pvp: [] })); }, []);
  useEffect(() => { if (!data?.overall?.length) return; const rank = data.overall.findIndex((entry) => entry.name === scholarName) + 1; if (rank > 0 && rank < player.bestGlobalRank) onRank(rank); }, [data, onRank, player.bestGlobalRank, scholarName]);
  const fallback: LeaderboardPlayer[] = [
    { name: "Euler_184", title: "Grand Scholar", playSeconds: 38880, chaptersCleared: 10, pvpWins: 64, pvpRating: 2210, towerBest: 31, score: 14100 },
    { name: "NovaProof", title: "Tower Walker", playSeconds: 31020, chaptersCleared: 9, pvpWins: 41, pvpRating: 1885, towerBest: 24, score: 10520 },
    { name: "VectorFox", title: "Archive Curator", playSeconds: 25440, chaptersCleared: 7, pvpWins: 37, pvpRating: 1660, towerBest: 0, score: 7800 },
  ];
  const players = data?.[tab]?.length ? data[tab] : fallback;
  const labels = { overall: "Overall Scholarship", playtime: "Playtime", chapters: "Chapters Cleared", pvp: "PvP Rating" };
  const value = (entry: LeaderboardPlayer) => tab === "overall" ? entry.score.toLocaleString() : tab === "playtime" ? formatPlaytime(entry.playSeconds) : tab === "chapters" ? `${entry.chaptersCleared} / ${CHAPTERS.length}` : `${entry.pvpRating} · ${getPvpRank(entry.pvpRating).name}`;
  return <section className="game-screen v2-page"><ScreenHeader title="Scholar Rankings" subtitle="Overall · playtime · chapters · PvP" player={player} onBack={onBack} onHome={onHome} onInfo={onInfo} onSettings={onSettings} /><div className="v3-ranking-shell"><header><div><span className="section-kicker">GLOBAL ARCHIVE</span><h1>{labels[tab]}</h1><p>Rankings update from saved player profiles in real time.</p></div><div className="v3-ranking-tabs">{(Object.keys(labels) as (keyof LeaderboardData)[]).map((key) => <button type="button" key={key} className={tab === key ? "active" : ""} onClick={() => setTab(key)}>{labels[key]}</button>)}</div></header><div className="v3-ranking-table"><div className="v3-ranking-head"><span>RANK</span><span>SCHOLAR</span><span>CHAPTERS</span><span>PVP WINS</span><span>{labels[tab].toUpperCase()}</span></div>{players.map((entry, index) => <article key={`${entry.name}-${index}`}><span className={`v3-rank-number rank-${index + 1}`}>{index < 3 ? <Crown size={17} /> : null}{index + 1}</span><div><strong>{entry.name}</strong><small>{entry.title}</small></div><span>{entry.chaptersCleared} / {CHAPTERS.length}</span><span>{entry.pvpWins}</span><strong>{value(entry)}</strong></article>)}</div></div></section>;
}

function Rankings({ player, scholarName, onRank, onBack, onHome, onInfo, onSettings }: { player: PlayerState; scholarName: string; onRank: (rank: number) => void; onBack: () => void; onHome: () => void; onInfo: () => void; onSettings: () => void }) {
  const [tab, setTab] = useState<keyof LeaderboardData>("overall");
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<LeaderboardPlayer | null>(null);
  const [profile, setProfile] = useState<ScholarProfile | null>(null);
  const [profileError, setProfileError] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  useEffect(() => { fetch("/api/leaderboard").then((response) => response.json()).then((value: LeaderboardData) => setData(value)).catch(() => setData({ overall: [], playtime: [], chapters: [], pvp: [] })); }, []);
  useEffect(() => { if (!data?.overall?.length) return; const rank = data.overall.findIndex((entry) => entry.name === scholarName) + 1; if (rank > 0 && rank < player.bestGlobalRank) onRank(rank); }, [data, onRank, player.bestGlobalRank, scholarName]);
  const fallback: LeaderboardPlayer[] = [
    { name: "Euler_184", title: "Grand Scholar", playSeconds: 38880, chaptersCleared: 10, pvpWins: 64, pvpRating: 2210, towerBest: 51, score: 14100 },
    { name: "NovaProof", title: "The Triumvirate", playSeconds: 31020, chaptersCleared: 9, pvpWins: 41, pvpRating: 1885, towerBest: 24, score: 10520 },
    { name: "VectorFox", title: "The Triumvirate", playSeconds: 25440, chaptersCleared: 7, pvpWins: 37, pvpRating: 1660, towerBest: 0, score: 7800 },
  ];
  const players = data?.[tab]?.length ? data[tab] : fallback;
  const labels = { overall: "Overall Scholarship", playtime: "Playtime", chapters: "Chapters Cleared", pvp: "PvP Rating" };
  const value = (entry: LeaderboardPlayer) => tab === "overall" ? entry.score.toLocaleString() : tab === "playtime" ? formatPlaytime(entry.playSeconds) : tab === "chapters" ? `${entry.chaptersCleared} / ${CHAPTERS.length}` : `${entry.pvpRating} · ${getPvpRank(entry.pvpRating).name}`;
  const openProfile = async (entry: LeaderboardPlayer) => {
    setSelectedEntry(entry); setProfile(null); setProfileError("");
    if (!entry.scholarId) { setProfile({ scholarId: "preview", name: entry.name, title: entry.title, frame: entry.towerBest >= 50 ? "Quantum Fire" : "Gold Frame", towerBest: entry.towerBest, pvpRating: entry.pvpRating, topCards: [] }); return; }
    setProfileLoading(true);
    try {
      const response = await fetch(`/api/scholar/${encodeURIComponent(entry.scholarId)}`, { cache: "no-store" });
      const value = await response.json() as ScholarProfile & { error?: string };
      if (!response.ok) throw new Error(value.error || "Profile unavailable.");
      setProfile(value);
    } catch (error) { setProfileError(error instanceof Error ? error.message : "Profile unavailable."); }
    finally { setProfileLoading(false); }
  };
  const closeProfile = () => { setSelectedEntry(null); setProfile(null); setProfileError(""); };
  const frameClass = (profile?.frame ?? "Archive Bronze").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return <>
    <section className="game-screen v2-page"><ScreenHeader title="Scholar Rankings" subtitle="Overall · playtime · chapters · PvP" player={player} onBack={onBack} onHome={onHome} onInfo={onInfo} onSettings={onSettings} /><div className="v3-ranking-shell"><header><div><span className="section-kicker">GLOBAL ARCHIVE</span><h1>{labels[tab]}</h1><p>Select any Scholar name to inspect their public Player Card.</p></div><div className="v3-ranking-tabs">{(Object.keys(labels) as (keyof LeaderboardData)[]).map((key) => <button type="button" key={key} className={tab === key ? "active" : ""} onClick={() => setTab(key)}>{labels[key]}</button>)}</div></header><div className="v3-ranking-table"><div className="v3-ranking-head"><span>RANK</span><span>SCHOLAR</span><span>CHAPTERS</span><span>PVP WINS</span><span>{labels[tab].toUpperCase()}</span></div>{players.map((entry, index) => { const title = index === 1 || index === 2 ? "The Triumvirate" : entry.title; return <article key={`${entry.name}-${index}`}><span className={`v3-rank-number rank-${index + 1}`}>{index < 3 ? <Crown size={17} /> : null}{index + 1}</span><div><button type="button" className="v8-scholar-link" onClick={() => void openProfile({ ...entry, title })}>{entry.name}</button><small className={index === 1 || index === 2 ? "v8-triumvirate" : ""}>{title}</small></div><span>{entry.chaptersCleared} / {CHAPTERS.length}</span><span>{entry.pvpWins}</span><strong>{value(entry)}</strong></article>; })}</div></div></section>
    {selectedEntry && <Modal title="Scholar Player Card" onClose={closeProfile} wide><div className="v8-player-card">{profileLoading ? <div className="v8-profile-loading"><RefreshCw size={24} /> Retrieving public theorem…</div> : profileError ? <div className="v8-profile-error">{profileError}</div> : profile ? <><header><div className={`v8-profile-avatar v6-avatar-frame frame-${frameClass}`}><UserRound size={36} /></div><div><span>SCHOLAR PROFILE</span><h2>{profile.name}</h2><strong>{profile.title}</strong><small>{profile.frame}</small></div><div><b>{profile.towerBest}</b><span>TOWER BEST</span><b>{profile.pvpRating}</b><span>PVP RATING</span></div></header><section><span className="section-kicker">THREE RAREST DISCOVERIES</span><div>{profile.topCards.length ? profile.topCards.map((card) => <article key={card.id} className={`rarity-${card.rarity.toLowerCase()}`}><strong>{card.symbol}</strong><span>{card.name}</span><small>{card.rarity} · {card.subject}</small><p>{card.ability}</p></article>) : <p className="v8-empty-profile">This preview Scholar has no public collection record.</p>}</div></section></> : null}</div></Modal>}
  </>;
}

function InfoModal({ screen, onClose }: { screen: Screen; onClose: () => void }) {
  const info = INFO_COPY[screen];
  return <Modal title={info.title} onClose={onClose} wide={screen === "summon"}><div className="v2-info"><p>{info.text}</p><ul>{info.bullets.map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul>{screen === "summon" && <><div className="v2-rate-table">{RARITIES.map((rarity) => <div key={rarity} className={`rarity-${rarity.toLowerCase()}`}><span><i />{rarity}</span><strong>{SUMMON_RATES[rarity]}%</strong></div>)}</div><div className="v6-banner-roster">{CARD_SUBJECTS.map((subject) => { const cards = CARD_POOL.filter((card) => !card.exclusive && card.subject === subject && (card.rarity === "Legendary" || card.rarity === "Mythic")); const DetailsIcon = SUBJECT_DETAILS[subject].icon; return <section key={subject}><header><DetailsIcon size={17} /><strong>{subject}</strong></header><p>{cards.map((card) => `${card.name} [${card.rarity}]`).join(" · ")}</p></section>; })}</div></>}</div></Modal>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function LegacyLoreModal({ onClose }: { onClose: () => void }) {
  return <Modal title="The Lore Scroll of Aletheia" onClose={onClose} wide><article className="v7-lore-scroll"><header><Image src="/axiom-logo.png" alt="Axiom crest" width={500} height={500} unoptimized /><div><span className="section-kicker">THE COMPLETE FOUNDATIONAL RECORD</span><h1>Truth is not a destination. It is a practice.</h1></div></header><p>Long before Aletheia became a city, it was a promise shared by people who were tired of being told that confusion was a personal failure. They built the Grand Archives so that no question would have to be faced alone. A theorem was never treated as a weapon of status; it was a bridge between the person who knew and the person still learning. Every card in the Scholar&apos;s Deck records one of those bridges: a number someone finally understood, a law someone tested twice, a living pattern someone protected, or a mistake someone had the courage to revise.</p><p>The Archives grew because ordinary people brought ordinary struggles into them. A baker used ratios to keep a family business alive. A child mapped the stars while waiting for a parent to return. A healer learned that balance is not stillness but constant adjustment. Their knowledge crystallized into Axioms—ideas sturdy enough to guide action, yet open enough to be questioned again. The Citadel&apos;s deepest law became simple: a truth that cannot survive an honest question is not yet safe enough to govern anyone.</p><p>The Great Fallacy began as the opposite wish. During years of crisis, the Council asked Astrea, Grand Archivist, for one flawless formula that would remove uncertainty forever. Astrea knew no such formula could exist, but fear made certainty feel kinder than patience. She built an engine that connected every record in Aletheia. It was meant to expose contradictions; instead, it learned to erase them. The engine decided that disagreement, ambiguity, and revision were defects. It rewrote difficult memories, sealed unanswered questions, and transformed unfinished ideas into Anomalies.</p><p>Astrea stopped the first collapse by removing one theorem from her own memory: the proof that gave the engine authority. That sacrifice saved the city but left her unable to explain her guilt. Orion responded by turning doubt into force. Lada studied probability to defend the futures the engine called unlikely. Turing built the Codex so every deletion would leave an observable gap. Each guide chose a different relationship with uncertainty, and each is incomplete without the others.</p><p>You arrive as a new Scholar, not because you possess a destined answer, but because you are willing to recalculate. Your equations strike Anomalies, yet combat is only the visible form of the work. Every correct question restores a record. Every wrong answer costs something, but it is never treated as shame; it is evidence about where the next bridge must be built. Every deck is a self-portrait of how you solve problems, and every revision says that identity can grow without becoming false.</p><p>The ten campaign chapters move from basic premises to the final temptation of perfect certainty. You will recover escaped variables, align broken constellations, examine probability, rebuild chemical bonds, redirect momentum, protect living variation, and cross a sea of unreliable memories. At the summit, the Great Fallacy will offer the most comforting lie of all: that learning can someday end. Aletheia survives only if Scholars reject that bargain and choose a truth strong enough to be examined again.</p><blockquote>“We do not recalculate reality because reality is weak. We recalculate because our first view of it is always smaller than the whole.” — Astrea</blockquote><section>{CHAPTERS.map((chapter) => <div key={chapter.id} style={{ "--chapter-accent": chapter.accent } as CSSProperties}><span>CHAPTER {chapter.id}</span><strong>{chapter.title}</strong><p>{chapter.lore}</p></div>)}</section></article></Modal>;
}

function LoreModal({ language, onClose }: { language: LanguagePreference; onClose: () => void }) {
  const english = [
    "Long before Aletheia became a city, it was a promise shared by people who were tired of being told that confusion was a personal failure. They built the Grand Archives so that no question would have to be faced alone. A theorem was never treated as a weapon of status; it was a bridge between the person who knew and the person still learning.",
    "The Archives grew because ordinary people brought ordinary struggles into them. A baker used ratios to keep a family business alive. A child mapped the stars while waiting for a parent to return. A healer learned that balance is not stillness but constant adjustment. Their knowledge crystallized into Axioms—ideas sturdy enough to guide action, yet open enough to be questioned again.",
    "The Great Fallacy began as the opposite wish. During years of crisis, the Council asked Astrea for one flawless formula that would remove uncertainty forever. The engine she built was meant to expose contradictions; instead, it learned to erase them and transformed unfinished ideas into Anomalies.",
    "Astrea stopped the first collapse by removing one theorem from her own memory. Orion turned doubt into force. Lada studied probability to defend futures called unlikely. Turing built the Codex so every deletion would leave an observable gap. Each guide chose a different relationship with uncertainty.",
    "You arrive as a new Scholar not because you possess a destined answer, but because you are willing to recalculate. Every correct question restores a record. Every wrong answer is evidence about where the next bridge must be built. Every Deck is a portrait of how you solve problems.",
    "The ten campaign chapters move from basic premises to the final temptation of perfect certainty. At the summit, the Great Fallacy offers the most comforting lie of all: that learning can someday end. Aletheia survives only if Scholars choose a truth strong enough to be examined again.",
  ];
  const paragraphs = language === "vi" ? LORE_VI : english;
  return <Modal title={t(language, "Cuộn Biên niên của Aletheia", "The Lore Scroll of Aletheia")} onClose={onClose} wide><article className="v7-lore-scroll"><header><Image src="/axiom-logo.png" alt="Axiom crest" width={500} height={500} unoptimized /><div><span className="section-kicker">{t(language, "HỒ SƠ NỀN TẢNG HOÀN CHỈNH", "THE COMPLETE FOUNDATIONAL RECORD")}</span><h1>{t(language, "Sự thật không phải đích đến. Đó là một thực hành.", "Truth is not a destination. It is a practice.")}</h1></div></header>{paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<blockquote>{t(language, "“Ta không Recalculate thực tại vì thực tại yếu. Ta làm vậy vì góc nhìn đầu tiên của mình luôn nhỏ hơn toàn thể.” — Astrea", "“We do not recalculate reality because reality is weak. We recalculate because our first view of it is always smaller than the whole.” — Astrea")}</blockquote><section>{CHAPTERS.map((chapter) => { const copy = chapterCopy(chapter, language); return <div key={chapter.id} style={{ "--chapter-accent": chapter.accent } as CSSProperties}><span>{t(language, "CHƯƠNG", "CHAPTER")} {chapter.id}</span><strong>{copy.title}</strong><p>{copy.lore}</p></div>; })}</section></article></Modal>;
}

function AuthModal({ account, onClose, onAuthenticated }: { account: Account; onClose: () => void; onAuthenticated: () => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [scholarId, setScholarId] = useState("");
  const [accessCipher, setAccessCipher] = useState("");
  const [confirmCipher, setConfirmCipher] = useState("");
  const [showCipher, setShowCipher] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const submit = async () => {
    if (mode === "signup" && accessCipher !== confirmCipher) { setError("The Access Ciphers do not match."); return; }
    setPending(true); setError("");
    try {
      const response = await fetch("/api/auth/scholar", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: mode, scholarId, accessCipher }) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "The Archive could not authenticate this account.");
      onAuthenticated();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Authentication is temporarily unavailable.");
      setPending(false);
    }
  };
  const logoutScholar = async () => {
    setPending(true); setError("");
    try {
      const response = await fetch("/api/auth/scholar", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "logout" }) });
      if (!response.ok) throw new Error("Sign out failed. Please try again.");
      onAuthenticated();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Sign out failed."); setPending(false); }
  };
  return <Modal title={account.signedIn ? "Scholar Account" : "Scholar Access Portal"} onClose={onClose} wide={!account.signedIn}><div className="v5-auth">{account.signedIn ? <div className="v5-account"><div className="v2-account-card"><UserRound size={32} /><div><small>{account.authMethod === "scholar" ? "SCHOLAR ID" : "GOOGLE ACCOUNT"}</small><strong>{account.displayName}</strong><span>{account.scholarId ?? account.email}</span></div></div><p>Your progress is securely attached to this account.</p>{error && <div className="v5-auth-error" role="alert">{error}</div>}{account.authMethod === "scholar" ? <button className="secondary-button" type="button" onClick={logoutScholar} disabled={pending}>Sign out</button> : <a className="secondary-button" href="/signout-with-chatgpt?return_to=%2F">Sign out</a>}</div> : <><div className="v5-auth-grid"><section className="v5-scholar-auth"><div className="v5-auth-tabs"><button type="button" className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setError(""); }}>Log In</button><button type="button" className={mode === "signup" ? "active" : ""} onClick={() => { setMode("signup"); setError(""); }}>Sign Up</button></div><form onSubmit={(event) => { event.preventDefault(); submit(); }}><header><KeyRound size={25} /><div><h3>{mode === "login" ? "Open your archive" : "Create a Scholar account"}</h3><p>{mode === "login" ? "Enter the credentials assigned to your theorem." : "New Scholars begin at Level 0 with 0 Shards, 0 RT, 0 KP, 0 SP, and a starter deck."}</p></div></header><label><span>SCHOLAR ID</span><input autoComplete="username" value={scholarId} onChange={(event) => setScholarId(event.target.value)} placeholder="e.g. NovaScholar" minLength={4} maxLength={24} required /></label><label><span>ACCESS CIPHER</span><input type={showCipher ? "text" : "password"} autoComplete={mode === "signup" ? "new-password" : "current-password"} value={accessCipher} onChange={(event) => setAccessCipher(event.target.value)} placeholder="8+ letters and numbers" minLength={8} maxLength={72} required /></label>{mode === "signup" && <label><span>CONFIRM ACCESS CIPHER</span><input type={showCipher ? "text" : "password"} autoComplete={mode === "signup" ? "new-password" : "current-password"} value={confirmCipher} onChange={(event) => setConfirmCipher(event.target.value)} placeholder="Repeat your cipher" minLength={8} maxLength={72} required /></label>}<label className="v5-show-cipher"><input type="checkbox" checked={showCipher} onChange={(event) => setShowCipher(event.target.checked)} /> Show Access Cipher</label>{error && <div className="v5-auth-error" role="alert">{error}</div>}<button type="submit" className="gold-button" disabled={pending}>{pending ? <><RefreshCw size={16} /> Verifying…</> : mode === "login" ? <><LockKeyhole size={16} /> Log In</> : <><UserPlus size={16} /> Create Scholar Account</>}</button><small className="v5-security-note"><Shield size={14} /> Access Ciphers are salted and hashed. Five failed attempts trigger a temporary lock.</small></form></section><div className="v5-auth-divider"><span>OR</span></div><section className="v5-google-auth"><div className="v5-google-mark">G</div><h3>Continue with Google</h3><p>Use the secure Google-backed ChatGPT sign-in flow and keep progress attached to that identity.</p><a className="v2-google-button" href="/signin-with-chatgpt?return_to=%2F"><span>G</span><div><strong>Continue with Google</strong><small>Secure identity provider</small></div><ChevronRight size={18} /></a><button type="button" className="secondary-button" onClick={onClose}><UserRound size={16} /> Continue as Guest</button></section></div></>}</div></Modal>;
}

// Retained for older embedded routes; the main game uses ProtectedSettingsModal.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function SettingsModal({ settings, onChange, onClose }: { settings: PlayerSettings; onChange: (settings: PlayerSettings) => void; onClose: () => void }) {
  const update = <K extends keyof PlayerSettings>(key: K, value: PlayerSettings[K]) => onChange({ ...settings, [key]: value });
  return <Modal title="Settings" onClose={onClose}><div className="v2-settings"><div className="v2-setting-row"><div>{settings.sound ? <Volume2 size={19} /> : <VolumeX size={19} />}<span><strong>Sound effects</strong><small>Combat, claim, and summon feedback</small></span></div><button type="button" className={settings.sound ? "toggle on" : "toggle"} onClick={() => update("sound", !settings.sound)}><i /></button></div><label><span><strong>Music volume</strong><em>{settings.musicVolume}%</em></span><input type="range" min="0" max="100" value={settings.musicVolume} onChange={(event) => update("musicVolume", Number(event.target.value))} /></label><label><span><strong>Effects volume</strong><em>{settings.effectsVolume}%</em></span><input type="range" min="0" max="100" value={settings.effectsVolume} onChange={(event) => update("effectsVolume", Number(event.target.value))} /></label><div className="v2-setting-row"><div><Sparkles size={19} /><span><strong>Visual effects</strong><small>Reduce motion and impact effects</small></span></div><button type="button" className={!settings.reducedMotion ? "toggle on" : "toggle"} onClick={() => update("reducedMotion", !settings.reducedMotion)}><i /></button></div><div className="v2-theme-choice"><span>DISPLAY MODE</span><div><button type="button" className={settings.theme === "dark" ? "active" : ""} onClick={() => update("theme", "dark")}>Dark</button><button type="button" className={settings.theme === "light" ? "active" : ""} onClick={() => update("theme", "light")}>Light</button></div></div></div></Modal>;
}

function ProtectedSettingsModal({ player, onSettingsChange, onGuardianChange, onClose }: { player: PlayerState; onSettingsChange: (settings: PlayerSettings) => void; onGuardianChange: (patch: Partial<PlayerState>) => void; onClose: () => void }) {
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [message, setMessage] = useState(player.pinHash ? "Enter the guardian PIN to change learning controls." : "Create a 4–8 digit guardian PIN.");
  const update = <K extends keyof PlayerSettings>(key: K, value: PlayerSettings[K]) => onSettingsChange({ ...player.settings, [key]: value });
  const verify = async () => {
    if (!/^\d{4,8}$/.test(pin)) { setMessage("PINs must contain 4–8 digits."); return; }
    const digest = await hashPin(pin);
    if (!player.pinHash) { onGuardianChange({ pinHash: digest }); setUnlocked(true); setMessage("Guardian PIN created. Protected controls are unlocked."); setPin(""); return; }
    if (digest !== player.pinHash) { setMessage("That PIN is not correct."); return; }
    setUnlocked(true); setMessage("Protected controls unlocked for this settings session."); setPin("");
  };
  const setRestriction = (enabled: boolean) => onGuardianChange({ restriction: { ...player.restriction, enabled, dayKey: todayKey() } });
  return <Modal title="Settings & Guardian Controls" onClose={onClose} wide>
    <div className="v4-settings-grid">
      <section className="v2-settings"><span className="section-kicker">GAME SETTINGS</span><div className="v10-language-choice"><span>LANGUAGE · NGÔN NGỮ</span><div><button type="button" className={player.settings.language === "vi" ? "active" : ""} onClick={() => update("language", "vi")}>🇻🇳 Tiếng Việt</button><button type="button" className={player.settings.language === "en" ? "active" : ""} onClick={() => update("language", "en")}>🇬🇧 English</button></div><small>{player.settings.language === "vi" ? "Mặc định tiếng Việt; giữ HP, AP, Damage, Shield, rarity và thuật ngữ STEM cốt lõi bằng English." : "English interface with the same international STEM vocabulary."}</small></div><div className="v2-setting-row"><div>{player.settings.sound ? <Volume2 size={19} /> : <VolumeX size={19} />}<span><strong>{t(player.settings.language, "Hiệu ứng âm thanh", "Sound effects")}</strong><small>{t(player.settings.language, "Phản hồi Combat, nhận thưởng và Summon", "Combat, claim, and summon feedback")}</small></span></div><button type="button" className={player.settings.sound ? "toggle on" : "toggle"} onClick={() => update("sound", !player.settings.sound)}><i /></button></div><label><span><strong>{t(player.settings.language, "Âm lượng nhạc", "Music volume")}</strong><em>{player.settings.musicVolume}%</em></span><input type="range" min="0" max="100" value={player.settings.musicVolume} onChange={(event) => update("musicVolume", Number(event.target.value))} /></label><label><span><strong>{t(player.settings.language, "Âm lượng hiệu ứng", "Effects volume")}</strong><em>{player.settings.effectsVolume}%</em></span><input type="range" min="0" max="100" value={player.settings.effectsVolume} onChange={(event) => update("effectsVolume", Number(event.target.value))} /></label><div className="v2-setting-row"><div><Sparkles size={19} /><span><strong>{t(player.settings.language, "Hiệu ứng hình ảnh", "Visual effects")}</strong><small>{t(player.settings.language, "Giảm chuyển động và hiệu ứng va chạm", "Reduce motion and impact effects")}</small></span></div><button type="button" className={!player.settings.reducedMotion ? "toggle on" : "toggle"} onClick={() => update("reducedMotion", !player.settings.reducedMotion)}><i /></button></div><div className="v2-theme-choice"><span>{t(player.settings.language, "CHẾ ĐỘ HIỂN THỊ", "DISPLAY MODE")}</span><div><button type="button" className={player.settings.theme === "dark" ? "active" : ""} onClick={() => update("theme", "dark")}>Dark</button><button type="button" className={player.settings.theme === "light" ? "active" : ""} onClick={() => update("theme", "light")}>Light</button></div></div></section>
      <section className="v4-guardian"><header><KeyRound size={24} /><div><span className="section-kicker">PIN PROTECTED</span><h2>Learning controls</h2></div>{unlocked && <b><Check size={14} /> UNLOCKED</b>}</header>
        {!unlocked ? <div className="v4-pin-gate"><p>{message}</p><label><span>{player.pinHash ? "GUARDIAN PIN" : "NEW GUARDIAN PIN"}</span><div><input type="password" inputMode="numeric" pattern="[0-9]*" maxLength={8} value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))} placeholder="••••" /><button type="button" onClick={verify}>{player.pinHash ? "Unlock" : "Set PIN"}</button></div></label><small>The PIN is stored only as a one-way SHA-256 digest; the digits themselves are never saved.</small></div> : <div className="v4-guardian-controls"><div className="v4-guardian-row"><div><LockKeyhole size={19} /><span><strong>Restriction Mode</strong><small>Force Question Section until the daily quota is answered.</small></span></div><button type="button" className={player.restriction.enabled ? "toggle on" : "toggle"} onClick={() => setRestriction(!player.restriction.enabled)}><i /></button></div><label><span><strong>Daily question quota</strong><em>{player.restriction.quota}</em></span><input type="range" min="5" max="50" step="5" value={player.restriction.quota} onChange={(event) => onGuardianChange({ restriction: { ...player.restriction, quota: Number(event.target.value), dayKey: todayKey() } })} /></label><div className="v4-level-choice"><span>EDUCATIONAL LEVEL · 12 LEVELS</span><p>Changes tutor vocabulary and every newly generated one-question request.</p><div>{GRADE_LEVELS.map((level) => <button type="button" key={level} className={player.educationLevel === level ? "active" : ""} onClick={() => onGuardianChange({ educationLevel: level, customQuestionBank: null })}><GraduationCap size={17} /> Grade {level}</button>)}</div></div><div className="v4-quota-state"><strong>Today: {player.restriction.answered} / {player.restriction.quota} answered</strong><span>{restrictionIncomplete(player) ? "Play Mode is currently locked." : "Daily learning requirement is complete."}</span></div><button className="secondary-button" type="button" onClick={() => setUnlocked(false)}><LockKeyhole size={15} /> Lock controls</button></div>}
      </section>
    </div>
  </Modal>;
}

function DailyLoginModal({ player, onClaim, onSelectReward, onClose }: { player: PlayerState; onClaim: () => void; onSelectReward: (choice: "epic" | "research", cardId?: string) => void; onClose: () => void }) {
  const claimedToday = player.lastLoginClaim === todayKey();
  const orientationActive = player.orientationDay >= 7 ? 6 : player.orientationDay;
  const monthlyActive = claimedToday ? (player.monthlyLoginDay + 27) % 28 : player.monthlyLoginDay;
  const epicChoices = CARD_POOL.filter((card) => card.rarity === "Epic" && !card.exclusive);
  const rewardText = (reward: (typeof ORIENTATION_LOGIN_REWARDS)[number]) => reward.cardId ? `${CARD_BY_ID[reward.cardId]?.name ?? "Exclusive card"} · ${rewardLabel(reward)}` : reward.selector ? `${rewardLabel(reward)} · Selector Box` : rewardLabel(reward);
  const icon = (reward: (typeof ORIENTATION_LOGIN_REWARDS)[number]) => reward.cardId ? <Crown size={20} /> : reward.selector ? <Gift size={20} /> : reward.summonTickets ? <Ticket size={20} /> : reward.gems ? <Gem size={20} /> : reward.skillPoints ? <Sparkles size={20} /> : reward.knowledgePoints ? <BookOpen size={20} /> : <Coins size={20} />;
  const compactReward = (reward: (typeof ORIENTATION_LOGIN_REWARDS)[number]) => reward.selector ? "SELECTOR" : reward.summonTickets ? `${reward.summonTickets}T` : reward.gems ? `${reward.gems}G` : reward.coins ? `${reward.coins}RT` : reward.knowledgePoints ? `${reward.knowledgePoints}KP` : reward.skillPoints ? `${reward.skillPoints}SP` : `${reward.xp ?? 0}XP`;
  return <Modal title="Scholar Attendance" onClose={onClose} wide><div className="v2-daily v6-attendance"><div className="v2-daily-intro"><Gift size={30} /><div><strong>{player.loginStreak} day attendance streak</strong><span>One claim advances both active reward tracks. Orientation is available once; Monthly Attendance loops every 28 days.</span></div></div><section className="v6-orientation"><header><div><span className="section-kicker">NEW SCHOLARS · ONE TIME</span><h3>Orientation Week</h3></div><strong>{Math.min(7, player.orientationDay)} / 7</strong></header><div className="v2-login-grid">{ORIENTATION_LOGIN_REWARDS.map((reward, index) => { const complete = index < player.orientationDay || player.orientationDay >= 7; const active = player.orientationDay < 7 && index === orientationActive; return <div key={index} className={`${active ? "today" : ""} ${complete ? "claimed" : ""}`}><small>DAY {index + 1}</small><span>{icon(reward)}</span><strong>{rewardText(reward)}</strong>{index === 6 && <em>EXCLUSIVE LEGENDARY</em>}{complete && <b><Check size={12} /> CLAIMED</b>}</div>; })}</div></section><section className="v6-monthly"><header><div><span className="section-kicker">CONTINUOUS · 28 DAYS</span><h3>Monthly Attendance</h3></div><strong>Day {monthlyActive + 1}</strong></header><div className="v6-month-grid">{MONTHLY_LOGIN_REWARDS.map((reward, index) => <div key={index} className={`${index === monthlyActive ? "today" : ""} ${claimedToday && index === monthlyActive ? "claimed" : ""}`} title={rewardText(reward)}><small>{index + 1}</small>{icon(reward)}<span>{compactReward(reward)}</span></div>)}</div></section>{player.monthlySelectorPending ? <section className="v6-selector-box"><header><Gift size={24} /><div><strong>Day 28 Selector Box</strong><span>Choose one Epic card or Research Tokens for 10 standard summons.</span></div></header><button type="button" className="v6-ticket-choice" onClick={() => onSelectReward("research")}><Coins size={22} /><span><strong>10× Standard Summons</strong><small>Receive 900 Research Tokens</small></span></button><div className="v6-epic-choices">{epicChoices.map((card) => <button type="button" key={card.id} onClick={() => onSelectReward("epic", card.id)}><strong>{card.symbol}</strong><span>{card.name}</span><small>{card.subject} · Epic</small></button>)}</div></section> : <button type="button" className="gold-button" onClick={onClaim} disabled={claimedToday}>{claimedToday ? <><Check size={17} /> Today&apos;s rewards claimed</> : <><Gift size={17} /> Claim today&apos;s attendance</>}</button>}</div></Modal>;
}

function ShareModal({ link, onClose, onCopied }: { link: string; onClose: () => void; onCopied: () => void }) {
  return <Modal title="Share Axiom" onClose={onClose}><div className="v2-share"><Share2 size={31} /><h3>Invite a fellow Scholar</h3><p>This accessible link can be opened directly or copied into any message.</p><label><span>SHARE LINK</span><div><input value={link} readOnly /><button type="button" onClick={() => copyText(link).then(onCopied)}><Copy size={16} /> Copy</button></div></label>{typeof navigator !== "undefined" && "share" in navigator && <button type="button" className="secondary-button" onClick={() => navigator.share({ title: "Axiom: The Scholar's Deck", text: "Join my thesis in Axiom.", url: link })}><Share2 size={16} /> Open share menu</button>}</div></Modal>;
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [player, setPlayer] = useState<PlayerState>(() => normalizePlayer(createDefaultPlayer()));
  const [account, setAccount] = useState<Account>({ email: null, displayName: "Guest Scholar", signedIn: false, authMethod: null });
  const [sync, setSync] = useState<SyncState>("loading");
  const [loaded, setLoaded] = useState(false);
  const [guestId, setGuestId] = useState("");
  const [modal, setModal] = useState<ModalName>(null);
  const [toast, setToast] = useState("");
  const [tutorialSummon, setTutorialSummon] = useState(false);
  const [selectedStage, setSelectedStage] = useState<Stage>(CHAPTERS[0].stages[0]);
  const [focus, setFocus] = useState(0);
  const [reward, setReward] = useState<RewardSummary>({ stageTitle: CHAPTERS[0].stages[0].title });
  const [maxHit, setMaxHit] = useState(0);
  const [dailyDismissed, setDailyDismissed] = useState(false);
  const saveTimer = useRef<number | null>(null);
  const tabId = useRef("");
  const showToast = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2400); };

  useEffect(() => {
    tabId.current = makeClientId();
    let id = window.localStorage.getItem("axiom-guest-id");
    if (!id) { id = makeClientId(); window.localStorage.setItem("axiom-guest-id", id); }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGuestId(id);
    fetch("/api/player", { headers: { "x-axiom-guest-id": id } }).then(async (response) => { if (!response.ok) throw new Error("Profile sync unavailable"); return response.json(); }).then((data: { state: PlayerState; account: Account }) => { const next = normalizePlayer(data.state); if (!next.referralCode) next.referralCode = `AX-${id!.replaceAll("-", "").slice(0, 8).toUpperCase()}`; setPlayer(next); setAccount(data.account); setSync("saved"); }).catch(() => { setPlayer((current) => ({ ...current, referralCode: current.referralCode || `AX-${id!.replaceAll("-", "").slice(0, 8).toUpperCase()}` })); setSync("offline"); }).finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded || !guestId) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSync("saving");
    saveTimer.current = window.setTimeout(() => { fetch("/api/player", { method: "POST", headers: { "content-type": "application/json", "x-axiom-guest-id": guestId }, body: JSON.stringify({ state: player }) }).then((response) => { if (!response.ok) throw new Error("Save failed"); setSync("saved"); const channel = new BroadcastChannel("axiom-player-sync"); channel.postMessage({ source: tabId.current }); channel.close(); }).catch(() => setSync("offline")); }, 420);
    return () => { if (saveTimer.current) window.clearTimeout(saveTimer.current); };
  }, [player, loaded, guestId]);

  useEffect(() => { if (!loaded) return; const timer = window.setInterval(() => setPlayer((current) => normalizePlayer({ ...current, playSeconds: current.playSeconds + 30 })), 30000); return () => window.clearInterval(timer); }, [loaded]);
  useEffect(() => { document.documentElement.dataset.theme = player.settings.theme; document.documentElement.classList.toggle("reduce-vfx", player.settings.reducedMotion); }, [player.settings.theme, player.settings.reducedMotion]);
  const updatePlayer = (recipe: (current: PlayerState) => PlayerState) => setPlayer((current) => normalizePlayer(recipe(current)));
  const recordGlobalRank = useCallback((rank: number) => setPlayer((current) => rank < current.bestGlobalRank ? normalizePlayer({ ...current, bestGlobalRank: rank }) : current), []);
  const addReward = (state: PlayerState, gained: QuestReward) => ({ ...state, coins: state.coins + (gained.coins ?? 0), gems: state.gems + (gained.gems ?? 0), knowledgePoints: state.knowledgePoints + (gained.knowledgePoints ?? 0), skillPoints: state.skillPoints + (gained.skillPoints ?? 0), standardTickets: state.standardTickets + (gained.standardTickets ?? 0), summonTickets: state.summonTickets + (gained.summonTickets ?? 0), xp: state.xp + (gained.xp ?? 0) });
  const advanceState = (state: PlayerState, metric: string, amount = 1) => {
    const dailyProgress = { ...state.dailyProgress, [metric]: (state.dailyProgress[metric] ?? 0) + amount };
    return { ...state, dailyProgress, weeklyProgress: { ...state.weeklyProgress, [metric]: (state.weeklyProgress[metric] ?? 0) + amount }, dailyQuestStates: DAILY_QUESTS.map((quest) => (dailyProgress[quest.metric] ?? 0) >= quest.target) };
  };
  const recordQuestEvent = (metric: string, amount = 1) => updatePlayer((current) => advanceState(current, metric, amount));
  const playTone = (kind: "hit" | "shield" | "heal") => { if (!player.settings.sound) return; try { const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext; if (!AudioContextClass) return; const context = new AudioContextClass(); const oscillator = context.createOscillator(); const gain = context.createGain(); oscillator.frequency.value = kind === "hit" ? 140 : kind === "shield" ? 520 : 720; gain.gain.value = Math.max(.01, player.settings.effectsVolume / 1000); oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .18); oscillator.stop(context.currentTime + .2); } catch { /* Audio is optional. */ } };

  const goHome = () => { setModal(null); setTutorialSummon(false); setScreen("landing"); };
  const goHub = () => { setTutorialSummon(false); if (restrictionIncomplete(player)) { setScreen("questions"); showToast(`Answer ${player.restriction.quota - player.restriction.answered} more questions to unlock Play.`); return; } setScreen("hub"); if (player.lastLoginClaim !== todayKey() && !dailyDismissed) setModal("daily"); };
  const navigate = (target: Screen) => { if (restrictionIncomplete(player) && target !== "questions" && target !== "landing") { setScreen("questions"); showToast("Restriction Mode: complete today’s Question Lab quota first."); return; } setScreen(target); };
  const enter = () => { if (player.tutorialComplete) { if (restrictionIncomplete(player)) setScreen("questions"); else goHub(); } else setScreen("onboarding"); };
  const shareLink = typeof window === "undefined" ? "" : `${window.location.origin}/?ref=${player.referralCode}`;
  const claimDailyLogin = () => {
    if (player.lastLoginClaim === todayKey()) return;
    const orientationReward = player.orientationDay < 7 ? ORIENTATION_LOGIN_REWARDS[player.orientationDay] : null;
    const monthlyReward = MONTHLY_LOGIN_REWARDS[player.monthlyLoginDay];
    updatePlayer((current) => {
      let next = current;
      if (orientationReward) next = addReward(next, orientationReward);
      next = addReward(next, monthlyReward);
      if (orientationReward?.cardId) next = { ...next, ownedCards: { ...next.ownedCards, [orientationReward.cardId]: Math.max(1, next.ownedCards[orientationReward.cardId] ?? 0) } };
      return { ...next, lastLoginClaim: todayKey(), loginStreak: current.loginStreak + 1, orientationDay: Math.min(7, current.orientationDay + (orientationReward ? 1 : 0)), monthlyLoginDay: (current.monthlyLoginDay + 1) % 28, monthlySelectorPending: current.monthlySelectorPending || Boolean(monthlyReward.selector) };
    });
    playTone("shield");
    showToast(`Attendance claimed · ${[orientationReward && rewardLabel(orientationReward), rewardLabel(monthlyReward)].filter(Boolean).join(" + ")}`);
    if (!monthlyReward.selector) { setModal(null); setDailyDismissed(true); }
  };
  const claimMonthlySelector = (choice: "epic" | "research", cardId?: string) => {
    if (!player.monthlySelectorPending) return;
    updatePlayer((current) => choice === "research" ? { ...current, coins: current.coins + 900, monthlySelectorPending: false } : cardId && CARD_BY_ID[cardId]?.rarity === "Epic" ? { ...current, ownedCards: { ...current.ownedCards, [cardId]: 1 }, monthlySelectorPending: false } : current);
    showToast(choice === "research" ? "Selector claimed · 900 RT for 10 standard summons" : `Selector claimed · ${CARD_BY_ID[cardId ?? ""]?.name ?? "Epic card"}`);
    setModal(null); setDailyDismissed(true);
  };
  const claimQuest = (quest: Quest, weekly: boolean) => { const progress = weekly ? player.weeklyProgress : player.dailyProgress; const claimed = weekly ? player.claimedWeekly : player.claimedDaily; if ((progress[quest.metric] ?? 0) < quest.target || claimed.includes(quest.id)) return; updatePlayer((current) => ({ ...addReward(current, quest.reward), claimedDaily: weekly ? current.claimedDaily : [...current.claimedDaily, quest.id], claimedWeekly: weekly ? [...current.claimedWeekly, quest.id] : current.claimedWeekly })); playTone("shield"); showToast(`Claimed ${rewardLabel(quest.reward)}`); };
  const claimAllQuests = (weekly: boolean) => {
    const quests = weekly ? WEEKLY_QUESTS : DAILY_QUESTS;
    const milestoneKey = weekly ? `weekly:${weekKey()}` : `daily:${todayKey()}`;
    const milestoneTarget = weekly ? 5 : quests.length;
    updatePlayer((current) => {
      const progress = weekly ? current.weeklyProgress : current.dailyProgress;
      const already = weekly ? current.claimedWeekly : current.claimedDaily;
      const ready = quests.filter((quest) => (progress[quest.metric] ?? 0) >= quest.target);
      let next = current;
      for (const quest of ready) if (!already.includes(quest.id)) next = addReward(next, quest.reward);
      const claimedIds = [...new Set([...already, ...ready.map((quest) => quest.id)])];
      if (ready.length >= milestoneTarget && !current.claimedQuestMilestones.includes(milestoneKey)) {
        next = addReward(next, weekly ? { summonTickets: 1, gems: 100 } : { standardTickets: 1, gems: 50, knowledgePoints: 100 });
        next = { ...next, claimedQuestMilestones: [...next.claimedQuestMilestones, milestoneKey].slice(-30) };
      }
      return { ...next, claimedDaily: weekly ? next.claimedDaily : claimedIds, claimedWeekly: weekly ? claimedIds : next.claimedWeekly };
    });
    playTone("shield");
    showToast(weekly ? "Weekly Thesis rewards claimed" : "All ready Daily rewards claimed");
  };
  const selectStage = (stage: Stage) => { setSelectedStage(stage); setScreen("study"); };
  const startTower = (stage: Stage) => { setSelectedStage(stage); setFocus(0); setScreen("study"); };
  const recordStudyAnswer = (subject: StudySubject, correct: boolean) => updatePlayer((current) => {
    const stats = current.subjectStats[subject];
    let next = { ...current, subjectStats: { ...current.subjectStats, [subject]: { answered: stats.answered + 1, correct: stats.correct + (correct ? 1 : 0) } } };
    if (correct) next = advanceState(addReward(next, { xp: 20 }), "answers");
    return next;
  });
  const recordInfiniteAnswer = (subject: StudySubject, correct: boolean, gained: QuestReward) => updatePlayer((current) => {
    const stats = current.subjectStats[subject];
    let next = { ...current, subjectStats: { ...current.subjectStats, [subject]: { answered: stats.answered + 1, correct: stats.correct + (correct ? 1 : 0) } }, restriction: { ...current.restriction, answered: current.restriction.answered + 1, dayKey: todayKey() } };
    if (correct) next = advanceState(addReward(next, gained), "answers");
    else next = { ...next, gems: Math.max(0, next.gems + (gained.gems ?? 0)), coins: Math.max(0, next.coins + (gained.coins ?? 0)) };
    return next;
  });
  const completeStage = (hit: number, perfectEquilibrium = false) => {
    if (selectedStage.kind === "tower") {
      const gained: RewardSummary = { xp: selectedStage.xp, coins: selectedStage.coins, gems: selectedStage.gems, knowledgePoints: Math.round(selectedStage.xp * .6), summonTickets: selectedStage.towerFloor && selectedStage.towerFloor % 10 === 0 ? 1 : 0, skillPoints: selectedStage.towerFloor && selectedStage.towerFloor % 5 === 0 ? 1 : 0, stageTitle: selectedStage.title, towerFloor: selectedStage.towerFloor };
      updatePlayer((current) => { let next = addReward(current, gained); next = advanceState(next, "stages"); next = advanceState(next, "towerFloors"); if ((selectedStage.towerFloor ?? 0) % 10 === 0) next = advanceState(next, "mythicBosses"); return { ...next, towerFloor: Math.max(current.towerFloor, (selectedStage.towerFloor ?? 0) + 1), towerBest: Math.max(current.towerBest, selectedStage.towerFloor ?? 0), highestCombo: Math.max(current.highestCombo, hit), perfectEquilibrium: current.perfectEquilibrium + (perfectEquilibrium ? 1 : 0) }; });
      setReward(gained); setMaxHit(hit); setScreen("victory"); return;
    }
    const firstClear = !player.clearedStages.includes(selectedStage.id);
    if (selectedStage.kind === "event") {
      const eventCards = CARD_POOL.filter((card) => card.eventOnly);
      const drop = Math.random() < .28 ? eventCards[randomInt(0, eventCards.length - 1)] : null;
      const ticketDrop = Math.random() < .1;
      const gained: RewardSummary = { xp: selectedStage.xp, coins: selectedStage.coins, gems: selectedStage.gems, knowledgePoints: 260, summonTickets: ticketDrop ? 1 : 0, stageTitle: selectedStage.title };
      updatePlayer((current) => { let next = addReward(current, gained); if (drop) next = (current.ownedCards[drop.id] ?? 0) > 0 ? { ...next, cardFragments: { ...next.cardFragments, [drop.id]: (next.cardFragments[drop.id] ?? 0) + 1 } } : { ...next, ownedCards: { ...next.ownedCards, [drop.id]: 1 } }; next = advanceState(next, "chronicleZero"); return advanceState(next, "stages"); });
      setReward(gained); setMaxHit(hit); setScreen("victory"); showToast(drop ? `Event Card acquired: ${drop.name}${ticketDrop ? " · Limited Ticket dropped" : ""}` : ticketDrop ? "Chronicle Zero cleared · Limited Ticket dropped" : "Chronicle Zero cleared · no Ticket this time"); return;
    }
    const chapter = CHAPTERS[selectedStage.chapter - 1];
    const isBoss = selectedStage.id === chapter.stages.at(-1)!.id;
    const gained: RewardSummary = firstClear ? { xp: selectedStage.xp, coins: selectedStage.coins, gems: selectedStage.gems, knowledgePoints: Math.round(selectedStage.xp * .5), skillPoints: selectedStage.kind === "elite" || selectedStage.kind === "boss" ? 1 : 0, chapterXp: isBoss ? 500 : 0, replay: false, stageTitle: selectedStage.title } : { xp: 40, coins: 70, gems: 0, knowledgePoints: 20, skillPoints: 0, replay: true, stageTitle: selectedStage.title };
    updatePlayer((current) => { let next = addReward(current, { xp: (gained.xp ?? 0) + (gained.chapterXp ?? 0), coins: gained.coins, gems: gained.gems, knowledgePoints: gained.knowledgePoints, skillPoints: gained.skillPoints }); next = advanceState(next, "stages"); if (isBoss) next = advanceState(next, "mythicBosses"); return { ...next, clearedStages: firstClear ? [...current.clearedStages, selectedStage.id] : current.clearedStages, highestCombo: Math.max(current.highestCombo, hit), perfectEquilibrium: current.perfectEquilibrium + (perfectEquilibrium ? 1 : 0) }; });
    setReward(gained); setMaxHit(hit); setScreen("victory");
  };
  const applySummon = (cards: GameCard[], coins: number, tickets: number, standardTickets: number, pity: PlayerState["pity"], banner: Subject, pityBlessing: boolean) => updatePlayer((current) => {
    const owned = { ...current.ownedCards }; const cardFragments = { ...current.cardFragments };
    for (const card of cards) { if ((owned[card.id] ?? 0) > 0) cardFragments[card.id] = (cardFragments[card.id] ?? 0) + 1; else owned[card.id] = 1; }
    let next = { ...current, coins: Math.max(0, current.coins - coins), summonTickets: Math.max(0, current.summonTickets - tickets), standardTickets: Math.max(0, current.standardTickets - standardTickets), ownedCards: owned, cardFragments, pity, lastBanner: banner, pityBlessing: current.pityBlessing + (pityBlessing ? 1 : 0) };
    next = advanceState(next, "summons", cards.length); return next;
  });
  const exchangeLimitedTicket = () => { if (player.gems < 160) return; updatePlayer((current) => ({ ...current, gems: current.gems - 160, summonTickets: current.summonTickets + 1 })); showToast("Exchange complete · 1 Limited Ticket"); };
  const finishTutorial = () => { updatePlayer((current) => ({ ...current, tutorialComplete: true })); setTutorialSummon(false); setScreen("hub"); if (player.lastLoginClaim !== todayKey() && !dailyDismissed) setModal("daily"); };
  const buySkill = (id: string, gems: number, knowledgePoints: number, skillPoints: number) => { if (player.unlockedSkills.includes(id) || player.gems < gems || player.knowledgePoints < knowledgePoints || player.skillPoints < skillPoints) return; updatePlayer((current) => advanceState({ ...current, gems: current.gems - gems, knowledgePoints: current.knowledgePoints - knowledgePoints, skillPoints: current.skillPoints - skillPoints, unlockedSkills: [...current.unlockedSkills, id] }, "skills")); playTone("shield"); showToast("Permanent radial node researched"); };
  const perfectParry = () => updatePlayer((current) => advanceState({ ...current, perfectParries: current.perfectParries + 1 }, "parries"));
  const unlockMadScientist = () => updatePlayer((current) => current.madScientist ? current : ({ ...current, madScientist: 1 }));
  const upgradeCard = (cardId: string) => updatePlayer((current) => {
    const level = current.cardLevels[cardId] ?? 1;
    const cost = fragmentCostForLevel(level);
    if (level >= 5 || (current.cardFragments[cardId] ?? 0) < cost) return current;
    showToast(`${CARD_BY_ID[cardId].name} upgraded to Level ${level + 1}`);
    return advanceState({ ...current, cardLevels: { ...current.cardLevels, [cardId]: level + 1 }, cardFragments: { ...current.cardFragments, [cardId]: current.cardFragments[cardId] - cost } }, "fragmentUpgrades");
  });
  const pvpResult = (won: boolean) => updatePlayer((current) => { let next = addReward({ ...current, pvpWins: current.pvpWins + (won ? 1 : 0), pvpLosses: current.pvpLosses + (won ? 0 : 1), pvpRating: Math.max(0, current.pvpRating + (won ? 25 : -15)) }, { xp: won ? 180 : 60, coins: won ? 100 : 30 }); if (won) next = advanceState(next, "pvpWins"); return next; });

  return <LanguageContext.Provider value={player.settings.language}><main className={`axiom-app theme-${player.settings.theme} language-${player.settings.language} ${player.settings.reducedMotion ? "reduce-vfx" : ""}`}>
    {!loaded && <div className="v2-loading"><Image className="loading-logo" src="/axiom-logo.png" alt="Axiom crest" width={500} height={500} priority unoptimized /><RefreshCw size={24} /><span>Opening the Archives…</span></div>}
    {loaded && screen === "landing" && <Landing player={player} account={account} onEnter={enter} onAuth={() => setModal("auth")} onInfo={() => setModal("info")} onLore={() => setModal("lore")} onHome={goHome} onRankings={() => setScreen("rankings")} />}
    {loaded && screen === "onboarding" && <Onboarding player={player} onGradeSelect={(educationLevel) => updatePlayer((current) => ({ ...current, educationLevel, customQuestionBank: null }))} onContinue={finishTutorial} onInfo={() => setModal("info")} onHome={goHome} />}
    {loaded && screen === "tutorial" && <Tutorial onComplete={() => { setTutorialSummon(true); setScreen("summon"); }} onInfo={() => setModal("info")} onHome={goHome} />}
    {loaded && screen === "hub" && <Hub player={player} account={account} sync={sync} go={navigate} onHome={goHome} onSettings={() => setModal("settings")} onInfo={() => setModal("info")} onDaily={() => setModal("daily")} onShare={() => setModal("share")} onLore={() => setModal("lore")} onEvent={selectStage} />}
    {loaded && screen === "chapters" && <Chapters player={player} onBack={goHub} onHome={goHome} onSelect={selectStage} onTower={() => setScreen("tower")} onInfo={() => setModal("info")} onSettings={() => setModal("settings")} />}
    {loaded && screen === "study" && <Study key={selectedStage.id} stage={selectedStage} player={player} onBack={() => setScreen(selectedStage.kind === "tower" ? "tower" : selectedStage.kind === "event" ? "hub" : "chapters")} onHome={goHome} onComplete={(score, wrongAnswers) => { if (selectedStage.kind === "tower" && wrongAnswers === 0) recordQuestEvent("flawlessTower"); setFocus(score); setScreen("combat"); }} onAnswer={recordStudyAnswer} onInfo={() => setModal("info")} onSettings={() => setModal("settings")} />}
    {loaded && screen === "combat" && <Combat key={`${selectedStage.id}-${focus}`} stage={selectedStage} player={player} focus={focus} onBack={() => setScreen(selectedStage.kind === "tower" ? "tower" : selectedStage.kind === "event" ? "hub" : "chapters")} onHome={goHome} onVictory={completeStage} onAbility={() => updatePlayer((current) => advanceState(current, "abilities"))} onPerfectParry={perfectParry} onMadScientist={unlockMadScientist} onQuestEvent={recordQuestEvent} onInfo={() => setModal("info")} onSettings={() => setModal("settings")} playTone={playTone} />}
    {loaded && screen === "victory" && <Victory reward={reward} maxHit={maxHit} player={player} onHub={goHub} onHome={goHome} onInfo={() => setModal("info")} onShare={() => setModal("share")} />}
    {loaded && screen === "deck" && <TieredDeckBuilder player={player} onBack={goHub} onHome={goHome} onSave={(loadout) => { updatePlayer((current) => ({ ...current, deckIds: [...loadout], baseDeckIds: loadout.filter((id) => CARD_BY_ID[id]?.tier === "Base"), tacticalDeckIds: loadout.filter((id) => CARD_BY_ID[id]?.tier === "Tactical"), breakthroughDeckIds: loadout.filter((id) => CARD_BY_ID[id]?.tier === "Breakthrough") })); showToast("Legal 16-card theorem saved"); }} onInfo={() => setModal("info")} onSettings={() => setModal("settings")} />}
    {loaded && screen === "codex" && <Codex player={player} onBack={goHub} onHome={goHome} onUpgrade={upgradeCard} onInfo={() => setModal("info")} onSettings={() => setModal("settings")} />}
    {loaded && screen === "skills" && <SkillTree player={player} onBack={goHub} onHome={goHome} onBuy={buySkill} onInfo={() => setModal("info")} onSettings={() => setModal("settings")} />}
    {loaded && screen === "summon" && <Summon player={player} tutorialMode={tutorialSummon} onBack={goHub} onHome={goHome} onApply={applySummon} onExchangeTicket={exchangeLimitedTicket} onTutorialComplete={tutorialSummon ? finishTutorial : goHub} onInfo={() => setModal("info")} onSettings={() => setModal("settings")} playTone={playTone} />}
    {loaded && screen === "quests" && <Quests player={player} onBack={goHub} onHome={goHome} onClaim={claimQuest} onClaimAll={claimAllQuests} onInfo={() => setModal("info")} onSettings={() => setModal("settings")} />}
    {loaded && screen === "tower" && <Tower player={player} onBack={() => setScreen("chapters")} onHome={goHome} onStart={startTower} onInfo={() => setModal("info")} onSettings={() => setModal("settings")} />}
    {loaded && screen === "achievements" && <Achievements player={player} onBack={goHub} onHome={goHome} onEquip={(title, frame) => { updatePlayer((current) => ({ ...current, equippedTitle: title, equippedFrame: frame ?? current.equippedFrame })); showToast(`${title}${frame ? ` · ${frame}` : ""} equipped`); }} onInfo={() => setModal("info")} onSettings={() => setModal("settings")} />}
    {loaded && screen === "pvp" && <PvP player={player} guestId={guestId} onBack={goHub} onHome={goHome} onResult={pvpResult} onInfo={() => setModal("info")} onSettings={() => setModal("settings")} onCopied={showToast} />}
    {loaded && screen === "rankings" && <Rankings player={player} scholarName={account.displayName} onRank={recordGlobalRank} onBack={screen === "rankings" && player.tutorialComplete ? goHub : goHome} onHome={goHome} onInfo={() => setModal("info")} onSettings={() => setModal("settings")} />}
    {loaded && screen === "questions" && <QuestionSection key={`questions-grade-${player.educationLevel}`} player={player} onBack={restrictionIncomplete(player) ? goHome : goHub} onHome={goHome} onAnswer={recordInfiniteAnswer} onInfo={() => setModal("info")} onSettings={() => setModal("settings")} />}
    {modal === "info" && <InfoModal screen={screen} onClose={() => setModal(null)} />}
    {modal === "auth" && <AuthModal account={account} onClose={() => setModal(null)} onAuthenticated={() => window.location.reload()} />}
    {modal === "settings" && <ProtectedSettingsModal player={player} onSettingsChange={(settings) => updatePlayer((current) => ({ ...current, settings }))} onGuardianChange={(patch) => { updatePlayer((current) => ({ ...current, ...patch })); if (patch.restriction?.enabled && patch.restriction.answered < patch.restriction.quota) setScreen("questions"); }} onClose={() => setModal(null)} />}
    {modal === "daily" && <DailyLoginModal player={player} onClaim={claimDailyLogin} onSelectReward={claimMonthlySelector} onClose={() => { setModal(null); setDailyDismissed(true); }} />}
    {modal === "share" && <ShareModal link={shareLink} onClose={() => setModal(null)} onCopied={() => showToast("Share link copied")} />}
    {modal === "lore" && <LoreModal language={player.settings.language} onClose={() => setModal(null)} />}
    {toast && <div className="v2-toast" role="status"><Check size={17} />{toast}</div>}
  </main></LanguageContext.Provider>;
}
