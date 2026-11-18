import { Box } from '@mui/material'
import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Header, NAV_WIDTH } from './Header.tsx'
export function Layout(){const {pathname}=useLocation();useEffect(()=>{window.scrollTo({top:0,left:0,behavior:'auto'})},[pathname]);return <Box sx={{minHeight:'100vh',bgcolor:'background.default'}}><Header/><Box sx={{ml:{xs:0,md:`${NAV_WIDTH}px`},minHeight:'100vh'}}><Box component="main" sx={{px:{xs:2.5,sm:4,lg:7},py:{xs:3,md:5}}}><Outlet/></Box></Box></Box>}
