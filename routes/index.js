require('dotenv').config();
const cheerio = require('cheerio');
var express = require('express');
var router = express.Router();
const puppeteer = require('puppeteer');

var mongoose = require('mongoose');
// 連接到MongoDB 資料庫
mongoose.connect(process.env.Mongo_URI);
const db = mongoose.connection;
// 與資料庫連線發生錯誤時
db.on('error', console.error.bind(console, 'Connection fails!'));
// 與資料庫連線成功連線時
db.once('open', async function () {
    console.log('Connected to database...');
});

// 課程collection的格式設定
const mySchema=new mongoose.Schema({
    id: {
        type: String,
        default: null
    },
    dept_name: {
        type: String,
        default: null
    },
    teacher: {
        type: String,
        default: null
    },
    teacher_ENG: {
        type: String,
        default: null
    },
    course_name: {
        type: String,
        default: null
    },
    course_name_ENG: {
        type: String,
        default: null
    },
    class: {
        type: String,
        default: null
    },
    hours: {
        type: Number,
        default: null
    },
    must: {
        type: String,
        default: null
    },
    seg: {
        type: Array,
        default: null
    },
    place: {
        type: Array,
        default: null
    },
    evaluation: {
        type: String,
        default: null
    },
    evaluation_ENG: {
        type: String,
        default: null
    }
});

let Todo;
let collectionName;

/* GET home page. */
router.get('/', async function (req, res, next) {
    res.render('index', { title: 'Express' });
});
// 伺服器剛開 設定初始值
router.get('/first', async function (req, res) {
    if(collectionName === undefined) {
        collectionName = await getSemester();
        const collections = await db.db.listCollections({ name: collectionName }).toArray();
        Todo = mongoose.model(collectionName, mySchema);
        if (collections.length > 0) {
            res.send({
                message: `Collection ${collectionName} exists.`
            });
        } else {
            await usage(collectionName);
            res.send({
                message: `update courses`
            });
        }
    }
    else {
        res.send({
            message: `Collection ${collectionName} exists.`
        });
    }
});

router.get('/courses', async function (req, res, next) {
    try{
        // 找出Todo資料資料表中的全部資料
        const todo=await Todo.find().sort({dept_name: -1, seg: 1, class: 1});
        // 將回傳的資訊轉成Json格式後回傳
        res.json(todo);
    }catch(err){
        // 如果資料庫出現錯誤時回報status:500 並回傳錯誤訊息
        res.status(500).json({message:err.message})
    }
});

router.get('/courses/:id/:class', async function (req, res, next) {
    try{
        // 找出Todo資料資料表中的全部資料
        const todo=await Todo.find({id: req.params.id, class: req.params.class});
        // 將回傳的資訊轉成Json格式後回傳
        res.json(todo);
    }catch(err){
        // 如果資料庫出現錯誤時回報status:500 並回傳錯誤訊息
        res.status(500).json({message:err.message})
    }
});

router.post('/', async function (req, res) {
    try {
        // 檢查新學期是否存在
        const tempName = await getSemester();
        const collections = await db.db.listCollections({ name: tempName }).toArray();
        if (collections.length > 0) {
            res.send({
                message: `Collection ${collectionName} exists.`
            });
        } else {
            collectionName = tempName;
            Todo = mongoose.model(collectionName, mySchema);
            await usage(collectionName);
            res.send({
                message: `update courses`
            });
        }
    } catch (error) {
        console.error(error);
    }
});

