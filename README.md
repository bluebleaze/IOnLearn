<p align="center">
  <img src="public/logos/IOnLearnKawaistyle.png" alt="IOnLearn - Switch ON Your Learning" width="700" />
</p>

<p align="center">
  <strong>Free and Open-Source Academic Productivity Suite & Socratic AI Study Companion Connected to Google Classroom</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/License-GPLv3-blue.svg?style=flat-square" alt="GPLv3 License" />
  <img src="https://img.shields.io/badge/Next.js-16+-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4+-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Firebase-Auth_%26_Firestore-FFCA28?style=flat-square&logo=firebase" alt="Firebase" />
  <img src="https://img.shields.io/badge/AI_Providers-Gemini_%7C_OpenAI_%7C_Local_LLM-8A2BE2?style=flat-square" alt="AI Providers" />
  <img src="https://img.shields.io/badge/Open_Source-GPLv3-34A853?style=flat-square" alt="Open Source" />
</p>

---

## Overview

IOnLearn ("Switch ON Your Learning") is a free, copyleft open-source academic productivity platform and conversational AI study tutor designed for students, self-learners, and educators. It unifies scattered coursework, class announcements, deadlines, and study materials into a single focused dashboard.

By integrating directly with Google Classroom through strictly read-only scopes, IOnLearn categorizes upcoming assignments by urgency, parses syllabus attachments, and pairs students with a Socratic AI study companion. Rather than generating direct answers that bypass critical thinking, the AI tutor scaffolds learning step-by-step to build conceptual mastery.

IOnLearn is completely open-source under the **GNU General Public License v3 (GPLv3)**. It is model-agnostic, supporting both cloud APIs (Google Gemini) and local or custom-routed LLMs (Ollama, LM Studio, 9router, omnirouter, vLLM).

---

## 🎯 Alignment with Competition Theme & SDGs (Infinitera 2.0)

> **Event**: INFINITERA 2.0 — Web Development Competition  
> **Host**: Himpunan Mahasiswa Teknik Informatika (HM TIF), Universitas Islam Sultan Agung (UNISSULA)  
> **Grand Theme**: *“Bridging Innovation and Sustainability to Create Meaningful Impact for Future Generations”*

IOnLearn was purposefully designed to embody this theme by bridging cutting-edge technological innovation (Socratic conversational AI, edge intelligence, model-agnostic architecture) with sustainable societal impact for current and future generations.

```
                  ┌────────────────────────────────────────────────────────┐
                  │                    INFINITERA 2.0                      │
                  │   Bridging Innovation & Sustainability for Impact      │
                  └──────────────────────────┬─────────────────────────────┘
                                             │
         ┌───────────────────┬───────────────┴───────────────┬───────────────────┐
         ▼                   ▼                               ▼                   ▼
    🌱 SDG 4            ⚙️ SDG 9                        🏙️ SDG 11           🌍 SDG 13
Quality Education   Industry, Innovation           Sustainable Cities    Climate Action
(Inklusif & Merata) & Infrastructure (Tangguh)    & Communities (Aman)  (Paperless & Green)
```

### 1. 🎓 SDG 4 — Quality Education (Pendidikan Berkualitas)
*Mandat Subtema: "Menyediakan pendidikan yang inklusif, merata, dan berkualitas."*
- **Democratizing 1-on-1 Academic Tutoring**: Private human tutoring is often prohibitively expensive. IOnLearn is 100% free and open-source (GPLv3), providing every student—regardless of socioeconomic background—with a 24/7 personal tutor.
- **Socratic Pedagogy (Anti-Cognitive Atrophy)**: Unlike generic LLMs that spoon-feed direct answers, IOnLearn guides students step-by-step using Socratic questioning, building genuine conceptual mastery and critical thinking skills.
- **Inclusive & Adaptive Learning**: Features auto-detecting bilingual support (Indonesian 🇮🇩 & English 🇬🇧), customizable learning styles (Visual, Step-by-Step, In-Depth), and full accessibility support (screen-reader friendly, responsive keyboard navigation, dark/light modes).

### 2. 💡 SDG 9 — Industry, Innovation, and Infrastructure (Industri, Inovasi, dan Infrastruktur)
*Mandat Subtema: "Membangun infrastruktur yang tangguh dan mendorong inovasi."*
- **Model-Agnostic & Decentralized Edge AI**: IOnLearn breaks proprietary vendor lock-in by supporting local, offline LLMs (Ollama, LM Studio, vLLM) on consumer laptops, allowing students in remote areas with unstable internet to still access AI tutoring without relying on cloud data centers.
- **Resilient Hybrid Architecture**: Uses local-first offline caching paired with Google Cloud Firestore synchronization, ensuring continuity of study sessions even during network disruptions.
- **Open-Source Innovation (GPLv3)**: Open code guarantees transparency, security auditing, and continuous community development without reliance on closed commercial infrastructure.

