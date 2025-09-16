export interface ConversationAlert {
  id: string;
  type: 'handoff' | 'agent_issue';
  message: string;
  timestamp: string;
  isActive: boolean;
}

class ConversationAlertService {
  private alerts: ConversationAlert[] = [];
  private audioContext: AudioContext | null = null;
  private beepInterval: NodeJS.Timeout | null = null;
  private isBeeping = false;
  private listeners: Array<(alerts: ConversationAlert[]) => void> = [];

  constructor() {
    this.initializeAudio();
  }

  private initializeAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Audio context not supported:', error);
    }
  }

  // Subscribe to alert changes
  subscribe(listener: (alerts: ConversationAlert[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners
  private notifyListeners() {
    // Create a stable reference to avoid infinite re-renders
    const currentAlerts = this.alerts.slice(); // Use slice() instead of spread operator
    this.listeners.forEach(listener => listener(currentAlerts));
  }

  // Add a new alert
  addAlert(alert: Omit<ConversationAlert, 'id' | 'timestamp' | 'isActive'>) {
    const newAlert: ConversationAlert = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      isActive: true,
    };

    this.alerts.push(newAlert);
    this.notifyListeners();
    
    // Only start beeping if not already beeping
    if (!this.isBeeping) {
      this.startBeeping();
    }
  }

  // Remove an alert
  removeAlert(alertId: string) {
    this.alerts = this.alerts.filter(alert => alert.id !== alertId);
    this.notifyListeners();
    
    if (this.alerts.length === 0) {
      this.stopBeeping();
    }
  }

  // Mark alert as resolved
  resolveAlert(alertId: string) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.isActive = false;
      this.notifyListeners();
      
      // Remove resolved alerts after a delay
      setTimeout(() => {
        this.removeAlert(alertId);
      }, 5000);
    }
  }

  // Get all active alerts
  getActiveAlerts(): ConversationAlert[] {
    return this.alerts.filter(alert => alert.isActive);
  }

  // Get alert count
  getAlertCount(): number {
    return this.getActiveAlerts().length;
  }

  // Start klaxon alarm based on alert type
  private startBeeping() {
    if (this.isBeeping || !this.audioContext) return;

    this.isBeeping = true;
    
    const playAlarm = () => {
      // Play different sounds based on alert types
      const hasHandoff = this.alerts.some(alert => alert.type === 'handoff' && alert.isActive);
      const hasAgentIssue = this.alerts.some(alert => alert.type === 'agent_issue' && alert.isActive);
      
      if (hasHandoff) {
        this.playHandoffKlaxon();
        // Handoff: every 6 seconds (slower double boop pattern)
        this.beepInterval = setTimeout(playAlarm, 6000);
      } else if (hasAgentIssue) {
        this.playAgentIssueKlaxon();
        // Agent issue: every 4 seconds (slower klaxon pattern)
        this.beepInterval = setTimeout(playAlarm, 4000);
      } else {
        // No active alerts, stop beeping
        this.stopBeeping();
      }
    };
    
    // Start the first alarm
    playAlarm();
  }

  // Stop beeping sound
  private stopBeeping() {
    if (this.beepInterval) {
      clearTimeout(this.beepInterval);
      this.beepInterval = null;
    }
    this.isBeeping = false;
  }

  // Play handoff alarm (repeating double boop)
  private playHandoffKlaxon() {
    if (!this.audioContext) return;

    try {
      const now = this.audioContext.currentTime;
      
      // Create oscillator for double boop
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const filterNode = this.audioContext.createBiquadFilter();

      // Connect the audio graph
      oscillator.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Handoff: double boop pattern
      oscillator.frequency.setValueAtTime(600, now);
      
      // First boop
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.4, now + 0.01);
      gainNode.gain.setValueAtTime(0.4, now + 0.08);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.1);
      
      // Pause between boops
      gainNode.gain.setValueAtTime(0, now + 0.1);
      gainNode.gain.setValueAtTime(0, now + 0.15);
      
      // Second boop
      gainNode.gain.linearRampToValueAtTime(0.4, now + 0.16);
      gainNode.gain.setValueAtTime(0.4, now + 0.23);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.25);

      // Configure filter for boop sound
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(1500, now);
      filterNode.Q.setValueAtTime(1, now);

      // Start and stop
      oscillator.start(now);
      oscillator.stop(now + 0.25);
    } catch (error) {
      console.warn('Error playing handoff double boop:', error);
    }
  }

  // Play agent issue klaxon (warning, oscillating tone)
  private playAgentIssueKlaxon() {
    if (!this.audioContext) return;

    try {
      const now = this.audioContext.currentTime;
      
      // Create oscillators for agent issue klaxon
      const oscillator1 = this.audioContext.createOscillator();
      const oscillator2 = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const filterNode = this.audioContext.createBiquadFilter();

      // Connect the audio graph
      oscillator1.connect(filterNode);
      oscillator2.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Agent issue klaxon: warning oscillating tone
      oscillator1.frequency.setValueAtTime(500, now);
      oscillator2.frequency.setValueAtTime(750, now);
      
      // Oscillating pattern for warning
      oscillator1.frequency.linearRampToValueAtTime(700, now + 0.4);
      oscillator2.frequency.linearRampToValueAtTime(1050, now + 0.4);
      
      oscillator1.frequency.linearRampToValueAtTime(500, now + 0.8);
      oscillator2.frequency.linearRampToValueAtTime(750, now + 0.8);

      // Configure filter
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(1800, now);
      filterNode.Q.setValueAtTime(1.5, now);

      // Volume envelope
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.4, now + 0.01);
      gainNode.gain.setValueAtTime(0.4, now + 0.7);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

      // Start and stop
      oscillator1.start(now);
      oscillator2.start(now);
      oscillator1.stop(now + 0.8);
      oscillator2.stop(now + 0.8);
    } catch (error) {
      console.warn('Error playing agent issue klaxon:', error);
    }
  }

  // Play new conversation beep (single beep notification)
  private playNewConversationDing() {
    if (!this.audioContext) return;

    try {
      const now = this.audioContext.currentTime;
      
      // Create oscillator for single beep
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const filterNode = this.audioContext.createBiquadFilter();

      // Connect the audio graph
      oscillator.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Single beep tone
      oscillator.frequency.setValueAtTime(1000, now);

      // Configure filter for clean beep
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(2000, now);
      filterNode.Q.setValueAtTime(1, now);

      // Volume envelope for clean beep
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
      gainNode.gain.setValueAtTime(0.3, now + 0.15);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.2);

      // Start and stop - short beep
      oscillator.start(now);
      oscillator.stop(now + 0.2);
    } catch (error) {
      console.warn('Error playing new conversation beep:', error);
    }
  }

  // Clear all alerts (when user opens conversations page)
  clearAllAlerts() {
    this.alerts = [];
    this.stopBeeping();
    this.notifyListeners();
  }

  // Stop currently playing alarms without clearing alerts
  stopCurrentAlarms() {
    this.stopBeeping();
  }

  // Simulate different types of alerts for testing
  simulateHandoff() {
    this.addAlert({
      type: 'handoff',
      message: 'Customer requested human agent - urgent assistance needed',
    });
  }

  simulateAgentIssue() {
    this.addAlert({
      type: 'agent_issue',
      message: 'AI agent is stuck in a loop - requires manual intervention',
    });
  }

  // Play new conversation ding (non-alert, just notification)
  playNewConversationSound() {
    this.playNewConversationDing();
  }
}

// Export singleton instance
export const conversationAlertService = new ConversationAlertService();
