import type { Metadata } from 'next'
import SignupForm from '@/components/site/SignupForm'

export const metadata: Metadata = {
  title: 'সাইন আপ — WebTuly',
  description: 'WebTuly-তে নতুন অ্যাকাউন্ট খুলুন।',
}

export default function SignupPage() {
  return <SignupForm />
}
