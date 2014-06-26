/*
               Borisov Timofey Urievitch aka Botu
    Copyright: (C) 2014 Borisov Timofey Urievitch aka Botu
     Filename: botu.js
      Comment: 
	  Для работы данного инструмента требуется наличие 2-х шейдеров
	  <script type="x-shader" id="vertexShader">
		...  Код шейдера ... При этом вершины передаются через атрибут attribute vec3 botuPosition;
	  </script>
	  и
	  
    <script type="x-shader" id="fragmentShader">
	...  Код шейдера ... 
    </script>	  
		
	Пример:
    <script type="x-shader" id="vertexShader">
	attribute vec3 botuPosition;

        
        varying vec4 colorPos;
        void main(){

        colorPos = abs(vec4(botuPosition.x, botuPosition.y, botuPosition.z,200.0) / 200.0);
        gl_Position = vec4(botuPosition,200);
        }

    </script>
    <script type="x-shader" id="fragmentShader">
        precision highp float;
        varying vec4 colorPos;
        void main(){
        gl_FragColor = colorPos;
        }
    </script>		

	
	  1. Создай холст
	  var scene = new Scene("webglDOM");  где webglDOM - это id элемента canvas
	  
		1.1 Установка размеров
			scene.setViewPort(300, 300);   1-ый параметр - ширина, второй - высота
		1.2 Установка цвета заливки (необязательно)
			scene.setBackgroundColor([0.1,0.5,0.6,0.2]);  входящий параметр - вектор RGBA	
	  
	  2. Создание примитива
		
		2.1 Для создания куба
		var cube = new cub([-100,105,0],90,90,90); 
			1-ый параметр - центр
			2-ой параметр - ширина
			3-ой параметр - высота	  
			4-ой параметр - глубина

		2.2 Для создания прямоугольника				
		var plain = new plainClass([100,10,10],120,130);
			1-ый параметр - центр
			2-ой параметр - ширина
			3-ой параметр - высота	
		2.2 Для создания сферы
		var circ = new circle([-120,-70,0],60,30);			
			1-ый параметр - центр
			2-ой параметр - радиус
			3-ий параметр - детализация (минимум 10, чем больше, тем лучше качество и "тяжелее" сфера)

		
	  3. Добавляем созданный примитив на сцену
		scene.AddObject(cube);

	  4. Рисуем
		scene.draw(); 

	  5. Для анимации делаем всё тоже самое, только перед 3-ем этапом очищаем текущую сцену
		scene.clear();
		
	Рабочий пример:

window.onload = function () {
    var scene = new Scene("webgl");
    scene.setBackgroundColor([0.1,0.5,0.6,0.2]);
    
    scene.setViewPort(300, 300);
    
    var angle = 0;
    var debugAngle = document.getElementById("debugAngle");
    var speed = 0;


    var cube = new cub([-100,105,0],90,90,90);
    var circ = new circle([-120,-70,0],60,30);
    var plain = new plainClass([100,10,10],120,130);
    

    
    

        (function animloop(){

          
          if(angle >=90){
            speed = -0.01;
          }

          if(angle <= 0){
            speed = 0.01;
          }	

          angle+=speed;
          debugAngle.innerHTML = angle + " " + speed;
          scene.clear();
          
          cube.rotateAroundCenter(angle,"byY");	
          cube.rotateAroundCenter(angle,"byX");	
          cube.rotateAroundCenter(angle,"byZ");	
          plain.rotateAroundCenter(angle,"byX");	
          circ.rotateAroundPoint(angle,[-100,-50,20],"byZ");	
    

            scene.AddObject(cube);
            scene.AddObject(circ);
            scene.AddObject(plain);
          scene.draw(); 
          requestAnimFrame(animloop, scene.canvas);
        })();
    

}



window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       || 
              window.webkitRequestAnimationFrame || 
              window.mozRequestAnimationFrame    || 
              window.oRequestAnimationFrame      || 
              window.msRequestAnimationFrame     ||
             function(callback, element) {
               return window.setTimeout(callback, 1000/100);
             };
})();	
	
*/


/*Создание копии объекта - object и возврат копии в объекте класса type*/
function makeCopy(object,type){
    var vertex  = object.vertex.slice(0);
    var indices = object.indices.slice(0);
    return new type(vertex,indices);
}

