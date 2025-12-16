import { createContext, useReducer, useEffect } from 'react';
import axiosInstance from '../api/axios';

export const AuthContext = createContext();

const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  CHECK_AUTH_START: 'CHECK_AUTH_START',
  CHECK_AUTH_SUCCESS: 'CHECK_AUTH_SUCCESS',
  CHECK_AUTH_FAILURE: 'CHECK_AUTH_FAILURE',
};

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.CHECK_AUTH_START:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.CHECK_AUTH_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.CHECK_AUTH_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      dispatch({ type: AUTH_ACTIONS.CHECK_AUTH_FAILURE, payload: null });
      return;
    }

    try {
      dispatch({ type: AUTH_ACTIONS.CHECK_AUTH_START });
      const user = JSON.parse(userStr);
      
      dispatch({
        type: AUTH_ACTIONS.CHECK_AUTH_SUCCESS,
        payload: { user, token },
      });
    } catch (error) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      dispatch({
        type: AUTH_ACTIONS.CHECK_AUTH_FAILURE,
        payload: error.message,
      });
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      const usersStr = localStorage.getItem('users');
      const users = usersStr ? JSON.parse(usersStr) : [];

      const emailLower = userData.email.toLowerCase().trim();
      const existingUser = users.find(u => u.email.toLowerCase() === emailLower);

      if (existingUser) {
        const errorMessage = 'Email already exists';
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: errorMessage,
        });
        return { success: false, error: errorMessage };
      }

      const userId = Math.floor(Math.random() * 10) + 1;
      const user = {
        id: userId,
        name: userData.name.trim(),
        email: userData.email.trim(),
      };
      const token = `fake_token_${userId}`;

      users.push({
        ...user,
        password: userData.password,
      });
      localStorage.setItem('users', JSON.stringify(users));

      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Registration failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      const demoCredentials = {
        email: 'demo@example.com',
        password: 'demo123',
      };

      await new Promise(resolve => setTimeout(resolve, 500));

      if (
        credentials.email === demoCredentials.email &&
        credentials.password === demoCredentials.password
      ) {
        const user = {
          id: 1,
          email: credentials.email,
          name: 'Demo User',
        };
        const token = 'demo_token_' + Date.now();

        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, token },
        });

        return { success: true };
      }

      const usersStr = localStorage.getItem('users');
      const users = usersStr ? JSON.parse(usersStr) : [];

      const emailLower = credentials.email.toLowerCase().trim();
      const user = users.find(u => u.email.toLowerCase() === emailLower);

      if (!user || user.password !== credentials.password) {
        const errorMessage = 'Invalid email or password';
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: errorMessage,
        });
        return { success: false, error: errorMessage };
      }

      const { password, ...userWithoutPassword } = user;
      const token = `fake_token_${user.id}`;

      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user: userWithoutPassword, token },
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Invalid email or password';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  const value = {
    ...state,
    register,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

