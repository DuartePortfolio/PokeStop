from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from functools import wraps
import os
import jwt
from service import CollectionService

load_dotenv()

app = Flask(__name__)
CORS(app)

svc = CollectionService()

# JWT Configuration
JWT_SECRET = os.environ.get("JWT_SECRET", "pokestop-secret-change-in-production")


def serialize(doc):
    if not doc:
        return None
    if "_id" in doc and not isinstance(doc["_id"], str):
        doc["_id"] = str(doc["_id"])
    return doc


def require_auth(f):
    
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid authorization header"}), 401
        
        token = auth_header.split(" ")[1]
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            request.user = payload  # Attach user info to request
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        
        return f(*args, **kwargs)
    return decorated


def require_owner(f):
    """ensure user can only access their own resources"""
    @wraps(f)
    def decorated(*args, **kwargs):
        user_id = kwargs.get("user_id")
        if user_id is not None and request.user.get("id") != user_id:
            return jsonify({"error": "Access denied - you can only access your own Pokemon"}), 403
        return f(*args, **kwargs)
    return decorated


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "collection-service"}), 200


# ============ Pokemon Instance Routes ============

@app.route("/pokemon/user/<int:user_id>", methods=["GET"])
@require_auth
@require_owner
def get_user_pokemon(user_id):
    """Get all Pokemon owned by a user"""
    enrich = request.args.get("enrich", "true").lower() == "true"
    pokemon_list = svc.get_user_pokemon(user_id, enrich=enrich)
    return jsonify({
        "userId": user_id,
        "count": len(pokemon_list),
        "pokemon": pokemon_list
    }), 200


@app.route("/pokemon/<instance_id>", methods=["GET"])
@require_auth
def get_pokemon_instance(instance_id):
    """Get a specific Pokemon instance by ID"""
    try:
        enrich = request.args.get("enrich", "true").lower() == "true"
        pokemon = svc.get_pokemon_instance(instance_id, enrich=enrich)
    except Exception:
        return jsonify({"error": "Invalid id"}), 400
    
    if not pokemon:
        return jsonify({"error": "Pokemon not found"}), 404
    
    # Check ownership
    if pokemon.get("userID") != request.user.get("id"):
        return jsonify({"error": "Access denied - not your Pokemon"}), 403
    
    return jsonify(serialize(pokemon)), 200


@app.route("/pokemon/user/<int:user_id>", methods=["POST"])
@require_auth
@require_owner
def add_pokemon(user_id):
    """Add a new Pokemon to user's collection"""
    data = request.get_json() or {}
    
    required = ["pokemonID", "level"]
    for k in required:
        if k not in data:
            return jsonify({"error": f"Missing field: {k}"}), 400
    
   
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
@require_auth
def update_pokemon(instance_id):
    """Update a Pokemon instance """
    # First check ownership
    try:
        pokemon = svc.get_pokemon_instance(instance_id, enrich=False)
    except Exception:
        return jsonify({"error": "Invalid id"}), 400
    
    if not pokemon:
        return jsonify({"error": "Pokemon not found"}), 404
    
    if pokemon.get("userID") != request.user.get("id"):
        return jsonify({"error": "Access denied - not your Pokemon"}), 403
    
    data = request.get_json() or {}
    
    try:
        updated = svc.update_pokemon_instance(instance_id, data)
    except Exception:
        return jsonify({"error": "Update failed"}), 500
    
    return jsonify({"updated": True}), 200


@app.route("/pokemon/<instance_id>", methods=["DELETE"])
@require_auth
def release_pokemon(instance_id):
    """Release a Pokemon (delete from collection)"""
    try:
        pokemon = svc.get_pokemon_instance(instance_id, enrich=False)
    except Exception:
        return jsonify({"error": "Invalid id"}), 400
    
    if not pokemon:
        return jsonify({"error": "Pokemon not found"}), 404
    
    if pokemon.get("userID") != request.user.get("id"):
        return jsonify({"error": "Access denied - not your Pokemon"}), 403
    
    try:
        deleted = svc.delete_pokemon_instance(instance_id)
    except Exception:
        return jsonify({"error": "Delete failed"}), 500
    
    return jsonify({"deleted": True, "message": "Pokemon released"}), 200


@app.route("/pokemon/user/<int:user_id>/count", methods=["GET"])
@require_auth
@require_owner
def count_user_pokemon(user_id):
    """Get count of Pokemon owned by user"""
    count = svc.count_user_pokemon(user_id)
    return jsonify({"userId": user_id, "count": count}), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5002))
    app.run(host="0.0.0.0", port=port)
