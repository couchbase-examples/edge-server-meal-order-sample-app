import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { removeMeal } from "../store/mealSlice";

const Cart: React.FC = () => {
	const dispatch = useDispatch();
	const { items } = useSelector((state: RootState) => state.meal);

	const handleRemove = (mealName: string) => {
		dispatch(removeMeal(mealName));
	};

	return (
		<div>
			<h2 className="text-xl font-semibold mb-4">Your Cart</h2>
			{items.length === 0 ? (
				<p className="text-gray-500">No meals in your cart</p>
			) : (
				<ul className="space-y-2">
					{items.map((item, index) => (
						<li
							key={index}
							className="flex justify-between items-center p-2 border-b"
						>
							<div>
								<p className="font-medium">{item.name}</p>
								<p className="text-sm text-gray-500">{item.category}</p>
							</div>
							<button
								className="text-red-600 hover:underline"
								onClick={() => handleRemove(item.name)}
							>
								Remove
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default Cart;
