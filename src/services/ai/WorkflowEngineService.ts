/**
 * Workflow Engine Service
 * Visual workflow builder with node-based editor and execution engine
 */

export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'loop' | 'delay' | 'ai_agent' | 'api_call' | 'data_transform' | 'notification';
  name: string;
  description: string;
  position: { x: number; y: number };
  config: Record<string, any>;
  inputs: string[];
  outputs: string[];
  status: 'idle' | 'running' | 'completed' | 'failed' | 'paused';
  executionTime?: number;
  error?: string;
}

export interface WorkflowConnection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceOutput: string;
  targetInput: string;
  dataType: string;
  condition?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  version: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  variables: Record<string, any>;
  settings: {
    timeout: number;
    retryAttempts: number;
    parallelExecution: boolean;
    errorHandling: 'stop' | 'continue' | 'retry';
  };
  status: 'draft' | 'active' | 'paused' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags: string[];
  category: string;
  executionCount: number;
  lastExecuted?: Date;
  averageExecutionTime?: number;
  successRate?: number;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  input: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  nodeExecutions: NodeExecution[];
  logs: ExecutionLog[];
}

export interface NodeExecution {
  nodeId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  input: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
}

export interface ExecutionLog {
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  nodeId?: string;
  data?: any;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  variables: Record<string, any>;
  preview: string;
  tags: string[];
  downloads: number;
  rating: number;
}

export class WorkflowEngineService {
  private workflows: Workflow[] = [];
  private executions: WorkflowExecution[] = [];
  private templates: WorkflowTemplate[] = [];

  constructor() {
    this.initializeTemplates();
    this.initializeSampleWorkflows();
  }

  private initializeTemplates() {
    this.templates = [
      {
        id: 'template_001',
        name: 'Customer Onboarding',
        description: 'Automated customer onboarding workflow with email sequences and data collection',
        category: 'customer_management',
        complexity: 'beginner',
        nodes: [
          {
            id: 'trigger_001',
            type: 'trigger',
            name: 'New Customer',
            description: 'Triggered when a new customer is created',
            position: { x: 100, y: 100 },
            config: { event: 'customer.created' },
            inputs: [],
            outputs: ['customer_data'],
            status: 'idle'
          },
          {
            id: 'action_001',
            type: 'action',
            name: 'Send Welcome Email',
            description: 'Send welcome email to new customer',
            position: { x: 300, y: 100 },
            config: { template: 'welcome_email', delay: 0 },
            inputs: ['customer_data'],
            outputs: ['email_sent'],
            status: 'idle'
          },
          {
            id: 'ai_agent_001',
            type: 'ai_agent',
            name: 'Generate Personal Recommendations',
            description: 'AI agent generates personalized product recommendations',
            position: { x: 500, y: 100 },
            config: { agentId: 'recommendation_agent', model: 'gpt-4' },
            inputs: ['customer_data'],
            outputs: ['recommendations'],
            status: 'idle'
          }
        ],
        connections: [
          {
            id: 'conn_001',
            sourceNodeId: 'trigger_001',
            targetNodeId: 'action_001',
            sourceOutput: 'customer_data',
            targetInput: 'customer_data',
            dataType: 'object'
          },
          {
            id: 'conn_002',
            sourceNodeId: 'trigger_001',
            targetNodeId: 'ai_agent_001',
            sourceOutput: 'customer_data',
            targetInput: 'customer_data',
            dataType: 'object'
          }
        ],
        variables: {
          welcome_email_template: 'default',
          recommendation_count: 5
        },
        preview: 'customer_onboarding_preview.png',
        tags: ['customer', 'onboarding', 'email', 'ai'],
        downloads: 1250,
        rating: 4.7
      },
      {
        id: 'template_002',
        name: 'Data Processing Pipeline',
        description: 'Advanced data processing workflow with validation, transformation, and analysis',
        category: 'data_processing',
        complexity: 'advanced',
        nodes: [
          {
            id: 'trigger_002',
            type: 'trigger',
            name: 'Data Upload',
            description: 'Triggered when data is uploaded',
            position: { x: 100, y: 100 },
            config: { event: 'data.uploaded' },
            inputs: [],
            outputs: ['raw_data'],
            status: 'idle'
          },
          {
            id: 'data_transform_001',
            type: 'data_transform',
            name: 'Validate Data',
            description: 'Validate and clean uploaded data',
            position: { x: 300, y: 100 },
            config: { validation_rules: 'strict', cleanup: true },
            inputs: ['raw_data'],
            outputs: ['validated_data'],
            status: 'idle'
          },
          {
            id: 'ai_agent_002',
            type: 'ai_agent',
            name: 'Analyze Data',
            description: 'AI agent performs data analysis and generates insights',
            position: { x: 500, y: 100 },
            config: { agentId: 'data_analyst', model: 'gpt-4' },
            inputs: ['validated_data'],
            outputs: ['insights'],
            status: 'idle'
          },
          {
            id: 'notification_001',
            type: 'notification',
            name: 'Send Results',
            description: 'Send analysis results to stakeholders',
            position: { x: 700, y: 100 },
            config: { channels: ['email', 'slack'], template: 'analysis_results' },
            inputs: ['insights'],
            outputs: ['notification_sent'],
            status: 'idle'
          }
        ],
        connections: [
          {
            id: 'conn_003',
            sourceNodeId: 'trigger_002',
            targetNodeId: 'data_transform_001',
            sourceOutput: 'raw_data',
            targetInput: 'raw_data',
            dataType: 'object'
          },
          {
            id: 'conn_004',
            sourceNodeId: 'data_transform_001',
            targetNodeId: 'ai_agent_002',
            sourceOutput: 'validated_data',
            targetInput: 'validated_data',
            dataType: 'object'
          },
          {
            id: 'conn_005',
            sourceNodeId: 'ai_agent_002',
            targetNodeId: 'notification_001',
            sourceOutput: 'insights',
            targetInput: 'insights',
            dataType: 'object'
          }
        ],
        variables: {
          validation_strictness: 'high',
          analysis_depth: 'comprehensive'
        },
        preview: 'data_processing_preview.png',
        tags: ['data', 'processing', 'analysis', 'ai'],
        downloads: 890,
        rating: 4.5
      }
    ];
  }

