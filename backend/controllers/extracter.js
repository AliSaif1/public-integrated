import mongoose from 'mongoose';
import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js'; // Note the .js extension
import InstaMedia from '../models/instagramMedia.js';
import Contract from '../models/contractModel.js';
import moment from 'moment';

// Function to fetch Instagram post data
export const getInstagramPostData = async (postUrl) => {
    const options = new chrome.Options();
    options.addArguments('--headless');
    options.addArguments('--disable-gpu');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--window-size=600x1080'); // Set mobile screen size
    options.addArguments('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3');

    const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
    let postData = { likes: null, comments: null };

    try {
        await driver.get(postUrl);
        await driver.manage().window().setRect({ width: 600, height: 1080 });
        await driver.wait(until.elementLocated(By.css('article')), 15000); // Wait for the article to load

        // Attempt to fetch likes
        try {
            const likesElement = await driver.findElement(By.css(".x193iq5w > .html-span"));
            postData.likes = await likesElement.getText();
            console.log(`Likes found: ${postData.likes}`);
        } catch (error) {
            console.error("Error fetching likes: ", error);
        }

        // Attempt to fetch comments
        postData.comments = await fetchComments(driver);

        return postData;
    } catch (error) {
        console.error("Error fetching Instagram post data: ", error.stack);
        throw error;
    } finally {
        await driver.quit();
    }
};

// Function to fetch comments without fallback
const fetchComments = async (driver) => {
    const selectors = [
        ".x1i10hfl > .x1lliihq > .html-span", // Primary selector
        ".x1lliihq > .html-span", // Secondary selector
    ];

    for (const selector of selectors) {
        try {
            const commentsElement = await driver.findElement(By.css(selector));
            return await commentsElement.getText(); // Return comments text directly
        } catch (error) {
            console.error(`Error fetching comments with selector ${selector}: `, error);
        }
    }

    return null; // Return null if all attempts fail
};

// Function to parse likes and comments and remove commas
const parseSocialCount = (countStr) => {
    if (!countStr) return null; // Return null if countStr is null
    return parseInt(countStr.replace(/,/g, ''), 10) || 0; // Remove commas and parse to integer
};

// Function to update Instagram post data in the database
export const updateInstagramPostData = async () => {
    try {
        console.log("Starting Instagram post data update...");
        const now = moment();

        const activeContracts = await Contract.find({
            'milestones.deadline': { $gte: now.toDate() }
        });

        const postUrls = await InstaMedia.find({
            contractID: { $in: activeContracts.map(contract => contract._id) }
        });

        for (const post of postUrls) {
            const postUrl = post.postImageSrc;
            console.log("Url :", postUrl);

            // Check if the postUrl is valid
            if (!postUrl || !postUrl.startsWith("http")) {
                console.log(`Skipping post ${post._id}: Invalid URL (${postUrl})`);
                continue; // Skip this post if the URL is not valid
            }

            try {
                const postData = await getInstagramPostData(postUrl);
                
                // Prepare updates only if values are not null
                const updateData = {};
                if (postData.likes) {
                    updateData.likes = parseSocialCount(postData.likes);
                }
                if (postData.comments) {
                    updateData.comments = parseSocialCount(postData.comments);
                }

                // Update the database with the fetched data only if there's something to update
                if (Object.keys(updateData).length > 0) {
                    await InstaMedia.findByIdAndUpdate(post._id, updateData);
                    console.log(`Updated post ${post._id} with likes: ${postData.likes}, comments: ${postData.comments}`);
                } else {
                    console.log(`No valid updates for post ${post._id}.`);
                }
            } catch (dataError) {
                console.error(`Failed to update post ${post._id}: ${dataError.message}`);
            }

            await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds delay between requests
        }

        console.log('Instagram post data updated successfully.');
    } catch (error) {
        console.error('Error updating Instagram post data: ', error.message);
    }
};

// setInterval(updateInstagramPostData, 1 * 60 * 1000);
