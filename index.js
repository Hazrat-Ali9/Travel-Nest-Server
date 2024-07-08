const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// mongoDB database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ahe248t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const db = client.db("TouristDB");
        const countriesCollection = db.collection('countries');
        const touristSpotsCollection = db.collection('touristSpots');

        app.get('/tourist-spots', async (req, res) => {
            const cursor = touristSpotsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/tourist-spots/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await touristSpotsCollection.findOne(query);
            res.send(result);
        })

        app.get('/tourist-spots-sort/', async (req, res) => {
            const cursor = touristSpotsCollection.find().sort({average_cost: 1}).collation({locale: "en_US", numericOrdering: true});
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/tourist-spots-user/:email', async (req, res) => {
            const userEmail = req.params.email;
            const query = { email: userEmail }
            const cursor = touristSpotsCollection.find(query)
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/countries', async (req, res) => {
            const cursor = countriesCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/tourist-spots-country/:country_Name', async(req, res) =>{
            const country_Name = req.params.country_Name;
            const query = { country_Name: country_Name};
            const cursor = touristSpotsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.post('/tourist-spots', async (req, res) => {
            const touristInfo = req.body;
            const result = await touristSpotsCollection.insertOne(touristInfo);
            res.send(result);
        })

        app.patch('/tourist-spots/:id', async (req, res) => {
            const id = req.params.id;
            const touristInfo = req.body;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    imageURL: touristInfo.imageURL,
                    tourists_spot_name: touristInfo.tourists_spot_name,
                    country_Name: touristInfo.country_Name,
                    location: touristInfo.location,
                    description: touristInfo.description,
                    average_cost: touristInfo.average_cost,
                    seasonality: touristInfo.seasonality,
                    travel_time: touristInfo.travel_time,
                    totalVisitorsPerYear: touristInfo.totalVisitorsPerYear,
                }
            }
            const result = await touristSpotsCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        app.delete('/tourist-spots/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await touristSpotsCollection.deleteOne(query);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Your Server is Running');
})

app.listen(port, () => {
    console.log(`Server is running on: http://localhost:${port}/`);
})