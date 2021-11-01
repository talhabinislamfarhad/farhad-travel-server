const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;
const cors = require('cors')
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors())

app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.inlm9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("travel");
        const travelCollection = database.collection("travelservice");
        const orderBookCollection = database.collection('orderBook');
        // post api
        app.post('/packages', async (req, res) => {
            const package = req.body;
            const result = await travelCollection.insertOne(package);
            res.json(result)
        });

        // get packages
        app.get('/packages', async (req, res) => {
            const package = travelCollection.find({});
            const result = await package.toArray();
            res.send(result);
        });

        // placorder
        app.post('/placeorder', async (req, res) => {
            const orderBook = req.body;
            const result = await orderBookCollection.insertOne(orderBook);
            res.json(result)
        });
        // Orderplace api
        app.get('/allconfirmorder/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const allorders = await travelCollection.findOne(query);
            res.send(allorders);
        });
        //get my orders
        app.get("/myorders/:email", async (req, res) => {
            const result = await orderBookCollection.find({
                email: req.params.email,
            }).toArray();
            res.send(result);
        });
        //get manage orders
        app.get("/manageorders", async (req, res) => {
            const manageorder = orderBookCollection.find({});
            const getManageOrder = await manageorder.toArray();
            res.json(getManageOrder);
        });
        // delete all order 
        app.delete("/allorderdelete/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderBookCollection.deleteOne(query);
            res.json(result);
        });
        // delete order 
        app.delete("/orderdelete/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderBookCollection.deleteOne(query);
            res.json(result);
        });
        // update order 
        app.put('/placeorders/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const statusUpdate = {
                $set: {
                    status: 'approved'
                }
            };
            const result = await orderBookCollection.updateOne(filter, statusUpdate, options);
            res.json(result)
        })

    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})