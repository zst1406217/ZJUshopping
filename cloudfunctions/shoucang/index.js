const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  //console.log("@@@",event.userInfo.openId,event.id)
  var dzrid = event.dzrid
  const db = cloud.database()
  const _ = db.command

  if (dzrid == null || dzrid == undefined || dzrid == "") {
    return
  }
  db.collection("ss").doc(event.id).get().then((res) => {
    var shoucangid = res.data.good_detail.shoucangid
    //var openid=res.data._openid
    //console.log("yc为：",event.yc)
    var yn = shoucangid.indexOf(dzrid)
    if (yn == -1) {
      //没电
      db.collection("ss").doc(event.id).update({
        data: {
          "good_detail.shoucangid": _.push(dzrid),
          "good_detail.shoucangshu": _.inc(1),
        }
      })
      console.log("收藏了")
      return
    } else {
      db.collection("ss").doc(event.id).update({
        data: {
          //这里要移除openid
          "good_detail.shoucangid": _.pull(dzrid.toString()),
          "good_detail.shoucangshu": _.inc(-1)
        }
      })
      console.log("取消了")
      return
    }

  })

}