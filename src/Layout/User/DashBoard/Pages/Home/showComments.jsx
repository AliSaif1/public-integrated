import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ShowComments = ({ postID, show, onClose }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState(''); // State for new comment
  const commentsRef = useRef(null); // Reference for the comments container

  useEffect(() => {
    if (show) {
      fetchComments();
    }
  }, [show, postID]);

    const fetchComments = async () => {
        try {
        setLoading(true);
        setError(null);
        
        // Check local storage for the token
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            throw new Error('Authorization token is missing');
        }

        // Make the API request
        const response = await axios.get(`/getComments/${postID}`, {
            headers: {
            Authorization: `Bearer ${authToken}`,
            },
        });

        // Inspect the response
        console.log('API Response:', response.data);

        // Check if comments are present in the response
        const fetchedComments = response.data?.comments || {};
        console.log('Fetched Comments:', fetchedComments);
        
        setComments(fetchedComments);
        } catch (err) {
        console.error('Error fetching comments:', err);
        setError('Error fetching comments');
        } finally {
        setLoading(false);
        }
    };

  useEffect(() => {
    if (commentsRef.current) {
      commentsRef.current.scrollTop = commentsRef.current.scrollHeight;
    }
  }, [comments]);

  const handleCommentChange = (event) => {
    setNewComment(event.target.value);
  };

  const handleCommentSubmit = async () => {
    if (newComment.trim() === '') return; // Don't submit empty comments

    try {
      await axios.post(
        `/influencer/addComment/${postID}`,
        { body: newComment },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );
      setNewComment(''); // Clear input field
      fetchComments(); // Refresh comments list
    } catch (err) {
      setError('Error adding comment');
    }
  };

  return (
    <>
      {show && (
        <div
          className={`fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-4xl bg-gray-800 bg-opacity-50 shadow-lg transition-transform duration-500 ${
            show ? 'translate-y-0' : 'translate-y-full'
          } z-50`}
          style={{ width: '80%', maxWidth: '600px', minHeight: '50vh' }} // Responsive width and minimum height
        >
          <div className="flex flex-col h-full bg-gray-900 bg-opacity-80">
            <div className="p-4 flex justify-between items-center border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">Comments</h2>
              <button className="text-lg text-white" onClick={onClose}>
                X
              </button>
            </div>

            <div
              ref={commentsRef}
              className="overflow-y-scroll flex-1 p-4"
              style={{ paddingBottom: '64px' }} // Ensure space for the input field
            >
              {loading ? (
                <p className="text-white">Loading comments...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : comments.length > 0 ? (
                comments.map((comment, index) => (
                  <div key={index} className="mb-4">
                    <p className="font-semibold text-white">{comment.userName}</p>
                    <p className="text-sm text-gray-300">{comment.body}</p>
                  </div>
                ))
              ) : (
                <p className="text-white">No comments available</p>
              )}
            </div>

            <div className="p-4 border-t border-gray-700 bg-gray-800 flex items-center">
              <input
                type="text"
                placeholder="Write a comment..."
                value={newComment}
                onChange={handleCommentChange}
                className="w-full px-4 py-2 border rounded-lg bg-gray-700 text-white border-gray-600"
              />
              <button onClick={handleCommentSubmit} className="ml-2">
                <img src='Svg/Send.svg' alt="Send" className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShowComments;