import express from "express";
import * as pokedexController from "../controllers/pokedexController.js";
const router = express.Router();

// Pokemon endpoints
// NOTE: More specific routes must come before generic ones
router.get("/pokemon", pokedexController.listPokemon);
router.get("/pokemon/name/:name", pokedexController.getPokemonByName);
router.get("/pokemon/:id/species", pokedexController.getPokemonSpecies);
router.get("/pokemon/:id", pokedexController.getPokemonById);

// Type endpoints
router.get("/types", pokedexController.listTypes);
router.get("/types/:type", pokedexController.getPokemonByType);

// Utility endpoints (for other services)
router.get("/random", pokedexController.getRandomPokemon);
router.get("/search", pokedexController.searchPokemon);

export default router;