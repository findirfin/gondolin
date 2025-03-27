// aiChatClient.js

/**
 * Sends a chat request to an OpenAI-compatible API endpoint.
 *
 * @async
 * @function chatWithAI
 * @param {string} endpoint - The URL of the AI service's chat completions endpoint.
 * @param {string} apiKey - Your API key for the service.
 * @param {string} model - The name of the model to use (e.g., 'gpt-4', 'claude-3-opus-20240229').
 * @param {Array<object>} messages - An array of message objects, following the OpenAI format:
 *   [{ role: 'system' | 'user' | 'assistant', content: string }, ...]
 * @param {object} [options={}] - Optional parameters for the API request (e.g., temperature, max_tokens, stream).
 * @returns {Promise<object>} A promise that resolves to the API response data (parsed JSON).
 * @throws {Error} If the request fails or the API returns an error.
 */
async function chatWithAI(endpoint, apiKey, model, messages, options = {}) {
    if (!endpoint || !apiKey || !model || !messages) {
      throw new Error(
        "Missing required parameters: endpoint, apiKey, model, or messages",
      );
    }
  
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    };
  
    const body = JSON.stringify({
      model: model,
      messages: messages,
      stream: options.stream || false,
      ...options, // Spread any additional options like temperature, max_tokens, etc.
    });
  
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: headers,
        body: body,
      });
  
      if (!response.ok) {
        // Attempt to parse error details from the API response
        let errorDetails = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorDetails += ` - ${JSON.stringify(errorData)}`;
        } catch (e) {
          // Ignore if response body is not JSON or empty
          errorDetails += ` - ${await response.text()}`;
        }
        throw new Error(errorDetails);
      }

      if (options.stream) {
        return response.body;
      }
  
      const data = await response.json();
      return data; // Return the full response object
    } catch (error) {
      console.error("Error calling AI service:", error);
      // Re-throw the error so the caller can handle it
      throw error;
    }
  }
  
  // Example Usage (demonstrates how to call the function):
  /*
  async function runExample() {
    const MY_ENDPOINT = "YOUR_API_ENDPOINT_HERE"; // e.g., 'https://api.openai.com/v1/chat/completions' or a proxy URL
    const MY_API_KEY = "YOUR_API_KEY_HERE"; // **NEVER hardcode keys in client-side code**
    const MY_MODEL = "gpt-4"; // Or your desired model
  
    const conversation = [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "What is the capital of France?" },
    ];
  
    try {
      const responseData = await chatWithAI(
        MY_ENDPOINT,
        MY_API_KEY,
        MY_MODEL,
        conversation,
        { temperature: 0.7 } // Example optional parameter
      );
  
      // Process the response (structure depends on the specific API)
      if (responseData.choices && responseData.choices.length > 0) {
        const assistantMessage = responseData.choices[0].message;
        console.log("AI Response:", assistantMessage.content);
        // You might want to add assistantMessage to your conversation array here
      } else {
        console.log("No choices found in response:", responseData);
      }
    } catch (error) {
      console.error("Failed to get AI response:", error.message);
    }
  }
  
  // runExample(); // Uncomment to run the example (replace placeholders first!)
  */
  
  // Export the function if using modules (e.g., in Node.js or modern browsers)
  // export { chatWithAI };
