import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllPokemon, searchPokemon, clearSearchResults, clearError, setGeneration } from '../redux/pokemonSlice';
import PokemonCard from '../components/PokemonCard';
import './AllPokemon.css';

const AllPokemon = () => {
  const dispatch = useDispatch();
  const { 
    list, 
    searchResults, 
    loading, 
    searchLoading, 
    error, 
    searchError,
    selectedGeneration
  } = useSelector((state) => state.pokemon);

  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Fetch all Pokemon on component mount
  useEffect(() => {
    dispatch(fetchAllPokemon(selectedGeneration));
  }, [dispatch, selectedGeneration]);

  // Handle generation filter
  const handleGenerationFilter = (generation) => {
    dispatch(setGeneration(generation));
    setIsSearching(false);
    setSearchTerm('');
    dispatch(clearSearchResults());
  };

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setIsSearching(true);
      await dispatch(searchPokemon(searchTerm.trim()));
    } else {
      handleClearSearch();
    }
  };

  // Clear search results
  const handleClearSearch = () => {
    setSearchTerm('');
    setIsSearching(false);
    dispatch(clearSearchResults());
  };

  // Clear all filters
  const handleClearAllFilters = () => {
    setSearchTerm('');
    setIsSearching(false);
    dispatch(setGeneration(null));
    dispatch(clearSearchResults());
  };

  // Clear errors
  const handleClearError = () => {
    dispatch(clearError());
  };

  // Determine which Pokemon list to display
  const pokemonToDisplay = isSearching ? searchResults : list;
  const currentLoading = isSearching ? searchLoading : loading;
  const currentError = isSearching ? searchError : error;

  return (
    <div className="all-pokemon">
      <div className="container">
        <header className="all-pokemon__header">
          <h1 className="all-pokemon__title">Pokémon Collection</h1>
          <p className="all-pokemon__subtitle">
            Discover and explore the world of Pokémon
          </p>
        </header>

        {/* Search Section */}
        <div className="all-pokemon__search">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-group">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Pokémon by name..."
                className="search-input"
              />
              <button 
                type="submit" 
                className="search-btn"
                disabled={searchLoading}
              >
                {searchLoading ? '🔍' : '🔍'}
              </button>
            </div>
          </form>
          
          {isSearching && (
            <button 
              onClick={handleClearSearch}
              className="clear-search-btn"
            >
              Clear Search
            </button>
          )}
        </div>

        {/* Generation Filter */}
        <div className="generation-filter">
          <h3 className="filter-title">Filter by Generation</h3>
          <div className="generation-buttons">
            <button 
              onClick={() => handleGenerationFilter(null)}
              className={`gen-btn ${selectedGeneration === null ? 'active' : ''}`}
            >
              All
            </button>
            {["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix"].map(gen => (
              <button 
                key={gen}
                onClick={() => handleGenerationFilter(gen)}
                className={`gen-btn ${selectedGeneration === gen ? 'active' : ''}`}
              >
                Gen {gen}
              </button>
            ))}
          </div>
          {(selectedGeneration || isSearching) && (
            <button 
              onClick={handleClearAllFilters}
              className="clear-all-btn"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Results Info */}
        {isSearching && searchResults.length > 0 && (
          <div className="search-results-info">
            Found {searchResults.length} Pokémon matching "{searchTerm}"
          </div>
        )}
        
        {!isSearching && selectedGeneration && list.length > 0 && (
          <div className="search-results-info">
            Showing {list.length} Pokémon from Generation {selectedGeneration}
          </div>
        )}

        {/* Error Message */}
        {currentError && (
          <div className="error-message">
            <p>{currentError}</p>
            <div className="error-actions">
              <button onClick={() => dispatch(fetchAllPokemon())} className="retry-btn">
                🔄 Retry
              </button>
              <button onClick={handleClearError} className="error-close-btn">
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {currentLoading && (
          <div className="loading-container">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading Pokémon...</p>
            </div>
          </div>
        )}

        {/* No Results */}
        {!currentLoading && pokemonToDisplay.length === 0 && !currentError && (
          <div className="no-results">
            <div className="no-results-content">
              <p>
                {isSearching 
                  ? `No Pokémon found matching "${searchTerm}"` 
                  : 'No Pokémon available'
                }
              </p>
              {isSearching && (
                <button onClick={handleClearSearch} className="try-again-btn">
                  View All Pokémon
                </button>
              )}
            </div>
          </div>
        )}

        {/* Pokemon Grid */}
        {!currentLoading && pokemonToDisplay.length > 0 && (
          <div className="pokemon-grid">
            {pokemonToDisplay.map((pokemon) => (
              <PokemonCard 
                key={pokemon.id} 
                pokemon={{
                  id: pokemon.id,
                  name: pokemon.name,
                  number: pokemon.pokeApiId || pokemon.id,
                  types: pokemon.types || [],
                  sprite: pokemon.sprite
                }}
              />
            ))}
          </div>
        )}

        {/* Stats */}
        {!currentLoading && !isSearching && list.length > 0 && (
          <div className="pokemon-stats">
            <p>Total Pokémon: {list.length}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllPokemon;