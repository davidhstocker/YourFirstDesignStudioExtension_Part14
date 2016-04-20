define(["sap/designstudio/sdk/component", "d3", "css!../css/component.css"], function(Component, d3, unusedDummy) {
  Component.subclass("com.sap.sample.scngauge.SCNGauge", function() {
	
		var me = this;
		//Properties
		me._enableArc = true;
		me._innerRad = 0.0;
		me._outerRad = 0.0;
		me._endAngleDeg = 90.0;
		me._startAngleDeg = -90.0;
		me._paddingTop = 0;
		me._paddingBottom = 0;
		me._paddingLeft = 0;
		me._paddingRight = 0;
		me._offsetLeft = 0;
		me._offsetDown = 0;
		
		//New with Part 6
		me._useMeasures = false;
		me._endAngleDegMax = 90.0;
		me._measureMax = 0;
		me._measureMin = 0;
		me._measureVal = 0;
		
		//Part 7 conditional formatting
		me._colorCode = 'blue';
		me._gaugeOpacity = 1.0,
		me._displayedColor = 'blue'
		me._colorArray = 1;  //abusing JS duck typing here.  ;-)
		
		//Part 8 Guide Lines
		me._enableGuideLines = false;
		me._enableGuideRing = false;
		me._ringColorCode = 'blue';
		me._guideOpacity = 1.0;
		me._ringThickness = 2;
		me._bracketThickness = 2;
		
		//Part 9 - Indicator Needle
		me._enableIndicatorNeedle = false;
		me._enableIndicatorNeedleTail = false;
		me._fillNeedle = false;
		me._needleColorCode = 'black';
		me._needleWidth = 10;
		me._needleHeadLength = 100;
		me._needleTailLength = 10;
		me._needleLineThickness = 2;
		me._enableIndicatorNeedleBase = false;
		me._fullBasePinRing = false;
		me._fillNeedlaBasePin = false;
		me._needleBaseWidth = 20;
		
		//Part 10 - Animations
		me._animationEnable = false;
		me._animationDelay = 500;
		me._animationDuration = 1000;
		me._animationEase = "linear";
		me._animationEnableOpacity = false;
		me._animationDelayOpacity = 500;
		me._animationDurationOpacity = 500;
		
		//Part 11 - Callouts
		me._drawMeasureText = false;
		me._measureTextPositionType = "upperCentral";
		me._drawGuideText = false;
		me._guidePositioning = "end";
		
		//Part 12 CSS
		me._measureTextCSSClass = 'measure';
		me._guideTextCSSClass = 'guide';
		
		//Part 14
		me._enableTickMarks = false;
		me._tickMarkCount = 11;
		me._outsideTickLength = 2;
		me._insideTickLength = 5;
		
		
		//Validate the Inner and Outer Radii
		me.validateRadii = function(inner, outer) {
			if (inner <= outer) {
				return true;
			} else {
				return false;
			}
		};
		
		
		//Recalculate Outer Radius.  Also, double check that the new value fits with me._innerRad
		me.recalculateOuterRadius = function(paddingLeft, paddingRight, paddingTop, paddingBottom){
			// Find the larger left/right padding
			var lrPadding = paddingLeft + paddingRight;
			var tbPadding = paddingTop + paddingBottom;
			var maxPadding = lrPadding;
			if (maxPadding < tbPadding){
				maxPadding = tbPadding
			}			
			var newOuterRad = (me.$().width() - 2*(maxPadding))/2;
			var isValid = me.validateRadii(me._innerRad, newOuterRad);
			if (isValid === true){
				me._outerRad = newOuterRad;
				return true;
			}
			else {
				return false;
			}
		}
	
		//Getters and Setters
		me.enableArc = function(value) {
			if (value === undefined) {
				return me._enableArc;
			} else {
				me._enableArc = value;
				return me;
			}
		};
		
		//Getters and Setters
		me.colorCode = function(value) {
			if (value === undefined) {
				return me._colorCode;
			} else {
				me._colorCode = value;
				return me;
			}
		};
	
		me.gaugeOpacity = function(value) {
			if (value === undefined) {
				return me._gaugeOpacity;
			} else {
				me._gaugeOpacity = value;
				return me;
			}
		};
		
		
		me.innerRad = function(value) {
			if (value === undefined) {
				return me._innerRad;
			} else {
			
				var isValid = me.validateRadii(value, me._outerRad);
				if (isValid === false){
					alert("Warning!  The gauge arc can't have a small inner radius than outer!  Inner Radius must be equal to or less than " + me._outerRad);
					alert("Please decrease the inner radius, or increase the size of the control.  Height & width (including subtraction for padding) must me at least twice as large as Internal Radius!");
				} else {
					me._innerRad = value;
				}
				return this;
			}
		};
		
		me.endAngleDeg = function(value) {
			if (value === undefined) {
				return me._endAngleDeg;
			} else {
				me._endAngleDeg = value;
				me.recalculateCurrentAngle();
				return this;
			}
		};
	
		me.startAngleDeg = function(value) {
			if (value === undefined) {
				return me._startAngleDeg;
			} else {
				me._startAngleDeg = value;
				me.recalculateCurrentAngle();
				return this;
			}
		};
		
		me.currentAngle = function(value) {
			if (value === undefined) {
				return me._endAngleDeg;
			} else {
				me._endAngleDeg = value;
				me.recalculateCurrentAngle();
				return this;
			}
		};
		
		me.paddingTop = function(value) {
			if (value === undefined) {
				return me._paddingTop;
			} else {
				var isValid =me.recalculateOuterRadius(me._paddingLeft, me._paddingRight, value, me._paddingBottom);
				if (isValid === false){
					alert("Warning!  The gauge arc can't have a small inner radius than outer!  Outer Radius must be equal to or greater than " + me._innerRad);
					alert("Please decrease the inner radius, or increase the size of the control.  Height & width (including subtraction for padding) must me at least twice as large as Internal Radius!");
				} else {
					me._paddingTop = value;
				}
				return this;
			}
		};
		
		me.paddingBottom = function(value) {
			if (value === undefined) {
				return me._paddingBottom;
			} else {
				var isValid = me.recalculateOuterRadius(me._paddingLeft, me._paddingRight, me._paddingTop, value);
				if (isValid === false){
					alert("Warning!  The gauge arc can't have a small inner radius than outer!  Outer Radius must be equal to or greater than " + me._innerRad);
					alert("Please decrease the inner radius, or increase the size of the control.  Height & width (including subtraction for padding) must me at least twice as large as Internal Radius!");
				} else {
					me._paddingBottom = value;
				}
				return this;
			}
		};
		
		me.paddingLeft = function(value) {
			if (value === undefined) {
				paddingLeft = me._paddingLeft;
				return paddingLeft;
			} else {
				var isValid = me.recalculateOuterRadius(value, me._paddingRight, me._paddingTop, me._paddingBottom);
				if (isValid === false){
					alert("Warning!  The gauge arc can't have a small inner radius than outer!  Outer Radius must be equal to or greater than " + me._innerRad);
					alert("Please decrease the inner radius, or increase the size of the control.  Height & width (including subtraction for padding) must me at least twice as large as Internal Radius!");
				} else {
					me._paddingLeft = value;
				}
				return this;
	
			}
		};
		
		me.paddingRight = function(value) {
			if (value === undefined) {
				paddingRight = me._paddingRight;
			} else {
				var isValid = me.recalculateOuterRadius(me._paddingLeft, value, me._paddingTop, me._paddingBottom);
				if (isValid === false){
					alert("Warning!  The gauge arc can't have a small inner radius than outer!  Outer Radius must be equal to or greater than " + me._innerRad);
					alert("Please decrease the inner radius, or increase the size of the control.  Height & width (including subtraction for padding) must me at least twice as large as Internal Radius!");
				} else {
					me._paddingRight = value;
				}
				return this;
			}
		};
		
		//New with Part 6 
		me.useMeasures = function(value) {
			if (value === undefined) {
				return me._useMeasures;
			} else {
				me._useMeasures = value;
				me.recalculateCurrentAngle();
				return this;
			}
		};
		
		me.endAngleDegMax = function(value) {
			if (value === undefined) {
				return me._endAngleDegMax;
			} else {
				me._endAngleDegMax = value;
				me.recalculateCurrentAngle();
				return this;
			}
		};
	
		
		me.measureMax = function(value) {
			if (value === undefined) {
				return me._measureMax;
			} else {
				if (value >= me._measureMin){
					me._measureMax = value;
					me.recalculateCurrentAngle();
				}
				else{
					alert("The maximum displayed value of the measure must be greater then the minimum!");
				}
				return this;
			}
		};
		
		me.measureMin = function(value) {
			if (value === undefined) {
				return me._measureMin;
			} else {
				if (value <= me._measureMax){
					me._measureMin = value;
					me.recalculateCurrentAngle();
				}
				else{
					alert("The maximum displayed value of the measure must be greater then the minimum!");
				}
				return this;
			}
		};
		
		me.measureVal = function(value) {
			if (value === undefined) {
				return me._measureVal;
			} else {
				me._measureVal = value;
				me.recalculateCurrentAngle();
				return this;
			}
		};
		
		
		me.colorArray = function(value) {
			if (value === undefined) {
				return me._colorArray;
			} else {
				me._colorArray = value;
				return this;
			}
		};
		
		
		// Part 8
		me.enableGuideLines = function(value) {
			if (value === undefined) {
				return me._enableGuideLines;
			} else {
				me._enableGuideLines = value;
				return this;
			}
		};
		
		me.bracketThickness = function(value) {
			if (value === undefined) {
				return me._bracketThickness;
			} else {
				me._bracketThickness = value;
				return this;
			}
		};
		
		me.guideColorCode = function(value) {
			if (value === undefined) {
				return me._guideColorCode;
			} else {
				me._guideColorCode = value;
				return this;
			}
		};
		
		me.enableGuideRing = function(value) {
			if (value === undefined) {
				return me._enableGuideRing;
			} else {
				me._enableGuideRing = value;
				return this;
			}
		};
		
		me.ringColorCode = function(value) {
			if (value === undefined) {
				return me._ringColorCode;
			} else {
				me._ringColorCode = value;
				return this;
			}
		};
		
		me.guideOpacity = function(value) {
			if (value === undefined) {
				return me._guideOpacity;
			} else {
				me._guideOpacity = value;
				return this;
			}
		};
		
		
		me.ringThickness = function(value) {
			if (value === undefined) {
				return me._ringThickness;
			} else {
				me._ringThickness = value;
				return this;
			}
		};
		// End Part 8 Properties
		
		
		// Part 9 Properties
		//Step 9
		me.enableIndicatorNeedle = function(value) {
			if (value === undefined) {
				return me._enableIndicatorNeedle;
			} else {
				me._enableIndicatorNeedle = value;
				return me;
			}
		};
	
		me.enableIndicatorNeedleTail = function(value) {
			if (value === undefined) {
				return me._enableIndicatorNeedleTail;
			} else {
				me._enableIndicatorNeedleTail = value;
				return me;
			}
		};
	
		me.fillNeedle = function(value) {
			if (value === undefined) {
				return me._fillNeedle;
			} else {
				me._fillNeedle = value;
				return me;
			}
		};
	
		me.needleColorCode = function(value) {
			if (value === undefined) {
				return me._needleColorCode;
			} else {
				me._needleColorCode = value;
				return me;
			}
		};
	
		me.needleWidth = function(value) {
			if (value === undefined) {
				return me._needleWidth;
			} else {
				me._needleWidth = value;
				return me;
			}
		};
	
		me.needleHeadLength = function(value) {
			if (value === undefined) {
				return me._needleHeadLength;
			} else {
				me._needleHeadLength = value;
				return me;
			}
		};
	
		me.needleTailLength = function(value) {
			if (value === undefined) {
				return me._needleTailLength;
			} else {
				me._needleTailLength = value;
				return me;
			}
		};
	
		me.needleLineThickness = function(value) {
			if (value === undefined) {
				return me._needleLineThickness;
			} else {
				me._needleLineThickness = value;
				return me;
			}
		};
	
		me.enableIndicatorNeedleBase = function(value) {
			if (value === undefined) {
				return me._enableIndicatorNeedleBase;
			} else {
				me._enableIndicatorNeedleBase = value;
				return me;
			}
		};
	
		me.fullBasePinRing = function(value) {
			if (value === undefined) {
				return me._fullBasePinRing;
			} else {
				me._fullBasePinRing = value;
				return me;
			}
		};
	
		me.fillNeedlaBasePin = function(value) {
			if (value === undefined) {
				return me._fillNeedlaBasePin;
			} else {
				me._fillNeedlaBasePin = value;
				return me;
			}
		};
	
		me.needleBaseWidth = function(value) {
			if (value === undefined) {
				return me._needleBaseWidth;
			} else {
				me._needleBaseWidth = value;
				return me;
			}
		};
		
		// End Part 9 Properties
		
		
		//Part 10 Properties
		me.animationEnable = function(value) {
			if (value === undefined) {
				return me._animationEnable;
			} else {
				me._animationEnable = value;
				return me;
			}
		};
		me.animationDelay = function(value) {
			if (value === undefined) {
				return me._animationDelay;
			} else {
				me._animationDelay = value;
				return me;
			}
		};
		me.animationDuration = function(value) {
			if (value === undefined) {
				return me._animationDuration;
			} else {
				me._animationDuration = value;
				return me;
			}
		};
		me.animationEase = function(value) {
			if (value === undefined) {
				return me._animationEase;
			} else {
				me._animationEase = value;
				return me;
			}
		};
		me.animationEnableOpacity = function(value) {
			if (value === undefined) {
				return me._animationEnableOpacity;
			} else {
				me._animationEnableOpacity = value;
				return me;
			}
		};
		me.animationDelayOpacity = function(value) {
			if (value === undefined) {
				return me._animationDelayOpacity;
			} else {
				me._animationDelayOpacity = value;
				return me;
			}
		};
		me.animationDurationOpacity = function(value) {
			if (value === undefined) {
				return me._animationDurationOpacity;
			} else {
				me._animationDurationOpacity = value;
				return me;
			}
		};
		//End Part 10 Properties
		
		//Part 11 Properties	
		me.drawMeasureText = function(value) {
			if (value === undefined) {
				return me._drawMeasureText;
			} else {
				me._drawMeasureText = value;
				return me;
			}
		};
		me.measureTextPositionType = function(value) {
			if (value === undefined) {
				return me._measureTextPositionType;
			} else {
				me._measureTextPositionType = value;
				return me;
			}
		};
		me.drawGuideText = function(value) {
			if (value === undefined) {
				return me._drawGuideText;
			} else {
				me._drawGuideText = value;
				return me;
			}
		};
		me.guidePositioning = function(value) {
			if (value === undefined) {
				return me._guidePositioning;
			} else {
				me._guidePositioning = value;
				return me;
			}
		};
		//End Part 11 Properties
		
		
		//Part 12 Properties
		me.measureTextCSSClass = function(value) {
			if (value === undefined) {
				return me._measureTextCSSClass;
			} else {
				me._measureTextCSSClass = value;
				return me;
			}
		};
		me.guideTextCSSClass = function(value) {
			if (value === undefined) {
				return me._guideTextCSSClass;
			} else {
				me._guideTextCSSClass = value;
				return me;
			}
		};
		//End Part 12 Properties
		
		
		//Part 14 Properties
		me.enableTickMarks = function(value) {
			if (value === undefined) {
				return me._enableTickMarks;
			} else {
				me._enableTickMarks = value;
				return me;
			}
		};
		me.tickMarkCount = function(value) {
			if (value === undefined) {
				return me._tickMarkCount;
			} else {
				me._tickMarkCount = value;
				return me;
			}
		};
		me.outsideTickLength = function(value) {
			if (value === undefined) {
				return me._outsideTickLength;
			} else {
				me._outsideTickLength = value;
				return me;
			}
		};
		me.insideTickLength = function(value) {
			if (value === undefined) {
				return me._insideTickLength;
			} else {
				me._insideTickLength = value;
				return me;
			}
		};
		//End Part 14 Properties
		
		
		//Recolors the gauge, using the bottommost valid conditional formatting rule
		//   and defaulting to me._colorCode if no conditions are met. 
		me.recolor = function() {
	
			// Always default to the color defined in the Color property of the properties pane
			//   If no conditional formatting rules are met, then this will be the color that we use.
			var formattingColor = me._colorCode;
			
			if (me._colorArray != undefined){
				var index;
				for (index = 0; index < me._colorArray.length; index++){
					var conditionalFormattingRule = me._colorArray[index];
					if (conditionalFormattingRule.threshold <= me._measureVal){
						formattingColor = conditionalFormattingRule.colorID;
					}
				}
				
				//Only update me._displayedColor (and trigger a redraw) if the color is actually 
				if (formattingColor != me._displayedColor){
					me._displayedColor = formattingColor;
				}
			}
			return this;
		}
		
		
		me.redraw = function() {
			var myDiv = me.$()[0];
			
			//What color should we use?
			me.recolor();
			
			//Make sure that the guide line angles are correct
			me.recalculateGuideRingAngles();
			
			//Prepare the animation settings
			// If me._animationEnable is false, then we'll act as if me._animationDelay and me._animationDuration
			//   are both 0, without actually altering their values.
			var tempAnimationDelay = 0;
			var tempAnimationDuration = 0;
			if (me._animationEnable == true){
				tempAnimationDelay = me._animationDelay;
				tempAnimationDuration = me._animationDuration;
			}
			
			// Clear any existing gauges.  We'll redraw from scratch
			d3.select(myDiv).selectAll("*").remove();  
			var vis = d3.select(myDiv).append("svg:svg").attr("width", "100%").attr("height", "100%");
			var pi = Math.PI;
			
			// Find the larger left/right padding
			var lrPadding = me._paddingLeft + me._paddingRight;
			var tbPadding = me._paddingTop + me._paddingBottom;
			var maxPadding = lrPadding;
			if (maxPadding < tbPadding){
				maxPadding = tbPadding
			}			
			
			//Determine the smallest of the x and y axes.
			var smallAxis = me.$().width();
			if (smallAxis > me.$().height()) {
				smallAxis = me.$().height();
				
			}
			
			me._outerRad = (smallAxis - 2*(maxPadding))/2;
			
			//Don't let the innerRad be greater than outer rad
			if (me._outerRad <= me._innerRad){
				alert("Warning!  The gauge arc can't have a negative radius!  Please decrease the inner radius, or increase the size of the control.  Height & width (including subtraction for padding) must me at least twice as large as Internal Radius!");
			} 
			
			//The offset will determine where the center of the arc shall be
			me._offsetLeft = me._outerRad + me._paddingLeft;
			me._offsetDown = me._outerRad + me._paddingTop;
	
			if (me._enableArc == true){
				var arcDef = d3.svg.arc()
					.innerRadius(me._innerRad)
					.outerRadius(me._outerRad);
		
				var guageArc = vis.append("path")
					.datum({endAngle: me._startAngleDeg * (pi/180), startAngle: me._startAngleDeg * (pi/180)})
				    .style("fill", me._displayedColor)
				    .attr("width", me.$().width()).attr("height", me.$().height()) // Added height and width so arc is visible
				    .attr("transform", "translate(" + me._offsetLeft + "," + me._offsetDown + ")")
				    .attr("d", arcDef)
				    .attr( "fill-opacity", me._gaugeOpacity );
	
			}
			
			//Part 8 - The guide lines
			///////////////////////////////////////////	
			//Lets build a border ring around the gauge
			///////////////////////////////////////////
			if (me._enableGuideRing == true){
				var visRing = d3.select(myDiv).append("svg:svg").attr("width", "100%").attr("height", "100%");
				
				var ringOuterRad = me._outerRad + ( -1 * me._ringThickness);  //Outer ring starts at the outer radius of the inner arc
		
				var ringArcDefinition = d3.svg.arc()
					.innerRadius(me._outerRad)
					.outerRadius(ringOuterRad)
					.startAngle(me._startAngleDeg * (pi/180)) //converting from degs to radians
					.endAngle(me._endAngleDegMax * (pi/180)) //converting from degs to radians
		
				var ringArc = vis
					.append("path")
					.attr("d", ringArcDefinition)
					.attr("fill", me._ringColorCode)
					.attr("transform", "translate(" + me._offsetLeft + "," + me._offsetDown + ")");
			}
			///////////////////////////////////////////
			//Lets build a the start and end lines
			///////////////////////////////////////////
			if (me._enableGuideLines == true){
				var visStartBracket = d3.select(myDiv).append("svg:svg").attr("width", "100%").attr("height", "100%");
				var lineData = [endPoints (me._outerRad, me._startAngleDeg), {x:me._offsetLeft, y:me._offsetDown}, endPoints (me._outerRad, me._endAngleDegMax)];
				var lineFunction = d3.svg.line()
					.x(function(d) { return d.x; })
					.y(function(d) { return d.y; })
					.interpolate("linear");
											
				var borderLines = vis
					.attr("width", me.$().width()).attr("height", me.$().height()) // Added height and width so line is visible
					.append("path")
					.attr("d", lineFunction(lineData))
					.attr("stroke", me._ringColorCode)
					.attr("stroke-width", me._bracketThickness)
					.attr("id","guideline")
					.attr("fill", "none");	
			}
			
			///////////////////////////////////////////
			// Tick marks
			///////////////////////////////////////////
			//Part 14.  Add the tick data
			if (me._enableTickMarks == true){
				var tickData = tickPoints();
				for (i = 0; i < tickData.length; i++) { 
					var tickFunction = d3.svg.line()
						.x(function(d) { return d.x; })
						.y(function(d) { return d.y; })
						.interpolate("linear");
												
					var tickMark = vis
						.append("path")
						.attr("d", tickFunction(tickData[i]))
						.attr("stroke", me._ringColorCode)
						.attr("stroke-width", me._bracketThickness)
						.attr("id","tickmark")
						.attr("fill", "none");	
				}
			}
			
			
			
			
			///////////////////////////////////////////
			//Lets add the indicator needle
			///////////////////////////////////////////
	
			if (me._enableIndicatorNeedle == true){
				var needleWaypointOffset = me._needleWidth/2;
	
				//needleWaypoints is defined with positive y axis being up
				//The initial definition of needleWaypoints is for a full diamond, but if me._enableIndicatorNeedleTail is false, we'll abbreviate to a chevron
				var needleWaypoints = [{x: 0,y: me._needleHeadLength}, {x: needleWaypointOffset,y: 0}, {x: 0,y: (-1*me._needleTailLength)}, {x: (-1*needleWaypointOffset),y: 0}, {x: 0,y: me._needleHeadLength}]
				if (me._enableIndicatorNeedleTail == false){
					if (me._fillNeedle == false){
						//If we have no tail and no fill then there is no need to close the shape.
						//Leave it as an open chevron
						needleWaypoints = [{x: needleWaypointOffset,y: 0}, {x: 0,y: me._needleHeadLength}, {x: (-1*needleWaypointOffset),y: 0}];
					}
					else {
						//There is no tail, but we are filling the needle.
						//In this case, draw it as a triangle
						needleWaypoints = [{x: 0,y: me._needleHeadLength}, {x: needleWaypointOffset,y: 0}, {x: (-1*needleWaypointOffset),y: 0}, {x: 0,y: me._needleHeadLength}]
					}
	
				}
	
				//we need to invert the y-axis and scale the indicator to the gauge.
				//  If Y = 100, then that is 100% of outer radius.  So of Y = 100 and outerRad = 70, then the scaled Y will be 70.
				var needleFunction = d3.svg.line()
					.x(function(d) { return (d.x)*(me._outerRad/100); })
					.y(function(d) { return -1*(d.y)*(me._outerRad/100); })
					.interpolate("linear");
	
				//Draw the needle, either filling it in, or not
				var needleFillColorCode = me._needleColorCode;
				if (me._fillNeedle == false){
					needleFillColorCode = "none";
				}
				
	
				var needle = vis
				.append("g")
					.attr("transform", "translate(" + me._offsetLeft + "," + me._offsetDown + ")")
				.append("path")
					.datum(needleWaypoints)
					.attr("class", "tri")
					.attr("d", needleFunction(needleWaypoints))
					.attr("stroke", me._needleColorCode)
					.attr("stroke-width", me._needleLineThickness)
					.attr("fill", needleFillColorCode)
					.attr("transform", "rotate(" +  me._startAngleDeg + ")");;
	
			}
	
	
			///////////////////////////////////////////
			//Lets add a needle base pin
			///////////////////////////////////////////			
	
	
			if ((me._enableIndicatorNeedleBase == true) && (me._enableIndicatorNeedle == true)){
				// Like the rest of the needle, the size of the pin is defined relative to the main arc, as a % value
				var needleIBasennerRadius = (me._needleBaseWidth/2)*(me._outerRad/100) - (me._needleLineThickness/2); 
				var needleBaseOuterRadius = needleIBasennerRadius + me._needleLineThickness; 
				if (me._fillNeedlaBasePin == true){
					needleIBasennerRadius = 0.0;
				}
				
	
				// The pin will either be a 180 degree arc, or a 360 degree ring; starting from the 9 O'clock position.
				var needleBaseStartAngle = 90.0;
				var needleBaseEndAngle = 270.0;
				if (me._fullBasePinRing == true){
					needleBaseEndAngle = 450.0;
				}
	
				//Don't let the arc have a negative length
				if (needleBaseEndAngle < needleBaseStartAngle){
					needleBaseEndAngle = needleBaseStartAngle;
					alert("End angle of outer ring may not be less than start angle!");
				}
	
				//Transfomation for the Pin Ring
				// We won't apply it just yet
				var nbpTransformedStartAngle = needleBaseStartAngle + me._startAngleDeg;
				var nbpTransformedEndAngle = needleBaseEndAngle + me._startAngleDeg;
				
				var nbTransformedStartAngle = needleBaseStartAngle + me._endAngleDeg;
				var nbTransformedEndAngle = needleBaseEndAngle + me._endAngleDeg;
	
				var pinArcDefinition = d3.svg.arc()
					.innerRadius(needleIBasennerRadius)
					.outerRadius(needleBaseOuterRadius);
	
				var pinArc = vis.append("path")
					.datum({endAngle: nbpTransformedEndAngle * (pi/180), startAngle: nbpTransformedStartAngle * (pi/180)})
					.attr("d", pinArcDefinition)
					.attr("fill", me._needleColorCode)
					.attr("transform", "translate(" + me._offsetLeft + "," + me._offsetDown + ")");	
			}
			
			
			///////////////////////////////////////////
			//Lets add our animations
			///////////////////////////////////////////			
			//This blog post explains using attrTween for arcs: http://bl.ocks.org/mbostock/5100636
			// Function adapted from this example
			// Creates a tween on the specified transition's "d" attribute, transitioning
			// any selected arcs from their current angle to the specified new angle.
			if (me._enableArc == true){
				guageArc.transition()
					.duration(tempAnimationDuration)
					.delay(tempAnimationDelay)
					.ease(me._animationEase)
			      	.attrTween("d", function(d) {
					    var interpolate = d3.interpolate(me._startAngleDeg * (pi/180), me._endAngleDeg * (pi/180));
					    return function(t) {
					    	d.endAngle = interpolate(t);
							return arcDef(d);
						};
					});
			}
	
			//Arcs are in radians, but rotation transformations are in degrees.  Kudos to D3 for consistency
			if (me._enableIndicatorNeedle == true){
				needle.transition()
					.attr("transform", "rotate(" + me._endAngleDeg + ")")
					.duration(tempAnimationDuration)
					.delay(tempAnimationDelay)
					.ease(me._animationEase);
			}
			if ((me._enableIndicatorNeedleBase == true) && (me._enableIndicatorNeedle == true)){
				pinArc.transition()
					.duration(tempAnimationDuration)
					.delay(tempAnimationDelay)
			      	.attrTween("d", function(d) {
					    var interpolateEnd = d3.interpolate(nbpTransformedEndAngle * (pi/180), nbTransformedEndAngle * (pi/180));
					    var interpolateStart = d3.interpolate(nbpTransformedStartAngle * (pi/180), nbTransformedStartAngle * (pi/180));
					    return function(t) {
					    	d.endAngle = interpolateEnd(t);
					    	d.startAngle = interpolateStart(t);
							return pinArcDefinition(d);
						};
					});		
				
			}
			
			//Guide Ring and Lines
			var localFadeDelay = me._animationDelayOpacity;
			var localFadeDuration = me._animationDurationOpacity;
			if (me._animationEnableOpacity == false){
				localFadeDelay = 0;
				localFadeDuration = 0;
			}
			if (me._enableGuideRing == true){
				ringArc.transition()
				.attr( "fill-opacity", 0 )
				.transition()
				.delay( localFadeDelay )
				.duration(localFadeDuration)
	       		.attr( "fill-opacity", me._guideOpacity );
			}
			
			if (me._enableGuideLines == true){
				borderLines.transition()
				.attr( "stroke-opacity", 0 )
				.transition()
				.delay( localFadeDelay )
				.duration(localFadeDuration)
	       		.attr( "stroke-opacity", me._guideOpacity );			
			}
			
			
			//Tickmarks
			var tickMarks = d3.selectAll("#tickmark");
			tickMarks.transition()
				.attr( "stroke-opacity", 0 )
				.transition()
				.delay( localFadeDelay )
				.duration(localFadeDuration)
	       		.attr( "stroke-opacity", me._guideOpacity );
			
			
			
			//////////////////////////////////
			// Callouts
			//////////////////////////////////
			
			var calloutTextStart = "" + me._measureMin;
			var calloutTextEnd = "" + me._measureMax;
			var calloutTextMeasure = "" + me._measureVal;
			if(me._useMeasures == false){
				calloutTextStart = "" + me._startAngleDeg;
				calloutTextEnd = "" + me._endAngleDegMax;
				calloutTextMeasure = "" + me._endAngleDeg;
				
			}
			
			//Measure Text Positioning
			if (me._drawMeasureText == true){
				var measurePosition = {};
				var measureTextPosition = {};
				if (me._measureTextPositionType == "endpoint"){
					measurePosition = endPoints (me._outerRad, me._endAngleDeg);
					measureTextPosition = ["start", "1em"];
					if ((measurePosition.x - me._offsetLeft) < 0){
						measureTextPosition[0] = "end";
					}
					if ((measurePosition.y - me._offsetDown) < 0){
						measureTextPosition[1] = "0em";
					} 
				}
				else{
					// Hack Alert!
					//As of now, MS browsers don"t support the dominant baseline SVG property.  
					//  Using the dy property with a Xem offset is the hackish workaround
					// https://msdn.microsoft.com/en-us/library/gg558060(v=vs.85).aspx
					if (me._measureTextPositionType == "top"){
						measurePosition = endPoints (outerRad, 0);
						measureTextPosition = ["middle", "-.15em"];
						//measureTextPosition = ["middle", "text-before-edge"];
					}
					else if (me._measureTextPositionType == "upperCentral"){
						measurePosition = endPoints (me._outerRad/2, 0);
						measureTextPosition = ["middle", "-.15em"];
						//measureTextPosition = ["middle", "text-before-edge"];
					}
					else if (me._measureTextPositionType == "upperIdeographic"){
						measurePosition = endPoints (1, 0);
						measureTextPosition = ["middle", "-.15em"];
						//measureTextPosition = ["middle", "text-before-edge"];
					}
					else if (me._measureTextPositionType == "lowerIdeographic"){
						measurePosition = endPoints (1, 180);
						measureTextPosition = ["middle", "1.1em"];
						//measureTextPosition = ["middle", "text-after-edge"];
					}
					else if (me._measureTextPositionType == "lowerCentral"){
						measurePosition = endPoints (me._outerRad/2, 180);
						measureTextPosition = ["middle", "1.1em"];
						//measureTextPosition = ["middle", "text-after-edge"];
					}
					else if (me._measureTextPositionType == "bottom"){
						measurePosition = endPoints (me._outerRad, 180);
						measureTextPosition = ["middle", "1.1em"];
						//measureTextPosition = ["middle", "text-after-edge"];
					}
				}	
	
				//http://bl.ocks.org/eweitnauer/7325338
				if (me._measureTextCSSClass == ""){
					//No CSS class applied
					vis.append("text")
						.attr("transform", "translate(" + measurePosition.x+ "," + measurePosition.y+ ")")
						.text(calloutTextMeasure)
						.attr("text-anchor", measureTextPosition[0])
						.attr("dy", measureTextPosition[1]);
				}
				else{
					//me._measureTextCSSClass has a CSS class
					vis.append("text")
						.attr("transform", "translate(" + measurePosition.x+ "," + measurePosition.y+ ")")
						.text(calloutTextMeasure)
						.attr("text-anchor", measureTextPosition[0])
						.attr("class", me._measureTextCSSClass)
						.attr("dy", measureTextPosition[1]);
				}
			}	
	
			//Guide Positioning
			if (me._drawGuideText == true){
				var guidePositionStart = {};
				var guidePositionEnd = {};
				var isMiddleCO = false;
				if (me._guidePositioning == "end"){
					guidePositionStart = endPoints (me._outerRad, me._startAngleDeg);
					guidePositionEnd = endPoints (me._outerRad, me._endAngleDegMax);
				}
				else {
					guidePositionStart = endPoints (me._outerRad/2, me._startAngleDeg);
					guidePositionEnd = endPoints (me._outerRad/2, me._endAngleDegMax);
				}
				var guideTextPositionStart = textPositioning (guidePositionStart.x, guidePositionStart.y, true);
				var guideTextPositionEnd= textPositioning (guidePositionEnd.x, guidePositionEnd.y);
	
				if (me._guideTextCSSClass == ""){
					//Empty CSS Class version
					//Start Text
					vis.append("text")
						.attr("transform", "translate(" + guidePositionStart.x + "," + guidePositionStart.y + ")")
						.text(calloutTextStart)
						.attr("text-anchor", guideTextPositionStart[0])
						//.attr("dominant-baseline", guideTextPositionStart[1]);	
						.attr("dy", guideTextPositionStart[1]);
					//End Text
					vis.append("text")
						.attr("transform", "translate(" + guidePositionEnd.x + "," + guidePositionEnd.y + ")")
						.text(calloutTextEnd)
						.attr("text-anchor", guideTextPositionEnd[0])
						//.attr("dominant-baseline", guideTextPositionEnd[1]);	
						.attr("dy", guideTextPositionEnd[1]);
				}
				else{
					//Start Text
					vis.append("text")
						.attr("transform", "translate(" + guidePositionStart.x + "," + guidePositionStart.y + ")")
						.text(calloutTextStart)
						.attr("text-anchor", guideTextPositionStart[0])
						.attr("class", me._guideTextCSSClass)	
						.attr("dy", guideTextPositionStart[1]);
					//End Text
					vis.append("text")
						.attr("transform", "translate(" + guidePositionEnd.x + "," + guidePositionEnd.y + ")")
						.text(calloutTextEnd)
						.attr("text-anchor", guideTextPositionEnd[0])
						.attr("class", me._guideTextCSSClass)	
						.attr("dy", guideTextPositionEnd[1]);
				}
			}
		};
		
		
		me.init = function() {
			
		};
		
		me.afterUpdate = function() {
			me.redraw();
		}
		
		
		//Getters for the height and width of the component
		me.getWidth = function(){
			return me.$().width();
		};
		
		me.getHeight = function(){
			return me.$().height();
		};
		
		//New with Part 6
		me.recalculateCurrentAngle = function(){
			if (me._useMeasures == true){
				//Firstly, ensure that we can turn in a clockwise manner to get from startAngleDeg to endAngleDegMax
				while (me._endAngleDeg < me._startAngleDeg){
					me._endAngleDegMax = me._endAngleDegMax + 360.0;
				}
				
				var currEnd = 0.0;
				if (me._measureVal > me._measureMax){
					currEnd = me._endAngleDegMax;
				} 
				else if (me._measureVal  < me._measureMin){
					currEnd = me._startAngleDeg;
				} else{
					var measureDelta = me._measureMax - me._measureMin;
					var measureValNormalized = 0.0;
					if (measureDelta >  measureValNormalized){
						var measureValNormalized = me._measureVal / measureDelta;
					}
					currEnd = me._startAngleDeg + (measureValNormalized * (me._endAngleDegMax - me._startAngleDeg))
				}
				
				if (currEnd >  me._endAngleDegMax){
					currEnd = me._endAngleDegMax;
				} 
		
				//Now set me._endAngleDeg
				me._endAngleDeg = currEnd;
			}		
			else {
				//Right now, this gauge is hardcoded to turn in a clockwise manner. 
				//  Ensure that the arc can turn in a clockwise direction to get to the end angles
				while (me._endAngleDeg < me._startAngleDeg){
					me._endAngleDeg = me._endAngleDeg + 360.0;
				}
				
				//Ensure that endAngleDeg falls within the range from startAngleDeg to endAngleDegMax
				while (me._endAngleDeg > me._endAngleDegMax){
					//endAngleDeg not allowed to be greater then endAngleDegMax
					me.endAngleDeg(me._endAngleDegMax);
					//me._endAngleDegMax = me._endAngleDegMax + 360.0;
				}
			}
		};
		
		
		//New with Part 8
	
		me.recalculateGuideRingAngles = function(){
			/*
			//The ring has no max angle or measures, so it is trivial to recalculate.
			//Right now, this gauge is hardcoded to turn in a clockwise manner. 
			//  Ensure that the arc can turn in a clockwise direction to get to the end angles
			while (me._ringEndAngleDeg < me._ringStartAngleDeg){
				me._ringEndAngleDeg = me._ringEndAngleDeg + 360.0;
			}
			*/
		};
		
		
		//Helper function	
		function endPoints (lineLength, lineAngle){
			var pi = Math.PI;
			var endX = me._offsetLeft + (lineLength * Math.sin(lineAngle * (pi/180)));
			var endY = me._offsetDown - (lineLength * Math.cos(lineAngle * (pi/180)));
			return {x:endX, y:endY}
		}
		
		
		//New with part 14
		function tickPoints (){
			var tickInnerRad = me._outerRad - ((me._outerRad/100.0)*me._insideTickLength);
			var tickOuterRad = me._outerRad + ((me._outerRad/100.0)*me._outsideTickLength);
			
			if (me._tickMarkCount < 1){
				// No tickmarks
				return [[]];
			}
			else if (me._tickMarkCount < 2){
				//single tickmark at middle point
				var singTickAngle = ((me._endAngleDegMax - me._startAngleDeg)/2) + me._startAngleDeg;
				var singleInnerEndPoint = endPoints (tickInnerRad, singTickAngle);
				var singleOuterEndPoint = endPoints (tickOuterRad, singTickAngle);
				return [[singleInnerEndPoint, singleOuterEndPoint]]
			}
			else{
				var firstInnerEndPoint = endPoints (tickInnerRad, me._startAngleDeg);
				var firstOuterEndPoint = endPoints (tickOuterRad, me._startAngleDeg);	
				var dataPoints = [[firstInnerEndPoint, firstOuterEndPoint]];
				
				var angleStepSize = (me._endAngleDegMax*1.0 - me._startAngleDeg*1.0)/(me._tickMarkCount - 1);
				var currAngle = me._startAngleDeg*1.0;
				for (i = 1; i < me._tickMarkCount; i++) { 
					currAngle = currAngle + angleStepSize;
					var currInnerEndPoint = endPoints (tickInnerRad, currAngle);
					var currOuterEndPoint = endPoints (tickOuterRad, currAngle);
					dataPoints.push([currInnerEndPoint, currOuterEndPoint]);
				}
				return dataPoints;
			}
		}
		
		
		//New with Part 11
		// Helper function to determine the vertical alignment (called 'dominant-baseline') and horizontal alignment (called ' text-anchor')
		// In essence, this function tries to find a readable position for the text, so that it lies ourside the main arc, no matter the current 
		//  x and y are the absolute positions of the callout, within the component
		//  isMiddleCallout determines whether this is anchored on the middle of a guide line
		//  isStart determines whether or not this the start callout.  this function will try to position the callouts anchoren on the middle
		//		guide line outside of the gauge arc.
		// text-anchor: https://developer.mozilla.org/en/docs/Web/SVG/Attribute/text-anchor
		function textPositioning (x, y, isStart){
			var relativeOffsetX = x - me._offsetLeft;
			var relativeOffsetY = y - me._offsetDown;
	
			if (isStart == undefined){
				isStart = false;
			}
	
			var dominantBaseline = null;
			var textAnchor = null;
			if ((relativeOffsetX >= 0) && (relativeOffsetY >= 0)){
				//Lower Right Quadrant
				// Both middle and enf have a negative dominant baseline
				if (isStart == true){
					textAnchor = "start";
					dominantBaseline = "0em";
				} else {
					textAnchor = "end";
					dominantBaseline = ".8em";
				}
				
			} else if ((relativeOffsetX >= 0) && (relativeOffsetY < 0)){
				//Upper Right Quadrant
				if (isStart == true){
					textAnchor = "end";
					dominantBaseline = "0em";
				} else {
					textAnchor = "start";
					dominantBaseline = ".8em";
				}
			}
			 else if ((relativeOffsetX < 0) && (relativeOffsetY < 0)){
				//Upper Left Quadrant
				if (isStart == true){
					textAnchor = "end";
					dominantBaseline = ".8em";
				} else {
					textAnchor = "start";
					dominantBaseline = "0em";
				}
			} else {
				//Lower Left Quadrant
				if (isStart == true){
					textAnchor = "start";
					dominantBaseline = ".8em";
				} else {
					textAnchor = "end";
					dominantBaseline = "0em";
				}
			}
			
			return [textAnchor, dominantBaseline]
		}
	
	});
});