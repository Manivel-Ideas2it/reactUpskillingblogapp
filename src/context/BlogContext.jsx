import { createContext, useReducer, useEffect, useContext } from 'react';
import axiosInstance from '../api/axios';
import { AuthContext } from './AuthContext';

export const BlogContext = createContext();

const BLOG_ACTIONS = {
  FETCH_BLOGS_START: 'FETCH_BLOGS_START',
  FETCH_BLOGS_SUCCESS: 'FETCH_BLOGS_SUCCESS',
  FETCH_BLOGS_FAILURE: 'FETCH_BLOGS_FAILURE',
  ADD_BLOG_START: 'ADD_BLOG_START',
  ADD_BLOG_SUCCESS: 'ADD_BLOG_SUCCESS',
  ADD_BLOG_FAILURE: 'ADD_BLOG_FAILURE',
  UPDATE_BLOG_START: 'UPDATE_BLOG_START',
  UPDATE_BLOG_SUCCESS: 'UPDATE_BLOG_SUCCESS',
  UPDATE_BLOG_FAILURE: 'UPDATE_BLOG_FAILURE',
  DELETE_BLOG_START: 'DELETE_BLOG_START',
  DELETE_BLOG_SUCCESS: 'DELETE_BLOG_SUCCESS',
  DELETE_BLOG_FAILURE: 'DELETE_BLOG_FAILURE',
};

const initialState = {
  blogs: [],
  loading: false,
  error: null,
};

