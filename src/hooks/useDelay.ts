import { useCallback, useEffect, useRef } from "react";

/**
 * This hook is used to delay (debounce) the execution of a callback function.
 *
 * The delay is reset every time the returned function is called. It is useful to avoid lag when the user is typing.
 *
 * @param delayMs the delay in milliseconds
 * @param callback the callback function to be executed
 * @returns a function that can be used to trigger the callback with the specified delay
 */
const useDelay = <T>(delayMs: number, callback: (event: T) => void) => {
  const timeout = useRef<number>(undefined);

  const delayed = useCallback(
    (event: T) => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }

      timeout.current = window.setTimeout(() => {
        callback(event);
      }, delayMs);
    },
    [callback, delayMs],
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, []);

  return delayed;
};

export default useDelay;
