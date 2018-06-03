let now = new Date();
//console.log(now.getDay());
var moonLanding = new Date('July 20, 69 00:20:18');

//console.log(moonLanding.getMonth()); // (January gives 0)
// expected output: 6

Date.prototype.subDays = function (n) {
	var time = this.getTime();
	var changedDate = new Date(time - (n * 24 * 60 * 60 * 1000));
	this.setTime(changedDate.getTime());
	return this;
};

console.log(now.subDays(90).getDay());
console.log(now.subDays(90).getMonth());
console.log(now.subDays(90).getFullYear());