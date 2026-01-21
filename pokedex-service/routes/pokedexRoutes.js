const express = require("express");
const router = express.Router();
const pokedexController = require("../controllers/pokedexController");

// Pokemon endpoints
router.get("/pokemon", pokedexController.listPokemon);
router.get("/pokemon/name/:name", pokedexController.getPokemonByName);
router.get("/pokemon/:id", pokedexController.getPokemonById);
router.get("/pokemon/:id/species", pokedexController.getPokemonSpecies);

// Type endpoints
router.get("/types", pokedexController.listTypes);
router.get("/types/:type", pokedexController.getPokemonByType);

// Utility endpoints (for other services)
router.get("/random", pokedexController.getRandomPokemon);
router.get("/search", pokedexController.searchPokemon);

module.exports = router;