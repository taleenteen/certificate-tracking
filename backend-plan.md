Scalable Backend Architecture: Smart City Map (NestJS + Prisma)
This document serves as a blueprint for building a scalable, production-ready backend for the Smart City Map using NestJS and Prisma. It is designed to be "Demo-First" but "Scale-Ready".

1. Technology Stack
   Framework: NestJS (Modular, TypeScript-first)
   Database: PostgreSQL (with PostGIS extension for geospatial data)
   ORM: Prisma
   Caching: Redis (for frequently accessed map data)
   Storage: AWS S3 / MinIO (for pin images/attachments)
2. Database Schema (Scalable Design)
   We will use PostGIS for handling geometry efficiently. Prisma supports raw SQL for PostGIS operations, or we can use geography types if supported by extensions. For maximum compatibility and ease of use in this phase, we will store GeoJSON but prepare for PostGIS migration.

schema.prisma
generator client {
provider = "prisma-client-js"
previewFeatures = ["postgresqlExtensions"] // Enable extensions
}
datasource db {
provider = "postgresql"
url = env("DATABASE_URL")
extensions = [postgis] // Requires PostGIS extension in DB
}
// Enums for strict typing
enum PinType {
WATER
FIRE
CAMERA
TAX
INFO
INFRASTRUCTURE
}
enum PinStatus {
NORMAL
WARNING
DANGER
MAINTENANCE
OFFLINE
}
enum GeometryType {
POINT
POLYGON
LINESTRING
}
model User {
id String @id @default(uuid())
email String @unique
role String @default("USER") // ADMIN, STAFF, USER
pins Pin[] @relation("CreatedPins")
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
}
model Pin {
id String @id @default(uuid())
dataId String? @unique // External reference ID (e.g., Sensor ID)
title String
description String? @db.Text
// Classification
type PinType
subtype String? // Flexible subtype
tags String[] // Array of tags for filtering
// Status & Visibility
status PinStatus @default(NORMAL)
isPublic Boolean @default(true)
// Location Data
// We separate geometry to keep the main table light and allow for specific indexing
geometry PinGeometry?
// Dynamic Attributes (JSONB)
// Stores type-specific data: { level: "80%", temp: 45, taxAmount: 5000 }
attributes Json? @db.JsonB
// Media
images String[] // URLs to images
// Audit
createdBy User? @relation("CreatedPins", fields: [createdById], references: [id])
createdById String?
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
@@index([type])
@@index([status])
@@index([isPublic])
}
model PinGeometry {
id String @id @default(uuid())
pinId String @unique
pin Pin @relation(fields: [pinId], references: [id], onDelete: Cascade)
type GeometryType
// Storing as JSON for flexibility now, but in production with PostGIS,
// you would use `Unsupported("geometry(Geometry, 4326)")` or raw queries.
// For this scalable demo, we use JSON but structure it strictly.
coordinates Json
// Pre-calculated center for fast bounding-box queries (if using JSON)
lat Float?
lng Float?
@@index([lat, lng]) // Composite index for basic bounding box search
} 3. NestJS Module Structure
Organize by Domain (Feature) rather than technical layer.

src/
├── app.module.ts
├── common/ # Shared logic (Guards, Interceptors, DTOs)
│ ├── database/ # Prisma Module
│ └── filters/ # Global Exception Filters
├── modules/
│ ├── map/ # Map Domain
│ │ ├── dto/ # Data Transfer Objects (Validation)
│ │ │ ├── create-pin.dto.ts
│ │ │ └── update-pin.dto.ts
│ │ ├── entities/
│ │ ├── map.controller.ts
│ │ ├── map.service.ts
│ │ └── map.module.ts
│ ├── users/ # User Domain
│ └── auth/ # Authentication
DTO Example (create-pin.dto.ts)
Using class-validator is crucial for data integrity.

import {
IsEnum,
IsString,
IsOptional,
IsBoolean,
IsJSON,
ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
export class CreatePinDto {
@IsString()
title: string;
@IsEnum(PinType)
type: PinType;
@ValidateNested()
@Type(() => GeometryDto)
geometry: GeometryDto;
@IsOptional()
@IsJSON()
attributes?: any;
} 4. Scalability Strategies
A. Geospatial Indexing (The "Secret Sauce")
Problem: Querying "Find all pins in this screen view" becomes slow with millions of points.
Solution:
PostGIS: Use ST_Within or ST_DWithin queries. This is the gold standard.
Geohashing: Add a geohash column to PinGeometry. This allows you to query by string prefix (e.g., "Find all pins starting with 'w4rq'"). Extremely fast and database-agnostic.
B. Caching (Redis)
Strategy: Cache the response of the "Get All Pins" or "Get Pins by Tile" endpoints.
Invalidation: When a Pin is created/updated, invalidate the cache for that specific area/tile.
C. Clustering on the Backend (Supercluster)
Instead of sending 10,000 pins to the frontend, use a library like supercluster (Node.js version) on the backend to aggregate points based on zoom level.
API: GET /pins?bbox=...&zoom=12 -> Returns clusters + individual pins.
D. Microservices Ready
The MapModule is self-contained. In the future, it can be extracted into a standalone "Map Service" (gRPC/RabbitMQ) without breaking the rest of the app. 5. Next Steps for Implementation
Initialize NestJS project: nest new smart-city-api
Install dependencies: npm i prisma @prisma/client class-validator class-transformer
Copy the schema.prisma above.
Generate Prisma client: npx prisma generate
Create MapModule and implement CRUD.
