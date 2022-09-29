function Menu (options) {
	this.id = options.id;
	this.options = $('<div class="options" />');
	this.id.append(this.options);

	this.options.hide();
	var self = this;
	
	this.id.mouseover(
		function () {
			var options = self.options;
			var h = $(window).height() - self.id.find('.title').height();
			
			options.css({height: h});
			options.show();
		}
	);
	
	this.id.mouseout(
		function () {
			self.options.hide();
			//$('.menu_content').hide();
		}
	);
	
	this.gen_menu = function(args) {
		var options = self.options;
		var content = $('.menu_content');
		content.hide();
		
		for (var i in args) {
			var icon = $('<div class="'+args[i].classes+'"/>');

			icon.hover(function () {
				this.content.find('.menu_panel').hide();
				this.content.show();
				this.content.find('#'+this.content_id).show();
			}.bind({content_id: args[i].content, content: content}));
			options.append(icon);
		}
	};
	
	this.gen_menu(options.menu_options);
}
