// ui.js
import { deleteRide, updateRide, addRide } from './rides-service.js';

import { Calendar } from 'https://cdn.skypack.dev/@fullcalendar/core@6?min';
import dayGridPlugin from 'https://cdn.skypack.dev/@fullcalendar/daygrid@6?min';
import timeGridPlugin from 'https://cdn.skypack.dev/@fullcalendar/timegrid@6?min';
import listPlugin from 'https://cdn.skypack.dev/@fullcalendar/list@6?min';
import interactionPlugin from 'https://cdn.skypack.dev/@fullcalendar/interaction@6?min';

// Get Elements
const viewModal = document.getElementById('view-modal');
const viewModalTitle = document.getElementById('view-modal-title');
const viewModalBody = document.getElementById('view-modal-body');
const editRideButton = document.getElementById('edit-ride-button');
const deleteRideButton = document.getElementById('delete-ride-button');
const closeViewModalButton = document.getElementById('close-view-modal');

const addEditModal = document.getElementById('add-edit-modal');
const addEditModalTitle = document.getElementById('add-edit-modal-title');
const addEditModalBody = document.getElementById('add-edit-modal-body');
const closeAddEditModalButton = document.getElementById('close-add-edit-modal');

const confirmModal = document.getElementById('confirm-modal');
const confirmModalBody = document.getElementById('confirm-modal-body');
const confirmDeleteYesButton = document.getElementById('confirm-delete-yes');
const confirmDeleteNoButton = document.getElementById('confirm-delete-no');

const authPrompt = document.getElementById('auth-prompt');
const signInButton = document.getElementById('sign-in-button');
const signOutButton = document.getElementById('sign-out-button');
const mainTitle = document.getElementById('main-title');
const menuToggleBtn = document.getElementById('menu-toggle');
const sideMenu = document.getElementById('side-menu');
const overlay = document.getElementById('overlay');
const menuCloseBtn = document.getElementById('menu-close');
const userEmailDisplay = document.getElementById('user-email');
const fabButton = document.getElementById('fab-button');
const calendarEl = document.getElementById('calendar');

let uiCachedRides = [];
let uiCachedVehicles = [];
let currentEditingRideId = null; // Track which ride is being edited

let calendar = null; // FullCalendar instance

// Exported Functions

/**
 * Sets the cached vehicles.
 * @param {Array} vehicles - Array of vehicle objects.
 */
export function setVehicles(vehicles) {
  uiCachedVehicles = vehicles;
  console.log('Vehicles have been set:', uiCachedVehicles); // Debugging
}

/**
 * Retrieves the cached vehicles.
 * @returns {Array} - Array of vehicle objects.
 */
export function getUICachedVehicles() {
  return uiCachedVehicles;
}

/**
 * Populates the vehicle select dropdown with active vehicles.
 * @param {Array} vehicles - Array of vehicle objects.
 */
export function populateVehiclesDropdown(vehicles) {
  console.log('Populating vehicle dropdown with:', vehicles); // Debugging
  const vehicleSelect = document.getElementById('vehicleSelect');
  if (!vehicleSelect) {
    console.error('Vehicle select element (#vehicleSelect) not found!');
    return;
  }
  // Remove existing options except the first one (placeholder)
  while (vehicleSelect.options.length > 1) {
    vehicleSelect.remove(1);
  }

  vehicles.forEach((vehicle) => {
    const option = document.createElement('option');
    option.value = vehicle.vehicleId;
    option.textContent = vehicle.vehicleId;
    vehicleSelect.appendChild(option);
  });

  console.log('Vehicle dropdown populated successfully.'); // Debugging
}

/**
 * Converts rides to FullCalendar events.
 * @param {Array} rides - Array of ride objects.
 * @returns {Array} - Array of event objects for FullCalendar.
 */
function ridesToEvents(rides) {
  return rides.map(ride => ({
    title: ride.title || 'Untitled Ride',
    start: `${ride.date}T${ride.startTime || '00:00'}`,
    end: `${ride.date}T${ride.endTime || '00:00'}`,
    extendedProps: { ride }
  }));
}

/**
 * Initializes the FullCalendar instance after ensuring the container is visible and has dimensions.
 */