/*умножение вектора vector на матрицу matrix. Возвращает вектор - resultVector*/
function vectorByMatrix(vector,matrix)
{
    var resultVector = [];
    if (vector.length == matrix.rowNumbers)
    {
        var columnCount = 0;
        while(columnCount < matrix.columnNumbers){
            var rowCount = 0;
            var value = 0;
            while(rowCount < matrix.rowNumbers)
            {

                value += vector[rowCount] * matrix.column[columnCount][rowCount];	
                rowCount++;
            }
            resultVector.push(value);
            columnCount++;
        }
    }

    return resultVector;
}

/*описание матрицы. Входящий параметр, массив source и кол-во колонок, на который данный массив требуется разбить - columns*/
function botuMatrix (source,columns)
{

    this.source = source;  // исходные данные
    this.columnNumbers = columns; // количество колонок. Размерность точки
    this.rowNumbers = source.length / columns; //количество строк. Количество точек
    this.rows = []; //массив строк. Массив точек. 
    this.minval = []; // точка с минимальными координатами по всем осям
    this.maxval = []; // точка с максимальными координатами по всем осям
    this.radius = []; // расстояние от центра до самой отдаленной точки
    this.center = []; // точка-центр.
    this.column = []; // массив колонок - координат. this.column[0] - это массив координат x по всем точкам.

    /*Если есть хотя бы одно значение в входящем векторе.*/    
    if (source.length > 0)
    {
        var count = 0;
	/*заполняем массив строк - rows и массив колонок column*/
        while(count < source.length)
        {
	    /*текущая строка*/
            var currentRow = this.source.slice(count,count + this.columnNumbers);		
			/*добавляем текущую строку в массив строк*/
            this.rows.push(currentRow);
            
            var columnCount = 0;
            /*формируем массив колонок, добавляя в каждую колонку - соответствующее значение координаты текущей строки.
           */
            while(columnCount <= this.columnNumbers)
            {
                /*Вначале инициализируем каждую колонку*/
                if (!this.column[columnCount]) 
                {
                    this.column[columnCount] = [];
                }
                /*Для каждой колонки добавляем значение из текущей строки.*/
                this.column[columnCount].push(currentRow[columnCount]);
                columnCount += 1;
            }
            /*переходим к следующей строке*/    
            count = count + this.columnNumbers; 
        }	
        this.rowNumbers = this.rows.length; 
        /*нахождение полезных переменных - центр, точка максимума, точка минимума*/        
        if (this.rows.length > 0)
        {
            count = 0;
            /*проходим по всем строкам - точкам*/
            while(count < this.rows.length)
            {
                /*Изначально все точки равняются первой попавшейся точки*/
                var tempRow = this.rows[count].slice(0);
                if (count == 0 )
                {
                    this.minval = tempRow.slice(0);
                    this.maxval = tempRow.slice(0);
                    this.radius = tempRow.slice(0);
                    this.center = tempRow.slice(0);
                }
            
                /*Затем после сравнения рассчитываем новые значение точек.*/
                if (count > 0)
                {
                    var rowcount = 0;
                    while(rowcount < tempRow.length)
                    {
                        this.minval.splice(rowcount,1,Math.min(this.minval[rowcount],tempRow[rowcount]));
                    
                        this.maxval.splice(rowcount,1,Math.max(this.maxval[rowcount],tempRow[rowcount]));
                        this.radius.splice(rowcount,1,(this.maxval[rowcount] - this.minval[rowcount]) / 2);
                        this.center.splice(rowcount,1,this.maxval[rowcount] - this.radius[rowcount]);
                        rowcount = rowcount + 1; 
                    }
                }
                /*На всякий случай удаляем ссылку на первую точку*/
                tempRow = undefined;
                count = count + 1;
            }
            /*очищаем память.*/ 
            tempRow = undefined;
        }
    
    }

}