async function getSemester() {
    const browser = await puppeteer.launch();
    let year;
    try {
        // 創建一個新的頁面
        const page = await browser.newPage();

        // 轉到目標網頁 不確定會不會換網址
        await page.goto('https://ais.ntou.edu.tw/outside.aspx?mainPage=LwBBAHAAcABsAGkAYwBhAHQAaQBvAG4ALwBUAEsARQAvAFQASwBFADIAMgAvAFQASwBFADIAMgAxADUAXwAuAGEAcwBwAHgAPwBwAHIAbwBnAGMAZAA9AFQASwBFADIAMgAxADUA');
        // 獲取所有的 frames
        const frames = page.frames();
        const targetFrame = frames.find(frame => frame.name() === "mainFrame");

        await targetFrame.waitForSelector('#Q_AYEAR');
        // 使用 page.$eval 獲取元素的文字內容
        year = await targetFrame.$eval('#Q_AYEAR', element => element.textContent) + "_" + await targetFrame.$eval('#Q_SMS', element => element.textContent);
    }
    finally {
        // 關閉瀏覽器
        await browser.close();
        return year;
    }
}
async function getCourse(dept) {
    // 啟動瀏覽器
    const browser = await puppeteer.launch();

    // 創建一個新的頁面
    const page = await browser.newPage();

    // 轉到目標網頁
    await page.goto('https://ais.ntou.edu.tw/outside.aspx?mainPage=LwBBAHAAcABsAGkAYwBhAHQAaQBvAG4ALwBUAEsARQAvAFQASwBFADIAMgAvAFQASwBFADIAMgAxADUAXwAuAGEAcwBwAHgAPwBwAHIAbwBnAGMAZAA9AFQASwBFADIAMgAxADUA');

    // 獲取所有的 frames
    const frames = page.frames();
    const targetFrame = frames.find(frame => frame.name() === "mainFrame");
    await targetFrame.$eval('#PC_PageSize', element => element.value = "1000");

    await targetFrame.waitForSelector('#Q_AYEAR');

    const year = await targetFrame.$eval('#Q_AYEAR', element => element.textContent) + "_" + await targetFrame.$eval('#Q_SMS', element => element.textContent);
    
    await targetFrame.$eval('#Q_FACULTY_CODE', (selectElement, optionText) => {
        const option = Array.from(selectElement.options).find(opt => opt.text === optionText);

        if (option) {
            option.selected = true;
        }
    }, dept);

    await targetFrame.$eval('#QUERY_BTN1', button => button.click());

    await targetFrame.waitForSelector("#PC_PageSize", {visible: true});


    await targetFrame.$eval('#PC_ShowRows', button => button.click());

    await targetFrame.waitForSelector("#DataGrid", {visible: true});

    // 獲取表格的 HTML 內容
    const tableHtml = await targetFrame.$eval('#DataGrid', table => table.outerHTML);

    // 使用 Cheerio 解析 HTML
    const $ = cheerio.load(tableHtml);

    const detailTarget = [];

    $('#DataGrid a').each(async (index, element) => {
        if(index>16) {
            detailTarget.push(element);
        }
    });

    for(let i=0;i<detailTarget.length;i++) {
        await targetFrame.waitForSelector(`#${detailTarget[i].attribs['id']}`, {visible: true});
        await targetFrame.$eval(`#${detailTarget[i].attribs['id']}`, button=>button.click());
        await targetFrame.waitForSelector('.fancybox-iframe');
        const frameHandle = await targetFrame.$('.fancybox-iframe');
        const newFrame = await frameHandle.contentFrame();
        await newFrame.waitForSelector('[name="mainFrame"]');

        const popHandle = await newFrame.$('[name="mainFrame"]');
        const popFrame = await popHandle.contentFrame();
        await popFrame.waitForSelector('#M_COSID');
        let obj = {};
        obj.id = await popFrame.$eval('#M_COSID', item => item.textContent);
        obj.dept_name = await popFrame.$eval('#M_FACULTY_NAME', item => item.textContent);
        obj.teacher = await popFrame.$eval('#M_LECTR_TCH_CH', item => item.textContent);
        obj.course_name = await popFrame.$eval('#CH_LESSON', item => item.textContent);
        obj.course_name_ENG = await popFrame.$eval('#M_ENG_LESSON', item => item.textContent);
        obj.class = await popFrame.$eval('#M_GRADE', item => item.textContent);
        obj.hours = await popFrame.$eval('#M_LECTR_HOUR', item => item.textContent);
        obj.must = await popFrame.$eval('#M_MUST', item => item.textContent);
        obj.seg = await popFrame.$eval('#M_SEG', item => item.textContent.split(","));
        obj.place = await popFrame.$eval('#M_CLSSRM_ID', item => item.textContent.split(","));
        obj.evaluation = await popFrame.$eval('#M_CH_TYPE', item => item.textContent);
        obj.evaluation_ENG = await popFrame.$eval('#M_ENG_TYPE', item => item.textContent);

        obj.hours = parseInt(obj.hours);
        obj.must = obj.must=="T"?"服務學習":obj.must;
        let temp = obj.teacher.split("(");
        obj.teacher = temp[0];
        obj.teacher_ENG = temp[1].replace(")", "");
        await targetFrame.waitForSelector('.fancybox-item.fancybox-close');
        await targetFrame.$eval('.fancybox-item.fancybox-close', button=>button.click());
        const todo = new Todo(obj);
        await todo.save();
        await targetFrame.waitForTimeout(300);
    }
    // 關閉瀏覽器
    await browser.close();
    console.log("done");
};
async function usage() {
    await Promise.all([getCourse("0507-資訊工程學系"), getCourse("090M-共同教育中心博雅教育組")]);
}
module.exports = router;
