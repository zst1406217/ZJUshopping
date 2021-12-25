// miniprogram / pages / wd / wd.js 我改一下
const app = getApp()
const db = wx.cloud.database()
Page({
  data: {
    userphoto: "/images/user/user.png",
    username: "微信小程序",
    login: "未知",
    shangpin: [],
    message: [],
    fenxiang: "false",
    userInfo1: []
  },
  /*这是用户授权登录向数据库提交 */
  GetUserInfo() {
    // let userInfo = xx.detail.userInfo;
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res.userInfo)
        this.setData({
          userInfo1: res.userInfo,
        })
        if (!this.data.login && this.data.userInfo1) {
          var userInfo = this.data.userInfo1
          wx.showLoading({
            title: '登录中',
          })
          db.collection('users').add({
            data: {
              online: true,
              shangpin: [],
              message: [],
              pinglunde: [],
              userinfo: {
                userphoto: userInfo.avatarUrl,
                username: userInfo.nickName,
                login: true,
              },
            }
          }).then((res) => {
            db.collection('users').doc(res._id).get().then((res) => {
              app.userInfo = Object.assign(app.userInfo, res.data);
              wx.hideLoading()
              this.setData({
                userphoto: app.userInfo.userinfo.userphoto,
                username: app.userInfo.userinfo.username,
                login: true,
                shangpin: app.userInfo.shangpin,
                message: app.userInfo.message,
              })
              wx.showToast({
                title: '登录成功！',
              })
              if (app.fenxiang == "true") {
                app.fenxiang == "false"
                wx.navigateTo({
                  url: "/pages/xiangqing/xiangqing?id=" + app.fxssid + "&fenxiang=false"
                })
              }
            })
          })
        }
      }
    })

  },
  /*未登录下的重试 */
  weidengluchongshi() {
    let logined = app.userInfo.userinfo.login;
    if (logined != true) {
      /*若不是登录状态调用云函数登录*/
      wx.showLoading({
        title: '尝试登录',
      })
      wx.cloud.callFunction({
        name: 'login',
        data: {}
      }).then((res) => {
        db.collection("users").where({
          _openid: app.userInfo._openid
        }).get().then((res) => {
          app.userInfo = Object.assign(app.userInfo, res.data[0]);
          if (app.userInfo.userinfo.login == true) {
            /*如果有登录信息则加载*/
            this.setData({
              userphoto: app.userInfo.userinfo.userphoto,
              username: app.userInfo.userinfo.username,
              login: app.userInfo.userinfo.login,
              shangpin: app.userInfo.shangpin,
              message: app.userInfo.message,
            })
            wx.hideLoading()
            if (app.fenxiang == "true") {
              app.fenxiang == "false"
              wx.navigateTo({
                url: "/pages/xiangqing/xiangqing?id=" + app.fxssid + "&fenxiang=false"
              })
            }
          } else {
            this.setData({
              login: false
            })
            app.userInfo.userinfo = Object.assign(app.userInfo.userinfo, {
              login: false
            })
            /*付给app下的登录状态为false*/
            wx.showToast({
              title: '还未授权登录',
              icon: 'none',
              duration: 2000,
            })
          }
        })
      });
    }
  },
  //查看我的头像
  chakantouxiang() {
    var url = app.userInfo.userinfo.userphoto
    wx.previewImage({
      urls: [url],
    })
  },
  /**生命周期函数--监听页面加载*/
  onLoad: function () {
    this.weidengluchongshi()
  },
  /* 生命周期函数--监听页面显示*/
  onShow: function () {
    var db = wx.cloud.database()
    var _good_detail = []
    for (var i = 0; i < Math.ceil(app.globalData.tzzs / 20); i++) {
      db.collection('ss').field({
        good_detail: true,
        _id: true,
        time: true
      }).skip(i * 20).get({
        success: res => {
          var good_detail = res.data
          for (var j = 0; j < good_detail.length; j++) {
            _good_detail.push(good_detail[j])
          }
        }
      })
    }
    app.globalData.good_detail = _good_detail

    this.checkred()
    this.setData({
      userphoto: app.userInfo.userinfo.userphoto,
      username: app.userInfo.userinfo.username,
      login: app.userInfo.userinfo.login,
      shangpin: app.userInfo.shangpin,
      message: app.userInfo.message,
    })
  },

  /** 页面相关事件处理函数--监听用户下拉动作*/
  onPullDownRefresh: function () {

    var _id = app.userInfo._id
    db.collection('users').doc(_id).get().then((res) => {
      this.setData({
        userphoto: res.data.userinfo.userphoto,
        username: res.data.userinfo.username,
        login: res.data.userinfo.login,
        shangpin: res.data.shangpin,
        message: res.data.message,
      })
      app.userInfo = res.data
      wx.stopPullDownRefresh({})
      wx.showToast({
        title: '刷新成功',
        icon: 'none',
        duration: 800
      })
    })
  },
  //刷新消息红点(用于更新非tabar页面未设置的红点)
  checkred() {
    var message = app.message
    var id = this.data.id
    var weidu = app.message.length
    if (weidu != 0) {

      for (var i = 0; i < message.length; i++) {
        if (message[i].id == id) {
          weidu--
          // break
        }
      }
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
})