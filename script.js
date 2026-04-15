/**
 * Parwaaz e Shaheen Academy Management System
 * Plain JavaScript Implementation
 */

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
    ]
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

// --- Navigation ---
function switchTab(tabId) {
    state.activeTab = tabId;
    
    // Update nav UI
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.getElementById(`nav-${tabId}`).classList.add('active');
    
    render();
}

// --- Rendering ---
function render() {
    const container = document.getElementById('view-container');
    container.innerHTML = '';
    
    switch (state.activeTab) {
        case 'dashboard': renderDashboard(container); break;
        case 'students': renderStudents(container); break;
        case 'finance': renderFinance(container); break;
        case 'expenses': renderExpenses(container); break;
        case 'staff': renderStaff(container); break;
    }
    
    lucide.createIcons();
}

// --- Dashboard View ---
function renderDashboard(container) {
    const totalRevenue = state.fees.filter(f => f.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0);
    const pendingFees = state.fees.filter(f => f.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpenses = state.expenses.reduce((acc, curr) => acc + curr.amount, 0);
    
    container.innerHTML = `
        <div class="animate-in">
            <div class="mb-8">
                <h2 class="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
                <p class="text-gray-500">Welcome back! Here's what's happening at Parwaaz e Shaheen Academy.</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                ${renderStatCard('Total Revenue', formatPKR(totalRevenue), 'dollar-sign', 'bg-green-50 text-green-600')}
                ${renderStatCard('Pending Fees', formatPKR(pendingFees), 'clock', 'bg-amber-50 text-amber-600')}
                ${renderStatCard('Expenses', formatPKR(totalExpenses), 'receipt', 'bg-red-50 text-red-600')}
                ${renderStatCard('Students', state.students.length, 'users', 'bg-blue-50 text-blue-600')}
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 class="font-bold text-lg mb-4">Recent Fee Collections</h3>
                    <div class="space-y-4">
                        ${state.fees.slice(0, 5).map(f => `
                            <div class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                        <i data-lucide="user" class="w-5 h-5 text-gray-400"></i>
                                    </div>
                                    <div>
                                        <p class="font-bold text-sm">${state.students.find(s => s.id === f.studentId)?.name || 'Unknown'}</p>
                                        <p class="text-xs text-gray-500">${f.month}</p>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <p class="font-bold text-sm text-[#151619]">${formatPKR(f.amount)}</p>
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
                            <i data-lucide="user-plus" class="w-6 h-6 mb-2 text-blue-600"></i>
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

function renderStatCard(label, value, icon, iconClass) {
    return `
        <div class="stat-card bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
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
    container.innerHTML = `
        <div class="animate-in">
            <div class="flex justify-between items-center mb-8">
                <div>
                    <h2 class="text-2xl font-bold tracking-tight">Student Management</h2>
                    <p class="text-gray-500">Manage enrollments and student records.</p>
                </div>
                <button onclick="openAddStudentModal()" class="bg-[#151619] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-black transition-all flex items-center gap-2">
                    <i data-lucide="plus" class="w-5 h-5"></i>
                    Add Student
                </button>
            </div>

            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <table class="w-full text-left">
                    <thead class="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th class="px-6 py-4 text-xs font-bold uppercase text-gray-500">Student</th>
                            <th class="px-6 py-4 text-xs font-bold uppercase text-gray-500">Grade</th>
                            <th class="px-6 py-4 text-xs font-bold uppercase text-gray-500">Monthly Fee</th>
                            <th class="px-6 py-4 text-xs font-bold uppercase text-gray-500">Status</th>
                            <th class="px-6 py-4 text-xs font-bold uppercase text-gray-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        ${state.students.map(s => `
                            <tr class="hover:bg-gray-50 transition-colors">
                                <td class="px-6 py-4">
                                    <p class="font-bold text-sm">${s.name}</p>
                                    <p class="text-xs text-gray-500">${s.fatherName}</p>
                                </td>
                                <td class="px-6 py-4 text-sm">${s.grade}</td>
                                <td class="px-6 py-4 text-sm font-mono font-bold">${formatPKR(s.monthlyFee)}</td>
                                <td class="px-6 py-4">
                                    <span class="px-2 py-1 rounded-full text-[10px] font-bold uppercase ${s.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}">
                                        ${s.status}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <button onclick="deleteStudent('${s.id}')" class="p-2 text-gray-400 hover:text-red-600 transition-colors">
                                        <i data-lucide="trash-2" class="w-5 h-5"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// --- Finance View ---
function renderFinance(container) {
    container.innerHTML = `
        <div class="animate-in">
            <div class="flex justify-between items-center mb-8">
                <div>
                    <h2 class="text-2xl font-bold tracking-tight">Financial & Fee Engine</h2>
                    <p class="text-gray-500">Track fee collections and generate receipts.</p>
                </div>
                <button onclick="generateMonthlyFees()" class="bg-[#151619] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-black transition-all flex items-center gap-2">
                    <i data-lucide="refresh-cw" class="w-5 h-5"></i>
                    Generate Monthly Fees
                </button>
            </div>

            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <table class="w-full text-left">
                    <thead class="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th class="px-6 py-4 text-xs font-bold uppercase text-gray-500">Student</th>
                            <th class="px-6 py-4 text-xs font-bold uppercase text-gray-500">Month</th>
                            <th class="px-6 py-4 text-xs font-bold uppercase text-gray-500">Amount</th>
                            <th class="px-6 py-4 text-xs font-bold uppercase text-gray-500">Status</th>
                            <th class="px-6 py-4 text-xs font-bold uppercase text-gray-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        ${state.fees.map(f => `
                            <tr class="hover:bg-gray-50 transition-colors">
                                <td class="px-6 py-4">
                                    <p class="font-bold text-sm">${state.students.find(s => s.id === f.studentId)?.name || 'Unknown'}</p>
                                </td>
                                <td class="px-6 py-4 text-sm">${f.month}</td>
                                <td class="px-6 py-4 text-sm font-mono font-bold">${formatPKR(f.amount)}</td>
                                <td class="px-6 py-4">
                                    <button onclick="toggleFeeStatus('${f.id}')" class="px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${f.status === 'Paid' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}">
                                        ${f.status}
                                    </button>
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <button onclick="deleteFee('${f.id}')" class="p-2 text-gray-400 hover:text-red-600 transition-colors">
                                        <i data-lucide="trash-2" class="w-5 h-5"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// --- Expense Tracker View ---
function renderExpenses(container) {
    container.innerHTML = `
        <div class="animate-in">
            <div class="flex justify-between items-center mb-8">
                <div>
                    <h2 class="text-2xl font-bold tracking-tight">Expense Tracker</h2>
                    <p class="text-gray-500">Monitor academy operational costs.</p>
                </div>
                <button onclick="openAddExpenseModal()" class="bg-[#151619] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-black transition-all flex items-center gap-2">
                    <i data-lucide="plus" class="w-5 h-5"></i>
                    Add Expense
                </button>
            </div>

            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <table class="w-full text-left">
                    <thead class="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th class="px-6 py-4 text-xs font-bold uppercase text-gray-500">Category</th>
                            <th class="px-6 py-4 text-xs font-bold uppercase text-gray-500">Description</th>
                            <th class="px-6 py-4 text-xs font-bold uppercase text-gray-500">Date</th>
                            <th class="px-6 py-4 text-xs font-bold uppercase text-gray-500">Amount</th>
                            <th class="px-6 py-4 text-xs font-bold uppercase text-gray-500 text-right">Actions</th>
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
                                    <button onclick="deleteExpense('${e.id}')" class="p-2 text-gray-400 hover:text-red-600 transition-colors">
                                        <i data-lucide="trash-2" class="w-5 h-5"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// --- Staff & Payroll View ---
function renderStaff(container) {
    container.innerHTML = `
        <div class="animate-in">
            <div class="flex justify-between items-center mb-8">
                <div>
                    <h2 class="text-2xl font-bold tracking-tight">Staff & Payroll</h2>
                    <p class="text-gray-500">Manage teachers and process salaries.</p>
                </div>
                <button onclick="openAddTeacherModal()" class="bg-[#151619] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-black transition-all flex items-center gap-2">
                    <i data-lucide="plus" class="w-5 h-5"></i>
                    Add Teacher
                </button>
            </div>

            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <table class="w-full text-left">
                    <thead class="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th class="px-6 py-4 text-xs font-bold uppercase text-gray-500">Teacher</th>
                            <th class="px-6 py-4 text-xs font-bold uppercase text-gray-500">Expertise</th>
                            <th class="px-6 py-4 text-xs font-bold uppercase text-gray-500">Salary Rate</th>
                            <th class="px-6 py-4 text-xs font-bold uppercase text-gray-500 text-right">Actions</th>
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
                                    <button onclick="deleteTeacher('${t.id}')" class="p-2 text-gray-400 hover:text-red-600 transition-colors">
                                        <i data-lucide="trash-2" class="w-5 h-5"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// --- Actions ---
function openAddStudentModal() {
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
        <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden modal-enter">
            <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 class="font-bold text-lg">Add New Student</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600"><i data-lucide="x" class="w-5 h-5"></i></button>
            </div>
            <form onsubmit="handleSaveStudent(event)" class="p-6 space-y-4">
                <div class="space-y-1">
                    <label class="text-xs font-bold text-gray-500 uppercase">Name</label>
                    <input type="text" name="name" required class="w-full px-4 py-2 border border-gray-200 rounded-xl">
                </div>
                <div class="space-y-1">
                    <label class="text-xs font-bold text-gray-500 uppercase">Father Name</label>
                    <input type="text" name="fatherName" required class="w-full px-4 py-2 border border-gray-200 rounded-xl">
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="text-xs font-bold text-gray-500 uppercase">Grade</label>
                        <select name="grade" class="w-full px-4 py-2 border border-gray-200 rounded-xl">
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
                    <button type="submit" class="px-6 py-2 text-sm font-semibold bg-[#151619] text-white rounded-xl hover:bg-black">Save Student</button>
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
    if (confirm('Are you sure you want to delete this student?')) {
        state.students = state.students.filter(s => s.id !== id);
        state.fees = state.fees.filter(f => f.studentId !== id);
        saveState();
        render();
        showNotification('Student deleted');
    }
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
        <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden modal-enter">
            <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 class="font-bold text-lg">Add New Expense</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600"><i data-lucide="x" class="w-5 h-5"></i></button>
            </div>
            <form onsubmit="handleSaveExpense(event)" class="p-6 space-y-4">
                <div class="space-y-1">
                    <label class="text-xs font-bold text-gray-500 uppercase">Category</label>
                    <select name="category" class="w-full px-4 py-2 border border-gray-200 rounded-xl">
                        <option>Rent</option><option>Electricity</option><option>Marketing</option>
                        <option>Stationery</option><option>Salaries</option><option>Maintenance</option>
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
                    <button type="submit" class="px-6 py-2 text-sm font-semibold bg-[#151619] text-white rounded-xl hover:bg-black">Save Expense</button>
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
        <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden modal-enter">
            <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 class="font-bold text-lg">Add New Teacher</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600"><i data-lucide="x" class="w-5 h-5"></i></button>
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
                    <button type="submit" class="px-6 py-2 text-sm font-semibold bg-[#151619] text-white rounded-xl hover:bg-black">Save Teacher</button>
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

function deleteFee(id) {
    if (confirm('Delete this fee record?')) {
        state.fees = state.fees.filter(f => f.id !== id);
        saveState();
        render();
        showNotification('Fee record deleted');
    }
}

function deleteExpense(id) {
    if (confirm('Delete this expense?')) {
        state.expenses = state.expenses.filter(e => e.id !== id);
        saveState();
        render();
        showNotification('Expense deleted');
    }
}

function deleteTeacher(id) {
    if (confirm('Delete this teacher?')) {
        state.teachers = state.teachers.filter(t => t.id !== id);
        saveState();
        render();
        showNotification('Teacher deleted');
    }
}

function closeModal() {
    document.getElementById('modal-container').classList.add('hidden');
}

// --- Initialization ---
window.onload = () => {
    render();
};
