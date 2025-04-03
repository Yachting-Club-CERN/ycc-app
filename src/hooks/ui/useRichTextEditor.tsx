import RichTextEditor from "@/components/ui/RichTextEditor";
import useDelayedRef from "@/hooks/utils/useDelayedRef";

type Props = Pick<
  React.ComponentProps<typeof RichTextEditor>,
  "minHeight" | "containerProps"
>;

const useRichTextEditor = (props: Props) => {
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
    get content() {
      return contentRef.get();
    },
    clearContent: () => {
      contentRef.setImmediately("");
    },
  };
};

export default useRichTextEditor;
