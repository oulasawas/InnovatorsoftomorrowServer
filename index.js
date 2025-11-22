const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const openAIRoutes = require('./routes/openAIRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const spriteController = require('./routes/spriteRoutes');

dotenv.config();
const PORT = process.env.PORT || 4000
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/teachAI', openAIRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/sprite', spriteController);
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(PORT, () => console.log('Server running on port '+PORT)))
  .catch(err => console.log(err));
