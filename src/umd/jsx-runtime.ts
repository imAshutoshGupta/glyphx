// Stand-in for react/jsx-runtime in the UMD build, which only has the React
// and ReactDOM globals to work with: there is no global for the JSX runtime.
// Maps the automatic JSX runtime onto React.createElement, which works with
// React 18's UMD build (React 19 ships no UMD builds).
import { createElement, Fragment, type ElementType, type ReactNode } from "react";

export { Fragment };

type Props = Record<string, unknown> & { children?: unknown };

const withKey = (props: Props, key?: string) =>
  key === undefined ? props : { ...props, key };

// One child, or a dynamic list (whose items carry their own keys).
export function jsx(type: ElementType, props: Props, key?: string) {
  return createElement(type, withKey(props, key));
}

// Several fixed children, as in <a><b /><c /></a>. Passed as separate
// arguments, as classic JSX does, so React doesn't treat them as an unkeyed
// list and warn about missing keys.
export function jsxs(type: ElementType, props: Props, key?: string) {
  const { children, ...rest } = props;
  return createElement(type, withKey(rest, key), ...(children as ReactNode[]));
}
