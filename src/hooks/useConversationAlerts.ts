import { useState, useEffect, useCallback, useMemo } from 'react';
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
    const initialAlerts = conversationAlertService.getActiveAlerts();
    setAlerts(initialAlerts);
    setAlertCount(conversationAlertService.getAlertCount());

    return unsubscribe;
  }, []); // Empty dependency array to prevent infinite loops

  const addAlert = useCallback((alert: Omit<ConversationAlert, 'id' | 'timestamp' | 'isActive'>) => {
    conversationAlertService.addAlert(alert);
  }, []);

  const removeAlert = useCallback((alertId: string) => {
    conversationAlertService.removeAlert(alertId);
  }, []);

  const resolveAlert = useCallback((alertId: string) => {
    conversationAlertService.resolveAlert(alertId);
  }, []);

  const clearAllAlerts = useCallback(() => {
    conversationAlertService.clearAllAlerts();
  }, []);

  const stopCurrentAlarms = useCallback(() => {
    conversationAlertService.stopCurrentAlarms();
  }, []);

  const simulateHandoff = useCallback(() => {
    conversationAlertService.simulateHandoff();
  }, []);

  const simulateAgentIssue = useCallback(() => {
    conversationAlertService.simulateAgentIssue();
  }, []);

  const playNewConversationSound = useCallback(() => {
    conversationAlertService.playNewConversationSound();
  }, []);

  return useMemo(() => ({
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
  }), [
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
  ]);
};
