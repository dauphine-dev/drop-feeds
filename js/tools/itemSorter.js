/*global Listener ListenerProviders  DefaultValues*/
'use strict';
const itemSortOrder = { /*exported itemSortOrder */
  newerFirst: 0,
  olderFirst: 1,
  original: 2
};

class ItemSorter { /*exported ItemSorter */
  static get instance() {
    if (!this._instance) {
      this._instance = new ItemSorter();
    }
    return this._instance;
  }

  constructor() {
    this._sortOrder = DefaultValues.itemSortOrder;
  }

  async init_async() {
    Listener.instance.subscribe(ListenerProviders.localStorage, 'itemSortOrder', ItemSorter._setItemSortOrder_sbscrb, true);
  }

  sort(itemList) {
    switch(this._sortOrder) {
      case itemSortOrder.newerFirst: //0
        itemList.sort((item1, item2) => {
          if (item1.pubDate > item2.pubDate) return -1;
          if (item1.pubDate < item2.pubDate) return 1;
          return 0;
        });
        break;
      case itemSortOrder.olderFirst: //1
        itemList.sort((item1, item2) => {
          if (item1.pubDate > item2.pubDate) return 1;
          if (item1.pubDate < item2.pubDate) return -1;
          return 0;
        });
        break;
      case itemSortOrder.original: //2
        break;
    }
    return itemList;
  }

  static _setItemSortOrder_sbscrb(value){
    ItemSorter.instance._sortOrder = value;
  }

}
