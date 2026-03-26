import type { Employee } from '../types/crm';

// ─── Shared constants ────────────────────────────────────────────────────────
export const PRODUCTS = [
    'SEO Services',
    'Web Development',
    'Google Ads',
    'Social Media Marketing',
    'Content Marketing',
];

export const SERVICE_AREAS = [
    'North America',
    'Europe',
    'Asia Pacific',
    'Latin America',
    'Middle East',
];

export const DEPARTMENTS = ['Sales', 'CST', 'Finance', 'QA', 'Admin'];

// ─── Employees (shared between Admin EmployeeManagement & Finance) ────────────
export const INITIAL_EMPLOYEES: Employee[] = [
    { id: 1, name: 'John Smith', employeeId: 'EMP001', email: 'john@nexuswave.com', department: 'Sales', role: 'Sales Manager', isActive: true, baseSalary: 5000, advancePayments: 500, accruedPayments: 200, totalSalary: 4700, paymentStatus: 'paid', hireDate: '2024-01-15', tardies: 2 },
    { id: 2, name: 'Sarah Johnson', employeeId: 'EMP002', email: 'sarah.j@nexuswave.com', department: 'Sales', role: 'Sales Agent', isActive: true, baseSalary: 4800, advancePayments: 0, accruedPayments: 300, totalSalary: 5100, paymentStatus: 'pending', hireDate: '2024-01-20', tardies: 0 },
    { id: 3, name: 'Mike Chen', employeeId: 'EMP003', email: 'mike@nexuswave.com', department: 'CST', role: 'CST Agent', isActive: true, baseSalary: 4200, advancePayments: 300, accruedPayments: 150, totalSalary: 4050, paymentStatus: 'paid', hireDate: '2024-02-01', tardies: 1 },
    { id: 4, name: 'Emily Davis', employeeId: 'EMP004', email: 'emily@nexuswave.com', department: 'CST', role: 'CST Lead', isActive: true, baseSalary: 4500, advancePayments: 200, accruedPayments: 250, totalSalary: 4550, paymentStatus: 'partial', hireDate: '2024-02-01', tardies: 0 },
    { id: 5, name: 'Robert Wilson', employeeId: 'EMP005', email: 'robert@nexuswave.com', department: 'Finance', role: 'Finance Manager', isActive: true, baseSalary: 6000, advancePayments: 0, accruedPayments: 400, totalSalary: 6400, paymentStatus: 'pending', hireDate: '2023-11-10', tardies: 1 },
    { id: 6, name: 'Sarah Martinez', employeeId: 'EMP006', email: 'sarah@nexuswave.com', department: 'QA', role: 'QA Specialist', isActive: true, baseSalary: 4800, advancePayments: 0, accruedPayments: 300, totalSalary: 5100, paymentStatus: 'paid', hireDate: '2024-01-20', tardies: 0 },
];

// ─── Agent Performance ────────────────────────────────────────────────────────
export type TrainingStatus = 'completed' | 'in-progress' | 'pending';

export interface Agent {
    id: number;
    name: string;
    behaviorRating: number;
    floorTrainingStatus: TrainingStatus;
    techCoordination: number;
    numberOfCalls: number;
    recordingPerformance: number;
    overallScore: number;
}

export const INITIAL_AGENTS: Agent[] = [
    { id: 1, name: 'John Smith', behaviorRating: 4.5, floorTrainingStatus: 'completed', techCoordination: 4, numberOfCalls: 145, recordingPerformance: 4.2, overallScore: 85 },
    { id: 2, name: 'Sarah Johnson', behaviorRating: 4.8, floorTrainingStatus: 'completed', techCoordination: 4.5, numberOfCalls: 167, recordingPerformance: 4.7, overallScore: 92 },
    { id: 3, name: 'Mike Chen', behaviorRating: 3.9, floorTrainingStatus: 'in-progress', techCoordination: 3.5, numberOfCalls: 98, recordingPerformance: 3.8, overallScore: 75 },
    { id: 4, name: 'Emma Davis', behaviorRating: 4.3, floorTrainingStatus: 'completed', techCoordination: 4.1, numberOfCalls: 132, recordingPerformance: 4.4, overallScore: 88 },
    { id: 5, name: 'Alex Rodriguez', behaviorRating: 3.2, floorTrainingStatus: 'pending', techCoordination: 2.8, numberOfCalls: 54, recordingPerformance: 3.1, overallScore: 62 },
];

// ─── Sales Recordings ─────────────────────────────────────────────────────────
export type RecordingStatus = 'available' | 'processing' | 'failed';

export interface Recording {
    id: number;
    agentName: string;
    clientName: string;
    date: string;
    duration: string;
    status: RecordingStatus;
    qualityRating: number;
    tags: string[];
    outcome: 'converted' | 'pending' | 'lost';
}

