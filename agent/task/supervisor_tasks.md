# Task List — Tim Supervisor

> Proyek: SDP-V2 (E-commerce + MLM Platform)
> Stack: React 19 + Laravel 13 + MySQL (prod)
> Tanggal: 2026-04-15

---

## 1. Ringkasan Tanggung Jawab

Tim Supervisor memimpin koordinasi lintas tim (UI/UX, Frontend, Backend, QA, Performance), mengelola roadmap, memastikan kualitas delivery, mitigasi risiko, dan komunikasi dengan stakeholder. Supervisor adalah single point of accountability untuk progress proyek.

---

## 2. Task Breakdown

### A. Project Governance & Planning

| # | Task | Prioritas | Deskripsi |
|---|------|-----------|-----------|
| A1 | Review & update `GUIDELINE.md` | Critical | Pastikan GUIDELINE.md selalu sync dengan status proyek terkini. Update checklist setiap item selesai. |
| A2 | Buat roadmap visual (Gantt / board) | High | Visualisasi Phase 0-5 dalam Trello/Notion/Jira. Tanggal mulai, tenggat, dependency. |
| A3 | Sprint planning 2-minggu | High | Tiap sprint: pilih 3-5 item kritis dari roadmap, assign ke tim. |
| A4 | Daily standup (async/sync) | High | Template: Yesterday / Today / Blockers. Kirim di channel tim. |
| A5 | Retrospective tiap akhir sprint | Medium | What went well, what didn't, action items. |
| A6 | Definition of Done (DoD) | Critical | Tulis DoD untuk setiap kategori task (backend, frontend, bugfix). Contoh: "Code merged + test pass + QA sign-off + GUIDELINE.md updated". |

### B. Koordinasi Lintas Tim

| # | Task | Prioritas | Deskripsi |
|---|------|-----------|-----------|
| B1 | Weekly sync meeting | High | 1 jam/minggu: demo progress, blocker, dependency. |
| B2 | PR review workflow | Critical | Minimum 1 reviewer untuk PR kecil, 2 reviewer untuk PR critical (commission, auth, payment). |
| B3 | Handoff matrix UI/UX → Frontend | High | Pastikan design di-handoff dengan spesifikasi lengkap sebelum dev start. |
| B4 | Backend-Frontend contract | High | API contract (endpoint, request, response) disepakati sebelum parallel dev. Tools: Postman collection / OpenAPI. |
| B5 | QA gate sebelum merge main | Critical | Setiap PR ke main wajib smoke test pass dari QA. |
| B6 | Post-mortem untuk bug critical | High | Analisis root cause untuk bug yang lolos ke production. Dokumentasikan di `agent/docs/postmortem/`. |

### C. Risk Management

| # | Task | Prioritas | Deskripsi |
|---|------|-----------|-----------|
| C1 | Risk register dokumen | Critical | List risiko: technical, security, schedule, resource. Update bulanan. |
| C2 | Monitoring Firebase exposure | Critical | Sampai P0.1-P0.3 selesai, pantau tidak ada leak credential. Pertimbangkan rotate Firebase API key. |
| C3 | Backup & recovery plan | High | Database backup otomatis harian. Test restore procedure. |
| C4 | Incident response playbook | High | Prosedur saat: site down, database corrupt, commission bug, security breach. |
| C5 | Dependency security audit | High | Jalankan `npm audit` dan `composer audit` mingguan. Patch high/critical CVE. |
| C6 | Merge freeze policy | Medium | Saat dekat release, freeze merge non-critical. |

### D. Quality Assurance Oversight

| # | Task | Prioritas | Deskripsi |
|---|------|-----------|-----------|
| D1 | Sign-off release candidate | Critical | Verifikasi dari QA, Performance, Security sebelum approve deploy production. |
| D2 | Regression checklist enforcement | Critical | Setiap release major: full regression test wajib. |
| D3 | Bug triage meeting | High | Weekly: review bug backlog, prioritasi, assign. |
| D4 | Code quality metrics | Medium | Track: ESLint warnings count, PHP Pint compliance, test coverage %. |
| D5 | Technical debt tracking | Medium | Register T1-T6 di GUIDELINE.md. Alokasikan 20% kapasitas sprint untuk tech debt. |

### E. Stakeholder Communication

| # | Task | Prioritas | Deskripsi |
|---|------|-----------|-----------|
| E1 | Weekly status report | High | Progress, blocker, next week plan untuk stakeholder non-teknis. |
| E2 | Release notes | High | Dokumentasikan setiap release: fitur baru, bugfix, breaking change. |
| E3 | Roadmap komunikasi | Medium | Share roadmap dengan stakeholder, ekspektasi timeline. |
| E4 | User feedback channel | Medium | Tampung feedback dari user production, prioritaskan ke backlog. |

### F. Deployment & Release Management

| # | Task | Prioritas | Deskripsi |
|---|------|-----------|-----------|
| F1 | Deployment checklist | Critical | Step-by-step: pre-deploy check, deploy, smoke test, rollback plan. |
| F2 | Environment parity | High | Dev, staging, production harus serupa konfigurasi. Dokumentasikan perbedaan. |
| F3 | Versioning strategy | Medium | Semver untuk frontend & backend. Tag git setiap release. |
| F4 | Rollback procedure | Critical | Prosedur rollback frontend (Firebase Hosting) dan backend (server). Test di staging. |
| F5 | Scheduled maintenance window | Medium | Jadwal window maintenance (misal Minggu malam), notifikasi user. |

### G. Documentation Oversight

