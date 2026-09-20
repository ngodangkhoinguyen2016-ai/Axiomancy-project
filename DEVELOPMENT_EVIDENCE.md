# AXIOMANCY — MINH CHỨNG QUÁ TRÌNH PHÁT TRIỂN

## 1. Định danh bản bàn giao

| Thuộc tính | Giá trị |
|---|---|
| Sản phẩm | Axiom: The Scholar's Deck / Axiomancy |
| Nhánh nguồn | `main` |
| Commit Sites Version 13 | `9cc430ba6a0542d94ad8d43d54666997066a8716` |
| Public deployment | https://axiom-scholars-deck.vmt9.chatgpt.site |
| Lần xác minh cuối | `2026-09-19T08:05:04Z` |
| Stack | React 19, TypeScript, Vinext/Vite, Cloudflare Worker, D1, Drizzle ORM |

Bản xuất GitHub gồm mã nguồn của Version 13, tài liệu bàn giao, ảnh kiểm thử và các chỉnh sửa chất lượng sau triển khai (lint cleanup và chặn horizontal overflow). Những chỉnh sửa sau triển khai này có trong gói mã nguồn nhưng không được mô tả sai là một version Sites mới.

## 2. Timeline Git có thể đối chiếu

| Commit | Thời điểm | Nội dung |
|---|---:|---|
| `83cacd5` | 2026-08-18 | Create cinematic Axiom title experience |
| `7aba51f` | 2026-08-18 | Build complete interactive Axiom web game workflow |
| `d543e45` | 2026-08-25 | Expand progression, combat, quests, pity, and deck systems |
| `fba726e` | 2026-08-25 | Fix D1 runtime binding and publish expansion |
| `fa517a9` | 2026-08-26 | Expand progression, combat, summoning and PvP systems |
| `760d89c` | 2026-09-08 | Add subject decks and Axiom crest |
| `561dfda` | 2026-09-09 | Add adaptive learning, arena bots and rotating banners |
| `940def7` | 2026-09-10 | Add Scholar auth and balanced combat banners |
| `7aad847` | 2026-09-12 | Implement master gameplay workflow |
| `6a85e9c` | 2026-09-16 | Implement expanded design systems |
| `19c971f` | 2026-09-16 | Implement technical architecture workflow |
| `caba4dc` | 2026-09-17 | Add procedural curriculum and interactive skill map |
| `9cc430b` | 2026-09-18 | Overhaul Skill Tree, FTUE and localization |

Lịch sử nguyên bản có thể kiểm tra bằng:

```bash
git log --date=iso-strict --pretty=format:'%h | %ad | %s' --reverse
```

Gói bàn giao còn chứa [Git bundle lịch sử đầy đủ](docs/evidence/axiomancy-history-through-v13.bundle). Có thể xác minh độc lập bằng:

```bash
git bundle verify docs/evidence/axiomancy-history-through-v13.bundle
git clone docs/evidence/axiomancy-history-through-v13.bundle axiomancy-history
```

## 3. Bằng chứng tính năng trong mã nguồn

