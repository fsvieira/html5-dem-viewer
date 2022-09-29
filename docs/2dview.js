function View2D(mapcolor){
	this.mapcolor = mapcolor; 
	
	var w = window.innerWidth; 
	var h = window.innerHeight;
	
	function setup_coords() {
		var w = window.innerWidth; 
		var h = window.innerHeight;
		var coords = $("#coords");
		 
		coords.css({left: (w/2) - (coords.width()/2) }); 
	}
	setup_coords();
	
	$(window).resize(setup_coords);
		
	$("#viewport").html("<div id='select3d'><div class='text'>The image is to big, please select a small area. Click when ready.</div></div>"); 	
	$("#viewport").append(this.mapcolor.sun.canvas); 
	
	this.canvas = document.createElement("canvas");
	$("#viewport").append(this.canvas); 
    this.canvas_ctx = this.canvas.getContext("2d");
	
	$('#viewport').mousemove(function(e){
		var x = (e.pageX - Math.floor($('#select3d').width()/2) ); 
		var y = (e.pageY - Math.floor($('#select3d').height()/2) );
		var w = this.canvas.width;
		var h = this.canvas.height;
		
		if(x < 0){x = 0;}
		if(y < 0){y = 0;}
	
		
		if((x + $('#select3d').width()) > w){
			x = this.canvas.width - $('#select3d').width(); 
		}
		
		if((y + $('#select3d').height()) > h ){
			y = this.canvas.height - $('#select3d').height(); 
		}

		this.x = x; 
		this.y = y; 

		var location_x = e.pageX - $("#viewport").offset().left;
		var location_y = e.pageY - $("#viewport").offset().top;

		//PL changes 8/24/2013 to show the UTM coordinates
		//TODO: this needs to be turned off in 3D mode, when it is not valid
		if ( (location_x < w) && (location_y < h) ) {
			var xutm = this.mapcolor.raster.data.llx + location_x * this.mapcolor.raster.data.dx;
			var xs = Math.floor(xutm + 0.5);
			
			var yutm = this.mapcolor.raster.data.lly + (this.mapcolor.raster.data.h - location_y) * this.mapcolor.raster.data.dy;
			var ys = Math.floor(yutm + 0.5);

			var zs = this.mapcolor.elevations[(location_y * this.mapcolor.raster.data.w) + location_x];

			$('#utm_x').html(xs);
			$('#utm_y').html(ys);
			$('#elev_z').html(zs);
			
		}
		
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
	
	this.paint = function(){
		var canvas_data = this.canvas_ctx.getImageData(0,0, this.canvas.width, this.canvas.height);
		var data = canvas_data.data;
		for(i in this.mapcolor.elevations){
			var offset = i*4;
			if (this.mapcolor.elevations[i] !== null) {
				var color = this.mapcolor.getElevationColor(Math.abs(this.mapcolor.elevations[i]));
				data[offset+0] = Math.floor(color.r*255);
				data[offset+1] = Math.floor(color.g*255);
				data[offset+2] = Math.floor(color.b*255);
				data[offset+3] = 255;
			} else {
				data[offset+0] = 0; 
				data[offset+1] = 0; 
				data[offset+2] = 0; 
				data[offset+3] = 0;
			}
		}

		this.canvas_ctx.putImageData(canvas_data, 0, 0); 
	}; 
	
	
	this.paintFaces = function() {
		this.paint();
	}; 
	
	this.free = function(){
		delete this.elevation; 
		$('#viewport').html(''); 
		$('#viewport').width(0); 
		$('#viewport').height(0); 
	}; 
	
}; 

