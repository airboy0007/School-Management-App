/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Grade = 
  | 'Playgroup' | 'Nursery' | 'Prep' 
  | 'Grade 1' | 'Grade 2' | 'Grade 3' | 'Grade 4' | 'Grade 5' 
  | 'Grade 6' | 'Grade 7' | 'Grade 8' | 'Grade 9' | 'Grade 10';

export interface Student {
  id: string;
  name: string;
  fatherName: string;
  contact: string;
  grade: Grade;
  monthlyFee: number;
  admissionDate: string;
  status: 'Active' | 'Inactive';
}

export interface FeeRecord {
  id: string;
  studentId: string;
  month: string; // YYYY-MM
  amount: number;
  status: 'Paid' | 'Pending';
  paidAt?: string;
}

export interface Expense {
  id: string;
  category: 'Rent' | 'Electricity' | 'Marketing' | 'Stationery' | 'Salaries' | 'Other';
  amount: number;
  description: string;
  date: string;
}

export interface Teacher {
  id: string;
  name: string;
  subjectExpertise: string[];
  salaryRate: number;
  contact: string;
}

export interface DashboardStats {
  totalRevenue: number;
  pendingFees: number;
  currentExpenses: number;
  studentCount: number;
}
