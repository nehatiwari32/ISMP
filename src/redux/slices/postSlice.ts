// src/redux/Slices/Post/postSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiRequest } from "../../api/apiServices";
import apiUrls from "../../api/endpoints";
import { CreatePostPayload, PaginationParams, PostState } from "../../utils/interfaces";

const initialState: PostState = {
  loading: false,
  success: false,
  error: null,
  posts: [],
  hasMorePost: false,
  hasMoreComments: false,
  comments: [],
  commentPage: 1,
  commentLoading: false,
  postType: 'global',
  selectLocality: null,
  localCategories: [],
  localityInfoList: [],
  totalPostCount: 0,
  totalPeople: 0,
  otherUserData: null,
  friendPosts: [],
  loadingFriendPosts: false,
  hasMoreFriendPosts: false,
  friendPostsPage: 1,
};

// ✅ Create Post API call
export const createPost = createAsyncThunk(
  "post/createPost",
  async (payload: CreatePostPayload, { rejectWithValue }) => {
    console.log('postPayload>>>>', payload);

    try {
      const res = await apiRequest({
        method: "POST",
        ...apiUrls.createPost(),
        data: payload,
      });
      return res;
    } catch (err: any) {
      return rejectWithValue(
        err?.data || err?.message || "Failed to create post"
      );
    }
  }
);

// ✅ Fetch Post
export const fetchPost = createAsyncThunk(
  "post/fetchPost",
  async (params: PaginationParams, { rejectWithValue }) => {

    try {
      const res = await apiRequest({
        method: "GET",
        ...apiUrls.getPosts(params),
      });
      return res?.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data || err?.message || "Failed to fetch posts"
      );
    }
  }
);

// ✅ Fetch Post
export const fetchFriendPost = createAsyncThunk(
  "post/fetchFriendPost",
  async (params: PaginationParams, { rejectWithValue }) => {

    try {
      const res = await apiRequest({
        method: "GET",
        ...apiUrls.frndPost(params),
      });

      return res?.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data || err?.message || "Failed to fetch posts"
      );
    }
  }
);

// ✅ Fetch Post
export const fetchOtherUserProfile = createAsyncThunk(
  "post/fetchOtherUserProfile",
  async (userId: string, { rejectWithValue }) => {

    try {
      const res = await apiRequest({
        method: "GET",
        ...apiUrls.getOtherUserProfile(userId),
      });
      return res?.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data || err?.message || "Failed to fetch posts"
      );
    }
  }
);

export const fetchHashTags = createAsyncThunk(
  "post/fetchHashTags",
  async (params: PaginationParams, { rejectWithValue }) => {

    try {
      const res = await apiRequest({
        method: "GET",
        ...apiUrls.getHashtags(params),
      });
      return res?.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data || err?.message || "Failed to fetch posts"
      );
    }
  }
);

// ✅ Fetch Post Details
export const getPostDetails = createAsyncThunk(
  "post/getPostDetails",
  async (payload: string, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "GET",
        ...apiUrls.postDetails(payload),
      });
      return res?.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data || err?.message || "Failed to fetch comments"
      );
    }
  }
);

// ✅ Add Like with correct payload
export const getLikeList = createAsyncThunk(
  "post/getLikeList",
  async (
    payload: PaginationParams,
    { rejectWithValue }
  ) => {
    try {
      const res = await apiRequest({
        method: "GET",
        ...apiUrls.getLike(payload),
      });
      return res?.data;

    } catch (err: any) {
      return rejectWithValue(
        err?.data || err?.message || "Failed to add like",
      );
    }
  }
);

// ✅ Add Like with correct payload
export const addLike = createAsyncThunk(
  "post/addLike",
  async (
    payload: { target_type: string; target_id: string },
    { rejectWithValue }
  ) => {
    console.log('payload>>>', payload);

    try {
      const res = await apiRequest({
        method: "POST",
        ...apiUrls.likeURL(),
        data: payload,
      });
      return {
        target_id: payload.target_id,
        data: res?.data,
      };

    } catch (err: any) {
      console.log('likeError>>>', err);
      return rejectWithValue({
        target_id: payload.target_id,
        error: err?.response?.data || err?.message || "Failed to add like",
      });
    }
  }
);

export const addReaction = createAsyncThunk(
  "post/addReaction",
  async (
    payload: { target_type: string; target_id: string, emoji: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiRequest({
        method: "POST",
        ...apiUrls.emojiReaction(),
        data: payload,
      });
      return {
        target_id: payload.target_id,
        data: res?.data,
      };
    } catch (err: any) {
      return rejectWithValue({
        target_id: payload.target_id,
        error: err?.response?.data || err?.message || "Failed to add like",
      });
    }
  }
);

// ✅ Unlike with correct payload
export const unLike = createAsyncThunk(
  "post/unLike",
  async (
    payload: { target_type: string; target_id: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiRequest({
        method: "DELETE",
        ...apiUrls.likeURL(),
        data: payload,
      });
      return {
        target_id: payload.target_id,
        data: res?.data,
      };
    } catch (err: any) {
      return rejectWithValue({
        target_id: payload.target_id,
        error: err?.response?.data || err?.message || "Failed to unlike",
      });
    }
  }
);

