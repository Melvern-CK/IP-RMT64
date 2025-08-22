const request = require('supertest');
const express = require('express');
const GeminiController = require('../controllers/geminiController');
const { Team, TeamPokemon, Pokemon } = require('../models');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Mock dependencies
jest.mock('../models');
jest.mock('@google/generative-ai');

const app = express();
app.use(express.json());

// Mock auth middleware
const mockAuth = (req, res, next) => {
  req.user = { id: 1, role: 'user' };
  next();
};

// Set up routes for testing
app.post('/gemini/team-recommendation', mockAuth, GeminiController.getTeamRecommendation);
app.post('/gemini/analyze-team/:teamId', mockAuth, GeminiController.analyzeTeam);

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.name === 'NotFound') {
    res.status(404).json({ message: err.message });
  } else if (err.name === 'BadRequest') {
    res.status(400).json({ message: err.message });
  } else if (err.name === 'InternalError') {
    res.status(500).json({ message: err.message });
  } else {
    res.status(500).json({ message: 'Internal server error' });
  }
});

describe('GeminiController', () => {
  let mockModel;
  let mockGenAI;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Gemini AI
    mockModel = {
      generateContent: jest.fn()
    };
    
    mockGenAI = {
      getGenerativeModel: jest.fn().mockReturnValue(mockModel)
    };
    
    GoogleGenerativeAI.mockImplementation(() => mockGenAI);

    // Set environment variable
    process.env.GEMINI_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  describe('getTeamRecommendation', () => {
    const mockPokemonList = [
      {
        id: 1,
        name: 'pikachu',
        pokeApiId: 25,
        types: ['electric'],
        baseStats: {
          hp: 35,
          attack: 55,
          defense: 40,
          'special-attack': 50,
          'special-defense': 50,
          speed: 90
        },
        abilities: ['static', 'lightning-rod']
      },
      {
        id: 2,
        name: 'charizard',
        pokeApiId: 6,
        types: ['fire', 'flying'],
        baseStats: {
          hp: 78,
          attack: 84,
          defense: 78,
          'special-attack': 109,
          'special-defense': 85,
          speed: 100
        },
        abilities: ['blaze', 'solar-power']
      }
    ];

    beforeEach(() => {
      Pokemon.findAll.mockResolvedValue(mockPokemonList);
    });

    it('should successfully generate team recommendation', async () => {
      const mockAIResponse = {
        response: {
          text: () => JSON.stringify({
            recommendedPokemon: [
              {
                name: 'pikachu',
                reason: 'Fast electric type for speed control',
                role: 'Special Attacker'
              },
              {
                name: 'charizard',
                reason: 'Powerful fire type for offensive pressure',
                role: 'Physical Attacker'
              }
            ],
            summary: 'Balanced offensive team',
            analysis: {
              strengths: ['Good speed control', 'Type diversity'],
              weaknesses: ['Weak to rock types'],
              suggestions: ['Add defensive core']
            }
          })
        }
      };

      mockModel.generateContent.mockResolvedValue(mockAIResponse);

      const response = await request(app)
        .post('/gemini/team-recommendation')
        .send({
          prompt: 'I want an offensive team with electric and fire types',
          preferences: {
            types: ['electric', 'fire'],
            battleFormat: 'singles'
          },
          currentTeam: []
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.recommendedPokemon).toHaveLength(2);
      expect(response.body.recommendedPokemon[0].name).toBe('pikachu');
      expect(response.body.recommendedPokemon[0].sprite).toBeDefined();
      expect(response.body.summary).toBeDefined();
      expect(response.body.analysis.strengths).toEqual(['Good speed control', 'Type diversity']);
      expect(mockModel.generateContent).toHaveBeenCalledTimes(1);
    });

    it('should handle missing preferences gracefully', async () => {
      const mockAIResponse = {
        response: {
          text: () => JSON.stringify({
            recommendedPokemon: [
              {
                name: 'pikachu',
                reason: 'Versatile electric type',
                role: 'Special Attacker'
              }
            ],
            summary: 'Balanced team',
            analysis: {
              strengths: ['Well-rounded'],
              weaknesses: ['Needs more Pokemon'],
              suggestions: ['Build full team']
            }
          })
        }
      };

      mockModel.generateContent.mockResolvedValue(mockAIResponse);

      const response = await request(app)
        .post('/gemini/team-recommendation')
        .send({
          prompt: 'Build me a team',
          preferences: {},
          currentTeam: []
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockModel.generateContent).toHaveBeenCalledTimes(1);
    });

    it('should handle missing prompt field', async () => {
      const response = await request(app)
        .post('/gemini/team-recommendation')
        .send({
          preferences: {
            types: ['water'],
            battleFormat: 'doubles'
          },
          currentTeam: []
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Prompt is required');
    });

    it('should handle AI response parsing errors gracefully', async () => {
      const mockAIResponse = {
        response: {
          text: () => 'Invalid JSON response from AI'
        }
      };

      mockModel.generateContent.mockResolvedValue(mockAIResponse);

      const response = await request(app)
        .post('/gemini/team-recommendation')
        .send({
          prompt: 'I want a defensive team',
          preferences: {
            types: ['steel', 'water'],
            battleFormat: 'singles'
          },
          currentTeam: []
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.recommendedPokemon).toEqual([]);
      expect(response.body.summary).toBe('Invalid JSON response from AI');
      expect(response.body.analysis.weaknesses).toEqual(["Analysis could not be parsed properly"]);
    });

    it('should handle database errors', async () => {
      Pokemon.findAll.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .post('/gemini/team-recommendation')
        .send({
          prompt: 'Build me a water team',
          preferences: {
            types: ['water'],
            battleFormat: 'singles'
          },
          currentTeam: []
        });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('AI recommendation service temporarily unavailable');
    });

    it('should handle AI service errors', async () => {
      mockModel.generateContent.mockRejectedValue(new Error('AI service unavailable'));

      const response = await request(app)
        .post('/gemini/team-recommendation')
        .send({
          prompt: 'I need a psychic team',
          preferences: {
            types: ['psychic'],
            battleFormat: 'singles'
          },
          currentTeam: []
        });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('AI recommendation service temporarily unavailable');
    });

    it('should handle empty Pokemon database', async () => {
      Pokemon.findAll.mockResolvedValue([]);

      const mockAIResponse = {
        response: {
          text: () => JSON.stringify({
            recommendedPokemon: [],
            summary: 'No Pokemon available',
            analysis: {
              strengths: [],
              weaknesses: ['Empty database'],
              suggestions: ['Add Pokemon to database']
            }
          })
        }
      };

      mockModel.generateContent.mockResolvedValue(mockAIResponse);

      const response = await request(app)
        .post('/gemini/team-recommendation')
        .send({
          prompt: 'Build me a dragon team',
          preferences: {
            types: ['dragon'],
            battleFormat: 'singles'
          },
          currentTeam: []
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.recommendedPokemon).toEqual([]);
    });

    it('should handle team size limits', async () => {
      const mockAIResponse = {
        response: {
          text: () => JSON.stringify({
            recommendedPokemon: [
              { name: 'pikachu', reason: 'Test', role: 'Attacker' }
            ],
            summary: 'Single Pokemon team',
            analysis: {
              strengths: ['Fast'],
              weaknesses: ['Alone'],
              suggestions: ['Add teammates']
            }
          })
        }
      };

      mockModel.generateContent.mockResolvedValue(mockAIResponse);

      const response = await request(app)
        .post('/gemini/team-recommendation')
        .send({
          prompt: 'I just need one Pokemon',
          preferences: {
            types: ['normal'],
            battleFormat: 'singles'
          },
          currentTeam: []
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('analyzeTeam', () => {
    const mockTeam = {
      id: 1,
      name: 'Test Team',
      userId: 1,
      Pokemons: [
        {
          name: 'pikachu',
          pokeApiId: 25,
          types: ['electric'],
          baseStats: {
            hp: 35,
            attack: 55,
            defense: 40,
            'special-attack': 50,
            'special-defense': 50,
            speed: 90
          },
          abilities: ['static', 'lightning-rod'],
          TeamPokemon: {
            moves: ['thunderbolt', 'quick-attack', 'iron-tail', 'thunder-wave'],
            ability: 'static',
            nature: 'timid'
          }
        },
        {
          name: 'charizard',
          pokeApiId: 6,
          types: ['fire', 'flying'],
          baseStats: {
            hp: 78,
            attack: 84,
            defense: 78,
            'special-attack': 109,
            'special-defense': 85,
            speed: 100
          },
          abilities: ['blaze', 'solar-power'],
          TeamPokemon: {
            moves: ['flamethrower', 'air-slash', 'dragon-pulse', 'solar-beam'],
            ability: 'blaze',
            nature: 'modest'
          }
        }
      ]
    };

    it('should successfully analyze team', async () => {
      Team.findOne.mockResolvedValue(mockTeam);

      const mockAIResponse = {
        response: {
          text: () => JSON.stringify({
            overallRating: "8/10",
            strengths: ["Good type coverage", "Balanced stats", "Solid movesets"],
            weaknesses: ["Weak to rock types", "No defensive core", "Limited support moves"],
            suggestions: ["Add a tank Pokemon", "Consider stealth rock", "Include recovery moves"],
            typeCoverage: {
              strong: ["grass", "bug", "steel"],
              weak: ["rock", "water", "ground"]
            },
            strategy: "Offensive pressure with speed control"
          })
        }
      };

      mockModel.generateContent.mockResolvedValue(mockAIResponse);

      const response = await request(app)
        .post('/gemini/analyze-team/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.teamName).toBe('Test Team');
      expect(response.body.currentPokemon).toHaveLength(2);
      expect(response.body.analysis.strengths).toHaveLength(3);
      expect(response.body.analysis.weaknesses).toHaveLength(3);
      expect(response.body.analysis.suggestions).toHaveLength(3);
      expect(response.body.analysis.overallRating).toBe("8/10");
    });

    it('should handle team not found', async () => {
      Team.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/gemini/analyze-team/999');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Team not found');
    });

    it('should handle empty team', async () => {
      const emptyTeam = {
        ...mockTeam,
        Pokemons: []
      };

      Team.findOne.mockResolvedValue(emptyTeam);

      const response = await request(app)
        .post('/gemini/analyze-team/1');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Team is empty');
    });

    it('should handle AI response parsing errors', async () => {
      Team.findOne.mockResolvedValue(mockTeam);

      const mockAIResponse = {
        response: {
          text: () => 'Invalid JSON from AI service'
        }
      };

      mockModel.generateContent.mockResolvedValue(mockAIResponse);

      const response = await request(app)
        .post('/gemini/analyze-team/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.analysis.strengths).toEqual(["Analysis could not be parsed"]);
      expect(response.body.analysis.weaknesses).toEqual(["Please try again"]);
      expect(response.body.analysis.strategy).toBe('Invalid JSON from AI service');
    });

    it('should handle database errors', async () => {
      Team.findOne.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/gemini/analyze-team/1');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Internal server error');
    });

    it('should handle AI service errors', async () => {
      Team.findOne.mockResolvedValue(mockTeam);
      mockModel.generateContent.mockRejectedValue(new Error('AI service down'));

      const response = await request(app)
        .post('/gemini/analyze-team/1');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Internal server error');
    });

    it('should handle team with incomplete Pokemon data', async () => {
      const incompleteTeam = {
        ...mockTeam,
        Pokemons: [
          {
            name: 'incomplete-pokemon',
            pokeApiId: 1,
            types: ['normal'],
            baseStats: {
              hp: 45,
              attack: 49,
              defense: 49,
              'special-attack': 65,
              'special-defense': 65,
              speed: 45
            },
            abilities: ['overgrow'],
            TeamPokemon: {
              moves: null,
              ability: null,
              nature: null
            }
          }
        ]
      };

      Team.findOne.mockResolvedValue(incompleteTeam);

      const mockAIResponse = {
        response: {
          text: () => JSON.stringify({
            overallRating: "4/10",
            strengths: ["Has potential"],
            weaknesses: ["Incomplete setup", "Missing moves", "No nature set"],
            suggestions: ["Set up moves", "Choose nature", "Select ability"],
            typeCoverage: {
              strong: [],
              weak: ["fighting", "ghost"]
            },
            strategy: "Complete the Pokemon setup first"
          })
        }
      };

      mockModel.generateContent.mockResolvedValue(mockAIResponse);

      const response = await request(app)
        .post('/gemini/analyze-team/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.currentPokemon[0].name).toBe('incomplete-pokemon');
    });

    it('should properly format Pokemon sprites URLs', async () => {
      Team.findOne.mockResolvedValue(mockTeam);

      const mockAIResponse = {
        response: {
          text: () => JSON.stringify({
            overallRating: "7/10",
            strengths: ["Good coverage"],
            weaknesses: ["Needs improvement"],
            suggestions: ["Add support"],
            typeCoverage: { strong: ["grass"], weak: ["rock"] },
            strategy: "Balanced approach"
          })
        }
      };

      mockModel.generateContent.mockResolvedValue(mockAIResponse);

      const response = await request(app)
        .post('/gemini/analyze-team/1');

      expect(response.status).toBe(200);
      expect(response.body.currentPokemon[0].sprite).toBe(
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png'
      );
      expect(response.body.currentPokemon[1].sprite).toBe(
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png'
      );
    });

    it('should handle single Pokemon team', async () => {
      const singlePokemonTeam = {
        ...mockTeam,
        Pokemons: [mockTeam.Pokemons[0]]
      };

      Team.findOne.mockResolvedValue(singlePokemonTeam);

      const mockAIResponse = {
        response: {
          text: () => JSON.stringify({
            overallRating: "5/10",
            strengths: ["Fast Pokemon"],
            weaknesses: ["Only one Pokemon", "No team synergy"],
            suggestions: ["Add more Pokemon", "Build a full team"],
            typeCoverage: {
              strong: ["water", "flying"],
              weak: ["ground", "rock"]
            },
            strategy: "Build a complete team"
          })
        }
      };

      mockModel.generateContent.mockResolvedValue(mockAIResponse);

      const response = await request(app)
        .post('/gemini/analyze-team/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.currentPokemon).toHaveLength(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing GEMINI_API_KEY', async () => {
      delete process.env.GEMINI_API_KEY;
      
      const response = await request(app)
        .post('/gemini/team-recommendation')
        .send({
          prompt: 'Build me a water team',
          preferences: {
            types: ['water'],
            battleFormat: 'singles'
          },
          currentTeam: []
        });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('AI recommendation service temporarily unavailable');
    });

    it('should handle GoogleGenerativeAI initialization errors', async () => {
      GoogleGenerativeAI.mockImplementation(() => {
        throw new Error('API initialization failed');
      });

      const response = await request(app)
        .post('/gemini/team-recommendation')
        .send({
          prompt: 'I want a fire team',
          preferences: {
            types: ['fire'],
            battleFormat: 'singles'
          },
          currentTeam: []
        });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('AI recommendation service temporarily unavailable');
    });
  });
});
