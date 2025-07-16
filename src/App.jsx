import React from 'react';
import { LiveblocksProvider, RoomProvider, ClientSideSuspense } from "@liveblocks/react/suspense";

function Loading() {
  return <div style={{ padding: '20px', textAlign: 'center' }}>Loading collaborative editor...</div>;
}

export function App({ children, roomId = "my-room", publicApiKey, currentUser }) {
  if (!publicApiKey || publicApiKey.trim() === '') {
    return (
      <div style={{ padding: 20, background: '#ffe6e6', border: '1px solid #ff0000' }}>
        <strong>Error:</strong> Liveblocks Public API Key is required.
      </div>
    );
  }

  // Generate a stable anonymous ID (stable per session)
  const anonymousId = React.useMemo(() => 
    `anonymous-${Math.random().toString(36).substr(2, 9)}`, 
    []
  );

  // Default user if none provided
  const user = currentUser && currentUser.id ? currentUser : {
    id: anonymousId,
    name: "Anonymous User",
    avatar: "",
    color: "#5371F7"
  };

  // Generate random colors for users if not provided
  const userColors = ['#5371F7', '#F75371', '#71F753', '#F7A571', '#71E0F7', '#F771E0'];
  const getRandomColor = () => userColors[Math.floor(Math.random() * userColors.length)];

  return (
    <LiveblocksProvider 
      publicApiKey={publicApiKey}
      // Identify the current user
      userId={user.id}
      // Provide user metadata
      userInfo={{
        name: user.name || "Anonymous",
        color: user.color || getRandomColor(),
        avatar: user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`
      }}
      // Resolve users when needed (for cursors and mentions)
      resolveUsers={async ({ userIds }) => {
        // In WeWeb, you might have access to other users via an API
        // For now, we'll just return the info we have
        return userIds.map(userId => {
          // If it's the current user, return their info
          if (userId === user.id) {
            return {
              id: user.id,
              name: user.name || "Anonymous",
              color: user.color || getRandomColor(),
              avatar: user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`
            };
          }
          
          // For other users, return basic info
          // In a real app, you'd fetch this from WeWeb's user system or an API
          return {
            id: userId,
            name: userId.startsWith('anonymous-') ? 'Anonymous User' : userId,
            color: getRandomColor(),
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${userId}`
          };
        });
      }}
      // Resolve mention suggestions (optional)
      resolveMentionSuggestions={async ({ text }) => {
        // For now, just return current user as a suggestion
        // In a real app, you'd query WeWeb's user database
        if (!text || user.name.toLowerCase().includes(text.toLowerCase())) {
          return [user.id];
        }
        return [];
      }}
    >
      <RoomProvider id={roomId}>
        <ClientSideSuspense fallback={<Loading />}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}