const mongoose = require('mongoose');
const {db} = require('./connect')

const ArticleSchema = new mongoose.Schema({
    title: {
        type: String,
        unique: false,
        required: true
    },
    createTime: {
        type: Date,
        default: Date.now
    },
    updateTime: {
        type: Date,
        default: Date.now
    },
    user: {
        type: String,
        unique: false,
        required: false,
        default: '游客'
    },
    article: {
        type: String,
        unique: false
    },
    see: {
        type: Number,
        default: 0
    },
    userId: {
        type: String
    }
})

const ArticleModel = db.model("article", ArticleSchema, "article");

function findById(request) { //进入文章页面
    return new Promise((resolve, reject) => {
        ArticleModel.findById(request.id, (error, docs) => {
            if (docs) {
                addSee(request.id, docs.see + 1)
                resolve(docs)
            } else {
                reject();
            }
        });
    })
}

function addSee(id, see) { //文章浏览次数添加
    ArticleModel.findByIdAndUpdate(id, {
        see
    }, (error, doc) => {
        // console.log(see,doc)
    })
}

function findArticles(current) { //index
    return new Promise(async(resolve, reject) => {
        const count = await ArticleModel.count({}, (error, docs) => docs);

        const query = ArticleModel.find({}, {
            title: 1,
            createTime: 1,
            user: 1,
            see: 1
        }).sort({'_id': -1}).skip(10 * current).limit(10)

        var promise = query.exec();

        promise.then(data => {
            resolve(Object.assign(data, {count}));
        }, () => reject())
    })
}

exports.findArticleByUserId_Count = userId => {
    return new Promise(resolve => {
        ArticleModel.count({userId}).then(count=> {resolve(count)})
    })
}

exports.findArticlesByUserId = userId => {
    return new Promise((resolve, reject) => {
        ArticleModel.find({
            userId
        }, {
            title: 1,
            see: 1,
            createTime: 1
        }, (error, docs) => {
            if (docs) {
                resolve(docs)
            } else {
                reject();
            }
        })
    })
}

exports.getArticle = request => findById(request);

exports.allArticle = request => findArticles(request);

const {myuser} = require('./user')

exports.saveArticle = async data => {
    if (data.key) {
        await myuser({key: data.key}).then(re => {
            console.log(re)
            Object.assign(data, {
                user: re.nicheng || re.username,
                userId: re._id
            })
        })
    }
    return new Promise((resolve, reject) => {
        ArticleModel.create(data, (err, doc) => {
            if (doc) {
                resolve(doc);
            } else {
                reject();
            }
        })
    })
}
