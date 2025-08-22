import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import Swal from 'sweetalert2';
import './Teams.css';

function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    fetchTeams();
  }, [isLoggedIn, navigate]);

  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://localhost:3000/teams', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeams(response.data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
      setTeams([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const createNewTeam = async () => {
    const { value: teamName } = await Swal.fire({
      title: 'Create New Team',
      input: 'text',
      inputLabel: 'Team Name',
      inputPlaceholder: 'Enter your team name',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Create',
      inputValidator: (value) => {
        if (!value) {
          return 'You need to write something!';
        }
      }
    });

    if (teamName) {
      try {
        const token = localStorage.getItem('access_token');
        await axios.post('http://localhost:3000/teams', 
          { name: teamName },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        Swal.fire({
          icon: 'success',
          title: 'Team Created!',
          text: `${teamName} has been created successfully`,
          timer: 2000,
          showConfirmButton: false
        });
        
        fetchTeams();
      } catch (error) {
        console.error('Error creating team:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to create team'
        });
      }
    }
  };

  const deleteTeam = async (teamId, teamName) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `This will permanently delete "${teamName}" and all its Pokemon!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('access_token');
        await axios.delete(`http://localhost:3000/teams/${teamId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: `${teamName} has been deleted.`,
          timer: 2000,
          showConfirmButton: false
        });
        
        fetchTeams();
      } catch (error) {
        console.error('Error deleting team:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete team'
        });
      }
    }
  };

  const editTeamName = async (teamId, currentName) => {
    const { value: newName } = await Swal.fire({
      title: 'Edit Team Name',
      input: 'text',
      inputValue: currentName,
      inputLabel: 'Team Name',
      showCancelButton: true,
      confirmButtonText: 'Update',
      inputValidator: (value) => {
        if (!value) {
          return 'You need to write something!';
        }
      }
    });

    if (newName && newName !== currentName) {
      try {
        const token = localStorage.getItem('access_token');
        await axios.put(`http://localhost:3000/teams/${teamId}`, 
          { name: newName },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: `Team name updated to "${newName}"`,
          timer: 2000,
          showConfirmButton: false
        });
        
        fetchTeams();
      } catch (error) {
        console.error('Error updating team:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to update team name'
        });
      }
    }
  };

  if (!isLoggedIn) {
    return <div>Please log in to view your teams</div>;
  }

  if (loading) {
    return (
      <div className="teams-container">
        <div className="loading">
          <div className="pokeball-spinner"></div>
          <p>Loading your teams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="teams-container">
      <div className="teams-header">
        <h1>My Pokemon Teams</h1>
        <button className="create-team-btn" onClick={createNewTeam}>
          <span className="pokeball-icon">⚪</span>
          Create New Team
        </button>
      </div>

      {teams.length === 0 ? (
        <div className="no-teams">
          <div className="empty-state">
            <h2>No teams yet!</h2>
            <p>Create your first Pokemon team to get started</p>
            <button className="create-first-team-btn" onClick={createNewTeam}>
              Create Your First Team
            </button>
          </div>
        </div>
      ) : (
        <div className="teams-grid">
          {teams.map((team) => (
            <div key={team.id} className="team-card">
              <div className="team-header">
                <h3 className="team-name" onClick={() => navigate(`/teams/${team.id}`)}>
                  {team.name}
                </h3>
                <div className="team-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => editTeamName(team.id, team.name)}
                    title="Edit team name"
                  >
                    ✏️
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => deleteTeam(team.id, team.name)}
                    title="Delete team"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div className="team-info">
                <p className="created-date">
                  Created: {new Date(team.createdAt).toLocaleDateString()}
                </p>
              </div>

              <button 
                className="manage-team-btn"
                onClick={() => navigate(`/teams/${team.id}`)}
              >
                Manage Team
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Teams;
