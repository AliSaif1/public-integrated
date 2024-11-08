import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false); // Initially set to false
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);
  const limit = 15;
  const navigate = useNavigate();

  const fetchBlogs = async () => {
    setLoading(true); // Start loading
    try {
      const response = await axios.get(`/influencer/allBlogs`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        params: { skip, limit },  // Pass skip and limit as query parameters
      });

      const result = response.data;
      const newPosts = result.blogs || [];
      setPosts(prevPosts => [...prevPosts, ...newPosts]);  // Append new posts to existing posts
      setHasMore(result.hasMore);  // Update the state based on whether there are more posts
      setSkip(prevSkip => prevSkip + limit);  // Update skip for the next fetch
    } catch (err) {
      setError('Error fetching blogs');
      console.error('Error:', err);
    } finally {
      setLoading(false); // End loading
    }
  };

  useEffect(() => {
    fetchBlogs();  // Initial fetch
  }, []);

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchBlogs();
    }
  };

  return (
    <div className="sm:w-[500px] mdm:w-[600px] lg:w-[900px] mx-auto pt-5 h-screen">
      <div className="space-y-5">
        {loading && !posts.length ? (
          <div className="centered-spinner">
            <div className="spinner"></div>
          </div>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-500">No blogs available.</p>
        ) : (
          posts.map((post) => (
            <BlogPost
              key={post._id}
              ID={post._id}
              Title={post.title}
              Body={post.body}
              Time={new Date(post.postedAt).toLocaleTimeString()}
              Image={post.blogMainImg}
              Likes={post.likes}
              Shares={post.shares}
              IsLiked={post.liked}  // Pass the liked status
            />
          ))
        )}
        {hasMore && (
          <div className="flex justify-center mt-5">
            <button
              onClick={loadMore}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg shadow-lg hover:bg-orange-600 transition-colors duration-300"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const BlogPost = ({ ID, Title, Body, Time, Image, Likes, Shares, IsLiked }) => {
  const [liked, setLiked] = useState(IsLiked); // Initialize with the liked status
  const [likesCount, setLikesCount] = useState(Likes); // Initialize with the likes count
  const truncatedBody = Body.length > 250 ? Body.substring(0, 250) + '...' : Body;
  const navigate = useNavigate();

  const handleReadMore = () => {
    navigate('/Blog/show-blog', {
      state: {
        blogPost: {
          imageLink: Image,
          title: Title,
          body: Body,
          likes: likesCount,
          shares: Shares,
          id: ID,
          likedStatus: liked
        },
      },
    });
  };

  const handleLike = async () => {
    try {
      await axios.post('/influencer/likePost', { postId: ID }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      setLiked(!liked); // Toggle the like status
      setLikesCount(prevLikes => liked ? prevLikes - 1 : prevLikes + 1); // Adjust like count based on the new liked status
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  return (
    <div className="bg-white mx-auto sm:w-[500px] mdm:w-[600px] lg:w-[700px] rounded-xl p-2 text-[9px] xs:text-[10px] sm:text-[13px] md:text-[11px]">
      <div className="p-2 grid grid-cols-12">
        <div className="col-span-9">
          <p className="text-[12px] mdm:text-lg lato-bold">{Title}</p>
          <p className="poppins-regular mt-1">
            {truncatedBody}
            {Body.length > 250 && (
              <span
                onClick={handleReadMore}
                className="ml-2 text-orange-500 cursor-pointer"
              >
                Read more
              </span>
            )}
          </p>
          <div className="flex justify-between mt-2">
            <p className="text-black/50">{Time}</p>
            <div>
              <img src="/Svg/More.svg" alt="More" />
            </div>
          </div>

          {/* Likes, Comments, and Shares Section with SVGs */}
          <div className="mt-2 flex gap-4">
            <p className="flex items-center gap-x-1">
              <button
                className={`focus:outline-none p-0 ${liked ? 'bg-orange' : 'bg-transparent'}`}
                onClick={handleLike}
              >
                <img
                  src={`/Svg/Heart${liked ? '2' : ''}.svg`} // Use filled heart for liked
                  className="Avatar size-[15px]"
                  alt="Likes"
                />
              </button>
              <span>{likesCount}</span>
            </p>
            <p className="flex items-center gap-x-1">
              <img src="/Svg/Comment.svg" className="Avatar size-[15px]" alt="Comments" />
              <span>{Shares}</span>
            </p>
          </div>
        </div>
        <div className="col-span-3 flex justify-center items-center">
          <div className="flex size-[60px] xs:size-[80px] sm:size-[100px] md:size-[100px] items-center rounded-lg overflow-hidden">
            <img className="aspect-square Avatar-v1" src={Image} alt="Blog Post" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;