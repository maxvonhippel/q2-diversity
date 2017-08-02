webpackJsonp([0],[function(t,e,r){"use strict";function a(t){return t&&t.__esModule?t:{default:t}}var n=r(1),i=a(n);(0,i.default)()},function(t,e,r){"use strict";function a(){var t=metrics[0],e=categories[0],r=(0,n.select)("#main"),a=r.insert("div",":first-child").attr("class","viz row"),s=a.append("div").attr("class","col-md-8"),o=s.append("div").attr("class","controls row"),c=s.append("div").attr("class","plot row"),u=c.append("div").attr("class","col-md-8"),d=u.append("svg"),f=d.append("g");r.insert("h1",":first-child").text("Alpha Rarefaction"),f.append("g").attr("class","x axis"),f.append("g").attr("class","y axis"),f.append("text").attr("class","x label"),f.append("text").attr("class","y label");var p=a.append("div").attr("class","col-md-4").attr("id","legendContainer").style("height",f.height).style("border","2px solid cyan").style("x","1500px").append("svg").append("g");i.state.initialize(t,e,o,d,p),(0,l.addMetricPicker)(o,metrics,t),categories.length>0&&(0,l.addCategoryPicker)(o,categories,e)}Object.defineProperty(e,"__esModule",{value:!0}),e.default=a;var n=r(2),i=r(3),l=r(6)},,function(t,e,r){"use strict";function a(t){return t&&t.__esModule?t:{default:t}}function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){var r="Sequencing Depth",a=e,n=1/0,i=0,l=1/0,s=0,o=t.columns.indexOf("depth"),c=t.columns.indexOf("min"),u=t.columns.indexOf("max");return t.data.forEach(function(t){var e=t[o];e<n&&(n=e),e>i&&(i=e),t[c]<l&&(l=t[c]),t[u]>s&&(s=t[u])}),{data:t,xAxisLabel:r,yAxisLabel:a,minX:n,maxX:i,minY:l,maxY:s}}function l(t,e,r,a,n){a.attr("href",t+".csv");var l=d[t];e&&(l=d[t][e]);var s=i(l,t);(0,c.default)(r,s,e,n)}Object.defineProperty(e,"__esModule",{value:!0}),e.state=void 0;var s=function(){function t(t,e){for(var r=0;r<e.length;r++){var a=e[r];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(t,a.key,a)}}return function(e,r,a){return r&&t(e.prototype,r),a&&t(e,a),e}}();e.default=i;var o=r(4),c=a(o),u=null,f=function(){function t(){return n(this,t),u||(u=this),this.category="",this.metric="",this.svg=null,this.href=null,this.legend=null,u}return s(t,[{key:"initialize",value:function(t,e,r,a,n){var i=r.append("div").attr("class","col-lg-2 form-group downloadCSV");this.href=i.append("a").attr("href","").text("Download CSV"),this.svg=a,this.metric=t,this.category=e,this.legend=n,l(t,e,this.svg,this.href,this.legend)}},{key:"setCategory",value:function(t){this.category=t,l(this.metric,this.category,this.svg,this.href,this.legend)}},{key:"setMetric",value:function(t){this.metric=t,l(this.metric,this.category,this.svg,this.href,this.legend)}},{key:"getCategory",value:function(){return this.category}},{key:"getMetric",value:function(){return this.metric}}]),t}();e.state=new f},function(t,e,r){"use strict";function a(t,e,r,a,n,s){var o=t.select("g"),c=e.data.columns.indexOf("depth"),u=e.data.columns.indexOf("median"),d=e.data.columns.indexOf("sample-id");d===-1&&(d=e.data.columns.indexOf(n));var f=[e.data.data.sort(function(t,e){return t[c]-e[c]})][0],p=new Set(Array.from(f,function(t){return t[d]})),h=(0,l.scaleOrdinal)(l.schemeCategory10).domain(p);o.selectAll("circle").remove(),o.selectAll("dot").data(f).enter().append("circle").attr("cx",function(t){return r(t[c])}).attr("cy",function(t){return a(t[u])}).attr("r",4).style("stroke",function(t){return h(t[d])}).style("fill",function(t){return h(t[d])}),s.selectAll("text").remove(),s.selectAll("circle").remove(),s.selectAll("rect").remove();var v=!0,m=!1,y=void 0;try{for(var g,x=Array.from(p).entries()[Symbol.iterator]();!(v=(g=x.next()).done);v=!0){var b=i(g.value,2),k=b[0],w=b[1],M=20*k+15,A=h(w);s.append("rect").attr("x",0).attr("y",M).attr("width",15).attr("height",5).style("stroke","darkGrey").style("fill","white"),s.append("circle").attr("cx",30).attr("cy",M).attr("r",5).style("stroke","darkGrey").style("fill",A),s.append("text").attr("y",M).attr("x",40).text(w)}}catch(t){m=!0,y=t}finally{try{!v&&x.return&&x.return()}finally{if(m)throw y}}}function n(t,e,r,n){var i=400,o=1e3,c={top:20,left:70,right:50,bottom:50},u=t.select("g"),d=e.xAxisLabel,f=e.yAxisLabel,p=e.minX,h=e.maxX,v=e.minY,m=e.maxY,y=(0,l.axisBottom)(),g=(0,l.axisLeft)(),x=.03*(h-p);if(Number.isInteger(p)&&Number.isInteger(h)){x=Math.max(Math.round(x),1);var b=Math.max(3,h-p+2*x);y.ticks(Math.min(b,12),"d")}var k=(0,l.scaleLinear)().domain([p-x,h+x]).range([0,o]).nice(),w=(0,l.scaleLinear)().domain([v,m]).range([i,0]).nice();y.scale(k),g.scale(w),u.attr("transform","translate("+c.left+","+c.top+")"),(0,s.setupXLabel)(t,o,i,d,y),(0,s.setupYLabel)(t,i,f,g),a(t,e,k,w,r,n),t.attr("width",o+c.left+c.right).attr("height",i+c.bottom+c.top)}Object.defineProperty(e,"__esModule",{value:!0});var i=function(){function t(t,e){var r=[],a=!0,n=!1,i=void 0;try{for(var l,s=t[Symbol.iterator]();!(a=(l=s.next()).done)&&(r.push(l.value),!e||r.length!==e);a=!0);}catch(t){n=!0,i=t}finally{try{!a&&s.return&&s.return()}finally{if(n)throw i}}return r}return function(e,r){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return t(e,r);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}();e.default=n;var l=r(2),s=r(5)},function(t,e){"use strict";function r(t,e,r,a,n){t.select(".x.axis").attr("transform","translate(0,"+r+")").call(n),t.select(".x.label").attr("text-anchor","middle").style("font","12px sans-serif").attr("transform","translate("+e/2+","+(r+40)+")").text(a)}function a(t,e,r,a){t.select(".y.axis").call(a),t.select(".y.label").attr("text-anchor","middle").style("font","12px sans-serif").attr("transform","translate(-50,"+e/2+")rotate(-90)").text(r)}Object.defineProperty(e,"__esModule",{value:!0}),e.setupXLabel=r,e.setupYLabel=a},function(t,e,r){"use strict";function a(t,e,r){var a=t.append("div").attr("class","col-lg-2 form-group metricPicker");return a.append("label").text("Metric"),a.append("select").attr("class","form-control").on("change",function(){var t=e[this.selectedIndex];i.state.setMetric(t)}).selectAll("option").data(e).enter().append("option").attr("value",function(t){return t}).text(function(t){return t}).property("selected",function(t){return t===r}),a}function n(t,e,r){var a=t.append("div").attr("class","col-lg-2 form-group categoryPicker");return a.append("label").text("Sample Metadata Column"),a.append("select").attr("class","form-control").on("change",function(){var t=e[this.selectedIndex];i.state.setCategory(t)}).selectAll("option").data(e).enter().append("option").attr("value",function(t){return t}).text(function(t){return t}).property("selected",function(t){return t===r}),a}Object.defineProperty(e,"__esModule",{value:!0}),e.addMetricPicker=a,e.addCategoryPicker=n;var i=r(3)}]);