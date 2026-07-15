import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ServerApiVersion } from 'mongodb';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const { ObjectId } = require('mongodb');
const uri = process.env.MONGODB_URI as string;
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key_88f92b7c1a4e5d6f3g9h2j5k8l0n1m4q";

const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

let db: any, productsCollection: any, ordersCollection: any, usersCollection: any;

async function run() {
  await client.connect();
  db = client.db("Tech-Gear");
  productsCollection = db.collection("Products");
  ordersCollection = db.collection("Orders");
  usersCollection = db.collection("Users");
  console.log("Connected to MongoDB!");
}
run().catch(console.dir);


app.get('/api/products', async (req: Request, res: Response) => {
  const products = await productsCollection.find({}).toArray();
  res.send(products);
});

app.get('/api/products/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const product = await productsCollection.findOne({ _id: new ObjectId(id) });
    if (!product) return res.status(404).json({ message: "Not Found" });
    res.send(product);
  } catch (error) {
    res.status(500).json({ message: "Invalid ID" });
  }
});


app.put('/api/user/update', async (req: Request, res: Response) => {
  try {
    const { email, name, phone, address, image } = req.body;
    await usersCollection.updateOne(
      { email: email },
      { $set: { name, phone, address, image } },
      { upsert: true }
    );
    res.status(200).json({ message: "Updated" });
  } catch (error) {
    res.status(500).json({ message: "Update Failed" });
  }
});

app.get('/api/orders', async (req: Request, res: Response) => {
  const orders = await ordersCollection.find({}).toArray();
  res.send(orders);
});

app.post('/api/orders', async (req: Request, res: Response) => {
  const result = await ordersCollection.insertOne(req.body);
  res.status(200).json({ message: "Order placed!", orderId: result.insertedId });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
  res.send({ token });
});

app.listen(5000, () => console.log("Server running on port 5000"));