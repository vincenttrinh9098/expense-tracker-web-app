import { 
    db, auth, collection, addDoc, query, where, onSnapshot, deleteDoc, doc, orderBy, onAuthStateChanged 
} from '../Authentication/auth-guard.js'; // Added .js

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

const currentIncome = document.getElementById('current-income');
const currentExpense = document.getElementById('current-expense');


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
// --- EXISTING UI VARIABLES AT TOP ---
const timeFilter = document.getElementById('timeFilter'); // Ensure this ID exists in your HTML
let unsubscribe = null; // Variable to hold the listener so we can stop/start it

// HELPER: Calculate the "Start Date" for filtering
function getStartDate(period) {
    const now = new Date();
    
    // Reset to the start of the current day (midnight)
    now.setHours(0, 0, 0, 0);

    if (period === 'week') {
        // Go back exactly 7 days from today
        now.setDate(now.getDate() - 7);
    } else if (period === 'month') {
        // Option A: If you want EVERYTHING in the current calendar month (March 1st onwards)
        now.setDate(1); 
        
        /* Option B: If you want exactly "Last 30 days", keep it as:
        now.setMonth(now.getMonth() - 1); 
        */
    } else if (period === 'year') {
        // January 1st of the current year
        now.setMonth(0, 1);
    } else {
        return null; // "all"
    }

    return now.toISOString().split('T')[0];
}

// THE MAIN LISTENER FUNCTION
function setupTransactionListener(user, period = 'all') {
    // If we have an active listener, kill it before starting a new one
    if (unsubscribe) unsubscribe();

    // 1. Base Query: User's data sorted by date
    let q = query(
        collection(db, "expenses"), 
        where("uid", "==", user.uid),
        orderBy("date", "desc")
    );

    // 2. Add Time Filter if applicable
    const startDate = getStartDate(period);
    if (startDate) {
        // This adds a second "where" clause
        q = query(q, where("date", ">=", startDate));
    }

    // 3. Start the Live Listener
    unsubscribe = onSnapshot(q, (snapshot) => {
        let totalIncome = 0;
        let totalExpense = 0;
        tableBody.innerHTML = ''; 

        if (snapshot.empty) {
             tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No transactions found for this period.</td></tr>`;
             monthlyIncome.textContent = "$0";
             monthlyExpense.textContent = "$0";
             return;
        }
        snapshot.forEach((doc) => {
            const t = doc.data();
            const id = doc.id;

            if (t.type === 'Income') totalIncome += t.amount;
            else totalExpense += t.amount;

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

        // Update UI Cards
        currentIncome.textContent = `$${totalIncome.toLocaleString()}`;
        currentExpense.textContent = `$${totalExpense.toLocaleString()}`;
    }, (error) => {
        // If you see this, you likely need to click the Index Link in the console
        console.error("Listener failed: ", error);
    });
}

// 4. Update the onAuthStateChanged
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Start default view (All)
        setupTransactionListener(user, 'all');

        // Watch for dropdown changes
        if (timeFilter) {
            timeFilter.addEventListener('change', (e) => {
                setupTransactionListener(user, e.target.value);
            });
        }
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