"use client"
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

interface SearchIconProps {
  onClick: () => void;
}

const SearchIcon: React.FC<SearchIconProps> = ({ onClick }) => (
  <div onClick={onClick} className="cursor-pointer">
    <FontAwesomeIcon icon={faSearch} style={{ fontSize: '24px' }}/>
  </div>
);

export default SearchIcon;
