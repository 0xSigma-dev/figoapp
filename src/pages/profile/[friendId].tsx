"use client";
// eslint-disable-next-line react-hooks/exhaustive-deps

import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Lottie from "react-lottie-player";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import bannerImage from "/public/img/boy1.png";
import { useUser } from "@/context/UserContext"; 

import avatar1 from '../../components/lottie/avatar1.json';
import avatar2 from '../../components/lottie/avatar2.json';
import avatar3 from '../../components/lottie/avatar3.json';
import avatar4 from '../../components/lottie/avatar4.json';
import avatar5 from '../../components/lottie/avatar5.json';
import avatar6 from '../../components/lottie/avatar6.json';
import avatar7 from '../../components/lottie/avatar7.json';
import avatar8 from '../../components/lottie/avatar8.json';
import avatar9 from '../../components/lottie/avatar9.json';
import avatar10 from '../../components/lottie/avatar10.json';
import avatar11 from '../../components/lottie/avatar11.json';
import avatar12 from '../../components/lottie/avatar12.json';
import avatar13 from '../../components/lottie/avatar13.json';

const avatars = [
  { id: 1, animation: avatar1 },
  { id: 2, animation: avatar2 },
  { id: 3, animation: avatar3 },
  { id: 4, animation: avatar4 },
  { id: 5, animation: avatar5 },
  { id: 6, animation: avatar6 },
  { id: 7, animation: avatar7 },
  { id: 8, animation: avatar8 },
  { id: 9, animation: avatar9 },
  { id: 10, animation: avatar10 },
  { id: 11, animation: avatar11 },
  { id: 12, animation: avatar12 },
  { id: 13, animation: avatar13 },
];

const ProfilePage: React.FC = () => {
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useUser();
  const userId = user?.id;
  const { friendId } = router.query;

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = friendId;
        const response = await fetch(`/api/user/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user details");
        }

        const data = await response.json();
        setUserDetails(data.subcollections.public[0].data);
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [friendId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userDetails) {
    return <div>No user details found.</div>;
  }

  const isCurrentUser = friendId === userId;

  const renderAvatar = () => {
    const selectedAvatar = avatars.find((item: any) => item.id === userDetails.avatar);

    return selectedAvatar ? (
      <Lottie
        loop
        animationData={selectedAvatar.animation}
        play
        style={{
          width: 100,
          height: 100,
          borderRadius: "50%",
          overflow: "hidden",
          marginBottom: "16px",
        }}
      />
    ) : (
      <Image
        src={userDetails.profileImage || "/img/default_avatar.png"}
        alt={userDetails.displayName}
        width={100}
        height={100}
        className="rounded-full"
      />
    );
  };

  const handleEditClick = () => {
    router.push(`/profile/edit/${userId}`);
  };

  return (
    <div className="flex flex-col items-center h-screen bg-white dark:bg-black">
      <div className="relative w-full h-40">
        <Image
          src={bannerImage}
          alt="Figo Banner"
          layout="fill"
          objectFit="cover"
          className="rounded-b-lg"
        />
        {isCurrentUser && (
          <FontAwesomeIcon
            icon={faEdit}
            className="absolute top-4 right-4 text-black dark:text-white cursor-pointer"
            onClick={handleEditClick}
          />
        )}
      </div>
      <div className="mt-6">{renderAvatar()}</div>
      <div className="mt-4 text-center">
        <h1 className="text-xl font-bold text-black dark:text-white-900">{userDetails.displayName}</h1>
        <p className="text-sm text-black dark:text-white-600">@{userDetails.username}</p>
        <p className="text-md text-black dark:text-white-700 mt-2">{userDetails.bio}</p>
        <p
          className={`mt-2 text-sm font-semibold ${
            userDetails.online ? "text-green-500" : "text-red-500"
          }`}
        >
          {userDetails.online ? "Online" : "Offline"}
        </p>
      </div>
      <div className="flex-1 mt-6 w-full px-4 overflow-auto">
        <h2 className="text-lg font-semibold text-black dark:text-white mb-4">Stories</h2>
        {userDetails.stories?.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {userDetails.stories.map((story: any, index: number) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-4">
                <p className="text-black dark:text-white">{story.title}</p>
                <p className="text-sm text-black dark:text-white mt-2">{story.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-black dark:text-white">No stories uploaded.</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;

