from flask import Flask, request, jsonify
from flask_cors import CORS
from bson.objectid import ObjectId
from dotenv import load_dotenv
import os
from service import CollectionService

load_dotenv()

app = Flask(__name__)
CORS(app)

svc = CollectionService()


def serialize(doc):
    if not doc:
        return None
    doc["_id"] = str(doc["_id"])
    return doc


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


@app.route("/collections", methods=["GET"])
def list_collections():
    results = svc.get_all()
    return jsonify([serialize(r) for r in results]), 200


@app.route("/collections", methods=["POST"])
def create_collection():
    data = request.get_json() or {}
    required = ["name", "owner"]
    for k in required:
        if k not in data:
            return jsonify({"error": f"Missing field: {k}"}), 400
    new_id = svc.create(data)
    return jsonify({"id": str(new_id)}), 201


@app.route("/collections/<id>", methods=["GET"])
def get_collection(id):
    try:
        doc = svc.get_by_id(id)
    except Exception:
        return jsonify({"error": "Invalid id"}), 400
    if not doc:
        return jsonify({"error": "Not found"}), 404
    return jsonify(serialize(doc)), 200


@app.route("/collections/<id>", methods=["PUT"])
def update_collection(id):
    data = request.get_json() or {}
    try:
        updated = svc.update(id, data)
    except Exception:
        return jsonify({"error": "Invalid id"}), 400
    if not updated:
        return jsonify({"error": "Not found"}), 404
    return jsonify({"updated": True}), 200


@app.route("/collections/<id>", methods=["DELETE"])
def delete_collection(id):
    try:
        deleted = svc.delete(id)
    except Exception:
        return jsonify({"error": "Invalid id"}), 400
    if not deleted:
        return jsonify({"error": "Not found"}), 404
    return jsonify({"deleted": True}), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5002))
    app.run(host="0.0.0.0", port=port)
