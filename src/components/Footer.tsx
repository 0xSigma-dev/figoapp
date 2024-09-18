"use client"
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments, faTasks, faUserFriends, faPhoneAlt, faCameraRetro, faExchangeAlt, faChartBar } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface FooterProps {
  theme: 'light' | 'dark';
}

const Footer: React.FC<FooterProps> = ({ theme }) => {
  const router = useRouter();

  const icons = [
    { icon: faComments, link: '/Home/page' },
    //{ icon: faCameraRetro, link: '/Home/Status' },
    { icon: faTasks, link: '/Tasks' },
  ];

  const callIcon = { icon: faPhoneAlt, link: '#' }; // Disabled call icon
  const community = { icon: faUserFriends, link: '#' }
  const camera = { icon: faCameraRetro, link: '#' }
  const swap = { icon: faExchangeAlt, link: '#' }

  return (
    <>
      <footer className="fixed bottom-0 top border-t border-gray-900 left-0 right-0 bg-white dark:bg-deep-purple text-black dark:text-white p-1 flex items-center justify-between z-10">
        <div className="flex-1 flex justify-around items-center">
          {icons.map((item, index) => (
            <Link href={item.link} key={index} legacyBehavior>
              <a className="flex flex-col items-center">
                <motion.div
                  whileTap={{ scale: 1.4 }}
                  className={`relative flex items-center justify-center w-16 h-16 rounded-full bg-transparent`}
                >
                  <FontAwesomeIcon
                    icon={item.icon}
                    className={`${router.pathname === item.link ? 'text-purple-500' : 'text-black dark:text-white'}`}
                    style={{ fontSize: '24px' }}
                  />
                </motion.div>
              </a>
            </Link>
          ))}
          <div className="relative flex flex-col items-center">
            <motion.div
              whileTap={{ scale: 1.4 }}
              className="relative flex items-center justify-center w-16 h-16 rounded-full bg-transparent cursor-not-allowed"
            >

              <FontAwesomeIcon
                icon={camera.icon}
                className="text-gray-500"
                style={{ fontSize: '24px' }}
              />
              <span className="absolute top-0 right-0 bg-green-500 text-white text-xs rounded-full px-1 ">
                Soon
              </span>


            </motion.div>
          </div>
          <div className="relative flex flex-col items-center">
            <motion.div
              whileTap={{ scale: 1.4 }}
              className="relative flex items-center justify-center w-16 h-16 rounded-full bg-transparent cursor-not-allowed"
            >

              <FontAwesomeIcon
                icon={swap.icon}
                className="text-gray-500"
                style={{ fontSize: '24px' }}
              />
              <span className="absolute top-0 right-0 bg-green-500 text-white text-xs rounded-full px-1 ">
                Soon
              </span>


            </motion.div>
          </div>
          
          <div className="relative flex flex-col items-center">
            <motion.div
              whileTap={{ scale: 1.4 }}
              className="relative flex items-center justify-center w-16 h-16 rounded-full bg-transparent cursor-not-allowed"
            >

              <FontAwesomeIcon
                icon={community.icon}
                className="text-gray-500"
                style={{ fontSize: '24px' }}
              />
              <span className="absolute top-0 right-0 bg-green-500 text-white text-xs rounded-full px-1 ">
                Soon
              </span>


            </motion.div>
          </div>
          <div className="relative flex flex-col items-center">
            <motion.div
              whileTap={{ scale: 1.4 }}
              className="relative flex items-center justify-center w-16 h-16 rounded-full bg-transparent cursor-not-allowed"
            >

              <FontAwesomeIcon
                icon={callIcon.icon}
                className="text-gray-500"
                style={{ fontSize: '24px' }}
              />
              <span className="absolute top-0 right-0 bg-green-500 text-white text-xs rounded-full px-1 ">
                Soon
              </span>


            </motion.div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;