  private initializeSampleWorkflows() {
    this.workflows = [
      {
        id: 'workflow_001',
        name: 'Lead Qualification',
        description: 'Automated lead qualification and scoring workflow',
        version: '1.2.0',
        nodes: [
          {
            id: 'node_001',
            type: 'trigger',
            name: 'New Lead',
            description: 'Triggered when a new lead is created',
            position: { x: 100, y: 100 },
            config: { event: 'lead.created' },
            inputs: [],
            outputs: ['lead_data'],
            status: 'idle'
          },
          {
            id: 'node_002',
            type: 'ai_agent',
            name: 'Score Lead',
            description: 'AI agent scores the lead based on various criteria',
            position: { x: 300, y: 100 },
            config: { agentId: 'lead_scorer', model: 'gpt-4' },
            inputs: ['lead_data'],
            outputs: ['lead_score'],
            status: 'idle'
          },
          {
            id: 'node_003',
            type: 'condition',
            name: 'High Value Lead?',
            description: 'Check if lead score is above threshold',
            position: { x: 500, y: 100 },
            config: { condition: 'score > 80' },
            inputs: ['lead_score'],
            outputs: ['high_value', 'low_value'],
            status: 'idle'
          }
        ],
        connections: [
          {
            id: 'conn_001',
            sourceNodeId: 'node_001',
            targetNodeId: 'node_002',
            sourceOutput: 'lead_data',
            targetInput: 'lead_data',
            dataType: 'object'
          },
          {
            id: 'conn_002',
            sourceNodeId: 'node_002',
            targetNodeId: 'node_003',
            sourceOutput: 'lead_score',
            targetInput: 'lead_score',
            dataType: 'number'
          }
        ],
        variables: {
          score_threshold: 80,
          high_value_action: 'assign_to_sales'
        },
        settings: {
          timeout: 300,
          retryAttempts: 3,
          parallelExecution: false,
          errorHandling: 'retry'
        },
        status: 'active',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
        createdBy: 'user_001',
        tags: ['lead', 'qualification', 'scoring', 'sales'],
        category: 'sales',
        executionCount: 245,
        lastExecuted: new Date('2024-01-20'),
        averageExecutionTime: 2.5,
        successRate: 94.2
      }
    ];
  }

