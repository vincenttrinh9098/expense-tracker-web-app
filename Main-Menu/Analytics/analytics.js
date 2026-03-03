import { db, auth, collection, query, where, onSnapshot, onAuthStateChanged } from '../Authentication/auth-guard.js';

const sidebar = document.querySelector('.sidebar');
const toggleBtn = document.querySelector('.toggle-btn');
if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
}


let myChart;
let allData = []; 
const chartTypeSelect = document.getElementById('chartType');
const timeDimensionSelect = document.getElementById('timeFilter');

//FIREBASE DATA FETCHING
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Fetching all user data to process locally
        const q = query(collection(db, "expenses"), where("uid", "==", user.uid));
        
        onSnapshot(q, (snapshot) => {
            allData = [];
            snapshot.forEach(doc => allData.push(doc.data()));
            processAndRender(); 
        });
    }
});

//EVENT LISTENERS
if (chartTypeSelect) chartTypeSelect.addEventListener('change', processAndRender);
if (timeDimensionSelect) timeDimensionSelect.addEventListener('change', processAndRender);

// 6. DATA PROCESSING LOGIC
function processAndRender() {
    const type = chartTypeSelect ? chartTypeSelect.value : 'pie';
    const dimension = timeDimensionSelect ? timeDimensionSelect.value : 'all';
    
    let labels = [];
    let values = [];
    let chartTitle = '';

    // 1. Filter raw data by the selected Time Range (Week/Month/Year)
    const filteredByTime = filterByTime(allData, dimension);

    if (type === 'pie') {
        // --- PIE CHART: Group by Category ---
        const categories = {};
        filteredByTime.forEach(item => {
            if (item.type === 'Expense') { // ONLY Expenses
                categories[item.cat] = (categories[item.cat] || 0) + item.amount;
            }
        });
        labels = Object.keys(categories);
        values = Object.values(categories);
        chartTitle = 'Spending by Category';
    } else {
        // --- BAR CHART: Group by Date/Month ---
        const timeGroups = {};
        
        filteredByTime.forEach(item => {
            if (item.type === 'Expense') { // ONLY Expenses
                let key = (dimension === 'year') ? item.date.substring(0, 7) : item.date;
                timeGroups[key] = (timeGroups[key] || 0) + item.amount;
            }
        });

        // Sort keys chronologically
        const sortedKeys = Object.keys(timeGroups).sort();
        
        // Make labels look nice (e.g., "Mar" instead of "2026-03")
        labels = sortedKeys.map(key => {
            if (dimension === 'year') {
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const monthIndex = parseInt(key.split('-')[1]) - 1;
                return monthNames[monthIndex];
            }
            return key; // Keep YYYY-MM-DD for week/month
        });

        values = sortedKeys.map(k => timeGroups[k]);
        chartTitle = dimension === 'year' ? 'Monthly Expenses' : 'Expenses';
    }

    renderChart(type, labels, values, chartTitle);
}


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

// 7. CHART.JS RENDERING
function renderChart(type, labels, values, title) {
    const canvas = document.getElementById('expenseChart');
    if (!canvas) return; // Prevent error if canvas isn't on page

    const ctx = canvas.getContext('2d');
    if (myChart) myChart.destroy();

    myChart = new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: values,
                backgroundColor: type === 'pie' 
                    ? ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
                    : '#d6254b',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}