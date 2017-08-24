//расстояние от границы блока до ближайшей линии
var point_radius = 10

function connect(prefix, firstBlokId, firstBlokPosition, secondBlockId, secondBlockPosition, style = 'line', className = '', title = '', point_style = 'invisible_circle')
{
	var point1 = getPoint(prefix + firstBlokId, firstBlokPosition, point_style)
	var point2 = getPoint(prefix + secondBlockId, secondBlockPosition, point_style)
	
	if (style == 'line') draw_div_line(getOffset(point1).left - point_radius, getOffset(point1).top - point_radius, getOffset(point2).left - point_radius, getOffset(point2).top - point_radius, className, title)
	
	if (style == 'polyline') drawViaDei(point1, point2, prefix, 10, className, title)
	
}

function draw_div_line(x1, y1, x2, y2, className = '', title = ''){
	var line = document.createElement('div')
	var len = Math.pow(((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2)), 0.5)
	
	line.className = className
	if (className == '')
	{
		line.style.backgroundColor = 'black'
		line.style.height = '1px'
	}
	line.style.position = 'absolute'
	line.style.width = len + "px"
	document.body.appendChild(line)

	//вычисляем угол поворота
	var angle = 0
	angle = getAngle(x1, y1, x2, y2)
	line.style.transform = 'rotate(' + angle + 'deg)'
	
	//точка начала прямой (с учетом вращения через центр)
	line.style.left = (x1 + point_radius)                          + (x2 - x1)/2 - len/2 + 'px'
	line.style.top =  (y1 + point_radius - line.clientHeight/2)    + (y2 - y1)/2 + 'px'
	
	if (title != '') line.title = title
}

function draw_div_point(x1, y1, className = '', title = '') {
	var point = document.createElement('div')
	
	point.className = className
	if (className == '')
	{
		point.style.backgroundColor = 'black'
		point.style.width = point_radius + 'px'
		point.style.height = point_radius + 'px'
		point.style.borderRadius = (point_radius/2) + 'px'
	}
	point.style.position = 'absolute'
	document.body.appendChild(point)
	
	point.style.left = x1 - point.clientWidth/2 + 'px'
	point.style.top =  y1 - point.clientHeight/2 + 'px'
	
	if (title != '') point.title = title
}

function getPoint(id, pos, className = '') {
	var block = document.getElementById(id)
	var point = document.createElement('div')
	
	point.className = className
	point.style.position = 'absolute'
	document.body.appendChild(point)
	
	point.style.top = getOffsetRect(block).top + 'px'
	point.style.left = getOffsetRect(block).left + 'px'

	if (pos == 'top')
	{
		point.style.top = getOffsetRect(point).top - point.clientHeight/2 + 'px'
		point.style.left = getOffsetRect(point).left + block.clientLeft + block.clientWidth/2 - point.clientWidth/2 + 'px'
	}

	if (pos == 'bottom')
	{
		point.style.top = getOffsetRect(point).top + block.offsetHeight - point.clientHeight/2 + 'px'
		point.style.left = getOffsetRect(point).left + block.clientLeft + block.clientWidth/2 - point.clientWidth/2 + 'px'
	}
	
	if (pos == 'left')
	{
		point.style.top = getOffsetRect(point).top + block.clientTop + block.clientHeight/2 - point.clientHeight/2 + 'px'
		point.style.left = getOffsetRect(point).left - point.clientWidth/2 + 'px'
	}

	if (pos == 'right')
	{
		point.style.top = getOffsetRect(point).top + block.clientTop + block.clientHeight/2 - point.clientHeight/2 + 'px'
		point.style.left = getOffsetRect(point).left + block.offsetWidth - point.clientWidth/2 + 'px'
	}

	if (pos == 'center')
	{
		point.style.top = getOffsetRect(point).top + block.clientTop + block.clientHeight/2 - point.clientHeight/2 + 'px'
		point.style.left = getOffsetRect(point).left + block.clientLeft + block.clientWidth/2 - point.clientWidth/2 + 'px'
	}

	return point
}

function getAngle(x1, y1, x2, y2) {
	return 180/Math.PI*Math.atan2(y2-y1, x2-x1)
}

