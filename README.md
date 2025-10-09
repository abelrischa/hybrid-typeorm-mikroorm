# Hybrid ORM Blog API

A blog API demonstrating incremental migration from TypeORM to MikroORM. Both ORMs run together on the same database.

## What This Project Does

- **Users & Posts** → Managed by TypeORM (the old way)
- **Comments & Tags** → Managed by MikroORM (the new way)
- Both systems work together on the same MariaDB database

## Prerequisites

- Node.js (v16+)
- MariaDB running on port 3306
- Database: `blog_db`

## How to Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables

Create a `.env` file:
```
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=blog_db
PORT=3000
NODE_ENV=development
```

### 3. Start the Server
```bash
npm run start:dev
```

The server will start on http://localhost:3000

## Using the Application

### Option 1: Web Interface
Open http://localhost:3000 in your browser to access the dashboard.

### Option 2: API Endpoints

**Create a User:**
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","name":"Test User","bio":"A test user"}'
```

**Create a Post:**
```bash
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"My Post","content":"Post content","authorId":1}'
```

**Create a Comment:**
```bash
curl -X POST http://localhost:3000/comments \
  -H "Content-Type: application/json" \
  -d '{"content":"Great post!","userId":1,"postId":1}'
```

**Create a Tag:**
```bash
curl -X POST http://localhost:3000/tags \
  -H "Content-Type: application/json" \
  -d '{"name":"technology","description":"Tech posts"}'
```

## Project Structure

```
src/
├── typeorm/entities/     # User, Post (TypeORM)
├── mikro-orm/entities/   # Comment, Tag (MikroORM)
├── users/                # User service
├── posts/                # Post service
├── comments/             # Comment service
└── tags/                 # Tag service
```

## Troubleshooting

**Port already in use?** The start script automatically handles this.

**Database connection error?** Check your `.env` file has the correct credentials.

**Frontend not updating?** Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

## Tech Stack

- **Framework:** NestJS
- **Database:** MariaDB
- **ORMs:** TypeORM + MikroORM
- **Language:** TypeScript