| # | Task | Prioritas | Deskripsi |
|---|------|-----------|-----------|
| G1 | Ensure CLAUDE.md & GUIDELINE.md terupdate | Critical | File ini adalah sumber kebenaran — harus diupdate tiap ada perubahan arsitektur. |
| G2 | API documentation | High | Postman collection atau OpenAPI spec untuk semua endpoint. |
| G3 | Onboarding guide developer baru | Medium | Dokumen setup dev environment < 30 menit. |
| G4 | Runbook operasi | High | Prosedur: restart server, clear cache, cek log, handle antrian stuck. |
| G5 | Architecture Decision Records (ADR) | Medium | Dokumentasikan keputusan arsitektur besar: kenapa Sanctum, kenapa closure table, dll. |

### H. Team Development

| # | Task | Prioritas | Deskripsi |
|---|------|-----------|-----------|
| H1 | Skill matrix tim | Medium | Pemetaan skill anggota tim, identifikasi gap. |
| H2 | Knowledge sharing session | Medium | Bulanan: tim sharing hal baru yang dipelajari (MLM logic, React pattern, Laravel trick). |
| H3 | Code review culture | High | Dorong review konstruktif, bukan gatekeeping. |
| H4 | 1-on-1 dengan anggota tim | Medium | Bulanan, dengar concern, career growth. |

### I. Phase-Specific Oversight (Mengacu ke Roadmap)

| # | Task | Prioritas | Deskripsi |
|---|------|-----------|-----------|
| I1 | Phase 0 completion | Critical | Pastikan P0.1 (Appearance + PaymentSettings migration), P0.2 (scheduled task), P0.3 (Firebase cleanup), P0.4 (MySQL) selesai sebelum pindah Phase 1. |
| I2 | Phase 1 Production Readiness gate | Critical | Tidak deploy production sebelum: MySQL stable, indexes added, stok validation, rate limit login, upload validation. |
| I3 | Phase 2 Performance gate | High | Lighthouse > 85 sebelum declare Phase 2 selesai. |
| I4 | Phase 3 Wallet & Notification | High | Validasi business logic wallet dengan stakeholder sebelum dev start (skema saldo, aturan withdraw). |
| I5 | Phase 4 Payment Gateway | Medium | Kontrak dengan Midtrans, test mode dulu sebelum live. |

---

## 3. Prioritas Task

### Critical
- A1, A6, B2, B5, C1, C2, D1, D2, F1, F4, G1, I1, I2

### High
- A2, A3, A4, B1, B3, B4, B6, C3, C4, C5, D3, E1, E2, F2, G2, G4, H3, I3, I4

### Medium
- A5, C6, D4, D5, E3, E4, F3, F5, G3, G5, H1, H2, H4, I5

---

## 4. Governance Framework

### Definition of Ready (DoR)
Sebelum task masuk sprint, harus memenuhi:
- [ ] User story jelas dengan acceptance criteria
- [ ] Estimasi effort dilakukan oleh tim
- [ ] Dependency teridentifikasi
- [ ] Design tersedia (jika perlu UI change)
- [ ] Reference file / baris kode tercantum

### Definition of Done (DoD)
Task dianggap selesai jika:
- [ ] Kode di-merge ke main setelah review approved
- [ ] Unit/feature test ditambahkan dan pass
- [ ] `npm run lint` dan `./vendor/bin/pint` pass
- [ ] `npm run build` dan `php artisan test` pass
- [ ] QA sign-off untuk task critical
- [ ] GUIDELINE.md / CLAUDE.md diupdate jika relevan
- [ ] Commit message mengikuti konvensi (`feat:`, `fix:`, `refactor:`, `perf:`, `chore:`)

### Release Gate Criteria
Tidak deploy production jika:
- Ada bug Critical terbuka
- Regression test belum full pass
- Backup database belum diverifikasi
- Rollback plan belum siap
- Dokumentasi release notes belum ada

---

## 5. Reporting Template

### Weekly Status Report
```
Periode: [minggu ke-X]

Completed:
- [task 1]
- [task 2]

In Progress:
- [task 1] — owner, blocker jika ada

Blocked:
- [task] — alasan

Next Week:
- [prioritas]

Risks:
- [risiko baru atau update]

Metrics:
- Sprint velocity
- Bug count (new vs resolved)
- Lighthouse score
- API uptime
```

---

## 6. Deliverables

1. Roadmap visual terupdate (Trello/Notion/Jira)
2. Risk register berjalan di `agent/docs/risk-register.md`
3. Weekly status report
4. Sprint retrospective notes
5. Post-mortem dokumen untuk incident (jika ada)
6. Release notes per version
7. Runbook operasi di `agent/docs/runbook.md`

---

## 7. Risiko & Catatan

- **Risiko Utama**: Migrasi Firebase ke Laravel belum 100% (P0.1-P0.3). Ini adalah blocker utama production readiness. Supervisor harus push prioritas ini.
- **Risiko**: Commission system sensitif — bug di sini berdampak finansial. Wajib PR review ketat dan test coverage tinggi.
- **Risiko**: Tim developing dengan Claude Code — pastikan setiap sesi efisien (mengacu ke GUIDELINE.md section 6 "Panduan Hemat Token").
- **Catatan**: Proyek di fase 50% — fondasi arsitektur solid, tapi belum production-ready. Target Phase 0-1 selesai dalam 2 minggu.
- **Catatan**: Selalu cross-reference task dengan file `GUIDELINE.md` — itu sumber kebenaran status proyek.
- **Koordinasi**: Komunikasi 3-channel: daily async standup, weekly sync, monthly stakeholder review.
