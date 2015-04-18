(function() {
  var markers = [
    { name: 'Margaret Mitchell House',
      coordinates: [-84.3845, 33.7810], },
    { name: 'Oakland Cemetery',
      coordinates: [-84.3713, 33.7487], },
    { name: 'Smith Family Farm',
      coordinates: [-84.3856, 33.8406] },
    { name: 'Fox Theatre',
      coordinates: [-84.3856, 33.7725] },
    { name: 'Odd Fellows Building',
      coordinates: [-84.3794, 33.7556] },
    { name: 'Variety Playhouse',
      coordinates: [-84.3511, 33.7638] },
    { name: 'Swan House',
      coordinates: [-84.3881, 33.8403] },
    { name: 'Zoo Atlanta',
      coordinates: [-84.3697, 33.7325] },
    { name: 'Turner Field',
      coordinates: [-84.3894, 33.7353] },
    { name: 'Piedmont Park',
      coordinates: [-84.3733, 33.7861], },
    { name: 'Atlanta Contemporary Art Center',
      coordinates: [-84.3915, 33.7621] },
    { name: 'High Museum of Art',
      coordinates: [-84.3852, 33.7905] },
    { name: 'Rhodes Hall',
      coordinates: [-84.3883, 33.7960] },
    { name: 'Westview Cemetery',
      coordinates: [-84.4431, 33.7462] },
    { name: 'Atlanta History Center',
      coordinates: [-84.3857, 33.8428] },
    { name: 'The Tabernacle',
      coordinates: [-84.3914, 33.7587] },
    { name: 'Dekalb History Center',
      coordinates: [-84.29631, 33.77483] }];

  for(var i = 0; i < markers.length; markers[i].id = (i + 1), ++i);

  var svg = d3.select("#map");
  var box = svg.append("g");
  var width = parseInt(svg.style("width"), 10);
  var height = parseInt(svg.style("height"), 10);
  var colors = d3.scale.category20();

  svg.attr('width', width).attr('height', height);

  function expandMarker(d, e) {
    /* resort markers so the currently hovered one is on top */
    box.selectAll('.marker-wrapper').sort(function(a, b) {
      return a.id !== d.id ? d3.ascending(a.id, b.id) : 1000;
    });

    e.select("circle")
      .transition()
      .duration(250)
      .attr('r', 15)
      .style('opacity', 1.0);

    e.select("text")
      .transition()
      .duration(250)
      .attr('dy', 7)
      .style('font-size', 20);
  }

  function collapseMarker(e) {
    e.select("circle")
      .transition()
      .duration(250)
      .attr('r', 6)
      .style('opacity', 0.8);

    e.select("text")
      .transition()
      .duration(250)
      .attr('dy', 3)
      .style('font-size', 10);
  }

  d3.json("atlanta.geojson", function(json) {
    var projection = d3.geo.mercator()
        .scale(1)
        .translate([0, 0]);
    var path = d3.geo.path().projection(projection);

    var b = path.bounds(json),
        s = 0.95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
        t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

    projection
      .scale(s)
      .translate(t);

    var zoom = d3.behavior.zoom().on('zoom', function() {
      box.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
    });

    svg.call(zoom);

    path = d3.geo.path().projection(projection);
    background = box.append('g');

    background.selectAll("path").data(json.features).enter().append("path")
      .attr("d", path)
      .attr('class', function(d){
        return [d.properties.class, d.properties.type].join(' ');
      });

    var groups = box.selectAll('.marker-wrapper').data(markers).enter().append('g')
        .attr('class', 'marker-wrapper')
        .attr('id', function(d) { return 'marker-wrapper-' + d.id; })
        .attr('transform', function(d) {
          var point = projection(d.coordinates);
          return 'translate(' + point[0] + ',' + point[1] + ')';
        })
        .on('mouseover', function(d) {
          expandMarker(d, d3.select(this));
          d3.select("#marker-" + d.id).attr('class','active');
        })
        .on('mouseout', function(d) {
          collapseMarker(d3.select(this));
          d3.select("#marker-" + d.id).attr('class','');
      });

    groups.append('circle')
      .attr('class', 'marker')
      .attr('id', function(d) { return 'map-marker-' + d.id; })
      .style('fill', function(d, i) { return colors(i); })
      .attr('r', 6)

    groups.append('text')
      .attr('dy', 3)
      .attr('text-anchor', 'middle')
      .text(function(d) { return d.id; });

  });

  var list = d3.select("#sidebar").append("ul");
  var li = list.selectAll("li").data(markers).enter().append("li")
      .attr('id', function(d) { return 'marker-' + d.id; });

  li.on('mouseover', function(d) {
    expandMarker(d, d3.select("#marker-wrapper-" + d.id));
  }).on('mouseout', function(d) {
    collapseMarker(d3.select("#marker-wrapper-" + d.id));
  });

  li.append('span')
    .attr('class', 'counter')
    .text(function(d,i) { return d.id; })
    .style('background', function(d, i) { return colors(i); });

  li.append('a')
    .attr('class', 'title')
    .attr('href', '')
    .text(function(d) { return d.name; })
    .on('click', function(d) {
      d3.event.preventDefault();
    });

})();
