import { Route, Routes } from 'react-router-dom'
import { Box, Button, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { Layout } from './components/Layout.tsx'
import Home from './pages/Home.tsx'
import LibraryPage from './pages/LibraryPage.tsx'
import TechniquePage from './pages/TechniquePage.tsx'
import ComparePage from './pages/ComparePage.tsx'
import KnowledgePage from './pages/KnowledgePage.tsx'

export default function App() {
  return <Routes><Route element={<Layout />}>
    <Route index element={<Home />} />
    <Route path="biblioteca" element={<LibraryPage />} />
    <Route path="conceito/:id" element={<KnowledgePage />} />
    <Route path="tecnica/:id" element={<TechniquePage />} />
    <Route path="comparar" element={<ComparePage />} />
    <Route path="*" element={<Box sx={{py:8,textAlign:'center'}}><Typography variant="h3">Página não encontrada</Typography><Typography color="text.secondary" sx={{my:2}}>Esse endereço não existe.</Typography><Button component={RouterLink} to="/" variant="contained">Voltar ao início</Button></Box>} />
  </Route></Routes>
}
