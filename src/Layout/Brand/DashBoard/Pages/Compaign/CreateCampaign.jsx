import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateCampaign = () => {
  const [dealImage, setDealImage] = useState(null);
  const [campaignDes, setCampaignDes] = useState('');
  const [taskDes, setTaskDes] = useState('');
  const [category, setCategory] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [followers, setFollowers] = useState('');
  const [engagementRate, setEngagementRate] = useState('');
  const [budget, setBudget] = useState('');
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setDealImage(file); // Save file object instead of base64
    } else {
      setError('Please upload a valid image file.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Clear previous errors

    const formData = new FormData();
    formData.append('blogMainImg', dealImage); // Append image file
    formData.append('campaignDes', campaignDes);
    formData.append('taskDes', taskDes);
    formData.append('category', category);
    formData.append('platform', platform);
    formData.append('followers', followers);
    formData.append('engagementRate', engagementRate);
    formData.append('budget', budget);

    try {
      const response = await axios.post('/Brand/addCampaign', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Add your token or authorization header here
        }
      });
      setSuccess(true);
      setTimeout(() => {
        navigate(-1); // Go back to the previous page
      }, 1000); // Delay to show success message
    } catch (err) {
      console.error(err);
      setError('Failed to create campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-5 w-full max-w-xl mx-auto h-screen px-4">
      <div className="p-6 sm:p-8 rounded-lg border-2 bg-white shadow-lg">
        <h1 className="text-2xl font-semibold mb-4">Create Campaign</h1>
        {success && <div className="bg-green-200 text-green-800 p-2 rounded mb-4">Campaign created successfully!</div>}
        {error && <div className="bg-red-200 text-red-800 p-2 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Followers Count and Image Area */}
          <div className="flex gap-4 mb-6">
            {/* Followers Count */}
            <div className="flex-1">
              <label className="block text-gray-700 text-sm mb-2">Followers Count</label>
              <input
                type="number"
                value={followers}
                onChange={(e) => setFollowers(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            {/* Image Area */}
            <div
              className={`flex-none w-24 h-24 border-2 border-dashed rounded-full flex justify-center items-center ${dragging ? 'bg-gray-100' : 'bg-gray-50'}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {dealImage ? (
                <img src={URL.createObjectURL(dealImage)} alt="Deal" className="w-full h-full object-cover rounded-full" />
              ) : (
                <p className="text-gray-500 text-xs text-center">Drag & drop</p>
              )}
            </div>
          </div>

          {/* Budget and Engagement Rate */}
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-gray-700 text-sm mb-2">Engagement Rate (%)</label>
              <input
                type="number"
                step="0.01"
                value={engagementRate}
                onChange={(e) => setEngagementRate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 text-sm mb-2">Budget</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
          </div>

          {/* Category and Platform */}
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-gray-700 text-sm mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="" disabled>Select category</option>
                <option value="Clothing">Clothing</option>
                <option value="Watches">Watches</option>
                <option value="Shampoo">Shampoo</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 text-sm mb-2">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="Instagram">Instagram</option>
              </select>
            </div>
          </div>

          {/* Task and Campaign Description */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm mb-2">Task Description</label>
            <textarea
              value={taskDes}
              onChange={(e) => setTaskDes(e.target.value)}
              className="w-full px-3 py-2 border rounded-md resize-none"
              required
              style={{ height: '100px' }} // Fixed height
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm mb-2">Campaign Description</label>
            <textarea
              value={campaignDes}
              onChange={(e) => setCampaignDes(e.target.value)}
              className="w-full px-3 py-2 border rounded-md resize-none"
              required
              style={{ height: '100px' }} // Fixed height
            />
          </div>

          <button
            type="submit"
            className={`w-full py-2 px-4 rounded-md text-white font-semibold ${loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'}`}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Campaign'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaign;