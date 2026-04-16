/**
 * Parwaaz e Shaheen Academy Management System
 * Plain JavaScript Implementation
 */
console.log('PSA Management System v1.8 Loaded');

// --- Navigation ---
function switchTab(tabId) {
    state.activeTab = tabId;
    
    // Update nav UI
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const navEl = document.getElementById(`nav-${tabId}`);
    if (navEl) navEl.classList.add('active');
    
    // Close sidebar on mobile with proper logic
    if (window.innerWidth < 768) {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if (!sidebar.classList.contains('-translate-x-full')) {
            toggleSidebar();
        }
    }
    
    render();
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    const icon = document.getElementById('collapse-icon');
    const overlay = document.getElementById('sidebar-overlay');
    
    // Desktop behavior
    if (window.innerWidth >= 768) {
        sidebar.classList.toggle('sidebar-collapsed');
        mainContent.classList.toggle('main-content-expanded');
        
        if (sidebar.classList.contains('sidebar-collapsed')) {
            icon.setAttribute('data-lucide', 'chevron-right');
        } else {
            icon.setAttribute('data-lucide', 'chevron-left');
        }
    } else {
        // Mobile behavior - Force state
        const isCurrentlyHidden = sidebar.classList.contains('-translate-x-full');
        
        if (isCurrentlyHidden) {
            // Open
            sidebar.classList.remove('-translate-x-full');
            if (overlay) {
                overlay.classList.remove('hidden');
                // Trigger reflow
                overlay.offsetHeight;
                overlay.classList.remove('opacity-0');
            }
        } else {
            // Close
            sidebar.classList.add('-translate-x-full');
            if (overlay) {
                overlay.classList.add('opacity-0');
                setTimeout(() => overlay.classList.add('hidden'), 300);
            }
        }
    }
    
    lucide.createIcons();
}

function closeModal() {
    const modal = document.getElementById('modal-container');
    if (modal) modal.classList.add('hidden');
}

// --- State Management ---
let state = {
    activeTab: 'dashboard',
    students: JSON.parse(localStorage.getItem('psa_students')) || [
        { id: '1', name: 'Ahmed Khan', fatherName: 'Zubair Khan', contact: '0300-1234567', grade: 'Grade 9', monthlyFee: 4500, admissionDate: '2024-01-15', status: 'Active' },
        { id: '2', name: 'Sara Ali', fatherName: 'Ali Ahmed', contact: '0321-7654321', grade: 'Grade 5', monthlyFee: 3500, admissionDate: '2024-02-10', status: 'Active' },
        { id: '3', name: 'Bilal Sheikh', fatherName: 'Kamran Sheikh', contact: '0333-9876543', grade: 'Grade 10', monthlyFee: 5000, admissionDate: '2023-11-05', status: 'Active' }
    ],
    fees: JSON.parse(localStorage.getItem('psa_fees')) || [
        { id: 'f1', studentId: '1', month: '2024-04', amount: 4500, status: 'Paid', paidAt: '2024-04-02' },
        { id: 'f2', studentId: '2', month: '2024-04', amount: 3500, status: 'Pending' }
    ],
    expenses: JSON.parse(localStorage.getItem('psa_expenses')) || [
        { id: 'e1', category: 'Rent', amount: 80000, description: 'Academy Building Rent - April', date: '2024-04-01' }
    ],
    teachers: JSON.parse(localStorage.getItem('psa_teachers')) || [
        { id: 't1', name: 'M. Arsalan', subjectExpertise: ['Physics', 'Mathematics'], salaryRate: 35000, contact: '0300-1112223' }
    ],
    salaries: JSON.parse(localStorage.getItem('psa_salaries')) || [
        { id: 's1', teacherId: 't1', month: '2024-04', amount: 35000, status: 'Paid', paidAt: '2024-04-01' }
    ],
    filters: {
        students: { grade: 'All', status: 'All' },
        finance: { month: 'All', status: 'All' }
    },
    staffTab: 'staff'
};

function saveState() {
    localStorage.setItem('psa_students', JSON.stringify(state.students));
    localStorage.setItem('psa_fees', JSON.stringify(state.fees));
    localStorage.setItem('psa_expenses', JSON.stringify(state.expenses));
    localStorage.setItem('psa_teachers', JSON.stringify(state.teachers));
    localStorage.setItem('psa_salaries', JSON.stringify(state.salaries));
}

// --- Utilities ---
function formatPKR(amount) {
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        minimumFractionDigits: 0
    }).format(amount);
}

function showNotification(text) {
    const el = document.getElementById('notification');
    document.getElementById('notification-text').innerText = text;
    el.classList.remove('translate-y-24');
    setTimeout(() => el.classList.add('translate-y-24'), 3000);
}

function handleLogout() {
    openConfirmModal('Logout', 'Are you sure you want to end your session?', () => {
        showNotification('Logging out...');
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    });
}

// --- Rendering ---
function render() {
    const container = document.getElementById('view-container');
    if (!container) {
        console.error('View container not found!');
        return;
    }
    container.innerHTML = '';
    
    console.log('Rendering tab:', state.activeTab);
    try {
        switch (state.activeTab) {
            case 'dashboard': renderDashboard(container); break;
            case 'students': renderStudents(container); break;
            case 'finance': renderFinance(container); break;
            case 'expenses': renderExpenses(container); break;
            case 'staff': renderStaff(container); break;
            case 'backup': 
                console.log('Executing backup case');
                renderBackup(container); 
                break;
            default:
                console.warn('Unknown tab:', state.activeTab);
                container.innerHTML = `<div class="p-8 text-center text-gray-500">View not found: ${state.activeTab}</div>`;
        }
    } catch (err) {
        console.error('Render error:', err);
        container.innerHTML = `<div class="p-8 text-red-500">Error loading view: ${err.message}</div>`;
    }
    
    try {
        lucide.createIcons();
    } catch (e) {
        console.warn('Lucide icons could not be initialized:', e);
    }
}

// --- Dashboard View ---
function renderDashboard(container) {
    const totalRevenue = state.fees.filter(f => f.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0);
    const pendingFees = state.fees.filter(f => f.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpenses = state.expenses.reduce((acc, curr) => acc + curr.amount, 0);
    
    container.innerHTML = `
        <div class="animate-in">
            <div class="mb-8">
                <h2 class="text-2xl md:text-3xl font-bold tracking-tight">Admin Dashboard</h2>
                <p class="text-gray-500 text-sm md:text-base">Welcome back! Here's what's happening at Parwaaz e Shaheen Academy.</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                ${renderStatCard('Total Revenue', formatPKR(totalRevenue), 'dollar-sign', 'bg-cyan-500/10 text-cyan-600', false)}
                ${renderStatCard('Pending Fees', formatPKR(pendingFees), 'clock', 'bg-amber-500/10 text-amber-600', false)}
                ${renderStatCard('Expenses', formatPKR(totalExpenses), 'receipt', 'bg-red-500/10 text-red-600', false)}
                ${renderStatCard('Students', state.students.length, 'users', 'bg-[#ffd700]/10 text-[#001f3f]', true)}
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div class="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
                        <h3 class="font-bold text-lg text-[#001f3f]">Recent Fee Collections</h3>
                        <span class="text-[10px] font-bold text-cyan-600 uppercase tracking-widest">Live Updates</span>
                    </div>
                    <div class="space-y-4">
                        ${state.fees.slice(0, 5).map(f => `
                            <div class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                        <i data-lucide="user" class="w-5 h-5 text-gray-400"></i>
                                    </div>
                                    <div>
                                        <p class="font-bold text-sm">${(state.students.find(s => s.id === f.studentId) || {}).name || 'Unknown'}</p>
                                        <p class="text-xs text-gray-500">${f.month}</p>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <p class="font-bold text-sm text-[#001f3f]">${formatPKR(f.amount)}</p>
                                    <p class="text-[10px] font-bold uppercase ${f.status === 'Paid' ? 'text-green-500' : 'text-amber-500'}">${f.status}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 class="font-bold text-lg mb-4">Quick Actions</h3>
                    <div class="grid grid-cols-2 gap-4">
                        <button onclick="switchTab('students')" class="p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all text-left">
                            <i data-lucide="user-plus" class="w-6 h-6 mb-2 text-cyan-600"></i>
                            <p class="font-bold text-sm">Add Student</p>
                            <p class="text-xs text-gray-500">New enrollment</p>
                        </button>
                        <button onclick="switchTab('finance')" class="p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all text-left">
                            <i data-lucide="wallet" class="w-6 h-6 mb-2 text-green-600"></i>
                            <p class="font-bold text-sm">Collect Fee</p>
                            <p class="text-xs text-gray-500">Process payment</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderStatCard(label, value, icon, iconClass, isGold) {
    return `
        <div class="stat-card bg-white p-6 rounded-2xl border border-gray-100 shadow-sm ${isGold ? 'gold-trim' : ''}">
            <div class="flex items-center justify-between mb-4">
                <div class="p-2 ${iconClass} rounded-xl">
                    <i data-lucide="${icon}" class="w-6 h-6"></i>
                </div>
            </div>
            <p class="text-sm font-medium text-gray-500 uppercase tracking-wider">${label}</p>
            <h3 class="text-2xl font-bold mt-1">${value}</h3>
        </div>
    `;
}

// --- Student Management View ---
function renderStudents(container) {
    const grades = ['All', 'Play Group', 'KG1', 'KG2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];
    
    const filteredStudents = state.students.filter(s => {
        const gradeMatch = state.filters.students.grade === 'All' || s.grade === state.filters.students.grade;
        const statusMatch = state.filters.students.status === 'All' || s.status === state.filters.students.status;
        return gradeMatch && statusMatch;
    });

    container.innerHTML = `
        <div class="animate-in">
            <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
                <div>
                    <h2 class="text-2xl font-bold tracking-tight">Student Management</h2>
                    <p class="text-gray-500 text-sm">Manage enrollments and student records.</p>
                </div>
                <div class="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div class="flex-1 lg:flex-none flex items-center gap-2 bg-white px-3 py-1.5 border border-gray-200 rounded-xl shadow-sm">
                        <span class="text-xs font-bold text-gray-400 uppercase">Grade:</span>
                        <select onchange="state.filters.students.grade = this.value; render()" class="text-sm font-semibold focus:outline-none bg-transparent w-full">
                            ${grades.map(g => `<option value="${g}" ${state.filters.students.grade === g ? 'selected' : ''}>${g}</option>`).join('')}
                        </select>
                    </div>
                    <div class="flex-1 lg:flex-none flex items-center gap-2 bg-white px-3 py-1.5 border border-gray-200 rounded-xl shadow-sm">
                        <span class="text-xs font-bold text-gray-400 uppercase">Status:</span>
                        <select onchange="state.filters.students.status = this.value; render()" class="text-sm font-semibold focus:outline-none bg-transparent w-full">
                            <option value="All" ${state.filters.students.status === 'All' ? 'selected' : ''}>All</option>
                            <option value="Active" ${state.filters.students.status === 'Active' ? 'selected' : ''}>Active</option>
                            <option value="Inactive" ${state.filters.students.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                        </select>
                    </div>
                    <button onclick="openAddStudentModal()" class="w-full lg:w-auto bg-[#001f3f] text-[#00fbff] px-6 py-2.5 rounded-xl font-semibold hover:bg-[#001233] border border-[#00fbff]/30 transition-all flex items-center justify-center gap-2">
                        <i data-lucide="plus" class="w-5 h-5"></i>
                        Add Student
                    </button>
                </div>
            </div>

            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left min-w-[700px] lg:min-w-0">
                    <thead class="table-header-themed">
                        <tr>
                            <th class="px-6 py-4">Student</th>
                            <th class="px-6 py-4">Grade</th>
                            <th class="px-6 py-4">Monthly Fee</th>
                            <th class="px-6 py-4">Status</th>
                            <th class="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        ${filteredStudents.length > 0 ? filteredStudents.map(s => `
                            <tr class="hover:bg-gray-50 transition-colors">
                                <td class="px-6 py-4">
                                    <p class="font-bold text-sm">${s.name}</p>
                                    <p class="text-xs text-gray-500">${s.fatherName} | ${s.contact || 'No Contact'}</p>
                                </td>
                                <td class="px-6 py-4 text-sm">${s.grade}</td>
                                <td class="px-6 py-4 text-sm font-mono font-bold">${formatPKR(s.monthlyFee)}</td>
                                <td class="px-6 py-4">
                                    <span class="px-2 py-1 rounded-full text-[10px] font-bold uppercase ${s.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}">
                                        ${s.status}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <div class="flex items-center justify-end gap-2">
                                        <button onclick="openEditStudentModal('${s.id}')" class="p-2 text-gray-400 hover:text-cyan-600 transition-colors" title="Edit Student">
                                            <i data-lucide="edit-2" class="w-5 h-5"></i>
                                        </button>
                                        <button onclick="deleteStudent('${s.id}')" class="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Delete Student">
                                            <i data-lucide="trash-2" class="w-5 h-5"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('') : `
                            <tr>
                                <td colspan="5" class="px-6 py-12 text-center text-gray-500">No students found matching your filters.</td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    `;
}

// --- Finance View ---
function renderFinance(container) {
    const months = ['All', ...new Set(state.fees.map(f => f.month))].sort().reverse();
    
    const filteredFees = state.fees.filter(f => {
        const monthMatch = state.filters.finance.month === 'All' || f.month === state.filters.finance.month;
        const statusMatch = state.filters.finance.status === 'All' || f.status === state.filters.finance.status;
        return monthMatch && statusMatch;
    });

    container.innerHTML = `
        <div class="animate-in">
            <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
                <div>
                    <h2 class="text-2xl font-bold tracking-tight">Financial & Fee Engine</h2>
                    <p class="text-gray-500 text-sm">Track fee collections and generate receipts.</p>
                </div>
                <div class="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div class="flex-1 lg:flex-none flex items-center gap-2 bg-white px-3 py-1.5 border border-gray-200 rounded-xl shadow-sm">
                        <span class="text-xs font-bold text-gray-400 uppercase">Month:</span>
                        <select onchange="state.filters.finance.month = this.value; render()" class="text-sm font-semibold focus:outline-none bg-transparent w-full">
                            ${months.map(m => `<option value="${m}" ${state.filters.finance.month === m ? 'selected' : ''}>${m}</option>`).join('')}
                        </select>
                    </div>
                    <div class="flex-1 lg:flex-none flex items-center gap-2 bg-white px-3 py-1.5 border border-gray-200 rounded-xl shadow-sm">
                        <span class="text-xs font-bold text-gray-400 uppercase">Status:</span>
                        <select onchange="state.filters.finance.status = this.value; render()" class="text-sm font-semibold focus:outline-none bg-transparent w-full">
                            <option value="All" ${state.filters.finance.status === 'All' ? 'selected' : ''}>All</option>
                            <option value="Paid" ${state.filters.finance.status === 'Paid' ? 'selected' : ''}>Paid</option>
                            <option value="Pending" ${state.filters.finance.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        </select>
                    </div>
                    <button onclick="generateMonthlyFees()" class="w-full lg:w-auto bg-[#ffd700] text-[#001f3f] px-6 py-2.5 rounded-xl font-semibold hover:bg-[#ffcc00] transition-all flex items-center justify-center gap-2">
                        <i data-lucide="refresh-cw" class="w-5 h-5"></i>
                        Generate Monthly Fees
                    </button>
                </div>
            </div>

            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left min-w-[800px] lg:min-w-0">
                    <thead class="table-header-themed">
                        <tr>
                            <th class="px-6 py-4">Student</th>
                            <th class="px-6 py-4">Month</th>
                            <th class="px-6 py-4">Amount</th>
                            <th class="px-6 py-4">Status</th>
                            <th class="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        ${filteredFees.length > 0 ? filteredFees.map(f => `
                            <tr class="hover:bg-gray-50 transition-colors">
                                <td class="px-6 py-4">
                                    <p class="font-bold text-sm">${(state.students.find(s => s.id === f.studentId) || {}).name || 'Unknown'}</p>
                                </td>
                                <td class="px-6 py-4 text-sm">${f.month}</td>
                                <td class="px-6 py-4 text-sm font-mono font-bold">${formatPKR(f.amount)}</td>
                                <td class="px-6 py-4">
                                    <button onclick="toggleFeeStatus('${f.id}')" class="px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${f.status === 'Paid' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}">
                                        ${f.status}
                                    </button>
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <div class="flex items-center justify-end gap-2">
                                        <button onclick="openEditFeeModal('${f.id}')" class="p-2 text-gray-400 hover:text-cyan-600 transition-colors" title="Edit Fee">
                                            <i data-lucide="edit-2" class="w-5 h-5"></i>
                                        </button>
                                        <button onclick="printReceipt('${f.id}')" class="p-2 text-gray-400 hover:text-cyan-600 transition-colors" title="Print Receipt">
                                            <i data-lucide="file-text" class="w-5 h-5"></i>
                                        </button>
                                        <button onclick="sendWhatsApp('${f.id}')" class="p-2 text-gray-400 hover:text-green-600 transition-colors" title="Send WhatsApp">
                                            <i data-lucide="message-square" class="w-5 h-5"></i>
                                        </button>
                                        <button onclick="deleteFee('${f.id}')" class="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Delete Fee">
                                            <i data-lucide="trash-2" class="w-5 h-5"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('') : `
                            <tr>
                                <td colspan="5" class="px-6 py-12 text-center text-gray-500">No fee records found matching your filters.</td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    `;
}

// --- Expense Tracker View ---
function renderExpenses(container) {
    container.innerHTML = `
        <div class="animate-in">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 class="text-2xl font-bold tracking-tight">Expense Tracker</h2>
                    <p class="text-gray-500 text-sm">Monitor academy operational costs.</p>
                </div>
                <button onclick="openAddExpenseModal()" class="w-full sm:w-auto bg-[#001f3f] text-[#00fbff] px-6 py-2.5 rounded-xl font-semibold hover:bg-[#001233] border border-[#00fbff]/30 transition-all flex items-center justify-center gap-2">
                    <i data-lucide="plus" class="w-5 h-5"></i>
                    Add Expense
                </button>
            </div>

            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left min-w-[600px] sm:min-w-0">
                    <thead class="table-header-themed">
                        <tr>
                            <th class="px-6 py-4">Category</th>
                            <th class="px-6 py-4">Description</th>
                            <th class="px-6 py-4">Date</th>
                            <th class="px-6 py-4">Amount</th>
                            <th class="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        ${state.expenses.map(e => `
                            <tr class="hover:bg-gray-50 transition-colors">
                                <td class="px-6 py-4 text-sm font-bold">${e.category}</td>
                                <td class="px-6 py-4 text-sm text-gray-500">${e.description}</td>
                                <td class="px-6 py-4 text-sm">${e.date}</td>
                                <td class="px-6 py-4 text-sm font-mono font-bold text-red-600">${formatPKR(e.amount)}</td>
                                <td class="px-6 py-4 text-right">
                                    <div class="flex items-center justify-end gap-2">
                                        <button onclick="openEditExpenseModal('${e.id}')" class="p-2 text-gray-400 hover:text-cyan-600 transition-colors" title="Edit Expense">
                                            <i data-lucide="edit-2" class="w-5 h-5"></i>
                                        </button>
                                        <button onclick="deleteExpense('${e.id}')" class="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Delete Expense">
                                            <i data-lucide="trash-2" class="w-5 h-5"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    `;
}

// --- Staff & Payroll View ---
function renderStaff(container) {
    container.innerHTML = `
        <div class="animate-in">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 class="text-2xl font-bold tracking-tight">Staff & Payroll</h2>
                    <p class="text-gray-500 text-sm">Manage teachers and process salaries.</p>
                </div>
                <button onclick="openAddTeacherModal()" class="w-full sm:w-auto bg-[#001f3f] text-[#00fbff] px-6 py-2.5 rounded-xl font-semibold hover:bg-[#001233] border border-[#00fbff]/30 transition-all flex items-center justify-center gap-2">
                    <i data-lucide="plus" class="w-5 h-5"></i>
                    Add Teacher
                </button>
            </div>

            <!-- Sub Tabs (Pill Style) -->
            <div class="flex gap-2 mb-8 bg-gray-100/80 p-1.5 rounded-2xl w-full sm:w-fit border border-gray-200 overflow-x-auto no-scrollbar">
                <button onclick="state.staffTab = 'staff'; render()" 
                    class="flex-1 sm:flex-none whitespace-nowrap px-6 sm:px-8 py-2.5 text-sm font-bold rounded-xl transition-all ${state.staffTab === 'staff' ? 'bg-[#001f3f] text-[#00fbff] shadow-lg border border-[#00fbff]/30' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}">
                    Staff List
                </button>
                <button onclick="state.staffTab = 'payroll'; render()" 
                    class="flex-1 sm:flex-none whitespace-nowrap px-6 sm:px-8 py-2.5 text-sm font-bold rounded-xl transition-all ${state.staffTab === 'payroll' ? 'bg-[#001f3f] text-[#00fbff] shadow-lg border border-[#00fbff]/30' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}">
                    Payroll History
                </button>
            </div>

            <div class="grid grid-cols-1 gap-8">
                ${state.staffTab === 'staff' ? `
                    <!-- Teachers List -->
                    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div class="px-6 py-4 border-b border-gray-100 bg-[#001f3f]/5">
                            <h3 class="font-bold text-sm uppercase tracking-wider text-[#001f3f]">Active Teachers & Staff</h3>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left min-w-[600px] sm:min-w-0">
                            <thead class="table-header-themed">
                                <tr>
                                    <th class="px-6 py-4">Teacher</th>
                                    <th class="px-6 py-4">Expertise</th>
                                    <th class="px-6 py-4">Salary Rate</th>
                                    <th class="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                ${state.teachers.map(t => `
                                    <tr class="hover:bg-gray-50 transition-colors">
                                        <td class="px-6 py-4">
                                            <p class="font-bold text-sm">${t.name}</p>
                                            <p class="text-xs text-gray-500">${t.contact}</p>
                                        </td>
                                        <td class="px-6 py-4 text-sm">${t.subjectExpertise.join(', ')}</td>
                                        <td class="px-6 py-4 text-sm font-mono font-bold">${formatPKR(t.salaryRate)}</td>
                                        <td class="px-6 py-4 text-right">
                                            <div class="flex items-center justify-end gap-2">
                                                <button onclick="openPaySalaryModal('${t.id}')" class="px-4 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-all flex items-center gap-1">
                                                    <i data-lucide="banknote" class="w-3 h-3"></i>
                                                    Pay
                                                </button>
                                                <button onclick="openEditTeacherModal('${t.id}')" class="p-2 text-gray-400 hover:text-cyan-600 transition-colors" title="Edit Teacher">
                                                    <i data-lucide="edit-2" class="w-5 h-5"></i>
                                                </button>
                                                <button onclick="deleteTeacher('${t.id}')" class="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Delete Teacher">
                                                    <i data-lucide="trash-2" class="w-5 h-5"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                ` : `
                    <!-- Salary History -->
                    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div class="px-6 py-4 border-b border-gray-100 bg-[#001f3f]/5">
                            <h3 class="font-bold text-sm uppercase tracking-wider text-[#001f3f]">Salary Payment History</h3>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left min-w-[600px] sm:min-w-0">
                                <thead class="table-header-themed">
                                    <tr>
                                        <th class="px-6 py-4">Teacher</th>
                                        <th class="px-6 py-4">Month</th>
                                        <th class="px-6 py-4">Amount</th>
                                        <th class="px-6 py-4 hidden sm:table-cell">Date</th>
                                        <th class="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-100">
                                    ${state.salaries.length > 0 ? state.salaries.sort((a,b) => new Date(b.paidAt) - new Date(a.paidAt)).map(s => {
                                        const teacher = state.teachers.find(t => t.id === s.teacherId) || {};
                                        return `
                                            <tr class="hover:bg-gray-50 transition-colors">
                                                <td class="px-6 py-4">
                                                    <p class="font-bold text-sm">${teacher.name || 'Unknown'}</p>
                                                    <p class="text-[10px] text-gray-400 sm:hidden">${s.paidAt}</p>
                                                </td>
                                                <td class="px-6 py-4 text-sm">${s.month}</td>
                                                <td class="px-6 py-4 text-sm font-mono font-bold text-green-600">${formatPKR(s.amount)}</td>
                                                <td class="px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">${s.paidAt}</td>
                                                <td class="px-6 py-4 text-right">
                                                    <div class="flex items-center justify-end gap-1 sm:gap-2">
                                                        <button onclick="printStaffReceipt('${s.id}')" class="p-1.5 sm:p-2 text-gray-400 hover:text-cyan-600 transition-colors" title="Print Receipt">
                                                            <i data-lucide="printer" class="w-4 h-4 sm:w-5 sm:h-5"></i>
                                                        </button>
                                                        <button onclick="sendStaffWhatsApp('${s.id}')" class="p-1.5 sm:p-2 text-gray-400 hover:text-green-600 transition-colors" title="Send WhatsApp">
                                                            <i data-lucide="message-square" class="w-4 h-4 sm:w-5 sm:h-5"></i>
                                                        </button>
                                                        <button onclick="deleteSalaryRecord('${s.id}')" class="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 transition-colors" title="Delete Record">
                                                            <i data-lucide="trash-2" class="w-4 h-4 sm:w-5 sm:h-5"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('') : `
                                        <tr>
                                            <td colspan="5" class="px-6 py-12 text-center text-gray-500">No payment history available.</td>
                                        </tr>
                                    `}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `}
            </div>
        </div>
    `;
}

// --- Actions ---
function openAddStudentModal() {
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
        <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden modal-enter border border-[#00fbff]/20">
            <div class="px-6 py-4 border-b border-[#00fbff]/10 flex items-center justify-between bg-[#001f3f]">
                <h3 class="font-bold text-lg text-[#00fbff]">Add New Student</h3>
                <button onclick="closeModal()" class="text-[#00fbff]/60 hover:text-[#00fbff]"><i data-lucide="x" class="w-5 h-5"></i></button>
            </div>
            <form onsubmit="handleSaveStudent(event)" class="p-6 space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="text-xs font-bold text-gray-500 uppercase">Name</label>
                        <input type="text" name="name" required class="w-full px-4 py-2 border border-gray-200 rounded-xl">
                    </div>
                    <div class="space-y-1">
                        <label class="text-xs font-bold text-gray-500 uppercase">Father Name</label>
                        <input type="text" name="fatherName" required class="w-full px-4 py-2 border border-gray-200 rounded-xl">
                    </div>
                </div>
                <div class="space-y-1">
                    <label class="text-xs font-bold text-gray-500 uppercase">Contact Number</label>
                    <input type="text" name="contact" placeholder="03xx-xxxxxxx" required class="w-full px-4 py-2 border border-gray-200 rounded-xl">
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="text-xs font-bold text-gray-500 uppercase">Grade</label>
                        <select name="grade" class="w-full px-4 py-2 border border-gray-200 rounded-xl">
                            <option>Play Group</option><option>KG1</option><option>KG2</option>
                            <option>Grade 1</option><option>Grade 2</option><option>Grade 3</option>
                            <option>Grade 4</option><option>Grade 5</option><option>Grade 6</option>
                            <option>Grade 7</option><option>Grade 8</option><option>Grade 9</option>
                            <option>Grade 10</option>
                        </select>
                    </div>
                    <div class="space-y-1">
                        <label class="text-xs font-bold text-gray-500 uppercase">Monthly Fee</label>
                        <input type="number" name="monthlyFee" required class="w-full px-4 py-2 border border-gray-200 rounded-xl">
                    </div>
                </div>
                <div class="flex justify-end gap-3 pt-4">
                    <button type="button" onclick="closeModal()" class="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                    <button type="submit" class="px-6 py-2 text-sm font-semibold bg-[#001f3f] text-[#00fbff] rounded-xl hover:bg-[#001233] border border-[#00fbff]/50">Save Student</button>
                </div>
            </form>
        </div>
    `;
    modal.classList.remove('hidden');
    lucide.createIcons();
}

function handleSaveStudent(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const newStudent = {
        id: Math.random().toString(36).substr(2, 9),
        name: fd.get('name'),
        fatherName: fd.get('fatherName'),
        contact: fd.get('contact'),
        grade: fd.get('grade'),
        monthlyFee: Number(fd.get('monthlyFee')),
        admissionDate: new Date().toISOString().split('T')[0],
        status: 'Active'
    };
    
    state.students.push(newStudent);
    
    // Auto-generate fee for current month
    const currentMonth = new Date().toISOString().split('T')[0].substring(0, 7);
    state.fees.push({
        id: 'f' + Math.random().toString(36).substr(2, 9),
        studentId: newStudent.id,
        month: currentMonth,
        amount: newStudent.monthlyFee,
        status: 'Pending'
    });
    
    saveState();
    closeModal();
    render();
    showNotification('Student added successfully');
}

function deleteStudent(id) {
    openConfirmModal('Delete Student', 'This will permanently remove the student and all their records.', () => {
        state.students = state.students.filter(s => s.id !== id);
        state.fees = state.fees.filter(f => f.studentId !== id);
        saveState();
        render();
        showNotification('Student deleted');
    });
}

function toggleFeeStatus(id) {
    const fee = state.fees.find(f => f.id === id);
    if (fee) {
        fee.status = fee.status === 'Paid' ? 'Pending' : 'Paid';
        fee.paidAt = fee.status === 'Paid' ? new Date().toISOString().split('T')[0] : undefined;
        saveState();
        render();
        showNotification(`Fee marked as ${fee.status}`);
    }
}

function generateMonthlyFees() {
    const currentMonth = new Date().toISOString().split('T')[0].substring(0, 7);
    let count = 0;
    state.students.forEach(s => {
        if (s.status === 'Active' && !state.fees.find(f => f.studentId === s.id && f.month === currentMonth)) {
            state.fees.push({
                id: 'f' + Math.random().toString(36).substr(2, 9),
                studentId: s.id,
                month: currentMonth,
                amount: s.monthlyFee,
                status: 'Pending'
            });
            count++;
        }
    });
    if (count > 0) {
        saveState();
        render();
        showNotification(`Generated ${count} fee records`);
    } else {
        showNotification('All records are up to date');
    }
}

function openAddExpenseModal() {
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
        <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden modal-enter border border-[#00fbff]/20">
            <div class="px-6 py-4 border-b border-[#00fbff]/10 flex items-center justify-between bg-[#001f3f]">
                <h3 class="font-bold text-lg text-[#00fbff]">Add New Expense</h3>
                <button onclick="closeModal()" class="text-[#00fbff]/60 hover:text-[#00fbff]"><i data-lucide="x" class="w-5 h-5"></i></button>
            </div>
            <form onsubmit="handleSaveExpense(event)" class="p-6 space-y-4">
                <div class="space-y-1">
                    <label class="text-xs font-bold text-gray-500 uppercase">Category</label>
                    <select name="category" class="w-full px-4 py-2 border border-gray-200 rounded-xl">
                        <option>Rent</option><option>Electricity</option><option>Marketing</option>
                        <option>Stationery</option><option>Salaries</option><option>Maintenance</option>
                        <option>Miscellaneous</option>
                    </select>
                </div>
                <div class="space-y-1">
                    <label class="text-xs font-bold text-gray-500 uppercase">Description</label>
                    <input type="text" name="description" required class="w-full px-4 py-2 border border-gray-200 rounded-xl">
                </div>
                <div class="space-y-1">
                    <label class="text-xs font-bold text-gray-500 uppercase">Amount</label>
                    <input type="number" name="amount" required class="w-full px-4 py-2 border border-gray-200 rounded-xl">
                </div>
                <div class="flex justify-end gap-3 pt-4">
                    <button type="button" onclick="closeModal()" class="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                    <button type="submit" class="px-6 py-2 text-sm font-semibold bg-[#001f3f] text-[#00fbff] rounded-xl hover:bg-[#001233] border border-[#00fbff]/50">Save Expense</button>
                </div>
            </form>
        </div>
    `;
    modal.classList.remove('hidden');
    lucide.createIcons();
}

function handleSaveExpense(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    state.expenses.push({
        id: 'e' + Math.random().toString(36).substr(2, 9),
        category: fd.get('category'),
        description: fd.get('description'),
        amount: Number(fd.get('amount')),
        date: new Date().toISOString().split('T')[0]
    });
    saveState();
    closeModal();
    render();
    showNotification('Expense added');
}

function openAddTeacherModal() {
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
        <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden modal-enter border border-[#00fbff]/20">
            <div class="px-6 py-4 border-b border-[#00fbff]/10 flex items-center justify-between bg-[#001f3f]">
                <h3 class="font-bold text-lg text-[#00fbff]">Add New Teacher</h3>
                <button onclick="closeModal()" class="text-[#00fbff]/60 hover:text-[#00fbff]"><i data-lucide="x" class="w-5 h-5"></i></button>
            </div>
            <form onsubmit="handleSaveTeacher(event)" class="p-6 space-y-4">
                <div class="space-y-1">
                    <label class="text-xs font-bold text-gray-500 uppercase">Name</label>
                    <input type="text" name="name" required class="w-full px-4 py-2 border border-gray-200 rounded-xl">
                </div>
                <div class="space-y-1">
                    <label class="text-xs font-bold text-gray-500 uppercase">Contact</label>
                    <input type="text" name="contact" required class="w-full px-4 py-2 border border-gray-200 rounded-xl">
                </div>
                <div class="space-y-1">
                    <label class="text-xs font-bold text-gray-500 uppercase">Salary Rate</label>
                    <input type="number" name="salaryRate" required class="w-full px-4 py-2 border border-gray-200 rounded-xl">
                </div>
                <div class="space-y-1">
                    <label class="text-xs font-bold text-gray-500 uppercase">Expertise (comma separated)</label>
                    <input type="text" name="expertise" required class="w-full px-4 py-2 border border-gray-200 rounded-xl">
                </div>
                <div class="flex justify-end gap-3 pt-4">
                    <button type="button" onclick="closeModal()" class="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                    <button type="submit" class="px-6 py-2 text-sm font-semibold bg-[#001f3f] text-[#00fbff] rounded-xl hover:bg-[#001233] border border-[#00fbff]/50">Save Teacher</button>
                </div>
            </form>
        </div>
    `;
    modal.classList.remove('hidden');
    lucide.createIcons();
}

function handleSaveTeacher(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const newTeacher = {
        id: 't' + Math.random().toString(36).substr(2, 9),
        name: fd.get('name'),
        contact: fd.get('contact'),
        salaryRate: Number(fd.get('salaryRate')),
        subjectExpertise: fd.get('expertise').split(',').map(s => s.trim())
    };
    state.teachers.push(newTeacher);
    saveState();
    closeModal();
    render();
    showNotification('Teacher added');
}

function openEditStudentModal(id) {
    const student = state.students.find(s => s.id === id);
    if (!student) return;
    
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
        <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden modal-enter border border-[#00fbff]/20">
            <div class="px-6 py-4 border-b border-[#00fbff]/10 flex items-center justify-between bg-[#001f3f]">
                <h3 class="font-bold text-lg text-[#00fbff]">Edit Student</h3>
                <button onclick="closeModal()" class="text-[#00fbff]/60 hover:text-[#00fbff]"><i data-lucide="x" class="w-5 h-5"></i></button>
            </div>
            <form onsubmit="handleUpdateStudent(event, '${id}')" class="p-6 space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="text-xs font-bold text-gray-500 uppercase">Name</label>
                        <input type="text" name="name" value="${student.name}" required class="w-full px-4 py-2 border border-gray-200 rounded-xl">
                    </div>
                    <div class="space-y-1">
                        <label class="text-xs font-bold text-gray-500 uppercase">Father Name</label>
                        <input type="text" name="fatherName" value="${student.fatherName}" required class="w-full px-4 py-2 border border-gray-200 rounded-xl">
                    </div>
                </div>
                <div class="space-y-1">
                    <label class="text-xs font-bold text-gray-500 uppercase">Contact Number</label>
                    <input type="text" name="contact" value="${student.contact || ''}" placeholder="03xx-xxxxxxx" required class="w-full px-4 py-2 border border-gray-200 rounded-xl">
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="text-xs font-bold text-gray-500 uppercase">Grade</label>
                        <select name="grade" class="w-full px-4 py-2 border border-gray-200 rounded-xl">
                            ${['Play Group', 'KG1', 'KG2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'].map(g => `<option ${student.grade === g ? 'selected' : ''}>${g}</option>`).join('')}
                        </select>
                    </div>
                    <div class="space-y-1">
                        <label class="text-xs font-bold text-gray-500 uppercase">Monthly Fee</label>
                        <input type="number" name="monthlyFee" value="${student.monthlyFee}" required class="w-full px-4 py-2 border border-gray-200 rounded-xl">
                    </div>
                </div>
                <div class="space-y-1">
                    <label class="text-xs font-bold text-gray-500 uppercase">Status</label>
                    <select name="status" class="w-full px-4 py-2 border border-gray-200 rounded-xl">
                        <option ${student.status === 'Active' ? 'selected' : ''}>Active</option>
                        <option ${student.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                    </select>
                </div>
                <div class="flex justify-end gap-3 pt-4">
                    <button type="button" onclick="closeModal()" class="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                    <button type="submit" class="px-6 py-2 text-sm font-semibold bg-[#001f3f] text-[#00fbff] rounded-xl hover:bg-[#001233] border border-[#00fbff]/50">Update Student</button>
                </div>
            </form>
        </div>
    `;
    modal.classList.remove('hidden');
    lucide.createIcons();
}

function handleUpdateStudent(e, id) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const index = state.students.findIndex(s => s.id === id);
    if (index !== -1) {
        state.students[index] = {
            ...state.students[index],
            name: fd.get('name'),
            fatherName: fd.get('fatherName'),
            contact: fd.get('contact'),
            grade: fd.get('grade'),
            monthlyFee: Number(fd.get('monthlyFee')),
            status: fd.get('status')
        };
        saveState();
        closeModal();
        render();
        showNotification('Student updated');
    }
}

function openEditFeeModal(id) {
    const fee = state.fees.find(f => f.id === id);
    if (!fee) return;
    
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
        <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden modal-enter border border-[#00fbff]/20">
            <div class="px-6 py-4 border-b border-[#00fbff]/10 flex items-center justify-between bg-[#001f3f]">
                <h3 class="font-bold text-lg text-[#00fbff]">Edit Fee Record</h3>
                <button onclick="closeModal()" class="text-[#00fbff]/60 hover:text-[#00fbff]"><i data-lucide="x" class="w-5 h-5"></i></button>
            </div>
            <form onsubmit="handleUpdateFee(event, '${id}')" class="p-6 space-y-4">
                <div class="space-y-1">
                    <label class="text-xs font-bold text-gray-500 uppercase">Amount</label>
                    <input type="number" name="amount" value="${fee.amount}" required class="w-full px-4 py-2 border border-gray-200 rounded-xl">
                </div>
                <div class="space-y-1">
                    <label class="text-xs font-bold text-gray-500 uppercase">Month</label>
                    <input type="month" name="month" value="${fee.month}" required class="w-full px-4 py-2 border border-gray-200 rounded-xl">
                </div>
                <div class="flex justify-end gap-3 pt-4">
                    <button type="button" onclick="closeModal()" class="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                    <button type="submit" class="px-6 py-2 text-sm font-semibold bg-[#001f3f] text-[#00fbff] rounded-xl hover:bg-[#001233] border border-[#00fbff]/50">Update Fee</button>
                </div>
            </form>
        </div>
    `;
    modal.classList.remove('hidden');
    lucide.createIcons();
}

function handleUpdateFee(e, id) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const index = state.fees.findIndex(f => f.id === id);
    if (index !== -1) {
        state.fees[index] = {
            ...state.fees[index],
            amount: Number(fd.get('amount')),
            month: fd.get('month')
        };
        saveState();
        closeModal();
        render();
        showNotification('Fee record updated');
    }
}

function printReceipt(id) {
    const fee = state.fees.find(f => f.id === id);
    const student = fee ? state.students.find(s => s.id === fee.studentId) : null;
    if (!fee || !student) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(`
            <html>
                <head>
                    <title>Fee Receipt - ${student.name}</title>
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
                        <div class="row"><strong>Student Name:</strong> <span>${student.name}</span></div>
                        <div class="row"><strong>Father's Name:</strong> <span>${student.fatherName}</span></div>
                        <div class="row"><strong>Grade:</strong> <span>${student.grade}</span></div>
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
}

function sendWhatsApp(id) {
    const fee = state.fees.find(f => f.id === id);
    const student = fee ? state.students.find(s => s.id === fee.studentId) : null;
    if (!fee || !student) return;

    const text = `*Fee Receipt - Parwaaz e Shaheen Academy*\n\nStudent: ${student.name}\nFather: ${student.fatherName}\nGrade: ${student.grade}\nMonth: ${fee.month}\nAmount: ${formatPKR(fee.amount)}\nStatus: ${fee.status}\n\n_Thank you for your support._`;
    const encodedText = encodeURIComponent(text);
    const phone = student.contact.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${phone}?text=${encodedText}`, '_blank');
}

function openEditExpenseModal(id) {
    const expense = state.expenses.find(e => e.id === id);
    if (!expense) return;
    
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
        <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden modal-enter border border-[#00fbff]/20">
            <div class="px-6 py-4 border-b border-[#00fbff]/10 flex items-center justify-between bg-[#001f3f]">
                <h3 class="font-bold text-lg text-[#00fbff]">Edit Expense</h3>
                <button onclick="closeModal()" class="text-[#00fbff]/60 hover:text-[#00fbff]"><i data-lucide="x" class="w-5 h-5"></i></button>
            </div>
            <form onsubmit="handleUpdateExpense(event, '${id}')" class="p-6 space-y-4">
                <div class="space-y-1">
                    <label class="text-xs font-bold text-gray-500 uppercase">Category</label>
                    <select name="category" class="w-full px-4 py-2 border border-gray-200 rounded-xl">
                        ${['Rent', 'Electricity', 'Marketing', 'Stationery', 'Salaries', 'Maintenance'].map(c => `<option ${expense.category === c ? 'selected' : ''}>${c}</option>`).join('')}
                    </select>
                </div>
                <div class="space-y-1">
                    <label class="text-xs font-bold text-gray-500 uppercase">Description</label>
                    <input type="text" name="description" value="${expense.description}" required class="w-full px-4 py-2 border border-gray-200 rounded-xl">
                </div>
                <div class="space-y-1">
                    <label class="text-xs font-bold text-gray-500 uppercase">Amount</label>
                    <input type="number" name="amount" value="${expense.amount}" required class="w-full px-4 py-2 border border-gray-200 rounded-xl">
                </div>
                <div class="flex justify-end gap-3 pt-4">
                    <button type="button" onclick="closeModal()" class="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                    <button type="submit" class="px-6 py-2 text-sm font-semibold bg-[#001f3f] text-[#00fbff] rounded-xl hover:bg-[#001233] border border-[#00fbff]/50">Update Expense</button>
                </div>
            </form>
        </div>
    `;
    modal.classList.remove('hidden');
    lucide.createIcons();
}

function handleUpdateExpense(e, id) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const index = state.expenses.findIndex(ex => ex.id === id);
    if (index !== -1) {
        state.expenses[index] = {
            ...state.expenses[index],
            category: fd.get('category'),
            description: fd.get('description'),
            amount: Number(fd.get('amount'))
        };
        saveState();
        closeModal();
        render();
        showNotification('Expense updated');
    }
}

function openEditTeacherModal(id) {
    const teacher = state.teachers.find(t => t.id === id);
    if (!teacher) return;
    
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
        <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden modal-enter border border-[#00fbff]/20">
            <div class="px-6 py-4 border-b border-[#00fbff]/10 flex items-center justify-between bg-[#001f3f]">
                <h3 class="font-bold text-lg text-[#00fbff]">Edit Teacher</h3>
                <button onclick="closeModal()" class="text-[#00fbff]/60 hover:text-[#00fbff]"><i data-lucide="x" class="w-5 h-5"></i></button>
            </div>
            <form onsubmit="handleUpdateTeacher(event, '${id}')" class="p-6 space-y-4">
                <div class="space-y-1">
                    <label class="text-xs font-bold text-gray-500 uppercase">Name</label>
                    <input type="text" name="name" value="${teacher.name}" required class="w-full px-4 py-2 border border-gray-200 rounded-xl">
                </div>
                <div class="space-y-1">
                    <label class="text-xs font-bold text-gray-500 uppercase">Contact</label>
                    <input type="text" name="contact" value="${teacher.contact}" required class="w-full px-4 py-2 border border-gray-200 rounded-xl">
                </div>
                <div class="space-y-1">
                    <label class="text-xs font-bold text-gray-500 uppercase">Salary Rate</label>
                    <input type="number" name="salaryRate" value="${teacher.salaryRate}" required class="w-full px-4 py-2 border border-gray-200 rounded-xl">
                </div>
                <div class="space-y-1">
                    <label class="text-xs font-bold text-gray-500 uppercase">Expertise (comma separated)</label>
                    <input type="text" name="expertise" value="${teacher.subjectExpertise.join(', ')}" required class="w-full px-4 py-2 border border-gray-200 rounded-xl">
                </div>
                <div class="flex justify-end gap-3 pt-4">
                    <button type="button" onclick="closeModal()" class="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                    <button type="submit" class="px-6 py-2 text-sm font-semibold bg-[#001f3f] text-[#00fbff] rounded-xl hover:bg-[#001233] border border-[#00fbff]/50">Update Teacher</button>
                </div>
            </form>
        </div>
    `;
    modal.classList.remove('hidden');
    lucide.createIcons();
}

function handleUpdateTeacher(e, id) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const index = state.teachers.findIndex(t => t.id === id);
    if (index !== -1) {
        state.teachers[index] = {
            ...state.teachers[index],
            name: fd.get('name'),
            contact: fd.get('contact'),
            salaryRate: Number(fd.get('salaryRate')),
            subjectExpertise: fd.get('expertise').split(',').map(s => s.trim())
        };
        saveState();
        closeModal();
        render();
        showNotification('Teacher updated');
    }
}

function deleteFee(id) {
    openConfirmModal('Delete Fee', 'Are you sure you want to delete this fee record?', () => {
        state.fees = state.fees.filter(f => f.id !== id);
        saveState();
        render();
        showNotification('Fee record deleted');
    });
}

function deleteExpense(id) {
    openConfirmModal('Delete Expense', 'Are you sure you want to delete this expense record?', () => {
        state.expenses = state.expenses.filter(e => e.id !== id);
        saveState();
        render();
        showNotification('Expense deleted');
    });
}

function deleteTeacher(id) {
    openConfirmModal('Delete Teacher', 'Deleting a teacher will also remove their salary history.', () => {
        state.teachers = state.teachers.filter(t => t.id !== id);
        state.salaries = state.salaries.filter(s => s.teacherId !== id);
        saveState();
        render();
        showNotification('Teacher deleted');
    });
}

function openPaySalaryModal(teacherId) {
    const teacher = state.teachers.find(t => t.id === teacherId);
    if (!teacher) return;
    
    const currentMonth = new Date().toISOString().split('T')[0].substring(0, 7);
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
        <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden modal-enter border border-[#00fbff]/20">
            <div class="px-6 py-4 border-b border-[#00fbff]/10 flex items-center justify-between bg-[#001f3f]">
                <h3 class="font-bold text-lg text-[#00fbff]">Pay Salary: ${teacher.name}</h3>
                <button onclick="closeModal()" class="text-[#00fbff]/60 hover:text-[#00fbff]"><i data-lucide="x" class="w-5 h-5"></i></button>
            </div>
            <form onsubmit="handlePaySalary(event, '${teacherId}')" class="p-6 space-y-4">
                <div class="space-y-1">
                    <label class="text-xs font-bold text-gray-500 uppercase">Month</label>
                    <input type="month" name="month" value="${currentMonth}" required class="w-full px-4 py-2 border border-gray-200 rounded-xl">
                </div>
                <div class="space-y-1">
                    <label class="text-xs font-bold text-gray-500 uppercase">Amount</label>
                    <input type="number" name="amount" value="${teacher.salaryRate}" required class="w-full px-4 py-2 border border-gray-200 rounded-xl">
                </div>
                <div class="flex justify-end gap-3 pt-4">
                    <button type="button" onclick="closeModal()" class="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                    <button type="submit" class="px-6 py-2 text-sm font-semibold bg-green-600 text-white rounded-xl hover:bg-green-700">Confirm Payment</button>
                </div>
            </form>
        </div>
    `;
    modal.classList.remove('hidden');
    lucide.createIcons();
}

function handlePaySalary(e, teacherId) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const amount = Number(fd.get('amount'));
    const month = fd.get('month');
    
    const newSalary = {
        id: 's' + Math.random().toString(36).substr(2, 9),
        teacherId,
        month,
        amount,
        status: 'Paid',
        paidAt: new Date().toISOString().split('T')[0]
    };
    
    state.salaries.push(newSalary);
    
    // Also record as an expense
    state.expenses.push({
        id: 'e' + Math.random().toString(36).substr(2, 9),
        category: 'Salaries',
        description: `Salary Payment - ${state.teachers.find(t => t.id === teacherId).name} (${month})`,
        amount,
        date: new Date().toISOString().split('T')[0]
    });
    
    saveState();
    closeModal();
    render();
    showNotification('Salary payment recorded');
}

function printStaffReceipt(id) {
    const salary = state.salaries.find(s => s.id === id);
    const teacher = state.teachers.find(t => t.id === salary.teacherId);
    if (!salary || !teacher) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Salary Receipt - ${teacher.name}</title>
                <style>
                    body { font-family: sans-serif; padding: 40px; color: #1a1a1a; }
                    .receipt { max-width: 500px; margin: 0 auto; border: 2px solid #eee; padding: 30px; border-radius: 15px; }
                    .header { text-align: center; border-bottom: 2px solid #f4f4f4; padding-bottom: 20px; margin-bottom: 20px; }
                    .row { display: flex; justify-between; margin-bottom: 10px; }
                    .label { color: #666; font-weight: bold; }
                    .value { margin-left: auto; font-weight: bold; }
                    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #999; }
                </style>
            </head>
            <body>
                <div class="receipt">
                    <div class="header">
                        <h2>Parwaaz e Shaheen Academy</h2>
                        <p>Salary Payment Receipt</p>
                    </div>
                    <div class="row"><span class="label">Teacher Name:</span> <span class="value">${teacher.name}</span></div>
                    <div class="row"><span class="label">Month:</span> <span class="value">${salary.month}</span></div>
                    <div class="row"><span class="label">Amount Paid:</span> <span class="value">${formatPKR(salary.amount)}</span></div>
                    <div class="row"><span class="label">Payment Date:</span> <span class="value">${salary.paidAt}</span></div>
                    <div class="row"><span class="label">Status:</span> <span class="value">${salary.status}</span></div>
                    <div class="footer">
                        <p>This is a computer generated receipt.</p>
                        <p>Thank you for your dedication!</p>
                    </div>
                </div>
                <script>window.print();</script>
            </body>
        </html>
    `);
    printWindow.document.close();
}

function sendStaffWhatsApp(id) {
    const salary = state.salaries.find(s => s.id === id);
    const teacher = state.teachers.find(t => t.id === salary.teacherId);
    if (!salary || !teacher) return;

    const message = `Hello ${teacher.name}, your salary for ${salary.month} of ${formatPKR(salary.amount)} has been processed on ${salary.paidAt}. Thank you! - Parwaaz e Shaheen Academy`;
    const url = `https://wa.me/${teacher.contact.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

function deleteSalaryRecord(id) {
    openConfirmModal('Delete Salary', 'Are you sure you want to delete this salary record?', () => {
        state.salaries = state.salaries.filter(s => s.id !== id);
        saveState();
        render();
        showNotification('Salary record deleted');
    });
}

// --- Backup & Restore Module ---
function renderBackup(container) {
    container.innerHTML = `
        <div class="animate-in">
            <div class="mb-8">
                <h2 class="text-2xl font-bold tracking-tight">Backup & Restore</h2>
                <p class="text-gray-500">Secure your data locally on your computer.</p>
            </div>

            <div class="max-w-2xl">
                <!-- Local Backup -->
                <div class="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                    <div class="flex items-center gap-4 mb-6">
                        <div class="p-3 bg-cyan-500/10 text-cyan-600 rounded-xl">
                            <i data-lucide="hard-drive" class="w-8 h-8"></i>
                        </div>
                        <div>
                            <h3 class="font-bold text-xl">Local Database Backup</h3>
                            <p class="text-sm text-gray-500">Download or restore your academy data.</p>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button onclick="exportData()" class="bg-[#001f3f] text-[#00fbff] py-3 rounded-xl font-semibold hover:bg-[#001233] border border-[#00fbff]/30 transition-all flex items-center justify-center gap-2">
                            <i data-lucide="download" class="w-5 h-5"></i>
                            Download Backup
                        </button>
                        <label class="border-2 border-dashed border-gray-200 py-3 rounded-xl font-semibold text-gray-600 hover:border-gray-400 transition-all flex items-center justify-center gap-2 cursor-pointer text-center">
                            <i data-lucide="upload" class="w-5 h-5"></i>
                            Restore from File
                            <input type="file" class="hidden" onchange="importData(event)" accept=".json">
                        </label>
                    </div>

                    <div class="mt-8 pt-6 border-t border-gray-100">
                        <h4 class="font-bold text-sm text-gray-900 mb-2 flex items-center gap-2">
                            <i data-lucide="shield-check" class="w-4 h-4 text-green-500"></i>
                            Security Note
                        </h4>
                        <p class="text-xs text-gray-500 leading-relaxed">
                            Your data is stored locally in your browser. We recommend downloading a backup at the end of every week to ensure your records are safe even if you clear your browser history.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function exportData() {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `psa_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Backup downloaded successfully');
}

function openConfirmModal(title, message, onConfirm) {
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
        <div class="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden modal-enter border border-red-500/20">
            <div class="px-6 py-4 border-b border-red-500/10 flex items-center justify-between bg-red-50">
                <h3 class="font-bold text-lg text-red-600">${title}</h3>
                <button onclick="closeModal()" class="text-red-400 hover:text-red-600"><i data-lucide="x" class="w-5 h-5"></i></button>
            </div>
            <div class="p-6">
                <p class="text-gray-600 text-sm mb-6">${message}</p>
                <div class="flex justify-end gap-3">
                    <button onclick="closeModal()" class="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                    <button id="confirm-action-btn" class="px-6 py-2 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all">Confirm Action</button>
                </div>
            </div>
        </div>
    `;
    modal.classList.remove('hidden');
    document.getElementById('confirm-action-btn').onclick = () => {
        onConfirm();
        closeModal();
    };
    lucide.createIcons();
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedState = JSON.parse(e.target.result);
            openConfirmModal('Restore Data', 'This will overwrite EVERYTHING! Make sure you have a backup of current data.', () => {
                state = { ...state, ...importedState };
                saveState();
                render();
                showNotification('Data restored successfully');
            });
        } catch (err) {
            showNotification('Invalid backup file');
        }
    };
    reader.readAsText(file);
}

// --- Initialization ---
Object.assign(window, {
    switchTab,
    toggleSidebar,
    closeModal,
    render,
    handleLogout,
    openAddStudentModal,
    handleSaveStudent,
    deleteStudent,
    toggleFeeStatus,
    generateMonthlyFees,
    openAddExpenseModal,
    handleSaveExpense,
    openAddTeacherModal,
    handleSaveTeacher,
    openEditStudentModal,
    handleUpdateStudent,
    openEditFeeModal,
    handleUpdateFee,
    printReceipt,
    sendWhatsApp,
    openEditExpenseModal,
    handleUpdateExpense,
    openEditTeacherModal,
    handleUpdateTeacher,
    deleteFee,
    deleteExpense,
    deleteTeacher,
    openPaySalaryModal,
    handlePaySalary,
    printStaffReceipt,
    sendStaffWhatsApp,
    deleteSalaryRecord,
    openConfirmModal,
    renderBackup,
    exportData,
    importData
});

window.onload = () => {
    render();
};
