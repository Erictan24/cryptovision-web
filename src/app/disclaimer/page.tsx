"use client";

import { AlertTriangle } from "lucide-react";

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] py-20 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center gap-3">
          <AlertTriangle size={28} className="text-[var(--color-warning,#f59e0b)]" />
          <h1 className="text-3xl font-bold">Risk Disclaimer & Terms of Service</h1>
        </div>

        <div className="space-y-8 text-[var(--color-text-secondary)]">
          <section className="rounded-2xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-6">
            <h2 className="text-lg font-bold text-[var(--color-danger)] mb-2">PERINGATAN PENTING</h2>
            <p className="text-sm leading-relaxed">
              Trading cryptocurrency dan futures memiliki <strong>risiko sangat tinggi</strong>.
              Anda dapat kehilangan SELURUH modal yang Anda tradingkan. Hanya gunakan dana yang siap Anda hilangkan.
              CryptoVision adalah TOOL AUTOMASI, bukan jaminan profit. Hasil masa lalu (backtest, live)
              <strong> TIDAK MENJAMIN hasil masa depan</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">1. Bukan Saran Finansial</h2>
            <p className="text-sm leading-relaxed">
              Sinyal dan signal yang dihasilkan CryptoVision adalah hasil analisis teknikal otomatis berbasis
              indikator dan algoritma. Ini BUKAN saran finansial, BUKAN saran investasi, dan BUKAN rekomendasi
              dari penasihat profesional. Setiap keputusan trading sepenuhnya tanggung jawab Anda sendiri.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. Risiko Trading Cryptocurrency</h2>
            <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside">
              <li>Volatilitas crypto sangat tinggi — harga bisa turun 50% dalam hitungan jam</li>
              <li>Trading dengan leverage memperbesar profit DAN loss berkali-kali lipat</li>
              <li>Liquidasi bisa terjadi dalam detik kalau market bergerak ekstrem</li>
              <li>Risiko teknis: API exchange down, koneksi internet putus, bot stuck</li>
              <li>Risiko regulasi: pemerintah dapat melarang trading crypto kapan saja</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. Win Rate & Performance</h2>
            <p className="text-sm leading-relaxed">
              Klaim &quot;WR 60%+&quot; berdasarkan backtest historis. Performa LIVE bisa lebih rendah karena:
              slippage, latency eksekusi, kondisi market berbeda dari periode backtest, dan faktor lain.
              Drawdown dan losing streak adalah BAGIAN NORMAL dari trading — siapkan mental dan kapital.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Tanggung Jawab Pengguna</h2>
            <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside">
              <li>Pahami cara kerja bot sebelum memberi izin auto-trade</li>
              <li>Mulai dengan modal kecil saat fase validasi</li>
              <li>Jangan invest lebih dari yang siap Anda hilangkan (rule of thumb: max 5-10% dari net worth)</li>
              <li>Set risk per trade yang sesuai (CryptoVision default $0.25/trade untuk validasi)</li>
              <li>Monitor bot secara berkala — automasi bukan berarti tanpa pengawasan</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Tidak Ada Refund untuk Loss Trading</h2>
            <p className="text-sm leading-relaxed">
              Subscription CryptoVision adalah biaya akses tool. Tidak ada refund atas:
              loss trading, missed signal, downtime exchange, atau performa bot di bawah ekspektasi.
              Refund subscription hanya berlaku jika layanan tidak dapat diakses sama sekali dalam 7 hari pertama.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Kepatuhan Hukum</h2>
            <p className="text-sm leading-relaxed">
              Pengguna bertanggung jawab atas kepatuhan terhadap hukum di yurisdiksi masing-masing.
              Crypto trading di Indonesia diatur oleh Bappebti. Pastikan Anda memahami implikasi pajak dan regulasi
              di lokasi Anda. CryptoVision tidak bertanggung jawab atas pelanggaran hukum lokal pengguna.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. Limitasi Tanggung Jawab</h2>
            <p className="text-sm leading-relaxed">
              CryptoVision dan tim TIDAK bertanggung jawab atas kerugian apapun yang timbul dari penggunaan
              produk ini, termasuk namun tidak terbatas pada: loss trading, kerusakan akun exchange, kebocoran
              API key (gunakan IP whitelist + permission terbatas), kerugian opportunity cost.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">8. Kontak</h2>
            <p className="text-sm leading-relaxed">
              Pertanyaan tentang ToS atau disclaimer:{" "}
              <a href="https://t.me/Ericckk_24" className="text-[var(--color-accent)] hover:underline">
                @Ericckk_24
              </a>{" "}
              di Telegram, atau{" "}
              <a href="mailto:ericisak453@gmail.com" className="text-[var(--color-accent)] hover:underline">
                ericisak453@gmail.com
              </a>.
            </p>
          </section>

          <div className="text-xs text-[var(--color-text-muted)] pt-6 border-t border-[var(--color-border)]">
            Terakhir diupdate: 27 April 2026
          </div>
        </div>
      </div>
    </div>
  );
}
