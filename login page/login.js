import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCOMSx-62yWKnvc9fgtgj_dnn58KP3Grv0",
    authDomain: "expense-tracker-65bf7.firebaseapp.com",
    projectId: "expense-tracker-65bf7",
    storageBucket: "expense-tracker-65bf7.firebasestorage.app",
    messagingSenderId: "955790613625",
    appId: "1:955790613625:web:a270549689c9fcd91108a8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Target the Google Button
const googleBtn = document.getElementById('google-login');

googleBtn.addEventListener('click', (e) => {
    e.preventDefault(); // Stop the '#' from refreshing the page
    
    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;
            console.log("Logged in:", user.displayName);
            
            window.location.href = "../expense tracker/test.html"; 
        })
        .catch((error) => {
            console.error("Auth Error:", error.code);
            alert("Login failed. Make sure you enabled Google in Firebase Console!");
        });
});