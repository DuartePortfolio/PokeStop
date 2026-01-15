const axios = require('axios');

const POKEAPI_BASE = 'https://pokeapi.co/api/v2';
const cache = new Map(); // Simple in-memory cache
const CACHE_TTL = 3600000; // 1 hour in ms

// feito por AI para puxar dados da pokeapi
async function getPokemonList(limit = 20, offset = 0) {
    const cacheKey = `list-${limit}-${offset}`;
    if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
    }

    const response = await axios.get(`${POKEAPI_BASE}/pokemon?limit=${limit}&offset=${offset}`);
    const result = {
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
        pokemon: response.data.results.map((p, i) => ({
            id: offset + i + 1,
            name: p.name,
            url: p.url,
            sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${offset + i + 1}.png`
        }))
    };
    
    cache.set(cacheKey, result);
    setTimeout(() => cache.delete(cacheKey), CACHE_TTL);
    return result;
}


async function getPokemonById(id) {
    const cacheKey = `pokemon-${id}`;
    if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
    }

    const response = await axios.get(`${POKEAPI_BASE}/pokemon/${id}`);
    const pokemon = formatPokemon(response.data);
    
    cache.set(cacheKey, pokemon);
    setTimeout(() => cache.delete(cacheKey), CACHE_TTL);
    return pokemon;
}

async function getPokemonByName(name) {
    return getPokemonById(name.toLowerCase());
}


async function getTypes() {
    const cacheKey = 'types';
    if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
    }

    const response = await axios.get(`${POKEAPI_BASE}/type`);
    const types = response.data.results
        .map(t => t.name)
        .filter(t => t !== 'unknown' && t !== 'shadow'); // Filter out non-standard types
    
    cache.set(cacheKey, types);
    setTimeout(() => cache.delete(cacheKey), CACHE_TTL);
    return types;
}


async function getPokemonByType(type) {
    const cacheKey = `type-${type}`;
    if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
    }

    const response = await axios.get(`${POKEAPI_BASE}/type/${type}`);
    const pokemon = response.data.pokemon.map(p => {
        // Extract ID from URL
        const urlParts = p.pokemon.url.split('/');
        const id = parseInt(urlParts[urlParts.length - 2]);
        return {
            id,
            name: p.pokemon.name,
            sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
        };
    });
    
    cache.set(cacheKey, pokemon);
    setTimeout(() => cache.delete(cacheKey), CACHE_TTL);
    return pokemon;
}


async function getPokemonSpecies(id) {
    const cacheKey = `species-${id}`;
    if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
    }

    const response = await axios.get(`${POKEAPI_BASE}/pokemon-species/${id}`);
    const species = {
        id: response.data.id,
        name: response.data.name,
        color: response.data.color?.name,
        habitat: response.data.habitat?.name,
        generation: response.data.generation?.name,
        isLegendary: response.data.is_legendary,
        isMythical: response.data.is_mythical,
        captureRate: response.data.capture_rate,
        baseHappiness: response.data.base_happiness,
        flavorText: response.data.flavor_text_entries
            .find(f => f.language.name === 'en')?.flavor_text
            .replace(/\n|\f/g, ' ') || null,
        genus: response.data.genera
            .find(g => g.language.name === 'en')?.genus || null
    };
    
    cache.set(cacheKey, species);
    setTimeout(() => cache.delete(cacheKey), CACHE_TTL);
    return species;
}


async function getRandomPokemon(maxId = 151) {
    const randomId = Math.floor(Math.random() * maxId) + 1;
    return getPokemonById(randomId);
}


function formatPokemon(data) {
    return {
        id: data.id,
        name: data.name,
        height: data.height / 10, // Convert to meters
        weight: data.weight / 10, // Convert to kg
        baseExperience: data.base_experience,
        types: data.types.map(t => t.type.name),
        stats: {
            hp: data.stats.find(s => s.stat.name === 'hp')?.base_stat || 0,
            attack: data.stats.find(s => s.stat.name === 'attack')?.base_stat || 0,
            defense: data.stats.find(s => s.stat.name === 'defense')?.base_stat || 0,
            spAttack: data.stats.find(s => s.stat.name === 'special-attack')?.base_stat || 0,
            spDefense: data.stats.find(s => s.stat.name === 'special-defense')?.base_stat || 0,
            speed: data.stats.find(s => s.stat.name === 'speed')?.base_stat || 0
        },
        abilities: data.abilities.map(a => ({
            name: a.ability.name,
            isHidden: a.is_hidden
        })),
        sprites: {
            front: data.sprites.front_default,
            back: data.sprites.back_default,
            frontShiny: data.sprites.front_shiny,
            backShiny: data.sprites.back_shiny,
            artwork: data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default
        },
        moves: data.moves.slice(0, 50).map(m => ({
            name: m.move.name,
            learnMethod: m.version_group_details[0]?.move_learn_method?.name || 'unknown',
            levelLearned: m.version_group_details[0]?.level_learned_at || 0
        }))
    };
}

/**
 * Clear the cache
 */
function clearCache() {
    cache.clear();
}

module.exports = {
    getPokemonList,
    getPokemonById,
    getPokemonByName,
    getTypes,
    getPokemonByType,
    getPokemonSpecies,
    getRandomPokemon,
    clearCache
};
