import { IconBrandFacebook, IconBrandLinkedin, IconBrandTwitter } from "@tabler/icons-react"
import { Logo } from "./logo"
import { Instagram } from "reicon-react"
import { Separator } from "@workspace/ui/components/separator"
import Link from "next/link"

export const Footer = () => {
  return (
    <footer>
      <div className='mx-auto flex max-w-7xl items-center justify-between gap-3 px-6 py-4 max-md:flex-col sm:px-6 sm:py-6 md:gap-6 md:py-8'>
        <a href='#'>
          <div className='flex items-center gap-3'>
            <Logo className='gap-3' />
          </div>
        </a>

        <div className='flex items-center gap-5 whitespace-nowrap'>
          <a href='#' className='opacity-80 transition-opacity duration-300 hover:opacity-100'>
            About
          </a>
          <a href='#' className='opacity-80 transition-opacity duration-300 hover:opacity-100'>
            Features
          </a>
          <a href='#' className='opacity-80 transition-opacity duration-300 hover:opacity-100'>
            Works
          </a>
          <Link href='/contact' className='opacity-80 transition-opacity duration-300 hover:opacity-100'>
            Contact Us
          </Link>
        </div>

        <div className='flex items-center gap-4'>
          <a href='#'>
            <IconBrandFacebook className='size-5' />
          </a>
          <a href='#'>
            <Instagram className='size-5' />
          </a>
          <a href='#'>
            <IconBrandTwitter className='size-5' />
          </a>
          <a href='#'>
            <IconBrandLinkedin className='size-5' />
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
