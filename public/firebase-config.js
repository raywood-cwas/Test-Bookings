// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, onValue, push, set, remove } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
//import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCX02FmDR7xueZ4J482hVWTSBV9JyB2SR0",
  authDomain: "test-bookings-project.firebaseapp.com",
  databaseURL: "https://test-bookings-project-default-rtdb.firebaseio.com",
  projectId: "test-bookings-project",
  storageBucket: "test-bookings-project.appspot.com",
  messagingSenderId: "1071663614831",
  appId: "1:1071663614831:web:ff1ef62be4740fd778f69a",
  measurementId: "G-KQRKRS62L2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);


export { database, ref, onValue, push, set, remove, app };
