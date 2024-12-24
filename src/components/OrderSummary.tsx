import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { resetOrder } from '../store/mealSlice';

const OrderSummary: React.FC = () => {
  const dispatch = useDispatch();
  const { totalPrice } = useSelector((state: RootState) => state.meal);

  const handleReset = () => {
    dispatch(resetOrder());
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-lg font-semibold">Order Total:</p>
        <p className="text-2xl font-bold">${totalPrice.toFixed(2)}</p>
      </div>
      <div>
        <button onClick={handleReset} className="bg-gray-200 px-4 py-2 mr-4 rounded">
          Reset
        </button>
        <button className="bg-cb-red text-white px-4 py-2 rounded">
          Confirm Order
        </button>
      </div>
    </div>
  );
};

export default OrderSummary;