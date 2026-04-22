const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// Load .env from backend directory and override stale shell/system env values
dotenv.config({ path: path.join(__dirname, '.env'), override: true });

// Connect to database
connectDB();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/projects/:projectId/issues', require('./routes/issueRoutes'));
app.use('/api/issues', require('./routes/issueRoutes'));
app.use('/api/issues/:issueId/comments', require('./routes/commentRoutes'));
app.use('/api/issues/:issueId/activities', require('./routes/activityRoutes'));
app.use('/api/activities', require('./routes/globalActivityRoutes'));
app.use('/api/issues/:issueId/ai-summary', require('./routes/aiRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/team', require('./routes/teamRoutes'));

app.get('/', (req, res) => res.send('Issue Tracker API running'));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

module.exports = app;

