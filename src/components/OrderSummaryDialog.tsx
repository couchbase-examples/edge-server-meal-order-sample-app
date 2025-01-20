import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, store } from "../store";

// Business
import { resetOrder as resetBusinessOrder } from "../store/mealSlice";
import { updateBusinessInventory } from "../store/inventorySlice";

// Economy
import { resetEconomyOrder } from "../store/economyMealSlice";
import { updateEconomyInventory } from "../store/economyInventorySlice";

import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	CircularProgress,
	Alert,
} from "@mui/material";
import { getOrCreateSeatId } from "../utils/createSeatId";
import { useParams } from "react-router-dom";

interface OrderSummaryDialogProps {
	onOrderSuccess: () => void;
}

const OrderSummaryDialog: React.FC<OrderSummaryDialogProps> = ({
	onOrderSuccess,
}) => {
	const dispatch = useDispatch<typeof store.dispatch>();
	const { seatClass } = useParams();

	const isEconomy = seatClass === "economy";

	// Choose the correct slice based on isEconomy
	const { items } = useSelector((state: RootState) =>
		isEconomy ? state.economyMeal : state.businessMeal
	);
	const { status, error } = useSelector((state: RootState) =>
		isEconomy ? state.economyInventory : state.businessInventory
	);

	// Decide which actions to dispatch
	const resetAction = isEconomy ? resetEconomyOrder : resetBusinessOrder;
	const updateInventoryAction = isEconomy
		? updateEconomyInventory
		: updateBusinessInventory;

	const seatUserId = getOrCreateSeatId();

	const [open, setOpen] = useState(false);

	const handleOpen = () => {
		setOpen(true);
	};
	const handleClose = () => {
		setOpen(false);
	};

	const handleConfirm = async () => {
		try {
			const formattedItems = items.map((item) => ({
				id: item.mealId,
				category: item.category,
			}));

			// Dispatch the correct update action (economy or business)
			const resultAction = await dispatch(
				updateInventoryAction({
					items: formattedItems,
					seatUserId,
				})
			);

			// If successful
			if (updateInventoryAction.fulfilled.match(resultAction)) {
				dispatch(resetAction());
				setOpen(false);
				onOrderSuccess();
			} else {
				// If there's an error, throw it
				throw resultAction.payload || resultAction.error;
			}
		} catch (error) {
			console.error("Failed to update inventory:", error);
		}
	};

	const handleReset = () => {
		dispatch(resetAction());
	};

	if (items.length === 0) {
		return null;
	}

	return (
		<div className="my-4 flex justify-end">
			<div>
				<Button
					variant="contained"
					color="primary"
					onClick={handleOpen}
					style={{ marginRight: "8px" }}
				>
					Confirm Selection
				</Button>
				<Button onClick={handleReset} className="bg-gray-200 px-4 py-2 rounded">
					Reset
				</Button>
			</div>

			<Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
				<DialogTitle>Order Summary</DialogTitle>
				<DialogContent>
					{error && <Alert severity="error">{error}</Alert>}
					{items.map((item, idx) => (
						<div
							key={idx}
							style={{ display: "flex", justifyContent: "space-between" }}
						>
							<div>
								<p className="font-medium">{item.name}</p>
								<p className="text-sm text-gray-500">{item.category}</p>
							</div>
						</div>
					))}
				</DialogContent>
				<DialogActions>
					<Button
						onClick={handleClose}
						color="inherit"
						disabled={status === "loading"}
					>
						Cancel
					</Button>
					<Button
						onClick={handleConfirm}
						variant="contained"
						color="primary"
						disabled={status === "loading"}
					>
						{status === "loading" ? <CircularProgress size={24} /> : "Confirm"}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default OrderSummaryDialog;
