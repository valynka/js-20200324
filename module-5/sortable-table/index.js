export default class SortableTable {
  element;
  subElements = {};
  headersConfig = [];
  data = [];

  constructor(headersConfig, {
    data = [],
    sorted = {
      id: headersConfig.find(item => item.sortable).id,
      order: 'asc'
    }
  } = {}) {
    this.headersConfig = headersConfig;
    this.data = data;
    this.sorted = sorted;

    this.render();
  }

  getHeaderCell({id, title, sortable}){
    return `<div class="sortable-table__cell" data-id="${id}">
                <span>${title}</span>
                  ${this.getHeaderSortingArrow(sortable)}             
            </div>
          `       
  }
  getHeaderSortingArrow(sortable){
    if(sortable){
      return ` 
        <span class="sortable-table__sort-arrow">
            <span class="sort-arrow"></span>
          </span>
      `
    }
    else return '';
  }


  getTableHeader(){
    return `<div data-elem="header" class="sortable-table__header sortable-table__row">
            ${this.headersConfig.map(item => this.getHeaderCell(item)).join('')}
            </div>
    `    
  }

  getTableCell(item){
    return `<div class="sortable-table__cell">${item}</div>`
  }

  getTableRow(item){   
    return `<a href="#" class="sortable-table__row">
              ${this.dataFields.map(({id, template}) => {
                  if(template) return template(item[id]);
                  else return this.getTableCell(item[id]);
              }).join('')}
            </a>
          `
  }

  getTableBody(data){
    this.dataFields = this.headersConfig.map(({id, template}) => {return {id, template};});
      return `<div data-elem="body" class="sortable-table__body">
          ${data.map(item => this.getTableRow(item)).join('')}  
          </div>
    `
  }

  getTable(data){
    return `<div class="sortable-table">
            ${this.getTableHeader()}
            ${this.getTableBody(data)}
            </div>
    `
  }

  getSubElements(element){
    const elements = element.querySelectorAll('[data-elem]');
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.elem] = subElement;
          return accum;
    }, {});
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTable(this.data);
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.initEventListeners();
  }

  getSortConfig = (event) => {
    const clickedColumn = event.target.closest('[data-sortable="true"]');

  }

  initEventListeners () {
    this.subElements.header.addEventListener('click', this.getSortConfig);
  }

  sort (field, order) {
    const sortedData = this.sortData(field, order);
    const allColumns = this.element.querySelectorAll(`.sortable-table__cell[data-id]`);
    const currentColumn = this.element.querySelector(`.sortable-table__cell[data-id="${field}"]`);

    // Remove sorting arrow from other columns
    allColumns.forEach(column => {
      if(column.dataset.id !== 'images')
      column.dataset.order = '';
    });

    currentColumn.dataset.order = order;
    
    this.subElements.body.innerHTML = this.getTableBody(sortedData);
 }

  sortData(field, order){
    const arrData = [...this.data];
    const column = this.headersConfig.find(item => item.id === field);
    const {sortType, customSorting} = column;
    const direction = order === 'asc' ? 1 : -1;

    return arrData.sort((a, b) => {
      switch(sortType){
        case 'number': return direction * (a[field] - b[field]);
        case 'string': return direction * a[field].localeCompare(b[field], 'ru');
        case 'custom': return direction * customSorting(a,b);
        default: return direction * (a[field] - b[field]);
      }
    })    
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}
