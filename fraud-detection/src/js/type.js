// Lib imports
import { select, selectAll } from 'd3-selection';
import { arc } from 'd3-shape';
import { interpolate } from 'd3-interpolate';

import { legendColor } from "d3-svg-legend";

import { options, nice, size, margin } from './config';




export class Type {
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
    this._data = this._dataBuilder.typeF();
  
    this._width = size.w(this._selector);
    this._height = size.h(this._selector).type;
    this._radius = Math.min(this._width - margin.types.left - margin.types.right, this._height - margin.types.top - margin.types.bottom) / 2.1;
    
    this._cScl = this._dataBuilder._typesColor();

    // !! - - - Generators
    this._arc = arc()
      .innerRadius(this._radius * 0.67)
      .outerRadius(this._radius);

    this._legend = legendColor()
      .shape('circle')
      .shapeRadius(6)
      .shapePadding(8)
      .labelWrap(this._width - (this._radius * 2) - margin.types.left - 30)
      .scale(this._cScl);

    // !! - - - Append svg
    this._svg = select(this._selector).selectAll('svg')
      .data([{}]) // tiene que tener un data de un elemento, aprovecho para meter la info para resetear el zoom
      .join('svg')
      .attr('viewBox', [0, 0, this._width, this._height])
      .on('updateType', event => {
        // este evento se lanza en el mouseover/click
        // también en measure click
        
        // actualizar el data
        this._data = this._dataBuilder.typeF();

        // renderizar de nuevo
        this.render()
  
      })

    // !! - - - Render
    this.render();
  }

  render() {
    // based on https://observablehq.com/@d3/donut-chart
    const g = this._svg.selectAll('g.chart')
      .data([{}])
      .join('g')
      .attr('class', 'chart')
      .attr('transform', `translate(${this._radius + margin.types.left}, ${this._radius + margin.types.top})`)
    
    const chart = g.selectAll('path')
      .data(this._data)
      .join(
        enter => enter.append('path')
          .attr('d', this._arc),
        update => update
          .attr('d', this._arc)
      )
      .attr('fill', d => d.color);

    // legend
    // custom labels
    const labels = this._data.map(d => {
      return `${d.data.type} (${d.niceValue})`
    });

    this._legend.labels(labels)
    this._svg.selectAll('g.legend')
      .data([{}])
      .join('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${this._radius * 2 + margin.types.left + 15}, ${margin.types.top + 6})`)
      .call(this._legend);
  }

  // - - - PRIVATE FUNCTIONS - - - //
  // 
  _privateFunction() {
    // this only will be used in this script
  }
}