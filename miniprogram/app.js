//app.js
import * as db from './utils/db.js';
import * as util from './utils/util.js';
let userInfo = db.get("userInfo") || {}
let isLogin = JSON.stringify(userInfo) != "{}"

App({
  onLaunch: function() {

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env:"magic-7g6favc279535843",
        traceUser: true,
      })
    }
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate(function(res) {
      // console.log(res.hasUpdate)
      if (res.hasUpdate) { 
        updateManager.onUpdateReady(function() {
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用？',
            success: function(res) {
              if (res.confirm) {
                updateManager.applyUpdate()
              }
            }
          })
        })
      }
    })
    updateManager.onUpdateFailed(function() {
      // 新版本下载失败
    })

  },
  $db: db,
  $util: util,
  globalData: {
    userInfo: userInfo,
    isLogin: isLogin
  }
})