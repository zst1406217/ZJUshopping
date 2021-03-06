//app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'cloud1-1g2hhwqi2003a35c',
        traceUser: true,
      })
    }
    this.shuaxin = false
    this.fenxiang = "false"
    this.fxssid = ""
    this.glid = "9999"
    this.message = []
    this.globalData = {}
    this.systeminfo = ""
    this.loveinfo = ""
    this.ssinfo = {
      lovenb: "",
      plnb: "",
      looknb: ""
    }
    this.userInfo = {
      online: false,
      _openid: "",
      _id: "",
      shangpin: [],
      message: [],
      pinglunde: [],
      userinfo: {
        userphoto: "/images/user/user.png",
        username: "匿名用户",
        login: "未知",
      },
    }
    var db = wx.cloud.database()
    var tzzs
    db.collection('system').doc("54ad1eea61c5927c00470fa732f72fc2").get({
      success: res => {
        tzzs = res.data.tzzs
        this.globalData.tzzs = tzzs
      }
    })

  },
  //进入小程序就上线
  onShow() {
    var db = wx.cloud.database()
    if (this._id != "") {
      console.log("上线")
      db.collection('users').where({
        _openid: this._openid
      }).update({
        data: {
          online: true
        }
      })
    }

  },
  //不在小程序中就下线
  onHide() {
    var db = wx.cloud.database()
    if (this._id != "") {
      console.log("下线")
      db.collection('users').where({
        _openid: this._openid
      }).update({
        data: {
          online: false
        }
      })
    }
  },
  globalData: {
    good_detail: [],
    tzzs: 0,
    userInfo1: {}
  }
})