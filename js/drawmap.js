function constructHTML(type, className, idName, style, inner){
    var code = "<" + type + " ";
    if(type == "a")
        code += "href='#' ";
    if(className != "")
        code += "class='" + className + "' ";
    if(idName != "")
        code += "id='" + idName + "' ";
    if(style != "")
        code += "style='" + style + "' ";
    if(inner != "")
        code += ">" + inner + "</" + type + ">";
    else
        code += "></" + type + ">";
    return code;
}

function getMapCode(data, blockType, isIcon, rowWidth, seatCustom){
    var mapCode = {};
    var blankSeat = constructHTML("div", "seat_blank", "", "", "");
    var floorChinese = {1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六', 7: '七', 8: '八', 9: '九'};
    var returnVal = [];

    for(var i = 0; i < data.length; i++){
        var floor = parseInt(data[i]['floor']);
        var px = parseInt(data[i]['px']);
        var py = parseInt(data[i]['py']);
        var preserve = parseInt(data[i]['preserve']);
        if(!mapCode[floor])
            mapCode[floor] = [];
        if(!mapCode[floor][py])
            mapCode[floor][py] = new Array(rowWidth).fill(blankSeat);
        if(preserve < 10){
            var seat_id = 'seat_' + data[i]['floor'] + '_' + data[i]['row'] + '_' + data[i]['seat'];
            var classStr = seatCustom(data[i]);
            mapCode[floor][py][px] = constructHTML(blockType, classStr, seat_id, "", data[i]['text']);
        }
        else if(preserve == 11)
            mapCode[floor][py][px] = constructHTML("div", "seat_blank", "", "", data[i]['text']);
        else if(preserve == 12)
            mapCode[floor][py][px] = constructHTML("div", "seat_label", "", "", data[i]['text']);
        else if(preserve == 13)
            mapCode[floor][py][px] = constructHTML("div", "seat_forbid", "", "", data[i]['text']);
    }

    Object.keys(mapCode).forEach(function(i) {
        for(var j = 0; j < mapCode[i].length; j++){
            if(mapCode[i][j])
                mapCode[i][j] = mapCode[i][j].join("");
            else
                mapCode[i][j] = new Array(rowWidth).fill(blankSeat).join("");
        }
        var floor_label = constructHTML("div", "floor_label", "", "", floorChinese[i] + "樓");
        var container_seat = constructHTML("div", "", "container_" + i, "width: " + rowWidth * 18 + "px; height: " + mapCode[i].length * 16 + "px;", mapCode[i].join(""));
        var container_graph = isIcon ? constructHTML("div", "container_graph", "", "", "") : "";
        returnVal.push(constructHTML("div", "floor", "floor_" + i, "display: none;", floor_label + container_seat + container_graph));
    });
    return returnVal;
}
