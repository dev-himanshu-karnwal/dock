# multi-env

Minimal Node + Express + Mongo (Mongoose) + Redis. **Docker-based** env switch: only swap the env file.

## How to run different environments

**Development**
```bash
docker compose --env-file .env.dev up
```

**Production**
```bash
docker compose --env-file .env.prod up -d
```

No code change. No compose change. Only env swap.

| Env file  | Port | Mongo DB          | Redis DB |
|-----------|------|-------------------|----------|
| `.env.dev`  | 3000 | `multi-env-dev`   | 0        |
| `.env.prod` | 3001 | `multi-env-prod`  | 1        |
