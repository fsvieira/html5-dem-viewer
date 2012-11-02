function ColorElevation(color, elevation){
	this.color = color;
	this.elevation = elevation; 	
	
	this.setColor = function(val){
		this.color.setHex(val);	
	}; 
	
	this.setElevation = function(val){
		this.elevation = val;	
	}; 

	ColorElevation.sortByElevation = function(a, b){
		return a.elevation-b.elevation; 
	}; 

	

}; 




function MapColorStats(){
	this.stats = {}; 
	this.max = 0;
	this.min = -1;
	this.total = 0; 
	this.count = 0; 
	
	this.add = function(elevation){
		
		var count = this.stats[elevation]; 
		if(count){
			count++; 
		}else{
			count=1; 
		}
		
		if(this.count < count){
			this.count = count; 
		}
		
		this.stats[elevation] = count; 
		
		if((elevation < this.min) || (this.min == -1)){
			this.min = elevation; 
		}

		if(elevation > this.max){
			this.max = elevation; 
		}
		
		this.total++; 
	};

	this.getPercentage = function(elevation){
		if(elevation in this.stats){
			return (this.stats[elevation] / this.total);
		}
		return 0; 
	}; 
	
	this.getRelativePercentage = function(elevation){
		if(elevation in this.stats){
			return (this.stats[elevation] / this.count);
		}
		return 0; 	
	}
	
}; 

function MapPallet(name, colors){
	this.name = name; 
	this.colors = colors?colors:[]; 
}; 