export function initCalendar() {
  // Check if FullCalendar is already initialized
  if (calendar) {
    console.warn('FullCalendar is already initialized.');
    return;
  }

  // Delay initialization to ensure the container is rendered and visible
  requestAnimationFrame(() => {
    calendar = new Calendar(calendarEl, {
      plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
      },
      events: ridesToEvents(uiCachedRides),
      eventClick: function(info) {
        const ride = info.event.extendedProps.ride;
        if (ride) {
          openViewModal(ride);
        }
      },
      // Optional: Improve rendering performance
      lazyFetching: true,
      eventLimit: true
    });

    calendar.render();
    console.log('FullCalendar initialized.'); // Debugging
  });
}

/**
 * Refreshes the FullCalendar events.
 */
export function refreshCalendarEvents() {
  if (!calendar) {
    console.warn('FullCalendar instance not initialized yet.');
    return;
  }
  calendar.removeAllEvents();
  calendar.addEventSource(ridesToEvents(uiCachedRides));
  console.log('FullCalendar events refreshed.'); // Debugging
}

/**
 * Displays rides by updating the cached rides and refreshing the calendar.
 * @param {Array} rides - Array of ride objects.
 */
export function displayRides(rides) {
  uiCachedRides = rides;
  console.log('Rides have been set:', uiCachedRides); // Debugging
  refreshCalendarEvents();
}

/**
 * Displays the signed-in UI elements.
 * @param {Object} user - User object.
 */
export function showSignedInUI(user) {
  authPrompt.style.display = 'none'; 
  signInButton.style.display = 'none';
  signOutButton.style.display = 'inline-block';

  mainTitle.textContent = 'Upcoming Rides';
  menuToggleBtn.style.display = 'inline-block';
  fabButton.style.display = 'flex'; // Show FAB

  userEmailDisplay.textContent = user.email || 'Unknown User';

  // Initialize or refresh calendar
  if (!calendar) {
    initCalendar();
  } else {
    refreshCalendarEvents();
  }

  calendarEl.style.display = 'block';
  console.log('Signed-in UI displayed.'); // Debugging
}

/**
 * Displays the signed-out UI elements.
 */
export function showSignedOutUI() {
  authPrompt.style.display = 'block'; 
  signInButton.style.display = 'inline-block';
  signOutButton.style.display = 'none';

  mainTitle.textContent = 'CWAS';
  menuToggleBtn.style.display = 'none';
  fabButton.style.display = 'none';

  userEmailDisplay.textContent = '';

  // Hide calendar
  calendarEl.style.display = 'none';
  console.log('Signed-out UI displayed.'); // Debugging
}

/**
 * Clears all rides from the UI.
 */
export function clearRidesFromUI() {
  uiCachedRides = [];
  if (calendar) {
    calendar.removeAllEvents();
    console.log('All rides cleared from FullCalendar.'); // Debugging
  }
}

/**
 * Opens the View Modal with ride details.
 * @param {Object} ride - Ride object.
 */
function openViewModal(ride) {
  viewModal.style.display = 'block';
  document.body.classList.add('modal-open');

  // Populate modal with ride details
  viewModalTitle.textContent = ride.title || 'Untitled Ride';
  viewModalBody.innerHTML = `
    <p><strong>Date:</strong> ${ride.date || 'N/A'}</p>
    <p><strong>Start Time:</strong> ${ride.startTime || 'N/A'}</p>
    <p><strong>End Time:</strong> ${ride.endTime || 'N/A'}</p>
    <p><strong>Vehicle:</strong> ${ride.vehicleId || 'N/A'}</p>
    <p><strong>Description:</strong> ${ride.description || 'No description'}</p>
    <p><strong>Client:</strong> ${ride.clientName || 'N/A'} (${ride.clientEmail || 'N/A'})</p>
    <p><strong>Pilot:</strong> ${ride.pilotName || 'N/A'} (${ride.pilotEmail || 'N/A'})</p>
    <p><strong>Passengers:</strong> ${formatPassengerNames(ride.passengerNames)}</p>
    <p><strong>Category:</strong> ${ride.rideCategory || 'N/A'}</p>
  `;

  // Attach event listeners to buttons
  editRideButton.onclick = () => {
    closeViewModal();
    openAddEditModal('edit', ride);
  };

  deleteRideButton.onclick = () => {
    closeViewModal();
    openConfirmModal(ride.rideId);
  };

  closeViewModalButton.onclick = () => {
    closeViewModal();
  };

  console.log('View Modal opened for ride:', ride); // Debugging
}

/**
 * Closes the View Modal.
 */
function closeViewModal() {
  viewModal.style.display = 'none';
  document.body.classList.remove('modal-open');
  console.log('View Modal closed.'); // Debugging
}

