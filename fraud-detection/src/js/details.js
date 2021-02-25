// Lib imports
import { select, selectAll } from 'd3-selection';

import { Grid, html } from "gridjs";




export class Details {
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
    this._data = this._dataBuilder.detailsF();
    
    // !! - - - Generators
    this._grid = new Grid({
        columns: this._data.columns,
        data: this._data.data,
        fixedHeader: true,
        sort: true
      });

    // !! - - - Event listener
    select(this._selector)
      .on('updateDetails', event => {        
        // actualizar el data table
        this._data = this._dataBuilder.detailsF();

        this._grid.updateConfig({
          data: this._data.data
        }).forceRender();
      });

    // !! - - - Render
    this.render();
  }

  render() {
    // done with https://gridjs.io/docs/install
    // this._grid.config.data = this._dataBuilder.timeData().details
    // console.log(this._grid.config.data)
    this._grid
      .render(document.getElementById("details"));
  }
}