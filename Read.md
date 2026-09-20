# AXIOMANCY — HƯỚNG DẪN MÃ NGUỒN

Đây là mã nguồn đầy đủ của **Axiom: The Scholar's Deck**, một web game giáo dục kết hợp câu hỏi STEM, card battler, gacha, chiến dịch, Endless Tower và Skill Tree.

## 1. Công nghệ sử dụng

- React 19 + TypeScript
- Next.js App Router chạy qua Vinext/Vite
- Cloudflare Worker
- Cloudflare D1 + Drizzle ORM
- Lucide React
- Python 3 cho bộ sinh câu hỏi tham chiếu của Endless Tower

## 2. Yêu cầu hệ thống

- Node.js `22.13.0` trở lên
- npm đi kèm Node.js
- Git
- Python 3.10 trở lên nếu muốn chạy bộ sinh câu hỏi Python
- Khuyến nghị dùng Linux hoặc WSL 2 trên Windows

> Các script build của dự án dùng Bash, `flock`, `curl` và GNU `timeout`. Trên Windows nên chạy dự án trong WSL 2 để toàn bộ lệnh hoạt động giống môi trường production.

## 3. Cài đặt và chạy nhanh

### Linux, macOS hoặc WSL 2

```bash
npm ci
npm run dev
```

Vite thường mở tại:

```text
http://localhost:5173
```

Nếu cổng đã được sử dụng, hãy mở đúng địa chỉ được hiển thị trong Terminal.

### Windows PowerShell không dùng WSL

Có thể chạy môi trường phát triển bằng các lệnh sau:

```powershell
npm ci
$env:WRANGLER_LOG_PATH=".wrangler/wrangler.log"
npx vite
```

Lệnh build chính thức vẫn nên chạy trong WSL vì `scripts/build-verified.sh` cần Bash và GNU `timeout`.

## 4. Các lệnh quan trọng

```bash
# Cài đúng phiên bản dependency trong package-lock.json
npm ci

# Chạy development server với hot reload
npm run dev

# Kiểm tra ESLint
npm run lint

# Build production và xác minh Worker artifact
npm run build

# Chạy toàn bộ test hiện có
npm test

# Kiểm tra lại artifact sau khi build
npm run validate:artifact

# Chạy bản production đã build
npm run start

# Sinh migration mới sau khi sửa db/schema.ts
npm run db:generate
```

## 5. Kiểm tra bộ sinh câu hỏi Python

Bộ sinh Python tạo đúng **một câu hỏi** mỗi lần chạy:

```bash
python3 scripts/tower_question_generator.py Mathematics 7
python3 scripts/tower_question_generator.py Physics 8
python3 scripts/tower_question_generator.py Chemistry 10 --seed demo-01
python3 scripts/tower_question_generator.py Biology 12 --seed demo-02
```

Các môn hợp lệ:

- `Mathematics`
- `Physics`
- `Chemistry`
- `Biology`

Grade hợp lệ: `1` đến `12`.

## 6. Database D1

Dự án sử dụng binding D1 có tên chính xác là:

```text
DB
```

Schema nằm tại:

```text
db/schema.ts
```

Các migration nằm trong thư mục:

```text
drizzle/
```

Triển khai trực tiếp lên tài khoản Cloudflare riêng, cần:

1. Đăng nhập Wrangler.
2. Tạo một D1 database.
3. Cấu hình binding `DB` bằng ID database vừa tạo.
4. Áp dụng toàn bộ migration trong thư mục `drizzle/`.
5. Build và deploy Worker bằng pipeline Cloudflare của bạn.

Lệnh tạo database:

```bash
npx wrangler login
npx wrangler d1 create axiomancy-db
```

Sau khi thêm database vào cấu hình Wrangler của tài khoản Cloudflare:

```bash
npx wrangler d1 migrations apply axiomancy-db --remote
```

## 7. Cấu trúc thư mục chính

app/                    Giao diện, gameplay, localization và API routes
app/api/                Authentication, player save, PvP và question APIs
db/                     Drizzle schema và kết nối D1
drizzle/                Lịch sử database migration
public/                 Logo, nhân vật và hình ảnh tĩnh
scripts/                Build, validation và Python question generator
tests/                  Kiểm thử tự động
worker/                 Cloudflare Worker entry point
build/                  Plugin đóng gói artifact cho Sites
.openai/hosting.json    Khai báo binding dùng khi chạy bằng ChatGPT Sites

