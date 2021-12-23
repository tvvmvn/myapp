var { User, Blog } = require('../models/model')
var crypto = require('crypto');


// Index
exports.index = async (req, res, next) => {
  try {
    var user = await User.findById(req.session.user)

    if (!req.session.user) {
      res.redirect('/login')
    }

    var search
    if (req.query.q===undefined && req.query.p===undefined ) {
      search = { user: user.following }
    } 
    
    if (req.query.q===undefined && req.query.p) {
      var x = await User.findOne({ username: req.query.p })
      search = { user: x._id }
    }

    if (req.query.q && req.query.p===undefined) {
      search = { title: { $regex: req.query.q } }
    }
 
    var posts = await Blog.find(search).populate('user').sort([['reg_date', 'descending']])
    
    res.render('index', { title: 'Express', posts: posts });
  } catch (error) {
    res.render('error', { error: error })
  }
}

// Blog
exports.blog_create_get = async (req, res, next) => {
  try {
    if (req.query.id) {
      var post = await Blog.findById(req.query.id)
    }

    res.render('blog_form', { title: 'Create blog', post: post })
  } catch (error) {
    res.render('error', { error: error })
  }
}

exports.blog_create_post = async (req, res, next) => {
  try {
    var user = await User.findById(req.session.user)
    if (req.query.id) {
      var post = await Blog.findById(req.query.id)
      post.title = req.body.title
      post.content = req.body.content
      await post.save()
    } else {
      var post = new Blog({
        user: user._id,
        title: req.body.title,
        content: req.body.content,
      })
      await post.save()
    }
    res.redirect('/' + user.username)
  } catch (error) {
    res.render('error', { error: error })
  }
}

// Follow
exports.followers = async (req, res, next) => {
  try {
    var user = await User.findOne({ username: req.params.username })
    var followers = await User.find({ following: user._id })
    res.render('user_follower_list', { title: 'Followers', followers: followers })
  } catch (error) {
    res.render('error', { error: error })
  }
}

exports.following = async (req, res, next) => {
  try {
    var user = await User.findOne({ username: req.params.username }).populate('following')
    res.render('user_following_list', { title: 'Following', user: user })
  } catch (error) {
    res.render('error', { error: error })
  }
}

exports.follow = async (req, res, next) => {
  try {
    var user = await User.findById(req.session.user)
    
    if (!user.following.includes(req.body.id)) {
      user.following.push(req.body.id)
    }
    await user.save()

    res.send('good')
  } catch (error) {
    console.log(error)
  }
}

// User
exports.login_get = async (req, res, next) => {
  try {
    res.render('user_login_form', { title: 'Login' })
  } catch (error) {
    res.render('error', { error: error })
  }
}

exports.login_post = async (req, res, next) => {
  try {
    var user = await User.findOne({ email: req.body.email })
    if (!user) {
      console.log('no user')
      return res.redirect('/login')
    }

    var hashed_password = crypto.pbkdf2Sync(req.body.password, user.salt, 310000, 32, 'sha256').toString('hex')
    if (user.password!==hashed_password) {
      console.log('wrong password')
      return res.redirect('/login')
    }

    req.session.user = user._id
    res.redirect('/')
  } catch (error) {
    res.render('error', { error: error })
  }
}

exports.logout = async (req, res, next) => {
  try {
    delete req.session.user
    console.log(req.session)
    res.redirect('/')
  } catch (error) {
    res.render('error', { error: error })
  }
}

exports.sign_up_get = async (req, res, next) => {
  try {
    res.render('user_sign_up_form', { title: 'Sign up' })
  } catch (error) {
    res.render('error', { error: error })
  }
}

