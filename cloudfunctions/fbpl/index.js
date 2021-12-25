const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

/*
消息类型：
1.pinglun
2.huifu
*/
exports.main = async (event, context) => {
  console.log(event.pinglunnr)
  var pinglunnr = event.pinglunnr
  var pd = event.pd
  var liuyan = pinglunnr.liuyan
  var ku = 'ss'
  var id = event.pinglunnr.ssid
  var lzid = event.pinglunnr.lzid
  var plrid = event.pinglunnr.plrid
  const _ = cloud.database().command

  if (liuyan == true) {
    ku = 'tj',
      event.pinglunnr.ywnr = event.pinglunnr.title
  }
  if (pd[1] != "") {
    //这说明是回复评论
    console.log("回复评论：", id, pd)

    return await cloud.database().collection(ku).where({
      "_id": id,
      "good_detail.huifunr.plrid": pd[1],
      "good_detail.huifunr.time": pd[2]
    }).update({
      data: {
        // 添加记录
        'good_detail.huifunr.$.huifushu': _.inc(1),
        'good_detail.huifunr.$.huifu': _.push(event.pinglunnr),
        'good_detail.huifushu': _.inc(1),
      }
    }).then((res) => {
      ////给自己加评论过记录
      var pinglunde = {
        id: event.pinglunnr.ssid,
        time: event.pinglunnr.time,
        nr: event.pinglunnr.ywnr,
        plnr: event.pinglunnr.wbnr,
      }
      ////给别人发送消息(被回复者)
      //额外加个判断是否是留言
      var newmessage = {
        id: event.pinglunnr.ssid + event.pinglunnr.time,
        ssid: event.pinglunnr.ssid,
        type: "huifu",
        time: event.pinglunnr.time,
        //ywnr:event.pinglunnr.ywnr,
        bhfpl: event.pinglunnr.bhfpl,
        plnr: event.pinglunnr.wbnr,
        name: event.pinglunnr.name,
        photo: event.pinglunnr.photo,
        yidu: false
      }
      if (liuyan == true) {
        newmessage.liuyan = true
      } else {
        newmessage.liuyan = false
      }
      //判断是否回复的自己
      if (event.pinglunnr.bhfid != plrid) {
        //不是回复的自己
        cloud.database().collection('users').doc(event.pinglunnr.bhfid).update({
          data: {
            message: _.push(newmessage)
          }
        }).then((res) => {
          //console.log("!!!!",res)
          if (pd[0] != true && liuyan == false) {
            //首次评论家记录
            cloud.database().collection('users').doc(plrid).update({
              data: {
                pinglunde: _.push(pinglunde)
              }
            }).then((res) => {
              console.log("成功")
              //前面重要的做完就在这里进行订阅消息的发送了             
            })
          }
          console.log("开始检测进行回复")

          cloud.database().collection('users').doc(event.pinglunnr.bhfid).get().then((res) => {
            console.log("取到用户数据进行判断在线状态:", res.data.online)
          })
          return true
        }).catch((res) => {
          return false
        })
      }
    })

  } else {
    //这是正常评论说说
    console.log("这是评论说说：", id)
    return await cloud.database().collection(ku).doc(id).update({
      data: {
        // 表示将 done 字段置为 true
        good_detail: {
          "huifunr": _.push(event.pinglunnr),
          "huifushu": _.inc(1)
        }
      }
    }).then((res) => {
      ////给自己加评论过记录
      var pinglunde = {
        id: event.pinglunnr.ssid,
        time: event.pinglunnr.time,
        nr: event.pinglunnr.ywnr,
        plnr: event.pinglunnr.wbnr,
      }
      ////给别人发送消息(帖子主)
      var newmessage = {
        id: event.pinglunnr.ssid + event.pinglunnr.time,
        ssid: event.pinglunnr.ssid,
        type: "pinglun",
        time: event.pinglunnr.time,
        ywnr: event.pinglunnr.ywnr,
        plnr: event.pinglunnr.wbnr,
        name: event.pinglunnr.name,
        photo: event.pinglunnr.photo,
        yidu: false,
      }
      if (liuyan == true) {
        newmessage.liuyan = true
      } else {
        newmessage.liuyan = false
      }
      //给帖子主发消息(自己不是帖子主)
      if (lzid != plrid) {
        console.log("这是给楼主发消息：", lzid)
        cloud.database().collection('users').doc(lzid).update({
          data: {
            message: _.push(newmessage)
          }
        }).then((res) => {
          //console.log("!!!!",res)
          if (pd[0] != true && liuyan == false) {
            cloud.database().collection('users').doc(plrid).update({
              data: {
                pinglunde: _.push(pinglunde)
              }
            }).then((res) => {
              console.log("成功")

            })
          }
          console.log("开始检测进行评论")
          cloud.database().collection('users').doc(lzid).get().then((res) => {
            console.log("取到用户数据进行判断在线状态:", res.data.online)
          })
          return true
        }).catch((res) => {
          return false
        })
      }
    })
  }
}