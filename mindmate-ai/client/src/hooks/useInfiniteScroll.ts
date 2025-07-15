import { useState, useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions<T> {
  /**
   * The initial data to display
   */
  initialData?: T[];
  
  /**
   * The initial page number
   * @default 1
   */
  initialPage?: number;
  
  /**
   * The number of items to load per page
   * @default 10
   */
  pageSize?: number;
  
  /**
   * Whether there are more items to load
   */
  hasMore?: boolean;
  
  /**
   * The threshold in pixels before the end of the list to trigger loading more items
   * @default 200
   */
  threshold?: number;
  
  /**
   * The scrollable element (defaults to window)
   */
  scrollElement?: HTMLElement | null;
  
  /**
   * Callback when more items should be loaded
   */
  onLoadMore: (page: number, pageSize: number) => Promise<T[]> | T[] | void;
  
  /**
   * Callback when the scroll position changes
   */
  onScroll?: (scrollTop: number) => void;
  
  /**
   * Whether to load the first page automatically
   * @default true
   */
  loadOnMount?: boolean;
  
  /**
   * Whether to reset the data when the component unmounts
   * @default false
   */
  resetOnUnmount?: boolean;
}

interface InfiniteScrollState<T> {
  /**
   * The current page number
   */
  page: number;
  
  /**
   * Whether more items are being loaded
   */
  isLoading: boolean;
  
  /**
   * Whether there are more items to load
   */
  hasMore: boolean;
  
  /**
   * The loaded items
   */
  items: T[];
  
  /**
   * Any error that occurred while loading
   */
  error: Error | null;
  
  /**
   * Whether this is the initial load
   */
  isInitialLoad: boolean;
}

/**
 * A custom hook for implementing infinite scroll functionality
 * @param options Configuration options for the infinite scroll
 * @returns An object containing the scroll state and control functions
 */
function useInfiniteScroll<T>({
  initialData = [],
  initialPage = 1,
  pageSize = 10,
  hasMore: initialHasMore = true,
  threshold = 200,
  scrollElement,
  onLoadMore,
  onScroll,
  loadOnMount = true,
  resetOnUnmount = false,
}: UseInfiniteScrollOptions<T>) {
  const [state, setState] = useState<InfiniteScrollState<T>>({
    page: initialPage,
    isLoading: false,
    hasMore: initialHasMore,
    items: initialData,
    error: null,
    isInitialLoad: true,
  });
  
  const { page, isLoading, hasMore, items, isInitialLoad } = state;
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<boolean>(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLElement | Window | null>(null);
  
  // Load more items
  const loadMore = useCallback(async () => {
    // Don't load if already loading or no more items
    if (loadingRef.current || !hasMore) return;
    
    try {
      loadingRef.current = true;
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Call the onLoadMore callback
      const newItems = await onLoadMore(page, pageSize);
      
      if (Array.isArray(newItems)) {
        // Determine if there are more items to load
        const moreItemsAvailable = newItems.length >= pageSize;
        
        setState(prev => ({
          ...prev,
          page: prev.page + 1,
          items: prev.isInitialLoad ? newItems : [...prev.items, ...newItems],
          hasMore: moreItemsAvailable,
          isInitialLoad: false,
        }));
      }
    } catch (error) {
      console.error('Error loading more items:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to load more items'),
      }));
    } finally {
      loadingRef.current = false;
      setState(prev => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, [page, pageSize, hasMore, onLoadMore]);
  
  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (isLoading || !hasMore) return;
    
    const container = scrollContainerRef.current;
    if (!container) return;
    
    // Get scroll position
    let scrollTop = 0;
    let scrollHeight = 0;
    let clientHeight = 0;
    
    if (container === window) {
      scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      clientHeight = window.innerHeight;
    } else {
      const element = container as HTMLElement;
      scrollTop = element.scrollTop;
      scrollHeight = element.scrollHeight;
      clientHeight = element.clientHeight;
    }
    
    // Call the onScroll callback if provided
    onScroll?.(scrollTop);
    
    // Check if we've scrolled to the threshold
    const scrolledToBottom = scrollTop + clientHeight >= scrollHeight - threshold;
    
    if (scrolledToBottom && !isLoading && hasMore) {
      loadMore();
    }
  }, [isLoading, hasMore, threshold, loadMore, onScroll]);
  
  // Set up intersection observer for the sentinel element
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      // Fallback to scroll event if IntersectionObserver is not supported
      return () => {};
    }
    
    const options = {
      root: scrollElement ? scrollElement : null,
      rootMargin: `${threshold}px`,
      threshold: 0.1,
    };
    
    const callback: IntersectionObserverCallback = (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && !isLoading && hasMore) {
        loadMore();
      }
    };
    
    observer.current = new IntersectionObserver(callback, options);
    const sentinel = sentinelRef.current;
    
    if (sentinel) {
      observer.current.observe(sentinel);
    }
    
    return () => {
      if (observer.current && sentinel) {
        observer.current.unobserve(sentinel);
      }
    };
  }, [isLoading, hasMore, loadMore, scrollElement, threshold]);
  
  // Set up scroll event listener if IntersectionObserver is not available
  useEffect(() => {
    const container = scrollElement || window;
    scrollContainerRef.current = container;
    
    if (!('IntersectionObserver' in window)) {
      container.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    return () => {
      if (!('IntersectionObserver' in window)) {
        container.removeEventListener('scroll', handleScroll);
      }
      
      if (resetOnUnmount) {
        setState({
          page: initialPage,
          isLoading: false,
          hasMore: initialHasMore,
          items: initialData,
          error: null,
          isInitialLoad: true,
        });
      }
    };
  }, [scrollElement, handleScroll, resetOnUnmount, initialPage, initialHasMore, initialData]);
  
  // Load initial data
  useEffect(() => {
    if (loadOnMount && isInitialLoad) {
      loadMore();
    }
  }, [loadOnMount, isInitialLoad, loadMore]);
  
  // Reset the state
  const reset = useCallback(() => {
    setState({
      page: initialPage,
      isLoading: false,
      hasMore: initialHasMore,
      items: initialData,
      error: null,
      isInitialLoad: true,
    });
  }, [initialPage, initialHasMore, initialData]);
  
  // Append new items to the list
  const appendItems = useCallback((newItems: T[]) => {
    if (!newItems.length) return;
    
    setState(prev => ({
      ...prev,
      items: [...prev.items, ...newItems],
    }));
  }, []);
  
  // Prepend new items to the list (useful for chat applications)
  const prependItems = useCallback((newItems: T[]) => {
    if (!newItems.length) return;
    
    setState(prev => ({
      ...prev,
      items: [...newItems, ...prev.items],
    }));
  }, []);
  
  // Update a single item in the list
  const updateItem = useCallback((predicate: (item: T) => boolean, updater: (item: T) => T) => {
    setState(prev => ({
      ...prev,
      items: prev.items.map(item => (predicate(item) ? updater(item) : item)),
    }));
  }, []);
  
  // Remove an item from the list
  const removeItem = useCallback((predicate: (item: T) => boolean) => {
    setState(prev => ({
      ...prev,
      items: prev.items.filter(item => !predicate(item)),
    }));
  }, []);
  
  // Set items directly
  const setItems = useCallback((newItems: T[]) => {
    setState(prev => ({
      ...prev,
      items: newItems,
    }));
  }, []);
  
  // The sentinel element that triggers loading when it comes into view
  const sentinel = <div ref={sentinelRef} style={{ height: 1, width: '100%' }} aria-hidden="true" />;
  
  return {
    // State
    items,
    isLoading,
    hasMore,
    error,
    page,
    isInitialLoad,
    
    // Refs
    sentinelRef,
    
    // Actions
    loadMore,
    reset,
    appendItems,
    prependItems,
    updateItem,
    removeItem,
    setItems,
    
    // Components
    sentinel,
    
    // For debugging
    state,
  };
}

export default useInfiniteScroll;
