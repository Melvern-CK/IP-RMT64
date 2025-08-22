import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './AIRecommendation.css';

const AIRecommendation = () => {
    const { isLoggedIn } = useAuth();
    const [prompt, setPrompt] = useState('');
    const [teamId, setTeamId] = useState('');
    const [recommendation, setRecommendation] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('recommendation');

    const getTeamRecommendation = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt for team recommendation');
            return;
        }

        setLoading(true);
        setError('');
        
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('http://localhost:3000/ai/recommend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ prompt })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to get recommendation');
            }

            setRecommendation(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const analyzeTeam = async () => {
        if (!teamId.trim()) {
            setError('Please enter a team ID for analysis');
            return;
        }

        setLoading(true);
        setError('');
        
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`http://localhost:3000/ai/analyze/${teamId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to analyze team');
            }

            setAnalysis(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ai-recommendation-container">
            <h1>AI Pokemon Team Assistant</h1>
            
            <div className="tabs">
                <button 
                    className={`tab ${activeTab === 'recommendation' ? 'active' : ''}`}
                    onClick={() => setActiveTab('recommendation')}
                >
                    Team Recommendation
                </button>
                <button 
                    className={`tab ${activeTab === 'analysis' ? 'active' : ''}`}
                    onClick={() => setActiveTab('analysis')}
                >
                    Team Analysis
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {activeTab === 'recommendation' && (
                <div className="recommendation-section">
                    <h2>Get AI Team Recommendation</h2>
                    <p>Describe what kind of Pokemon team you want, and our AI will recommend the perfect team for you!</p>
                    
                    <div className="input-group">
                        <label htmlFor="prompt">Team Description:</label>
                        <textarea
                            id="prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., 'I want a balanced team for competitive battles with good type coverage' or 'Create a team focused on speed and offense'"
                            rows="4"
                            disabled={loading}
                        />
                    </div>

                    <button 
                        onClick={getTeamRecommendation}
                        disabled={loading || !prompt.trim()}
                        className="ai-button"
                    >
                        {loading ? 'Getting Recommendation...' : 'Get AI Recommendation'}
                    </button>

                    {recommendation && (
                        <div className="recommendation-result">
                            <h3>AI Recommendation</h3>
                            <div className="recommendation-content">
                                <div className="recommendation-summary">
                                    <h4>Team Strategy</h4>
                                    <p>{recommendation.summary}</p>
                                </div>
                                
                                <div className="recommended-pokemon">
                                    <h4>Recommended Pokemon</h4>
                                    <div className="pokemon-grid">
                                        {recommendation.recommendedPokemon && recommendation.recommendedPokemon.length > 0 ? (
                                            recommendation.recommendedPokemon.map((pokemon, index) => (
                                                <div key={index} className="pokemon-recommendation-card">
                                                    <img 
                                                        src={pokemon.sprite} 
                                                        alt={pokemon.name}
                                                        onError={(e) => {
                                                            e.target.src = '/pokeball.svg';
                                                        }}
                                                    />
                                                    <p>{pokemon.name}</p>
                                                    <p className="pokemon-types">
                                                        {pokemon.types && pokemon.types.join(', ')}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <p>No recommendations available.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="team-analysis">
                                    <h4>Team Analysis</h4>
                                    <div className="analysis-grid">
                                        <div className="analysis-item">
                                            <strong>Strengths:</strong>
                                            <ul>
                                                {recommendation.analysis && recommendation.analysis.strengths && recommendation.analysis.strengths.length > 0 ? (
                                                    recommendation.analysis.strengths.map((strength, index) => (
                                                        <li key={index}>{strength}</li>
                                                    ))
                                                ) : (
                                                    <li>No strengths analysis available.</li>
                                                )}
                                            </ul>
                                        </div>
                                        <div className="analysis-item">
                                            <strong>Weaknesses:</strong>
                                            <ul>
                                                {recommendation.analysis && recommendation.analysis.weaknesses && recommendation.analysis.weaknesses.length > 0 ? (
                                                    recommendation.analysis.weaknesses.map((weakness, index) => (
                                                        <li key={index}>{weakness}</li>
                                                    ))
                                                ) : (
                                                    <li>No weaknesses analysis available.</li>
                                                )}
                                            </ul>
                                        </div>
                                        <div className="analysis-item">
                                            <strong>Suggestions:</strong>
                                            <ul>
                                                {recommendation.analysis && recommendation.analysis.suggestions && recommendation.analysis.suggestions.length > 0 ? (
                                                    recommendation.analysis.suggestions.map((suggestion, index) => (
                                                        <li key={index}>{suggestion}</li>
                                                    ))
                                                ) : (
                                                    <li>No suggestions available.</li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'analysis' && (
                <div className="analysis-section">
                    <h2>Analyze Existing Team</h2>
                    <p>Enter a team ID to get AI analysis of its strengths, weaknesses, and improvement suggestions.</p>
                    
                    <div className="input-group">
                        <label htmlFor="teamId">Team ID:</label>
                        <input
                            type="number"
                            id="teamId"
                            value={teamId}
                            onChange={(e) => setTeamId(e.target.value)}
                            placeholder="Enter team ID"
                            disabled={loading}
                        />
                    </div>

                    <button 
                        onClick={analyzeTeam}
                        disabled={loading || !teamId.trim()}
                        className="ai-button"
                    >
                        {loading ? 'Analyzing Team...' : 'Analyze Team'}
                    </button>

                    {analysis && (
                        <div className="analysis-result">
                            <h3>Team Analysis</h3>
                            <div className="analysis-content">
                                <div className="team-info">
                                    <h4>Team: {analysis.teamName}</h4>
                                    <div className="current-pokemon">
                                        <h5>Current Pokemon</h5>
                                        <div className="pokemon-list">
                                            {analysis.currentPokemon && analysis.currentPokemon.length > 0 ? (
                                                analysis.currentPokemon.map((pokemon, index) => (
                                                    <div key={index} className="pokemon-item">
                                                        <img 
                                                            src={pokemon.sprite} 
                                                            alt={pokemon.name}
                                                            onError={(e) => {
                                                                e.target.src = '/pokeball.svg';
                                                            }}
                                                        />
                                                        <span>{pokemon.name}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p>No Pokemon in this team.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="detailed-analysis">
                                    <div className="analysis-grid">
                                        <div className="analysis-item">
                                            <strong>Strengths:</strong>
                                            <ul>
                                                {analysis.analysis && analysis.analysis.strengths && analysis.analysis.strengths.length > 0 ? (
                                                    analysis.analysis.strengths.map((strength, index) => (
                                                        <li key={index}>{strength}</li>
                                                    ))
                                                ) : (
                                                    <li>No strengths analysis available.</li>
                                                )}
                                            </ul>
                                        </div>
                                        <div className="analysis-item">
                                            <strong>Weaknesses:</strong>
                                            <ul>
                                                {analysis.analysis && analysis.analysis.weaknesses && analysis.analysis.weaknesses.length > 0 ? (
                                                    analysis.analysis.weaknesses.map((weakness, index) => (
                                                        <li key={index}>{weakness}</li>
                                                    ))
                                                ) : (
                                                    <li>No weaknesses analysis available.</li>
                                                )}
                                            </ul>
                                        </div>
                                        <div className="analysis-item">
                                            <strong>Suggestions:</strong>
                                            <ul>
                                                {analysis.analysis && analysis.analysis.suggestions && analysis.analysis.suggestions.length > 0 ? (
                                                    analysis.analysis.suggestions.map((suggestion, index) => (
                                                        <li key={index}>{suggestion}</li>
                                                    ))
                                                ) : (
                                                    <li>No suggestions available.</li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AIRecommendation;
