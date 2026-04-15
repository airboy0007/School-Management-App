import React from 'react';
import { 
  Search, 
  Plus, 
  GraduationCap, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  Phone, 
  BookOpen, 
  Trash2, 
  Edit2,
  FileText,
  MessageSquare,
  X,
  AlertTriangle
} from 'lucide-react';
import { cn, formatPKR } from '../lib/utils';
import { Teacher } from '../types';

interface StaffPayrollProps {
  teachers: Teacher[];
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
  salaries: any[];
  setSalaries: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function StaffPayroll({ teachers, setTeachers, salaries, setSalaries }: StaffPayrollProps) {
  const [view, setView] = React.useState<'Directory' | 'Payroll'>('Directory');
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const [isTeacherModalOpen, setIsTeacherModalOpen] = React.useState(false);
  const [editingTeacher, setEditingTeacher] = React.useState<Teacher | null>(null);
  const [teacherToDelete, setTeacherToDelete] = React.useState<Teacher | null>(null);
  const [teacherFormData, setTeacherFormData] = React.useState({
    name: '',
    subjectExpertise: [] as string[],
    salaryRate: 0,
    contact: ''
  });

  const [isSalaryModalOpen, setIsSalaryModalOpen] = React.useState(false);
  const [editingSalary, setEditingSalary] = React.useState<any | null>(null);
  const [salaryToDelete, setSalaryToDelete] = React.useState<any | null>(null);
  const [salaryFormData, setSalaryFormData] = React.useState({
    amount: 0,
    status: 'Pending' as 'Paid' | 'Pending',
    month: new Date().toISOString().split('T')[0].substring(0, 7)
  });

  const generateMonthlyPayroll = () => {
    const currentMonth = new Date().toISOString().split('T')[0].substring(0, 7);
    const newSalaries = teachers
      .filter(t => !salaries.find(s => s.teacherId === t.id && s.month === currentMonth))
      .map(t => ({
        id: Math.random().toString(36).substr(2, 9),
        teacherId: t.id,
        month: currentMonth,
        amount: t.salaryRate,
        status: 'Pending' as const
      }));
    
    if (newSalaries.length > 0) {
      setSalaries(prev => [...prev, ...newSalaries]);
    }
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.subjectExpertise.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleSalaryStatus = (id: string) => {
    setSalaries(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          status: s.status === 'Paid' ? 'Pending' : 'Paid',
          paidAt: s.status === 'Pending' ? new Date().toISOString().split('T')[0] : undefined
        };
      }
      return s;
    }));
  };

  const handleDeleteTeacher = () => {
    if (teacherToDelete) {
      setTeachers(prev => prev.filter(t => t.id !== teacherToDelete.id));
      setTeacherToDelete(null);
    }
  };

  const openTeacherModal = (teacher?: Teacher) => {
    if (teacher) {
      setEditingTeacher(teacher);
      setTeacherFormData({
        name: teacher.name,
        subjectExpertise: teacher.subjectExpertise,
        salaryRate: teacher.salaryRate,
        contact: teacher.contact
      });
    } else {
      setEditingTeacher(null);
      setTeacherFormData({
        name: '',
        subjectExpertise: [],
        salaryRate: 0,
        contact: ''
      });
    }
    setIsTeacherModalOpen(true);
  };

  const handleSaveTeacher = () => {
    if (editingTeacher) {
      setTeachers(prev => prev.map(t => t.id === editingTeacher.id ? { ...t, ...teacherFormData } : t));
    } else {
      const newTeacher: Teacher = {
        id: Math.random().toString(36).substr(2, 9),
        ...teacherFormData
      };
      setTeachers(prev => [...prev, newTeacher]);
      
      // Automatically add to current month's payroll
      const currentMonth = new Date().toISOString().split('T')[0].substring(0, 7);
      setSalaries(prev => [
        ...prev,
        {
          id: Math.random().toString(36).substr(2, 9),
          teacherId: newTeacher.id,
          month: currentMonth,
          amount: newTeacher.salaryRate,
          status: 'Pending'
        }
      ]);
    }
    setIsTeacherModalOpen(false);
  };

  const openSalaryModal = (salary: any) => {
    setEditingSalary(salary);
    setSalaryFormData({
      amount: salary.amount,
      status: salary.status,
      month: salary.month
    });
    setIsSalaryModalOpen(true);
  };

  const handleSaveSalary = () => {
    if (editingSalary) {
      setSalaries(prev => prev.map(s => s.id === editingSalary.id ? { 
        ...s, 
        ...salaryFormData,
        paidAt: salaryFormData.status === 'Paid' ? (s.paidAt || new Date().toISOString().split('T')[0]) : undefined
      } : s));
    }
    setIsSalaryModalOpen(false);
  };

  const handleDeleteSalary = () => {
    if (salaryToDelete) {
      setSalaries(prev => prev.filter(s => s.id !== salaryToDelete.id));
      setSalaryToDelete(null);
    }
  };

  const handlePrintSalarySlip = (salary: any) => {
    const teacher = teachers.find(t => t.id === salary.teacherId);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Salary Slip - ${teacher?.name}</title>
            <style>
              body { font-family: sans-serif; padding: 40px; }
              .slip { border: 2px solid #000; padding: 20px; max-width: 500px; margin: auto; }
              .header { text-align: center; border-bottom: 1px solid #eee; margin-bottom: 20px; padding-bottom: 10px; }
              .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
              .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="slip">
              <div class="header">
                <h2>Parwaaz e Shaheen Academy</h2>
                <p>Teacher Salary Slip</p>
              </div>
              <div class="row"><strong>Teacher Name:</strong> <span>${teacher?.name}</span></div>
              <div class="row"><strong>Subjects:</strong> <span>${teacher?.subjectExpertise.join(', ')}</span></div>
              <div class="row"><strong>Month:</strong> <span>${salary.month}</span></div>
              <div class="row"><strong>Amount:</strong> <span>${formatPKR(salary.amount)}</span></div>
              <div class="row"><strong>Status:</strong> <span>${salary.status}</span></div>
              <div class="row"><strong>Payment Date:</strong> <span>${salary.paidAt || '-'}</span></div>
              <div class="footer">
                <p>This is a computer generated salary slip.</p>
              </div>
            </div>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleWhatsAppSalary = (salary: any) => {
    const teacher = teachers.find(t => t.id === salary.teacherId);
    const text = `*Salary Slip - Parwaaz e Shaheen Academy*\n\nTeacher: ${teacher?.name}\nMonth: ${salary.month}\nAmount: ${formatPKR(salary.amount)}\nStatus: ${salary.status}\n\n_Thank you for your dedication._`;
    window.open(`https://wa.me/${teacher?.contact.replace(/-/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Staff & Payroll</h2>
          <p className="text-gray-500">Manage teacher database and automated salary generation.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setView('Directory')}
            className={cn(
              "px-4 py-2 text-sm font-semibold rounded-lg transition-all",
              view === 'Directory' ? "bg-white text-[#151619] shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Directory
          </button>
          <button 
            onClick={() => setView('Payroll')}
            className={cn(
              "px-4 py-2 text-sm font-semibold rounded-lg transition-all",
              view === 'Payroll' ? "bg-white text-[#151619] shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Payroll
          </button>
        </div>
      </div>

      {view === 'Directory' ? (
        <>
          {/* Teacher Directory */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by name or subject..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#151619]/5 focus:border-[#151619] transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => openTeacherModal()}
              className="flex items-center justify-center gap-2 bg-[#151619] text-white px-6 py-2 rounded-xl font-semibold hover:bg-black transition-all shadow-sm"
            >
              <Plus size={18} />
              Add Teacher
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeachers.map((teacher) => (
              <div key={teacher.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#151619]/5 flex items-center justify-center text-[#151619]">
                    <GraduationCap size={24} />
                  </div>
                  <div className="flex gap-1 transition-opacity">
                    <button 
                      onClick={() => openTeacherModal(teacher)}
                      className="p-1.5 text-gray-400 hover:text-[#151619] hover:bg-gray-100 rounded-lg transition-all" 
                      title="Edit Teacher"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => setTeacherToDelete(teacher)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                      title="Delete Teacher"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-lg">{teacher.name}</h3>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BookOpen size={16} className="text-gray-400" />
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjectExpertise.map(sub => (
                        <span key={sub} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{sub}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={16} className="text-gray-400" />
                    <span className="font-mono">{teacher.contact}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign size={16} className="text-gray-400" />
                    <span className="font-bold text-[#151619]">{formatPKR(teacher.salaryRate)} / month</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Payroll View */}
          <div className="bg-[#151619] text-white p-8 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex-1">
              <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                Total Payroll ({new Date().toLocaleDateString('en-PK', { month: 'long', year: 'numeric' })})
              </p>
              <h4 className="text-4xl font-bold mt-2 font-mono">{formatPKR(salaries.reduce((acc, curr) => acc + curr.amount, 0))}</h4>
              <button 
                onClick={generateMonthlyPayroll}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-all border border-white/10"
              >
                <Plus size={14} />
                Generate Current Month Payroll
              </button>
            </div>
            <div className="flex gap-4">
              <div className="text-center px-6 py-3 bg-white/5 rounded-xl border border-white/10">
                <p className="text-xs text-gray-400 uppercase font-bold">Paid</p>
                <p className="text-xl font-bold font-mono text-green-400">
                  {formatPKR(salaries.filter(s => s.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0))}
                </p>
              </div>
              <div className="text-center px-6 py-3 bg-white/5 rounded-xl border border-white/10">
                <p className="text-xs text-gray-400 uppercase font-bold">Pending</p>
                <p className="text-xl font-bold font-mono text-amber-400">
                  {formatPKR(salaries.filter(s => s.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-bottom border-gray-100">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Teacher</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Month</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Amount</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Paid At</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {salaries.map((salary) => {
                    const teacher = teachers.find(t => t.id === salary.teacherId);
                    return (
                      <tr key={salary.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <p className="font-bold text-sm">{teacher?.name}</p>
                          <p className="text-xs text-gray-500">{teacher?.subjectExpertise.join(', ')}</p>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-600">
                          {new Date(salary.month + '-01').toLocaleDateString('en-PK', { month: 'long', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 font-mono text-sm font-bold">
                          {formatPKR(salary.amount)}
                        </td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => toggleSalaryStatus(salary.id)}
                            className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all",
                              salary.status === 'Paid' ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                            )}
                          >
                            {salary.status === 'Paid' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                            {salary.status}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {salary.paidAt ? new Date(salary.paidAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' }) : '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => openSalaryModal(salary)}
                              className="p-1.5 text-gray-400 hover:text-[#151619] hover:bg-gray-100 rounded-lg transition-all" 
                              title="Edit Salary"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handlePrintSalarySlip(salary)}
                              className="p-1.5 text-gray-400 hover:text-[#151619] hover:bg-gray-100 rounded-lg transition-all" 
                              title="Salary Slip"
                            >
                              <FileText size={16} />
                            </button>
                            <button 
                              onClick={() => handleWhatsAppSalary(salary)}
                              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" 
                              title="Send WhatsApp"
                            >
                              <MessageSquare size={16} />
                            </button>
                            <button 
                              onClick={() => setSalaryToDelete(salary)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                              title="Delete Record"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      {/* Teacher Modal */}
      {isTeacherModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-lg">{editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}</h3>
              <button onClick={() => setIsTeacherModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#151619]/5 focus:border-[#151619]" 
                  value={teacherFormData.name}
                  onChange={(e) => setTeacherFormData({...teacherFormData, name: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Contact</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#151619]/5 focus:border-[#151619]" 
                  value={teacherFormData.contact}
                  onChange={(e) => setTeacherFormData({...teacherFormData, contact: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Salary Rate (PKR)</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#151619]/5 focus:border-[#151619]" 
                  value={teacherFormData.salaryRate}
                  onChange={(e) => setTeacherFormData({...teacherFormData, salaryRate: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Expertise (Comma separated)</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#151619]/5 focus:border-[#151619]" 
                  value={teacherFormData.subjectExpertise.join(', ')}
                  onChange={(e) => setTeacherFormData({...teacherFormData, subjectExpertise: e.target.value.split(',').map(s => s.trim())})}
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => setIsTeacherModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveTeacher}
                className="px-6 py-2 text-sm font-semibold bg-[#151619] text-white rounded-xl hover:bg-black transition-all shadow-sm"
              >
                Save Teacher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Salary Modal */}
      {isSalaryModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-lg">Edit Salary Record</h3>
              <button onClick={() => setIsSalaryModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Amount (PKR)</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#151619]/5 focus:border-[#151619]" 
                  value={salaryFormData.amount}
                  onChange={(e) => setSalaryFormData({...salaryFormData, amount: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                <select 
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#151619]/5 focus:border-[#151619]"
                  value={salaryFormData.status}
                  onChange={(e) => setSalaryFormData({...salaryFormData, status: e.target.value as 'Paid' | 'Pending'})}
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Month</label>
                <input 
                  type="month" 
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#151619]/5 focus:border-[#151619]" 
                  value={salaryFormData.month}
                  onChange={(e) => setSalaryFormData({...salaryFormData, month: e.target.value})}
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => setIsSalaryModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveSalary}
                className="px-6 py-2 text-sm font-semibold bg-[#151619] text-white rounded-xl hover:bg-black transition-all shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Teacher Confirmation Modal */}
      {teacherToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Remove Teacher?</h3>
              <p className="text-gray-500 mt-2">
                Are you sure you want to remove <span className="font-bold text-gray-900">{teacherToDelete.name}</span> from the directory? 
                This will not delete their historical payroll records but they will no longer appear in the directory.
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => setTeacherToDelete(null)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteTeacher}
                className="flex-1 px-4 py-2.5 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-sm"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Salary Confirmation Modal */}
      {salaryToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Delete Salary Record?</h3>
              <p className="text-gray-500 mt-2">
                Are you sure you want to delete the salary record for <span className="font-bold text-gray-900">{teachers.find(t => t.id === salaryToDelete.teacherId)?.name}</span> for <span className="font-bold text-gray-900">{salaryToDelete.month}</span>?
                This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => setSalaryToDelete(null)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteSalary}
                className="flex-1 px-4 py-2.5 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
