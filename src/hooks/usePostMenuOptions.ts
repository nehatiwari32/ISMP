import { useMemo } from "react";
import { Icons } from "../assets/icons";
import { Colors } from "../theme/colors";

type Params = {
  isOwnPost: boolean;
  savedState: boolean;
  friendState: boolean;
  followingState: boolean;
  blockState: boolean;
};

export const usePostMenuOptions = ({
  isOwnPost,
  savedState,
  friendState,
  followingState,
  blockState,
}: Params) => {
  return useMemo(() => {
    const options: any[] = [];

    // 1️⃣ Save / Unsave
    if (!isOwnPost) {
      options.push({
        key: "save",
        label: savedState ? "Unsave Post" : "Save",
        icon: Icons.save,
        color: Colors.primaryText,
      });
    }

    // 2️⃣ Search
    options.push({
      key: "search",
      label: "Search",
      icon: Icons.search,
      color: Colors.primaryText,
    });

    // 3️⃣ Add / Unfriend
    if (!isOwnPost && !blockState) {
      options.push(
        friendState
          ? {
            key: "unfriend",
            label: "Unfriend User",
            icon: Icons.unfriend,
            color: Colors.primaryText,
          }
          : {
            key: "add_user",
            label: "Add User",
            icon: Icons.addUser,
            color: Colors.primaryText,
          }
      );
    }

    // 4️⃣ Follow / Unfollow
    if (!isOwnPost && !blockState) {
      options.push({
        key: "follow",
        label: followingState ? "Unfollow User" : "Follow User",
        icon: followingState
          ? Icons.unfollowUser
          : Icons.notification,
        color: Colors.primaryText,
      });
    }

    // 5️⃣ Block / Unblock
    if (!isOwnPost) {
      options.push({
        key: "block",
        label: blockState ? "Unblock User" : "Block User",
        icon: Icons.blockUser,
        color: Colors.primaryText,
      });
    }

    // 6️⃣ Why seeing
    options.push({
      key: "why",
      label: "Why seeing this Post?",
      icon: Icons.whySeeing,
      color: Colors.primaryText,
    });

    // 7️⃣ Not Interested
    if (!isOwnPost) {
      options.push({
        key: "not_interested",
        label: "Not Interested",
        icon: Icons.notInterested,
        color: "#FF6B6B",
      });
    }

    // 8️⃣ Send Message
    if (!isOwnPost) {
      options.push({
        key: "message",
        label: "Send Message",
        icon: Icons.sendMessage,
        color: Colors.primaryText,
      });
    }

    // 9️⃣ Report
    if (!isOwnPost) {
      options.push({
        key: "report",
        label: "Report",
        icon: Icons.report,
        color: "#FF4444",
      });
    }

    return options;
  }, [isOwnPost, savedState, friendState, followingState, blockState]);
};
