# VideoSage

**AI-powered video learning platform** that transforms YouTube videos into interactive learning experiences with chat, quizzes, flashcards, summaries, and mind maps.

VideoSage extracts transcripts from YouTube videos, generates semantic embeddings, and uses RAG (Retrieval-Augmented Generation) to power intelligent features that help users learn from video content more effectively.

## Demo

### Quiz Generation
AI-generated multiple-choice questions from video content with explanations and timestamp references.

![Quiz Generation](public/demo01.png)

### Mind Map Visualization
Hierarchical mind maps that break down the video's key themes, topics, and subtopics.

![Mind Map - Dark Mode](public/demo02.png)

### Mind Map (Alternate View)
Interactive node-based visualization powered by GoJS for exploring content structure.

![Mind Map - Alternate View](public/demo03.png)

## Features

| Feature | Description |
|---------|-------------|
| **Chat** | Context-aware Q&A over video content using semantic search and streaming LLM responses |
| **Quiz** | Auto-generated multiple-choice questions with answers, explanations, and source timestamps |
| **Flashcards** | Study cards with questions, hints, answers, and explanations for spaced repetition |
| **Summary** | Structured 500-700 word summaries covering key topics, insights, and takeaways |
| **Mind Map** | Interactive hierarchical visualization of video content themes and concepts |
| **Spaces** | Organize videos into collections for project-based or topic-based learning |
| **Dark Mode** | Full dark/light theme support |

## Architecture

### High-Level System Architecture

```mermaid
graph TB
    subgraph Client["Frontend (Next.js + React)"]
        UI[UI Components]
        Auth[Auth Provider]
        State[Zustand State]
    end

    subgraph Server["Backend (Next.js API Routes)"]
        API[REST API Endpoints]
        MW[Auth Middleware]
        Pipeline[Content Processing Pipeline]
    end

    subgraph Queue["Job Queue"]
        Redis[(Redis)]
        BullMQ[BullMQ Worker]
    end

    subgraph Database["Data Layer"]
        PG[(PostgreSQL)]
        Prisma[Prisma ORM]
    end

    subgraph AI["AI Services"]
        OpenAI[OpenAI API]
        Embed[Embedding Model]
        LLM[Chat Model]
    end

    subgraph VectorDB["Vector Search"]
        Pinecone[(Pinecone)]
    end

    subgraph External["External APIs"]
        YT[YouTube Data API]
        Transcript[YouTube Transcript API]
    end

    Client -->|HTTP Requests| Server
    MW -->|Validates JWT| API
    API -->|Queries| Prisma
    Prisma -->|SQL| PG
    API -->|Enqueue Jobs| Redis
    Redis -->|Dequeue| BullMQ
    BullMQ -->|Runs| Pipeline
    Pipeline -->|Fetch Transcript| Transcript
    Pipeline -->|Fetch Metadata| YT
    Pipeline -->|Generate Embeddings| Embed
    Pipeline -->|Store Vectors| Pinecone
    API -->|RAG Queries| Pinecone
    API -->|Generate Content| LLM
    Embed -->|text-embedding-3-small| OpenAI
    LLM -->|GPT| OpenAI
```

### Content Processing Pipeline

```mermaid
flowchart LR
    A[User Pastes<br/>YouTube URL] --> B[Extract<br/>Metadata]
    B --> C[Fetch<br/>Transcript]
    C --> D[Chunk Text<br/>~300 words]
    D --> E[Generate<br/>Embeddings]
    E --> F[Store in<br/>Pinecone]
    F --> G[Mark Job<br/>Complete]

    style A fill:#4CAF50,color:#fff
    style G fill:#2196F3,color:#fff
```

When a user adds a YouTube video:

1. **Metadata Extraction** - Fetches title, description, and thumbnail via the YouTube Data API
2. **Transcript Fetching** - Extracts captions using `youtube-transcript` with a Tactiq API fallback
3. **Chunking** - Splits the transcript into ~300-word segments preserving timestamp boundaries
4. **Embedding Generation** - Generates 1536-dimensional vectors using OpenAI `text-embedding-3-small` in batches of 50
5. **Vector Storage** - Upserts embeddings to Pinecone with metadata (video ID, text, start/end timestamps) in batches of 100
6. **Job Completion** - Updates the processing job status in PostgreSQL

