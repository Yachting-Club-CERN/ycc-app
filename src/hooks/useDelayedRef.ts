import { useRef } from "react";

import useDelay from "./useDelay";

/**
 * This hook is used to create a reference with a getter/setter/delayed setter.
 *
 * @param initialValue the initial value
 * @param delay the delay in milliseconds
 * @returns an object containing the getter, the setter and the delayed setter
 */
const useDelayedRef = <T>(
  initialValue: T,
  delay = 500,
): {
  get: () => T;
  setImmediately: (value: T) => void;
  setWithDelay: (value: T) => void;
} => {
  const ref = useRef(initialValue);
  const get = (): T => ref.current;
  const setImmediately = (value: T): void => {
    ref.current = value;
  };
  const setWithDelay = useDelay(delay, setImmediately);

  return {
    get,
    setImmediately,
    setWithDelay,
  };
};

export default useDelayedRef;
