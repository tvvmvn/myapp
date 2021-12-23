var express = require('express');
var router = express.Router();
var controller = require('../controllers/controller')


/* GET home page. */
router.get('/', controller.index);

// Blog
router.get('/create/details', controller.blog_create_get)
router.post('/create/details', controller.blog_create_post)

// User
router.get('/login', controller.login_get)
router.post('/login', controller.login_post)
router.get('/logout', controller.logout)
router.get('/sign_up', controller.sign_up_get)
router.post('/sign_up', controller.sign_up_post)
router.get('/accounts/edit', controller.account_edit_get)
router.post('/accounts/edit', controller.account_edit_post)

router.get('/password/change', controller.password_change_get)
router.post('/password/change', controller.password_change_post)

// Explore
router.get('/explore', controller.explore)
router.get('/live_search', controller.live_search)

// Follow
router.get('/:username/followers', controller.followers)
router.get('/:username/following', controller.following)
router.post('/follow', controller.follow)

router.get('/:username', controller.account)

// Admin
router.get('/admin', async (req, res, next) => {
  try {
    res.render('admin/index', { title: 'Admin' })
  } catch (error) {
    res.render('error', { error: error })
  }
})

module.exports = router;
