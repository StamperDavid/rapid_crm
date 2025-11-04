/**
 * Workflow Event Emitter
 * Centralized event system for triggering workflows throughout the application
 */

const EventEmitter = require('events');

class WorkflowEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setupEventLogging();
  }

  /**
   * Setup logging for all events
   */
  setupEventLogging() {
    // Log all events for debugging
    this.onAny((eventName, ...args) => {
      console.log(`🔔 Event: ${eventName}`, {
        timestamp: new Date().toISOString(),
        data: args[0]
      });
    });
  }

  /**
   * Listen to any event (helper for logging)
   */
  onAny(listener) {
    const originalEmit = this.emit;
    this.emit = function(event, ...args) {
      listener(event, ...args);
      return originalEmit.call(this, event, ...args);
    };
  }

  /**
   * Emit payment completed event
   */
  emitPaymentCompleted(data) {
    this.emit('payment.completed', {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Emit service purchased event
   */
  emitServicePurchased(data) {
    this.emit('service.purchased', {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Emit deal created event
   */
  emitDealCreated(data) {
    this.emit('deal.created', {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Emit renewal due event
   */
  emitRenewalDue(data) {
    this.emit('renewal.due', {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Emit workflow completed event
   */
  emitWorkflowCompleted(data) {
    this.emit('workflow.completed', {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Emit workflow failed event
   */
  emitWorkflowFailed(data) {
    this.emit('workflow.failed', {
      ...data,
      timestamp: new Date().toISOString()
    });
  }
}

// Singleton instance
const workflowEvents = new WorkflowEventEmitter();

module.exports = {
  workflowEvents,
  WorkflowEventEmitter
};



