// Service to manage and share chat history between components
class ChatHistoryService {
  private chatHistory: any[] = [];
  private listeners: ((history: any[]) => void)[] = [];
  private isLoaded = false;

  // Load chat history from database
  async loadChatHistoryFromDatabase(): Promise<void> {
    try {
      console.log('🔍 Loading chat history from database...');
      // Get all AI collaboration messages
      const response = await fetch('http://localhost:3001/api/ai/collaborate?limit=200');
      if (response.ok) {
        const data = await response.json();
        if (data.messages && Array.isArray(data.messages)) {
          // Filter for user conversations (messages that mention David or are user interactions)
          const userMessages = data.messages.filter((msg: any) => {
            const content = msg.content.toLowerCase();
            const metadata = msg.metadata ? (typeof msg.metadata === 'string' ? JSON.parse(msg.metadata) : msg.metadata) : {};
            
            return content.includes('david') || 
                   content.includes('hello david') ||
                   content.includes('hey david') ||
                   content.includes('testing voice') ||
                   content.includes('voice functionality') ||
                   metadata.context === 'user_interaction' ||
                   metadata.userRole === 'admin';
          });
          
          console.log('🔍 Found user messages:', userMessages.length);
          console.log('🔍 Sample user messages:', userMessages.slice(0, 3).map(m => ({ 
            id: m.id, 
            content: m.content.substring(0, 100) + '...',
            from_ai: m.from_ai 
          })));
          
          // Transform to chat history format
          const transformedMessages = userMessages.map((msg: any) => {
            const metadata = msg.metadata ? (typeof msg.metadata === 'string' ? JSON.parse(msg.metadata) : msg.metadata) : {};
            
            return {
              id: msg.id || msg.message_id,
              type: msg.from_ai === 'RapidCRM_AI' ? 'assistant' : 'user',
              content: msg.content,
              timestamp: new Date(msg.created_at),
              metadata: metadata
            };
          });
          
          // Sort by timestamp
          transformedMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          
          this.chatHistory = transformedMessages;
          this.isLoaded = true;
          this.notifyListeners();
        }
      }
    } catch (error) {
      console.error('Failed to load chat history from database:', error);
    }
  }

  // Get chat history (load from database if not loaded)
  async getChatHistory(): Promise<any[]> {
    if (!this.isLoaded) {
      await this.loadChatHistoryFromDatabase();
    }
    return [...this.chatHistory];
  }

  // Add a message to chat history
  addMessage(message: any) {
    this.chatHistory.push({
      ...message,
      id: message.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: message.timestamp || new Date()
    });
    this.notifyListeners();
  }

  // Clear chat history
  clearChatHistory() {
    this.chatHistory = [];
    this.notifyListeners();
  }

  // Subscribe to chat history changes
  subscribe(listener: (history: any[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners of changes
  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.chatHistory]));
  }
}

export const chatHistoryService = new ChatHistoryService();
