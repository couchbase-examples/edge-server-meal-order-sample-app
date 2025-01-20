import {
	Alert,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
} from "@mui/material";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, store } from "../store";
import { updateBusinessInventory } from "../store/inventorySlice";
import { syncCartWithServer } from "../store/mealSlice";
import { getOrCreateSeatId } from "../utils/createSeatId";

interface OrderSummaryDialogProps {
	onOrderSuccess: () => void;
}

const OrderSummaryDialog: React.FC<OrderSummaryDialogProps> = ({
	onOrderSuccess,
}) => {
	const dispatch = useDispatch<typeof store.dispatch>();
	const { items } = useSelector((state: RootState) => state.meal);
	const { status, error } = useSelector((state: RootState) => state.inventory);
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

			const resultAction = await dispatch(
				updateBusinessInventory({
					items: formattedItems,
					seatUserId,
				})
			);

			if (updateBusinessInventory.fulfilled.match(resultAction)) {
				// Sync with server to update confirmed order
				await dispatch(syncCartWithServer(items));
				
				// Close dialog
				setOpen(false);
				onOrderSuccess();
			} else {
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
		<div className="my-4 flex justify-end">
			<Button
				variant="contained"
				color="primary"
				onClick={handleOpen}
				style={{ marginRight: "8px" }}
			>
				Confirm Selection
			</Button>

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
						{status === "loading" ? (
							<CircularProgress size={24} />
						) : (
							"Confirm Order"
						)}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default OrderSummaryDialog;
