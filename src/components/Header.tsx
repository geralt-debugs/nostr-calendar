import AppBar from '@mui/material/AppBar';
import { Link } from 'react-router';

export const HEADER_HEIGHT = 56

export const Header = () => {
  return <AppBar color='primary' style={{justifyContent: 'start', padding:'8px 16px', backgroundColor: 'white'}}>
    <Link to={'/'} style={{display: 'flex', alignItems: 'center', width: 'fit-content'}}>
    <img src="/formstr.png" style={{
      objectFit: "contain",
      height: '40px',
      width: 'fit-content'
    }} alt="Calendar Logo" />
    </Link>
  </AppBar>
}