"use client";
// eslint-disable-next-line react-hooks/exhaustive-deps

import { faArrowLeft, faCamera, faEdit, faEllipsisV, faMessage, faShare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Cookies from 'js-cookie';
import { supabase } from '@/lib/supabaseClient';
import { Suspense, lazy } from 'react';
const ErrorModal = lazy(() => import('../../components/ErrorModal'));
const SuccessModal = lazy(() => import('../../components/SuccessModal'));
const AddContactModal = lazy(() => import ('../../components/AddContactModal'))
import { getContactById, getUserData, saveUserData, updateUserDataFields } from "@/utils/indexedDB";
import SkeletonProfile from '../../components/Skeleton/SkeletonProfile';
import AvatarComponent from "@/components/AvatarComponent";
import WalletGuard from "@/components/WalletGuard";
import Image from 'next/image';



const ProfilePage: React.FC = () => {
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const userId = Cookies.get('userId');
  const { friendId } = router.query;
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDisplayName, setEditedDisplayName] = useState("");
  const [editedBio, setEditedBio] = useState(""); 
  const isCurrentUser = String(friendId) === String(userId);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAddContactModal, setShowAddContactModal] = useState<boolean>(false);
  const [contactExists, setContactExists] = useState(false);
  

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        if (typeof window !== 'undefined') {
          const token = isCurrentUser && userId ? userId : friendId; // Use userId if current user, otherwise use friendId
          //console.log('token', token);
  
          if (isCurrentUser && userId) {
            // If it's the current user, fetch user data from IndexedDB
            //console.log('userId', userId);
            const storedUser = await getUserData(userId);
            //console.log('stored', storedUser);
            if (storedUser) {
              setUserDetails(storedUser);
            }
          } else {
            // Fetch friend details using the token (friendId in this case)
            const response = await fetch(`/api/user/`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
  
            if (!response.ok) {
              throw new Error("Failed to fetch user details");
            }
  
            const data = await response.json();
            setUserDetails(data.user);
  
            // If we have the current userId, save user data to IndexedDB
            if (userId) {
              await saveUserData({ id: userId, ...data.user });
            }
          }
  
          // Fetch contact details for the friendId, if available
          if (friendId && userId) {
            const contact = await getContactById(friendId as string);
            if (contact) {
              setContactExists(true);
              setUserDetails((prevDetails: any) => ({
                ...prevDetails,
                displayName: contact.displayName,
              }));
            } else {
              setContactExists(false);
            }
          }
        }
      } catch (error) {
        //console.error('Error fetching user details:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserDetails();
  }, [friendId, isCurrentUser, userId]);
  

  const fetchUserDetails = async () => {
    try {
      if (typeof window !== 'undefined') {
        const token = isCurrentUser && userId ? userId : friendId; // Use userId if current user, otherwise use friendId
        //console.log('token', token);

        if (isCurrentUser && userId) {
          // If it's the current user, fetch user data from IndexedDB
          //console.log('userId', userId);
          const storedUser = await getUserData(userId);
          //console.log('stored', storedUser);
          if (storedUser) {
            setUserDetails(storedUser);
          }
        } else {
          // Fetch friend details using the token (friendId in this case)
          const response = await fetch(`/api/user/`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch user details");
          }

          const data = await response.json();
          setUserDetails(data.user);

          // If we have the current userId, save user data to IndexedDB
          if (userId) {
            await saveUserData({ id: userId, ...data.user });
          }
        }

        // Fetch contact details for the friendId, if available
        if (friendId && userId) {
          const contact = await getContactById(friendId as string);
          if (contact) {
            setContactExists(true);
            setUserDetails((prevDetails: any) => ({
              ...prevDetails,
              displayName: contact.displayName,
            }));
          } else {
            setContactExists(false);
          }
        }
      }
    } catch (error) {
      //console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <SkeletonProfile />; // Render skeleton screen while loading
  }

  if (!userDetails) {
    return <div>No user details found.</div>;
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      handleUploadFile();
    }
  };

  const handleUploadFile = () => {
    if (!selectedFile) return;
  
    const fileName = `${Date.now()}_${selectedFile.name}`;
    const userId = Cookies.get('userId');
  
    if (!userId) {
      setErrorMessage('User is not authenticated');
      return;
    }
  
    // Create a FormData object for file upload
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('fileName', fileName);
  
    // Create a new XMLHttpRequest
    const xhr = new XMLHttpRequest();
  
    // Track upload progress
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    };
  
    // Handle successful upload
    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const result = JSON.parse(xhr.responseText);
        const publicURL = result.publicURL; // Adjust according to your response
  
        setFileUrl(publicURL);
  
        // Save metadata including user ID in a separate Supabase table
        const { data: metadataData, error: metadataError } = await supabase
          .from('file_metadata') // Ensure this table exists in your Supabase instance
          .insert([
            {
              file_name: fileName,
              user_id: userId,
              public_url: publicURL,
            }
          ]);
  
        if (metadataError) throw metadataError;
  
        setSuccessMessage('File uploaded successfully!');
      } else {
        setErrorMessage('Error uploading file.');
      }
    };
  
    // Handle upload error
    xhr.onerror = () => {
      setErrorMessage('Error uploading file.');
    };
  
    // Set up the request
    xhr.open('POST', '/api/upload'); // Adjust this URL to your actual API endpoint
    xhr.setRequestHeader('Authorization', `Bearer ${userId}`); // If needed
    xhr.send(formData);
  };
  
  
  

  const handleEditClick = async () => {
    if (isCurrentUser) {
      const storedUser = await getUserData(userId || '');
      if (storedUser) {
        setEditedDisplayName(storedUser.displayName || '');
        setEditedBio(storedUser.bio || '');
      }
    } else {
      setEditedDisplayName(userDetails.displayName);
      setEditedBio(userDetails.bio);
    }
    setIsEditing(true);
  };

  const handleMenuClick = () => {
    setShowMenu(!showMenu); // Ensure the drawer is closed when the menu is opened
  };

  const handleMessage = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.preventDefault();
    if (friendId) {
      router.push(`/Chat/${friendId}`);
    }
  };

  const handleAddContact = () => {
    setShowAddContactModal(true);
  };

  const handleShare = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.preventDefault();
  
    if (navigator.share) {
      // Check if the Web Share API is supported
      navigator.share({
        title: document.title, // You can customize the title here
        url: window.location.href, // Current page URL
      })
      .then(() => console.log('Successful share'))
      .catch((error) => console.error('Error sharing:', error));
    } else {
      //console.warn('Web Share API is not supported in this browser.');
      // Fallback code can be added here to handle cases where the Web Share API is not supported
    }
  };

  const handleSaveClick = async () => {
    try {
      // Update Supabase
      const { error } = await supabase
        .from('users')
        .update({
          displayName: editedDisplayName,
          bio: editedBio,
        })
        .eq('id', userId);
  
      if (error) throw error;
  
      // Update IndexedDB
      await updateUserDataFields(userId || '', { displayName: editedDisplayName, bio: editedBio });
  
      // Update the local state to reflect changes immediately
      setUserDetails((prevDetails: any) => ({
        ...prevDetails,
        displayName: editedDisplayName,
        bio: editedBio,
      }));
  
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
    } catch (err) {
      //console.error('Error updating profile:', err);
      setErrorMessage('Failed to update profile.');
    }
  };
  
  

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditedDisplayName(userDetails.displayName);
    setEditedBio(userDetails.bio);
  };

  const handleAddStoryClick = () => {
    const inputElement = document.createElement('input');
    inputElement.type = 'file';
    inputElement.accept = 'image/*,video/*,gif/*';
    inputElement.onchange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        setSelectedFile(target.files[0]);
        handleUploadFile();
      }
    };
    inputElement.click();
  };
  
  


  return (
    <WalletGuard>
    <div className="relative w-full h-screen flex flex-col items-center bg-gradient-to-r from-purple-900 via-purple-400 to-blue-500">
  <div className="relative w-full h-1/3 bg-gradient-to-r from-purple-900 via-purple-400 to-blue-500 flex justify-center items-center">
    <FontAwesomeIcon
      icon={faArrowLeft}
      className="absolute top-4 left-4 text-white dark:text-white cursor-pointer"
      onClick={() => router.back()}
      style={{ fontSize: "24px" }}
    />
    {isEditing ? (
      <textarea
        className="text-2xl font-bold text-white text-center bg-transparent border-none resize-none"
        value={editedBio}
        onChange={(e) => setEditedBio(e.target.value)}
      />
    ) : (
      <h1 className="text-2xl font-bold text-white text-center">
        {userDetails.bio}
      </h1>
    )}
    <FontAwesomeIcon
      icon={faEllipsisV}
      className="absolute top-4 right-4 text-white dark:text-white cursor-pointer"
      onClick={() => setShowMenu(!showMenu)}
      style={{ fontSize: "24px" }}
    />
    {showMenu && (
      <div className="absolute right-0 mt-2 mr-4 w-48 bg-white dark:bg-gray-900 rounded-md shadow-lg py-2 z-20">
        <div onClick={handleAddContact} className="block px-4 py-2 text-black dark:text-white hover:bg-white">
        {contactExists ? "Edit Contact" : "Add Contact"}
        </div>
        <div>
          <p className="block px-4 py-2 text-black dark:text-white hover:bg-white">
            Statistics
          </p>
        </div>
      </div>
    )}
  </div>

  {/* Avatar and User Information */}
  <div className="relative w-full h-full rounded-tl-2xl rounded-tr-3xl bg-white dark:bg-black">
    <div className="relative -mt-16 ml-10 w-32 h-25 bg-white dark:bg-black rounded-full overflow-hidden">
    <AvatarComponent avatarId={userDetails.avatar} width={150} height={150} /> 
      <div
        className={`absolute bottom-16 left-40 w-4 h-4 rounded-full ${
          userDetails.online ? "bg-green-500" : "bg-red-500"
        } border-2 border-white dark:border-black z-20`}
      />
      {isCurrentUser && !isEditing && (
        <FontAwesomeIcon
          icon={faEdit}
          className="absolute bottom-2 right-2 text-black dark:text-white cursor-pointer"
          onClick={handleEditClick}
          style={{ fontSize: "24px" }}
        />
      )}
    </div>

    <div className="mt-2 text-center">
      {isEditing ? (
        <input
          type="text"
          className="text-4xl font-bold text-black dark:text-white bg-transparent border-b-2 border-gray-300 focus:outline-none"
          value={editedDisplayName}
          onChange={(e) => setEditedDisplayName(e.target.value)}
        />
      ) : (
        <h1 className="text-4xl font-bold text-black dark:text-white">
          {userDetails.displayName}
        </h1>
      )}
      <p className="text-sm text-black dark:text-gray-400">
        @{userDetails.username}
      </p>
    </div>

    {isEditing && (
      <div className="flex justify-center space-x-4 mt-6">
        <button
          className="px-4 py-2 bg-purple-500 text-white rounded-md"
          onClick={handleSaveClick}
        >
          Save
        </button>
        <button
          className="px-4 py-2 bg-gray-500 text-white rounded-md"
          onClick={handleCancelClick}
        >
          Cancel
        </button>
      </div>
    )}

    {/* Action Buttons */}
    { userDetails.id !== userId && (
      <div className="flex justify-center space-x-4 mt-6">
        {/* Message Button */}
        <div
          className="flex flex-col w-1/4 h-auto border items-center border-purple-500 rounded-lg p-4 cursor-pointer"
          onClick={handleMessage}
        >
          <FontAwesomeIcon icon={faMessage} className="text-purple-500 text-xl" />
          <p className="text-purple-500 mt-2">Message</p>
        </div>

        {/* Share Button */}
        <div
          className="flex flex-col w-1/4 h-auto border items-center border-purple-500 rounded-lg p-4 cursor-pointer"
          onClick={handleShare}
        >
          <FontAwesomeIcon icon={faShare} className="text-purple-500 text-xl" />
          <p className="text-purple-500 mt-2">Share</p>
        </div>
      </div>
    )}

<Suspense fallback={<div>Loading...</div>}>
  <ErrorModal message={errorMessage} onClose={() => setErrorMessage(null)} />
  <SuccessModal message={successMessage} onClose={() => setSuccessMessage(null)} />
</Suspense>

    {/* Stories Section */}
    <div className="flex-1 mt-9 w-full px-8 overflow-auto">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-500 mb-4">
        Stories
      </h2>
      {fileUrl && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 p-4">
          <Image src={fileUrl} alt="Uploaded file" className="w-32 h-32 object-cover rounded-lg" />
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-blue-500 mt-2">Upload Progress: {uploadProgress}%</p>
        </div>
      )}
    </div>
    {isCurrentUser && (
        <div className="absolute bottom-4 w-full px-4">
          <button
            className="w-full flex items-center justify-center bg-purple-600 text-white py-3 rounded-lg"
            onClick={handleAddStoryClick}
          >
            <FontAwesomeIcon icon={faCamera} className="mr-2" />
            Add Story
          </button>
        </div>
      )}
  </div>
  {showAddContactModal && (
        <Suspense fallback={<div>Loading...</div>}>
          <AddContactModal
            isOpen={showAddContactModal}
            onClose={() => setShowAddContactModal(false)}
            userDetails={userDetails} // Pass userDetails as a prop
            onContactAdded={fetchUserDetails}
          />
        </Suspense>
      )}
</div>
</WalletGuard>
  );
};

export default ProfilePage;