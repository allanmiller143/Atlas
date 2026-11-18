import { createTheme } from '@mui/material/styles'
export const theme=createTheme({
 palette:{mode:'light',primary:{main:'#3657A5',dark:'#263F7B',light:'#E9EEF8'},secondary:{main:'#25766B'},background:{default:'#FFFFFF',paper:'#FFFFFF'},text:{primary:'#202B3A',secondary:'#687487'},divider:'#E4E8EF'},
 shape:{borderRadius:6},
 typography:{fontFamily:'DM Sans, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',h1:{fontWeight:800,letterSpacing:'-.05em'},h2:{fontWeight:800,letterSpacing:'-.035em'},h3:{fontWeight:800,letterSpacing:'-.03em'},button:{textTransform:'none',fontWeight:700}},
 components:{MuiButton:{styleOverrides:{root:{borderRadius:5,padding:'10px 16px',boxShadow:'none'},contained:{boxShadow:'none'}}},MuiPaper:{styleOverrides:{root:{backgroundImage:'none'}}},MuiCard:{styleOverrides:{root:{boxShadow:'none',border:'1px solid #E4E8EF',borderRadius:6}}}}
})
