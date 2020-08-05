import fetchJson from "./fetch-json.js";

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements = {};
  data = [];
  pageSize = 30;

  onSortClick = event => {
    let {id, order} = this.sorted;
    const clickedColumn = event.target.closest('[data-sortable="true"]');
    id = clickedColumn.dataset.id;
    if(!clickedColumn.dataset.order){
      order = 'asc';
    }
    else order = clickedColumn.dataset.order === 'asc' ? 'desc' : 'asc';

    this.subElements.arrow.remove();
    clickedColumn.append(this.subElements.arrow);

    const allColumns = this.element.querySelectorAll(`.sortable-table__cell[data-id]`);
    
    // Remove sorting arrow from other columns
    allColumns.forEach(column => {
      if(column.dataset.id !== 'images')
      column.dataset.order = '';    
    });    
    clickedColumn.dataset.order = order;

    if(this.isSortLocally){
      this.sortLocally(id, order);
    } 
    else this.sortOnServer(id, order);

    this.sorted = {id, order};
    
  };

  constructor(headersConfig = [], {
    url = '',
    sorted = {
      id: headersConfig.find(item => item.sortable).id,
      order: 'asc'
    },
    isSortLocally = false
  } = {}) {

    this.headersConfig = headersConfig;
    this.url = new URL(url, BACKEND_URL);
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;

    this.render();
  }

  async render() {
    const {id, order} = this.sorted;
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTable();

    const element = wrapper.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);
    
    const data = await this.loadData(id, order);

    this.renderRows(data);

    this.initEventListeners();
  }

  async loadData (id, order) {
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', 0);
    this.url.searchParams.set('_end', this.pageSize);    

    this.element.classList.add('sortable-table_loading');

    const data = await fetchJson(this.url);

    this.element.classList.remove('sortable-table_loading');
    
    return data;
  }

  renderRows(data){

    if(data.length){

      this.element.classList.remove('sortable-table_empty');
      this.data = data;
      this.subElements.body.innerHTML = this.getTableRows(data);
    }
    else{
      this.element.classList.add('sortable-table_empty');
    }
  }


  getTable(){
    return ` 
    <div class="sortable-table">
        ${this.getTableHeader()}
        ${this.getTableBody(this.data)}

      <div data-elem="loading" class="loading-line sortable-table__loading-line"></div>

      <div data-elem="emptyPlaceholder" class="sortable-table__empty-placeholder">
        <div>
          <p>No products satisfies your filter criteria</p>
          <button type="button" class="button-primary-outline">Reset all filters</button>
        </div>
      </div>
    </div>`;
  }

  getTableBody(data){
    return `
      <div data-elem="body" class="sortable-table__body">
        ${this.getTableRows(data)}  
      </div>`
  }

  getTableRows(data){
    return data.map(row => `
      <a href="#" class="sortable-table__row">
        ${this.getTableCell(row).join('')}
      </a>`).join('');
  }

  getTableCell(cell){
    const cells = this.headersConfig.map(({id, template}) => {return {id, template};});

    return cells.map(({id, template}) => {
      if(template) return template(cell[id]);
      else return ` 
        <div class="sortable-table__cell">${cell[id]}</div>`
    })
  }

  getTableHeader(){
    return `<div data-elem="header" class="sortable-table__header sortable-table__row">
            ${this.headersConfig.map(item => this.getHeaderCell(item)).join('')}
            </div>`  
  }

  getHeaderCell({id, title, sortable}){
    const order = this.sorted.id === id ? this.sorted.order : '';
    return `<div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${order}">
                <span>${title}</span>
                  ${this.getHeaderSortingArrow(order)}             
            </div>
          `       
  }
  getHeaderSortingArrow(order){
    return order ? ` 
        <span data-elem="arrow" class="sortable-table__sort-arrow">
            <span class="sort-arrow"></span>
          </span>
      ` : 
     '';
  }

  initEventListeners () {
    this.subElements.header.addEventListener('pointerdown', this.onSortClick);
  }

  sortLocally(id, order){
    const sortedData = this.sortData(id, order);
       
    this.subElements.body.innerHTML = this.getTableRows(sortedData);
  }

  async sortOnServer(id, order){
   const data = await this.loadData(id, order);

    this.renderRows(data);
  }

  sortData (id, order) {
    const arr = [...this.data];
    const column = this.headersConfig.find(item => item.id === id);
    const {sortType, customSorting} = column;
    const direction = order === 'asc' ? 1 : -1;

    return arr.sort((a, b) => {
      switch (sortType) {
        case 'number':
          return direction * (a[id] - b[id]);
        case 'string':
          return direction * a[id].localeCompare(b[id], 'ru');
        case 'custom':
          return direction * customSorting(a, b);
        default:
          return direction * (a[id] - b[id]);
      }
    });
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-elem]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.elem] = subElement;

      return accum;
    }, {});
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}
