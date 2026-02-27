import { db, auth, collection, addDoc, query, where, onSnapshot, deleteDoc, doc, orderBy, onAuthStateChanged} from './auth-guard.js';

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

transactionForm.addEventListener('submit',async (e) => {
    e.preventDefault();
    const user = auth.currentUser; // Get the currently logged-in user
    if (!user) return;
    // 1. Create a Data Object (This is what gets saved to a User's ID later)
    const transaction = {
        uid: user.uid, // The "Locker Number"
        date: document.getElementById('inputDate').value,
        desc: document.getElementById('inputDesc').value,
        cat: document.getElementById('inputCategory').value,
        type: document.getElementById('inputType').value,
        amount: parseFloat(document.getElementById('inputAmount').value),
        createdAt: new Date() // For sorting
    };

    try {
        // Save to Firestore "expenses" collection
        await addDoc(collection(db, "expenses"), transaction);
        modal.classList.remove('show');
        transactionForm.reset();
    } catch (error) {
        console.error("Error adding document: ", error);
    }
});

// This function watches the "expenses" collection for the logged-in user
onAuthStateChanged(auth, (user) => {
    if (user) {
        // 1. Build a query: "Get expenses where UID matches this user"
        const q = query(
            collection(db, "expenses"), 
            where("uid", "==", user.uid),
            orderBy("date", "desc") // This sorts by date!
        );

        // 2. Start the Live Listener
        onSnapshot(q, (snapshot) => {
            let totalIncome = 0;
            let totalExpense = 0;
            tableBody.innerHTML = ''; // Clear the table for a fresh render

            snapshot.forEach((doc) => {
                const t = doc.data();
                const id = doc.id; // The unique Firebase ID for deleting

                // UI Calculations
                if (t.type === 'Income') totalIncome += t.amount;
                else totalExpense += t.amount;

                // Create the Row
                const row = `
                    <tr>
                        <td>${t.date}</td>
                        <td>${t.desc}</td>
                        <td><span class="badge">${t.cat}</span></td>
                        <td class="${t.type === 'Income' ? 'text-success' : 'text-danger'}">
                            ${t.type === 'Income' ? '+' : '-'}$${t.amount.toLocaleString()}
                        </td>
                        <td>
                            <button class="delete-btn" data-id="${id}">X</button>
                        </td>
                    </tr>
                `;
                tableBody.insertAdjacentHTML('beforeend', row);
            });

            // Update your CardBoxes
            monthlyIncome.textContent = `$${totalIncome.toLocaleString()}`;
            monthlyExpense.textContent = `$${totalExpense.toLocaleString()}`;
        });
    }
});

// The "Module Way" to handle clicks on the table
// The "Module Way" to handle clicks on the table (Instant Delete)
tableBody.addEventListener('click', async (e) => {
    const deleteBtn = e.target.closest('.delete-btn');
    
    if (deleteBtn) {
        const id = deleteBtn.getAttribute('data-id');
        
        try {
            // No popup, just straight to the cloud deletion
            await deleteDoc(doc(db, "expenses", id));
            console.log("Transaction deleted from Cloud!");
        } catch (error) {
            console.error("Error removing document: ", error);
        }
    }
});