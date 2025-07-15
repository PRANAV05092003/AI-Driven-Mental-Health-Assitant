import { useContext } from 'react';
import { ThemeContext, type ThemeContextType } from '../context/ThemeContext';

/**
 * Custom hook to access the theme context
 * @returns ThemeContextType with theme, resolvedTheme, and theme methods
 * @throws Error if used outside of a ThemeProvider
 */
const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

export default useTheme;

// Re-export types for convenience
export type { Theme } from '../context/ThemeContext';
