# Briefly.io 📝

> An AI-powered document analysis platform that extracts insights and synthesizes key information from uploaded documents instantly.

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v5-black?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-AI-blue?style=flat-square&logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)

---

## 🚀 Live Demo

Check out the live application hosted on Vercel:

👉 **[Open Briefly.io App](https://briefly-app-psi.vercel.app)**

---

## ✨ Features

- **Document Analysis** — Upload PDFs, images (PNG, JPEG), or text files to generate instant AI insights.
- **Powered by Gemini AI** — Leverages Google's Gemini's Flash-3.5 model for precise document summarization and extraction.
- **User Authentication** — Secure user signup and login flow.
- **History Tracking** — Automatically logs past analysis sessions per user account into a PostgreSQL database.
- **Responsive UI** — Clean, modern dark-themed interface built for fast user interaction.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) |
| **Backend** | Node.js, Express.js (v5) |
| **Database** | PostgreSQL |
| **AI Integration** | Google Gemini API |
| **Deployment** | Vercel (Serverless Functions) |

---

## 🚀 Local Setup & Installation

Follow these steps to run the project locally on your machine.

### 1. Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database instance
- A Google Gemini API key

### 2. Clone the Repository

```bash
git clone https://github.com/Astrea-Van/briefly-app.git
cd briefly-app
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the project root and add the following:

```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=postgresql://user:password@localhost:5432/briefly
PORT=3000
```

### 5. Run the App

```bash
npm start
```

The app should now be running at `http://localhost:3000`.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/Astrea-Van/briefly-app/issues).