export const INITIAL_RECORDINGS: Recording[] = [
    { id: 1, agentName: 'John Smith', clientName: 'ABC Corporation', date: '2026-02-10', duration: '15:32', status: 'available', qualityRating: 4, tags: ['follow-up', 'proposal'], outcome: 'converted' },
    { id: 2, agentName: 'Sarah Johnson', clientName: 'XYZ Enterprises', date: '2026-02-11', duration: '22:18', status: 'available', qualityRating: 5, tags: ['demo', 'technical'], outcome: 'converted' },
    { id: 3, agentName: 'Mike Chen', clientName: 'Tech Innovations LLC', date: '2026-02-11', duration: '08:45', status: 'processing', qualityRating: 0, tags: ['cold-call'], outcome: 'pending' },
    { id: 4, agentName: 'Emma Davis', clientName: 'Global Services Inc', date: '2026-02-12', duration: '18:56', status: 'available', qualityRating: 4, tags: ['negotiation', 'pricing'], outcome: 'pending' },
    { id: 5, agentName: 'Alex Rodriguez', clientName: 'StartUp Hub', date: '2026-02-12', duration: '12:24', status: 'failed', qualityRating: 0, tags: ['initial-contact'], outcome: 'lost' },
    { id: 6, agentName: 'Sarah Johnson', clientName: 'Premium Partners', date: '2026-02-12', duration: '25:10', status: 'available', qualityRating: 5, tags: ['closing', 'contract'], outcome: 'converted' },
];

// ─── Monthly Targets ──────────────────────────────────────────────────────────
export const MONTHLY_DATA = {
    revenueTarget: 150000,
    revenueAchieved: 120000,
    revenueLeft: 30000,
    totalSales: 48,
    averageDealSize: 2500,
    conversionRate: 35,
};

export const LAST_6_MONTHS = [
    { month: 'Sep', revenue: 95000 },
    { month: 'Oct', revenue: 110000 },
    { month: 'Nov', revenue: 125000 },
    { month: 'Dec', revenue: 140000 },
    { month: 'Jan', revenue: 130000 },
    { month: 'Feb', revenue: 120000 },
];

export const SALES_BY_PRODUCT = [
    { name: 'SEO Services', value: 18, color: '#3b82f6' },
    { name: 'Web Development', value: 12, color: '#10b981' },
    { name: 'Google Ads', value: 10, color: '#f59e0b' },
    { name: 'Social Media', value: 5, color: '#ec4899' },
    { name: 'Content Marketing', value: 3, color: '#8b5cf6' },
];

export const SALES_BY_AREA = [
    { area: 'North America', sales: 20 },
    { area: 'Europe', sales: 15 },
    { area: 'Asia Pacific', sales: 8 },
    { area: 'Latin America', sales: 3 },
    { area: 'Middle East', sales: 2 },
];

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
export const UPCOMING_EVENTS = [
    { id: '1', title: 'Q1 Review Meeting', date: '2026-02-15', type: 'meeting' },
    { id: '2', title: 'Sales Training Workshop', date: '2026-02-18', type: 'training' },
    { id: '3', title: 'Monthly Report Deadline', date: '2026-02-28', type: 'deadline' },
    { id: '4', title: 'Team Building Event', date: '2026-03-05', type: 'other' },
];

export const MANAGER_PERFORMANCE = [
    { id: 1, name: 'John Smith', role: 'Sales Manager', assigned: 25, completed: 20, percentage: 80 },
    { id: 2, name: 'Emily Davis', role: 'CST Lead', assigned: 30, completed: 28, percentage: 93 },
    { id: 3, name: 'Robert Wilson', role: 'Finance Manager', assigned: 12, completed: 11, percentage: 92 },
    { id: 4, name: 'Sarah Martinez', role: 'QA Specialist', assigned: 20, completed: 18, percentage: 90 },
];

export const COMPANY_METRICS = {
    totalRevenue: 245000,
    revenueTarget: 300000,
    activeClients: 67,
    clientRetention: 89,
    employeeSatisfaction: 87,
    avgTaskCompletion: 88,
};

// ─── Performance Reviews ──────────────────────────────────────────────────────
export const SALES_TEAM_PERFORMANCE = [
    { id: '1', name: 'John Smith', role: 'Sales Manager', monthlyRevenue: 125000, targetRevenue: 150000, callsMade: 145, conversionRate: 35, attendanceRate: 95, tardies: 2, overallScore: 88 },
    { id: '2', name: 'Sarah Johnson', role: 'Sales Agent', monthlyRevenue: 95000, targetRevenue: 100000, callsMade: 167, conversionRate: 32, attendanceRate: 98, tardies: 1, overallScore: 92 },
];

export const CST_TEAM_PERFORMANCE = [
    { id: '1', name: 'Emily Davis', role: 'CST Lead', clientsManaged: 45, satisfactionScore: 4.8, responseTime: '2.5 hours', tasksCompleted: 28, tasksMissed: 1, attendanceRate: 100, tardies: 0, overallScore: 95 },
    { id: '2', name: 'Mike Chen', role: 'CST Agent', clientsManaged: 32, satisfactionScore: 4.3, responseTime: '3.2 hours', tasksCompleted: 22, tasksMissed: 2, attendanceRate: 96, tardies: 1, overallScore: 85 },
];

export const FINANCE_TEAM_PERFORMANCE = [
    { id: '1', name: 'Robert Wilson', role: 'Finance Manager', paymentsProcessed: 156, accuracyRate: 99.5, reportsGenerated: 12, tasksCompleted: 11, tasksMissed: 0, attendanceRate: 97, tardies: 1, overallScore: 94 },
];

