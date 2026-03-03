import { db, auth, collection, query, where, onSnapshot, onAuthStateChanged } from '../Authentication/auth-guard.js';

const sidebar = document.querySelector('.sidebar');
const toggleBtn = document.querySelector('.toggle-btn');
if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
}



let allData = []; 
const chartTypeSelect = document.getElementById('chartType');
const expenseFilter = document.getElementById('expenseTimeFilter');
const netFlowFilter = document.getElementById('netFlowTimeFilter');

//FIREBASE DATA FETCHING
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Fetching all user data to process locally
        const q = query(collection(db, "expenses"), where("uid", "==", user.uid));
        
        onSnapshot(q, (snapshot) => {
            allData = [];
            snapshot.forEach(doc => allData.push(doc.data()));
            
            // Initial render: tell each chart to look at its own dropdown
            const expPeriod = document.getElementById('expenseTimeFilter').value;
            const netPeriod = document.getElementById('netFlowTimeFilter').value;

            updateExpenseChart(filterByTime(allData, expPeriod));
            updateNetFlowChart(filterByTime(allData, netPeriod), netPeriod);
        });
    }
});

//EVENT LISTENERS

expenseFilter.addEventListener('change', () => {
    const period = expenseFilter.value;
    const filtered = filterByTime(allData, period);
    updateExpenseChart(filtered); 
});

// Listener for the Line Chart
netFlowFilter.addEventListener('change', () => {
    const period = netFlowFilter.value;
    const filtered = filterByTime(allData, period);
    updateNetFlowChart(filtered, period); // Needs period for Month vs Day labels
});

function filterByTime(data, period) {
    if (period === 'all') return data;
    
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0]; // The "Finish Line"
    
    // Create a copy to find the "Start Line"
    const start = new Date();
    start.setHours(0,0,0,0);
    
    if (period === 'week') {
        start.setDate(start.getDate() - 7);
    } else if (period === 'month') {
        start.setDate(1); 
    } else if (period === 'year') {
        start.setFullYear(start.getFullYear(), 0, 1);
    }
    
    const startDateStr = start.toISOString().split('T')[0];

    // Filter logic: Item must be >= Start AND <= Today
    return data.filter(item => {
        return item.date >= startDateStr && item.date <= todayStr;
    });
}



// Global variables for the new charts
let categoryPie;
let comparisonBar;
let expensePie;



function updateExpenseChart(data) {
    // 1. Create a "Bucket" for categories
    const categories = {};

    // 2. Fill the bucket
    data.forEach(item => {
        if (item.type === 'Expense') { 
            // If category doesn't exist, start at 0, then add the amount
            categories[item.cat] = (categories[item.cat] || 0) + item.amount;
        }
    });

    // 3. Extract the names (Labels) and the totals (Values)
    const labels = Object.keys(categories);
    const values = Object.values(categories);

    // 4. Get the Canvas
    const canvas = document.getElementById('expenseChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    // 5. Clear the old chart
    if (expensePie) expensePie.destroy();

    expensePie = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels, 
            datasets: [{
                label: 'Expenses ($)',
                data: values, // [50, 1200, etc.]
                backgroundColor: [
                    '#FF6384', // Rose
                    '#36A2EB', // Blue
                    '#FFCE56', // Yellow
                    '#4BC0C0', // Teal
                    '#9966FF', // Purple
                    '#FF9F40'  // Orange
                ],
                hoverOffset: 10 // Makes the slice pop out when hovered
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom', // Moves labels to the bottom for more space
                }
            }
        }
    });
}


let netFlowLine;

function updateNetFlowChart(data, dimension) {
    const flowGroups = {};
    
    data.forEach(item => {
        const key = (dimension === 'year') ? item.date.substring(0, 7) : item.date;
        if (!flowGroups[key]) flowGroups[key] = 0;
        
        // Add Income, Subtract Expense
        const amount = (item.type === 'Income') ? item.amount : -item.amount;
        flowGroups[key] += amount;
    });

    // 1. Get the sorted keys (e.g., ["2026-01", "2026-02"])
    const sortedKeys = Object.keys(flowGroups).sort();
    
    // 2. Create Pretty Labels (The fix for your "broken" labels)
    const prettyLabels = sortedKeys.map(key => {
        if (dimension === 'year') {
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const monthIndex = parseInt(key.split('-')[1]) - 1;
            return monthNames[monthIndex];
        }
        return key; // Returns YYYY-MM-DD for week/month views
    });

    // 3. Accumulation Logic
    let runningTotal = 0;
    const values = sortedKeys.map(key => {
        runningTotal += flowGroups[key];
        return runningTotal;
    });

    // 4. Render
    const canvas = document.getElementById('lineChart');
    if (!canvas) return; // Safety check
    
    const ctx = canvas.getContext('2d');
    if (netFlowLine) netFlowLine.destroy();

    netFlowLine = new Chart(ctx, {
        type: 'line',
        data: {
            labels: prettyLabels, // Fixed: Now matches the variable above
            datasets: [{
                label: 'Net Cash Flow ($)',
                data: values,
                borderColor: '#2ecc71',
                backgroundColor: 'rgba(46, 204, 113, 0.1)',
                fill: true, 
                tension: 0.3,
                pointRadius: 5,
                pointBackgroundColor: '#27ae60'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    grid: {
                        // Darkens the line at $0
                        color: (context) => context.tick.value === 0 ? '#000' : '#e0e0e0',
                        lineWidth: (context) => context.tick.value === 0 ? 2 : 1
                    }
                }
            }
        }
    });
}


//OLD FUNCTIONS
/*
if (chartTypeSelect) chartTypeSelect.addEventListener('change', processAndRender);

function processAndRender() {
    const dimension = timeDimensionSelect.value;
    const filteredByTime = filterByTime(allData, dimension);

    updateExpenseChart(filteredByTime);

    updateNetFlowChart(filteredByTime,dimension);

}


*/