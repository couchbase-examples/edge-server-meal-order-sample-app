import { InventoryDoc, InventoryItem, OutOfStockItem, UpdateOrderPayload } from "../types";
import { api } from "../services/api";
import { MEAL_CATEGORIES, isValidCategory } from "../constants";

/**
 * Seat-order rules for an inventory document, shared by every cabin.
 *
 * An inventory document (e.g. "businessinventory") lives on Edge Server and is
 * written with optimistic concurrency: a PUT must carry the `_rev` it was based
 * on, and Edge Server answers 409 when another seat saved first. Placing an
 * order therefore means "load, check stock, apply, save with rev, retry on 409".
 */

/** Load/save access to one inventory document. Tests pass an in-memory fake. */
export interface InventoryDocStore {
	load(): Promise<InventoryDoc>;
	save(doc: InventoryDoc, rev: string): Promise<unknown>;
}

/** The Edge Server REST adapter for the inventory document with the given id. */
export const edgeInventoryDocStore = (docId: string): InventoryDocStore => ({
	load: () => api.fetch(`/american234.AmericanAirlines.AA234/${docId}`),
	save: (doc, rev) =>
		api.fetch(`/american234.AmericanAirlines.AA234/${docId}?rev=${rev}`, {
			method: "PUT",
			body: JSON.stringify(doc),
		}),
});

/** Replace every existing order of `seatUserId` with one order per item. */
export const applyOrdersToInventory = (
	doc: InventoryDoc,
	seatUserId: string,
	items: Array<{ id: string; category: string }>
): InventoryDoc => {
	const updatedDoc = { ...doc };

	// Remove all existing orders for this user
	MEAL_CATEGORIES.forEach((category) => {
		updatedDoc[category] = updatedDoc[category].map((it: InventoryItem) => {
			const mealKey = Object.keys(it)[0];
			if (it[mealKey].seatsOrdered && it[mealKey].seatsOrdered[seatUserId]) {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const { [seatUserId]: _, ...rest } = it[mealKey].seatsOrdered;
				return {
					[mealKey]: {
						...it[mealKey],
						seatsOrdered: rest,
					},
				};
			}
			return it;
		});
	});

	// Add new orders
	items.forEach((item) => {
		const category = item.category.toLowerCase();
		if (isValidCategory(category)) {
			const mealItem = updatedDoc[category].find(
				(mi: InventoryItem) => Object.keys(mi)[0] === item.id
			);
			if (mealItem) {
				const mealKey = Object.keys(mealItem)[0];
				if (!mealItem[mealKey].seatsOrdered) {
					mealItem[mealKey].seatsOrdered = {};
				}
				mealItem[mealKey].seatsOrdered[seatUserId] = 1;
			}
		}
	});

	return updatedDoc;
};

/** The requested items that have no stock left in `doc`. */
export const findOutOfStockItems = (
	doc: InventoryDoc,
	items: Array<{ id: string; name: string; category: string }>
): OutOfStockItem[] => {
	const outOfStockItems: OutOfStockItem[] = [];

	items.forEach(({ id, name, category }) => {
		const lowerCategory = category.toLowerCase();
		if (isValidCategory(lowerCategory)) {
			const mealItem = doc[lowerCategory].find(
				(mi: InventoryItem) => Object.keys(mi)[0] === id
			);
			if (mealItem) {
				const mealKey = Object.keys(mealItem)[0];
				const { seatsOrdered, startingInventory } = mealItem[mealKey];
				const totalSeatsOrdered = Object.keys(seatsOrdered ?? {}).length;
				if (startingInventory - totalSeatsOrdered <= 0) {
					outOfStockItems.push({ id, name, category: lowerCategory });
				}
			}
		}
	});
	return outOfStockItems;
};

export type PlaceOrderOutcome =
	| { kind: "saved"; doc: InventoryDoc }
	| { kind: "outOfStock"; outOfStockItems: OutOfStockItem[] }
	| { kind: "failed"; message?: string };

/**
 * Save the seat's order, retrying from a fresh load whenever Edge Server
 * rejects the write with a 409 revision conflict. Once the write lands the
 * document is reloaded; a failure of that final reload rejects the promise.
 */
export const placeOrderWithConflictRetry = async (
	store: InventoryDocStore,
	payload: UpdateOrderPayload
): Promise<PlaceOrderOutcome> => {
	try {
		while (true) {
			try {
				const currentDoc = await store.load();

				const outOfStock = findOutOfStockItems(currentDoc, payload.items);
				if (outOfStock.length > 0) {
					return { kind: "outOfStock", outOfStockItems: outOfStock };
				}

				const updatedInventory = applyOrdersToInventory(
					currentDoc,
					payload.seatUserId,
					payload.items
				);
				await store.save(updatedInventory, currentDoc._rev);
				break;
			} catch (error: unknown) {
				if (!(error instanceof Error)) {
					return { kind: "failed" };
				}
				// Edge Server error bodies are JSON; a non-JSON body lands in the outer catch.
				if (JSON.parse(error.message).status === 409) {
					continue;
				}
				return { kind: "failed", message: error.message };
			}
		}
	} catch (err) {
		return { kind: "failed", message: err instanceof Error ? err.message : undefined };
	}

	return { kind: "saved", doc: await store.load() };
};
