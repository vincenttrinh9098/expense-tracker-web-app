import { db, auth, collection, query, where, onSnapshot, onAuthStateChanged } from '../Authentication/auth-guard.js';

// 1. Get the data for the charts
onAuthStateChanged(auth, (user) => {
    if (user) {
        const q = query(collection(db, "expenses"), where("uid", "==", user.uid));
        
        onSnapshot(q, (snapshot) => {
            const data = [];
            snapshot.forEach(doc => data.push(doc.data()));
            
            // Logic to process 'data' and draw charts goes here!
            console.log("Analytics Data Ready:", data);
        });
    }
});

const sidebar = document.querySelector('.sidebar');
const toggleBtn = document.querySelector('.toggle-btn');

toggleBtn.addEventListener('click',() =>{
    sidebar.classList.toggle('active');
});

