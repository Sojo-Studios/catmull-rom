
// Get the browser's native requestAnimationFrame
// via https://developer.mozilla.org/en/DOM/window.requestAnimationFrame
var requestAnimationFrame = window.requestAnimationFrame ||
	window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
	window.msRequestAnimationFrame;

function Vector (x, y)
{
	this.x = x;
	this.y = y;
}

function CatmullRom ()
{
	this.canvas = null;
	this.ctx = null;
	this.width = 0;
	this.height = 0;
	this.animate = true;
	this.frameTime = 0;
	this.lastFrameTime = 0;
	this.animationCallback = null;
	this.values = {p0 : 354, p1 : 243, p2 : 354, p3 : 241};
	this.sliders = null;
}

CatmullRom.prototype = {
	
	min: 0,
	max: 600,
	points: 50,
	
	init: function ()
	{
		this.canvas = $('canvas');
		this.width = this.canvas.width();
		this.height = this.canvas.height();
		this.canvas[0].width = this.width;
		this.canvas[0].height = this.height;
		this.ctx = this.canvas[0].getContext('2d');
		
		// I like this little bit of hackery.
		this.lastFrameTime = +new Date();
		this.frameTime = 60 / 1000;
		
		this.resetCtx();
		this.animationCallback = jQuery.proxy(this.drawFrame, this);
		
		this.drawFrame(this.lastFrameTime);
		
		this.sliders = $('div.sldr');
		this.sliders.slider({
			slide: CatmullRom.prototype.sliderChange,
			max: this.max,
			min: this.min,
			value: (this.max - this.min) / 2,
		});
		
		// Set interesting initial values for the sliders
		var vals = this.values;
		var keys = Object.keys(vals);
		var count = keys.length;
		for (var i = 0; i < count; i++)
		{
			this.sliders.eq(i)
				.slider({ value: vals[keys[i]] })
			.next().html(vals[keys[i]]);
		}
	},
	
	sliderChange: function (event, ui)
	{
		var self = $(this);
		window.cm.values[self.attr('id')] = ui.value;
		self.next().html(ui.value);
	},
	
	resetCtx: function ()
	{
		var ctx = this.ctx;
		ctx.lineWidth = 2;
	},
	
	interpolatedPosition: function (P0, P1, P2, P3, u)
	{
		var u3 = u * u * u;
		var u2 = u * u;
		var f1 = -0.5 * u3 + u2 - 0.5 * u;
		var f2 =  1.5 * u3 - 2.5 * u2 + 1.0;
		var f3 = -1.5 * u3 + 2.0 * u2 + 0.5 * u;
		var f4 =  0.5 * u3 - 0.5 * u2;
		var x = P0.x * f1 + P1.x * f2 + P2.x * f3 + P3.x * f4;
		var y = P0.y * f1 + P1.y * f2 + P2.y * f3 + P3.y * f4;
		return (new Vector(x, y));
	},
	
	drawFrame: function (now)
	{
		if (!this.animate) return;
		requestAnimationFrame(this.animationCallback, this.canvas[0]);
		if ((now - this.lastFrameTime) < this.frameTime) return;
		
		// clear
		this.canvas[0].width = this.width;
		
		var p0 = new Vector(-50, this.values.p0);				// -1
		var p1 = new Vector(0  , this.values.p1);				// 0
		var p2 = new Vector(50 , this.values.p2);				// 1
		var p3 = new Vector(100, this.values.p3);				// 2
		
		var y, max = this.points;
		for (var x = 0; x < max; x++)
		{
			y = this.interpolatedPosition(p0, p1, p2, p3, x / max);
			this.circle(y.x * 10 + 50, y.y, 'blue');
		}
		
		// Handle points
		this.circle(p0.x + 50, p0.y, 'red');
		this.circle(p1.x * 10 + 50, p1.y, 'red');
		this.circle(p2.x * 10 + 50, p2.y, 'red');
		this.circle(p3.x * 10 + 50, p3.y, 'red');
		
		// Record when the last time the scene was painted was
		this.lastFrameTime = +new Date();
	},
	
	circle: function (x, y, color)
	{
		var ctx = this.ctx;
		
		ctx.beginPath();
		ctx.arc(x, y, 2, 0, Math.PI * 2, false);
		ctx.closePath();
		ctx.fillStyle = "green";
		ctx.strokeStyle = color;
		ctx.fill();
		ctx.stroke();
	}
	
};

$(window).ready(function () {
	window.cm = new CatmullRom();
	return window.cm.init();
});
