import {useRef} from 'react';

/**
 * This hook is used to delay the execution of a callback function.
 *
 * The delay is reset every time the returned function is called. It is useful to avoid lag when the user is typing.
 *
 * @param delayMs the delay in milliseconds
 * @param callback the callback function to be executed
 * @returns a function that can be used to trigger the callback with the specified delay
 */
const useDelay = <T>(delayMs: number, callback: (event: T) => void) => {
  const typingTimeout = useRef<number>();

  return (event: T) => {
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    typingTimeout.current = window.setTimeout(() => {
      callback(event);
    }, delayMs);
  };
};

export default useDelay;
