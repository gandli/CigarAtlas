/**
 * 雪茄数据模型
 */
export interface Cigar {
  id: string;
  name: string;
  brand: string;
  origin: string;
  strength: 'mild' | 'medium' | 'full';
  wrapper: string;
  binder: string;
  filler: string;
  length: number;  // mm
  ringGauge: number;  // mm
  shape: string;
  price: number;
  rating: number;
  description: string;
  flavors: string[];
  images: string[];
}

/**
 * 品鉴记录数据模型
 */
export interface JournalEntry {
  id: string;
  cigarId: string;
  cigarName: string;
  userId: string;
  date: string;
  rating: number;
  drawRating: number;
  burnRating: number;
  flavorRating: number;
  overallRating: number;
  notes: string;
  flavors: string[];
  pairing: string;  // 搭配饮品
  smokingDuration: number;  // 分钟
  images: string[];
  location: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 用户数据模型
 */
export interface User {
  id: string;
  username: string;
  nickname: string;
  avatar: string;
  bio: string;
  location: string;
  following: number;
  followers: number;
  journals: number;
  createdAt: string;
}

/**
 * 聚会数据模型
 */
export interface Meetup {
  id: string;
  title: string;
  description: string;
  hostId: string;
  hostName: string;
  location: string;
  latitude: number;
  longitude: number;
  date: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  participants: Participant[];
  status: 'draft' | 'upcoming' | 'ongoing' | 'ended' | 'cancelled';
  fee: number;
  feeNote: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * 聚会参与者
 */
export interface Participant {
  userId: string;
  username: string;
  avatar: string;
  joinedAt: string;
  status: 'joined' | 'interested' | 'declined';
}

/**
 * 雪茄柜库存数据模型
 */
export interface HumidorItem {
  id: string;
  cigarId: string;
  cigarName: string;
  brand: string;
  quantity: number;
  purchaseDate: string;
  purchasePrice: number;
  storageLocation: string;
  humidity: number;
  temperature: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  notes: string;
  addedAt: string;
  updatedAt: string;
}

/**
 * 帖子数据模型
 */
export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  images: string[];
  cigarTag?: string;
  locationTag?: string;
  likes: number;
  comments: number;
  shares: number;
  likedByUser: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 评论数据模型
 */
export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  likes: number;
  replyTo?: string;
  createdAt: string;
}