// ✅ Add Comment (Parent ya Reply dono ke liye)
export const addComment = createAsyncThunk(
  "post/addComment",
  async (
    payload: {
      post_id: string;
      story_id?: string;
      text: string;
      parent_comment_id?: string;
    },
    { rejectWithValue }
  ) => {

    try {
      const res = await apiRequest({
        method: "POST",
        ...apiUrls.commentURL(),
        data: payload,
      });

      return {
        data: res?.data,
      };
    } catch (err: any) {
      return rejectWithValue({
        error: err?.response?.data || err?.message || "Failed to add comment",
      });
    }
  }
);

// ✅ Fetch Comments with Pagination
export const fetchComments = createAsyncThunk(
  "post/fetchComments",
  async (payload: PaginationParams, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "GET",
        ...apiUrls.getCommentURL(payload),
      });
      return {
        ...res?.data,
        page: payload.page || 1,
      };
    } catch (err: any) {
      return rejectWithValue(
        err?.data?.message || err?.message || "Failed to fetch comments"
      );
    }
  }
);

export const localityCategories = createAsyncThunk(
  "post/localityCategories",
  async (payload: PaginationParams, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "GET",
        ...apiUrls.locazCategory(payload),
      });
      return res?.data?.categories;
    } catch (err: any) {
      return rejectWithValue(
        err?.data || err?.message || "Failed to fetch comments"
      );
    }
  }
);

export const localityInfo = createAsyncThunk(
  "post/localityInfo",
  async (payload: PaginationParams, { rejectWithValue }) => {
    try {
      const res = await apiRequest({
        method: "GET",
        ...apiUrls.locazInfo(payload),
      });
      return res?.data?.locality_infos;
    } catch (err: any) {
      return rejectWithValue(
        err?.data || err?.message || "Failed to fetch comments"
      );
    }
  }
);

// ✅ Like Comment (Parent ya Reply dono ke liye)
export const likeComment = createAsyncThunk(
  "post/likeComment",
  async (
    payload: {
      comment_id: string;
      is_reply?: boolean;
      parent_id?: string
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiRequest({
        method: "POST",
        ...apiUrls.likeURL(),
        data: {
          target_type: "comment",
          target_id: payload.comment_id,
        },
      });
      return {
        comment_id: payload.comment_id,
        is_reply: payload.is_reply,
        parent_id: payload.parent_id,
        data: res?.data,
      };
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err?.message);
    }
  }
);

