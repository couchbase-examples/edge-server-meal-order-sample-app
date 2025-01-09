import React, { useState } from "react";
import OrderSummaryDialog from "./OrderSummaryDialog";
import { Snackbar, Alert, Slide } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";

// Slide transition component
const SlideTransition = React.forwardRef(function SlideTransition(
	props: TransitionProps & { children: React.ReactElement },
	ref: React.Ref<unknown>
) {
	return <Slide direction="up" {...props} ref={ref} />;
});

const OrderSummary: React.FC = () => {
	// const { totalPrice } = useSelector((state: RootState) => state.meal);
	const [snackbarOpen, setSnackbarOpen] = useState(false);

	const handleSnackbarClose = (
		event?: React.SyntheticEvent | Event,
		reason?: string
	) => {
		if (reason === "clickaway") {
			return;
		}
		setSnackbarOpen(false);
	};

	return (
		<div className="flex items-center justify-between">
			{/* Order Summary Section */}
			<div>
				{/* Uncomment and use this if you have a total price */}
				{/* <p className="text-lg font-semibold">Order Total:</p>
				<p className="text-2xl font-bold">${totalPrice.toFixed(2)}</p> */}
			</div>

			{/* Buttons Section */}
			<div className="flex items-center space-x-4 ml-auto">
				<OrderSummaryDialog onOrderSuccess={() => setSnackbarOpen(true)} />
			</div>

			{/* Success Snackbar */}
			<Snackbar
				open={snackbarOpen}
				autoHideDuration={4000}
				onClose={handleSnackbarClose}
				TransitionComponent={SlideTransition}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			>
				<Alert
					onClose={handleSnackbarClose}
					severity="success"
					variant="filled"
					sx={{ width: "100%" }}
				>
					Your order has been placed successfully! 🎉
				</Alert>
			</Snackbar>
		</div>
	);
};

export default OrderSummary;