export const QA_TEAM_PERFORMANCE = [
    { id: '1', name: 'Sarah Martinez', role: 'QA Specialist', evaluationsCompleted: 85, issuesIdentified: 23, resolutionRate: 91, tasksCompleted: 42, tasksMissed: 3, attendanceRate: 98, tardies: 0, overallScore: 91 },
];

// ─── Task Delegation ──────────────────────────────────────────────────────────
export const CST_MEMBERS = [
    { id: 1, name: 'Emily Davis', role: 'CST Lead', currentTasks: 8 },
    { id: 2, name: 'Mike Chen', role: 'CST Agent', currentTasks: 5 },
    { id: 3, name: 'Lisa Johnson', role: 'CST Agent', currentTasks: 6 },
];

// CST Agents list for CST Manager assignment (keyed with cst-prefixed IDs to match ClientInboxContext seeds)
export const CST_AGENTS = [
    { id: 1, name: 'Emily Davis', role: 'CST Lead', currentClients: 9 },
    { id: 2, name: 'Mike Chen', role: 'CST Agent', currentClients: 7 },
    { id: 3, name: 'Lisa Johnson', role: 'CST Agent', currentClients: 8 },
];

export const SALES_LEADS = [
    { id: 1, companyName: 'ABC Corporation', customerName: 'John Williams', paymentAmount: 5000, productSold: 'SEO Services', serviceArea: 'North America', contactNo1: '+1 (555) 123-4567', submittedBy: 'John Smith', submittedDate: '2026-02-12', status: 'pending' as const },
    { id: 2, companyName: 'XYZ Enterprises', customerName: 'Sarah Chen', paymentAmount: 8000, productSold: 'Web Development', serviceArea: 'Europe', contactNo1: '+44 20 1234 5678', submittedBy: 'Sarah Johnson', submittedDate: '2026-02-13', status: 'pending' as const },
];

// ─── CST Dashboard ────────────────────────────────────────────────────────────
export const ACTIVE_CLIENTS = [
    { id: '1', name: 'ABC Corporation', healthScore: 85, lastInteraction: '2026-02-11', nextCheckIn: '2026-02-18', assignedAgent: 'Emily Davis' },
    { id: '2', name: 'XYZ Enterprises', healthScore: 92, lastInteraction: '2026-02-12', nextCheckIn: '2026-02-19', assignedAgent: 'Mike Chen' },
    { id: '3', name: 'Tech Innovations LLC', healthScore: 78, lastInteraction: '2026-02-10', nextCheckIn: '2026-02-17', assignedAgent: 'Emily Davis' },
];

export const ONBOARDING_CLIENTS = [
    { id: '4', name: 'Global Services Inc', progress: 60, assignedAgent: 'Mike Chen', expectedCompletion: '2026-02-20', stage: 'Documentation' },
    { id: '5', name: 'StartUp Hub', progress: 30, assignedAgent: 'Emily Davis', expectedCompletion: '2026-02-25', stage: 'Initial Setup' },
];

export type FlagType = 'red-flag' | 'yellow-flag' | 'black-flag';

export const FLAGGED_CLIENTS: Array<{
    id: string; name: string; type: FlagType; issue: string;
    assignedAgent: string; flaggedDate?: string; churnDate?: string; churnReason?: string;
}> = [
        { id: '6', name: 'Premium Partners', type: 'red-flag', issue: 'Payment dispute', assignedAgent: 'Mike Chen', flaggedDate: '2026-02-09' },
        { id: '7', name: 'Digital Solutions Co', type: 'yellow-flag', issue: 'Decreased engagement', assignedAgent: 'Emily Davis', flaggedDate: '2026-02-10' },
        { id: '8', name: 'Old Client LLC', type: 'black-flag', issue: 'Service cancelled', assignedAgent: 'Mike Chen', churnDate: '2026-01-15', churnReason: 'Budget constraints' },
    ];

export const DAILY_TASKS = [
    { id: 1, title: 'Follow up with ABC Corp on quarterly review', priority: 'high' as const, status: 'todo' as const, dueTime: '10:00 AM' },
    { id: 2, title: 'Send onboarding checklist to StartUp Hub', priority: 'medium' as const, status: 'in-progress' as const, dueTime: '2:00 PM' },
    { id: 3, title: 'Update client database with new contacts', priority: 'low' as const, status: 'done' as const, dueTime: '4:00 PM' },
    { id: 4, title: 'Prepare monthly performance report', priority: 'high' as const, status: 'todo' as const, dueTime: '5:00 PM' },
];

export const SCHEDULED_CALLS = [
    { id: 1, clientName: 'ABC Corporation', purpose: 'Quarterly Review', time: '10:00 AM', duration: '30 min', status: 'scheduled' as const },
    { id: 2, clientName: 'XYZ Enterprises', purpose: 'Check-in Call', time: '2:30 PM', duration: '15 min', status: 'scheduled' as const },
    { id: 3, clientName: 'Tech Innovations', purpose: 'Strategy Discussion', time: '4:00 PM', duration: '45 min', status: 'completed' as const },
];

