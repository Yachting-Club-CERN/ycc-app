import {Editor as EditorComponent} from '@tinymce/tinymce-react';
import React from 'react';

const prefix =
  '<!--\n' +
  '  Be careful when you edit the HTML code. Some elements are forbidden for\n' +
  '  security reasons, some others are not allowed in order to integrate best\n' +
  '  with the rest of the application.\n' +
  '\n' +
  '  !!! YOUR INPUT WILL BE SANITISED !!!\n' +
  '\n' +
  '  To avoid surprises, try to stick to the features provided by the editor.\n' +
  '-->\n';

type Props = {
  initialContent?: string | null;
  onBlur?: (html: string) => void;
  onInit?: (html: string) => void;
  onChange: (html: string) => void;
  height?: number | string;
  minHeight?: number | string;
  maxHeight?: number | string;
};

const RichTextEditor = ({
  initialContent,
  onBlur,
  onChange,
  onInit,
  height,
  minHeight,
  maxHeight,
}: Props) => {
  return (
    <EditorComponent
      tinymceScriptSrc={process.env.PUBLIC_URL + '/tinymce/tinymce.min.js'}
      initialValue={initialContent ? prefix + initialContent : prefix}
      init={{
        height: height,
        minHeight: minHeight,
        maxHeight: maxHeight,
        menubar: false,
        plugins: [
          'autolink',
          'code',
          'emoticons',
          'image',
          'link',
          'lists',
          'searchreplace',
        ],
        toolbar:
          'undo redo | bold italic underline strikethrough | blocks | outdent indent | bullist numlist | ' +
          'forecolor backcolor removeformat | image link emoticons | searchreplace code',
        block_formats: 'Paragraph=p;Header=h4;Header=h5;Header=h6',
        // TODO Image upload https://www.tiny.cloud/docs/plugins/opensource/image
        // images_upload_base_path
        // images_upload_credentials
        // images_upload_handler
      }}
      onBlur={(_, editor) => {
        if (onBlur) {
          onBlur(editor.getContent());
        }
      }}
      onEditorChange={onChange}
      onInit={(_, editor) => {
        if (onInit) {
          onInit(editor.getContent());
        }
      }}
    />
  );
};

export default RichTextEditor;
