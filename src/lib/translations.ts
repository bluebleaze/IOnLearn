export type Language = "id" | "en";

export interface TranslationDictionary {
  common: {
    cancel: string;
    confirm: string;
    save: string;
    delete: string;
    edit: string;
    close: string;
    back: string;
    search: string;
    loading: string;
    success: string;
    error: string;
    warning: string;
    all: string;
    active: string;
    completed: string;
    urgent: string;
    high: string;
    medium: string;
    low: string;
    today: string;
    tomorrow: string;
    yesterday: string;
    general: string;
    untitled: string;
  };
  nav: {
    dashboard: string;
    allTasks: string;
    askAI: string;
    todoList: string;
    studyNotes: string;
    settings: string;
    taskDetails: string;
    mainMenu: string;
    studySettings: string;
    syncClassroom: string;
    syncing: string;
    refreshSync: string;
    lastSynced: string;
    logoutGoogle: string;
    logoutConfirmTitle: string;
    logoutConfirmDesc: string;
    sessionExpiredTitle: string;
    sessionExpiredDesc: string;
  };
  dashboard: {
    overviewEyebrow: string;
    dateLocale: string;
    welcome: string;
    defaultStudentName: string;
    allTasksBtn: string;
    askAIBtn: string;
    cardTasksTitle: string;
    cardTasksSafe: string;
    cardTodosTitle: string;
    cardNotesTitle: string;
    cardAITitle: string;
    cardAISubtitle: string;
    cardAIDesc: string;
    urgentSectionTitle: string;
    viewAllBtn: string;
    noUrgentTitle: string;
    noUrgentDesc: string;
    aiReadyBadge: string;
    todosSectionTitle: string;
    openTodoBtn: string;
    noTodosTitle: string;
    addTodoBtn: string;
    activityTitle: string;
    notesSectionTitle: string;
    openNotesBtn: string;
    noNotesDesc: string;
    quickAITitle: string;
    quickPrompts: string[];
    toastTaskCompleted: string;
    toastTodoCompleted: string;
  };
  tasks: {
    pageTitle: string;
    pageSubtitle: string;
    searchPlaceholder: string;
    allCourses: string;
    tabAll: string;
    tabActive: string;
    tabUrgent: string;
    tabLater: string;
    tabOverdue: string;
    tabCompleted: string;
    sortDueAsc: string;
    sortDueDesc: string;
    sortPriority: string;
    sortNewest: string;
    viewGrid: string;
    viewKanban: string;
    viewTable: string;
    colTask: string;
    colCourse: string;
    colDueDate: string;
    colPriority: string;
    colStatus: string;
    colActions: string;
    emptyTitle: string;
    emptyDesc: string;
    breakdownSubtasks: string;
    subtasksAdded: string;
    breakdownLoading: string;
  };
  taskCard: {
    aiReady: string;
    completed: string;
    markComplete: string;
    markIncomplete: string;
    viewDetails: string;
    overdue: string;
    daysLeft: string;
    hoursLeft: string;
    noDueDate: string;
  };
  taskDetail: {
    dialogTitle: string;
    tabOverview: string;
    tabAIAnalysis: string;
    tabDiscussion: string;
    sectionDescription: string;
    noDescription: string;
    sectionAttachments: string;
    noAttachments: string;
    sectionAIInsights: string;
    aiBreakdownTitle: string;
    actionMarkComplete: string;
    actionCompleted: string;
    actionAskAI: string;
    actionOpenClassroom: string;
    statusSafe: string;
    statusUrgent: string;
    statusOverdue: string;
  };
  todo: {
    pageTitle: string;
    pageSubtitle: string;
    addPlaceholder: string;
    addBtn: string;
    tabAll: string;
    tabActive: string;
    tabCompleted: string;
    tabHigh: string;
    priorityLabel: string;
    dueDateLabel: string;
    categoryLabel: string;
    emptyTitle: string;
    emptyDesc: string;
    searchEmptyTitle: string;
    searchEmptyDesc: string;
    resetSearch: string;
    celebrationTitle: string;
    celebrationDesc: string;
    viewAllBtn: string;
    newPlanBtn: string;
    importClassroomBtn: string;
    dailyProgress: string;
    progressCompleted: string;
    dialogAddTitle: string;
    dialogAddDesc: string;
    priorityHigh: string;
    priorityMedium: string;
    priorityLow: string;
    cancelBtn: string;
    saveBtn: string;
    subtasksLabel: string;
    toastAdded: string;
    toastDeleted: string;
    deleteConfirm: string;
    modalClassroomTitle: string;
    modalClassroomDesc: string;
    modalClassroomSelect: string;
    modalClassroomEmpty: string;
    modalClassroomBreakdownBtn: string;
    modalClassroomAnalyzing: string;
    dialogEditTitle: string;
    dialogEditDesc: string;
    editBtn: string;
    saveChangesBtn: string;
    addSubtaskLabel: string;
    subtaskPlaceholder: string;
    toastUpdated: string;
    subtasksOptional: string;
    addSubstepBtn: string;
    quickAddSubtaskPlaceholder: string;
  };
  notes: {
    pageTitle: string;
    pageSubtitle: string;
    searchPlaceholder: string;
    newNoteBtn: string;
    allSubjects: string;
    emptyTitle: string;
    emptyDesc: string;
    searchEmptyTitle: string;
    searchEmptyDesc: string;
    summarizeBtn: string;
    summarizing: string;
    resummarizeBtn: string;
    quizBtn: string;
    generatingQuiz: string;
    quizScore: string;
    quizTryAgain: string;
    quizCheckAnswer: string;
    toastCreated: string;
    toastSaved: string;
    toastDeleted: string;
    deleteConfirm: string;
    summaryTitle: string;
    quizTitle: string;
    askAITutor: string;
    editMarkdown: string;
    dialogTitleEdit: string;
    dialogTitleNew: string;
    dialogDesc: string;
    formTitleLabel: string;
    formTitlePlaceholder: string;
    formSubjectLabel: string;
    formSubjectPlaceholder: string;
    formTagsLabel: string;
    formTagsPlaceholder: string;
    tabVisual: string;
    tabMarkdown: string;
    tabPreview: string;
    cancelBtn: string;
    saveBtn: string;
    selectNoteToRead: string;
    selectNoteToReadDesc: string;
    codeCopied: string;
    copyCode: string;
  };
  chat: {
    headerTitle: string;
    modeSocratic: string;
    modeSocraticDesc: string;
    modeDirect: string;
    modeDirectDesc: string;
    modeQuizzer: string;
    modeQuizzerDesc: string;
    modeCopilot: string;
    modeCopilotDesc: string;
    inputPlaceholder: string;
    sendBtn: string;
    stopBtn: string;
    clearBtn: string;
    exportBtn: string;
    quickPrompt1: string;
    quickPrompt2: string;
    quickPrompt3: string;
    quickPrompt4: string;
    historyTitle: string;
    newChatBtn: string;
    searchPlaceholder: string;
    emptyHistory: string;
    disclaimer: string;
    deleteSessionTooltip: string;
    voiceInputTitle: string;
  };
  settings: {
    pageTitle: string;
    pageSubtitle: string;
    secThemeTitle: string;
    secThemeDesc: string;
    themeLight: string;
    themeLightDesc: string;
    themeDark: string;
    themeDarkDesc: string;
    themeKawaii: string;
    themeKawaiiDesc: string;
    secLangTitle: string;
    secLangDesc: string;
    langId: string;
    langIdDesc: string;
    langEn: string;
    langEnDesc: string;
    defaultBadge: string;
    secToastTitle: string;
    secToastDesc: string;
    toastTopRight: string;
    toastTopCenter: string;
    toastBottomRight: string;
    toastBottomCenter: string;
    secModalTitle: string;
    secModalDesc: string;
    modalDrawer: string;
    modalDrawerDesc: string;
    modalCenter: string;
    modalCenterDesc: string;
    secChatLayoutTitle: string;
    secChatLayoutDesc: string;
    chatLayoutSidebar: string;
    chatLayoutSplit: string;
    chatLayoutMinimal: string;
    secStudyModeTitle: string;
    secStudyModeDesc: string;
    secAiConfigTitle: string;
    secAiConfigDesc: string;
    aiProviderLabel: string;
    apiKeyLabel: string;
    apiKeyPlaceholder: string;
    testConnectionBtn: string;
    secRangeTitle: string;
    secRangeDesc: string;
    monthsLabel: string;
    secDangerTitle: string;
    secDangerDesc: string;
    resetTasksBtn: string;
    resetAllBtn: string;
    saveBtn: string;
    toastSaved: string;
  };
  account: {
    modalTitle: string;
    modalSubtitle: string;
    googleConnected: string;
    emailLabel: string;
    syncStatusLabel: string;
    lastSyncLabel: string;
    disconnectBtn: string;
    closeBtn: string;
  };
}