export const SCHEDULED_EMAILS = [
    { id: 1, clientName: 'Global Services Inc', subject: 'Onboarding Progress Update', scheduledTime: '9:00 AM', status: 'sent' as const, template: 'Onboarding Update' },
    { id: 2, clientName: 'StartUp Hub', subject: 'Welcome to Our Service', scheduledTime: '11:00 AM', status: 'draft' as const, template: 'Welcome Email' },
];

// ─── QA Dashboard ─────────────────────────────────────────────────────────────
export const CST_CLIENT_EVALUATIONS = [
    { id: '1', clientName: 'ABC Corporation', agentName: 'Emily Davis', rating: 4.5, notes: 'Excellent customer service', date: '2026-02-10' },
    { id: '2', clientName: 'XYZ Enterprises', agentName: 'Mike Chen', rating: 3.8, notes: 'Good follow-up but slow response', date: '2026-02-11' },
    { id: '3', clientName: 'Tech Innovations', agentName: 'Emily Davis', rating: 4.9, notes: 'Outstanding communication', date: '2026-02-12' },
];

export const AGENT_EVALUATIONS = [
    { id: '1', agentName: 'Emily Davis', department: 'CST', overallScore: 92, callQuality: 4.5, responseTime: 4.8, clientSatisfaction: 4.7 },
    { id: '2', agentName: 'Mike Chen', department: 'CST', overallScore: 85, callQuality: 4.2, responseTime: 4.1, clientSatisfaction: 4.3 },
    { id: '3', agentName: 'John Smith', department: 'Sales', overallScore: 88, callQuality: 4.4, responseTime: 4.3, clientSatisfaction: 4.5 },
];

export const DAILY_CALL_METRICS = [
    { date: '2026-02-10', totalCalls: 145, qualityScore: 4.2, avgDuration: '12:30' },
    { date: '2026-02-11', totalCalls: 167, qualityScore: 4.5, avgDuration: '14:15' },
    { date: '2026-02-12', totalCalls: 132, qualityScore: 4.1, avgDuration: '11:45' },
];

export const SALES_CALL_NOTES = [
    { id: '1', agentName: 'John Smith', clientName: 'ABC Corp', notes: 'Client expressed interest in SEO package. Follow up needed.', date: '2026-02-10', forCSTTeam: true },
    { id: '2', agentName: 'Sarah Johnson', clientName: 'XYZ Ltd', notes: 'Technical questions about implementation.', date: '2026-02-11', forCSTTeam: true },
];

export const CLIENT_LIFESPAN_DATA = {
    longTerm: [
        { id: '1', name: 'ABC Corporation', lifespan: 8, revenue: 45000, status: 'excellent' },
    ],
    shortTerm: [
        { id: '4', name: 'StartUp Hub', lifespan: 1, revenue: 5000, status: 'new' },
    ],
    chargebacks: [
        { id: '6', name: 'Old Client LLC', lifespan: 0.5, revenue: -2000, mistakeType: 'cst' as const, reason: 'Poor onboarding' },
        { id: '7', name: 'Quick Exit Inc', lifespan: 0.3, revenue: -1500, mistakeType: 'sales' as const, reason: 'Misrepresented services' },
    ],
};

export const MANAGER_TASK_METRICS = [
    { id: '1', managerName: 'John Smith', department: 'Sales', totalTasks: 25, completedTasks: 20, missedTasks: 2, month: 'February' },
    { id: '2', managerName: 'Emily Davis', department: 'CST', totalTasks: 30, completedTasks: 28, missedTasks: 1, month: 'February' },
];

// ─── Employee Task Details (per person drill-down) ────────────────────────────
export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskItemStatus = 'completed' | 'in-progress' | 'missed' | 'pending';

export interface EmployeeTaskItem {
    id: string;
    employeeName: string;
    title: string;
    priority: TaskPriority;
    status: TaskItemStatus;
    dueDate: string;
    category: string;
}

