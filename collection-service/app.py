from flask import Flask, request, jsonify
from flask_cors import CORS
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
    if "_id" in doc and not isinstance(doc["_id"], str):
        doc["_id"] = str(doc["_id"])
    return doc


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "collection-service"}), 200


# ============ Pokemon Instance Routes (User's PC/Box) ============

@app.route("/pokemon/user/<int:user_id>", methods=["GET"])
def get_user_pokemon(user_id):
    """Get all Pokemon owned by a user, enriched with Pokedex data"""
    enrich = request.args.get("enrich", "true").lower() == "true"
    pokemon_list = svc.get_user_pokemon(user_id, enrich=enrich)
    return jsonify({
        "userId": user_id,
        "count": len(pokemon_list),
        "pokemon": pokemon_list
    }), 200


@app.route("/pokemon/<instance_id>", methods=["GET"])
def get_pokemon_instance(instance_id):
    """Get a specific Pokemon instance by ID"""
    try:
        enrich = request.args.get("enrich", "true").lower() == "true"
        pokemon = svc.get_pokemon_instance(instance_id, enrich=enrich)
    except Exception:
        return jsonify({"error": "Invalid id"}), 400
    
    if not pokemon:
        return jsonify({"error": "Pokemon not found"}), 404
    
    return jsonify(serialize(pokemon)), 200


@app.route("/pokemon/user/<int:user_id>", methods=["POST"])
def add_pokemon(user_id):
    """Add a new Pokemon to user's collection"""
    data = request.get_json() or {}
    
    required = ["pokemonID", "level"]
    for k in required:
        if k not in data:
            return jsonify({"error": f"Missing field: {k}"}), 400
    
    # Set defaults for optional fields
    data.setdefault("nickname", None)
    data.setdefault("experience", 0)
    data.setdefault("isShiny", False)
    data.setdefault("gender", "unknown")
    data.setdefault("ability", None)
    data.setdefault("heldItem", None)
    
    try:
        new_id = svc.add_pokemon_to_user(user_id, data)
        return jsonify({"id": str(new_id), "message": "Pokemon added to collection"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/pokemon/<instance_id>", methods=["PUT"])
def update_pokemon(instance_id):
    """Update a Pokemon instance (nickname, held item, etc.)"""
    data = request.get_json() or {}
    
    try:
        updated = svc.update_pokemon_instance(instance_id, data)
    except Exception:
        return jsonify({"error": "Invalid id"}), 400
    
    if not updated:
        return jsonify({"error": "Pokemon not found"}), 404
    
    return jsonify({"updated": True}), 200


@app.route("/pokemon/<instance_id>", methods=["DELETE"])
def release_pokemon(instance_id):
    """Release a Pokemon (delete from collection)"""
    try:
        deleted = svc.delete_pokemon_instance(instance_id)
    except Exception:
        return jsonify({"error": "Invalid id"}), 400
    
    if not deleted:
        return jsonify({"error": "Pokemon not found"}), 404
    
    return jsonify({"deleted": True, "message": "Pokemon released"}), 200


@app.route("/pokemon/user/<int:user_id>/count", methods=["GET"])
def count_user_pokemon(user_id):
    """Get count of Pokemon owned by user"""
    count = svc.count_user_pokemon(user_id)
    return jsonify({"userId": user_id, "count": count}), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5002))
    app.run(host="0.0.0.0", port=port)
