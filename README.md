# Definity Waste Tracker

A simple web application to track Definity contrast waste and associated costs for medical teams.

## Features

- **Simple Waste Entry**: Enter the amount of Definity wasted in mL
- **Automatic Cost Calculation**: $10 per mL of diluted Definity
- **Time-based Tracking**: View waste by day, week, month, or all time
- **Real-time Dashboard**: See totals and recent entries
- **No Authentication**: Simple access for trusted team members

## Cost Reference

- 1 vial of Definity = 1.5mL = $200
- When mixed with normal saline: 4 syringes × 5mL = 20mL total
- Cost per mL of diluted Definity = $10

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Access the Application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Record Waste**: Enter the amount of Definity wasted in mL
2. **View Summary**: Check daily, weekly, monthly, or all-time totals
3. **Review History**: See recent waste entries with timestamps

## Database

The application uses SQLite for data storage. The database file (`definity-tracker.db`) will be created automatically when you first run the application.

## Deployment

For production deployment:

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Start Production Server**
   ```bash
   npm start
   ```

## Team Access

This application is designed for internal team use. No authentication is required - simply share the URL with your team members.

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with better-sqlite3
- **Styling**: Tailwind CSS
