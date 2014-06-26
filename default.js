/*
               Borisov Timofey Urievitch aka Botu
    Copyright: (C) 2014 Borisov Timofey Urievitch aka Botu
     Filename: botu.js
      Comment: 
	  ��� ������ ������� ����������� ��������� ������� 2-� ��������
	  <script type="x-shader" id="vertexShader">
		...  ��� ������� ... ��� ���� ������� ���������� ����� ������� attribute vec3 botuPosition;
	  </script>
	  �
	  
    <script type="x-shader" id="fragmentShader">
	...  ��� ������� ... 
    </script>	  
		
	������:
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

	
	  1. ������ �����
	  var scene = new Scene("webglDOM");  ��� webglDOM - ��� id �������� canvas
	  
		1.1 ��������� ��������
			scene.setViewPort(300, 300);   1-�� �������� - ������, ������ - ������
		1.2 ��������� ����� ������� (�������������)
			scene.setBackgroundColor([0.1,0.5,0.6,0.2]);  �������� �������� - ������ RGBA	
	  
	  2. �������� ���������
		
		2.1 ��� �������� ����
		var cube = new cub([-100,105,0],90,90,90); 
			1-�� �������� - �����
			2-�� �������� - ������
			3-�� �������� - ������	  
			4-�� �������� - �������

		2.2 ��� �������� ��������������				
		var plain = new plainClass([100,10,10],120,130);
			1-�� �������� - �����
			2-�� �������� - ������
			3-�� �������� - ������	
		2.2 ��� �������� �����
		var circ = new circle([-120,-70,0],60,30);			
			1-�� �������� - �����
			2-�� �������� - ������
			3-�� �������� - ����������� (������� 10, ��� ������, ��� ����� �������� � "�������" �����)

		
	  3. ��������� ��������� �������� �� �����
		scene.AddObject(cube);

	  4. ������
		scene.draw(); 

	  5. ��� �������� ������ �� ���� �����, ������ ����� 3-�� ������ ������� ������� �����
		scene.clear();
		
	������� ������:

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


/*�������� ����� ������� - object � ������� ����� � ������� ������ type*/
function makeCopy(object,type){
    var vertex  = object.vertex.slice(0);
    var indices = object.indices.slice(0);
    return new type(vertex,indices);
}

/*��������� ������� vector �� ������� matrix. ���������� ������ - resultVector*/
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

/*�������� �������. �������� ��������, ������ source � ���-�� �������, �� ������� ������ ������ ��������� ������� - columns*/
function botuMatrix (source,columns)
{
    this.source = source;  // �������� ������
    this.columnNumbers = columns; // ���������� �������. ����������� �����
    this.rowNumbers = source.length / columns; //���������� �����. ���������� �����
    this.rows = []; //������ �����. ������ �����. 
    this.minval = []; // ����� � ������������ ������������ �� ���� ����
    this.maxval = []; // ����� � ������������� ������������ �� ���� ����
    this.radius = []; // ���������� �� ������ �� ����� ���������� �����
    this.center = []; // �����-�����.
    this.column = []; // ������ ������� - ���������. this.column[0] - ��� ������ ��������� x �� ���� ������.

    /*���� ���� ���� �� ���� �������� � �������� �������.*/    
    if (source.length > 0)
    {
        var count = 0;
	/*��������� ������ ����� - rows � ������ ������� column*/
        while(count < source.length)
        {
	    /*������� ������*/
            var currentRow = this.source.slice(count,count + this.columnNumbers);		
            /*��������� ������� ������ � ������ �����*/
            this.rows.push(currentRow);
            
            var columnCount = 0;
            /*��������� ������ �������, �������� � ������ ������� - ��������������� �������� ���������� ������� ������.
           */
            while(columnCount <= this.columnNumbers)
            {
                /*������� �������������� ������ �������*/
                if (!this.column[columnCount]) 
                {
                    this.column[columnCount] = [];
                }
                /*��� ������ ������� ��������� �������� �� ������� ������.*/
                this.column[columnCount].push(currentRow[columnCount]);
                columnCount += 1;
            }
            /*��������� � ��������� ������*/    
            count = count + this.columnNumbers; 
        }	
        this.rowNumbers = this.rows.length; 
        /*���������� �������� ���������� - �����, ����� ���������, ����� ��������*/        
        if (this.rows.length > 0)
        {
            count = 0;
            /*�������� �� ���� ������� - ������*/
            while(count < this.rows.length)
            {
                /*���������� ��� ����� ��������� ������ ���������� �����*/
                var tempRow = this.rows[count].slice(0);
                if (count == 0 )
                {
                    this.minval = tempRow.slice(0);
                    this.maxval = tempRow.slice(0);
                    this.radius = tempRow.slice(0);
                    this.center = tempRow.slice(0);
                }
            
                /*����� ����� ��������� ������������ ����� �������� �����.*/
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
                /*�� ������ ������ ������� ������ �� ������ �����*/
                tempRow = undefined;
                count = count + 1;
            }
            /*������� ������.*/ 
            tempRow = undefined;
        }
    
    }

}

