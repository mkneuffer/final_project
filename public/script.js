let offset = 50;
const limit = 50;

document.getElementById("loadMore").addEventListener("click", async () => {
  const response = await fetch(`/games?offset=${offset}&limit=${limit}`);
  const games = await response.json();

  if (games.length > 0) {
    const gameGrid = document.querySelector(".game-grid");
    games.forEach((game) => {
      const gameCard = document.createElement("div");
      gameCard.className = "game-card";
      gameCard.innerHTML = `
                <img src="${game.img_url}" alt="${game.name}">
                <h2>${game.name}</h2>
                <a href="/game/${game._id}">View Details</a>
            `;
      gameGrid.appendChild(gameCard);
    });
    offset += limit;
  } else {
    document.getElementById("loadMore").style.display = "none";
  }
});
