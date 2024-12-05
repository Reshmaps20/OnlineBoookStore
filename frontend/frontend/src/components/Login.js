import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheck, FaTimes } from 'react-icons/fa';
import axios from "axios";
import "./Login.css";

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [isPasswordMatch, setIsPasswordMatch] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [hasTypedConfirmPassword, setHasTypedConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "confirmPassword") {
      setHasTypedConfirmPassword(true);
      setIsPasswordMatch(formData.password === e.target.value);
    }
  };

  const validateLoginForm = () => {
    if (!formData.username || !formData.password) {
      return false;
    }
    return true;
  };

  const validateRegisterForm = () => {
    if (!formData.username || !formData.password || !formData.firstName || !formData.lastName ||
      formData.password !== formData.confirmPassword) {
      return false;
    }
    return true;
  };

  const handleRegister = async () => {

    try {
      const response = await axios.post("http://localhost:8080/api/register", {
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });
      const responseData = response.data;
      console.log("responseData:", responseData);
      if (responseData.validResponse) {
        setSuccessMessage(responseData.message);
        setErrorMessage("");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setSuccessMessage("");
        setErrorMessage(responseData.message);
      }
    } catch (error) {
      console.log("error:", error.response.data.message);
      setSuccessMessage("");
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("An unexpected error occurred. Please try again later.");
      }
    }
  };

  const handleLogin = async () => {
    console.log("Attempting login with username:", formData.username);
    try {
      const response = await axios.post("http://localhost:8080/api/login", {
        username: formData.username,
        password: formData.password,
      });

      const responseData = response.data;
      console.log("Login response:", response);

      if (responseData.validResponse) {
        setSuccessMessage(responseData.message);
        setErrorMessage("");

        navigate("/books", {
          state: {
            username: formData.username,
            password: formData.password,
          },
        });
      } else {
        setSuccessMessage("");
        setErrorMessage(responseData.message);
      }
    } catch (error) {
      console.log("error:", error.response);
      if (error.response) {
        const errorMessage = error.response.data.message;
        console.log("Backend error message:", errorMessage);
        setErrorMessage(errorMessage);
      } else {
        setErrorMessage("An unexpected error occurred. Please try again later.");
      }
      setSuccessMessage("");
    }
  };

  const handleNewUser = () => {
    setIsRegister(!isRegister);
    setFormData({ username: "", password: "", firstName: "", lastName: "", confirmPassword: "" });
    setErrorMessage("");
  };

  const passwordMatch = formData.password === formData.confirmPassword;

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>{isRegister ? "Register" : "Login"}</h1>

        {successMessage && <div className="success-message">{successMessage}</div>}
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <span className="info-message">(Please fill all the details)</span>

        <div className="form-group">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
          />
        </div>

        {isRegister && (
          <>
            <div className="form-group">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </>
        )}

        <div className="form-group">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        {isRegister && (
          <>
            <div className="form-group confirm-password-container">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {hasTypedConfirmPassword && (
                <div className="password-validation-icon">
                  {isPasswordMatch ? (
                    <FaCheck style={{ color: "green" }} />
                  ) : (
                    <FaTimes style={{ color: "red" }} />
                  )}
                </div>
              )}
            </div>
          </>
        )}
        <button
          className="form-button"
          onClick={isRegister ? handleRegister : handleLogin}
          disabled={isRegister ? !validateRegisterForm() : !validateLoginForm()}
        >
          {isRegister ? "Register" : "Login"}
        </button>

        <button
          className={`form-button ${isRegister ? 'already-user' : ''}`}
          onClick={handleNewUser}
        >
          {isRegister ? "Already a user?" : "New User"}
        </button>
      </div>
    </div>
  );
};

export default Login;