/*Операции с матрицей*/
botuMatrix.prototype = {
    /*перемещаем матрицу*/
    move: function(value,xyzw){
        /*У всех точек изменяем значение соответствующих координат*/
        this.column[xyzw] = this.column[xyzw].map(function(i){return i+value;})	
        /*Обновляем матрицу по новому значению колонок*/
        this.updateByColumn();
    },
    /*обновление матрицы по обновленным колонкам*/
    updateByColumn:function(){
        var columnCount = 0;
        /*проходим по всем колонкам*/
        while(columnCount < this.columnNumbers)
        {
            var rowCount = 0;
         /*по каждой строке обновляем значение исходя из нового значения колонки, также обновляем значение у вектора*/
            while(rowCount < this.rowNumbers)
            {
                this.rows[rowCount][columnCount] = this.column[columnCount][rowCount];
                this.source[columnCount + rowCount * this.columnNumbers] = this.column[columnCount][rowCount]; 
                rowCount++;
            }
            
            columnCount++;
        }	
    },
    /*обновление матрицы по обновленным строкам*/
    updateByRow:function(){
        var rowCount = 0;
        /*проходим по каждой строке*/
        while(rowCount < this.rowNumbers)
        {
            var columnCount = 0;
/*по каждой колонке обновляем значение исходя из нового значения строки, также обновляем значение у вектора*/      
      while(columnCount < this.columnNumbers)
            {
                this.column[columnCount][rowCount] = this.rows[rowCount][columnCount];
                this.source[columnCount + rowCount * this.columnNumbers] = this.column[columnCount][rowCount]; 
                columnCount++;
            }
            columnCount = undefined;
            
            rowCount++;
        }	
        columnCount = undefined;
        rowCount = undefined;
},	
/*перемещение матрицы к определенной точки - point*/
    toPoint:function(point){
        if (point)
        {
            if(point.length == this.columnNumbers)
            {
      /*каждую строку-точку изменяем на значение из точки - point. */   
             this.rows = this.rows.map(function(rowArray){
                    return rowArray.map(function(rowElement,index)
                    {
                        return rowElement + point[index];
                    }
                    )
                });
/*Обновляем матрицу по новому значению строк*/				
                this.updateByRow();
            }		
        }
    },
       
    /*разворот матрицы this на угол angle, вокруг точки point по оси - xyzType*/    
    rotate:function(angle,point,xyzType){
		/*умножение вектора на число*/
        function multPointByValue(point,value){
            return point.map(function(val){return value * val});
        }
		/*смещаем матрицу так, чтобы точка point, вокруг которой идет разворот сместилась в точку [0,0,0]*/
        this.toPoint(multPointByValue(point,-1));
        //массив для матрицы разворота
		var rotateSource = [];
        // перевод градусы в радианы
		var radians = angle * Math.PI / 180.0;

        //выбор оси вокруг которой происходит разворот
        switch(xyzType){
            case "byX":
			    //формируем массив для матрицы разворота, вокруг оси X
                rotateSource = [1,0,0,
                                0,Math.cos(radians),Math.sin(radians),
                                0,-1 * Math.sin(radians),Math.cos(radians)
                ];
                break;
            case "byY":
			//формируем массив для матрицы разворота, вокруг оси y
                rotateSource = [Math.cos(radians),0,-1 * Math.sin(radians),
                                0,1,0,
                                Math.sin(radians),0,Math.cos(radians)
                                ];
                break;
            case "byZ":
			//формируем массив для матрицы разворота, вокруг оси Z
                rotateSource = [Math.cos(radians),Math.sin(radians),0,
                                -1 * Math.sin(radians),Math.cos(radians),0,
                                0,0,1];
                break;			

        }
        
		//создаем матрицу разворота
        var rotateMatrix = new botuMatrix(rotateSource,3);
        //разворачиваем текущую матрицу, умножив каждую точку - строки rows[i] на матрицу разворота
		this.rows = this.rows.map(function(irow){
            return vectorByMatrix(irow,rotateMatrix);
        });
		//обнуляем матрицу разворота и массив для матрицы разворота. Данные операции автомат. произведутся сборщиком мусора. На всякий случай очищаем явно.
        rotateMatrix = null;
		//обнуляем массив для матрицы разворота
        rotateSource = null;
		/*обновление матрицы по обновленным строкам-точкам, которые были развернуты*/
        this.updateByRow();
		//перемещение матрицы в исходное положение.
        this.toPoint(point);
    }

    
}



/*Холст. настройка WebGl. canvasID - id элемента canvas в html документе*/
function Scene(canvasID) {
    /*Установка цвета заливки по умолчанию*/
	this.backgroundColor = {red:1.0, green:1.0, blue:1.0, alpha:1.0};
    /*находим холст*/
	this.canvas = document.getElementById(canvasID);
    /*инициализируем webgl Context*/
	this.getContext();
	/*буфер для вершинного шейдера*/
    this.indicBuffer = null;
	/*массив вершин*/
    this.vecVertex = [];
    /*массив индексов*/
	this.vecIndices = [];
	
	this.initProgram("vertexShader", "fragmentShader");
        

}

