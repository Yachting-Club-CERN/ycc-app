import {Editor as EditorComponent} from '@tinymce/tinymce-react';
import React, {useRef, useState} from 'react';
import {Editor} from 'tinymce';

import ReadingFriendlyBox from '@app/components/ReadingFriendlyBox';
import {sanitiseHtmlForReact} from '@app/utils/html-utils';

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
const initialContent =
  prefix + '<p>This is the <strong>initial</strong> content of the editor.</p>';

const PlaygroundEditorPage = () => {
  const editorRef = useRef<Editor>();
  const [content, setContent] = useState<string | JSX.Element | JSX.Element[]>(
    ''
  );
  const log = () => {
    if (editorRef.current) {
      const content = editorRef.current.getContent();
      console.debug('Content', content);

      const sanitisedContent = sanitiseHtmlForReact(content);
      console.debug('Sanitised content', sanitisedContent);

      setContent(sanitisedContent);
    }
  };
  return (
    <>
      <EditorComponent
        tinymceScriptSrc={process.env.PUBLIC_URL + '/tinymce/tinymce.min.js'}
        onInit={(_, editor) => (editorRef.current = editor)}
        initialValue={initialContent}
        init={{
          height: 500,
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
        }}
      />
      <button onClick={log}>Log editor content</button>
      <ReadingFriendlyBox>{content}</ReadingFriendlyBox>
    </>
  );
};

export default PlaygroundEditorPage;
