import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';


interface Channel {
  id: any;
  friendId: any;
  friendDisplayName: string;
  friendAvatar: string;
}


interface ChannelItemProps {
  channel: Channel;
  latestMessage?: any;
  messageCount?:any;
  formattedTime?: string;
  onDelete: (id: string) => void;
  onClick: (friend_id: any, channel_id: any) => void;
  renderFriendAvatar: (avatarId: string) => JSX.Element;
}
const ChannelItem: React.FC<ChannelItemProps> = ({
  channel,
  latestMessage,
  messageCount,
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
        <div className="font-bold text-xl text-black dark:text-white">{channel.friendDisplayName}</div>
        <div className="text-base text-black dark:text-gray-300">
          {latestMessage?.content?.length > 40
            ? `${latestMessage?.content?.substring(0, 26)}...`
            : latestMessage?.content || 'Say Hi'}
        </div>
      </div>
      <div className="flex flex-col items-center ml-auto">
        {formattedTime && (
          <div className="text-sm text-gray-500 dark:text-gray-400">{formattedTime}</div>
        )}
        {messageCount && (
          <div className="text-xs bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center mt-1">
            {messageCount}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelItem;

