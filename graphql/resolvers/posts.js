const Post = require('../../models/Post')

module.exports = {
    Query: {
        async getPosts() {
            try {
                const posts = await Post.find();
                return posts;
            } catch (err) {
                throw new Error(err);
            }
        },

        async getPost(_, {
            postId
        }) {
            try {
                const post = await Post.findById(postId);
                console.log(post)
                if (post) {
                    return post;
                } else {
                    throw new Error('Post not Found');
                }
            } catch (err) {
                throw new Error(err);
            }
        }
    }


}