Scene.prototype = {

	/*очищаем буфер, массив вершин и массив индексов*/
    clear: function(){
        this.indicBuffer = null;
        this.vecVertex = [];
        this.vecIndices = [];		
    
    },
    
	/*получаем WebGl Context, если броузер его поддерживает*/
    getContext:function(){
        var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
        this.gl = null;
        for (var ii = 0; ii < names.length; ++ii) {
            try {
                this.gl = this.canvas.getContext(names[ii]);
            } catch(e) {}
        if (this.gl) {
            break;
        }
        }	
    
    },
    
    /*Создание и инициализация буферов. Заполняем буфер вершин значениями из входного параметра vertex, если передан 2 входных параметра, 
	то создаем и заполняем буфер индексов массивом из 2-ого параметра  */
    initBuffers: function (vertex, indices) {
        /*создаем буфер вершин*/
		this.vertexBuffer = this.gl.createBuffer();
        /*размерность вершины*/
		this.vertexBuffer.size = vertex.size;
        /*подвязываем буфер вершин*/
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
		/*Получаем индекс атрибута - botuPosition*/
        this.program.botuPositionAttr = this.gl.getAttribLocation(this.program, "botuPosition");
        /*Включаем атрибут, находящийся в вершинном массиве атрибутов по индексу - this.program.botuPositionAttr*/
		this.gl.enableVertexAttribArray(this.program.botuPositionAttr);
		/*Заполняем буфер вершин, переведенными в тип Float32, значениями из массива вершин*/
        this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array(vertex), this.gl.STATIC_DRAW);
        /*Устанавливаем атрибут с индексом this.program.botuPositionAttr, размерностью вершины - this.vertexBuffer.size для буфера вершин*/
		this.gl.vertexAttribPointer(this.program.botuPositionAttr,this.vertexBuffer.size,this.gl.FLOAT,false,0,0);
       /*Если передан массив индексов*/ 
       if(indices)
        {
		    /*Создаем буфер индексов*/
            this.indicBuffer = this.gl.createBuffer();
            /*определяем кол-во точек по кол-ву индексов*/
			this.indicBuffer.numberOfItems = indices.length;
            /*подвязываем буфер индексов*/
			this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indicBuffer);
            /*заполняем буфер индексов, переведенными в целочисленный тип Uint16, значениями из массива indices*/
			this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);
        }


    },
    

    /*Создаем программу шейдеров, vxShaderDom - id элемента script в котором хранится код вершинного шейдер,
								  frShaderDom - id элемента script в котором хранится код фрагментного шейдера
	*/
    initProgram: function (vxShaderDom, frShaderDom) {
		/*вершинный шейдер*/
        var vxShader = document.getElementById(vxShaderDom).textContent;
        /*фрагментный шейдер*/
		var frShader = document.getElementById(frShaderDom).textContent;

		/*создаем программу в контексте this.gl и шейдеры: вершинный шейдер vxShader и фрагментный шейдер - frShader*/
        this.program = createProgram(this.gl,vxShader, frShader);
        /*В нашем контексте используем данные шейдеры*/
		this.gl.useProgram(this.program);    

		/*Создание программы с вершинным шейдером - vxs и фрагментным шейдером - frs и приявязка к контексту context*/
        function createProgram(context, vxs, frs) {
			/*создаем программу*/
            var prg = context.createProgram();
            /*создаем вершинный шейдер*/
			var VertexShader = createShader(context, context.VERTEX_SHADER, vxs);
            /*создаем фрагментный шейдер*/
			var FragmentShader = createShader(context, context.FRAGMENT_SHADER, frs);
            /*подключаю вершинный шейдер*/
			context.attachShader(prg,VertexShader);
            /*подключаю фрагментный шейдер*/
			context.attachShader(prg,FragmentShader);
            /*подлючаю программу в контекст - context*/
			context.linkProgram(prg);
			/*проверка на ошибки*/
            if (!context.getProgramParameter(prg, context.LINK_STATUS)) {
                /*вывод текста ошибки*/
				alert(context.getProgramInfoLog(prg));
            }
			/*возвращаем созданную программу*/
            return prg;
        }

		/*Создаем шейдер в контексте context с типом type, код программы шейдера - shader*/
        function createShader(context,type,shader)
        {
			/*создаем шейдер с типом - type*/	
            var sh = context.createShader(type);
            /*код шейдера - shader*/
			context.shaderSource(sh, shader);
            /*компилируем программу шейдера*/
			context.compileShader(sh);
			/*проверка на ошибку компиляции*/
            if (!context.getShaderParameter(sh, context.COMPILE_STATUS))
            {
			    /*сообщаем об ошибке компиляции*/
                alert(context.getShaderInfoLog(sh));
            }
			//возвращаем созданный шейдер
            return sh;
            
        }


    },

	/*Установка ширины - width и высоты - height контекста*/
    setViewPort: function(width,height){
        this.gl.viewportWidth = width;
        this.gl.viewportHeight = height;
    },
	/*установка цвета заливки по вектору colorVec*/
    setBackgroundColor: function(colorVec){
        if (colorVec){
            if (colorVec.length > 0) 
            {
				/*кол красного*/
                this.backgroundColor.red = colorVec[0];
            }
            if (colorVec.length > 1) 
            {
				/*кол-ва зеленного*/
                this.backgroundColor.green = colorVec[1];
            }
            if (colorVec.length > 2) 
            {	
			    /*кол-во синего*/
                this.backgroundColor.blue = colorVec[2];
            }
            
        }
    },	
    
	/*добавляем объект botuObj для рисования*/
    AddObject: function(botuObj){
		this.vecVertex.size = botuObj.vertex.size;
        /*кол-во точек в массиве вершин*/
		var next = Math.max(this.vecVertex.length / this.vecVertex.size,0);
        /*добавляем новые вершины*/
		this.vecVertex = this.vecVertex.concat(botuObj.vertex);
        /*добавляем новые индексы, при этом корректирую новые индексы с учетом нового расположения вершин в общем массиве вершин*/
		this.vecIndices = this.vecIndices.concat(botuObj.indices.map(function(i){return i + next}));
		/*размерность вершин*/
        this.vecVertex.size = botuObj.vertex.size;
    },

	/*рисование*/
    draw: function () {
        /*устанавливаем размер контекста*/
		this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
        /*установка цвета заливки*/
		this.gl.clearColor(this.backgroundColor.red,this.backgroundColor.green,this.backgroundColor.blue,this.backgroundColor.alpha);
        /*очищаем-заливаем контект*/
		this.gl.clear(this.gl.COLOR_BUFFER_BIT); 	
		
		/*Создаем буфер и заполняем его актуальными данными массива вершин this.vecVertex и массива индексов this.vecIndices*/
		this.initBuffers(this.vecVertex, this.vecIndices);
		
		/*Включаем тест на глубину - DEPTH_TEST*/
        this.gl.enable(this.gl.DEPTH_TEST);
		/*рисуем по индексам - тип - TRIANGLES, кол-во индексов - this.indicBuffer.numberOfItems*/
        this.gl.drawElements(this.gl.TRIANGLES, this.indicBuffer.numberOfItems, this.gl.UNSIGNED_SHORT, 0);		
    }
    
}


