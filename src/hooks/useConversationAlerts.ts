import { useState, useEffect } from 'react';
import { conversationAlertService, ConversationAlert } from '../services/ConversationAlertService';

export const useConversationAlerts = () => {
  const [alerts, setAlerts] = useState<ConversationAlert[]>([]);
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    // Subscribe to alert changes
    const unsubscribe = conversationAlertService.subscribe((newAlerts) => {
      setAlerts(newAlerts);
      setAlertCount(conversationAlertService.getAlertCount());
    });

    // Initialize with current alerts
    setAlerts(conversationAlertService.getActiveAlerts());
    setAlertCount(conversationAlertService.getAlertCount());

    return unsubscribe;
  }, []);

  const addAlert = (alert: Omit<ConversationAlert, 'id' | 'timestamp' | 'isActive'>) => {
    conversationAlertService.addAlert(alert);
  };

  const removeAlert = (alertId: string) => {
    conversationAlertService.removeAlert(alertId);
  };

  const resolveAlert = (alertId: string) => {
    conversationAlertService.resolveAlert(alertId);
  };

  const clearAllAlerts = () => {
    conversationAlertService.clearAllAlerts();
  };

  const stopCurrentAlarms = () => {
    conversationAlertService.stopCurrentAlarms();
  };

  const simulateHandoff = () => {
    conversationAlertService.simulateHandoff();
  };

  const simulateAgentIssue = () => {
    conversationAlertService.simulateAgentIssue();
  };

  const playNewConversationSound = () => {
    conversationAlertService.playNewConversationSound();
  };

  return {
    alerts,
    alertCount,
    addAlert,
    removeAlert,
    resolveAlert,
    clearAllAlerts,
    stopCurrentAlarms,
    simulateHandoff,
    simulateAgentIssue,
    playNewConversationSound,
  };
};
