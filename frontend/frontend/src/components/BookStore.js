import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./BookStore.css";

const BookStore = () => {
  const [books, setBooks] = useState([]);
  const [cartItem, setCart] = useState([]);
  const [addedBooks, setAddedBooks] = useState(new Set());
  const [quantities, setQuantities] = useState({});
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(false);
  const { username, password } = location.state || {};

  const credentials = `${username}:${password}`;
  const encodedCredentials = btoa(credentials);


  const fetchBooks = () => {
    setError(null);
    console.log("credentials:",credentials);
    axios
      .get("http://localhost:8080/api/books", {
        headers: {
          Authorization: `Basic ${encodedCredentials}`,
        },
      })
      .then((response) => {
        setBooks(response.data);
        console.log("Books retrieved:", response.data);
      })
      .catch((error) => {
        setError("Error fetching books. Please try again.");
      });
  };

  const fetchCartData = () => {
    setError(null);
    axios
      .get("http://localhost:8080/api/cart", {
        headers: {
          Authorization: `Basic ${encodedCredentials}`,
        },
      })
      .then((response) => {
        const cartItemFromResponse = response.data;
        console.log("Cart data retrieved:", cartItemFromResponse);
        const cartData = cartItemFromResponse.map(item => ({
          bookId: item.book.id,
          quantity: item.quantity
        }));

        console.log("Cart data :", cartData);
        setCart(cartData);
        const addedBooksSet = new Set(cartItemFromResponse.map(item => item.book.id));
        setAddedBooks(addedBooksSet);
        console.log("Cart data retrieved:", cartItem);
        console.log("addedBooks:", addedBooks);
        const updatedQuantities = {};
        cartItemFromResponse.forEach((item) => {
          updatedQuantities[item.book.id] = item.quantity;
        });
        setQuantities(updatedQuantities);

        console.log("updatedQuantities:", updatedQuantities);
        console.log("quantities:", quantities);
      })
      .catch((error) => {
        setError("Error fetching cart data. Please try again.");
      });
  };

  useEffect(() => {
    fetchBooks();
    fetchCartData();
  }, []);


  const handleAddToCart = (book) => {
    const cartItemsToAdd = { bookId: book.id, quantity: quantities[book.id] || 1 };

    const updatedCart = [...cartItem, cartItemsToAdd]
    setCart(updatedCart);

    const addedBooksSet = new Set(updatedCart.map(item => item.bookId));
    setAddedBooks(addedBooksSet);
    console.log("addedBooksSet:", addedBooksSet);
    console.log("addedBooks:", addedBooks);

    const requestBody = {
      items: updatedCart,
      ordered: order,
    };
    console.log("requestBody:", requestBody);
    axios
      .post("http://localhost:8080/api/cart/updateCart", requestBody, {
        headers: {
          Authorization: `Basic ${encodedCredentials}`,
        },
      })
      .then((response) => {
        console.log(response.data);
        setAddedBooks((prev) => new Set(prev).add(book.id));
      })
      .catch((error) => {
        console.error("Error adding to cart:", error);
        alert("Failed to add book to cart.");
      });
  };

  const handleViewCart = () => {
    navigate("/cart", {
      state: {
        username: username,
        password: password,
      },
    });
  };

  const handleQuantityChange = (bookId, value) => {
    setQuantities((prev) => ({ ...prev, [bookId]: parseInt(value, 10) }));
  };

  const handleLogout = () => {
   setTimeout(() => {
            window.location.reload();
          }, 1000);
    navigate("/");
  };

const getTotalItems = () => {
  return cartItem.reduce((total, item) => total + item.quantity, 0);
};

  return (
    <div className="bookscreen-container">
      <div className="header">
        <h1 className="bookstore-heading">Online Book Store</h1>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <div className="user-greeting-container">
        <span className="username">Hi, {username}</span>
        <button className="cart-btn" onClick={handleViewCart}>
        Cart {getTotalItems() > 0 && <span>({getTotalItems()})</span>}
        </button>
      </div>
      <div className="book-list">
        {books.map((book) => (
          <div key={book.id} className="book-item">
            <h3>{book.title}</h3>
            <p>Author: {book.author}</p>
            <p>Price: €{book.price}</p>

            <div className="book-actions">
              <select
                className="quantity-picker"
                value={quantities[book.id] || 1}
                onChange={(e) => handleQuantityChange(book.id, e.target.value)}
              >
                <option value="" disabled>
                </option>
                {[...Array(50).keys()].map((i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>

              <button
                onClick={() => handleAddToCart(book)}
                className="add-to-cart-btn"

              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookStore;
