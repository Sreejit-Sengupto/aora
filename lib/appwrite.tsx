import { FormTypes } from "@/app/(tabs)/create";
import { ImagePickerAsset } from "expo-image-picker";
import {
  Client,
  Account,
  ID,
  Avatars,
  Models,
  Databases,
  Query,
  Storage,
  ImageGravity,
} from "react-native-appwrite";

export const appwriteConfing = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.sree.aora",
  projectId: "6670256c001b39dafb25",
  dbId: "66712b670008e99b53b4",
  userCollectionId: "66712b8c000aa0b95659",
  videoCollectionId: "66712ba70018b45b9017",
  storageId: "66712cb80012c19c16b1",
};

// Init your React Native SDK
const client = new Client();

client
  .setEndpoint(appwriteConfing.endpoint) // Your Appwrite Endpoint
  .setProject(appwriteConfing.projectId) // Your project ID
  .setPlatform(appwriteConfing.platform); // Your application ID or bundle ID.

const account = new Account(client);
const avatar = new Avatars(client);
const db = new Databases(client);
const storage = new Storage(client);

export const createUser = async (
  email: string,
  password: string,
  username: string
): Promise<Models.Document> => {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );
    if (!newAccount) {
      throw new Error(
        "failed to create user, something went wrong. Check credentials"
      );
    }

    const avatarUrl = avatar.getInitials(username);

    await signIn(email, password);
    const newUser = await db.createDocument(
      appwriteConfing.dbId,
      appwriteConfing.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        username: newAccount.name,
        email: newAccount.email,
        avatar: avatarUrl,
      }
    );
    return newUser;
  } catch (error: any) {
    console.log(error);
    throw new Error(error.message);
  }
};

export const signIn = async (
  email: string,
  password: string
): Promise<Models.Session> => {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (error: any) {
    console.log(error);
    throw new Error(error.message);
  }
};

export const signOut = async () => {
  try {
    const session = await account.deleteSession("current");
    return session;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getCurrUser = async () => {
  try {
    const currAccount = await account.get();
    if (!currAccount) {
      throw Error;
    }
    const currentUser = await db.listDocuments(
      appwriteConfing.dbId,
      appwriteConfing.userCollectionId,
      [Query.equal("accountId", currAccount.$id)]
    );
    if (!currentUser) {
      throw Error;
    }
    return currentUser.documents[0];
  } catch (error: any) {
    console.log(error);
  }
};

export const getAllPosts = async (): Promise<Models.Document[]> => {
  try {
    const posts = await db.listDocuments(
      appwriteConfing.dbId,
      appwriteConfing.videoCollectionId,
      [Query.orderDesc("$createdAt")]
    );
    return posts.documents;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const getLatestPosts = async (): Promise<Models.Document[]> => {
  try {
    const posts = await db.listDocuments(
      appwriteConfing.dbId,
      appwriteConfing.videoCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(7)]
    );
    return posts.documents;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const searchPosts = async (
  query: string
): Promise<Models.Document[]> => {
  try {
    const posts = await db.listDocuments(
      appwriteConfing.dbId,
      appwriteConfing.videoCollectionId,
      [Query.search("title", query)]
    );
    return posts.documents;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const getUserPosts = async (
  userId: string
): Promise<Models.Document[]> => {
  try {
    const posts = await db.listDocuments(
      appwriteConfing.dbId,
      appwriteConfing.videoCollectionId,
      [Query.equal("users", userId), Query.orderDesc("$createdAt")]
    );
    console.log(posts.documents);

    return posts.documents;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const getFilePreview = async (fileId: string, type: string) => {
  let fileUrl;
  try {
    if (type === "video") {
      fileUrl = storage.getFileView(appwriteConfing.storageId, fileId);
    } else if (type === "image") {
      fileUrl = storage.getFilePreview(
        appwriteConfing.storageId,
        fileId,
        2000,
        2000,
        ImageGravity.Top,
        100
      );
    } else {
      throw new Error("Invalid file type");
    }
    if (!fileUrl) {
      throw Error;
    }
    return fileUrl;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const uploadFile = async (file: ImagePickerAsset, type: string) => {
  if (!file) {
    return;
  }

  // const { mimeType, ...rest } = file;
  const asset = {
    // type: mimeType!,
    // ...rest,
    name: file.fileName || "",
    type: file.mimeType || "",
    size: file.fileSize || 0,
    uri: file.uri,
  };

  try {
    const uploadedFile = await storage.createFile(
      appwriteConfing.storageId,
      ID.unique(),
      asset
    );
    const fileUrl = await getFilePreview(uploadedFile.$id, type);
    return fileUrl;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const createVideo = async (form: FormTypes) => {
  try {
    const [thumbnailUrl, videoUrl] = await Promise.all([
      uploadFile(form.thumbnail!, "image"),
      uploadFile(form.videoUrl!, "video"),
    ]);

    const newPost = db.createDocument(
      appwriteConfing.dbId,
      appwriteConfing.videoCollectionId,
      ID.unique(),
      {
        title: form.title,
        thumbnail: thumbnailUrl,
        video: videoUrl,
        prompt: form.prompt,
        users: form.userId,
      }
    );

    return newPost;
  } catch (error: any) {
    throw new Error(error);
  }
};
