const express = require('express');
const fs = require('fs');
const router = express.Router();

const { MESSAGES } = require('../../../constant/index');
const CategoryModel = require('../../../models/category.model');
const BookModel = require('../../../models/book.model');
const { getSort, getLimit } = require('../../../helper')
const handlerCheckPermission = require('../../middleware/handlerCheckPermission');


/* GET category listing. */
router.post('/pagingcate', handlerCheckPermission, async function(req, res) {
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
                { title: { $regex: condition.search, $options: 'i' } },
            ]
        };
        const category = await CategoryModel.paginate(query, options);
        return res.json({ category });
    } catch (err) {
        return res.json({ code: 400, errorMess: err, data: null });
    }
});

/* GET categories listing. */
router.post('/search', async function(req, res) {
    try {
        const category = await CategoryModel.find();
        return res.json({ code: 200, category });
    } catch (err) {
        return res.json({ code: 400, errorMess: err, data: null });
    }
});

/* POST categories create. */
router.post('/', handlerCheckPermission, async function(req, res) {
    try {
        const { title } = req.body;
        const CategoryClass = new CategoryModel({ title });
        const category = await CategoryClass.save();

        return res.json({ code: 200, errorMess: '', data: { category } });
    } catch (err) {
        return res.json({ code: 400, errorMess: err, data: null });
    }
});

/* PUT categories edit. */
router.put('/:_id', handlerCheckPermission, async(req, res) => {
    try {
        const _id = req.params._id
        const { title } = req.body;
        const payload = { title }

        const CategoryUpdate = await CategoryModel.updateOne({ _id: _id }, payload).then(() => {
            return CategoryModel.findById(_id);
        });

        return res.json({ code: 200, message: MESSAGES.UPDATE_SUCCESS, data: { CategoryUpdate } });
    } catch (err) {
        return res.json({ code: 400, errorMess: err, data: null });
    }
})

/* DELETE categories delete. */
router.delete('/:_id', handlerCheckPermission, async(req, res) => {
    try {
        const _id = req.params._id;
        const category = await CategoryModel.findById(_id)
        if (category) {
            const _title = category.title.toUpperCase()
            await CategoryModel.deleteOne({ _id: _id });
            await BookModel.deleteMany({ category: _title })
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
        const category = await CategoryModel.findById(_id)
        if (category) {
            return res.json({ code: 200, category });
        }
        return res.json({ code: 400, message: new Message('category').notExisted, data: false });
    } catch (err) {
        return res.json({ code: 400, errorMess: err, data: false });
    }
})

export default router;