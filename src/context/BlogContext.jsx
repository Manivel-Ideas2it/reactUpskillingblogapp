import { createContext, useReducer, useEffect, useContext } from 'react';
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

  const getUserModificationsKey = (userId) => {
    return userId ? `blog_modifications_${userId}` : null;
  };

  const getUserDeletedApiBlogsKey = (userId) => {
    return userId ? `deleted_api_blogs_${userId}` : null;
  };

  const isApiBlog = (blogId) => {
    const blogIdStr = String(blogId);
    return blogIdStr.match(/^\d+$/) && blogIdStr.length <= 3;
  };

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      dispatch({ type: BLOG_ACTIONS.FETCH_BLOGS_SUCCESS, payload: [] });
      return;
    }

    fetchBlogs();
  }, [user?.id, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const storageKey = getUserBlogsKey(user.id);
    const modificationsKey = getUserModificationsKey(user.id);
    const deletedKey = getUserDeletedApiBlogsKey(user.id);
    
    if (!storageKey) return;

    const userCreatedBlogs = state.blogs.filter(blog => !isApiBlog(blog.id));
    const apiBlogModifications = {};
    const deletedApiBlogIds = [];

    state.blogs.forEach(blog => {
      if (isApiBlog(blog.id)) {
        const originalApiBlog = {
          id: blog.id,
          title: blog.title,
          description: blog.description,
          userId: blog.userId,
        };
        
        const hasModifications = 
          blog.category || 
          blog.tags || 
          blog.authorName || 
          blog.updatedAt ||
          blog.title !== originalApiBlog.title ||
          blog.description !== originalApiBlog.description;

        if (hasModifications) {
          apiBlogModifications[blog.id] = {
            title: blog.title,
            description: blog.description,
            category: blog.category || '',
            tags: blog.tags || '',
            authorName: blog.authorName || '',
            updatedAt: blog.updatedAt || blog.createdAt,
          };
        }
      }
    });

    if (userCreatedBlogs.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(userCreatedBlogs));
    }

    if (Object.keys(apiBlogModifications).length > 0) {
      localStorage.setItem(modificationsKey, JSON.stringify(apiBlogModifications));
    } else if (modificationsKey) {
      localStorage.removeItem(modificationsKey);
    }
  }, [state.blogs, user?.id, isAuthenticated]);

  const fetchBlogs = async () => {
    try {
      if (!isAuthenticated || !user?.id) {
        dispatch({ type: BLOG_ACTIONS.FETCH_BLOGS_SUCCESS, payload: [] });
        return;
      }

      dispatch({ type: BLOG_ACTIONS.FETCH_BLOGS_START });
      
      const userId = typeof user.id === 'number' ? user.id : parseInt(user.id, 10);
      if (isNaN(userId) || userId < 1 || userId > 10) {
        dispatch({ type: BLOG_ACTIONS.FETCH_BLOGS_SUCCESS, payload: [] });
        return;
      }

      const response = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch blogs from API');
      }

      const posts = await response.json();
      const apiBlogs = posts.map(post => ({
        id: String(post.id),
        title: post.title,
        description: post.body,
        userId: post.userId,
        category: '',
        tags: '',
        authorName: '',
        createdAt: new Date().toISOString(),
      }));

      const storageKey = getUserBlogsKey(user.id);
      const modificationsKey = getUserModificationsKey(user.id);
      const deletedKey = getUserDeletedApiBlogsKey(user.id);
      
      let userCreatedBlogs = [];
      let apiBlogModifications = {};
      let deletedApiBlogIds = [];

      if (storageKey) {
        try {
          const storedBlogs = localStorage.getItem(storageKey);
          if (storedBlogs) {
            userCreatedBlogs = JSON.parse(storedBlogs);
          }
        } catch (error) {
          console.error('Error loading user-created blogs:', error);
        }
      }

      if (modificationsKey) {
        try {
          const storedModifications = localStorage.getItem(modificationsKey);
          if (storedModifications) {
            apiBlogModifications = JSON.parse(storedModifications);
          }
        } catch (error) {
          console.error('Error loading blog modifications:', error);
        }
      }

      if (deletedKey) {
        try {
          const storedDeleted = localStorage.getItem(deletedKey);
          if (storedDeleted) {
            deletedApiBlogIds = JSON.parse(storedDeleted);
          }
        } catch (error) {
          console.error('Error loading deleted API blogs:', error);
        }
      }

      const modifiedApiBlogs = apiBlogs
        .filter(blog => !deletedApiBlogIds.includes(blog.id))
        .map(blog => {
          if (apiBlogModifications[blog.id]) {
            return {
              ...blog,
              ...apiBlogModifications[blog.id],
            };
          }
          return blog;
        });

      const allBlogs = [...modifiedApiBlogs, ...userCreatedBlogs];
      dispatch({ type: BLOG_ACTIONS.FETCH_BLOGS_SUCCESS, payload: allBlogs });
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch blogs';
      dispatch({ type: BLOG_ACTIONS.FETCH_BLOGS_FAILURE, payload: errorMessage });
    }
  };

  const addBlog = async (blog) => {
    try {
      if (!isAuthenticated || !user?.id) {
        return { success: false, error: 'User not authenticated' };
      }

      dispatch({ type: BLOG_ACTIONS.ADD_BLOG_START });
      
      const userId = typeof user.id === 'number' ? user.id : parseInt(user.id, 10);
      
      try {
        const apiResponse = await fetch('https://jsonplaceholder.typicode.com/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: blog.title,
            body: blog.description,
            userId: userId,
          }),
        });

        if (!apiResponse.ok) {
          throw new Error('API request failed');
        }

        const apiData = await apiResponse.json();
        const userCreatedId = Date.now().toString() + Math.random().toString(36).slice(2, 11);
        
        const newBlog = {
          ...blog,
          id: userCreatedId,
          userId: user.id,
          createdAt: new Date().toISOString(),
          isUserCreated: true,
        };

        dispatch({ type: BLOG_ACTIONS.ADD_BLOG_SUCCESS, payload: newBlog });
        
        return { success: true, blog: newBlog };
      } catch (apiError) {
        const newBlog = {
          ...blog,
          id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
          userId: user.id,
          createdAt: new Date().toISOString(),
          isUserCreated: true,
        };

        dispatch({ type: BLOG_ACTIONS.ADD_BLOG_SUCCESS, payload: newBlog });
        
        return { success: true, blog: newBlog };
      }
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

      const isApi = isApiBlog(updatedBlog.id);
      
      if (isApi) {
        try {
          const apiResponse = await fetch(`https://jsonplaceholder.typicode.com/posts/${updatedBlog.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: parseInt(updatedBlog.id, 10),
              title: updatedBlog.title,
              body: updatedBlog.description,
              userId: existingBlog.userId,
            }),
          });

          if (!apiResponse.ok) {
            throw new Error('API request failed');
          }
        } catch (apiError) {
          console.warn('API update failed, storing locally:', apiError);
        }
      } else {
        try {
          const userId = typeof user.id === 'number' ? user.id : parseInt(user.id, 10);
          const apiResponse = await fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: updatedBlog.title,
              body: updatedBlog.description,
              userId: userId,
            }),
          });

          if (!apiResponse.ok) {
            throw new Error('API request failed');
          }
        } catch (apiError) {
          console.warn('API update call made (user-created blog):', apiError);
        }
      }
      
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
      
      const isApi = isApiBlog(blogId);
      
      if (isApi) {
        try {
          const apiResponse = await fetch(`https://jsonplaceholder.typicode.com/posts/${blogId}`, {
            method: 'DELETE',
          });

          if (!apiResponse.ok) {
            throw new Error('API request failed');
          }

          const deletedKey = getUserDeletedApiBlogsKey(user.id);
          if (deletedKey) {
            try {
              const existingDeleted = localStorage.getItem(deletedKey);
              const deletedIds = existingDeleted ? JSON.parse(existingDeleted) : [];
              if (!deletedIds.includes(blogId)) {
                deletedIds.push(blogId);
                localStorage.setItem(deletedKey, JSON.stringify(deletedIds));
              }
            } catch (error) {
              console.error('Error saving deleted API blog:', error);
            }
          }
        } catch (apiError) {
          console.warn('API delete failed, storing locally:', apiError);
          const deletedKey = getUserDeletedApiBlogsKey(user.id);
          if (deletedKey) {
            try {
              const existingDeleted = localStorage.getItem(deletedKey);
              const deletedIds = existingDeleted ? JSON.parse(existingDeleted) : [];
              if (!deletedIds.includes(blogId)) {
                deletedIds.push(blogId);
                localStorage.setItem(deletedKey, JSON.stringify(deletedIds));
              }
            } catch (error) {
              console.error('Error saving deleted API blog:', error);
            }
          }
        }
      } else {
        try {
          const apiResponse = await fetch(`https://jsonplaceholder.typicode.com/posts/1`, {
            method: 'DELETE',
          });

          if (!apiResponse.ok) {
            throw new Error('API request failed');
          }
        } catch (apiError) {
          console.warn('API delete call made (user-created blog):', apiError);
        }
      }
      
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
    const blog = state.blogs.find(blog => String(blog.id) === String(blogId));
    if (!blog) return null;
    const userId = typeof user.id === 'number' ? user.id : parseInt(user.id, 10);
    const blogUserId = typeof blog.userId === 'number' ? blog.userId : parseInt(blog.userId, 10);
    return blogUserId === userId ? blog : null;
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