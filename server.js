// server.js

require('dotenv').config();
const express = require('express');
const OpenAI = require('openai');
const cors = require('cors');

const app = express();
const port = 3000;

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors()); // Allow requests from your frontend
app.use(express.json({ limit: '10mb' })); // To parse JSON bodies from requests

// Define the API endpoint that will generate tests
app.post('/generate-tests', async (req, res) => {
    try {
        const { openapi_spec } = req.body;

        if (!openapi_spec) {
            return res.status(400).json({ error: 'OpenAPI specification is required.' });
        }
        
        // Construct the prompt for the AI model
        const prompt = `
            You are an expert API Quality Assurance engineer. 
            Analyze the following OpenAPI JSON specification and generate a list of test case descriptions for its endpoints.
            For each test case, include a title, the type of test (e.g., Happy Path, Validation, Security, Edge Case), and a brief description.
            Return the result as a JSON array of objects.

            Here is the OpenAPI specification:
            ---
            ${openapi_spec}
            ---
        `;

        // Call the OpenAI API
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo', // Or "gpt-4" for higher quality
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: "json_object" }, // Ask for JSON output
        });

        const generatedJson = JSON.parse(completion.choices[0].message.content);
        
        // Send the generated test cases back to the frontend
        res.json({ testCases: generatedJson.test_cases }); // Assuming the model returns an object like { "test_cases": [...] }

    } catch (error) {
        console.error('Error calling OpenAI:', error);
        res.status(500).json({ error: 'Failed to generate test cases.' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`✅ Server is running at http://localhost:${port}`);
});
