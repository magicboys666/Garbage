// pages/my/my.js
let app = getApp()
Page({
  data: {
    isLogin: app.globalData.isLogin,
    userInfo: app.globalData.userInfo,
    showCodeImg: false
  },
  onLoad() {
    this.setData({
      isLogin: app.globalData.isLogin,
      userInfo: app.globalData.userInfo,
      nickName: this.data.userInfo && this.data.userInfo.nickName
    })
    if((!wx.getUserProfile&&!this.data.isLogin)){
      wx.showModal({
        title: '警告',
        content: '微信官方提供新的登录API，如果要获取用户信息，请调节基础库到2.10.4以上!!',
        showCancel: false,
        confirmText: '返回授权',
        success: function (res) {}
      });
    }
  },
  onShow() {
    if (this.data.isLogin) {
      wx.cloud.callFunction({
        name: "db",
        data: {
          $url: "getUserInfo"
        }
      }).then(res => {
        if (res.result.code) {
          app.$db.set('userInfo', res.result.userInfo)
          this.setData({
            userInfo: res.result.userInfo,
            nickName: res.result.userInfo.nickName
          })
          app.globalData.userInfo = res.result.userInfo
        }
      })
    }
  },
  wxGetUserInfo(e) {
    var that = this;
    wx[wx.getUserProfile ? 'getUserProfile' : 'getUserInfo']({
      desc: '用于完善会员资料',
      success: (e) => {
        if (e.userInfo) {
          let userInfo = e.userInfo
          wx.showLoading({
            title: '登录中',
          })
          wx.cloud.callFunction({
            name: "db",
            data: {
              $url: "login",
              userInfo: {
                nickName: userInfo.nickName,
                gender: userInfo.gender,
                avatarUrl: userInfo.avatarUrl
              }
            }
          }).then(res => {
            console.log(res.result)
            console.log(res)
            if (res.result.code) {
              app.$db.set('userInfo', res.result.userInfo)
              this.setData({
                userInfo: res.result.userInfo,
                nickName: res.result.userInfo.nickName
              })
              app.globalData.userInfo = res.result.userInfo
              app.globalData.isLogin = true
              wx.hideLoading({})
              wx.showToast({
                title: '登录成功',
                icon: 'success',
                duration: 1500
              })
              app.$util.reLaunch("/pages/my/my")
              that.setData({
                isLogin: true
              });
            }
          })
        } else {
          wx.showModal({
            title: '警告',
            content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
            showCancel: false,
            confirmText: '返回授权',
            success: function (res) {
              if (res.confirm) {
              }
            }
          });
        }
      },
      fail: (err) => {
        wx.showModal({
          title: '警告',
          content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
          showCancel: false,
          confirmText: '返回授权',
          success: function (res) {
            if (res.confirm) {
            }
          }
        });
      }
    })

  },

  goIntegral() {
    wx.navigateTo({
      url: '/pages/integral/integral',
    })
  },

  delCache() {
    let that = this
    wx.showModal({
      title: '提示',
      content: '是否确定清空缓存？',
      success(res) {
        if (res.confirm) {
          app.$db.clear()
          app.globalData.userInfo = {}
          app.globalData.isLogin = false
          that.setData({
            isLogin: app.globalData.isLogin,
            userInfo: app.globalData.userInfo
          })
          // console.error(app.globalData);
          app.$util.successToShow("清除缓存成功", () => {
            app.$util.reLaunch("/pages/my/my")
          })
        }
      }
    })
  },
  async goShare() {
    wx.showLoading({
      title: '生成中',
    })
    let codeUrl = await this.onPreview()
    this.setData({
      codeUrl
    })
    this.createNewImg()
  },
  createNewImg: function () {
    let that = this
    let {
      codeUrl
    } = this.data
    console.log(codeUrl);
    let title = "垃圾分类";
    let custom_excerpt = "小程序使用了云开发，包含文字识别垃圾类型和图片识别类型。";

    var context = wx.createCanvasContext('mycanvas');
    context.setFillStyle('#ffffff'); //设置填充色
    context.fillRect(0, 0, 500, 500); //填充一个矩形。用 setFillStyle 设置矩形的填充色
    context.drawImage(codeUrl, 78, 150, 190, 190); //绘制二维码
    context.setFillStyle("#000000");
    context.setFontSize(12); //设置字体大小
    context.setTextAlign('center'); //设置字体对齐
    context.fillText("阅读文章,请长按识别二维码", 172, 360);
    context.setFillStyle("#000000");
    context.beginPath() //分割线
    context.stroke();
    context.setTextAlign('left');
    context.setFontSize(30);

    context.fillText(title, 100, 60);
    context.setFontSize(15);

    if (custom_excerpt.lengh <= 22) {
      context.fillText(custom_excerpt, 8, 120);
    } else {
      context.fillText(custom_excerpt.substring(0, 21), 20, 90);
      context.setTextAlign('left');
      context.fillText(custom_excerpt.substring(21, 42) + '...', 6, 120);
    }
    context.draw();

    setTimeout(() => {
      wx.canvasToTempFilePath({
        canvasId: 'mycanvas',
        success: function (res) {
          wx.hideLoading()
          that.setData({
            showCodeImg: true,
            shareImagePath: res.tempFilePath
          })
        }
      }, this)
    }, 2000)
  },

  onPreview() {
    return new Promise((resolve, rejects) => {
      wx.cloud.callFunction({
        name: "getQrCode",
        data: {
          page: 'pages/index/index',
          scene: `nickName=${this.data.nickName}`
        }
      }).then(res => {
        let url = res.result.tempFileURL
        wx.getImageInfo({
          src: url,
          success(res) {
            resolve(res.path)
          }
        })
      })
    })
  },

  saveImg() {
    var imagesUrls = this.data.shareImagePath;
    const modal = {
      title: '授权',
      content: '需要您授权使用保存到相册服务',
      confirmText: '设置'
    }
    app.$util.setScope('scope.writePhotosAlbum', modal).then(res => {
      wx.getImageInfo({
        src: imagesUrls,
        success(res) {
          wx.saveImageToPhotosAlbum({
            filePath: res.path,
            success() {
              util.successToShow("保存图片成功")
            }
          })
        }
      })
    })
  },

  hideModal() {
    this.setData({
      showCodeImg: false
    })
  }
})