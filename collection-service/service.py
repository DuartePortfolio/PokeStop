from pymongo import MongoClient
from bson.objectid import ObjectId
import os
import requests
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "pokestop_collection_db")
POKEDEX_SERVICE_URL = os.environ.get("POKEDEX_SERVICE_URL", "http://pokedex-service:3003")


class CollectionService:
    def __init__(self):
        self.client = MongoClient(MONGO_URI)
        self.db = self.client[DB_NAME]
        self.pokemon_instances = self.db["pokemonInstances"]

    # ============ Pokemon Instances ============
    def get_user_pokemon(self, user_id: int, enrich: bool = True):
        """Get all Pokemon owned by a user"""
        pokemon_list = list(self.pokemon_instances.find({"userID": user_id}))
        
        if enrich:
            for pokemon in pokemon_list:
                pokemon["_id"] = str(pokemon["_id"])
                pokedex_data = self._get_pokedex_data(pokemon.get("pokemonID"))
                if pokedex_data:
                    pokemon["pokedexData"] = pokedex_data
        
        return pokemon_list

    def get_pokemon_instance(self, instance_id: str, enrich: bool = True):
        """Get a specific Pokemon instance by ID"""
        oid = ObjectId(instance_id)
        pokemon = self.pokemon_instances.find_one({"_id": oid})
        
        if pokemon and enrich:
            pokemon["_id"] = str(pokemon["_id"])
            pokedex_data = self._get_pokedex_data(pokemon.get("pokemonID"))
            if pokedex_data:
                pokemon["pokedexData"] = pokedex_data
        
        return pokemon

    def add_pokemon_to_user(self, user_id: int, pokemon_data: dict):
        """Add a new Pokemon to user's collection"""
        pokemon_data["userID"] = user_id
        res = self.pokemon_instances.insert_one(pokemon_data)
        return res.inserted_id

    def update_pokemon_instance(self, instance_id: str, updates: dict):
        """Update a Pokemon instance (nickname, held item, etc.)"""
        oid = ObjectId(instance_id)
        # Prevent updating critical fields
        protected_fields = ["userID", "pokemonID", "_id"]
        for field in protected_fields:
            updates.pop(field, None)
        
        res = self.pokemon_instances.update_one({"_id": oid}, {"$set": updates})
        return res.matched_count > 0

    def delete_pokemon_instance(self, instance_id: str):
        """Release a Pokemon (delete from collection)"""
        oid = ObjectId(instance_id)
        res = self.pokemon_instances.delete_one({"_id": oid})
        return res.deleted_count > 0

    def count_user_pokemon(self, user_id: int):
        """Count total Pokemon owned by user"""
        return self.pokemon_instances.count_documents({"userID": user_id})

    def _get_pokedex_data(self, pokemon_id: int):
        """Fetch Pokemon data from Pokedex service"""
        if not pokemon_id:
            return None
        
        try:
            response = requests.get(
                f"{POKEDEX_SERVICE_URL}/pokedex/pokemon/{pokemon_id}",
                timeout=5
            )
            if response.status_code == 200:
                data = response.json()
                # Return only essential display data
                return {
                    "name": data.get("name"),
                    "types": data.get("types"),
                    "sprites": data.get("sprites"),
                    "baseStats": data.get("stats")
                }
        except requests.RequestException as e:
            print(f"Failed to fetch pokedex data for Pokemon {pokemon_id}: {e}")
        
        return None

