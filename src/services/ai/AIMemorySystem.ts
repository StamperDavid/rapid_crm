/**
 * AI MEMORY AND LEARNING SYSTEM
 * Persistent memory, learning from interactions, and knowledge accumulation
 */

export interface Memory {
  id: string;
  type: 'episodic' | 'semantic' | 'procedural' | 'working';
  content: any;
  importance: number;
  associations: string[];
  lastAccessed: Date;
  createdAt: Date;
  accessCount: number;
}

export interface LearningExperience {
  id: string;
  context: any;
  action: string;
  outcome: any;
  feedback: number;
  lessons: string[];
  timestamp: Date;
}

export class AIMemorySystem {
  private static instance: AIMemorySystem;
  private memories: Map<string, Memory> = new Map();
  private learningExperiences: Map<string, LearningExperience> = new Map();
  private workingMemory: any[] = [];

  private constructor() {
    this.initializeMemorySystem();
  }

  public static getInstance(): AIMemorySystem {
    if (!AIMemorySystem.instance) {
      AIMemorySystem.instance = new AIMemorySystem();
    }
    return AIMemorySystem.instance;
  }

  private async initializeMemorySystem(): Promise<void> {
    console.log('🧠 Initializing AI Memory System...');
    console.log('✅ AI Memory System initialized');
  }

  public async storeMemory(content: any, type: Memory['type'], importance: number = 0.5): Promise<string> {
    const memoryId = this.generateId();
    const memory: Memory = {
      id: memoryId,
      type,
      content,
      importance,
      associations: [],
      lastAccessed: new Date(),
      createdAt: new Date(),
      accessCount: 0
    };

    this.memories.set(memoryId, memory);
    console.log(`💾 Stored ${type} memory: ${memoryId}`);
    return memoryId;
  }

  public async retrieveMemory(query: string, type?: Memory['type']): Promise<Memory[]> {
    const results: Memory[] = [];
    
    for (const memory of this.memories.values()) {
      if (type && memory.type !== type) continue;
      
      if (JSON.stringify(memory.content).toLowerCase().includes(query.toLowerCase())) {
        memory.lastAccessed = new Date();
        memory.accessCount++;
        results.push(memory);
      }
    }

    results.sort((a, b) => (b.importance + b.accessCount) - (a.importance + a.accessCount));
    return results.slice(0, 10);
  }

  public async learnFromExperience(context: any, action: string, outcome: any, feedback: number): Promise<string> {
    const experienceId = this.generateId();
    const experience: LearningExperience = {
      id: experienceId,
      context,
      action,
      outcome,
      feedback,
      lessons: this.extractLessons(context, action, outcome, feedback),
      timestamp: new Date()
    };

    this.learningExperiences.set(experienceId, experience);
    console.log(`📚 Learned from experience: ${experienceId}`);
    return experienceId;
  }

  public async addToWorkingMemory(item: any): Promise<void> {
    this.workingMemory.push(item);
    if (this.workingMemory.length > 10) {
      this.workingMemory.shift();
    }
  }

  public async getWorkingMemory(): Promise<any[]> {
    return this.workingMemory;
  }

  private extractLessons(context: any, action: string, outcome: any, feedback: number): string[] {
    const lessons: string[] = [];
    
    if (feedback > 0.7) {
      lessons.push(`Action "${action}" was successful in this context`);
    } else if (feedback < 0.3) {
      lessons.push(`Action "${action}" was not effective in this context`);
    }
    
    lessons.push(`Context factors: ${Object.keys(context).join(', ')}`);
    lessons.push(`Outcome: ${JSON.stringify(outcome)}`);
    
    return lessons;
  }

  private generateId(): string {
    return `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public getMemory(id: string): Memory | undefined {
    return this.memories.get(id);
  }

  public getLearningExperience(id: string): LearningExperience | undefined {
    return this.learningExperiences.get(id);
  }
}

export const aiMemorySystem = AIMemorySystem.getInstance();