### RAG-Powered Chat Flow

```mermaid
sequenceDiagram
    participant User
    participant API as Next.js API
    participant Pinecone
    participant OpenAI

    User->>API: Send question
    API->>OpenAI: Generate query embedding
    OpenAI-->>API: Query vector
    API->>Pinecone: Similarity search (top-k)
    Pinecone-->>API: Relevant transcript chunks
    API->>OpenAI: Prompt with context + question
    OpenAI-->>API: Streamed response
    API-->>User: Streaming answer with timestamps
```

### AI Feature Generation

```mermaid
flowchart TD
    Content[Video Content] --> Transcript[Full Transcript]
    Transcript --> Summary[Summary Generation]
    Transcript --> Quiz[Quiz Generation]
    Transcript --> Flash[Flashcard Generation]
    Transcript --> Mind[Mind Map Generation]

    Summary --> Cache[(Cache in DB)]
    Quiz --> Cache
    Flash --> Cache
    Mind --> Cache

    Cache --> UI[Serve to Frontend]
```

All AI features (summary, quiz, flashcards, mind map) are generated on first access and cached in the `ContentMetadata` table. Subsequent requests serve the cached result directly.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS |
| **UI Components** | Radix UI, Framer Motion, Lucide Icons |
| **State Management** | Zustand |
| **Visualization** | GoJS (mind maps) |
| **Backend** | Next.js API Routes |
| **Database** | PostgreSQL + Prisma ORM |
| **Vector Database** | Pinecone (serverless) |
| **AI/LLM** | OpenAI GPT (chat, generation), text-embedding-3-small (embeddings) |
| **Job Queue** | BullMQ + Redis |
| **Authentication** | JWT (HTTP-only cookies, 7-day sessions) |
| **Containerization** | Docker Compose (Redis) |
| **Logging** | Pino |

## Project Structure

```
videosage/
├── app/
│   ├── (routes)/
│   │   ├── dashboard/              # Dashboard & spaces pages
│   │   ├── content/[id]/           # Video content viewer
│   │   ├── signin/ & signup/       # Auth pages
│   │   └── settings/               # User settings
│   ├── api/
│   │   ├── auth/                   # Login, signup, logout, me
│   │   ├── contents/               # Content CRUD & job status
│   │   ├── spaces/                 # Space management
│   │   ├── generate/               # AI features (chat, quiz, summary, flashcards, mindmap)
│   │   └── users/                  # User profile management
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Landing page
├── components/
│   ├── content/                    # Content viewer components (quiz, flashcards, summary, mindmap)
│   ├── ui/                         # Radix UI wrappers
│   ├── chat.tsx                    # Chat interface
│   ├── header.tsx                  # Navigation header
│   └── sidebar.tsx                 # Content sidebar
├── hooks/                          # Auth & space context providers
├── lib/
│   ├── pipeline.ts                 # Content processing pipeline
│   ├── queue.ts                    # BullMQ queue configuration
│   ├── ai.ts                       # OpenAI client setup
│   ├── auth.ts                     # JWT session management
│   ├── prisma.ts                   # Prisma client singleton
│   └── utils.ts                    # Transcript, embedding, and AI utilities
├── workers/
│   └── content-worker.ts           # BullMQ worker for async processing
├── prisma/
│   └── schema.prisma               # Database schema
├── docker-compose.yml              # Redis service
└── middleware.ts                    # Route-level auth middleware
```

## Database Schema

```mermaid
erDiagram
    User ||--o{ Space : creates
    User ||--o{ UserContent : has
    User ||--o{ ChatRoom : participates
    Space ||--o{ SpaceContent : contains
    Content ||--o{ UserContent : "belongs to"
    Content ||--o{ SpaceContent : "belongs to"
    Content ||--o| YoutubeContent : has
    Content ||--o| DocumentContent : has
    Content ||--o| ContentMetadata : has
    Content ||--o{ ContentProcessingJob : tracks
    Content ||--o{ ChatRoom : has
    ChatRoom ||--o{ Message : contains

    User {
        uuid user_id PK
        string email UK
        string username UK
        string first_name
        string last_name
        string password
    }

    Content {
        uuid content_id PK
        enum content_type
        datetime created_at
    }

    YoutubeContent {
        uuid content_id PK
        string youtube_id UK
        string title
        string thumbnail_url
        json transcript
    }

    ContentMetadata {
        uuid content_id PK
        text summary
        json quiz
        json flashcards
        json mindmap
    }

    ContentProcessingJob {
        uuid job_id PK
        uuid content_id FK
        enum status
        enum step
        string error
    }

    Space {
        uuid space_id PK
        uuid user_id FK
        string space_name
    }

    ChatRoom {
        uuid chatroom_id PK
        uuid content_id FK
        uuid user_id FK
    }

    Message {
        uuid message_id PK
        uuid chatroom_id FK
        uuid user_id FK
        text content
    }
```

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **pnpm** (package manager)
- **PostgreSQL** database
- **Docker** (for Redis, optional)
- API keys: OpenAI, Pinecone, YouTube Data API

