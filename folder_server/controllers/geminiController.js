const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Pokemon } = require('../models');

class GeminiController {
  static async getTeamRecommendation(req, res, next) {
    try {
      const { prompt, preferences = {}, currentTeam = [] } = req.body;
      
      if (!prompt) {
        throw { name: 'BadRequest', message: 'Prompt is required' };
      }

      // Initialize Gemini AI
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Get all available Pokemon from database
      const allPokemon = await Pokemon.findAll({
        attributes: ['id', 'name', 'pokeApiId', 'types', 'baseStats', 'abilities', 'generation']
      });

      // Create a simplified Pokemon list for the AI
      const pokemonList = allPokemon.map(p => ({
        id: p.id,
        name: p.name,
        types: p.types,
        baseStats: p.baseStats,
        abilities: p.abilities,
        generation: p.generation
      }));

      // Build the AI prompt
      const aiPrompt = `
You are a Pokemon team building expert. Based on the user's request and available Pokemon data, recommend a balanced team of up to 6 Pokemon.

User Request: "${prompt}"

User Preferences:
- Preferred Types: ${preferences.types ? preferences.types.join(', ') : 'Any'}
- Preferred Generation: ${preferences.generation || 'Any'}
- Battle Format: ${preferences.battleFormat || 'General'}

Current Team: ${currentTeam.length > 0 ? currentTeam.map(p => p.name).join(', ') : 'Empty'}

Available Pokemon (sample): ${pokemonList.slice(0, 50).map(p => `${p.name} (${p.types.join('/')})`).join(', ')}...

Please provide a team recommendation with analysis. Format your response as JSON:
{
  "recommendedPokemon": [
    {
      "name": "pokemon_name",
      "role": "role_description",
      "reason": "why_chosen"
    }
  ],
  "summary": "overall_team_strategy_and_synergy",
  "analysis": {
    "strengths": ["strength1", "strength2", "strength3"],
    "weaknesses": ["weakness1", "weakness2", "weakness3"],
    "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
  }
}

Make sure all Pokemon names exactly match those in the available list.
`;

      // Generate recommendation
      const result = await model.generateContent(aiPrompt);
      const response = result.response;
      const text = response.text();

      // Parse the JSON response
      let aiRecommendation;
      try {
        // Extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiRecommendation = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        // If JSON parsing fails, create a structured response from the text
        aiRecommendation = {
          recommendedPokemon: [],
          summary: text,
          analysis: {
            strengths: ["Please refer to the detailed explanation above"],
            weaknesses: ["Analysis could not be parsed properly"],
            suggestions: ["Try rephrasing your request"]
          }
        };
      }

      // Validate and enrich recommendations with database data
      const enrichedRecommendations = [];
      
      for (const rec of (aiRecommendation.recommendedPokemon || [])) {
        const pokemon = allPokemon.find(p => 
          p.name.toLowerCase() === rec.name.toLowerCase()
        );
        
        if (pokemon) {
          enrichedRecommendations.push({
            name: pokemon.name,
            sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokeApiId}.png`,
            types: pokemon.types,
            role: rec.role,
            reason: rec.reason,
            pokemon: {
              id: pokemon.id,
              name: pokemon.name,
              pokeApiId: pokemon.pokeApiId,
              types: pokemon.types,
              baseStats: pokemon.baseStats,
              abilities: pokemon.abilities
            }
          });
        }
      }

      res.json({
        success: true,
        prompt: prompt,
        recommendedPokemon: enrichedRecommendations,
        summary: aiRecommendation.summary || "Team recommendation generated successfully",
        analysis: aiRecommendation.analysis || {
          strengths: ["Balanced team composition"],
          weaknesses: ["Analysis pending"],
          suggestions: ["Consider training and movesets"]
        },
        rawResponse: text
      });

    } catch (err) {
      console.error('Gemini AI Error:', err);
      if (err.name === 'BadRequest') {
        next(err);
      } else {
        next({ 
          name: 'InternalError', 
          message: 'AI recommendation service temporarily unavailable' 
        });
      }
    }
  }

  static async analyzeTeam(req, res, next) {
    try {
      const { teamId } = req.params;
      const userId = req.user.id;

      // Get team with Pokemon details
      const { Team, TeamPokemon } = require('../models');
      const team = await Team.findOne({
        where: { id: teamId, userId },
        include: [{ 
          model: Pokemon,
          through: { model: TeamPokemon }
        }]
      });

      if (!team) {
        throw { name: 'NotFound', message: 'Team not found' };
      }

      if (team.Pokemons.length === 0) {
        throw { name: 'BadRequest', message: 'Team is empty' };
      }

      // Initialize Gemini AI
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Prepare team data for analysis
      const teamData = team.Pokemons.map(p => ({
        name: p.name,
        types: p.types,
        baseStats: p.baseStats,
        abilities: p.abilities,
        moves: p.TeamPokemon.moves,
        ability: p.TeamPokemon.ability,
        nature: p.TeamPokemon.nature
      }));

      const aiPrompt = `
Analyze this Pokemon team and provide comprehensive feedback:

Team Name: ${team.name}
Pokemon:
${teamData.map((p, i) => `
${i + 1}. ${p.name}
   - Types: ${p.types.join('/')}
   - Base Stats: HP:${p.baseStats.hp} ATK:${p.baseStats.attack} DEF:${p.baseStats.defense} SpA:${p.baseStats['special-attack']} SpD:${p.baseStats['special-defense']} SPD:${p.baseStats.speed}
   - Abilities: ${p.abilities.join(', ')}
   - Current Ability: ${p.ability || 'Not set'}
   - Nature: ${p.nature || 'Not set'}
   - Moves: ${p.moves ? p.moves.join(', ') : 'Not set'}
`).join('')}

Please analyze this team and provide comprehensive feedback.

Format as JSON:
{
  "overallRating": "score_out_of_10",
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "typeCoverage": {
    "strong": ["types_covered_well"],
    "weak": ["types_poorly_covered"]
  },
  "strategy": "recommended_battle_strategy"
}
`;

      const result = await model.generateContent(aiPrompt);
      const response = result.response;
      const text = response.text();

      // Parse the JSON response
      let analysis;
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        analysis = {
          overallRating: "N/A",
          strengths: ["Analysis could not be parsed"],
          weaknesses: ["Please try again"],
          suggestions: ["Refer to the detailed explanation"],
          typeCoverage: { strong: [], weak: [] },
          strategy: text
        };
      }

      // Prepare current Pokemon data for frontend
      const currentPokemon = teamData.map(p => ({
        name: p.name,
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${team.Pokemons.find(pokemon => pokemon.name === p.name).pokeApiId}.png`,
        types: p.types
      }));

      res.json({
        success: true,
        teamName: team.name,
        currentPokemon: currentPokemon,
        analysis: {
          strengths: analysis.strengths || [],
          weaknesses: analysis.weaknesses || [],
          suggestions: analysis.suggestions || [],
          typeCoverage: analysis.typeCoverage,
          strategy: analysis.strategy,
          overallRating: analysis.overallRating
        },
        rawResponse: text
      });

    } catch (err) {
      console.error('Team Analysis Error:', err);
      next(err);
    }
  }
}

module.exports = GeminiController;
