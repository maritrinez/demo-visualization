// Lib imports
import { select, selectAll, pointer } from 'd3-selection';
import { bisector, group } from "d3-array";
import { line, area, curveCardinal } from 'd3-shape';
import { axisBottom, axisLeft } from 'd3-axis';
import { transition } from 'd3-transition';

// Script imports
import { size, margin, colors, options, nice } from './config';




// Constants


export class Evolution {
  constructor () {
    this._selector = undefined;
    this._dataBuilder = undefined;
    this._tooltip = undefined;
  }


  // - - - CUSTOM PARAMETERS - - - //
  selector (_) {
    this._selector = _;
    return this;
  }

  dataBuilder (_) {
    this._dataBuilder = _;
    return this;
  }

  tooltip (_) {
    this._tooltip = _;
    return this;
  }


  // - - - PUBLIC FUNCTIONS - - - //
  init () {
    // !! - - - Variables
    this._data = this._dataBuilder.evolution();
    this._series = this._dataBuilder._evolutionSeries();

    this._xScl = this._dataBuilder._evoXscl();
    this._yScl = this._dataBuilder._evoYscl()[options.measure];
    this._cScl = this._dataBuilder._seriesColor();
    
    this._width = size.w(this._selector);
    this._height = size.h(this._selector).evolution;
    
    // !! - - - Generators
    this._line = line()
          .curve(curveCardinal)
          .x(d => d.x)
          .y(d =>  d.y);

    this._area = area()
    .curve(curveCardinal)
      .x(d => d.x)
      .y1(d => d.y)
      .y0(d => d.y0);

    this._xAxis = axisBottom(this._xScl).tickFormat(nice.times)
    this._yAxis = axisLeft(this._yScl)

    this._bisect = bisector(d => d.timeDate).left;


    // !! - - - Append svg
    this._svg = select(this._selector).selectAll('svg')
      .data([{}]) // tiene que tener un data de un elemento, aprovecho para meter la info para resetear el zoom
      .join('svg')
      .attr('viewBox', [0, 0, this._width, this._height])
      .on('measureChange', event => {
        // el options está ambiado en el buttons interaction
        
        // actualizar el data, scales y axis
        this._data = this._dataBuilder.evolution();
        this._xScl = this._dataBuilder._evoXscl();
        this._yScl = this._dataBuilder._evoYscl()[options.measure];
        this._xAxis = axisBottom(this._xScl).tickFormat(nice.times)
        this._yAxis = axisLeft(this._yScl)

        // re-render evolution
        this.render()

        // update side charts
        this._updateInfo()
      })

    // !! - - - Render
    this.render();
  }

