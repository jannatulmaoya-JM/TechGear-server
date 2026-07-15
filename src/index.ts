import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ServerApiVersion,  } from 'mongodb';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const { ObjectId } = require('mongodb');
const uri = process.env.MONGODB_URI as string;
const JWT_SECRET = process.env.JWT_SECRET || "JWT_SECRET=super_secret_key_88f92b7c1a4e5d6f3g9h2j5k8l0n1m4q";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    console.log("Successfully connected to MongoDB!");

   const db = client.db("Tech-Gear");
   const productsCollection = db.collection("Products");

    app.get('/api/products', async (req: Request, res: Response) => {
      try {
        const products = await productsCollection.find({}).toArray();
        // console.log("Found products:", products);
        res.send(products);
      } catch (err) {
        res.status(500).send({ message: "Error fetching products" });
      }
    });
  
    app.get('/api/products/:id', async (req: Request, res: Response) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const product = await productsCollection.findOne(query);
        
        if (!product) {
          return res.status(404).send({ message: "Product not found" });
        }
        
        res.send(product);
      } catch (err) {
        res.status(500).send({ message: "Error fetching product details" });
      }
    });
   
app.put('/api/products/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;
  const result = await productsCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );
  res.send(result);
});


app.delete('/api/products/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await productsCollection.deleteOne({ _id: new ObjectId(id) });
  res.send(result);
});
    app.post('/api/products', async (req: Request, res: Response) => {
      try {
        const newProduct = req.body;
        const result = await productsCollection.insertOne(newProduct);
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: "Error adding product" });
      }
    });

    // 3. JWT Authentication API (Login)
    app.post('/api/auth/login', (req: Request, res: Response) => {
      const { email } = req.body;
      
      const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
      res.send({ token });
    });

  } catch (err) {
    console.error("MongoDB Connection Error:", err);
  }
}

run().catch(console.dir);

app.get('/', (req: Request, res: Response) => {
  res.send("API is running...");
});

app.listen(5000, () => 
  console.log("Server running on port 5000"));