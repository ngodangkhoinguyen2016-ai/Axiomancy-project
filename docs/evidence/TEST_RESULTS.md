# Verification Report

**Run:** `2026-09-19T08:05:04Z` (UTC)  
**Source HEAD:** `9cc430ba6a0542d94ad8d43d54666997066a8716`

## Commands and results

```text
$ npx tsc --noEmit
exit 0

$ npm run lint
> eslint . --ignore-pattern dist --ignore-pattern .next
exit 0

$ npm test
> npm run build && node --test tests/rendered-html.test.mjs

Vinext build:
  client references: 265 modules
  server references: 161 modules
  RSC environment:   271 modules
  client environment: 1657 modules
  SSR environment:   167 modules

Routes:
  /                        page
  /api/auth/scholar        API
  /api/leaderboard         API
  /api/player              API
  /api/pvp/room            API
  /api/questions           API
  /api/scholar/:scholarId  API
  /api/tower/questions     API

Artifact validation:
  PASS — ESM Worker default.fetch and hosting manifest are present.

Node test:
  tests: 1
  pass:  1
  fail:  0
```

Các cảnh báo proxy/npm trong môi trường build không làm test thất bại và không phải lỗi ứng dụng.

## Browser checks

| Check | Result |
|---|---|
| Grand Archives width | `innerWidth 1363 = scrollWidth 1363` |
| Horizontal overflow | Không phát hiện tại Hub sau CSS boundary fix |
| Skill Tree viewport | `overflow: hidden` |
| Skill Tree zoom | Đã thao tác và hiển thị `125%` |
| Skill inspector | Giữ cố định trong viewport khi canvas pan/zoom |
| Grade 7 question | Một câu đại số tiếng Việt được sinh và hiển thị |
| AI Tutor | Hiển thị gợi ý logic theo bước, không đưa đáp án cuối |
| Codex cards | `63` card containers |
| Card render layers | `189` layers = 3 lớp × 63 cards |
| Gacha navigation | Đủ 4 banner: Mathematics, Chemistry, Physics, Biology |

