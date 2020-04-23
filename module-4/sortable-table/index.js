export default class SortableTable {
  element;
  subElements = {};
  headersConfig = [];
  data = [];

  constructor(headersConfig, {
    data = []
  } = {}) {
    this.headersConfig = headersConfig;
    this.data = data;

    this.render();
  }

  getHeaderCell({id, title, sortable}){
    return `<div class="sortable-table__cell" data-name="${id}">
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
      accum[subElement.dataset.element] = subElement;
            return accum;
    }, {});
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTable(this.data);
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);
  }

  sort (field, order) {
    const sortedData = this.sortData(field, order);
    const allColumns = this.element.querySelectorAll(`.sortable-table__cell[data-name]`);
    const currentColumn = this.element.querySelector(`.sortable-table__cell[data-name="${field}"]`);

    // Remove sorting arrow from other columns
    allColumns.forEach(column => {
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

    switch(sortType)
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}

