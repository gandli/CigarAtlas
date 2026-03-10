// pages/humidor/humidor.js
const app = getApp()

Page({
  data: {
    isLoggedIn: false,
    userInfo: null,
    humidorItems: [],
    stats: {
      total: 0,
      totalValue: 0,
      oldestCigar: null
    },
    loading: true,
    activeView: 'list' // list, grid
  },

  onLoad() {
    this.checkLogin()
  },

  onShow() {
    if (app.globalData.isLoggedIn) {
      this.loadHumidor()
    }
  },

  checkLogin() {
    if (app.globalData.isLoggedIn) {
      this.setData({
        isLoggedIn: true,
        userInfo: app.globalData.userInfo
      })
      this.loadHumidor()
    } else {
      this.setData({ loading: false })
    }
  },

  async loadHumidor() {
    this.setData({ loading: true })
    
    // TODO: 从服务器加载
    this.setData({
      humidorItems: [
        {
          id: 1,
          name: 'Cohiba Behike 52',
          brand: 'Cohiba',
          quantity: 10,
          purchaseDate: '2023-06-15',
          price: 680,
          rating: 4.8,
          image: '',
          notes: '存放于恒温恒湿柜中，状态良好'
        },
        {
          id: 2,
          name: 'Montecristo No.2',
          brand: 'Montecristo',
          quantity: 25,
          purchaseDate: '2023-08-20',
          price: 420,
          rating: 4.7,
          image: '',
          notes: '经典款，适合日常享用'
        },
        {
          id: 3,
          name: 'Partagás Lusitanias',
          brand: 'Partagás',
          quantity: 5,
          purchaseDate: '2024-01-10',
          price: 550,
          rating: 4.6,
          image: '',
          notes: '浓郁型，适合资深茄友'
        }
      ],
      stats: {
        total: 40,
        totalValue: 26850,
        oldestCigar: 'Cohiba Behike 52'
      },
      loading: false
    })
  },

  handleLogin() {
    app.login().then(userInfo => {
      this.setData({ userInfo, isLoggedIn: true })
      this.loadHumidor()
    }).catch(err => {
      console.error('登录失败:', err)
    })
  },

  toggleView() {
    this.setData({
      activeView: this.data.activeView === 'list' ? 'grid' : 'list'
    })
  },

  navigateToDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/humidor-detail/humidor-detail?id=${id}`
    })
  },

  addCigar() {
    wx.navigateTo({
      url: '/pages/humidor-add/humidor-add'
    })
  }
})