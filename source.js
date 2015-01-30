/**
 * Created by randre03 on 10/23/14 from mithril website.
 */
var data = JSON.parse(localStorage["spreadsheet"] || "{}");
for (var cell in data) data[cell] = computable(data[cell]);

function computable(value) {
  var output = new String(value);
  output.valueOf = compute.bind(this, value);
  return isNaN(+value) ? output : +value;
}

function compute(value) {
  if (value != null && value[0] == "=") {
    try { with (data) return eval(value.substring(1)) } catch (e) {}
  }
  else return value;
}

function update(cell, value) {
  data[cell] = computable(value);
  localStorage["spreadsheet"] = JSON.stringify(data);
}

var cell = m.prop();

function grid(withCell) {
  for (var rows = [], i = 0; i < 27; i++) {
    for (var cols = [], j = 0; j < 17; j++) {
      var letter = String.fromCharCode("a".charCodeAt(0) + j - 1);
      cols.push(m("td", i && j ? withCell(letter + i) : i || letter));
    }
    rows.push(m("tr", cols));
  }
  return m("table", rows);
}

function view() {
  return [
    m("input.formula", {
      onchange: m.withAttr("value", update.bind(this, cell())),
      value: data[cell()] || ""
    }),
    grid(function(cellName) {
      var value = compute(data[cellName]) || "";
      return m("input", {
        onkeypress: move,
        onfocus: cell.bind(this, cellName),
        onchange: m.withAttr("value", update.bind(this, cellName)),
        value: value,
        style: {textAlign: isNaN(value) || value === "" ? "left" : "right"}
      });
    })
  ];
}

function move(e) {
  var td = e.target.parentNode, tr = td.parentNode, table = tr.parentNode;
  if (e.keyCode == 37) {
    return highlight(tr.childNodes[Math.max(1, td.cellIndex - 1)].firstChild);
  }
  else if (e.keyCode == 38) {
    return highlight(table.childNodes[Math.max(1, tr.rowIndex - 1)].childNodes[td.cellIndex].firstChild);
  }
  else if (e.keyCode == 39) {
    return highlight(tr.childNodes[Math.min(tr.childNodes.length - 1, td.cellIndex + 1)].firstChild);
  }
  else if (e.keyCode == 40) {
    return highlight(table.childNodes[Math.min(table.childNodes.length - 1, tr.rowIndex + 1)].childNodes[td.cellIndex].firstChild);
  }
  else {
    m.redraw.strategy("none");
  }
}

function highlight(cell) {
  cell.focus();
  cell.selectionEnd = cell.value.length;
  return false;
}

m.module(document.body, {controller: function() {}, view: view});
