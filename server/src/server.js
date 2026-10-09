const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

const app = require('./app');
const { connectDB } = require('./config/db');
const User = require('./models/User');
const seedData = require('./utils/seed');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[FixNearby Server] Empty database detected. Auto-seeding initial development dataset...');
      await seedData();
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`=======================================================`);
      console.log(`  FixNearby Server is running on http://localhost:${PORT}`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`=======================================================`);
    });

  } catch (err) {
    console.error('Failed to start FixNearby server:', err);
    process.exit(1);
  }
};

startServer();
