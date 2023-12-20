//appendChild()是將一個元素放入另一個元素裡當子元素
function createTable(rows, cols) {
    let table = document.createElement('table');
    let tbody = document.createElement('tbody');
    let headerRow = document.createElement('tr');
    let weekdays = [' ','日','一', '二', '三', '四', '五','六'];

    for (let day = 1; day <= cols; day++) {
        let th = document.createElement('th');
        th.textContent =weekdays[day-1];
        headerRow.appendChild(th);
    }
    tbody.appendChild(headerRow);   //將headerRow放入tbody
    
    for (let i = 1; i <= rows; i++) {  //列
        let row = document.createElement('tr');
        let firstCol = document.createElement('td');
        firstCol.innerHTML = `第${i}節`;
        row.appendChild(firstCol);
        for (let j = 2; j <= cols; j++) {  //行
            let col = document.createElement('td');
            row.appendChild(col);  //將cell放入row的元素
        }
        tbody.appendChild(row); //將row放入tbody這個元素裡
    }

    table.appendChild(tbody);   //將tbody放入table
    return table;               //回傳這個表格
}
$(document).ready(()=>{
    document.body.appendChild(createTable(10, 8));  //最後將回傳的表格放入body裡
})
