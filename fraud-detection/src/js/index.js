"use strict";

// Lib imports
// import { max, extent, groups } from 'd3-array';

import { selectAll, select } from 'd3-selection';
import { json } from 'd3-fetch';
import { dispatch } from 'd3-dispatch';
// import textures from 'textures';


// Classes imports
import { DataBuilder } from './dataBuilder';
import { Evolution } from './evolution';
import { Tooltip } from './tooltip';
import { Grade } from './grade';
import { Type } from './type';
import { Details } from './details';


// Script imports
import { selectors, options } from './config';


// import style from '../css/styles.scss';
import '../css/styles.scss';
import "gridjs/dist/theme/mermaid.css";

window.addEventListener('DOMContentLoaded', (event) => {

  json('./data/fraud.json').then(function(myData) {

    // si no hay nada seleccionado se pinta el gráfico de líneas
    // y los gráficos de info los totales (el total para cada type, para cada grade)

    // si hay algo seleccionado, se envía evento, y se 


    // - - - data builder
      // - - - scales
    
    // - - - evolution
    // - - - tooltip
    // - - - grade
    // - - - type
    // - - - details
    
    // - - - buttons interaction

          

    // - - - constructor de datos (incluye escalas)
    const dataBuilder = new DataBuilder().data(myData)
      dataBuilder.init();

    // - - - tooltip
    const tooltip = new Tooltip();
    tooltip
      .selector(selectors.tooltip)
      .dataBuilder(dataBuilder)
      .init();

    // - - - grade stacked
    const grade = new Grade();
    grade
      .selector(selectors.grade)
      .dataBuilder(dataBuilder)
      .init();

    // - - - type donut
    const type = new Type();
    type
      .selector(selectors.type)
      .dataBuilder(dataBuilder)
      .init();

    // - - - details table
    const details = new Details();
    details
      .selector(selectors.details)
      .dataBuilder(dataBuilder)
      .init();


    // - - - evolution
    const evolution = new Evolution();
    evolution
      .selector(selectors.evolution)
      .dataBuilder(dataBuilder)
      .tooltip(tooltip)
      .init();

    


    // - - - buttons interaction

    selectAll(".measure.button").on("click", (event) => {
      event.stopPropagation();
      // toggle selected
      selectAll(".measure.button").classed("buttonSelected", false);
      select(event.target).classed("buttonSelected", true);

      options.measure = select(event.target).attr('id');

      // dispatch event to update evolution chart
      select('#evolution svg').dispatch('measureChange');
    });

  });

  // - - - RESIZE
  // igual con lo del viewport no hace falta :)
  window.addEventListener('resize', () => {
    // visitorsChart.build();
  });
});