/*произвольная фигура с данными вершин vertex и индексов indices*/
function botuObject(vertex,indices){
	//массив вершин
    this.vertex = [];
    //массив индексов
	this.indices = indices;
    
	//матрица из массива vertex и кол-во колонок - размерность - 3	
    this.matrix = new botuMatrix(vertex,3);

	//массив вершин текущем значениям матрицы
    this.vertex = this.matrix.source;
	//размерность вершин. Это нужно при добавлении объекта в наш "Холст"
    this.vertex.size = 3;
}

botuObject.prototype = {
	/*перемещение по оси X на значение value*/
    moveByX:function(value){
        this.matrix.move(value,0);
    },
    /*перемещение по оси Y на значение value*/
	moveByY:function(value){
        this.matrix.move(value,1);
    },
    /*перемещение по оси Z на значение value*/
	moveByZ:function(value){
        this.matrix.move(value,2);
    },
	/*перемещение по оси X,Y,Z  на значение value[0], value[1] и value[2] соответственно*/
    testToPoint:function(value){
        this.matrix.toPoint(value);
    },
    
	/*разворот вокруг центра на угол angle, указанный в градусах по оси xyzType - "byX", "byY" или "byZ" */
    rotateAroundCenter:function(angle,xyzType)
    {
        this.matrix.rotate(angle,this.matrix.center,xyzType);
    },
	/*разворот вокруг точки с максимальными значениями координат на угол angle, указанный в градусах по оси xyzType - "byX", "byY" или "byZ" */
    rotateAroundMaxPoint:function(angle,xyzType)
    {
        this.matrix.rotate(angle,this.matrix.maxval,xyzType);
    },	
	/*разворот вокруг point на угол angle, указанный в градусах по оси xyzType - "byX", "byY" или "byZ" */
    rotateAroundPoint:function(angle,point,xyzType)
    {
        this.matrix.rotate(angle,point,xyzType);
    },

	/*Для примитивов требуется переписать данный метод. По умолчанию просто возвращает центр примитива*/
	getDownLeft:function(){
		return this.matrix.center;
	},
	/*Для примитивов требуется переписать данный метод. По умолчанию просто возвращает центр примитива*/
	getUpperLeft:function(){
		return this.matrix.center;
	},
	/*Для примитивов требуется переписать данный метод. По умолчанию просто возвращает центр примитива*/
	getDownRight:function(){
		return this.matrix.center;
	},
	
	/*для методов connectUpperLeft и connectLeftRight требуется, чтобы у текущего примитива и у примитива target, передаваемого как входящая переменная были установлены методы - 
	getDownLeft
	getUpperLeft
	getDownRight

	*/
	
    //соединяем точки текущего примитива с примитивом target. 
	//Таким образом, чтобы верхняя левая точка текущего примитива this совпала с нижней левой точкой примитива target
    connectUpperLeft:function(target){
		// Левая нижняя точка примитива target
        var downLeftPoint = target.getDownLeft();
        // расстояние от левой нижней точки примитива target до верхней левой вершины текущего примитива
        var dvPoint = downLeftPoint.map(function(value,index){return value - this.getUpperLeft()[index]},this);
        // переносим текущий примитив
		this.testToPoint(dvPoint);
    },
    
    //соединяем точки текущего примитива с примитивом target. 
	//Таким образом, чтобы нижняя левая точка текущего примитива this совпала с нижней правой точкой примитива target	
    connectLeftRight:function(target){
		//нижняя правая точка примитива target
        var downRightPoint = target.getDownRight();
        // расстояние от нижней правой точки примитива target до нижней левой вершины текущего примитива
        var dvPoint = downRightPoint.map(function(value,index){return value - this.getDownLeft()[index]},this);
        // переносим текущий примитив
		this.testToPoint(dvPoint);
    }		
    
}


