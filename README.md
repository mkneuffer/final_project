# Final Project - Team 4
Thomas Oleary, James Cannon, Justin Smith, Matthew Neuffer, Ash Kittur

## General Description

Our application is a video game catalogue. Upon visiting, a user will be welcomed with a login page. They can choose to login with auth0 or a normal username and password. Then, they will be taken to the list of games. This list of games accesses a large database of games from Steam. Clicking on any game's card to view its details will do so. On each game, users can leave reviews and ratings which will be persistent and save themselves in our MongoDB database.
A user can click on a button to add the currently visited game to their wishlist. When they return to the game list, they can return to their wishlist. Their wishlist will store data about their different wishlisted games. They can also search for games above their wishlist in a search bar. This will allow them to add any game in our database they want to their wishlist.

-**Frontend**: HTML, CSS and Handlebars

-**Backend**: Node.js, Express.js, MongoDB, JavaScript

Some challenges that we faced were integrating programs that used React.js and Express.js. In the end, we decided to rewrite the entirety of the project in Express.js for consistency's sake. We also needed to collaborate in order to toggle MongoDB and set it up correctly.
With the game database, we also ran into an issue with roughly 10,000 repeated games. This required us to remove all repeated game entries before finalizing the database into our project.

## Contributions:

- Justin: Created the initial implementation of the game wishlist webpage and integrated the Auth0 login feature.
  Added initial CSS styling in Login and Wishlist pages.
  Originally wrote the React front-end before we axed it.
  
- Thomas: Assisted in the integration of Auth0. Integrated different teammates' work with each other.
  Attempted to port everything to React before we decided to port everything out of React.

- James: Inspired project idea from past assignments.
  Created and formatted wishlist page to allow users to add games from the database.
  Integrated the wishlist with the game and home pages.

- Matt: Created the database and collections on MongoDB for the game library, reviews, wishlist, and users.
  Found, cleaned and uploaded 80,000 Game Dataset to the database. Using python to upload entires to MongoDB and remove repeats.
  Created review system for all games on the site, uses the logged in account's username for the review.

- Ash: Researched React/Express integration, wrote documentation.

Link to video: [Zoom recording]

Link to deployed web app: https://webware-videogamecatalog.glitch.me/

Link to database for game list: https://www.kaggle.com/datasets/deepann/80000-steam-games-dataset?select=steam_data.csv
