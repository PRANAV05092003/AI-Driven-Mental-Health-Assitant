/// <reference types="react-scripts" />

// Add type declarations for CSS modules
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.sass' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.less' {
  const classes: { [key: string]: string };
  export default classes;
}

// Add type declarations for image files
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

// Add type declarations for font files
declare module '*.woff';
declare module '*.woff2';
declare module '*.eot';
declare module '*.ttf';
declare module '*.otf';

// Add type declarations for audio files
declare module '*.mp3';
declare module '*.wav';
declare module '*.ogg';

// Add type declarations for video files
declare module '*.mp4';
declare module '*.webm';

// Add type declarations for 3D model files
declare module '*.glb';
declare module '*.gltf';

// Add type declarations for environment variables
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    REACT_APP_API_URL: string;
    REACT_APP_GOOGLE_CLIENT_ID?: string;
    REACT_APP_FACEBOOK_APP_ID?: string;
    REACT_APP_STRIPE_PUBLIC_KEY?: string;
    REACT_APP_SENTRY_DSN?: string;
    REACT_APP_GA_TRACKING_ID?: string;
  }
}
