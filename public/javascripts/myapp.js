let closeImg = new Image();
closeImg.src = "../images/close.png";
$(document).ready(()=>{
    [...document.querySelectorAll('[data-bs-toggle="popover"]')].forEach(el => new bootstrap.Popover(el))
    const close = document.getElementById("closeIcon");
    close.src = closeImg.src;
    close.style.width = "50px";
    close.style.height = "50px";
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
            document.getElementById("searchBox").placeholder = "搜尋" + element.innerText;
            document.getElementById("searchBox").value = "";
            updateList();
        });
    });
    document.getElementById("searchBox").addEventListener("input", updateList, false);
    const sortBtn = document.querySelector(".btn-default");
    sortBtn.addEventListener("click", ()=>{
        if(mutexLock) {
            window.alert("尚未更新完");
            return;
        }
        [coursesList, preList] = [preList, coursesList];
        sortBtn.classList.toggle("btn-default");
        sortBtn.classList.toggle("btn-success");
        sortBtn.innerText = sortBtn.innerText==="依時間"?"依年級":"依時間";
        updateList();
    }, false);
    document.getElementById("popup").addEventListener("click", (e)=>{e.stopPropagation()}, false);
    document.getElementById("closeIcon").addEventListener("click", clearScreen, false);
    let icon = document.querySelectorAll(".pic");
    icon[0].addEventListener("click", printSchedule, false);
    icon[1].addEventListener("click", updateDB, false);
});

let coursesList = [];
let preList = [];   // 用來交換排序順序

document.addEventListener("click", clearScreen, false);

function clearScreen() {
    document.querySelectorAll(".active").forEach((element)=>{
        element.classList.remove("active");
    });
}

