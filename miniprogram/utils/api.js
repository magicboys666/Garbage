const regeneratorRuntime = require('runtime.js');

const db = wx.cloud.database()
const _ = db.command

/**
 * 新增签到
 */
function addSign(info) {
    return wx.cloud.callFunction({
        name: 'memberService',
        data: {
            action: "addSign",
            info: info
        }
    })
}

/**
 * 新增积分
 */
function addInt(info) {
    return wx.cloud.callFunction({
        name: 'memberService',
        data: {
            action: "addInt",
            info: info
        }
    })
}

/**
 * 签到明细
 */
function getSignedDetail(openId, year,month) {
    return wx.cloud.callFunction({
        name: 'memberService',
        data: {
            action: "getSignedDetail",
            openId: openId,
            year: year,
            month:month
        }
    })
}

module.exports = {
    addSign: addSign,
    getSignedDetail: getSignedDetail,
    addInt: addInt
}