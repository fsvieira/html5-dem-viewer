function Sun(mapcolor){
	this.pos = new THREE.Vector3(0, 0, -1); 
	this.m = new THREE.Matrix4();
	this.mapcolor = mapcolor; 
	
	this.alpha = 0; 
	this.beta = 0; 
	this.show = false; 
	this.opacity = 100; 
	
	this.canvas = document.createElement('canvas'); 
	this.canvas.setAttribute('class', 'sun'); 
	
	this.a = new THREE.Vector3(); 
	this.b = new THREE.Vector3(); 
	this.n = new THREE.Vector3(); 
	
	this.rad = Math.PI/180; 	
	
	this.setOpacity = function(opacity){
		this.opacity = opacity;
		$(this.canvas).css({ opacity: this.opacity/100 }); 
	}	
		
	this.setAlphaBeta = function(alpha, beta){
		this.alpha = alpha; 
		this.beta = beta; 
	}; 
	
	this.rotate = function(){
		this.pos.set(0, 0, -1);
		
		this.m.makeRotationX( -this.alpha*this.rad ); 
		this.m.makeRotationY( this.beta*this.rad );		
		// this.pos.getRotationFromMatrix(this.m);  	
		this.m.multiplyVector3(this.pos);
		this.pos.normalize(); 
	}; 
	
	this.getTriangleNormal = function(p0, p1, p2){
		this.a.sub(p0, p1);
		this.b.sub(p1, p2); 
		this.n.cross(this.a, this.b);  
		this.n.normalize(); 
		return this.n; 
	};  	
	
	this.getNormal = function(c0, p0, p1, p2, p3){
		var n = new THREE.Vector3(); 
		n.add(this.getTriangleNormal(c0, p0, p1), this.getTriangleNormal(c0, p1, p2));
		n.add(n, this.getTriangleNormal(c0, p2, p3));
		n.add(n, this.getTriangleNormal(c0, p3, p0));			
		n.divideScalar(4);
		n.normalize(); 
		return n;  
	}; 

	this.getLight = function(c0, p0, p1, p2, p3){
		return this.getNormal(c0, p0, p1, p2, p3).dot(this.pos); 
	};  
	
	this.calcLightMap = function(){
		this.rotate(); 
		var w = this.mapcolor.img.width; 
		var h = this.mapcolor.img.height; 

		this.canvas.width = w; 
		this.canvas.height = h; 
				
		var ctx = this.canvas.getContext('2d');
		var imageData = ctx.getImageData(0, 0, w, h);
		var data = imageData.data; 
		
		var x, y; 
		var c0=new THREE.Vector3(), p0 = new THREE.Vector3(), 
			 p1 = new THREE.Vector3(), p2 = new THREE.Vector3(), p3 = new THREE.Vector3();

		var o, l; 
		var elevations = this.mapcolor.elevations; 
		for(x=0; x<w; x++){
			for(y=0; y<h; y++){
				if(x==0){
					p0.set(-1,y,0);
				}else{
					o = (x-1)+y*w; 
					p0.set(x-1, y, elevations[o]); 
				}	

				if(y==0){
					p1.set(x,-1,0);
				}else{
					o = x+(y-1)*w; 
					p1.set(x, y-1, elevations[o]); 
				}	
				
				// w h				
				if(x==(w-1)){
					p2.set(w,y,0);
				}else{
					o = (x+1)+y*w; 
					p2.set(x+1, y, elevations[o]); 
				}	

				if(y==(h-1)){
					p3.set(x,h,0);
				}else{
					o = x+(y+1)*w; 
					p3.set(x, y+1, elevations[o]); 
				}	
				
				o = x+y*w; 
				c0.set(x, y, elevations[o]); 
				l = this.getLight(c0, p0, p1, p2, p3); 
				l = Math.ceil((l+1)*255/2); 
				o = o*4; 
				// l=0; 
				data[o]   = l;    // red
				data[++o] = l;    // green
				data[++o] = l;    // blue
				data[++o] = 255;      // alpha
			}
		} 
		
		ctx.putImageData(imageData, 0, 0); 
		
	}; 
	
}; 

