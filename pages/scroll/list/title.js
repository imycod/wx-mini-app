// pages/scroll/list/title.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    fixTop: '', //区域离顶部的高度
    scrollTop: 0, //滑动条离顶部的距离
    fixHeight: '',
    chartperTopIndex: '',
    // 数据
    movies: [{
        url: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Ffile02.16sucai.com%2Fd%2Ffile%2F2014%2F0827%2Fc0c92bd51bb72e6d12d5b877dce338e8.jpg&refer=http%3A%2F%2Ffile02.16sucai.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1651586406&t=4acd7913e2c83385a997c4ed415a167d'
      },
      {
        url: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg.jj20.com%2Fup%2Fallimg%2Ftp01%2F1ZZQ20QJS6-0-lp.jpg&refer=http%3A%2F%2Fimg.jj20.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1651586406&t=d4e55516df54c8e76d8b12ec24bd42f1'
      },
      {
        url: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg.jj20.com%2Fup%2Fallimg%2F4k%2Fs%2F02%2F2109242332225H9-0-lp.jpg&refer=http%3A%2F%2Fimg.jj20.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1651586406&t=122b5267225afcabb3e7e03b32483214'
      },
      {
        url: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg.jj20.com%2Fup%2Fallimg%2Ftp01%2F1ZZQ214233446-0-lp.jpg&refer=http%3A%2F%2Fimg.jj20.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1651586406&t=3e9c564ae4ef0cf3835aeda81d45692e'
      }
    ]
  },
  getCharptersRectTopIndex(selector) {
    let _this = this;
    return new Promise(function (resolve, reject) {
      let index = -1
      let query = wx.createSelectorQuery().in(_this);
      query.selectAll(selector).boundingClientRect((rects, idx) => {
        console.log(`rects ${idx}`, rects, idx)
        index = rects.greedFindIndex((item, index) => {
          // console.log("item.top < _this.data.fixTop", item.top < (_this.data.fixTop - _this.data.fixHeight));
          if (item.top < _this.data.fixHeight) {
            console.log("index", index);
            return index;
          } else {
            return -1;
          }
        })
        console.log("index greedFindIndex", index);
        resolve(index)
      }).exec();
    });
  },
  // 显示
  onShow: function () {
    let self = this;
    wx.createSelectorQuery().select('.static-news').boundingClientRect(function (rect) {
      console.log(`this.fixTop`, rect.top)
      console.log(`this.height`, rect.height)
      console.log(`this`, rect)
      self.setData({
        fixTop: rect.top,
        fixHeight: rect.height
      })
    }).exec()
  },
  // 高度
  onPageScroll(res) {
    let self = this;
    let top = res.scrollTop;
    self.setData({
      scrollTop: top,
    });
    self.getCharptersRectTopIndex(".charpter").then(res => {
      self.setData({
        chartperTopIndex: res,
      });
    })
  },
})