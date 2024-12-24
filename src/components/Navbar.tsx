import React from 'react';
import { FaUtensils } from 'react-icons/fa';

const Navbar: React.FC = () => {
  return (
    <nav className="flex items-center px-4 py-2 bg-cb-red text-white">
      <div className="flex items-center">
        <FaUtensils size={24} className="mr-2" />
        <span className="font-bold text-lg">Aircraft Catering</span>
      </div>
      <ul className="ml-auto flex space-x-4">
        <li>Home</li>
        <li>Menu</li>
        <li>Profile</li>
      </ul>
    </nav>
  );
};

export default Navbar;