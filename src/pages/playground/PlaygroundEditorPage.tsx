import Box from "@mui/material/Box";
import { useState } from "react";

import ReadingFriendlyBox from "@/components/layout/ReadingFriendlyBox";
import PageTitle from "@/components/ui/PageTitle";
import RichTextEditor from "@/components/ui/RIchTextEditor/RichTextEditor";
import SpacedTypography from "@/components/ui/SpacedTypography";
import { sanitiseHtmlForReact } from "@/utils/html-utils";

const initialContent =
  "<p>This is the <strong>initial</strong> content of the editor.</p>";

const PlaygroundEditorPage = () => {
  const [html, setHtml] = useState(initialContent);

  console.debug("HTML", html);
  const content = sanitiseHtmlForReact(html);
  console.debug("Sanitised content", content);

  return (
    <ReadingFriendlyBox>
      <PageTitle value="Playground: Editor" />
      <Box mt={2}>
        <RichTextEditor
          placeholder="Demo placeholder..."
          initialContent={initialContent}
          minHeight={200}
          onUpdate={setHtml}
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
