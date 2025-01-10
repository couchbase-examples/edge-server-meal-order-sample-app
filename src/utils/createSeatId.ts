export function getOrCreateSeatId() {
    let seatId = localStorage.getItem("seatId");
    if (!seatId) {
      // Generate a random seatId
      seatId = `seat-${Math.random().toString(36).slice(2, 11)}`;
      // Store it so the user can retain the seatId in future visits
      localStorage.setItem("seatId", seatId);
    }
    return seatId;
  }