//абсолютные координаты элемента
function getOffset(elem) {
    if (elem.getBoundingClientRect) {
        // "правильный" вариант
        return getOffsetRect(elem)
    } else {
        // пусть работает хоть как-то
        return getOffsetSum(elem)
    }
}
function getOffsetSum(elem) {
    var top=0, left=0
    while(elem) {
        top = top + parseInt(elem.offsetTop)
        left = left + parseInt(elem.offsetLeft)
        elem = elem.offsetParent
    }

    return {top: top, left: left}
}
function getOffsetRect(elem) {
    // (1)
    var box = elem.getBoundingClientRect()

    // (2)
    var body = document.body
    var docElem = document.documentElement

    // (3)
    var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop
    var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft

    // (4)
    var clientTop = docElem.clientTop || body.clientTop || 0
    var clientLeft = docElem.clientLeft || body.clientLeft || 0

    // (5)
    var top  = box.top +  scrollTop - clientTop
    var left = box.left + scrollLeft - clientLeft

    return { top: Math.round(top), left: Math.round(left) }
}

//рисуем кратчайший путь
function drawViaDei(point1, point2, prefix, padding, className = '', title = '') {
	//prefix - префикс id блока (например для id=block1, block2, block3 префикс - block). Это нужно для обтекания блоков - не всех, а избранных
	//padding - отступ точек от границы блока (для обтекания)

	//запоминаем id все нужных div-ов
	var obj = []
	var blocks = document.getElementsByTagName('div')
	for (var i=0; i < blocks.length; i++)
	{
		if (blocks[i].id.substr(0, prefix.length) == prefix) obj.push(blocks[i].id)
	}
	var obj_len = obj.length
	
	//координаты точек для облака
	window.cloud_of_points = []
	var xx = []
	var yy = []
	window.obj_x1 = []
	window.obj_x2 = []
	window.obj_y1 = []
	window.obj_y2 = []
	for (var i=0; i < obj_len; i++) 
	{
		var self = document.getElementById(obj[i])
		xx[Math.round(getOffsetRect(self).left - padding)] = 1
		xx[Math.round(getOffsetRect(self).left + self.offsetWidth/2)] = 1
		xx[Math.round(getOffsetRect(self).left + self.offsetWidth + padding)] = 1
		yy[Math.round(getOffsetRect(self).top - padding)] = 1
		yy[Math.round(getOffsetRect(self).top + self.offsetHeight/2)] = 1
		yy[Math.round(getOffsetRect(self).top + self.offsetHeight + padding)] = 1
		//запоминаем углы объектов
		obj_x1.push(getOffsetRect(self).left)
		obj_x2.push(getOffsetRect(self).left + self.offsetWidth)
		obj_y1.push(getOffsetRect(self).top)
		obj_y2.push(getOffsetRect(self).top + self.offsetHeight)
	}
	
	var n = 0;
	xx.forEach(function(value_x, x, xx) {
		yy.forEach(function(value_y, y, yy) {
			//проверяем - не попали ли внутрь блоков
			var inner = 0;
			for (var i=0; i < obj_len; i++)
			{
				elem = document.getElementById(obj[i])
				if (x > getOffsetRect(elem).left - padding && x < getOffsetRect(elem).left + elem.offsetWidth + padding && y > getOffsetRect(elem).top - padding && y < getOffsetRect(elem).top + elem.offsetHeight + padding)
				{
					inner = 1
					break
				}
			}
			if (inner == 0)
			{
				cloud_of_points[n] = { x: x, y: y}
				n++
			}
		})
	})
	
	//добавляем точки старта-финиша
	cloud_of_points[n] = { x: getOffsetRect(point1).left + point1.clientWidth/2, y: getOffsetRect(point1).top + point1.clientHeight/2}
	n++
	cloud_of_points[n] = { x: getOffsetRect(point2).left + point2.clientWidth/2, y: getOffsetRect(point2).top + point1.clientHeight/2}
	n++
	
	//индексируем облако точек
	window.point_index = []
	cloud_of_points.forEach(function(value, key, arr) {
		if (point_index[arr[key].x] === undefined) point_index[arr[key].x] = []
		point_index[arr[key].x][arr[key].y] = key
	});
	
	//вычисляем путь по Дейкстре
	window.start_x = getOffsetRect(point1).left + point1.clientWidth/2
	window.start_y = getOffsetRect(point1).top + point1.clientHeight/2
	window.finish_x = getOffsetRect(point2).left + point2.clientWidth/2
	window.finish_y = getOffsetRect(point2).top + point2.clientHeight/2
	
	dei(start_x, start_y, 0)
	
	//рисуем сами точки
	//for (var i=0; i < cloud_of_points.length; i++) draw_div_point(cloud_of_points[i].x, cloud_of_points[i].y, '', cloud_of_points[i].x + ":" + cloud_of_points[i].y + ", distanceTo=" + cloud_of_points[i].distanceTo)
	
	//итоговый путь, начиная от point1...
	for (var i = 0; i < cloud_of_points[point_index[finish_x][finish_y]].wayTo.length - 1; i++) {
		draw_div_line(cloud_of_points[cloud_of_points[point_index[finish_x][finish_y]].wayTo[i]].x - point_radius, cloud_of_points[cloud_of_points[point_index[finish_x][finish_y]].wayTo[i]].y - point_radius, cloud_of_points[cloud_of_points[point_index[finish_x][finish_y]].wayTo[i+1]].x - point_radius, cloud_of_points[cloud_of_points[point_index[finish_x][finish_y]].wayTo[i+1]].y - point_radius, className, title)
	}
	//...и заканчивая point2
	draw_div_line(cloud_of_points[cloud_of_points[point_index[finish_x][finish_y]].wayTo[i]].x - point_radius, cloud_of_points[cloud_of_points[point_index[finish_x][finish_y]].wayTo[i]].y - point_radius, finish_x - point_radius, finish_y - point_radius, className, title)
	
}

