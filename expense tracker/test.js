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

// Add this line at the top with your other variables!
const transactionForm = document.getElementById('transactionForm'); 

// Added 'e' inside the parentheses here!
transactionForm.addEventListener('submit', (e) => { 
    e.preventDefault();
    
    const date = document.getElementById('inputDate').value;
    const desc = document.getElementById('inputDesc').value;
    const cat = document.getElementById('inputCategory').value;
    const amount = document.getElementById('inputAmount').value;

    const newRow = `
        <tr>
            <td>${date}</td>
            <td>${desc}</td>
            <td>${cat}</td>
            <td>$${amount}</td>
            <td>
                <button class="menuButtons"><i class='bx bxs-edit' ></i></button>
                <button class="menuButtons delete-btn">X</button>
            </td>
        </tr>
    `;

    tableBody.insertAdjacentHTML('afterbegin', newRow);
    
    // Close modal and reset fields
    modal.classList.remove('show');
    transactionForm.reset(); 
});