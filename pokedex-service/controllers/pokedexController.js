const pokedexService = require('../services/pokedexService');

/**
 * GET /pokedex/pokemon
 * List Pokemon with pagination
 */
exports.listPokemon = async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 20, 100); // Max 100
        const offset = parseInt(req.query.offset) || 0;
        
        const result = await pokedexService.getPokemonList(limit, offset);
        res.json(result);
    } catch (err) {
        console.error('Error fetching Pokemon list:', err.message);
        res.status(500).json({ error: 'Failed to fetch Pokemon list' });
    }
};

/**
 * GET /pokedex/pokemon/:id
 * Get Pokemon by Pokedex ID
 */
exports.getPokemonById = async (req, res) => {
    try {
        const { id } = req.params;
        const pokemon = await pokedexService.getPokemonById(id);
        res.json(pokemon);
    } catch (err) {
        if (err.response?.status === 404) {
            return res.status(404).json({ error: 'Pokemon not found' });
        }
        console.error('Error fetching Pokemon:', err.message);
        res.status(500).json({ error: 'Failed to fetch Pokemon' });
    }
};

/**
 * GET /pokedex/pokemon/name/:name
 * Get Pokemon by name
 */
exports.getPokemonByName = async (req, res) => {
    try {
        const { name } = req.params;
        const pokemon = await pokedexService.getPokemonByName(name);
        res.json(pokemon);
    } catch (err) {
        if (err.response?.status === 404) {
            return res.status(404).json({ error: 'Pokemon not found' });
        }
        console.error('Error fetching Pokemon by name:', err.message);
        res.status(500).json({ error: 'Failed to fetch Pokemon' });
    }
};

/**
 * GET /pokedex/pokemon/:id/species
 * Get Pokemon species info (flavor text, capture rate, etc.)
 */
exports.getPokemonSpecies = async (req, res) => {
    try {
        const { id } = req.params;
        const species = await pokedexService.getPokemonSpecies(id);
        res.json(species);
    } catch (err) {
        if (err.response?.status === 404) {
            return res.status(404).json({ error: 'Pokemon species not found' });
        }
        console.error('Error fetching Pokemon species:', err.message);
        res.status(500).json({ error: 'Failed to fetch Pokemon species' });
    }
};

/**
 * GET /pokedex/types
 * List all Pokemon types
 */
exports.listTypes = async (req, res) => {
    try {
        const types = await pokedexService.getTypes();
        res.json({ types });
    } catch (err) {
        console.error('Error fetching types:', err.message);
        res.status(500).json({ error: 'Failed to fetch types' });
    }
};

/**
 * GET /pokedex/types/:type
 * Get all Pokemon of a specific type
 */
exports.getPokemonByType = async (req, res) => {
    try {
        const { type } = req.params;
        const pokemon = await pokedexService.getPokemonByType(type);
        res.json({ 
            type, 
            count: pokemon.length,
            pokemon 
        });
    } catch (err) {
        if (err.response?.status === 404) {
            return res.status(404).json({ error: 'Type not found' });
        }
        console.error('Error fetching Pokemon by type:', err.message);
        res.status(500).json({ error: 'Failed to fetch Pokemon by type' });
    }
};

/**
 * GET /pokedex/random
 * Get a random Pokemon (useful for encounters)
 */
exports.getRandomPokemon = async (req, res) => {
    try {
        // Default to Gen 1 (151), but allow specifying max ID
        const maxId = Math.min(parseInt(req.query.maxId) || 151, 1010);
        const pokemon = await pokedexService.getRandomPokemon(maxId);
        res.json(pokemon);
    } catch (err) {
        console.error('Error fetching random Pokemon:', err.message);
        res.status(500).json({ error: 'Failed to fetch random Pokemon' });
    }
};

/**
 * GET /pokedex/search?q=
 * Search Pokemon by name prefix (case-insensitive)
 */
exports.searchPokemon = async (req, res) => {
    try {
        const q = String(req.query.q || '').trim();
        if (!q) return res.json({ results: [] });
        const limit = Math.min(parseInt(req.query.limit) || 200, 500);
        const results = await pokedexService.searchPokemonByPrefix(q, limit);
        res.json({ count: results.length, results });
    } catch (err) {
        console.error('Error searching Pokemon:', err.message);
        res.status(500).json({ error: 'Failed to search Pokemon' });
    }
};
