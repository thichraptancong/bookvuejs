const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const { MESSAGES } = require('../../../constant/index');
const UserModel = require('../../../models/user.model.js');
const BookModel = require('../../../models/book.model');
const handlerCheckPermission = require('../../middleware/handlerCheckPermission');
const { getSort, getLimit } = require('../../../helper')

/* GET users listing. */
router.post('/paginguser', handlerCheckPermission, async function(req, res) {
    try {
        var condition = req.body.condition || {};
        var page = condition.page || 1;
        var limit = getLimit(condition);
        var sort = getSort(condition);
        var options = {
            page: page,
            limit: limit,
            sort: sort
        };
        const query = {}
        if (condition.search) {
            query.$or = [
                { userName: { $regex: condition.search, $options: 'i' } },
                { firstName: { $regex: condition.search, $options: 'i' } },
                { lastName: { $regex: condition.search, $options: 'i' } },
            ]
        };
        const users = await UserModel.paginate(query, options);
        return res.json({ users });
    } catch (err) {
        return res.json({ code: 400, errorMess: err, data: null });
    }
});

router.get('/search', async function(req, res) {
    try {
        const users = await UserModel.find();
        return res.json({ code: 200, users });
    } catch (err) {
        return res.json({ code: 400, errorMess: err, data: null });
    }
});

/* POST users create. */
router.post('/', handlerCheckPermission, async function(req, res) {
    try {
        const { username, password, firstName, lastName, role } = req.body;
        const hash = await bcrypt.hash(password, 8);
        const UserClass = new UserModel({ username, password: hash, firstName, lastName, role });
        const user = await UserClass.save();

        return res.json({ code: 200, errorMess: '', data: { user } });
    } catch (err) {
        return res.json({ code: 400, errorMess: err, data: null });
    }
});

/* PUT users edit. */
router.put('/:_id', handlerCheckPermission, async(req, res) => {
    try {
        const _id = req.params._id
        const { username, password, firstName, lastName } = req.body;
        const payload = { username, firstName, lastName }

        if (password) {
            const hash = await bcrypt.hash(password, 8);
            payload.password = hash
        }

        const userCheck = await UserModel.findOne({ username: username })
        if (userCheck) {
            return res.json({ code: 201, errorMess: 'this username has been asd duplicated! ' });
        } else {
            const userUpdate = await UserModel.updateOne({ _id: _id }, payload).then(() => {
                return UserModel.findById(_id);
            });
            return res.json({ code: 200, message: MESSAGES.UPDATE_SUCCESS, data: { userUpdate } });
        }
    } catch (err) {
        return res.json({ code: 400, errorMess: err, data: null });
    }
})

/* DELETE users delete. */
router.delete('/:_id', handlerCheckPermission, async(req, res) => {
    try {
        const _id = req.params._id;
        const user = await UserModel.findById(_id)
        if (user) {
            await UserModel.deleteOne({ _id: _id });
            await BookModel.deleteMany({ owner: _id })
            return res.json({ code: 200, message: MESSAGES.DELETED_SUCCESS, data: true });
        }
        return res.json({ code: 400, errorMess: MESSAGES.USERNAME_NOT_EXISTED, data: false });
    } catch (err) {
        return res.json({ code: 400, errorMess: err, data: false });
    }
})

router.get('/:_id', handlerCheckPermission, async(req, res) => {
    try {
        const _id = req.params._id;
        const user = await UserModel.findById(_id)
        if (user) {
            return res.json({ code: 200, user });
        }
        return res.json({ code: 400, message: new Message('user').notExisted, data: false });
    } catch (err) {
        return res.json({ code: 400, errorMess: err, data: false });
    }
})


export default router;