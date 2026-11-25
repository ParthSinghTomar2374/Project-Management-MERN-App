const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

const fixUsers = async () => {
  try {
    const uri = process.env.MONGO_URI || "mongodb+srv://parthtomar2374_db_user:THEOMSIR@thecluster0.5xjtf6o.mongodb.net/test?appName=THECluster0";
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const result = await User.updateMany(
      { isInTeam: { $exists: false } },
      { $set: { isInTeam: true } }
    );
    
    console.log(`Updated ${result.modifiedCount} users to be in team.`);

    // Also update any that were explicitly set to false if they were already there?
    // Actually, just set everyone to true for now to be safe.
    const result2 = await User.updateMany(
      {},
      { $set: { isInTeam: true } }
    );
    console.log(`Set all ${result2.matchedCount} users to isInTeam: true`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

fixUsers();