/*групповой объект для объединения разных примитивов в один*/
function botuGroupedObject(){
    this.vertex = [];
    this.indices = [];
}
botuGroupedObject.prototype = {
	/*добавление примитива obj к объекту this
	*/
	addObject:function(obj){
		/*кол-во точек в массиве вершин*/
        var next = Math.max(this.vertex.length / this.vertex.size,0);
		/*добавляем новые вершины*/
        this.vertex = this.vertex.concat(obj.vertex);	
		/*добавляем новые индексы, при этом корректирую новые индексы с учетом нового расположения вершин в общем массиве вершин*/
        this.indices = this.indices.concat(obj.indices.map(function(i){return i + next}));
		/*размерность вершин*/
        this.vertex.size = obj.vertex.size;		
    }
}


/*примитив - куб с центом centerPoint, шириной width, высотой height и глубиной depth*/
function cub(centerPoint,width,height,depth)
{
	/*центр передней грани. Центр, приближенный по оси Z на половину глубины depth*/
    this.frontCenter=[centerPoint[0],centerPoint[1],centerPoint[2] - depth / 2];
    /*центр задней грани. Центр, отдаленный по оси Z на половину глубины depth*/
	this.backCenter=[centerPoint[0],centerPoint[1],centerPoint[2] + depth / 2];

	// матрица
    this.matrix = null;
    // вектор вершин
	this.vertex=[];
    //вектор индексов
	this.indices = [];	
		
	/*рассчитываем вершины по ширине width, высоте - height и центрами - this.frontCenter и this.backCenter*/
	this.initCub(width,height);	

}
/*наследуем основные методы (перемещение, разворот, ...) от botuObject.prototype*/
cub.prototype = botuObject.prototype;
/*первоночальный расчет вершин для куба*/
cub.prototype = {
    /*init:function(width,height){

	
	},*/
    moveByX:function(value){
        this.matrix.move(value,0);
    },
    moveByY:function(value){
        this.matrix.move(value,1);
    },
    moveByZ:function(value){
        this.matrix.move(value,2);
    },

    testToPoint:function(value){
        this.matrix.toPoint(value);
    },
    
    rotateAroundCenter:function(angle,xyzType)
    {
		//alert(this.matrix.source);
        this.matrix.rotate(angle,this.matrix.center,xyzType);
		this.vertex = this.matrix.source;
    },

    rotateAroundMaxPoint:function(angle,xyzType)
    {
        this.matrix.rotate(angle,this.matrix.maxval,xyzType);
    },	
    rotateAroundPoint:function(angle,point,xyzType)
    {
        this.matrix.rotate(angle,point,xyzType);
    }	

}
cub.prototype.initCub = function(width,height){
    //вектор индексов
	this.indices=[
				  0,1,3,  /*передняя*/
                  1,2,3,  /*грань*/

				  /*левая грань*/
                  0,4,7,
                  0,3,7,

				  /*нижняя грань*/
                  3,7,6,
                  6,3,2,
                  
				  /*правая грань*/
                  2,6,1,
                  1,5,6,
                  
				  /*верхняя грань*/
                  0,4,5,
                  0,5,1,
                  
				  /*задняя грань*/
                  7,4,5,
                  7,5,6			  				  
    ];	
	
	this.matrix = new botuMatrix([this.frontCenter[0] - width / 2, this.frontCenter[1] + height / 2, this.frontCenter[2],  /*верхняя левая вершина передней грани. Индекс - 0*/
                        this.frontCenter[0] + width / 2, this.frontCenter[1] + height / 2, this.frontCenter[2],            /*верхняя правая вершина передней грани. Индекс - 1*/ 
                        this.frontCenter[0] + width / 2, this.frontCenter[1] - height / 2, this.frontCenter[2],            /*нижняя правая вершина передней грани. Индекс - 2*/
                        this.frontCenter[0] - width / 2, this.frontCenter[1] - height / 2, this.frontCenter[2],            /*нижняя левая вершина передней грани. Индекс - 3*/

                        this.backCenter[0] - width / 2, this.backCenter[1] + height / 2, this.backCenter[2],  /*верхняя левая вершина задней грани. Индекс - 4*/
                        this.backCenter[0] + width / 2, this.backCenter[1] + height / 2, this.backCenter[2],  /*верхняя правая вершина задней грани. Индекс - 5*/ 
                        this.backCenter[0] + width / 2, this.backCenter[1] - height / 2, this.backCenter[2],  /*нижняя правая вершина задней грани. Индекс - 6*/
                        this.backCenter[0] - width / 2, this.backCenter[1] - height / 2, this.backCenter[2],  /*нижняя левая вершина задней грани. Индекс - 7*/						
                        
                       ],3);
	/*вектор вершин будет ссылаться на матрицу*/				   
    this.vertex = this.matrix.source;
	/*размерность вершин*/
    this.vertex.size = 3;	
};



