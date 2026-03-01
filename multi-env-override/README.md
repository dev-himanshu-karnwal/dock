# multi-env-override

Same app as `multi-env`: Node + Express + Mongo (Mongoose) + Redis. **Environment is switched by composing files with `-f`** — no code change, no env-file swap.

## How to run

**Development** (base compose only)

```bash
docker compose up
```

**Production** (base + prod override)

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

| Compose              | Port | Mongo DB          | Redis DB |
|----------------------|------|-------------------|----------|
| `docker-compose.yml` | 3000 | `multi-env-dev`   | 0        |
| `+ docker-compose.prod.yml` | 3001 | `multi-env-prod`  | 1        |
