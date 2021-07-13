const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

async function connection() {
  const mongodb = await MongoMemoryServer.create();

  async function connect() {
    const uri = mongodb.getUri();
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      poolSize: 10,
    });
  }

  async function closeDatabase() {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongodb.stop();
  }

  async function clearDatabase() {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany();
    }
  }

  return {
    connect,
    closeDatabase,
    clearDatabase,
  };
}

module.exports.connection = connection;
