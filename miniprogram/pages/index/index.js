const app = getApp()
const db = wx.cloud.database()
const name = db.collection('ss').doc('na_me')
const price = db.collection('ss').doc('pri_ce')
Page({
  //页面的初始数据
  data: {
    good_detail: [],
    _good_detail: [],
    yincang: true,
    shuaxin: "",
    search: "",
    zuixinorzuire: 0,
    movehight: 500,
    movehight2: 500,
    jianting: false,
    message: [],
    index: -1,
    yizhou: "",
    kong: false,
    gonggao: {
      title: "版本更新"
    },
  },

  // 生命周期函数--监听页面加载
  onLoad: function (options) {
    var tjid = options.id
    var fenxiang = options.fenxiang
    var liuyan = options.liuyan
    app.fenxiang = "false"
    /*调用云函数登录*/
    wx.showLoading({
      title: '登录中',
      mask: true
    })
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        app.golobalData.userInfo1 = res.userInfo
      }
    })
    wx.cloud.callFunction({
      name: 'login',
      data: {}
    }).then((res) => {
      db.collection("users").where({
        _openid: res.result.openid
      }).get().then((res) => {
        app.userInfo = Object.assign(app.userInfo, res.data[0]);
        this.jiazai()
        wx.hideLoading()
        if (app.userInfo._openid == "") {
          /*如果没有登录信息则跳转到wd*/
          wx.switchTab({
            url: "../my/wd/wd"
          })
          //如果没有登录信息则提示未登录
          wx.showToast({
            title: '未登录只可浏览',
            icon: 'none',
            duration: 3000
          })
        } else {
          //登录上了就监听user
          this.jianting()
          this.setData({
            jianting: true,
          })
        }
        if (tjid != "" && tjid != undefined && tjid != null) {
          wx.navigateTo({
            url: "../xiangqing/xiangqing?id=" + tjid + "&fenxiang=" + fenxiang + "&liuyan=" + liuyan
          })
        }
      })
    });

    var systeminfo = wx.getSystemInfoSync()
    this.setData({
      movehight: systeminfo.windowHeight,
      movehight2: systeminfo.windowHeight - 100
    })
  },
  // 获取滚动条当前位置
  onPageScroll: function (e) {
    if (e.scrollTop > 200) {
      this.setData({
        yincang: false
      });
    } else {
      this.setData({
        yincang: true
      });
    }
  },
  //刷新
  shuaxin() {
    this.setData({
      shuaxin: "",
      search: "",
      kong: false
    })
    var shuaxin = true
    this.jiazai(shuaxin)
  },
  //生命周期函数--监听页面初次渲染完成
  onReady: function () {
    //写出一周前的时间戳
    var now = new Date().getTime() //现在的时间
    var yizhou = (now - 3600 * 7000 * 24)
    this.setData({
      yizhou: yizhou
    })
  },

  //生命周期函数--监听页面显示！！！！！！！！！！！！！！
  onShow: function () {
    this.checkred()
    //这是发帖成功，跳转刷新
    var shuaxin = app.shuaxin
    if (shuaxin) {
      this.shuaxin()
      app.shuaxin = false
    }
    //这是检测是否登录,开启监听
    if (app.userInfo._id != "") {
      //登录状态
      if (!this.data.jianting) {
        //开启监听
        this.jianting()
        this.setData({
          jianting: true
        })
      }
    }

    //收藏页面返回更新收藏评论浏览状态
    var index = this.data.index
    var good_detail = this.data.good_detail
    if (index >= 0) {
      good_detail[index].good_detail.look = app.ssinfo.looknb
      var loveinfo = app.loveinfo
      if (loveinfo == 'true') {
        good_detail[index].love = true
        app.loveinfo = ""
      } else if (loveinfo == 'false') {
        good_detail[index].love = false
        app.loveinfo = ""
      }
      good_detail[index].good_detail.huifushu = app.ssinfo.plnb
      good_detail[index].good_detail.shoucangshu = app.ssinfo.lovenb
      this.setData({
        good_detail: good_detail,
        index: -1
      })
    }
  },
  //刷新消息红点(用于更新非tabar页面未设置的红点)
  checkred() {
    var weidu = app.message.length
    var message = app.message
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

  //生命周期函数--监听页面隐藏
  onHide: function () {},

  //生命周期函数--监听页面卸载
  onUnload: function () {},

  //页面上拉触底事件的处理函数
  onReachBottom: function () {},

  //用户点击右上角分享
  onShareAppMessage: function () {
    return {
      title: "微信小程序-浙大校园购"
    }
  },

  //页面上拉触底事件的处理函数
  onReachBottom: function () {
    this.jiazai()
  },
  //跳转传参，传递板块名
  tiaozhuan(bankuai) {
    var bankuai = bankuai.currentTarget.dataset.bankuai
    wx.navigateTo({
      url: "../fenleiyemian/fenleiyemian?bankuai=" + bankuai
    })
  },
  //加载数据(刷新状态下，data内good_detail数组重新赋值)
  jiazai(shuaxin) {
    var zuixinorzuire = this.data.zuixinorzuire
    var shuaxin2 = this.data.shuaxin
    shuaxin = shuaxin2 == "" ? shuaxin : shuaxin2
    if (shuaxin == true) {
      var head = 0
    } else {
      var head = this.data.good_detail.length
    }
    /////////////////////
    if (zuixinorzuire == 0) {
      //按照时间排取消时间限制，
      zuixinorzuire = "time"
      var yizhou = 0
    }
    /////////////////

    //这下面是加载搜索值
    if (shuaxin2 != "") {
      var text = this.data.shuaxin
      db.collection('ss').where({
        // name: _name,
        "good_detail.nr": {
          $regex: '.*' + text,
          $options: 'i'
        },
        time: db.command.gt(yizhou)

      }).orderBy(zuixinorzuire, 'desc').skip(head).get().then(async (res) => {
        var good_detail = this.data.good_detail
        var xx = await this.read(res.data)
        good_detail.push.apply(good_detail, xx)
        this.setData({
          good_detail: good_detail,
          kong: true
        })
        return
      })
      return
    }

    db.collection('ss').where({
        time: db.command.gt(yizhou)
      }).orderBy(zuixinorzuire, 'desc')
      .skip(head).get().then(async (res) => {
        if (res.data == "") {
          this.setData({
            kong: true
          })
          wx.stopPullDownRefresh({})
          wx.showToast({
            title: '没有更多了',
            icon: 'none',
            duration: 800
          })
          return
        } else if (shuaxin == true) {
          var good_detail = await this.love(res.data)
        } else {
          //加载并加入
          var good_detail = this.data.good_detail
          var xx = await this.love(res.data)
          good_detail.push.apply(good_detail, xx)
        }
        //写进本地
        this.setData({
          good_detail: good_detail,
          kong: true
        })
        if (shuaxin == true) {
          wx.stopPullDownRefresh({})
          wx.showToast({
            title: '刷新成功',
            icon: 'none',
            duration: 800
          })
        } else {}
      })
  },
  //点击跳到详情
  xiangqing(e) {
    var id = e.currentTarget.dataset.id
    var love = e.currentTarget.dataset.love
    var index = e.currentTarget.dataset.index
    wx.cloud.callFunction({
      name: "look",
      data: {
        id: id,
        type: 'ss'
      }
    })
    if (love) {
      love = 'true'
    } else {
      love = 'false'
    }
    wx.navigateTo({
      url: "../xiangqing/xiangqing?id=" + id + "&fenxiang=false&liuyan=false&love=" + love
    })
    this.setData({
      index: index
    })
  },
  // 预览图片
  previewImg: function (e) {
    var index = e.currentTarget.dataset.tp[0];
    //所有图片
    var imgs = e.currentTarget.dataset.tp[1];

    wx.previewImage({
      //当前显示图片
      current: imgs[index],
      //所有图片
      urls: imgs
    })
  },
  //搜索shijian
  search(e) {
    var text = e.detail.value
    this.setData({
      shuaxin: e.detail.value
    })
    if (text == "") {
      wx.showToast({
        title: '不能为空',
        icon: "none",
      })
      return
    }
    /////////////////////
    var zuixinorzuire = this.data.zuixinorzuire
    if (zuixinorzuire == 0) {
      zuixinorzuire = "time"
      var yizhou = 0
    } else {
      zuixinorzuire = "good_detail.shoucangshu"
      var yizhou = this.data.yizhou
    }
    /////////////////
    wx.showLoading({
      title: '搜索中',
      mask: true
    })
    db.collection("ss").where({
      // name: _name,
      "good_detail.nr": {
        $regex: '.*' + text,
        $options: 'i'
      },
      time: db.command.gt(yizhou)
    }).get().then(async (res) => {
      var xx = await this.read(res.data)
      var xx = await this.love(xx)
      this.setData({
        good_detail: xx,
        kong: true
      })
      wx.hideLoading({})
      wx.showToast({
        title: '搜索完毕',
        icon: "none"
      })
    })

  },
  //处理收藏数据
  async love(e) {
    var l = e.length
    for (var i = 0; i < l; i++) {
      var yn = e[i].good_detail.shoucangid.indexOf(app.userInfo._id)
      if (yn == -1) {
        e[i].love = false
      } else {
        e[i].love = true
      }
    }
    return e
  },
  //处理收藏数据
  async shoucang(e) {
    var l = e.length
    for (var i = 0; i < l; i++) {
      var yn = e[i].good_detail.favorid.indexOf(app.userInfo._id)
      if (yn == -1) {
        e[i].shoucang = false
      } else {
        e[i].shoucang = true
      }
    }
    return e
  },
  //返回组件Tabs的监听
  changetitle(e) {
    var zuixinorzuire = this.data.zuixinorzuire
    if (e.detail != zuixinorzuire) {
      //暂存待机位
      var zhongjian = this.data._good_detail
      //赋值待机位
      var _good_detail = this.data.good_detail
      var good_detail = zhongjian
      this.setData({
        zuixinorzuire: e.detail,
        good_detail: good_detail,
        _good_detail: _good_detail,
      })
      if (good_detail.length == 0) {
        this.setData({
          kong: false
        })
        this.jiazai()
      }
    }
  },
  //下拉动作-刷新
  onPullDownRefresh: function () {
    this.shuaxin()
    //setTimeout(function (){wx.stopPullDownRefresh({})},'2000')
  },
  //收藏帖子(这里得加index)
  shoucang(e) {
    var _id = app.userInfo._id
    var id = e.currentTarget.dataset.id
    var index = e.currentTarget.dataset.index
    if (_id == "") {
      wx.showModal({
        title: '提示',
        content: '登录后才可进行此操作！是否进行授权登录？',
        showCancel: true,
        confirmText: '是',
        confirmColor: '#000000',
        cancelText: '否',
        cancelColor: '#FF4D49',
        success(res) {
          if (res.confirm) {
            wx.switchTab({
              url: "../my/wd/wd"
            })
            return
          } else if (res.cancel) {
            return
          }
        }
      })
      return
    }
    wx.cloud.callFunction({
      name: "shoucang",
      data: {
        id: id,
        dzrid: _id
      }
    })
    var good_detail = this.data.good_detail
    if (this.data.good_detail[index].love) {
      good_detail[index].love = false
      good_detail[index].good_detail.shoucangshu--
    } else {
      good_detail[index].love = true
      good_detail[index].good_detail.shoucangshu++
    }
    this.setData({
      good_detail: good_detail
    })
  },

  //收藏帖子(这里得加index)

  //消息监听
  jianting() {
    var _id = app.userInfo._id
    var that = this
    this.watcher = db.collection('users').doc(_id).watch({
      onChange: function (e) {
        app.userInfo = e.docs[0]
        var message = e.docs[0].message //message数组
        app.message = message
        that.jiantingchuli(message)
      },
      onError: function (err) {
        console.error('监听出现问题！', err)
      }
    })
  },
  /*
  下面存放监听变化代码,进行红点更新
  */
  jiantingchuli(e) {
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
    if (weidu != 0) {
      //有未读，设置红点得看页面层级

      var ceng = getCurrentPages()
      if (ceng.length == 1) {
        //只有tabar页面才可以设置红点
        wx.setTabBarBadge({
          index: 1,
          text: weidu.toString()
        })
      }
      //2.新的消息震动提醒
      var message = this.data.message //本地已收到message数组、每条新的消息都纪录进去
      for (var i = 0; i < weidu; i++) {
        var id = e[i].id
        var yn = JSON.stringify(message).includes(id)
        if (!yn) {
          message.push(e[i])
          this.setData({
            message: message
          })
          //震动
          wx.vibrateLong({
            type: 'heavy'
          })
        }
      }

    } else {
      var ceng = getCurrentPages()
      if (ceng.length == 1) {
        //仅可在tabar页面设置红点
        wx.removeTabBarBadge({
          index: 1
        })
      }
    }
  },
  adddetail: function () {
    wx.navigateTo({
      url: '../post/post',
    })
  }
})