import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
    const [wishlistData, setWishlistData] = useState({
    gameTitle: '',
    genre: '',
    price: '',
    currentDiscount: ''
  });

  const [gameList, setGameList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

    //Load game list on page render
    useEffect(() => {
      const savedWishlist = JSON.parse(localStorage.getItem('wishlist'));
      if (savedWishlist) {
        setGameList(savedWishlist);
      }
    }, []);

  //Store game list data
  useEffect(() => {
    if (gameList.length > 0) {
      localStorage.setItem('wishlist', JSON.stringify(gameList));
    }
  }, [gameList]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setWishlistData({
      ...wishlistData,
      [id]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const discount = parseInt(wishlistData.price) * (wishlistData.currentDiscount/100);
    const discountedPrice = parseInt(wishlistData.price - discount);
    const newGame = {
      ...wishlistData,
      discountedPrice
    };

    if (isEditing) {
      const updatedList = gameList.map((game, index) => 
        index === editIndex ? newGame : game
      );
      setGameList(updatedList);
      setIsEditing(false);
      setEditIndex(null);
    } else {
      setGameList([...gameList, newGame]);
    }

    // Reset form
    setWishlistData({
      gameTitle: '',
      genre: '',
      price: '',
      currentDiscount: ''
    });
  };

  const handleEdit = (index) => {
    const wishlistToEdit = gameList[index];
    setWishlistData({
      gameTitle: wishlistToEdit.gameTitle,
      genre: wishlistToEdit.name,
      price: wishlistToEdit.salary,
      currentDiscount: wishlistToEdit.currentDiscount
    });
    setIsEditing(true);
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    const updatedList = gameList.filter((_, i) => i !== index);
    setGameList(updatedList);
  };

  return (
    <div className="App">
      <header>
        Game Wishlist
      </header>
      <p>Put the discount as a whole number from 0-100.</p>
      <form id="wishlistForm" onSubmit={handleSubmit}>
        <input 
          type="text" 
          id="gameTitle" 
          value={wishlistData.gameTitle} 
          onChange={handleInputChange} 
          placeholder="Game Title" 
          required
        />
        <input 
          type="text" 
          id="genre" 
          value={wishlistData.genre} 
          onChange={handleInputChange} 
          placeholder="Genre of your game" 
          required
        />
        <input 
          type="text" 
          id="price" 
          value={wishlistData.price} 
          onChange={handleInputChange} 
          placeholder="Full price of your game" 
          required
        />
        <input 
          type="text" 
          id="currentDiscount" 
          value={wishlistData.currentDiscount} 
          onChange={handleInputChange} 
          placeholder="Current discount of your game" 
          required
        />
        <button type="submit">{isEditing ? 'Update' : 'Submit'}</button>
      </form>

      <table id="wishlistTable">
        <thead>
          <tr>
            <th>Title</th>
            <th>Genre</th>
            <th>Price</th>
            <th>Discount</th>
            <th>Discounted Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {gameList.map((wishlist, index) => (
            <tr key={index}>
              <td>{wishlist.gameTitle}</td>
              <td>{wishlist.genre}</td>
              <td>{wishlist.price}</td>
              <td>{wishlist.currentDiscount}</td>
              <td>{wishlist.discountedPrice}</td>
              <td>
                <button onClick={() => handleEdit(index)}>Edit</button>
                <button onClick={() => handleDelete(index)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
