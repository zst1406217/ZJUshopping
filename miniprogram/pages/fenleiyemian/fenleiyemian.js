var db = wx.cloud.database()
var app = getApp()
Page({
  //页面的初始数据
  data: {
    good_detail: [],
    _good_detail: [],
    bankuai: "",
    yincang: true,
    zuixinorzuire: 0,
    index: -1,
    yizhou: "",
    kong: false
  },
  //跳转到详情
  xiangqing() {
    wx.navigateTo({
      url: "../xiangqing/xiangqing"
    })
  },
  //刷新
  shuaxin() {
    var shuaxin = true
    this.jiazai(shuaxin)
  },
  // 获取滚动条当前位置
  onPageScroll: function (e) {
    //console.log(e)
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
  //生命周期函数--监听页面加载
  onLoad: function (bankuai) {
    var systeminfo = wx.getSystemInfoSync()
    this.setData({
      bankuai: bankuai.bankuai,
      movehight: systeminfo.windowHeight,
      movehight2: systeminfo.windowHeight - 100
    })
    this.jiazai()
  },
  jiazai(shuaxin) {
    //console.log(shuaxin)
    var zuixinorzuire = this.data.zuixinorzuire
    if (shuaxin) {
      var head = 0
      //console.log("toushi0")
    } else {
      var head = this.data.good_detail.length
    }

    /////////////////////
    if (zuixinorzuire == 0) {
      //按照时间排取消时间限制，
      zuixinorzuire = "time"
      var yizhou = 0
    } else {
      //按照热度排行
      zuixinorzuire = "good_detail.shoucangshu"
      var yizhou = this.data.yizhou
    }
    /////////////////

    db.collection('ss').where({
      'good_detail.bankuai': Number(this.data.bankuai),
      time: db.command.gt(yizhou)
    }).orderBy(zuixinorzuire, 'desc').skip(head).get().then(async (res) => {
      //console.log(res)//这里已经取到了相应的数组
      if (res.data == "") {
        this.setData({
          kong: true
        })
        wx.stopPullDownRefresh({})
        // wx.hideLoading({})
        wx.showToast({
          title: '没有更多了',
          icon: 'none',
          duration: 800
        })
        return
      } else if (shuaxin) {
        var good_detail = await this.love(res.data)
      } else {
        var good_detail = this.data.good_detail
        //var xx=await this.read(res.data)
        var xx = await this.love(res.data)
        good_detail.push.apply(good_detail, xx)
      }
      this.setData({
        good_detail: good_detail,
        kong: true
      })
      if (shuaxin) {
        wx.stopPullDownRefresh({})
        wx.showToast({
          title: '刷新成功',
          icon: 'none',
          duration: 800
        })
      }
    })
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
  //生命周期函数--监听页面显示
  onShow: function () {
    //收藏页面返回更新收藏评论浏览状态
    var index = this.data.index
    var good_detail = this.data.good_detail
    console.log("index::::", index)
    if (index >= 0) {
      good_detail[index].good_detail.look = app.ssinfo.looknb
      var loveinfo = app.loveinfo
      //console.log("app.loveinfo:",loveinfo)
      if (loveinfo == 'true') {
        console.log("返回收藏：", index)
        good_detail[index].love = true
        app.loveinfo = ""
      } else if (loveinfo == 'false') {
        console.log("返回取消收藏：", index)
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
  //生命周期函数--监听页面隐藏
  onHide: function () {},
  //生命周期函数--监听页面卸载
  onUnload: function () {},
  //页面相关事件处理函数--监听用户下拉动作
  onPullDownRefresh: function () {},
  //页面上拉触底事件的处理函数！！！！！！！！！！！！！！！
  onReachBottom: function () {
    this.jiazai()
  },
  //点击跳到详情
  xiangqing(e) {
    //console.log(id.currentTarget.dataset.id)
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
    //获取当前图片的下标
    //console.log(e.currentTarget.dataset.tp)
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
  //返回组件Tabs的监听
  changetitle(e) {
    console.log("title:", e.detail)
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
        _good_detail: _good_detail
      })
      console.log(good_detail)
      if (good_detail.length == 0) {
        this.setData({
          kong: false
        })
        console.log("数组空，加载")
        this.jiazai()
      }
    }
  },
  //下拉动作-刷新
  onPullDownRefresh: function () {
    this.shuaxin()
    //setTimeout(function (){wx.stopPullDownRefresh({})},'2000')
  },
  //处理收藏数据
  async love(e) {
    console.log(e)
    var l = e.length
    for (var i = 0; i < l; i++) {
      var yn = e[i].good_detail.shoucangid.indexOf(app.userInfo._id)
      console.log(yn)
      if (yn == -1) {
        e[i].love = false
      } else {
        e[i].love = true
      }
    }
    return e
  },
  //收藏帖子(这里得加index)
  shoucang(e) {
    var _id = app.userInfo._id
    var id = e.currentTarget.dataset.id
    var index = e.currentTarget.dataset.index
    console.log(e.currentTarget.dataset)
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
            console.log('用户点击确定')
            wx.switchTab({
              url: "../my/wd/wd"
            })
            return
          } else if (res.cancel) {
            console.log('用户点击取消')
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
})