function MapColor(img){

	this.colors = []; 
	this.pallets = []; 
	this.selected_pallet = 0; 
	this.mode_2d = false; 
	this.img = img; 
	
	this.view = null; 
	this.sun = null;
	
	 
	this.elevations = []; 
	this.mode_area = false; 

	this.set3DArea = function(x, y){
		
		if(x < 0){x=0;}
		if(y < 0){y=0;}
		
		var bx, by; 
		 
		bx = x + $('#select3d').width(); 
		by = y + $('#select3d').height(); 
		
		if(bx > this.img.width){
			bx = this.img.width; 
		}
		
		if(by > this.img.height){
			by = this.img.height; 
		}

		if(this.view){
			this.view.free(); 
			delete this.view; 
		}
		
		this.mode_area = false; 
		this.mode_2d = false; 
				
		this.view = new View3D(this, {'ax': x, 'ay':y, 'bx' : bx , 'by': by }); 
		this.view.setWH(bx-x,by-y); 	   
		this.view.paint(); 
		
	};

	this.setMode2D = function(mode){
		
	    this.mode_2d = mode;
		
		if(this.mode_2d){
			if(this.view){
				this.view.free(); 
				delete this.view; 
			}
				
			this.view = new View2D(this); 
			this.view.setWH(this.img.width, this.img.height); 	   
			this.view.paint(); 
		}else{
			if(img.width <= $('#select3d').width() && img.height <= $('#select3d').height()){
				if(this.view){
					this.view.free(); 
					delete this.view; 
				}
				this.view = new View3D(this); 
				this.view.setWH(this.img.width, this.img.height); 	   
				this.view.paint(); 
			}else{
				this.mode_2d = true;
				this.mode_area = true; 
				$('#select3d').show(); 	
			}
		}
		
		
	}; 
	
	
	this.toggleMode = function(){
		$('#loading').show("fast", function(){
				this.mode_2d = !this.mode_2d; 
				this.setMode2D(this.mode_2d); 
				$('#loading').hide(); 
				renderMode(); 
			}.bind(this) 
		); 
	}; 

	this.stats = new MapColorStats(); 
	
	this.flat = false; 
	
	this.update_elevation = function(color, value){
		color.setElevation(value); 
		// Sort colors. 
		this.colors.sort(ColorElevation.sortByElevation);
	}; 
	
	this.setElevationColor = function(elevation, hex){
		
		var index =0, color;
		for(var i=0; i< this.colors.length; i++){
			color = this.colors[i]; 
			index = i; 
			if(elevation == color.elevation){
				color.setColor(hex); 
				return; 
			}
			
			if(elevation < color.elevation){
				break; 
			}
			
		}
	
		
		// set new color
		this.colors.push(new ColorElevation(new THREE.Color(hex), elevation)); 
		
		// Sort colors. 
		this.colors.sort(ColorElevation.sortByElevation);
		
	};
	
	this.addColor = function(color){
		this.colors.push(color); 
	};


	this.getColorIndex = function(elevation){		
		for(var i=0; i< this.colors.length; i++){
			if(elevation < this.colors[i].elevation){
				if(i != 0){
					return i-1; 
				}
				return 0; 
			}
		}
		
		return this.colors.length-1;
	}; 

	
	this.getElevationColor = function(elevation){
		
		var e = this.colors[this.colors.length-1].elevation; 
		if(elevation > e){
			elevation = elevation % e; 
		}
			
		var i = this.getColorIndex(elevation); 
		
		var min_color = this.colors[i];
		if(this.flat || (i == this.colors.length-1)){
			return min_color.color; 
		}
		
		
		var max_color = this.colors[i+1]; 
		var c_max = max_color.color; 
		var c_min = min_color.color; 
			
			
		e = (elevation - min_color.elevation)/(max_color.elevation - min_color.elevation); 

		var vr = c_max.r-c_min.r; 
		var vg = c_max.g-c_min.g; 
		var vb = c_max.b-c_min.b; 
		

		var c_r = c_min.r + vr*e, 
			c_g = c_min.g + vg*e, 
			c_b = c_min.b + vb*e; 
			

		return new THREE.Color().setRGB(c_r, c_g, c_b); 
		
	
	}; 
	
	
	
	this.gen = function(img){
		var canvas = document.createElement("canvas");
        var canvas_ctx = canvas.getContext("2d");
                               
        var h = img.height;
        var w = img.width;
			   
		canvas.width = w;
		canvas.height = h;
			   
		canvas_ctx.drawImage(img, 0 , 0);
			   
		var imgd = canvas_ctx.getImageData(0, 0, w, h);
		var pix = imgd.data;
			   
		// this.view.setWH(w, h); 	   
			   
		// Do points 
		var i=0; 
		
		for(var x=0; x < w; x++){		
			for(var y=0; y < h; y++){
				var offset = (y*w+x)*4;
				var r = pix[offset+0];
				var g = pix[offset+1];
				var b = pix[offset+2];
				var a = pix[offset+3];
				 
				 
				// var elevation = ((a << 24) + (b << 16) + (g << 8) + r)/1000;
				var elevation = ((b << 16) + (g << 8) + r)/1000;  
				// var elevation = r; 
				// var s = (1 << 24) + (g << 16) + (b << 8) + a;    
				// var e = r;
				// var elevation = (s* (1 << e)) / (1 << 23); 
				// var elevation = r;

				this.stats.add(elevation); 
				
				this.elevations[i] = elevation; 
  				// this.view.setElevation(i, elevation); 
				i++; 
			}
		}
			
	    // this.gen_pallet();
		
		this.sun = new Sun(this); 
	    // this.sun.calcLightMap(); 
	    
	    this.loadPallets(); 
	    this.setPallet(0); 
	}; 
	
	this.gen_pallet = function(){
		this.colors = []; 
		
		var min = this.stats.min; 
		var max = this.stats.max; 
		var range = max - min; 
		var colors = parseInt($('#colors').val())-1;
		
		var step = Math.ceil(range/colors); 
		
		this.setElevationColor(this.stats.min, 0x0); 
		this.setElevationColor(this.stats.max, 0xffffff); 
			
		if(colors > 1){
			for(var i=min+step; i<max; i+=step){
				var c = this.getElevationColor(i); 
				this.setElevationColor(i, c.getHex()); 
			}
		}
		
		// this.pallets.push(new MapPallet('black-white', this.colors)); 
		// this.savePallet('black-white'); 
		
		// this.loadPallets(); 
	}; 
	
	this.setPallet = function(i){
		this.selected_pallet = i; 
		delete this.colors;
		this.colors = []; 
		var colors = this.pallets[i].colors; 
		for(i in colors){
			this.setElevationColor(colors[i].elevation, colors[i].color.getHex());
		}
		
	}; 
	
	this.deletePallet = function(index){
		this.pallets.splice(index, 1);
		
		if(this.pallets.length > 0){
			this.setPallet(this.pallets.length-1); 
		}
		localStorage['pallets'] = JSON.stringify(this.pallets); 
	}; 
	
	this.savePallet = function(name){		
		var n; 
		var ins= true; 
		for(n in this.pallets){
			if(this.pallets[n].name == name){
			  ins = false; 
			  delete this.pallets[n];
			  this.pallets[n]=new MapPallet(name, this.colors);
			  break; 
			}
		}
		
		if(ins){
			this.pallets.push(new MapPallet(name, this.colors)); 
			this.setPallet(this.pallets.length-1);
		}else{
			this.setPallet(n);
		}
		
		// alert(JSON.stringify(this.pallets)); 
		localStorage['pallets'] = JSON.stringify(this.pallets); 
	}; 

	this.loadColor= function(colors){
		var i; 
		// "name": name,  "colors":[{"color":{"r":0,"g":0,"b":0},"elevation":0},{"color":{"r":1,"g":1,"b":1},"elevation":164}]
		var ncolors = []; 
		for(i in colors['colors']){
			var color = colors['colors'][i]; 
			var tcolor = new THREE.Color().setRGB(color.color.r, color.color.g, color.color.b);
			ncolors.push(new ColorElevation(tcolor, color.elevation)); 
		}
		
		this.pallets.push(new MapPallet(colors['name'], ncolors)); 
	}; 

	this.loadPallets = function(){
		var loaded = []; 
		this.pallets = [];
		if(localStorage['pallets']){
			// alert(localStorage['pallets']); 
			var p = JSON.parse(localStorage['pallets']);
			this.loadPalletsJSON(p, loaded);  
		}
		// this.loadPalletsJSON([{"name":"black-white","colors":[{"color":{"r":0,"g":0,"b":0},"elevation":0},{"color":{"r":1,"g":1,"b":1},"elevation":164}]}], loaded); 
		this.loadPalletsJSON(
			// [{"name":"black-white","colors":[{"color":{"r":0,"g":0,"b":0},"elevation":0},{"color":{"r":1,"g":1,"b":1},"elevation":250}]},{"name":"pallet_1","colors":[{"color":{"r":0,"g":0,"b":0},"elevation":0},{"color":{"r":0.10196078431372549,"g":0,"b":1},"elevation":63},{"color":{"r":1,"g":0,"b":0},"elevation":126},{"color":{"r":1,"g":0.9019607843137255,"b":0},"elevation":189},{"color":{"r":1,"g":1,"b":1},"elevation":255}]},{"name":"pallet_2","colors":[{"color":{"r":1,"g":1,"b":1},"elevation":0},{"color":{"r":0.03529411764705882,"g":0,"b":1},"elevation":50},{"color":{"r":0.21568627450980393,"g":1,"b":0},"elevation":100},{"color":{"r":1,"g":0.9490196078431372,"b":0},"elevation":150},{"color":{"r":1,"g":0,"b":0},"elevation":200},{"color":{"r":1,"g":1,"b":1},"elevation":255}]}]
			[{"name":"black-white","colors":[{"color":{"r":0,"g":0,"b":0},"elevation":0},{"color":{"r":1,"g":1,"b":1},"elevation":255}]},{"name":"pallet_1","colors":[{"color":{"r":0,"g":0,"b":0},"elevation":0},{"color":{"r":0.10196078431372549,"g":0,"b":1},"elevation":20},{"color":{"r":1,"g":0,"b":0},"elevation":40},{"color":{"r":1,"g":1,"b":1},"elevation":60},{"color":{"r":1,"g":0.9019607843137255,"b":0},"elevation":80}]},{"name":"pallet_2","colors":[{"color":{"r":1,"g":1,"b":1},"elevation":0},{"color":{"r":0.03529411764705882,"g":0,"b":1},"elevation":10},{"color":{"r":0.21568627450980393,"g":1,"b":0},"elevation":20},{"color":{"r":1,"g":0.9490196078431372,"b":0},"elevation":30},{"color":{"r":1,"g":0,"b":0},"elevation":40},{"color":{"r":1,"g":1,"b":1},"elevation":50}]}
				,{"name":"pallet_3","colors":[{"color":{"r":0,"g":0,"b":0},"elevation":0},{"color":{"r":0.10196078431372549,"g":0,"b":1},"elevation":63},{"color":{"r":1,"g":0,"b":0},"elevation":126},{"color":{"r":1,"g":0.9019607843137255,"b":0},"elevation":189},{"color":{"r":1,"g":1,"b":1},"elevation":255}]},{"name":"pallet_4","colors":[{"color":{"r":1,"g":1,"b":1},"elevation":0},{"color":{"r":0.03529411764705882,"g":0,"b":1},"elevation":50},{"color":{"r":0.21568627450980393,"g":1,"b":0},"elevation":100},{"color":{"r":1,"g":0.9490196078431372,"b":0},"elevation":150},{"color":{"r":1,"g":0,"b":0},"elevation":200},{"color":{"r":1,"g":1,"b":1},"elevation":255}]}
			]
			, loaded
		); 
	};
	
	this.loadPalletsJSON = function(p, loaded){
		var c;  
		for(c in p){
			if(loaded.indexOf(p[c].name) == -1 ){
				this.loadColor(p[c]); 
				loaded.push(p[c].name); 
			}
		}
	};

    // this.savePallet('black-white'); 
	
	this.gen(this.img); 
	
}; 