  render() {
    // !! - - - Defs styling
    this._styling();


    // !! - - - Axis

    this._svg.selectAll('g.y.axis')
      .data([{}])
      .join('g')
      .attr('class', 'y axis')
      .attr('transform', `translate(${this._xScl.range()[0]}, ${0})`);
    this._svg.selectAll('g.y.axis')  
      .call(this._yAxis);

    this._svg.selectAll('g.x.axis')
      .data([{}])
      .join('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(${0}, ${this._yScl.range()[0]})`);
    this._svg.selectAll('g.x.axis')  
      .call(this._xAxis);
    
    // !! - - - Chart group
    const chart = this._svg.selectAll('g.chart')
      .data([{}])
      .join('g')
      .attr('class', 'chart');

    // !! - - - Chart area
    chart.selectAll('path.area.actual')
      .data(this._data.filter(d => d[0] == 'actual'))
      .join(
        enter => enter.append('path')
          .attr('d', d => this._area(d[1])),
        update => update
          .call(update => update.transition(this._svg.transition())
            .attr('d', d => this._area(d[1]))
          )
      )
      .attr('class', 'area actual')
      .style('fill', d => d[1][0].color)
      .style('opacity', 0.1);

    // !! - - - Chart lines
    chart.selectAll('path.line')
      .data(this._data)
      .join(
        enter => enter.append('path')
          .attr('d', d => this._line(d[1])),
        update => update
          .call(update => update.transition(this._svg.transition())
            .attr('d', d => this._line(d[1]))
          )
      )
      .attr('class', d => `line ${d[0]}`)
      .style('stroke', d => d[1][0].color);
    
    // !! - - - Chart circles
    
    // !! - - - Add interaction
    this._addInteraction();
  }



  


  // - - - PRIVATE FUNCTIONS - - - //
  
  _addInteraction() {
    // Append an overlay on top for capture the events
    this._svg.selectAll('overlay')
      .data([{}])
      .join('rect')
      .attr('class', 'overlay')
        .attr('x', this._xScl.range()[0])
        .attr('y', this._yScl.range()[1])
        .attr('width', this._xScl.range()[1] - margin.evo.left)
        .attr('height', this._yScl.range()[0])
        .on("mouseover", d => this._mouseover())
        .on("touchstart", d => this._mouseover())
        .on("mouseout", d => this._mouseout())
        .on("mousemove", d => this._mousemove())
        .on("touchmove", d => this._mousemove())
        .on("click", d => this._click());

    // Append a group for the tooltip emlements
    const ttip =  this._svg.selectAll('g.ttip')
      .data(['clicked', 'over'])
      .join('g')
      .attr('class', d => `ttip ${d}`)
      .style('display', d => d == 'over' ? 'none' : null );
    
    // Append a line to indicate where de mouse is
    ttip.selectAll('line')
      .data([this._dataBuilder.evolutionF()])
      .join('line')
        .attr('x1', d => d.get('actual')[0].x)
        .attr('y1', this._yScl.range()[0])
        .attr('x2', d => d.get('actual')[0].x)
        .attr('y2', this._yScl.range()[1])
        .style('stroke', colors.azul)
        .style('stroke-width', 8)
        .style('opacity', 0.2)
        .attr('data-time', options.time);

    // Append circles
    ttip.selectAll('circle')
      .data([...this._dataBuilder.evolutionF()])
      .join('circle')
      .join(
        enter => enter.append('circle')
          .attr('cx', d => d[1][0].x)
          .attr('cy', d => d[1][0].y),
        update => update
          .call(update => update.transition(this._svg.transition())
            .attr('cx', d => d[1][0].x)
            .attr('cy', d => d[1][0].y)
          )
      )
        .attr('class', d => d[0])
        .attr('r', 6)
        .attr('fill', d => this._cScl(d[0]));
  }

  _mouseover() {
    // mostrar los elementos ttip
    this._svg.selectAll('.ttip.over').style('display', null)
  }

  _mouseout() {
    // ocultar los elementos de over
    this._svg.selectAll('.ttip.over').style('display', 'none')

    const clickedTime = this._svg.selectAll('.ttip.clicked').selectAll('line').attr('data-time');
    if (options.time != clickedTime) {
      options.time = clickedTime;
      // update side charts
      this._updateInfo()
    }
  }

  _mousemove() { 
    // capturar la hora
    const bbox = this._svg.node().getBoundingClientRect();
    const x0 = this._xScl.invert(pointer(event,this)[0] - bbox.left),
        i = this._bisect(this._data[0][1], x0, 1),
        t0 = this._data[0][1][i - 1].timeDate,
        t1 = this._data[0][1][i].timeDate,
        fi = x0 - t0.timeDate > t1.timeDate - x0 ? i : (i - 1), 
        t = x0 - t0.timeDate > t1.timeDate - x0 ? t1 : t0,
        ttext = this._data[0][1][fi].time;

     if (options.time != ttext) {
      options.time = ttext;
      options.timeIndex = fi;

      // mover los elementos ttip
      const datum = this._dataBuilder.evolutionF();

      this._svg.selectAll('.ttip.over').selectAll('line')
        .transition()
        .duration(70)
        .attr('x1', datum.get('actual')[0].x)
        .attr('x2', datum.get('actual')[0].x)
        .attr('data-time', options.time);

      this._svg.selectAll('.ttip.over').selectAll('circle')
        .transition()
        .duration(70)
        .attr('cx', d => datum.get(d[0])[0].x)
        .attr('cy', d => datum.get(d[0])[0].y)

      // update side charts
      this._updateInfo()
      
     }
  }

  _click() {
    // por defecto el click está en la primera hora
    // si la hora de click es diferene a la que está almacenada
    const clickedTime = this._svg.selectAll('.ttip.clicked').selectAll('line').attr('data-time');
    if (options.time != clickedTime) {
      // muevo la barra clicked
      const datum = group(this._dataBuilder.timeData().evolution[options.measure], d => d.observed);
      this._svg.selectAll('.ttip.clicked').selectAll('line')
        .attr('data-time', options.time)
        .transition()
        .duration(250)
        .attr('x1', datum.get('actual')[0].x)
        .attr('x2', datum.get('actual')[0].x);
        
      this._svg.selectAll('.ttip.clicked').selectAll('circle')
        .transition()
        .duration(250)
        .attr('cx', d => datum.get(d[0])[0].x)
        .attr('cy', d => datum.get(d[0])[0].y);
    }
  }
  
  _updateInfo() {
    // actualizar los datos del tooltip
    this._tooltip.render();
      
    // actualizar charts
    select('#grade svg').dispatch('updateGrade');
    select('#type svg').dispatch('updateType');
    select('#details').dispatch('updateDetails');
  }

  _styling() {
    const defs = this._svg.selectAll('defs')
      .data([{}])
      .join('defs');
    
    const filter = defs.selectAll('filter')
      .data([{}])
      .join('filter')
        .attr('id', 'shadow')
        .attr('x', '-50%')
        .attr('y', '-50%')
        .attr('width', '250%')
        .attr('height', '250%');

    filter.selectAll('feDropShadow')
      .data([{}])
      .join('feDropShadow')
        .attr('dx', 0)
        .attr('dy', 0)
        .attr('stdDeviation', 2)
        .attr('flood-color', colors.midGrey);
  }
  _privateFunction() {
    // this only will be used in this script
  }
}