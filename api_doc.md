# Pokemon Team Management API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
This API uses JWT (JSON Web Tokens) for authentication. Protected endpoints require an `Authorization` header with the format:
```
Authorization: Bearer <jwt_token>
```

## Table of Contents
1. [Authentication Endpoints](#authentication-endpoints)
2. [Pokemon Endpoints](#pokemon-endpoints)
3. [Team Management Endpoints](#team-management-endpoints)
4. [Move Endpoints](#move-endpoints)
5. [Error Handling](#error-handling)
6. [Data Models](#data-models)

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com"
}
```

**Status Codes:**
- `201` - User created successfully
- `400` - Validation error
- `500` - Server error

---

### Login User
**POST** `/auth/login`

Authenticate user with email and password.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

**Status Codes:**
- `200` - Login successful
- `401` - Invalid credentials
- `500` - Server error

---

### Google OAuth Login
**POST** `/auth/google`

Authenticate user with Google OAuth token.

**Request Body:**
```json
{
  "token": "google_id_token_string"
}
```

**Response:**
```json
{
  "success": true,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "John Doe",
    "email": "john@gmail.com"
  }
}
```

**Status Codes:**
- `200` - Google login successful
- `400` - Google authentication failed
- `500` - Server error

---

## Pokemon Endpoints

### Get All Pokemon
**GET** `/pokemon`

Retrieve all Pokemon with optional filtering and searching.

**Query Parameters:**
- `generation` (optional) - Filter by generation (e.g., "generation-i")
- `search` (optional) - Search by name or Pokemon ID

**Examples:**
```
GET /pokemon
GET /pokemon?generation=generation-i
GET /pokemon?search=pikachu
GET /pokemon?search=25
GET /pokemon?generation=generation-i&search=char
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "bulbasaur",
    "pokeApiId": 1,
    "types": ["grass", "poison"],
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
    "height": 7,
    "weight": 69,
    "baseStats": {
      "hp": 45,
      "attack": 49,
      "defense": 49,
      "special-attack": 65,
      "special-defense": 65,
      "speed": 45
    },
    "abilities": ["overgrow", "chlorophyll"],
    "generation": "generation-i"
  }
]
```

**Status Codes:**
- `200` - Success
- `500` - Server error

---

### Get Pokemon by ID
**GET** `/pokemon/:id`

Retrieve a specific Pokemon by its database ID.

**Parameters:**
- `id` - Pokemon database ID

**Response:**
```json
{
  "id": 1,
  "name": "bulbasaur",
  "pokeApiId": 1,
  "types": ["grass", "poison"],
  "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
  "height": 7,
  "weight": 69,
  "baseStats": {
    "hp": 45,
    "attack": 49,
    "defense": 49,
    "special-attack": 65,
    "special-defense": 65,
    "speed": 45
  },
  "abilities": ["overgrow", "chlorophyll"],
  "moves": ["tackle", "growl", "vine-whip"],
  "generation": "generation-i"
}
```

**Status Codes:**
- `200` - Success
- `404` - Pokemon not found
- `500` - Server error

---

## Team Management Endpoints
🔒 **All team endpoints require authentication**

### Create Team
**POST** `/teams`

Create a new Pokemon team.

**Request Body:**
```json
{
  "name": "My Dream Team"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "My Dream Team",
  "userId": 1,
  "createdAt": "2025-08-22T10:00:00.000Z",
  "updatedAt": "2025-08-22T10:00:00.000Z",
  "Pokemons": []
}
```

**Status Codes:**
- `201` - Team created successfully
- `400` - Request body required
- `401` - Unauthorized
- `500` - Server error

---

### Get All Teams
**GET** `/teams`

Retrieve all teams for the authenticated user.

**Response:**
```json
[
  {
    "id": 1,
    "name": "My Dream Team",
    "userId": 1,
    "createdAt": "2025-08-22T10:00:00.000Z",
    "updatedAt": "2025-08-22T10:00:00.000Z",
    "Pokemons": [
      {
        "id": 1,
        "name": "bulbasaur",
        "pokeApiId": 1,
        "types": ["grass", "poison"],
        "sprite": "https://...",
        "TeamPokemon": {
          "slot": 1,
          "moves": ["tackle", "growl"],
          "ability": "overgrow",
          "nature": "modest"
        }
      }
    ]
  }
]
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `500` - Server error

---

### Get Team by ID
**GET** `/teams/:id`

Retrieve a specific team with all Pokemon details.

**Parameters:**
- `id` - Team ID

**Response:**
```json
{
  "id": 1,
  "name": "My Dream Team",
  "Pokemons": [
    {
      "id": 1,
      "Pokemon": {
        "id": 1,
        "name": "bulbasaur",
        "pokeApiId": 1,
        "types": ["grass", "poison"],
        "sprite": "https://...",
        "baseStats": { ... }
      },
      "moves": ["tackle", "growl", "vine-whip", "razor-leaf"],
      "ability": "overgrow",
      "nature": "modest",
      "slot": 1
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `404` - Team not found
- `500` - Server error

---

### Update Team
**PUT** `/teams/:id`

Update team name and/or Pokemon composition.

**Parameters:**
- `id` - Team ID

**Request Body:**
```json
{
  "name": "Updated Team Name",
  "pokemonIds": [1, 2, 3, 4, 5, 6]
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Updated Team Name",
  "userId": 1,
  "Pokemons": [ ... ]
}
```

**Status Codes:**
- `200` - Team updated successfully
- `400` - Bad request (max 6 Pokemon, body required)
- `401` - Unauthorized
- `404` - Team not found
- `500` - Server error

---

### Delete Team
**DELETE** `/teams/:id`

Delete a team and all associated Pokemon.

**Parameters:**
- `id` - Team ID

**Response:**
```json
{
  "message": "Team deleted"
}
```

**Status Codes:**
- `200` - Team deleted successfully
- `401` - Unauthorized
- `404` - Team not found
- `500` - Server error

---

### Add Pokemon to Team
**POST** `/teams/:id/pokemon`

Add a Pokemon to a team.

**Parameters:**
- `id` - Team ID

**Request Body:**
```json
{
  "pokemonId": 1
}
```

**Response:**
```json
{
  "team": {
    "id": 1,
    "name": "My Dream Team"
  },
  "pokemon": {
    "name": "bulbasaur",
    "teamId": 1,
    "pokemonId": 1,
    "slot": 1
  }
}
```

**Status Codes:**
- `201` - Pokemon added successfully
- `400` - Bad request (pokemonId required, team full)
- `401` - Unauthorized
- `404` - Team not found
- `500` - Server error

---

### Remove Pokemon from Team
**DELETE** `/teams/:id/pokemon/:pokemonId`

Remove a Pokemon from a team.

**Parameters:**
- `id` - Team ID
- `pokemonId` - Pokemon ID to remove

**Response:**
```json
{
  "id": 1,
  "name": "My Dream Team",
  "Pokemons": [ ... ]
}
```

**Status Codes:**
- `200` - Pokemon removed successfully
- `401` - Unauthorized
- `404` - Team or Pokemon not found
- `500` - Server error

---

### Edit Pokemon Details
**PATCH** `/teams/:teamId/pokemon/:pokemonId`

Update Pokemon moves, ability, and nature within a team.

**Parameters:**
- `teamId` - Team ID
- `pokemonId` - Pokemon ID

**Request Body:**
```json
{
  "moves": "tackle, growl, vine-whip, razor-leaf",
  "ability": "overgrow",
  "nature": "modest"
}
```

**Alternative moves format:**
```json
{
  "moves": ["tackle", "growl", "vine-whip", "razor-leaf"],
  "ability": "overgrow",
  "nature": "modest"
}
```

**Response:**
```json
{
  "message": "Pokemon details updated successfully"
}
```

**Status Codes:**
- `200` - Pokemon details updated successfully
- `400` - Bad request (missing parameters)
- `401` - Unauthorized
- `404` - Pokemon not found in team
- `500` - Server error

---

## Move Endpoints

### Get Move by Name
**GET** `/api/moves/:name`

Retrieve move details by name. Supports multiple name formats.

**Parameters:**
- `name` - Move name (supports hyphens, spaces, different cases)

**Examples:**
```
GET /api/moves/thunderbolt
GET /api/moves/thunder-bolt
GET /api/moves/Thunder%20Bolt
```

**Response:**
```json
{
  "id": 1,
  "name": "thunderbolt",
  "type": "electric",
  "category": "special",
  "power": 90,
  "accuracy": 100,
  "pp": 15,
  "description": "A strong electric blast that may paralyze the target."
}
```

**Status Codes:**
- `200` - Move found
- `404` - Move not found
- `500` - Server error

---

## Error Handling

### Error Response Format
```json
{
  "message": "Error description"
}
```

### Common Error Codes

#### 400 - Bad Request
- Missing required fields
- Invalid data format
- Team exceeds 6 Pokemon limit

#### 401 - Unauthorized
- No token provided
- Invalid token
- Token expired

#### 403 - Forbidden
- Access denied

#### 404 - Not Found
- Resource not found
- Pokemon not found
- Team not found

#### 500 - Internal Server Error
- Database errors
- Server configuration issues

---

## Data Models

### User
```json
{
  "id": "integer",
  "username": "string",
  "email": "string",
  "password": "string (hashed)",
  "googleId": "string (optional)",
  "role": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Pokemon
```json
{
  "id": "integer",
  "name": "string",
  "pokeApiId": "integer",
  "types": "array",
  "sprite": "string",
  "height": "integer",
  "weight": "integer",
  "baseStats": "object",
  "abilities": "array",
  "moves": "array",
  "generation": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Team
```json
{
  "id": "integer",
  "name": "string",
  "userId": "integer",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### TeamPokemon (Junction Table)
```json
{
  "teamId": "integer",
  "pokemonId": "integer",
  "slot": "integer (1-6)",
  "moves": "array (optional)",
  "ability": "string (optional)",
  "nature": "string (optional)",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Move
```json
{
  "id": "integer",
  "name": "string",
  "type": "string",
  "category": "string",
  "power": "integer",
  "accuracy": "integer",
  "pp": "integer",
  "description": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

---

## Rate Limiting
Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

## CORS
CORS is enabled for all origins. Configure appropriately for production.

## Environment Variables
Required environment variables:
- `JWT_SECRET` - Secret key for JWT token signing
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `DB_NAME` - Database name
- `DB_USER` - Database username
- `DB_PASS` - Database password
- `DB_HOST` - Database host
- `DB_PORT` - Database port

---

## Testing
The API includes comprehensive test coverage (93.51%) using Jest and Supertest. Run tests with:
```bash
npm test
npm run test:coverage
```

## Version
API Version: 1.0.0
Last Updated: August 22, 2025