/*�������� � ��������*/
botuMatrix.prototype = {
    /*���������� �������*/
    move: function(value,xyzw){
        /*� ���� ����� �������� �������� ��������������� ���������*/
        this.column[xyzw] = this.column[xyzw].map(function(i){return i+value;})	
        /*��������� ������� �� ������ �������� �������*/
        this.updateByColumn();
    },
    /*���������� ������� �� ����������� ��������*/
    updateByColumn:function(){
        var columnCount = 0;
        /*�������� �� ���� ��������*/
        while(columnCount < this.columnNumbers)
        {
            var rowCount = 0;
         /*�� ������ ������ ��������� �������� ������ �� ������ �������� �������, ����� ��������� �������� � �������*/
            while(rowCount < this.rowNumbers)
            {
                this.rows[rowCount][columnCount] = this.column[columnCount][rowCount];
                this.source[columnCount + rowCount * this.columnNumbers] = this.column[columnCount][rowCount]; 
                rowCount++;
            }
            
            columnCount++;
        }	
    },
    /*���������� ������� �� ����������� �������*/
    updateByRow:function(){
        var rowCount = 0;
        /*�������� �� ������ ������*/
        while(rowCount < this.rowNumbers)
        {
            var columnCount = 0;
/*�� ������ ������� ��������� �������� ������ �� ������ �������� ������, ����� ��������� �������� � �������*/      
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
/*����������� ������� � ������������ ����� - point*/
    toPoint:function(point){
        if (point)
        {
            if(point.length == this.columnNumbers)
            {
      /*������ ������-����� �������� �� �������� �� ����� - point. */   
             this.rows = this.rows.map(function(rowArray){
                    return rowArray.map(function(rowElement,index)
                    {
                        return rowElement + point[index];
                    }
                    )
                });
/*��������� ������� �� ������ �������� �����*/				
                this.updateByRow();
            }		
        }
    },
       
    /*�������� ������� this �� ���� angle, ������ ����� point �� ��� - xyzType*/    
    rotate:function(angle,point,xyzType){
		/*��������� ������� �� �����*/
        function multPointByValue(point,value){
            return point.map(function(val){return value * val});
        }
		/*������� ������� ���, ����� ����� point, ������ ������� ���� �������� ���������� � ����� [0,0,0]*/
        this.toPoint(multPointByValue(point,-1));
        //������ ��� ������� ���������
		var rotateSource = [];
        // ������� ������� � �������
		var radians = angle * Math.PI / 180.0;

        //����� ��� ������ ������� ���������� ��������
        switch(xyzType){
            case "byX":
			    //��������� ������ ��� ������� ���������, ������ ��� X
                rotateSource = [1,0,0,
                                0,Math.cos(radians),Math.sin(radians),
                                0,-1 * Math.sin(radians),Math.cos(radians)
                ];
                break;
            case "byY":
			//��������� ������ ��� ������� ���������, ������ ��� y
                rotateSource = [Math.cos(radians),0,-1 * Math.sin(radians),
                                0,1,0,
                                Math.sin(radians),0,Math.cos(radians)
                                ];
                break;
            case "byZ":
			//��������� ������ ��� ������� ���������, ������ ��� Z
                rotateSource = [Math.cos(radians),Math.sin(radians),0,
                                -1 * Math.sin(radians),Math.cos(radians),0,
                                0,0,1];
                break;			

        }
        
		//������� ������� ���������
        var rotateMatrix = new botuMatrix(rotateSource,3);
        //������������� ������� �������, ������� ������ ����� - ������ rows[i] �� ������� ���������
		this.rows = this.rows.map(function(irow){
            return vectorByMatrix(irow,rotateMatrix);
        });
		//�������� ������� ��������� � ������ ��� ������� ���������. ������ �������� �������. ������������ ��������� ������. �� ������ ������ ������� ����.
        rotateMatrix = null;
		//�������� ������ ��� ������� ���������
        rotateSource = null;
		/*���������� ������� �� ����������� �������-������, ������� ���� ����������*/
        this.updateByRow();
		//����������� ������� � �������� ���������.
        this.toPoint(point);
    }

    
}



/*�����. ��������� WebGl. canvasID - id �������� canvas � html ���������*/
function Scene(canvasID) {
    /*��������� ����� ������� �� ���������*/
	this.backgroundColor = {red:1.0, green:1.0, blue:1.0, alpha:1.0};
    /*������� �����*/
	this.canvas = document.getElementById(canvasID);
    /*�������������� webgl Context*/
	this.getContext();
	/*����� ��� ���������� �������*/
    this.indicBuffer = null;
	/*������ ������*/
    this.vecVertex = [];
    /*������ ��������*/
	this.vecIndices = [];
	
	this.initProgram("vertexShader", "fragmentShader");
        

}

Scene.prototype = {

	/*������� �����, ������ ������ � ������ ��������*/
    clear: function(){
        this.indicBuffer = null;
        this.vecVertex = [];
        this.vecIndices = [];		
    
    },
    
	/*�������� WebGl Context, ���� ������� ��� ������������*/
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
    
    /*�������� � ������������� �������. ��������� ����� ������ ���������� �� �������� ��������� vertex, ���� ������� 2 ������� ���������, 
	�� ������� � ��������� ����� �������� �������� �� 2-��� ���������  */
    initBuffers: function (vertex, indices) {
        /*������� ����� ������*/
		this.vertexBuffer = this.gl.createBuffer();
        /*����������� �������*/
		this.vertexBuffer.size = vertex.size;
        /*����������� ����� ������*/
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
		/*�������� ������ �������� - botuPosition*/
        this.program.botuPositionAttr = this.gl.getAttribLocation(this.program, "botuPosition");
        /*�������� �������, ����������� � ��������� ������� ��������� �� ������� - this.program.botuPositionAttr*/
		this.gl.enableVertexAttribArray(this.program.botuPositionAttr);
		/*��������� ����� ������, ������������� � ��� Float32, ���������� �� ������� ������*/
        this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array(vertex), this.gl.STATIC_DRAW);
        /*������������� ������� � �������� this.program.botuPositionAttr, ������������ ������� - this.vertexBuffer.size ��� ������ ������*/
		this.gl.vertexAttribPointer(this.program.botuPositionAttr,this.vertexBuffer.size,this.gl.FLOAT,false,0,0);
       /*���� ������� ������ ��������*/ 
       if(indices)
        {
		    /*������� ����� ��������*/
            this.indicBuffer = this.gl.createBuffer();
            /*���������� ���-�� ����� �� ���-�� ��������*/
			this.indicBuffer.numberOfItems = indices.length;
            /*����������� ����� ��������*/
			this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indicBuffer);
            /*��������� ����� ��������, ������������� � ������������� ��� Uint16, ���������� �� ������� indices*/
			this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);
        }


    },
    

    /*������� ��������� ��������, vxShaderDom - id �������� script � ������� �������� ��� ���������� ������,
								  frShaderDom - id �������� script � ������� �������� ��� ������������ �������
	*/
    initProgram: function (vxShaderDom, frShaderDom) {
		/*��������� ������*/
        var vxShader = document.getElementById(vxShaderDom).textContent;
        /*����������� ������*/
		var frShader = document.getElementById(frShaderDom).textContent;

		/*������� ��������� � ��������� this.gl � �������: ��������� ������ vxShader � ����������� ������ - frShader*/
        this.program = createProgram(this.gl,vxShader, frShader);
        /*� ����� ��������� ���������� ������ �������*/
		this.gl.useProgram(this.program);    

		/*�������� ��������� � ��������� �������� - vxs � ����������� �������� - frs � ��������� � ��������� context*/
        function createProgram(context, vxs, frs) {
			/*������� ���������*/
            var prg = context.createProgram();
            /*������� ��������� ������*/
			var VertexShader = createShader(context, context.VERTEX_SHADER, vxs);
            /*������� ����������� ������*/
			var FragmentShader = createShader(context, context.FRAGMENT_SHADER, frs);
            /*��������� ��������� ������*/
			context.attachShader(prg,VertexShader);
            /*��������� ����������� ������*/
			context.attachShader(prg,FragmentShader);
            /*�������� ��������� � �������� - context*/
			context.linkProgram(prg);
			/*�������� �� ������*/
            if (!context.getProgramParameter(prg, context.LINK_STATUS)) {
                /*����� ������ ������*/
				alert(context.getProgramInfoLog(prg));
            }
			/*���������� ��������� ���������*/
            return prg;
        }

		/*������� ������ � ��������� context � ����� type, ��� ��������� ������� - shader*/
        function createShader(context,type,shader)
        {
			/*������� ������ � ����� - type*/	
            var sh = context.createShader(type);
            /*��� ������� - shader*/
			context.shaderSource(sh, shader);
            /*����������� ��������� �������*/
			context.compileShader(sh);
			/*�������� �� ������ ����������*/
            if (!context.getShaderParameter(sh, context.COMPILE_STATUS))
            {
			    /*�������� �� ������ ����������*/
                alert(context.getShaderInfoLog(sh));
            }
			//���������� ��������� ������
            return sh;
            
        }


    },

	/*��������� ������ - width � ������ - height ���������*/
    setViewPort: function(width,height){
        this.gl.viewportWidth = width;
        this.gl.viewportHeight = height;
    },
	/*��������� ����� ������� �� ������� colorVec*/
    setBackgroundColor: function(colorVec){
        if (colorVec){
            if (colorVec.length > 0) 
            {
				/*��� ��������*/
                this.backgroundColor.red = colorVec[0];
            }
            if (colorVec.length > 1) 
            {
				/*���-�� ���������*/
                this.backgroundColor.green = colorVec[1];
            }
            if (colorVec.length > 2) 
            {	
			    /*���-�� ������*/
                this.backgroundColor.blue = colorVec[2];
            }
            
        }
    },	
    
	/*��������� ������ botuObj ��� ���������*/
    AddObject: function(botuObj){
		this.vecVertex.size = botuObj.vertex.size;
        /*���-�� ����� � ������� ������*/
		var next = Math.max(this.vecVertex.length / this.vecVertex.size,0);
        /*��������� ����� �������*/
		this.vecVertex = this.vecVertex.concat(botuObj.vertex);
        /*��������� ����� �������, ��� ���� ����������� ����� ������� � ������ ������ ������������ ������ � ����� ������� ������*/
		this.vecIndices = this.vecIndices.concat(botuObj.indices.map(function(i){return i + next}));
		/*����������� ������*/
        this.vecVertex.size = botuObj.vertex.size;
    },

	/*���������*/
    draw: function () {
        /*������������� ������ ���������*/
		this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
        /*��������� ����� �������*/
		this.gl.clearColor(this.backgroundColor.red,this.backgroundColor.green,this.backgroundColor.blue,this.backgroundColor.alpha);
        /*�������-�������� �������*/
		this.gl.clear(this.gl.COLOR_BUFFER_BIT); 	
		
		/*������� ����� � ��������� ��� ����������� ������� ������� ������ this.vecVertex � ������� �������� this.vecIndices*/
		this.initBuffers(this.vecVertex, this.vecIndices);
		
		/*�������� ���� �� ������� - DEPTH_TEST*/
        this.gl.enable(this.gl.DEPTH_TEST);
		/*������ �� �������� - ��� - TRIANGLES, ���-�� �������� - this.indicBuffer.numberOfItems*/
        this.gl.drawElements(this.gl.TRIANGLES, this.indicBuffer.numberOfItems, this.gl.UNSIGNED_SHORT, 0);		
    }
    
}