// ✅ Unlike Comment
export const unlikeComment = createAsyncThunk(
  "post/unlikeComment",
  async (
    payload: {
      comment_id: string;
      is_reply?: boolean;
      parent_id?: string
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiRequest({
        method: "DELETE",
        ...apiUrls.likeURL(),
        data: {
          target_type: "comment",
          target_id: payload.comment_id,
        },
      });
      return {
        comment_id: payload.comment_id,
        is_reply: payload.is_reply,
        parent_id: payload.parent_id,
        data: res?.data,
      };
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err?.message);
    }
  }
);

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    resetPostState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.posts = [];
      state.hasMorePost = false;
    },
    resetCommentState: (state) => {
      state.comments = [];
      state.commentPage = 1;
      state.hasMoreComments = false;
      state.commentLoading = false;
    },
    toggleLikeOptimistic: (state, action: PayloadAction<string>) => {
      const post = state.posts.find((p) => p._id === action.payload);
      if (post) {
        post.liked = !post.liked;
        post.likes_count += post.liked ? 1 : -1;
      }
    },
    incrementCommentCount: (state, action: PayloadAction<string>) => {
      const post = state.posts.find((p) => p._id === action.payload);
      if (post) {
        post.comments_count += 1;
      }
    },
    changePostType: (state, action: PayloadAction<string>) => {
      state.postType = action.payload;
    },
    setLocality: (state, action: PayloadAction<string>) => {
      state.selectLocality = action.payload;
    },

  },
  extraReducers: (builder) => {
    builder
      // Fetch Posts
      .addCase(fetchPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPost.fulfilled, (state, action) => {
        const { items, pagination } = action.payload;
        const { total, page, } = pagination
        state.loading = false;

        state.totalPostCount = pagination?.total_post_count || 0
        state.totalPeople = pagination?.total_users_count || 0
        if (page === 1) {
          state.posts = items;
        } else {
          state.posts = [...state.posts, ...items];
        }

        state.hasMorePost = state.posts.length < total;
      })
      .addCase(fetchPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

    builder.addCase(fetchFriendPost.pending, (state) => {
      state.loadingFriendPosts = true;
    });

    builder.addCase(fetchFriendPost.fulfilled, (state, action) => {
      const { posts, page, total } = action.payload;
      state.friendPosts = action.payload;
      state.loadingFriendPosts = false;

      // if (page === 1) {
      //   state.friendPosts = posts || [];
      // } else {
      //   state.friendPosts = [...state.friendPosts, ...(posts || [])];
      // }

      // state.friendPostsPage = page;
      // state.hasMoreFriendPosts = state.friendPosts.length < total;
    });

    builder.addCase(fetchFriendPost.rejected, (state, action) => {
      state.loadingFriendPosts = false;
      state.error = action.payload as string;
    })

      // Create Post
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string;
      })

    builder.addCase(addReaction.fulfilled, (state, action) => {
      const { target_id, data } = action.payload;

      const post = state.posts.find((p) => p._id === target_id);
      if (post) {
        post.emojis_count = {
          ...post.emojis_count,
          [data.emoji]: data.count
        };
      }
    })

      // Like Post
      .addCase(addLike.fulfilled, (state, action) => {
        const post = state.posts.find((p) => p._id === action.payload.target_id);
        if (post && action.payload.data) {
          post.liked = action.payload.data.liked;
          post.likes_count = action.payload.data.likes_count;
        }
      })
      .addCase(addLike.rejected, (state, action: any) => {
        const post = state.posts.find((p) => p._id === action.payload?.target_id);
        if (post) {
          post.liked = false;
          post.likes_count = Math.max(0, post.likes_count - 1);
        }
      })

      // Unlike Post
      .addCase(unLike.fulfilled, (state, action) => {
        const post = state.posts.find((p) => p._id === action.payload.target_id);
        if (post && action.payload.data) {
          post.liked = action.payload.data.liked;
          post.likes_count = action.payload.data.likes_count;
        }
      })
      .addCase(unLike.rejected, (state, action: any) => {
        const post = state.posts.find((p) => p._id === action.payload?.target_id);
        if (post) {
          post.liked = true;
          post.likes_count += 1;
        }
      })

      // Fetch Comments
      .addCase(fetchComments.pending, (state) => {
        state.commentLoading = true;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.commentLoading = false;
        const { items, page, total } = action.payload;
        const newComments = items || [];

        if (page === 1) {
          state.comments = newComments;
        } else {
          state.comments = [...state.comments, ...newComments];
        }

        state.commentPage = page;
        state.hasMoreComments = state.comments.length < (total || 0);
      })
      .addCase(fetchComments.rejected, (state) => {
        state.commentLoading = false;
      })

      // Local Categories
      .addCase(localityCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(localityCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.localCategories = action?.payload
      })
      .addCase(localityCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Locallity Categories
      .addCase(localityInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(localityInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.localityInfoList = action?.payload
      })
      .addCase(localityInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Add Comment
      .addCase(addComment.fulfilled, (state, action) => {
        const post = state.posts.find((p) => p._id === action.payload.target_id);
        if (post && action.payload.data?.comments_count !== undefined) {
          post.comments_count = action.payload.data.comments_count;
        }

        // Add to state
        if (action.payload.parent_comment_id) {
          // Reply hai
          const parentComment = state.comments.find(
            (c) => c._id === action.payload.parent_comment_id
          );
          if (parentComment && action.payload.data?.comment) {
            if (!parentComment.replies) {
              parentComment.replies = [];
            }
            parentComment.replies.push(action.payload.data.comment);
          }
        } else {
          // Parent comment hai
          if (action.payload.data?.comment) {
            state.comments.unshift(action.payload.data.comment);
          }
        }
      })

      // Like Comment
      .addCase(likeComment.fulfilled, (state, action) => {
        if (action.payload.is_reply && action.payload.parent_id) {
          // Reply ko like kiya
          const parent = state.comments.find(
            (c) => c._id === action.payload.parent_id
          );
          if (parent?.replies) {
            const reply = parent.replies.find(
              (r) => r._id === action.payload.comment_id
            );
            if (reply) {
              reply.liked = true;
              reply.likes_count += 1;
            }
          }
        } else {
          // Parent comment ko like kiya
          const comment = state.comments.find(
            (c) => c._id === action.payload.comment_id
          );
          if (comment) {
            comment.liked = true;
            comment.likes_count += 1;
          }
        }
      })

      // Unlike Comment
      .addCase(unlikeComment.fulfilled, (state, action) => {
        if (action.payload.is_reply && action.payload.parent_id) {
          const parent = state.comments.find(
            (c) => c._id === action.payload.parent_id
          );
          if (parent?.replies) {
            const reply = parent.replies.find(
              (r) => r._id === action.payload.comment_id
            );
            if (reply) {
              reply.liked = false;
              reply.likes_count = Math.max(0, reply.likes_count - 1);
            }
          }
        } else {
          const comment = state.comments.find(
            (c) => c._id === action.payload.comment_id
          );
          if (comment) {
            comment.liked = false;
            comment.likes_count = Math.max(0, comment.likes_count - 1);
          }
        }
      });

    // Fetch Other User Profile
    builder.addCase(fetchOtherUserProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
      .addCase(fetchOtherUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.otherUserData = action.payload;
      })
      .addCase(fetchOtherUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.otherUserData = null;
      });
  },
});

export const {
  resetPostState,
  resetCommentState,
  toggleLikeOptimistic,
  changePostType,
  setLocality,
  incrementCommentCount,
} = postSlice.actions;

export default postSlice.reducer;