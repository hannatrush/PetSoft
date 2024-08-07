'use client';

import { createContext, useState } from 'react';

type SearchContextProviderProps = {
  children: React.ReactNode;
};

type TSearchContext = {
  searchQuery: string;
  handleChangeSearchQuery: (newValue: string) => void;
};

export const SearchContext = createContext<TSearchContext | null>(null);

const SearchContextProvider = ({ children }: SearchContextProviderProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleChangeSearchQuery = (newValue: string) => {
    setSearchQuery(newValue);
  };

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        handleChangeSearchQuery,
      }}>
      {children}
    </SearchContext.Provider>
  );
};

export default SearchContextProvider;
