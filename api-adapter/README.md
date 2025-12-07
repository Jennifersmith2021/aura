# FastAPI Amazon Adapter

This is a small FastAPI server that bridges your Next.js Aura app to the `amazon-mcp` package for real product searches.

## Setup

### 1. Install Python dependencies

In the repository root, create a Python venv and install requirements:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r api-adapter/requirements.txt
```

### 2. (Optional) Configure amazon-mcp

The `amazon-mcp` package may require credentials or environment setup. Consult the [PyPI documentation](https://pypi.org/project/amazon-mcp/) for exact configuration (API keys, payment setup with Fewsats, etc.).

### 3. Run the adapter

```powershell
.venv\Scripts\Activate.ps1
uvicorn api-adapter.adapter:app --reload --port 8001
```

The adapter exposes:
- `GET /health` — returns `{"ok": true, "amazon_mcp": true/false}`
- `GET /search?q=<query>&page=1&limit=10` — searches Amazon via `amazon-mcp`

### 4. Enable the adapter in your Next.js app

In `.env.local` in your project root, set:

```
USE_LOCAL_RETAILER_ADAPTER=true
RETAILER_ADAPTER_URL=http://localhost:8001
```

Then restart `npm run dev`. Your Next.js shopping page will now call the local adapter instead of the retailer stub.

## Troubleshooting

- **`amazon-mcp` not installed**: Install with `pip install amazon-mcp` or run `pip install -r requirements.txt`.
- **Port 8001 already in use**: Change the port in the `uvicorn` command, e.g., `--port 8002`. Update `.env.local` accordingly.
- **`amazon-mcp` API not matching**: The adapter includes defensive code to handle different `amazon-mcp` API surfaces. If it still fails, consult the `amazon-mcp` source or PyPI to confirm the exact function signatures and data structures, then update the `adapter.py` file's `search()` endpoint.
- **Slow responses**: The adapter caches queries for 60 seconds. If you want real-time updates, reduce the TTL in `adapter.py` line 60.

## Architecture

The adapter is stateless and can be run:
- Locally for development (as above)
- In a separate container or process on your machine
- Behind a local reverse proxy (nginx, etc.) if needed

The Next.js app (running on port 3000) calls it via HTTP. All caching and rate-limiting is handled by the adapter; the Next.js app remains unaware of the underlying implementation.