/*прямоугольник с центром centerPoint шириной width и высотой height*/
function plainClass(centerPoint,width,height)
{
    this.frontCenter=centerPoint;

    this.matrix = "";
    this.vertex=[];
	this.indices=[];
    this.initPlain(width,height);
}

/*наследуем основные методы (перемещение, разворот, ...) от botuObject.prototype*/
plainClass.prototype = botuObject.prototype;

/*первоночальный расчет вершин для прямоугольника*/
plainClass.prototype.initPlain = function(width,height){

        this.indices=[
		          /*верхний треугольник*/
		          0,1,3,
				  /*нижний треугольник*/
                  1,2,3,
          		];
        var vert = [ this.frontCenter[0] - width / 2, this.frontCenter[1] + height / 2, this.frontCenter[2],  //левая верхняя вершина. Индекс - 0 
                        this.frontCenter[0] + width / 2, this.frontCenter[1] + height / 2, this.frontCenter[2],  //правая верхняя вершина. Индекс - 1
                        this.frontCenter[0] + width / 2, this.frontCenter[1] - height / 2, this.frontCenter[2],  //правая нижняя вершина. Индекс - 2
                        this.frontCenter[0] - width / 2, this.frontCenter[1] - height / 2, this.frontCenter[2]]; //левая нижняя вершина. Индекс - 3
		/*создаем матрицу для прямоугольника*/				
        this.matrix = new botuMatrix(vert,3);	
		this.vertex = this.matrix.source;
		//размерность вершин
		this.vertex.size = 3;		
    }	

