import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPokemonById, clearSelectedPokemon } from '../redux/pokemonSlice';
import './PokemonDetail.css';

const PokemonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedPokemon, loading, error } = useSelector((state) => state.pokemon);
  const [activeSection, setActiveSection] = useState('overview');
  const [pokemonForms, setPokemonForms] = useState({});
  const [formsLoading, setFormsLoading] = useState({});
  const [movesData, setMovesData] = useState({
    levelUp: [],
    tm: [],
    loading: false
  });
  const [selectedVersion, setSelectedVersion] = useState('sword-shield');

  useEffect(() => {
    if (id) {
      dispatch(fetchPokemonById(id));
      // Reset moves data when switching Pokemon
      setMovesData({
        levelUp: [],
        tm: [],
        loading: false
      });
    }
    
    return () => {
      dispatch(clearSelectedPokemon());
    };
  }, [dispatch, id]);

  // Fetch moves when the moves section is active and Pokemon data is available
  useEffect(() => {
    if (activeSection === 'moves' && selectedPokemon) {
      fetchPokemonMoves(selectedPokemon, selectedVersion);
    }
  }, [activeSection, selectedPokemon?.id, selectedVersion]); // Re-fetch when version changes

  const handleBack = () => {
    navigate(-1);
  };

  const getTypeColor = (type) => {
    const typeColors = {
      normal: '#A8A878',
      fire: '#F08030',
      water: '#6890F0',
      electric: '#F8D030',
      grass: '#78C850',
      ice: '#98D8D8',
      fighting: '#C03028',
      poison: '#A040A0',
      ground: '#E0C068',
      flying: '#A890F0',
      psychic: '#F85888',
      bug: '#A8B820',
      rock: '#B8A038',
      ghost: '#705898',
      dragon: '#7038F8',
      dark: '#705848',
      steel: '#B8B8D0',
      fairy: '#EE99AC'
    };
    return typeColors[type?.toLowerCase()] || '#68A090';
  };

  const formatHeight = (height) => {
    const meters = (height / 10).toFixed(1);
    const feet = Math.floor(height * 3.28084 / 10);
    const inches = Math.round((height * 3.28084 / 10 - feet) * 12);
    return `${meters} m (${feet}'${inches.toString().padStart(2, '0')}")`;
  };

  const formatWeight = (weight) => {
    const kg = (weight / 10).toFixed(1);
    const lbs = (weight * 0.220462 / 10).toFixed(1);
    return `${kg} kg (${lbs} lbs)`;
  };

  const getGenderRatio = (pokemon) => {
    // Mock gender ratio calculation - in real app this would come from API
    const genderless = ['magnemite', 'voltorb', 'staryu', 'ditto'];
    if (genderless.includes(pokemon.name?.toLowerCase())) {
      return { male: 0, female: 0, genderless: true };
    }
    // Default ratio for demo
    return { male: 87.5, female: 12.5, genderless: false };
  };

  const getStatColor = (statValue) => {
    if (statValue >= 100) return '#4CAF50'; // Green for 100+
    if (statValue >= 90) return '#8BC34A';   // Light green for 90-99
    if (statValue >= 50) return '#FFC107';   // Yellow for 50-89
    return '#F44336';                        // Red for below 50
  };

  const getCategoryIcon = (damageClass) => {
    switch (damageClass) {
      case 'physical':
        return '★';
      case 'special':
        return '●';
      case 'status':
        return '—';
      default:
        return '●';
    }
  };

  // Function to fetch and organize Pokemon moves
  const fetchPokemonMoves = async (pokemon, versionFilter = selectedVersion) => {
    console.log('Pokemon data:', pokemon);
    console.log('Version filter:', versionFilter);
    
    if (!pokemon?.moves_detail && !pokemon?.moves) {
      console.log('No moves data found');
      return;
    }
    
    // Try both moves_detail and moves fields
    const movesData = pokemon.moves_detail || pokemon.moves || [];
    console.log('Using moves data:', movesData);
    
    // Don't set loading state, process immediately
    const levelUpMoves = [];
    const tmMoves = [];
    
    try {
      // Process moves with the flattened structure
      for (const moveEntry of movesData) {
        try {
          console.log('Processing move entry:', moveEntry);
          
          // Extract data from the flattened structure
          const moveName = moveEntry.move || moveEntry.name;
          const method = moveEntry.method;
          const level = moveEntry.level;
          const versionGroup = moveEntry.version_group;
          
          console.log(`Move: ${moveName}, Method: ${method}, Level: ${level}, Version: ${versionGroup}`);
          
          // Check if this move is for the selected version
          if (versionGroup !== versionFilter) {
            console.log(`Skipping move ${moveName} - wrong version (${versionGroup} != ${versionFilter})`);
            continue;
          }
          
          // Add to appropriate category based on method
          if (method === 'level-up') {
            levelUpMoves.push({
              name: moveName,
              type: 'normal',
              damageClass: 'physical',
              power: '—',
              accuracy: '—',
              level: level || 1,
              version: versionGroup
            });
            console.log(`Added level-up move: ${moveName} at level ${level}`);
          } else if (method === 'machine') {
            tmMoves.push({
              name: moveName,
              type: 'normal',
              damageClass: 'status',
              power: '—',
              accuracy: '—',
              tm: `TM${String(tmMoves.length + 1).padStart(2, '0')}`,
              version: versionGroup
            });
            console.log(`Added TM move: ${moveName}`);
          }
          
        } catch (moveError) {
          console.error('Error processing move:', moveError);
          continue;
        }
      }
      
      // Sort level-up moves by level, then by name
      levelUpMoves.sort((a, b) => {
        if (a.level !== b.level) return a.level - b.level;
        return a.name.localeCompare(b.name);
      });
      
      // Sort TM moves by name
      tmMoves.sort((a, b) => a.name.localeCompare(b.name));
      
      console.log(`Final moves for ${versionFilter}:`, { levelUp: levelUpMoves.length, tm: tmMoves.length });
      console.log('Level-up moves:', levelUpMoves);
      console.log('TM moves:', tmMoves);
      
      // Set moves data immediately without loading state
      setMovesData({
        levelUp: levelUpMoves,
        tm: tmMoves,
        loading: false
      });
      
    } catch (error) {
      console.error('Error processing moves:', error);
      setMovesData({
        levelUp: [],
        tm: [],
        loading: false
      });
    }
  };

  const getEffectivenessColor = (multiplier) => {
    if (multiplier >= 2) return '#4CAF50';
    if (multiplier === 1) return '#9E9E9E';
    if (multiplier === 0.5) return '#FF9800';
    if (multiplier === 0.25) return '#FF5722';
    if (multiplier === 0) return '#F44336';
    return '#9E9E9E';
  };

  const getEffectivenessText = (multiplier) => {
    if (multiplier >= 2) return 'Super effective';
    if (multiplier === 1) return 'Normal damage';
    if (multiplier === 0.5) return 'Not very effective';
    if (multiplier === 0.25) return 'Quarter damage';
    if (multiplier === 0) return 'No effect';
    return 'Normal';
  };

  const getFormSpriteUrl = (pokemonId, form) => {
    // Use different sources for different form types
    
    if (form.type === 'mega') {
      // For Mega evolutions, use specific Mega sprite URLs
      const megaSpriteMap = {
        '3-mega': 'https://img.pokemondb.net/sprites/home/normal/venusaur-mega.png',
        '6-mega-x': 'https://img.pokemondb.net/sprites/home/normal/charizard-mega-x.png',
        '6-mega-y': 'https://img.pokemondb.net/sprites/home/normal/charizard-mega-y.png',
        '9-mega': 'https://img.pokemondb.net/sprites/home/normal/blastoise-mega.png',
        '65-mega': 'https://img.pokemondb.net/sprites/home/normal/alakazam-mega.png',
        '94-mega': 'https://img.pokemondb.net/sprites/home/normal/gengar-mega.png',
        '150-mega-x': 'https://img.pokemondb.net/sprites/home/normal/mewtwo-mega-x.png',
        '150-mega-y': 'https://img.pokemondb.net/sprites/home/normal/mewtwo-mega-y.png',
        '181-mega': 'https://img.pokemondb.net/sprites/home/normal/ampharos-mega.png',
        '212-mega': 'https://img.pokemondb.net/sprites/home/normal/scizor-mega.png',
        '214-mega': 'https://img.pokemondb.net/sprites/home/normal/heracross-mega.png',
        '248-mega': 'https://img.pokemondb.net/sprites/home/normal/tyranitar-mega.png',
        '282-mega': 'https://img.pokemondb.net/sprites/home/normal/gardevoir-mega.png',
        '303-mega': 'https://img.pokemondb.net/sprites/home/normal/mawile-mega.png',
        '306-mega': 'https://img.pokemondb.net/sprites/home/normal/aggron-mega.png',
        '308-mega': 'https://img.pokemondb.net/sprites/home/normal/medicham-mega.png',
        '310-mega': 'https://img.pokemondb.net/sprites/home/normal/manectric-mega.png',
        '354-mega': 'https://img.pokemondb.net/sprites/home/normal/banette-mega.png',
        '359-mega': 'https://img.pokemondb.net/sprites/home/normal/absol-mega.png',
        '445-mega': 'https://img.pokemondb.net/sprites/home/normal/garchomp-mega.png',
        '448-mega': 'https://img.pokemondb.net/sprites/home/normal/lucario-mega.png',
        '460-mega': 'https://img.pokemondb.net/sprites/home/normal/abomasnow-mega.png'
      };
      
      // Extract the form part correctly (everything after the pokemon name)
      const formPart = form.name.split('-').slice(1).join('-'); // mega-x, mega-y, or mega
      const formKey = `${pokemonId}-${formPart}`;
      return megaSpriteMap[formKey] || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
    }
    
    if (form.type === 'gmax') {
      // For Gigantamax forms, use specific G-Max sprite URLs from multiple sources
      const gmaxSpriteMap = {
        '3-gmax': 'https://www.serebii.net/swordshield/pokemon/003-gi.png',
        '6-gmax': 'https://www.serebii.net/swordshield/pokemon/006-gi.png',
        '9-gmax': 'https://www.serebii.net/swordshield/pokemon/009-gi.png',
        '12-gmax': 'https://www.serebii.net/swordshield/pokemon/012-gi.png', // Butterfree
        '25-gmax': 'https://www.serebii.net/swordshield/pokemon/025-gi.png',
        '52-gmax': 'https://www.serebii.net/swordshield/pokemon/052-gi.png', // Meowth
        '68-gmax': 'https://www.serebii.net/swordshield/pokemon/068-gi.png',
        '94-gmax': 'https://www.serebii.net/swordshield/pokemon/094-gi.png',
        '99-gmax': 'https://www.serebii.net/swordshield/pokemon/099-gi.png', // Kingler
        '131-gmax': 'https://www.serebii.net/swordshield/pokemon/131-gi.png',
        '133-gmax': 'https://www.serebii.net/swordshield/pokemon/133-gi.png',
        '143-gmax': 'https://www.serebii.net/swordshield/pokemon/143-gi.png',
        '569-gmax': 'https://www.serebii.net/swordshield/pokemon/569-gi.png', // Garbodor
        '809-gmax': 'https://www.serebii.net/swordshield/pokemon/809-gi.png', // Melmetal
        '812-gmax': 'https://www.serebii.net/swordshield/pokemon/812-gi.png', // Rillaboom
        '815-gmax': 'https://www.serebii.net/swordshield/pokemon/815-gi.png', // Cinderace
        '818-gmax': 'https://www.serebii.net/swordshield/pokemon/818-gi.png', // Inteleon
        '823-gmax': 'https://www.serebii.net/swordshield/pokemon/823-gi.png', // Corviknight
        '826-gmax': 'https://www.serebii.net/swordshield/pokemon/826-gi.png', // Orbeetle
        '834-gmax': 'https://www.serebii.net/swordshield/pokemon/834-gi.png', // Drednaw
        '839-gmax': 'https://www.serebii.net/swordshield/pokemon/839-gi.png', // Coalossal
        '841-gmax': 'https://www.serebii.net/swordshield/pokemon/841-gi.png', // Flapple
        '842-gmax': 'https://www.serebii.net/swordshield/pokemon/842-gi.png', // Appletun
        '844-gmax': 'https://www.serebii.net/swordshield/pokemon/844-gi.png', // Sandaconda
        '849-gmax': 'https://www.serebii.net/swordshield/pokemon/849-gi.png', // Toxapex (Low Key)
        '851-gmax': 'https://www.serebii.net/swordshield/pokemon/851-gi.png', // Centiskorch
        '858-gmax': 'https://www.serebii.net/swordshield/pokemon/858-gi.png', // Hatterene
        '861-gmax': 'https://www.serebii.net/swordshield/pokemon/861-gi.png', // Grimmsnarl
        '879-gmax': 'https://www.serebii.net/swordshield/pokemon/879-gi.png', // Copperajah
        '884-gmax': 'https://www.serebii.net/swordshield/pokemon/884-gi.png'  // Duraludon
      };
      
      const formKey = `${pokemonId}-gmax`;
      const serebiiUrl = gmaxSpriteMap[formKey];
      
      if (serebiiUrl) {
        return serebiiUrl;
      }
      
      // Fallback to PokemonDB
      const pokemondbMap = {
        '3-gmax': 'https://img.pokemondb.net/sprites/home/normal/venusaur-gmax.png',
        '6-gmax': 'https://img.pokemondb.net/sprites/home/normal/charizard-gmax.png',
        '9-gmax': 'https://img.pokemondb.net/sprites/home/normal/blastoise-gmax.png',
        '12-gmax': 'https://img.pokemondb.net/sprites/home/normal/butterfree-gmax.png',
        '25-gmax': 'https://img.pokemondb.net/sprites/home/normal/pikachu-gmax.png',
        '52-gmax': 'https://img.pokemondb.net/sprites/home/normal/meowth-gmax.png',
        '68-gmax': 'https://img.pokemondb.net/sprites/home/normal/machamp-gmax.png',
        '94-gmax': 'https://img.pokemondb.net/sprites/home/normal/gengar-gmax.png',
        '99-gmax': 'https://img.pokemondb.net/sprites/home/normal/kingler-gmax.png',
        '131-gmax': 'https://img.pokemondb.net/sprites/home/normal/lapras-gmax.png',
        '133-gmax': 'https://img.pokemondb.net/sprites/home/normal/eevee-gmax.png',
        '143-gmax': 'https://img.pokemondb.net/sprites/home/normal/snorlax-gmax.png',
        '569-gmax': 'https://img.pokemondb.net/sprites/home/normal/garbodor-gmax.png',
        '809-gmax': 'https://img.pokemondb.net/sprites/home/normal/melmetal-gmax.png',
        '812-gmax': 'https://img.pokemondb.net/sprites/home/normal/rillaboom-gmax.png',
        '815-gmax': 'https://img.pokemondb.net/sprites/home/normal/cinderace-gmax.png',
        '818-gmax': 'https://img.pokemondb.net/sprites/home/normal/inteleon-gmax.png',
        '823-gmax': 'https://img.pokemondb.net/sprites/home/normal/corviknight-gmax.png',
        '826-gmax': 'https://img.pokemondb.net/sprites/home/normal/orbeetle-gmax.png',
        '834-gmax': 'https://img.pokemondb.net/sprites/home/normal/drednaw-gmax.png',
        '839-gmax': 'https://img.pokemondb.net/sprites/home/normal/coalossal-gmax.png',
        '841-gmax': 'https://img.pokemondb.net/sprites/home/normal/flapple-gmax.png',
        '842-gmax': 'https://img.pokemondb.net/sprites/home/normal/appletun-gmax.png',
        '844-gmax': 'https://img.pokemondb.net/sprites/home/normal/sandaconda-gmax.png',
        '849-gmax': 'https://img.pokemondb.net/sprites/home/normal/toxapex-gmax.png',
        '851-gmax': 'https://img.pokemondb.net/sprites/home/normal/centiskorch-gmax.png',
        '858-gmax': 'https://img.pokemondb.net/sprites/home/normal/hatterene-gmax.png',
        '861-gmax': 'https://img.pokemondb.net/sprites/home/normal/grimmsnarl-gmax.png',
        '879-gmax': 'https://img.pokemondb.net/sprites/home/normal/copperajah-gmax.png',
        '884-gmax': 'https://img.pokemondb.net/sprites/home/normal/duraludon-gmax.png'
      };
      
      return pokemondbMap[formKey] || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
    }
    
    if (form.type === 'regional') {
      // For regional forms, use the original PokeAPI approach but with correct sprite IDs
      const baseUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/';
      const regionalSpriteMap = {
        // Alolan Forms
        '26-alola': '10100', // Alolan Raichu
        '27-alola': '10101', // Alolan Sandshrew
        '28-alola': '10102', // Alolan Sandslash
        '37-alola': '10103', // Alolan Vulpix
        '38-alola': '10104', // Alolan Ninetales
        '50-alola': '10105', // Alolan Diglett
        '51-alola': '10106', // Alolan Dugtrio
        '52-alola': '10107', // Alolan Meowth
        '53-alola': '10108', // Alolan Persian
        '74-alola': '10109', // Alolan Geodude
        '75-alola': '10110', // Alolan Graveler
        '76-alola': '10111', // Alolan Golem
        '88-alola': '10112', // Alolan Grimer
        '89-alola': '10113', // Alolan Muk
        '103-alola': '10114', // Alolan Exeggutor
        '105-alola': '10115', // Alolan Marowak
        
        // Galarian Forms
        '52-galar': '10161', // Galarian Meowth
        '77-galar': '10162', // Galarian Ponyta
        '78-galar': '10163', // Galarian Rapidash
        '79-galar': '10164', // Galarian Slowpoke
        '80-galar': '10165', // Galarian Slowbro
        '83-galar': '10166', // Galarian Farfetch'd
        '110-galar': '10167', // Galarian Weezing
        '122-galar': '10168', // Galarian Mr. Mime
        '144-galar': '10169', // Galarian Articuno
        '145-galar': '10170', // Galarian Zapdos
        '146-galar': '10171' // Galarian Moltres
      };
      
      const formKey = `${pokemonId}-${form.name.split('-').slice(1).join('-')}`;
      const spriteId = regionalSpriteMap[formKey];
      
      if (spriteId) {
        return `${baseUrl}${spriteId}.png`;
      }
    }
    
    // Fallback to regular sprite
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
  };

  const renderEvolutionChain = (pokemon) => {
    if (!pokemon.evolution_chain) {
      return (
        <div className="no-evolution">
          <p>Evolution data not available</p>
        </div>
      );
    }

    // Parse evolution chain data
    const parseEvolutionChain = (chain) => {
      const evolutions = [];
      
      const addEvolution = (evolutionData, level = 0) => {
        const evolution = {
          name: evolutionData.species.name,
          id: evolutionData.species.url.split('/').slice(-2, -1)[0],
          evolution_details: evolutionData.evolution_details || [],
          level: level
        };
        
        evolutions.push(evolution);
        
        // Add all evolved forms at the same level (for branching like Eevee)
        if (evolutionData.evolves_to && evolutionData.evolves_to.length > 0) {
          evolutionData.evolves_to.forEach(evolution => {
            addEvolution(evolution, level + 1);
          });
        }
      };
      
      addEvolution(chain);
      return evolutions;
    };

    const evolutions = parseEvolutionChain(pokemon.evolution_chain.chain);
    
    // Group evolutions by level for branching display
    const evolutionLevels = {};
    evolutions.forEach(evo => {
      if (!evolutionLevels[evo.level]) {
        evolutionLevels[evo.level] = [];
      }
      evolutionLevels[evo.level].push(evo);
    });
    
    const maxLevel = Math.max(...Object.keys(evolutionLevels).map(Number));
    
    // Check for special forms
    const getSpecialForms = async (pokemonName, pokemonId) => {
      const specialForms = [];
      
      try {
        // Fetch Pokemon species data to get varieties/forms
        const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`);
        const speciesData = await speciesResponse.json();
        
        // Check if this Pokemon has varieties (different forms)
        if (speciesData.varieties && speciesData.varieties.length > 1) {
          for (const variety of speciesData.varieties) {
            // Skip the default form
            if (variety.is_default) continue;
            
            try {
              // Fetch detailed data for each variety
              const varietyResponse = await fetch(variety.pokemon.url);
              const varietyData = await varietyResponse.json();
              
              // Determine form type based on the form name
              const formName = varietyData.name;
              let formType = 'other';
              let label = formName.replace(pokemonName.toLowerCase() + '-', '');
              
              console.log(`Processing form: ${formName} for ${pokemonName}`);
              
              if (formName.includes('mega')) {
                formType = 'mega';
                if (formName.includes('mega-x')) {
                  label = 'Mega Evolution X';
                } else if (formName.includes('mega-y')) {
                  label = 'Mega Evolution Y';
                } else {
                  label = 'Mega Evolution';
                }
              } else if (formName.includes('gmax') || formName.includes('gigantamax')) {
                formType = 'gmax';
                label = 'Gigantamax Form';
              } else if (formName.includes('alola')) {
                formType = 'regional';
                label = 'Alolan Form';
              } else if (formName.includes('galar')) {
                formType = 'regional';
                label = 'Galarian Form';
              } else if (formName.includes('hisui')) {
                formType = 'regional';
                label = 'Hisuian Form';
              } else if (formName.includes('paldea')) {
                formType = 'regional';
                label = 'Paldean Form';
              }
              
              console.log(`Form type determined: ${formType}, label: ${label}`);
              
              // Only add special forms we want to display
              if (['mega', 'gmax', 'regional'].includes(formType)) {
                const formData = {
                  name: formName,
                  label: label.charAt(0).toUpperCase() + label.slice(1),
                  type: formType,
                  region: formType === 'regional' ? label.split(' ')[0] : undefined,
                  id: varietyData.id
                };
                console.log(`Adding form:`, formData);
                specialForms.push(formData);
              }
            } catch (error) {
              console.error(`Error fetching variety data for ${variety.pokemon.name}:`, error);
            }
          }
        }
        
        // Also check for forms endpoint (alternative approach)
        try {
          const formsResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}/`);
          const pokemonData = await formsResponse.json();
          
          if (pokemonData.forms && pokemonData.forms.length > 1) {
            for (const form of pokemonData.forms) {
              // Skip if we already have this form
              const formName = form.name;
              if (specialForms.some(f => f.name === formName)) continue;
              
              try {
                const formResponse = await fetch(form.url);
                const formData = await formResponse.json();
                
                // Process additional forms that might not be in varieties
                let formType = 'other';
                let label = formName.replace(pokemonName.toLowerCase() + '-', '');
                
                if (formData.is_mega) {
                  formType = 'mega';
                  label = 'Mega Evolution';
                }
                
                if (['mega', 'gmax', 'regional'].includes(formType)) {
                  specialForms.push({
                    name: formName,
                    label: label.charAt(0).toUpperCase() + label.slice(1),
                    type: formType,
                    region: formType === 'regional' ? label.split(' ')[0] : undefined,
                    sprites: formData.sprites
                  });
                }
              } catch (error) {
                console.error(`Error fetching form data for ${form.name}:`, error);
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching forms for ${pokemonName}:`, error);
        }
        
      } catch (error) {
        console.error(`Error fetching species data for ${pokemonName}:`, error);
        
        // Fallback to hardcoded data if API fails
        const knownSpecialPokemon = {
          'pikachu': [{ type: 'gmax', label: 'Gigantamax Form' }],
          'raichu': [{ type: 'regional', label: 'Alolan Form', region: 'Alola' }],
          'vulpix': [{ type: 'regional', label: 'Alolan Form', region: 'Alola' }],
          'ninetales': [{ type: 'regional', label: 'Alolan Form', region: 'Alola' }],
          'meowth': [
            { type: 'regional', label: 'Alolan Form', region: 'Alola' },
            { type: 'regional', label: 'Galarian Form', region: 'Galar' }
          ],
          'persian': [{ type: 'regional', label: 'Alolan Form', region: 'Alola' }],
          'ponyta': [{ type: 'regional', label: 'Galarian Form', region: 'Galar' }],
          'rapidash': [{ type: 'regional', label: 'Galarian Form', region: 'Galar' }],
          'charizard': [
            { type: 'mega', label: 'Mega Evolution X' },
            { type: 'mega', label: 'Mega Evolution Y' },
            { type: 'gmax', label: 'Gigantamax Form' }
          ],
          'venusaur': [
            { type: 'mega', label: 'Mega Evolution' },
            { type: 'gmax', label: 'Gigantamax Form' }
          ],
          'blastoise': [
            { type: 'mega', label: 'Mega Evolution' },
            { type: 'gmax', label: 'Gigantamax Form' }
          ],
          'gengar': [
            { type: 'mega', label: 'Mega Evolution' },
            { type: 'gmax', label: 'Gigantamax Form' }
          ],
          'machamp': [{ type: 'gmax', label: 'Gigantamax Form' }],
          'lapras': [{ type: 'gmax', label: 'Gigantamax Form' }],
          'eevee': [{ type: 'gmax', label: 'Gigantamax Form' }],
          'snorlax': [{ type: 'gmax', label: 'Gigantamax Form' }]
          // Add more as needed...
        };
        
        console.log(`Using fallback data for ${pokemonName}`);
        const fallbackForms = knownSpecialPokemon[pokemonName.toLowerCase()] || [];
        fallbackForms.forEach(form => {
          const formData = {
            name: `${pokemonName}-${form.type}${form.label.includes('X') ? '-x' : form.label.includes('Y') ? '-y' : ''}`,
            label: form.label,
            type: form.type,
            region: form.region
          };
          console.log(`Adding fallback form:`, formData);
          specialForms.push(formData);
        });
      }
      
      // If we didn't get any forms from API, also check our hardcoded list as a safety net
      if (specialForms.length === 0) {
        console.log(`No forms found via API for ${pokemonName}, checking hardcoded list`);
        const knownSpecialPokemon = {
          'charizard': [
            { type: 'mega', label: 'Mega Evolution X', name: 'charizard-mega-x' },
            { type: 'mega', label: 'Mega Evolution Y', name: 'charizard-mega-y' },
            { type: 'gmax', label: 'Gigantamax Form', name: 'charizard-gmax' }
          ],
          'venusaur': [
            { type: 'mega', label: 'Mega Evolution', name: 'venusaur-mega' },
            { type: 'gmax', label: 'Gigantamax Form', name: 'venusaur-gmax' }
          ],
          'blastoise': [
            { type: 'mega', label: 'Mega Evolution', name: 'blastoise-mega' },
            { type: 'gmax', label: 'Gigantamax Form', name: 'blastoise-gmax' }
          ]
        };
        
        const hardcodedForms = knownSpecialPokemon[pokemonName.toLowerCase()] || [];
        hardcodedForms.forEach(form => {
          specialForms.push(form);
        });
      }
      
      console.log(`Total forms found for ${pokemonName}:`, specialForms);
      return specialForms;
    };
    
    return (
      <div className="evolution-sections">
        {/* Branching Evolution Chain */}
        <div className="evolution-chain">
          {Object.keys(evolutionLevels).map((levelKey, levelIndex) => {
            const level = Number(levelKey);
            const evolutionsAtLevel = evolutionLevels[level];
            
            return (
              <div key={level} className="evolution-level">
                {/* Show arrows from previous level (except for first level) */}
                {level > 0 && (
                  <div className="evolution-arrows">
                    {evolutionsAtLevel.map((evolution, index) => (
                      <div key={`arrow-${evolution.id}`} className="evolution-arrow">
                        <span className="arrow">→</span>
                        {evolution.evolution_details[0] && (
                          <div className="evolution-requirement">
                            {evolution.evolution_details[0].min_level && 
                              `Level ${evolution.evolution_details[0].min_level}`
                            }
                            {evolution.evolution_details[0].item && 
                              evolution.evolution_details[0].item.name.replace(/-/g, ' ')
                            }
                            {evolution.evolution_details[0].trigger.name === 'trade' && 
                              'Trade'
                            }
                            {evolution.evolution_details[0].trigger.name === 'use-item' && 
                              evolution.evolution_details[0].item?.name.replace(/-/g, ' ')
                            }
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Pokemon at this level */}
                <div className={`evolution-stage-group ${evolutionsAtLevel.length > 1 ? 'branching' : ''}`}>
                  {evolutionsAtLevel.map((evolution, index) => (
                    <div key={evolution.id} className="evolution-stage">
                      <div className="evolution-pokemon">
                        <div className="pokemon-image-container">
                          <img 
                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evolution.id}.png`} 
                            alt={evolution.name} 
                            className="pokemon-image"
                          />
                        </div>
                        <div className="pokemon-info">
                          <span className="pokemon-number">#{String(evolution.id).padStart(4, '0')}</span>
                          <span className="pokemon-name">{evolution.name.charAt(0).toUpperCase() + evolution.name.slice(1)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Special Forms Section */}
        {evolutions.map((evolution) => {
          const SpecialFormsComponent = ({ evolution }) => {
            const [specialForms, setSpecialForms] = useState([]);
            const [loading, setLoading] = useState(true);
            
            useEffect(() => {
              const loadForms = async () => {
                setLoading(true);
                try {
                  const forms = await getSpecialForms(evolution.name, evolution.id);
                  setSpecialForms(forms);
                } catch (error) {
                  console.error('Error loading special forms:', error);
                  setSpecialForms([]);
                } finally {
                  setLoading(false);
                }
              };
              
              loadForms();
            }, [evolution.name, evolution.id]);
            
            if (loading) {
              return (
                <div key={`special-${evolution.id}`} className="special-forms-section">
                  <h3 className="special-forms-title">
                    {evolution.name.charAt(0).toUpperCase() + evolution.name.slice(1)} Forms
                  </h3>
                  <div className="loading-forms">Loading forms...</div>
                </div>
              );
            }
            
            if (specialForms.length === 0) return null;
            
            return (
              <div key={`special-${evolution.id}`} className="special-forms-section">
                <h3 className="special-forms-title">
                  {evolution.name.charAt(0).toUpperCase() + evolution.name.slice(1)} Forms
                </h3>
                <div className="special-forms-grid">
                  {specialForms.map((form, formIndex) => (
                    <div key={formIndex} className={`special-form ${form.type}`}>
                      <div className="form-image-container">
                        <img 
                          src={getFormSpriteUrl(evolution.id, form)}
                          alt={form.label} 
                          className="form-image"
                          onError={(e) => {
                            e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evolution.id}.png`;
                          }}
                        />
                        <div className={`form-badge ${form.type}`}>
                          {form.type === 'mega' && '⚡'}
                          {form.type === 'gmax' && '🔥'}
                          {form.type === 'regional' && '🌍'}
                        </div>
                      </div>
                      <div className="form-info">
                        <span className="form-label">{form.label}</span>
                        {form.region && <span className="form-region">{form.region}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          };
          
          return <SpecialFormsComponent key={`special-${evolution.id}`} evolution={evolution} />;
        })}
      </div>
    );
  };

  const getTypeEffectivenessData = (pokemon) => {
    if (!pokemon.type_effectiveness) return [];
    
    // Parse the type_effectiveness if it's a string
    let effectivenessData;
    try {
      effectivenessData = typeof pokemon.type_effectiveness === 'string' 
        ? JSON.parse(pokemon.type_effectiveness)
        : pokemon.type_effectiveness;
    } catch (e) {
      console.error('Error parsing type effectiveness:', e);
      return [];
    }
    
    // Convert multiplier keys to numeric values
    const parseMultiplierKey = (key) => {
      if (key === 'x4') return 4;
      if (key === 'x2') return 2;
      if (key === 'x1') return 1;
      if (key === 'x0_5') return 0.5;
      if (key === 'x0_25') return 0.25;
      if (key === 'x0') return 0;
      return 1;
    };
    
    // Process the data: convert from {multiplier: [types]} to [[type, multiplier]]
    const effectiveness = [];
    
    for (const [multiplierKey, types] of Object.entries(effectivenessData)) {
      const multiplier = parseMultiplierKey(multiplierKey);
      
      // Skip normal effectiveness (1x)
      if (multiplier !== 1) {
        // Add each type with its multiplier
        types.forEach(type => {
          effectiveness.push([type, multiplier]);
        });
      }
    }
    
    // Sort by multiplier (highest first)
    effectiveness.sort(([,a], [,b]) => b - a);
    
    return effectiveness;
  };

  if (loading) {
    return (
      <div className="pokemon-detail">
        <div className="loading">
          <div className="pokeball-spinner"></div>
          <p>Loading Pokémon...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pokemon-detail">
        <div className="error">
          <h2>Pokémon not found</h2>
          <p>{error}</p>
          <button onClick={handleBack} className="back-button">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!selectedPokemon) {
    return (
      <div className="pokemon-detail">
        <div className="error">
          <h2>Pokémon not found</h2>
          <button onClick={handleBack} className="back-button">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const pokemon = selectedPokemon;
  const genderRatio = getGenderRatio(pokemon);

  return (
    <div className="pokemon-detail">
      <div className="detail-header">
        <button onClick={handleBack} className="back-button">
          ← Back
        </button>
        <Link to="/pokemon" className="all-pokemon-link">
          All Pokémon
        </Link>
      </div>

      <div className="pokemon-layout">
        {/* Left Column - Pokemon Image and Basic Info */}
        <div className="pokemon-left">
          <div className="pokemon-image-section">
            <div className="pokemon-image-container">
              <img
                src={pokemon.sprite}
                alt={pokemon.name}
                className="pokemon-image"
              />
            </div>
            <h1 className="pokemon-name">
              {pokemon.name}
            </h1>
          </div>

          {/* Navigation Tabs */}
          <div className="navigation-tabs">
            <button
              className={`nav-tab ${activeSection === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveSection('overview')}
            >
              Overview
            </button>
            <button
              className={`nav-tab ${activeSection === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveSection('stats')}
            >
              Base stats
            </button>
            <button
              className={`nav-tab ${activeSection === 'evolution' ? 'active' : ''}`}
              onClick={() => setActiveSection('evolution')}
            >
              Evolution
            </button>
            <button
              className={`nav-tab ${activeSection === 'moves' ? 'active' : ''}`}
              onClick={() => setActiveSection('moves')}
            >
              Moves
            </button>
          </div>
        </div>

        {/* Right Column - Content */}
        <div className="pokemon-right">
          {activeSection === 'overview' && (
            <div className="overview-content">
              {/* Pokédex Data */}
              <div className="section-group">
                <h2 className="section-title">Pokédex data</h2>
                <div className="data-grid">
                  <div className="data-row">
                    <span className="data-label">National №</span>
                    <span className="data-value">{String(pokemon.pokeApiId).padStart(4, '0')}</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Type</span>
                    <div className="type-badges">
                      {pokemon.types?.map((type, index) => (
                        <span
                          key={index}
                          className="type-badge"
                          style={{ backgroundColor: getTypeColor(type) }}
                        >
                          {type.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Height</span>
                    <span className="data-value">{formatHeight(pokemon.height)}</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Weight</span>
                    <span className="data-value">{formatWeight(pokemon.weight)}</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Abilities</span>
                    <div className="abilities-list">
                      {pokemon.abilities?.slice(0, 2).map((ability, index) => (
                        <span key={index} className="ability-item">
                          {index + 1}. {ability.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          {index === 1 && <span className="hidden-ability">(hidden ability)</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Training */}
              <div className="section-group">
                <h2 className="section-title">Training</h2>
                <div className="data-grid">
                  <div className="data-row">
                    <span className="data-label">EV yield</span>
                    <span className="data-value">
                      {pokemon.ev_yield ? 
                        Object.entries(pokemon.ev_yield)
                          .filter(([stat, value]) => value > 0)
                          .map(([stat, value]) => {
                            const statName = stat === 'special_attack' ? 'Sp. Atk' : 
                                           stat === 'special_defense' ? 'Sp. Def' :
                                           stat.charAt(0).toUpperCase() + stat.slice(1);
                            return `${value} ${statName}`;
                          })
                          .join(', ') || 'None'
                        : '1 Sp. Atk'
                      }
                    </span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Catch rate</span>
                    <span className="data-value">
                      {pokemon.capture_rate || 45} ({((pokemon.capture_rate || 45) / 255 * 100).toFixed(1)}% with PokéBall, full HP)
                    </span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Base Friendship</span>
                    <span className="data-value">{pokemon.base_happiness || 50} (normal)</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Base Exp.</span>
                    <span className="data-value">{pokemon.base_experience || 64}</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Growth Rate</span>
                    <span className="data-value">
                      {pokemon.growth_rate ? 
                        pokemon.growth_rate.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) 
                        : 'Medium Slow'
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Breeding */}
              <div className="section-group">
                <h2 className="section-title">Breeding</h2>
                <div className="data-grid">
                  <div className="data-row">
                    <span className="data-label">Egg Groups</span>
                    <span className="data-value">
                      {pokemon.egg_groups?.length > 0 
                        ? pokemon.egg_groups.map(group => 
                            group.charAt(0).toUpperCase() + group.slice(1)
                          ).join(', ')
                        : 'Unknown'
                      }
                    </span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Gender</span>
                    <div className="gender-ratio">
                      {pokemon.gender_ratio?.genderless || genderRatio.genderless ? (
                        <span className="genderless">Genderless</span>
                      ) : (
                        <>
                          <span className="male-ratio">
                            {pokemon.gender_ratio?.male ?? genderRatio.male}% male
                          </span>
                          <span className="female-ratio">
                            {pokemon.gender_ratio?.female ?? genderRatio.female}% female
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Egg cycles</span>
                    <span className="data-value">
                      {pokemon.egg_cycle || 20} ({Math.floor((pokemon.egg_cycle || 20) * 255)}–{Math.floor((pokemon.egg_cycle || 20) * 255) + 256} steps)
                    </span>
                  </div>
                </div>
              </div>

              {/* Type effectiveness */}
              <div className="section-group">
                <h2 className="section-title">Type effectiveness</h2>
                
                {pokemon.type_effectiveness ? (
                  <div className="type-effectiveness-section">
                    {/* Super Effective (4x damage) */}
                    {getTypeEffectivenessData(pokemon).filter(([,mult]) => mult === 4).length > 0 && (
                      <div className="effectiveness-row">
                        <div className="effectiveness-label takes-4x">Takes 4× damage from</div>
                        <div className="effectiveness-types">
                          {getTypeEffectivenessData(pokemon)
                            .filter(([,mult]) => mult === 4)
                            .map(([type]) => (
                              <span
                                key={type}
                                className="type-badge"
                                style={{ backgroundColor: getTypeColor(type) }}
                              >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Super Effective (2x damage) */}
                    {getTypeEffectivenessData(pokemon).filter(([,mult]) => mult === 2).length > 0 && (
                      <div className="effectiveness-row">
                        <div className="effectiveness-label takes-2x">Takes 2× damage from</div>
                        <div className="effectiveness-types">
                          {getTypeEffectivenessData(pokemon)
                            .filter(([,mult]) => mult === 2)
                            .map(([type]) => (
                              <span
                                key={type}
                                className="type-badge"
                                style={{ backgroundColor: getTypeColor(type) }}
                              >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Normal Effectiveness (1x damage) - Optional, usually not shown */}
                    {getTypeEffectivenessData(pokemon).filter(([,mult]) => mult === 1).length > 0 && (
                      <div className="effectiveness-row">
                        <div className="effectiveness-label takes-1x">Takes 1× damage from</div>
                        <div className="effectiveness-types">
                          {getTypeEffectivenessData(pokemon)
                            .filter(([,mult]) => mult === 1)
                            .map(([type]) => (
                              <span
                                key={type}
                                className="type-badge"
                                style={{ backgroundColor: getTypeColor(type) }}
                              >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Not Very Effective (0.5x damage) */}
                    {getTypeEffectivenessData(pokemon).filter(([,mult]) => mult === 0.5).length > 0 && (
                      <div className="effectiveness-row">
                        <div className="effectiveness-label takes-half">Takes ½× damage from</div>
                        <div className="effectiveness-types">
                          {getTypeEffectivenessData(pokemon)
                            .filter(([,mult]) => mult === 0.5)
                            .map(([type]) => (
                              <span
                                key={type}
                                className="type-badge"
                                style={{ backgroundColor: getTypeColor(type) }}
                              >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Quarter Damage (0.25x damage) */}
                    {getTypeEffectivenessData(pokemon).filter(([,mult]) => mult === 0.25).length > 0 && (
                      <div className="effectiveness-row">
                        <div className="effectiveness-label takes-quarter">Takes ¼× damage from</div>
                        <div className="effectiveness-types">
                          {getTypeEffectivenessData(pokemon)
                            .filter(([,mult]) => mult === 0.25)
                            .map(([type]) => (
                              <span
                                key={type}
                                className="type-badge"
                                style={{ backgroundColor: getTypeColor(type) }}
                              >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* No Effect (0x damage) */}
                    {getTypeEffectivenessData(pokemon).filter(([,mult]) => mult === 0).length > 0 && (
                      <div className="effectiveness-row">
                        <div className="effectiveness-label immune">Takes no damage from</div>
                        <div className="effectiveness-types">
                          {getTypeEffectivenessData(pokemon)
                            .filter(([,mult]) => mult === 0)
                            .map(([type]) => (
                              <span
                                key={type}
                                className="type-badge"
                                style={{ backgroundColor: getTypeColor(type) }}
                              >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="no-effectiveness">
                    <p>No type effectiveness data available</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'stats' && (
            <div className="stats-content">
              <h2 className="section-title">Base stats</h2>
              <div className="stats-table">
                {pokemon.baseStats && Object.entries(pokemon.baseStats).map(([stat, value]) => {
                  const maxStat = 255;
                  const percentage = (value / maxStat) * 100;
                  
                  // Calculate level 100 stat ranges
                  const calculateMinStat = (baseStat) => {
                    if (stat === 'hp') {
                      // HP formula: floor(((2 * baseStat + IV + floor(EV/4)) * Level) / 100) + Level + 10
                      return Math.floor(((2 * baseStat + 0 + 0) * 100) / 100) + 100 + 10;
                    } else {
                      // Other stats: floor((floor(((2 * baseStat + IV + floor(EV/4)) * Level) / 100) + 5) * nature)
                      return Math.floor((Math.floor(((2 * baseStat + 0 + 0) * 100) / 100) + 5) * 0.9);
                    }
                  };
                  
                  const calculateMaxStat = (baseStat) => {
                    if (stat === 'hp') {
                      return Math.floor(((2 * baseStat + 31 + 63) * 100) / 100) + 100 + 10;
                    } else {
                      return Math.floor((Math.floor(((2 * baseStat + 31 + 63) * 100) / 100) + 5) * 1.1);
                    }
                  };
                  
                  const minValue = calculateMinStat(value);
                  const maxValue = calculateMaxStat(value);
                  
                  return (
                    <div key={stat} className="stat-row">
                      <div className="stat-name">
                        {stat === 'hp' ? 'HP' : 
                         stat === 'special_attack' ? 'Special-attack' :
                         stat === 'special_defense' ? 'Special-defense' :
                         stat.charAt(0).toUpperCase() + stat.slice(1)}
                      </div>
                      <div className="stat-value">{value}</div>
                      <div className="stat-bar">
                        <div
                          className="stat-fill"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: getStatColor(value)
                          }}
                        ></div>
                      </div>
                      <div className="stat-range">
                        <span className="stat-min">{minValue}</span>
                        <span className="stat-max">{maxValue}</span>
                      </div>
                    </div>
                  );
                })}
                {pokemon.baseStats && (
                  <div className="stat-row total">
                    <div className="stat-name">Total</div>
                    <div className="stat-value">
                      {Object.values(pokemon.baseStats).reduce((sum, val) => sum + val, 0)}
                    </div>
                    <div className="stat-bar"></div>
                    <div className="stat-range">
                      <span className="range-label">Min</span>
                      <span className="range-label">Max</span>
                    </div>
                  </div>
                )}
              </div>
              <p className="stats-note">
                The ranges shown on the right are for a level 100 Pokémon. Maximum values are based on a beneficial nature, 252 EVs, 31 IVs; minimum values are based on a hindering nature, 0 EVs, 0 IVs.
              </p>
            </div>
          )}

          {activeSection === 'evolution' && (
            <div className="evolution-content">
              <h2 className="section-title">Evolution chart</h2>
              {renderEvolutionChain(pokemon)}
            </div>
          )}

          {activeSection === 'moves' && (
            <div className="moves-content">
              <div className="moves-header-section">
                <h2 className="section-title">Moves learned by {pokemon.name}</h2>
                
                <div className="version-filter">
                  <label htmlFor="version-select">Version:</label>
                  <select 
                    id="version-select"
                    value={selectedVersion} 
                    onChange={(e) => setSelectedVersion(e.target.value)}
                    className="version-dropdown"
                  >
                    <option value="scarlet-violet">Scarlet / Violet</option>
                    <option value="sword-shield">Sword / Shield</option>
                    <option value="ultra-sun-ultra-moon">Ultra Sun / Ultra Moon</option>
                    <option value="sun-moon">Sun / Moon</option>
                    <option value="omega-ruby-alpha-sapphire">Omega Ruby / Alpha Sapphire</option>
                    <option value="x-y">X / Y</option>
                    <option value="black-2-white-2">Black 2 / White 2</option>
                    <option value="black-white">Black / White</option>
                    <option value="heartgold-soulsilver">HeartGold / SoulSilver</option>
                    <option value="platinum">Platinum</option>
                    <option value="diamond-pearl">Diamond / Pearl</option>
                    <option value="emerald">Emerald</option>
                    <option value="ruby-sapphire">Ruby / Sapphire</option>
                    <option value="crystal">Crystal</option>
                    <option value="gold-silver">Gold / Silver</option>
                    <option value="yellow">Yellow</option>
                    <option value="red-blue">Red / Blue</option>
                  </select>
                </div>
              </div>
              
              <div className="moves-section">
                <h3>Moves learnt by level up</h3>
                <div className="moves-table">
                  <div className="moves-header">
                    <span>Lv.</span>
                    <span>Move</span>
                    <span>Type</span>
                    <span>Cat.</span>
                    <span>Power</span>
                    <span>Acc.</span>
                  </div>
                  {movesData.levelUp.length === 0 && !movesData.loading ? (
                    <div className="no-moves">No level-up moves found for this version</div>
                  ) : (
                    movesData.levelUp.map((move, index) => (
                      <div key={index} className="move-row">
                        <span className="move-level">{move.level}</span>
                        <span className="move-name">{move.name.replace(/-/g, ' ')}</span>
                        <span className="move-type" style={{ 
                          backgroundColor: getTypeColor(move.type), 
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          textTransform: 'uppercase'
                        }}>
                          {move.type}
                        </span>
                        <span className="move-category" title={move.damageClass}>
                          {getCategoryIcon(move.damageClass)}
                        </span>
                        <span className="move-power">{move.power}</span>
                        <span className="move-accuracy">{move.accuracy}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="moves-section">
                <h3>Moves learnt by TM</h3>
                <div className="moves-table">
                  <div className="moves-header">
                    <span>TM</span>
                    <span>Move</span>
                    <span>Type</span>
                    <span>Cat.</span>
                    <span>Power</span>
                    <span>Acc.</span>
                  </div>
                  {movesData.tm.length === 0 && !movesData.loading ? (
                    <div className="no-moves">No TM moves found for this version</div>
                  ) : (
                    movesData.tm.map((move, index) => (
                      <div key={index} className="move-row">
                        <span className="move-level">{move.tm}</span>
                        <span className="move-name">{move.name.replace(/-/g, ' ')}</span>
                        <span className="move-type" style={{ 
                          backgroundColor: getTypeColor(move.type), 
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          textTransform: 'uppercase'
                        }}>
                          {move.type}
                        </span>
                        <span className="move-category" title={move.damageClass}>
                          {getCategoryIcon(move.damageClass)}
                        </span>
                        <span className="move-power">{move.power}</span>
                        <span className="move-accuracy">{move.accuracy}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PokemonDetail;
