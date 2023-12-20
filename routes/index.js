var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
// 連接到MongoDB 資料庫
mongoose.connect('mongodb+srv://01057122:webproject@webproject.hqd0nda.mongodb.net/ntouCourse');
const db = mongoose.connection;
// 與資料庫連線發生錯誤時
db.on('error', console.error.bind(console, 'Connection fails!'));
// 與資料庫連線成功連線時
db.once('open', async function () {
    console.log('Connected to database...');
});

const { Builder, Browser, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromeOptions = new chrome.Options();
chromeOptions.headless(); // 不開啟瀏覽器
chromeOptions.addArguments('--blink-settings=imagesEnabled=false'); // 禁用圖片加載

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
    course_name: {
        type: String,
        default: null
    },
    course_name_ENG: {
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

router.get('/hello', async function (req, res) {
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
});

router.get('/courses', async function (req, res, next) {
    try{
        // 找出Todo資料資料表中的全部資料
        const todo=await Todo.find();
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
                status: `Collection ${collectionName} exists.`
            });
        } else {
            collectionName = tempName;
            Todo = mongoose.model(collectionName, mySchema);
            res.send({
                status: `update courses`
            });
            await usage(collectionName);
        }
    } catch (error) {
        console.error(error);
    }
});
router.put('/hello', function (req, res) {
    res.send({
        message: 'Hello New World!'
    });
});
router.delete('/hello', function (req, res) {
    res.send({
        status: 'Done!'
    });
});

async function getSemester() {
    let driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(chromeOptions).build();
    let name;
    try {
        // 不確定會不會換網址
        await driver.get('https://ais.ntou.edu.tw/outside.aspx?mainPage=LwBBAHAAcABsAGkAYwBhAHQAaQBvAG4ALwBUAEsARQAvAFQASwBFADIAMgAvAFQASwBFADIAMgAxADUAXwAuAGEAcwBwAHgAPwBwAHIAbwBnAGMAZAA9AFQASwBFADIAMgAxADUA');
        try {
            await driver.wait(until.alertIsPresent(), 2000);

            // 如果有 alert，切換到 alert
            const alert = await driver.switchTo().alert();

            // 點擊 alert 的確認按鈕
            await alert.accept();
        } catch (e) { }
        await driver.switchTo().frame(driver.findElement(By.name("mainFrame")));
        name = await driver.findElement(By.id("Q_AYEAR")).getText() + "_" + await driver.findElement(By.id("Q_SMS")).getText();
    }
    finally {
        await driver.quit();
        return name;
    }
}
async function getCourse(dept) {
    let driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(chromeOptions).build();
    try {
        // 不確定會不會換網址
        await driver.get('https://ais.ntou.edu.tw/outside.aspx?mainPage=LwBBAHAAcABsAGkAYwBhAHQAaQBvAG4ALwBUAEsARQAvAFQASwBFADIAMgAvAFQASwBFADIAMgAxADUAXwAuAGEAcwBwAHgAPwBwAHIAbwBnAGMAZAA9AFQASwBFADIAMgAxADUA');
        try {
            await driver.wait(until.alertIsPresent(), 2000);

            // 如果有 alert，切換到 alert
            const alert = await driver.switchTo().alert();

            // 點擊 alert 的確認按鈕
            await alert.accept();
        } catch (e) { }
        await driver.switchTo().frame(driver.findElement(By.name("mainFrame")));
        // 找到<select>元素
        const selectElement = await driver.findElement(By.id('Q_FACULTY_CODE'));

        // 創建一個select對象
        await driver.wait(until.elementIsEnabled(selectElement), 10000);
        const selectInstance = await driver.findElement(By.id('Q_FACULTY_CODE'));

        // 通過可見文本選擇option對象
        await selectInstance.findElement(By.xpath(`option[text()="${dept}"]`)).click();
        await driver.findElement(By.id('QUERY_BTN1')).click();
        await driver.wait(until.stalenessOf(driver.findElement(By.id("PC_PageSize"))), 10000);
        await driver.findElement(By.id("PC_PageSize")).sendKeys("10");
        await driver.findElement(By.id("PC_ShowRows")).click();
        await driver.wait(until.stalenessOf(driver.findElement(By.id("DataGrid"))), 10000);
        let table = await driver.findElement(By.id("DataGrid"));
        // 獲得table的所有行
        let rows = await table.findElements(By.css('tr'));

        // 遍歷每一行
        for (let i = 1; i < rows.length; i++) {  // 跳過表頭
            // 找到並點擊行中的a元素
            const link = await rows[i].findElement(By.css('a'));
            await driver.wait(until.elementIsVisible(link), 10000);
            await link.click();
            await driver.wait(until.elementLocated(By.className("fancybox-iframe")), 10000);

            // 切換到新的iframe
            await driver.switchTo().frame(driver.findElement(By.className("fancybox-iframe")));
            await driver.wait(until.elementLocated(By.name("mainFrame")), 10000);
            await driver.switchTo().frame(driver.findElement(By.name("mainFrame")));
            await driver.wait(until.elementLocated(By.id("QTable2")), 10000);

            const table2 = await driver.findElement(By.id("QTable2"));
            let obj = {};
            obj['id'] = await table2.findElement(By.id("M_COSID")).getText();
            obj['dept_name'] = await table2.findElement(By.id("M_FACULTY_NAME")).getText();
            obj['teacher'] = await table2.findElement(By.id("M_LECTR_TCH_CH")).getText();
            obj['course_name'] = await table2.findElement(By.id("CH_LESSON")).getText();
            obj['course_name_ENG'] = await table2.findElement(By.id("M_ENG_LESSON")).getText();
            obj['class'] = await table2.findElement(By.id("M_GRADE")).getText();
            obj['hours'] = await table2.findElement(By.id("M_LECTR_HOUR")).getText();
            obj['must'] = await table2.findElement(By.id("M_MUST")).getText();
            obj['seg'] = (await table2.findElement(By.id("M_SEG")).getText()).split(",");
            obj['place'] = (await table2.findElement(By.id("M_CLSSRM_ID")).getText()).split(",");
            obj['evaluation'] = await table2.findElement(By.id("M_CH_TYPE")).getText();
            obj['evaluation_ENG'] = await table2.findElement(By.id("M_ENG_TYPE")).getText();

            obj['hours'] = parseInt(obj['hours']);
            obj['must'] = obj['must']=="T"?"服務學習":obj['must'];

            await driver.switchTo().parentFrame();
            await driver.switchTo().parentFrame();
            await driver.findElement(By.className("fancybox-item fancybox-close")).click();
            table = await driver.findElement(By.id("DataGrid"));

            rows = await table.findElements(By.css('tr'));
            const todo = new Todo(obj);
            await todo.save();
        }
    } finally {
        await driver.quit();
        console.log("done");
    }
};
async function usage() {
    await Promise.all([getCourse("0507-資訊工程學系"), getCourse("090M-共同教育中心博雅教育組")]);
}
module.exports = router;
