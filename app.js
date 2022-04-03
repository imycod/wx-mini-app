//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null
  }
})

Array.prototype.greedFindIndex = function (callback) {
  let index = -1
  for (let i = this.length; i > 0; i--) {
    const element = this[i - 1];
    // console.log("element",element)
    // console.log("this",this)
    // console.log("callback(element, i - 1)",callback(element, i - 1))
    if (i === 0 && callback(element, i - 1) === -1) {
      index = -1;
      return index;
    }
    if (callback(element, i - 1) !== -1) {
      return callback(element, i - 1)
    }
    if (callback(element, i - 1) === -1 && i !== 0) {
      continue
    }
  }
}