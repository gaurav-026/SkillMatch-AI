import dotenv from 'dotenv';
dotenv.config(); // Load .env before anything else

import express from 'express';
import cors from 'cors';
import { initializePinecone } from './utils/pineconeClient'; // Modularized Pinecone setup
import routes from './routes/routes';


const app = express();
const port = process.env.PORT || 4001;



// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json()); // Parse JSON requests
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1', routes); // Modular route handling

// Start Express Server
const startServer = async () => {
    try {
        await initializePinecone(); // Initialize Pinecone before server starts
        app.listen(port, () => {
            console.log(`✅ Server is running on PORT ${port}`);
        });
    } catch (error) {
        console.error('❌ Server failed to start:', error);
        process.exit(1); // Exit if there's a fatal error
    }
};

startServer();
