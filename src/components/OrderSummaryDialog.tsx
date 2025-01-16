import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, store } from "../store";
import { resetOrder } from "../store/mealSlice";
import { updateBusinessInventory } from "../store/inventorySlice";
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

	const [isUpdate, setIsUpdate] = useState(false);

	// Check if this is an update to an existing order
	useEffect(() => {
		const confirmedOrder = localStorage.getItem('confirmed_order');
		setIsUpdate(!!confirmedOrder);
	}, []);

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
				// Save confirmed order to localStorage
				localStorage.setItem('confirmed_order', JSON.stringify(items));
				
				// Reset the order form
				dispatch(resetOrder());
				setOpen(false);
				onOrderSuccess();
			} else {
				throw resultAction.payload || resultAction.error;
			}
		} catch (error) {
			console.error("Failed to update inventory:", error);
		}
	};

	const handleReset = () => {
		dispatch(resetOrder());
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
				<DialogTitle>{isUpdate ? "Update Order" : "Order Summary"}</DialogTitle>
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
						) : isUpdate ? (
							"Update Order"
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
