import { PaginationHelper } from '../utils/paginationHelper.js';

export class PaginatedList {
    constructor(containerId, itemRenderer) {
        this.container = document.getElementById(containerId);
        this.itemRenderer = itemRenderer;
        this.paginationHelper = new PaginationHelper(this.container);
        this.paginationHelper.createItemElement = (item) => this.itemRenderer(item);
    }

    setItems(items) {
        this.paginationHelper.setItems(items);
    }
}