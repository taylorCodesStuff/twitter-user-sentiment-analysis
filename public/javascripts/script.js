console.log("client side js");

console.log(tweets);


init();

function init(){
	toggleTweets();
	barChart(tweets);
	// handleSubmit();
	// toggleTwitterUser();
}


function toggleTweets(){
	$('.tweets-btn').on('click', function(event){
		$('.tweets').toggleClass('description-display');
		let value = $(this).text();
		if(value === 'Hide tweets'){
			$(this).text('Show tweets');
		} else {
			$(this).text('Hide tweets');
		}
	});
}

function handleSubmit(){
	$('form').on('submit', function(event){
		event.preventDefault();
		barChart(tweets);
	});
}

function toggleTwitterUser(){
	$('.go-btn').on('click', function(event){
		event.preventDefault();
		$('.twitter-user').toggleClass('twitter-user-display');
		$('input').val("");
	});
}

$('.popular').on('click', function(event){
	$('input').val($(this).text());
	$('form').submit();
});


//Define bar chart function
function barChart(dataset){

	//Set width and height as fixed variables
	var w = 520;
	var h = 500;
	var padding = 25;

	//Scale function for axes and radius
	var yScale = d3.scale.linear()
						.domain(d3.extent(dataset, function(d){return d.analysis.score;}))
						.range([w+padding,padding]);

	var xScale = d3.scale.ordinal()
						.domain(dataset.map(function(d){ return d.text;}))
						.rangeRoundBands([padding,h+padding],.5);

	//To format axis as a percent
	var formatPercent = d3.format("%1");

	//Create y axis
	var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(5).tickFormat(formatPercent);

	//Define key function
	var key = function(d){return d.text};

	//Define tooltip for hover-over info windows
	var div = d3.select("body").append("div")
  							.attr("class", "tooltip")
  							.style("opacity", 0);

	//Create svg element
	var svg = d3.select("#chart-container").append("svg")
				.attr("width", w).attr("height", h)
				.attr("id", "chart")
				.attr("viewBox", "0 0 "+w+ " "+h)
				.attr("preserveAspectRatio", "xMinYMin");

	//Resizing function to maintain aspect ratio (uses jquery)
	var aspect = w / h;
	var chart = $("#chart");
	$(window).on("resize", function() {
		var targetWidth = $("body").width();

	    if(targetWidth<w){
	    		chart.attr("width", targetWidth);
	    		chart.attr("height", targetWidth / aspect);
	    } else{
	    	chart.attr("width", w);
	    	chart.attr("height", w / aspect);
	    }

	});


		//Initialize state of chart according to drop down menu
		var state = d3.selectAll("option");

		//Create barchart
		svg.selectAll("rect")
			.data(dataset, key)
			.enter()
		  	.append("rect")
		    .attr("class", function(d){
		    	console.log(d, d.analysis.score, d.text);
		    	return d.analysis.score < 0 ? "negative" : "positive";})
		    .attr({
		    	x: function(d){
		    		console.log(d);
		    		return xScale(d.text);
		    	},
		    	y: function(d){
		    		return yScale(Math.max(0, d.analysis.score));
		    	},
		    	width: xScale.rangeBand(),
		    	height: function(d){
		    		return Math.abs(yScale(d.analysis.score) - yScale(0));
		    	}
		    })
		    .on('mouseover', function(d){
							d3.select(this)
							    .style("opacity", 0.2)
							    .style("stroke", "black")

					var info = div
							    .style("opacity", 1)
							    .style("left", (d3.event.pageX+10) + "px")
							    .style("top", (d3.event.pageY-30) + "px")
							    .text(d.text);

					if(state[0][0].selected){
						info.append("p")
							    .text(formatPercent(d.analysis.score));

					}
					else if(state[0][1].selected){
						info.append("p")
							    .text(formatPercent(d.analysis.score));
					}



						})
        				.on('mouseout', function(d){
        					d3.select(this)
							.style({'stroke-opacity':0.5,'stroke':'#a8a8a8'})
							.style("opacity",1);

							div
	    						.style("opacity", 0);
        				});

		//Add y-axis
		svg.append("g")
				.attr("class", "y axis")
				.attr("transform", "translate(40,0)")
				.call(yAxis);

		//Sort data when sort is checked
		d3.selectAll(".checkbox").
		on("change", function(){
			var x0 = xScale.domain(dataset.sort(sortChoice())
			.map(function(d){return d.text}))
			.copy();

			var transition = svg.transition().duration(750);
			var delay = function(d, i){return i*10;};

			transition.selectAll("rect")
			.delay(delay)
			.attr("x", function(d){return x0(d.text);});

		})

		//Function to sort data when sort box is checked
		function sortChoice(){
				var state = d3.selectAll("option");
				var sort = d3.selectAll(".checkbox");

				if(sort[0][0].checked && state[0][0].selected){
					var out = function(a,b){return b.score - a.score;}
					return out;
				}
				else if(sort[0][0].checked && state[0][1].selected){
					var out = function(a,b){return b.score - a.score;}
					return out;
				}
				else{
					var out = function(a,b){return d3.ascending(a.text, b.text);}
					return out;
				}
		};

		//Change data to correct values on input change
			d3.selectAll("select").
			on("change", function() {

				var value= this.value;

				if(value=="bus"){
					var x_value = function(d){return d.analysis.score;};
					var color = function(d){return d.analysis.score < 0 ? "negative" : "positive";};
					var y_value = function(d){
			    		return yScale(Math.max(0, d.analysis.score));
			    	};
			    	var height_value = function(d){
			    		return Math.abs(yScale(d.analysis.score) - yScale(0));
			    	};
				}
				else if(value=="demand"){
					var x_value = function(d){return d.analysis.score;};
					var color = function(d){return d.analysis.score < 0 ? "negative" : "positive";};
					var y_value = function(d){
			    		return yScale(Math.max(0, d.analysis.score));
			    	};
			    	var height_value = function(d){
			    		return Math.abs(yScale(d.analysis.score) - yScale(0));
			    	};
				}

				//Update y scale
				yScale.domain(d3.extent(dataset, x_value));

				//Update with correct data
				var rect = svg.selectAll("rect").data(dataset, key);
				rect.exit().remove();

				//Transition chart to new data
				rect
				.transition()
				.duration(2000)
				.ease("linear")
				.each("start", function(){
					d3.select(this)
					.attr("width", "0.2")
					.attr("class", color)
				})
				.attr({
			    	x: function(d){
			    		return xScale(d.text);
			    	},
			    	y: y_value,
			    	width: xScale.rangeBand(),
			    	height: height_value

				});

				//Update y-axis
				svg.select(".y.axis")
					.transition()
					.duration(1000)
					.ease("linear")
					.call(yAxis);
			});

	};

	//Load data and call bar chart function
		// d3.csv("transport.csv", function(error,data){
		// 		if(error){
		// 			console.log(error);
		// 		}
		// 		else{
		// 			data.forEach(function(d) {
		// 				d.analysis.score = parseFloat(d.analysis.score);
		// 				d.analysis.score = parseFloat(d.score);
		// 			});
		// 			dataset=data;
		// 			barChart(dataset);
		// 			console.log(dummyData);
		// 		}
		// });

// barChart(tweets);
