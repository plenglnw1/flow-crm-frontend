# FlowCRM — Sales Frontend (SvelteKit)

แอปหน้าบ้านสำหรับ Sales (Pipeline, ลูกค้า, Action Stream, Dashboard) ทำงานคู่กับ **flow-crm-backend** ผ่าน session cookie ของ Laravel

---

## Quick Start — รันด้วย Docker Compose

1. **โคลน repo**
   ```bash
   git clone <url-ของ-repo-นี้>.git
   cd flow-crm-frontend
   ```
2. **สร้างไฟล์สภาพแวดล้อม**  
   สร้าง `.env` ในโฟลเดอร์โปรเจกต์ (SvelteKit อ่านตัวแปรที่ไม่มี prefix `PUBLIC_` ได้เฉพาะฝั่งเซิร์ฟเวอร์)
   ```env
   API_URL="http://host.docker.internal"
   N8N_URL="https://localhost:5678"
   ```

3. จากโฟลเดอร์โปรเจกต์:
   ```bash
   docker compose up -d
   ```
4. แอปจะ map **พอร์ต 3000 → 5173** ใน container — เปิด `http://localhost:3000`
   

5. **ล็อกอิน** — ใช้บัญชี Sales ที่สร้างจาก backend (เช่น `sales1@org1.com` / `password`) ผ่านหน้า `/login`

---