/*������������ ������ � ������� ������ vertex � �������� indices*/
function botuObject(vertex,indices){
	//������ ������
    this.vertex = [];
    //������ ��������
	this.indices = indices;
    
	//������� �� ������� vertex � ���-�� ������� - ����������� - 3	
    this.matrix = new botuMatrix(vertex,3);

	//������ ������ ������� ��������� �������
    this.vertex = this.matrix.source;
	//����������� ������. ��� ����� ��� ���������� ������� � ��� "�����"
    this.vertex.size = 3;
}

botuObject.prototype = {
	/*����������� �� ��� X �� �������� value*/
    moveByX:function(value){
        this.matrix.move(value,0);
    },
    /*����������� �� ��� Y �� �������� value*/
	moveByY:function(value){
        this.matrix.move(value,1);
    },
    /*����������� �� ��� Z �� �������� value*/
	moveByZ:function(value){
        this.matrix.move(value,2);
    },
	/*����������� �� ��� X,Y,Z  �� �������� value[0], value[1] � value[2] ��������������*/
    testToPoint:function(value){
        this.matrix.toPoint(value);
    },
    
	/*�������� ������ ������ �� ���� angle, ��������� � �������� �� ��� xyzType - "byX", "byY" ��� "byZ" */
    rotateAroundCenter:function(angle,xyzType)
    {
        this.matrix.rotate(angle,this.matrix.center,xyzType);
    },
	/*�������� ������ ����� � ������������� ���������� ��������� �� ���� angle, ��������� � �������� �� ��� xyzType - "byX", "byY" ��� "byZ" */
    rotateAroundMaxPoint:function(angle,xyzType)
    {
        this.matrix.rotate(angle,this.matrix.maxval,xyzType);
    },	
	/*�������� ������ point �� ���� angle, ��������� � �������� �� ��� xyzType - "byX", "byY" ��� "byZ" */
    rotateAroundPoint:function(angle,point,xyzType)
    {
        this.matrix.rotate(angle,point,xyzType);
    },

	/*��� ���������� ��������� ���������� ������ �����. �� ��������� ������ ���������� ����� ���������*/
	getDownLeft:function(){
		return this.matrix.center;
	},
	/*��� ���������� ��������� ���������� ������ �����. �� ��������� ������ ���������� ����� ���������*/
	getUpperLeft:function(){
		return this.matrix.center;
	},
	/*��� ���������� ��������� ���������� ������ �����. �� ��������� ������ ���������� ����� ���������*/
	getDownRight:function(){
		return this.matrix.center;
	},
	
	/*��� ������� connectUpperLeft � connectLeftRight ���������, ����� � �������� ��������� � � ��������� target, ������������� ��� �������� ���������� ���� ����������� ������ - 
	getDownLeft
	getUpperLeft
	getDownRight

	*/
	
    //��������� ����� �������� ��������� � ���������� target. 
	//����� �������, ����� ������� ����� ����� �������� ��������� this ������� � ������ ����� ������ ��������� target
    connectUpperLeft:function(target){
		// ����� ������ ����� ��������� target
        var downLeftPoint = target.getDownLeft();
        // ���������� �� ����� ������ ����� ��������� target �� ������� ����� ������� �������� ���������
        var dvPoint = downLeftPoint.map(function(value,index){return value - this.getUpperLeft()[index]},this);
        // ��������� ������� ��������
		this.testToPoint(dvPoint);
    },
    
    //��������� ����� �������� ��������� � ���������� target. 
	//����� �������, ����� ������ ����� ����� �������� ��������� this ������� � ������ ������ ������ ��������� target	
    connectLeftRight:function(target){
		//������ ������ ����� ��������� target
        var downRightPoint = target.getDownRight();
        // ���������� �� ������ ������ ����� ��������� target �� ������ ����� ������� �������� ���������
        var dvPoint = downRightPoint.map(function(value,index){return value - this.getDownLeft()[index]},this);
        // ��������� ������� ��������
		this.testToPoint(dvPoint);
    }		
    
}


