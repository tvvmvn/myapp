const mongoose = require('mongoose')
const Schema = mongoose.Schema


var user_schema = new Schema({
  email: { type: String },
  password: { type: String },
  salt: { type: String },
  username: { type: String },
  name: { type: String },
  following: [{ type: Schema.ObjectId, ref: 'User' }],
  about: { type: String }
})


var blog_schema = new Schema({
  user: { type: Schema.ObjectId, ref: 'User' },
  title: { type: String },
  content: { type: String },
  reg_date: { type: Date, default: Date.now() }
})

var file_schema = new Schema({
  table: { type: String },
  parent: { type: Schema.ObjectId },
  name: { type: String },
  md_name: { type: String },
  reg_date: { type: Date, default: Date.now() }
})


exports.User = mongoose.model('User', user_schema)
exports.Blog = mongoose.model('Blog', blog_schema)
exports.File = mongoose.model('File', file_schema)