# ⚡ FinSpark AI — BRD-to-Config Generator for Core Banking

> AI-Powered Integration Configuration Generator that converts Business Requirement Documents (BRDs) into secure, production-ready API gateway configurations for India's Core Banking ecosystem.

![FinSpark Demo](docs/screenshot.png)

## 🏗️ Architecture

```
┌─────────────┐     ┌─────────────────────────────────────┐
│   React UI  │────▶│  Express API Server                  │
│   (Vite)    │     │  ├── /api/upload    (BRD parsing)    │
│             │◀────│  ├── /api/generate  (RAG + LLM)      │
│  Preview &  │     │  ├── /api/templates (list templates)  │
│  Download   │     │  ├── /api/validate  (schema check)   │
└─────────────┘     │  └── /api/history   (audit log)      │
                    │                                       │
                    │  ┌── PII Masker ──┐                   │
                    │  ├── ChromaDB     ├── Gemini 2.5 API  │
                    │  ├── Templates    │                   │
                    │  └── SQLite       ┘                   │
                    └─────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Gemini API Key (Google AI Studio)

### Setup
```bash
# Clone & Install
git clone https://github.com/Archit9tyagi/FinSpark.git
cd FinSpark

# Install all dependencies
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..

# Configure environment
cp .env.example server/.env
# Edit server/.env with your GEMINI_API_KEY
```

### Run
```bash
# Start backend (port 3001)
cd server && node src/app.js

# Start frontend (port 5173) — in a new terminal
cd client && npm run dev
```

Open http://localhost:5173 in your browser.

## 🔑 Features

### Core Capabilities
- **BRD Upload** — PDF, DOCX, TXT parsing with hierarchical chunking
- **AI Generation** — Gemini 2.5 Pro converts BRD → production YAML/JSON configs
- **PII Detection** — Aadhaar, PAN, phone, email, bank account masking before LLM processing
- **Schema Validation** — JSON Schema + security + compliance checks on all outputs
- **Integration Templates** — Pre-built CIBIL, UIDAI, Razorpay adapters
- **Audit Logging** — Full audit trail with SQLite persistence

### Output Types
- API Gateway configs (Kong/Tyk/AWS style YAML)
- Authentication policies (JWT, OAuth2, API keys)
- Rate limiting & circuit breaker rules
- JOLT transformation specifications
- Auto-generated test cases

### Security
- Zero Trust Architecture design
- PII tokenization (Aadhaar Data Vault pattern)
- Prompt injection defense (input sanitization + instruction/data separation)
- Output schema enforcement
- mTLS recommendations for production

### Compliance
- RBI Digital Lending Guidelines 2025
- DPDP Act (Data Protection)
- UIDAI security standards
- PCI-DSS for payments

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| LLM | Google Gemini 2.5 Pro |
| Database | SQLite (better-sqlite3) |
| Document Parsing | pdf-parse, mammoth |
| Validation | AJV (JSON Schema) |
| Styling | Vanilla CSS (Dark Intelligence Design System) |

## 📁 Project Structure

```
FinSpark/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/         # Navbar, Footer
│   │   ├── pages/              # Dashboard, Generator, Templates, Compliance
│   │   ├── api.js              # API service layer
│   │   ├── App.jsx
│   │   └── index.css           # Design system
│   └── index.html
├── server/                     # Express Backend
│   ├── src/
│   │   ├── routes/             # API endpoints
│   │   ├── services/           # Parser, PII, LLM, Validator, Templates
│   │   └── db/                 # SQLite layer
│   └── .env
├── .gitignore
└── README.md
```

## 📜 License

Built for hackathon demonstration. MIT License.

## 👤 Author

**Archit Tyagi** — [@Archit9tyagi](https://github.com/Archit9tyagi)
