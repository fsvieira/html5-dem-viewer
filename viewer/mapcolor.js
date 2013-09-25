function ColorElevation(color, elevation){
	this.color = color;
	this.elevation = elevation;

	this.setColor = function(val){
		this.color.setHex(val);
	};

	this.setElevation = function (elevation) {
	  this.elevation = (elevation - ColorElevation.min) / (ColorElevation.max - ColorElevation.min)
	  return this;
	};

	this.getElevation = function () {
		return ColorElevation.min + (ColorElevation.max - ColorElevation.min) * this.elevation;
	};

};

ColorElevation.sortByElevation = function (a, b){
	return a.getElevation() - b.getElevation();
};

ColorElevation.minMax = function (min, max) {
	ColorElevation.min = min;
	ColorElevation.max = max;
};


function MapPallet(name, colors){
	this.name = name;
	this.colors = colors ? colors : [];
};

function MapColor(raster){
	this.colors = [];
	this.pallets = [];
	this.selected_pallet = 0;
	this.mode_2d = false;
	this.raster = raster;

	this.view = null;
	this.sun = null;

	this.elevations = raster.data.data;
	
	ColorElevation.minMax(raster.data.minz, raster.data.maxz);
	
	this.mode_area = false;

	this.set3DArea = function(x, y){

		if(x < 0){x=0;}
		if(y < 0){y=0;}

		var bx, by;

		bx = x + $('#select3d').width();
		by = y + $('#select3d').height();

		if(bx > this.raster.data.w){
			bx = this.raster.data.w;
		}

		if(by > this.raster.data.h){
			by = this.raster.data.h;
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
			this.view.setWH(this.raster.data.w, this.raster.data.h);
			this.view.paint();
		}else{
			if(raster.data.w <= $('#select3d').width() && this.raster.data.h <= $('#select3d').height()){
				if(this.view){
					this.view.free();
					delete this.view;
				}
				this.view = new View3D(this);
				this.view.setWH(this.raster.data.w, this.raster.data.h);
				this.view.paint();
			}else{
				this.mode_area = true;
				$('#select3d').show();
			}
		}
		
		if (this.mode_2d) {
		   $('#mode').html('Switch to 3D Mode');
		   $(".coords").show();
		} else {
		   $('#mode').html('Switch to 2D Mode');
		   $(".coords").hide();
		}
	};

	this.toggleMode = function(){
		$('#loading').show("fast", function(){
				this.setMode2D(!this.mode_2d);
				$('#loading').hide();
			}.bind(this)
		);
	};

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
			if(elevation == color.getElevation()){
				color.setColor(hex);
				return;
			}

			if(elevation < color.getElevation()){
				break;
			}

		}

		// set new color
		this.colors.push(new ColorElevation(new THREE.Color(hex)).setElevation(elevation));

		// Sort colors.
		this.colors.sort(ColorElevation.sortByElevation);

	};

	this.addColor = function(color){
		this.colors.push(color);
	};

	this.getColorIndex = function(elevation){
		for(var i=0; i< this.colors.length; i++){
			if(elevation < this.colors[i].getElevation()){
				if(i != 0){
					return i-1;
				}
				return 0;
			}
		}

		return this.colors.length-1;
	};

	this.getElevationColor = function(elevation){

		var e = this.colors[this.colors.length-1].getElevation();
		if(elevation > e) {
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

		e = (elevation - min_color.getElevation()) / (max_color.getElevation() - min_color.getElevation());

		var vr = c_max.r-c_min.r;
		var vg = c_max.g-c_min.g;
		var vb = c_max.b-c_min.b;


		var c_r = c_min.r + vr*e,
			c_g = c_min.g + vg*e,
			c_b = c_min.b + vb*e;
         
  
		return new THREE.Color().setRGB(c_r, c_g, c_b);
	};

	
	
	this.update_pallets = function () {
		if (this.pallets) {
			var pallets_str = JSON.stringify(this.pallets)
			localStorage['pallets'] = pallets_str;
			$("#pallets_export").html(pallets_str);
			$("#pallets_export_ui").show();
		}
		else {
			$("#pallets_export_ui").hide();
		}
	};

	this.gen = function (raster) {
		this.sun = new Sun(this);
		this.loadPallets();
		this.setPallet(0);
		this.update_pallets();
	};

	this.gen_pallet = function() {
		this.colors = [];

		var min = this.raster.data.minz;
		var max = this.raster.data.maxz;
		var range = max - min;
		var colors = parseInt($('#colors').val())-1;

		var step = Math.ceil(range/colors);
		
		this.setElevationColor(min, 0xff);
		this.setElevationColor(max, 0xffffff);
		
		if (colors > 1) {
			for(var i=min+step; i<max; i+=step){
				var c = this.getElevationColor(i);
				this.setElevationColor(i, c.getHex());
			}
		}
	};

	this.setPallet = function(i){
		this.selected_pallet = i;
		this.colors = [];
		var colors = this.pallets[i].colors;
		for(i in colors){
			this.setElevationColor(colors[i].getElevation(), colors[i].color.getHex());
		}
	};

	this.deletePallet = function(index){
		this.pallets.splice(index, 1);

		if(this.pallets.length > 0){
			this.setPallet(this.pallets.length-1);
		}
		this.update_pallets(pallets);
	};

	this.savePallet = function(name) {
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

		this.update_pallets(this.pallets);
	};

	this.loadColor= function(colors){
		var i;
		var ncolors = [];
		
		for(i in colors['colors']){
			var color = colors['colors'][i];
			var tcolor = new THREE.Color().setRGB(color.color.r, color.color.g, color.color.b);
			ncolors.push(new ColorElevation(tcolor, color.elevation));
		}

		this.pallets.push(new MapPallet(colors['name'], ncolors));
	};
	
	this.addPallets = function (pallets, prefix) {
		for (i in pallets) {
			pallets[i].name = "(" + prefix + ") "+ pallets[i].name; 
		}
		
		this.loadPalletsJSON(pallets);
		this.update_pallets();
	};

	this.loadPallets = function () {
		var loaded = [];
		this.pallets = [];
	
		if (!localStorage['version']) {
			localStorage['version'] = "v0.0.0";
			// delete all pallets:
			delete localStorage['pallets'];
		}
		
		if(localStorage['pallets']) {
			try {
				var p = JSON.parse(localStorage['pallets']);
				this.loadPalletsJSON(p, loaded);
			}
			catch (e) {
				// pallets are correpted, delete everything.
				delete localStorage['pallets'];
			}
		}
		
		this.loadPalletsJSON(
			[
			{	
				"name":"colors",
				"colors":[
					{"color":{"r":0,"g":0,"b":1},"elevation":0},
					{"color":{"r":0.08235294117647059,"g":1,"b":0},"elevation":0.2545454545454545},
					{"color":{"r":1,"g":0,"b":0},"elevation":0.509090909090909},
					{"color":{"r":1,"g":0,"b":0.8},"elevation":0.7636363636363637},
					{"color":{"r":1,"g":1,"b":1},"elevation":1}
				]
			},
			{
				"name":"black-white",
				"colors":[
					{"color":{"r":0,"g":0,"b":0},"elevation":0},
					{"color":{"r":1,"g":1,"b":1},"elevation":1}
				]
			}]
			, loaded
		);
	};

	this.loadPalletsJSON = function(p, loaded){
		if (p) {
			var c;
			for(c in p){
				if(!loaded || loaded.indexOf(p[c].name) == -1 ){
					this.loadColor(p[c]);
					loaded && loaded.push(p[c].name);
				}
			}
		}
	};

	this.gen(this.raster);

};
