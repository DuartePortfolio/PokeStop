# collection-service

A small Flask service that stores and manages "collections" in MongoDB.

Environment variables (see `.env.example`):

- `MONGO_URI` - MongoDB connection string
- `DB_NAME` - database name
- `COLLECTION_NAME` - collection name
- `PORT` - port to run the Flask app

Run locally:

```bash
python -m pip install -r requirements.txt
# set env vars or copy .env.example to .env
python app.py
```

Seed sample data:

```bash
python seed.py
```
