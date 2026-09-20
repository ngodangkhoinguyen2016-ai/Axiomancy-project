# AXIOMANCY — LỊCH SỬ CÂU LỆNH PHÁT TRIỂN

Tài liệu này là nhật ký đã **lọc thông tin nhạy cảm** và có thể tái thực thi của quá trình phát triển Axiomancy. Nhật ký thô của terminal không được phân phối vì có thể chứa token triển khai, URL credential tạm thời và đường dẫn nội bộ. Không có Access Cipher, API key, cookie hoặc token nào xuất hiện trong file này.

Mốc xác minh cuối: `2026-09-19T08:05:04Z` (UTC).

## 1. Khảo sát và kiểm tra repository

```bash
pwd
rg --files
rg -n "QUESTION_BANK|SKILL_NODES|SUMMON_RATES|DECK_SIZE" app db scripts
git status --short
git log --date=iso-strict --pretty=format:'%h | %ad | %s' --reverse
git diff --check
```

Mục đích: xác định cấu trúc codebase, các hệ thống hiện có, lịch sử commit và lỗi khoảng trắng trước khi sửa.

## 2. Cài dependency và chạy môi trường phát triển

```bash
npm ci
npm run dev
```

Trong môi trường kiểm thử Sites, preview tương đương được chạy bằng:

```bash
sites-preview start /workspace/scratch/2d1abc5e938f/axiomancy-site
```

Lệnh `sites-preview` là tiện ích của môi trường phát triển được quản lý. Khi clone từ GitHub, dùng `npm run dev`.

## 3. Tìm kiếm và chỉnh sửa có kiểm soát

```bash
rg -n "skill-tree|pity|quest|overflow|card-container" app
rg -n "Scholar ID|Access Cipher|PBKDF2" app db
rg -n "Mathematics|Physics|Chemistry|Biology" app scripts
```

Các thay đổi mã nguồn được áp dụng theo từng patch nhỏ, sau đó chạy `git diff --check`, TypeScript, lint và build. Các file trọng tâm gồm:

```text
app/page.tsx
app/game-data.ts
app/learning-engine.ts
app/localization.ts
app/panzoom.ts
app/scholar-auth.ts
app/v10.css
db/schema.ts
```

## 4. Database và migration

```bash
npm run db:generate
```

Các migration được lưu trong `drizzle/`. Khi triển khai vào Cloudflare D1 riêng:

```bash
npx wrangler login
npx wrangler d1 create axiomancy-db
npx wrangler d1 migrations apply axiomancy-db --remote
```

Binding database phải giữ tên `DB`.

## 5. Kiểm tra Procedural Question Engine

```bash
python3 scripts/tower_question_generator.py Mathematics 7
python3 scripts/tower_question_generator.py Physics 8
python3 scripts/tower_question_generator.py Chemistry 10 --seed demo-01
python3 scripts/tower_question_generator.py Biology 12 --seed demo-02
```

Mỗi lần gọi chỉ trả về một câu hỏi. Frontend/API tiếp tục quản lý tính duy nhất theo grade, subject và epoch hai giờ.

## 6. Kiểm tra tĩnh và build

```bash
npx tsc --noEmit
npm run lint
npm run build
npm run validate:artifact
npm test
```

Kết quả xác minh cuối:

- `npx tsc --noEmit`: exit code `0`.
- `npm run lint`: exit code `0`, không có ESLint error.
- `npm test`: exit code `0`.
- Vinext build: hoàn tất đủ 5 giai đoạn.
- Worker artifact: có `default.fetch` dạng ESM và hosting manifest hợp lệ.
- Node test: `1 passed`, `0 failed`.

Chi tiết nằm tại [docs/evidence/TEST_RESULTS.md](docs/evidence/TEST_RESULTS.md).

## 7. Kiểm thử giao diện bằng trình duyệt

Sau khi preview chạy, luồng được thao tác trực tiếp bằng trình duyệt tại viewport desktop:

```text
Landing → FTUE Grade 7 → Resource Archive → Deck tutorial
→ PEMDAS tutorial → Grand Archives → Skill Tree
→ Infinite Question Lab + AI Tutor → Codex → Gacha
```

Các ảnh chụp được lưu trong `docs/evidence/`. Kiểm tra DOM bổ sung:

```text
Landing/Hub: innerWidth = 1363, scrollWidth = 1363
Skill Tree: viewport overflow = hidden, canvas có transform pan/zoom
Codex: 63 card containers, 189 lớp card render
```

## 8. Git và triển khai Sites

Các lệnh Git cốt lõi được dùng trong từng mốc phát triển:

```bash
git add <cac-file-da-xac-minh>
git commit -m "<mo-ta-thay-doi>"
git push origin main
git rev-parse --verify HEAD
```

Commit đang gắn với bản Sites Version 13:

```text
9cc430ba6a0542d94ad8d43d54666997066a8716
```

Việc lưu version và publish được thực hiện qua API Sites sau khi push thành công. Credential repository là credential ngắn hạn, chỉ truyền cho tiến trình Git và đã được loại khỏi nhật ký này.

Trang đang chạy:

```text
https://axiom-scholars-deck.vmt9.chatgpt.site
```

## 9. Đóng gói bản giao GitHub

Trước khi đóng gói, lịch sử Git đã được xuất thành bundle di động:

```bash
git bundle create docs/evidence/axiomancy-history-through-v13.bundle --all
git bundle verify docs/evidence/axiomancy-history-through-v13.bundle
```

Kết quả verify: bundle chứa lịch sử hoàn chỉnh đến commit `9cc430b`.

Quy trình đóng gói loại trừ dependency, build output, cache, Git metadata và secret:

```bash
rsync -a \
  --exclude='.git/' \
  --exclude='node_modules/' \
  --exclude='dist/' \
  --exclude='.next/' \
  --exclude='.wrangler/' \
  --exclude='.sites-runtime/' \
  --exclude='.env*' \
  --exclude='*.tsbuildinfo' \
  axiomancy-site/ Axiomancy-GitHub-Source-v13/

zip -rq Axiomancy-GitHub-Source-with-Evidence-v13.zip \
  Axiomancy-GitHub-Source-v13

unzip -t Axiomancy-GitHub-Source-with-Evidence-v13.zip
sha256sum Axiomancy-GitHub-Source-with-Evidence-v13.zip
```

## 10. Lệnh cho người nhận sau khi giải nén

```bash
npm ci
npm run lint
npm test
npm run dev
```

Để đưa lên GitHub mới:

```bash
git init
git add .
git commit -m "Initial Axiomancy source with development evidence"
git branch -M main
git remote add origin https://github.com/TEN_TAI_KHOAN/TEN_REPOSITORY.git
git push -u origin main
```

Nếu muốn giữ nguyên 13 commit lịch sử thay vì tạo một commit mới, dùng bundle đi kèm:

```bash
git clone docs/evidence/axiomancy-history-through-v13.bundle axiomancy-with-history
cd axiomancy-with-history
git remote remove origin
git remote add origin https://github.com/TEN_TAI_KHOAN/TEN_REPOSITORY.git
git push -u origin main
```

Sau đó chép các tài liệu bàn giao mới từ gói ZIP vào repository vừa clone và commit chúng.