export const EMPLOYEE_TASK_DETAILS: EmployeeTaskItem[] = [
    // John Smith — Sales Manager
    { id: 't1', employeeName: 'John Smith', title: 'Weekly sales pipeline review', priority: 'high', status: 'completed', dueDate: '2026-02-10', category: 'Management' },
    { id: 't2', employeeName: 'John Smith', title: 'Client proposal: ABC Corp', priority: 'high', status: 'completed', dueDate: '2026-02-12', category: 'Sales' },
    { id: 't3', employeeName: 'John Smith', title: 'Q1 target report submission', priority: 'high', status: 'in-progress', dueDate: '2026-03-01', category: 'Report' },
    { id: 't4', employeeName: 'John Smith', title: 'Agent performance coaching', priority: 'medium', status: 'pending', dueDate: '2026-03-05', category: 'HR' },
    { id: 't5', employeeName: 'John Smith', title: 'Update CRM lead status', priority: 'low', status: 'missed', dueDate: '2026-02-20', category: 'Admin' },
    // Sarah Johnson — Sales Agent
    { id: 't6', employeeName: 'Sarah Johnson', title: 'Follow up: XYZ Enterprise demo', priority: 'high', status: 'completed', dueDate: '2026-02-11', category: 'Sales' },
    { id: 't7', employeeName: 'Sarah Johnson', title: 'Cold call campaign (batch 3)', priority: 'medium', status: 'completed', dueDate: '2026-02-14', category: 'Sales' },
    { id: 't8', employeeName: 'Sarah Johnson', title: 'Submit weekly activity log', priority: 'low', status: 'in-progress', dueDate: '2026-03-14', category: 'Admin' },
    // Emily Davis — CST Lead
    { id: 't9', employeeName: 'Emily Davis', title: 'Onboard StartUp Hub', priority: 'high', status: 'completed', dueDate: '2026-02-20', category: 'Onboarding' },
    { id: 't10', employeeName: 'Emily Davis', title: 'Monthly check-in: ABC Corp', priority: 'medium', status: 'completed', dueDate: '2026-02-18', category: 'Client' },
    { id: 't11', employeeName: 'Emily Davis', title: 'Escalation review: Premium Ptrs', priority: 'high', status: 'in-progress', dueDate: '2026-03-10', category: 'Escalation' },
    { id: 't12', employeeName: 'Emily Davis', title: 'CST process documentation', priority: 'low', status: 'missed', dueDate: '2026-02-28', category: 'Admin' },
    // Mike Chen — CST Agent
    { id: 't13', employeeName: 'Mike Chen', title: 'Follow up: Global Services Inc', priority: 'high', status: 'completed', dueDate: '2026-02-15', category: 'Client' },
    { id: 't14', employeeName: 'Mike Chen', title: 'Update client health dashboard', priority: 'medium', status: 'missed', dueDate: '2026-02-22', category: 'Admin' },
    // Robert Wilson — Finance
    { id: 't15', employeeName: 'Robert Wilson', title: 'Process February payroll', priority: 'high', status: 'completed', dueDate: '2026-02-28', category: 'Payroll' },
    { id: 't16', employeeName: 'Robert Wilson', title: 'Generate Q1 financial report', priority: 'high', status: 'in-progress', dueDate: '2026-03-05', category: 'Report' },
    // Sarah Martinez — QA
    { id: 't17', employeeName: 'Sarah Martinez', title: 'Sales call quality audit', priority: 'high', status: 'completed', dueDate: '2026-02-12', category: 'Audit' },
    { id: 't18', employeeName: 'Sarah Martinez', title: 'CST evaluation batch review', priority: 'high', status: 'completed', dueDate: '2026-02-19', category: 'Evaluation' },
    { id: 't19', employeeName: 'Sarah Martinez', title: 'Issue resolution follow-ups', priority: 'medium', status: 'pending', dueDate: '2026-03-08', category: 'QA' },
];

// ─── Sales Manager Performance (for Admin overview) ───────────────────────────
export const SALES_MANAGER_PERFORMANCE = [
    { id: '1', name: 'Ahmed Khan', role: 'Sales Manager', totalRevenue: 220000, targetRevenue: 250000, teamsManaged: 5, agentPerformanceAvg: 87, monthlyDeals: 48, attendanceRate: 97, tardies: 0, overallScore: 90 },
];



export const QA_UPCOMING_EVENTS = [
    { id: '1', title: 'QA Team Review Meeting', date: '2026-03-05', type: 'meeting' },
    { id: '2', title: 'Quality Audit — Sales Calls', date: '2026-03-10', type: 'deadline' },
];

// ─── Attendance Log ───────────────────────────────────────────────────────────
export type AttendanceStatus = 'on-time' | 'tardy' | 'absent';

export interface AttendanceEntry {
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    date: string;
    clockIn: string | null;
    clockOut: string | null;
    hoursWorked: number | null;
    status: AttendanceStatus;
}

