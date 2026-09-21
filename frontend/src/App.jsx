import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import GetStarted from './pages/GetStarted'
import AdminPortal from './pages/AdminPortal'
import UserPortal from './pages/UserPortal'
import GenerateCode from './pages/GenerateCode'
import ScanCode from './pages/ScanCode'
import JoinQueue from './pages/JoinQueue'
import CustomerTicket from './pages/CustomerTicket'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors duration-200">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/get-started" element={<GetStarted />} />
            <Route path="/admin-portal" element={<AdminPortal />} />
            <Route path="/user-portal" element={<UserPortal />} />
            <Route path="/generate-code" element={<GenerateCode />} />
            <Route path="/scan" element={<ScanCode />} />
            <Route path="/join/:queueId" element={<JoinQueue />} />
            <Route path="/ticket/:queueId/:ticketId" element={<CustomerTicket />} />
            <Route path="/admin/:queueId" element={<AdminDashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
