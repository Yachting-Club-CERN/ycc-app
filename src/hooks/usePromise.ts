import { useEffect, useState } from "react";

type PromiseOutcome<T> = {
  readonly result: T | undefined;
  readonly error: unknown;
  readonly pending: boolean;
};

/**
 * Cancellable promise hook. Creates `useState()` and `useEffect()` hooks under the hood.
 *
 * @param promise promise
 * @param deps `useEffect()` dependencies, `undefined` is translated to `[]`
 * @returns object of promise result, promise error and pending (boolean)
 */
const usePromise = <T>(
  promise: (signal?: AbortSignal) => Promise<T>,
  deps?: React.DependencyList,
): PromiseOutcome<T> => {
  const [result, setResult] = useState<T>();
  const [error, setError] = useState<unknown>();
  const [pending, setPending] = useState(true);

  const doReset = (): void => {
    setResult(undefined);
    setError(undefined);
    setPending(true);
  };

  useEffect(() => {
    const abortController = new AbortController();
    doReset();

    promise(abortController.signal)
      .then((result) => {
        if (!abortController.signal.aborted) {
          setResult(result);
          setError(null);
          setPending(false);
        }
      })
      .catch((error: unknown) => {
        if (!abortController.signal.aborted) {
          setResult(undefined);
          setError(error);
          setPending(false);
        }
      });

    return (): void => {
      abortController.abort();
      doReset();
    };
  }, deps ?? []);

  return { result, error, pending };
};

export type { PromiseOutcome };
export default usePromise;
