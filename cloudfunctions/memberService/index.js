// 云函数入口文件
const cloud = require('wx-server-sdk')
process.env.TZ ='Asia/Shanghai'
cloud.init({ env: process.env.Env })
const db = cloud.database()
const _ = db.command
const dateUtils = require('date-utils')


// 云函数入口函数
exports.main = async (event, context) => {
  switch (event.action) {
    case 'addSign': {
      return addSign(event)
    }
    case 'addInt': {
      return addInt(event)
    }
    case 'getSignedDetail': {
      return getSignedDetail(event)
    }
    default: break
  }
}

/**
 * 新增积分
 * @param {} event 
 */
async function addInt(event) {
  try {
    //添加积分
    if (event.info.keyword === "塑料瓶") {
      db.collection('user').where({
        OPENID: event.info.openId
      }).update({
        data: {
          answerIntegral: _.inc(3),
          integral: _.inc(3)
        },
        success: function (res) {
          wx.showToast({
            title: '积分 +3 ',
            icon: 'success',
            duration: 1500
          })
        }
      })
    }else if (event.info.keyword === "易拉罐") {
      db.collection('user').where({
        OPENID: event.info.openId
      }).update({
        data: {
          answerIntegral: _.inc(15),
          integral: _.inc(15)
        },
        success: function (res) {
          wx.showToast({
            title: '积分 +15 ',
            icon: 'success',
            duration: 1500
          })
        }
      })      
    }else if (event.info.keyword === "二手书籍") {
      db.collection('user').where({
        OPENID: event.info.openId
      }).update({
        data: {
          answerIntegral: _.inc(40),
          integral: _.inc(40)
        },
        success: function (res) {
          wx.showToast({
            title: '积分 +40 ',
            icon: 'success',
            duration: 1500
          })
        }
      })      
    }else{
      db.collection('user').where({
        OPENID: event.info.openId
      }).update({
        data: {
          answerIntegral: _.inc(3),
          integral: _.inc(3)
        },
        success: function (res) {
          wx.showToast({
            title: '积分 +3 ',
            icon: 'success',
            duration: 1500
          })
        }
      })         
    }
  return true
}
catch (e) {
  console.error(e)
  return false
}
}

/**
 * 新增签到
 * @param {} event 
 */
async function addSign(event) {

  console.info("addSignTest")
  console.info(event.info.openId)
  console.info(event)

  try {
      //签到添加积分
      db.collection('user').where({
        OPENID: event.info.openId
      }).update({
        data: {
          // answerIntegral: answerIntegral + 10,
          // integral: integral + 10
          answerIntegral: _.inc(10),
          integral: _.inc(10)
        }
      })
    let memberInfos = await db.collection('mini_member').where({
      openId: event.info.openId
      // openId: wxContext.OPENID
    }).get();

    const tasks = []
    let pointCount = 1
    let date = new Date().toFormat("YYYY-MM-DD")
    console.info(memberInfos.data.length)
    if (memberInfos.data.length === 0) {
      let task1 = db.collection('mini_member').add({
        data: {
          openId: event.info.openId,
          totalSignedCount: 1,//累计签到数
          continueSignedCount: 1,//持续签到
          totalPoints: 1,//积分
          lastSignedDate: date,//最后一次签到日期
          modifyTime: new Date().getTime(),
          avatarUrl: event.info.avatarUrl,//头像
          nickName: event.info.nickName,//昵称
          applyStatus: 0//申请状态 0:默认 1:申请中 2:申请通过 3:申请驳回
        }
      })
      tasks.push(task1)
    }
    else {
      let continueSignedCount = 1
      let memberInfo = memberInfos.data[0]
      if (new Date().addDays(-1).toFormat("YYYY-MM-DD") == memberInfo.lastSignedDate) {
        continueSignedCount = memberInfo.continueSignedCount + 1
      }

      pointCount = continueSignedCount
      if (continueSignedCount > 30) {
        pointCount = 30
      }

      let task2 = db.collection('mini_member').doc(memberInfo._id).update({
        data: {
          totalSignedCount: _.inc(1),
          continueSignedCount: continueSignedCount,
          totalPoints: _.inc(pointCount),
          lastSignedDate: date,
          modifyTime: new Date().getTime()
        }
      });
      tasks.push(task2)
    }

    //签到明细
    let date1 = new Date().toFormat("YYYY-M-D").split("-")
    let task3 = db.collection('mini_sign_detail').add({
      data: {
        openId: event.info.openId,
        year: date1[0],
        month: date1[1],
        day: date1[2],
        time: (new Date()).toFormat("YYYY-MM-DD HH24:MI:SS"),
        createTime: new Date().getTime()
      }
    })
    tasks.push(task3)

    await Promise.all(tasks)
    return true
  }
  catch (e) {
    console.error(e)
    return false
  }
}

/**
 * 获取签到明细
 * @param {}  
 */
async function getSignedDetail(event) {

  const wxContext = cloud.getWXContext()
  console.info(event)
  let res = await db.collection('mini_sign_detail')
    .where({
      openId: wxContext.OPENID,
      year: event.year,
      month: event.month
    })
    .limit(100)
    .get()
  return res.data
}