export const translations: Record<Language, TranslationDictionary> = {
  id: {
    common: {
      cancel: "Batal",
      confirm: "Konfirmasi",
      save: "Simpan",
      delete: "Hapus",
      edit: "Ubah",
      close: "Tutup",
      back: "Kembali",
      search: "Cari...",
      loading: "Memuat...",
      success: "Berhasil",
      error: "Terjadi kesalahan",
      warning: "Peringatan",
      all: "Semua",
      active: "Aktif",
      completed: "Selesai",
      urgent: "Mendesak",
      high: "Tinggi",
      medium: "Sedang",
      low: "Rendah",
      today: "Hari ini",
      tomorrow: "Besok",
      yesterday: "Kemarin",
      general: "Umum",
      untitled: "Tanpa Judul",
    },
    nav: {
      dashboard: "Dashboard",
      allTasks: "Semua Tugas",
      askAI: "Tanya AI",
      todoList: "To-Do List",
      studyNotes: "Catatan Materi",
      settings: "Pengaturan",
      taskDetails: "Detail Tugas",
      mainMenu: "Menu Utama",
      studySettings: "Pengaturan Belajar & AI",
      syncClassroom: "Sinkronkan Classroom",
      syncing: "Menyinkronkan...",
      refreshSync: "Refresh Sinkronisasi",
      lastSynced: "Terakhir disinkronkan",
      logoutGoogle: "Keluar dari Google",
      logoutConfirmTitle: "Koneksi Google Diputuskan",
      logoutConfirmDesc: "Akun Google Classroom telah keluar dan sesi ditutup.",
      sessionExpiredTitle: "Sesi Berakhir",
      sessionExpiredDesc: "Sesi Google Classroom Anda telah berakhir. Silakan masuk kembali.",
    },
    dashboard: {
      overviewEyebrow: "Ikhtisar Belajar",
      dateLocale: "id-ID",
      welcome: "Selamat datang kembali",
      defaultStudentName: "Pelajar",
      allTasksBtn: "Semua Tugas",
      askAIBtn: "Tanya AI",
      cardTasksTitle: "Tugas Classroom Aktif",
      cardTasksSafe: "Tenggat aman",
      cardTodosTitle: "To-Do Belum Selesai",
      cardNotesTitle: "Catatan Materi",
      cardAITitle: "AI Tutor",
      cardAISubtitle: "Bantuan Belajar Aktif",
      cardAIDesc: "Diskusi & Analisis Tugas",
      urgentSectionTitle: "Tugas Tenggat Terdekat",
      viewAllBtn: "Lihat Semua",
      noUrgentTitle: "Tidak ada tenggat mendesak",
      noUrgentDesc: "Semua tugas kuliah saat ini terkendali dengan baik",
      aiReadyBadge: "AI Siap",
      todosSectionTitle: "To-Do Harian",
      openTodoBtn: "Buka To-Do",
      noTodosTitle: "Belum ada rencana To-Do hari ini.",
      addTodoBtn: "Tambah To-Do",
      activityTitle: "Aktivitas Belajar Mingguan",
      notesSectionTitle: "Catatan Materi Terkini",
      openNotesBtn: "Buka Catatan",
      noNotesDesc: "Belum ada catatan materi tersimpan.",
      quickAITitle: "Tanya AI Cepat:",
      quickPrompts: [
        "Jelaskan konsep kunci dari tugas terdekat saya",
        "Bantu saya membuat rencana belajar untuk ujian minggu ini",
        "Bagaimana cara membagi waktu antara tugas kuliah dan proyek pribadi?",
      ],
      toastTaskCompleted: "Tugas Diselesaikan!",
      toastTodoCompleted: "To-Do Selesai!",
    },
    tasks: {
      pageTitle: "Semua Tugas",
      pageSubtitle: "Kelola dan pantau seluruh tugas akademik Google Classroom Anda dengan bantuan AI.",
      searchPlaceholder: "Cari tugas, mata kuliah, atau materi...",
      allCourses: "Semua Mata Kuliah",
      tabAll: "Semua",
      tabActive: "Aktif",
      tabUrgent: "Mendesak",
      tabLater: "Mendatang",
      tabOverdue: "Terlewat",
      tabCompleted: "Selesai",
      sortDueAsc: "Tenggat Terdekat",
      sortDueDesc: "Tenggat Terjauh",
      sortPriority: "Prioritas",
      sortNewest: "Terbaru Dibuat",
      viewGrid: "Grid",
      viewKanban: "Papan Kanban",
      viewTable: "Tabel",
      colTask: "Tugas",
      colCourse: "Mata Kuliah",
      colDueDate: "Tenggat",
      colPriority: "Prioritas",
      colStatus: "Status",
      colActions: "Aksi",
      emptyTitle: "Tidak ada tugas yang cocok",
      emptyDesc: "Coba ubah kata kunci pencarian atau filter status untuk menemukan tugas lainnya.",
      breakdownSubtasks: "Pecah jadi Subtask",
      subtasksAdded: "Subtask berhasil ditambahkan ke To-Do List!",
      breakdownLoading: "AI sedang memecah tugas menjadi langkah-langkah praktis...",
    },
    taskCard: {
      aiReady: "AI Siap",
      completed: "Selesai",
      markComplete: "Tandai Selesai",
      markIncomplete: "Batal Selesai",
      viewDetails: "Lihat Detail",
      overdue: "Terlewat",
      daysLeft: "hari lagi",
      hoursLeft: "jam lagi",
      noDueDate: "Tanpa batas waktu",
    },
    taskDetail: {
      dialogTitle: "Detail Tugas",
      tabOverview: "Ringkasan & Lampiran",
      tabAIAnalysis: "Analisis AI",
      tabDiscussion: "Tanya AI Tutor",
      sectionDescription: "Deskripsi Instruksi",
      noDescription: "Tidak ada instruksi khusus yang disertakan dosen.",
      sectionAttachments: "Materi & Dokumen Terlampir",
      noAttachments: "Tidak ada berkas atau dokumen yang terlampir.",
      sectionAIInsights: "Wawasan & Panduan AI",
      aiBreakdownTitle: "Langkah Pengerjaan yang Disarankan AI",
      actionMarkComplete: "Tandai Selesai",
      actionCompleted: "Tugas Selesai",
      actionAskAI: "Diskusi dengan AI",
      actionOpenClassroom: "Buka di Google Classroom",
      statusSafe: "Tenggat Aman",
      statusUrgent: "Tenggat Mendesak",
      statusOverdue: "Terlewat",
    },
    todo: {
      pageTitle: "To-Do List Harian",
      pageSubtitle: "Atur target belajar harian, tugas kecil, dan prioritas aktivitas Anda.",
      addPlaceholder: "Apa yang ingin kamu selesaikan hari ini?",
      addBtn: "Tambah To-Do",
      tabAll: "Semua",
      tabActive: "Belum Selesai",
      tabCompleted: "Selesai",
      tabHigh: "Prioritas Tinggi",
      priorityLabel: "Prioritas",
      dueDateLabel: "Target Tanggal",
      categoryLabel: "Kategori / Matkul",
      emptyTitle: "Belum Ada To-Do",
      emptyDesc: "Mulai buat to-do harianmu sendiri atau impor tugas dari Google Classroom untuk dipecah secara otomatis oleh AI.",
      searchEmptyTitle: "Tidak Ada To-Do Ditemukan",
      searchEmptyDesc: "Tidak ada rencana to-do atau sub-langkah yang cocok dengan kata kunci pencarian Anda.",
      resetSearch: "Reset Pencarian",
      celebrationTitle: "Luar biasa! Semua rencana to-do selesai",
      celebrationDesc: "Kamu telah menyelesaikan seluruh target harian. Waktunya istirahat atau buat rencana baru untuk besok!",
      viewAllBtn: "Lihat Semua To-Do",
      newPlanBtn: "Tambah Rencana Baru",
      importClassroomBtn: "Impor Classroom (AI)",
      dailyProgress: "Progress Harian",
      progressCompleted: "terselesaikan",
      dialogAddTitle: "Tambah Rencana / Target Baru",
      dialogAddDesc: "Catat target belajar atau tugas harianmu.",
      priorityHigh: "Tinggi (Penting & Mendesak)",
      priorityMedium: "Sedang (Standar)",
      priorityLow: "Rendah (Fleksibel)",
      cancelBtn: "Batal",
      saveBtn: "Simpan To-Do",
      subtasksLabel: "Sub-langkah",
      toastAdded: "To-Do Ditambahkan",
      toastDeleted: "To-Do Dihapus",
      deleteConfirm: "Apakah Anda yakin ingin menghapus to-do ini?",
      modalClassroomTitle: "Impor & Pecah Tugas Classroom",
      modalClassroomDesc: "Pilih tugas kuliah dan AI akan memecahnya menjadi langkah kerja harian.",
      modalClassroomSelect: "Pilih Tugas dari Classroom:",
      modalClassroomEmpty: "Tidak ada tugas pending di Classroom.",
      modalClassroomBreakdownBtn: "Pecah dengan AI",
      modalClassroomAnalyzing: "Sedang Menganalisis...",
      dialogEditTitle: "Edit To-Do & Sub-langkah",
      dialogEditDesc: "Perbarui judul, prioritas, tenggat, atau kelola rincian sub-langkah.",
      editBtn: "Edit To-Do",
      saveChangesBtn: "Simpan Perubahan",
      addSubtaskLabel: "Tambah Sub-langkah",
      subtaskPlaceholder: "Tulis sub-langkah (tekan Enter untuk menambah)...",
      toastUpdated: "To-Do Berhasil Diperbarui",
      subtasksOptional: "Sub-langkah",
      addSubstepBtn: "Tambah Sub-langkah",
      quickAddSubtaskPlaceholder: "Tambah sub-langkah baru...",
    },
    notes: {
      pageTitle: "Catatan Materi Kuliah",
      pageSubtitle: "Ruang belajar mandiri untuk menyimpan materi kuliah berbasis Markdown, membuat rangkuman, dan latihan kuis interaktif.",
      searchPlaceholder: "Cari materi kuliah, topik pembelajaran, atau isi catatan secara instan...",
      newNoteBtn: "Tulis Catatan Baru",
      allSubjects: "Semua",
      emptyTitle: "Belum ada catatan materi",
      emptyDesc: "Belum ada catatan. Buat catatan pertamamu!",
      searchEmptyTitle: "Tidak ada catatan ditemukan",
      searchEmptyDesc: "Tidak ada catatan yang cocok dengan filter pencarian.",
      summarizeBtn: "Rangkum Catatan",
      summarizing: "Sedang merangkum...",
      resummarizeBtn: "Rangkum Ulang",
      quizBtn: "Buat Kuis Latihan",
      generatingQuiz: "Menyiapkan kuis...",
      quizScore: "Skor:",
      quizTryAgain: "Coba Lagi",
      quizCheckAnswer: "Periksa Jawaban",
      toastCreated: "Catatan baru dibuat!",
      toastSaved: "Perubahan catatan tersimpan.",
      toastDeleted: "Catatan berhasil dihapus.",
      deleteConfirm: "Apakah Anda yakin ingin menghapus catatan ini?",
      summaryTitle: "Rangkuman Intisari AI",
      quizTitle: "Kuis Evaluasi Pemahaman",
      askAITutor: "Tanya AI Tutor",
      editMarkdown: "Edit Markdown",
      dialogTitleEdit: "Edit Catatan Materi",
      dialogTitleNew: "Tulis Catatan Materi Baru",
      dialogDesc: "Simpan materi belajar, rumus, dan konsep berbasis Markdown.",
      formTitleLabel: "Judul Catatan / Topik Materi",
      formTitlePlaceholder: "Contoh: Algoritma Pencarian Binary Search & Kompleksitas Waktu",
      formSubjectLabel: "Mata Pelajaran / Mata Kuliah",
      formSubjectPlaceholder: "Contoh: Algoritma & Pemrograman",
      formTagsLabel: "Label / Tag (Pisahkan koma)",
      formTagsPlaceholder: "Contoh: uas, sorting, search",
      tabVisual: "Visual",
      tabMarkdown: "Markdown",
      tabPreview: "Pratinjau",
      cancelBtn: "Batal",
      saveBtn: "Simpan Catatan",
      selectNoteToRead: "Pilih Catatan untuk Membaca",
      selectNoteToReadDesc: "Pilih salah satu catatan materi di kolom kiri untuk melihat isinya, menghasilkan rangkuman cerdas, atau mulai latihan kuis.",
      codeCopied: "Kode berhasil disalin",
      copyCode: "Salin Kode",
    },
    chat: {
      headerTitle: "AI Tutor & Asisten Belajar",
      modeSocratic: "Sokratik (Bimbingan Kritis)",
      modeSocraticDesc: "AI memancing Anda berpikir mandiri lewat pertanyaan terarah",
      modeDirect: "Langsung & Praktis",
      modeDirectDesc: "Jawaban to the point, ringkas, dan jelas",
      modeQuizzer: "Kuis Uji Pemahaman",
      modeQuizzerDesc: "Latihan soal interaktif untuk menguji pemahaman konsep",
      modeCopilot: "Pendamping Belajar",
      modeCopilotDesc: "Diskusi santai dan refleksi mendalam materi kuliah",
      inputPlaceholder: "Tanyakan apa saja tentang tugas, konsep materi, atau strategi belajar...",
      sendBtn: "Kirim Pesan",
      stopBtn: "Hentikan",
      clearBtn: "Bersihkan Riwayat",
      exportBtn: "Ekspor Catatan",
      quickPrompt1: "Jelaskan konsep ini dengan analogi sederhana yang mudah diingat",
      quickPrompt2: "Buatkan jadwal belajar 3 hari menjelang ujian",
      quickPrompt3: "Berikan saya 3 soal latihan beserta pembahasannya",
      quickPrompt4: "Bagaimana cara menyusun argumen yang kuat untuk tugas esai saya?",
      historyTitle: "Riwayat Percakapan",
      newChatBtn: "Percakapan Baru",
      searchPlaceholder: "Cari percakapan…",
      emptyHistory: "Tidak ada percakapan ditemukan.",
      disclaimer: "AI dapat melakukan kekeliruan. Selalu verifikasi jawaban sebelum dikumpulkan.",
      deleteSessionTooltip: "Hapus sesi ini",
      voiceInputTitle: "Input dengan Suara (Speech-to-Text)",
    },
    settings: {
      pageTitle: "Pengaturan Aplikasi",
      pageSubtitle: "Sesuaikan tema tampilan, bahasa, tata letak, dan konfigurasi AI pendukung belajar Anda.",
      secThemeTitle: "Tema Tampilan",
      secThemeDesc: "Pilih gaya visual yang paling nyaman untuk mata dan suasana belajar Anda.",
      themeLight: "Terang",
      themeLightDesc: "Bersih, minimalis, dan kontras tinggi untuk siang hari",
      themeDark: "Gelap",
      themeDarkDesc: "Modern, elegan, dan nyaman untuk penggunaan malam hari",
      themeKawaii: "Kawaii & Ceria",
      themeKawaiiDesc: "Warna pastel lembut dan penuh keceriaan yang memotivasi",
      secLangTitle: "Bahasa Antarmuka",
      secLangDesc: "Pilih bahasa tampilan untuk Dashboard dan seluruh navigasi sistem.",
      langId: "Bahasa Indonesia",
      langIdDesc: "Bahasa standar dengan istilah akademik lokal",
      langEn: "English",
      langEnDesc: "Standard English interface across all tools and pages",
      defaultBadge: "Bawaan",
      secToastTitle: "Posisi Notifikasi",
      secToastDesc: "Tentukan di mana pemberitahuan toast akan muncul di layar Anda.",
      toastTopRight: "Atas Kanan",
      toastTopCenter: "Atas Tengah",
      toastBottomRight: "Bawah Kanan",
      toastBottomCenter: "Bawah Tengah",
      secModalTitle: "Gaya Detail Tugas",
      secModalDesc: "Pilih bagaimana detail tugas Google Classroom akan ditampilkan.",
      modalDrawer: "Panel Samping (Drawer)",
      modalDrawerDesc: "Membuka panel samping agar konteks daftar tetap terlihat",
      modalCenter: "Pop-up Tengah (Modal)",
      modalCenterDesc: "Jendela terpusat untuk fokus membaca instruksi dan materi",
      secChatLayoutTitle: "Tata Letak AI Chat",
      secChatLayoutDesc: "Pilih format tata letak ruang diskusi AI Tutor favorit Anda.",
      chatLayoutSidebar: "Sidebar + Chat",
      chatLayoutSplit: "Dual Workspace (Split)",
      chatLayoutMinimal: "Minimalis Layar Penuh",
      secStudyModeTitle: "Gaya Interaksi AI Bawaan",
      secStudyModeDesc: "Pendekatan pedagogis yang digunakan AI Tutor saat memulai sesi baru.",
      secAiConfigTitle: "Kunci API & Provider AI",
      secAiConfigDesc: "Hubungkan model AI pilihan Anda untuk kecepatan dan kuota yang optimal.",
      aiProviderLabel: "Penyedia Model AI",
      apiKeyLabel: "API Key Anda",
      apiKeyPlaceholder: "Masukkan kunci API Gemini atau penyedia lainnya...",
      testConnectionBtn: "Uji Koneksi AI",
      secRangeTitle: "Rentang Sinkronisasi Classroom",
      secRangeDesc: "Berapa bulan ke belakang tugas Classroom akan disinkronkan ke aplikasi.",
      monthsLabel: "bulan terakhir",
      secDangerTitle: "Zona Pengelolaan Data",
      secDangerDesc: "Tindakan pembersihan cache dan reset penyimpanan lokal browser.",
      resetTasksBtn: "Hapus Cache Tugas Classroom",
      resetAllBtn: "Reset Semua Data & Pengaturan",
      saveBtn: "Simpan Pengaturan",
      toastSaved: "Pengaturan berhasil diperbarui!",
    },
    account: {
      modalTitle: "Akun & Profil Pengguna",
      modalSubtitle: "Informasi profil Google Classroom dan status integrasi cloud.",
      googleConnected: "Terhubung ke Google Classroom",
      emailLabel: "Email Akun",
      syncStatusLabel: "Status Sinkronisasi",
      lastSyncLabel: "Sinkronisasi Terakhir",
      disconnectBtn: "Putuskan Koneksi",
      closeBtn: "Tutup",
    },
  },
  en: {
    common: {
      cancel: "Cancel",
      confirm: "Confirm",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      close: "Close",
      back: "Back",
      search: "Search...",
      loading: "Loading...",
      success: "Success",
      error: "An error occurred",
      warning: "Warning",
      all: "All",
      active: "Active",
      completed: "Completed",
      urgent: "Urgent",
      high: "High",
      medium: "Medium",
      low: "Low",
      today: "Today",
      tomorrow: "Tomorrow",
      yesterday: "Yesterday",
      general: "General",
      untitled: "Untitled",
    },
    nav: {
      dashboard: "Dashboard",
      allTasks: "All Tasks",
      askAI: "Ask AI",
      todoList: "To-Do List",
      studyNotes: "Study Notes",
      settings: "Settings",
      taskDetails: "Task Details",
      mainMenu: "Main Menu",
      studySettings: "Study & AI Settings",
      syncClassroom: "Sync Classroom",
      syncing: "Syncing...",
      refreshSync: "Refresh Sync",
      lastSynced: "Last synced",
      logoutGoogle: "Log Out from Google",
      logoutConfirmTitle: "Google Disconnected",
      logoutConfirmDesc: "Your Google Classroom account has logged out and the session is closed.",
      sessionExpiredTitle: "Session Expired",
      sessionExpiredDesc: "Your Google Classroom session has expired. Please sign in again.",
    },
    dashboard: {
      overviewEyebrow: "Learning Overview",
      dateLocale: "en-US",
      welcome: "Welcome back",
      defaultStudentName: "Student",
      allTasksBtn: "All Tasks",
      askAIBtn: "Ask AI",
      cardTasksTitle: "Active Classroom Tasks",
      cardTasksSafe: "Deadlines safe",
      cardTodosTitle: "Pending To-Dos",
      cardNotesTitle: "Study Notes",
      cardAITitle: "AI Tutor",
      cardAISubtitle: "Active Learning Assistant",
      cardAIDesc: "Assignment Discussion & Analysis",
      urgentSectionTitle: "Upcoming Deadlines",
      viewAllBtn: "View All",
      noUrgentTitle: "No urgent deadlines",
      noUrgentDesc: "All your coursework is currently well on track",
      aiReadyBadge: "AI Ready",
      todosSectionTitle: "Daily To-Dos",
      openTodoBtn: "Open To-Do",
      noTodosTitle: "No to-do plans for today yet.",
      addTodoBtn: "Add To-Do",
      activityTitle: "Weekly Study Activity",
      notesSectionTitle: "Recent Study Notes",
      openNotesBtn: "Open Notes",
      noNotesDesc: "No study notes saved yet.",
      quickAITitle: "Quick AI Prompts:",
      quickPrompts: [
        "Explain the core concepts of my nearest upcoming assignment",
        "Help me create a structured study plan for this week's exams",
        "How can I balance time between coursework and personal projects?",
      ],
      toastTaskCompleted: "Task Completed!",
      toastTodoCompleted: "To-Do Completed!",
    },
    tasks: {
      pageTitle: "All Tasks",
      pageSubtitle: "Manage and monitor all your Google Classroom assignments with AI-assisted learning.",
      searchPlaceholder: "Search tasks, courses, or topics...",
      allCourses: "All Courses",
      tabAll: "All",
      tabActive: "Active",
      tabUrgent: "Urgent",
      tabLater: "Upcoming",
      tabOverdue: "Overdue",
      tabCompleted: "Completed",
      sortDueAsc: "Earliest Deadline",
      sortDueDesc: "Furthest Deadline",
      sortPriority: "Priority",
      sortNewest: "Recently Created",
      viewGrid: "Grid",
      viewKanban: "Kanban Board",
      viewTable: "Table",
      colTask: "Task",
      colCourse: "Course",
      colDueDate: "Due Date",
      colPriority: "Priority",
      colStatus: "Status",
      colActions: "Actions",
      emptyTitle: "No matching tasks found",
      emptyDesc: "Try adjusting your search query or status filter to see other tasks.",
      breakdownSubtasks: "Break into Subtasks",
      subtasksAdded: "Subtasks successfully added to your To-Do List!",
      breakdownLoading: "AI is breaking down this assignment into actionable steps...",
    },
    taskCard: {
      aiReady: "AI Ready",
      completed: "Completed",
      markComplete: "Mark Complete",
      markIncomplete: "Mark Incomplete",
      viewDetails: "View Details",
      overdue: "Overdue",
      daysLeft: "days left",
      hoursLeft: "hours left",
      noDueDate: "No deadline",
    },
    taskDetail: {
      dialogTitle: "Task Details",
      tabOverview: "Overview & Files",
      tabAIAnalysis: "AI Analysis",
      tabDiscussion: "Ask AI Tutor",
      sectionDescription: "Assignment Instructions",
      noDescription: "No specific instructions provided by the instructor.",
      sectionAttachments: "Attached Materials & Documents",
      noAttachments: "No files or documents attached.",
      sectionAIInsights: "AI Insights & Guidance",
      aiBreakdownTitle: "AI Suggested Action Steps",
      actionMarkComplete: "Mark as Completed",
      actionCompleted: "Task Completed",
      actionAskAI: "Discuss with AI",
      actionOpenClassroom: "Open in Google Classroom",
      statusSafe: "Deadline Safe",
      statusUrgent: "Urgent Deadline",
      statusOverdue: "Overdue",
    },
    todo: {
      pageTitle: "Daily To-Do List",
      pageSubtitle: "Organize daily study goals, micro-tasks, and activity priorities.",
      addPlaceholder: "What do you want to accomplish today?",
      addBtn: "Add To-Do",
      tabAll: "All",
      tabActive: "Active",
      tabCompleted: "Completed",
      tabHigh: "High Priority",
      priorityLabel: "Priority",
      dueDateLabel: "Due Date",
      categoryLabel: "Category / Course",
      emptyTitle: "No To-Dos Yet",
      emptyDesc: "Start creating your daily to-dos or import tasks from Google Classroom to automatically break them down with AI.",
      searchEmptyTitle: "No To-Dos Found",
      searchEmptyDesc: "No to-do plans or subtasks match your search query.",
      resetSearch: "Reset Search",
      celebrationTitle: "Awesome! All to-dos completed",
      celebrationDesc: "You have completed all daily targets. Time to rest or plan for tomorrow!",
      viewAllBtn: "View All To-Dos",
      newPlanBtn: "Add New Plan",
      importClassroomBtn: "Import Classroom (AI)",
      dailyProgress: "Daily Progress",
      progressCompleted: "completed",
      dialogAddTitle: "Add New Plan / Target",
      dialogAddDesc: "Record your study goals or daily tasks.",
      priorityHigh: "High (Urgent & Important)",
      priorityMedium: "Medium (Standard)",
      priorityLow: "Low (Flexible)",
      cancelBtn: "Cancel",
      saveBtn: "Save To-Do",
      subtasksLabel: "Subtasks",
      toastAdded: "To-Do Added",
      toastDeleted: "To-Do Removed",
      deleteConfirm: "Are you sure you want to delete this to-do?",
      modalClassroomTitle: "Import & Break Down Classroom Task",
      modalClassroomDesc: "Select a course task and AI will decompose it into manageable daily steps.",
      modalClassroomSelect: "Select Classroom Task:",
      modalClassroomEmpty: "No pending tasks in Classroom.",
      modalClassroomBreakdownBtn: "Break Down with AI",
      modalClassroomAnalyzing: "Analyzing...",
      dialogEditTitle: "Edit To-Do & Sub-steps",
      dialogEditDesc: "Update title, priority, due date, or manage sub-steps.",
      editBtn: "Edit To-Do",
      saveChangesBtn: "Save Changes",
      addSubtaskLabel: "Add Sub-step",
      subtaskPlaceholder: "Write a sub-step (press Enter to add)...",
      toastUpdated: "To-Do Updated Successfully",
      subtasksOptional: "Sub-steps",
      addSubstepBtn: "Add Sub-step",
      quickAddSubtaskPlaceholder: "Add a new sub-step...",
    },
    notes: {
      pageTitle: "Study Notes",
      pageSubtitle: "A dedicated study space to store Markdown notes, create AI summaries, and practice quizzes.",
      searchPlaceholder: "Instantly search notes, topics, or contents...",
      newNoteBtn: "Write New Note",
      allSubjects: "All",
      emptyTitle: "No study notes yet",
      emptyDesc: "No notes here yet. Create your first note!",
      searchEmptyTitle: "No notes found",
      searchEmptyDesc: "No notes match the current search filters.",
      summarizeBtn: "Summarize Note",
      summarizing: "Summarizing...",
      resummarizeBtn: "Re-summarize",
      quizBtn: "Create Practice Quiz",
      generatingQuiz: "Creating quiz...",
      quizScore: "Score:",
      quizTryAgain: "Try Again",
      quizCheckAnswer: "Check Answers",
      toastCreated: "New note created!",
      toastSaved: "Note changes saved.",
      toastDeleted: "Note successfully deleted.",
      deleteConfirm: "Are you sure you want to delete this note?",
      summaryTitle: "AI Executive Summary",
      quizTitle: "Comprehension Evaluation Quiz",
      askAITutor: "Ask AI Tutor",
      editMarkdown: "Edit Markdown",
      dialogTitleEdit: "Edit Study Note",
      dialogTitleNew: "Write New Study Note",
      dialogDesc: "Save study materials, formulas, and concepts in Markdown.",
      formTitleLabel: "Note Title / Material Topic",
      formTitlePlaceholder: "Example: Binary Search Algorithm & Time Complexity",
      formSubjectLabel: "Subject / Course",
      formSubjectPlaceholder: "Example: Algorithms & Programming",
      formTagsLabel: "Tags (Comma-separated)",
      formTagsPlaceholder: "Example: final-exam, sorting, search",
      tabVisual: "Visual",
      tabMarkdown: "Markdown",
      tabPreview: "Preview",
      cancelBtn: "Cancel",
      saveBtn: "Save Note",
      selectNoteToRead: "Select Note to Read",
      selectNoteToReadDesc: "Select a study note from the left sidebar to view contents, generate smart summaries, or start practice quizzes.",
      codeCopied: "Code copied to clipboard",
      copyCode: "Copy Code",
    },
    chat: {
      headerTitle: "AI Tutor & Study Assistant",
      modeSocratic: "Socratic (Critical Inquiry)",
      modeSocraticDesc: "AI guides your thinking with targeted questions",
      modeDirect: "Direct & Practical",
      modeDirectDesc: "Concise, straightforward, and clear explanations",
      modeQuizzer: "Concept Quizzer",
      modeQuizzerDesc: "Interactive practice questions to test your understanding",
      modeCopilot: "Study Companion",
      modeCopilotDesc: "Deep discussions and thoughtful reflections on course material",
      inputPlaceholder: "Ask anything about assignments, topics, or study strategies...",
      sendBtn: "Send Message",
      stopBtn: "Stop",
      clearBtn: "Clear History",
      exportBtn: "Export Note",
      quickPrompt1: "Explain this concept using a simple, relatable analogy",
      quickPrompt2: "Create a 3-day study schedule before my upcoming exam",
      quickPrompt3: "Give me 3 practice questions with detailed explanations",
      quickPrompt4: "How can I structure a strong argument for my essay assignment?",
      historyTitle: "Chat History",
      newChatBtn: "New Chat",
      searchPlaceholder: "Search conversations…",
      emptyHistory: "No conversations found.",
      disclaimer: "AI can make mistakes. Always verify answers before submitting.",
      deleteSessionTooltip: "Delete this session",
      voiceInputTitle: "Voice Input (Speech-to-Text)",
    },
    settings: {
      pageTitle: "App Settings",
      pageSubtitle: "Customize themes, language, layouts, and AI study configurations.",
      secThemeTitle: "Visual Theme",
      secThemeDesc: "Choose the color scheme that best fits your study environment.",
      themeLight: "Light",
      themeLightDesc: "Clean, minimal, and high contrast for daytime study",
      themeDark: "Dark",
      themeDarkDesc: "Sleek, modern, and easy on the eyes for night study",
      themeKawaii: "Kawaii & Vibrant",
      themeKawaiiDesc: "Soft pastel tones and uplifting colors to keep you motivated",
      secLangTitle: "Interface Language",
      secLangDesc: "Select the display language for the Dashboard and entire app.",
      langId: "Bahasa Indonesia",
      langIdDesc: "Standard Indonesian interface with localized terms",
      langEn: "English",
      langEnDesc: "Standard English interface across all tools and pages",
      defaultBadge: "Default",
      secToastTitle: "Notification Position",
      secToastDesc: "Choose where toast notifications appear on your screen.",
      toastTopRight: "Top Right",
      toastTopCenter: "Top Center",
      toastBottomRight: "Bottom Right",
      toastBottomCenter: "Bottom Center",
      secModalTitle: "Task Details Style",
      secModalDesc: "Choose how Google Classroom task details are displayed.",
      modalDrawer: "Side Drawer",
      modalDrawerDesc: "Opens a sliding side panel while keeping the list visible",
      modalCenter: "Center Modal",
      modalCenterDesc: "A focused centered dialog for reading instructions and files",
      secChatLayoutTitle: "AI Chat Layout",
      secChatLayoutDesc: "Select your preferred workspace layout for AI conversations.",
      chatLayoutSidebar: "Sidebar + Chat",
      chatLayoutSplit: "Dual Workspace (Split)",
      chatLayoutMinimal: "Minimal Fullscreen",
      secStudyModeTitle: "Default AI Interaction Style",
      secStudyModeDesc: "The pedagogical approach AI Tutor starts with for new discussions.",
      secAiConfigTitle: "AI Model & API Keys",
      secAiConfigDesc: "Connect your preferred AI provider for optimal speed and limits.",
      aiProviderLabel: "AI Model Provider",
      apiKeyLabel: "Your API Key",
      apiKeyPlaceholder: "Enter your Gemini or custom AI API key...",
      testConnectionBtn: "Test AI Connection",
      secRangeTitle: "Classroom Sync Range",
      secRangeDesc: "How many months back Classroom tasks will be synced to the app.",
      monthsLabel: "months back",
      secDangerTitle: "Data Management Zone",
      secDangerDesc: "Cache clearing actions and local browser storage reset.",
      resetTasksBtn: "Clear Classroom Tasks Cache",
      resetAllBtn: "Reset All Data & Settings",
      saveBtn: "Save Settings",
      toastSaved: "Settings successfully updated!",
    },
    account: {
      modalTitle: "User Account & Profile",
      modalSubtitle: "Google Classroom profile info and cloud synchronization status.",
      googleConnected: "Connected to Google Classroom",
      emailLabel: "Account Email",
      syncStatusLabel: "Sync Status",
      lastSyncLabel: "Last Synced",
      disconnectBtn: "Disconnect Account",
      closeBtn: "Close",
    },
  },
};
