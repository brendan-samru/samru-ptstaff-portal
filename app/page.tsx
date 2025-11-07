import { redirect } from 'next/navigation';

export default function HomePage() {
  // This will permanently redirect any user who lands on
  // the root (/) to your new, secure portal login.
  redirect('/portal');

  // This part is never seen, but Next.js requires a return
  return null;
}