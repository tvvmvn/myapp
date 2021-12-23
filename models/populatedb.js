
var { User, Blog } = require('./model')
var crypto = require('crypto')


async function populateDB() {
  var users= []

  async function createUser(email, password, username, name) {
    
    var salt = crypto.randomBytes(16).toString('hex')
    var hashedPassword = crypto.pbkdf2Sync(password, salt, 310000, 32, 'sha256').toString('hex')

    var user = new User({
      email: email,
      password: hashedPassword,
      salt: salt,
      username: username,
      name: name
    })
    await user.save()
    users.push(user)
  } 

  async function createBlog(user, title, content, reg_date) {
    var blog = new Blog({
      user: user,
      title: title,
      content: content,
      reg_date: reg_date
    })
    await blog.save()
  }

  await createUser('tvvmvn@gmail.com', 'aaaaaaA1', 'bunny', '토끼')
  await createUser('cat@example.com', 'aaaaaaA2', 'cat', '고양이')
  await createUser('bird@example.com', 'aaaaaaA3', 'bird', '새')

  var txt1 = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias, nihil. Ex ullam consequatur repudiandae impedit, perferendis voluptates. Architecto accusantium fugit, numquam quia eveniet harum est nostrum. Dolorem nisi eveniet alias. Lorem ipsum dolor sit amet consectetur adipisicing elit. Tenetur excepturi iusto eius ea magni nisi, quod placeat, recusandae consequuntur, dicta modi dolores cum eaque nobis voluptas accusamus. Voluptas, tempore. Consequuntur.'
  var txt2 = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Est doloribus iste cupiditate, ipsa esse eius beatae eveniet exercitationem itaque. Eos eius explicabo qui quam accusamus fugiat quaerat repudiandae facilis placeat.'

  await createBlog(users[0]._id, 'Lorem ipsum dolor', txt1, Date.now())
  await createBlog(users[0]._id, 'Lorem ipsum dolor sit amet consectetur adipisicing elit.', txt2, Date.now())
  await createBlog(users[0]._id, 'Lorem ipsum dolor sit amet.', txt1, Date.now())
  await createBlog(users[1]._id, 'Lorem ipsum dolor sit amet consectetur.', txt1, Date.now())
  await createBlog(users[1]._id, 'Lorem ipsum dolor sit amet consectetur adipisicing.', txt2, Date.now())
  await createBlog(users[2]._id, 'Lorem ipsum dolor.', txt1, Date.now())
  await createBlog(users[0]._id, 'Lorem ipsum dolor sit amet.', txt2, Date.now())
  await createBlog(users[0]._id, 'Lorem ipsum dolor sit amet consectetur.', txt1, Date.now())
  await createBlog(users[0]._id, 'Lorem ipsum dolor sit amet consectetur adipisicing elit.', txt1, Date.now())
  await createBlog(users[1]._id, 'Lorem ipsum dolor sit amet consectetur adipisicing.', txt1, Date.now())
  await createBlog(users[1]._id, 'Lorem ipsum dolor sit.', txt2, Date.now())
  await createBlog(users[2]._id, 'Lorem ipsum dolor sit.', txt1, Date.now())
  await createBlog(users[0]._id, 'Lorem ipsum.', txt1, Date.now())
  await createBlog(users[0]._id, 'Lorem ipsum dolor sit amet.', txt2, Date.now())
  await createBlog(users[0]._id, 'Lorem ipsum dolor sit amet consectetur adipisicing.', txt1, Date.now())
  await createBlog(users[1]._id, 'Lorem.', txt1, Date.now())
  await createBlog(users[1]._id, 'Lorem ipsum dolor sit amet consectetur', txt2, Date.now())
  await createBlog(users[2]._id, 'Lorem ipsum.', txt1, Date.now())
}


// populateDB()