export const ATTENDANCE_LOG: AttendanceEntry[] = [
    // John Smith — Sales Manager
    { id: 'a1', employeeId: 'EMP001', employeeName: 'John Smith', department: 'Sales', date: '2026-03-03', clockIn: '09:02', clockOut: '17:05', hoursWorked: 8.0, status: 'on-time' },
    { id: 'a2', employeeId: 'EMP001', employeeName: 'John Smith', department: 'Sales', date: '2026-03-04', clockIn: '09:18', clockOut: '17:10', hoursWorked: 7.9, status: 'tardy' },
    { id: 'a3', employeeId: 'EMP001', employeeName: 'John Smith', department: 'Sales', date: '2026-03-05', clockIn: '08:58', clockOut: '17:00', hoursWorked: 8.0, status: 'on-time' },
    { id: 'a4', employeeId: 'EMP001', employeeName: 'John Smith', department: 'Sales', date: '2026-03-06', clockIn: '09:31', clockOut: '17:20', hoursWorked: 7.8, status: 'tardy' },
    { id: 'a5', employeeId: 'EMP001', employeeName: 'John Smith', department: 'Sales', date: '2026-03-07', clockIn: '09:00', clockOut: '17:00', hoursWorked: 8.0, status: 'on-time' },
    { id: 'a6', employeeId: 'EMP001', employeeName: 'John Smith', department: 'Sales', date: '2026-03-10', clockIn: '08:55', clockOut: '17:05', hoursWorked: 8.2, status: 'on-time' },
    { id: 'a7', employeeId: 'EMP001', employeeName: 'John Smith', department: 'Sales', date: '2026-03-11', clockIn: '09:45', clockOut: '17:30', hoursWorked: 7.8, status: 'tardy' },
    { id: 'a8', employeeId: 'EMP001', employeeName: 'John Smith', department: 'Sales', date: '2026-03-12', clockIn: '09:00', clockOut: '17:00', hoursWorked: 8.0, status: 'on-time' },
    { id: 'a9', employeeId: 'EMP001', employeeName: 'John Smith', department: 'Sales', date: '2026-03-13', clockIn: null, clockOut: null, hoursWorked: null, status: 'absent' },
    { id: 'a10', employeeId: 'EMP001', employeeName: 'John Smith', department: 'Sales', date: '2026-03-14', clockIn: '09:05', clockOut: '17:00', hoursWorked: 7.9, status: 'on-time' },

    // Sarah Johnson — Sales Agent
    { id: 'b1', employeeId: 'EMP002', employeeName: 'Sarah Johnson', department: 'Sales', date: '2026-03-03', clockIn: '08:55', clockOut: '17:00', hoursWorked: 8.1, status: 'on-time' },
    { id: 'b2', employeeId: 'EMP002', employeeName: 'Sarah Johnson', department: 'Sales', date: '2026-03-04', clockIn: '09:00', clockOut: '17:00', hoursWorked: 8.0, status: 'on-time' },
    { id: 'b3', employeeId: 'EMP002', employeeName: 'Sarah Johnson', department: 'Sales', date: '2026-03-05', clockIn: '09:00', clockOut: '17:00', hoursWorked: 8.0, status: 'on-time' },
    { id: 'b4', employeeId: 'EMP002', employeeName: 'Sarah Johnson', department: 'Sales', date: '2026-03-06', clockIn: '08:57', clockOut: '17:05', hoursWorked: 8.1, status: 'on-time' },
    { id: 'b5', employeeId: 'EMP002', employeeName: 'Sarah Johnson', department: 'Sales', date: '2026-03-07', clockIn: '09:12', clockOut: '17:00', hoursWorked: 7.8, status: 'tardy' },
    { id: 'b6', employeeId: 'EMP002', employeeName: 'Sarah Johnson', department: 'Sales', date: '2026-03-10', clockIn: '08:53', clockOut: '17:00', hoursWorked: 8.1, status: 'on-time' },
    { id: 'b7', employeeId: 'EMP002', employeeName: 'Sarah Johnson', department: 'Sales', date: '2026-03-11', clockIn: '09:00', clockOut: '17:00', hoursWorked: 8.0, status: 'on-time' },
    { id: 'b8', employeeId: 'EMP002', employeeName: 'Sarah Johnson', department: 'Sales', date: '2026-03-12', clockIn: '09:01', clockOut: '17:00', hoursWorked: 8.0, status: 'on-time' },
    { id: 'b9', employeeId: 'EMP002', employeeName: 'Sarah Johnson', department: 'Sales', date: '2026-03-13', clockIn: '09:00', clockOut: '17:00', hoursWorked: 8.0, status: 'on-time' },
    { id: 'b10', employeeId: 'EMP002', employeeName: 'Sarah Johnson', department: 'Sales', date: '2026-03-14', clockIn: '09:00', clockOut: '17:00', hoursWorked: 8.0, status: 'on-time' },

    // Mike Chen — CST Agent
    { id: 'c1', employeeId: 'EMP003', employeeName: 'Mike Chen', department: 'CST', date: '2026-03-03', clockIn: '09:00', clockOut: '17:00', hoursWorked: 8.0, status: 'on-time' },
    { id: 'c2', employeeId: 'EMP003', employeeName: 'Mike Chen', department: 'CST', date: '2026-03-04', clockIn: '09:20', clockOut: '17:10', hoursWorked: 7.8, status: 'tardy' },
    { id: 'c3', employeeId: 'EMP003', employeeName: 'Mike Chen', department: 'CST', date: '2026-03-05', clockIn: '08:59', clockOut: '17:00', hoursWorked: 8.0, status: 'on-time' },
    { id: 'c4', employeeId: 'EMP003', employeeName: 'Mike Chen', department: 'CST', date: '2026-03-06', clockIn: '09:00', clockOut: '17:00', hoursWorked: 8.0, status: 'on-time' },
    { id: 'c5', employeeId: 'EMP003', employeeName: 'Mike Chen', department: 'CST', date: '2026-03-07', clockIn: '09:00', clockOut: '17:00', hoursWorked: 8.0, status: 'on-time' },
    { id: 'c6', employeeId: 'EMP003', employeeName: 'Mike Chen', department: 'CST', date: '2026-03-10', clockIn: null, clockOut: null, hoursWorked: null, status: 'absent' },
    { id: 'c7', employeeId: 'EMP003', employeeName: 'Mike Chen', department: 'CST', date: '2026-03-11', clockIn: '09:00', clockOut: '17:00', hoursWorked: 8.0, status: 'on-time' },
    { id: 'c8', employeeId: 'EMP003', employeeName: 'Mike Chen', department: 'CST', date: '2026-03-12', clockIn: '09:00', clockOut: '17:00', hoursWorked: 8.0, status: 'on-time' },
    { id: 'c9', employeeId: 'EMP003', employeeName: 'Mike Chen', department: 'CST', date: '2026-03-13', clockIn: '09:35', clockOut: '17:15', hoursWorked: 7.7, status: 'tardy' },
    { id: 'c10', employeeId: 'EMP003', employeeName: 'Mike Chen', department: 'CST', date: '2026-03-14', clockIn: '09:00', clockOut: '17:00', hoursWorked: 8.0, status: 'on-time' },

    // Emily Davis — CST Lead
    { id: 'd1', employeeId: 'EMP004', employeeName: 'Emily Davis', department: 'CST', date: '2026-03-03', clockIn: '08:50', clockOut: '17:00', hoursWorked: 8.2, status: 'on-time' },
    { id: 'd2', employeeId: 'EMP004', employeeName: 'Emily Davis', department: 'CST', date: '2026-03-04', clockIn: '09:00', clockOut: '17:00', hoursWorked: 8.0, status: 'on-time' },
    { id: 'd3', employeeId: 'EMP004', employeeName: 'Emily Davis', department: 'CST', date: '2026-03-05', clockIn: '09:00', clockOut: '17:00', hoursWorked: 8.0, status: 'on-time' },
    { id: 'd4', employeeId: 'EMP004', employeeName: 'Emily Davis', department: 'CST', date: '2026-03-06', clockIn: '08:55', clockOut: '17:05', hoursWorked: 8.2, status: 'on-time' },
    { id: 'd5', employeeId: 'EMP004', employeeName: 'Emily Davis', department: 'CST', date: '2026-03-07', clockIn: '09:00', clockOut: '17:00', hoursWorked: 8.0, status: 'on-time' },
    { id: 'd6', employeeId: 'EMP004', employeeName: 'Emily Davis', department: 'CST', date: '2026-03-10', clockIn: '09:00', clockOut: '17:00', hoursWorked: 8.0, status: 'on-time' },
    { id: 'd7', employeeId: 'EMP004', employeeName: 'Emily Davis', department: 'CST', date: '2026-03-11', clockIn: '09:00', clockOut: '17:00', hoursWorked: 8.0, status: 'on-time' },
    { id: 'd8', employeeId: 'EMP004', employeeName: 'Emily Davis', department: 'CST', date: '2026-03-12', clockIn: '08:58', clockOut: '17:00', hoursWorked: 8.0, status: 'on-time' },
    { id: 'd9', employeeId: 'EMP004', employeeName: 'Emily Davis', department: 'CST', date: '2026-03-13', clockIn: '09:00', clockOut: '17:00', hoursWorked: 8.0, status: 'on-time' },
    { id: 'd10', employeeId: 'EMP004', employeeName: 'Emily Davis', department: 'CST', date: '2026-03-14', clockIn: '09:00', clockOut: '17:00', hoursWorked: 8.0, status: 'on-time' },

    // Robert Wilson — Finance Manager
    { id: 'e1', employeeId: 'EMP005', employeeName: 'Robert Wilson', department: 'Finance', date: '2026-03-03', clockIn: '09:00', clockOut: '17:00', hoursWorked: 8.0, status: 'on-time' },
    { id: 'e2', employeeId: 'EMP005', employeeName: 'Robert Wilson', department: 'Finance', date: '2026-03-04', clockIn: '09:00', clockOut: '17:00', hoursWorked: 8.0, status: 'on-time' },
    { id: 'e3', employeeId: 'EMP005', employeeName: 'Robert Wilson', department: 'Finance', date: '2026-03-05', clockIn: '09:25', clockOut: '17:10', hoursWorked: 7.7, status: 'tardy' },
    { id: 'e4', employeeId: 'EMP005', employeeName: 'Robert Wilson', department: 'Finance', date: '2026-03-06', clockIn: '09:00', clockOut: '17:00', hoursWorked: 8.0, status: 'on-time' },
    { id: 'e5', employeeId: 'EMP005', employeeName: 'Robert Wilson', department: 'Finance', date: '2026-03-07', clockIn: '09:00', clockOut: '17:00', hoursWorked: 8.0, status: 'on-time' },
    { id: 'e6', employeeId: 'EMP005', employeeName: 'Robert Wilson', department: 'Finance', date: '2026-03-10', clockIn: '09:00', clockOut: '17:00', hoursWorked: 8.0, status: 'on-time' },
    { id: 'e7', employeeId: 'EMP005', employeeName: 'Robert Wilson', department: 'Finance', date: '2026-03-11', clockIn: '09:00', clockOut: '17:00', hoursWorked: 8.0, status: 'on-time' },
    { id: 'e8', employeeId: 'EMP005', employeeName: 'Robert Wilson', department: 'Finance', date: '2026-03-12', clockIn: '09:00', clockOut: '17:00', hoursWorked: 8.0, status: 'on-time' },
    { id: 'e9', employeeId: 'EMP005', employeeName: 'Robert Wilson', department: 'Finance', date: '2026-03-13', clockIn: '09:00', clockOut: '17:00', hoursWorked: 8.0, status: 'on-time' },
    { id: 'e10', employeeId: 'EMP005', employeeName: 'Robert Wilson', department: 'Finance', date: '2026-03-14', clockIn: '09:00', clockOut: '17:00', hoursWorked: 8.0, status: 'on-time' },

    // Sarah Martinez — QA Specialist
    { id: 'f1', employeeId: 'EMP006', employeeName: 'Sarah Martinez', department: 'QA', date: '2026-03-03', clockIn: '09:00', clockOut: '17:00', hoursWorked: 8.0, status: 'on-time' },
    { id: 'f2', employeeId: 'EMP006', employeeName: 'Sarah Martinez', department: 'QA', date: '2026-03-04', clockIn: '09:00', clockOut: '17:00', hoursWorked: 8.0, status: 'on-time' },
    { id: 'f3', employeeId: 'EMP006', employeeName: 'Sarah Martinez', department: 'QA', date: '2026-03-05', clockIn: '08:52', clockOut: '17:00', hoursWorked: 8.1, status: 'on-time' },
    { id: 'f4', employeeId: 'EMP006', employeeName: 'Sarah Martinez', department: 'QA', date: '2026-03-06', clockIn: '09:00', clockOut: '17:00', hoursWorked: 8.0, status: 'on-time' },
    { id: 'f5', employeeId: 'EMP006', employeeName: 'Sarah Martinez', department: 'QA', date: '2026-03-07', clockIn: '09:00', clockOut: '17:00', hoursWorked: 8.0, status: 'on-time' },
    { id: 'f6', employeeId: 'EMP006', employeeName: 'Sarah Martinez', department: 'QA', date: '2026-03-10', clockIn: '09:00', clockOut: '17:00', hoursWorked: 8.0, status: 'on-time' },
    { id: 'f7', employeeId: 'EMP006', employeeName: 'Sarah Martinez', department: 'QA', date: '2026-03-11', clockIn: '09:00', clockOut: '17:00', hoursWorked: 8.0, status: 'on-time' },
    { id: 'f8', employeeId: 'EMP006', employeeName: 'Sarah Martinez', department: 'QA', date: '2026-03-12', clockIn: '09:00', clockOut: '17:00', hoursWorked: 8.0, status: 'on-time' },
    { id: 'f9', employeeId: 'EMP006', employeeName: 'Sarah Martinez', department: 'QA', date: '2026-03-13', clockIn: '09:00', clockOut: '17:00', hoursWorked: 8.0, status: 'on-time' },
    { id: 'f10', employeeId: 'EMP006', employeeName: 'Sarah Martinez', department: 'QA', date: '2026-03-14', clockIn: '09:00', clockOut: '17:00', hoursWorked: 8.0, status: 'on-time' },
];

