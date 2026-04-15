import React from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  Clock, 
  MoreVertical,
  ArrowUpRight,
  FileText,
  MessageSquare,
  Edit2,
  X,
  Trash2,
  AlertTriangle,
  Plus
} from 'lucide-react';
import { cn, formatPKR } from '../lib/utils';
import { FeeRecord, Student } from '../types';

interface FeeLedgerProps {
  fees: FeeRecord[];
  setFees: React.Dispatch<React.SetStateAction<FeeRecord[]>>;
  students: Student[];
}

export default function FeeLedger({ fees, setFees, students }: FeeLedgerProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'All' | 'Paid' | 'Pending'>('All');
  const [editingFee, setEditingFee] = React.useState<FeeRecord | null>(null);
  const [feeToDelete, setFeeToDelete] = React.useState<FeeRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  const [editFormData, setEditFormData] = React.useState({
    amount: 0,
    status: 'Pending' as 'Paid' | 'Pending',
    month: ''
  });

  const getStudentName = (id: string) => students.find(s => s.id === id)?.name || 'Unknown';
  const getStudentGrade = (id: string) => students.find(s => s.id === id)?.grade || 'N/A';

  const filteredFees = fees.filter(fee => {
    const studentName = getStudentName(fee.studentId).toLowerCase();
    const matchesSearch = studentName.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || fee.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDownload = () => {
    const headers = ['Student', 'Grade', 'Month', 'Amount', 'Status', 'Paid Date'];
    const csvContent = [
      headers.join(','),
      ...filteredFees.map(f => [
        `"${getStudentName(f.studentId)}"`,
        getStudentGrade(f.studentId),
        f.month,
        f.amount,
        f.status,
        f.paidAt || '-'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `fee_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openEditModal = (fee: FeeRecord) => {
    setEditingFee(fee);
    setEditFormData({
      amount: fee.amount,
      status: fee.status,
      month: fee.month
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingFee) {
      setFees(prev => prev.map(f => f.id === editingFee.id ? { 
        ...f, 
        ...editFormData,
        paidAt: editFormData.status === 'Paid' ? (f.paidAt || new Date().toISOString().split('T')[0]) : undefined
      } : f));
    }
    setIsEditModalOpen(false);
    setEditingFee(null);
  };

  const handleDelete = () => {
    if (feeToDelete) {
      setFees(prev => prev.filter(f => f.id !== feeToDelete.id));
      setFeeToDelete(null);
    }
  };

  const handlePrintReceipt = (fee: FeeRecord) => {
    const student = students.find(s => s.id === fee.studentId);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Fee Receipt - ${student?.name}</title>
            <style>
              body { font-family: sans-serif; padding: 40px; }
              .receipt { border: 2px solid #000; padding: 20px; max-width: 500px; margin: auto; }
              .header { text-align: center; border-bottom: 1px solid #eee; margin-bottom: 20px; padding-bottom: 10px; }
              .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
              .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="receipt">
              <div class="header">
                <h2>Parwaaz e Shaheen Academy</h2>
                <p>Official Fee Receipt</p>
              </div>
              <div class="row"><strong>Student Name:</strong> <span>${student?.name}</span></div>
              <div class="row"><strong>Father's Name:</strong> <span>${student?.fatherName}</span></div>
              <div class="row"><strong>Grade:</strong> <span>${student?.grade}</span></div>
              <div class="row"><strong>Month:</strong> <span>${fee.month}</span></div>
              <div class="row"><strong>Amount:</strong> <span>${formatPKR(fee.amount)}</span></div>
              <div class="row"><strong>Status:</strong> <span>${fee.status}</span></div>
              <div class="row"><strong>Date:</strong> <span>${new Date().toLocaleDateString()}</span></div>
              <div class="footer">
                <p>This is a computer generated receipt.</p>
              </div>
            </div>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const toggleStatus = (id: string) => {
    setFees(prev => prev.map(f => {
      if (f.id === id) {
        return {
          ...f,
          status: f.status === 'Paid' ? 'Pending' : 'Paid',
          paidAt: f.status === 'Pending' ? new Date().toISOString().split('T')[0] : undefined
        };
      }
      return f;
    }));
  };

  const generateMonthlyFees = () => {
    const currentMonth = new Date().toISOString().split('T')[0].substring(0, 7);
    const newFees = students
      .filter(s => s.status === 'Active')
      .filter(s => !fees.find(f => f.studentId === s.id && f.month === currentMonth))
      .map(s => ({
        id: 'f' + Math.random().toString(36).substr(2, 9),
        studentId: s.id,
        month: currentMonth,
        amount: s.monthlyFee,
        status: 'Pending' as const
      }));
    
    if (newFees.length > 0) {
      setFees(prev => [...prev, ...newFees]);
    }
  };

  const generateWhatsAppText = (fee: FeeRecord) => {
    const student = students.find(s => s.id === fee.studentId);
    const text = `*Fee Receipt - Parwaaz e Shaheen Academy*\n\nStudent: ${student?.name}\nFather: ${student?.fatherName}\nGrade: ${student?.grade}\nMonth: ${fee.month}\nAmount: ${formatPKR(fee.amount)}\nStatus: ${fee.status}\n\n_Thank you for your support._`;
    window.open(`https://wa.me/${student?.contact.replace(/-/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Financial & Fee Engine</h2>
        <p className="text-gray-500">Digital ledger for tracking student fee collections.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Collected this Month</p>
          <h4 className="text-2xl font-bold mt-1 font-mono text-green-600">
            {formatPKR(fees.filter(f => f.status === 'Paid' && f.month === '2024-04').reduce((acc, curr) => acc + curr.amount, 0))}
          </h4>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Pending Collections</p>
          <h4 className="text-2xl font-bold mt-1 font-mono text-red-600">
            {formatPKR(fees.filter(f => f.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0))}
          </h4>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Total Expected</p>
          <h4 className="text-2xl font-bold mt-1 font-mono text-[#151619]">
            {formatPKR(fees.filter(f => f.month === '2024-04').reduce((acc, curr) => acc + curr.amount, 0))}
          </h4>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search student name..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#151619]/5 focus:border-[#151619] transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={generateMonthlyFees}
            className="flex items-center gap-2 px-4 py-2 bg-[#151619] text-white text-sm font-bold rounded-xl hover:bg-black transition-all shadow-sm"
          >
            <Plus size={18} />
            Generate Current Month Fees
          </button>
          <select 
            className="px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#151619]/5 focus:border-[#151619] transition-all text-sm font-medium"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="All">All Status</option>
            <option value="Paid">Paid Only</option>
            <option value="Pending">Pending Only</option>
          </select>
          <button 
            onClick={handleDownload}
            className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors"
            title="Download CSV"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-bottom border-gray-100">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Student</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Month</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Amount</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Paid Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Receipts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredFees.map((fee) => (
                <tr key={fee.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-sm">{getStudentName(fee.studentId)}</p>
                      <p className="text-xs text-gray-500">{getStudentGrade(fee.studentId)}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-600">
                    {new Date(fee.month + '-01').toLocaleDateString('en-PK', { month: 'long', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 font-mono text-sm font-bold">
                    {formatPKR(fee.amount)}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleStatus(fee.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all",
                        fee.status === 'Paid' 
                          ? "bg-green-50 text-green-700 hover:bg-green-100" 
                          : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                      )}
                    >
                      {fee.status === 'Paid' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                      {fee.status}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {fee.paidAt ? new Date(fee.paidAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' }) : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openEditModal(fee)}
                        className="p-2 text-gray-400 hover:text-[#151619] hover:bg-gray-100 rounded-lg transition-all"
                        title="Edit Record"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handlePrintReceipt(fee)}
                        className="p-2 text-gray-400 hover:text-[#151619] hover:bg-gray-100 rounded-lg transition-all"
                        title="Print Receipt"
                      >
                        <FileText size={18} />
                      </button>
                      <button 
                        onClick={() => generateWhatsAppText(fee)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                        title="Send WhatsApp"
                      >
                        <MessageSquare size={18} />
                      </button>
                      <button 
                        onClick={() => setFeeToDelete(fee)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Record"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Edit Fee Modal */}
      {isEditModalOpen && editingFee && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-lg">Edit Fee Record</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-bold text-gray-900">{getStudentName(editingFee.studentId)}</p>
                <p className="text-xs text-gray-500">{getStudentGrade(editingFee.studentId)}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Amount (PKR)</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#151619]/5 focus:border-[#151619]" 
                  value={editFormData.amount}
                  onChange={(e) => setEditFormData({...editFormData, amount: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                <select 
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#151619]/5 focus:border-[#151619]"
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({...editFormData, status: e.target.value as 'Paid' | 'Pending'})}
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
                  value={editFormData.month}
                  onChange={(e) => setEditFormData({...editFormData, month: e.target.value})}
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                className="px-6 py-2 text-sm font-semibold bg-[#151619] text-white rounded-xl hover:bg-black transition-all shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {feeToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Delete Fee Record?</h3>
              <p className="text-gray-500 mt-2">
                Are you sure you want to delete the fee record for <span className="font-bold text-gray-900">{getStudentName(feeToDelete.studentId)}</span> for <span className="font-bold text-gray-900">{feeToDelete.month}</span>?
                This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => setFeeToDelete(null)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
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
