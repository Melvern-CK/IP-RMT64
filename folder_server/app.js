
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const cors = require('cors')
const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const authRoutes = require('./routes/authRoute')
const errorHandler = require('./middlewares/errorHandler');
const pokemonRoute = require('./routes/pokemonRoute');
const moveRoute = require('./routes/moveRoute');
const auth = require('./middlewares/auth');
const teamRoute = require('./routes/teamRoute');
const geminiRoute = require('./routes/geminiRoute');


app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());


app.use('/pokemon', pokemonRoute); // Public
app.use('/api/moves', moveRoute); // Public moves API
app.use('/auth', authRoutes);

app.use(auth);
app.use('/teams', teamRoute);
app.use('/ai', geminiRoute);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


module.exports = app;