class StorageManager {
  static MODELS_KEY = 'gondolin_models';
  static CURRENT_MODEL_KEY = 'gondolin_current_model';
  static CHATS_KEY = 'gondolin_chats';
  static CURRENT_CHAT_KEY = 'gondolin_current_chat';

  static defaultModels = [
    {
      id: 'gpt4',
      name: 'GPT-4 Turbo',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      model: 'gpt-4-turbo-preview',
      apiKey: '',
      settings: {
        temperature: 0.7,
        maxTokens: 4096,
        systemPrompt: 'You are a helpful AI assistant.'
      }
    },
    {
      id: 'claude',
      name: 'Claude 3 Opus',
      endpoint: 'https://api.anthropic.com/v1/messages',
      model: 'claude-3-opus-20240229',
      apiKey: '',
      settings: {
        temperature: 0.7,
        maxTokens: 4096,
        systemPrompt: 'You are Claude, a helpful AI assistant.'
      }
    }
  ];

  static initializeStorage() {
    if (!localStorage.getItem(this.MODELS_KEY)) {
      localStorage.setItem(this.MODELS_KEY, JSON.stringify(this.defaultModels));
    }
    if (!localStorage.getItem(this.CURRENT_MODEL_KEY)) {
      localStorage.setItem(this.CURRENT_MODEL_KEY, this.defaultModels[0].id);
    }
  }

  static getAllModels() {
    return JSON.parse(localStorage.getItem(this.MODELS_KEY) || '[]');
  }

  static getCurrentModel() {
    const currentId = localStorage.getItem(this.CURRENT_MODEL_KEY);
    const models = this.getAllModels();
    return models.find(m => m.id === currentId) || models[0];
  }

  static saveModel(modelConfig) {
    const models = this.getAllModels();
    const index = models.findIndex(m => m.id === modelConfig.id);
    
    if (index >= 0) {
      models[index] = modelConfig;
    } else {
      models.push(modelConfig);
    }
    
    localStorage.setItem(this.MODELS_KEY, JSON.stringify(models));
  }

  static setCurrentModel(modelId) {
    localStorage.setItem(this.CURRENT_MODEL_KEY, modelId);
  }

  static deleteModel(modelId) {
    const models = this.getAllModels().filter(m => m.id !== modelId);
    localStorage.setItem(this.MODELS_KEY, JSON.stringify(models));
    
    if (this.getCurrentModel()?.id === modelId) {
      this.setCurrentModel(models[0]?.id);
    }
  }

  static async exportSettingsToFile() {
    try {
      const settings = await this.loadModelSettings();
      const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      await chrome.downloads.download({
        url: url,
        filename: 'gondolin_settings.json',
        saveAs: true
      });

      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Error exporting settings:', error);
      return false;
    }
  }

  static async importSettingsFromFile() {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';

      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) {
          resolve(false);
          return;
        }

        try {
          const text = await file.text();
          const settings = JSON.parse(text);
          await this.saveModelSettings(settings);
          resolve(true);
        } catch (error) {
          console.error('Error importing settings:', error);
          resolve(false);
        }
      };

      input.click();
    });
  }

  static getAllChats() {
    return JSON.parse(localStorage.getItem(this.CHATS_KEY) || '[]');
  }

  static getCurrentChat() {
    const currentId = localStorage.getItem(this.CURRENT_CHAT_KEY);
    const chats = this.getAllChats();
    return chats.find(c => c.id === currentId);
  }

  static saveChat(chat) {
    const chats = this.getAllChats();
    const index = chats.findIndex(c => c.id === chat.id);
    
    if (index >= 0) {
      chats[index] = chat;
    } else {
      chat.id = Date.now().toString();
      chat.createdAt = new Date().toISOString();
      chats.push(chat);
    }
    
    localStorage.setItem(this.CHATS_KEY, JSON.stringify(chats));
    return chat;
  }

  static setCurrentChat(chatId) {
    localStorage.setItem(this.CURRENT_CHAT_KEY, chatId);
  }

  static deleteChat(chatId) {
    const chats = this.getAllChats().filter(c => c.id !== chatId);
    localStorage.setItem(this.CHATS_KEY, JSON.stringify(chats));
    
    if (this.getCurrentChat()?.id === chatId) {
      this.setCurrentChat(chats[0]?.id);
    }
  }
}