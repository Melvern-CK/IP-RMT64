import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import Swal from 'sweetalert2';
import './TeamDetail.css';

function TeamDetail() {
  const { teamId } = useParams();
  const [team, setTeam] = useState(null);
  const [allPokemon, setAllPokemon] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPokemonModal, setShowPokemonModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    fetchTeamDetail();
    fetchAllPokemon();
  }, [isLoggedIn, teamId, navigate]);

  const fetchTeamDetail = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`http://localhost:3000/teams/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(response);
      
      setTeam(response.data);
    } catch (error) {
      console.error('Error fetching team detail:', error);
      if (error.response?.status === 404) {
        Swal.fire({
          icon: 'error',
          title: 'Team Not Found',
          text: 'This team does not exist or you do not have permission to view it'
        }).then(() => navigate('/teams'));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPokemon = async () => {
    try {
      const response = await axios.get('http://localhost:3000/pokemon');
      setAllPokemon(response.data);
    } catch (error) {
      console.error('Error fetching Pokemon:', error);
    }
  };

  const addPokemonToTeam = async (pokemonId, slot) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`http://localhost:3000/teams/${teamId}/pokemon`, {
        pokemonId,
        slot
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Swal.fire({
        icon: 'success',
        title: 'Pokemon Added!',
        text: 'Pokemon has been added to your team',
        timer: 2000,
        showConfirmButton: false
      });

      setShowPokemonModal(false);
      setSelectedSlot(null);
      fetchTeamDetail();
    } catch (error) {
      console.error('Error adding Pokemon:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to add Pokemon to team'
      });
    }
  };

  const removePokemonFromTeam = async (pokemonId) => {
    const result = await Swal.fire({
      title: 'Remove Pokemon?',
      text: 'Are you sure you want to remove this Pokemon from your team?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove it!'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('access_token');
        await axios.delete(`http://localhost:3000/teams/${teamId}/pokemon/${pokemonId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        Swal.fire({
          icon: 'success',
          title: 'Removed!',
          text: 'Pokemon has been removed from your team',
          timer: 2000,
          showConfirmButton: false
        });

        fetchTeamDetail();
      } catch (error) {
        console.error('Error removing Pokemon:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to remove Pokemon from team'
        });
      }
    }
  };

  const openPokemonSelector = (slot) => {
    setSelectedSlot(slot);
    setShowPokemonModal(true);
    setSearchTerm('');
  };

  const filteredPokemon = allPokemon.filter(pokemon =>
    pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="team-detail-container">
        <div className="loading">
          <div className="pokeball-spinner"></div>
          <p>Loading team details...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="team-detail-container">
        <div className="error-message">
          <h2>Team not found</h2>
          <button onClick={() => navigate('/teams')}>Back to Teams</button>
        </div>
      </div>
    );
  }

  return (
    <div className="team-detail-container">
      <div className="team-detail-header">
        <button className="back-btn" onClick={() => navigate('/teams')}>
          ← Back to Teams
        </button>
        <h1>{team.name}</h1>
        <div className="team-stats">
          <span>{team.Pokemons?.length || 0}/6 Pokemon</span>
        </div>
      </div>

      <div className="team-slots-container">
        <h2>Team Roster</h2>
        <div className="team-slots-grid">
          {Array.from({ length: 6 }, (_, index) => {
            const slot = index + 1;
            const teamPokemon = team.Pokemons?.find(tp => tp.slot === slot);
            
            return (
              <div key={slot} className={`team-slot ${teamPokemon ? 'filled' : 'empty'}`}>
                <div className="slot-header">
                  <span className="slot-number">Slot {slot}</span>
                  {teamPokemon && (
                    <button 
                      className="remove-btn"
                      onClick={() => removePokemonFromTeam(teamPokemon.Pokemon.id)}
                      title="Remove Pokemon"
                    >
                      ✕
                    </button>
                  )}
                </div>
                
                {teamPokemon ? (
                  <div className="pokemon-info">
                    <img 
                      src={teamPokemon.Pokemon?.sprite || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${teamPokemon.Pokemon?.pokeApiId}.png`} 
                      alt={teamPokemon.Pokemon?.name}
                      className="pokemon-sprite"
                      onError={(e) => {
                        console.log('Sprite failed to load for:', teamPokemon.Pokemon?.name, 'URL:', e.target.src);
                        e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${teamPokemon.Pokemon?.pokeApiId}.png`;
                        e.target.onerror = (e2) => {
                          console.log('Fallback sprite also failed for:', teamPokemon.Pokemon?.name);
                          e2.target.style.display = 'none';
                        };
                      }}
                      onLoad={() => console.log('Sprite loaded successfully for:', teamPokemon.Pokemon?.name)}
                    />
                    <h3>{teamPokemon.Pokemon?.name}</h3>
                    <div className="pokemon-details">
                      <p><strong>Level:</strong> {teamPokemon.level || 50}</p>
                      {teamPokemon.ability && <p><strong>Ability:</strong> {teamPokemon.ability}</p>}
                      {teamPokemon.nature && <p><strong>Nature:</strong> {teamPokemon.nature}</p>}
                      {teamPokemon.moves && (
                        <div className="moves-list">
                          <strong>Moves:</strong>
                          <ul>
                            {(Array.isArray(teamPokemon.moves) 
                              ? teamPokemon.moves 
                              : teamPokemon.moves.split(',').map(m => m.trim())
                            ).map((move, idx) => (
                              <li key={idx}>{move}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <button 
                      className="edit-pokemon-btn"
                      onClick={() => editPokemonDetails(teamPokemon)}
                    >
                      Edit Details
                    </button>
                  </div>
                ) : (
                  <div className="empty-slot-content">
                    <div className="empty-pokeball">⚪</div>
                    <p>Empty Slot</p>
                    <button 
                      className="add-pokemon-btn"
                      onClick={() => openPokemonSelector(slot)}
                    >
                      Add Pokemon
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pokemon Selection Modal */}
      {showPokemonModal && (
        <div className="modal-overlay" onClick={() => setShowPokemonModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Select Pokemon for Slot {selectedSlot}</h2>
              <button 
                className="close-btn"
                onClick={() => setShowPokemonModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="search-container">
              <input
                type="text"
                placeholder="Search Pokemon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="pokemon-grid">
              {filteredPokemon.slice(0, 50).map(pokemon => (
                <div 
                  key={pokemon.id}
                  className="pokemon-option"
                  onClick={() => addPokemonToTeam(pokemon.id, selectedSlot)}
                >
                  <img src={pokemon.sprite || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokeApiId}.png`} alt={pokemon.name} />
                  <span>{pokemon.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  async function editPokemonDetails(teamPokemon) {
    const pokemon = teamPokemon.Pokemon;
    
    // Nature list for competitive Pokemon
    const natures = [
      'Adamant', 'Bashful', 'Bold', 'Brave', 'Calm', 'Careful', 'Docile', 'Gentle', 'Hardy',
      'Hasty', 'Impish', 'Jolly', 'Lax', 'Lonely', 'Mild', 'Modest', 'Naive', 'Naughty',
      'Quiet', 'Quirky', 'Rash', 'Relaxed', 'Sassy', 'Serious', 'Timid'
    ];

    // Create options HTML for abilities
    const abilities = Array.isArray(pokemon.abilities) ? pokemon.abilities : [];
    const abilityOptions = abilities.length > 0 
      ? abilities.map(ability => 
          `<option value="${ability}" ${teamPokemon.ability === ability ? 'selected' : ''}>${ability}</option>`
        ).join('')
      : '<option value="">No abilities available</option>';

    // Create options HTML for natures
    const natureOptions = natures.map(nature => 
      `<option value="${nature}" ${teamPokemon.nature === nature ? 'selected' : ''}>${nature}</option>`
    ).join('');

    // Create options HTML for moves (limit to 4 selections)
    const moves = Array.isArray(pokemon.moves) ? pokemon.moves : [];
    const moveOptions = moves.length > 0 
      ? moves.map(move => 
          `<option value="${move}">${move}</option>`
        ).join('')
      : '<option value="">No moves available</option>';

    // Get current moves as array
    const currentMoves = teamPokemon.moves 
      ? (Array.isArray(teamPokemon.moves) 
          ? teamPokemon.moves 
          : teamPokemon.moves.split(',').map(m => m.trim())
        )
      : [];

    const { value: formValues } = await Swal.fire({
      title: `Edit ${pokemon.name}`,
      html: `
        <div style="text-align: left; max-width: 400px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Level:</label>
          <input id="level" class="swal2-input" type="text" value="50" readonly style="background-color: #f5f5f5; cursor: not-allowed;">
          
          <label style="display: block; margin-bottom: 5px; margin-top: 15px; font-weight: bold;">Ability:</label>
          <select id="ability" class="swal2-select" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
            <option value="">Select Ability</option>
            ${abilityOptions}
          </select>
          
          <label style="display: block; margin-bottom: 5px; margin-top: 15px; font-weight: bold;">Nature:</label>
          <select id="nature" class="swal2-select" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
            <option value="">Select Nature</option>
            ${natureOptions}
          </select>
          
          <label style="display: block; margin-bottom: 5px; margin-top: 15px; font-weight: bold;">Moves (Select up to 4):</label>
          <div style="margin-bottom: 10px;">
            <select id="move1" class="swal2-select" style="width: 100%; padding: 8px; margin-bottom: 5px; border: 1px solid #ddd; border-radius: 3px;">
              <option value="">Select Move 1</option>
              ${moveOptions}
            </select>
            <select id="move2" class="swal2-select" style="width: 100%; padding: 8px; margin-bottom: 5px; border: 1px solid #ddd; border-radius: 3px;">
              <option value="">Select Move 2</option>
              ${moveOptions}
            </select>
            <select id="move3" class="swal2-select" style="width: 100%; padding: 8px; margin-bottom: 5px; border: 1px solid #ddd; border-radius: 3px;">
              <option value="">Select Move 3</option>
              ${moveOptions}
            </select>
            <select id="move4" class="swal2-select" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 3px;">
              <option value="">Select Move 4</option>
              ${moveOptions}
            </select>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Update',
      cancelButtonText: 'Cancel',
      didOpen: () => {
        // Set current moves in the dropdowns
        currentMoves.forEach((move, index) => {
          const moveSelect = document.getElementById(`move${index + 1}`);
          if (moveSelect && move) {
            moveSelect.value = move;
          }
        });
      },
      preConfirm: () => {
        const moves = [
          document.getElementById('move1').value,
          document.getElementById('move2').value,
          document.getElementById('move3').value,
          document.getElementById('move4').value
        ].filter(move => move !== '').join(', ');

        return {
          level: 50, // Always 50
          ability: document.getElementById('ability').value,
          nature: document.getElementById('nature').value,
          moves: moves
        }
      }
    });

    if (formValues) {
      try {
        const token = localStorage.getItem('access_token');
        await axios.patch(`http://localhost:3000/teams/${teamId}/pokemon/${teamPokemon.Pokemon.id}`, {
          ability: formValues.ability,
          nature: formValues.nature,
          moves: formValues.moves
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Pokemon details have been updated',
          timer: 2000,
          showConfirmButton: false
        });

        fetchTeamDetail();
      } catch (error) {
        console.error('Error updating Pokemon:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to update Pokemon details'
        });
      }
    }
  }
}

export default TeamDetail;
