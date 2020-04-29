export default class SortableList {
  element;

  constructor({ items = [] } = {}) {
    this.items = items;

    this.render();
  }

  render() {
  	const wrapper = document.createElement('ul');
  	wrapper.className = 'sortable-list';
  	wrapper.innerHTML = this.getItems(this.items);
    this.element = wrapper;
    this.initEventListeners();
  }

  getItems(items){
  	return items.map(item => `<li class='sortable-list__item'> ${item.outerHTML}</li>`).join('');
  }

  initEventListeners(){
  	this.element.addEventListener('mousedown', this.onMouseDown);  	
  }

  moveAt(pageX, pageY) {
  	console.log('works');
  	//console.log(this.dragging);
  	let shiftX = pageX - this.dragging.getBoundingClientRect().left;
  	let shiftY = pageY - this.dragging.getBoundingClientRect().top;
    this.dragging.style.left = pageX - shiftX + 'px';
    this.dragging.style.top = pageY - shiftY + 'px';
  }

  onMouseDown = (event) => {
  	this.dragging = event.target.closest('.sortable-list__item');
  	this.dragging.classList.add('sortable-list__item_dragging');	
  	//console.log(this.dragging);
		this.dragging.ondragstart = () => false;
  	this.moveAt(event.pageX, event.pageY);
  	document.addEventListener('mousemove', this.onMouseMove);
  	this.element.addEventListener('mouseup', this.onMouseUp);
  	
  }

  onMouseUp = (event) => {
  	document.removeEventListener('mousemove', this.onMouseMove);
  }

  onMouseMove = (event) => {
  	this.moveAt(event.pageX, event.pageY);
  }
}
