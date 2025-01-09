// OrderSummaryDialog.tsx
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { resetOrder } from "../store/mealSlice";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Typography,
} from "@mui/material";

interface OrderSummaryDialogProps {
	onOrderSuccess: () => void;
}

const OrderSummaryDialog: React.FC<OrderSummaryDialogProps> = ({
	onOrderSuccess,
}) => {
	const dispatch = useDispatch();
	const { items } = useSelector((state: RootState) => state.meal);

	// Controls whether the dialog is open
	const [open, setOpen] = useState(false);

	const handleOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	const handleConfirm = () => {
		// Here you could also call an API endpoint for final order submission
		dispatch(resetOrder());
		setOpen(false);
		// Trigger the success callback
		onOrderSuccess();
	};

	const handleReset = () => {
		dispatch(resetOrder());
	};

	// If no items in the cart, hide the "Confirm Order" button entirely
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
					Confirm Order
				</Button>
				<Button onClick={handleReset} className="bg-gray-200 px-4 py-2 rounded">
					Reset
				</Button>
			</div>

			<Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
				<DialogTitle>Order Summary</DialogTitle>
				<DialogContent>
					{items.map((item, idx) => (
						<Typography key={idx}>
							{item.name}
						</Typography>
					))}
					{/* <Typography fontWeight="bold" variant="body1">
						Total: ${totalPrice.toFixed(2)}
					</Typography> */}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} color="inherit">
						Cancel
					</Button>
					<Button onClick={handleConfirm} variant="contained" color="primary">
						Confirm
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default OrderSummaryDialog;
