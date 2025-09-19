import React, { useState, useEffect } from 'react';
import {
  ClipboardListIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  PlusIcon,
  SearchIcon,
  FilterIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationIcon,
  XIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  PaperClipIcon,
  ChatIcon,
  FlagIcon,
  StarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  EllipsisHorizontalIcon,
  PlayIcon,
  PauseIcon,
  StopIcon
} from '@heroicons/react/outline';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate: string;
  endDate: string;
  progress: number;
  teamMembers: TeamMember[];
  tasks: Task[];
  budget: number;
  spent: number;
  createdBy: string;
  createdAt: string;
  lastUpdate: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: TeamMember;
  dueDate: string;
  estimatedHours: number;
  actualHours: number;
  tags: string[];
  dependencies: string[];
  attachments: number;
  comments: number;
  createdDate: string;
  updatedDate: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  skills: string[];
  workload: number;
  availability: 'available' | 'busy' | 'unavailable';
}

interface Resource {
  id: string;
  name: string;
  type: 'person' | 'equipment' | 'software' | 'budget';
  status: 'available' | 'allocated' | 'maintenance' | 'unavailable';
  allocatedTo?: string;
  allocationStart?: string;
  allocationEnd?: string;
  cost: number;
  description: string;
}

const TeamCollaborationTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'projects' | 'tasks' | 'team' | 'resources'>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  useEffect(() => {
    loadCollaborationData();
  }, []);

  const loadCollaborationData = async () => {
    try {
      // Mock data - in real implementation, this would come from API
      const teamMembersData: TeamMember[] = [
        {
          id: '1',
          name: 'John Smith',
          email: 'john@rapidcrm.com',
          role: 'Project Manager',
          status: 'online',
          skills: ['Project Management', 'Agile', 'Leadership'],
          workload: 75,
          availability: 'available'
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          email: 'sarah@rapidcrm.com',
          role: 'Developer',
          status: 'away',
          skills: ['React', 'Node.js', 'TypeScript'],
          workload: 90,
          availability: 'busy'
        },
        {
          id: '3',
          name: 'Mike Davis',
          email: 'mike@rapidcrm.com',
          role: 'Designer',
          status: 'online',
          skills: ['UI/UX', 'Figma', 'Adobe Creative Suite'],
          workload: 60,
          availability: 'available'
        },
        {
          id: '4',
          name: 'Lisa Chen',
          email: 'lisa@rapidcrm.com',
          role: 'QA Engineer',
          status: 'busy',
          skills: ['Testing', 'Automation', 'Quality Assurance'],
          workload: 85,
          availability: 'busy'
        }
      ];

      const projectsData: Project[] = [
        {
          id: '1',
          name: 'Enterprise Dashboard Redesign',
          description: 'Complete redesign of the enterprise dashboard with new features and improved UX',
          status: 'active',
          priority: 'high',
          startDate: '2024-01-01',
          endDate: '2024-03-31',
          progress: 65,
          teamMembers: teamMembersData.slice(0, 3),
          tasks: [],
          budget: 50000,
          spent: 32500,
          createdBy: 'John Smith',
          createdAt: '2024-01-01',
          lastUpdate: '2024-01-16'
        },
        {
          id: '2',
          name: 'Mobile App Development',
          description: 'Development of mobile application for client portal access',
          status: 'planning',
          priority: 'medium',
          startDate: '2024-02-01',
          endDate: '2024-06-30',
          progress: 15,
          teamMembers: teamMembersData.slice(1, 4),
          tasks: [],
          budget: 75000,
          spent: 5000,
          createdBy: 'Sarah Johnson',
          createdAt: '2024-01-10',
          lastUpdate: '2024-01-15'
        },
        {
          id: '3',
          name: 'API Integration Project',
          description: 'Integration with third-party APIs for enhanced functionality',
          status: 'on_hold',
          priority: 'low',
          startDate: '2024-01-15',
          endDate: '2024-04-15',
          progress: 30,
          teamMembers: teamMembersData.slice(0, 2),
          tasks: [],
          budget: 25000,
          spent: 7500,
          createdBy: 'Mike Davis',
          createdAt: '2024-01-15',
          lastUpdate: '2024-01-16'
        }
      ];

      const tasksData: Task[] = [
        {
          id: '1',
          title: 'Design new dashboard layout',
          description: 'Create wireframes and mockups for the new enterprise dashboard',
          status: 'in_progress',
          priority: 'high',
          assignee: teamMembersData[2],
          dueDate: '2024-01-20',
          estimatedHours: 16,
          actualHours: 12,
          tags: ['design', 'dashboard', 'ui'],
          dependencies: [],
          attachments: 3,
          comments: 5,
          createdDate: '2024-01-10',
          updatedDate: '2024-01-16'
        },
        {
          id: '2',
          title: 'Implement analytics components',
          description: 'Develop the analytics display components with real-time data',
          status: 'todo',
          priority: 'high',
          assignee: teamMembersData[1],
          dueDate: '2024-01-25',
          estimatedHours: 24,
          actualHours: 0,
          tags: ['development', 'analytics', 'react'],
          dependencies: ['1'],
          attachments: 1,
          comments: 2,
          createdDate: '2024-01-12',
          updatedDate: '2024-01-15'
        },
        {
          id: '3',
          title: 'Write unit tests',
          description: 'Create comprehensive unit tests for all new components',
          status: 'review',
          priority: 'medium',
          assignee: teamMembersData[3],
          dueDate: '2024-01-22',
          estimatedHours: 12,
          actualHours: 10,
          tags: ['testing', 'quality', 'automation'],
          dependencies: ['2'],
          attachments: 0,
          comments: 3,
          createdDate: '2024-01-14',
          updatedDate: '2024-01-16'
        }
      ];

      const resourcesData: Resource[] = [
        {
          id: '1',
          name: 'John Smith',
          type: 'person',
          status: 'allocated',
          allocatedTo: 'Enterprise Dashboard Redesign',
          allocationStart: '2024-01-01',
          allocationEnd: '2024-03-31',
          cost: 150,
          description: 'Project Manager - Full time allocation'
        },
        {
          id: '2',
          name: 'Design Software License',
          type: 'software',
          status: 'allocated',
          allocatedTo: 'Enterprise Dashboard Redesign',
          allocationStart: '2024-01-01',
          allocationEnd: '2024-03-31',
          cost: 50,
          description: 'Figma Pro license for design work'
        },
        {
          id: '3',
          name: 'Development Server',
          type: 'equipment',
          status: 'available',
          cost: 200,
          description: 'High-performance development server'
        },
        {
          id: '4',
          name: 'Project Budget',
          type: 'budget',
          status: 'allocated',
          allocatedTo: 'Mobile App Development',
          allocationStart: '2024-02-01',
          allocationEnd: '2024-06-30',
          cost: 75000,
          description: 'Total budget for mobile app development'
        }
      ];

      setTeamMembers(teamMembersData);
      setProjects(projectsData);
      setTasks(tasksData);
      setResources(resourcesData);
    } catch (error) {
      console.error('Error loading collaboration data:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'available':
        return 'text-green-600 bg-green-100';
      case 'planning':
      case 'todo':
      case 'online':
        return 'text-blue-600 bg-blue-100';
      case 'in_progress':
      case 'review':
      case 'away':
        return 'text-yellow-600 bg-yellow-100';
      case 'on_hold':
      case 'busy':
      case 'allocated':
        return 'text-orange-600 bg-orange-100';
      case 'cancelled':
      case 'offline':
      case 'unavailable':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getWorkloadColor = (workload: number) => {
    if (workload >= 90) return 'text-red-600';
    if (workload >= 75) return 'text-orange-600';
    if (workload >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const renderProjects = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Project Management Board</h2>
        <button
          onClick={() => setShowProjectModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Create Project</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <SearchIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{project.name}</h3>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(project.priority)}`}>
                    {project.priority}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{project.description}</p>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      project.progress >= 80 ? 'bg-green-500' :
                      project.progress >= 60 ? 'bg-blue-500' :
                      project.progress >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="font-medium text-gray-600">Start Date:</span>
                  <p className="text-gray-900">{project.startDate}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">End Date:</span>
                  <p className="text-gray-900">{project.endDate}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Budget:</span>
                  <p className="text-gray-900">${project.budget.toLocaleString()}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Spent:</span>
                  <p className="text-gray-900">${project.spent.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <UserGroupIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{project.teamMembers.length} members</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ClipboardListIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{project.tasks.length} tasks</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 flex items-center justify-center space-x-1">
                  <EyeIcon className="h-4 w-4" />
                  <span>View</span>
                </button>
                <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 flex items-center justify-center space-x-1">
                  <PencilIcon className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm hover:bg-red-200">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTasks = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Task Assignment System</h2>
        <button
          onClick={() => setShowTaskModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Create Task</span>
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {['todo', 'in_progress', 'review', 'completed'].map((status) => (
          <div key={status} className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 capitalize">{status.replace('_', ' ')}</h3>
              <span className="text-sm text-gray-500">
                {tasks.filter(task => task.status === status).length} tasks
              </span>
            </div>
            <div className="p-4 space-y-3">
              {tasks.filter(task => task.status === status).map((task) => (
                <div key={task.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">{task.description}</p>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                      <UserIcon className="h-4 w-4 text-gray-600" />
                    </div>
                    <span className="text-xs text-gray-600">{task.assignee.name}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Due: {task.dueDate}</span>
                    <div className="flex items-center space-x-2">
                      {task.attachments > 0 && (
                        <span className="flex items-center space-x-1">
                          <PaperClipIcon className="h-3 w-3" />
                          <span>{task.attachments}</span>
                        </span>
                      )}
                      {task.comments > 0 && (
                        <span className="flex items-center space-x-1">
                          <ChatIcon className="h-3 w-3" />
                          <span>{task.comments}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap gap-1">
                    {task.tags.slice(0, 2).map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                    {task.tags.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        +{task.tags.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTeam = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => (
          <div key={member.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(member.status)}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-600">{member.role}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(member.availability)}`}>
                {member.availability}
              </span>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Workload</span>
                <span className={getWorkloadColor(member.workload)}>{member.workload}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    member.workload >= 90 ? 'bg-red-500' :
                    member.workload >= 75 ? 'bg-orange-500' :
                    member.workload >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${member.workload}%` }}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <span className="text-sm font-medium text-gray-600">Skills:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {member.skills.map((skill, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">
                View Profile
              </button>
              <button className="bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200">
                <PencilIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderResources = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Resource Allocation Tools</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {resources.map((resource) => (
          <div key={resource.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  resource.type === 'person' ? 'bg-blue-100' :
                  resource.type === 'equipment' ? 'bg-green-100' :
                  resource.type === 'software' ? 'bg-purple-100' : 'bg-yellow-100'
                }`}>
                  {resource.type === 'person' && <UserIcon className="h-5 w-5 text-blue-600" />}
                  {resource.type === 'equipment' && <CogIcon className="h-5 w-5 text-green-600" />}
                  {resource.type === 'software' && <ChartBarIcon className="h-5 w-5 text-purple-600" />}
                  {resource.type === 'budget' && <FlagIcon className="h-5 w-5 text-yellow-600" />}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{resource.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">{resource.type}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(resource.status)}`}>
                {resource.status}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">{resource.description}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <span className="font-medium text-gray-600">Cost:</span>
                <p className="text-gray-900">${resource.cost.toLocaleString()}</p>
              </div>
              {resource.allocatedTo && (
                <div>
                  <span className="font-medium text-gray-600">Allocated To:</span>
                  <p className="text-gray-900">{resource.allocatedTo}</p>
                </div>
              )}
              {resource.allocationStart && (
                <div>
                  <span className="font-medium text-gray-600">Start Date:</span>
                  <p className="text-gray-900">{resource.allocationStart}</p>
                </div>
              )}
              {resource.allocationEnd && (
                <div>
                  <span className="font-medium text-gray-600">End Date:</span>
                  <p className="text-gray-900">{resource.allocationEnd}</p>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">
                Allocate
              </button>
              <button className="bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200">
                <PencilIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'projects', name: 'Project Management', icon: ClipboardListIcon },
              { id: 'tasks', name: 'Task Assignment', icon: CheckCircleIcon },
              { id: 'team', name: 'Team Management', icon: UserGroupIcon },
              { id: 'resources', name: 'Resource Allocation', icon: CogIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'projects' && renderProjects()}
      {activeTab === 'tasks' && renderTasks()}
      {activeTab === 'team' && renderTeam()}
      {activeTab === 'resources' && renderResources()}
    </div>
  );
};

export default TeamCollaborationTools;