//возвращает верхнею левую вершину	
plainClass.prototype.getUpperLeft = function(){
        return this.matrix.rows[0];
    }
//возвращает нижнею левую вершину		
plainClass.prototype.getDownLeft = function(){
        return this.matrix.rows[3];
    }
//возвращает нижнею правую вершину	
plainClass.prototype.getDownRight = function(){
        return this.matrix.rows[2];
    }
	

/*сфера с центром centerPoint, радиусом radius и детализацией numOfPlains*/
function circle(centerPoint,radius,numOfPlains){
    this.matrix = null;
    this.vertex=[];
	this.indices=[];	
	this.initCircle(centerPoint,radius,numOfPlains);
}

/*наследуем основные методы (перемещение, разворот, ...) от botuObject.prototype*/
circle.prototype = botuObject.prototype;

/*расчет вершин для сферы*/
circle.prototype.initCircle = function(centerPoint,radius,numOfPlains){
	/*ширина квадратов из которых состоит сфера*/
    var plainWidth = 2 * Math.PI * radius / numOfPlains;
    // угол на который будем поворачивать копию колеса
	var globalAngle = 45 * plainWidth / radius;  /* (1/2 width * 90) */
	// кол-во колес и которых состоит сфера.. Кол-во итераций мы будем создавать копию колеса и поворачивать.	
    var numOfIterations = 360 / globalAngle;
	// центр первого квадрата
    var plainCenter = [centerPoint[0],centerPoint[1],centerPoint[2] + radius];
    // угол на который будем поворачивать новый квадрат, чтобы получилось колесо
	var angle = 360 / numOfPlains;

    //новый квадрат
    var plain = null;
    //ссылка на предыдущий квадрат
	var oldplain = null;
	
	//Сфера. Сюда будем помещать все примитивы из которых состоит сфера
    var grp = new botuGroupedObject();
    
	//формируем колесо
    for(var i = 1;i<=numOfPlains;i++)
    {
		//угол на который поворачиваем копию квадрата
        var ang = (i-1) * angle
		
		//новый квадрат
        plain = new plainClass(plainCenter,plainWidth,plainWidth);
        //разворачиваем квадрат на угол - ang
		plain.rotateAroundCenter(ang,"byX");
        //если текущий квадрат не является первым, то есть уже был создан квадрат
		if (i > 1){
		//соединяем текущий квадрат с созданным на предыдущей операции
            plain.connectUpperLeft(oldplain);
        }
		//сохраняем текущий квадрат для следующей итерации
        oldplain = plain;
		//полученный квадрат добавляем в "будущую" сферу
        grp.addObject(plain);
    }	
	//обнуляем ненужные ссылки
    plain = null;
    oldplain = null;
	
	//множитель
    var itt = 0;
    //угол на которое будем поворачивать новое колесо
	var tempAngle = 0;
	//создаем копию 1-ого созданного колеса
    var temp = makeCopy(grp,botuObject); 
    while(tempAngle < 360)
    {	
	    itt++;
        tempAngle = itt * globalAngle;
		//новое колесо		
		var grp2 = makeCopy(temp,botuObject);
        //разворачиваем новое колесо на угол tempAngle
		grp2.rotateAroundCenter(tempAngle,"byY");
		//добавляем новое колесо в "будущую" сферу
        grp.addObject(grp2);		
    }
	temp = null;
	grp2 = null;
/*	var plain = "";
    var oldplain = "";
    
    for(var i = 1;i<=numOfPlains;i++)
    {
        var ang = (i-1) * this.angle
    
        plain = new plainClass(plainCenter,plainWidth,plainWidth);
        plain.rotateAroundCenter(ang,"byY");
//		alert(plain + " " + oldplain + " " + plainCenter + " " + plainWidth);
        if (i > 1){
//			alert(plain + " " + oldplain + " " + i);
            plain.connectLeft(oldplain);
        }
        oldplain = plain;
        
    //	this.plainObjects.push(plain);
        grp.addObject(plain);
    }

*/	
    
	// переводим сферу из примитива botuGroupedObject в botuObject  (для поддержки матрицы)
    var grpobj = new botuObject(grp.vertex,grp.indices);
    
	//массив вершин
    this.vertex  = grp.vertex;
    //массив индексов
	this.indices = grp.indices;
    //матрица 
	this.matrix = grpobj.matrix;		
}




