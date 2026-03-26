export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignedTo: number;
  department: string;
  dueDate: string;
  details?: Record<string, any>;
}

export interface Department {
  id: number;
  name: string;
  userCount: string;
  color: string;
  icon: string;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  department: string;
  email: string;
  photo?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'sales' | 'sales_manager' | 'finance' | 'cst' | 'cst_manager' | 'qa';
  department: string;
  clockedIn: boolean;
  clockInTime?: string;
  clockOutTime?: string;
  tardies?: number;
}

export interface AttendanceRecord {
  id: number;
  userId: number;
  date: string;
  clockIn: string;
  clockOut?: string;
  hoursWorked?: number;
  isTardy?: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'meeting' | 'training' | 'deadline' | 'other';
}

export interface SalesClient {
  id: number;
  companyName: string;
  customerName: string;
  paymentAmount: number;
  productSold: string[];
  email: string;
  serviceArea: string;
  contactNo1: string;
  contactNo2?: string;
  gbpLink?: string;
  websiteLink?: string;
  yelpLink?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  clientConcerns?: string;
  tipsForTech?: string;
  notes?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submittedBy: string;
  submittedDate?: string;
}

export interface SalesAgent {
  id: number;
  name: string;
  behaviorRating: number;
  floorTrainingStatus: 'completed' | 'in-progress' | 'pending';
  techCoordinationRating: number;
  numberOfCalls: number;
  recordingPerformanceRating: number;
  overallScore: number;
}

export interface CallRecording {
  id: number;
  agentName: string;
  clientName: string;
  date: string;
  duration: string;
  status: 'available' | 'processing' | 'failed';
  qualityRating?: number;
  tags?: string[];
}

export interface Employee {
  id: number;
  name: string;
  employeeId: string;
  email: string;
  department: string;
  role: string;
  isActive: boolean;
  baseSalary: number;
  advancePayments: number;
  accruedPayments: number;
  totalSalary: number;
  paymentStatus: 'paid' | 'pending' | 'partial';
  hireDate?: string;
  tardies?: number;
}

export interface TechClient {
  id: number;
  name: string;
  status: 'active' | 'onboarding' | 'on-hold' | 'completed';
  lastUpdated: string;
  credentials?: {
    username?: string;
    password?: string;
    apiKeys?: string[];
  };
  dashboardScreenshot?: string;
  screenshotDate?: string;
  keywordRankings?: Array<{
    keyword: string;
    position: number;
    change: number;
  }>;
  lacks?: string[];
  strategyExplanation?: string;
  clientPicture?: string;
  links?: {
    googleDrive?: string;
    website?: string;
    gbp?: string;
  };
}

export interface CSTClient {
  id: number;
  name: string;
  type: 'active' | 'onboarding' | 'red-flag' | 'yellow-flag' | 'black-flag';
  healthScore?: number;
  lastInteraction?: string;
  nextCheckIn?: string;
  assignedAgent: string;
  onboardingProgress?: number;
  issues?: string[];
  churnReason?: string;
  churnDate?: string;
  lifespan?: number; // in months
  mistakeType?: 'cst' | 'sales' | 'none';
}

export interface DailyTask {
  id: number;
  title: string;
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in-progress' | 'done';
  dueTime?: string;
  assignedTo: number;
}

export interface ScheduledCall {
  id: number;
  clientName: string;
  purpose: string;
  time: string;
  duration: string;
  status: 'scheduled' | 'completed' | 'missed';
}

export interface ScheduledEmail {
  id: number;
  clientName: string;
  subject: string;
  scheduledTime: string;
  status: 'draft' | 'sent';
  template?: string;
}

export interface Meeting {
  id: number;
  title: string;
  attendees: string[];
  time: string;
  location: string;
  agenda?: string[];
  notes?: string;
}

export interface ManagerTaskMetrics {
  id: number;
  managerName: string;
  department: string;
  totalTasks: number;
  completedTasks: number;
  missedTasks: number;
  month: string;
}

export interface QAEvaluation {
  id: number;
  clientName: string;
  agentName: string;
  evaluationType: 'cst-client' | 'agent' | 'call';
  rating: number;
  notes?: string;
  date: string;
}

export interface SalesCallNote {
  id: number;
  callId: number;
  agentName: string;
  clientName: string;
  notes: string;
  date: string;
  forCSTTeam: boolean;
}