### 3. 🏙️ SDG 11 — Sustainable Cities and Communities (Kota dan Permukiman yang Berkelanjutan)
*Mandat Subtema: "Mewujudkan kota yang aman, nyaman, dan ramah lingkungan."*
- **Decentralized Remote Study Hub**: Reduces urban traffic congestion and daily commuting burdens by enabling students and study groups to organize, analyze, and complete academic assignments from home or local community centers.
- **Safe, Private, & Ethical Digital Community**: Enforces strictly read-only Google Classroom and Drive scopes. Student submissions and academic data are never monetized, sold, or used to train third-party foundation models.
- **Community Learning Infrastructure**: Lightweight Progressive Web App (PWA) architecture runs smoothly on affordable devices in public libraries, school labs, and community centers.

### 4. 🌿 SDG 13 — Climate Action (Penanganan Perubahan Iklim)
*Mandat Subtema: "Mengambil tindakan untuk mengatasi perubahan iklim."*
- **100% Paperless Academic Lifecycle**: Eliminates physical paper printing for homework assignments, syllabus packets, study sheets, and flashcards by digitizing ingestion and providing rich-text note archiving.
- **Green Computing & Low-Carbon AI**: Supports ultra-lightweight, quantized, energy-efficient models (such as `gemini-3.1-flash-lite`, `qwen2.5:7b`, and `llama3.2`) that consume significantly less electricity and compute power than massive server clusters.
- **Reduction of Transportation Carbon Footprint**: By bringing interactive tutoring directly to learners' screens, IOnLearn eliminates unnecessary physical travel to tutoring centers, directly cutting vehicle greenhouse gas emissions.

---

## Key Features

- **Google Classroom Integration**: One-click synchronization for enrolled courses, assignments (`courseWork`), instructions, due dates, classroom materials, and submission statuses (`turned in`, `assigned`, `late`).
- **Socratic AI Study Companion**:
  - **Step-by-Step Guided Reasoning**: Helps students dissect complex problems, understand core principles, and arrive at answers independently.
  - **Attachment & Document Ingestion**: Reads PDFs, slide decks, and documents attached to Classroom assignments so tutoring is grounded directly in official course materials.
  - **Adaptive Study Modes**: Automatically generates topic summaries, review flashcards, practice quizzes, and simplified conceptual breakdowns.
- **Task & Deadline Management**: Automated sorting into actionable categories: To-Do, Upcoming, Late, and Completed.
- **Study Notes Workspace**: Markdown-enabled notebook for archiving lecture summaries, AI conversations, and personal study insights grouped by course.
- **Modern Responsive Interface**: Clean, distraction-free UI with full Dark Mode and Light Mode support, installable as a Progressive Web App (PWA) across desktop, tablet, and mobile.
- **Strict Read-Only Privacy**: Only requests read-only permissions from Google Classroom and Google Drive. The application never modifies, creates, or deletes user files or submissions.

---

## AI Architecture: Cloud and Local Inference

IOnLearn decouples application logic from specific model providers. You can choose between managed cloud endpoints or completely private, offline execution via any OpenAI-compatible API gateway.

### 1. Default: Google Gemini API
Native integration using the official `@google/genai` SDK with support for `gemini-3.6-flash`, `gemini-3.5-flash`, `gemini-3.1-flash-lite`, and newer Gemini models.

### 2. Local AI and OpenAI-Compatible Routers
Connect IOnLearn to local inference servers or multi-model gateways by pointing to an OpenAI-compatible endpoint:
- **Ollama** (`http://localhost:11434/v1`): Run open-weight models (Llama 3, DeepSeek-R1, Qwen 2.5, Mistral, Gemma 2) locally on your own hardware without internet access.
- **LM Studio** (`http://localhost:1234/v1`): Run local GGUF models with a desktop interface.
- **AI Gateways & Routers**:
  - 9router / omnirouter
  - OpenRouter (`https://openrouter.ai/api/v1`)
  - vLLM, LocalAI, Jan, or Text Generation WebUI.

#### Environment Configuration for AI (`.env`):
```env
# Choose active provider: 'gemini' or 'openai'
AI_PROVIDER="openai"

# OpenAI-Compatible / Local Router Configuration
OPENAI_BASE_URL="http://localhost:11434/v1"      # Example: Local Ollama, or your 9router / omnirouter address
OPENAI_API_KEY="ollama"                         # Arbitrary string for local instances, or router API key
OPENAI_MODEL="qwen2.5:7b"                       # Model tag available in your local runner
```

---

## Tech Stack

- **Framework**: Next.js 16+ (App Router), React 19, TypeScript
- **Styling & UI**: Tailwind CSS, Lucide React, Radix UI, Sonner (Toasts)
- **Backend & APIs**: Next.js Server Route Handlers, `@google/genai`, standard Fetch API
- **Authentication & Database**: Firebase Authentication (Google OAuth 2.0) and Cloud Firestore
- **External APIs**: Google Classroom API (v1), Google Drive API (v3)

---

## Getting Started

### Prerequisites
- Node.js 18.18+ or 20+
- A Google Cloud project with Google Classroom API and Firebase enabled
- A Google AI Studio API key (for Gemini) or a running local LLM instance (Ollama, LM Studio)