/*��������� ������ ��� ����������� ������ ���������� � ����*/
function botuGroupedObject(){
    this.vertex = [];
    this.indices = [];
}
botuGroupedObject.prototype = {
	/*���������� ��������� obj � ������� this
	*/
	addObject:function(obj){
		/*���-�� ����� � ������� ������*/
        var next = Math.max(this.vertex.length / this.vertex.size,0);
		/*��������� ����� �������*/
        this.vertex = this.vertex.concat(obj.vertex);	
		/*��������� ����� �������, ��� ���� ����������� ����� ������� � ������ ������ ������������ ������ � ����� ������� ������*/
        this.indices = this.indices.concat(obj.indices.map(function(i){return i + next}));
		/*����������� ������*/
        this.vertex.size = obj.vertex.size;		
    }
}


/*�������� - ��� � ������ centerPoint, ������� width, ������� height � �������� depth*/
function cub(centerPoint,width,height,depth)
{
	/*����� �������� �����. �����, ������������ �� ��� Z �� �������� ������� depth*/
    this.frontCenter=[centerPoint[0],centerPoint[1],centerPoint[2] - depth / 2];
    /*����� ������ �����. �����, ���������� �� ��� Z �� �������� ������� depth*/
	this.backCenter=[centerPoint[0],centerPoint[1],centerPoint[2] + depth / 2];

	// �������
    this.matrix = null;
    // ������ ������
	this.vertex=[];
    //������ ��������
	this.indices = [];	
		
	/*������������ ������� �� ������ width, ������ - height � �������� - this.frontCenter � this.backCenter*/
	this.initCub(width,height);	

}
/*��������� �������� ������ (�����������, ��������, ...) �� botuObject.prototype*/
cub.prototype = botuObject.prototype;
/*�������������� ������ ������ ��� ����*/
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
    //������ ��������
	this.indices=[
				  0,1,3,  /*��������*/
                  1,2,3,  /*�����*/

				  /*����� �����*/
                  0,4,7,
                  0,3,7,

				  /*������ �����*/
                  3,7,6,
                  6,3,2,
                  
				  /*������ �����*/
                  2,6,1,
                  1,5,6,
                  
				  /*������� �����*/
                  0,4,5,
                  0,5,1,
                  
				  /*������ �����*/
                  7,4,5,
                  7,5,6			  				  
    ];	
	
	this.matrix = new botuMatrix([this.frontCenter[0] - width / 2, this.frontCenter[1] + height / 2, this.frontCenter[2],  /*������� ����� ������� �������� �����. ������ - 0*/
                        this.frontCenter[0] + width / 2, this.frontCenter[1] + height / 2, this.frontCenter[2],            /*������� ������ ������� �������� �����. ������ - 1*/ 
                        this.frontCenter[0] + width / 2, this.frontCenter[1] - height / 2, this.frontCenter[2],            /*������ ������ ������� �������� �����. ������ - 2*/
                        this.frontCenter[0] - width / 2, this.frontCenter[1] - height / 2, this.frontCenter[2],            /*������ ����� ������� �������� �����. ������ - 3*/

                        this.backCenter[0] - width / 2, this.backCenter[1] + height / 2, this.backCenter[2],  /*������� ����� ������� ������ �����. ������ - 4*/
                        this.backCenter[0] + width / 2, this.backCenter[1] + height / 2, this.backCenter[2],  /*������� ������ ������� ������ �����. ������ - 5*/ 
                        this.backCenter[0] + width / 2, this.backCenter[1] - height / 2, this.backCenter[2],  /*������ ������ ������� ������ �����. ������ - 6*/
                        this.backCenter[0] - width / 2, this.backCenter[1] - height / 2, this.backCenter[2],  /*������ ����� ������� ������ �����. ������ - 7*/						
                        
                       ],3);
	/*������ ������ ����� ��������� �� �������*/				   
    this.vertex = this.matrix.source;
	/*����������� ������*/
    this.vertex.size = 3;	
};



