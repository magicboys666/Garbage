const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router');
let {
  FormatData
} = require('./util.js');
cloud.init()
let db = cloud.database()
const _ = db.command
const $ = db.command.aggregate
const MAXANSWER = 100
const MAX_LIMIT = 100
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let {
    APPID,
    OPENID
  } = wxContext
  const app = new TcbRouter({
    event
  })

  //添加搜索历史
  app.router('addHot', async (ctx, next) => {
    let {
      hot_text,
    } = event
    let hot = db.collection('hot')
    let {
      total
    } = await hot.where({
      hot_text: hot_text
    }).count()
    if (total) {
      await hot.where({
          hot_text: hot_text
        })
        .update({
          data: {
            hot_num: _.inc(1)
          }
        })
    } else {
      await hot.add({
        data: {
          hot_text: hot_text,
          hot_time: new Date(),
          hot_num: 1
        }
      })
    }

    ctx.body = {
      code: 1,
      msg: "添加成功"
    }
  })

  //获取热点搜索
  app.router('getHot', async (ctx, next) => {
    let hot = db.collection('hot')
    let {
      data
    } = await hot.orderBy('hot_num', 'desc').limit(10).get()
    ctx.body = {
      code: 1,
      data
    }
  })

  //用户登录
  app.router('login', async (ctx, next) => {
    let {
      userInfo
    } = event
    let user = db.collection('user')
    let {
      total
    } = await user.where({
      OPENID: OPENID
    }).count()
    if (total) {
      await user.where({
          OPENID: OPENID
        })
        .update({
          data: userInfo
        })
    } else {
      await user.add({
        data: {
          nickName: userInfo.nickName,
          gender: userInfo.gender,
          avatarUrl: userInfo.avatarUrl,
          OPENID: OPENID,
          integral: 0,
          answerIntegral: 0
        }
      })
    }
    let {
      data
    } = await user.where({
      OPENID: OPENID
    }).get()
    ctx.body = {
      code: 1,
      msg: "添加成功",
      userInfo: data[0]
    }
  })

  //获取个人信息
  app.router('getUserInfo', async (ctx, next) => {
    let user = db.collection('user')
    let {
      data
    } = await user.where({
      OPENID: OPENID
    }).get()
    ctx.body = {
      code: 1,
      userInfo: data[0]
    }
  })

  //获取新闻
  app.router('getCommlist', async (ctx, next) => {
    let {
      page,
      limit
    } = event
    let comm = db.collection('comm')
    let {
      data
    } = await comm.skip((page - 1) * limit)
      .limit(limit).get()
    ctx.body = {
      code: 1,
      data: FormatData(data, {
        date: "date"
      })
    }
  })

  //获取商品
  app.router('getGoodslist', async (ctx, next) => {
    let {
      page,
      limit
    } = event
    let goods = db.collection('goods')
    let {
      data
    } = await goods.skip((page - 1) * limit)
      .limit(limit).get()
    ctx.body = {
      code: 1,
      data: data
    }
  })

  //兑换商品
  app.router('exchange', async (ctx, next) => {
    let {
      _id,
      integral
    } = event
    let exchange = db.collection('exchange')
    let user = db.collection('user')
    await user.where({
      OPENID: OPENID
    }).update({
      data: {
        integral: _.inc(-Number(integral))
      }
    })
    await exchange.add({
      data: {
        OPENID: OPENID,
        goodsId: _id,
        integral: integral
      }
    })
    let {
      data
    } = await user.where({
      OPENID: OPENID
    }).get()
    ctx.body = {
      code: 1,
      userInfo: data[0]
    }
  })

  //获取新闻详情
  app.router("getCommInfo", async (ctx, next) => {
    let {
      commId,
      isLogin
    } = event
    let comm = db.collection('comm')
    let like = db.collection('like')
    let {
      data
    } = await comm.doc(commId).get()
    await comm.where({
      _id: commId
    }).update({
      data: {
        readNum: _.inc(1)
      }
    })
    data.isLike = false
    if (isLogin) {
      let {
        total
      } = await like.where({
        OPENID: OPENID,
        commId: commId
      }).count()
      if (total) {
        data.isLike = true
      } else {
        data.isLike = false
      }
    }
    ctx.body = {
      code: 1,
      data: FormatData(data, {
        date: "date"
      })
    }
  })

  //用户点赞
  app.router("addLike", async (ctx, next) => {
    let {
      commId
    } = event;
    let like = db.collection('like')
    let comm = db.collection('comm')
    let {
      total
    } = await like.where({
      OPENID: OPENID,
      commId: commId
    }).count()
    if (total) {
      await like.where({
        OPENID: OPENID,
        commId: commId
      }).remove()
      await comm.where({
        _id: commId
      }).update({
        data: {
          likeNum: _.inc(-1)
        }
      })
      ctx.body = {
        code: 2,
        data: "取消点赞成功"
      }
    } else {
      await like.add({
        data: {
          commId: commId,
          OPENID: OPENID
        }
      })
      await comm.where({
        _id: commId
      }).update({
        data: {
          likeNum: _.inc(1)
        }
      })
      ctx.body = {
        code: 1,
        data: "点赞成功"
      }
    }
  })

  //获得题目
  app.router('answerList', async (ctx, next) => {
    let answer = db.collection('answer')
    let {
      list
    } = await answer.aggregate()
      .sample({
        size: MAXANSWER
      }).limit(MAXANSWER).end()
    ctx.body = {
      code: 1,
      data: list
    }
  })

  //添加错题
  app.router('wrong', async (ctx, next) => {
    let {
      wrongList,
      integral,
      intervalTime
    } = event
    let wrong = db.collection('wrong')
    let user = db.collection('user')
    let answerHistory = db.collection('answer-history')
    await Promise.all(wrongList.map(item => {

      return new Promise(async (res, rej) => {
        let {
          total
        } = await wrong.where({
          OPENID: OPENID,
          name: item.name,
          check: item.check
        }).count()
        if (!total) {
          await wrong.add({
            data: {
              OPENID: OPENID,
              name: item.name,
              type: item.type,
              check: item.check
            }
          })
        }
        res()
      })
    }))
    /**
     * 添加用户积分
     */
    await user.where({
      OPENID: OPENID
    }).update({
      data: {
        integral: _.inc(Number(integral)),
        answerIntegral: _.inc(Number(integral))
      }
    })
    /**
     * 添加答题记录
     */
    await answerHistory.add({
      data: {
        OPENID: OPENID,
        historyIntervalTime: intervalTime,
        historyDate: new Date(),
        historyFraction: integral,
        historyIntegral: integral
      }
    })
    ctx.body = {
      code: 1
    }
  })

  //获取点赞新闻
  app.router('getCommlistByLike', async (ctx, next) => {
    let {
      page,
      limit
    } = event

    let {
      list
    } = await db.collection('like').aggregate()
      .lookup({
        from: "comm",
        localField: 'commId',
        foreignField: '_id',
        as: 'uapproval'
      }).match({
        OPENID: OPENID
      }).replaceRoot({
        newRoot: $.arrayElemAt(['$uapproval', 0])
      }).skip((page - 1) * limit)
      .limit(limit).end()


    ctx.body = {
      code: 1,
      data: FormatData(list, {
        date: "date"
      })
    }
  })

  //获取错题
  app.router('getwrongList', async (ctx, next) => {
    let wrong = db.collection('wrong')
    let {
      data
    } = await wrong.where({
      OPENID: OPENID
    }).get()
    ctx.body = {
      code: 1,
      data: data
    }
  })

  //添加题目
  app.router('addAnswer', async (ctx, next) => {
    let {
      name,
      type
    } = event
    let answer = db.collection('answer')
    let {
      total
    } = await answer.where({
      name
    }).count()
    if (total) {
      ctx.body = {
        code: 2,
        data: "无法重复添加"
      }
    } else {
      await answer.add({
        data: {
          name,
          type
        }
      })
      ctx.body = {
        code: 1,
        data: "添加成功"
      }
    }
  })

  //添加新闻
  app.router('addComm', async (ctx, next) => {
    let {
      tag,
      imgList,
      title,
      content
    } = event
    let comm = db.collection('comm')
    await comm.add({
      data: {
        tag,
        imgList,
        title,
        content,
        likeNum: 0,
        readNum: 0,
        date: new Date()
      }
    })
    ctx.body = {
      code: 1,
      data: "添加成功"
    }
  })

  //添加商品
  app.router('addGoods', async (ctx, next) => {
    let {
      goodsContent,
      goodsImgList,
      goodsName,
      goodsPrice
    } = event
    let goods = db.collection('goods')
    await goods.add({
      data: {
        goodsContent,
        goodsImgList,
        goodsName,
        goodsPrice
      }
    })
    ctx.body = {
      code: 1,
      data: "添加成功"
    }
  })

  //扫码获取积分
  app.router('scanCode', async (ctx, next) => {
    let {
      integral
    } = event
    let user = db.collection('user')
    /**
     * 添加用户积分
     */
    await user.where({
      OPENID: OPENID
    }).update({
      data: {
        integral: _.inc(Number(integral))
      }
    })
    ctx.body = {
      code: 1
    }
  })

  //添加反馈
  app.router('addFeedback', async (ctx, next) => {
    let {
      content
    } = event
    let feedback = db.collection('feedback')
    await feedback.add({
      data: {
        content,
        isRead: false,
        time: db.serverDate(),
        OPENID
      }
    })
    ctx.body = {
      code: 1,
      data: "添加成功"
    }

  })

  //删除错题
  app.router('delWrongUser', async (ctx, next) => {
    let {
      _id
    } = event
    let wrong = db.collection('wrong')

    await wrong.where({
      _id: _id
    }).remove()

    ctx.body = {
      code: 1,
      msg: "删除成功",
      data: ''
    }

  })

  //获取用户答题积分排名列表
  app.router('getUserAnswerlist', async (ctx, next) => {
    let user = db.collection('user')
    let {
      data
    } = await user.orderBy('answerIntegral', 'desc').limit(MAX_LIMIT).get()
    ctx.body = {
      code: 1,
      data: data
    }
  })

  //获取用户答题积分排名
  app.router('getUseRanking', async (ctx, next) => {
    let user = db.collection('user')
    const countResult = await user.count()
    const total = countResult.total
    const batchTimes = Math.ceil(total / MAX_LIMIT)
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
      const promise = user.orderBy('answerIntegral', 'desc').skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
      tasks.push(promise)
    }

    let allData = (await Promise.all(tasks)).reduce((acc, cur) => {
      return acc.concat(cur.data)
    }, [])
    let userIndex = allData.findIndex(item => item.OPENID == OPENID)
    if (~userIndex) {
      userIndex += 1
    }

    ctx.body = {
      code: 1,
      data: {
        userIndex
      }
    }
  })

  //获取用户答题记录
  app.router('getHistoryList', async (ctx, next) => {
    let answerHistory = db.collection('answer-history')
    let {
      data
    } = await answerHistory.where({
      OPENID: OPENID
    }).orderBy('historyDate', 'desc').get()
    ctx.body = {
      code: 1,
      data: FormatData(data, {
        historyDate: "time"
      })
    }
  })

  /**
   * 后台代码
   */
  //获取用户列表
  app.router('getUserlist', async (ctx, next) => {
    let {
      page,
      limit
    } = event
    let goods = db.collection('user')
    let {
      data
    } = await goods.skip((page - 1) * limit)
      .limit(limit).get()
    ctx.body = {
      code: 1,
      data: data
    }
  })

  //获取新闻列表
  app.router('getCommAdminlist', async (ctx, next) => {
    let {
      page,
      limit
    } = event
    let comm = db.collection('comm')
    let {
      data
    } = await comm.skip((page - 1) * limit)
      .limit(limit).get()
    data.forEach(item => item.img = item.imgList[0] || '')

    ctx.body = {
      code: 1,
      data: FormatData(data, {
        date: "date"
      })
    }
  })

  //删除新闻
  app.router('delCommAdmin', async (ctx, next) => {
    let {
      _id
    } = event
    let comm = db.collection('comm')

    await comm.where({
      _id: _id
    }).remove()

    ctx.body = {
      code: 1,
      msg: "删除成功",
      data: ''
    }
  })

  //获取新闻详情
  app.router("getCommAdminById", async (ctx, next) => {
    let {
      commId
    } = event
    let comm = db.collection('comm')

    let {
      data
    } = await comm.doc(commId).get()

    ctx.body = {
      code: 1,
      data: FormatData(data, {
        date: "date"
      })
    }
  })

  //修改新闻
  app.router('updataCommAdmin', async (ctx, next) => {
    let {
      commId,
      tag,
      imgList,
      title,
      content
    } = event
    let comm = db.collection('comm')

    await comm.where({
      _id: commId
    }).update({
      data: {
        tag,
        imgList,
        title,
        content
      }
    })

    ctx.body = {
      code: 1,
      msg: "修改成功",
      data: ''
    }
  })

  //获取商品列表
  app.router('getGoodsAdminlist', async (ctx, next) => {
    let {
      page,
      limit
    } = event
    let goods = db.collection('goods')
    let {
      data
    } = await goods.skip((page - 1) * limit)
      .limit(limit).get()
    data.forEach(item => item.img = item.goodsImgList[0] || '')
    ctx.body = {
      code: 1,
      msg: "获取成功",
      data: data
    }
  })

  //删除商品
  app.router('delGoodsAdmin', async (ctx, next) => {
    let {
      _id
    } = event
    let goods = db.collection('goods')

    await goods.where({
      _id: _id
    }).remove()

    ctx.body = {
      code: 1,
      msg: "删除成功",
      data: ''
    }
  })

  //修改商品
  app.router('updataGoodsAdmin', async (ctx, next) => {
    let {
      _id,
      goodsContent,
      goodsImgList,
      goodsName,
      goodsPrice
    } = event
    let goods = db.collection('goods')

    await goods.where({
      _id: _id
    }).update({
      data: {
        goodsContent,
        goodsImgList,
        goodsName,
        goodsPrice
      }
    })

    ctx.body = {
      code: 1,
      msg: "修改成功",
      data: ''
    }
  })

  //获取用户反馈未读的数量
  app.router('getUserFeedbackNoreadNum', async (ctx, next) => {
    let feedback = db.collection('feedback')

    let {
      total
    } = await feedback.where({
      isRead: false
    }).count()

    ctx.body = {
      code: 1,
      msg: "获取成功",
      data: total
    }
  })

  //获取用户反馈
  app.router('getFeedbackAdminlist', async (ctx, next) => {
    let {
      page,
      limit
    } = event

    let feedback = db.collection('feedback')

    let {
      list
    } = await feedback.aggregate()
      .lookup({
        from: "user",
        localField: 'OPENID',
        foreignField: 'OPENID',
        as: 'userInfo'
      })
      .unwind('$userInfo')
      .project({
        content: true,
        time: true,
        isRead: true,
        nickName: "$userInfo.nickName",
        avatarUrl: "$userInfo.avatarUrl",
        gender: "$userInfo.gender",
        integral: "$userInfo.integral",
        userId: "$userInfo._id"
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .end()
    console.log(list)
    ctx.body = {
      code: 1,
      data: FormatData(list, {
        time: "date"
      })
    }
  })

  //改变反馈状态
  app.router('updataFeedbackReadAdmin', async (ctx, next) => {
    let {
      _id
    } = event
    let feedback = db.collection('feedback')

    await feedback.where({
      _id: _id
    }).update({
      data: {
        isRead: true
      }
    })

    ctx.body = {
      code: 1,
      msg: "修改成功",
      data: ''
    }
  })
  return app.serve();
}