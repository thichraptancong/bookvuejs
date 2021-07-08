const express = require('express');
const multer = require('multer')
const fs = require('fs');
const router = express.Router();

const { MESSAGES, COVER_PATH } = require('../../../constant');
const BookModel = require('../../../models/book.model');
const { getSort, getLimit } = require('../../../helper')
const handlerCheckPermission = require('../../middleware/handlerCheckPermission');

const upload = multer({ dest: COVER_PATH })


/* GET books listing. */
router.post('/search', async function(req, res) {
    try {
        const books = await BookModel.find();
        return res.json({ code: 200, books });
    } catch (err) {
        return res.json({ code: 400, errorMess: err, data: null });
    }
});

router.post('/pagingbook', handlerCheckPermission, async function(req, res) {
    try {
        var condition = req.body.condition || {};
        var page = condition.page || 1;
        var limit = getLimit(condition);
        var sort = getSort(condition);
        var options = {
            page: page,
            limit: limit,
            sort: sort,
            populate: { path: 'owner', select: "firstName lastName" },
        };
        const query = {}
        if (condition.search) {
            query.$or = [
                { title: { $regex: condition.search, $options: 'i' } },
                { author: { $regex: condition.search, $options: 'i' } },
                { description: { $regex: condition.search, $options: 'i' } },
            ]
        };
        if (condition.idCategory) {
            console.log(condition.idCategory)
            query.category = condition.idCategory
        }
        const book = await BookModel.paginate(query, options);
        return res.json({ book });
    } catch (err) {
        return res.json({ code: 400, errorMess: err, data: null });
    }
});


router.post("/", handlerCheckPermission, upload.array("cover", 4), async function(req, res) {
    try {

        const coverArr = []
        req.files.forEach(item => {
            let filePath = `${COVER_PATH}/${new Date().getTime()}_${item.originalname}`;
            fs.rename(`${COVER_PATH}/${item.filename}`, filePath, async(err) => {
                if (err) {
                    return res.json({ code: 400, errorMess: err, data: null });
                }
            });
            coverArr.push(filePath);
        });

        const { title, category, author, description } = req.body;
        const bookModel = new BookModel({
            title,
            category,
            author,
            owner: req._user._id,
            description,
            cover: coverArr,
        });
        const book = await bookModel.save();
        return res.json({ code: 200, message: "ADD BOOK SUCCESS", data: { book } });
    } catch (err) {
        return res.json({ code: 400, errorMess: err, data: null });
    }
});
/* PUT books edit. */
router.put('/:_id', handlerCheckPermission, upload.array("cover", 4), async(req, res) => {
    try {
        const _id = req.params._id
        const coverArr = []
        req.files.forEach(item => {
            let filePath = `${COVER_PATH}/${new Date().getTime()}_${item.originalname}`;
            fs.rename(`${COVER_PATH}/${item.filename}`, filePath, async(err) => {
                if (err) {
                    return res.json({ code: 400, errorMess: err, data: null });
                }
            });
            coverArr.push(filePath);
        });
        const { title, category, author, description } = req.body;

        const bookUpdate = await BookModel.updateOne({ _id: _id }, { title, cover: coverArr, category, author, description }).then(() => {
            return BookModel.findById(_id);
        });
        return res.json({ code: 200, message: MESSAGES.UPDATE_SUCCESS, data: { bookUpdate } });
    } catch (err) {
        return res.json({ code: 400, errorMess: err, data: null });
    }
})

/* DELETE books delete. */
router.delete('/:_id', handlerCheckPermission, async(req, res) => {
    try {
        const _id = req.params._id;
        const book = await BookModel.findById(_id)
        if (book) {
            await BookModel.deleteOne({ _id: _id });
            return res.json({ code: 200, message: MESSAGES.DELETED_SUCCESS, data: true });
        }
        return res.json({ code: 400, errorMess: MESSAGES.BOOKNAME_NOT_EXISTED, data: false });
    } catch (err) {
        return res.json({ code: 400, errorMess: err, data: false });
    }
})

router.get('/:_id', handlerCheckPermission, async(req, res) => {
    try {
        const _id = req.params._id;
        const book = await BookModel.findById(_id)
        if (book) {
            return res.json({ code: 200, book });
        }
        return res.json({ code: 400, message: new Message('book').notExisted, data: false });
    } catch (err) {
        return res.json({ code: 400, errorMess: err, data: false });
    }
})


export default router;