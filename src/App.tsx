/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import StudentManagement from './components/StudentManagement';
import FeeLedger from './components/FeeLedger';
import ExpenseTracker from './components/ExpenseTracker';
import StaffPayroll from './components/StaffPayroll';
import { Student, FeeRecord, Expense, Teacher } from './types';

const INITIAL_STUDENTS: Student[] = [
  { id: '1', name: 'Ahmed Khan', fatherName: 'Zubair Khan', contact: '0300-1234567', grade: 'Grade 9', monthlyFee: 4500, admissionDate: '2024-01-15', status: 'Active' },
  { id: '2', name: 'Sara Ali', fatherName: 'Ali Ahmed', contact: '0321-7654321', grade: 'Grade 5', monthlyFee: 3500, admissionDate: '2024-02-10', status: 'Active' },
  { id: '3', name: 'Bilal Sheikh', fatherName: 'Kamran Sheikh', contact: '0333-9876543', grade: 'Grade 10', monthlyFee: 5000, admissionDate: '2023-11-05', status: 'Active' },
  { id: '4', name: 'Zainab Fatima', fatherName: 'Muhammad Hussain', contact: '0345-1122334', grade: 'Nursery', monthlyFee: 2500, admissionDate: '2024-03-01', status: 'Active' },
  { id: '5', name: 'Omar Farooq', fatherName: 'Farooq Azam', contact: '0312-4455667', grade: 'Grade 8', monthlyFee: 4000, admissionDate: '2024-01-20', status: 'Inactive' },
];

const INITIAL_FEES: FeeRecord[] = [
  { id: 'f1', studentId: '1', month: '2024-04', amount: 4500, status: 'Paid', paidAt: '2024-04-02' },
  { id: 'f2', studentId: '2', month: '2024-04', amount: 3500, status: 'Pending' },
  { id: 'f3', studentId: '3', month: '2024-04', amount: 5000, status: 'Paid', paidAt: '2024-04-05' },
  { id: 'f4', studentId: '1', month: '2024-03', amount: 4500, status: 'Paid', paidAt: '2024-03-05' },
];

const INITIAL_EXPENSES: Expense[] = [
  { id: 'e1', category: 'Rent', amount: 80000, description: 'Academy Building Rent - April', date: '2024-04-01' },
  { id: 'e2', category: 'Electricity', amount: 12500, description: 'K-Electric Bill', date: '2024-04-05' },
  { id: 'e3', category: 'Marketing', amount: 5000, description: 'Flyer Printing', date: '2024-04-08' },
  { id: 'e4', category: 'Stationery', amount: 3200, description: 'Whiteboard Markers & Dusters', date: '2024-04-10' },
];

const INITIAL_TEACHERS: Teacher[] = [
  { id: 't1', name: 'M. Arsalan', subjectExpertise: ['Physics', 'Mathematics'], salaryRate: 35000, contact: '0300-1112223' },
  { id: 't2', name: 'Zainab Bibi', subjectExpertise: ['Biology', 'Chemistry'], salaryRate: 32000, contact: '0321-4445556' },
  { id: 't3', name: 'Sajid Ali', subjectExpertise: ['English', 'Urdu'], salaryRate: 28000, contact: '0333-7778889' },
];

const INITIAL_SALARIES = [
  { id: 's1', teacherId: 't1', month: '2024-04', amount: 35000, status: 'Paid', paidAt: '2024-04-01' },
  { id: 's2', teacherId: 't2', month: '2024-04', amount: 32000, status: 'Pending' },
  { id: 's3', teacherId: 't3', month: '2024-04', amount: 28000, status: 'Paid', paidAt: '2024-04-02' },
];

export default function App() {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  
  // Global State
  const [students, setStudents] = React.useState<Student[]>(INITIAL_STUDENTS);
  const [fees, setFees] = React.useState<FeeRecord[]>(INITIAL_FEES);
  const [expenses, setExpenses] = React.useState<Expense[]>(INITIAL_EXPENSES);
  const [teachers, setTeachers] = React.useState<Teacher[]>(INITIAL_TEACHERS);
  const [salaries, setSalaries] = React.useState(INITIAL_SALARIES);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard students={students} fees={fees} expenses={expenses} />;
      case 'students':
        return <StudentManagement students={students} setStudents={setStudents} setFees={setFees} />;
      case 'finance':
        return <FeeLedger fees={fees} setFees={setFees} students={students} />;
      case 'expenses':
        return <ExpenseTracker expenses={expenses} setExpenses={setExpenses} />;
      case 'staff':
        return (
          <StaffPayroll 
            teachers={teachers} 
            setTeachers={setTeachers} 
            salaries={salaries} 
            setSalaries={setSalaries} 
          />
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <h3 className="text-lg font-bold">Module Under Construction</h3>
            <p className="text-gray-500">We are building this module for Parwaaz e Shaheen Academy.</p>
          </div>
        );
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}
