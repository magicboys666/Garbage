let app = getApp()
Page({
  data: {
    userInfo: null,
    goodsList: [],
    page: 1,
    limit: 50,
    isLoad: false
  },
  onLoad() {
    this.setData({
      userInfo: app.globalData.userInfo
    })
    this.getGoodsList()
  },
  getGoodsList() {
    wx.cloud.callFunction({
      name: "db",
      data: {
        $url: "getGoodslist",
        page: this.data.page,
        limit: this.data.limit
      }
    }).then(res => {
      let result = res.result
      if (result.code) {
        if (this.data.goodsList.length > 0) {
          this.data.goodsList.concat(result.data)
        } else {
          this.setData({
            goodsList: result.data
          })
        }
        if (result.data.length < this.data.limit) {
          this.setData({
            isLoad: true
          })
        }
        this.setData({
          page: this.data.page + 1
        })
      }
    })
  },
  toMore() {
    if (!this.data.isLoad) {
      this.getGoodsList()
    }
  },
  exchange(e) {
    wx.showModal({
      title: '提示',
      content: '是否兑换该商品?',
      success: (res) => {
        if (res.confirm) {
          if (this.data.userInfo.integral < e.currentTarget.dataset.integral) {
            return app.$util.errorToShow("积分不足")
            // return wx.showToast({
            //   title: '积分不足',
            //   icon: 'none',
            //   duration: 1000
            // })
          }
          wx.showLoading({
            title: '兑换中...',
          })
          wx.cloud.callFunction({
            name: "db",
            data: {
              $url: "exchange",
              _id: e.currentTarget.dataset.id,
              integral: e.currentTarget.dataset.integral
            }
          }).then((res) => {
            let result = res.result
            if (result.code) {
              this.setData({
                'userInfo.integral': result.userInfo.integral
              })
              app.$db.set('userInfo', this.data.userInfo)
              app.globalData.userInfo = this.data.userInfo
              wx.hideLoading()
            }
          })
        }
      }
    })
  }
})