function getCourses() {
    $.get("courses", function(courses) {
        document.getElementById("courseList").innerHTML = "";
        let i=0, content = "";
        coursesList = courses;
        courses.forEach((course)=>{
            coursesList[i].checked = false;
            content += `
            <div class="courseBrief">
            <input id="ck${i}" name="schedule" value="${course.id} ${course.class}" type="checkbox"/>
            <label class="checkLabel" for="ck${i}"></label>
            <label class="checkContent" for="ck${i}">${course.id}\t${course.course_name}\t${course.class}\t${course.teacher}\t${course.seg}</label>
            </div>
            `;
            i++;
        });
        preList = [...coursesList]; // 淺copy object的內容會互相引用 但排序不會影響
        preList.sort((a, b)=>{
            return a.class.localeCompare(b.class);
        });
        document.getElementById("courseList").innerHTML = content;
        document.querySelectorAll("input[type='checkbox']").forEach((element)=>{
            element.addEventListener("change", ()=>{
                let target1 = coursesList.find(item => `${item.id} ${item.class}` === element.value);
                target1.checked = !target1.checked;
                updateTable(target1);
            }, false);
        });
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
        firstCol.style.fontSize = "80%";
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

function updateTable(target1){
    let time = target1.seg;
    if (target1.checked) {
        for(let i = 0 ; i < time.length ; i++){
            let nowChooseTime = document.getElementById(time[i]);
            let courseString = target1.id +"<br>"+target1.course_name+"<br>"+target1.teacher+"<br>";
            let element = document.createElement("p");
            element.className = `course ${target1.class} ${target1.id}`;
            element.innerHTML = courseString;
            element.addEventListener("click", popupDetail, false);
            nowChooseTime.appendChild(element);
        }
    }
    else {
        for(let i = 0 ; i < time.length ; i++){
            let nowChooseTime = document.getElementById(time[i]);
            let target2 = Array.from(nowChooseTime.childNodes).find(element=>Array.from(element.classList).includes(target1.class)&&Array.from(element.classList).includes(target1.id));
            nowChooseTime.removeChild(target2);
        }
    }
}

function updateList() {
    let query = document.getElementById("searchBox").value, content = "loading...";
    document.getElementById("courseList").innerHTML = "";
    let checkedList = [];
    if(query == "") {
        let i=0;
        coursesList.forEach((course)=>{
            if(course.checked) checkedList.push(i);
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
        checkedList.forEach((i)=>{
            document.getElementById(`ck${i}`).checked = true;
        });
        document.querySelectorAll("input[type='checkbox']").forEach((element)=>{
            element.addEventListener("change", ()=>{
                let target1 = coursesList.find(item => `${item.id} ${item.class}` === element.value);
                target1.checked = !target1.checked;
                updateTable(target1);
            }, false);
        });
        return;
    }
    let selectType = document.getElementById("selectType").value;
    let i=0;
    switch(selectType) {
        case "課號":
            for(let course of coursesList) {
                if(!course.id.includes(query)) continue;
                if(course.checked) checkedList.push(i);
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
            checkedList.forEach((i)=>{
                document.getElementById(`ck${i}`).checked = true;
            });
            document.querySelectorAll("input[type='checkbox']").forEach((element)=>{
                element.addEventListener("change", ()=>{
                    let target1 = coursesList.find(item => `${item.id} ${item.class}` === element.value);
                    target1.checked = !target1.checked;
                    updateTable(target1);
                }, false);
            });
            break;
        case "課名":
            for(let course of coursesList) {
                if(!course.course_name.includes(query)) continue;
                if(course.checked) checkedList.push(i);
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
            checkedList.forEach((i)=>{
                document.getElementById(`ck${i}`).checked = true;
            });
            document.querySelectorAll("input[type='checkbox']").forEach((element)=>{
                element.addEventListener("change", ()=>{
                    let target1 = coursesList.find(item => `${item.id} ${item.class}` === element.value);
                    target1.checked = !target1.checked;
                    updateTable(target1);
                }, false);
            });
            break;
        case "老師":
            for(let course of coursesList) {
                if(!course.teacher.includes(query)) continue;
                if(course.checked) checkedList.push(i);
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
            checkedList.forEach((i)=>{
                document.getElementById(`ck${i}`).checked = true;
            });
            document.querySelectorAll("input[type='checkbox']").forEach((element)=>{
                element.addEventListener("change", ()=>{
                    let target1 = coursesList.find(item => `${item.id} ${item.class}` === element.value);
                    target1.checked = !target1.checked;
                    updateTable(target1);
                }, false);
            });
            break;
        case "系所":
            query = query==="通"||query==="通識"?"共同教育中心博雅教育組" : query;
            query = query==="資"||query==="資工"?"資訊工程學系" : query;
            for(let course of coursesList) {
                if(!course.dept_name.includes(query)) continue;
                if(course.checked) checkedList.push(i);
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
            checkedList.forEach((i)=>{
                document.getElementById(`ck${i}`).checked = true;
            });
            document.querySelectorAll("input[type='checkbox']").forEach((element)=>{
                element.addEventListener("change", ()=>{
                    let target1 = coursesList.find(item => `${item.id} ${item.class}` === element.value);
                    target1.checked = !target1.checked;
                    updateTable(target1);
                }, false);
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
                if(course.checked) checkedList.push(i);
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
            checkedList.forEach((i)=>{
                document.getElementById(`ck${i}`).checked = true;
            });
            document.querySelectorAll("input[type='checkbox']").forEach((element)=>{
                element.addEventListener("change", ()=>{
                    let target1 = coursesList.find(item => `${item.id} ${item.class}` === element.value);
                    target1.checked = !target1.checked;
                    updateTable(target1);
                }, false);
            });
            break;
        default:
            break;
    };
}

function popupDetail(event) {
    event.stopPropagation();
    document.querySelector(".popup-container").classList.add("active");
    const name = event.target.innerHTML.split("<br>")[1],
            cls = event.target.classList[1];
    const course = coursesList.find(element => element.course_name === name && element.class === cls);
    document.getElementById("popupName").innerHTML = name;
    document.querySelector(".popID").innerHTML = course.id;
    document.querySelector(".popTeacher").innerHTML = course.teacher
    document.querySelector(".popTime").innerHTML = course.seg;
    document.querySelector(".popRoom").innerHTML = course.place;
    document.querySelector(".popEva").innerHTML = course.evaluation;
}

function printSchedule() {
    // 取得表格元素
    let table = document.getElementById("schedule");
    
    const width = table.offsetWidth;
    const height = table.offsetHeight;

    // 將表格開在另外一個視窗
    let printWindow = window.open('', '', `width=${width}, height=${height}`);

    printWindow.document.write('<html><head><title>Schedule</title>');
    printWindow.document.write('</head><body></body></html>');
    printWindow.document.close();
    
    printWindow.document.body.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/earlyaccess/cwtexyen.css');
            @import url('https://fonts.googleapis.com/css2?family=Comfortaa&family=Lobster&display=swap');
            body {
                font-family: 'cwTeXYen','Comfortaa', sans-serif;
            }
            table {
                border: none;
                background-color: rgba(87, 96, 99, 0.5);
                /*表格背景顏色*/
                /*最後一個數字是表示他的透明度 0為透明 1為完全不透明*/
                width: 100%;
                table-layout: fixed;
                word-wrap: break-word;
                margin-bottom: 10px;
                border-collapse: collapse;
            }
            
            table td,
            table th {
                padding: 10px;
                /*表格周圍邊框*/
                color: black;
                /*字體顏色*/
                font-size: 14px;
                text-align: center;
                border: 1px solid black;
                color: white;
            }
            .timeTo {
                transform: rotate(90deg);
                display: inline-block;
                font-size: 20px;
            }
        </style>
        <table>
            ${table.innerHTML}
        </table>
    `;
    
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}
let mutexLock = false;
function updateDB(e) {
    e.target.style.transform = 'rotate(360deg)';
    setTimeout(()=>{
        e.target.style.transition = "none";
        e.target.style.transform = '';
    }, 500)
    e.target.style.transition = "transform 0.5s ease";
    if(mutexLock) {
        window.alert("尚未更新完");
        return;
    }
    mutexLock = true;
    coursesList = [];
    preList = [];
    createTable();
    document.getElementById("courseList").innerHTML = "loading...";

    $.ajax({
        url: "",
        type: "POST",
        success: (res)=>{
            document.getElementById("courseList").innerHTML= res.message;
            getCourses();
            mutexLock = false;
        }
    });
}