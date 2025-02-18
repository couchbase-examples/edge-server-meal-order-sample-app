import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { RootState, store } from "../store";

import { updateEconomyInventory, clearOutOfStockItems as clearOutOfStockItemsEconomy } from "../store/economyInventorySlice";
import {
	updateBusinessInventory,
	clearOutOfStockItems,
} from "../store/businessInventorySlice";

import {
	Alert,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
} from "@mui/material";
import { retrieveOrGenerateSeatId } from "../utils/createSeatId";
import { toSentenceCase } from "../utils/formatText";

interface OrderSummaryDialogProps {
	onOrderSuccess: () => void;
	isEditing: boolean;
}

const OrderSummaryDialog: React.FC<OrderSummaryDialogProps> = ({
	onOrderSuccess,
	isEditing
}) => {
	const theme = useTheme();
	const dispatch = useDispatch<typeof store.dispatch>();
	const { seatClass } = useParams();

	const isEconomy = seatClass === "economy";

	// Choose the correct slice based on isEconomy
	const selectedMealState = useSelector((state: RootState) =>
		isEconomy ? state.economyMeal : state.businessMeal
	);
	const selectedInventoryState = useSelector((state: RootState) =>
		isEconomy ? state.economyInventory : state.businessInventory
	);

	const { items } = selectedMealState;
	const { status, error, outOfStockItems } = selectedInventoryState;

	// Decide which action to dispatch
	const updateInventoryAction = isEconomy
		? updateEconomyInventory
		: updateBusinessInventory;

	const seatUserId = retrieveOrGenerateSeatId();

	const [open, setOpen] = useState(false);

	const loadingIndicator = <CircularProgress size={24} />;

	const handleOpen = () => {
		setOpen(true);
	};

	// 1) Dispatch clearOutOfStockItems here, then close dialog
	const cleanupOutOfStock = () => {
		if (isEconomy) {
			dispatch(clearOutOfStockItemsEconomy());
		} else {
			dispatch(clearOutOfStockItems());
		}
		setOpen(false);
	};

	const handleConfirm = async () => {
		try {
			const formattedItems = items.map((item) => ({
				id: item.mealId,
				category: item.category,
				name: item.name,
			}));

			const resultAction = await dispatch(
				updateInventoryAction({
					items: formattedItems,
					seatUserId,
				})
			);

			// If successful
			if (updateInventoryAction.fulfilled.match(resultAction)) {
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

	const handleClose = () => {
		setOpen(false);
		// Optionally clear out-of-stock items on normal close too
		if (isEconomy) {
			dispatch(clearOutOfStockItemsEconomy());
		} else {
			dispatch(clearOutOfStockItems());
		}
	};

	if (items.length === 0 && outOfStockItems.length === 0 && !isEditing) {
		return null;
	  }

	return (
		<div>
			<button
				onClick={handleOpen}
				className="w-full px-4 py-2 text-white rounded hover:bg-opacity-90 transition-colors"
				style={{ backgroundColor: theme.palette.primary.main }}
			>
				Confirm
			</button>

			<Dialog
				open={open}
				onClose={handleClose}
				fullWidth 
				maxWidth="sm"
				PaperProps={{
					style: {
						borderRadius: "8px",
					},
				}}
			>
				<DialogTitle>Order Summary</DialogTitle>
				<DialogContent>
					{error && outOfStockItems.length === 0 && (
						<Alert severity="error">{error}</Alert>
					)}

					{outOfStockItems.length > 0 && (
						<Alert severity="warning">
							<strong>Sorry! the following items are no longer available. You may make an alternative selection and then confirm your order:</strong>
							<ul style={{ marginTop: "8px" }}>
								{outOfStockItems.map(({ name, category }) => (
									<li key={name}>
										<strong>{name}</strong> ({toSentenceCase(category)})
									</li>
								))}
							</ul>
						</Alert>
					)}

					{/* List out the items the user is ordering */}
					{items.map((item, idx) => (
						<div
							key={idx}
							style={{ display: "flex", justifyContent: "space-between" }}
						>
							<div>
								<p className="font-medium">{item.name}</p>
								<p className="text-sm text-gray-500">
									{toSentenceCase(item.category)}
								</p>
							</div>
						</div>
					))}
				</DialogContent>

				<DialogActions>
					{/* Cancel or normal close */}
					{!outOfStockItems.length && <Button
						onClick={handleClose}
						color="inherit"
						disabled={status === "loading"}
					>
						Cancel
					</Button>}
					{outOfStockItems.length > 0 && (
						<Button
							onClick={cleanupOutOfStock}
							variant="outlined"
							color="primary"
							disabled={status === "loading"}
						>
							OK
						</Button>
					)}

					{/* Confirm button */}
					{!outOfStockItems.length && <Button
						onClick={handleConfirm}
						variant="contained"
						color="primary"
						disabled={status === "loading"}
					>
						{status === "loading" ? loadingIndicator : "Confirm"}
					</Button>}
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default OrderSummaryDialog;
