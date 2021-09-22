var app = getApp();

Page({

  data: {
    SHOW_TOP: true,
  },

  onLoad: function(options) {
    var myDate = new Date();
    var isShowed=wx.getStorageSync("tip")
    if(isShowed!=1){
      setTimeout(() => {
        this.setData({
          SHOW_TOP: false
        })
        wx.setStorageSync("tip", 1)
      }, 2 * 1000)
    }else{
      this.setData({
        SHOW_TOP: false
      })
    }
  },

  goSearch: function() {
    wx.navigateTo({
      url: 'search',
    })
  },

  onBindCamera: function() {
    wx.navigateTo({
      url: 'camera/camera',
    })
  },

  onBindSign: function() {
    wx.navigateTo({
      url: '../sign/sign',
    })
  },

  onBindIntegral: function() {
    wx.navigateTo({
      url: '../integral/integral',
    })
  },

  onBindSort: function() {
    wx.switchTab({
      url: '../sort/sort',
    })
  },

  onBindAnswer: function() {
    wx.navigateTo({
      url: '../answer/answer-run/answer-run',
    })
  },

  onBindRank: function() {
    wx.navigateTo({
      url: '../answer/answer-ranking/answer-ranking',
    })
  },

  onBindHistory: function() {
    wx.navigateTo({
      url: '../answer/answer-history/answer-history',
    })
  },

  onBindUnanswer: function() {
    wx.navigateTo({
      url: '../wrongList/wrongList',
    })
  },

  onShow :function() {
    this.onGetOpenid();
  },

  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {

      }
    })
    .then(res => {
      console.log('[云函数] [login]: ', res)
      let openid = res.result.openid;
      app.globalData.openid = openid;
      
    }).catch(err => {
      console.error('[云函数] [login] 调用失败', err)
    })
  },
})