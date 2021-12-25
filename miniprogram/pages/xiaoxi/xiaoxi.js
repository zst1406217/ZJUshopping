var app = getApp()
var db = wx.cloud.database()
Page({
  data: {
    message: [],
    id: 999,
    animationData: {},
    x: [],
    xx: []
  },
  onLoad() {
    this.donghua()
  },
  //刷新消息页面
  shuaxin() {
    var message = app.message
    var zs = message.length
    var x = []
    for (var i = 0; i < zs; i++) {
      x[i] = 0
    }
    this.setData({
      message: message,
      x: x,
      xx: x
    })
    wx.stopPullDownRefresh({})
  },
  //查看评论的说说
  chakan(e) {
    //要查看的说说的id
    var ssid = e.currentTarget.dataset.ssid
    var id = e.currentTarget.dataset.id
    var liuyan = e.currentTarget.dataset.liuyan
    this.setData({
      id: id
    })
    var message = []
    //删除消息记录
    db.collection("users").doc(app.userInfo._id)
      .get({
        success: (res) => {
          var message_old = res.data.message
          message_old.forEach((data, index, message_old) => {
            if (data.id == id) {
              data.yidu = true
              message.push(data)
            } else {
              message.push(data)
            }
          })
          db.collection("users").doc(app.userInfo._id).update({
            data: {
              message: message
            }
          })
        }
      })
    wx.navigateTo({
      url: "../xiangqing/xiangqing?liuyan=" + liuyan + "&id=" + ssid
    })
  },
  //授权消息推送
  //生命周期函数--监听页面显示
  onShow: function () {
    this.shuaxin()
    this.checkred()
  },
  //动画
  donghua() {
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'linear',
    })
    this.animation = animation
    var next = true
    setInterval(
      function () {
        if (next) {
          animation.translateY(3).step()
          next = false
        } else {
          animation.translateY(-3).step()
          next = true
        }

        this.setData({
          animationData: animation.export()
        })
      }.bind(this), 500
    )
  },
  checkred() {
    var message = app.message
    var id = this.data.id
    var weidu = app.message.length
    if (weidu != 0) {
      for (var i = 0; i < message.length; i++) {
        if (message[i].yidu == true) {
          weidu--
        }
      }
    }
    //有未读
    if (weidu != 0) {
      wx.setTabBarBadge({
        index: 1,
        text: weidu.toString()
      })
    } else {
      wx.removeTabBarBadge({
        index: 1
      })
    }
  },
  //滑动删除
  change(e) {
    var x = e.detail.x
    var xx = this.data.xx
    var index = e.currentTarget.dataset.index
    var zs = this.data.message.length
    if (xx[index] == 0 && x < -37.5) {
      xx[index] = -75
    } else if (xx[index] == -75 && x > -37.5) {
      xx[index] = 0
    }
    for (var i = 0; i < zs; i++) {
      if (i != index) {
        xx[i] = 0
      } else {}
    }
    this.setData({
      xx: xx
    })

  },
  change1(e) {
    var x = this.data.xx
    this.setData({
      x: x
    })
  },
  //删除消息
  delete(e) {

    var index = this.data.message.length - e.currentTarget.dataset.index - 1
    //删除users里的message记录
    //删除消息记录
    var message = this.data.message
    var id = message[index].id
    db.collection("users").doc(app.userInfo._id)
      .update({
        data: {
          message: db.command.pull({
            "id": db.command.eq(id) //这里不知道行不
          })
        }
      }).then((res) => {})

    //把本地改一下

    message.splice(index, 1)
    var zs = message.length
    var x = []
    for (var i = 0; i < zs; i++) {
      x[i] = 0
    }

    this.setData({
      message: message,
      x: x,
      xx: x
    })
  },
  //移动回弹
  huitan() {
    var message = this.data.message
    var zs = message.length
    var x = []
    for (var i = 0; i < zs; i++) {
      x[i] = 0
    }
    this.setData({
      x: x,
      xx: x
    })
  },
  //刷新1
  shuaxin1() {
    wx.showToast({
      title: '刷新了...',
      icon: 'none',
      duration: 500
    })
    this.shuaxin()
  },
  //下拉动作-刷新
  onPullDownRefresh: function () {
    this.shuaxin1()
  },
  //
})