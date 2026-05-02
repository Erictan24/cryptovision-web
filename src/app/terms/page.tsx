"use client";

import { FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] py-20 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center gap-3">
          <FileText size={28} className="text-[var(--color-accent)]" />
          <h1 className="text-3xl font-bold">Syarat &amp; Ketentuan Layanan</h1>
        </div>

        <div className="space-y-8 text-[var(--color-text-secondary)]">
          <section>
            <p className="text-sm leading-relaxed">
              Selamat datang di CryptoVision (&quot;layanan&quot;, &quot;kami&quot;). Dengan
              membuat akun, melakukan pembayaran, atau menggunakan layanan ini, Anda
              (&quot;pengguna&quot;) menyetujui syarat dan ketentuan di bawah. Jika Anda tidak
              setuju, mohon tidak menggunakan layanan kami.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">1. Definisi</h2>
            <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside">
              <li>
                <strong>Layanan</strong>: website CryptoVision, dashboard, bot Telegram (@CryptoVisionIDbot),
                bot trading otomatis, dan semua fitur terkait.
              </li>
              <li>
                <strong>Sinyal</strong>: hasil analisis teknikal otomatis yang ditampilkan di
                dashboard atau dikirim via Telegram bot.
              </li>
              <li>
                <strong>Subscription</strong>: paket berbayar dengan masa aktif tertentu (1 bulan,
                3 bulan, 1 tahun, atau Lifetime).
              </li>
              <li>
                <strong>Auto-Trade (Phase 2)</strong>: fitur opsional dimana bot mengeksekusi
                trade di akun exchange Anda atas perintah Anda.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. Akses dan Akun</h2>
            <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside">
              <li>Akun dibuat via Telegram Login Widget (OAuth Telegram)</li>
              <li>Anda bertanggung jawab menjaga kerahasiaan akses Telegram Anda</li>
              <li>Satu akun untuk satu pengguna — sharing akun tidak diperbolehkan</li>
              <li>Pengguna minimal berusia 18 tahun</li>
              <li>Kami berhak menonaktifkan akun yang melanggar syarat tanpa refund</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. Subscription dan Pembayaran</h2>
            <p className="text-sm leading-relaxed mb-3">
              Tier subscription, harga, dan masa aktif tertera di halaman{" "}
              <a href="/#pricing" className="text-[var(--color-accent)] hover:underline">/pricing</a>.
              Pembayaran via metode yang tersedia: BCA, Dana, GoPay (QRIS), atau USDT (BEP-20).
            </p>
            <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside">
              <li>Subscription <strong>tidak otomatis diperpanjang</strong>. Aktivasi manual setiap periode.</li>
              <li>Aktivasi setelah pembayaran terkonfirmasi oleh admin (max 24 jam, biasanya &lt;1 jam)</li>
              <li>Subscription <strong>tidak dapat dialihkan</strong> ke akun lain</li>
              <li>Pajak yang berlaku (kalau ada) ditanggung pengguna</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Kebijakan Refund</h2>
            <p className="text-sm leading-relaxed mb-3">
              Refund hanya berlaku dalam kondisi terbatas:
            </p>
            <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside">
              <li>
                <strong>7-Day Service Guarantee</strong>: jika layanan benar-benar tidak dapat
                diakses (down 100%) dalam 7 hari pertama subscription, refund 100% diberikan.
              </li>
              <li>
                <strong>Tidak ada refund untuk</strong>: loss trading, missed signal, drawdown,
                hasil bot di bawah ekspektasi, perubahan harga crypto, masalah eksekusi exchange,
                error pengguna (salah set leverage, salah pilih exchange, dll).
              </li>
              <li>
                Refund <strong>tidak berlaku</strong> setelah hari ke-7 atau setelah pengguna
                aktif menggunakan layanan (login dashboard, terima sinyal, dll).
              </li>
            </ul>
            <p className="text-sm leading-relaxed mt-3">
              Permintaan refund dikirim via{" "}
              <a href="mailto:ericisak453@gmail.com" className="text-[var(--color-accent)] hover:underline">email</a>
              {" "}dengan disertai bukti masalah.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Penggunaan yang Dilarang</h2>
            <p className="text-sm leading-relaxed mb-3">Pengguna setuju untuk TIDAK:</p>
            <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside">
              <li>Reverse-engineer, decompile, atau mencoba mengakses kode bot</li>
              <li>Menjual, mendistribusikan, atau membagikan sinyal ke pihak ketiga</li>
              <li>Otomatisasi scraping data dashboard di luar yang disediakan API</li>
              <li>Membuat akun ganda untuk eksploitasi free tier atau referral</li>
              <li>Menggunakan layanan untuk aktivitas ilegal (money laundering, fraud, dll)</li>
              <li>Menyerang infrastruktur layanan (DDoS, brute force, exploit)</li>
              <li>Klaim palsu sebagai pegawai atau partner CryptoVision</li>
            </ul>
            <p className="text-sm leading-relaxed mt-3">
              Pelanggaran dapat berakibat: <strong>termination akun tanpa refund, pelaporan ke
              otoritas hukum, dan klaim ganti rugi</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Hak Kekayaan Intelektual</h2>
            <p className="text-sm leading-relaxed">
              Seluruh kode bot, algoritma sinyal, design website, brand &quot;CryptoVision&quot;,
              logo, dan konten edukasi adalah <strong>milik kami</strong>. Subscription memberikan
              hak akses dan penggunaan personal — bukan transfer kepemilikan.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. Disclaimer Risiko</h2>
            <p className="text-sm leading-relaxed">
              Trading cryptocurrency dan futures memiliki risiko sangat tinggi. Sinyal kami adalah
              <strong> tool bantu, bukan saran finansial</strong>. Performa masa lalu tidak menjamin
              hasil masa depan. Detail lengkap di halaman{" "}
              <a href="/disclaimer" className="text-[var(--color-accent)] hover:underline">Risk Disclaimer</a>.
              Dengan menggunakan layanan, Anda menyatakan paham dan menerima risiko ini.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">8. Pembatasan Tanggung Jawab</h2>
            <p className="text-sm leading-relaxed mb-3">
              Sejauh diizinkan oleh hukum, CryptoVision dan tim <strong>tidak bertanggung jawab</strong> atas:
            </p>
            <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside">
              <li>Kerugian trading, baik langsung maupun tidak langsung</li>
              <li>Loss of profit, opportunity cost, kerusakan reputasi</li>
              <li>Downtime exchange, slippage eksekusi, latency network</li>
              <li>Data loss akibat force majeure (bencana, perang, regulasi mendadak)</li>
              <li>Kebocoran API key dari sisi pengguna (gunakan IP whitelist + permission terbatas)</li>
            </ul>
            <p className="text-sm leading-relaxed mt-3">
              Tanggung jawab maksimal kami terbatas pada{" "}
              <strong>jumlah biaya subscription yang Anda bayarkan dalam 3 bulan terakhir</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">9. Auto-Trade dan Eksekusi (Phase 2)</h2>
            <p className="text-sm leading-relaxed">
              Jika Anda mengaktifkan fitur Auto-Trade dengan menghubungkan API key exchange:
            </p>
            <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside mt-2">
              <li>Bot eksekusi trade <strong>atas perintah dan persetujuan Anda</strong></li>
              <li>Anda harus set permission API: <strong>FUTURES TRADING ON, WITHDRAWAL OFF</strong></li>
              <li>Wajib gunakan <strong>IP whitelist</strong> di exchange</li>
              <li>Risk per trade ditentukan oleh Anda (default $0.25 untuk validasi)</li>
              <li>Kami <strong>tidak menyimpan</strong> withdrawal keys atau seed phrase</li>
              <li>Loss dari auto-trade adalah tanggung jawab Anda</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">10. Penghentian Layanan (Termination)</h2>
            <p className="text-sm leading-relaxed">
              Pengguna dapat menghentikan akun kapan saja dengan menghubungi kami. Kami dapat
              menonaktifkan akun pengguna jika ada pelanggaran ToS, pembayaran tidak valid, atau
              alasan hukum. Termination tidak berhak menerima refund untuk masa subscription
              tersisa, kecuali dalam kondisi 7-Day Service Guarantee.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">11. Hukum yang Berlaku</h2>
            <p className="text-sm leading-relaxed">
              Syarat dan ketentuan ini tunduk pada hukum <strong>Negara Republik Indonesia</strong>,
              terutama UU ITE, UU PDP, dan peraturan Bappebti tentang aset kripto. Sengketa
              diselesaikan melalui musyawarah; jika gagal, melalui Pengadilan Negeri yang berwenang
              di Indonesia.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">12. Perubahan Syarat</h2>
            <p className="text-sm leading-relaxed">
              Kami dapat memperbarui ToS dari waktu ke waktu. Perubahan material diberitahukan via
              Telegram/email minimal <strong>14 hari sebelum berlaku</strong>. Penggunaan layanan
              setelah tanggal efektif dianggap persetujuan terhadap perubahan.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">13. Kontak</h2>
            <p className="text-sm leading-relaxed">
              Pertanyaan, klaim, atau permintaan terkait Syarat &amp; Ketentuan:{" "}
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
            Terakhir diperbarui: 3 Mei 2026
          </div>
        </div>
      </div>
    </div>
  );
}
