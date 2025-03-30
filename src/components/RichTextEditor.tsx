import Box from "@mui/material/Box";
import Heading from "@tiptap/extension-heading";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import PlaceHolder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  LinkBubbleMenu,
  LinkBubbleMenuHandler,
  MenuButtonAddImage,
  MenuButtonBold,
  MenuButtonBulletedList,
  MenuButtonEditLink,
  MenuButtonHighlightToggle,
  MenuButtonItalic,
  MenuButtonOrderedList,
  MenuButtonRedo,
  MenuButtonRemoveFormatting,
  MenuButtonStrikethrough,
  MenuButtonUnderline,
  MenuButtonUndo,
  MenuControlsContainer,
  MenuDivider,
  MenuSelectHeading,
  ResizableImage,
  RichTextEditorProvider,
  RichTextField,
} from "mui-tiptap";

const DEFAULT_IMAGE_WIDTH = 400;

type Props = {
  placeholder?: string;
  initialContent?: string;
  minHeight?: number | string;
  onBlur?: (html: string) => void;
  onCreate?: (html: string) => void;
  onUpdate: (html: string) => void;
};

const RichTextEditor = ({
  initialContent,
  placeholder,
  minHeight,
  onBlur,
  onCreate,
  onUpdate,
}: Props) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        blockquote: false,
        code: false,
        codeBlock: false,
        heading: false,
        horizontalRule: false,
      }),
      Heading.configure({ levels: [4, 5, 6] }),
      Underline,
      Highlight,
      Link.configure({ defaultProtocol: "https" }),
      ResizableImage,
      LinkBubbleMenuHandler,
      PlaceHolder.configure({
        placeholder: placeholder,
      }),
    ],
    content: initialContent,
    onBlur: ({ editor }) => onBlur?.(editor.getHTML()),
    onCreate: ({ editor }) => onCreate?.(editor.getHTML()),
    onUpdate: ({ editor }) => onUpdate(editor.getHTML()),
  });

  const handleAddImageClick = () => {
    const url = window.prompt("Image URL:");
    if (!editor || !url) {
      return;
    }

    editor.chain().focus().setImage({ src: url }).run();

    // Wait for the image to be added to the DOM before updating its attributes
    setTimeout(() => {
      editor
        .chain()
        .focus()
        .updateAttributes("image", {
          width: DEFAULT_IMAGE_WIDTH,
        })
        .run();
    }, 0);
  };

  return (
    <Box sx={{ "& .ProseMirror": { minHeight } }}>
      <RichTextEditorProvider editor={editor}>
        <RichTextField
          controls={
            <MenuControlsContainer>
              <MenuButtonUndo />
              <MenuButtonRedo />
              <MenuDivider />

              <MenuButtonBold />
              <MenuButtonItalic />
              <MenuButtonUnderline />
              <MenuButtonStrikethrough />
              <MenuDivider />

              <MenuSelectHeading
                labels={{
                  paragraph: "Paragraph",
                  heading4: "Heading",
                  heading5: "Heading",
                  heading6: "Heading",
                }}
              />
              <MenuDivider />

              <MenuButtonBulletedList />
              <MenuButtonOrderedList />
              <MenuDivider />

              <MenuButtonHighlightToggle />
              <MenuDivider />

              <MenuButtonAddImage onClick={handleAddImageClick} />
              <MenuButtonEditLink />
              <MenuDivider />

              <MenuButtonRemoveFormatting />
            </MenuControlsContainer>
          }
        />
        <LinkBubbleMenu />
      </RichTextEditorProvider>
    </Box>
  );
};

export default RichTextEditor;
