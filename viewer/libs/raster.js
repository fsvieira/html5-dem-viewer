function Raster (data) {
	this.data = data;

/*

//PLG removed because the min and max are in the GeoJSON file
	this.computeStats = function () {


	if (this.data.minz !== undefined && this.data.max !== undefined) return;
		
		var values = data.data;

		for (var i in values) {
			if (!this.data.minz) {
				this.data.minz = values[i];
			}
			else if (this.data.minz > values[i]) {
				this.data.minz = values[i];
			}

			if (!this.data.maxz) {
				this.data.maxz = values[i];
			} else if (this.data.maxz < values[i]) {
				this.data.maxz = values[i];
			}
		}
	};

	this.computeStats();
*/	
}

function downloadFile (url, onload) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.responseType = 'arraybuffer';
	xhr.send();

	xhr.onload = function () {
		var bytes = new Uint8Array(xhr.response);
		onload(bytes);
	}
};

Raster.load_json_bz2 = function (bytes, onload, onerror) {
	try {
		var data = bzip2.simple(bzip2.array(bytes));
		var raster = new Raster(JSON.parse(data));
		onload(raster);
	}
	catch (exception) {
		onerror(exception);
	}				
};

Raster.load_png = function(url, onload, onerror, divider) {
	var img = new Image();
	divider = divider || 1;
	
	img.onload = function () {
		var data = {w: img.width, h: img.height, data: []};
		var canvas = document.createElement("canvas");
		var canvas_ctx = canvas.getContext("2d");

		canvas.width = data.w;
		canvas.height = data.h;
		canvas_ctx.drawImage(img, 0 , 0);

		var imgd = canvas_ctx.getImageData(0, 0, data.w, data.h);
		var pix = imgd.data;

		for (var y=0; y < data.h; y++) {
			for(var x=0; x < data.w; x++) {
				var offset = (y*data.w+x)*4;
				var r = pix[offset+0];
				var g = pix[offset+1];
				var b = pix[offset+2];
				// var a = pix[offset+3];
				
				var elevation = (b << 16) + (g << 8) + r;

				if (elevation & 0x800000) {
					elevation = elevation | ~0xffffff;
				}

				elevation = elevation / divider;

				data.data.push(elevation);
			}
		}

		onload(new Raster(data));
	}

	img.src = url;
}