// ─── Follow-Up Leads ──────────────────────────────────────────────────────────
export type FollowUpStatus = 'pending' | 'contacted' | 'closed';

export interface FollowUpLead {
    id: string;
    clientName: string;
    agentName: string;
    contactNo: string;
    product: string;
    area: string;
    status: FollowUpStatus;
    dueDate: string;
    notes: string;
}

export const FOLLOW_UP_LEADS: FollowUpLead[] = [
    { id: '1', clientName: 'ABC Corp', agentName: 'John Smith', contactNo: '+1 555-1234', product: 'SEO Services', area: 'North America', status: 'pending', dueDate: '2026-03-16', notes: 'Interested in Q2 package' },
    { id: '2', clientName: 'XYZ Ltd', agentName: 'Sarah Johnson', contactNo: '+44 20-5678', product: 'Web Development', area: 'Europe', status: 'contacted', dueDate: '2026-03-18', notes: 'Awaiting tech proposal' },
    { id: '3', clientName: 'Tech Hub', agentName: 'John Smith', contactNo: '+1 555-9012', product: 'Google Ads', area: 'North America', status: 'pending', dueDate: '2026-03-20', notes: 'Call scheduled for next Monday' },
    { id: '4', clientName: 'Global Biz Inc', agentName: 'Sarah Johnson', contactNo: '+1 555-3456', product: 'Social Media Marketing', area: 'Latin America', status: 'closed', dueDate: '2026-03-10', notes: 'Converted — see CST entry' },
];

