const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const { engine } = require("express-handlebars");
require("dotenv").config();

const app = express();
const cors = require('cors')
app.use(cors())

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@videogamedata.ktovg.mongodb.net/?retryWrites=true&w=majority&appName=videogamedata`;
const client = new MongoClient(uri);

const connectDB = async () => {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error.message);
        setTimeout(connectDB, 5000); // Retry connection after 5 seconds
    }
};

// Connect to the database when the server starts
connectDB();

app.engine("handlebars", engine({ defaultLayout: false }));
app.set("view engine", "handlebars");

app.use(express.static("styles"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Route to display the home page with the list of games
app.get("/", async (req, res) => {
    const db = client.db("videogames");
    const collection = db.collection("games");

    try {
        const games = await collection.find({}).limit(50).toArray(); // Limit to the first 50 games
        res.render("home", { games });
    } catch (error) {
        console.error("Error fetching games:", error.message);
        res.status(500).send("Error fetching games");
    }
});

app.get("/game/:id", async (req, res) => {
    const gameId = req.params.id;
    const db = client.db("videogames");
    const collection = db.collection("games");
    console.log(req.params)
    try {
        const game = await collection.findOne({ _id: new ObjectId(gameId) });

        // Check and process the game description to avoid repetition
        if (game && game.full_desc && game.full_desc.desc) {
            const description = game.full_desc.desc;
            // Remove "About This Game: " only if it exists at the start of the description
            if (description.startsWith("About This Game ")) {
                game.full_desc.desc = description.replace("About This Game ", ''); // Remove only the first instance
            }
        }

        // Fetch reviews for the specific game
        const reviewsCollection = db.collection("reviews");
        const reviews = await reviewsCollection.find({ gameId }).toArray();

        res.render("game", { game, reviews });
    } catch (error) {
        console.error("Error fetching game:", error.message);
        res.status(500).send("Error fetching game");
    }
});

// Route to handle review submission
app.post("/game/:id/review", async (req, res) => {
    const gameId = req.params.id;
    const { name, rating, review } = req.body; // Include rating in the request
    const db = client.db("videogames");
    const reviewsCollection = db.collection("reviews");

    try {
        await reviewsCollection.insertOne({ gameId, name, rating: parseInt(rating), review }); // Save name and rating
        res.redirect(`/game/${gameId}`);
    } catch (error) {
        console.error("Error submitting review:", error.message);
        res.status(500).send("Error submitting review");
    }
});

// Start the server
app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running on port 8080");
});
