// Mock component for development
export const SearchBar = ({ onSearch }: { onSearch: (query: string) => void }) => {
  return {
    render: () => 'SearchBar Component',
  };
};