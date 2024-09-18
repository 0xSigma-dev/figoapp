import React, { useRef, useState, forwardRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShareAlt, faUser, faCog, faInfoCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import AvatarComponent from './AvatarComponent';
import { useRouter } from "next/router";

interface User {
  id?: string;
  displayName?: string;
  bio?: string;
  avatarId?: number;
  avatar?: number;
  status?: string;
  level?: number;
  points?: number;
  messagesSent?: number;
  totalMessagesRequired?: number;
  timeSpentHours?: number;
  totalHoursRequired?: number;
  pointsObtained?: number;
  totalPointsRequired?: number;
}

interface PlaceholderComponentProps {
  user: User;
  onClose: () => void;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const PlaceholderComponent = forwardRef<HTMLDivElement, PlaceholderComponentProps>(({ user, onClose }, ref) => {
  const points = user?.points;
  const [totalPointsRequired, setTotalPointsRequired] = useState<number>(1000000);
  const [blinkItem, setBlinkItem] = useState<string | null>(null);
  const router = useRouter();

  const fetchLevelDetails = async (level: number) => {
    try {
      const response = await fetch(`${apiUrl}/api/levels/${level}`);
      if (!response.ok) {
        throw new Error("Failed to fetch level details");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching level details:", error);
      return null;
    }
  };
  


  useEffect(() => {
    const fetchUserLevelDetails = async () => {
      if (user?.level) {
        const levelDetails = await fetchLevelDetails(user.level);
        if (levelDetails) {
          setTotalPointsRequired(levelDetails.max_points); // Set total points required based on the level
        }
      }
    };

    fetchUserLevelDetails();
  }, [user?.level]);

  const handleBlink = (item: string) => {
    setBlinkItem(item);
    setTimeout(() => setBlinkItem(null), 500); // Remove blink effect after 500ms
  };


  const navigateTo = (path: string, query?: any) => {
    handleBlink(path);
    router.push({
      pathname: path,
      query,
    });
  };

  return (
    <motion.div
      ref={ref}
      initial={{ x: "-100%" }}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
      transition={{ type: "spring", stiffness: 300 }}
      className="fixed top-0 left-0 h-full bg-white dark:bg-deep-purple text-white p-4 z-40 shadow-lg overflow-y-auto flex flex-col"
      style={{ width: "70%", maxWidth: "800px" }}
    >
      <button
        className="absolute top-2 right-2 text-black dark:text-white hover:text-gray-300"
        onClick={onClose}
      >
        <FontAwesomeIcon icon={faTimesCircle} className="text-red-600 mr-2" style={{ fontSize: "24px" }} />
      </button>

      <div className="flex flex-col items-center flex-grow">
        {user.avatar && (
          <AvatarComponent
            avatarId={user.avatar}
            width={200}
            height={200}
          />
        )}
        <p className="text-4xl mb-4 text-black dark:text-white font-bold">{user.displayName || "FIGO"}</p>

        <div className="flex items-center space-x-2">
          <span className="text-black dark:text-white font-semibold mb-3">{user.bio}</span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-black dark:text-white font-semibold mb-3">{user.level}</span>
        </div>

        <div className="w-full text-center space-y-2">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-purple-400 h-2 rounded-full"
              style={{
                width: `${totalPointsRequired && points ? (points / totalPointsRequired) * 100 : 0}%`,
              }}
            ></div>
          </div>
        </div>

       

        <hr className="w-full border-gray-600 my-4" />

        <div className="w-full text-left">
          <div
            className={`flex items-center space-x-2 cursor-pointer p-4 rounded ${
              blinkItem === "profile" ? "blink-effect" : ""
            }`}
            onClick={() => navigateTo("/profile/[friendId]", { friendId: user?.id })}
          >
            <FontAwesomeIcon icon={faUser} className="text-gray-400 mr-2" style={{ fontSize: "24px" }} />
            <span className="text-black dark:text-white text-lg">Profile</span>
          </div>
        </div>

        <div className="w-full text-left">
          <div
            className={`flex items-center cursor-pointer p-4 rounded ${
              blinkItem === "referral" ? "blink-effect" : ""
            }`}
            onClick={() => navigateTo("/Menu/Referral/page")}
          >
            <FontAwesomeIcon icon={faShareAlt} className="text-gray-400 mr-2" style={{ fontSize: "24px" }} />
            <span className="text-black dark:text-white">Referral</span>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col border-t border-gray-600 pt-4 mt-4">
      <div
          className={`flex items-center space-x-2 cursor-pointer p-4 rounded ${
            blinkItem === "settings" ? "blink-effect" : ""
          }`}
          onClick={() => navigateTo("/settings")}
        >
          <FontAwesomeIcon icon={faCog} className="text-gray-400 mr-2" style={{ fontSize: "24px" }} />
          <span className="text-black dark:text-white">Settings</span>
        </div>

        <div
          className={`flex items-center space-x-2 cursor-pointer p-4 rounded ${
            blinkItem === "about" ? "blink-effect" : ""
          }`}
          onClick={() => navigateTo("https://figo.gitbook.io/figo-docs")}
        >
          <FontAwesomeIcon icon={faInfoCircle} className="text-gray-400 mr-2" style={{ fontSize: "24px" }} />
          <span className="text-black dark:text-white">About</span>
        </div>
      </div>
    </motion.div>
  );
});
PlaceholderComponent.displayName = "PlaceholderComponent";
export default PlaceholderComponent;
