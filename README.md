# Gondolin Chat Interface

A modern web-based chat interface for interacting with various AI models.

## Features

- Support for multiple AI models and endpoints
- Real-time streaming responses
- Chat history management
- Configurable model settings
- Dark theme interface
- Markdown support in messages

## Prerequisites

- Modern web browser
- A web server to host the files
- API keys for the AI models you plan to use

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/gondolin.git
cd gondolin
```

2. Set up a web server:
   - For development, you can use Python's built-in server:
     ```bash
     python -m http.server 8000
     ```
   - Or use Node.js `http-server`:
     ```bash
     npx http-server
     ```

3. Open your browser and navigate to:
   - If using Python: `http://localhost:8000`
   - If using http-server: `http://localhost:8080`

## Configuration

1. Navigate to the API/Model settings panel
2. Click "Add New Model"
3. Fill in your model details:
   - Model Name: A display name for your model
   - Model ID: A unique identifier
   - API Key: Your API key
   - Endpoint URL: The API endpoint URL

## Usage

1. Select a model from the dropdown in the top bar
2. Type your message in the input area
3. Press Enter or click Send to start the conversation
4. Use the sidebar to:
   - View chat history
   - Manage API settings
   - Configure model parameters
   - Access generated artifacts

## License

MIT License