| Hệ thống | File bằng chứng | Nội dung có thể kiểm tra |
|---|---|---|
| Scholar Login/Signup | `app/api/auth/scholar/route.ts`, `app/scholar-auth.ts`, `db/schema.ts` | Validate Scholar ID, PBKDF2-SHA256 có salt, session token, lock sau nhiều lần sai |
| Zero-state profile | `app/game-data.ts`, `app/api/player/route.ts` | Level 0, tài nguyên 0, settings mặc định tiếng Việt, lưu tiến trình D1 |
| Google-backed access | `app/chatgpt-auth.ts`, `app/page.tsx` | Luồng sign-in host-backed và UI Continue with Google |
| Deck Building 16 lá | `app/game-data.ts`, `app/page.tsx` | `DECK_SIZE = 16`, tối thiểu 8 Base, rarity copy limits, drag-to-swap |
| Static five-card hand | `app/page.tsx` | Khôi phục tỷ lệ Base/operator/support/Breakthrough sau lượt |
| Combat/PEMDAS/AP | `app/page.tsx` | Equation resolution, AP, shields, boss actions, combat log, achievements |
| Procedural curriculum | `app/learning-engine.ts`, `app/question-bank.ts`, `scripts/tower_question_generator.py` | Dictionary-driven Grade 1–12, một câu/lần, epoch hai giờ |
| Mathematics-only Tower | `app/learning-engine.ts`, `app/api/tower/questions/route.ts`, `app/page.tsx` | Router và UI chỉ dùng Mathematics cho Tower |
| AI Tutor hints | `app/learning-engine.ts`, `app/page.tsx` | Hint theo ngữ cảnh, giải thích từng bước mà không nêu đáp án cuối |
| Radial Skill Tree | `app/panzoom.ts`, `app/page.tsx`, `app/v10.css` | Pan, pinch/scroll zoom, node states, inspector cố định, Max AP nodes |
| Gacha banners | `app/game-data.ts`, `app/page.tsx` | Mathematics/Chemistry/Physics/Biology, rates, dual pity, fragments |
| Card VFX | `app/page.tsx`, `app/v10.css` | 3 lớp render, clipping, Legendary gold, subject-specific Mythic VFX |
| Vietnamese/English | `app/localization.ts`, `app/page.tsx`, `db/schema.ts` | Vietnamese mặc định, toggle ngôn ngữ, English STEM terminology giữ nguyên |
| PvP rooms/bot fallback | `app/api/pvp/room/route.ts`, `app/page.tsx` | Private room code tách biệt; ranked queue có procedural bot fallback |
| Persistence | `db/schema.ts`, `db/index.ts`, `drizzle/` | Schema và bốn mốc migration D1 |

## 4. Minh chứng kiểm thử tự động

| Kiểm tra | Kết quả | Bằng chứng |
|---|---|---|
| TypeScript | PASS | `npx tsc --noEmit`, exit `0` |
| ESLint | PASS | `npm run lint`, exit `0` |
| Production build | PASS | Vinext hoàn thành 5/5 môi trường build |
| Worker artifact | PASS | ESM `default.fetch` và hosting manifest hợp lệ |
| Rendered HTML test | PASS | 1 test pass, 0 fail |
| Whitespace integrity | PASS | `git diff --check` không báo lỗi |

Output rút gọn nhưng giữ nguyên số liệu nằm tại [docs/evidence/TEST_RESULTS.md](docs/evidence/TEST_RESULTS.md).

## 5. Minh chứng kiểm thử trực quan

| Ảnh | Điều được chứng minh |
|---|---|
| [03-grand-archives-hub.jpg](docs/evidence/03-grand-archives-hub.jpg) | Grand Archives, navigation và trạng thái tài nguyên |
| [04-radial-skill-tree.jpg](docs/evidence/04-radial-skill-tree.jpg) | Skill Tree dạng radial, node states, zoom và inspector |
| [05-question-lab-ai-tutor.jpg](docs/evidence/05-question-lab-ai-tutor.jpg) | Grade 7 question bằng tiếng Việt và AI Tutor cung cấp hint từng bước |
| [06-codex-card-bank.jpg](docs/evidence/06-codex-card-bank.jpg) | Codex/Card Bank, rarity và card VFX được cắt trong biên |
| [07-gacha-banners.jpg](docs/evidence/07-gacha-banners.jpg) | 4 subject banners, dual pity và rated-up Mythic |

Kiểm tra DOM tại viewport desktop ghi nhận:

- Hub không có horizontal overflow: `innerWidth = 1363`, `scrollWidth = 1363`.
- Skill Tree viewport dùng `overflow: hidden`; canvas có transform sau thao tác zoom `125%`.
- Codex render `63` card containers và `189` lớp card (`background`, `VFX`, `content`).

## 6. Dấu vết database

Các migration được giữ nguyên trong repository:

```text
drizzle/0000_previous_gamma_corps.sql
drizzle/0001_amazing_mandrill.sql
drizzle/0002_misty_lila_cheney.sql
drizzle/0003_perfect_xorn.sql
```

Điều này cho phép kiểm tra sự phát triển của schema, thay vì chỉ có snapshot database cuối.

## 7. Cách tự tái kiểm chứng

```bash
npm ci
npx tsc --noEmit
npm run lint
npm test
npm run dev
```

Sau đó mở URL local mà Vite in ra và đối chiếu với ảnh trong `docs/evidence/`.
