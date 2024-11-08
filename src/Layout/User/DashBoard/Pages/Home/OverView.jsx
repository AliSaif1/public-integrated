import './Index.css';
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ShowComments from './showComments';

const OverView = () => {
  const [customData, setCustomData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 15;

  const fetchData = async () => {
    try {
      const response = await axios.get('/influencer/allBlogs', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        params: { skip, limit },
      });
      const result = response.data;
      const newPosts = result.blogs || [];

      setCustomData(prevData => [...prevData, ...newPosts]);
      setHasMore(result.hasMore);
      setSkip(prevSkip => prevSkip + limit);
    } catch (error) {
      setError('Error fetching blog data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const loadMore = () => {
    if (hasMore && !loading) {
      setLoading(true);
      fetchData();
    }
  };

  return (
    <>
      <div className="max-w-2xl mx-auto mt-2">
        <div className="h-[1px] bg-black"></div>
        {loading && !customData.length ? (
          <div className="centered-spinner">
            <div className="spinner"></div>
          </div>
        ) : error ? (
          <div className="text-center mt-4">
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <>
            {customData.map(post => (
              <Post
                key={post._id}
                userImage={post.author.photo}
                userName={post.author.fullName}
                postTime={new Date(post.postedAt).toLocaleString()}
                postImage={post.blogMainImg}
                likesCount={post.likes}
                postTitle={post.title}
                postID={post._id}
                isLiked={post.liked}
                isSaved={post.saved}
                commentsCount={post.commentsCount}
              />
            ))}
            {hasMore && (
              <div className="text-center mt-4">
                <button
                  onClick={loadMore}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
            {!hasMore && (
              <div className="text-center mt-4">
                <p className="text-gray-500 font-semibold">No more posts to load</p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

const Post = ({ userImage, userName, postTime, postImage, likesCount, postTitle, postID, isLiked, isSaved, commentsCount }) => {
  const [imageDimensions, setImageDimensions] = useState({ width: 'auto', height: 'auto' });
  const [liked, setLiked] = useState(isLiked);
  const [savedPost, setSavedPost] = useState(isSaved);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [likeCount, setLikesCount] = useState(likesCount);
  const [commentCount, setCommentsCount] = useState(commentsCount);
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false); // New state to show comments

  const handleImageLoad = (event) => {
    const { naturalWidth, naturalHeight } = event.target;
    setImageDimensions(naturalWidth > naturalHeight 
      ? { width: '100%', height: '300px' } 
      : { width: 'auto', height: '300px' });
  };

  const handleLike = useCallback(async () => {
    try {
      setActionLoading(true);
      await axios.post('/influencer/likePost', { postId: postID }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
  
      setLiked(prevLiked => {
        const newLikedState = !prevLiked;
        setLikesCount(prevCount => newLikedState ? prevCount + 1 : prevCount - 1);
        return newLikedState;
      });
    } catch (error) {
      setActionError('Error liking the post');
      console.error('Error liking post:', error);
    } finally {
      setActionLoading(false);
    }
  }, [postID, liked]);

  const handleSavePost = useCallback(async () => {
    try {
      setActionLoading(true);
      await axios.post('/influencer/savePost', { postId: postID }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      setSavedPost(!savedPost);
    } catch (error) {
      setActionError('Error saving the post');
      console.error('Error saving post:', error);
    } finally {
      setActionLoading(false);
    }
  }, [postID, savedPost]);

  return (
    <div className="p-4 border border-gray-200 rounded-lg mt-4 text-[9px] xs:text-[10px] sm:text-[13px] md:text-[12px]">
      <div className="flex items-center justify-between space-x-4 mb-2">
        <div className="flex items-center space-x-2">
          <div className="flex size-[60px] xs:size-[80px] sm:size-[100px] md:size-[60px] items-center border-2 p-[1px] rounded-full">
            <img className="aspect-square Avatar" src={userImage} alt="" />
          </div>
          <div>
            <p className="font-bold text-[14px]">{userName}</p>
            <p className="text-[9px] text-gray-500">{postTime}</p>
          </div>
        </div>
        <div>
          <img src="/Svg/More.svg" alt="more options" className="more-icon bg-orange" />
        </div>
      </div>
      <div className="mx-auto flex justify-center" style={{ maxWidth: '500px', maxHeight: '500px' }}>
        <img
          className="object-right-top object-cover"
          src={postImage}
          alt=""
          style={{ width: imageDimensions.width, height: imageDimensions.height }}
          onLoad={handleImageLoad}
        />
      </div>
      <div className="mt-2 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <button
              className={`focus:outline-none p-0 ${liked ? 'bg-orange' : 'bg-transparent'}`}
              onClick={handleLike}
            >
              <img src="/Svg/Heart2.svg" alt="like button" />
            </button>
            <span className="ml-1">{likeCount}</span>
          </div>
          <div className="flex items-center">
            <button className="focus:outline-none bg-transparent p-0" onClick={() => {
              console.log('Button clicked');
              setShowComments(true)}}>
              <img src="/Svg/Comment2.svg" alt="comment button" className="bg-transparent" />
            </button>
            <span className="ml-1">{commentCount}</span>
          </div>
        </div>
        <button
          className={`focus:outline-none p-0 ${savedPost ? 'bg-orange' : 'bg-transparent'}`}
          onClick={handleSavePost}
        >
          <img src="/Svg/Bookmark2.svg" alt="bookmark button" className="bg-transparent" />
        </button>
      </div>
      {actionError && <p className="text-red-500">{actionError}</p>}
      <div className="mt-2">
        <h2 className="font-bold text-[14px]">{postTitle}</h2>
      </div>
      {/* Comment Input Field */}
      <form className="mt-1 flex items-center">
        <input
          type="text"
          placeholder="Add a comment..."
          className="w-full placeholder:text-[11px] outline-none bg-inherit border-b-2 pb-2 border-black/30 focus:ring-0 text-sm"
          onFocus={() => setShowComments(true)}
        />
      </form>

      {/* Show Comments Component */}
      <ShowComments postID={postID} show={showComments} onClose={() => setShowComments(false)} />
    </div>
  );
};

export default OverView;