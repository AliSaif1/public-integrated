import Brand from '../models/brands.js';
import Deal from '../models/Deals.js';
import jwt from 'jsonwebtoken';
import Contract from '../models/contractModel.js'; // Adjust the import path according to your project structure
import Proposal from '../models/proposal.js'; // Import Proposal model

export const getDeals = async (req, res) => {
  try {
    const brands = await Brand.find();
    
    if (brands.length === 0) {
      return res.status(200).json({ message: 'No deals found', data: [] });
    }
    
    // Collect all deal IDs from brands
    const dealIds = brands.flatMap(brand => brand.deals.map(deal => deal.dealID));
    const deals = await Deal.find({ _id: { $in: dealIds } });
    
    const dealMap = new Map(deals.map(deal => [deal._id.toString(), deal])); // Create a map of deals by their ID for quick lookup
    
    // Update brands with detailed deal information
    const updatedBrands = brands.map(brand => {
      const updatedDeals = brand.deals.map(deal => {
        const dealDetails = dealMap.get(deal.dealID.toString());
        if (dealDetails) {
          const hasApprovedOrRequestedStatus = dealDetails.userStatuses.some(status => status.status === 'Approved'
            || status.status === 'Requested'
            || status.status === 'Invited'
          );
          if (hasApprovedOrRequestedStatus) {
            return null; // Filter out deals with "Approved" status
          }
          return {
            _id: dealDetails._id,
            dealImage: dealDetails.dealImage,
            campaignDes: dealDetails.campaignDes,
            taskDes: dealDetails.taskDes,
            category: dealDetails.category,
            platform: dealDetails.platform,
            followers: dealDetails.followers,
            engagement_Rate: dealDetails.engagement_Rate,
            userStatuses: dealDetails.userStatuses,
            budget: dealDetails.budget
          };
        }
        return null;
      }).filter(deal => deal !== null); // Remove any null deals if not found or filtered out
      
      return {
        ...brand.toObject(), // Convert Mongoose document to plain object
        deals: updatedDeals
      };
    });
    
    res.status(200).json(updatedBrands);
  } catch (error) {
    console.error('Error fetching brands and deals:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getDealsByUserID = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token is missing or invalid' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) return res.status(400).json({ message: 'Token is required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userID = decoded.id;

    const brands = await Brand.find();
    
    if (brands.length === 0) {
      return res.status(200).json({ message: 'No deals found', data: []  });
    }
    
    // Collect all deal IDs from brands
    const dealIds = brands.flatMap(brand => brand.deals.map(deal => deal.dealID));
    const deals = await Deal.find({ _id: { $in: dealIds } });

    // Create a map of deals by their ID for quick lookup
    const dealMap = new Map(deals.map(deal => [deal._id.toString(), deal]));

    // Update brands with detailed deal information
    const updatedBrands = brands.map(brand => {
      const updatedDeals = brand.deals.map(deal => {
        const dealDetails = dealMap.get(deal.dealID.toString());

        if (dealDetails) {
          // Check if userID exists in userStatuses
          const hasUserID = dealDetails.userStatuses.some(
            status => status.userID.toString() === userID.toString()
          );

          if (hasUserID) {
            return {
              _id: dealDetails._id,
              dealImage: dealDetails.dealImage,
              campaignDes: dealDetails.campaignDes,
              taskDes: dealDetails.taskDes,
              category: dealDetails.category,
              platform: dealDetails.platform,
              followers: dealDetails.followers,
              engagement_Rate: dealDetails.engagement_Rate,
              userStatuses: dealDetails.userStatuses,
              budget: dealDetails.budget
            };
          }
          return null;
        }
        return null;
      }).filter(deal => deal !== null); // Remove any null deals if not found or filtered out

      return {
        ...brand.toObject(), // Convert Mongoose document to plain object
        deals: updatedDeals
      };
    }).filter(brand => brand.deals.length > 0); // Filter out brands with no deals

    res.status(200).json(updatedBrands);
  } catch (error) {
    console.error('Error fetching brands and deals:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getApprovedDeals = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token is missing or invalid' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) return res.status(400).json({ message: 'Token is required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userID = decoded.id;

    const brands = await Brand.find();
    
    if (brands.length === 0) {
      return res.status(200).json({ message: 'No deals found', data: [] });
    }
    
    // Collect all deal IDs from brands
    const dealIds = brands.flatMap(brand => brand.deals.map(deal => deal.dealID));
    const deals = await Deal.find({ _id: { $in: dealIds } });

    // Create a map of deals by their ID for quick lookup
    const dealMap = new Map(deals.map(deal => [deal._id.toString(), deal]));

    // Update brands with detailed deal information
    const updatedBrands = brands.map(brand => {
      const updatedDeals = brand.deals.map(deal => {
        const dealDetails = dealMap.get(deal.dealID.toString());

        if (dealDetails) {
          // Check if userID exists in userStatuses and has an 'Approved' status
          const userStatus = dealDetails.userStatuses.find(
            status => status.userID.toString() === userID.toString()
          );

          if (userStatus && userStatus.status === 'Approved') {
            return {
              _id: dealDetails._id,
              dealImage: dealDetails.dealImage,
              campaignDes: dealDetails.campaignDes,
              taskDes: dealDetails.taskDes,
              category: dealDetails.category,
              platform: dealDetails.platform,
              followers: dealDetails.followers,
              engagement_Rate: dealDetails.engagement_Rate,
              userStatuses: dealDetails.userStatuses,
              budget: dealDetails.budget
            };
          }
          return null;
        }
        return null;
      }).filter(deal => deal !== null); // Remove any null deals if not found or filtered out

      return {
        ...brand.toObject(), // Convert Mongoose document to plain object
        deals: updatedDeals
      };
    }).filter(brand => brand.deals.length > 0); // Filter out brands with no deals

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');

    res.status(200).json(updatedBrands);
  } catch (error) {
    console.error('Error fetching brands and deals:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getContractDetails = async (req, res) => {
  try {
    // Extract influencerID from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization header missing or invalid' });
    }

    const token = authHeader.split(' ')[1]; // Extract influencerID from the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const influencerID = decoded.id;

    // Get the dealID from the request parameters
    const { contractID } = req.params;

    // Find the contract with the given dealID and influencerID
    const contract = await Contract.findOne({ _id: contractID, influencerID: influencerID });

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Get the last milestone
    const lastMilestone = contract.milestones[contract.milestones.length - 1];

    if (!lastMilestone) {
      return res.status(404).json({ message: 'No milestones found for this contract' });
    }

    // Prepare the response with contractID, budget, and status
    const contractDetails = {
      contractID: contract._id,
      budget: lastMilestone.budget,
      status: lastMilestone.status,
    };

    return res.status(200).json({ contractDetails }); // Include the contractDetails object in the response
  } catch (error) {
    console.error('Error fetching contract details:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const acceptContract = async (req, res) => {
  try {
    // Extract the influencerID from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Authorization header missing or invalid');
      return res.status(401).json({ message: 'Authorization header missing or invalid' });
    }

    const token = authHeader.split(' ')[1]; // Extract the token
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
    } catch (err) {
      console.error('Token verification failed:', err);
      return res.status(401).json({ message: 'Token verification failed' });
    }

    const influencerID = decoded.id; // Get the influencerID from the decoded token

    // Get the contract ID from the request parameters
    const { contractID } = req.params;

    // Find the contract by ID
    const contract = await Contract.findById(contractID);
    if (!contract) {
      console.error('Contract not found for ID:', contractID);
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Check if there are milestones in the contract
    if (contract.milestones.length === 0) {
      console.error('No milestones found for contract:', contractID);
      return res.status(404).json({ message: 'No milestones found for this contract' });
    }

    // Get the last milestone
    const lastMilestone = contract.milestones[contract.milestones.length - 1];

    // Update the status of the last milestone to "Accepted"
    lastMilestone.status = 'Payment Pending';

    // Create a new proposal from the milestone data
    const newProposal = new Proposal({
      budget: lastMilestone.budget,
      coverLetter: 'Influencer accepted invitation',
      posts: lastMilestone.posts,
      deadline: lastMilestone.deadline,
      revisions: lastMilestone.revisions,
      // other fields can be left empty or defaulted
    });

    // Save the new proposal to the database
    const savedProposal = await newProposal.save();

    // Update the contract to include the new proposal ID
    contract.proposalID = savedProposal._id; // Update the contract with the proposal ID
    await contract.save();

    // Now update the deal document
    const dealID = contract.dealID; // Assuming dealID is part of the contract
    const deal = await Deal.findById(dealID); // Find the deal by ID

    if (!deal) {
      console.error('Deal not found for ID:', dealID);
      return res.status(404).json({ message: 'Deal not found' });
    }

    // Update the userStatuses array to set the status to "Approved" for the influencer
    const userStatusIndex = deal.userStatuses.findIndex(status => status.userID.toString() === influencerID);
    
    if (userStatusIndex !== -1) {
      deal.userStatuses[userStatusIndex].status = 'Approved'; // Update the status to Approved
      deal.userStatuses[userStatusIndex].proposalID = savedProposal._id; // Save the proposal ID
    } else {
      console.error('Influencer not found in userStatuses for influencerID:', influencerID);
      return res.status(404).json({ message: 'Influencer not found in userStatuses' });
    }

    // Save the updated deal
    await deal.save();

    return res.status(200).json({ message: 'Contract accepted, deal updated, and proposal created successfully', contract, proposal: savedProposal });
  } catch (error) {
    console.error('Error accepting contract:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
