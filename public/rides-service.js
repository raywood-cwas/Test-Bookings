// rides-service.js
import { database, ref, onValue, push, set, remove } from './firebase-config.js';

const ridesRef = ref(database, 'rides/');
const vehiclesRef = ref(database, 'vehicles/');

export function getRides(callback, errorCallback) {
  onValue(ridesRef, (snapshot) => {
    const rides = [];
    snapshot.forEach((childSnapshot) => {
      const ride = childSnapshot.val();
      // Ensure required fields
      if (ride.title && ride.date && ride.startTime && ride.endTime) {
        rides.push(ride);
      }
    });
    callback(rides);
  }, errorCallback);
}

export function addRide(rideData) {
  // Ensure required fields
  if (!rideData.title || !rideData.date || !rideData.startTime || !rideData.endTime) {
    return Promise.reject(new Error('Missing required fields.'));
  }

  const newRideRef = push(ridesRef);
  return set(newRideRef, { ...rideData, rideId: newRideRef.key });
}

export function updateRide(rideId, updatedData) {
  // Ensure required fields
  if (!updatedData.title || !updatedData.date || !updatedData.startTime || !updatedData.endTime) {
    return Promise.reject(new Error('Missing required fields.'));
  }

  const rideRef = ref(database, 'rides/' + rideId);
  return set(rideRef, updatedData);
}

export function getVehicles(callback, errorCallback) {
  onValue(vehiclesRef, (snapshot) => {
    const vehicles = [];
    snapshot.forEach((childSnapshot) => {
      const vehicle = childSnapshot.val();
      if (vehicle.state === 'active') {
        vehicles.push(vehicle);
      }
    });
    callback(vehicles);
  }, errorCallback);
}

export function deleteRide(rideId) {
  const rideRef = ref(database, 'rides/' + rideId);
  return remove(rideRef);
}