// ─── Agent Targets (last 3 months + current) ──────────────────────────────────
export interface AgentTarget {
    id: string;
    agentId: string;
    agentName: string;
    month: string;
    target: number;
    achieved: number;
}

export const AGENT_TARGETS: AgentTarget[] = [
    { id: 't1', agentId: '1', agentName: 'John Smith', month: 'December 2025', target: 140000, achieved: 130000 },
    { id: 't2', agentId: '1', agentName: 'John Smith', month: 'January 2026', target: 145000, achieved: 138000 },
    { id: 't3', agentId: '1', agentName: 'John Smith', month: 'February 2026', target: 150000, achieved: 125000 },
    { id: 't4', agentId: '1', agentName: 'John Smith', month: 'March 2026', target: 150000, achieved: 0 },

    { id: 't5', agentId: '2', agentName: 'Sarah Johnson', month: 'December 2025', target: 95000, achieved: 92000 },
    { id: 't6', agentId: '2', agentName: 'Sarah Johnson', month: 'January 2026', target: 100000, achieved: 98000 },
    { id: 't7', agentId: '2', agentName: 'Sarah Johnson', month: 'February 2026', target: 100000, achieved: 95000 },
    { id: 't8', agentId: '2', agentName: 'Sarah Johnson', month: 'March 2026', target: 105000, achieved: 0 },
];
