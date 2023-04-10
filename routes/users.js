import {Router} from 'express';
const router = Router();
import {kanbanFxns, userFxns} from '../data/index.js';
import validation from '../validation.js';

// login page
router
.route('/')
.get(async (req, res) => {
    try {
        res.render('login');
    } catch(e) {
        res.status(500).render({error: e, status: '500'})
    };
});
// body should have username and password
router
.route('/login')
.post(async (req, res) => {
    try {
        const userData = req.body;
        let user;
        // if there's a problem with input, will direct user back to loginpage with error message
        try {
            userData.uname = validation.checkString(userData.uname, 'routes/users.js uname');
        } catch (e) { // status?
            res.render('login', {error: e});
            return;
        };
        try {
            userData.pswd = validation.checkString(userData.pswd, 'routes/users.js pswd');
        } catch (e) {
            res.render('login', {error: e});
            return;
        };
        try {
            user = userFxns.getAttemptedCredentials(userData.uname, userData.pswd);
        } catch (e) { // 404 bc the user is not found
            res.status(404).render('login', {error: e});
            return;
        };
        req.session.user = user;
        res.redirect('/private');
    } catch(e) {
        res.status(500).render({error: e, status: '500'})
    };
});

router.route('/createaccount')
.get(async (req, res) => {
    try {
        res.render('createaccout');
    } catch(e) {
        res.status(500).render({error: e, status: '500'})
    }
})
.post(async (req, res) => {
    // get uname and pswd, passes to userFxns.createUser
    // report errors as necessary
});
// displays a user's PUBLIC profile
router.route('/:id')
.get(async (req, res) => {

})

router.get('/logout', async (req, res) => {
    req.session.destroy();
    res.send('Logged out');
  });
  
export default router;