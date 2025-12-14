import React from "react";

export type LayoutContextValue = {
  insideAdminLayout: boolean;
  isAdmin: boolean;
};

export const LayoutContext = React.createContext<LayoutContextValue>({ insideAdminLayout: false, isAdmin: false });

export const useLayoutContext = () => React.useContext(LayoutContext);

export default LayoutContext;
