
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged,signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


const firebaseConfig = {
apiKey: "AIzaSyCOMSx-62yWKnvc9fgtgj_dnn58KP3Grv0",
authDomain: "expense-tracker-65bf7.firebaseapp.com",
projectId: "expense-tracker-65bf7",
storageBucket: "expense-tracker-65bf7.firebasestorage.app",
messagingSenderId: "955790613625",
appId: "1:955790613625:web:a270549689c9fcd91108a8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// THE BOUNCER LOGIC
onAuthStateChanged(auth, (user) => {
if (!user) {
    // No ID Card? Kick them out!
    window.location.href = "login.html";
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
        console.log("User signed out");
        window.location.href = "../index.html";
    }).catch((error) => {
        console.error("Sign out error", error);
    });
});