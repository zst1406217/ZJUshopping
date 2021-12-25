// miniprogram/pages/post/post.js
var util = require('../../utils/util.js');
const app = getApp()
const db = wx.cloud.database()
Page({
  data: {
    niming: false,
    imgs: [],
    fileID: [],
    name: "",
    price: "",
    wbnr: "",
    index: [0, 0],
    heji: [
      ["其他分类", "电子产品", "书籍文具", "服装首饰", "食品零食", "代步工具"],
      ["其他分类"]
    ],
    sy: "0/299"
  },
  kaishixuanze(e) {
    var data = {
      index: this.data.index,
      heji: this.data.heji
    }
    switch (e.detail.column) {
      case 0:
        switch (e.detail.value) {
          case 0:
            data.index = [0, 0];
            data.heji[1] = ["其他"];
            break;
          case 1:
            data.index = [1, 0];
            data.heji[1] = ["数码产品", "家用电器"];
            break;
          case 2:
            data.index = [2, 0];
            data.heji[1] = ["书籍文献", "文具用品", "学习资料"];
            break;
          case 3:
            data.index = [3, 0];
            data.heji[1] = ["女士鞋服", "男士鞋服", "首饰挂件", "箱包用具"];
            break;
          case 4:
            data.index = [4, 0];
            data.heji[1] = ["休闲零食", "饮品饮料", "熟食小吃"];
            break;
          case 5:
            data.index = [5, 0];
            data.heji[1] = ["自行车", "电动车", "敞篷车", "F1赛车"];
            break;
        }
        case 1:
          break;
    }
    this.setData(data)
  },
  xuanzewanbi(e) {
    //console.log(e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },

  //图片取buffer
  async qubuffer(media) {
    return new Promise((resolve, reject) => {
      wx.getFileSystemManager().readFile({
        filePath: media,
        success: res => {
          //console.log("刚转换完",res.data)
          resolve(res.data)
        }
      })
    })
  },
  //图片压缩
  async yasuo(media, size, xxx) {
    //media=media.replace("wxfile","https")
    return new Promise((resolve, reject) => {
      //这是压缩式要用的获取宽高
      wx.getImageInfo({
        src: media,
        success(res) {
          //console.log(res)
          //console.log(res.width,"*",res.height)//打印原图宽高
          var width = res.width //原图宽
          var height = res.height //原图高
          var xx = xxx //最后应该设置的宽
          var yy = Math.trunc(xxx * height / width) //最后应该设置的高
          //console.log(xx,"*",yy)//打印要转换的宽高
          //下面写压缩的步骤
          //获取到画布
          var huabu = wx.createCanvasContext("huabu", this)
          //画下图片
          //console.log("画前")
          /////////////////////////
          huabu.drawImage(media, 0, 0, xx, yy);
          huabu.draw(true, setTimeout(function () {
            wx.canvasToTempFilePath({
              x: 0,
              y: 0,
              width: xx,
              height: yy,
              destWidth: xx,
              destHeight: yy,
              canvasId: 'huabu',
              fileType: 'jpg',
              quality: size, //压缩质量0-1默认0.92
              success(es) {
                console.log('压缩完了', es.tempFilePath)
                resolve(es.tempFilePath)
              }
            }, this);
          }, 500))
          //console.log("画完")

        }
      })
    })
  },
  //图片取大小
  async qudaxiao(media) {
    return new Promise((resolve, reject) => {
      wx.getFileInfo({
        filePath: media,
        success(res) {
          //console.log("图片的",res)
          resolve(res.size)
        }
      })
    })
  },
  /*提交表单 */
  async tijiao(e) {
    //若未登录，直接到登录页面
    if (app.userInfo.userinfo.login == false) {
      wx.switchTab({
        url: '/pages/my/wd/wd'
      })
      return
    }
    //console.log(e.detail.value)//bankuai/zilei/niming2匿名内容/niming1是否匿名/wbnr/
    var biaodan = e.detail.value //整个表单数据
    var text = biaodan.wbnr //临时text。文本内容


    if (text.length == 0 && this.data.imgs.length == 0) {
      wx.showToast({
        title: '再多说点吧！',
        icon: 'none',
        duration: 800,
      })
      return //这个return返回，停止继续执行
    }
    //console.log("传过来：",e)
    var bankuai = "其他分类"
    if (biaodan.fenlei != null) {
      switch (biaodan.fenlei[0]) {
        case 0:
          bankuai = "其他分类"
          break;
        case 1:
          bankuai = "电子产品"
          break;
        case 2:
          bankuai = "书籍文具"
          break;
        case 3:
          bankuai = "服装首饰"
          break;
        case 4:
          bankuai = "食品零食"
          break;
        case 5:
          bankuai = "代步工具"
          break;
      }
    }
    var _this = this
    wx.showModal({
      title: '提示',
      content: '您即将发送此帖到“' + bankuai + '”板块？',
      showCancel: true,
      confirmText: '是',
      confirmColor: '#000000',
      cancelText: '否',
      cancelColor: '#000000',
      success(res) {
        if (res.confirm) {
          //console.log('用户点击确定')
          _this.tixing(biaodan)
          return true
        } else if (res.cancel) {
          //console.log('用户点击取消')
          return false
        }
      }
    })

  },
  //提醒选择的板块
  async tixing(biaodan) {
    var text = biaodan.wbnr //临时text。文本内容
    wx.showLoading({
      title: '准备发送...',
      mask: true
    })
    var img = this.data.imgs //图片路径赋值给变量img
    if (img.length != 0) {
      wx.showLoading({
        title: '图片处理...',
        mask: true
      })
      var media = ''
      var zsl = img.length
      for (var i = 0; i < zsl; i++) {
        media = img[i]
        //console.log("遍历的图片源路径",media)
        //取图片的大小进行判断
        var size = await this.qudaxiao(media)
        console.log("图片的大小是", size)
        if (size >= 51200) {
          media = await this.yasuo(media, 0.6, 300)
        }

        //验证压缩后大小
        var size = await this.qudaxiao(media)
        media = await this.qubuffer(media)
      }
    }
    biaodan.fenlei = biaodan.fenlei === null ? [0, 0] : biaodan.fenlei
    var good_detail = {
      bankuai: biaodan.fenlei[0],
      zilei: biaodan.fenlei[1],
      na_me: biaodan.name, //商品名称
      pri_ce: biaodan.price, //商品价格
      firsttime: new Date().getTime(), //发布时间
      username: app.userInfo.userinfo.username, //签名
      userphoto: app.userInfo.userinfo.userphoto, //头像
      niming1: biaodan.niming1, //是否匿名
      nr: biaodan.wbnr, //文本
      tp: [], //图片数组
      huifunr: [], //别人的评论
      huifushu: 0, //评论总数
      shoucangid: [], //别人的评论收藏
      shoucangshu: 0, //收藏数
      look: 0, //记录浏览量 
      lzid: app.userInfo._id, //楼主所在主体
    }
    var zs = img.length //图片总数
    var ss_img = img

    //上传图片
    if (zs != 0) {
      wx.showLoading({
        title: '就快好了...',
        mask: true
      })
      var fileID = []
      var js = 0

      for (var i = 0; i < zs; i++) {
        //取图片的大小进行判断
        var path = ss_img[i]; //取当前图片路jing

        var size = await this.qudaxiao(path)
        if (size >= 1048576) {
          //超过1M需要进行压缩！！
          path = await this.yasuo(path, 0.92, 800)
        }
        var time = new Date().getTime()
        //直接拼接出云路径
        fileID[i] = "cloud://cloud1-1g2hhwqi2003a35c.636c-cloud1-1g2hhwqi2003a35c-1307457240/ss_img/" + time.toString() + ".jpg"
        wx.cloud.uploadFile({
          cloudPath: "ss_img/" + time + ".jpg", // 上传至云端的路径
          filePath: path, // 小程序临时文件路径
          success: res => {
            js++ //记录成功获取云储存路径的图片数量
            //console.log(js)
            if (js == zs) {
              good_detail.tp = fileID
              //带图发帖
              this.post(good_detail)
            }
          },
          fail: console.log("上传是不知为啥有错")
        })
      }
    } else {
      //纯文本发帖
      this.post(good_detail)
    }
  },
  name(e) {
    this.setData({
      name: e.detail.value,
    })
  },
  price(e) {
    this.setData({
      price: e.detail.value,
    })
  },
  //实时获取input,写到data中储存为wbnr
  wbnr(e) {
    //console.log(e.detail.value)
    var s = e.detail.value.length
    var y = s + "/" + 299
    // console.log(y) 
    this.setData({
      wbnr: e.detail.value,
      sy: y
    })
  },
  //真正的上传说说
  post(good_detail) {
    app.globalData.tzzs += 1
    //loading发布中
    wx.showLoading({
      title: '即将完成...',
      mask: true
    })
    db.collection('ss').add({
      data: {
        good_detail,
        time: good_detail.firsttime,
        name: good_detail.na_me,
        price: good_detail.pri_ce,
      }
    }).then((res) => {
      app.shuaxin = true
      wx.hideLoading({}) //发布成功隐藏
      //app跳转到首页
      wx.switchTab({
        url: '/pages/index/index'
      })
      var id = res._id
      var jl = {
        "time": good_detail.firsttime,
        "nr": good_detail.nr,
        "id": id,
        "na_me": good_detail.na_me
      }
      if (jl.nr == '') {
        jl.nr = '分享了' + good_detail.tp.length + '张图片'
      }

      var shangpin = []
      //获取之前的文章加到shangpin
      db.collection("users").doc(app.userInfo._id).get().then((res) => {
        shangpin = res.data.shangpin
        //console.log("取回的",shangpin)
        shangpin.push(jl)
        //记录到自己users里
        db.collection("users").doc(app.userInfo._id).update({
          data: {
            shangpin: shangpin
          }
        }).then((res) => {
          //进行全局数据我的本地储存
          app.userInfo.shangpin = shangpin
          this.setData({
            imgs: [],
            wbnr: ""
          })
        })
      })
    })
    db.collection("system").doc("54ad1eea61c5927c00470fa732f72fc2").update({
      data: {
        tzzs: app.globalData.tzzs,
      }
    })
  },
  // 添加图片
  chooseImg: function (e) {
    var that = this;
    var imgs = this.data.imgs;
    var ktj = 9 - imgs.length
    //console.log(ktj)
    if (ktj <= 0) {
      wx.showToast({
        title: '最多添加九张',
        icon: 'none',
        duration: 2000,
      })
    } else {
      wx.chooseImage({
        // count: 1, // 默认9
        sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {
          // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
          var tempFilePaths = res.tempFilePaths;
          //console.log(tempFilePaths)
          var imgs = that.data.imgs;
          for (var i = 0; i < tempFilePaths.length; i++) {
            if (imgs.length >= 9) {
              that.setData({
                imgs: imgs
              });
              return false;
            } else {
              imgs.push(tempFilePaths[i]);
              //console.log(imgs)
            }
          }
          //imgs.push(tempFilePaths[0]);//往数组末尾添加元素
          that.setData({
            imgs: imgs
          });
        }
      });
    }
  },
  // 删除图片
  deleteImg: function (e) {
    var imgs = this.data.imgs;
    var index = e.currentTarget.dataset.index;
    imgs.splice(index, 1);
    this.setData({
      imgs: imgs
    });
  },
  // 预览图片
  previewImg: function (e) {
    //获取当前图片的下标
    var index = e.currentTarget.dataset.index;
    //所有图片
    var imgs = this.data.imgs;
    wx.previewImage({
      //当前显示图片
      current: imgs[index],
      //所有图片
      urls: imgs
    })
  },
  onReady: function () {},
  /*生命周期函数--监听页面加载*/
  onLoad: function (options) {

  },
  /*** 生命周期函数--监听页面初次渲染完成 */
  onReady: function () {

  },
  /** 生命周期函数--监听页面显示*/
  onShow: function () {
    this.checkred()
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
  },
})