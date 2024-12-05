import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaTrash  } from 'react-icons/fa';
import axios from 'axios';
import './ShoppingCart.css';

const ShoppingCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [bookDetails, setBookDetails] = useState([]);
  const [quantities, setQuantities] = useState([]);
  const [order, setOrder] = useState(false);
  const location = useLocation();
  const { username, password } = location.state || {};
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = () => {

    axios
      .get('http://localhost:8080/api/cart', {
        headers: {
          Authorization: `Basic ${btoa(username + ':' + password)}`,
        },
      })
      .then((response) => {
        setCartItems(response.data);
        const cartItemFromResponse = response.data;
        const bookData = cartItemFromResponse.map(item => ({
          bookId: item.book.id,
          quantity: item.quantity
        }));

        console.log("bookData :", bookData);
        setBookDetails(bookData);

        const updatedQuantities = {};
        cartItemFromResponse.forEach((item) => {
          updatedQuantities[item.book.id] = item.quantity;
        });
        setQuantities(updatedQuantities);
      })
      .catch((error) => {
        //alert('Error fetching cart items. Please try again.');
      });
  };

  const handleQuantityChange = (bookId, quantity) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.book.id === bookId
          ? { ...item, quantity: parseInt(quantity) }
          : item
      )
    );
    console.log("bookDetails:", bookDetails);
    const updatedCart = bookDetails.map(item =>
      item.bookId === bookId
        ? { ...item, quantity: parseInt(quantity) }
        : item
    );

    console.log("updatedCart:", updatedCart);
    setBookDetails(updatedCart);

    const requestBody = {
      items: updatedCart,
      ordered: order,
    };
    axios
      .post("http://localhost:8080/api/cart/updateCart", requestBody, {
        headers: {
          Authorization: `Basic ${btoa(username + ':' + password)}`,
        },
      })
      .then((response) => {
        console.log(response.data);
        //setAddedBooks((prev) => new Set(prev).add(book.id));
      })
      .catch((error) => {
        console.error("Error adding to cart:", error);
        alert("Failed to add book to cart.");
      });
  };

  const handleRemoveItem = (bookId) => {
    console.log("itemid:", bookId);
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.bookId !== bookId)
    );

    console.log("bookDetails:", bookDetails);
    const updatedCart = bookDetails.filter(item => item.bookId !== bookId);

    console.log("updatedCart:", updatedCart);
    setBookDetails(updatedCart);

    const requestBody = {
      items: updatedCart,
      ordered: order,
    };
    axios
      .post("http://localhost:8080/api/cart/updateCart", requestBody, {
        headers: {
          Authorization: `Basic ${btoa(username + ':' + password)}`,
        },
      })
      .then((response) => {
        console.log(response.data);
        //setAddedBooks((prev) => new Set(prev).add(book.id));
        fetchCartItems();
      })
      .catch((error) => {
        console.error("Error adding to cart:", error);
        alert("Failed to add book to cart.");
      });
  };

  const handleGoHome = () => {
    navigate("/books", {
      state: {
        username: username,
        password: password,
      },
    });
  };

  const incrementQuantity = (bookId, currentQuantity) => {
    const newQuantity = currentQuantity + 1;
    handleQuantityChange(bookId, newQuantity);
  };

  const decrementQuantity = (bookId, currentQuantity) => {
    const newQuantity = currentQuantity > 1 ? currentQuantity - 1 : 1;
    handleQuantityChange(bookId, newQuantity);
  };

  const grandTotal = cartItems.reduce(
    (total, item) => total + item.book.price * item.quantity,0
  );

  const handleCheckout = () => {
    const orderValue = true;
    setOrder(orderValue);
    console.log("order:", order)
     console.log("orderValue:", orderValue)
    const requestBody = {
      items: bookDetails,
      ordered: true,
    };
    console.log("order:", order)
        console.log("orderValue:", orderValue)
    console.log("bookDetails:", bookDetails)
    console.log("requestBody:", requestBody)
    axios
      .post("http://localhost:8080/api/cart/updateCart", requestBody, {
        headers: {
          Authorization: `Basic ${btoa(username + ':' + password)}`,
        },
      })
      .then((response) => {
        console.log(response.data);
        //setAddedBooks((prev) => new Set(prev).add(book.id));
        navigate('/orderSummary', {
          state: { cartItems, username, password },
        });
      })
      .catch((error) => {
        console.error("Error adding to cart:", error);
        alert("Failed to add book to cart.");
      });
  };

 const handleLogout = () => {
   setTimeout(() => {
            window.location.reload();
          }, 1000);
    navigate("/");
  };


  return (
    <div className="cart-page-container">
      <div className="header">
        <h1 className="bookstore-heading">Online Book Store</h1>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
      <h2>My Cart</h2>
      <div className="cart-items-list">
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <div key={item.book.id} className="cart-item">
              <div className="remove-btn-container">
                <button className="remove-btn" onClick={() => handleRemoveItem(item.book.id)}>
                  <FaTrash />
                </button>
              </div>
              <div className="item-details">
                <h3>{item.book.title}</h3>
                <p>Author: {item.book.author}</p>
                <p>Price: €{item.book.price.toFixed(2)}</p>
              </div>
              <div className="quantity-container">
                <label htmlFor={`quantity-${item.book.id}`} className="quantity-label">
                  Quantity:
                </label>
                <div className="quantity-picker-cart">
                  <button
                    className="quantity-btn"
                    onClick={() => decrementQuantity(item.book.id, item.quantity)}
                    disabled={item.quantity <= 1}
                  > -
                  </button>
                  <input
                    type="text"
                    value={item.quantity}
                    readOnly
                    className="quantity-input"
                  />
                  <button
                    className="quantity-btn"
                    onClick={() => incrementQuantity(item.book.id, item.quantity)}
                    disabled={item.quantity >= 50}
                  >
                    +
                  </button>
                </div>
                <span className="total-price">
                  Total: €{(item.book.price * item.quantity).toFixed(2)}
                </span>
              </div>

            </div>
          ))
        ) : (
          <p>Your cart is empty.</p>
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="checkout-section">
          <p><strong>Grand Total:</strong> €{grandTotal.toFixed(2)}</p>
          <button className="continue-shopping-button" onClick={handleGoHome}>
                    Continue Shopping
          </button>
          <button className="checkout-button" onClick={handleCheckout}>
            Checkout Order
          </button>

        </div>
      )}
    </div>
  );
};

export default ShoppingCart;
