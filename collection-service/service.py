from pymongo import MongoClient
from bson.objectid import ObjectId
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "pokestop_db")
COLLECTION_NAME = os.environ.get("COLLECTION_NAME", "collections")


class CollectionService:
    def __init__(self):
        self.client = MongoClient(MONGO_URI)
        self.db = self.client[DB_NAME]
        self.col = self.db[COLLECTION_NAME]

    def get_all(self):
        return list(self.col.find())

    def get_by_id(self, id_):
        oid = ObjectId(id_)
        return self.col.find_one({"_id": oid})

    def create(self, data: dict):
        res = self.col.insert_one(data)
        return res.inserted_id

    def update(self, id_, data: dict):
        oid = ObjectId(id_)
        update = {"$set": data}
        res = self.col.update_one({"_id": oid}, update)
        return res.matched_count > 0

    def delete(self, id_):
        oid = ObjectId(id_)
        res = self.col.delete_one({"_id": oid})
        return res.deleted_count > 0
