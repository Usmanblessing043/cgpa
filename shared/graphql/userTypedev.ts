export const usertypeDefs = `

enum Role {
  customer
  vendor
  rider
  admin
}

type User {
  id: ID!
  name: String!
  email: String!
  role: Role!
  phone: String

  # Vendor
  businessName: String
  businessAddress: String
  businessType: String

  # Rider
  vehicleType: String
  vehicleNumber: String

  createdAt: String
  cart: [CartItem]
  isBanned: Boolean
}

input UserInput {
  name: String!
  email: String!
  password: String!
  role: Role!
  phone: String

  businessName: String
  businessAddress: String
  businessType: String

  vehicleType: String
  vehicleNumber: String
}

input CartItemInput {
  productId: String
  name: String
  price: Float
  qty: Int
  image: String
}
type LoginResponse {
  token: String!
  user: User!
}

type CartItem {
  productId: String
  name: String
  price: Float
  qty: Int
  image: String
}

type Query {
  users: [User]
  oneuser(id: ID!): User
  me: User
  vendors: [User]
  cart: [CartItem]
   adminUsers: [User]
}

type Mutation {
  createuser(input: UserInput!): User
  login(email: String!, password: String!): LoginResponse
  updateCart(cart: [CartItemInput]!): User
  deleteUser(id: ID!): String
  banUser(id: ID!): String
  unbanUser(id: ID!): String
}
`;