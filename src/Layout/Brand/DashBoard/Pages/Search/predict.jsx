import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import InfluencerProfile from './InfluencerProfile';

const Predict = () => {
  const [inputData, setInputData] = useState({
    follower_count: '',
    Engagement_Rate: '',
    minReach: 1000, 
    maxReach: 500000,
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showInfluencerProfile, setShowInfluencerProfile] = useState(false);

  const minLimit = 10000;
  const maxLimit = 1000000;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const updatedData = {
      ...inputData,
      minReach: inputData.minReach, // Ensure minReach is used
      maxReach: inputData.maxReach, // Ensure maxReach is used
    };

    try {
      const response = await axios.post('http://127.0.0.1:5000/predict', updatedData);
      setPrediction(response.data.prediction);
    } catch (err) {
      setError('Error fetching prediction data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRangeChange = (e, type) => {
    const value = Number(e.target.value);
    if (type === 'min' && value < inputData.maxReach) {
      setInputData((prevData) => ({ ...prevData, minReach: value })); // Update minReach
    } else if (type === 'max' && value > inputData.minReach) {
      setInputData((prevData) => ({ ...prevData, maxReach: value })); // Update maxReach
    }
  };

  const formatNumberForDisplay = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    } else {
      return num;
    }
  };

  return (
    <>
      {showInfluencerProfile ? (
        <InfluencerProfile setShowInfluencerProfile={setShowInfluencerProfile} userName={prediction[0]} />
      ) : (
        <div className="flex flex-col items-center justify-center p-10 bg-gray-50">
          <h1 className="text-4xl font-bold mb-5 text-center">Predict Engagement Rates</h1>

          <form onSubmit={handleSubmit} className="w-full max-w-md bg-white shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4 border border-gray-200">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="follower_count">
                Followers
              </label>
              <input
                type="number"
                name="follower_count"
                id="follower_count"
                value={inputData.follower_count}
                onChange={handleChange}
                className="shadow-md appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
                placeholder="Enter followers count"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Reach (Min - Max)</label>
              <div className="flex items-center justify-between">
                <span className="font-medium">{formatNumberForDisplay(inputData.minReach)}</span>
                <input
                  type="range"
                  min={minLimit}
                  max={maxLimit}
                  value={inputData.minReach}
                  onChange={(e) => handleRangeChange(e, 'min')}
                  className="w-full mx-2"
                />
                <span className="font-medium">{formatNumberForDisplay(inputData.maxReach)}</span>
                <input
                  type="range"
                  min={minLimit}
                  max={maxLimit}
                  value={inputData.maxReach}
                  onChange={(e) => handleRangeChange(e, 'max')}
                  className="w-full mx-2"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="Engagement_Rate">
                Engagement Rate
              </label>
              <input
                type="number"
                name="Engagement_Rate"
                id="Engagement_Rate"
                value={inputData.Engagement_Rate}
                onChange={handleChange}
                className="shadow-md appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
                placeholder="Enter engagement rate"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
              >
                Predict
              </button>
            </div>
          </form>

          {loading && <p className="text-blue-600">Loading...</p>}
          {error && <p className="text-red-600">{error}</p>}
          {prediction && prediction.length > 0 && (
            <div className="mt-5">
              <h2 className="text-xl font-semibold">Prediction Result:</h2>
              <p className="text-gray-800">{JSON.stringify(prediction)}</p>
              <ProfileReport 
                userName={prediction[0]}
                setShowInfluencerProfile={setShowInfluencerProfile} 
              />
            </div>
          )}
        </div>
      )}
    </>
  );
};

const ProfileReport = ({ userName, setShowInfluencerProfile }) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userName) {
      const fetchReport = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await axios.get(`/Brand/getPredicitedReport/${userName}`);
          setReportData(response.data);
        } catch (err) {
          setError('Error fetching report data');
        } finally {
          setLoading(false);
        }
      };

      fetchReport();
    }
  }, [userName]);

  const formatFollowerCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count;
  };

  if (loading) return <p className="text-blue-600">Loading report...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="mt-5">
      <h2 className="text-xl font-semibold">Profile Report:</h2>
      {reportData ? (
        <div className="p-4 bg-gray-100 rounded-lg border border-gray-200">
          <p><strong>Full Name:</strong> {reportData.fullName}</p>
          <p><strong>Username:</strong> @{reportData.Name}</p>
          <p><strong>Followers:</strong> {formatFollowerCount(reportData.FollowerCount)}</p>
          <p><strong>Avg. Engagement Rate:</strong> {(reportData.AvgEngagementRate * 100).toFixed(2)}%</p>
          <button 
            onClick={() => setShowInfluencerProfile(true)}
            className="mt-4 bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
          >
            View Detailed Report
          </button>
        </div>
      ) : (
        <p>No report data available.</p>
      )}
    </div>
  );
};

export default Predict;