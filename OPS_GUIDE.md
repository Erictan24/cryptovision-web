# Ops Guide — Setup External Services

Dokumen ini berisi step-by-step setup untuk fitur yang butuh akun/service eksternal.

---

## #5 Uptime Monitoring (UptimeRobot)

**Tujuan:** Dapat notif Telegram kalau bot di VPS mati >5 menit.

### Setup
1. Buka https://uptimerobot.com — register gratis (50 monitor free)
2. Add New Monitor:
   - **Type**: HTTP(s)
   - **URL**: pilih salah satu:
     - **Web (Vercel)**: `https://cryptovision-web.vercel.app/api/stats` (cek website hidup)
     - **Bot (VPS)**: kalau bot expose health endpoint, pakai itu. Kalau tidak, **buat health endpoint sederhana** di bot
   - **Friendly Name**: "CryptoVision Web" atau "CryptoVision Bot"
   - **Monitoring Interval**: 5 menit
3. Add Alert Contact:
   - **Type**: Telegram
   - Follow instruksi UptimeRobot — chat dengan @UptimeRobot bot di Telegram untuk dapat token
   - Subscribe contact ke monitor
4. Test: stop sementara service → tunggu 5 menit → harus dapat notif

### Bot health endpoint (kalau belum ada)
Bisa tambah endpoint sederhana di `main.py`:

```python
# Add at startup
from http.server import BaseHTTPRequestHandler, HTTPServer
import threading

class HealthHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b'{"status":"ok"}')
    def log_message(self, format, *args):
        pass  # silent

def start_health_server():
    server = HTTPServer(('0.0.0.0', 8080), HealthHandler)
    server.serve_forever()

threading.Thread(target=start_health_server, daemon=True).start()
```

Lalu UptimeRobot monitor `http://YOUR_VPS_IP:8080`.

---

## #6 Email Service (Resend)

**Tujuan:** Kirim welcome email otomatis saat subscription aktif.

### Setup
1. Buka https://resend.com — register gratis (3000 email/bulan free)
2. **Verify domain** atau pakai default `onboarding@resend.dev` untuk test:
   - Domain custom: tambah DNS records (SPF, DKIM) — butuh access ke domain provider
   - Default: `onboarding@resend.dev` — works langsung tapi bukan branded
3. **Get API Key**: Settings → API Keys → Create
4. **Set di Vercel env**:
   - Buka Vercel project → Settings → Environment Variables
   - Add: `RESEND_API_KEY` = `re_xxxxxxxxxxxx`
   - Add: `EMAIL_FROM` = `noreply@cryptovision.app` (atau `onboarding@resend.dev` untuk test)
5. **Schema migration** — tambah email field ke users table:
   ```sql
   ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;
   ```
6. **Capture email saat signup** — tambah form input email di flow login/checkout (perlu UI work)
7. **Hook welcome email** di `/api/subscription` POST — setelah `setSubscriptionDb`, panggil `sendEmail(welcomeEmailHtml(...))`

### Limitation saat ini
Telegram OAuth tidak provide email. Perlu extra step user input email manual. Atau make email opsional.

---

## #8 Multi-Exchange Support (Phase 2 — Roadmap)

**Tujuan:** Bot bisa eksekusi trade di Binance, MEXC, BingX, Bybit (saat ini hanya Bitunix).

### Scope
Refactor besar — perkiraan 1-2 minggu:

1. **Abstract `bitunix_trader.py` jadi `base_trader.py`** dengan interface:
   - `place_order(symbol, side, qty, sl, tp1, tp2, leverage, order_type)`
   - `get_open_position(symbol)`
   - `get_balance()`
   - `move_sl_to_bep(symbol, entry)`
   - `move_sl_trailing(symbol, new_sl)`
   - `set_leverage(symbol, lev)`
   - `cancel_order(order_id)`
   
