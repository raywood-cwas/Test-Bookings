// main.js
import { 
  displayRides, 
  attachUIListeners, 
  populateVehiclesDropdown, 
  setVehicles,
  showSignedInUI, 
  showSignedOutUI, 
  clearRidesFromUI 
} from './ui.js';
import { getRides, getVehicles } from './rides-service.js';
import { onAuthStateChangedListener, signIn, signUserOut } from './auth.js';

// Sign in button handler
document.getElementById('sign-in-button').addEventListener('click', () => {
  signIn().catch(console.error);
});

// Sign out button handler
document.getElementById('sign-out-button').addEventListener('click', () => {
  signUserOut().catch(console.error);
});

// Listen to auth state changes
onAuthStateChangedListener((user) => {
  if (user) {
    console.log('User signed in:', user.email);
    checkUserDomain(user);
  } else {
    console.log('User not signed in');
    showSignedOutUI();
    clearRidesFromUI();
  }
});

// Check user domain
function checkUserDomain(user) {
  const allowedDomain = '@cyclingwithoutagesociety.org';
  if (!user.email.endsWith(allowedDomain)) {
    alert('You must sign in with a cyclingwithoutagesociety.org account.');
    signUserOut();
  } else {
    showSignedInUI(user);
    loadRides();
    loadVehicles();
  }
}

// Load rides from service
function loadRides() {
  getRides((rides) => {
    console.log('Rides fetched:', rides); // Debugging
    displayRides(rides);
  }, (error) => {
    console.error('Error fetching rides:', error);
  });
}

// Load vehicles from service
function loadVehicles() {
  getVehicles((vehicles) => {
    console.log('Vehicles fetched:', vehicles); // Debugging
    setVehicles(vehicles);
    // Do NOT call populateVehiclesDropdown here
  }, (error) => {
    console.error('Error fetching vehicles:', error);
  });
}

// Initialize UI listeners on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  attachUIListeners();
  console.log('DOMContentLoaded event fired and UI listeners attached.'); // Debugging
});
