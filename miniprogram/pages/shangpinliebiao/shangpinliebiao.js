var app = getApp()
var db = wx.cloud.database()
var _ = db.command
Page({

  data: {
    shangpin: [{
      nr: "",
      id: "",
      total: "0",
      na_me: ""
    }],
    canshu: 2,
    x: [],
    xx: [],
    good_detail: []
  },

  // 生命周期函数--监听页面加载
  onLoad: function (e) {
    if (e.canshu == "fabude") {
      var shangpin = app.userInfo.shangpin
      var canshu = 1
      // console.log(shangpin)
    }
    if (e.canshu == "pinglunde") {
      var shangpin = []
      var canshu = 2
      // console.log(app.userInfo._id)
      this.setData({
        good_detail: app.globalData.good_detail
      })
      this.data.good_detail.forEach(function (item, index) {
        var shoucangid = item.good_detail.shoucangid
        shoucangid.forEach(function (item1, index1) {
          if (item1 == app.userInfo._id) {
            shangpin.push({
              id: item._id,
              nr: item.good_detail.nr,
              time: item.time,
              na_me: item.good_detail.na_me,
            })
          }
        })
      })
    }
    var zs = shangpin.length
    var x = []
    for (var i = 0; i < zs; i++) {
      x[i] = 0
    }
    this.setData({
      shangpin: shangpin,
      canshu: canshu,
      x: x,
      xx: x
    })
  },
  //删除自己的帖子
  delete(e) {
    var that = this
    wx.showModal({
      title: '提示',
      content: '确认删除此帖？删除后无法恢复！',
      showCancel: true,
      confirmText: '确认删除',
      confirmColor: '#FF4D49',
      cancelText: '取消',
      cancelColor: '#000000',
      success(res) {
        if (res.confirm) {
          var ssid = e.currentTarget.dataset.ssid
          var index = e.currentTarget.dataset.index
          var shangpin = that.data.shangpin
          shangpin.splice(index, 1); //删除指定index记录
          that.setData({
            shangpin: shangpin
          })
          app.userInfo.shangpin = shangpin
          var x = that.data.x
          x[index] = 0
          that.setData({
            x: x
          })
          wx.showToast({
            title: '删除成功',
            icon: "none"
          })
          db.collection('ss').doc(ssid).get().then((res) => {
            var tp = res.data.good_detail.tp
            if (tp.length > 0) {
              wx.cloud.deleteFile({
                fileList: tp
              })
            }
            app.globalData.tzzs -= 1
            db.collection("system").doc("54ad1eea61c5927c00470fa732f72fc2").update({
              data: {
                tzzs: app.globalData.tzzs,
              }
            })
            //上面已经有了tp,直接删原帖子
            if (tp != null && tp != undefined) {
              db.collection('ss').doc(ssid).remove() //删了ss里面的记录
            }
            db.collection('users').where({
              _id: app.userInfo._id
            }).update({
              data: {
                shangpin: _.pull({
                  id: _.eq(ssid)
                })
              }
            })
          })
        } else if (res.cancel) {
          wx.showToast({
            title: '取消删除',
            icon: 'none'
          })
        }
      }
    })
  },
  //删除自己的帖子
  delete1(e) {
    var that = this
    wx.showModal({
      title: '提示',
      content: '确认删除此条记录？',
      showCancel: true,
      confirmText: '确认删除',
      confirmColor: '#FF4D49',
      cancelText: '取消',
      cancelColor: '#000000',
      success(res) {
        if (res.confirm) {
          var ssid = e.currentTarget.dataset.ssid
          var index = e.currentTarget.dataset.index
          var shangpin = that.data.shangpin
          shangpin.splice(index, 1); //删除指定index记录
          that.setData({
            shangpin: shangpin
          })
          app.userInfo.pinglunde = shangpin
          var x = that.data.x
          x[index] = 0
          that.setData({
            x: x
          })
          wx.showToast({
            title: '删除成功',
            icon: "none"
          })

          db.collection('users').where({
            _id: app.userInfo._id
          }).update({
            data: {
              pinglunde: _.pull({
                id: _.eq(ssid)
              })
            }
          })
        } else if (res.cancel) {
          wx.showToast({
            title: '取消删除',
            icon: 'none'
          })
        }
      }
    })

  },
  //生命周期函数--监听页面显示
  onShow: function () {},
  //查看评论的说说
  chakan(ssid) {
    //要查看的说说的id
    //console.log(ssid)
    var ssid = ssid.currentTarget.dataset.ssid
    //console.log(ssid)

    if (this.data.canshu == 2) {
      wx.cloud.callFunction({
        name: "look",
        data: {
          id: ssid
        }
      })
    }
    wx.navigateTo({
      url: "../xiangqing/xiangqing?id=" + ssid + "&fenxiang=false&liuyan=false"
    })
    wx.cloud.callFunction({
      name: "look",
      data: {
        id: ssid,
        type: 'ss'
      }
    })
  },
  //滑动删除
  change(e) {
    var x = e.detail.x
    var xx = this.data.xx
    var index = e.currentTarget.dataset.index
    //console.log("index:",index)
    var zs = this.data.shangpin.length

    if (xx[index] == 0 && x < -37.5) {
      xx[index] = -75
    } else if (xx[index] == -75 && x > -37.5) {
      xx[index] = 0
    }
    for (var i = 0; i < zs; i++) {
      if (i != index) {
        xx[i] = 0
      } else {
      }
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
  }
})