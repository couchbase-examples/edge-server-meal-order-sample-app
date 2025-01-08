import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import OrderSummaryDialog from './OrderSummaryDialog';

const OrderSummary: React.FC = () => {
  const { totalPrice } = useSelector((state: RootState) => state.meal);
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-lg font-semibold">Order Total:</p>
        <p className="text-2xl font-bold">${totalPrice.toFixed(2)}</p>
      </div>
      <OrderSummaryDialog />
    </div>
  );
};

export default OrderSummary;