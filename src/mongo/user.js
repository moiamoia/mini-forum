const mongoose = require('mongoose');
const {db} = require('./connect')

const uuid = require('uuid/v4');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    nicheng: {
        type: String,
        unique: true,
        required: false,
        // default: ''
    },
    createDate: {
        type: Date,
        default: Date.now
    },
    question: {
        type: String
    },
    answer: {
        type: Date
    },
    key: {
        type: String
    }
})

const UserModel = db.model("user", UserSchema, "user");

/**
 * 登录
 */
function toLogin(request,session) {
    return new Promise((resolve, reject) => {
        UserModel.findOne({
            username: request.username,
            password: request.password
        }, {
            username: 1,
            nicheng: 1,
            createDate: 1
        }, async(error, docs) => {
            if (docs) {
                const key = uuid();

                session.key = key;
                await updateKey(docs._id, key)
                resolve(Object.assign({}, JSON.parse(JSON.stringify(docs)), {key, _id: null}));
            } else {
                reject();
            }
        });
    })
}

function updateKey(id, key) {
    return new Promise((resolve, reject) => {
        UserModel.findByIdAndUpdate(id, {key}).then(() => {
            resolve();
        })
    })

}

exports.login = (request,session) => toLogin(request,session);

/**
 * 注册
 */
function checkusers(request) {
    return new Promise((resolve, reject) => {
        UserModel.findOne(request, {
            username: 1
        }, (error, docs) => {
            if (!docs) { //没有注册过
                resolve()
            } else {
                reject();
            }
        });
    })
}

exports.checkuser = request => checkusers(request);
exports.regist = request => {
    return new Promise((resolve, reject) => {
        checkusers({username: request.username}).then(() => {
            UserModel.create(request, (error, docs) => {
            //  console.log(request,error)
                if (!error) {
                    resolve()
                } else {
                    reject();
                }
            });
        }, () => {
            reject();
        })
    })
}

/**
 * 个人信息
 */

function findUserByKey(key) {
    return new Promise((resolve, reject) => {
        UserModel.findOne({
            key
        }, {
            nicheng: 1,
            username: 1,
            createDate: 1
        }).exec((error, docs) => {
            if (docs) {
                resolve(docs)
            } else {
                reject()
            }
        })
    })
}

exports.findUserByKey = findUserByKey;

exports.myuser = request => {
    const {findArticleByUserId_Count} = require('./article');
    return new Promise((resolve, reject) => {
        if (!request.key) {
            reject();
            // return;
        }
        findUserByKey(request.key).then(data => {
            findArticleByUserId_Count(data._id).then(articleNum => {
                resolve(Object.assign({}, JSON.parse(JSON.stringify(data)), {articleNum}))
            })
        })
    })
}

exports.changeNicheng = request => {
    const {changeArticleAuthor} = require('./article');
    const nicheng = request.nicheng;
    return new Promise((resolve, reject) => {
        checkusers({nicheng}).then(() => {
            UserModel.findOneAndUpdate({
                key: request.key
            }, {
                nicheng
            }, (error, doc) => {
                if (doc) {
                    changeArticleAuthor(doc._id,nicheng);
                    resolve();
                } else {
                    reject({error: 操作失败})
                }
            })
        }, () => {
            reject({error: '该昵称已被使用'})
        })
    })
}

function findUserById(id){
  return new Promise((resolve,reject)=>[
      UserModel.findById(id,{
        _id:0,
        username:1,
        nicheng:1,
      },(error,docs)=>{
          if(docs){
            resolve(docs)
          }else{
            reject();
          }
      })
  ])
}

exports.findUserById = findUserById;

/**
 * 注销
 */

exports.logout = request => {
    return new Promise((resolve, reject) => {
        UserModel.findOneAndUpdate({
            key: resolve.key
        }, {
            key: ''
        }).then(() => {
            resolve();
        })
    })
}

/**
 * 我的文章
 */
exports.myArticles = request => {
    const {findArticlesByUserId} =require('./article');
    if(request.id){
      return findArticlesByUserId(request.id)
    }else{
      return findUserByKey(request.key).then(data => findArticlesByUserId(data._id))
    }
}
