import { Josefin_Sans } from 'next/font/google'
import './globals.css'

const josefin_sans = Josefin_Sans({ subsets: ['latin'] })

import Navbar from './components/Navbar';
import Footer from './components/Footer';

export const metadata = {
  title: 'CoinDragon',
  description: 'Your personal Crypo Portfolio',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={josefin_sans.className}>
        <Navbar/>
        {children}
        <Footer/>
      </body>
    </html>
  )
}
