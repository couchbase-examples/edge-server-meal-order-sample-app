import { retrieveOrGenerateSeatId } from './createSeatId';

describe('retrieveOrGenerateSeatId', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('should retrieve the existing seat ID from local storage', () => {
        const existingSeatId = 'seat-123456789';
        localStorage.setItem('cbmd:seatId', existingSeatId);
        const seatId = retrieveOrGenerateSeatId();
        expect(seatId).toBe(existingSeatId);
    });

    it('should generate a new seat ID if it does not exist in local storage', () => {
        const seatId = retrieveOrGenerateSeatId();
        expect(seatId).toMatch(/^seat-[a-z0-9]{9}$/);
    });

    it('should store the newly generated seat ID in local storage', () => {
        const seatId = retrieveOrGenerateSeatId();
        const storedSeatId = localStorage.getItem('cbmd:seatId');
        expect(storedSeatId).toBe(seatId);
    });

    it('should generate a different seat ID each time if not stored', () => {
        const seatId1 = retrieveOrGenerateSeatId();
        localStorage.removeItem('cbmd:seatId');
        const seatId2 = retrieveOrGenerateSeatId();
        expect(seatId1).not.toBe(seatId2);
    });
});