// Mock component for development
export const EmptyState = ({ message }: { message: string }) => {
  return {
    render: () => `EmptyState: ${message}`,
  };
};