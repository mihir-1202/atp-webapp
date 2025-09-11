# ATP Form Builder

staticwebapp.config.js
/*
When a user navigates to a route that doesn't map to an html file, the browser will fallback to the index.html file -> react will handle the routing
*/
{
    "navigationFallback": {
      "rewrite": "/index.html",
      "exclude": ["/images/*.{png,jpg,gif}", "/css/*"]
    }
  }

A full-stack application for creating and managing ATP (Acceptance Test Procedure) forms with separate technician and engineer sections.

## Project Structure

```
atp-webapp/
├── frontend/          # React + Vite frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── index.html
├── backend/           # FastAPI backend
│   ├── app/
│   ├── main.py
│   └── requirements.txt
├── vite.config.js     # Vite configuration
└── package.json       # Root package.json for scripts
```

## Quick Start

### Install Dependencies

```bash
# Install all dependencies
npm run install:all

# Or install separately:
npm run install:frontend
npm run install:backend
```

### Development

```bash
# Start frontend only
npm run dev:frontend

# Start backend only  
npm run dev:backend

# Or start both in separate terminals
```

### Frontend (React + Vite)
- **URL**: http://localhost:5173
- **Location**: `./frontend/`
- **Tech**: React, Vite, React Hook Form

### Backend (FastAPI)
- **URL**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Location**: `./backend/`
- **Tech**: FastAPI, Python, Pydantic

## Features

- ✅ Dynamic form builder with drag & drop
- ✅ Separate sections for technicians and engineers
- ✅ Multiple field types (text, textarea, number, date)
- ✅ Real-time form preview
- ✅ Form validation
- ✅ REST API for form management
- 🔄 Form submissions and responses
- 🔄 User authentication
- 🔄 Database integration

## API Endpoints

- `POST /api/forms/` - Create form
- `GET /api/forms/` - List forms
- `GET /api/forms/{id}` - Get form
- `PUT /api/forms/{id}` - Update form
- `DELETE /api/forms/{id}` - Delete form
- `POST /api/forms/{id}/submit` - Submit response

## Development

This project uses a monorepo structure with separate frontend and backend directories. All scripts can be run from the root level using the commands listed above.