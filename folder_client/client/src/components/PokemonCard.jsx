import React from 'react';
import './PokemonCard.css';

const PokemonCard = ({ pokemon }) => {
  // Pokemon data structure from your backend
  const { 
    id, 
    name, 
    types = [], 
    sprite, 
    pokeApiId,
    baseStats = {},
    height,
    weight,
    abilities = []
  } = pokemon;

  // Format Pokemon number with leading zeros
  const formatNumber = (num) => {
    return `#${String(num || id).padStart(4, '0')}`;
  };

  // Get primary type for background gradient
  const primaryType = types[0]?.toLowerCase() || 'normal';

  // Format stats for display
  const displayStats = {
    hp: baseStats.hp || 0,
    attack: baseStats.attack || 0,
    defense: baseStats.defense || 0,
    speed: baseStats.speed || 0
  };

  return (
    <div className={`pokemon-card pokemon-card--${primaryType}`}>
      <div className="pokemon-card__inner">
        <div className="pokemon-card__header">
          <span className="pokemon-card__number">
            {formatNumber(pokeApiId || id)}
          </span>
        </div>
        
        <div className="pokemon-card__image-container">
          <img 
            src={sprite || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokeApiId || id}.png`}
            alt={name}
            className="pokemon-card__image"
            loading="lazy"
            onError={(e) => {
              // Fallback to regular sprite if official artwork fails
              e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokeApiId || id}.png`;
            }}
          />
        </div>
        
        <div className="pokemon-card__content">
          <h3 className="pokemon-card__name">{name}</h3>
          
          <div className="pokemon-card__types">
            {types.map((type, index) => (
              <span 
                key={index} 
                className={`pokemon-card__type pokemon-card__type--${type.toLowerCase()}`}
              >
                {type}
              </span>
            ))}
          </div>

          {/* Stats Preview */}
          {(displayStats.hp > 0 || displayStats.attack > 0) && (
            <div className="pokemon-card__stats">
              <div className="pokemon-card__stat">
                <span className="stat-label">HP</span>
                <span className="stat-value">{displayStats.hp}</span>
              </div>
              <div className="pokemon-card__stat">
                <span className="stat-label">ATK</span>
                <span className="stat-value">{displayStats.attack}</span>
              </div>
            </div>
          )}

          {/* Physical Info */}
          {(height || weight) && (
            <div className="pokemon-card__physical">
              {height && <span className="physical-info">H: {height/10}m</span>}
              {weight && <span className="physical-info">W: {weight/10}kg</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PokemonCard;
