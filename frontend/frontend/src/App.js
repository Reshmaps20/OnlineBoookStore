import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import BookStore from "./components/BookStore";
import ShoppingCart from "./components/ShoppingCart";
import OrderSummary from "./components/OrderSummary";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/books" element={<BookStore />} />
         <Route path="/cart" element={<ShoppingCart />} />
          <Route path="/orderSummary" element={<OrderSummary />} />
      </Routes>
    </Router>
  );
}

export default App;
