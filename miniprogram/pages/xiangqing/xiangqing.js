var db = wx.cloud.database()
var app = getApp()
var _ = db.command
var utils = require('../../utils/util.js')
Page({
  //页面的初始数据
  data: {
    id: "",
    good_detail: {},
    wbnr: "",
    _openid: "9999999",
    _id: "9999999",
    fenxiang: "false",
    //glopenid:"9999",
    glid: "9999",
    shoucang: false,
    input: "感兴趣就留言想要吧！",
    focus: false,
    xx: "",
    liuyan: false,
    ku: 'ss',
    ifsimi: false
  },
  //生命周期函数--监听页面加载
  onLoad: function (options) {
    console.log(options)
    app.fxssid = options.id
    var love = options.love
    var liuyan = options.liuyan
    if (liuyan == 'true') {
      this.setData({
        liuyan: true,
        ku: 'tj'
      })
    }
    if (love == 'true') {
      var shoucang = true
    } else if (love == 'false') {
      var shoucang = false
    } else {
      var shoucang = -1
    }
    this.setData({
      fenxiang: options.fenxiang,
      shoucang: shoucang,
      id: options.id
    })
    //判断是否为分享来的！！！！！！！！！！！！！
    if (options.fenxiang == "true") {
      wx.cloud.callFunction({
        name: 'login',
        data: {}
      }).then((res) => {
        //console.log(res)
        db.collection("users").where({
          _openid: res.result.openid
        }).get().then((res) => {
          //console.log(res.data[0]);
          app.userInfo = Object.assign(app.userInfo, res.data[0]);
          var _openid = app.userInfo._openid
          // wx.hideLoading()
          if (_openid == "") {
            /*如果没有登录信息则跳转到wd*/
            wx.showToast({
              title: '还未登录',
              icon: "none",
              duration: '1500'
            })
            app.fenxiang = "true"
          } else {
            this.setData({
              _openid: _openid,
              id: options.id,
              _id: app.userInfo._id
            })
            this.jiazai(options.id)
          }
        })
      })
    } else {
      var _openid = app.userInfo._openid
      this.setData({
        _openid: _openid,
        _id: app.userInfo._id
      })
      //console.log("iddd",options.id)
      this.jiazai(options.id)
    }

    //判断是否有了glid
    if (app.glid == "9999") {
      db.collection('system').where({
          '_id': '001'
        })
        .get().then((res) => {
          //console.log(res.data[0].tp)
          this.setData({
            glid: res.data[0].glid
          })
          app.glid = res.data[0].glid
        })
    } else {
      this.setData({
        glid: app.glid
      })
    }
  },
  //加载对应说说id的内容
  jiazai(id) {
    var ku = this.data.ku
    db.collection(ku).where({
      '_id': id
    }).get().then(async (res) => {
      //console.log("加载的：",res.data[0])
      if (res.data[0] != undefined) {
        //var good_detail=await this.read(res.data[0])//读缓存图
        var good_detail = await this.readd(res.data[0]) //处理超长名
        var shoucang = this.data.shoucang
        if (shoucang == -1 && this.data.liuyan == false) {
          //非总列表进入
          var yn = good_detail.good_detail.shoucangid.indexOf(app.userInfo._id)
          if (yn != -1) {
            this.setData({
              shoucang: true
            })
          } else {
            this.setData({
              shoucang: false
            })
          }
        }

        if (this.data.liuyan == false) {
          app.ssinfo.lovenb = good_detail.good_detail.shoucangshu
          app.ssinfo.plnb = good_detail.good_detail.huifushu
          app.ssinfo.looknb = good_detail.good_detail.look
          this.setData({
            good_detail: good_detail
          })
        } else {
          this.setData({
            good_detail: good_detail
          })
        }

      } else {
        this.setData({
          good_detail: 0
        })
      }
    })
  },
  //点击跳转到详情进行阅读

  //删除评论
  changanshanchu(e) {
    var _id = app.userInfo._id
    //检测是否是自己的

    if (e.currentTarget.dataset.plid1 != undefined) {
      var pdwb = e.currentTarget.dataset.plid1
    } else {
      var pdwb = e.currentTarget.dataset.plid
    }

    //删除条件：1.自己发的。2.自己的帖子。3.自己是管理员
    if (pdwb != _id && _id != this.data.glid && _id != this.data.good_detail.good_detail.lzid) {
      wx.showToast({
        title: '无权删除',
        icon: 'none',
        duration: 800
      })
      return
    }

    var index1 = ""
    var id1 = ""
    var time1 = ""
    var jianqu = 0
    if (e.currentTarget.dataset.index1 != undefined) {
      index1 = e.currentTarget.dataset.index1
      id1 = e.currentTarget.dataset.id1

      time1 = e.currentTarget.dataset.time1
    } else {
      //判断该评论下的二级评论
      var nb = e.currentTarget.dataset.huifushu
      if (nb != undefined && nb != 0) {
        jianqu = nb
      }
    }
    var that = this
    wx.showModal({
      title: '提示',
      content: '删除后无法恢复',
      showCancel: 'true',
      confirmText: '确认删除',
      confirmColor: '#FF4D49',
      cancelText: '取消',
      success(res) {
        if (res.confirm) {
          var id = e.currentTarget.dataset.id0 //这是这条l0评论的id
          //console.log("id0::",id)
          var index = e.currentTarget.dataset.index
          var good_detail = that.data.good_detail.good_detail

          // console.log("删除,index1:",e.currentTarget.dataset.index1)
          if (e.currentTarget.dataset.index1 == undefined) {
            //这是lv0删除
            //console.log("删除lv0,index1:",index1)
            good_detail.huifunr.splice(index, 1); //删除指定index记录
          } else {
            //这是lv1，2删除
            good_detail.huifunr[index].huifu.splice(index1, 1)
          }

          that.setData({
            "good_detail.good_detail": good_detail
          })
          wx.showToast({
            title: '删除成功',
            icon: "none"
          })
          app.ssinfo.plnb = app.ssinfo.plnb - 1 - jianqu
          //console.log(app.ssinfo.plnb)
          var xx = that.data.good_detail
          xx.good_detail.huifushu = app.ssinfo.plnb
          that.setData({
            good_detail: xx
          })
          var time = e.currentTarget.dataset.time
          //console.log("id:",that.data.id)
          var _data = {
            id0: id, //这是这条lv0评论的id
            id1: id1, //这是这条lv1.2评论的id
            time: time, //这是这条lv0评论的
            time1: time1, //这是这条lv1.2评论的
            id: that.data.id, //这是这条ss的
            liuyan: that.data.liuyan, //用于云函数判断删除所在集合
          }
          //下面云函数delete评论
          wx.cloud.callFunction({
            name: 'delete',
            data: {
              _data
            }
          })
          //判断ss是否还有自己的评论，
          var haiyou = false
          var haiyou = JSON.stringify(good_detail.huifunr).includes(app.userInfo._id)
          //没了就删掉自己评论过的记录
          if (haiyou == false) {
            db.collection('users').doc(app.userInfo._id).update({
              data: {
                pinglunde: _.pull({
                  id: _.eq(that.data.id)
                })
              }
            })
            //console.log("删")
            return
          }

        } else if (res.cancel) {}
      }
    })
  },
  //文本内容合法性检测

  //发送评论
  async fasong() {
    var openid = app.userInfo._openid
    //未登录提示
    if (openid == "") {
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



    var text = this.data.wbnr
    if (text.length == 0) {
      wx.showToast({
        title: '没说什么',
        icon: 'none',
        duration: 800,
      })
      return
    }

    wx.showLoading({
      title: '快送到了...',
      mask: true
    })
    //2.判断楼主与匿名
    var louzhu = false
    var niming = false
    var sifa = false
    //是楼主的话继承发帖状态
    if (app.userInfo._id == this.data.good_detail.good_detail.lzid) {
      //是楼主的话继承发帖状态
      louzhu = true
    }
    sifa = this.data.ifsimi
    var pinglunde = await this.fasongqian(app.userInfo._id) //更新了app中的userinfo判断是否评论过
    //console.log("获取到评论过的：",pinglunde)
    var first = JSON.stringify(pinglunde).includes(this.data.id)
    //判断是回复帖子，还是回复评
    //3.写其他数据并整合
    var pinglunnr = {
      liuyan: this.data.liuyan,
      title: this.data.good_detail.title,
      photo: app.userInfo.userinfo.userphoto,
      name: app.userInfo.userinfo.username,
      time: new Date().getTime(), //发布时间
      plrid: app.userInfo._id, //评论人我的id
      wbnr: text,
      ywnr: this.data.good_detail.good_detail.nr,
      louzhu: louzhu,
      niming: niming,
      sifa: sifa,
      ssid: this.data.id,
      lzid: this.data.good_detail.good_detail.lzid,
      lv: 0, //表示对帖子的直接评论
      huifu: []
    }
    if (this.data.liuyan == true) {
      pinglunnr.ywnr = "【推文】" + this.data.good_detail.title
    }
    if (pinglunnr.ywnr.length == 0) {
      pinglunnr.ywnr = '分享的' + this.data.good_detail.good_detail.tp.length + '张图片'
    }
    var pd = [first, "", ""] //判断用，first,__openid(被评论的),__time(被评论的)
    var riqi = utils.dateFormat(pinglunnr.time, "yyyy-MM-dd hh:mm") //发送订阅消息所用日期格式
    pinglunnr.riqi = riqi
    //楼主才有此步骤，判断匿名
    var xx = this.data.xx //原回复
    //说明点击了回复按钮
    if (xx != "") {
      //说明点击了回复按钮，此时不知回复层级
      pd[1] = xx.lv0
      pd[2] = xx.time
      var lv = xx.lv //其实被回复人lv
      pinglunnr.bhfpl = xx.wbnr //被回复的评论
      pinglunnr.bhfid = xx.id
      if (lv == 0) {
        //console.log("0")//回复lv0
        pinglunnr.lv = 1
        var index = this.data.index
        var zhankai = "good_detail.good_detail.huifunr[" + index + "].zhankai"
        //console.log(zhankai)
        this.setData({
          [zhankai]: true,
        })
      } else {
        //console.log("1")//回复lv1,lv2
        pinglunnr.lv = 2
        pinglunnr.yuanname = pinglunnr.name
        pinglunnr.name = pinglunnr.name + "-》" + xx.name
      }
    }

    this.fbpl(pinglunnr, pd) //云函数上传发表
    wx.hideLoading({})
    //评论成功
    wx.showToast({
      title: '评论成功',
      icon: 'none',
      duration: 1000,
    })
    var huifunr = this.data.good_detail.good_detail.huifunr
    //这里本地进行判断
    app.ssinfo.plnb++
    var xx = this.data.good_detail
    xx.good_detail.huifushu = app.ssinfo.plnb
    this.setData({
      good_detail: xx
    })
    if (pd[1] != "") {
      //这是回复别人
      var index = this.data.index
      huifunr[index].huifu.push(pinglunnr)
      huifunr[index].huifushu++
    } else {
      huifunr.push(pinglunnr)
    }

    this.setData({
      "good_detail.good_detail.huifunr": huifunr,
      wbnr: "",
      xx: "",
      input: "感兴趣就留言想要吧！",
    })
  },
  simi() {
    if (this.data.ifsimi == false) {
      this.setData({
        ifsimi: true
      });
    } else {
      this.setData({
        ifsimi: false
      });
    }
  },
  //发送前刷新内容
  async fasongqian(e) {
    //console.log(e)
    return db.collection('users').doc(e).get().then((res) => {
      //console.log(res)
      app.userInfo = res.data
      //console.log("获取评论过的",res.data)
      return res.data.pinglunde
    })
  },
  //回复别人的评论1
  huifu(e) {
    var index1 = e.currentTarget.dataset.index1
    var xx = e.currentTarget.dataset.xx
    var xx1 = e.currentTarget.dataset.xx1
    if (index1 == undefined) {
      var name = xx.name
      xx.id = xx.plrid
      xx.lv0 = xx.plrid
    } else {
      xx.wbnr = xx1.wbnr
      xx.id = xx1.plrid
      xx.lv0 = xx.plrid
      if (xx1.niming) {
        xx1.name = "匿名用户"
      }
      xx.lv = xx1.lv
      if (xx1.lv == 1) {
        var name = xx1.name
      } else {
        var name = xx1.yuanname
      }
    }
    xx.name = name //此处特殊整合信息！！！

    //拉起键盘进行回复
    this.setData({
      input: "回复 " + name,
      focus: true, //拉起键盘
      xx: xx,
      index: e.currentTarget.dataset.index,
    })
  },
  //键盘收起
  shijiao() {
    var wbnr = this.data.wbnr
    if (wbnr == "") {
      this.setData({
        input: "感兴趣就留言想要吧！",
        xx: "",
        //xx1:0
      })
    } else {}
  },
  //展开评论
  zhankai(e) {
    console.log(e.currentTarget.dataset.index) //该条评论所在数组的下表
    var index = e.currentTarget.dataset.index
    var zhankai = "good_detail.good_detail.huifunr[" + index + "].zhankai"
    //console.log(zhankai)
    this.setData({
      [zhankai]: true,
    })
  },
  //收起评论
  shouqi(e) {
    console.log(e.currentTarget.dataset.index) //该条评论所在数组的下表
    var index = e.currentTarget.dataset.index
    var zhankai = "good_detail.good_detail.huifunr[" + index + "].zhankai"
    this.setData({
      [zhankai]: false,
    })
  },
  //用云函数发表评论
  async fbpl(pinglunnr, pd) {
    try {
      var res = await wx.cloud.callFunction({
        name: 'fbpl',
        data: {
          pinglunnr: pinglunnr,
          pd: pd
        }
      });
      //console.log(res);
      return res.result
    } catch (err) {
      console.log(err);
      return false;
    }

  },
  //实时获取input,写到data中储存为wbnr
  wbnr(e) {
    //console.log(e.detail.value)
    this.setData({
      wbnr: e.detail.value
    })
  },

  //长名字显示处理
  async readd(e) {
    var nr = e
    //先循环每一个ss
    var chang = nr.good_detail.huifunr.length
    //判断评论!=""则进行下面
    if (chang != 0) {
      var huifunr = nr.good_detail.huifunr
      //对huifunr循环查询判断name长度超长就加。。。11个为上限
      for (var ii = 0; ii < huifunr.length; ii++) {
        var l = huifunr[ii].name.length
        //console.log("长命自检测3",l,huifunr[ii].name)
        //console.log("path:",path)
        if (l > 11) {
          nr.good_detail.huifunr[ii].name = nr.good_detail.huifunr[ii].name.substring(0, 11) + "..."
        }
        if (huifunr[ii].huifu.length > 0) {
          //有回复的回复
          for (var iii = 0; iii < huifunr[ii].huifu.length; iii++) {
            var l = huifunr[ii].huifu[iii].name.length
            if (l > 11) {
              var name = nr.good_detail.huifunr[ii].huifu[iii].name
              var yuanname = nr.good_detail.huifunr[ii].huifu[iii].yuanname
              var wz = name.indexOf("-》")
              if (wz > 4) {
                //需要对前面修剪
                var qian = name.substring(0, 4) + "...-》"
                var hou = name.substr(wz + 2, l - wz)
                name = qian + hou
                //加上再修剪
                if (name.length > 11) {
                  nr.good_detail.huifunr[ii].huifu[iii].name = name.substring(0, 11) + "..."
                } else {
                  nr.good_detail.huifunr[ii].huifu[iii].name = name
                }
              } else {
                nr.good_detail.huifunr[ii].huifu[iii].name = nr.good_detail.huifunr[ii].huifu[iii].name.substring(0, 11) + "..."
              }
            }
          }
        }
      }
    }
    //console.log(nr)
    return nr
  },
  //用户转发
  onShareAppMessage: function () {
    console.log("path:/pages/xiangqing/xiangqing?id=" + this.data.id)
    return {
      title: "刚刚在浙大校园购看到个帖子，真是绝了！",
      path: "/pages/index/index?id=" + this.data.id + "&fenxiang=true&liuyan=" + this.data.liuyan
    }
  },
  //收藏帖子
  shoucang(e) {
    var id = app.userInfo._id
    var ssid = e.currentTarget.dataset.id
    if (id == "") {
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
        id: ssid,
        dzrid: id //收藏人id
      }
    })
    var good_detail = this.data.good_detail
    if (this.data.shoucang) {
      good_detail.good_detail.shoucangshu--
      app.ssinfo.lovenb--
      this.setData({
        shoucang: false,
        good_detail: good_detail
      })
      app.loveinfo = 'false'
    } else {
      good_detail.good_detail.shoucangshu++
      app.ssinfo.lovenb++
      this.setData({
        shoucang: true,
        good_detail: good_detail
      })
      app.loveinfo = 'true'
    }

  },
  //判断登录,返回true或false
  async islogin() {
    var _id = this.data._id
    if (_id != "") {
      return true
    } else {
      return false
    }
  }
})