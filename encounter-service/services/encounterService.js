import axios from 'axios';
import Encounter from '../models/Encounter.js';
import MinigameAttempt from '../models/MinigameAttempt.js';

const POKEDEX_SERVICE_URL = process.env.POKEDEX_SERVICE_URL || 'http://pokedex-service:3003';
const COLLECTION_SERVICE_URL = process.env.COLLECTION_SERVICE_URL || 'http://collection-service:3004';

// Spawn a new random Pokemon encounter
async function spawnEncounter(userId) {
  // Check if user has an active encounter
  const activeEncounter = await Encounter.findOne({
    where: { userId, status: 'active' }
  });
  
  if (activeEncounter) {
    throw new Error('You already have an active encounter');
  }

  // Get random Pokemon from Pokedex service
  const pokedexResponse = await axios.get(`${POKEDEX_SERVICE_URL}/pokedex/random`);
  const pokemon = pokedexResponse.data;

  // Small chance for shiny (1/100)
  const isShiny = Math.random() < 0.01;

  // Get sprites - pokedex service uses 'front' and 'frontShiny' 
  const sprite = isShiny 
    ? (pokemon.sprites?.frontShiny || pokemon.sprites?.front) 
    : (pokemon.sprites?.front || pokemon.sprites?.front_default);

  const encounter = await Encounter.create({
    userId,
    pokemonId: pokemon.id,
    pokemonName: pokemon.name,
    pokemonSprite: sprite,
    captureRate: pokemon.captureRate || 45,
    isShiny,
    status: 'active',
    maxAttempts: 3,
    attemptsUsed: 0,
    encounteredAt: new Date()
  });

  return {
    encounterId: encounter.id,
    pokemon: {
      id: pokemon.id,
      name: pokemon.name,
      sprite: encounter.pokemonSprite,
      isShiny,
      captureRate: encounter.captureRate
    },
    attemptsRemaining: encounter.maxAttempts
  };
}

// Get active encounter for user
async function getActiveEncounter(userId) {
  const encounter = await Encounter.findOne({
    where: { userId, status: 'active' }
  });
  
  if (!encounter) return null;

  return {
    encounterId: encounter.id,
    pokemon: {
      id: encounter.pokemonId,
      name: encounter.pokemonName,
      sprite: encounter.pokemonSprite,
      isShiny: encounter.isShiny,
      captureRate: encounter.captureRate
    },
    attemptsRemaining: encounter.maxAttempts - encounter.attemptsUsed
  };
}

// Process a catch attempt
async function attemptCatch(userId, encounterId, score) {
  const encounter = await Encounter.findOne({
    where: { id: encounterId, userId, status: 'active' }
  });

  if (!encounter) {
    throw new Error('No active encounter found');
  }

  if (encounter.attemptsUsed >= encounter.maxAttempts) {
    throw new Error('No attempts remaining');
  }

  // Calculate catch success
  // Score of 100 = GUARANTEED catch (player won the minigame)
  // Lower scores have RNG based on score + capture rate
  let success;
  
  if (score >= 100) {
    // Player filled the capture bar completely - guaranteed catch!
    success = true;
  } else {
    // Player failed to fill bar - use score as catch chance
    // Score is 0-99 based on how much progress they had
    const captureRateNormalized = encounter.captureRate / 255; // 0-1
    const scoreNormalized = score / 100; // 0-1
    
    // Combined catch chance (super nerfed - max ~20% instead of ~50%)
    let catchChance = (scoreNormalized * 0.10) + (captureRateNormalized * 0.05);
    catchChance = Math.min(catchChance, 0.2); // hard cap at 20%
    success = Math.random() < catchChance;
  }

  // Record the attempt
  const attemptNumber = encounter.attemptsUsed + 1;
  await MinigameAttempt.create({
    encounterId,
    attemptNumber,
    score,
    success,
    attemptedAt: new Date()
  });

  // Update encounter
  encounter.attemptsUsed = attemptNumber;
  
  if (success) {
    encounter.status = 'caught';
    encounter.completedAt = new Date();
    await encounter.save();

    return {
      success: true,
      caught: true,
      message: `You caught ${encounter.pokemonName}!`,
      pokemon: {
        id: encounter.pokemonId,
        name: encounter.pokemonName,
        sprite: encounter.pokemonSprite,
        isShiny: encounter.isShiny
      },
      encounterId
    };
  }

  // Check if out of attempts
  if (encounter.attemptsUsed >= encounter.maxAttempts) {
    encounter.status = 'fled';
    encounter.completedAt = new Date();
    await encounter.save();

    return {
      success: false,
      caught: false,
      fled: true,
      message: `${encounter.pokemonName} fled!`,
      attemptsRemaining: 0
    };
  }

  await encounter.save();

  return {
    success: false,
    caught: false,
    fled: false,
    message: 'The Pokemon broke free!',
    attemptsRemaining: encounter.maxAttempts - encounter.attemptsUsed
  };
}

