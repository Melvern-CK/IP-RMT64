// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const { Pokemon, sequelize } = require('../models');

async function fetchAllPokemon() {
  let url = 'https://pokeapi.co/api/v2/pokemon?limit=10000&offset=0';
  const response = await fetch(url);
  const data = await response.json();
  const pokemonList = data.results;

  for (const poke of pokemonList) {
    try {
      // Fetch main Pokémon data
      const pokeDetailRes = await fetch(poke.url);
      const pokeDetail = await pokeDetailRes.json();

      // Fetch species data for flavor text and more
      const speciesRes = await fetch(pokeDetail.species.url);
      const speciesData = await speciesRes.json();

      // Fetch evolution chain
      let evolution_chain = null;
      if (speciesData.evolution_chain && speciesData.evolution_chain.url) {
        const evoRes = await fetch(speciesData.evolution_chain.url);
        evolution_chain = await evoRes.json();
      }

      // Prepare flavor text entries (only English)
      const flavor_text_entries = speciesData.flavor_text_entries
        .filter(entry => entry.language.name === 'en')
        .map(entry => ({
          flavor_text: entry.flavor_text,
          version: entry.version.name
        }));

      // Prepare base stats
      const baseStats = {};
      pokeDetail.stats.forEach(stat => {
        baseStats[stat.stat.name] = stat.base_stat;
      });

      // Prepare moves_detail
      const moves_detail = pokeDetail.moves.map(moveObj => {
        return moveObj.version_group_details.map(vgd => ({
          move: moveObj.move.name,
          method: vgd.move_learn_method.name,
          level: vgd.level_learned_at,
          version_group: vgd.version_group.name
        }));
      }).flat();

      // Prepare EV yield
      const ev_yield = {};
      pokeDetail.stats.forEach(stat => {
        if (stat.effort > 0) {
          ev_yield[stat.stat.name] = stat.effort;
        }
      });

      // Prepare gender ratio
      let gender_ratio = null;
      if (speciesData.gender_rate !== undefined && speciesData.gender_rate !== -1) {
        // gender_rate: -1 = genderless, 0 = 100% male, 8 = 100% female
        gender_ratio = {
          female: (speciesData.gender_rate / 8) * 100,
          male: ((8 - speciesData.gender_rate) / 8) * 100
        };
      }

      // Prepare type effectiveness (optional, can be filled later)
      let type_effectiveness = null;

      // Insert or update Pokémon
      await Pokemon.upsert({
        name: pokeDetail.name,
        pokeApiId: pokeDetail.id,
        types: pokeDetail.types.map(t => t.type.name),
        sprite: pokeDetail.sprites.other['official-artwork'].front_default,
        height: pokeDetail.height,
        weight: pokeDetail.weight,
        baseStats,
        abilities: pokeDetail.abilities.map(a => a.ability.name),
        moves: pokeDetail.moves.map(m => m.move.name),
        moves_detail,
        order: pokeDetail.order,
        base_experience: pokeDetail.base_experience,
        is_default: pokeDetail.is_default,
        forms: pokeDetail.forms.map(f => f.name),
        flavor_text_entries,
        evolution_chain,
        habitat: speciesData.habitat ? speciesData.habitat.name : null,
        generation: speciesData.generation ? speciesData.generation.name : null,
        capture_rate: speciesData.capture_rate,
        growth_rate: speciesData.growth_rate ? speciesData.growth_rate.name : null,
        ev_yield,
        base_happiness: speciesData.base_happiness,
        egg_groups: speciesData.egg_groups.map(g => g.name),
        egg_cycle: speciesData.hatch_counter,
        gender_ratio,
        type_effectiveness // can be filled in a later script
      });
      console.log(`Inserted/updated: ${pokeDetail.name}`);
    } catch (err) {
      console.error(`Error processing ${poke.name}:`, err.message);
    }
  }
  await sequelize.close();
  console.log('All Pokémon processed!');
}

fetchAllPokemon();