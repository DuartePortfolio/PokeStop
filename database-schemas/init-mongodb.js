#!/usr/bin/env node

/**
 * MongoDB Initialization Script for PokeStop Collection Service
 * 
 * This script initializes all collections and loads sample data
 * It is called by the MongoDB Docker container on startup
 * 
 * Collections:
 * - pokemonInstances: User's collected Pokemon with stats
 * - pokemonMoves: Moves learned by Pokemon instances
 * - casinoTrades: Pokemon trade records
 * - evolutionHistory: Pokemon evolution history
 */

const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://root:enter@localhost:27017';
const DB_NAME = 'pokestop_collection_db';

// Sample data
const pokemonInstances = [
  {
    "_id": { "$oid": "696513e4749f784380bf5325" },
    "userID": 1,
    "pokemonID": 25,
    "nickname": "Sparky",
    "level": 35,
    "experience": 4200,
    "hp": 95,
    "attack": 55,
    "defense": 40,
    "spAttack": 50,
    "spDefense": 50,
    "speed": 90,
    "isShiny": false,
    "gender": "male",
    "ability": "Static",
    "heldItem": "Light Ball",
    "obtainedAt": new Date("2025-11-20T14:30:00.000Z")
  },
  {
    "_id": { "$oid": "69651498749f784380bf5329" },
    "userID": 1,
    "pokemonID": 1,
    "nickname": "Tiny",
    "level": 20,
    "experience": 1500,
    "hp": 50,
    "attack": 52,
    "defense": 43,
    "spAttack": 60,
    "spDefense": 50,
    "speed": 65,
    "isShiny": false,
    "gender": "female",
    "ability": "Overgrow",
    "heldItem": null,
    "obtainedAt": new Date("2025-10-15T10:00:00.000Z")
  },
  {
    "_id": { "$oid": "6965149f749f784380bf532b" },
    "userID": 1,
    "pokemonID": 7,
    "nickname": "Shellby",
    "level": 22,
    "experience": 1800,
    "hp": 44,
    "attack": 48,
    "defense": 65,
    "spAttack": 50,
    "spDefense": 64,
    "speed": 43,
    "isShiny": false,
    "gender": "male",
    "ability": "Torrent",
    "heldItem": "Mystic Water",
    "obtainedAt": new Date("2025-11-01T09:00:00.000Z")
  },
  {
    "_id": { "$oid": "696514ba749f784380bf532c" },
    "userID": 1,
    "pokemonID": 4,
    "nickname": null,
    "level": 18,
    "experience": 1200,
    "hp": 39,
    "attack": 52,
    "defense": 43,
    "spAttack": 60,
    "spDefense": 50,
    "speed": 65,
    "isShiny": true,
    "gender": "male",
    "ability": "Blaze",
    "heldItem": null,
    "obtainedAt": new Date("2025-09-12T12:00:00.000Z")
  },
  {
    "_id": { "$oid": "696514c1749f784380bf532d" },
    "userID": 1,
    "pokemonID": 133,
    "nickname": "Eeveeon",
    "level": 30,
    "experience": 3500,
    "hp": 55,
    "attack": 55,
    "defense": 50,
    "spAttack": 45,
    "spDefense": 65,
    "speed": 55,
    "isShiny": false,
    "gender": "female",
    "ability": "Run Away",
    "heldItem": "Eviolite",
    "obtainedAt": new Date("2025-11-05T16:00:00.000Z")
  },
  {
    "_id": { "$oid": "696514c7749f784380bf532e" },
    "userID": 1,
    "pokemonID": 150,
    "nickname": "Mewtwo",
    "level": 50,
    "experience": 12500,
    "hp": 106,
    "attack": 110,
    "defense": 90,
    "spAttack": 154,
    "spDefense": 90,
    "speed": 130,
    "isShiny": false,
    "gender": "male",
    "ability": "Pressure",
    "heldItem": null,
    "obtainedAt": new Date("2025-12-01T20:00:00.000Z")
  }
];

