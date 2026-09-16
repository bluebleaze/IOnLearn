import { ClassroomCourse, ClassroomCourseWork, ClassroomMaterial, TodoTask, isCourseWorkWithinDateRange, DEFAULT_DATE_RANGE_MONTHS, ClassroomSyncProgress } from '../types';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth, googleProvider as provider } from '@/lib/firebase';

const TOKEN_KEY = 'classroom_access_token';
const TOKEN_EXPIRY_KEY = 'classroom_token_expiry';
const USER_PROFILE_KEY = 'classroom_user_profile';

function safeGetItem(key: string): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
}

function safeSetItem(key: string, value: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value);
  }
}

function safeRemoveItem(key: string): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(key);
  }
}

export interface UserProfile {
  name: string;
  email: string;
  picture?: string;
}

export class ClassroomService {
  private static isAuthenticating = false;

  // Initialize GSI Token Client - Deprecated as we are using Firebase Auth now
  public static initGsiClient(clientId: string, onTokenReceived: (token: string) => void): void {
    // Keep this signature to avoid breaking page.tsx immediately, but we will use requestToken instead
    console.log('Firebase Auth initialized.');
  }

  // Request Access Token popup via Firebase
  public static async requestToken(): Promise<{ token: string; profile: UserProfile } | null> {
    if (this.isAuthenticating) {
      throw new Error('Proses autentikasi sedang berjalan. Silakan selesaikan popup atau tunggu beberapa saat.');
    }
    
    this.isAuthenticating = true;
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential && credential.accessToken) {
        const profile: UserProfile = {
          name: result.user.displayName || result.user.email || '',
          email: result.user.email || '',
          picture: result.user.photoURL || undefined,
        };
        safeSetItem(USER_PROFILE_KEY, JSON.stringify(profile));
        
        // Persistent session storage
        safeSetItem(TOKEN_KEY, credential.accessToken);
        safeSetItem(TOKEN_EXPIRY_KEY, (Date.now() + 30 * 24 * 3600 * 1000).toString());
        return { token: credential.accessToken, profile };
      }
    } catch (e: any) {
      console.error('Firebase Auth Error:', e);
      if (e.code === 'auth/popup-blocked') {
        throw new Error('Sistem login diblokir oleh browser (misalnya pemblokir iklan, mode penyamaran, atau lingkungan pratinjau). Silakan izinkan popup, matikan pemblokir iklan, atau buka aplikasi ini di tab baru. Anda juga dapat menggunakan Mode Simulasi.');
      } else if (e.code === 'auth/cancelled-popup-request' || e.code === 'auth/popup-closed-by-user') {
        throw new Error('Login dibatalkan oleh pengguna.');
      }
      throw e;
    } finally {
      this.isAuthenticating = false;
    }
    return null;
  }

  // Check if current stored token is valid
  public static getStoredToken(): string | null {
    const token = safeGetItem(TOKEN_KEY);
    if (!token) return null;
    return token;
  }

  public static getUserProfile(): UserProfile | null {
    const saved = safeGetItem(USER_PROFILE_KEY);
    return saved ? JSON.parse(saved) : null;
  }

  public static async fetchUserProfile(token: string): Promise<UserProfile | null> {
    return this.getUserProfile();
  }

  public static async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Signout error', e);
    }
    safeRemoveItem(TOKEN_KEY);
    safeRemoveItem(TOKEN_EXPIRY_KEY);
    safeRemoveItem(USER_PROFILE_KEY);
  }

  // Fetch all active courses for the student
  public static async fetchCourses(token: string): Promise<ClassroomCourse[]> {
    const response = await fetch('https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE&pageSize=100', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.logout();
        throw new Error('Sesi token Google Classroom telah kadaluwarsa (401 Unauthorized). Silakan masuk ulang dengan akun Google Anda.');
      }
      throw new Error(`Google Classroom API error (${response.status}): ${response.statusText}`);
    }

    const data = await response.json();
    return data.courses || [];
  }

  // Fetch coursework assignments for a course
  public static async fetchCourseWork(token: string, courseId: string): Promise<ClassroomCourseWork[]> {
    const response = await fetch(
      `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork?courseWorkStates=PUBLISHED&pageSize=100`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        this.logout();
        throw new Error('Sesi token Google Classroom telah kadaluwarsa (401 Unauthorized). Silakan masuk ulang dengan akun Google Anda.');
      }
      if (response.status === 404 || response.status === 403) {
        return [];
      }
      throw new Error(`Failed to fetch coursework for course ${courseId}`);
    }

    const data = await response.json();
    return data.courseWork || [];
  }

  // Fetch student submission status for a course
  public static async fetchSubmissions(token: string, courseId: string): Promise<Record<string, string>> {
    try {
      const response = await fetch(
        `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork/-/studentSubmissions?userId=me&pageSize=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        console.warn(`Could not fetch submissions for course ${courseId}: ${response.status} ${response.statusText}`);
        return {};
      }
      const data = await response.json();
      const map: Record<string, string> = {};
      if (Array.isArray(data.studentSubmissions)) {
        for (const sub of data.studentSubmissions) {
          if (sub.courseWorkId && sub.state) {
            map[sub.courseWorkId] = sub.state;
          }
        }
      }
      return map;
    } catch (err) {
      console.warn(`Error fetching submissions for course ${courseId}:`, err);
      return {};
    }
  }

  public static getLocalTimeZoneAbbr(): string {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz === 'Asia/Jakarta' || tz === 'Asia/Pontianak') return 'WIB';
      if (tz === 'Asia/Makassar' || tz === 'Asia/Ujung_Pandang' || tz === 'Asia/Denpasar') return 'WITA';
      if (tz === 'Asia/Jayapura') return 'WIT';

      const offsetMinutes = -new Date().getTimezoneOffset();
      if (offsetMinutes === 420) return 'WIB';   // UTC+7
      if (offsetMinutes === 480) return 'WITA';  // UTC+8
      if (offsetMinutes === 540) return 'WIT';   // UTC+9

      const formatter = new Intl.DateTimeFormat('id-ID', { timeZoneName: 'short' });
      const parts = formatter.formatToParts(new Date());
      const tzPart = parts.find(p => p.type === 'timeZoneName');
      return tzPart ? tzPart.value : '';
    } catch {
      return '';
    }
  }

  // Helper to format due date & time into readable Indonesian format following device/browser timezone
  public static formatDueDateTime(dueDate?: { year: number; month: number; day: number }, dueTime?: { hours?: number; minutes?: number }): { formattedStr: string; timestamp: number | null } {
    if (!dueDate || !dueDate.year || !dueDate.month || !dueDate.day) {
      return { formattedStr: 'Tidak ada tenggat waktu', timestamp: null };
    }

    const year = dueDate.year;
    const month = dueDate.month - 1;
    const day = dueDate.day;
    const hours = dueTime?.hours ?? 23;
    const minutes = dueTime?.minutes ?? 59;

    // Google Classroom API returns dueDate & dueTime in UTC
    const timestamp = Date.UTC(year, month, day, hours, minutes);
    const dateObj = new Date(timestamp);

    const now = new Date();
    const isToday = now.toDateString() === dateObj.toDateString();

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = tomorrow.toDateString() === dateObj.toDateString();

    const localHours = dateObj.getHours();
    const localMinutes = dateObj.getMinutes();
    const localDay = dateObj.getDate();
    const localMonth = dateObj.getMonth();
    const localYear = dateObj.getFullYear();

    const tzAbbr = this.getLocalTimeZoneAbbr();
    const tzSuffix = tzAbbr ? ` ${tzAbbr}` : '';
    const timeStr = `${String(localHours).padStart(2, '0')}:${String(localMinutes).padStart(2, '0')}${tzSuffix}`;

    if (isToday) {
      return { formattedStr: `Hari ini, ${timeStr}`, timestamp };
    }
    if (isTomorrow) {
      return { formattedStr: `Besok, ${timeStr}`, timestamp };
    }

    const monthsIndo = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
    ];

    return {
      formattedStr: `${localDay} ${monthsIndo[localMonth]} ${localYear}, ${timeStr}`,
      timestamp,
    };
  }

  // Synchronize Google Classroom with Local Todo List
  public static async syncAllClassrooms(
    token: string,
    existingTasks: TodoTask[],
    dateRangeMonths: number = DEFAULT_DATE_RANGE_MONTHS,
    userEmail?: string,
    onProgress?: (progress: ClassroomSyncProgress) => void
  ): Promise<{ updatedTasks: TodoTask[]; newCount: number }> {
    onProgress?.({
      current: 0,
      total: 0,
      percent: 10,
      message: "Mengambil daftar kelas Google Classroom...",
    });

    const courses = await this.fetchCourses(token);
    const validCourseIds = new Set(courses.map(c => c.id));
    const totalCourses = courses.length;

    // Filter existing tasks: only keep manual tasks or tasks belonging to this account's active courses
    const updatedTasks = existingTasks.filter(t => {
      // Exclude starter dummy seed tasks when syncing real account
      if (t.id.startsWith('seed-')) return false;

      // Keep manual tasks belonging to this user
      if (t.syncSource === 'manual') {
        return !t.userEmail || !userEmail || t.userEmail === userEmail;
      }

      // Classroom tasks must belong to current account's courses and email
      const courseBelongsToAccount = t.courseId ? validCourseIds.has(t.courseId) : true;
      const emailBelongsToAccount = !t.userEmail || !userEmail || t.userEmail === userEmail;
      return courseBelongsToAccount && emailBelongsToAccount;
    });

    let newCount = 0;
    let courseIndex = 0;

    for (const course of courses) {
      courseIndex++;
      const percent = Math.min(95, Math.round(15 + (courseIndex / Math.max(totalCourses, 1)) * 80));
      onProgress?.({
        current: courseIndex,
        total: totalCourses,
        percent,
        message: `Menyinkronkan kelas (${courseIndex}/${totalCourses}): ${course.name}`,
        courseName: course.name,
      });

      const [courseWorks, submissionsMap] = await Promise.all([
        this.fetchCourseWork(token, course.id),
        this.fetchSubmissions(token, course.id),
      ]);

      for (const cw of courseWorks) {
        const isTurnedIn = submissionsMap[cw.id] === 'TURNED_IN' || submissionsMap[cw.id] === 'RETURNED';

        // Abaikan tugas yang sudah diserahkan/selesai jika di luar batas rentang waktu yang ditentukan (default 2 bulan)
        // Tugas aktif yang belum diserahkan akan selalu disinkronkan agar tidak terlewat
        if (isTurnedIn && !isCourseWorkWithinDateRange(cw, dateRangeMonths)) {
          continue;
        }

        const existingIndex = updatedTasks.findIndex(
          t => t.courseWorkId === cw.id || (t.courseId === course.id && t.title.trim().toLowerCase() === cw.title.trim().toLowerCase())
        );
        const { formattedStr, timestamp } = this.formatDueDateTime(cw.dueDate, cw.dueTime);

        // Calculate priority based on due date proximity
        let priority: 'low' | 'medium' | 'high' = 'medium';
        if (timestamp) {
          const diffHours = (timestamp - Date.now()) / (1000 * 60 * 60);
          if (diffHours < 48 && diffHours > 0) priority = 'high';
          else if (diffHours < 0) priority = 'high';
          else if (diffHours > 168) priority = 'low';
        }

        if (existingIndex >= 0) {
          // Update details while preserving user's aiAnalysis and checking submitted status
          const existing = updatedTasks[existingIndex];
          const isCompleted = isTurnedIn ? true : existing.isCompleted;
          updatedTasks[existingIndex] = {
            ...existing,
            title: cw.title,
            description: cw.description || existing.description,
            dueDateStr: formattedStr,
            dueTimestamp: timestamp,
            points: cw.maxPoints,
            materials: cw.materials || existing.materials,
            classroomLink: cw.alternateLink || existing.classroomLink,
            isCompleted: isCompleted,
            completedAt: isTurnedIn && !existing.isCompleted ? new Date().toISOString() : existing.completedAt,
            createdAt: cw.creationTime || existing.createdAt || new Date().toISOString(),
            updatedAt: cw.updateTime || new Date().toISOString(),
            userEmail: userEmail || existing.userEmail,
          };
        } else {
          // New task found from Google Classroom!
          newCount++;
          const newTask: TodoTask = {
            id: `task_gc_${cw.id}`,
            courseWorkId: cw.id,
            courseId: course.id,
            courseName: course.name,
            title: cw.title,
            description: cw.description || '',
            dueDateStr: formattedStr,
            dueTimestamp: timestamp,
            points: cw.maxPoints,
            isCompleted: isTurnedIn,
            completedAt: isTurnedIn ? new Date().toISOString() : undefined,
            priority,
            syncSource: 'classroom',
            classroomLink: cw.alternateLink,
            materials: cw.materials,
            createdAt: cw.creationTime || new Date().toISOString(),
            updatedAt: cw.updateTime || new Date().toISOString(),
            userEmail,
          };
          updatedTasks.unshift(newTask);
        }
      }
    }

    onProgress?.({
      current: totalCourses,
      total: totalCourses,
      percent: 100,
      message: "Sinkronisasi selesai!",
    });

    return { updatedTasks, newCount };
  }

  // Realistic starter seed tasks for instant testing and showcase
  public static getInitialSeedTasks(): TodoTask[] {
    return [
      {
        id: 'seed-1',
        courseId: 'c-webdev',
        courseName: 'Pemrograman Web Lanjut (TI-3A)',
        title: 'Tugas 4: Implementasi Autentikasi JWT & Role-Based Access Control',
        description: 'Buatlah RESTful API sederhana dengan Node.js/Express yang mengimplementasikan sistem login, register, hashing password dengan bcrypt, dan middleware proteksi rute menggunakan JSON Web Token (JWT). Sertakan pengujian endpoint menggunakan Postman.',
        dueDateStr: 'Besok, 23:59 WIB',
        dueTimestamp: Date.now() + 28 * 3600 * 1000,
        points: 100,
        priority: 'high',
        isCompleted: false,
        syncSource: 'classroom',
        classroomLink: 'https://classroom.google.com',
        createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        aiAnalysis: {
          summary: 'Membangun API autentikasi aman dengan Node.js, Express, enkripsi kata sandi Bcrypt, dan verifikasi token JWT beserta pengujian rute.',
          difficulty: 'Sedang',
          estimatedMinutes: 90,
          keyConcepts: [
            'JSON Web Token (JWT) Header, Payload & Signature',
            'Password Hashing dengan Bcrypt Salt Rounds',
            'Express Middleware & Authorization Bearer Header',
            'Postman Environment & Auth Header Testing',
          ],
          checklist: [
            { id: 'c1', text: 'Inisialisasi project Node.js dan install express, jsonwebtoken, bcrypt, dotenv', done: true },
            { id: 'c2', text: 'Buat endpoint POST /api/register dengan validasi input dan hashing bcrypt', done: false },
            { id: 'c3', text: 'Buat endpoint POST /api/login yang memverifikasi kredensial dan men-generate JWT', done: false },
            { id: 'c4', text: 'Buat middleware verifyToken untuk memeriksa Bearer Token di header Authorization', done: false },
            { id: 'c5', text: 'Uji endpoint terproteksi di Postman dan buat dokumentasi ekspor collection', done: false },
          ],
          sources: [
            {
              title: 'JSON Web Token Official Introduction',
              domain: 'jwt.io',
              url: 'https://jwt.io/introduction',
              description: 'Dokumentasi standar resmi mengenai struktur JWT, algoritma hashing, dan best practice keamanan.',
              type: 'doc',
            },
            {
              title: 'Tutorial Node.js JWT Authentication',
              domain: 'digitalocean.com',
              url: 'https://www.digitalocean.com/community/tutorials/nodejs-jwt-expressjs',
              description: 'Panduan langkah demi langkah implementasi token refresh dan middleware auth di Express.',
              type: 'tutorial',
            },
            {
              title: 'Best Practices for Passwords Hashing & Storage (OWASP)',
              domain: 'owasp.org',
              url: 'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html',
              description: 'Standar keamanan industri untuk penyimpanan password menggunakan algoritma salt bcrypt/argon2.',
              type: 'academic',
            },
          ],
          youtubeVideos: [
            {
              title: 'JWT Authentication Tutorial with Node.js & Express (Web Dev Simplified)',
              channel: 'Web Dev Simplified',
              searchQuery: 'Web Dev Simplified JWT Authentication Node.js',
              searchUrl: 'https://www.youtube.com/results?search_query=Web+Dev+Simplified+JWT+Authentication+Node.js',
              reason: 'Penjelasan konsep token vs session yang sangat visual, to the point, dan mudah dipahami dalam 15 menit.',
              keyTakeaways: ['Perbedaan Access Token & Refresh Token', 'Cara mengekstrak header auth', 'Menangani error token expired'],
            },
            {
              title: 'Implementasi JWT dan Bcrypt di Express JS (Bahasa Indonesia)',
              channel: 'Programmer Zaman Now',
              searchQuery: 'Programmer Zaman Now JWT Express JS',
              searchUrl: 'https://www.youtube.com/results?search_query=Programmer+Zaman+Now+JWT+Express+JS',
              reason: 'Penjelasan dalam bahasa Indonesia yang sangat runtut dari struktur folder hingga praktek keamanan kode.',
              keyTakeaways: ['Struktur controller auth', 'Handling error respon HTTP 401 & 403', 'Tips konfigurasi .env'],
            },
          ],
          studyTips: [
            'Jangan pernah menyimpan data sensitif seperti password mentah di dalam payload JWT karena payload hanya di-encode base64, bukan dienkripsi rahasia.',
            'Simpan JWT Secret Key di environment variable (.env) dan jangan commit ke GitHub publik.',
            'Gunakan HTTP status code yang tepat: 401 Unauthorized bila token tidak ada/invalid, dan 403 Forbidden bila hak akses tidak sesuai.',
          ],
          recommendedStrategy: 'Kerjakan mulai dari controller register -> login -> pembuatan helper token -> middleware proteksi rute. Uji setiap tahap di Postman sebelum melangkah ke tahap berikutnya.',
          generatedAt: new Date().toISOString(),
        },
      },
      {
        id: 'seed-2',
        courseId: 'c-math',
        courseName: 'Matematika Diskrit & Logika',
        title: 'Latihan Mandiri: Graf Bipartit & Algoritma Dijkstra Lintasan Terpendek',
        description: 'Kerjakan soal studi kasus nomor 3 sampai 7 pada modul Bab 6. Tentukan lintasan terpendek dari simpul A ke simpul Z menggunakan tabel iterasi algoritma Dijkstra lengkap dengan langkah manual.',
        dueDateStr: '3 Hari Lagi, 17:00 WIB',
        dueTimestamp: Date.now() + 72 * 3600 * 1000,
        points: 85,
        priority: 'medium',
        isCompleted: false,
        syncSource: 'classroom',
        classroomLink: 'https://classroom.google.com',
        createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'seed-3',
        courseId: 'c-ai',
        courseName: 'Kecerdasan Buatan & Machine Learning',
        title: 'Proyek Kelompok: Analisis Sentimen Ulasan Film dengan Naive Bayes & TF-IDF',
        description: 'Lakukan pra-pemrosesan teks (case folding, tokenizing, stopword removal, stemming) pada dataset ulasan film, lalu latih model klasifikasi Naive Bayes. Tampilkan matriks kebingungan (Confusion Matrix), Accuracy, Precision, dan F1-Score.',
        dueDateStr: '6 Sep 2026, 23:59 WIB',
        dueTimestamp: Date.now() + 140 * 3600 * 1000,
        points: 100,
        priority: 'medium',
        isCompleted: false,
        syncSource: 'classroom',
        classroomLink: 'https://classroom.google.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'seed-4',
        courseId: 'c-db',
        courseName: 'Basis Data & Cloud Database',
        title: 'Tugas 2: Normalisasi Basis Data hingga 3NF (Third Normal Form)',
        description: 'Ubah form struk transaksi faktur penjualan retail yang belum ternormalisasi (0NF) menjadi tabel-tabel terpisah yang memenuhi kaidah 1NF, 2NF, dan 3NF. Lengkapi dengan Entity Relationship Diagram (ERD).',
        dueDateStr: 'Kemarin, 23:59 WIB',
        dueTimestamp: Date.now() - 18 * 3600 * 1000,
        points: 100,
        priority: 'high',
        isCompleted: true,
        completedAt: new Date().toISOString(),
        syncSource: 'classroom',
        classroomLink: 'https://classroom.google.com',
        createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }
}
