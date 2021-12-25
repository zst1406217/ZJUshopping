var db = wx.cloud.database()
var app = getApp()
Page({

  data: {
    ID: ""
  },
  onLoad() {
    this.huoqu()
    this.setData({
      ID: app.userInfo._id
    })
  },
  //复制
  fuzhi(e) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.item,
      success(res) {
        console.log("成功")
      }
    })
  },
  //获取
  huoqu() {
    db.collection('system').where({
        '_id': '002'
      })
      .get().then((res) => {
        console.log(res.data[0])
        this.setData({})
      })
  },
  bangzhu() {
    wx.navigateTo({
      url: '../help/help',
    })
  },
  women() {
    wx.navigateTo({
      url: '../women/women',
    })
  }
})