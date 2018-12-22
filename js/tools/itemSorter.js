/*global Listener ListenerProviders  DefaultValues*/
'use strict';
const itemSortOrder = { /*exported itemSortOrder */
  newerFirst: 0,
  olderFirst: 1,
  original: 2
};

class ItemSorter { /*exported ItemSorter */
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._sortOrder = DefaultValues.itemSortOrder;
    Listener.instance.subscribe(ListenerProviders.localStorage, 'itemSortOrder', (v) => { this._setItemSortOrder_sbscrb(v); }, true);
  }

  sort(itemList) {
    if (!itemList) { return itemList; }
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

  _setItemSortOrder_sbscrb(value){
    this._sortOrder = value;
  }

}
