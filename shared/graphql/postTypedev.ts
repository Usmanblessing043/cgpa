export const posttypeDefs = `

type Post {
  id: ID!
  name: String!
  price: Float!
  category: String!
  image: String!
  author: String!
  createdAt: String
}
type CartItem {
  name: String
  qty: Int
}
type PostPagination {
  posts: [Post]
  total: Int
  totalpages: Int
}
  type StatusHistory {
  status: String
  time: String
}
  type Vendor {
  id: ID!
  businessName: String
  businessAddress: String
}
  type AdminStats {
  totalUsers: Int
  totalOrders: Int
  totalVendors: Int
  totalRiders: Int
  revenue: Float
}

type Order {
  id: ID!
  customer: String
  vendor: String
  items: [CartItem]
  total: Float
  deliveryAddress: String
  status: String
  createdAt: String
  statusHistory: [StatusHistory] 
 
}
  type AdminOrder {
  id: ID!
  customer: User
  vendor: User
  rider: User
  items: [CartItem]
  total: Float
  status: String
  deliveryAddress: String
  createdAt: String
}

type Query {
  posts(page: Int, limit: Int): PostPagination
  post(id: ID!): Post
  vendorPosts(vendorId: ID!): [Post]
  vendor(id: ID!): Vendor  
  myOrders: [Order]
  vendorOrders: [Order]
  riderOrders: [Order] 
  myRiderOrders: [Order]
  completedRiderOrders: [Order]
  allOrders: [AdminOrder]
  adminStats: AdminStats
}

type Mutation {
  createPost(
    name: String!
    price: Float!
    category: String!
    image: String!
  ): Post

  deletePost(id: ID!): String

  updatePost(
    id: ID!
    name: String!
    price: Float!
    category: String!
    image: String!
  ): Post

  createOrder(
    items: [CartItemInput]!
    total: Float!
    deliveryAddress: String!
    vendorId: ID!
  ): Order

  updateOrderStatus(id: ID!, status: String!): Order

  acceptOrder(id: ID!): Order
  rejectOrder(id: ID!): Order
  sendDeliveryOTP(id: ID!): String
  verifyDeliveryOTP(id: ID!, otp: String!): Order
}




type Subscription {
  newOrder: AdminOrder
  orderUpdated: AdminOrder
}
`;