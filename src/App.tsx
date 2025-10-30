// Mock app component for development
export const App = () => {
  return {
    render: () => {
      // Simple routing for development
      const path = window.location.pathname;
      
      if (path === '/') {
        return 'Home page';
      } else if (path.startsWith('/wish/')) {
        const id = parseInt(path.split('/')[2]);
        return `Wish Detail page for ID: ${id}`;
      } else if (path === '/admin') {
        return 'Admin page';
      } else {
        return 'Home page';
      }
    },
  };
};