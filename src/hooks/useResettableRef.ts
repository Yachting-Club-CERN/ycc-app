import { useRef } from "react";

type ResettableRef<T> = {
  current: T;
  reset: () => void;
};

const useResettableRef = <T>(initial: () => T): ResettableRef<T> => {
  const ref = useRef<T>(initial());
  const reset = (): void => {
    ref.current = initial();
  };

  return {
    get current(): T {
      return ref.current;
    },
    set current(value: T) {
      ref.current = value;
    },
    reset,
  };
};

export default useResettableRef;
