export default class SortableList {
  element;

  onPointerDown = (event) => {
  	if (event.which !== 1) {
      return false;
    }

		const item = event.target.closest('.sortable-list__item');
		if(item){
			if(event.target.closest('[data-grab-handle]')){
				event.preventDefault();
				this.dragStart(item, event);
			}

			if(event.target.closest('[data-delete-handle]')){
				event.preventDefault();
				item.remove();
			}
		}
	}

	onPointerMove = (event) => {
  	this.moveAt(event.clientX, event.clientY);
  	this.movePlaceholder(event.clientX, event.clientY);
  	this.scrollIfCloseToWindowEdge(event.clientY);
	}

  onPointerUp = (event) => {
  	this.placeholder.replaceWith(this.dragging);
  	const draggingEndIndex = [...this.element.children].indexOf(this.dragging);
  	
  	this.dragging.classList.remove('sortable-list__item_dragging');
  	this.dragging.style = '';
  	document.removeEventListener('pointermove', this.onPointerMove);
  	document.removeEventListener('pointerup', this.onPointerUp);

  	this.dragging = null;

  	if (draggingEndIndex !== this.draggingStartIndex) {
  		this.element.dispatchEvent(new CustomEvent('sortable-list-reorder', {
        bubbles: true,
        details: {
          from: this.draggingStartIndex,
          to: draggingEndIndex
        }
      }));
    }

  }

  constructor({ items = [] } = {}) {
    this.items = items;

    this.render();
  }

  render() {
  	this.element = document.createElement('ul');
  	this.element.className = 'sortable-list';
  	this.addItems();
    this.initEventListeners();
  }

  addItems(items){
  	for(let item of this.items){
  		item.classList.add('sortable-list__item');
  	}
  	this.element.append(...this.items);
  	
  }

  initEventListeners(){
  	this.element.addEventListener('pointerdown', this.onPointerDown);  	
  }

  moveAt(clientX, clientY) {
  	this.dragging.style.left = clientX - this.shiftX + 'px';
    this.dragging.style.top = clientY - this.shiftY + 'px';
  }  
  
  dragStart(item, {clientX, clientY}){
  	this.shiftX = clientX - item.getBoundingClientRect().x;
  	this.shiftY = clientY - item.getBoundingClientRect().y;
  	
  	this.dragging = item;
  	this.draggingStartIndex = [...this.element.children].indexOf(this.dragging);

  	this.placeholder = document.createElement('div');
  	this.placeholder.className = 'sortable-list__placeholder';
  	this.placeholder.style.width = this.dragging.offsetWidth + 'px';
  	this.placeholder.style.height = this.dragging.offsetHeight + 'px';

  	this.dragging.style.width = this.dragging.offsetWidth + 'px';
    this.dragging.style.height = this.dragging.offsetHeight + 'px';
  	this.dragging.classList.add('sortable-list__item_dragging');
  	this.dragging.after(this.placeholder);	
  	this.moveAt(clientX, clientY);
  	

  	document.addEventListener('pointermove', this.onPointerMove);
  	document.addEventListener('pointerup', this.onPointerUp);
  }  

  movePlaceholder(clientX, clientY){
  	this.dragging.style.display = 'none';  	
  	let elemBelow = document.elementFromPoint(clientX, clientY);  	
  	this.dragging.style.display = '';
  	if(!elemBelow) return;
  	const itemBelow = elemBelow.closest('.sortable-list__item');  	
  	if(itemBelow){
  		const { top, bottom } = itemBelow.getBoundingClientRect();
      const { offsetHeight: height } = itemBelow;
        if (clientY > top && clientY < bottom) {
            if (clientY < top + height / 2) {
              itemBelow.before(this.placeholder);
            } 
            else{
             itemBelow.after(this.placeholder);
            }
        }
  	} 	
  }

  scrollIfCloseToWindowEdge(clientY){
  	const scrollingValue = 10;
    const threshold = 20;

    if (clientY < threshold) {
      window.scrollBy(0, -scrollingValue);
    } else if (clientY > document.documentElement.clientHeight - threshold) {
      window.scrollBy(0, scrollingValue);
    }
  }  

}
