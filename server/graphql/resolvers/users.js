const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Post = require('../../models/Post')

const {
    SECRET_KEY
} = require('../../config')
const User = require('../../models/User')
const {
    UserInputError,
    AuthenticationError
} = require('apollo-server')

const {
    validateRegisterInput,
    validateLoginInput
} = require('../../utils/validators')


const checkAuth = require('../../utils/check_auth')
const {
    assertWrappingType
} = require('graphql')
const {
    argsToArgsConfig
} = require('graphql/type/definition')


function generateToken(user) {
    return jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username

    }, SECRET_KEY, {
        expiresIn: '1h'
    });
}



module.exports = {
    Mutation: {
        async login(_, {
            username,
            password
        }) {
            const {
                errors,
                valid
            } = validateLoginInput(username, password);

            if (!valid) {
                throw new UserInputError('Wrong credentials', {
                    errors
                });
            }

            const user = await User.findOne({
                username
            });
            if (!user) {
                errors.general = 'User not found';
                throw new UserInputError('Wrong credentials', {
                    errors
                });
            }
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                errors.general = 'Wrong credentials';
                throw new UserInputError('Wrong credentials', {
                    errors
                });
            }
            const token = generateToken(user);
            return {
                ...user._doc,
                id: user._id,
                token
            }
        },



        async register(_, {
            registerInput: {
                username,
                email,
                password,
                confirmPassword
            }
        }, context, info) {
            // Validate user data
            const {
                valid,
                errors
            } = validateRegisterInput(username, email, password, confirmPassword);
            if (!valid) {
                throw new UserInputError('Error', {
                    errors
                });
            }


            // User doesn't already  exits
            const user = await User.findOne({
                username
            });

            if (user) {
                throw new UserInputError('Username is taken', {
                    errors: {
                        username: ' This username is taken'
                    }
                })
            }


            // hash password and create and auth token
            password = await bcrypt.hash(password, 12);

            const newUser = new User({
                email,
                username,
                password,
                createdAt: new Date().toISOString()
            });

            const res = await newUser.save();

            const token = generateToken(res);

            return {
                ...res._doc,
                id: res._id,
                token
            }
        },

        //  Post Create

        async createPost(_, {
            body
        }, context) {
            const user = checkAuth(context);

            if (args.body.trim() === '') {
                throw new Error('Post Body Must not Be empty');
            }


            const newPost = new Post({
                body,
                user: user.id,
                username: user.username,
                createdAt: new Date().toISOString()
            });

            console.log(new Date().toISOString())


            const post = await newPost.save();
            context.pubsub.publish('NEW_POST', {
                newPost: post
            })
            return post;


        },


        async deletePost(_, {
            postId
        }, context) {
            const user = checkAuth(context);
            try {
                const post = await Post.findById(postId);
                if (user.username === post.username) {
                    await post.delete();
                    return 'Post Deleted Successfully';
                } else {
                    throw new AuthenticationError('Action not Allowed');
                }
            } catch (err) {
                throw new Error(err)
            }
        },

        async createComment(_, {
            postId,
            body
        }, context) {
            const {
                username
            } = checkAuth(context);

            if (body.trim() === '') {
                throw new UserInputError('Empty Comment', {
                    errors: {
                        body: 'Comment Body must not empty'
                    }
                })
            }

            const post = await Post.findById(postId);
            if (post) {
                post.comments.unshift({
                    body,
                    username,
                    createdAt: new Date().toISOString()
                });
                await post.save();
                return post;
            } else {
                throw new UserInputError('Post not found')
            }

        },
        async deleteComment(_, {
            postId,
            commentId
        }, context) {
            const {
                username
            } = checkAuth(context);
            const post = await Post.findById(postId);

            if (post) {
                const commentIndex = post.comments.findIndex((c) => c.id === commentId);
                if (post.comments[commentIndex].username === username) {
                    post.comments.splice(commentIndex, 1);
                    await post.save();
                    return post;
                } else {
                    throw new AuthenticationError('Action not allowed')
                }
            } else {
                throw new UserInputError('Post not found')
            }
        },

        async likePost(_, {
            postId
        }, context) {
            const {
                username
            } = checkAuth(context);
            const post = await Post.findById(postId);
            if (post) {
                if (post.likes.find((like) => like.username === username)) {
                    post.likes = post.likes.filter(like => like.username !== username);

                } else {
                    post.likes.push({
                        username,
                        createdAt: new Date().toISOString()
                    })
                }
                await post.save();
                return post;
            } else {
                throw new UserInputError('Post not found')
            }
        }
    },
    Subscription: {
        newPost: {
            subscribe: (_, __, {
                pubsub
            }) => pubsub.asyncIterator('NEW_POST')
        }
    }
}