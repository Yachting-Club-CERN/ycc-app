import Box from '@mui/material/Box';
import React, {useState} from 'react';

import PageTitle from '@app/components/PageTitle';
import ReadingFriendlyBox from '@app/components/ReadingFriendlyBox';
import RichTextEditor from '@app/components/RichTextEditor';
import SpacedTypography from '@app/components/SpacedTypography';
import {sanitiseHtmlForReact} from '@app/utils/html-utils';

const initialContent =
  '<p>This is the <strong>initial</strong> content of the editor.</p>';

const PlaygroundEditorPage = () => {
  const [html, setHtml] = useState(initialContent);

  console.debug('HTML', html);
  const content = sanitiseHtmlForReact(html);
  console.debug('Sanitised content', content);

  return (
    <ReadingFriendlyBox>
      <PageTitle value="Playground: Editor" />
      <Box mt={2}>
        <RichTextEditor
          initialContent={initialContent}
          onChange={setHtml}
          minHeight={200}
          maxHeight={800}
        />
      </Box>
      <SpacedTypography variant="h3">
        ... See the result below ...
      </SpacedTypography>
      {content}
    </ReadingFriendlyBox>
  );
};

export default PlaygroundEditorPage;
