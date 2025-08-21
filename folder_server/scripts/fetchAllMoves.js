const { Move, sequelize } = require('../models');

async function fetchAllMoves() {
  // Truncate table and restart ID sequence
  await Move.truncate({ restartIdentity: true });
  console.log('Cleared Moves table and reset ID sequence');
  
  let url = 'https://pokeapi.co/api/v2/move?limit=10000&offset=0';
  const response = await fetch(url);
  const data = await response.json();
  const moveList = data.results;

  for (const move of moveList) {
    try {
      const moveRes = await fetch(move.url);
      const moveDetail = await moveRes.json();
      const name = moveDetail.name;
      const type = moveDetail.damage_class ? moveDetail.damage_class.name : null;
      const moveType = moveDetail.type ? moveDetail.type.name : null;
      const power = moveDetail.power;
      const accuracy = moveDetail.accuracy;
      if (!type) continue; // skip moves with no type (should be rare)
      await Move.upsert({ name, type, moveType, power, accuracy });
      console.log(`Inserted/updated: ${name} (${type}) - ${moveType} type, Power: ${power}, Accuracy: ${accuracy}`);
    } catch (err) {
      console.error(`Error processing ${move.name}:`, err.message);
    }
  }
  await sequelize.close();
  console.log('All moves processed!');
}

fetchAllMoves();
