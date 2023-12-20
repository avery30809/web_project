$(document).ready(()=>{
    createTable();  //最後將回傳的表格放入body裡
    $.get("first", function(res) {
        document.getElementById("courseList").innerHTML= res.message;
        getCourses();
    });
})
function getCourses() {
    $.get("courses", function(courses) {
        document.getElementById("courseList").innerHTML = "";
        let i=0;
        courses.forEach((course)=>{
            document.getElementById("courseList").innerHTML += `
            <div class="courseBrief">
            <input id="ck${i}" name="schedule" value="${course.id} ${course.class}" type="checkbox"/>
            <label class="checkLabel" for="ck${i}"></label>
            <label class="checkContent" for="ck${i}">${course.id}\t${course.course_name}\t${course.class}\t${course.teacher}\t${course.seg}</label>
            </div>
            `;
            i++;
        });
        document.querySelectorAll("input[type='checkbox']").forEach((element)=>{
            element.addEventListener("change", school_timetable, false);
        });
    });
}
function postTest() {
    document.getElementById("display").innerHTML = 'checking...';
    $.post("/", { name: "Curry"}, function(res) {
        document.getElementById("display").innerHTML= res.status;
    }); //假裝有要發布的資料
}
function putTest() {
    $.ajax({
        method: "PUT",
        url: "hello",
        data: { name: "Curry"} //假裝有更新的資料
    }).done(function(res) {
        document.getElementById("display").innerHTML= res.message;
    });
}
function deleteTest() {
    $.ajax({
        method: "DELETE",
        url: "hello"
    }).done(function(res) {
        document.getElementById("display").innerHTML= res.status;
    });
}
function createTable(rows = 10, cols = 8) {
    let table = document.getElementById('schedule');
    table.innerHTML = "";
    let headerRow = document.createElement('tr');
    let weekdays = [' ','日','一', '二', '三', '四', '五','六'];
    let timeClass = ["第一節", "第二節", "第三節", "第四節", "第五節", "第六節", "第七節", "第八節", "第九節", "第十節"]
    let timeSlot = ["08:20~09:10", "09:20~10:10", "10:20~11:10", "11:15~12:05", "12:10~13:00", "13:10~14:00", "14:10~15:00", "15:10~16:00", "16:10~16:55", "17:30~18:20"];

    for (let day = 1; day <= cols; day++) {
        let th = document.createElement('th');
        th.textContent =weekdays[day-1];
        headerRow.appendChild(th);
    }
    table.appendChild(headerRow);   //將headerRow放入table
    
    for (let i = 1; i <= rows; i++) {  //列
        let row = document.createElement('tr');
        let firstCol = document.createElement('td');
        firstCol.innerHTML = `${timeClass[i-1]}<br>${timeSlot[i-1]}`;
        row.appendChild(firstCol);
        for (let j = 2; j <= cols; j++) {  //行
            let col = document.createElement('td');
            col.id = `${(j-2==0?7:j-2)}${(i).toString().padStart(2, "0")}`;
            row.appendChild(col);  //將cell放入row的元素
        }
        table.appendChild(row); //將row放入table這個元素裡
    }
}

function school_timetable(){
    const allCheckBox = document.querySelectorAll("input[type='checkbox']");
    // 遍歷所有的 checkbox 元素
    allCheckBox.forEach(function(nowCheckBox) {
        createTable();
        // 檢查 checkbox 的狀態
        if (nowCheckBox.checked) {
            let params = nowCheckBox.value.split(" ");
            $.get(`courses/${params[0]}/${params[1]}`, function(result){
                let course = result[0];
                let time = course.seg;
                for(let i = 0 ; i < time.length ; i++){
                    let nowChooseTime = document.getElementById(time[i]);
                    let classString = course.id +"<br>"+course.course_name+"<br>"+course.teacher+"<br>";
                    nowChooseTime.innerHTML += classString;
                }
                return false;
            });
        }
    });
}