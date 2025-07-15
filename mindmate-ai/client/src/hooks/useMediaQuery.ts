import { useState, useEffect, useCallback } from 'react';

/**
 * A custom hook that tracks the result of a media query
 * @param query The media query string (e.g., '(min-width: 768px)')
 * @param defaultMatches The default value to return before the component mounts on the server
 * @returns A boolean indicating whether the media query matches
 */
function useMediaQuery(
  query: string,
  defaultMatches: boolean = false
): boolean {
  // Initialize state with the default value
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return defaultMatches;
  });

  // Update matches when the query changes
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia(query);
    
    // Update the state with the current match
    const updateMatches = () => {
      setMatches(mediaQuery.matches);
    };
    
    // Set the initial value
    updateMatches();
    
    // Add event listener for changes
    mediaQuery.addEventListener('change', updateMatches);
    
    // Clean up the event listener on unmount
    return () => {
      mediaQuery.removeEventListener('change', updateMatches);
    };
  }, [query]);

  return matches;
}

// Common media query helpers
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}

export function useIsSmallScreen(): boolean {
  return useMediaQuery('(max-width: 1023px)');
}

export function useIsLargeScreen(): boolean {
  return useMediaQuery('(min-width: 1280px)');
}

export function useIsPortrait(): boolean {
  return useMediaQuery('(orientation: portrait)');
}

export function useIsLandscape(): boolean {
  return useMediaQuery('(orientation: landscape)');
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

export function usePrefersDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

export function usePrefersLightMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: light)');
}

export function usePrefersContrastMore(): boolean {
  return useMediaQuery('(prefers-contrast: more)');
}

export function usePrefersContrastLess(): boolean {
  return useMediaQuery('(prefers-contrast: less)');
}

// Hook to get the current breakpoint name
export function useBreakpoint(): 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' {
  const isXS = useMediaQuery('(max-width: 639px)');
  const isSM = useMediaQuery('(min-width: 640px) and (max-width: 767px)');
  const isMD = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isLG = useMediaQuery('(min-width: 1024px) and (max-width: 1279px)');
  const isXL = useMediaQuery('(min-width: 1280px) and (max-width: 1535px)');
  const is2XL = useMediaQuery('(min-width: 1536px)');

  if (isXS) return 'xs';
  if (isSM) return 'sm';
  if (isMD) return 'md';
  if (isLG) return 'lg';
  if (isXL) return 'xl';
  return '2xl';
}

// Hook to check if the current viewport matches a specific breakpoint
export function useBreakpointIs(
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
): boolean {
  const currentBreakpoint = useBreakpoint();
  return currentBreakpoint === breakpoint;
}

// Hook to check if the current viewport is at least as large as the specified breakpoint
export function useBreakpointUp(
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
): boolean {
  const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
  const currentBreakpoint = useBreakpoint();
  const breakpointIndex = breakpoints.indexOf(breakpoint);
  const currentIndex = breakpoints.indexOf(currentBreakpoint);
  
  return currentIndex >= breakpointIndex;
}

// Hook to check if the current viewport is at most as large as the specified breakpoint
export function useBreakpointDown(
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
): boolean {
  const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
  const currentBreakpoint = useBreakpoint();
  const breakpointIndex = breakpoints.indexOf(breakpoint);
  const currentIndex = breakpoints.indexOf(currentBreakpoint);
  
  return currentIndex <= breakpointIndex;
}

export default useMediaQuery;
