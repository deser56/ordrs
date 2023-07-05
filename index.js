const express = require('express');
const app = express();
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');


const connectionString = 'mongodb+srv://wanpatty168:jY5V2izE8lZokhdB@cluster0.klmdnv3.mongodb.net/?retryWrites=true&w=majority';
const dbName = 'cluster0';
const collectionName = 'orders';

let db;

async function connectToDatabase() {
  try {
    const client = new MongoClient(connectionString);
    await client.connect();
    db = client.db(dbName);
    console.log('Connected to the database');
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
}


app.use(cors());

app.use(express.json());

app.get('/orders', async (req, res) => {
  try {
    const orders = await db.collection(collectionName).find().toArray();
    res.json(orders);
  } catch (error) {
    console.error('Error retrieving orders:', error);
    res.sendStatus(500);
  }
});

app.get('/orders/:id', async (req, res) => {
  const orderId = req.params.id;
  try {
    const order = await db.collection(collectionName).findOne({
      _id: ObjectId(orderId),
    });
    if (order) {
      res.json(order);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error('Error retrieving order:', error);
    res.sendStatus(500);
  }
});

app.post('/orders', async (req, res) => {
  const { customerId, products } = req.body;
  try {
    const result = await db.collection(collectionName).insertOne({
      customerId,
      products,
      status: 'Pending',
    });
    res.status(201).json({ _id: result.insertedId });
  } catch (error) {
    console.error('Error creating order:', error);
    res.sendStatus(500);
  }
});

app.put('/orders/:id', async (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;
  try {
    const result = await db.collection(collectionName).updateOne(
      { _id: ObjectId(orderId) },
      { $set: { status } }
    );
    if (result.modifiedCount > 0) {
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error('Error updating order:', error);
    res.sendStatus(500);
  }
});

connectToDatabase().then(() => {
  app.listen(3000, () => {
    console.log('Order management service is running on port 3000');
  });
});
