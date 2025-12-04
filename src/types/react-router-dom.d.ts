/**
 * Augment React Router types to include v7 future flags that are not yet in
 * the published @types/react-router-dom. These flags are supported at runtime
 * by react-router-dom but the TypeScript definitions haven't caught up yet.
 */

import 'react-router-dom';

declare module 'react-router-dom' {
  interface FutureConfig {
    /**
     * Enable wrapping route state updates in React.startTransition.
     * This is a breaking change for v7. Opt in now to test the new behavior.
     * @see https://reactrouter.com/v6/upgrading/future#v7_starttransition
     */
    v7_startTransition?: boolean;

    /**
     * Enable relative route resolution within splat routes.
     * This is a breaking change for v7. Opt in now to test the new behavior.
     * @see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath
     */
    v7_relativeSplatPath?: boolean;
  }
}
