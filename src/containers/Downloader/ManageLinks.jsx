import React from 'react';
import {useState, useEffect} from 'react';
import { Box, Typography, Button, TextField, Paper, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import Icon from '@mui/material/Icon';
import Split from '@uiw/react-split';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';


const ManageLinks = () => {
  const [links, setLinks] = useState([]);
  const [curLink, setCurLink] = useState('');
  const [downloaded, setDownloaded] = useState([]);
  const [format, setFormat] = useState(['mp3']);

  const handleAddLink = () => {
    const tempLinks = [...links];
    tempLinks.push(curLink);
    setLinks(tempLinks);
    setCurLink('');
  }

  const downloadAll = async () => {
    console.log('Downloading ', links);
    setDownloaded((prev) => [...prev, {text:`Started Download`}])
    window.electron.ipcRenderer.send('download-videos', {links: links, format: format[0]});
  }

  const handleFormatChange = (event, newFormats) => {
    if (newFormats !== null) {
       // If MP3 is selected and MP4 is already selected, remove MP4
      if (newFormats.includes('mp3') && format.includes('mp4')) {
        newFormats = ['mp3'];
      }
      // If MP4 is selected and MP3 is already selected, remove MP3
      else if (newFormats.includes('mp4') && format.includes('mp3')) {
        newFormats = ['mp4'];
      }

      setFormat(newFormats);
    };
  }

  const clearAll = () => {
    setLinks([]);
    setDownloaded([]);
  }

  useEffect(() => {
    window.electron.ipcRenderer.on('download-status', (data) => {
      setDownloaded((prev) => [...prev, {text:`${data.title} ${data.status}`, status: 'done'}]);
    });
  }, []);

  return (
    <>
      {/* Textfield and button for adding links */}
      <Box sx={{gap: 1}} className='link-form'>
        <TextField
          label="URL"
          size="small"
          variant="outlined"
          value={curLink}
          onChange={(e) => {setCurLink(e.target.value)}}
          fullWidth
        />
        <Button
          variant="outlined"
          color="primary"
          className='btn'
          startIcon={<AddIcon />}
          onClick={handleAddLink}
        >Add Link</Button>
      </Box>


    <Box className='data-body'>
      <Split
        mode="horizontal" // or "vertical"
      >
        <Box className='grid-col-50 left'>
          <Typography h3 id='videos-header'>Videos</Typography>
          {links.map((l, index) => {
            return ( 
              <p key={'link-'+index}>
                <a href={l} className='line-item link'>{l}</a>
              </p>
            );
          })}
        </Box>
        <Box className='grid-col-50'>
          <Typography h3 id='downloads-header'>Downloads</Typography>
          <div className="downloads-container">
            {downloaded.map((d, index) => {
              return ( 
                <p key={'download'+index}>
                  <p className='line-item'>
                  {d.status === 'done' ? <CheckIcon className='check-icon'/>: ''}
                  {d.text}</p>
                </p>
              );
            })}
          </div>
        </Box>
      </Split>
        
      <div className='position-relative margin-top-large'>

        {/* Download button */}
        <Button
            variant="outlined"
            color="primary"
            className='btn'
            startIcon={<AddIcon />}
            onClick={downloadAll}
          >Download</Button>

        {/* Clear button */}
        <Button
            variant="outlined"
            color="primary"
            className='btn margin-left-small'
            onClick={clearAll}
          >Clear</Button>

        {/* Toggle audio and video */}
        <ToggleButtonGroup
          value={format}
          variant="outlined"
          color="primary"
          onChange={handleFormatChange}
          aria-label="audio and video format"
          className='toggle-group'
        >
          <ToggleButton value="mp3" aria-label="MP3">
            MP3
          </ToggleButton>
          <ToggleButton value="mp4" aria-label="MP4">
            MP4
          </ToggleButton>
        </ToggleButtonGroup>

        {/* Select quality */}
  
        </div>
    </Box>

    </>
  );
};

export default ManageLinks;
// https://www.youtube.com/watch?v=xi6ikBg1eWE&list=PLtXOGdKihmfDIZaj8FFLD049qVXLE71nK