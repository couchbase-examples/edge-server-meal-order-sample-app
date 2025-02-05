/**
 * Retrieves the existing seat ID from local storage or generates a new one if it doesn't exist. 
 * @returns {string} The seat ID, either retrieved from local storage or newly generated.
 */
export function retrieveOrGenerateSeatId() {
    let seatId = localStorage.getItem("seatId");
    if (!seatId) {
      // Generate a random seatId
      seatId = `seat-${Math.random().toString(36).slice(2, 11)}`;
      // Store it so the user can retain the seatId in future visits
      localStorage.setItem("seatId", seatId);
    }
    return seatId;
  }