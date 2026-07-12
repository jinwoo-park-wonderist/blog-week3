# CLAUDE.md — blog_week3

## 1. Project Overview
Week 3 onboarding capstone: reconstruct Week 2's server-rendered Django blog into a DRF API + React SPA.
Re-implements the same domain (Post/Comment/Tag) API-first, with a fully deployed full-stack app as the end state.

## 2. Architecture
- Monorepo: Django project at `blog_week3/` root, React (Vite) project at `blog_week3/frontend/`.
- Django serves as an API-only server under `/api/`, responding with JSON only. No HTML template rendering is used.
- React is a Single Page Application (SPA) built with Vite; in local development it runs on its own dev server (default port 5173) and calls the Django API via `fetch`.
- The two apps are deployed as **two separate Heroku apps** from the same monorepo:
  - `blog-week3-api` — Django backend (Docker container deploy)
  - `blog-week3-frontend` — React frontend (nginx buildpack deploy, static build output)
- The `frontend/` directory is a subfolder of the monorepo, not a separate git repository. It is deployed to its own Heroku app via `git subtree push --prefix frontend heroku-frontend main`, while the whole repo is pushed normally (e.g. to GitHub) as a single project.

## 3. Tech Stack
- Backend: Django 6.0, Django REST Framework, PostgreSQL 12 (Docker locally, Heroku Postgres in production)
- Frontend: React (Vite), react-router-dom
- Local infra: Docker Compose (`db`, `web` services), Makefile for common commands
- Backend deploy: Heroku container registry (Docker), stack set to `container`
- Frontend deploy: Heroku `heroku-community/nginx` buildpack, serving the Vite production build (`dist/`)
- Authentication: DRF TokenAuthentication

## 4. Data Models
- CustomUser (AbstractUser) — adds `nick_name` (unique), `employee_level` fields
- Post — `post_author` (FK→User), `post_title`, `post_content`, `post_tag` (M2M→Tag)
- Comment — `post` (FK→Post), `comment_author` (FK→User), `comment_content`
- Tag — `tag_content`
- Relationships: User:Post = 1:N, Post:Comment = 1:N, Post:Tag = N:M, User:Comment = 1:N

## 5. Authentication Flow
- Login: `POST /api/auth/login/` (username, password) → returns `{ "token": "..." }`
- Subsequent write requests require `Authorization: Token <token>` header; read requests are allowed unauthenticated (`IsAuthenticatedOrReadOnly`)
- Logout: no server request needed — client simply deletes the stored token
- No signup API exists — accounts are created only via Django Admin or `createsuperuser`

## 6. API Endpoints
| Method | Path | Description | Auth Required |
|---|---|---|---|
| GET | /api/posts/ | Post list (filter with `?tag=<id>`) | No |
| POST | /api/posts/ | Create post (post_title, post_content, post_tag_ids) | Yes |
| GET | /api/posts/:id/ | Post detail | No |
| GET | /api/comments/?post=<id> | Comments for a specific post | No |
| POST | /api/comments/ | Create comment (post, comment_content) | Yes |
| GET | /api/tags/ | Tag list | No |
| POST | /api/tags/ | Create tag (tag_content) | Yes |

Production base URL: `https://blog-week3-api.herokuapp.com/api`

## 7. CORS Configuration
- Configuration location: `CORS_ALLOWED_ORIGINS` in `config/settings.py`
- Registered origins:
  - `http://localhost:5173`, `http://127.0.0.1:5173` (local Vite dev server)
  - `https://blog-week3-frontend-9ead4b73ff93.herokuapp.com'
- Any time the frontend's Heroku domain changes, this list must be updated and the API redeployed.

## 8. Environment Variables (.env)
Backend (`.env`, local):
- SECRET_KEY
- POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST, POSTGRES_PORT
- DEBUG
- DJANGO_ALLOWED_HOSTS

Backend (Heroku config vars, production, set via `heroku config:set --app blog-week3-api`):
- SECRET_KEY (production value, different from local)
- DJANGO_ALLOWED_HOSTS (Heroku API app hostname)
- DEBUG=False
- DATABASE_URL — auto-injected by the Heroku Postgres add-on, consumed via `dj_database_url.config()`

Frontend (`frontend/.env.production`):
- VITE_API_BASE_URL — points to the deployed Django API (`https://blog-week3-api.herokuapp.com/api`)

## 9. Local Development Setup
```bash
make up          # Build+start DB and Django in Docker
make migrate      # Run once initially or whenever models change
make superuser    # Run once initially (see gotcha below about nick_name)
cd frontend && npm run dev   # Run React dev server separately, in its own terminal
```

## 10. Directory Structure
- `blog/` — Django app (models, serializers, views, urls, queries)
- `config/` — Django project configuration (settings, urls)
- `frontend/src/` — React source
  - `api.js` — single shared module for all API calls (fetch wrapper, token header injection)
  - `AuthContext.jsx` — React Context providing login state app-wide
  - `pages/` — LoginPage, PostListPage, PostDetailPage, PostCreatePage, TagListPage
  - `components/Header.jsx` — persistent top navigation
- `frontend/dist/` — Vite production build output; committed to git (not gitignored) because the nginx buildpack serves this directory directly rather than building from source
- `Dockerfile` — backend container image (Python 3.12-slim, gunicorn in production)
- `docker-compose.yml` — local `db` + `web` services
- `Makefile` — local dev command shortcuts
- `Procfile` (root) — backend release/web process types, if buildpack fallback is used
- `frontend/Procfile`, `frontend/config/nginx.conf.erb` — frontend nginx buildpack configuration


## 11. Deployment
- **API** (`blog-week3-api`): Heroku container registry.
  - Stack: `container` (set via `heroku stack:set container --app blog-week3-api`)
  - Build/push (Apple Silicon-safe command, see gotchas above):
    ```bash
    docker buildx build --platform linux/amd64 --provenance=false --sbom=false \
      --output type=image,name=registry.heroku.com/blog-week3-api/web,push=true,oci-mediatypes=false .
    heroku container:release web --app blog-week3-api
    ```
  - Config vars: `SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`, `DEBUG=False`; `DATABASE_URL` auto-injected by the `heroku-postgresql` add-on.
  - Migrations: `heroku run python manage.py migrate --app blog-week3-api`
- **Frontend** (`blog-week3-frontend`): Heroku `heroku-community/nginx` buildpack.
  - Build locally first: `cd frontend && npm run build` (outputs to `frontend/dist/`, which must be committed).
  - Deploy via subtree push from the monorepo root: `git subtree push --prefix frontend heroku-frontend main`
  - Requires `frontend/Procfile` (`web: bin/start-nginx-solo`) and `frontend/config/nginx.conf.erb` (root `dist`, SPA fallback via `try_files $uri /index.html;`).
  - `frontend/.env.production` sets `VITE_API_BASE_URL` to the deployed API URL before building.
- **Status: both apps are deployed and live** as of this document's writing. Frontend is reachable at its Heroku URL; verify end-to-end login → post → comment → tag flow after any redeploy of either app.

