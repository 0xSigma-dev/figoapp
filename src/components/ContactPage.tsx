// src/components/ContactPage.tsx
"use client";
import { faEllipsisV} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import 'aos/dist/aos.css';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState} from 'react';
import SearchIcon from './SearchIcon';
import UserSearch from './UserSearch';
import { syncContactsFromNavigator, getAllContacts } from '../utils/indexedDB';
import Link from "next/link";
import ContactSkeleton from './Skeleton/ContactSkeleton';

interface ContactPageProps {
  theme: 'light' | 'dark';
}


interface Contact {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  profileImage?: string;
  data: {
    avatar: number;
  };
}
import AvatarComponent from './AvatarComponent';

const ContactPage: React.FC<ContactPageProps> = ({ theme }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const router = useRouter();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const menuRef = useRef(null);
  const [currentChatFriend, setCurrentChatFriend] = useState<string | null>(null);
  const [showContactPage, setShowContactPage] = useState(true);
  const [contacts, setContacts] = useState<any[]>([]);


  const fetchContacts = async () => {
    setLoading(true);
    const dbContacts = await getAllContacts();
    setContacts(dbContacts);
    setLoading(false);
  };


  useEffect(() => {
    const fetchContacts = async () => {
      const dbContacts = await getAllContacts();
      setContacts(dbContacts);
    };

    fetchContacts();
  }, []);


  const handleMenuToggle = (e: any) => {
    e.stopPropagation();
    setMenuOpen(prevState => !prevState);
  };
  
  const handleCloseMenus = () => {
    setMenuOpen(false);
    setShowDrawer(false);
  };

 

  const handleSearchClick = () => {
    setShowSearchModal(true);
  };

  const closeSearchModal = () => {
    setShowSearchModal(false);
  };


  const handleMessage2Click = (contactId: string) => {
    setShowContactPage(false);
    setCurrentChatFriend(contactId || null); 
    setTimeout(() => {
      router.push(`/Chat/${contactId}`);
    }, 10);
  };

  const handleRefreshClick = async () => {
    setMenuOpen(false);
    await fetchContacts();
  };
  


  return (
    <div className={`flex overflow-y-auto overflow-x-hidden flex-col bg-white dark:bg-deep-purple h-screen z-30`} onClick={handleCloseMenus}>
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-black text-black dark:text-white p-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
          <div className="flex flex-col">
            <span className="text-lg font-bold ml-4 text-black dark:text-white">Choose Friend</span>
            <span className="text-sm bg-grey-800 ml-4">{contacts.length || 0} friends</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <SearchIcon onClick={handleSearchClick} />
          <div className="relative" ref={menuRef}>
            <FontAwesomeIcon icon={faEllipsisV} style={{ fontSize:'24px'}} className="cursor-pointer mr-4 ml-4 text-lg" onClick={handleMenuToggle} />
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-md shadow-lg py-2 z-50">
                <Link href="#" className="block px-4 py-2 text-black dark:text-white hover:bg-gray-100" onClick={handleRefreshClick}>
                  Refresh
                </Link>
                <Link href="/Menu/Referral/page" className="block px-4 py-2 text-black dark:text-white hover:bg-gray-100">
                  Invite
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className={`overflow-x-hidden`}>
        <div className="mt-5 ml-5 text-purple-800 mb-4 font-bold">Purple Family</div>
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <ContactSkeleton key={index} />
          ))
        ) : (
          contacts.length > 0 ? (
            contacts.map((contact: any) => (
              <div
                key={contact.id}
                className="flex items-center justify-between p-2 ml-4 cursor-pointer hover:bg-gray-800"
                onClick={() => handleMessage2Click(contact.id)}
              >
                <div className="flex items-center">
                  <AvatarComponent avatarId={contact.avatar} width={60} height={60} />
                  <div className="ml-4">
                    <p className="text-black text-base dark:text-white font-bold">{contact.displayName}</p>
                    <p className="text-gray-400 text-sm">{contact.bio}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-base text-center mt-5">You don&apos;t have any contacts yet.</p>
          )
        )}
      </main>
     
      {showSearchModal && <UserSearch onClose={closeSearchModal} />}
    </div>
  );
}

export default ContactPage;
