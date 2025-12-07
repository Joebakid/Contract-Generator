# 📝 Contract Generator (Frontend-Only)

A **frontend-only contract generator** built with **React + Vite + Tailwind CSS** that allows small businesses and professionals to generate legally-structured contracts and download them in **PDF, DOCX, or TXT** format.

This project is designed to be **lawyer-review friendly**, with clear structure, consistent formatting, headers, and signature sections in all generated documents.

---

## 🚀 Features

- ✅ Profession-specific contract templates  
- ✅ Dynamic form generation from templates  
- ✅ Clean contract preview  
- ✅ Download contracts as:
  - **PDF**
  - **DOCX (Microsoft Word)**
  - **TXT**
- ✅ Professional document layout:
  - Centered title header
  - Proper margins & spacing
  - Signature blocks for both parties
- ✅ Tailwind CSS UI
- ✅ No backend required
- ✅ Easily extensible for new professions

---

## 👩‍💼 Included Professions (Templates)

- Web Developer – Freelance Development Agreement  
- Photographer – Photography Service Agreement  
- Business Consultant – Consulting Services Agreement  

> More professions can be added by extending the `contractTemplates` array in `App.jsx`.

---

## 🧱 Tech Stack

- **React** (with Vite)  
- **Tailwind CSS**  
- **jsPDF** – PDF generation  
- **docx** – Word document generation  
- **file-saver** – Client-side file downloads  

---

## 📂 Project Structure

```txt
contractgenerator/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── README.md

 