exports.sign_up_post = async (req, res, next) => {
  try {
    var user = await User.findOne({ email: req.body.email })
    var errors = []
    var error

    if (user) {
      error = 'email is already in use'
      errors.push(error)
      if (user.username===req.body.username) {
        error = 'username is already in use'
        errors.push(error)
      }
    }
    if (!req.body.email.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/)) {
      error = 'Not an valid email address'
      errors.push(error)
    }
    if (req.body.password!==req.body.password_confirm) {
      error = 'password not identical'
      errors.push(error)
    }
    if (!req.body.password.match(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/)) {
      error = 'Password, at least one lowercase and uppercase alphabet more than 8 letter'
      errors.push(error)
    }
    if (!req.body.username.match(/[a-z0-9_]{5,}/)) {
      error = 'Username, lowercase alphabet and number more than 5 letter'
      errors.push(error)
    }

    if (errors.length>0) {
      return res.send({ errors: errors })
    }

    var salt = crypto.randomBytes(16).toString('hex');
    var hashed_password = crypto.pbkdf2Sync(req.body.password, salt, 310000, 32, 'sha256').toString('hex')
    
    var user = new User({
      email: req.body.email,
      password: hashed_password,
      salt: salt,
      username: req.body.username
    })

    await user.save() 
    req.session.user = user._id
    res.send({ errors: null })
  } catch (error) {
    console.log(error)
  }
}

exports.account_edit_get = async (req, res, next) => {
  try {
    var user = await User.findById(req.session.user)
    res.render('user_account_form', { title: 'Edit profile', user: user })
  } catch (error) {
    res.render('error', { error: error })
  }
}

exports.account_edit_post = async (req, res, next) => {
  try {
    var user = await User.findById(req.session.user)

    user.name = req.body.name
    user.about = req.body.about
    await user.save()

    // if (req.files) {
    //   var my_file = req.files.my_file
    //   var new_file_name = my_file.md5 + '.' + my_file.name.split('.').pop()
    //   upload_path = 'files/user/' + new_file_name
    //   await my_file.mv(upload_path)
    //   new_file_names.push(new_file_name)

    //   var file = new File({
    //     table: 'user',
    //     parent: user._id,
    //     name: '',
    //     md_name: ''
    //   })
    //   await file.save()
    // }

    res.send({ errors: null, username: user.username })
  } catch (error) {
    console.log(error)
  }
}

exports.account = async (req, res, next) => {
  try {
    // user and posts
    var user = await User.findOne({ username: req.params.username })
    var posts = await Blog.find({ user: user._id }).sort([['reg_date', 'descending']])

    // follow button
    var follow = false
    if (req.session.user.toString()!==user._id.toString()) {
      var login_user = await User.findById(req.session.user)
      if (login_user.following.includes(user._id)) {
        follow = true
      }
    } 

    // follower
    var follower = await User.countDocuments({ following: user._id })
    console.log(follower)

    // render 
    var data = { 
      title: user.username, 
      user: user, 
      posts: posts, 
      follow: follow,
      follower: follower,
    }

    res.render('user_account', data)
  } catch (error) {
    res.render('error', { error: error })
  }
}

exports.password_change_get = async (req, res, next) => {
  try {
    res.render('user_password_form', { title: 'Change password' })
  } catch (error) {
    res.render('error', { error: error })
  }
}

exports.password_change_post = async (req, res, next) => {
  try {
    var user = await User.findById(req.session.user)
    var errors = []
    var error

    var hashed_password = crypto.pbkdf2Sync(req.body.password, user.salt, 310000, 32, 'sha256').toString('hex')
    
    if (user.password!==hashed_password) {
      error = 'wrong password'
      errors.push(error)
    }
    if (!req.body.new_password.match(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/)) {
      error = 'Password, at least one lowercase and uppercase alphabet more than 8 letter'
      errors.push(error)
    }
    if (req.body.new_password!==req.body.new_password_confirm) {
      error = 'password not identical'
      errors.push(error)
    }
    if (errors.length>0) {
      return res.send({ errors: errors })
    }

    var salt = crypto.randomBytes(16).toString('hex');
    hashed_password = crypto.pbkdf2Sync(req.body.new_password, salt, 310000, 32, 'sha256').toString('hex')

    user.password = hashed_password
    await user.save()
    res.send({ errors: null, username: user.username })

  } catch (error) {
    console.log(error)
  }
}

// Explore
exports.explore = async (req, res, next) => {
  try {
    var posts = await Blog.find()
    res.render('blog_search', { title: 'Search', posts: posts })
  } catch (error) {
    res.render('error', { error: error })
  }
}

exports.live_search = async (req, res, next) => {
  try {
    var posts = await Blog.find({ title: { $regex: req.query.q } })
    res.send(posts)
  } catch (error) {
    console.log(error)
  }
}


