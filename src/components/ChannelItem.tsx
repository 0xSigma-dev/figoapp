import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';


interface Channel {
  id: any;
  friendId: string;
  friendName: string;
  friendAvatar: string;
}

interface Message {
  text?: any | null;
  timestamp?: string;
}

interface ChannelItemProps {
  channel: Channel;
  latestMessage?: Message | undefined;
  formattedTime?: string;
  onDelete: (id: string) => void;
  onClick: (friendId: string, channelId: string) => void;
  renderFriendAvatar: (avatarId: string) => JSX.Element;
}
const ChannelItem: React.FC<ChannelItemProps> = ({
  channel,
  latestMessage,
  formattedTime,
  onDelete,
  onClick,
  renderFriendAvatar,
}) => {
  const [isSwiping, setIsSwiping] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      setIsSwiping(true);
      setTimeout(() => onDelete(channel.id), 300); // Delay to allow the animation to complete before deletion
    },
    onTouchStartOrOnMouseDown: () => setIsTouched(true),
    onTouchEndOrOnMouseUp: () => setIsTouched(false),
    trackMouse: true,
  });

  return (
    <div
      {...handlers}
      className={`flex items-center p-2 cursor-pointer transition-transform duration-300 ${isSwiping ? 'translate-x-[-100%]' : ''} ${isTouched ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
      onClick={() => onClick(channel.friendId, channel.id)}
    >
      {renderFriendAvatar(channel.friendAvatar)}
      <div className="flex-1 ml-4">
        <div className="font-bold text-xl text-black dark:text-white">{channel.friendName}</div>
        <div className="text-base text-black dark:text-gray-300">
          {latestMessage?.text?.length > 40
            ? `${latestMessage?.text.substring(0, 26)}...`
            : latestMessage?.text || 'Say Hi'}
        </div>
      </div>
      {formattedTime && <div className="text-sm text-gray-500 dark:text-gray-400 ml-auto">{formattedTime}</div>}
    </div>
  );
};

export default ChannelItem;

