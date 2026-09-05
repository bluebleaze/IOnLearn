# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Pelajar dan mahasiswa Indonesia yang aktif menggunakan Google Classroom untuk perkuliahan/sekolah dan membutuhkan bantuan terstruktur dalam memahami materi kuliah, menyusun jawaban tugas, serta mengatur tenggat waktu belajar.

## Product Purpose
ClassroomAI (IOnLearn) adalah buku tugas digital dan asisten belajar cerdas yang menyinkronkan tugas Google Classroom secara otomatis serta menyediakan AI Academic Tutor kontekstual. Tujuannya adalah menghilangkan rasa kewalahan (overwhelm) akibat tumpukan tugas akademik dan membantu pelajar menguasai konsep inti materi secara mendalam.

## Positioning
Study-hub terpadu yang memadukan manajemen tugas Google Classroom otomatis dengan tutor AI kontekstual yang langsung mengenali materi, konsep, dan referensi setiap tugas tanpa perlu menulis ulang prompt secara manual.

## Operating Context
Digunakan oleh pelajar di laptop, tablet, atau desktop saat sesi belajar mandiri, mengerjakan tugas sekolah/kuliah, atau mereview materi menjelang ujian. Bekerja secara sinkron dengan Google Classroom API, Firebase Auth, dan Cloud Firestore lintas perangkat.

## Capabilities and Constraints
- Sinkronisasi tugas Google Classroom otomatis dengan filter rentang waktu dinamis.
- Analisis tugas berbasis AI: ringkasan, tingkat kesulitan, estimasi durasi, konsep kunci, checklist langkah pengerjaan, sumber akademik, dan kurasi video YouTube.
- Chatbot AI Tutor dengan manajemen sesi terpisah untuk percakapan umum maupun konsultasi spesifik per-tugas.
- Penyimpanan lokal responsif (`localStorage`) yang terisolasi per akun, didukung cloud backup lintas perangkat (`Firebase Firestore`).
- Pencatatan tugas manual mandiri serta simulasi tugas baru.
- Kendala teknis: Bergantung pada Google Classroom API OAuth scope dan ketersediaan API Google Gemini.

## Brand Commitments
- Nama Produk: ClassroomAI (IOnLearn).
- Tone of Voice: Suportif, edukatif, ramah, jelas, tidak menggurui, dan berbahasa Indonesia natural.
- Karakter Visual: Bersih, akademis modern, fokus, bebas distraksi, dengan palet warna indigo/violet profesional.

## Evidence on Hand
- Integrasi fungsional Google Classroom API v1.
- Integrasi Firebase Auth dan Firestore Cloud Database (`uburubur-85adc`).
- Endpoint AI terintegrasi Google Gemini (`/api/ai/analyze-task` dan `/api/ai/chat`).
- Dataset demo seed tugas realistis untuk mode simulasi.

## Product Principles
1. **Kejelasan Tanpa Beban Kognitif:** Tampilkan deadline, status, dan prioritas tugas dengan hirarki visual yang menenangkan dan mudah dipahami dalam hitungan detik.
2. **AI sebagai Fasilitator Pemahaman:** Bimbing pemikiran konseptual dan langkah penyelesaian tugas, bukan sekadar mesin pemberi contekan instan.
3. **Privasi & Kontinuitas Lintas Perangkat:** Seluruh riwayat analisis, catatan, dan progres belajar tersimpan aman dan terisolasi per akun di berbagai perangkat.
4. **Kecepatan & Responsivitas:** Pengalaman belajar tanpa jeda, transisi cepat, dan interaksi yang efisien agar waktu pengguna terfokus pada belajar.
