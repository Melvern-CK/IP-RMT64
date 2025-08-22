import React from 'react';
import { Link } from 'react-router-dom';
import './TeamCard.css';

const TeamCard = ({ team, onEdit, onDelete }) => {
  const pokemonCount = team.TeamPokemons?.length || 0;
  
  return (
    <div className="team-card-compact">
      <div className="team-card-header">
        <h3 className="team-name">
          <Link to={`/teams/${team.id}`}>{team.name}</Link>
        </h3>
        <div className="team-actions">
          <button 
            className="edit-btn"
            onClick={() => onEdit(team.id, team.name)}
            title="Edit team name"
          >
            ✏️
          </button>
          <button 
            className="delete-btn"
            onClick={() => onDelete(team.id, team.name)}
            title="Delete team"
          >
            🗑️
          </button>
        </div>
      </div>
      
      <div className="team-summary">
        <span className="pokemon-count">{pokemonCount}/6 Pokemon</span>
        <span className="team-date">
          {new Date(team.createdAt).toLocaleDateString()}
        </span>
      </div>
      
      <div className="pokemon-preview">
        {Array.from({ length: 6 }, (_, index) => {
          const pokemon = team.TeamPokemons?.[index];
          return (
            <div key={index} className={`pokemon-mini ${pokemon ? 'filled' : 'empty'}`}>
              {pokemon ? (
                <img 
                  src={pokemon.Pokemon?.sprite || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.Pokemon?.pokeApiId}.png`} 
                  alt={pokemon.Pokemon?.name}
                  title={pokemon.Pokemon?.name}
                  onError={(e) => {
                    e.target.src = '/pokeball.svg';
                  }}
                />
              ) : (
                <div className="empty-mini">+</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamCard;
