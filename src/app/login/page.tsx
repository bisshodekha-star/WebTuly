import type { Metadata } from 'next'
import LoginForm from '@/components/site/LoginForm'

export const metadata: Metadata = {
  title: 'লগইন — WebTuly',
  description: 'WebTuly অ্যাকাউন্টে লগইন করুন।',
}

export default function LoginPage() {
  return <LoginForm />
}
