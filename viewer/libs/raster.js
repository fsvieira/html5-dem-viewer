function Raster (data) {
	this.data = data;

	this.computeStats = function () {
		var values = data.data;

		for (var i in values) {
			if (!this.min) {
				this.min = values[i];
			}
			else if (this.min > values[i]) {
				this.min = values[i];
			}

			if (!this.max) {
				this.max = values[i];
			} else if (this.max < values[i]) {
				this.max = values[i];
			}
		}
	};

	this.computeStats();
}

Raster.load = function(url, onload, onerror, type) {
	switch (type) {
		case 'json.gz':
			TarGZ.load(url, function (file, data) {
				var str = "", raster;
				for (var i in data.data) {
					str += data.data[i];
				}

				raster = new Raster(JSON.parse(str));
				onload(raster);
			}, null, onerror);
			break;

			case 'png':
			default:
				var img = new Image();
				img.onload = function () {
					var data = {w: img.width, h: img.height, data: []};

					var canvas = document.createElement("canvas");
					var canvas_ctx = canvas.getContext("2d");

					canvas.width = data.w;
					canvas.height = data.h;
					canvas_ctx.drawImage(img, 0 , 0);

					var imgd = canvas_ctx.getImageData(0, 0, data.w, data.h);
					var pix = imgd.data;

					//PLG change order of loops here, to correctly orient DEM
					for(var y=0; y < data.h; y++){
						for(var x=0; x < data.w; x++){
							var offset = (y*data.w+x)*4;
							var r = pix[offset+0];
							var g = pix[offset+1];
							var b = pix[offset+2];

							var elevation = ((b << 16) + (g << 8) + r)/1000;
							data.data.push(elevation);
						}
					};

					onload(new Raster(data));
				}

				img.src = url;
	}
};
