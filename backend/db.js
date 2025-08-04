const mongoose = require('mongoose');
const mongoURI = "mongodb://localhost:27017/inotebook"; // You can name your DB as needed

const connectToMongo = async () => {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("✅ Connected to Mongo Successfully");
    } catch (error) {
        console.error("❌ Failed to connect to MongoDB:", error.message);
        process.exit(1); // Exit if unable to connect
    }
};

module.exports = connectToMongo;