/**
 * Opens the Add/Edit Modal.
 * @param {string} mode - 'add' or 'edit'.
 * @param {Object|null} ride - Ride object for editing, null for adding.
 */
function openAddEditModal(mode = 'add', ride = null) {
  addEditModal.style.display = 'block';
  document.body.classList.add('modal-open');

  // Set modal title
  addEditModalTitle.textContent = mode === 'add' ? 'Add New Ride' : 'Edit Ride';

  // Populate form
  addEditModalBody.innerHTML = `
    <form id="add-edit-ride-form">
      <label for="title">Title*</label>
      <input type="text" id="title" name="title" required value="${ride ? ride.title : ''}">

      <label for="date">Date*</label>
      <input type="date" id="date" name="date" required value="${ride ? ride.date : ''}">

      <label for="startTime">Start Time*</label>
      <input type="time" id="startTime" name="startTime" required value="${ride ? ride.startTime : ''}">

      <label for="endTime">End Time*</label>
      <input type="time" id="endTime" name="endTime" required value="${ride ? ride.endTime : ''}">

      <label for="vehicleSelect">Vehicle*</label>
      <select id="vehicleSelect" name="vehicleSelect" required>
        <option value="" disabled ${!ride ? 'selected' : ''}>Select Vehicle</option>
        ${uiCachedVehicles.map(vehicle => `<option value="${vehicle.vehicleId}" ${ride && ride.vehicleId === vehicle.vehicleId ? 'selected' : ''}>${vehicle.vehicleId}</option>`).join('')}
      </select>

      <label for="description">Description</label>
      <textarea id="description" name="description">${ride ? ride.description : ''}</textarea>

      <label for="clientName">Client Name*</label>
      <input type="text" id="clientName" name="clientName" required value="${ride ? ride.clientName : ''}">

      <label for="clientEmail">Client Email*</label>
      <input type="email" id="clientEmail" name="clientEmail" required value="${ride ? ride.clientEmail : ''}">

      <label for="pilotName">Pilot Name*</label>
      <input type="text" id="pilotName" name="pilotName" required value="${ride ? ride.pilotName : ''}">

      <label for="pilotEmail">Pilot Email*</label>
      <input type="email" id="pilotEmail" name="pilotEmail" required value="${ride ? ride.pilotEmail : ''}">

      <label for="passengerNames">Passenger Names (comma-separated)</label>
      <input type="text" id="passengerNames" name="passengerNames" value="${ride && Array.isArray(ride.passengerNames) ? ride.passengerNames.join(', ') : ''}">

      <label for="rideCategory">Ride Category</label>
      <input type="text" id="rideCategory" name="rideCategory" value="${ride ? ride.rideCategory : ''}">

      <button type="submit">${mode === 'add' ? 'Add Ride' : 'Update Ride'}</button>
    </form>
  `;

  const addEditForm = document.getElementById('add-edit-ride-form');
  if (addEditForm) {
    addEditForm.addEventListener('submit', (e) => handleAddEditFormSubmit(e, mode, ride));
  } else {
    console.error('Add/Edit form not found in the modal.');
  }

  console.log(`${mode === 'add' ? 'Add' : 'Edit'} Modal opened.`, ride ? ride : ''); // Debugging
}

/**
 * Closes the Add/Edit Modal.
 */
function closeAddEditModalFunc() {
  addEditModal.style.display = 'none';
  document.body.classList.remove('modal-open');
  console.log('Add/Edit Modal closed.'); // Debugging
}

/**
 * Handles the submission of the Add/Edit form.
 * @param {Event} e - Form submission event.
 * @param {string} mode - 'add' or 'edit'.
 * @param {Object|null} ride - Ride object for editing, null for adding.
 */