### Step 1: Clone and Install

```bash
git clone https://github.com/lokeshkhabiya/VideoSage.git
cd VideoSage
pnpm install
```

### Step 2: Configure Environment

Copy `.env.example` to `.env` and set the required values:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/videosage"
DIRECT_URL="postgresql://user:password@localhost:5432/videosage"

# Authentication
JWT_SECRET="your-secret-key"

# YouTube
YOUTUBE_APIKEY="your-youtube-data-api-key"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"
OPENAI_CHAT_MODEL="gpt-5-mini"
OPENAI_FALLBACK_CHAT_MODEL="gpt-4o-mini"
OPENAI_EMBED_MODEL="text-embedding-3-small"

# Pinecone (index dimension must be 1536 for text-embedding-3-small)
PINECONE_API_KEY="your-pinecone-api-key"
PINECONE_INDEX="youtube-content"
PINECONE_NAMESPACE="videosage-namespace-3"

# Redis (optional - omit for inline processing)
REDIS_URL="redis://localhost:6379"
CONTENT_PROCESSING_MODE="queue"  # or "inline"
```

### Step 3: Set Up the Database

```bash
pnpm prisma migrate dev
pnpm prisma generate
```

### Step 4: Start Redis (Optional - for background processing)

```bash
docker compose up -d redis
```

Verify it's running:

```bash
docker compose exec redis redis-cli ping
# Should print: PONG
```

### Step 5: Run the Application

```bash
# Terminal 1 - Start the dev server
pnpm dev

# Terminal 2 - Start the background worker (only if using queue mode)
pnpm worker:content
```

Open [http://localhost:3000](http://localhost:3000) to access the application.

## Processing Modes

VideoSage supports two content processing modes:

| Mode | When to Use | Requirements |
|------|------------|--------------|
| **Inline** | Development, small-scale use | No Redis needed |
| **Queue** | Production, multiple concurrent users | Redis + worker process |

- If `REDIS_URL` is set and `CONTENT_PROCESSING_MODE=queue`, jobs are enqueued to BullMQ and processed by the worker.
- If Redis is unavailable or `CONTENT_PROCESSING_MODE=inline`, content is processed synchronously within the API request.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | Register a new user |
| `POST` | `/api/auth/login` | Log in and receive JWT |
| `POST` | `/api/auth/logout` | Clear session cookie |
| `GET` | `/api/auth/me` | Get current user info |
| `POST` | `/api/contents` | Add a YouTube video for processing |
| `GET` | `/api/contents?id={id}` | Fetch content details |
| `GET` | `/api/contents/{id}/status` | Check processing job status |
| `GET/POST` | `/api/spaces` | List or create spaces |
| `GET/PUT/DELETE` | `/api/spaces/{id}` | Manage a specific space |
| `GET` | `/api/generate/chat` | Chat with video content (streaming) |
| `GET` | `/api/generate/summary` | Generate or retrieve cached summary |
| `GET` | `/api/generate/quiz` | Generate or retrieve cached quiz |
| `GET` | `/api/generate/flashcard` | Generate or retrieve cached flashcards |
| `GET` | `/api/generate/mindmap` | Generate or retrieve cached mind map |

## Docker Commands

| Command | Description |
|---------|-------------|
| `docker compose up -d redis` | Start Redis in the background |
| `docker compose down` | Stop Redis (data persisted in volume) |
| `docker compose down -v` | Stop Redis and delete all data |
| `docker compose logs -f redis` | Follow Redis logs |
| `pnpm worker:content` | Start the content processing worker |
