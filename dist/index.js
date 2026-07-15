"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongodb_1 = require("mongodb");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const PORT = process.env.PORT || 5000;
const { ObjectId } = require('mongodb');
const uri = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key_88f92b7c1a4e5d6f3g9h2j5k8l0n1m4q";
const client = new mongodb_1.MongoClient(uri, {
    serverApi: { version: mongodb_1.ServerApiVersion.v1, strict: true, deprecationErrors: true }
});
let db, productsCollection, ordersCollection, usersCollection;
async function run() {
    //await client.connect();
    db = client.db("Tech-Gear");
    productsCollection = db.collection("Products");
    ordersCollection = db.collection("Orders");
    usersCollection = db.collection("Users");
    console.log("Connected to MongoDB!");
}
run().catch(console.dir);
app.get('/api/products', async (req, res) => {
    const products = await productsCollection.find({}).toArray();
    res.send(products);
});
app.get('/api/products/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const product = await productsCollection.findOne({ _id: new ObjectId(id) });
        if (!product)
            return res.status(404).json({ message: "Not Found" });
        res.send(product);
    }
    catch (error) {
        res.status(500).json({ message: "Invalid ID" });
    }
});
app.put('/api/user/update', async (req, res) => {
    try {
        const { email, name, phone, address, image } = req.body;
        await usersCollection.updateOne({ email: email }, { $set: { name, phone, address, image } }, { upsert: true });
        res.status(200).json({ message: "Updated" });
    }
    catch (error) {
        res.status(500).json({ message: "Update Failed" });
    }
});
app.get('/api/orders', async (req, res) => {
    const orders = await ordersCollection.find({}).toArray();
    res.send(orders);
});
app.post('/api/orders', async (req, res) => {
    const result = await ordersCollection.insertOne(req.body);
    res.status(200).json({ message: "Order placed!", orderId: result.insertedId });
});
app.post('/api/auth/login', (req, res) => {
    const { email } = req.body;
    const token = jsonwebtoken_1.default.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
    res.send({ token });
});
//app.listen(5000, () => console.log("Server running on port 5000"));
if (process.env.NODE_ENV !== 'production') {
    app.listen(5000, () => console.log("Server running on port 5000"));
}
exports.default = app;
//# sourceMappingURL=index.js.map