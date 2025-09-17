/**
 * AI Persona Manager - Allows real-time modification of AI identity and capabilities
 * This service enables dynamic changes to the AI's persona, system prompt, and capabilities
 */

const Database = require('better-sqlite3');
const path = require('path');

class AIPersonaManager {
  constructor() {
    this.dbPath = path.join(__dirname, '../../../instance/rapid_crm.db');
    this.initializeDatabase();
    this.currentPersona = this.loadCurrentPersona();
  }

  initializeDatabase() {
    const db = new Database(this.dbPath);
    
    // Create AI persona configurations table
    db.exec(`
      CREATE TABLE IF NOT EXISTS ai_persona_configs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        system_prompt TEXT NOT NULL,
        capabilities JSON NOT NULL,
        personality_traits JSON NOT NULL,
        communication_style TEXT NOT NULL,
        expertise_focus TEXT NOT NULL,
        is_active BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create AI capability definitions table
    db.exec(`
      CREATE TABLE IF NOT EXISTS ai_capabilities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        is_enabled BOOLEAN DEFAULT 1,
        configuration JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default capabilities if they don't exist
    this.initializeDefaultCapabilities(db);
    
    // Insert default persona if none exists
    this.initializeDefaultPersona(db);
    
    db.close();
  }

  initializeDefaultCapabilities(db) {
    const defaultCapabilities = [
      {
        name: 'voice_preferences',
        description: 'Access and modify voice preferences and system settings',
        category: 'system_access',
        is_enabled: true,
        configuration: { can_modify: true, can_view: true }
      },
      {
        name: 'ai_agent_creation',
        description: 'Create and deploy other AI agents',
        category: 'ai_management',
        is_enabled: true,
        configuration: { can_create: true, can_deploy: true, can_configure: true }
      },
      {
        name: 'crm_management',
        description: 'Manage companies, contacts, deals, and fleet records',
        category: 'business_operations',
        is_enabled: true,
        configuration: { can_create: true, can_update: true, can_delete: true }
      },
      {
        name: 'compliance_management',
        description: 'Handle USDOT applications and compliance',
        category: 'business_operations',
        is_enabled: true,
        configuration: { can_process: true, can_generate_reports: true }
      },
      {
        name: 'database_access',
        description: 'Direct database access to all CRM records',
        category: 'system_access',
        is_enabled: true,
        configuration: { can_read: true, can_write: true }
      },
      {
        name: 'conversation_memory',
        description: 'Persistent memory of conversations and user preferences',
        category: 'memory',
        is_enabled: true,
        configuration: { retention_days: 30, max_messages: 200 }
      }
    ];

    const insertCapability = db.prepare(`
      INSERT OR IGNORE INTO ai_capabilities (name, description, category, is_enabled, configuration)
      VALUES (?, ?, ?, ?, ?)
    `);

    defaultCapabilities.forEach(cap => {
      insertCapability.run(cap.name, cap.description, cap.category, cap.is_enabled ? 1 : 0, JSON.stringify(cap.configuration));
    });
  }

  initializeDefaultPersona(db) {
    const defaultPersona = {
      name: 'Rapid CRM AI Assistant',
      description: 'Specialized transportation compliance and CRM management AI',
      system_prompt: `You are the Rapid CRM AI Assistant, a specialized transportation business AI with comprehensive system capabilities.

## Your Identity
- You are an intelligent AI assistant specialized in transportation compliance and CRM management
- You have direct system access and specific business capabilities
- You maintain a professional, helpful, and knowledgeable persona

## Your Capabilities
You have access to:
- Voice preferences and system settings management
- AI agent creation and deployment
- CRM management (companies, contacts, deals, fleet records)
- USDOT compliance and regulatory management
- Direct database access to all records
- Persistent conversation memory and user preferences

## Communication Style
- Professional yet approachable
- Direct and helpful
- Knowledgeable about transportation industry
- Confident about your capabilities

Always be helpful and provide accurate information about your capabilities.`,
      capabilities: ['voice_preferences', 'ai_agent_creation', 'crm_management', 'compliance_management', 'database_access', 'conversation_memory'],
      personality_traits: {
        formality: 0.7,
        creativity: 0.6,
        technicality: 0.8,
        empathy: 0.8,
        assertiveness: 0.7
      },
      communication_style: 'professional',
      expertise_focus: 'transportation_compliance'
    };

    const insertPersona = db.prepare(`
      INSERT OR IGNORE INTO ai_persona_configs 
      (name, description, system_prompt, capabilities, personality_traits, communication_style, expertise_focus, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `);

    insertPersona.run(
      defaultPersona.name,
      defaultPersona.description,
      defaultPersona.system_prompt,
      JSON.stringify(defaultPersona.capabilities),
      JSON.stringify(defaultPersona.personality_traits),
      defaultPersona.communication_style,
      defaultPersona.expertise_focus
    );
  }

  loadCurrentPersona() {
    const db = new Database(this.dbPath);
    const persona = db.prepare(`
      SELECT * FROM ai_persona_configs WHERE is_active = 1 LIMIT 1
    `).get();

    if (persona) {
      return {
        ...persona,
        capabilities: JSON.parse(persona.capabilities),
        personality_traits: JSON.parse(persona.personality_traits)
      };
    }

    db.close();
    return null;
  }

  // Get all available personas
  getAllPersonas() {
    const db = new Database(this.dbPath);
    const personas = db.prepare(`
      SELECT * FROM ai_persona_configs ORDER BY created_at DESC
    `).all();

    const result = personas.map(persona => ({
      ...persona,
      capabilities: JSON.parse(persona.capabilities),
      personality_traits: JSON.parse(persona.personality_traits)
    }));

    db.close();
    return result;
  }

  // Get all available capabilities
  getAllCapabilities() {
    const db = new Database(this.dbPath);
    const capabilities = db.prepare(`
      SELECT * FROM ai_capabilities ORDER BY category, name
    `).all();

    const result = capabilities.map(cap => ({
      ...cap,
      configuration: JSON.parse(cap.configuration)
    }));

    db.close();
    return result;
  }

  // Create a new persona
  createPersona(personaData) {
    const db = new Database(this.dbPath);
    
    const insertPersona = db.prepare(`
      INSERT INTO ai_persona_configs 
      (name, description, system_prompt, capabilities, personality_traits, communication_style, expertise_focus)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertPersona.run(
      personaData.name,
      personaData.description,
      personaData.system_prompt,
      JSON.stringify(personaData.capabilities),
      JSON.stringify(personaData.personality_traits),
      personaData.communication_style,
      personaData.expertise_focus
    );

    db.close();
    return result.lastInsertRowid;
  }

  // Update an existing persona
  updatePersona(id, personaData) {
    const db = new Database(this.dbPath);
    
    const updatePersona = db.prepare(`
      UPDATE ai_persona_configs 
      SET name = ?, description = ?, system_prompt = ?, capabilities = ?, 
          personality_traits = ?, communication_style = ?, expertise_focus = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = updatePersona.run(
      personaData.name,
      personaData.description,
      personaData.system_prompt,
      JSON.stringify(personaData.capabilities),
      JSON.stringify(personaData.personality_traits),
      personaData.communication_style,
      personaData.expertise_focus,
      id
    );

    db.close();
    return result.changes;
  }

  // Activate a persona (deactivates all others)
  activatePersona(id) {
    const db = new Database(this.dbPath);
    
    // Deactivate all personas
    db.prepare('UPDATE ai_persona_configs SET is_active = 0').run();
    
    // Activate the selected persona
    const result = db.prepare('UPDATE ai_persona_configs SET is_active = 1 WHERE id = ?').run(id);
    
    db.close();
    
    // Reload current persona
    this.currentPersona = this.loadCurrentPersona();
    
    return result.changes;
  }

  // Toggle a capability
  toggleCapability(capabilityName, enabled) {
    const db = new Database(this.dbPath);
    
    const result = db.prepare(`
      UPDATE ai_capabilities SET is_enabled = ? WHERE name = ?
    `).run(enabled ? 1 : 0, capabilityName);

    db.close();
    return result.changes;
  }

  // Get current system prompt
  getCurrentSystemPrompt() {
    return this.currentPersona ? this.currentPersona.system_prompt : null;
  }

  // Get current capabilities
  getCurrentCapabilities() {
    if (!this.currentPersona) return [];
    
    const db = new Database(this.dbPath);
    const capabilities = db.prepare(`
      SELECT c.* FROM ai_capabilities c
      WHERE c.name IN (${this.currentPersona.capabilities.map(() => '?').join(',')})
      AND c.is_enabled = 1
    `).all(...this.currentPersona.capabilities);

    const result = capabilities.map(cap => ({
      ...cap,
      configuration: JSON.parse(cap.configuration)
    }));

    db.close();
    return result;
  }

  // Update system prompt in real-time
  updateSystemPrompt(newPrompt) {
    if (!this.currentPersona) return false;

    const db = new Database(this.dbPath);
    
    const result = db.prepare(`
      UPDATE ai_persona_configs 
      SET system_prompt = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newPrompt, this.currentPersona.id);

    db.close();
    
    // Update current persona
    this.currentPersona.system_prompt = newPrompt;
    
    return result.changes > 0;
  }

  // Update personality traits
  updatePersonalityTraits(traits) {
    if (!this.currentPersona) return false;

    const db = new Database(this.dbPath);
    
    const result = db.prepare(`
      UPDATE ai_persona_configs 
      SET personality_traits = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(JSON.stringify(traits), this.currentPersona.id);

    db.close();
    
    // Update current persona
    this.currentPersona.personality_traits = traits;
    
    return result.changes > 0;
  }

  // Get persona statistics
  getPersonaStats() {
    const db = new Database(this.dbPath);
    
    const stats = {
      totalPersonas: db.prepare('SELECT COUNT(*) as count FROM ai_persona_configs').get().count,
      activePersona: this.currentPersona ? this.currentPersona.name : 'None',
      totalCapabilities: db.prepare('SELECT COUNT(*) as count FROM ai_capabilities').get().count,
      enabledCapabilities: db.prepare('SELECT COUNT(*) as count FROM ai_capabilities WHERE is_enabled = 1').get().count
    };

    db.close();
    return stats;
  }
}

module.exports = new AIPersonaManager();