/*������������� � ������� centerPoint ������� width � ������� height*/
function plainClass(centerPoint,width,height)
{
    this.frontCenter=centerPoint;

    this.matrix = "";
    this.vertex=[];
	this.indices=[];
    this.initPlain(width,height);
}

/*��������� �������� ������ (�����������, ��������, ...) �� botuObject.prototype*/
plainClass.prototype = botuObject.prototype;

/*�������������� ������ ������ ��� ��������������*/
plainClass.prototype.initPlain = function(width,height){

        this.indices=[
		          /*������� �����������*/
		          0,1,3,
				  /*������ �����������*/
                  1,2,3,
          		];
        var vert = [ this.frontCenter[0] - width / 2, this.frontCenter[1] + height / 2, this.frontCenter[2],  //����� ������� �������. ������ - 0 
                        this.frontCenter[0] + width / 2, this.frontCenter[1] + height / 2, this.frontCenter[2],  //������ ������� �������. ������ - 1
                        this.frontCenter[0] + width / 2, this.frontCenter[1] - height / 2, this.frontCenter[2],  //������ ������ �������. ������ - 2
                        this.frontCenter[0] - width / 2, this.frontCenter[1] - height / 2, this.frontCenter[2]]; //����� ������ �������. ������ - 3
		/*������� ������� ��� ��������������*/				
        this.matrix = new botuMatrix(vert,3);	
		this.vertex = this.matrix.source;
		//����������� ������
		this.vertex.size = 3;		
    }	

