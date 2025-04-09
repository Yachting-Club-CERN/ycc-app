import { useState } from "react";

import useDelay from "./useDelay";

/**
 * This hook is creates a state pair, from which one reflects changes immediately and one with a delay.
 *
 * This is particularly useful when one needs to reflect changes immediately on a form, but also wants to avoid e.g., grid filtering lag when the user is typing.
 *
 * @param initialState the initial state
 * @param delay the delay in milliseconds
 * @returns an array containing the state pair and setters
 */
const useDelayedState = <S>(
  initialState: S | (() => S),
  delay = 500,
): readonly [S, S, (newState: S) => void, (newState: S) => void] => {
  const [state, setState] = useState(initialState);
  const [delayedState, setDelayedState] = useState(state);
  const setDelayedStateWithDelay = useDelay(delay, setDelayedState);

  const setImmediately = (newState: S): void => {
    setState(newState);
    setDelayedState(newState);
  };
  const setWithDelay = (newState: S): void => {
    setState(newState);
    setDelayedStateWithDelay(newState);
  };

  return [state, delayedState, setImmediately, setWithDelay] as const;
};

export default useDelayedState;
