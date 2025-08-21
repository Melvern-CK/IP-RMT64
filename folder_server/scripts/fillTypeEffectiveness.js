const { Pokemon, sequelize } = require('../models');

// Type effectiveness chart - defending type vs attacking type
// 0 = no effect, 0.5 = not very effective, 1 = normal damage, 2 = super effective
const TYPE_EFFECTIVENESS = {
  normal: {
    rock: 0.5, ghost: 0, steel: 0.5
  },
  fire: {
    fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2
  },
  water: {
    fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5
  },
  electric: {
    water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5
  },
  grass: {
    fire: 0.5, water: 2, grass: 0.5, poison: 0.5, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5, ground: 2
  },
  ice: {
    fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5
  },
  fighting: {
    normal: 2, ice: 2, poison: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, flying: 0.5, fairy: 0.5
  },
  poison: {
    grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2
  },
  ground: {
    fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2
  },
  flying: {
    electric: 0.5, grass: 2, ice: 0.5, fighting: 2, bug: 2, rock: 0.5, steel: 0.5
  },
  psychic: {
    fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5
  },
  bug: {
    fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5
  },
  rock: {
    fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5
  },
    ghost: {
      normal: 0, psychic: 2, ghost: 2, dark: 0.5
  },
  dragon: {
    dragon: 2, steel: 0.5, fairy: 0
  },
  dark: {
    fighting: 0.5, psychic: 2, bug: 0.5, ghost: 2, dark: 0.5, fairy: 0.5
  },
  steel: {
    fire: 0.5, water: 0.5, electric: 0.5, grass: 1, ice: 2, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 2, ghost: 1, dragon: 1, dark: 1, steel: 0.5, fairy: 2
  },
  fairy: {
    fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5
  }
};

// Calculate type effectiveness for a Pokemon based on its types
function calculateTypeEffectiveness(pokemonTypes) {
  // This function will return an object with multipliers for each attacking type
  // and a summary object for x4, x2, x1, x0.5, x0.25, x0
  const allTypes = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];
  const effectiveness = {};
  allTypes.forEach(attackingType => {
    let multiplier = 1;
    pokemonTypes.forEach(defendingType => {
      // Use attackingType as the key, defendingType as the value
      if (TYPE_EFFECTIVENESS[attackingType] && TYPE_EFFECTIVENESS[attackingType][defendingType] !== undefined) {
        multiplier *= TYPE_EFFECTIVENESS[attackingType][defendingType];
      }
    });
    effectiveness[attackingType] = multiplier;
  });

  // Build summary for x4, x2, x1, x0.5, x0.25, x0
  const summary = {
    x4: [],
    x2: [],
    x1: [],
    x0_5: [],
    x0_25: [],
    x0: []
  };
  for (const [type, mult] of Object.entries(effectiveness)) {
    if (mult === 4) summary.x4.push(type);
    else if (mult === 2) summary.x2.push(type);
    else if (mult === 1) summary.x1.push(type);
    else if (mult === 0.5) summary.x0_5.push(type);
    else if (mult === 0.25) summary.x0_25.push(type);
    else if (mult === 0) summary.x0.push(type);
  }
  return { effectiveness, summary };
}

async function fillTypeEffectiveness() {
  try {
    console.log('Starting type effectiveness calculation...');
    
    // Get all Pokemon with NULL type_effectiveness
    const pokemon = await Pokemon.findAll({
      where: {
        type_effectiveness: null
      }
    });

    console.log(`Found ${pokemon.length} Pokemon with missing type effectiveness data`);

    for (let i = 0; i < pokemon.length; i++) {
      const poke = pokemon[i];
      
      if (poke.types && poke.types.length > 0) {
        const { summary } = calculateTypeEffectiveness(poke.types);
        const typeEffectiveness = {
          x4: summary.x4 || [],
          x2: summary.x2 || [],
          x1: summary.x1 || [],
          x0_5: summary.x0_5 || [],
          x0_25: summary.x0_25 || [],
          x0: summary.x0 || []
        };
        await poke.update({
          type_effectiveness: JSON.stringify(typeEffectiveness)
        });
        console.log(`Updated ${poke.name} (${i + 1}/${pokemon.length}) - 4x: ${typeEffectiveness.x4.join(', ')} | 2x: ${typeEffectiveness.x2.join(', ')} | 0.5x: ${typeEffectiveness.x0_5.join(', ')} | 0.25x: ${typeEffectiveness.x0_25.join(', ')} | 0x: ${typeEffectiveness.x0.join(', ')}`);
      } else {
        console.log(`Skipping ${poke.name} - No types data`);
      }
    }

    console.log('Type effectiveness calculation completed!');
  } catch (error) {
    console.error('Error filling type effectiveness:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the script
fillTypeEffectiveness();
