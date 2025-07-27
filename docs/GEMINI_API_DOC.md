### **The Definitive 2025 Developer's Guide to the Gemini API with `@google/genai` for TypeScript**

**A comprehensive, up-to-date, and verified technical guide for leveraging the full power of Google's Gemini 2.5 models.**

As of June 2025, the Gemini API has evolved into a powerhouse for developers, with the `@google/genai` library for TypeScript standing as the single, unified SDK for all of Google's generative models. This guide provides a complete and verified walkthrough of its features, utilizing the latest and most powerful models available, such as `gemini-2.5-pro` and `gemini-2.5-flash`.

#### **1. The Foundation: Installation and Client Setup**

Getting started requires Node.js (version 20 or later) and the `@google/genai` package. This SDK is the official and current standard, superseding older libraries like `@google/generative-ai`.

**1.1. Installation**
Install the SDK from npm:
```bash
npm install @google/genai```

**1.2. Client Initialization: AI Studio vs. Vertex AI**

The SDK seamlessly connects to Gemini models through two primary platforms: Google AI Studio for rapid development and Vertex AI for scalable, production-grade applications.

*   **For Google AI Studio (API Key):** Ideal for quick starts and server-side projects. Obtain your key from [Google AI Studio](https://aistudio.google.com).

    ```typescript
    import { GoogleGenAI } from "@google/genai";
    import * as dotenv from "dotenv";

    dotenv.config(); // Store your key in a .env file

    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    ```
    **Security Note:** Never expose your API key in client-side code. Use it only in secure, server-side environments.

*   **For Vertex AI (Cloud Project):** Recommended for production with robust MLOps capabilities. Ensure your Google Cloud project has billing and the Vertex AI API enabled.

    ```typescript
    import { GoogleGenAI } from "@google/genai";

    const genAI = new GoogleGenAI({
        vertexai: true,
        project: process.env.GOOGLE_CLOUD_PROJECT!,
        location: process.env.GOOGLE_CLOUD_LOCATION!, // e.g., 'us-central1'
    });
    ```

#### **2. Model Selection: Choosing Your Engine (June 2025)**

Google's model lineup has significantly expanded. As of June 2025, the premier models are part of the Gemini 2.5 family, which come with advanced "thinking" capabilities by default.

*   **`gemini-2.5-pro`**: The most powerful and state-of-the-art model for complex reasoning across code, math, and large-scale document analysis. It boasts a massive 1 million token context window.
*   **`gemini-2.5-flash`**: The best model for price-performance, ideal for high-volume, low-latency tasks that still require sophisticated reasoning.
*   **`gemini-2.5-flash-lite`**: The fastest and most cost-efficient model for high-frequency tasks.

To use a specific model, you simply reference its identifier.

```typescript
// For Gemini 2.5 Pro
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

// For Gemini 2.5 Flash
const flashModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
```

#### **3. Advanced Multimodality: Beyond Just Text**

Gemini 2.5 models are natively multimodal, capable of understanding and processing a mix of text, images, audio, and video in a single prompt.

**3.1. Image and Text Input**

Combine text prompts with images by providing image data as a Base64 encoded string.

```typescript
import * as fs from "fs";

function fileToGenerativePart(path: string, mimeType: string) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

async function analyzeImage() {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // All 2.5 models support vision
    const prompt = "Describe this landmark and its history.";
    const imagePart = fileToGenerativePart("path/to/landmark.jpg", "image/jpeg");

    const result = await model.generateContent([prompt, imagePart]);
    console.log(result.response.text());
}
analyzeImage();
```

**3.2. Video and Audio Processing with the Files API**

For large files (like videos and high-quality audio) or reusable assets, the Files API is the most efficient method. It uploads the file once and provides a reference for use in subsequent prompts. Files are stored for 48 hours.

```typescript
async function summarizeVideo() {
    // 1. Upload the file
    const videoFile = await genAI.files.upload({
        file: "path/to/your/video.mp4",
        mimeType: "video/mp4",
    });

    console.log(`Uploaded file: ${videoFile.name}`);

    // 2. Use the file reference in a prompt
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const prompt = "Provide a detailed summary and chapter breakdown of this video.";
    const filePart = { fileData: { name: videoFile.name, mimeType: videoFile.mimeType } };

    const result = await model.generateContent([prompt, filePart]);
    console.log(result.response.text());
}
summarizeVideo();
```
This same process applies to a wide array of audio formats for tasks like transcription and summarization.

#### **4. Building Conversational AI: Chat Sessions**

For creating chatbots and multi-turn conversations, the SDK provides a stateful chat session object that automatically manages conversation history.

```typescript
async function runChat() {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const chat = model.startChat({
        history: [
            { role: "user", parts: [{ text: "Hello, I have a few questions about renewable energy." }] },
            { role: "model", parts: [{ text: "Great! I'm ready to help. What's your first question?" }] },
        ],
    });

    const msg = "What are the main types of solar panels?";
    console.log(`Sending message: ${msg}`);

    const result = await chat.sendMessage(msg);
    console.log(result.response.text());
}
runChat();
```

#### **5. Structured & Reliable Outputs: JSON Mode and Function Calling**

**5.1. JSON Mode for Predictable Data**

Force the model to output a valid JSON object by setting the `responseMimeType`. This is invaluable for creating structured data that can be easily parsed by applications.

```typescript
async function getCookieRecipes() {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const prompt = "List two popular cookie recipes with ingredients.";

    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
        }
    });

    const responseText = result.response.text();
    console.log(JSON.parse(responseText));
}
getCookieRecipes();
```
With `gemini-2.5-pro`, you can even enforce a specific JSON schema for guaranteed structure.

**5.2. Function Calling for Real-World Actions**

Function calling allows the model to interact with external systems and APIs. You define functions, and the model can request to call them and use the data returned to formulate a response. This enables the creation of powerful AI agents.

```typescript
// Define a tool with a callable function
const tools = [{
    functionDeclarations: [{
        name: "get_current_weather",
        description: "Get the current weather in a given location",
        parameters: {
            type: "OBJECT",
            properties: { location: { type: "STRING" } },
            required: ["location"],
        },
    }]
}];

// ... inside an async function
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro", tools });
const chat = model.startChat();
const result = await chat.sendMessage("What is the weather like in Tokyo?");

const call = result.response.functionCalls()?.[0];

if (call) {
    // Call your actual API here
    const apiResponse = { weather: "Sunny" };

    // Send the result back to the model
    const result2 = await chat.sendMessage([{
        functionResponse: {
            name: "get_current_weather",
            response: apiResponse,
        }
    }]);
    console.log(result2.response.text()); // The model will summarize the weather.
}
```

#### **6. Performance and Cost Optimization: Context Caching**

For applications with large, repetitive contexts (e.g., a long document you ask multiple questions about), context caching can significantly reduce cost and latency. You create a cache of the content once and reference it in subsequent calls. Implicit caching is on by default for 2.5 models, but explicit caching gives you more control and is recommended for high-volume use cases.

```typescript
async function useCachedContent() {
    const modelName = "gemini-2.5-flash"; // Caching is model-specific

    // 1. Create the cache with a Time-To-Live (TTL)
    const cache = await genAI.caches.create({
        model: modelName,
        systemInstruction: "You are a legal expert summarizing documents.",
        contents: [{ role: "user", parts: [{ text: "/* a very long legal document */" }] }],
        ttl: { seconds: 3600 } // Cache for 1 hour
    });

    console.log(`Created cache: ${cache.name}`);

    // 2. Use the cache in a request
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: "What is the key liability clause?" }] }],
        cachedContent: cache.name
    });
    console.log(result.response.text());
}
useCachedContent();
```

#### **7. Grounding and Controllable Reasoning**

*   **Factual Grounding with Google Search**: Ensure responses are current and factually accurate by grounding the model with Google Search. Simply include the `google_search` tool in your request.

*   **Controllable "Thinking"**: Gemini 2.5 models feature a hybrid reasoning system. You can set a `thinking_budget` to control the trade-off between response quality, latency, and cost, which is especially useful for complex, multi-step problems.

This comprehensive guide provides a solid foundation for building advanced applications with the latest Gemini 2.5 models and the official `@google/genai` TypeScript SDK. The platform is continuously evolving, with new capabilities like native audio output and enhanced security being regularly introduced.