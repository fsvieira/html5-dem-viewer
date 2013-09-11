function pad(s,i,c){
	i=i+1-s.length;
	if(i<1)return s;
	c=new Array(i).join(c||" ");
	return c+s;
};


function MapColorGUI(mapcolor, ctx){


	this.mapcolor = mapcolor;
	this.ctx = ctx;

	this.x = 0;
	this.y = 0;

	$('#e_max').html(this.mapcolor.raster.data.maxz);
	$('#e_min').html(this.mapcolor.raster.data.minz);

	if(this.mapcolor.flat){
		$('#flat').prop('checked', true);
	}else{
		$('#flat').prop('checked', false);
	}

	$('#apply_angles').click(
		function(){
			$('#loading').show("fast", function () {
					var alpha = $('#x_angle').val();
					var beta = $('#y_angle').val();
					this.mapcolor.sun.setAlphaBeta(alpha, beta);
					this.mapcolor.sun.calcLightMap();
					$('#loading').hide();
				}.bind(this)
			)
		}.bind(this)
	);

	$('#sun_alpha').change(function(){
		var o = $('#sun_alpha').val();
		o = o %101;
		$('#sun_alpha').val(o);
		this.mapcolor.sun.setOpacity(o);
	}.bind(this));

	$('#apply').click(function(){
			$('#loading').show("fast", function(){
					this.mapcolor.view.paintFaces();
					this.render();
					$('#loading').hide();
				}.bind(this)
			);
	}.bind(this));

	$('#flat').change(function(){
		this.mapcolor.flat = !this.mapcolor.flat;
		$('#apply').click();
	}.bind(this));


	$('#colors').change(
		function(){
			this.mapcolor.gen_pallet();
			this.render();
		}.bind(this)
	);

	$('#save_as').click(
		function(){
			$('#save_pallet_modal').modal();
			return false;
		}
	);

	$('#save').click(
		function(){
			$('#apply').click();
			var name = $('#pallets option:selected').text();
			if(name){
				this.mapcolor.savePallet(name);
			}else{
				$('#save_pallet_modal').modal();
				return false;
			}
			this.render_pallets();
		}.bind(this)
	);

	$('#delete').click(
		function(){
			var val = $('#pallets option:selected').val();
			this.mapcolor.deletePallet(val);
			this.render_pallets();
		}.bind(this)
	);

	$('#save_pallet').click(
		function(){
			$('#apply').click();
			var name = $('#pallet_name').val();
			this.mapcolor.savePallet(name);
			this.render_pallets();
			$.modal.close();
		}.bind(this)
	);


	$('#pallets').change(
		function(e){
			$('#loading').show("fast", function(){
				var val = $('#pallets option:selected').val();
				this.mapcolor.setPallet(parseInt(val));
				this.mapcolor.view.paintFaces();
				this.render();
				$('#loading').hide();
			}.bind(this));
		}.bind(this)
	);

	this.render_pallets = function(){
		var select_pallets = $('#pallets');
		select_pallets.html("");
		for(i in this.mapcolor.pallets){
			var op;
			i = parseInt(i);
			if(i==this.mapcolor.selected_pallet){
				op = $("<option value='"+i+"' selected='selected' >"+this.mapcolor.pallets[i].name+"</option>");
			}else{
				op = $("<option value='"+i+"' >"+this.mapcolor.pallets[i].name+"</option>");
			}
			select_pallets.append(op);
		}
	};


	this.render = function(){
		var container = this.ctx.find(".container");

		container.html("");
		var table = $("<table>");

		var colors = this.mapcolor.colors;
		$('#colors').val(colors.length);
		for(var i in colors){
			var color = colors[i];

			var tr = $("<tr>");
			var input_elevation = $('<input type="text" value="'+color.elevation+'">');
			input_elevation.width(50);

			input_elevation.change(
				function(e){
					var v = parseInt($(e.target).val());
					this.mapcolorgui.mapcolor.update_elevation(this.color, v);
					this.mapcolorgui.render();
				}.bind({'color': color, 'mapcolorgui': this })
			);


			var td_value = $("<td />");
			td_value.append(input_elevation);
			var td_color = $("<td></td>");

			// alert(pad(color.color.getHex().toString(16), 6, "0"));
			var color_p = $('<input type="hidden" name="color'+i+'" class="color-picker" size="6" autocomplete="on" maxlength="10" value="#' + pad(color.color.getHex().toString(16), 6, "0") +'" />');
			td_color.append(color_p);
			color_p.miniColors({
					letterCase: 'uppercase',
					change: function(hex, rgb) {
							this.mapcolorgui.mapcolor.setElevationColor(this.elevation, parseInt("0x"+ hex.substring(1)) );
						}.bind({'elevation': color.elevation, 'mapcolorgui': this})
			});

			tr.append(td_value);
			tr.append(td_color);
			table.prepend(tr);

			// pallets
			this.render_pallets();
		};

		container.append(table);

		var canvas = document.getElementById('scale_colors');
		var sh = colors.length*25; // container.height();
		var sw = 100;
		canvas.width = sw;
		canvas.height = sh;
		var canvas_ctx = canvas.getContext('2d');

		var raster = mapcolor.raster;

		canvas_ctx.fillStyle='white';
		canvas_ctx.fillRect( 0, 0, canvas.width, canvas.height);

		canvas_ctx.font = '12px sans-serif';

		canvas_ctx.lineWidth =1;
		var j=0;
		var color = colors[j];
		var px = 0;

		var min = colors[0].elevation;
		var max = colors[colors.length-1].elevation;
		var range = max - min;
		var step = range/(sh-10);

		for(var i=0; i<=(sh-10); i++){
				var e = min+Math.ceil(i*step);
				var c = this.mapcolor.getElevationColor(e);
				var r = Math.floor(c.r*255);
				var g = Math.floor(c.g*255);
				var b = Math.floor(c.b*255);

				canvas_ctx.strokeStyle = "rgb(" + r + "," + g + "," + b + ")"; // .toString(16);
				canvas_ctx.beginPath();
				canvas_ctx.moveTo(0,sh-i);
				canvas_ctx.lineTo(30,sh-i);
				canvas_ctx.stroke();
				px++;
				if(color.elevation <= e ){
					canvas_ctx.strokeStyle = "#000000";
					if(px < 10){
						canvas_ctx.strokeText('-------- '+ color.elevation, 35, sh-i);
					}else{
						canvas_ctx.strokeText('- '+ color.elevation, 35, sh-i);
					}
					j++;
					color = colors[j];
					px = 0;
					if(!color){break;}
			}
		}
	};



};