const blogReducer = (state, action) => {
  switch (action.type) {
    case BLOG_ACTIONS.FETCH_BLOGS_START:
    case BLOG_ACTIONS.ADD_BLOG_START:
    case BLOG_ACTIONS.UPDATE_BLOG_START:
    case BLOG_ACTIONS.DELETE_BLOG_START:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case BLOG_ACTIONS.FETCH_BLOGS_SUCCESS:
      return {
        ...state,
        blogs: action.payload,
        loading: false,
        error: null,
      };
    case BLOG_ACTIONS.ADD_BLOG_SUCCESS:
      return {
        ...state,
        blogs: [...state.blogs, action.payload],
        loading: false,
        error: null,
      };
    case BLOG_ACTIONS.UPDATE_BLOG_SUCCESS:
      return {
        ...state,
        blogs: state.blogs.map(blog =>
          blog.id === action.payload.id ? action.payload : blog
        ),
        loading: false,
        error: null,
      };
    case BLOG_ACTIONS.DELETE_BLOG_SUCCESS:
      return {
        ...state,
        blogs: state.blogs.filter(blog => blog.id !== action.payload),
        loading: false,
        error: null,
      };
    case BLOG_ACTIONS.FETCH_BLOGS_FAILURE:
    case BLOG_ACTIONS.ADD_BLOG_FAILURE:
    case BLOG_ACTIONS.UPDATE_BLOG_FAILURE:
    case BLOG_ACTIONS.DELETE_BLOG_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

export const BlogProvider = ({ children }) => {
  const [state, dispatch] = useReducer(blogReducer, initialState);
  const { user, isAuthenticated } = useContext(AuthContext);

  const getUserBlogsKey = (userId) => {
    return userId ? `blogs_${userId}` : null;
  };

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      dispatch({ type: BLOG_ACTIONS.FETCH_BLOGS_SUCCESS, payload: [] });
      return;
    }

    const storageKey = getUserBlogsKey(user.id);
    if (!storageKey) return;

    try {
      const storedBlogs = localStorage.getItem(storageKey);
      if (storedBlogs) {
        const blogs = JSON.parse(storedBlogs);
        const userBlogs = blogs.filter(blog => blog.userId === user.id);
        dispatch({ type: BLOG_ACTIONS.FETCH_BLOGS_SUCCESS, payload: userBlogs });
      } else {
        dispatch({ type: BLOG_ACTIONS.FETCH_BLOGS_SUCCESS, payload: [] });
      }
    } catch (error) {
      dispatch({ type: BLOG_ACTIONS.FETCH_BLOGS_FAILURE, payload: 'Failed to load blogs' });
    }
  }, [user?.id, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const storageKey = getUserBlogsKey(user.id);
    if (!storageKey) return;

    const hasStoredData = localStorage.getItem(storageKey) !== null;
    if (state.blogs.length > 0 || hasStoredData) {
      localStorage.setItem(storageKey, JSON.stringify(state.blogs));
    }
  }, [state.blogs, user?.id, isAuthenticated]);

  const fetchBlogs = async () => {
    try {
      if (!isAuthenticated || !user?.id) {
        dispatch({ type: BLOG_ACTIONS.FETCH_BLOGS_SUCCESS, payload: [] });
        return;
      }

      dispatch({ type: BLOG_ACTIONS.FETCH_BLOGS_START });
      
      const storageKey = getUserBlogsKey(user.id);
      if (!storageKey) {
        dispatch({ type: BLOG_ACTIONS.FETCH_BLOGS_SUCCESS, payload: [] });
        return;
      }
      const storedBlogs = localStorage.getItem(storageKey);
      const blogs = storedBlogs ? JSON.parse(storedBlogs) : [];
      const userBlogs = blogs.filter(blog => blog.userId === user.id);
      dispatch({ type: BLOG_ACTIONS.FETCH_BLOGS_SUCCESS, payload: userBlogs });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch blogs';
      dispatch({ type: BLOG_ACTIONS.FETCH_BLOGS_FAILURE, payload: errorMessage });
    }
  };

  const addBlog = async (blog) => {
    try {
      if (!isAuthenticated || !user?.id) {
        return { success: false, error: 'User not authenticated' };
      }

      dispatch({ type: BLOG_ACTIONS.ADD_BLOG_START });
      
      const newBlog = {
        ...blog,
        id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
        userId: user.id, 
        createdAt: new Date().toISOString(),
      };

      dispatch({ type: BLOG_ACTIONS.ADD_BLOG_SUCCESS, payload: newBlog });
      
      return { success: true, blog: newBlog };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add blog';
      dispatch({ type: BLOG_ACTIONS.ADD_BLOG_FAILURE, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const updateBlog = async (updatedBlog) => {
    try {
      if (!isAuthenticated || !user?.id) {
        return { success: false, error: 'User not authenticated' };
      }

      const existingBlog = state.blogs.find(b => b.id === updatedBlog.id);
      if (!existingBlog) {
        return { success: false, error: 'Blog not found' };
      }

      if (existingBlog.userId !== user.id) {
        return { success: false, error: 'Unauthorized: Blog does not belong to current user' };
      }

      dispatch({ type: BLOG_ACTIONS.UPDATE_BLOG_START });
      
      const blogToUpdate = {
        ...existingBlog, 
        ...updatedBlog,  
        userId: existingBlog.userId, 
        updatedAt: new Date().toISOString(),
      };
      
      dispatch({ type: BLOG_ACTIONS.UPDATE_BLOG_SUCCESS, payload: blogToUpdate });
      
      return { success: true, blog: blogToUpdate };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update blog';
      dispatch({ type: BLOG_ACTIONS.UPDATE_BLOG_FAILURE, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const deleteBlog = async (blogId) => {
    try {
      if (!isAuthenticated || !user?.id) {
        return { success: false, error: 'User not authenticated' };
      }

      const blog = state.blogs.find(b => b.id === blogId);
      if (!blog) {
        return { success: false, error: 'Blog not found' };
      }
      if (blog.userId !== user.id) {
        return { success: false, error: 'Unauthorized: Blog does not belong to current user' };
      }

      dispatch({ type: BLOG_ACTIONS.DELETE_BLOG_START });
      
      dispatch({ type: BLOG_ACTIONS.DELETE_BLOG_SUCCESS, payload: blogId });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete blog';
      dispatch({ type: BLOG_ACTIONS.DELETE_BLOG_FAILURE, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const getBlogById = (blogId) => {
    if (!isAuthenticated || !user?.id) return null;
    const blog = state.blogs.find(blog => blog.id === blogId);
    return blog && blog.userId === user.id ? blog : null;
  };

  const value = {
    blogs: state.blogs,
    loading: state.loading,
    error: state.error,
    fetchBlogs,
    addBlog,
    updateBlog,
    deleteBlog,
    getBlogById,
  };

  return (
    <BlogContext.Provider value={value}>
      {children}
    </BlogContext.Provider>
  );
};