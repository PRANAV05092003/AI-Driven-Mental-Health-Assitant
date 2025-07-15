declare module '*.tsx' {
  import React from 'react';
  const Component: React.FC;
  export default Component;
}

declare module './NotFound' {
  import { FC } from 'react';
  const NotFound: FC;
  export default NotFound;
}
