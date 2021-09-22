const db = wx.cloud.database()
let app = getApp()
const api = require('../../utils/api.js');

Page({


  data: {
    MAX_LIMIT: 20,
    page: 0,
    dataCount: 0,
    // datas: [],
    datas: "",
    detail: "",
    logo: "",
    isSHow: false,
    keyword:"",
    isHasData:true,
  },


  onLoad: function (options) {
    this.data.keyword = options.keyword
    this.data.dataCount = db.collection('product').count()
    this.onGetData()
  },
  onGetData: function () {
    wx.showLoading({
      title: '加载数据中.....',
    })
    if (this.data.dataCount < this.data.page * this.data.MAX_LIMIT) {
      wx.showToast({
        title: '数据已经加载完',
        icon: "none"
      })
      wx.hideLoading()
      return
    }
    var that = this
    if (this.data.page == 0) {
      // this.data.datas = []
      this.data.datas = ""
    }
    //查询相应info信息
    const db = wx.cloud.database(); //获取数据库引用
    db.collection('distinguish').where({
      type: that.data.keyword
    }).get({
      success: function (res) {
        wx.hideLoading()
        console.log(res.data)
        console.log(res.data[0].info)
        if (res.data.length == 0 && that.data.page==0){
          that.setData({
            isHasData: false
          })
        }else{
          that.data.datas = res.data[0].type
          console.log(that.data.datas)
          console.log(res.data[0].info)
          that.setData({
            datas: that.data.datas,
            detail: res.data[0].info,
            isHasData: true
          })
          that.data.page = that.data.page + 1
        }
      }, fail: res => {
        wx.hideLoading()
        if (that.data.datas.length==0){
          that.setData({
            isHasData: false
          })
        }
        wx.showToast({
          title: '数据加载失败',
          icon: "none"
        })
      }
    })

    // var datas = db.collection('product').skip(this.data.page * this.data.MAX_LIMIT).limit(this.data.MAX_LIMIT).where({
    //   name: db.RegExp({
    //     regexp: that.data.keyword,
    //   })
    // }).get({
    //   success: function (res) {
    //     wx.hideLoading()
        
    //     if (res.data.length == 0 && that.data.page==0){
    //       that.setData({
    //         isHasData: false
    //       })
    //     }else{
    //       for (var i = 0; i < res.data.length; i++) {
    //         that.data.datas.push(res.data[i])
    //       }
    //       that.setData({
    //         datas: that.data.datas,
    //         isHasData: true
    //       })
    //       that.data.page = that.data.page + 1
    //     }
    //   }, fail: res => {
    //     wx.hideLoading()
    //     if (that.data.datas.length==0){
    //       that.setData({
    //         isHasData: false
    //       })
    //     }
    //     wx.showToast({
    //       title: '数据加载失败',
    //       icon: "none"
    //     })
    //   }
    // })
  },
  //积分兑换
  onClick: async function(e) {
    var that = this

    if (that.data.keyword !== undefined && that.data.keyword !== null) {
      // console.log(app.globalData.userInfo.OPENID)
      // console.log(app.globalData.userInfo.answerIntegral)
      // let answerIntegral = app.globalData.userInfo.answerIntegral
      // let integral = app.globalData.userInfo.integral
      // console.log(answerIntegral)
      // const db = wx.cloud.database()
      // const _ = db.command
      // if (that.data.keyword === "塑料瓶") {
      //   //添加积分
      //   db.collection('user').where({
      //     OPENID: app.globalData.userInfo.OPENID
      //   }).update({
      //     data: {
      //       answerIntegral: answerIntegral + 3,
      //       integral: integral + 3
      //     },
      //     success: function (res) {
      //       wx.showToast({
      //         title: '积分 +3 ',
      //         icon: 'success',
      //         duration: 1500
      //       })
      //     }
      //   })
      //   console.log(answerIntegral)
      // }

      let info = {
        openId: app.globalData.openid,
        keyword: that.data.keyword
      }
      console.log(info.openId)
      console.log(info.keyword)
      // let result = await api.addInt(info)
      // console.info(result)
      if (info.keyword === "塑料瓶") {
        let result = await api.addInt(info)
        console.info(result)
        wx.showToast({
          title: '积分 +3 ',
          icon: 'success',
          duration: 1500
        })
      }else if (info.keyword === "易拉罐") {
        let result = await api.addInt(info)
        console.info(result)
        wx.showToast({
          title: '积分 +15 ',
          icon: 'success',
          duration: 1500
        })
      }else if (info.keyword === "二手书籍") {
        let result = await api.addInt(info)
        console.info(result)
        wx.showToast({
          title: '积分 +40 ',
          icon: 'success',
          duration: 1500
        })
      }else{
        let result = await api.addInt(info)
        console.info(result)
        wx.showToast({
          title: '积分 +3 ',
          icon: 'success',
          duration: 1500
        })
      }
    }else{
      return app.$util.errorToShow("兑换失败")
    }
  },

  onItemClick: function (event) {
    var index = event.currentTarget.dataset.index
    console.log(index)
    var data = this.data.datas[index]
    wx.navigateTo({
      url: '/pages/result/gan?sortId=' + data.sortId,
    })
  },
  hideModal: function () {
    this.setData({
      isShow: !this.data.isShow
    })
  },
  onPullDownRefresh: function () {
    this.data.page = 0
    this.onGetData()
  },
  onGoHome:function(){
    wx.switchTab({
      url: '/pages/ai/index',
    })
  },
  commit: function () {
    wx.navigateTo({
      url: '/pages/result/commit?keyword=' + this.data.keyword,
    })
  },
  onReachBottom: function () {
    this.onGetData()
  },

})