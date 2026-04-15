import React from 'react';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Filter,
  Download,
  Trash2,
  Edit2,
  UserPlus,
  X,
  AlertTriangle
} from 'lucide-react';
import { cn, formatPKR } from '../lib/utils';
import { Student, Grade, FeeRecord } from '../types';

const grades: Grade[] = [
  'Playgroup', 'Nursery', 'Prep', 
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'
];

interface StudentManagementProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  setFees: React.Dispatch<React.SetStateAction<FeeRecord[]>>;
}

export default function StudentManagement({ students, setStudents, setFees }: StudentManagementProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedGrade, setSelectedGrade] = React.useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingStudent, setEditingStudent] = React.useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = React.useState<Student | null>(null);

  const [formData, setFormData] = React.useState({
    name: '',
    fatherName: '',
    contact: '',
    grade: 'Grade 1' as Grade,
    monthlyFee: 0,
    admissionDate: new Date().toISOString().split('T')[0],
    status: 'Active' as const
  });

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         student.fatherName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade === 'All' || student.grade === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  const handleDownload = () => {
    const headers = ['ID', 'Name', 'Father Name', 'Contact', 'Grade', 'Monthly Fee', 'Admission Date', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredStudents.map(s => [
        s.id,
        `"${s.name}"`,
        `"${s.fatherName}"`,
        s.contact,
        s.grade,
        s.monthlyFee,
        s.admissionDate,
        s.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `students_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = () => {
    if (editingStudent) {
      setStudents(prev => prev.map(s => s.id === editingStudent.id ? { ...s, ...formData } : s));
    } else {
      const newStudent: Student = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData
      };
      setStudents(prev => [...prev, newStudent]);

      // Automatically create a pending fee record for the current month
      const currentMonth = new Date().toISOString().split('T')[0].substring(0, 7);
      setFees(prev => [
        ...prev,
        {
          id: 'f' + Math.random().toString(36).substr(2, 9),
          studentId: newStudent.id,
          month: currentMonth,
          amount: newStudent.monthlyFee,
          status: 'Pending'
        }
      ]);
    }
    closeModal();
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      fatherName: student.fatherName,
      contact: student.contact,
      grade: student.grade as Grade,
      monthlyFee: student.monthlyFee,
      admissionDate: student.admissionDate,
      status: student.status
    });
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingStudent(null);
    setFormData({
      name: '',
      fatherName: '',
      contact: '',
      grade: 'Grade 1' as Grade,
      monthlyFee: 0,
      admissionDate: new Date().toISOString().split('T')[0],
      status: 'Active'
    });
  };

  const handleDelete = () => {
    if (studentToDelete) {
      setStudents(prev => prev.filter(s => s.id !== studentToDelete.id));
      setStudentToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Student Management</h2>
          <p className="text-gray-500">Manage enrollments from Playgroup to Grade 10.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-[#151619] text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-black transition-all shadow-sm"
        >
          <UserPlus size={18} />
          Add New Student
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or father's name..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#151619]/5 focus:border-[#151619] transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select 
              className="pl-9 pr-8 py-2 border border-gray-200 rounded-xl appearance-none bg-white focus:ring-2 focus:ring-[#151619]/5 focus:border-[#151619] transition-all text-sm font-medium"
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
            >
              <option value="All">All Grades</option>
              {grades.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <button 
            onClick={handleDownload}
            className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors"
            title="Download CSV"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-bottom border-gray-100">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Student Details</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Grade</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Monthly Fee</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Admission Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#151619]/5 flex items-center justify-center text-[#151619] font-bold text-sm">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{student.name}</p>
                        <p className="text-xs text-gray-500">F: {student.fatherName}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{student.contact}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {student.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm font-bold">
                    {formatPKR(student.monthlyFee)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(student.admissionDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      student.status === 'Active' ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
                    )}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 transition-opacity">
                      <button 
                        onClick={() => openEditModal(student)}
                        className="p-1.5 text-gray-400 hover:text-[#151619] hover:bg-gray-100 rounded-lg transition-all" 
                        title="Edit Student"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => setStudentToDelete(student)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Student"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredStudents.length === 0 && (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <Search size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No students found</h3>
            <p className="text-gray-500">Try adjusting your search or filters.</p>
          </div>
        )}

        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500">Showing {filteredStudents.length} of {students.length} students</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs font-medium border border-gray-200 rounded-lg bg-white disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 text-xs font-medium border border-gray-200 rounded-lg bg-white disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>

      {/* Add/Edit Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-lg">{editingStudent ? 'Edit Student Details' : 'Register New Student'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Student Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#151619]/5 focus:border-[#151619]" 
                    placeholder="Full Name" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Father's Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#151619]/5 focus:border-[#151619]" 
                    placeholder="Father's Name" 
                    value={formData.fatherName}
                    onChange={(e) => setFormData({...formData, fatherName: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Contact Number</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#151619]/5 focus:border-[#151619]" 
                    placeholder="03xx-xxxxxxx" 
                    value={formData.contact}
                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Grade</label>
                  <select 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#151619]/5 focus:border-[#151619]"
                    value={formData.grade}
                    onChange={(e) => setFormData({...formData, grade: e.target.value as Grade})}
                  >
                    {grades.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Monthly Fee (PKR)</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#151619]/5 focus:border-[#151619]" 
                    placeholder="4500" 
                    value={formData.monthlyFee}
                    onChange={(e) => setFormData({...formData, monthlyFee: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Admission Date</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#151619]/5 focus:border-[#151619]" 
                    value={formData.admissionDate}
                    onChange={(e) => setFormData({...formData, admissionDate: e.target.value})}
                  />
                </div>
              </div>
              {editingStudent && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                  <select 
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#151619]/5 focus:border-[#151619]"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as 'Active' | 'Inactive'})}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={closeModal}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-6 py-2 text-sm font-semibold bg-[#151619] text-white rounded-xl hover:bg-black transition-all shadow-sm"
              >
                {editingStudent ? 'Save Changes' : 'Register Student'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Delete Student?</h3>
              <p className="text-gray-500 mt-2">
                Are you sure you want to delete <span className="font-bold text-gray-900">{studentToDelete.name}</span>? 
                This action cannot be undone and will remove all associated records.
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => setStudentToDelete(null)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                No, Keep Record
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-sm"
              >
                Yes, Delete Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
