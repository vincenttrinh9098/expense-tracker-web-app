import { db, auth, doc, getDoc, setDoc, onAuthStateChanged } from '../Authentication/auth-guard.js';

const sidebar = document.querySelector('.sidebar');
const toggleBtn = document.querySelector('.toggle-btn');

toggleBtn.addEventListener('click',() =>{
    sidebar.classList.toggle('active');
});



const themeSelect = document.getElementById('theme-select');
const body = document.body;

// Logic to apply the class to the body
function applyTheme(theme) {
    body.classList.remove('pink-theme', 'tritons-theme');
    if (theme && theme !== 'default') {
        body.classList.add(`${theme}-theme`);
    }
}

// 1. Listen for Auth to get the saved theme from Firestore
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("Fetching theme for:", user.uid);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists() && userDoc.data().theme) {
            const savedTheme = userDoc.data().theme;
            applyTheme(savedTheme);
            themeSelect.value = savedTheme;
        }
    }
});

// 2. Save theme when dropdown changes
themeSelect.addEventListener('change', async (e) => {
    const selectedTheme = e.target.value;
    const user = auth.currentUser;

    applyTheme(selectedTheme); // Instant visual change

    if (user) {
        try {
            await setDoc(doc(db, "users", user.uid), {
                theme: selectedTheme
            }, { merge: true });
            console.log("Theme saved to Firestore!");
        } catch (error) {
            console.error("Error saving theme:", error);
        }
    }
});