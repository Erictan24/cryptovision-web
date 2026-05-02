"use client";

import { Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] py-20 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center gap-3">
          <Shield size={28} className="text-[var(--color-accent)]" />
          <h1 className="text-3xl font-bold">Kebijakan Privasi</h1>
        </div>

        <div className="space-y-8 text-[var(--color-text-secondary)]">
          <section>
            <p className="text-sm leading-relaxed">
              CryptoVision (&quot;kami&quot;, &quot;layanan&quot;) menghormati privasi pengguna dan
              berkomitmen melindungi data pribadi sesuai{" "}
              <strong>UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)</strong>{" "}
              dan UU No. 11 Tahun 2008 tentang Informasi dan Transaksi Elektronik (UU ITE).
              Kebijakan ini menjelaskan data apa yang kami kumpulkan dan bagaimana kami menggunakannya.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">1. Data yang Kami Kumpulkan</h2>
            <p className="text-sm leading-relaxed mb-3">Saat Anda menggunakan CryptoVision, kami mengumpulkan:</p>
            <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside">
              <li>
                <strong>Data Telegram</strong> (via Telegram Login Widget): Telegram ID, username,
                nama depan, foto profil. Tidak ada akses ke chat history atau kontak Anda.
              </li>
              <li>
                <strong>Data Subscription</strong>: tier paket, tanggal aktivasi, masa berlaku,
                metode pembayaran (BCA, Dana, GoPay, USDT-BEP20).
              </li>
              <li>
                <strong>Data Trading Performance</strong> (read-only, tidak personal): hasil sinyal
                bot kami yang ditampilkan di dashboard untuk Anda monitor performa.
              </li>
              <li>
                <strong>Data Penggunaan Website</strong>: log akses standar (IP, user agent, halaman
                dikunjungi) untuk monitoring keamanan dan optimasi.
              </li>
              <li>
                <strong>Data API Exchange (Phase 2 — opsional)</strong>: API key Bitunix/exchange
                lain yang Anda hubungkan secara sukarela. Disimpan terenkripsi, hanya digunakan
                untuk eksekusi trade atas perintah Anda.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. Bagaimana Kami Menggunakan Data</h2>
            <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside">
              <li>Verifikasi identitas via Telegram Login</li>
              <li>Aktivasi dan validasi subscription</li>
              <li>Mengirim notifikasi sinyal trading via Telegram bot</li>
              <li>Menampilkan dashboard performa, statistik, riwayat trading</li>
              <li>Komunikasi penting (perubahan layanan, masalah teknis)</li>
              <li>Analytics agregat untuk peningkatan layanan (tidak per-pengguna)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. Pihak Ketiga yang Memproses Data Anda</h2>
            <p className="text-sm leading-relaxed mb-3">
              Beberapa data Anda diproses oleh penyedia layanan kami yang terpercaya:
            </p>
            <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside">
              <li>
                <strong>Vercel</strong> (hosting website) — Amerika Serikat. Tunduk pada GDPR &amp; SOC 2.
              </li>
              <li>
                <strong>Neon</strong> (database PostgreSQL) — Amerika Serikat. Data disimpan dengan
                encryption at rest dan TLS in transit.
              </li>
              <li>
                <strong>Telegram</strong> — login authentication dan notifikasi. Tunduk pada
                Telegram Privacy Policy.
              </li>
              <li>
                <strong>Resend</strong> (email) — saat fitur email aktif. Untuk pengiriman welcome
                email dan komunikasi penting.
              </li>
              <li>
                <strong>VPS Provider</strong> (Singapore) — hosting bot trading 24/7.
              </li>
            </ul>
            <p className="text-sm leading-relaxed mt-3">
              Kami <strong>TIDAK menjual</strong> data Anda ke pihak ketiga untuk tujuan iklan atau
              marketing. Sharing terjadi hanya jika diperlukan oleh layanan atau diwajibkan hukum.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Penyimpanan dan Retensi Data</h2>
            <p className="text-sm leading-relaxed">
              Data subscription dan riwayat trading disimpan selama akun Anda aktif dan hingga
              <strong> 12 bulan setelah subscription berakhir</strong> (untuk keperluan pajak,
              audit, dan dispute). Setelah itu, data dihapus atau dianonimkan kecuali ada kewajiban
              hukum untuk menyimpan lebih lama.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Hak Anda Sebagai Subjek Data (UU PDP)</h2>
            <p className="text-sm leading-relaxed mb-3">Anda berhak untuk:</p>
            <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside">
              <li>
                <strong>Akses</strong>: meminta salinan data pribadi Anda yang kami simpan
              </li>
              <li>
                <strong>Koreksi</strong>: meminta perbaikan data yang tidak akurat
              </li>
              <li>
                <strong>Penghapusan</strong>: meminta penghapusan data (right to be forgotten),
                kecuali ada kewajiban hukum untuk disimpan
              </li>
              <li>
                <strong>Portabilitas</strong>: meminta data Anda dalam format yang dapat dipindah
              </li>
              <li>
                <strong>Penolakan</strong>: menolak pemrosesan data untuk tujuan tertentu
              </li>
              <li>
                <strong>Pencabutan persetujuan</strong>: mencabut persetujuan kapan saja (dengan
                konsekuensi: layanan tidak dapat dilanjutkan)
              </li>
            </ul>
            <p className="text-sm leading-relaxed mt-3">
              Untuk eksekusi hak ini, hubungi kami via kontak di bawah. Kami akan merespons dalam{" "}
              <strong>3 × 24 jam</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Keamanan Data</h2>
            <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside">
              <li>Enkripsi TLS 1.3 untuk semua koneksi web</li>
              <li>Database encryption at rest (Neon Postgres)</li>
              <li>API key exchange (kalau Anda hubungkan) tersimpan terenkripsi (KMS)</li>
              <li>Akses ke data dibatasi pada operator dengan kebutuhan kerja</li>
              <li>Audit log untuk akses data sensitif</li>
            </ul>
            <p className="text-sm leading-relaxed mt-3">
              Walaupun kami berupaya maksimal, <strong>tidak ada sistem yang 100% aman</strong>.
              Anda bertanggung jawab menjaga kerahasiaan kredensial Telegram dan exchange Anda.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. Cookies dan Penyimpanan Lokal</h2>
            <p className="text-sm leading-relaxed">
              Kami menggunakan cookie httpOnly untuk session login (JWT). Tidak ada cookie tracking
              third-party (Google Analytics, Facebook Pixel, dll) saat ini. Kalau di masa depan
              kami menambahkan analytics, kami akan minta consent terlebih dahulu via banner.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">8. Anak di Bawah Umur</h2>
            <p className="text-sm leading-relaxed">
              Layanan ini ditujukan untuk pengguna <strong>berusia minimal 18 tahun</strong>.
              Trading cryptocurrency memerlukan pemahaman risiko finansial yang kompleks. Kami tidak
              dengan sengaja mengumpulkan data anak di bawah umur. Jika Anda yakin anak Anda
              memberikan data, hubungi kami untuk penghapusan.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">9. Perubahan Kebijakan</h2>
            <p className="text-sm leading-relaxed">
              Kami dapat memperbarui Kebijakan Privasi ini sewaktu-waktu. Perubahan material akan
              diberitahukan via Telegram dan/atau email minimal <strong>14 hari sebelumnya</strong>.
              Penggunaan layanan setelah perubahan berlaku dianggap sebagai persetujuan.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">10. Kontak Petugas Pelindung Data</h2>
            <p className="text-sm leading-relaxed">
              Pertanyaan, permintaan akses data, atau keluhan terkait privasi:{" "}
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