const pokemonMoves = [
  {
    "_id": { "$oid": "6965142c749f784380bf5327" },
    "pokemonInstanceId": { "$oid": "696513e4749f784380bf5325" },
    "moveName": "Thunderbolt",
    "moveType": "Electric",
    "power": 90,
    "accuracy": 100,
    "slot": 1
  }
];

const casinoTrades = [
  {
    "_id": { "$oid": "69651527749f784380bf532f" },
    "userId": 1,
    "givenPokemon": [
      {
        "pokemonInstanceId": { "$oid": "696513e4749f784380bf5325" },
        "pokemonId": 25,
        "level": 35,
        "nickname": "Sparky",
        "isShiny": false,
        "stats": {
          "hp": 95,
          "attack": 55,
          "defense": 40,
          "spAttack": 50,
          "spDefense": 50,
          "speed": 90
        }
      }
    ],
    "receivedPokemon": [
      {
        "pokemonId": 26,
        "level": 36,
        "nickname": "Raichu",
        "isShiny": false,
        "stats": {
          "hp": 60,
          "attack": 100,
          "defense": 55,
          "spAttack": 90,
          "spDefense": 80,
          "speed": 110
        }
      }
    ],
    "tradedAt": new Date("2025-12-10T15:30:00.000Z")
  }
];

const evolutionHistory = [
  {
    "_id": { "$oid": "69651440749f784380bf5328" },
    "pokemonInstanceId": { "$oid": "6965142c749f784380bf5327" },
    "fromPokemonId": 172,
    "toPokemonId": 25,
    "evolvedAt": new Date("2025-12-01T10:00:00.000Z"),
    "evolutionMethod": "level_up"
  }
];

async function initializeDatabase() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log('✓ Connected to MongoDB');

    const db = client.db(DB_NAME);

    // Create collections and insert data
    const collections = [
      { name: 'pokemonInstances', data: pokemonInstances },
      { name: 'pokemonMoves', data: pokemonMoves },
      { name: 'casinoTrades', data: casinoTrades },
      { name: 'evolutionHistory', data: evolutionHistory }
    ];

    for (const collection of collections) {
      try {
        // Check if collection already exists
        const collectionList = await db.listCollections({ name: collection.name }).toArray();
        
        if (collectionList.length > 0) {
          console.log(`✓ Collection '${collection.name}' already exists`);
          // Check if it has data
          const count = await db.collection(collection.name).countDocuments();
          if (count === 0) {
            console.log(`  → Inserting ${collection.data.length} documents into '${collection.name}'`);
            await db.collection(collection.name).insertMany(collection.data);
          } else {
            console.log(`  → Collection already has ${count} documents`);
          }
        } else {
          console.log(`✓ Creating collection '${collection.name}' with ${collection.data.length} documents`);
          await db.collection(collection.name).insertMany(collection.data);
        }
      } catch (err) {
        console.error(`✗ Error with collection '${collection.name}':`, err.message);
      }
    }

    // Create indexes for better query performance
    await db.collection('pokemonInstances').createIndex({ userID: 1 });
    await db.collection('pokemonInstances').createIndex({ pokemonID: 1 });
    await db.collection('pokemonMoves').createIndex({ pokemonInstanceId: 1 });
    await db.collection('casinoTrades').createIndex({ userId: 1 });
    await db.collection('casinoTrades').createIndex({ tradedAt: -1 });
    await db.collection('evolutionHistory').createIndex({ pokemonInstanceId: 1 });

    console.log('✓ Database indexes created');
    console.log('✓ MongoDB initialization complete!');
  } catch (err) {
    console.error('✗ Error during database initialization:', err);
    process.exit(1);
  } finally {
    await client.close();
    process.exit(0);
  }
}

// Run initialization
initializeDatabase();
