// Service to manage and share chat history between components
class ChatHistoryService {
  private chatHistory: any[] = [];
  private listeners: ((history: any[]) => void)[] = [];

  // Add a message to chat history
  addMessage(message: any) {
    this.chatHistory.push({
      ...message,
      id: message.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: message.timestamp || new Date()
    });
    this.notifyListeners();
  }

  // Get current chat history
  getChatHistory(): any[] {
    return [...this.chatHistory];
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
