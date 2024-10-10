const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const { engine } = require("express-handlebars");
const session = require("express-session");
const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const LocalStrategy = require("passport-local").Strategy;
const flash = require("connect-flash");
require("dotenv").config();

const app = express();

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@videogamedata.ktovg.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

async function connectDB() {
  try {
    await client.connect();
    console.log(`Connected to MongoDB database: ${process.env.DB_NAME}`);
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    setTimeout(connectDB, 5000);
  }
}

connectDB();

app.engine("handlebars", engine({ defaultLayout: false }));
app.set("view engine", "handlebars");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const db = client.db(process.env.DB_NAME);
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ _id: new ObjectId(id) });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const db = client.db(process.env.DB_NAME);
        const usersCollection = db.collection("users");
        let user = await usersCollection.findOne({ githubId: profile.id });

        if (!user) {
          const newUser = {
            username: profile.username,
            githubId: profile.id,
            displayName: profile.displayName,
            profileUrl: profile.profileUrl,
          };

          const result = await usersCollection.insertOne(newUser);

          if (result && result.insertedId) {
            user = {
              ...newUser,
              _id: result.insertedId,
            };
          } else {
            return done(new Error("Unable to create a new user"));
          }
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const db = client.db(process.env.DB_NAME);
      const usersCollection = db.collection("users");
      const user = await usersCollection.findOne({ username });

      if (!user) {
        return done(null, false, { message: "Incorrect username." });
      }

      if (password !== user.password) {
        return done(null, false, { message: "Incorrect password." });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

app.use((req, res, next) => {
  if (
    req.isAuthenticated() ||
    req.path === "/login" ||
    req.path.startsWith("/auth/github")
  ) {
    return next();
  } else {
    return res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  res.render("login", { message: req.flash("error") });
});

app.get("/auth/github", (req, res, next) => {
  passport.authenticate("github", { scope: ["user:email"] })(req, res, next);
});

app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/");
  }
);

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect("/login");
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect("/");
    });
  })(req, res, next);
});

app.get("/", async (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }

  try {
    const db = client.db(process.env.DB_NAME);
    const limit = 50;
    const offset = parseInt(req.query.offset) || 0;
    const games = await db
      .collection("games")
      .find({}, { projection: { name: 1, img_url: 1 } })
      .skip(offset)
      .limit(limit)
      .toArray();

    const nextOffset = offset + limit;
    const loadMore = (await db.collection("games").countDocuments()) > nextOffset;

    res.render("home", {
      games,
      username: req.user.username,
      loadMore,
      nextOffset,
    });
  } catch (err) {
    res.status(500).send("Error fetching games");
  }
});

app.get("/wishlist", async (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }

  try {
    const db = client.db(process.env.DB_NAME);
    const wishlist = await db
      .collection("wishlist")
      .findOne({ userId: req.user._id });
    const wishlistItems = wishlist ? wishlist.games : [];

    res.render("wishlist", { wishlistItems, username: req.user.username });
  } catch (err) {
    res.status(500).send("Error fetching wishlist");
  }
});

app.post("/wishlist/search", async (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }

  const searchQuery = req.body.searchQuery.trim();

  try {
    const db = client.db(process.env.DB_NAME);
    const regexPattern = new RegExp(searchQuery, "i");
    const games = await db
      .collection("games")
      .find({ name: { $regex: regexPattern } })
      .toArray();
    const wishlist = await db
      .collection("wishlist")
      .findOne({ userId: req.user._id });
    const wishlistItems = wishlist ? wishlist.games : [];

    res.render("wishlist", {
      games,
      wishlistItems,
      username: req.user.username,
    });
  } catch (err) {
    res.status(500).send("Error searching games");
  }
});

app.post("/wishlist/add/:id", async (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }

  try {
    const db = client.db(process.env.DB_NAME);
    const gameId = req.params.id;
    const game = await db
      .collection("games")
      .findOne({ _id: new ObjectId(gameId) });

    if (game) {
      await db
        .collection("wishlist")
        .updateOne(
          { userId: req.user._id },
          { $addToSet: { games: game } },
          { upsert: true }
        );
    }

    res.redirect("/wishlist");
  } catch (err) {
    res.status(500).send("Error adding game to wishlist");
  }
});

app.post("/game/:id/add-to-wishlist", async (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }

  try {
    const db = client.db(process.env.DB_NAME);
    const gameId = req.params.id;
    const game = await db
      .collection("games")
      .findOne({ _id: new ObjectId(gameId) });

    if (game) {
      await db
        .collection("wishlist")
        .updateOne(
          { userId: req.user._id },
          { $addToSet: { games: game } },
          { upsert: true }
        );
    }

    res.redirect(`/game/${gameId}`);
  } catch (err) {
    res.status(500).send("Error adding game to wishlist");
  }
});

app.post("/wishlist/remove/:id", async (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }

  try {
    const db = client.db(process.env.DB_NAME);
    const gameId = req.params.id;

    await db
      .collection("wishlist")
      .updateOne(
        { userId: req.user._id },
        { $pull: { games: { _id: new ObjectId(gameId) } } }
      );

    res.redirect("/wishlist");
  } catch (err) {
    res.status(500).send("Error removing game from wishlist");
  }
});

app.get("/game/:id", async (req, res) => {
  try {
    const db = client.db(process.env.DB_NAME);
    const game = await db
      .collection("games")
      .findOne({ _id: new ObjectId(req.params.id) });
    const reviews = await db
      .collection("reviews")
      .find({ gameId: new ObjectId(req.params.id) })
      .toArray();

    if (game && game.full_desc && game.full_desc.desc) {
            const description = game.full_desc.desc;
            // Remove "About This Game: " only if it exists at the start of the description
            if (description.startsWith("About This Game ")) {
                game.full_desc.desc = description.replace("About This Game ", ''); // Remove only the first instance
            }
    }
    
    if (game) {
      res.render("game", {
        game,
        reviews,
        username: req.user ? req.user.username : null,
      });
    } else {
      res.status(404).send("Game not found");
    }
  } catch (err) {
    res.status(500).send("Error fetching game details");
  }
});

app.post("/game/:id/add-review", async (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }

  try {
    const db = client.db(process.env.DB_NAME);
    const gameId = req.params.id;
    const reviewContent = req.body.reviewContent;
    const rating = parseInt(req.body.rating);

    const review = {
      gameId: new ObjectId(gameId),
      username: req.user.username,
      content: reviewContent,
      rating: rating,
      date: new Date(),
    };

    await db.collection("reviews").insertOne(review);
    res.redirect(`/game/${gameId}`);
  } catch (err) {
    console.error("Error adding review:", err);
    res.status(500).send("Error adding review");
  }
});

app.use((err, req, res, next) => {
  res.status(500).send("Something went wrong!");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running");
});

app.get('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login'); 
  });
});