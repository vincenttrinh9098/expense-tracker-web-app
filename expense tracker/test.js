const sidebar = document.querySelector('.sidebar');
const toggleBtn = document.querySelector('.toggle-btn');

toggleBtn.addEventListener('click',() =>{
    sidebar.classList.toggle('active');
});

const modal = document.getElementById('modalOverlay');
const openModalBtn = document.querySelector('.ViewAllBtn');
const closeModalBtn = document.getElementById('closeModal');
const saveBtn = document.getElementById('saveTransactionBtn');
const tableBody = document.querySelector('table tbody');

let income = 0;
let expense = 0;

const monthlyIncome = document.getElementById('monthly-income');
const monthlyExpense = document.getElementById('monthly-expense');


openModalBtn.addEventListener('click', (e) => {
    e.preventDefault(); // Stop page from jumping
    modal.classList.add('show');
});

closeModalBtn.addEventListener('click', () => {
    modal.classList.remove('show');
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('show');
    }
});


const transactionForm = document.getElementById('transactionForm'); 
let allTransactions = []; 

transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // 1. Create a Data Object (This is what gets saved to a User's ID later)
    const transaction = {
        id: Date.now(), // Unique ID for deleting/editing
        date: document.getElementById('inputDate').value,
        desc: document.getElementById('inputDesc').value,
        cat: document.getElementById('inputCategory').value,
        type: document.getElementById('inputType').value,
        amount: parseFloat(document.getElementById('inputAmount').value)
    };

    // 2. Add to our local list
    allTransactions.push(transaction);

    // 3. Update the UI based on the Data
    renderTransactions();
    
    modal.classList.remove('show');
    transactionForm.reset(); 
});

function renderTransactions() {
    tableBody.innerHTML = ''; // Clear the table
    income = 0;
    expense = 0;

    allTransactions.forEach(t => {
        // Calculations
        if(t.type === 'Income') income += t.amount;
        else expense += t.amount;

        // Visual Table Row
        const row = `
            <tr>
                <td>${t.date}</td>
                <td>${t.desc}</td>
                <td><span class="category-badge">${t.cat}</span></td>
                <td class="${t.type === 'Income' ? 'income-text' : 'expense-text'}">
                    ${t.type === 'Income' ? '+' : '-'}$${t.amount.toLocaleString()}
                </td>
                <td>
                    <button class="delete-btn" onclick="deleteItem(${t.id})">X</button>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('afterbegin', row);
    });

    monthlyIncome.textContent = `$${income.toLocaleString()}`;
    monthlyExpense.textContent = `$${expense.toLocaleString()}`;
}