import { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLBoolean, GraphQLList, GraphQLNonNull } from 'graphql';

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLInt) },
    username: { type: new GraphQLNonNull(GraphQLString) },
    displayName: { type: new GraphQLNonNull(GraphQLString) },
    avatar: { type: GraphQLString },
    bio: { type: GraphQLString },
    badges: { type: GraphQLString },
    stats: { type: GraphQLString },
    role: { type: new GraphQLNonNull(GraphQLString) },
    createdAt: { type: new GraphQLNonNull(GraphQLString) },
    updatedAt: { type: new GraphQLNonNull(GraphQLString) }
  }
});

const AuthResponseType = new GraphQLObjectType({
  name: 'AuthResponse',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLInt) },
    username: { type: new GraphQLNonNull(GraphQLString) },
    displayName: { type: new GraphQLNonNull(GraphQLString) },
    avatar: { type: GraphQLString },
    token: { type: new GraphQLNonNull(GraphQLString) },
    message: { type: GraphQLString }
  }
});

const ErrorResponseType = new GraphQLObjectType({
  name: 'ErrorResponse',
  fields: {
    message: { type: new GraphQLNonNull(GraphQLString) },
    success: { type: new GraphQLNonNull(GraphQLBoolean) }
  }
});

const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    getAllUsers: {
      type: new GraphQLList(UserType),
      resolve: (parent, args, context) => context.resolvers.getAllUsers(parent, args, context)
    },
    getUserById: {
      type: UserType,
      args: { id: { type: new GraphQLNonNull(GraphQLInt) } },
      resolve: (parent, args, context) => context.resolvers.getUserById(parent, args, context)
    },
    validateUser: {
      type: GraphQLBoolean,
      args: { token: { type: new GraphQLNonNull(GraphQLString) } },
      resolve: (parent, args, context) => context.resolvers.validateUser(parent, args, context)
    }
  }
});

const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    registerUser: {
      type: AuthResponseType,
      args: {
        username: { type: new GraphQLNonNull(GraphQLString) },
        displayName: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: (parent, args, context) => context.resolvers.registerUser(parent, args, context)
    },
    updateUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLInt) },
        displayName: { type: GraphQLString },
        avatar: { type: GraphQLString },
        bio: { type: GraphQLString }
      },
      resolve: (parent, args, context) => context.resolvers.updateUser(parent, args, context)
    },
    deleteUser: {
      type: ErrorResponseType,
      args: { id: { type: new GraphQLNonNull(GraphQLInt) } },
      resolve: (parent, args, context) => context.resolvers.deleteUser(parent, args, context)
    }
  }
});

const schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType
});

export default schema;
