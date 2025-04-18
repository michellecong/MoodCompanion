import React from "react";

const FriendsList = ({ friends, onRemoveFriend, isLoading }) => {
  if (isLoading) {
    return <div className="loading">Loading friends...</div>;
  }

  if (!friends || friends.length === 0) {
    return (
      <div className="no-friends">
        <p>You haven't added any friends yet.</p>
        <p>Switch to the Find Friends tab to start connecting with others!</p>
      </div>
    );
  }

  // 安全地获取情绪
  const getPrimaryEmotion = (friend) => {
    try {
      // 检查是否有最近情绪数据
      if (
        !friend.recentEmotion ||
        !friend.recentEmotion.emotions ||
        !Array.isArray(friend.recentEmotion.emotions) ||
        friend.recentEmotion.emotions.length === 0
      ) {
        return null;
      }

      // 按分数排序，获取得分最高的情绪
      const sortedEmotions = [...friend.recentEmotion.emotions].sort(
        (a, b) => (b.score || 0) - (a.score || 0)
      );

      return sortedEmotions[0];
    } catch (err) {
      console.error("Error getting emotion for friend:", err);
      return null;
    }
  };

  // 获取显示情绪标签的颜色
  const getEmotionColor = (emotionName) => {
    if (!emotionName) return "#A9A9A9"; // 默认灰色

    const emotionColors = {
      joy: "#FFD700", // 金色
      sadness: "#6495ED", // 蓝色
      anger: "#FF4500", // 红橙色
      fear: "#9370DB", // 紫色
      surprise: "#32CD32", // 绿色
      love: "#FF69B4", // 粉色
      disgust: "#8B8B00", // 暗黄色
      neutral: "#A9A9A9", // 灰色
    };
    return emotionColors[emotionName.toLowerCase()] || "#A9A9A9";
  };

  // 安全地格式化日期
  const formatEmotionDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const now = new Date();

      // 计算时间差（毫秒）
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 60) {
        return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
      } else {
        return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
      }
    } catch (err) {
      console.error("Error formatting date:", err);
      return "recently";
    }
  };

  return (
    <div className="friends-list-container">
      <h2>My Friends ({friends.length})</h2>

      <div className="friends-grid">
        {friends.map((friend) => {
          // 安全地获取主要情绪
          const primaryEmotion = getPrimaryEmotion(friend);
          const hasEmotion = !!primaryEmotion;

          return (
            <div key={friend._id} className="friend-card">
              <div
                className="friend-avatar"
                style={{ backgroundColor: friend.avatarColor || "#CBD5E0" }}
              >
                {friend.avatar ? (
                  <img src={friend.avatar} alt={friend.username} />
                ) : (
                  <span>
                    {(friend.username || "?").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="friend-info">
                <h3>{friend.username || "Friend"}</h3>
                <p>{friend.email || ""}</p>

                {/* 显示朋友的情绪状态 */}
                {hasEmotion ? (
                  <div className="friend-emotion">
                    <span
                      className="emotion-badge"
                      style={{
                        backgroundColor: getEmotionColor(primaryEmotion.name),
                      }}
                    >
                      {primaryEmotion.name}
                    </span>
                    <span className="emotion-time">
                      {friend.recentEmotion
                        ? formatEmotionDate(friend.recentEmotion.date)
                        : ""}
                    </span>
                  </div>
                ) : (
                  <p className="no-emotion">No recent mood data</p>
                )}
              </div>

              <div className="friend-actions">
                <button
                  className="remove-friend-btn"
                  onClick={() => onRemoveFriend(friend._id)}
                >
                  Remove Friend
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FriendsList;
