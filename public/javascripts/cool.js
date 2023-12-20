//appendChild()是將一個元素放入另一個元素裡當子元素
function createTable(rows, cols) {
    var table = document.createElement('table');
    var tbody = document.createElement('tbody');
    var headerRow = document.createElement('tr');
    var weekdays = ['日','一', '二', '三', '四', '五','六'];

    for (var day = 1; day <= cols; day++) {
        var th = document.createElement('th');
        th.textContent =weekdays[day-1];
        headerRow.appendChild(th);
    }
    tbody.appendChild(headerRow);   //將headerRow放入tbody
    
    for (var i = 1; i <= rows; i++) {  //列
        var row = document.createElement('tr');
        for (var j = 1; j <= cols; j++) {  //行
            var col = document.createElement('td');
            row.appendChild(col);  //將cell放入row的元素
        }
        tbody.appendChild(row); //將row放入tbody這個元素裡
    }

    table.appendChild(tbody);   //將tbody放入table
    return table;               //回傳這個表格
}
$(document).ready(()=>{
    document.body.appendChild(createTable(10, 7));  //最後將回傳的表格放入body裡
})
