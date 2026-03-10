# Futbolshop — Xavfsiz foydalanish va Ma'lumotlarni saqlash qo'llanmasi

Ushbu qo'llanma tizimdan to'g'ri foydalanish hamda ma'lumotlar yo'qolib ketishining oldini olish bo'yicha muhim tavsiyalarni o'z ichiga oladi.

## 1. Ma'lumotlar bazasi (Database) xavfsizligi
Sizning ilovangiz **MongoDB Atlas** (bulutli baza) dan foydalanadi. Bu juda yaxshi, chunki ma'lumotlar kompyuteringizda emas, xavfsiz serverlarda saqlanadi.

*   **Avtomatik zaxira (Backup):** MongoDB Atlas avtomatik ravishda ma'lumotlarni zaxiralab boradi. Agar tasodifan nimadir o'chib ketsa, uni qayta tiklash imkoniyati bor.
*   **Tavsiya:** Har oyda bir marta MongoDB Atlas paneliga kirib, ma'lumotlarni `.json` yoki `.csv` formatida eksport qilib, shaxsiy diskingizga saqlab qo'yishingiz mumkin.

## 2. Rasmlar va Fayllar (Uploads)
**DIQQAT!** Mahsulot rasmlari ma'lumotlar bazasida emas, balki backend papkasidagi `uploads/` papkasida saqlanadi.

*   **Xavf:** Agar siz loyiha papkasini (`futbolshop`) o'chirib yuborsangiz yoki kompyuteringizga shikast yetsa, rasmlar yo'qolishi mumkin.
*   **Yechim:** Har hafta `backend/uploads/` papkasining nusxasini (copy) olib, boshqa xavfsiz joyga (masalan, Google Drive yoki fleshkaga) saqlab qo'ying.

## 3. Maxfiy ma'lumotlar (.env fayli)
`backend/.env` faylida bazaga ulanish kodi va maxfiy kalitlar saqlanadi.

*   **Xavf:** Agar bu faylni birovga bersangiz yoki internetga (masalan, GitHub ochiq repozitoriysi) yuklasangiz, begona shaxslar bazangizga kirib olishi mumkin.
*   **Yechim:** `.env` faylini hech qachon begonalarga ko'rsatmang va uni `.gitignore` ro'yxatida saqlang (hozirda shunday qilingan).

## 4. Internet va Elektr quvvati
Ilova bulutli baza bilan ishlagani uchun:
*   **Internet:** Bazaga ma'lumot yozish uchun barqaror internet aloqasi kerak.
*   **PWA Imkoniyati:** Ilova PWA sifatida o'rnatilgan bo'lsa, oflayn rejimda ham ochilishi mumkin, lekin kiritilgan yangi ma'lumotlar internet ulangandagina serverga yetib boradi.

## 5. Parollar va Foydalanuvchilar
*   **Superadmin:** Faqat bitda asosiy Superadmin akkaunti bo'lishi tavsiya etiladi.
*   **Admin/User:** Sotuvchilar uchun alohida cheklangan huquqli akkauntlar ochib bering. Bu orqali kim qachon va nima kiritganini kuzatish oson bo'ladi.

## Xulosa — Eng muhim 3 ta qoida:
1.  **Backend/Uploads** papkasini tez-tez arxivlab (rar/zip qilib) boshqa joyga saqlang.
2.  **MongoDB Atlas** parollarini va `.env` faylini hech kimga bermang.
3.  Operatsion tizimni (Windows) yangilab turing va ishonchli antivirusdan foydalaning.

Agar biron texnik yordam kerak bo'lsa, doim murojaat qilishingiz mumkin!
