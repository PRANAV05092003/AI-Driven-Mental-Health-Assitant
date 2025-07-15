import { useAnimation, AnimationControls, Variants } from 'framer-motion';
import { useEffect } from 'react';

export type AnimationSequence = Array<{
  /**
   * The animation variant to apply
   */
  variant: string;
  
  /**
   * The duration to wait before starting this animation (in seconds)
   * @default 0
   */
  at?: number;
  
  /**
   * The duration of this animation (in seconds)
   * If not provided, the variant's transition duration will be used
   */
  duration?: number;
}>;

export interface UseAnimationOptions {
  /**
   * Whether the animation should play automatically when the component mounts
   * @default true
   */
  autoPlay?: boolean;
  
  /**
   * Whether the animation should loop
   * @default false
   */
  loop?: boolean;
  
  /**
   * The delay before starting the animation (in seconds)
   * @default 0
   */
  delay?: number;
  
  /**
   * Callback when the animation completes
   */
  onComplete?: () => void;
  
  /**
   * Callback when the animation starts
   */
  onStart?: () => void;
  
  /**
   * Callback when the animation is stopped
   */
  onStop?: () => void;
}

/**
 * A custom hook for managing Framer Motion animations
 * @param variants The animation variants to use
 * @param options Additional options for the animation
 * @returns Animation controls and helper functions
 */
function useAnimationVariants<T extends string>(
  variants: Variants,
  options: UseAnimationOptions = {}
) {
  const {
    autoPlay = true,
    loop = false,
    delay = 0,
    onComplete,
    onStart,
    onStop,
  } = options;
  
  const controls = useAnimation();
  
  // Play the animation when the component mounts
  useEffect(() => {
    if (autoPlay) {
      const playAnimation = async () => {
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay * 1000));
        }
        
        if (loop) {
          await controls.start('animate', {
            repeat: Infinity,
            repeatType: 'loop',
            onComplete,
            onStart,
            onStop,
          });
        } else {
          await controls.start('animate', {
            onComplete: () => {
              onComplete?.();
              if (loop) {
                controls.start('initial');
                controls.start('animate');
              }
            },
            onStart,
            onStop,
          });
        }
      };
      
      playAnimation();
    }
    
    return () => {
      controls.stop();
    };
  }, [controls, autoPlay, loop, delay, onComplete, onStart, onStop]);
  
  /**
   * Play a specific animation variant
   * @param variant The name of the variant to play
   * @param options Additional animation options
   */
  const play = useCallback(async (
    variant: T,
    options: {
      duration?: number;
      delay?: number;
      onComplete?: () => void;
      onStart?: () => void;
    } = {}
  ) => {
    const { duration, delay: variantDelay, onComplete: variantOnComplete, onStart: variantOnStart } = options;
    
    if (variantDelay && variantDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, variantDelay * 1000));
    }
    
    await controls.start(variant, {
      duration,
      onComplete: variantOnComplete,
      onStart: variantOnStart,
    });
    
    return controls;
  }, [controls]);
  
  /**
   * Play a sequence of animations
   * @param sequence The sequence of animations to play
   */
  const playSequence = useCallback(async (sequence: AnimationSequence) => {
    for (const { variant, at = 0, duration } of sequence) {
      if (at > 0) {
        await new Promise(resolve => setTimeout(resolve, at * 1000));
      }
      
      await controls.start(variant, { duration });
    }
  }, [controls]);
  
  /**
   * Reset the animation to its initial state
   */
  const reset = useCallback(() => {
    return controls.start('initial');
  }, [controls]);
  
  /**
   * Stop the current animation
   */
  const stop = useCallback(() => {
    return controls.stop();
  }, [controls]);
  
  return {
    controls,
    variants,
    play,
    playSequence,
    reset,
    stop,
  };
}

// Common animation variants
export const fadeInOut: Variants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeInOut' } 
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeInOut' } 
  },
};

export const slideUp: Variants = {
  initial: { y: 20, opacity: 0 },
  animate: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' } 
  },
  exit: { 
    y: 20, 
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' } 
  },
};

export const slideDown: Variants = {
  initial: { y: -20, opacity: 0 },
  animate: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' } 
  },
  exit: { 
    y: -20, 
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' } 
  },
};

export const slideLeft: Variants = {
  initial: { x: 20, opacity: 0 },
  animate: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' } 
  },
  exit: { 
    x: -20, 
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' } 
  },
};

export const slideRight: Variants = {
  initial: { x: -20, opacity: 0 },
  animate: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' } 
  },
  exit: { 
    x: 20, 
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' } 
  },
};

export const scaleInOut: Variants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: { duration: 0.2, ease: 'easeOut' } 
  },
  exit: { 
    scale: 0.95, 
    opacity: 0,
    transition: { duration: 0.15, ease: 'easeIn' } 
  },
};

export const rotateInOut: Variants = {
  initial: { rotate: -5, opacity: 0 },
  animate: { 
    rotate: 0, 
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' } 
  },
  exit: { 
    rotate: 5, 
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' } 
  },
};

// Re-export the original useAnimation for convenience
export { useAnimation };

export default useAnimationVariants;
