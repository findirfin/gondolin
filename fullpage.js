document.addEventListener('DOMContentLoaded', async function() {
  // Initialize storage
  StorageManager.initializeStorage();

  // Model management
  const modelSelector = document.getElementById('model-selector');
  
  function updateModelSelector() {
    const models = StorageManager.getAllModels();
    modelSelector.innerHTML = models.map(model => 
      `<option value="${model.id}">${model.name}</option>`
    ).join('');
    
    const currentModel = StorageManager.getCurrentModel();
    if (currentModel) {
      modelSelector.value = currentModel.id;
      loadModelSettings(currentModel);
    }
  }

  function loadModelSettings(model) {
    // Update API settings
    document.getElementById('model-name').value = model.name;
    document.getElementById('model-id').value = model.id;
    document.getElementById('api-key').value = model.apiKey;
    document.getElementById('endpoint-url').value = model.endpoint;
    
    // Update LLM settings
    document.getElementById('temperature').value = model.settings.temperature;
    document.getElementById('temperature-value').textContent = model.settings.temperature;
    document.getElementById('max-tokens').value = model.settings.maxTokens;
    document.getElementById('system-prompt').value = model.settings.systemPrompt;
  }

  function displayModelList() {
    const modelList = document.getElementById('model-list');
    const models = StorageManager.getAllModels();
    const currentModel = StorageManager.getCurrentModel();
    
    modelList.innerHTML = models.map(model => `
      <div class="model-item ${model.id === currentModel?.id ? 'active' : ''}" 
           data-model-id="${model.id}">
        <div class="model-info">
          <div class="model-name">${model.name}</div>
          <div class="model-endpoint">${model.endpoint}</div>
        </div>
        <button class="edit-model">Edit</button>
      </div>
    `).join('');

    // Add click handlers for model selection
    modelList.querySelectorAll('.model-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (!e.target.classList.contains('edit-model')) {
          const modelId = item.dataset.modelId;
          updateSelectedModel(modelId);
        }
      });
    });

    // Add click handlers for edit buttons
    modelList.querySelectorAll('.edit-model').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const modelId = e.target.closest('.model-item').dataset.modelId;
        showEditForm(modelId);
      });
    });
  }

  function showEditForm(modelId = null) {
    const form = document.getElementById('model-edit-form');
    const model = modelId ? StorageManager.getAllModels().find(m => m.id === modelId) : {
      id: '',
      name: '',
      endpoint: '',
      apiKey: '',
      model: '',
      settings: { 
        temperature: 0.7, 
        maxTokens: 4096, 
        systemPrompt: 'You are a helpful AI assistant.' 
      }
    };

    // Fill form with model data
    document.getElementById('model-id').value = model.id;
    document.getElementById('model-name').value = model.name;
    document.getElementById('api-key').value = model.apiKey;
    document.getElementById('endpoint-url').value = model.endpoint;

    // Show the form
    form.classList.remove('hidden');
    form.classList.add('active');
  }

  function updateSelectedModel(modelId) {
    StorageManager.setCurrentModel(modelId);
    const model = StorageManager.getAllModels().find(m => m.id === modelId);
    if (model) {
      // Update top bar selector
      modelSelector.value = modelId;
      // Update model list active state
      document.querySelectorAll('.model-item').forEach(item => {
        item.classList.toggle('active', item.dataset.modelId === modelId);
      });
      // Load model settings
      loadModelSettings(model);
    }
  }

  modelSelector.addEventListener('change', (e) => {
    updateSelectedModel(e.target.value);
  });

  document.getElementById('save-model').addEventListener('click', () => {
    const modelConfig = {
      id: document.getElementById('model-id').value,
      name: document.getElementById('model-name').value,
      endpoint: document.getElementById('endpoint-url').value,
      apiKey: document.getElementById('api-key').value,
      settings: {
        temperature: parseFloat(document.getElementById('temperature').value),
        maxTokens: parseInt(document.getElementById('max-tokens').value),
        systemPrompt: document.getElementById('system-prompt').value
      }
    };
    
    StorageManager.saveModel(modelConfig);
    document.getElementById('model-edit-form').classList.add('hidden');
    displayModelList();
    updateModelSelector();
  });

  document.getElementById('delete-model').addEventListener('click', () => {
    const modelId = document.getElementById('model-id').value;
    StorageManager.deleteModel(modelId);
    updateModelSelector();
  });

  // Initial load
  updateModelSelector();
  displayModelList();
  displayChatHistory();

  // Add event listeners for model management
  document.getElementById('add-model').addEventListener('click', () => {
    document.getElementById('model-edit-form').classList.remove('hidden');
    showEditForm();
  });
  
  document.getElementById('cancel-edit').addEventListener('click', () => {
    const form = document.getElementById('model-edit-form');
    form.classList.add('hidden');
    form.classList.remove('active');
  });

  // Add save handler for LLM settings
  document.getElementById('save-llm-settings').addEventListener('click', async () => {
    const currentModel = StorageManager.getCurrentModel();
    if (!currentModel) return;

    currentModel.settings = {
      temperature: parseFloat(document.getElementById('temperature').value),
      maxTokens: parseInt(document.getElementById('max-tokens').value),
      systemPrompt: document.getElementById('system-prompt').value
    };

    StorageManager.saveModel(currentModel);
  });

  // Chat functionality
  const chatHistory = document.getElementById('chat-history');
  const userInput = document.getElementById('userInput');
  const sendButton = document.getElementById('sendMessage');
  const apiEndpoint = document.getElementById('apiEndpoint');
  const apiKey = document.getElementById('apiKey');
  const modelInput = document.getElementById('model');

  // Sidebar functionality
  const sidebarNav = document.querySelector(".sidebar-nav");
  const sidebarPanels = document.querySelectorAll(".sidebar-panel");
  const navButtons = sidebarNav.querySelectorAll("button");
  const tempSlider = document.getElementById("temperature");
  const tempValueSpan = document.getElementById("temperature-value");

  // Initialize temperature slider
  if (tempSlider && tempValueSpan) {
    tempSlider.addEventListener("input", () => {
      tempValueSpan.textContent = tempSlider.value;
    });
  }

  // Update sidebar handling
  function initializeSidebar() {
    const sidebarNav = document.querySelector(".sidebar-nav");
    const sidebarPanels = document.querySelectorAll(".sidebar-panel");

    sidebarNav.addEventListener("click", (event) => {
      const button = event.target.closest('button');
      if (!button) return;

      const targetPanelId = button.dataset.target;
      const targetPanel = document.getElementById(targetPanelId);

      // Update button states
      sidebarNav.querySelectorAll('button').forEach(btn => 
        btn.classList.toggle('active', btn === button)
      );

      // Update panel visibility
      sidebarPanels.forEach(panel => 
        panel.classList.toggle('active', panel.id === targetPanelId)
      );
    });
  }

  initializeSidebar();

  let conversationHistory = [
    { role: "system", content: "You are a helpful assistant." }
  ];

  function addMessageToChat(role, content, isSystem = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}${isSystem ? ' system' : ''}`;
    messageDiv.textContent = content;
    chatHistory.appendChild(messageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  async function handleSendMessage() {
    const userMessage = userInput.value.trim();
    if (!userMessage) return;

    const currentModel = StorageManager.getCurrentModel();
    if (!currentModel) {
      addMessageToChat('error', 'No model selected. Please configure a model first.');
      return;
    }

    const loadingIndicator = document.querySelector('.loading-indicator');
    loadingIndicator.classList.remove('hidden');
    sendButton.disabled = true;
    userInput.disabled = true;

    try {
      // Add user message
      addMessageToChat('user', userMessage);
      conversationHistory.push({
        role: 'user',
        content: userMessage,
        modelId: currentModel.id,
        timestamp: new Date().toISOString()
      });

      userInput.value = '';

      const messageDiv = document.createElement('div');
      messageDiv.className = 'message assistant';
      chatHistory.appendChild(messageDiv);

      try {
        const stream = await chatWithAI(
          currentModel.endpoint,
          currentModel.apiKey,
          currentModel.id,
          conversationHistory.map(msg => ({ role: msg.role, content: msg.content })),
          {
            stream: true,
            temperature: currentModel.settings?.temperature || 0.7,
            max_tokens: currentModel.settings?.maxTokens || 4096
          }
        );

        const reader = stream.getReader();
        let fullContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n').filter(line => line.trim() !== '');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices[0]?.delta?.content || '';
                fullContent += content;
                messageDiv.textContent = fullContent;
                chatHistory.scrollTop = chatHistory.scrollHeight;
              } catch (e) {
                console.error('Error parsing stream:', e);
              }
            }
          }
        }

        // Add assistant's message to conversation history
        conversationHistory.push({
          role: 'assistant',
          content: fullContent,
          modelId: currentModel.id,
          timestamp: new Date().toISOString()
        });

        // Save the chat
        const currentChat = StorageManager.getCurrentChat() || {
          id: Date.now().toString(),
          title: conversationHistory[1]?.content.slice(0, 30) + '...',
          createdAt: new Date().toISOString(),
          modelId: currentModel.id,
          messages: []
        };

        currentChat.messages = [...conversationHistory];
        StorageManager.saveChat(currentChat);
        displayChatHistory();

      } catch (error) {
        messageDiv.remove();
        throw error;
      }

    } catch (error) {
      addMessageToChat('error', `Error: ${error.message}`);
    } finally {
      loadingIndicator.classList.add('hidden');
      sendButton.disabled = false;
      userInput.disabled = false;
      userInput.focus();
    }
  }

  sendButton.addEventListener('click', handleSendMessage);
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });

  // Update settings change event listeners
  const llmInputs = ['temperature', 'max-tokens', 'system-prompt'];
  llmInputs.forEach(id => {
    document.getElementById(id).addEventListener('change', async () => {
      const currentModel = StorageManager.getCurrentModel();
      if (!currentModel) return;

      currentModel.settings = {
        temperature: parseFloat(document.getElementById('temperature').value),
        maxTokens: parseInt(document.getElementById('max-tokens').value),
        systemPrompt: document.getElementById('system-prompt').value
      };

      StorageManager.saveModel(currentModel);
    });
  });

  // Initial load of current model settings
  const currentModel = StorageManager.getCurrentModel();
  if (currentModel) {
    loadModelSettings(currentModel);
  }

  function displayChatHistory(searchQuery = '') {
    const chatHistoryList = document.getElementById('chat-history-list');
    let chats = StorageManager.getAllChats()
      .sort((a, b) => {
        const aTime = a.messages?.length ? 
          new Date(a.messages[a.messages.length - 1].timestamp) : 
          new Date(a.createdAt);
        const bTime = b.messages?.length ? 
          new Date(b.messages[b.messages.length - 1].timestamp) : 
          new Date(b.createdAt);
        return bTime - aTime;
      });

    // Filter chats based on search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      chats = chats.filter(chat => {
        // Search in title
        if (chat.title?.toLowerCase().includes(query)) return true;
        // Search in messages
        return chat.messages?.some(msg => 
          msg.content?.toLowerCase().includes(query) && msg.role !== 'system'
        );
      });
    }

    const currentChat = StorageManager.getCurrentChat();

    chatHistoryList.innerHTML = chats.map(chat => {
      // Get the last non-system message's model
      const lastModel = [...chat.messages]
        .reverse()
        .find(msg => msg.role !== 'system')?.modelId || chat.modelId;
      const model = StorageManager.getAllModels().find(m => m.id === lastModel);

      return `
        <div class="chat-item ${chat.id === currentChat?.id ? 'active' : ''}" 
             data-chat-id="${chat.id}">
          <div class="chat-info">
            <div class="chat-title">${chat.title || 'New Chat'}</div>
            <div class="chat-meta">
              ${new Date(chat.createdAt).toLocaleDateString()} • ${model?.name || 'Unknown Model'}
            </div>
          </div>
          <div class="chat-actions">
            <button class="delete-chat">🗑️</button>
          </div>
        </div>
      `;
    }).join('');

    // Add click handlers
    chatHistoryList.querySelectorAll('.chat-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (!e.target.closest('.chat-actions')) {
          const chatId = item.dataset.chatId;
          loadChat(chatId);
        }
      });
    });

    chatHistoryList.querySelectorAll('.delete-chat').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const chatId = e.target.closest('.chat-item').dataset.chatId;
        StorageManager.deleteChat(chatId);
        displayChatHistory();
      });
    });
  }

  function loadChat(chatId) {
    const chat = StorageManager.getAllChats().find(c => c.id === chatId);
    if (!chat) return;

    StorageManager.setCurrentChat(chatId);
    document.querySelectorAll('.chat-item').forEach(item => {
      item.classList.toggle('active', item.dataset.chatId === chatId);
    });

    const chatHistory = document.getElementById('chat-history');
    chatHistory.innerHTML = '';
    conversationHistory = [...chat.messages];
    
    chat.messages.forEach(msg => {
      addMessageToChat(msg.role, msg.content, msg.role === 'system');
    });
  }

  // Add new chat button handler
  document.getElementById('new-chat').addEventListener('click', () => {
    const timestamp = new Date().toISOString();
    conversationHistory = [
      { 
        role: 'system', 
        content: `Chat started on ${new Date().toLocaleString()}`,
        timestamp,
        modelId: StorageManager.getCurrentModel().id
      }
    ];
    document.getElementById('chat-history').innerHTML = '';
    addMessageToChat('system', conversationHistory[0].content, true);
    StorageManager.setCurrentChat(null);
    displayChatHistory();
  });

  // Initialize chat display
  displayChatHistory();

  // Add search functionality
  const searchInput = document.getElementById('search-chats');
  let searchTimeout;

  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      displayChatHistory(e.target.value.trim());
    }, 300); // Debounce search for better performance
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch(e.key) {
        case 'Enter': // Ctrl/Cmd + Enter to send
          if (document.activeElement === userInput) {
            e.preventDefault();
            handleSendMessage();
          }
          break;
        case 'n': // Ctrl/Cmd + N for new chat
          e.preventDefault();
          document.getElementById('new-chat').click();
          break;
      }
    }
  });
});
