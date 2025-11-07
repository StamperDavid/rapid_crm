const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, '../../instance/rapid_crm.db');
const db = new Database(dbPath);

console.log('🔧 Generating sample data for testing...\n');

try {
  db.pragma('foreign_keys = ON');

  // ===================================================================
  // ACTIVITY LOG - Track recent CRM activities
  // ===================================================================
  console.log('Generating activity log entries...');
  
  const activities = [
    { entity_type: 'company', entity_id: '1', action: 'created', description: 'New company added to CRM' },
    { entity_type: 'deal', entity_id: '1', action: 'created', description: 'New deal created' },
    { entity_type: 'lead', entity_id: '1', action: 'converted', description: 'Lead converted to deal' },
    { entity_type: 'contact', entity_id: '1', action: 'updated', description: 'Contact information updated' },
    { entity_type: 'task', entity_id: '1', action: 'completed', description: 'Task marked as completed' }
  ];

  const activityStmt = db.prepare(`
    INSERT OR REPLACE INTO activity_log (id, entity_type, entity_id, action, description, created_at)
    VALUES (?, ?, ?, ?, ?, datetime('now', '-' || ? || ' hours'))
  `);

  activities.forEach((activity, index) => {
    const id = `activity_${Date.now()}_${index}`;
    activityStmt.run(id, activity.entity_type, activity.entity_id, activity.action, activity.description, index);
  });
  
  console.log(`✅ ${activities.length} activity log entries created`);

  // ===================================================================
  // NOTIFICATIONS - Create sample notifications
  // ===================================================================
  console.log('Generating notifications...');
  
  const notifications = [
    { title: 'New Deal Won', message: 'Congratulations! Deal "Transportation Contract" has been closed.', type: 'success' },
    { title: 'Task Due Soon', message: 'You have 3 tasks due in the next 24 hours.', type: 'warning' },
    { title: 'New Lead Assigned', message: 'A new lead has been assigned to you.', type: 'info' }
  ];

  const notifStmt = db.prepare(`
    INSERT OR REPLACE INTO notifications (id, title, message, type, is_read, created_at)
    VALUES (?, ?, ?, ?, 0, datetime('now', '-' || ? || ' hours'))
  `);

  notifications.forEach((notif, index) => {
    const id = `notification_${Date.now()}_${index}`;
    notifStmt.run(id, notif.title, notif.message, notif.type, index * 2);
  });
  
  console.log(`✅ ${notifications.length} notifications created`);

  // ===================================================================
  // REVENUE TRACKING - Create monthly revenue snapshots
  // ===================================================================
  console.log('Generating revenue tracking data...');
  
  // Get actual deals from database for current period
  const wonDeals = db.prepare(`
    SELECT COUNT(*) as count, SUM(value) as total_value 
    FROM deals 
    WHERE stage = 'Closed Won'
  `).get();

  const allDeals = db.prepare('SELECT COUNT(*) as count FROM deals').get();
  
  const pipelineValue = db.prepare(`
    SELECT SUM(value) as total_value 
    FROM deals 
    WHERE stage NOT IN ('Closed Won', 'Closed Lost')
  `).get();

  const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM format
  
  const revenueStmt = db.prepare(`
    INSERT OR REPLACE INTO revenue_tracking (id, period, revenue, deals_count, conversion_rate, pipeline_value)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const id = `revenue_${currentPeriod}`;
  const revenue = wonDeals.total_value || 0;
  const dealsCount = wonDeals.count || 0;
  const conversionRate = allDeals.count > 0 ? (dealsCount / allDeals.count * 100) : 0;
  const pipeline = pipelineValue.total_value || 0;

  revenueStmt.run(id, currentPeriod, revenue, dealsCount, conversionRate, pipeline);
  
  console.log(`✅ Revenue tracking data created for ${currentPeriod}`);
  console.log(`   Revenue: $${revenue.toLocaleString()}`);
  console.log(`   Deals: ${dealsCount}`);
  console.log(`   Pipeline: $${pipeline.toLocaleString()}`);

  // ===================================================================
  // ANALYTICS METRICS - Calculate real metrics from database
  // ===================================================================
  console.log('Generating analytics metrics...');
  
  const companies = db.prepare('SELECT COUNT(*) as count FROM companies').get();
  const leads = db.prepare('SELECT COUNT(*) as count FROM leads').get();
  const vehicles = db.prepare('SELECT COUNT(*) as count FROM vehicles').get();
  const drivers = db.prepare('SELECT COUNT(*) as count FROM drivers').get();
  const tasks = db.prepare('SELECT COUNT(*) as count FROM tasks').get();
  const completedTasks = db.prepare(`SELECT COUNT(*) as count FROM tasks WHERE status = 'completed'`).get();

  const metrics = [
    { name: 'Total Companies', value: companies.count.toString(), category: 'customers' },
    { name: 'Active Leads', value: leads.count.toString(), category: 'operations' },
    { name: 'Total Revenue', value: `$${revenue.toLocaleString()}`, category: 'revenue' },
    { name: 'Vehicle Fleet', value: vehicles.count.toString(), category: 'compliance' },
    { name: 'Total Drivers', value: drivers.count.toString(), category: 'operations' },
    { name: 'Task Completion Rate', value: tasks.count > 0 ? `${((completedTasks.count / tasks.count) * 100).toFixed(1)}%` : '0%', category: 'operations' }
  ];

  const metricsStmt = db.prepare(`
    INSERT OR REPLACE INTO analytics_metrics (id, name, value, category, trend, confidence, last_updated)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  metrics.forEach((metric, index) => {
    const id = `metric_${metric.category}_${index}`;
    metricsStmt.run(id, metric.name, metric.value, metric.category, 'up', 'high');
  });
  
  console.log(`✅ ${metrics.length} analytics metrics created`);

  // ===================================================================
  // AGENT PERFORMANCE - Create performance records for AI agents
  // ===================================================================
  console.log('Generating agent performance data...');
  
  const agentStmt = db.prepare(`
    INSERT OR REPLACE INTO agent_performance (id, agent_name, agent_type, success_rate, response_time, customer_satisfaction, tasks_completed, status, last_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  const agents = [
    { name: 'Alex - Sales Agent', type: 'sales', success_rate: 92.5, response_time: 1.2, satisfaction: 4.7, tasks: dealsCount },
    { name: 'USDOT Assistant', type: 'compliance', success_rate: 98.2, response_time: 0.8, satisfaction: 4.9, tasks: companies.count },
    { name: 'Customer Service Bot', type: 'support', success_rate: 87.3, response_time: 1.5, satisfaction: 4.5, tasks: 50 }
  ];

  agents.forEach((agent, index) => {
    const id = `agent_${index + 1}`;
    agentStmt.run(id, agent.name, agent.type, agent.success_rate, agent.response_time, agent.satisfaction, agent.tasks, 'active');
  });
  
  console.log(`✅ ${agents.length} agent performance records created`);

  console.log('\n✅ Sample data generation complete!');
  console.log('\nData Summary:');
  console.log(`  - ${activities.length} activity log entries`);
  console.log(`  - ${notifications.length} notifications`);
  console.log(`  - 1 revenue tracking period`);
  console.log(`  - ${metrics.length} analytics metrics`);
  console.log(`  - ${agents.length} agent performance records`);
  console.log('\n💡 This data is based on your REAL CRM data and can be deleted before launch.');

} catch (error) {
  console.error('❌ Error generating sample data:', error);
  process.exit(1);
} finally {
  db.close();
}

