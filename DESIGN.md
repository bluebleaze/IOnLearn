---
name: Ubur Ubur
description: Platform Produktivitas Akademik & Asisten Belajar Terhubung Google Classroom
colors:
  # Backgrounds
  background: "#0B0F17"
  surface: "#121927"
  card: "#161F30"
  border: "#252F42"

  # Primary Palette
  purple-primary: "#9294E8"
  purple-lavender: "#B0B1F2"

  # Semantic Secondary Accents
  accent-blue: "#8FAFCB"      # Calendar, synchronization, Google Classroom features
  accent-mint: "#91C9B5"      # Learning materials, study guides, completed state
  accent-cream: "#E8DFC8"     # Warm highlights, subtle alerts, focus states

  # Typography Palette
  text-primary: "#F1F0EC"     # Dominant primary text (Soft Ivory, non-glare)
  text-secondary: "#9AA6B8"   # Secondary descriptions, subtitle text
  text-muted: "#69758A"       # Micro-copy, timestamps, subtle captions

  # Functional States
  danger: "#E06D75"
  danger-subtle: "rgba(224, 109, 117, 0.15)"
  warning: "#E5C07B"
  warning-subtle: "rgba(229, 192, 123, 0.15)"
  success: "#91C9B5"
  success-subtle: "rgba(145, 201, 181, 0.15)"

typography:
  display:
    fontFamily: "'Lexend', 'Plus Jakarta Sans', system-ui, sans-serif"
    fontSize: "clamp(2rem, 4vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "'Lexend', 'Plus Jakarta Sans', system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  title:
    fontFamily: "'Lexend', 'Plus Jakarta Sans', system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "normal"
  body:
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "'Lexend', 'Plus Jakarta Sans', system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.01em"
  code:
    fontFamily: "'JetBrains Mono', monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"

rounded:
  sm: "8px"
  button: "10px"
  card: "14px"
  container: "18px"
  pill: "9999px"

spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"

components:
  button-primary:
    backgroundColor: "#F1F0EC"
    textColor: "#0B0F17"
    rounded: "10px"
    padding: "10px 18px"
    fontWeight: 600
  button-secondary:
    backgroundColor: "#121927"
    borderColor: "#252F42"
    textColor: "#D8DCE5"
    rounded: "10px"
    padding: "10px 18px"
  feature-card:
    backgroundColor: "#161F30"
    borderColor: "#252F42"
    rounded: "14px"
    padding: "24px 28px"
---

# Ubur Ubur Design System

Ubur Ubur adalah platform produktivitas akademik yang dirancang untuk siswa dan mahasiswa. Sistem desain ini menekankan ketenangan, kejelasan editorial, kehangatan manusiawi, dan estetika akademis modern tanpa jatuh ke dalam klise "AI SaaS slop".

## Filosofi Visual

1. **Soft Academic Sanctuary:** Antarmuka belajar harus menenangkan kognitif pengguna, bukan membanjiri mereka dengan neon, gradient rainbow, atau animasi mengambang yang hiperaktif.
2. **Human-Designed Craft:** Layout asimetris terukur, tipografi yang proporsional, dan ruang kosong (*generous whitespace*) yang terarah menggantikan pola kartu generator AI yang kaku.
3. **Subtle Organic Ubur Ubur Identity:** Sentuhan identitas ubur-ubur dihadirkan secara anggun melalui garis kontur fluida lembut dan aksen warna desaturasi laut dalam (`#0B0F17`, `#121927`, `#9294E8`), bukan maskot kartun yang kekanak-kanakan.
4. **Semantik Warna Berarti:**
   - **Ungu Ubur-Ubur (`#9294E8`):** Identitas utama, aksi primer, dan logo.
   - **Soft Lavender (`#B0B1F2`):** Fitur asisten AI dan dialog cerdas.
   - **Soft Blue (`#8FAFCB`):** Sinkronisasi Classroom, kalender, dan waktu tenggat.
   - **Soft Mint (`#91C9B5`):** Kurasi materi, checklist selesai, dan status sukses.
   - **Warm Cream (`#E8DFC8`):** Sorotan khusus, pill fokus, dan hover hangat.

## Anti-Pattern Banned (Pantangan Keras)

- **Dilarang keras:** Purple neon (#8B5CF6 neon) dan cyan neon (#06B6D4 neon).
- **Dilarang keras:** Background gradient blobs atau mesh gradient yang mengambang tanpa guna.
- **Dilarang keras:** Teks gradient pelangi pada judul utama; gunakan warna solid `#9294E8` untuk penekanan.
- **Dilarang keras:** Pure white `#FFFFFF` sebagai warna teks dominan; gunakan `#F1F0EC` (Soft Ivory).
- **Dilarang keras:** Sudut `rounded-3xl` berlebihan di semua komponen; gunakan standar `10px` untuk tombol dan `14–16px` untuk kartu.