function handleAddEditFormSubmit(e, mode, ride) {
  e.preventDefault();

  // Get form values
  const title = document.getElementById('title').value.trim();
  const date = document.getElementById('date').value;
  const startTime = document.getElementById('startTime').value;
  const endTime = document.getElementById('endTime').value;
  const vehicleId = document.getElementById('vehicleSelect').value;
  const description = document.getElementById('description').value.trim();
  const clientName = document.getElementById('clientName').value.trim();
  const clientEmail = document.getElementById('clientEmail').value.trim();
  const pilotName = document.getElementById('pilotName').value.trim();
  const pilotEmail = document.getElementById('pilotEmail').value.trim();
  const passengerNamesInput = document.getElementById('passengerNames').value.trim();
  const rideCategory = document.getElementById('rideCategory').value.trim();

  // Validate required fields
  if (!title || !date || !startTime || !endTime || !vehicleId || !clientName || !clientEmail || !pilotName || !pilotEmail) {
    alert('Please fill in all required fields.');
    return;
  }

  // Create ride object
  const passengerNames = passengerNamesInput ? passengerNamesInput.split(',').map(name => name.trim()) : [];

  const newRide = {
    title,
    date,
    startTime,
    endTime,
    vehicleId,
    description,
    clientName,
    clientEmail,
    pilotName,
    pilotEmail,
    passengerNames,
    rideCategory
  };

  if (mode === 'add') {
    // Add new ride
    addRide(newRide)
      .then(() => {
        alert('Ride added successfully!');
        closeAddEditModalFunc();
      })
      .catch((error) => {
        console.error('Error adding ride:', error);
        alert('Failed to add ride. Please try again.');
      });
  } else if (mode === 'edit' && ride) {
    // Update existing ride
    updateRide(ride.rideId, { ...newRide, rideId: ride.rideId })
      .then(() => {
        alert('Ride updated successfully!');
        closeAddEditModalFunc();
      })
      .catch((error) => {
        console.error('Error updating ride:', error);
        alert('Failed to update ride. Please try again.');
      });
  }
}

/**
 * Formats passenger names for display.
 * @param {Array|string|Object} passengerNames - Passenger names.
 * @returns {string} - Formatted passenger names.
 */
function formatPassengerNames(passengerNames) {
  if (Array.isArray(passengerNames)) return passengerNames.join(', ');
  if (typeof passengerNames === 'object') return Object.values(passengerNames).join(', ');
  if (typeof passengerNames === 'string') return passengerNames;
  return 'No passengers listed';
}

/**
 * Opens the Confirmation Modal for deleting a ride.
 * @param {string} rideId - ID of the ride to delete.
 */
function openConfirmModal(rideId) {
  confirmModal.style.display = 'block';
  document.body.classList.add('modal-open');

  confirmDeleteYesButton.onclick = () => {
    deleteRide(rideId)
      .then(() => {
        alert('Ride deleted successfully!');
        closeConfirmModalFunc();
      })
      .catch((error) => {
        console.error('Error deleting ride:', error);
        alert('Failed to delete ride. Please try again.');
      });
  };

  confirmDeleteNoButton.onclick = () => {
    closeConfirmModalFunc();
  };

  console.log('Confirmation Modal opened for ride ID:', rideId); // Debugging
}

/**
 * Closes the Confirmation Modal.
 */
function closeConfirmModalFunc() {
  confirmModal.style.display = 'none';
  document.body.classList.remove('modal-open');
  console.log('Confirmation Modal closed.'); // Debugging
}

/**
 * Attaches all necessary UI event listeners.
 */
export function attachUIListeners() {
  // FAB opens Add Modal
  fabButton.addEventListener('click', () => {
    openAddEditModal('add');
  });

  // Close Add/Edit Modal
  closeAddEditModalButton.onclick = () => {
    closeAddEditModalFunc();
  };

  // Close View Modal
  closeViewModalButton.onclick = () => {
    closeViewModal();
  };

  // Close Add/Edit Modal when clicking outside
  window.addEventListener('click', (event) => {
    if (event.target === addEditModal) {
      closeAddEditModalFunc();
    }
    if (event.target === viewModal) {
      closeViewModal();
    }
    if (event.target === confirmModal) {
      closeConfirmModalFunc();
    }
  });

  // Close Modals on Escape key
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (addEditModal.style.display === 'block') closeAddEditModalFunc();
      if (viewModal.style.display === 'block') closeViewModal();
      if (confirmModal.style.display === 'block') closeConfirmModalFunc();
    }
  });

  // Menu Toggle
  menuToggleBtn.addEventListener('click', () => {
    openSideMenu();
  });

  menuCloseBtn.addEventListener('click', () => {
    closeSideMenu();
  });

  // Overlay closes side menu
  overlay.addEventListener('click', () => {
    closeSideMenu();
  });

  console.log('UI listeners attached.'); // Debugging
}

/**
 * Opens the side menu.
 */
function openSideMenu() {
  sideMenu.classList.add('active');
  overlay.classList.add('active');
  console.log('Side menu opened.'); // Debugging
}

/**
 * Closes the side menu.
 */
function closeSideMenu() {
  sideMenu.classList.remove('active');
  overlay.classList.remove('active');
  console.log('Side menu closed.'); // Debugging
}