2. **Implement per-exchange adapter**:
   - `bitunix_trader.py` — already exists
   - `binance_trader.py` — pakai `python-binance`
   - `mexc_trader.py` — pakai `pymexc` atau MEXC SDK
   - `bingx_trader.py` — pakai BingX REST API
   - `bybit_trader.py` — pakai `pybit`
   
3. **Per-user exchange selection** (butuh KMS):
   - User connect API key di dashboard → encrypted di DB
   - Bot per-user instance jalan dengan user's adapter
   - **Risiko legal**: kalau API key bocor → user lose money → user sue. Perlu legal disclaimer kuat.

4. **Recommended approach**:
   - Phase 2a (1 minggu): refactor ke base_trader interface, support Bitunix only (no behavior change)
   - Phase 2b (1 minggu): implement Binance adapter (most popular)
   - Phase 2c (TBD): implement MEXC, BingX, Bybit per demand

---

## #10 Backtest Viewer di Website (Roadmap)

**Tujuan:** Lihat backtest results di web (saat ini CLI only).

### Scope
Refactor sedang — perkiraan 3-5 hari:

1. **Backtest engine output JSON**:
   - Modify `backtest.py` (atau equivalent) untuk dump JSON dengan structure:
     ```json
     {
       "config": { "coins": [...], "tf": "1h", "days": 180, "params": {...} },
       "summary": { "total": 126, "wr": 0.65, "ev": 0.56, "net_pnl": 314 },
       "by_outcome": { "tp2": 45, "tp1": 38, "bep": 12, "sl": 31 },
       "trades": [
         { "symbol": "BTC", "direction": "LONG", "entry": 100000, "exit": 102000, "pnl_r": 1.5, "outcome": "TP2", "time": "..." }
       ],
       "equity_curve": [{ "date": "...", "balance": 1000 }, ...]
     }
     ```
2. **Upload to Neon DB**:
   - New table `backtests` (id, name, created_at, config_json, summary_json, trades_json, equity_curve_json)
   - CLI command: `python backtest.py --upload` → POST ke `/api/backtests`

3. **Web UI**:
   - `/backtests` page — list backtest runs
   - `/backtests/[id]` — detail: config, summary, equity curve chart, trades table
   - Use chart library (recharts atau similar) untuk equity curve

### Quick win: tampilkan latest backtest summary di Statistics page
Tanpa full UI, just embed: "Backtest terakhir: 126 trades, WR 65%, EV +0.56R" sebagai context.

---

## #9 Chart Pattern Preview di Signal Card (Roadmap)

**Tujuan:** Visual chart preview di signal card, bukan cuma angka.

### Scope
Bot sudah generate chart PNG via `chart_generator.py`. Perlu:

1. **Bot upload chart ke object storage** (R2/S3):
   - Setelah generate chart untuk signal, upload ke Cloudflare R2 (gratis 10GB)
   - Save URL ke field `signals.chart_url`
   - DB schema: `ALTER TABLE signals ADD COLUMN chart_url TEXT`
   - Bot push: tambah `chart_url` di payload `_push_signal_to_web`

2. **Web side**: render `<img src={s.chart_url} />` di signal card.

### Alternative simpler: render chart client-side
Pakai `lightweight-charts` library, fetch OHLCV data dari `/api/market` atau langsung Binance, render chart kecil di card. Lebih cepat ship, tapi data lookback terbatas.

---

## Summary Action Items

| Priority | Item | Action |
|---|---|---|
| ⚡ Quick | UptimeRobot setup | Register + add monitor (15 min) |
| ⚡ Quick | Resend env var | Register + set RESEND_API_KEY (15 min) |
| 🛠️ Medium | Email signup field | Tambah email input di OAuth flow (1-2 jam) |
| 🛠️ Medium | Bot health endpoint | Add HTTPServer thread di main.py (30 min) |
| 📅 Roadmap | Multi-exchange | Refactor 1-2 minggu, after PMF |
| 📅 Roadmap | Backtest viewer | Add JSON export + UI (3-5 hari) |
| 📅 Roadmap | Chart preview | R2 upload + DB column (1-2 hari) |
