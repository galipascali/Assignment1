export interface PostData {
  message: string;
  sender: string;
  _id?: string;
}

export interface CommentData {
  text: string;
  sender: string;
  postId?: string;
  _id?: string;
}

export const postsData: PostData[] = [
  { message: "Hello", sender: "Alice" },
  { message: "World", sender: "Bob" },
];

export const commentsData: CommentData[] = [
  { text: "First comment", sender: "Alice" },
  { text: "Second comment", sender: "Bob" },
  { text: "Third comment", sender: "Charlie" },
];
