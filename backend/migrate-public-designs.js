const mongoose = require('mongoose');
require('dotenv').config();

const { User, TattooDesign } = require('./models');

const isDryRun = process.argv.includes('--dry-run');

const connectDb = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/inkcraft';
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
};

const migratePublicDesigns = async () => {
  try {
    await connectDb();
    console.log('Connected to MongoDB');

    const adminUsers = await User.find({ role: 'admin', isActive: true })
      .select('_id name email')
      .lean();

    if (adminUsers.length === 0) {
      console.log('No active admin users found. No records updated.');
      return;
    }

    const adminIds = adminUsers.map((user) => user._id);
    const adminDesignsToPublishFilter = {
      createdBy: { $in: adminIds },
      isGalleryDesign: { $ne: true }
    };

    const adminDesignsToPublishCount = await TattooDesign.countDocuments(adminDesignsToPublishFilter);
    const privateUserDesignCount = await TattooDesign.countDocuments({
      createdBy: { $nin: adminIds },
      isGalleryDesign: false
    });
    const publicUserDesignCount = await TattooDesign.countDocuments({
      createdBy: { $nin: adminIds },
      isGalleryDesign: true
    });

    console.log(`Active admin users: ${adminUsers.length}`);
    console.log(`Admin designs to mark public: ${adminDesignsToPublishCount}`);
    console.log(`Private user designs (unchanged): ${privateUserDesignCount}`);
    console.log(`Public non-admin designs (unchanged): ${publicUserDesignCount}`);

    if (isDryRun) {
      console.log('Dry run complete. No changes were written.');
      return;
    }

    if (adminDesignsToPublishCount === 0) {
      console.log('No admin designs need migration.');
      return;
    }

    const updateResult = await TattooDesign.updateMany(adminDesignsToPublishFilter, {
      $set: { isGalleryDesign: true }
    });

    console.log(`Updated ${updateResult.modifiedCount} admin design(s) to public.`);
    console.log('Migration complete.');
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

migratePublicDesigns();
