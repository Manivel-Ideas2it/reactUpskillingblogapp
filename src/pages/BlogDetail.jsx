import { useEffect, useContext, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BlogContext } from '../context/BlogContext';
import './BlogDetail.css';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { blogs, getBlogById } = useContext(BlogContext);

  const blog = getBlogById ? getBlogById(id) : blogs.find(b => String(b.id) === String(id));

  useEffect(() => {
    if (!blog) {
      navigate('/');
    }
  }, [blog, navigate]);

  const isApiBlog = (blogId) => {
    const blogIdStr = String(blogId);
  
    return blogIdStr.match(/^\d+$/) && blogIdStr.length <= 3;
  };

  const blogMeta = useMemo(() => {
    if (!blog) return null;

    const isApi = isApiBlog(blog.id);
    
    const sampleAuthors = [
      'John Doe',
      'Jane Smith',
      'Alex Johnson',
      'Sarah Williams',
      'Michael Brown',
      'Emily Davis',
      'David Wilson',
      'Lisa Anderson',
      'Robert Taylor',
      'Maria Garcia'
    ];

    const sampleTags = [
      'Technology',
      'Programming',
      'Web Development',
      'React',
      'JavaScript',
      'Frontend',
      'Backend',
      'Full Stack',
      'Software Engineering',
      'Code'
    ];

    const sampleCategories = [
      'Tech',
      'Development',
      'Tutorial',
      'Guide',
      'Tips',
      'Best Practices',
      'News',
      'Updates',
      'Features',
      'Documentation'
    ];

    const authorName = blog.authorName || (isApi ? sampleAuthors[parseInt(blog.id, 10) % sampleAuthors.length] : null);
    const tags = blog.tags || (isApi ? sampleTags[parseInt(blog.id, 10) % sampleTags.length] : null);
    const category = blog.category || (isApi ? sampleCategories[parseInt(blog.id, 10) % sampleCategories.length] : null);

    return {
      authorName,
      tags,
      category,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
    };
  }, [blog]);

  if (!blog || !blogMeta) {
    return null;
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const defaultImageUrl = `https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=600&fit=crop&auto=format`;
  const blogImageUrl = blog.imageUrl || defaultImageUrl;

  return (
    <div className="blog-detail-page">
      <Link to="/" className="blog-detail-back-link">
        ← Back to Dashboard
      </Link>
      
      <article className="blog-detail-article">
        <header className="blog-detail-header">
          <h1 className="blog-detail-title">{blog.title}</h1>
          
          <div className="blog-detail-author-info">
            {blogMeta.authorName && (
              <div className="blog-detail-author">
                <span className="blog-detail-author-name">{blogMeta.authorName}</span>
              </div>
            )}
            <div className="blog-detail-date">
              {blogMeta.createdAt && formatDate(blogMeta.createdAt)}
            </div>
          </div>

          {(blogMeta.category || blogMeta.tags) && (
            <div className="blog-detail-tags">
              {blogMeta.category && (
                <span className="blog-detail-tag">{blogMeta.category}</span>
              )}
              {blogMeta.tags && (
                <span className="blog-detail-tag">{blogMeta.tags}</span>
              )}
            </div>
          )}
        </header>

        <div className="blog-detail-hero-image">
          <img 
            src={blogImageUrl} 
            alt={blog.title}
            onError={(e) => {
              e.target.src = defaultImageUrl;
            }}
          />
        </div>

        <div className="blog-detail-content">
          <div className="blog-detail-description">
            {blog.description}
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogDetail;

