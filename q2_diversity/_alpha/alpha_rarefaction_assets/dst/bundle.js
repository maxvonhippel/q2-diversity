webpackJsonp([0],[function(t,e,a){"use strict";function r(t){return t&&t.__esModule?t:{default:t}}var n=a(1),i=r(n);(0,i.default)()},function(t,e,a){"use strict";function r(){var t=metrics[0],e=categories[0],a=(0,n.select)("#main"),r=a.insert("div",":first-child").attr("class","viz row"),l=r.append("div").attr("class","col-lg-12"),c=l.append("div").attr("class","controls row"),o=l.append("div").attr("class","plot row"),u=o.append("div").attr("class","col-lg-12"),d=u.append("svg"),f=d.append("g");a.insert("h1",":first-child").text("Alpha Rarefaction"),f.append("g").attr("class","x axis"),f.append("g").attr("class","y axis"),f.append("text").attr("class","x label"),f.append("text").attr("class","y label"),i.state.initialize(t,e,c,d),(0,s.addMetricPicker)(c,metrics,t),categories.length>0&&(0,s.addCategoryPicker)(c,categories,e)}Object.defineProperty(e,"__esModule",{value:!0}),e.default=r;var n=a(2),i=a(3),s=a(6)},,function(t,e,a){"use strict";function r(t){return t&&t.__esModule?t:{default:t}}function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){var a="Sequencing Depth",r=e,n=1/0,i=0,s=1/0,l=0,c=t.columns.indexOf("depth"),o=t.columns.indexOf("min"),u=t.columns.indexOf("max");return t.data.forEach(function(t){var e=t[c];e<n&&(n=e),e>i&&(i=e),t[o]<s&&(s=t[o]),t[u]>l&&(l=t[u])}),{data:t,xAxisLabel:a,yAxisLabel:r,minX:n,maxX:i,minY:s,maxY:l}}function s(t,e,a,r){r.attr("href",t+".csv");var n=d[t];e&&(n=d[t][e]);var s=i(n,t);(0,o.default)(a,s,e)}Object.defineProperty(e,"__esModule",{value:!0}),e.state=void 0;var l=function(){function t(t,e){for(var a=0;a<e.length;a++){var r=e[a];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,a,r){return a&&t(e.prototype,a),r&&t(e,r),e}}();e.default=i;var c=a(4),o=r(c),u=null,f=function(){function t(){return n(this,t),u||(u=this),this.category="",this.metric="",this.svg=null,this.href=null,u}return l(t,[{key:"initialize",value:function(t,e,a,r){var n=a.append("div").attr("class","col-lg-2 form-group downloadCSV");this.href=n.append("a").attr("href","").text("Download CSV"),this.svg=r,this.metric=t,this.category=e,s(t,e,this.svg,this.href)}},{key:"setCategory",value:function(t){this.category=t,s(this.metric,this.category,this.svg,this.href)}},{key:"setMetric",value:function(t){this.metric=t,s(this.metric,this.category,this.svg,this.href)}},{key:"getCategory",value:function(){return this.category}},{key:"getMetric",value:function(){return this.metric}}]),t}();e.state=new f},function(t,e,a){"use strict";function r(t,e,a,r,n){var s=t.select("g"),l=e.data.columns.indexOf("depth"),c=e.data.columns.indexOf("median"),o=e.data.columns.indexOf("sample-id");o===-1&&(o=e.data.columns.indexOf(n));var u=[e.data.data.sort(function(t,e){return t[l]-e[l]})][0],d=new Set(Array.from(u,function(t){return t[o]})),f=(0,i.scaleOrdinal)(i.schemeCategory10).domain(d);s.selectAll("circle").remove(),s.selectAll("dot").data(u).enter().append("circle").attr("cx",function(t){return a(t[l])}).attr("cy",function(t){return r(t[c])}).attr("r",4).style("stroke",function(t){return f(t[o])}).style("fill",function(t){return f(t[o])}),s.selectAll(".legendBox").remove();var p=s.append("rect").attr("width",100).attr("height",300).attr("stroke","lightBlue"),h=p.append("g").attr("class","legend").attr("x",0).attr("y",0).attr("overflow","scroll").attr("height",100).attr("width",410);h.selectAll("g").data(Array.from(d)).enter().append("text").attr("x",25).attr("y",function(t,e){return 25*e+8}).attr("height",15).attr("width",100).style("fill",function(t){return f(t)}).style("overflow","auto").text(function(t){return t})}function n(t,e,a){var n=400,l=1e3,c={top:20,left:70,right:50,bottom:50},o=t.select("g"),u=e.xAxisLabel,d=e.yAxisLabel,f=e.minX,p=e.maxX,h=e.minY,g=e.maxY,m=(0,i.axisBottom)(),v=(0,i.axisLeft)(),x=.03*(p-f);if(Number.isInteger(f)&&Number.isInteger(p)){x=Math.max(Math.round(x),1);var y=Math.max(3,p-f+2*x);m.ticks(Math.min(y,12),"d")}var b=(0,i.scaleLinear)().domain([f-x,p+x]).range([0,l]).nice(),w=(0,i.scaleLinear)().domain([h,g]).range([n,0]).nice();m.scale(b),v.scale(w),o.attr("transform","translate("+c.left+","+c.top+")"),(0,s.setupXLabel)(t,l,n,u,m),(0,s.setupYLabel)(t,n,d,v),r(t,e,b,w,a),t.attr("width",l+c.left+c.right).attr("height",n+c.bottom+c.top)}Object.defineProperty(e,"__esModule",{value:!0}),e.default=n;var i=a(2),s=a(5)},function(t,e){"use strict";function a(t,e,a,r,n){t.select(".x.axis").attr("transform","translate(0,"+a+")").call(n),t.select(".x.label").attr("text-anchor","middle").style("font","12px sans-serif").attr("transform","translate("+e/2+","+(a+40)+")").text(r)}function r(t,e,a,r){t.select(".y.axis").call(r),t.select(".y.label").attr("text-anchor","middle").style("font","12px sans-serif").attr("transform","translate(-50,"+e/2+")rotate(-90)").text(a)}Object.defineProperty(e,"__esModule",{value:!0}),e.setupXLabel=a,e.setupYLabel=r},function(t,e,a){"use strict";function r(t,e,a){var r=t.append("div").attr("class","col-lg-2 form-group metricPicker");return r.append("label").text("Metric"),r.append("select").attr("class","form-control").on("change",function(){var t=e[this.selectedIndex];i.state.setMetric(t)}).selectAll("option").data(e).enter().append("option").attr("value",function(t){return t}).text(function(t){return t}).property("selected",function(t){return t===a}),r}function n(t,e,a){var r=t.append("div").attr("class","col-lg-2 form-group categoryPicker");return r.append("label").text("Category"),r.append("select").attr("class","form-control").on("change",function(){var t=e[this.selectedIndex];i.state.setCategory(t)}).selectAll("option").data(e).enter().append("option").attr("value",function(t){return t}).text(function(t){return t}).property("selected",function(t){return t===a}),r}Object.defineProperty(e,"__esModule",{value:!0}),e.addMetricPicker=r,e.addCategoryPicker=n;var i=a(3)}]);