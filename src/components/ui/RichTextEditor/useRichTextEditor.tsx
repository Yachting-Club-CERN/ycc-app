import { JSX } from "react";

import useDelayedRef from "@/hooks/useDelayedRef";

import RichTextEditor from "./RichTextEditor";

type Props = Pick<
  React.ComponentProps<typeof RichTextEditor>,
  "minHeight" | "containerProps"
>;

const useRichTextEditor = (
  props: Props,
): {
  component: JSX.Element;
  content: string;
  clearContent: () => void;
} => {
  const contentRef = useDelayedRef("");

  return {
    component: (
      <RichTextEditor
        {...props}
        onBlur={contentRef.setImmediately}
        onCreate={contentRef.setImmediately}
        onUpdate={contentRef.setWithDelay}
      />
    ),
    get content(): string {
      return contentRef.get();
    },
    clearContent: (): void => contentRef.setImmediately(""),
  };
};

export default useRichTextEditor;
