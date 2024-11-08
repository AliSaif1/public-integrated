import mongoose from "mongoose";

// Schema for IssueStatistics
const issueStatisticsSchema = new mongoose.Schema({
    Contract: {
        type: Number,
        required: true
    },
    Payment: {
        type: Number,
        required: true
    },
    Account: {
        type: Number,
        required: true
    },
    Others: {
        type: Number,
        required: true
    },
    Pending: {
        type: Number,
        required: true
    },
    Resolved: {
        type: Number,
        required: true
    },
    Progress: {
        type: Number,
        required: true
    }
});

// Creating Models
const IssueStatistics = mongoose.model('SupportStatistics', issueStatisticsSchema);

export default IssueStatistics