//расстояние между точками
function dist(x1, y1, x2, y2) {
	out = 99999;
	if (x1 == x2 || y1 == y2) out = Math.pow(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2), 0.5);

	//запрещаем пересекать объекты
	for (var i=0; i<obj_x1.length; i++) {
		if (out > 0 && out != 99999 && x1 <= obj_x1[i] && x1 <= obj_x2[i] && x2 >= obj_x1[i] && x2 >= obj_x2[i]) out = 99999;
		if (out > 0 && out != 99999 && x2 <= obj_x1[i] && x2 <= obj_x2[i] && x1 >= obj_x1[i] && x1 >= obj_x2[i]) out = 99999;
		if (out > 0 && out != 99999 && y1 <= obj_y1[i] && y1 <= obj_y2[i] && y2 >= obj_y1[i] && y2 >= obj_y2[i]) out = 99999;
		if (out > 0 && out != 99999 && y2 <= obj_y1[i] && y2 <= obj_y2[i] && y1 >= obj_y1[i] && y1 >= obj_y2[i]) out = 99999;
	}

	return out;
}

//Дейкстра - ищем непосещенную вершину с минимальным расстоянием
function dei(x, y, distTo) {
	var minimum = 99999
	
	//стираем переменные для расчета каждого нового объекта
	if (distTo == 0) {
		cloud_of_points.forEach(function(value, key, arr) {
			cloud_of_points[key].visited = 0;
			cloud_of_points[key].distanceTo = 99999;
			cloud_of_points[key].wayTo = [];
		});
	}
	
	cloud_of_points[point_index[x][y]].visited = 1;
	cloud_of_points[point_index[x][y]].distanceTo = distTo;
	var min_dist = 999999;
	var indx;
	cloud_of_points.forEach(function(value, key, arr) {
		if (cloud_of_points[key].visited == 0 && cloud_of_points[key].distanceTo > dist(x, y, cloud_of_points[key].x, cloud_of_points[key].y) + distTo) {
			cloud_of_points[key].distanceTo = dist(x, y, cloud_of_points[key].x, cloud_of_points[key].y) + distTo; 
			cloud_of_points[key].wayTo = cloud_of_points[point_index[x][y]].wayTo.concat(point_index[x][y]);
		}
		if (cloud_of_points[key].distanceTo < min_dist && cloud_of_points[key].visited == 0) {
			min_dist = cloud_of_points[key].distanceTo;
			indx = point_index[cloud_of_points[key].x][cloud_of_points[key].y];
		}
		if (cloud_of_points[key].x == finish_x && cloud_of_points[key].y == finish_y && cloud_of_points[key].distanceTo < minimum) minimum = cloud_of_points[key].distanceTo;
	});
	if (indx !== undefined) {
		if (cloud_of_points[indx].distanceTo < minimum) dei(cloud_of_points[indx].x, cloud_of_points[indx].y, min_dist);
	}
}

