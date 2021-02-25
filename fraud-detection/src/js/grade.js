// Lib imports
import { select, selectAll } from 'd3-selection';
import { axisLeft } from 'd3-axis';

import { legendColor } from "d3-svg-legend"

import { options, nice, size, margin } from './config';




export class Grade {
  constructor () {
    this._selector = undefined;
    this._dataBuilder = undefined;
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


  // - - - PUBLIC FUNCTIONS - - - //
  init() {    
    // !! - - - Variables
    this._data = this._dataBuilder.gradeF();
    
    this._width = size.w(this._selector);
    this._height = size.h(this._selector).grade;

    this._yScl = this._dataBuilder._gradeYscl();
    this._cScl = this._dataBuilder._gradesColor();

    // !! - - - generators
    this._yAxis = axisLeft(this._yScl);

    this._legend = legendColor()
      .shape('circle')
      .orient('horizontal')
      .shapeRadius(6)
      .shapePadding(70)
      .scale(this._cScl);

    
    // !! - - - Append svg
    this._svg = select(this._selector).selectAll('svg')
      .data([{}]) // tiene que tener un data de un elemento, aprovecho para meter la info para resetear el zoom
      .join('svg')
      .attr('viewBox', [0, 0, this._width, this._height])
      .on('updateGrade', event => {
        // este evento se lanza en el mouseover/click
        // también en measure click
        
        // actualizar el data
        this._data = this._dataBuilder.gradeF();

        // renderizar de nuevo
        this.render()
      })

    // !! - - - Render
    this.render();
  }

  render() {
    // based on https://observablehq.com/@d3/stacked-horizontal-bar-chart
    
    // axis
    this._svg.selectAll('g.y.axis')
      .data([{}])
      .join('g')
      .attr('class', 'y axis')
      .attr('transform', `translate(${margin.grade.left}, ${0})`)
      .call(this._yAxis);
    this._svg.selectAll('g.y.axis').selectAll(".domain").remove()


    // rects
    const g = this._svg.selectAll('g.chart')
      .data(this._data)
      .join('g')
      .attr('class', 'chart')
      .attr('fill', d => d.color);

    g.selectAll('rect')
      .data(d => d)
      .join(
        enter => enter.append('rect')
          .attr('x', d => d.x)
          .attr('y', d => d.y)
          .attr('width', d => d.width)
          .attr('height', d => d.height),
        update => update
          .call(update => update.transition(this._svg.transition())
            .attr('x', d => d.x)
            .attr('y', d => d.y)
            .attr('width', d => d.width)
            .attr('height', d => d.height)
          )
      );

    // legend

    // custom labels
    const labels = {}
    this._data.map(d => {
      const figures = d.map(v => {
        const txt = d.key != 'low' ? v.value : `${v.value} (${v.data.observed})`;
        return txt;
      });
      return labels[d.key] = [d.key].concat(figures)
    });

    this._svg.selectAll('g.legend')
      .data([{}])
      .join('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${20}, ${this._height - margin.grade.bottom + 10})`)
      .call(this._legend);
    
    const l = this._svg.selectAll('g.legend').selectAll('.cell')
      .selectAll('.label')
      .data(d => labels[d])
      .join('text')
      .attr('class', (d, i) => i == 0 ? 'main label' : 'figure label')
      .attr('transform', `translate(${-10}, ${0})`)
      .attr('dy', (d, i) => 20 + i * 20)
      .style('text-anchor', 'start')
      .text(d => d)

  }

  // - - - PRIVATE FUNCTIONS - - - //
  // 
  _privateFunction() {
    // this only will be used in this script
  }
}