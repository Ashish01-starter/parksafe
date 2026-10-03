# parkSafe

A public parking finder for Chennai that helps users discover nearby parking locations for two-wheelers and four-wheelers.

## Features

- 📍 GPS-based parking discovery
- 🔎 Search for parking locations
- 🗺️ Interactive OpenStreetMap map
- 🛵 Two-wheeler parking support
- 🚗 Four-wheeler parking support
- 📌 278 Chennai parking locations
- 🅿️ Individual parking-space support
- 🧭 Navigation to selected parking locations
- 🔄 Automatic availability refresh
- 👤 User parking confirmation
- 📊 Parking availability tracking
- 📱 Responsive interface
- ☁️ Production deployment with Vercel
- 🗄️ PostgreSQL database

## Data

Parking locations are imported from OpenStreetMap and stored in PostgreSQL.

The current database contains 278 unique Chennai parking locations.

OpenStreetMap provides the location information. Availability is not assumed to be real-time unless it comes from a supported availability source.

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- Leaflet
- OpenStreetMap
- Vercel

## Architecture

```text
User
  ↓
Next.js / React
  ↓
Leaflet + OpenStreetMap
  ↓
Next.js API
  ↓
Prisma ORM
  ↓
PostgreSQL
