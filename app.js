// Initial data for demonstration (stored in localStorage)
const dummyData = [
    { registerNo: "23IT001", name: "Arun Kumar", department: "IT", yearSem: "III / V", email: "arun@example.com", phone: "9876543210" },
    { registerNo: "23CSE02", name: "Bala Murugan", department: "CSE", yearSem: "II / III", email: "bala@example.com", phone: "9876543211" },
    { registerNo: "23ECE05", name: "Priya Darshini", department: "ECE", yearSem: "IV / VII", email: "priya@example.com", phone: "9876543212" },
    { registerNo: "23MECH10", name: "Karthik R", department: "MECH", yearSem: "I / I", email: "karthik@example.com", phone: "9876543213" }
];

let students = JSON.parse(localStorage.getItem('studentMgmtData'));
if (!students) {
    students = dummyData;
    saveData();
}

function saveData() {
    localStorage.setItem('studentMgmtData', JSON.stringify(students));
}

// UI Tabs
function switchTab(tab) {
    document.getElementById('dashboard-tab').classList.toggle('hidden', tab !== 'dashboard');
    document.getElementById('students-tab').classList.toggle('hidden', tab !== 'students');
    
    document.getElementById('nav-dashboard').classList.toggle('bg-gray-700', tab === 'dashboard');
    document.getElementById('nav-students').classList.toggle('bg-gray-700', tab === 'students');

    if (tab === 'dashboard') updateDashboard();
    if (tab === 'students') renderTable();
}

// Dashboard Logic
function updateDashboard() {
    document.getElementById('dash-total').innerText = students.length;

    const deptCounts = {};
    const yearCounts = {};

    students.forEach(s => {
        deptCounts[s.department] = (deptCounts[s.department] || 0) + 1;
        yearCounts[s.yearSem] = (yearCounts[s.yearSem] || 0) + 1;
    });

    const deptUl = document.getElementById('dash-dept');
    deptUl.innerHTML = Object.entries(deptCounts).map(([k, v]) => `<li class="flex justify-between border-b pb-1"><span>${k}</span> <span class="font-bold">${v}</span></li>`).join('');

    const yearUl = document.getElementById('dash-year');
    yearUl.innerHTML = Object.entries(yearCounts).map(([k, v]) => `<li class="flex justify-between border-b pb-1"><span>${k}</span> <span class="font-bold">${v}</span></li>`).join('');
}

// Table Logic
function renderTable() {
    const searchVal = document.getElementById('search-input').value.toLowerCase();
    const filterDept = document.getElementById('filter-dept').value;
    const sortVal = document.getElementById('sort-select').value;

    let filtered = students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchVal) || s.registerNo.toLowerCase().includes(searchVal);
        const matchesDept = filterDept ? s.department === filterDept : true;
        return matchesSearch && matchesDept;
    });

    filtered.sort((a, b) => {
        if (sortVal === 'name-asc') return a.name.localeCompare(b.name);
        if (sortVal === 'name-desc') return b.name.localeCompare(a.name);
        if (sortVal === 'reg-asc') return a.registerNo.localeCompare(b.registerNo);
        if (sortVal === 'reg-desc') return b.registerNo.localeCompare(a.registerNo);
        return 0;
    });

    const tbody = document.getElementById('student-table-body');
    const emptyState = document.getElementById('empty-state');
    
    tbody.innerHTML = '';
    
    if (filtered.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        filtered.forEach(s => {
            const tr = document.createElement('tr');
            tr.className = "border-b hover:bg-gray-50 transition";
            tr.innerHTML = `
                <td class="p-3">${s.registerNo}</td>
                <td class="p-3">${s.name}</td>
                <td class="p-3">${s.department}</td>
                <td class="p-3">${s.yearSem}</td>
                <td class="p-3">${s.email}</td>
                <td class="p-3">${s.phone}</td>
                <td class="p-3 text-center space-x-2">
                    <button onclick="openModal('edit', '${s.registerNo}')" class="text-blue-600 hover:underline">Edit</button>
                    <button onclick="deleteStudent('${s.registerNo}')" class="text-red-600 hover:underline">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

// Event Listeners for filters
document.getElementById('search-input').addEventListener('input', renderTable);
document.getElementById('filter-dept').addEventListener('change', renderTable);
document.getElementById('sort-select').addEventListener('change', renderTable);

// Modal Logic
function openModal(mode, regNo = null) {
    const modal = document.getElementById('student-modal');
    const form = document.getElementById('student-form');
    const errorDiv = document.getElementById('form-error');
    errorDiv.classList.add('hidden');
    
    form.reset();
    document.getElementById('form-mode').value = mode;

    if (mode === 'edit') {
        document.getElementById('modal-title').innerText = 'Edit Student';
        const s = students.find(st => st.registerNo === regNo);
        if (s) {
            document.getElementById('original-reg').value = s.registerNo;
            document.getElementById('regNo').value = s.registerNo;
            document.getElementById('name').value = s.name;
            document.getElementById('department').value = s.department;
            document.getElementById('yearSem').value = s.yearSem;
            document.getElementById('email').value = s.email;
            document.getElementById('phone').value = s.phone;
        }
    } else {
        document.getElementById('modal-title').innerText = 'Add Student';
        document.getElementById('original-reg').value = '';
    }

    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('student-modal').classList.add('hidden');
}

document.getElementById('student-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const mode = document.getElementById('form-mode').value;
    const origReg = document.getElementById('original-reg').value;
    const errorDiv = document.getElementById('form-error');
    
    const newStudent = {
        registerNo: document.getElementById('regNo').value.trim(),
        name: document.getElementById('name').value.trim(),
        department: document.getElementById('department').value,
        yearSem: document.getElementById('yearSem').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
    };

    // Validation for duplicate ID
    if (mode === 'add' || (mode === 'edit' && origReg !== newStudent.registerNo)) {
        if (students.some(s => s.registerNo.toLowerCase() === newStudent.registerNo.toLowerCase())) {
            errorDiv.innerText = "Error: Register Number already exists!";
            errorDiv.classList.remove('hidden');
            return;
        }
    }

    if (mode === 'add') {
        students.push(newStudent);
    } else {
        const index = students.findIndex(s => s.registerNo === origReg);
        if (index !== -1) students[index] = newStudent;
    }

    saveData();
    closeModal();
    renderTable();
    updateDashboard();
});

function deleteStudent(regNo) {
    if (confirm(`Are you sure you want to delete student with Register No: ${regNo}?`)) {
        students = students.filter(s => s.registerNo !== regNo);
        saveData();
        renderTable();
        updateDashboard();
    }
}

// Init
updateDashboard();
renderTable();
