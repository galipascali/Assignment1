export interface PostData {
  message: string;
  sender?: string;
  _id?: string;
}
export interface UserData {
  name: string;
  email: string;
  password: string;
  token?: string;
  _id?: string;
}

export interface CommentData {
  text: string;
  sender?: string;
  postId?: string;
  _id?: string;
}

export const postsData: PostData[] = [
  { message: "Hello" },
  { message: "World" },
];

export const commentsData: CommentData[] = [
  { text: "First comment" },
  { text: "Second comment" },
  { text: "Third comment" },
];
