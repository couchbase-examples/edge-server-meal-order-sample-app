import { InventoryDoc } from "../types";
import {
	InventoryDocStore,
	applyOrdersToInventory,
	findOutOfStockItems,
	placeOrderWithConflictRetry,
} from "./inventoryOrders";

const makeDoc = (rev: string, seatsOrdered: Record<string, number> = {}, startingInventory = 2): InventoryDoc => ({
	_id: "businessinventory",
	_rev: rev,
	type: "businessinventory",
	flightno: "AA234",
	leg: "DFW-LAX",
	aircraft: "A321",
	breakfast: [{ businessmeal1: { seatsOrdered: { ...seatsOrdered }, startingInventory } }],
	lunch: [{ businessmeal2: { seatsOrdered: { "3A": 1 }, startingInventory: 5 } }],
	dinner: [],
	dessert: [],
	beverage: [],
	alcohol: [],
});

const order = {
	seatUserId: "1A",
	items: [{ id: "businessmeal1", name: "Omelette", category: "Breakfast" }],
};

const edgeError = (status: number) => new Error(JSON.stringify({ error: "x", status }));

describe("applyOrdersToInventory", () => {
	it("replaces the seat's previous orders with the new ones", () => {
		const doc = makeDoc("1-a");
		doc.lunch = [{ businessmeal2: { seatsOrdered: { "1A": 1, "3A": 1 }, startingInventory: 5 } }];

		const updated = applyOrdersToInventory(doc, "1A", [{ id: "businessmeal1", category: "Breakfast" }]);

		expect(updated.lunch[0].businessmeal2.seatsOrdered).toEqual({ "3A": 1 });
		expect(updated.breakfast[0].businessmeal1.seatsOrdered).toEqual({ "1A": 1 });
	});
});

describe("findOutOfStockItems", () => {
	it("reports requested items whose orders have used up the starting inventory", () => {
		const doc = makeDoc("1-a", { "2B": 1, "2C": 1 }, 2);

		expect(findOutOfStockItems(doc, order.items)).toEqual([
			{ id: "businessmeal1", name: "Omelette", category: "breakfast" },
		]);
		expect(findOutOfStockItems(makeDoc("1-a"), order.items)).toEqual([]);
	});
});

describe("placeOrderWithConflictRetry", () => {
	const fakeStore = (docs: InventoryDoc[], saveResults: Array<Error | null>) => {
		const saved: Array<{ doc: InventoryDoc; rev: string }> = [];
		const store: InventoryDocStore = {
			load: jest.fn(async () => JSON.parse(JSON.stringify(docs.shift())) as InventoryDoc),
			save: jest.fn(async (doc: InventoryDoc, rev: string) => {
				const result = saveResults.shift();
				if (result) throw result;
				saved.push({ doc, rev });
				return { ok: true };
			}),
		};
		return { store, saved };
	};

	it("saves with the loaded rev and returns the reloaded document", async () => {
		const { store, saved } = fakeStore([makeDoc("1-a"), makeDoc("2-b", { "1A": 1 })], [null]);

		const outcome = await placeOrderWithConflictRetry(store, order);

		expect(saved).toHaveLength(1);
		expect(saved[0].rev).toBe("1-a");
		expect(saved[0].doc.breakfast[0].businessmeal1.seatsOrdered).toEqual({ "1A": 1 });
		expect(outcome).toEqual({ kind: "saved", doc: makeDoc("2-b", { "1A": 1 }) });
	});

	it("reloads and retries against the new rev after a 409 conflict", async () => {
		const { store, saved } = fakeStore(
			[makeDoc("1-a"), makeDoc("2-b", { "2B": 1 }), makeDoc("3-c", { "1A": 1, "2B": 1 })],
			[edgeError(409), null]
		);

		const outcome = await placeOrderWithConflictRetry(store, order);

		expect(store.save).toHaveBeenCalledTimes(2);
		expect(saved[0].rev).toBe("2-b");
		expect(saved[0].doc.breakfast[0].businessmeal1.seatsOrdered).toEqual({ "1A": 1, "2B": 1 });
		expect(outcome.kind).toBe("saved");
	});

	it("stops with the sold-out items when a conflicting order took the last one", async () => {
		const { store } = fakeStore([makeDoc("1-a"), makeDoc("2-b", { "2B": 1, "2C": 1 })], [edgeError(409)]);

		const outcome = await placeOrderWithConflictRetry(store, order);

		expect(outcome).toEqual({
			kind: "outOfStock",
			outOfStockItems: [{ id: "businessmeal1", name: "Omelette", category: "breakfast" }],
		});
		expect(store.save).toHaveBeenCalledTimes(1);
	});

	it("fails with the Edge Server error body for non-conflict errors", async () => {
		const { store } = fakeStore([makeDoc("1-a")], [edgeError(403)]);

		await expect(placeOrderWithConflictRetry(store, order)).resolves.toEqual({
			kind: "failed",
			message: edgeError(403).message,
		});
	});

	it("fails with the raw message when the error body is not JSON", async () => {
		const { store } = fakeStore([makeDoc("1-a")], [new Error("HTTP error! status: 502")]);

		await expect(placeOrderWithConflictRetry(store, order)).resolves.toMatchObject({ kind: "failed" });
	});
});