//���������� ������� ����� �������	
plainClass.prototype.getUpperLeft = function(){
        return this.matrix.rows[0];
    }
//���������� ������ ����� �������		
plainClass.prototype.getDownLeft = function(){
        return this.matrix.rows[3];
    }
//���������� ������ ������ �������	
plainClass.prototype.getDownRight = function(){
        return this.matrix.rows[2];
    }
	

/*����� � ������� centerPoint, �������� radius � ������������ numOfPlains*/
function circle(centerPoint,radius,numOfPlains){
    this.matrix = null;
    this.vertex=[];
	this.indices=[];	
	this.initCircle(centerPoint,radius,numOfPlains);
}

/*��������� �������� ������ (�����������, ��������, ...) �� botuObject.prototype*/
circle.prototype = botuObject.prototype;

/*������ ������ ��� �����*/
circle.prototype.initCircle = function(centerPoint,radius,numOfPlains){
	/*������ ��������� �� ������� ������� �����*/
    var plainWidth = 2 * Math.PI * radius / numOfPlains;
    // ���� �� ������� ����� ������������ ����� ������
	var globalAngle = 45 * plainWidth / radius;  /* (1/2 width * 90) */
	// ���-�� ����� � ������� ������� �����.. ���-�� �������� �� ����� ��������� ����� ������ � ������������.	
    var numOfIterations = 360 / globalAngle;
	// ����� ������� ��������
    var plainCenter = [centerPoint[0],centerPoint[1],centerPoint[2] + radius];
    // ���� �� ������� ����� ������������ ����� �������, ����� ���������� ������
	var angle = 360 / numOfPlains;

    //����� �������
    var plain = null;
    //������ �� ���������� �������
	var oldplain = null;
	
	//�����. ���� ����� �������� ��� ��������� �� ������� ������� �����
    var grp = new botuGroupedObject();
    
	//��������� ������
    for(var i = 1;i<=numOfPlains;i++)
    {
		//���� �� ������� ������������ ����� ��������
        var ang = (i-1) * angle
		
		//����� �������
        plain = new plainClass(plainCenter,plainWidth,plainWidth);
        //������������� ������� �� ���� - ang
		plain.rotateAroundCenter(ang,"byX");
        //���� ������� ������� �� �������� ������, �� ���� ��� ��� ������ �������
		if (i > 1){
		//��������� ������� ������� � ��������� �� ���������� ��������
            plain.connectUpperLeft(oldplain);
        }
		//��������� ������� ������� ��� ��������� ��������
        oldplain = plain;
		//���������� ������� ��������� � "�������" �����
        grp.addObject(plain);
    }	
	//�������� �������� ������
    plain = null;
    oldplain = null;
	
	//���������
    var itt = 0;
    //���� �� ������� ����� ������������ ����� ������
	var tempAngle = 0;
	//������� ����� 1-��� ���������� ������
    var temp = makeCopy(grp,botuObject); 
    while(tempAngle < 360)
    {	
	    itt++;
        tempAngle = itt * globalAngle;
		//����� ������		
		var grp2 = makeCopy(temp,botuObject);
        //������������� ����� ������ �� ���� tempAngle
		grp2.rotateAroundCenter(tempAngle,"byY");
		//��������� ����� ������ � "�������" �����
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
    
	// ��������� ����� �� ��������� botuGroupedObject � botuObject  (��� ��������� �������)
    var grpobj = new botuObject(grp.vertex,grp.indices);
    
	//������ ������
    this.vertex  = grp.vertex;
    //������ ��������
	this.indices = grp.indices;
    //������� 
	this.matrix = grpobj.matrix;		
}




