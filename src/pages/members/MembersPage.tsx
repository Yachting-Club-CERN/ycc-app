import Box from '@mui/material/Box';
import Input from '@mui/material/Input';
import Typography from '@mui/material/Typography';
import React, {useRef, useState} from 'react';

import PageTitle from '@app/components/PageTitle';

import MembersDataGrid from './MembersDataGrid';

const MembersPage = () => {
  const [search, setSearch] = useState<string>('');
  const currentYear = new Date().getFullYear();
  const typingTimeout = useRef<number>();

  const onSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    typingTimeout.current = window.setTimeout(() => {
      setSearch(event.target.value);
    }, 100);
  };

  return (
    <>
      <PageTitle
        value={`Active Members (${currentYear})`}
        mobileValue={`Members (${currentYear})`}
      />

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1rem',
        }}
      >
        <Typography>Search:</Typography>
        <Input onChange={onSearch} />
      </Box>

      <MembersDataGrid year={currentYear} search={search} />
    </>
  );
};

export default MembersPage;
