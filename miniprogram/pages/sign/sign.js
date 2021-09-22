// pages/sign/sign.js
const api = require('../../utils/api.js');
const util = require('../../utils/util.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    total: 0,
    calendarConfig: {
      multi: true, // 是否开启多选,
      theme: 'default', // 日历主题，目前共两款可选择，默认 default 及 elegant，自定义主题在 theme 文件夹扩展
      showLunar: true, // 是否显示农历，此配置会导致 setTodoLabels 中 showLabelAlways 配置失效
      inverse: true, // 单选模式下是否支持取消选中,
      chooseAreaMode: true, // 开启日期范围选择模式，该模式下只可选择时间段
      markToday: '今天', // 当天日期展示不使用默认数字，用特殊文字标记
      defaultDay: false, // 默认选中指定某天；当为 boolean 值 true 时则默认选中当天，非真值则在初始化时不自动选中日期，
      highlightToday: true, // 是否高亮显示当天，区别于选中样式（初始化时当天高亮并不代表已选中当天）
      takeoverTap: true, // 是否完全接管日期点击事件（日期不会选中），配合 onTapDay() 使用
      preventSwipe: true, // 是否禁用日历滑动切换月份
      disablePastDay: true, // 是否禁选当天之前的日期
      disableLaterDay: true, // 是否禁选当天之后的日期
      firstDayOfWeek: 'Sun', // 每周第一天为周一还是周日，默认按周日开始
      onlyShowCurrentMonth: true, // 日历面板是否只显示本月日期
      hideHeadOnWeekMode: false, // 周视图模式是否隐藏日历头部
      showHandlerOnWeekMode: true // 周视图模式是否显示日历头部操作栏，hideHeadOnWeekMode 优先级高于此配置
    },
    showBanner: false,
    showBannerId: "",
    signedDays: 0,//连续签到天数
    continueSignedCount: 0,
    signed: false
  },

  /**
   * 日历组件渲染之后
   * @param {}} e 
   */
  afterCalendarRender: async function (e) {

    let year = util.getYear(new Date())
    let month = util.getMonth(new Date())
    let res = await api.getSignedDetail(app.globalData.openid, year.toString(), month.toString())
    console.info(res)
    let toSet = [];
    let days = [];
    res.result.forEach(function (item) {
      let set = {
        year: item.year,
        month: item.month,
        day: item.day
      }
      toSet.push(set)
      days.push(item.day);
    })

    let date = new Date();
    const day = date.getDate();
    console.log(days);
    console.log(day);
    console.log(days.indexOf(day+'') )
    if(days.indexOf(day+'') !=-1){
      this.setData({
        total: days.length,
        signed: true
      })
    }
    this.calendar.setSelectedDays(toSet);
  },

  /**
   * 切换月份
   * @param {} e 
   */
  whenChangeMonth: async function (e) {
    let year = e.detail.next.year
    let month = e.detail.next.month
    let res = await api.getSignedDetail(app.globalData.openid, year.toString(), month.toString())
    console.info(res)
    let toSet = [];
    res.result.forEach(function (item) {
      let set = {
        year: item.year,
        month: item.month,
        day: item.day
      }
      toSet.push(set)
    })

    this.calendar.setSelectedDays(toSet);
  },

  /**
   * 签到
   * @param {} e 
   */
  bindSignFn: function (e) {

    this.submitSign().then((res) => {
      console.info(res)
    })
  },

  submitSign: async function () {
    let that = this;
    try {
      wx.showLoading({
        title: '加载中...',
      })
      let info = {
        openId: app.globalData.openid
      }
      console.log(info.openId)
      let result = await api.addSign(info)
      console.info(result)
      await that.afterCalendarRender()
      that.setData({
        signedDays: Number(that.data.signedDays) + 1,
        signed: true
      })
      this.onShow()
      // console.log(app.globalData.openid)
      wx.showToast({
        title: '积分 +10 ',
        icon: 'success',
        duration: 1500
      })
      wx.hideLoading()
    }
    catch (err) {
      wx.showToast({
        title: '程序有一点点小异常，操作失败啦',
        icon: 'none',
        duration: 1500
      })
      console.info(err)
      // wx.hideLoading()
    }
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    that.setData({
      signed: false
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    let that = this
    if (!app.globalData.isLogin) {
      wx.showModal({
        title: '提示',
        content: '还未登录，请先登录！',
        showCancel: false,
        success: (res) => {
          if (res.confirm) {
            app.$util.switchTabTo("/pages/my/my")
          }
        }
      })
      this.setData({
        isLogin: false
      })
    }
    const db = wx.cloud.database(); //获取数据库引用
    const mini_memberCollection = db.collection("mini_member"); //获取集合（collection）的引用
    mini_memberCollection.where({
      openId: app.globalData.openid
    }).get().then(res => {
      console.log(res.data)
      that.setData({
        continueSignedCount: res.data[0].continueSignedCount
      })
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})