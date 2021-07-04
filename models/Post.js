const { model, Schema } = require('mongoose')


const postSchema = new Schema({
    body: String,
    username: String,
    cratedAt: String,
    comments: [
        {
            body: String,
            username: String,
            createAt: String
        }
    ],
    links: [
        {
            username: String,
            createdAt: String
        }
    ],
    user:{
        type: Schema.Types.ObjectId,
        ref: 'users'
    }
});

module.exports = model('Post',postSchema);