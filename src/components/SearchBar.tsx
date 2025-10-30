// Mock component for development
export const SearchBar = ({ onSearch }: { onSearch: (_query: string) => void }) => {
  return {
    render: () => 'SearchBar Component',
  };
};