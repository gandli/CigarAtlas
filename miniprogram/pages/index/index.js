// pages/index/index.js
const app = getApp()

Page({
  data: {
    userInfo: null,
    isLoggedIn: false,
    featuredCigars: [],
    recentJournals: [],
    upcomingMeetups: [],
    hotTopics: [],
    loading: true
  },

  onLoad() {
    this.loadInitialData()
  },

  onShow() {
    this.refreshData()
  },

  onPullDownRefresh() {
    this.refreshData().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  async loadInitialData() {
    this.setData({ loading: true })
    
    try {
      // 模拟数据加载
      await Promise.all([
        this.loadFeaturedCigars(),
        this.loadRecentJournals(),
        this.loadUpcomingMeetups(),
        this.loadHotTopics()
      ])
    } catch (error) {
      console.error('加载数据失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  async refreshData() {
    return this.loadInitialData()
  },

  loadFeaturedCigars() {
    // TODO: 从服务器加载
    this.setData({
      featuredCigars: [
        { id: 1, name: 'Cohiba Siglo VI', brand: 'Cohiba', image: '', rating: 4.8 },
        { id: 2, name: 'Montecristo No.2', brand: 'Montecristo', image: '', rating: 4.7 },
        { id: 3, name: 'Partagás Lusitanias', brand: 'Partagás', image: '', rating: 4.6 }
      ]
    })
  },

  loadRecentJournals() {
    this.setData({
      recentJournals: [
        { id: 1, title: 'Cohiba Behike 52 品鉴', author: '雪茄客', date: '2024-03-09', likes: 128 },
        { id: 2, title: '古巴行记：哈瓦那雪茄之旅', author: '老烟枪', date: '2024-03-08', likes: 256 }
      ]
    })
  },

  loadUpcomingMeetups() {
    this.setData({
      upcomingMeetups: [
        { id: 1, title: '上海雪茄品鉴会', date: '2024-03-15', location: '外滩', participants: 24 },
        { id: 2, title: '北京雪茄沙龙', date: '2024-03-20', location: '三里屯', participants: 18 }
      ]
    })
  },

  loadHotTopics() {
    this.setData({
      hotTopics: [
        { id: 1, title: '新手入门：第一支雪茄怎么选？', replies: 89, views: 1200 },
        { id: 2, title: '古巴 vs 多米尼加：你更喜欢哪个产地？', replies: 156, views: 2300 }
      ]
    })
  },

  handleLogin() {
    if (!app.globalData.isLoggedIn) {
      app.login().then(userInfo => {
        this.setData({ userInfo, isLoggedIn: true })
      }).catch(err => {
        console.error('登录失败:', err)
      })
    }
  },

  navigateToJournal(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/journal-detail/journal-detail?id=${id}`
    })
  },

  navigateToMeetup(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/meetup-detail/meetup-detail?id=${id}`
    })
  },

  navigateToCigar(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/cigar-detail/cigar-detail?id=${id}`
    })
  }
})