const postsResolvers = require('./posts')
const userResolvers = require('./users')

module.exports = {
    Post: {
        likeCount: (parent) => parent.likes.length,
        commentCount: (parent) => parent.comments.length
    },
    Query: {
        ...postsResolvers.Query
    },
    Mutation: {
        ...userResolvers.Mutation
    },
    Subscription: {
        ...userResolvers.Subscription
    }
}