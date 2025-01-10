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

	const [open, setOpen] = useState(false);

	const handleOpen = () => {
		setOpen(true);
	};
	const handleClose = () => {
		setOpen(false);
	};
	const handleConfirm = () => {
		dispatch(resetOrder());
		setOpen(false);
		onOrderSuccess();
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
				<DialogTitle>Order Summary</DialogTitle>
				<DialogContent>
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