  // Get all workflows
  async getWorkflows(filters?: {
    status?: string;
    category?: string;
    search?: string;
    createdBy?: string;
  }): Promise<Workflow[]> {
    let filteredWorkflows = [...this.workflows];

    if (filters?.status) {
      filteredWorkflows = filteredWorkflows.filter(w => w.status === filters.status);
    }

    if (filters?.category) {
      filteredWorkflows = filteredWorkflows.filter(w => w.category === filters.category);
    }

    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredWorkflows = filteredWorkflows.filter(w => 
        w.name.toLowerCase().includes(searchTerm) ||
        w.description.toLowerCase().includes(searchTerm) ||
        w.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    if (filters?.createdBy) {
      filteredWorkflows = filteredWorkflows.filter(w => w.createdBy === filters.createdBy);
    }

    return filteredWorkflows;
  }

  // Get workflow by ID
  async getWorkflow(id: string): Promise<Workflow | null> {
    return this.workflows.find(w => w.id === id) || null;
  }

  // Create workflow
  async createWorkflow(workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt' | 'executionCount' | 'lastExecuted' | 'averageExecutionTime' | 'successRate'>): Promise<Workflow> {
    const newWorkflow: Workflow = {
      ...workflow,
      id: `workflow_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      executionCount: 0
    };

    this.workflows.push(newWorkflow);
    return newWorkflow;
  }

  // Update workflow
  async updateWorkflow(id: string, updates: Partial<Workflow>): Promise<Workflow | null> {
    const workflowIndex = this.workflows.findIndex(w => w.id === id);
    if (workflowIndex === -1) {
      return null;
    }

    this.workflows[workflowIndex] = {
      ...this.workflows[workflowIndex],
      ...updates,
      updatedAt: new Date()
    };

    return this.workflows[workflowIndex];
  }

  // Delete workflow
  async deleteWorkflow(id: string): Promise<boolean> {
    const workflowIndex = this.workflows.findIndex(w => w.id === id);
    if (workflowIndex === -1) {
      return false;
    }

    this.workflows.splice(workflowIndex, 1);
    return true;
  }

  // Execute workflow
  async executeWorkflow(workflowId: string, input: Record<string, any>): Promise<WorkflowExecution> {
    const workflow = await this.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    const execution: WorkflowExecution = {
      id: `execution_${Date.now()}`,
      workflowId,
      status: 'pending',
      startedAt: new Date(),
      input,
      nodeExecutions: [],
      logs: []
    };

    this.executions.push(execution);

    try {
      execution.status = 'running';
      await this.executeWorkflowNodes(workflow, execution);
      execution.status = 'completed';
      execution.completedAt = new Date();
      execution.duration = execution.completedAt.getTime() - execution.startedAt.getTime();
    } catch (error) {
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : 'Unknown error';
      execution.completedAt = new Date();
      execution.duration = execution.completedAt.getTime() - execution.startedAt.getTime();
    }

    // Update workflow statistics
    const workflowIndex = this.workflows.findIndex(w => w.id === workflowId);
    if (workflowIndex !== -1) {
      this.workflows[workflowIndex].executionCount++;
      this.workflows[workflowIndex].lastExecuted = new Date();
      
      if (execution.duration) {
        const currentAvg = this.workflows[workflowIndex].averageExecutionTime || 0;
        const newAvg = (currentAvg + execution.duration / 1000) / 2;
        this.workflows[workflowIndex].averageExecutionTime = newAvg;
      }
    }

    return execution;
  }

  private async executeWorkflowNodes(workflow: Workflow, execution: WorkflowExecution): Promise<void> {
    const nodeExecutions: NodeExecution[] = [];
    const executedNodes = new Set<string>();
    const nodeOutputs: Record<string, any> = {};

    // Find trigger nodes
    const triggerNodes = workflow.nodes.filter(node => node.type === 'trigger');
    
    for (const triggerNode of triggerNodes) {
      await this.executeNode(triggerNode, execution.input, nodeExecutions, nodeOutputs);
      executedNodes.add(triggerNode.id);
    }

    // Execute remaining nodes based on connections
    let hasChanges = true;
    while (hasChanges) {
      hasChanges = false;
      
      for (const connection of workflow.connections) {
        if (executedNodes.has(connection.sourceNodeId) && !executedNodes.has(connection.targetNodeId)) {
          const targetNode = workflow.nodes.find(n => n.id === connection.targetNodeId);
          if (targetNode) {
            const nodeInput = { [connection.targetInput]: nodeOutputs[connection.sourceOutput] };
            await this.executeNode(targetNode, nodeInput, nodeExecutions, nodeOutputs);
            executedNodes.add(targetNode.id);
            hasChanges = true;
          }
        }
      }
    }

    execution.nodeExecutions = nodeExecutions;
  }

  private async executeNode(node: WorkflowNode, input: Record<string, any>, nodeExecutions: NodeExecution[], nodeOutputs: Record<string, any>): Promise<void> {
    const nodeExecution: NodeExecution = {
      nodeId: node.id,
      status: 'running',
      startedAt: new Date(),
      input
    };

    nodeExecutions.push(nodeExecution);

    try {
      // Simulate node execution
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
      
      // Generate mock output based on node type
      const output = this.generateNodeOutput(node, input);
      
      nodeExecution.status = 'completed';
      nodeExecution.completedAt = new Date();
      nodeExecution.duration = nodeExecution.completedAt.getTime() - nodeExecution.startedAt.getTime();
      nodeExecution.output = output;

      // Store outputs for connections
      for (const outputKey of node.outputs) {
        nodeOutputs[outputKey] = output[outputKey];
      }

    } catch (error) {
      nodeExecution.status = 'failed';
      nodeExecution.error = error instanceof Error ? error.message : 'Unknown error';
      nodeExecution.completedAt = new Date();
      nodeExecution.duration = nodeExecution.completedAt.getTime() - nodeExecution.startedAt.getTime();
    }
  }

  private generateNodeOutput(node: WorkflowNode, input: Record<string, any>): Record<string, any> {
    switch (node.type) {
      case 'trigger':
        return { [node.outputs[0]]: input };
      case 'ai_agent':
        return { [node.outputs[0]]: { result: 'AI processing completed', confidence: 0.95 } };
      case 'condition':
        return { 
          [node.outputs[0]]: Math.random() > 0.5,
          [node.outputs[1]]: Math.random() <= 0.5
        };
      default:
        return { [node.outputs[0]]: 'Processed data' };
    }
  }

  // Get workflow executions
  async getWorkflowExecutions(workflowId?: string): Promise<WorkflowExecution[]> {
    if (workflowId) {
      return this.executions.filter(e => e.workflowId === workflowId);
    }
    return this.executions;
  }

  // Get workflow templates
  async getWorkflowTemplates(): Promise<WorkflowTemplate[]> {
    return this.templates;
  }

  // Create workflow from template
  async createWorkflowFromTemplate(templateId: string, customizations: Partial<Workflow>): Promise<Workflow> {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const workflow: Workflow = {
      id: `workflow_${Date.now()}`,
      name: customizations.name || template.name,
      description: customizations.description || template.description,
      version: '1.0.0',
      nodes: template.nodes,
      connections: template.connections,
      variables: { ...template.variables, ...customizations.variables },
      settings: {
        timeout: 300,
        retryAttempts: 3,
        parallelExecution: false,
        errorHandling: 'retry',
        ...customizations.settings
      },
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: customizations.createdBy || 'system',
      tags: template.tags,
      category: customizations.category || 'general',
      executionCount: 0
    };

    this.workflows.push(workflow);
    return workflow;
  }

  // Validate workflow
  async validateWorkflow(workflow: Workflow): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check for trigger nodes
    const triggerNodes = workflow.nodes.filter(node => node.type === 'trigger');
    if (triggerNodes.length === 0) {
      errors.push('Workflow must have at least one trigger node');
    }

    // Check for orphaned nodes
    const connectedNodes = new Set<string>();
    workflow.connections.forEach(conn => {
      connectedNodes.add(conn.sourceNodeId);
      connectedNodes.add(conn.targetNodeId);
    });

    const orphanedNodes = workflow.nodes.filter(node => 
      node.type !== 'trigger' && !connectedNodes.has(node.id)
    );

    if (orphanedNodes.length > 0) {
      errors.push(`Found ${orphanedNodes.length} orphaned nodes`);
    }

    // Check for circular dependencies
    if (this.hasCircularDependency(workflow)) {
      errors.push('Workflow contains circular dependencies');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private hasCircularDependency(workflow: Workflow): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) {
        return true;
      }

      if (visited.has(nodeId)) {
        return false;
      }

      visited.add(nodeId);
      recursionStack.add(nodeId);

      const outgoingConnections = workflow.connections.filter(conn => conn.sourceNodeId === nodeId);
      for (const conn of outgoingConnections) {
        if (hasCycle(conn.targetNodeId)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of workflow.nodes) {
      if (!visited.has(node.id) && hasCycle(node.id)) {
        return true;
      }
    }

    return false;
  }
}

// Singleton instance
export const workflowEngineService = new WorkflowEngineService();






