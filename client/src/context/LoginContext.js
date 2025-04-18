import React, { createContext, useContext, useEffect, useReducer, useState } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';

const LoginContext = createContext();

export const useLogin = () => useContext(LoginContext);

const initialState = {
  singleProduct: [{}]
};

// Add reducer function
const reducer = (state, action) => {
  switch (action.type) {
    case "SET_SINGLE_PRODUCT":
      return {
        ...state,
        singleProduct: action.payload
      };
    default:
      return state;
  }
};

export const LoginProvider = ({ children }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState('');
  const [isLogged, setisLogged] = useState(Cookies.get('token'));
  const [user, setUser] = useState('');
  const [products, setProducts] = useState([]);
  
  // Initialize reducer with initialState
  const [state, dispatch] = useReducer(reducer, initialState);

  const Storetoken = (serverToken) => {
    return Cookies.set("token", serverToken, { expires: 20 });
  };

  let isLog = !!isLogged;

  const LogoutUser = () => {
    setIsLoggedIn(" ");
    localStorage.removeItem("token");
  }

  const userAuthentication = async () => {
    try {
      // Get token from cookies
      const token = Cookies.get('token');
      
      if (!token) {
        console.log("No token found");
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_BACKEND_API}/api/auth/getUser`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.userData);
      } else {
        throw new Error(data.message || 'Authentication failed');
      }
    } catch (error) {
      console.error("Authentication error:", error);
      // Clear invalid token
      if (error.message.includes('token')) {
        Cookies.remove('token');
        setisLogged(null);
      }
    }
  }

  let Api = `${process.env.REACT_APP_PRODUCT_API}/api/card/filterCat?nameType=Men`;

  const fetchApiData = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };
  

  const getSingleProduct = async (url) => {
    try {
      let res = await axios.get(url);
      let product = await res.data;
      console.log('Product Data:', product);
      dispatch({ type: "SET_SINGLE_PRODUCT", payload: product })
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    userAuthentication()
    fetchApiData(Api);
  }, []);

  return (
    <LoginContext.Provider value={{ 
      ...state, 
      getSingleProduct,
      isLog, 
      products, 
      user, 
      Storetoken, 
      isLoggedIn, 
      showLogin, 
      setShowLogin, 
      username, 
      setUsername, 
      LogoutUser 
    }}>
      {children}
    </LoginContext.Provider>
  );
};