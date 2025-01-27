import {
	Alert,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { RootState, store } from "../store";
import { CartMeal } from "../store/mealSlice";
import { fetchEconomyInventory, updateEconomyInventory } from "../store/economyInventorySlice";
import { fetchBusinessInventory, updateBusinessInventory } from "../store/inventorySlice";
import { getOrCreateSeatId } from "../utils/createSeatId";
import { toSentenceCase } from "../utils/formatText";

interface OrderSummaryDialogProps {
	onOrderSuccess: () => void;
}

const OrderSummaryDialog: React.FC<OrderSummaryDialogProps> = ({
	onOrderSuccess,
}) => {
	const theme = useTheme();
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

	// Decide which action to dispatch
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
				const formattedItems = items.map((item: CartMeal) => ({
					id: item.mealId,
					category: item.category,
				}));

				// Update inventory using Redux action
				const resultAction = await dispatch(
					updateInventoryAction({
						items: formattedItems,
						seatUserId,
					})
				);

				// If successful
				if (updateInventoryAction.fulfilled.match(resultAction)) {
					// First update the inventory
					if (isEconomy) {
						await dispatch(fetchEconomyInventory()).unwrap();
					} else {
						await dispatch(fetchBusinessInventory()).unwrap();
					}
					
					// Then close dialog and trigger success
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

	if (items.length === 0) {
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
						borderRadius: '8px'
					}
				}}
			>
				<DialogTitle>Order Summary</DialogTitle>
				<DialogContent>
					{error && <Alert severity="error">{error}</Alert>}
					{items.map((item: CartMeal, idx: number) => (
						<div
							key={idx}
							style={{ display: "flex", justifyContent: "space-between" }}
						>
							<div>
								<p className="font-medium">{item.name}</p>
								<p className="text-sm text-gray-500">{toSentenceCase(item.category)}</p>
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
