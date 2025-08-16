const { CosmosClient } = require('@azure/cosmos');
const { BlobServiceClient } = require('@azure/storage-blob');
const { TextAnalyticsClient, AzureKeyCredential } = require('@azure/ai-text-analytics');

const cosmosClient = new CosmosClient({ endpoint: process.env.COSMOS_ENDPOINT, key: process.env.COSMOS_KEY });
const database = cosmosClient.database('VideoDB');
const videoContainer = database.container('Videos');
const userContainer = database.container('Users');
const commentContainer = database.container('Comments');

const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.STORAGE_CONNECTION_STRING);
const textAnalyticsClient = new TextAnalyticsClient(process.env.COGNITIVE_ENDPOINT, new AzureKeyCredential(process.env.COGNITIVE_KEY));

module.exports = { videoContainer, userContainer, commentContainer, blobServiceClient, textAnalyticsClient };