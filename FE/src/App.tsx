
import { Outlet } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'

import ChatPopup from './components/ChatPopup'
import 'react-toastify/dist/ReactToastify.css';
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <>
      <Header />
      <Toaster position="top-center" reverseOrder={false} />
      <main className='min-h-[78vh]' >
        <Outlet />
      </main>
      {/* <ChatPopup /> */}
      <Footer />
    </>
  )
}

export default App
