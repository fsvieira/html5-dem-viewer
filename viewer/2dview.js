function View2D(mapcolor){
	this.mapcolor = mapcolor; 
	
	var w = window.innerWidth; 
	var h = window.innerHeight;
		
	$("#viewport").html("<div id='select3d'><div class='text'>The image is to big, please select a small area. Click when ready.</div></div>"); 	
	$("#viewport").append(this.mapcolor.sun.canvas); 
	
	this.canvas = document.createElement("canvas");
	$("#viewport").append(this.canvas); 
    this.canvas_ctx = this.canvas.getContext("2d");
	
	$('#viewport').mousemove(function(e){
		var x = (e.pageX - Math.floor($('#select3d').width()/2) ); 
		var y = (e.pageY - Math.floor($('#select3d').height()/2) );

		if(x < 0){x = 0;}
		if(y < 0){y = 0;}
		
		if((x + $('#select3d').width()) > this.canvas.width){
			x = this.canvas.width - $('#select3d').width(); 
		}
		
		if((y + $('#select3d').height()) > this.canvas.height ){
			y = this.canvas.height - $('#select3d').height(); 
		}

		this.x = x; 
		this.y = y; 
		
		$('#select3d').css({'left': x, 'top': y}); 
	}.bind(this)); 
	
	$('#select3d').click(
		function(){
			$('#loading').show("fast", function(){
				if(this.mapcolor.mode_area){
					this.mapcolor.set3DArea(this.x, this.y); 
				}
				$('#loading').hide(); 
			}.bind(this)); 
		}.bind(this)
	); 
	
	$("#viewport").width(w); 
	$("#viewport").height(h); 
	
	
    
    
    
    this.setWH = function(w, h){
		this.canvas.width = w;
		this.canvas.height = h;
	}; 
	
	/*this.setElevation = function(i, elevation){
		this.elevation[i] = elevation; 
	};*/  
	
	this.paint = function(){
		var canvas_data = this.canvas_ctx.getImageData(0,0, this.canvas.width, this.canvas.height); 
		var data = canvas_data.data; 
		for(i in this.mapcolor.elevations){
			var offset = i*4; 
			var color = this.mapcolor.getElevationColor(Math.abs(this.mapcolor.elevations[i]));
			data[offset+0] = Math.floor(color.r*255); 
			data[offset+1] = Math.floor(color.g*255); 
			data[offset+2] = Math.floor(color.b*255); 
			data[offset+3] = 255; 
		}
		
		this.canvas_ctx.putImageData(canvas_data, 0, 0); 
	}; 
	
	
	this.paintFaces = function(){
		this.paint(); 
	}; 
	
	this.free = function(){
		delete this.elevation; 
		$('#viewport').html(''); 
		$('#viewport').width(0); 
		$('#viewport').height(0); 
	}; 
	
}; 

