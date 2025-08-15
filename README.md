# ATP Form Builder

A full-stack application for creating and managing ATP (Acceptance Test Procedure) forms.

## Project Structure

```
atp-webapp/
├── frontend/          # React + Vite frontend application
│   ├── src/           # React components and logic
│   ├── public/        # Static assets
│   ├── package.json   # Frontend dependencies
│   ├── vite.config.js # Vite configuration
│   └── README.md      # Frontend-specific documentation
├── backend/           # FastAPI backend application  
│   ├── app/           # API routes and models
│   ├── main.py        # FastAPI server entry point
│   ├── requirements.txt # Python dependencies
│   └── README.md      # Backend-specific documentation
└── package.json       # Root scripts for managing both apps
```

## Quick Start

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Start Development Servers

**Frontend (React):**
```bash
npm run dev
# or: npm run dev:frontend
```
Frontend will be available at: http://localhost:5173

**Backend (FastAPI):**
```bash
npm run dev:backend
```
Backend will be available at: http://localhost:8000
API documentation: http://localhost:8000/docs

## Development Workflow

- `npm run dev` - Start frontend development server
- `npm run dev:backend` - Start backend development server  
- `npm run build` - Build frontend for production
- `npm run install:all` - Install all dependencies

## Technology Stack

**Frontend:**
- React 18
- Vite
- React Hook Form
- Modern CSS

**Backend:**
- FastAPI
- Python 3.9+
- Pydantic
- Uvicorn

## Features

- Dynamic form builder with technician and engineer sections
- Real-time form validation
- REST API for form management
- Modern, responsive UI