// Add caught Pokemon to collection with optional nickname
async function addToCollection(userId, encounterId, nickname, authToken) {
  const encounter = await Encounter.findOne({
    where: { id: encounterId, userId, status: 'caught' }
  });

  if (!encounter) {
    throw new Error('No caught Pokemon found for this encounter');
  }

  // Update nickname if provided
  if (nickname) {
    encounter.nickname = nickname;
    await encounter.save();
  }

  // Add to collection service
  const collectionData = {
    pokemonID: encounter.pokemonId,
    level: Math.floor(Math.random() * 20) + 1, // Random level 1-20
    nickname: nickname || null,
    isShiny: encounter.isShiny,
    experience: 0,
    gender: Math.random() < 0.5 ? 'male' : 'female',
    ability: null,
    heldItem: null
  };

  const response = await axios.post(
    `${COLLECTION_SERVICE_URL}/pokemon/user/${userId}`,
    collectionData,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    }
  );

  return {
    success: true,
    message: nickname 
      ? `${nickname} (${encounter.pokemonName}) was added to your collection!`
      : `${encounter.pokemonName} was added to your collection!`,
    collectionId: response.data.id
  };
}

// Skip/flee from encounter
async function skipEncounter(userId, encounterId) {
  const encounter = await Encounter.findOne({
    where: { id: encounterId, userId, status: 'active' }
  });

  if (!encounter) {
    throw new Error('No active encounter found');
  }

  encounter.status = 'skipped';
  encounter.completedAt = new Date();
  await encounter.save();

  return {
    success: true,
    message: `You ran away from ${encounter.pokemonName}`
  };
}

// Get encounter history for user
async function getEncounterHistory(userId, limit = 20) {
  const encounters = await Encounter.findAll({
    where: { userId },
    order: [['encounteredAt', 'DESC']],
    limit
  });

  return encounters.map(e => ({
    id: e.id,
    pokemonId: e.pokemonId,
    pokemonName: e.pokemonName,
    pokemonSprite: e.pokemonSprite,
    isShiny: e.isShiny,
    status: e.status,
    nickname: e.nickname,
    attemptsUsed: e.attemptsUsed,
    encounteredAt: e.encounteredAt,
    completedAt: e.completedAt
  }));
}

// Get encounter stats for user
async function getEncounterStats(userId) {
  const total = await Encounter.count({ where: { userId } });
  const caught = await Encounter.count({ where: { userId, status: 'caught' } });
  const fled = await Encounter.count({ where: { userId, status: 'fled' } });
  const skipped = await Encounter.count({ where: { userId, status: 'skipped' } });
  const shinies = await Encounter.count({ where: { userId, status: 'caught', isShiny: true } });

  return {
    total,
    caught,
    fled,
    skipped,
    shinies,
    catchRate: total > 0 ? Math.round((caught / total) * 100) : 0
  };
}

export {
  spawnEncounter,
  getActiveEncounter,
  attemptCatch,
  addToCollection,
  skipEncounter,
  getEncounterHistory,
  getEncounterStats
};
