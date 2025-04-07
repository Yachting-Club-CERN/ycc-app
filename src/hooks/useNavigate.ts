import { useNavigate as useReactNavigate } from "react-router-dom";

/**
 * A custom navigation hook that wraps `useNavigate` and adds support for
 * modifier keys similar to standard browser interactions:
 *
 * - **Ctrl+Click** / **Middle Click** opens the route in a new background tab.
 * - **Shift+Click** opens the route in a new popup window.
 * - **Default** behavior performs in-app navigation using `react-router`'s `navigate`.
 *
 * @returns A function that navigates to the given `location`, supporting modifier keys.
 */
export const useNavigate = () => {
  const navigate = useReactNavigate();

  return async (
    location: string,
    event?: React.MouseEvent<HTMLElement>,
  ): Promise<void> => {
    // Not an <a> but good enough
    // event.button === 1 is a middle click
    // For onClick events it is only accessible here if onMouseDown called event.preventDefault()
    if (event?.ctrlKey || event?.button === 1) {
      // Note: blur/focus might not work depending on the browser
      window.open(location, "_blank")?.blur(); //NOSONAR
      window.focus();
    } else if (event?.shiftKey) {
      // https://stackoverflow.com/a/726803
      window.open(
        location,
        "_blank",
        `height=${window.innerHeight},width=${window.innerWidth})`,
      );
    } else {
      await navigate(location);
    }
  };
};
