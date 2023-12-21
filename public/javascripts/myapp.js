$(document).ready(()=>{
    createTable();  //最後將回傳的表格放入body裡
    $.ajax({
        url: "first",
        type: "GET",
        success: (res)=>{
            document.getElementById("courseList").innerHTML= res.message;
            getCourses();
        }
    });
    document.getElementById("selectType").addEventListener("click", (event)=>{
        event.stopPropagation();
        event.target.parentElement.classList.toggle("active");
    }, false);
    document.querySelector(".dropdown-menu").childNodes.forEach((element)=>{
        element.addEventListener("click", ()=>{
            document.getElementById("selectType").value = element.innerText;
            document.getElementById("searchBox").placeholder = element.innerText;
            document.getElementById("searchBox").value = "";
            updateList();
        });
    });
    document.getElementById("searchBox").addEventListener("input", updateList, false);
});

let coursesList = [];

document.addEventListener("click", ()=>{
    document.querySelectorAll(".active").forEach((element)=>{
        element.classList.remove("active");
    });
}, false);

function getCourses() {
    $.get("courses", function(courses) {
        document.getElementById("courseList").innerHTML = "";
        let i=0, content = "";
        coursesList = courses;
        courses.forEach((course)=>{
            content += `
            <div class="courseBrief">
            <input id="ck${i}" name="schedule" value="${course.id} ${course.class}" type="checkbox"/>
            <label class="checkLabel" for="ck${i}"></label>
            <label class="checkContent" for="ck${i}">${course.id}\t${course.course_name}\t${course.class}\t${course.teacher}\t${course.seg}</label>
            </div>
            `;
            i++;
        });
        document.getElementById("courseList").innerHTML = content;
        document.querySelectorAll("input[type='checkbox']").forEach((element)=>{
            element.addEventListener("change", updateTable, false);
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
function createTable(rows = 14, cols = 8) {
    let table = document.getElementById('schedule');
    table.innerHTML = "";
    let headerRow = document.createElement('tr');
    let weekdays = [' ','日','一', '二', '三', '四', '五','六'];
    let timeClass = ["第一節", "第二節", "第三節", "第四節", "第五節", "第六節", "第七節", "第八節", "第九節", "第十節", "第十一節", "第十二節", "第十三節", "第十四節"]
    let timeSlot = ["08:20<br><span class='timeTo'>~</span><br>09:10", "09:20<br><span class='timeTo'>~</span><br>10:10", "10:20<br><span class='timeTo'>~</span><br>11:10", "11:15<br><span class='timeTo'>~</span><br>12:05", "12:10<br><span class='timeTo'>~</span><br>13:00", "13:10<br><span class='timeTo'>~</span><br>14:00", "14:10<br><span class='timeTo'>~</span><br>15:00", "15:10<br><span class='timeTo'>~</span><br>16:00", "16:10<br><span class='timeTo'>~</span><br>16:55", "17:30<br><span class='timeTo'>~</span><br>18:20", "18:30<br><span class='timeTo'>~</span><br>19:20", "19:25<br><span class='timeTo'>~</span><br>20:15", "20:20<br><span class='timeTo'>~</span><br>21:10", "21:15<br><span class='timeTo'>~</span><br>22:05"];

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

function updateTable(){
    const allCheckBox = document.querySelectorAll("input[type='checkbox']");
    createTable();
    // 遍歷所有的 checkbox 元素
    allCheckBox.forEach(function(nowCheckBox) {
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

function updateList() {
    let query = document.getElementById("searchBox").value, content = "";
    document.getElementById("courseList").innerHTML = "";
    if(query == "") {
        let i=0;
        coursesList.forEach((course)=>{
            content += `
            <div class="courseBrief">
            <input id="ck${i}" name="schedule" value="${course.id} ${course.class}" type="checkbox"/>
            <label class="checkLabel" for="ck${i}"></label>
            <label class="checkContent" for="ck${i}">${course.id}\t${course.course_name}\t${course.class}\t${course.teacher}\t${course.seg}</label>
            </div>
            `;
            i++;
        });
        document.getElementById("courseList").innerHTML = content;
        document.querySelectorAll("input[type='checkbox']").forEach((element)=>{
            element.addEventListener("change", updateTable, false);
        });
        return;
    }
    let selectType = document.getElementById("selectType").value;
    let i=0;
    switch(selectType) {
        case "課號":
            for(let course of coursesList) {
                if(!course.id.includes(query)) continue;
                content += `
                <div class="courseBrief">
                <input id="ck${i}" name="schedule" value="${course.id} ${course.class}" type="checkbox"/>
                <label class="checkLabel" for="ck${i}"></label>
                <label class="checkContent" for="ck${i}">${course.id}\t${course.course_name}\t${course.class}\t${course.teacher}\t${course.seg}</label>
                </div>
                `;
                i++;
            }
            document.getElementById("courseList").innerHTML = content;
            document.querySelectorAll("input[type='checkbox']").forEach((element)=>{
                element.addEventListener("change", updateTable, false);
            });
            break;
        case "課名":
            for(let course of coursesList) {
                if(!course.course_name.includes(query)) continue;
                content += `
                <div class="courseBrief">
                <input id="ck${i}" name="schedule" value="${course.id} ${course.class}" type="checkbox"/>
                <label class="checkLabel" for="ck${i}"></label>
                <label class="checkContent" for="ck${i}">${course.id}\t${course.course_name}\t${course.class}\t${course.teacher}\t${course.seg}</label>
                </div>
                `;
                i++;
            }
            document.getElementById("courseList").innerHTML = content;
            document.querySelectorAll("input[type='checkbox']").forEach((element)=>{
                element.addEventListener("change", updateTable, false);
            });
            break;
        case "老師":
            for(let course of coursesList) {
                if(!course.teacher.includes(query)) continue;
                content += `
                <div class="courseBrief">
                <input id="ck${i}" name="schedule" value="${course.id} ${course.class}" type="checkbox"/>
                <label class="checkLabel" for="ck${i}"></label>
                <label class="checkContent" for="ck${i}">${course.id}\t${course.course_name}\t${course.class}\t${course.teacher}\t${course.seg}</label>
                </div>
                `;
                i++;
            }
            document.getElementById("courseList").innerHTML = content;
            document.querySelectorAll("input[type='checkbox']").forEach((element)=>{
                element.addEventListener("change", updateTable, false);
            });
            break;
        case "系所":
            query = query==="通"||query==="通識"?"共同教育中心博雅教育組" : query;
            query = query==="資"||query==="資工"?"資訊工程學系" : query;
            for(let course of coursesList) {
                if(!course.dept_name.includes(query)) continue;
                content += `
                <div class="courseBrief">
                <input id="ck${i}" name="schedule" value="${course.id} ${course.class}" type="checkbox"/>
                <label class="checkLabel" for="ck${i}"></label>
                <label class="checkContent" for="ck${i}">${course.id}\t${course.course_name}\t${course.class}\t${course.teacher}\t${course.seg}</label>
                </div>
                `;
                i++;
            }
            document.getElementById("courseList").innerHTML = content;
            document.querySelectorAll("input[type='checkbox']").forEach((element)=>{
                element.addEventListener("change", updateTable, false);
            });
            break;
        case "時間":
            for(let course of coursesList) {
                let flag = false;
                for(let time of course.seg) {
                    if(time.startsWith(query)) {
                        flag = true;
                        break;
                    }
                }
                if(!flag) continue;
                content += `
                <div class="courseBrief">
                <input id="ck${i}" name="schedule" value="${course.id} ${course.class}" type="checkbox"/>
                <label class="checkLabel" for="ck${i}"></label>
                <label class="checkContent" for="ck${i}">${course.id}\t${course.course_name}\t${course.class}\t${course.teacher}\t${course.seg}</label>
                </div>
                `;
                i++;
            }
            document.getElementById("courseList").innerHTML = content;
            document.querySelectorAll("input[type='checkbox']").forEach((element)=>{
                element.addEventListener("change", updateTable, false);
            });
            break;
        default:
            break;
    };
}