### 1. Clone the Repository
```bash
git clone https://github.com/bluebleaze/IOnLearn.git
cd IOnLearn
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure the environment variables:
```env
# --- 1. AI CONFIGURATION ---
GEMINI_API_KEY="AIzaSy..."                      # API Key from Google AI Studio
NEXT_PUBLIC_GEMINI_MODEL="gemini-3.6-flash"     # Default / recommended model (or gemini-3.1-flash-lite)
AI_PROVIDER="gemini"                            # 'gemini' or 'openai'

# (Optional) If using Local AI / Ollama / 9router / omnirouter:
# AI_PROVIDER="openai"
# OPENAI_BASE_URL="http://localhost:11434/v1"
# OPENAI_API_KEY="ollama"
# OPENAI_MODEL="llama3.1:8b"

# --- 2. BRANDING ---
NEXT_PUBLIC_APP_NAME="IOnLearn"
NEXT_PUBLIC_APP_TAGLINE="Academic Productivity & AI Study Companion"

# --- 3. FIREBASE & GOOGLE AUTH ---
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-firebase-project-id"
NEXT_PUBLIC_FIREBASE_APP_ID="1:xxxx:web:xxxx"
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="xxxx"
NEXT_PUBLIC_FIREBASE_OAUTH_CLIENT_ID="xxxx.apps.googleusercontent.com"
```

### 4. Firebase and Google Cloud Console Setup

1. **Firebase Authentication**:
   - In Firebase Console, go to **Authentication** -> **Sign-in method**.
   - Enable the **Google** provider.
2. **Google Cloud Console**:
   - Under **APIs & Services** -> **Library**, enable **Google Classroom API** and **Google Drive API**.
   - Under **OAuth consent screen**, configure the following read-only scopes:
     - `.../auth/classroom.courses.readonly`
     - `.../auth/classroom.student-submissions.me.readonly`
     - `.../auth/classroom.courseworkmaterials.readonly`
     - `.../auth/drive.readonly`
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
3. **Cloud Firestore Security Rules**:
   Apply these rules to restrict database access to authenticated resource owners:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

### 5. Running the Application
```bash
# Development mode
npm run dev

# Production build and start
npm run build
npm run start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Data Privacy and Compliance

IOnLearn adheres to strict student data protection guidelines:
- **Read-Only Operation**: The application requests only read-only scopes for Google Classroom and Drive data. It cannot alter grades, delete files, or modify student submissions.
- **No Data Commercialization**: User data is never sold, shared, or brokered to advertising networks or third parties.
- **Limited Use Compliance**: Fully compliant with the [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy), including all Limited Use requirements.
- **No Model Training on User Data**: Classroom and Drive data ingested during tutoring sessions is never used to train or fine-tune public foundation models.

---

## Contributing

Contributions from the open-source community are welcome and **greatly appreciated**. To contribute:

1. Fork this repository.
2. Create a feature branch (`git checkout -b feature/new-capability`).
3. Commit your changes (`git commit -m 'feat: add custom router support'`).
4. Push your branch (`git push origin feature/new-capability`).
5. Open a Pull Request.

All contributions to this project must be released under the terms of the GNU General Public License v3.

---

## Contributors

Thank you to everyone who has contributed to the development and improvement of IOnLearn.

<p align="center">
  <a href="https://github.com/bluebleaze/IOnLearn/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=bluebleaze/IOnLearn" alt="Contributors" />
  </a>
</p>

### Top Contributors

- **[@inihelta](https://github.com/inihelta)** - Frontend Developer & Project Designer Lead
- **[@bluebleaze](https://github.com/bluebleaze)** - Backend Developer & DevOps Engineer
- **[@moonelliaven](https://github.com/moonelliaven)** - UI/UX Designer & Project Quality Assurance

---

## Open Source License: GNU GPLv3

IOnLearn is free software licensed under the **GNU General Public License v3.0 (GPLv3)**.

### What GPLv3 Means for You

The GNU General Public License is a strong copyleft license designed to guarantee that the software remains free and open for all users, protecting community rights against proprietary lock-in.

- **Freedom to Run**: You have the unrestricted freedom to run this program for any purpose—educational, personal, research, or commercial.
- **Freedom to Study and Inspect**: You have full access to the complete source code to inspect how it works, how your data is handled, and how AI prompts are constructed.
- **Freedom to Modify**: You can adapt, customize, and extend IOnLearn to fit your school, university, or personal workflow.
- **Freedom to Share and Redistribute**: You may distribute verbatim copies or modified versions of this software, provided that any distributed derivative work is also licensed under the **GPLv3** with its corresponding source code made publicly available.
- **Anti-Tivoization**: Hardware manufacturers or cloud hosts cannot lock this software to prevent users from installing modified versions.
- **Patent Grant**: Contributors provide an explicit grant of patent rights, protecting downstream developers and users from patent litigation.

```
Copyright (C) 2026 IOnLearn Contributors

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.
```

For the complete legal text, please refer to the [LICENSE](LICENSE) file.