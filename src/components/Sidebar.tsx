import Link from 'next/link'

import SidebarItems from './SidebarItems'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

import { validateRequest } from '@/lib/auth/lucia'
import { Session, User } from 'lucia'

const Sidebar = async () => {
  const { session, user } = await validateRequest()
  if (session === null) return null

  return (
    <aside className='h-screen min-w-52 bg-muted hidden md:block p-4 pt-8 border-r border-border shadow-inner'>
      <div className='flex flex-col justify-between h-full'>
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold ml-4'>Logo</h3>
          <SidebarItems />
        </div>
        <UserDetails {...{ session, user }} />
      </div>
    </aside>
  )
}

export default Sidebar

const UserDetails = ({ session, user }: { session: Session; user: User | null }) => {
  if (session === null || user === null) return null

  // if (!user?. || user.name.length == 0) return null;

  return (
    <Link href='/account'>
      <div className='flex items-center justify-between w-full border-t border-border pt-4 px-2'>
        <div className='text-muted-foreground'>
          {/* <p className="text-xs">{user.name ?? "John Doe"}</p> */}
          <p className='text-xs font-light pr-4'>{user.email ?? 'john@doe.com'}</p>
        </div>
        <Avatar className='h-10 w-10'>
          <AvatarImage src={user.profilePictureUrl} alt='profilePicture' />
          <AvatarFallback className='border-border border-2 text-muted-foreground'>
            {user.name
              ? user.name
                  ?.split(' ')
                  .map((word) => word[0].toUpperCase())
                  .join('')
              : ''}
          </AvatarFallback>
        </Avatar>
      </div>
    </Link>
  )
}
