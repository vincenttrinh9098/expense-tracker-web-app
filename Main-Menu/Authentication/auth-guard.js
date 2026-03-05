
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged,signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, collection, addDoc, query, where, onSnapshot, deleteDoc, doc, orderBy, getDoc, setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
apiKey: "AIzaSyCOMSx-62yWKnvc9fgtgj_dnn58KP3Grv0",
authDomain: "expense-tracker-65bf7.firebaseapp.com",
projectId: "expense-tracker-65bf7",
storageBucket: "expense-tracker-65bf7.firebasestorage.app",
messagingSenderId: "955790613625",
appId: "1:955790613625:web:a270549689c9fcd91108a8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // Export the database
export { 
    collection, addDoc, query, where, onSnapshot, deleteDoc, doc, getDoc, setDoc, orderBy, 
    onAuthStateChanged, signOut 
};

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().theme) {
            const userTheme = userDoc.data().theme;
                        
            localStorage.setItem('selectedTheme', userTheme);
                        
            applyTheme(userTheme);
        }
    }else{
        localStorage.removeItem('selectedTheme');
        applyTheme('default');
    }
});

// THE BOUNCER LOGIC
onAuthStateChanged(auth, (user) => {
if (!user) {
    // No ID Card? Kick them out!
    window.location.href = "../../login page/login.html";
} else {
    // Welcome in! Let's personalize the dashboard
    console.log("Verified User UID:", user.uid);

    console.log("Verified User UID:", user.displayName);
    
    // OPTIONAL: Display their real Google name
    const logoH2 = document.querySelector('.logo');
    if(logoH2) logoH2.innerText = user.displayName.split(' ')[0] + "'s Hub";
}
});


const signOutBtn = document.querySelector('.bx-exit').parentElement;

signOutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    signOut(auth).then(() => {
        localStorage.removeItem('selectedTheme');
        console.log("User signed out");
        window.location.href = "../../index.html";
    }).catch((error) => {
        console.error("Sign out error", error);
    });
});



