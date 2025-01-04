import React from 'react';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';

const Navbar: React.FC = () => {
  return (
    <nav className="flex items-center px-4 py-2 bg-cb-red text-white">
      <div className="flex items-center">
        <FlightTakeoffIcon className="mr-2" />
        <span className="font-bold text-lg">American Airlines</span>
      </div>
      <ul className="ml-auto flex space-x-4">
        <li>Home</li>
        <li>Profile</li>
      </ul>
    </nav>
  );
};

export default Navbar;